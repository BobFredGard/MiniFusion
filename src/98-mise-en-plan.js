/* ═══════════════ src/98-mise-en-plan.js — Espace Plan : mise en plan 2D ═══════════════
   Espace « PLAN » (3ᵉ espace CAO / FAO / PLAN, overlay par-dessus la fenêtre 3D) :
   • planches multiples (A0→A4, portrait/paysage), cadre ISO + cartouche éditable ;
   • vues projetées PAR CORPS ou assemblée : face/dessus/côté/ISO/caméra, auxiliaires,
     en coupe (demi-espace OCCT exact + hachures 45°), de détail ;
   • toutes les arêtes (vives OCCT + tangentes + silhouettes de maillage), arêtes
     partiellement cachées rognées par recherche de bornes de visibilité, cercles
     reconnaissants (Ø réels) ;
   • cotation avec UN outil intelligent (longueur / distance / Ø / R / angle) et
     tolérances ISO (±, double, classes H7… s6 par plages Ø) ;
   • dessin 2D façon esquisse : ligne/rect/cercle/arc/point/ajuster + contraintes et
     solveur moindres carrés, ancrage des points sur la géométrie projetée ;
   • tout vit dans doc.mep → sauvegardé AVEC la pièce et la FAO (autosave, bundle
     .miniFusion, annuler/rétablir). */
(function(){
  'use strict';

  /* ═══════════════ A. CSS ═══════════════ */
  const css=document.createElement('style');css.id='mepCss';
  css.textContent=`
    #mepWrap{position:absolute;inset:0;z-index:50;display:none;flex-direction:column;background:var(--bg);color:var(--text);font-family:inherit}
    #mepWrap.open{display:flex}
    #mepTabs{display:flex;gap:3px;align-items:center;padding:5px 8px 0;flex:none;overflow-x:auto}
    #mepTabs button{padding:3px 10px;font-size:.72rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:7px 7px 0 0;cursor:pointer;white-space:nowrap}
    #mepTabs button.on{background:var(--surface);border-bottom-color:var(--surface);color:var(--primary);font-weight:600}
    #mepTabs .mepAdd{border-style:dashed;padding:3px 8px}
    #mepToolbar{display:none}
    #mepBody{flex:1;display:flex;min-height:0}
    #mepSheet{flex:1;position:relative;overflow:hidden;background:#8e949e;cursor:crosshair;min-width:0}
    #mepSvg{position:absolute;left:0;top:0;display:block;width:100%;height:100%}
    #mepSide{width:260px;flex:none;border-left:1px solid var(--border);background:var(--surface);overflow-y:auto;padding:8px;font-size:.74rem;display:block}
    #mepSidePanel #mepSide{width:100%;border-left:none;background:transparent}
    #mepSide h4{margin:8px 0 4px;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
    #mepSide .row{display:flex;gap:5px;align-items:center;margin:4px 0;flex-wrap:wrap}
    #mepSide label{flex:1;min-width:0;color:var(--muted)}
    #mepSide input,#mepSide select{max-width:118px;padding:3px 6px;font-size:.72rem;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text)}
    #mepSide input[type=checkbox]{max-width:none;flex:none}
    #mepSide button{padding:3px 8px;font-size:.71rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;cursor:pointer}
    #mepSide button:hover{border-color:var(--primary)}
    #mepSide button.active{background:var(--primary);border-color:var(--primary);color:#fff}
    #mepSide button.danger{border-color:#ff453a;color:#ff453a}
    #mepSide .note{color:var(--muted);font-size:.68rem;margin:4px 0}
    #mepStatus{flex:none;padding:4px 10px;font-size:.7rem;color:var(--muted);border-top:1px solid var(--border);background:var(--surface);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mepPage{fill:#fff;stroke:#b9c0c9;stroke-width:.5}
    .mepFrame{stroke:#222;stroke-width:.9;fill:none}
    .mepFrame2{stroke:#222;stroke-width:.45;fill:none;stroke-dasharray:1.5 2.5;opacity:.6}
    .mepTitleBlock{stroke:#222;stroke-width:.8;fill:#fff}
    .mepTitleText{font:6.5px sans-serif;fill:#111}
    .mepTitleVal{font:7.5px sans-serif;fill:#111;font-weight:600}
    .mepGrid{stroke:#d8dde3;stroke-width:.4}
    .mepEnt{fill:none;stroke-linecap:round;stroke-linejoin:round}
    .mepSharp{stroke:#1a1a1a;stroke-width:.7}
    .mepTangent{stroke:#6a6f76;stroke-width:.35}
    .mepHidden{stroke:#8a9098;stroke-width:.3;stroke-dasharray:2.5 1.8}
    .mepSect{stroke:#1a1a1a;stroke-width:.85}
    .mepHatch{stroke:#333;stroke-width:.35}
    .mepSel{stroke:#0a84ff!important;stroke-width:1.6!important}
    .mepVB{fill:rgba(10,132,255,.04);stroke:#0a84ff;stroke-width:.8;stroke-dasharray:4 2.5;pointer-events:none}
    .mepVBSel{fill:none;stroke:#0a84ff;stroke-width:1;pointer-events:none}
    .mepDimL{stroke:#0a84ff;stroke-width:.55;fill:none}
    .mepDimT{font:7px sans-serif;fill:#0a84ff;font-weight:600}
    .mepDimRef{fill:#7a7f86}
    .mepLbl{font:8px sans-serif;fill:#111;font-weight:700}
    .mepCut{stroke:#0a84ff;stroke-width:1.1;fill:none}
    .mepCutS{stroke:#0a84ff;stroke-width:.5;fill:none}
    .mepSk{fill:none;stroke-linecap:round}
    .mepSkPt{fill:#fff;stroke-width:.9}
    .mepDraft{stroke:#ffd60a;stroke-width:.7;stroke-dasharray:3 2;fill:none}
    .mepSnap{fill:none;stroke:#ffd60a;stroke-width:.9}
    .mepArrowM{fill:#0a84ff}
  `;
  document.head.appendChild(css);

  /* ═══════════════ B. constantes ═══════════════ */
  const NS='http://www.w3.org/2000/svg';
  const FORMATS={A0:[841,1189],A1:[594,841],A2:[420,594],A3:[297,420],A4:[210,297]};
  const FORMAT_ORDER=['A0','A1','A2','A3','A4'];
  const MARGIN=12,TITLE_H=26;
  const MEP_SCALES=[[1,'1:1'],[2,'2:1'],[5,'5:1'],[0.5,'1:2'],[0.2,'1:5'],[2.5,'5:2'],[0.25,'1:4'],[0.1,'1:10'],[1.25,'5:4'],[0.4,'2:5']];
  const COL={sharp:'#1a1a1a',tangent:'#6a6f76',hidden:'#8a9098',sect:'#1a1a1a',
    skFree:'#64d2ff',skFull:'#e8e8ea',sel:'#ff9f0a',ok:'#30d158',err:'#ff453a',snap:'#ffd60a',ref:'#bf5af2'};
  /* vues standard : dir = DE la pièce VERS l'observateur ; u = droite papier ; v = bas papier */
  const MEP_VIEWS={
    front:{dir:[0,-1,0],u:[1,0,0],v:[0,0,-1],lab:'Face'},
    top:{dir:[0,0,1],u:[1,0,0],v:[0,-1,0],lab:'Dessus'},
    bottom:{dir:[0,0,-1],u:[1,0,0],v:[0,1,0],lab:'Dessous'},
    right:{dir:[1,0,0],u:[0,1,0],v:[0,0,-1],lab:'Côté droit'},
    left:{dir:[-1,0,0],u:[0,-1,0],v:[0,0,-1],lab:'Côté gauche'},
    rear:{dir:[0,1,0],u:[-1,0,0],v:[0,0,-1],lab:'Arrière'},
    iso:{dir:[0.62,-0.62,0.48],u:null,v:null,lab:'ISO'}
  };
  /* ═══════════════ tolérances ISO 2768-mK + ISO 286 (µm) ═══════════════ */
  const MEP_STEPS=[3,6,10,18,30,50,80,120,180,250,315,400,500];
  const MEP_IT={6:[6,8,9,11,13,16,19,22,25,29,32,36,40],7:[10,12,15,18,21,25,30,35,40,46,52,57,63],
    8:[14,18,22,27,33,39,46,54,63,72,81,89,97],9:[25,30,36,43,52,62,74,87,100,115,130,140,155],
    11:[40,48,58,70,84,100,120,140,160,185,210,230,250]};
  /* déviations EI/ES des arbrets (ei, µm, négatif ou positif) par lettre */
  const MEP_DEV={g:[2,4,5,6,7,9,10,12,14,15,16,18,20],k:[0,1,1,1,2,2,2,3,3,4,4,4,5],
    m:[2,4,6,7,8,9,11,13,15,17,20,21,23],n:[4,8,10,12,15,17,20,23,27,31,33,36,40],
    p:[6,12,15,18,22,26,32,37,43,50,56,62,68],r:[10,19,23,28,34,41,48,58,68,79,88,98,108],
    s:[14,24,28,33,41,48,59,71,87,102,117,132,151]};
  const MEP_TOL_CLASSES=['','H7','H8','H9','H11','JS9','JS11','h6','h7','h8','g6','k6','m6','n6','p6','s6'];
  function mepStepIdx(d){for(let i=0;i<MEP_STEPS.length;i++)if(d<=MEP_STEPS[i])return i;return MEP_STEPS.length-1;}
  function mepIt(grade,d){const a=MEP_IT[grade];return a?a[mepStepIdx(d)]:0;}
  /* plage de tolérance pour une classe et un Ø nominal → {lo,hi} en mm (écart sur la cote) */
  function mepTolRange(cls,nom){
    if(!cls||!nom||nom<=0)return null;
    const m=/^([A-Za-z]+)(\d+)$/.exec(cls);if(!m)return null;
    const L=m[1],g=+m[2],d=Math.abs(nom),i=mepStepIdx(d),IT=mepIt(g,d);
    if(L==='H')return{lo:0,hi:IT/1000};
    if(L==='h')return{lo:-IT/1000,hi:0};
    if(L==='JS'||L==='js')return{lo:-IT/2000,hi:IT/2000};
    const dev=MEP_DEV[L.toLowerCase()];
    if(!dev)return null;
    const ei=dev[i]/1000;
    return L===L.toLowerCase()?{lo:ei,hi:ei+IT/1000}:{lo:ei-IT/1000,hi:ei}; // minuscule = arbre
  }
  function mepFmtNum(v,dp){
    if(!isFinite(v))return '—';
    let s=(+v).toFixed(dp===undefined?(Math.abs(v)>=10?1:(Math.abs(v)>=1?2:3)):dp);
    s=s.replace(/\.?0+$/,'').replace(/\./,',');
    return s==='-0'?'0':s;
  }
  /* ═══════════════ C. modèle doc.mep ═══════════════ */
  function mepEnsure(){
    if(!doc.mep||typeof doc.mep!=='object')doc.mep={cur:0,sheets:[]};
    if(!Array.isArray(doc.mep.sheets))doc.mep.sheets=[];
    if(!doc.mep.sheets.length)doc.mep.sheets.push(mepNewSheet(1));
    if(!(doc.mep.cur>=0&&doc.mep.cur<doc.mep.sheets.length))doc.mep.cur=0;
    doc.mep.sheets.forEach(mepNormSheet);
    return doc.mep;
  }
  function mepNormSheet(sh){
    sh.id=sh.id||('sh'+Math.random().toString(36).slice(2,9));
    sh.name=sh.name||'Planche';
    sh.format=FORMATS[sh.format]?sh.format:'A3';
    sh.orient=sh.orient==='portrait'?'portrait':'landscape';
    sh.views=Array.isArray(sh.views)?sh.views:[];
    sh.dims=Array.isArray(sh.dims)?sh.dims:[];
    sh.title=sh.title&&typeof sh.title==='object'?sh.title:{};
    sh.seq=sh.seq>0?sh.seq:1;sh.dseq=sh.dseq>0?sh.dseq:1;
    if(!sh.sk)sh.sk=null;
  }
  function mepNewSheet(n){
    return{id:'sh'+Date.now().toString(36)+Math.floor(Math.random()*1e4),name:'Planche '+n,
      format:'A3',orient:'landscape',views:[],dims:[],sk:null,
      title:{projet:'MiniFusion — Plan',auteur:'—',date:new Date().toLocaleDateString('fr-FR')},
      seq:1,dseq:1};
  }
  function mepSheet(){const m=mepEnsure();return m.sheets[m.cur];}
  function mepPageDim(sh){
    sh=sh||mepSheet();const s=FORMATS[sh.format];
    const W=sh.orient==='landscape'?s[1]:s[0],H=sh.orient==='landscape'?s[0]:s[1];
    return{W,H,ix:MARGIN,iy:MARGIN,iw:W-2*MARGIN,ih:H-2*MARGIN-TITLE_H};
  }
  let mepSeq=0;
  function mepUid(p){return p+(++mepSeq)+'_'+Date.now().toString(36);}
  function mepView(sh,id){return sh.views.find(v=>v.id===id)||null;}
  /* mutation documentaire : snapshot + markDirty + rendu + autosave différé */
  let mepAutoT=null;
  function mepEdit(label,fn){
    try{docPushUndo('Plan : '+label);}catch(e){}
    let r=null;
    try{r=fn();}catch(e){try{console.warn('mep',e);}catch(e2){}}
    try{markDirty();}catch(e){}
    try{mepGeoCache.clear();}catch(e){}
    try{mepRender();}catch(e){}
    if(mepAutoT)clearTimeout(mepAutoT);
    mepAutoT=setTimeout(()=>{try{autosave();}catch(e){}},900); // le plan vit dans doc.mep : brouillon = pièce
    return r;
  }
  /* ═══════════════ D. géométrie : bases, vecteurs ═══════════════ */
  function mepNorm(a){const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];}
  function mepDot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function mepCross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function mepSub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function mepBasisFromDir(dir,upHint){
    const d=mepNorm(dir);
    let up=(upHint&&Math.abs(mepDot(upHint,d))<0.98)?upHint:[0,0,1];
    if(Math.abs(mepDot(up,d))>0.98)up=Math.abs(d[2])>0.9?[0,1,0]:[0,0,1];
    const u=mepNorm(mepCross(d,up));           // droite papier
    const v=mepNorm(mepCross(u,d));            // bas papier : repère (u,v,d) direct ? u×v = ?
    return{dir:d,u,v};
  }
  function mepBasisOf(view){
    if(view.kind==='base'&&MEP_VIEWS[view.vk]){
      const b=MEP_VIEWS[view.vk];
      const r=b.u?{dir:b.dir.slice(),u:b.u.slice(),v:b.v.slice()}:mepBasisFromDir(b.dir);
      if(view.flip)r.v=[-r.v[0],-r.v[1],-r.v[2]];
      return r;
    }
    const u=mepNorm(view.u||[1,0,0]);
    const d=mepNorm(view.dir||[0,-1,0]);
    let v=mepCross(u,d);const L=Math.hypot(v[0],v[1],v[2]);
    if(L<1e-6)return mepBasisFromDir(d);
    v=[v[0]/L,v[1]/L,v[2]/L];
    if(view.flip)v=[-v[0],-v[1],-v[2]];
    return{dir:d,u,v};
  }
  function mepOrtho(view){const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;}
  /* local (mm modèle) d'un point monde ; papier = ancre + local×échelle */
  function mepLocal(view,p){return[mepDot(p,view.u),mepDot(p,view.v)];}
  function mepToSheet(view,lx,ly){return{x:view.x+lx*view.scale,y:view.y+ly*view.scale};}
  function mepFromSheet(view,sx,sy){return{x:(sx-view.x)/view.scale,y:(sy-view.y)/view.scale};}
  /* ═══════════════ E. cache géométrie ═══════════════ */
  const mepGeoCache=new Map(); // viewId → {ver,sig,geo}
  function mepViewSig(v){
    return[mepRound(v.dir),mepRound(v.u),mepRound(v.v),v.bodyId||'',v.mode||'hide',v.tangent?1:0,
      v.section?mepRound(v.section.p)+mepRound(v.section.n):'',v.detail?v.detail.cx+','+v.detail.cy+','+v.detail.r:''].join('|');
  }
  function mepRound(a){return a?Array.from(a).map(x=>(+x).toFixed(3)).join(','):'';}
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
    const q=i=>Math.round(pos.getX(i)*200)+','+Math.round(pos.getY(i)*200)+','+Math.round(pos.getZ(i)*200);
    const vi=(t,k)=>idx?idx.getX(t*3+k):t*3+k;
    const P=(i)=>[pos.getX(i),pos.getY(i),pos.getZ(i)];
    for(let t=0;t<nT;t++){
      const a=vi(t,0),b=vi(t,1),c=vi(t,2);
      const A=P(a),B=P(b),C=P(c);
      const e1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],e2=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];
      const n=mepCross(e1,e2);
      const f=mepDot(n,viewDir);
      side[t]=f>1e-9?1:(f<-1e-9?-1:1);
      [[a,b],[b,c],[c,a]].forEach(pr=>{
        const k=q(pr[0])+';'+q(pr[1]);
        const k2=q(pr[1])+';'+q(pr[0]);
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
        const arr=qs.split(',');
        const cand=[A,B,C];
        for(let i=0;i<cand.length;i++){
          if(Math.round(cand[i][0]*200)===+arr[0]&&Math.round(cand[i][1]*200)===+arr[1]&&Math.round(cand[i][2]*200)===+arr[2])return cand[i];
        }
        return[+arr[0]/200,+arr[1]/200,+arr[2]/200];
      };
      res.push([findPt(parts[0]),findPt(parts[1])]);
    });
    return res;
  }
  /* ═══════════════ G. HLR ═══════════════ */
  let mepRC=null;
  function mepMeshesOf(view){
    const out=[];const list=(typeof bodies!=='undefined'&&bodies)||[];
    list.forEach(b=>{
      if(!b||b.ghost||b.kind==='ghost'||!b.mesh||b.mesh.visible===false)return;
      if(view.bodyId&&b.bodyId!==view.bodyId&&b.id!==view.bodyId)return;
      out.push(b);
    });
    return out;
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
  function mepVisFn(view){
    const vd=view.dir,sec=view._sec||null;
    const meshes=mepMeshesOf(view).filter(b=>b.mesh);
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
    if(pts.length<4)return null;
    const a=pts[0],b=pts[(pts.length>>1)],c=pts[pts.length-1];
    const d=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]));
    if(Math.abs(d)<1e-6)return null;
    const ux=((a[0]*a[0]+a[1]*a[1])*(b[1]-c[1])+(b[0]*b[0]+b[1]*b[1])*(c[1]-a[1])+(c[0]*c[0]+c[1]*c[1])*(a[1]-b[1]))/d;
    const uy=((a[0]*a[0]+a[1]*a[1])*(c[0]-b[0])+(b[0]*b[0]+b[1]*b[1])*(a[0]-c[0])+(c[0]*c[0]+c[1]*c[1])*(b[0]-a[0]))/d;
    const r=Math.hypot(a[0]-ux,a[1]-uy);
    if(!(r>0.05))return null;
    for(let i=0;i<pts.length;i++){
      if(Math.abs(Math.hypot(pts[i][0]-ux,pts[i][1]-uy)-r)>0.03)return null;
    }
    /* sweep signé : somme des deltas angulaires consécutifs bornés ±π */
    const th=i=>Math.atan2(pts[i][1]-uy,pts[i][0]-ux);
    let sweep=0;
    for(let i=0;i+1<pts.length;i++){
      let d=th(i+1)-th(i);
      while(d>Math.PI)d-=2*Math.PI;
      while(d<-Math.PI)d+=2*Math.PI;
      sweep+=d;
    }
    return{cx:ux,cy:uy,r,a0:th(0),a1:th(0)+sweep,sweep,full:Math.abs(sweep)>=2*Math.PI*0.97};
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
    return null;
  }
  /* ═══════════════ H. construction d'une vue ═══════════════ */
  function mepBuildGeo(view){
    const geo={els:[],hatch:[],src:''};
    const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;
    const list=mepMeshesOf(view);
    if(!list.length){geo.src='aucun corps';return geo;}
    /* mode d'affichage : wire = tout noir ; hide = HLR, cachées supprimées ;
       dash = HLR, cachées en gris pointillé */
    const mode=view.mode||'hide';
    let vis=null,hidKind=null;
    if(mode!=='wire'){
      if(view.section)vis=mepVisFn(view); // coupe : raycast avec exclusion du demi-espace
      else{
        const mlist=list.filter(b=>b.mesh);
        vis=mepDepthVis(view,mlist)||mepVisFn(view); // tampon de profondeur, repli raycast
      }
      if(vis&&mode==='dash')hidKind='hidden';
    }
    const added=new Set();
    /* — silhouettes du maillage : contour extérieur + aide au noircissement — */
    const silSegs=[];
    const silGrid=new Map(); // cellule 2 mm → SEGMENTS de silhouette
    const silAddSeg=pr=>{
      const L=Math.hypot(pr[1][0]-pr[0][0],pr[1][1]-pr[0][1],pr[1][2]-pr[0][2]);
      const n=Math.max(1,Math.ceil(L));
      for(let i=0;i<=n;i++){
        const t=i/n;
        const p=[pr[0][0]+(pr[1][0]-pr[0][0])*t,pr[0][1]+(pr[1][1]-pr[0][1])*t,pr[0][2]+(pr[1][2]-pr[0][2])*t];
        const k=Math.floor(p[0]/2)+','+Math.floor(p[1]/2)+','+Math.floor(p[2]/2);
        if(!silGrid.has(k))silGrid.set(k,[]);
        const arr=silGrid.get(k);
        if(arr[arr.length-1]!==pr)arr.push(pr);
      }
    };
    list.forEach(bd=>{
      const segs=mepSilhouettes(bd.mesh,view.dir);
      segs.forEach(pr=>{silSegs.push(pr);silAddSeg(pr);});
    });
    const onSil=p=>{
      // distance point→segment (corde de maillage) : tolérance 1,2 mm
      const cx=Math.floor(p[0]/2),cy=Math.floor(p[1]/2),cz=Math.floor(p[2]/2);
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
          if(dx*dx+dy*dy+dz*dz<1.44)return true;
        }
      }
      return false;
    };
    /* — forme exacte(s) — */
    let shapes=[];
    list.forEach(bd=>{if(bd.shape)shapes.push(bd.shape);});
    const exact=shapes.length&&typeof occSharpEdges==='function';
    /* — coupe : demi-espace OCCT — */
    let cutShapes=shapes;
    if(view.section&&shapes.length){
      view._sec={p0:view.section.p,gaze:mepNorm(view.section.n)};
      cutShapes=[];
      shapes.forEach(sh=>{
        const cs=mepCutHalfSpace(sh,view.section.p,view.section.n);
        if(cs)cutShapes.push(cs);else cutShapes.push(sh);
      });
    }else view._sec=null;
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
            if(tested&&hits*4>=tested*3){kind='sharp';onContour=true;} // ≥75 % des points sur le contour
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
      if(bd.shape&&exact)return; // déjà traité
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
    /* — hachures de coupe — */
    if(view.section&&cutShapes.length){
      try{geo.hatch=mepHatchLoops(cutShapes,view,view.section.p,view.section.n);}catch(e){}
    }
    /* — détail : rognage au cercle — */
    if(view.detail&&view.parent){
      const par=mepView(mepSheet(),view.parent);
      if(par)geo.els=mepClipDetail(geo.els,view.detail);
    }
    return geo;
  }
  /* demi-espace : boîte orientée construite par prisme (API sondées) */
  function mepCutHalfSpace(shape,p0,nrm){
    if(typeof occt==='undefined'||!occt)return null;
    try{
      const n=mepNorm(nrm),p=mepNorm(Math.abs(n[2])>0.9?[0,1,0]:[0,0,1]);
      let U=mepCross(n,p);const Lu=Math.hypot(U[0],U[1],U[2]);
      if(Lu<1e-6)return null;
      U=[U[0]/Lu,U[1]/Lu,U[2]/Lu];
      const V=mepCross(n,U);
      let diag=0;
      try{ // boîte englobante des corps visibles → demi-espace assez grand
        const bb=new THREE.Box3();
        const list=(typeof bodies!=='undefined'&&bodies)||[];
        list.forEach(bd=>{
          if(bd&&bd.mesh&&bd.mesh.visible!==false&&!bd.ghost){bb.expandByObject(bd.mesh);diag=Math.max(diag,bb.getSize(new THREE.Vector3()).length());}
        });
      }catch(e){}
      if(!(diag>1))diag=400;
      const A=diag/2+20;
      const cor=[[-A,-A],[A,-A],[A,A],[-A,A]].map(c=>[p0[0]+U[0]*c[0]+V[0]*c[1],p0[1]+U[1]*c[0]+V[1]*c[1],p0[2]+U[2]*c[0]+V[2]*c[1]]);
      const poly=new occt.BRepBuilderAPI_MakePolygon_1();
      cor.forEach(q=>{const pt=new occt.gp_Pnt_3(q[0],q[1],q[2]);try{poly.Add_1(pt);}catch(e){try{pt.delete();}catch(e2){}}});
      try{poly.Close();}catch(e){}
      if(!poly.IsDone())return null;
      const fm=new occt.BRepBuilderAPI_MakeFace_15(poly.Wire(),true);
      fm.Build();
      if(!fm.IsDone())return null;
      const dep=diag*2;
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
              if(Math.abs(Math.abs(mepDot(dn,n))-1)<1e-3&&Math.abs(mepDot(mepSub(lp,p0),n))<0.05){
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
      else if(inside0)segsOut.push([x1,y1,x1+dx*t0,y1+dy*t0]);
      else if(inside1)segsOut.push([x1+dx*t1,y1+dy*t1,x2,y2]);
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
      dir:[0,-1,0],u:[1,0,0],v:[0,0,-1],x:0,y:0,scale:1,mode:'hide',tangent:true,flip:false,
      label:'',parent:null,section:null,detail:null},opts||{});
    if(view.kind==='base'&&view.vk){
      const b=mepBasisOf(view);view.dir=b.dir;view.u=b.u;view.v=b.v;
    }
    mepEdit('nouvelle vue',()=>{
      sh.views.push(view);
      mepAutoScale(sh,view);
      const pd=mepPageDim(sh);
      mepPlaceNear(sh,view,pd.ix+pd.iw*(0.28+0.16*(sh.views.length%3)),pd.iy+pd.ih*(view.kind==='detail'?0.3:0.45));
    });
    mepSelect(view.id);
    return view;
  }
  function mepSelect(id){mepSt.sel=id;mepSt.selDim=null;mepSideShow();}
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
    return mepAddView({kind:'base',vk:'',dir:b.dir,u:b.u,v:b.v,label:''});
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
      if(c.kind==='proj'&&c.parent===v.id){c.x+=dx;c.y+=dy;mepProjFollow(sh,c,dx,dy);}
    });
  }
  function mepAddProjected(par,which){
    const def=MEP_PROJ[which];
    if(!def){mepStatus('Projection inconnue : '+which);return null;}
    if(!par){mepStatus('Sélectionnez d’abord la vue mère à projeter.');return null;}
    const b=mepBasisOf(par);
    const dir=mepNorm(def.dir(b)),u=mepNorm(def.u(b));
    const v=mepNorm(mepCross(u,dir));
    const vObj=mepAddView({kind:'proj',vk:'',proj:which,dir,u,v,
      parent:par.id,label:mepNextLabel(mepSheet()),
      bodyId:par.bodyId,mode:par.mode,tangent:par.tangent,scale:par.scale});
    // placement aligné 1er angle : l'axe commun est verrouillé sur la mère
    mepEdit('placement vue projetée',()=>{
      vObj.scale=par.scale; // les vues liées partagent TOUJOURS l'échelle de la mère
      const off=mepViewSpan(par)+mepViewSpan(vObj)+30;
      if(which==='top'){vObj.x=par.x;vObj.y=par.y+off;}
      else if(which==='bottom'){vObj.x=par.x;vObj.y=par.y-off;}
      else if(which==='left'){vObj.x=par.x+off;vObj.y=par.y;}
      else{vObj.x=par.x-off;vObj.y=par.y;}
    });
    mepStatus('Vue projetée « '+def.lab+' » ('+vObj.label+') — 1er angle, alignée sur la mère.');
    return vObj;
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
  function mepBeginSection(){
    const par=mepView(mepSheet(),mepSt.sel);
    if(!par){mepStatus('Sélectionnez d’abord la vue parente de la coupe.');return;}
    mepSt.tool='cut2';mepSt.cutParent=par.id;mepSt.cutPts=[];
    mepStatus('Coupe : cliquez les DEUX points de la ligne de coupe sur la vue « '+(par.label||par.vk||'vue')+' ».');
  }
  function mepSectionFromPicks(par,A,B){
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
    const v=mepAddView({kind:'section',vk:'',dir:b.dir,u:b.u,v:b.v,parent:par.id,label,
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
  function mepBeginDetail(){
    const par=mepView(mepSheet(),mepSt.sel);
    if(!par){mepStatus('Sélectionnez d’abord la vue parente du détail.');return;}
    mepSt.tool='det2';mepSt.cutParent=par.id;
    mepStatus('Détail : cliquez le CENTRE du cercle de détail, puis le rayon.');
  }
  function mepDetailFromPicks(par,C,R){
    const label=mepNextLabel(mepSheet());
    const src=mepBasisOf(par);
    const v=mepAddView({kind:'detail',vk:'',dir:src.dir.slice(),u:src.u.slice(),v:src.v.slice(),
      parent:par.id,label,scale:2,detail:{cx:C.x,cy:C.y,r:R},bodyId:par.bodyId,mode:par.mode,tangent:par.tangent});
    mepEdit('placement vue de détail',()=>{
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
  function mepReproject(id){
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
        const g=mepGeoOf(v);
        const rebind=a=>{
          if(!a||!a.hint)return a;
          let best=null,bd=0.6;
          g.els.forEach((e,i)=>{
            if(a.hint.t==='seg'&&e.t==='L'){
              const d1=Math.hypot(e.x1-a.x,e.y1-a.y),d2=Math.hypot(e.x2-a.x,e.y2-a.y);
              const dmin=Math.min(d1,d2);
              if(dmin<bd){bd=dmin;best=d1<d2?{x:e.x1,y:e.y1,hint:{t:'seg',i}}:{x:e.x2,y:e.y2,hint:{t:'seg',i}};}
            }else if(a.hint.t==='ctr'&&(e.t==='C'||e.t==='A')){
              const dmin=Math.hypot(e.cx-a.x,e.cy-a.y);
              if(dmin<bd){bd=dmin;best={x:e.cx,y:e.cy,hint:{t:'ctr',i}};}
            }
          });
          return best||a;
        };
        d.a=rebind(d.a);
        if(d.b)d.b=rebind(d.b);
      });
    });
  }
  /* ═══════════════ K. planches ═══════════════ */
  function mepAddSheetCmd(){
    mepEnsure();
    mepEdit('nouvelle planche',()=>{
      doc.mep.sheets.push(mepNewSheet(doc.mep.sheets.length+1));
      doc.mep.cur=doc.mep.sheets.length-1;
    });
    mepAfterSheetSwitch();
  }
  function mepDupSheetCmd(){
    const sh=mepSheet();
    mepEdit('duplication de planche',()=>{
      const c=JSON.parse(JSON.stringify({format:sh.format,orient:sh.orient,title:sh.title,views:sh.views,dims:sh.dims,sk:sh.sk}));
      const ns=mepNewSheet(doc.mep.sheets.length+1);
      ns.format=c.format;ns.orient=c.orient;ns.title=c.title;
      const idMap={};
      c.views.forEach(v=>{const nid=mepUid('v');idMap[v.id]=nid;v.id=nid;v.parent=v.parent?idMap[v.parent]||null:null;
        if(v.section)v.section.pid=idMap[v.section.pid]||null;});
      c.dims.forEach(d=>{d.id=mepUid('d');d.vid=idMap[d.vid]||d.vid;if(d.vid2)d.vid2=idMap[d.vid2]||d.vid2;});
      ns.views=c.views;ns.dims=c.dims;ns.sk=c.sk;
      doc.mep.sheets.splice(doc.mep.cur+1,0,ns);
      doc.mep.cur++;
    });
    mepAfterSheetSwitch();
  }
  function mepDelSheetCmd(){
    const sh=mepSheet();
    if(doc.mep.sheets.length<=1){mepStatus('Il faut garder au moins une planche.');return;}
    if(typeof mffAsk==='function'){
      mffAsk('Supprimer « '+sh.name+' » et toutes ses vues ?',[['Supprimer',true],['Annuler',false]]).then(ok=>{
        if(!ok)return;
        mepEdit('suppression de planche',()=>{doc.mep.sheets.splice(doc.mep.cur,1);doc.mep.cur=Math.max(0,doc.mep.cur-1);});
        mepAfterSheetSwitch();
      });
    }else if(confirm('Supprimer « '+sh.name+' » ?')){
      mepEdit('suppression de planche',()=>{doc.mep.sheets.splice(doc.mep.cur,1);doc.mep.cur=Math.max(0,doc.mep.cur-1);});
      mepAfterSheetSwitch();
    }
  }
  function mepAfterSheetSwitch(){
    mepSt.sel=null;mepSt.selDim=null;mepSt.tool='select';
    try{mepRender();}catch(e){}
    mepTabsRender();mepSideShow();mepToolSync();
    mepStatus('Ouverte : '+mepSheet().name);
  }
  /* ═══════════════ L. état UI ═══════════════ */
  const mepSt={open:false,sel:null,selDim:null,tool:'select',zoom:1,pan:{x:0,y:0},
    pick:null,dim:null,sk:null,cutParent:null,cutPts:[],detC:null,hovView:null,skSel:new Set()};
  try{ mepSt.zoomRev=localStorage.getItem('minifusion_mepZoomRev')==='1'; }catch(e){ mepSt.zoomRev=false; } // sens de la molette, mémorisé
  let mepWrapEl=null,mepSvgEl=null,mepSheetEl=null,mepSideEl=null,mepStatusEl=null,mepTabsEl=null;
  let mepToolbarEl=null;
  let mepGFrame=null,mepGSheet=null,mepGHlp=null,mepGridG=null;
  let mepPxMM=1; // mm papier par pixel écran (à recalculer au rendu)
  function mepStatus(msg){if(mepStatusEl)mepStatusEl.textContent=msg||'';try{if(msg)faceEl.textContent=String(msg).split('\n')[0];}catch(e){}}
  function mepPage(){
    const sh=mepSheet();const pd=mepPageDim(sh);
    const W=pd.W,H=pd.H;
    const w=W/mepSt.zoom,h=H/mepSt.zoom;
    return{W,H,pd,vb:[mepSt.pan.x,mepSt.pan.y,w,h]};
  }
  /* pointeur écran → mm papier */
  function mepPt(ev){
    const r=mepSvgEl.getBoundingClientRect();
    const vb=mepSvgViewBox();
    const px=(ev.clientX-r.left)/(r.width||1),py=(ev.clientY-r.top)/(r.height||1);
    return{x:vb.x+px*vb.width,y:vb.y+py*vb.height,px:ev.clientX-r.left,py:ev.clientY-r.top};
  }
  function mepSvgViewBox(){
    try{
      const b=mepSvgEl.viewBox&&mepSvgEl.viewBox.baseVal;
      if(b&&isFinite(b.width)&&b.width>0)return{x:b.x||0,y:b.y||0,width:b.width,height:b.height||1};
    }catch(e){}
    const pg=mepPage();
    return{x:pg.vb[0],y:pg.vb[1],width:pg.vb[2],height:pg.vb[3]};
  }
  function mepPxToMm(){
    try{
      const r=mepSvgEl.getBoundingClientRect();
      const vb=mepSvgViewBox();
      return vb.width/(r.width||1);
    }catch(e){return 1;}
  }
  /* ═══════════════ M. construction UI ═══════════════ */
  function mepBuildUI(){
    if(mepWrapEl&&mepWrapEl.parentNode)return;
    const host=document.getElementById('vpwrap')||document.body;
    mepWrapEl=document.createElement('div');mepWrapEl.id='mepWrap';
    // construction explicite (pas d'innerHTML : le harnais de test ne parse pas)
    const tabs=document.createElement('div');tabs.id='mepTabs';
    const tb=document.createElement('div');tb.id='mepToolbar';
    const body=document.createElement('div');body.id='mepBody';
    const sheet=document.createElement('div');sheet.id='mepSheet';
    const svg=document.createElementNS(NS,'svg');svg.id='mepSvg';
    const defs=document.createElementNS(NS,'defs');
    const mkMarker=(id,dir)=>{
      const mkr=document.createElementNS(NS,'marker');
      mkr.setAttribute('id',id);mkr.setAttribute('markerWidth',7);mkr.setAttribute('markerHeight',6);
      mkr.setAttribute('refX',dir>0?6.4:0.6);mkr.setAttribute('refY',3);mkr.setAttribute('orient','auto');
      const p=document.createElementNS(NS,'path');
      p.setAttribute('d',dir>0?'M0,0 L7,3 L0,6 z':'M7,0 L0,3 L7,6 z');
      p.setAttribute('fill','#0a84ff');
      mkr.appendChild(p);defs.appendChild(mkr);
    };
    mkMarker('mepArr',1);mkMarker('mepArrS',-1);
    svg.appendChild(defs);
    const gSheet=document.createElementNS(NS,'g');gSheet.id='mepGSheet';
    const gHlp=document.createElementNS(NS,'g');gHlp.id='mepGHlp';
    svg.appendChild(gSheet);svg.appendChild(gHlp);
    sheet.appendChild(svg);
    const side=document.createElement('div');side.id='mepSide';
    body.appendChild(sheet);body.appendChild(side);
    const st=document.createElement('div');st.id='mepStatus';
    mepWrapEl.appendChild(tabs);mepWrapEl.appendChild(tb);mepWrapEl.appendChild(body);mepWrapEl.appendChild(st);
    host.appendChild(mepWrapEl);
    mepSvgEl=svg;
    mepSheetEl=sheet;
    mepSideEl=side;
    mepStatusEl=st;
    mepTabsEl=tabs;
    mepGSheet=gSheet;
    mepGHlp=gHlp;
    mepToolbarEl=tb;
    mepBuildToolbar();
    mepSvgEl.addEventListener('pointerdown',mepOnDown);
    mepSvgEl.addEventListener('pointermove',mepOnMove);
    mepSvgEl.addEventListener('pointerup',mepOnUp);
    mepSvgEl.addEventListener('pointerleave',()=>{mepSt.hovView=null;try{mepRender();}catch(e){}});
    mepSvgEl.addEventListener('wheel',mepOnWheel,{passive:false});
    mepSvgEl.addEventListener('dblclick',mepOnDbl);
    mepSvgEl.addEventListener('contextmenu',e=>{e.preventDefault();});
    window.addEventListener('keydown',mepOnKey,true);
    window.addEventListener('resize',()=>{try{mepRender();}catch(e){}});
  }
  function mepBuildToolbar(){
    /* la barre d'outils interne est retirée : ruban (bandeau) + panneau latéral suffisent */
    mepToolSync();
  }
  function mepCycleFormat(){
    const sh=mepSheet();
    mepEdit('format',()=>{
      const i=FORMAT_ORDER.indexOf(sh.format);
      sh.format=FORMAT_ORDER[(i+1)%FORMAT_ORDER.length];
    });
    mepTabsRender();
  }
  function mepCycleOrient(){
    const sh=mepSheet();
    mepEdit('orientation',()=>{sh.orient=sh.orient==='landscape'?'portrait':'landscape';});
    mepTabsRender();
  }
  function mepZoomBy(k){
    const pg=mepPage();
    const cx=pg.vb[0]+pg.vb[2]/2,cy=pg.vb[1]+pg.vb[3]/2;
    mepSt.zoom=Math.min(20,Math.max(0.08,mepSt.zoom*k));
    const w=pg.W/mepSt.zoom,h=pg.H/mepSt.zoom;
    mepSt.pan.x=cx-w/2;mepSt.pan.y=cy-h/2;
    mepRender();
  }
  function mepFitSheet(){mepSt.zoom=1;mepSt.pan={x:0,y:0};}
  function mepFitViewContent(view){
    const b=mepAABBOf(mepGeoOf(view));
    if(!b)return;
    const s1=mepToSheet(view,b.minx,b.miny),s2=mepToSheet(view,b.maxx,b.maxy);
    const pg=mepPage(),pad=14;
    const w=(s2.x-s1.x)+pad*2,h=(s2.y-s1.y)+pad*2;
    mepSt.zoom=Math.min(20,Math.max(0.08,Math.min(pg.W/w,pg.H/h)));
    mepSt.pan.x=(s1.x+s2.x)/2-pg.W/(2*mepSt.zoom);
    mepSt.pan.y=(s1.y+s2.y)/2-pg.H/(2*mepSt.zoom);
    mepRender();
  }
  function mepTabsRender(){
    if(!mepTabsEl)return;
    mepEnsure();
    mepTabsEl.innerHTML='';
    doc.mep.sheets.forEach((sh,i)=>{
      const b=document.createElement('button');
      b.textContent=sh.name+' · '+sh.format;
      if(i===doc.mep.cur)b.className='on';
      b.onclick=()=>{doc.mep.cur=i;mepAfterSheetSwitch();};
      b.ondblclick=()=>{
        const n=prompt('Nom de la planche :',sh.name);
        if(n){mepEdit('renommer planche',()=>{sh.name=n;});mepTabsRender();}
      };
      mepTabsEl.appendChild(b);
    });
    const add=document.createElement('button');
    add.className='mepAdd';add.textContent='＋';add.title='Ajouter une planche';
    add.onclick=()=>mepAddSheetCmd();
    mepTabsEl.appendChild(add);
    const dup=document.createElement('button');dup.className='mepAdd';dup.textContent='⧉';dup.title='Dupliquer la planche';
    dup.onclick=()=>mepDupSheetCmd();mepTabsEl.appendChild(dup);
    const del=document.createElement('button');del.className='mepAdd';del.textContent='🗑';del.title='Supprimer la planche';
    del.onclick=()=>mepDelSheetCmd();mepTabsEl.appendChild(del);
    const fmt=document.createElement('span');
    fmt.style.cssText='font-size:.68rem;color:var(--muted);margin-left:8px';
    const sh=mepSheet();
    fmt.textContent=sh.format+' '+(sh.orient==='landscape'?'paysage':'portrait');
    mepTabsEl.appendChild(fmt);
  }
  function mepSelView(){const sh=mepSheet();return mepSt.sel?mepView(sh,mepSt.sel):null;}
  /* ═══════════════ N. rendu ═══════════════ */
  function mepRender(){
    if(!mepWrapEl||!mepSt.open)return;
    mepEnsure();
    const sh=mepSheet();
    const pg=mepPage();
    mepSvgEl.setAttribute('viewBox',pg.vb.map(v=>+v.toFixed(3)).join(' '));
    mepPxMM=mepPxToMm();
    mepGSheet.innerHTML='';
    mepGHlp.innerHTML='';
    const mk=(tag,attrs,parent)=>{
      const el=document.createElementNS(NS,tag);
      if(attrs)for(const k in attrs)el.setAttribute(k,attrs[k]);
      (parent||mepGSheet).appendChild(el);
      return el;
    };
    /* feuille + cadre + cartouche */
    mk('rect',{x:0,y:0,width:pg.W,height:pg.H,class:'mepPage'});
    const pd=pg.pd;
    mk('rect',{x:pd.ix,y:pd.iy,width:pd.iw,height:pd.ih+TITLE_H,class:'mepFrame'});
    mk('rect',{x:pd.ix+3,y:pd.iy+3,width:pd.iw-6,height:pd.ih+TITLE_H-6,class:'mepFrame2'});
    const ty=pg.H-MARGIN-TITLE_H;
    mk('rect',{x:pd.ix,y:ty,width:pd.iw,height:TITLE_H,class:'mepTitleBlock'});
    mk('line',{x1:pd.ix,y1:ty,x2:pd.ix+pd.iw,y2:ty,class:'mepTitleBlock'});
    const fields=[
      ['PROJET',sh.title.projet||'','x',pd.ix+4,'w',Math.min(130,pd.iw*0.4)],
      ['PLANCHE',(doc.mep.cur+1)+' / '+doc.mep.sheets.length,'x',pd.ix+Math.min(130,pd.iw*0.4)+6,'w',44],
      ['ÉCHELLE',mepSheetScaleLabel(sh),'x',pd.ix+Math.min(130,pd.iw*0.4)+54,'w',40],
      ['DATE',sh.title.date||'','x',pd.ix+Math.min(130,pd.iw*0.4)+98,'w',56],
      ['DESSINÉ PAR',sh.title.auteur||'','x',pd.ix+Math.min(130,pd.iw*0.4)+158,'w',pd.iw-Math.min(130,pd.iw*0.4)-164]
    ];
    let lastX=pd.ix;
    fields.forEach((f,i)=>{
      const x=f[3];
      if(i>0)mk('line',{x1:x-2,y1:ty,x2:x-2,y2:ty+TITLE_H,class:'mepTitleBlock'});
      mk('text',{x,y:ty+7,class:'mepTitleText'}).textContent=f[0];
      const t=mk('text',{x,y:ty+16,class:'mepTitleVal'});
      t.textContent=String(f[1]||'').slice(0,f[5]>0?Math.floor(f[5]/2.1):24);
      lastX=x;
    });
    /* grille */
    if(mepSt.grid){
      for(let x=0;x<=pg.W;x+=10)mk('line',{x1:x,y1:0,x2:x,y2:pg.H,class:'mepGrid'});
      for(let y=0;y<=pg.H;y+=10)mk('line',{x1:0,y1:y,x2:pg.W,y2:y,class:'mepGrid'});
    }
    /* vues */
    sh.views.forEach(v=>{
      try{mepDrawView(mk,v,sh);}catch(e){try{console.warn('vue',e);}catch(e2){}}
    });
    /* cotes */
    sh.dims.forEach(d=>{
      try{mepDrawDim(mk,d,sh);}catch(e){}
    });
    /* esquisse de planche */
    if(sh.sk){
      try{mepDrawSk(mk,sh.sk);}catch(e){}
    }
    /* cadre bleu : sélection (plein) + survol (pointillé) */
    const drawVB=(id,cls)=>{
      const v=mepView(sh,id);
      if(!v)return;
      const b=mepViewSheetBBox(v);
      if(b)mk('rect',{x:b.x-4,y:b.y-4,width:b.w+8,height:b.h+8,class:cls},mepGHlp);
    };
    if(mepSt.sel)drawVB(mepSt.sel,'mepVBSel');
    if(mepSt.hovView)drawVB(mepSt.hovView,'mepVB');
    /* brouillons d'interaction */
    try{mepDrawDraft(mk);}catch(e){}
    mepToolSync();
  }
  function mepSheetScaleLabel(sh){
    const vals=sh.views.filter(v=>v.scale!==1).map(v=>v.scale);
    if(!vals.length)return '1:1';
    const s=vals[0];
    if(s>=1)return mepFmtNum(s,2).replace(',0','')+':1';
    return '1:'+mepFmtNum(1/s,2);
  }
  function mepViewSheetBBox(v){
    const b=mepAABBOf(mepGeoOf(v));
    let minx=b?b.minx:1e9,miny=b?b.miny:1e9,maxx=b?b.maxx:-1e9,maxy=b?b.maxy:-1e9,any=!!b;
    if(v.detail){minx=Math.min(minx,v.detail.cx-v.detail.r);maxx=Math.max(maxx,v.detail.cx+v.detail.r);miny=Math.min(miny,v.detail.cy-v.detail.r);maxy=Math.max(maxy,v.detail.cy+v.detail.r);any=true;}
    if(!any)return null;
    const s1=mepToSheet(v,minx,miny),s2=mepToSheet(v,maxx,maxy);
    return{x:s1.x,y:s1.y,w:s2.x-s1.x,h:s2.y-s1.y};
  }
  function mepDrawView(mk,v,sh){
    const g=mepGeoOf(v);
    const X=lx=>v.x+lx*v.scale,Y=ly=>v.y+ly*v.scale;
    /* la vue sélectionnée garde ses couleurs : seul le cadre bleu la signale */
    const cls=e=>(e.k==='hidden'?'mepEnt mepHidden':e.k==='tangent'?'mepEnt mepTangent':e.k==='sect'?'mepEnt mepSect':'mepEnt mepSharp');
    g.els.forEach(e=>{
      if(e.t==='L')mk('line',{x1:+X(e.x1).toFixed(3),y1:+Y(e.y1).toFixed(3),x2:+X(e.x2).toFixed(3),y2:+Y(e.y2).toFixed(3),class:cls(e)});
      else if(e.t==='C')mk('circle',{cx:+X(e.cx).toFixed(3),cy:+Y(e.cy).toFixed(3),r:+(e.r*v.scale).toFixed(3),class:cls(e)});
      else if(e.t==='A'){
        const x0=+X(e.cx+e.r*Math.cos(e.a0)).toFixed(3),y0=+Y(e.cy+e.r*Math.sin(e.a0)).toFixed(3);
        const x1=+X(e.cx+e.r*Math.cos(e.a1)).toFixed(3),y1=+Y(e.cy+e.r*Math.sin(e.a1)).toFixed(3);
        const rr=+(e.r*v.scale).toFixed(3);
        const la=Math.abs(e.a1-e.a0)>Math.PI?1:0,sw=e.a1>e.a0?1:0;
        mk('path',{d:'M'+x0+' '+y0+' A'+rr+' '+rr+' 0 '+la+' '+sw+' '+x1+' '+y1,class:cls(e)});
      }
      else if(e.t==='P'&&e.pts&&e.pts.length>1){
        for(let i=0;i+1<e.pts.length;i++)
          mk('line',{x1:+X(e.pts[i][0]).toFixed(3),y1:+Y(e.pts[i][1]).toFixed(3),x2:+X(e.pts[i+1][0]).toFixed(3),y2:+Y(e.pts[i+1][1]).toFixed(3),class:cls(e)});
      }
    });
    /* hachures */
    if(g.hatch&&g.hatch.length)mepDrawHatch(mk,g.hatch,v);
    /* ligne de coupe sur le parent */
    if(v.section&&v.section.a&&v.section.pid){
      const par=mepView(sh,v.section.pid);
      if(par){
        const A=mepToSheet(par,v.section.a[0],v.section.a[1]);
        const B=mepToSheet(par,v.section.b[0],v.section.b[1]);
        mk('line',{x1:A.x,y1:A.y,x2:B.x,y2:B.y,class:'mepCut','stroke-dasharray':'8 2 1.5 2'});
        const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1;
        const nx=-dy/L*6,ny=dx/L*6;
        [[A,B,1],[B,A,-1]].forEach(([P,Q,s])=>{
          const ex=P.x+dx/L*7*s,ey=P.y+dy/L*7*s;
          mk('line',{x1:P.x+nx,y1:P.y+ny,x2:ex,y2:ey,class:'mepCutS','marker-end':'url(#mepArr)'});
          mk('line',{x1:P.x-nx,y1:P.y-ny,x2:ex,y2:ey,class:'mepCutS','marker-end':'url(#mepArr)'});
        });
        if(v.label){
          mk('text',{x:(A.x+B.x)/2+nx*1.8,y:(A.y+B.y)/2+ny*1.8+2,class:'mepLbl','text-anchor':'middle'}).textContent=v.label;
        }
      }
    }
    /* marqueur détail sur le parent */
    if(v.detail&&v.parent){
      const par=mepView(sh,v.parent);
      if(par){
        const C=mepToSheet(par,v.detail.cx,v.detail.cy);
        mk('circle',{cx:C.x,cy:C.y,r:v.detail.r*par.scale,class:'mepEnt mepSel','stroke-dasharray':'4 2'});
        if(v.label)mk('text',{x:C.x,y:C.y-v.detail.r*par.scale-2,class:'mepLbl','text-anchor':'middle'}).textContent=v.label;
      }
    }
        if(v.label){
          const bb=mepViewSheetBBox(v);
          if(bb){
            let txt=v.label;
            if(v.kind==='section')txt='COUPE '+v.label+'-'+v.label;
            else if(v.kind==='detail'){
              const s=v.scale>=1?(mepFmtNum(v.scale,2)+':1'):('1:'+mepFmtNum(1/v.scale,2));
              txt='DÉTAIL '+v.label+' ('+s+')';
            }
            mk('text',{x:bb.x+bb.w/2,y:bb.y+bb.h+11,class:'mepLbl','text-anchor':'middle'}).textContent=txt;
          }
        }
  }
  function mepDrawHatch(mk,loops,v){
    if(!loops.length)return;
    const sp=2.5/v.scale; // 2,5 mm papier
    /* rotation 45° puis scanline pair-impair (trous inclus) */
    const c=Math.SQRT1_2,s=Math.SQRT1_2;
    const rot=p=>[p[0]*c-p[1]*s,p[0]*s+p[1]*c];
    const unrot=q=>[q[0]*c+q[1]*s,-q[0]*s+q[1]*c];
    const RL=loops.map(l=>l.map(rot));
    let miny=1e9,maxy=-1e9;
    RL.forEach(l=>l.forEach(p=>{miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]);}));
    const lines=[];
    for(let y=Math.ceil(miny/sp)*sp;y<=maxy;y+=sp){
      const xs=[];
      RL.forEach(l=>{
        for(let i=0;i<l.length;i++){
          const a=l[i],b=l[(i+1)%l.length];
          if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y)){
            xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]));
          }
        }
      });
      xs.sort((p,q)=>p-q);
      for(let i=0;i+1<xs.length;i+=2){
        if(xs[i+1]-xs[i]>0.2)lines.push([unrot([xs[i],y]),unrot([xs[i+1],y])]);
      }
    }
    lines.forEach(ln=>{
      mk('line',{x1:+(v.x+ln[0][0]*v.scale).toFixed(3),y1:+(v.y+ln[0][1]*v.scale).toFixed(3),
        x2:+(v.x+ln[1][0]*v.scale).toFixed(3),y2:+(v.y+ln[1][1]*v.scale).toFixed(3),class:'mepHatch'});
    });
  }
  /* ═══════════════ O. cotes : mesure, texte, rendu ═══════════════ */
  function mepDimWorld(sh,d){
    // ancrages → mm papier
    const v1=mepView(sh,d.vid);
    if(!v1)return null;
    const a=mepToSheet(v1,d.a.x,d.a.y);
    let b=a;
    if(d.vid2){
      const v2=mepView(sh,d.vid2);
      if(!v2)return null;
      b=mepToSheet(v2,d.b.x,d.b.y);
    }else b=mepToSheet(v1,d.b?d.b.x:d.a.x,d.b?d.b.y:d.a.y);
    return{a,b,v1,v2:d.vid2?mepView(sh,d.vid2):null};
  }
  function mepDimMeasure(sh,d){
    // Valeurs en mm MODÈLE : les ancres (d.a/d.b) sont déjà en coordonnées modèle,
    // et les éléments de géométrie le sont aussi. Ne PAS multiplier par view.scale
    // (ce serait des mm papier → cote fausse dès que l'échelle ≠ 1:1).
    const w=mepDimWorld(sh,d);
    if(!w)return 0;
    const modelDist=()=>d.b?Math.hypot(d.b.x-d.a.x,d.b.y-d.a.y):0;
    switch(d.kind){
      case 'len':{
        const e=mepEntByHint(w.v1,d.a.hint);
        if(e&&e.t==='L')return Math.hypot(e.x2-e.x1,e.y2-e.y1);
        return modelDist();
      }
      case 'dist':return modelDist();
      case 'rad':{const e=mepEntByHint(w.v1,d.a.hint);return e&&(e.t==='C'||e.t==='A')?e.r:modelDist();}
      case 'dia':{const e=mepEntByHint(w.v1,d.a.hint);return e&&(e.t==='C'||e.t==='A')?2*e.r:2*modelDist();}
      case 'ang':{
        const e1=d.a.hint?mepEntByHint(w.v1,d.a.hint):null;
        const e2=d.b&&d.b.hint?mepEntByHint(d.vid2?w.v2:w.v1,d.b.hint):null;
        if(e1&&e1.t==='L'&&e2&&e2.t==='L'){
          const d1=Math.atan2(e1.y2-e1.y1,e1.x2-e1.x1),d2=Math.atan2(e2.y2-e2.y1,e2.x2-e2.x1);
          let a=Math.abs((d2-d1)*180/Math.PI)%180;
          if(a>90)a=180-a;
          return a;
        }
        const a1=Math.atan2(w.a.y-(w.b?w.b.y:w.a.y),w.a.x-(w.b?w.b.x:w.a.x));
        return Math.abs(a1*180/Math.PI);
      }
      default:return Math.hypot(w.b.x-w.a.x,w.b.y-w.a.y);
    }
  }
  function mepEntByHint(view,hint){
    if(!view||!hint)return null;
    const g=mepGeoOf(view);
    return g.els[hint.i]||null;
  }
  function mepDimText(d,value){
    if(d.txt)return d.txt;
    const unit=d.kind==='ang'?'°':'';
    let base=mepFmtNum(value,d.kind==='ang'?1:2)+unit;
    const t=d.tol||{};
    if(t.m==='pm'&&t.s>0)base+=' ±'+mepFmtNum(t.s,3);
    else if(t.m==='dbl')base+=' +'+mepFmtNum(t.hi,3)+' / −'+mepFmtNum(Math.abs(t.lo),3);
    else if(t.m==='cls'&&t.cls){
      const rg=mepTolRange(t.cls,value);
      if(rg)base+=' ('+mepFmtNum(rg.hi,3)+' / '+mepFmtNum(rg.lo,3)+')';
      else base+=' '+t.cls;
    }
    return base;
  }
  function mepDrawDim(mk,d,sh){
    const w=mepDimWorld(sh,d);
    if(!w)return;
    const val=d.value!=null?d.value:mepDimMeasure(sh,d);
    const txt=mepDimText(d,val);
    const sel=mepSt.selDim===d.id;
    const col=sel?COL.sel:(d.ref?null:'#0a84ff');
    const L={class:'mepDimL'+(sel?' mepSel':'')};
    const T={class:'mepDimT'+(d.ref?' mepDimRef':'')};
    if(d.kind==='dia'||d.kind==='rad'){
      // leader radial
      const e=mepEntByHint(w.v1,d.a.hint);
      const cx=w.a.x,cy=w.a.y;
      let px=w.b.x,py=w.b.y;
      if(e&&(e.t==='C'||e.t==='A')){
        const v=w.v1;
        const cS=mepToSheet(v,e.cx,e.cy);
        const rr=e.r*v.scale;
        let ang=Math.atan2(py-cS.y,px-cS.x);
        if(e.t==='A'){
          // borne le leader à la plage de l'arc
          const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
          let an=ang;while(an<lo)an+=2*Math.PI;
          if(an>hi){
            const d0=Math.abs(ang-e.a0),d1=Math.abs(ang-e.a1);
            ang=d0<d1?e.a0:e.a1;
          }else ang=an;
        }
        px=cS.x+rr*Math.cos(ang);py=cS.y+rr*Math.sin(ang);
        cx=cS.x;cy=cS.y;
      }
      const dirx=px-cx,diry=py-cy,dl=Math.hypot(dirx,diry)||1;
      const ex=cx+dirx/dl*(dl+14),ey=cy+diry/dl*(dl+14);
      mk('line',Object.assign({x1:cx,y1:cy,x2:ex,y2:ey,'marker-end':'url(#mepArr)'},L));
      if(d.kind==='dia'){
        // flèche côté opposé du trou
        const ex2=cx-dirx/dl*(dl+14),ey2=cy-diry/dl*(dl+14);
        mk('line',Object.assign({x1:cx,y1:cy,x2:ex2,y2:ey2,'marker-end':'url(#mepArrS)'},L));
        mk('line',Object.assign({x1:cx-diry/dl*0,y1:cy,x2:cx,y2:cy},L)); // ancrage visuel
      }
      const t=mk('text',Object.assign({x:ex+dirx/dl*2,y:ey+diry/dl*2+2},T));
      t.textContent=(d.kind==='dia'?'Ø':'R')+txt;
      if(d.kind==='dia')t.setAttribute('text-anchor',dirx<0?'end':'start');
      return;
    }
    if(d.kind==='ang'){
      const e1=d.a.hint?mepEntByHint(w.v1,d.a.hint):null;
      const e2=d.b&&d.b.hint?mepEntByHint(d.vid2?w.v2:w.v1,d.b.hint):null;
      const pA=w.a,pB=w.b;
      const r=Math.max(9,Math.min(24,Math.hypot(pB.x-pA.x,pB.y-pA.y)/2.5));
      let a1=0,a2=Math.PI/2;
      if(e1&&e1.t==='L'){const v=w.v1;a1=Math.atan2((e1.y2-e1.y1)*v.scale,(e1.x2-e1.x1)*v.scale);}
      if(e2&&e2.t==='L'){const v2=d.vid2?w.v2:w.v1;a2=Math.atan2((e2.y2-e2.y1)*v2.scale,(e2.x2-e2.x1)*v2.scale);}
      const O=pB;
      let aa=a1,bb=a2,dd=bb-aa;
      while(dd<=-Math.PI)dd+=2*Math.PI;
      while(dd>Math.PI)dd-=2*Math.PI;
      const sweep=dd>0?1:0;
      const x1=O.x+r*Math.cos(aa),y1=O.y+r*Math.sin(aa);
      const x2=O.x+r*Math.cos(bb),y2=O.y+r*Math.sin(bb);
      const large=Math.abs(dd)>Math.PI?1:0;
      mk('path',Object.assign({d:'M'+x1+','+y1+' A'+r+','+r+' 0 '+large+' '+sweep+' '+x2+','+y2},L));
      mk('path',Object.assign({d:'M'+(x1-(bb-aa>0?1:-1)*0)+','+y1,fill:'none'},L));
      const mx=O.x+(r+7)*Math.cos(aa+dd/2),my=O.y+(r+7)*Math.sin(aa+dd/2);
      const t=mk('text',Object.assign({x:mx,y:my+2,'text-anchor':'middle'},T));
      t.textContent=mepFmtNum(val,1)+'°';
      return;
    }
    /* linear (len / dist) */
    const dx=w.b.x-w.a.x,dy=w.b.y-w.a.y;
    const L2=Math.hypot(dx,dy)||1;
    const nx=-dy/L2*(d.off||8),ny=dx/L2*(d.off||8);
    const a1={x:w.a.x+nx,y:w.a.y+ny},b1={x:w.b.x+nx,y:w.b.y+ny};
    // rappels
    mk('line',Object.assign({x1:w.a.x,y1:w.a.y,x2:a1.x+(dx/L2)*3,y2:a1.y+(dy/L2)*3},L));
    mk('line',Object.assign({x1:w.b.x,y1:w.b.y,x2:b1.x-(dx/L2)*3,y2:b1.y-(dy/L2)*3},L));
    // ligne de cote fléchée
    mk('line',Object.assign({x1:a1.x,y1:a1.y,x2:b1.x,y2:b1.y,'marker-start':'url(#mepArrS)','marker-end':'url(#mepArr)'},L));
    const mx=(a1.x+b1.x)/2,my=(a1.y+b1.y)/2;
    const ang=Math.atan2(dy,dx)*180/Math.PI;
    const flip=ang>90||ang<-90;
    const t=mk('text',Object.assign({x:mx,y:my-2,'text-anchor':'middle',
      transform:flip?'rotate('+(ang+180)+' '+mx+' '+my+')':'rotate('+ang+' '+mx+' '+my+')'},T));
    t.textContent=d.ref?'('+mepFmtNum(val,2)+')':txt;
  }
  /* ═══════════════ P. mini-solveur LM autonome (pas de lien skEdit) ═══════════════
     Points variables (x,y) ; contraintes résiduelles + jacobien numérique.
     Assez pour ligne/rect/cercle/arc + horiz/vert/paral/perp/égale/distance/rayon/angle. */
  function mepSkNew(){return{pts:{},ents:[],cons:[],seq:1};}
  function mepSkPid(sk){return 'p'+(sk.seq++);}
  function mepSkPt(sk,x,y){
    const id=mepSkPid(sk);
    sk.pts[id]={x:+x,y:+y};
    return id;
  }
  function mepSkEnt(sk,e){
    e.id='e'+(sk.seq++);
    sk.ents.push(e);
    return e;
  }
  function mepSkCons(sk,c){
    c.id='c'+(sk.seq++);
    sk.cons.push(c);
    return c;
  }
  function mepSkRmEnt(sk,eid){
    const e=sk.ents.find(x=>x.id===eid);if(!e)return;
    sk.ents=sk.ents.filter(x=>x.id!==eid);
    const used=new Set();
    sk.ents.forEach(x=>{if(x.p1)used.add(x.p1);if(x.p2)used.add(x.p2);if(x.pc)used.add(x.pc);});
    Object.keys(sk.pts).forEach(pid=>{if(!used.has(pid))delete sk.pts[pid];});
    sk.cons=sk.cons.filter(c=>{
      if(c.ent===eid||c.a===eid||c.b===eid)return false;
      if(c.p&&!sk.pts[c.p])return false;
      if(c.a&&c.b&&!sk.pts[c.a]&&!sk.pts[c.b]&&!sk.ents.some(x=>x.id===c.a)&&!sk.ents.some(x=>x.id===c.b))return false;
      return true;
    });
  }
  /* résidus : r(c)→[num] ; on minimise Σ r² par Gauss-Newton (jacobien numérique) */
  function mepSkResidual(sk,c){
    const P=sk.pts;
    const pt=id=>P[id];
    const ent=id=>sk.ents.find(x=>x.id===id);
    try{
      switch(c.type){
        case 'coincident':{
          const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];
          return[a.x-b.x,a.y-b.y];
        }
        case 'horizontal':{
          const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];
          return[a.y-b.y];
        }
        case 'vertical':{
          const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];
          return[a.x-b.x];
        }
        case 'parallel':{
          const A=ent(c.a),B=ent(c.b);if(!A||!B)return[];
          const a1=pt(A.p1),a2=pt(A.p2),b1=pt(B.p1),b2=pt(B.p2);
          if(!a1||!a2||!b1||!b2)return[];
          const d1x=a2.x-a1.x,d1y=a2.y-a1.y,d2x=b2.x-b1.x,d2y=b2.y-b1.y;
          return[d1x*d2y-d1y*d2x];
        }
        case 'perp':{
          const A=ent(c.a),B=ent(c.b);if(!A||!B)return[];
          const a1=pt(A.p1),a2=pt(A.p2),b1=pt(B.p1),b2=pt(B.p2);
          if(!a1||!a2||!b1||!b2)return[];
          return[(a2.x-a1.x)*(b2.x-b1.x)+(a2.y-a1.y)*(b2.y-b1.y)];
        }
        case 'tangent':{
          const L=ent(c.a),C=ent(c.b);
          if(L&&C&&L.t==='line'&&C.t==='circle'){
            const a=pt(L.p1),b=pt(L.p2),cc=pt(C.pc);
            if(!a||!b||!cc)return[];
            const dx=b.x-a.x,dy=b.y-a.y,L2=Math.hypot(dx,dy)||1;
            return[Math.abs((cc.x-a.x)*dy-(cc.y-a.y)*dx)/L2-C.r];
          }
          if(C&&L&&C.t==='line'&&L.t==='circle'){
            const t=c.a;c.a=c.b;c.b=t;
            return mepSkResidual(sk,c);
          }
          return[];
        }
        case 'equal':{
          const A=ent(c.a),B=ent(c.b);if(!A||!B)return[];
          const la=mepSkLen(A),lb=mepSkLen(B);
          if(la==null||lb==null)return[];
          return[la-lb];
        }
        case 'dist':{
          const a=pt(c.a),b=pt(c.b);if(!a||!b)return[];
          return[Math.hypot(b.x-a.x,b.y-a.y)-(c.val||0)];
        }
        case 'radius':{
          const C=ent(c.a);if(!C||C.t!=='circle')return[];
          return[C.r-(c.val||0)];
        }
        case 'angle':{
          const A=ent(c.a),B=ent(c.b);if(!A||!B)return[];
          const a1=pt(A.p1),a2=pt(A.p2),b1=pt(B.p1),b2=pt(B.p2);
          if(!a1||!a2||!b1||!b2)return[];
          const a=Math.atan2(a2.y-a1.y,a2.x-a1.x),b=Math.atan2(b2.y-b1.y,b2.x-b1.x);
          let d=b-a;
          while(d<=-Math.PI)d+=2*Math.PI;
          while(d>Math.PI)d-=2*Math.PI;
          return[d-(c.val||0)];
        }
        case 'onLine':{
          const p=pt(c.p),L=ent(c.ent);if(!p||!L||L.t!=='line')return[];
          const a=pt(L.p1),b=pt(L.p2);if(!a||!b)return[];
          const dx=b.x-a.x,dy=b.y-a.y,L2=Math.hypot(dx,dy)||1;
          return[((p.x-a.x)*dy-(p.y-a.y)*dx)/L2];
        }
        case 'onCircle':{
          const p=pt(c.p),C=ent(c.ent);if(!p||!C||C.t!=='circle')return[];
          const cc=pt(C.pc);if(!cc)return[];
          return[Math.hypot(p.x-cc.x,p.y-cc.y)-C.r];
        }
        case 'midpoint':{
          const m=pt(c.p),a=pt(c.a),b=pt(c.b);if(!m||!a||!b)return[];
          return[m.x-(a.x+b.x)/2,m.y-(a.y+b.y)/2];
        }
        default:return[];
      }
    }catch(e){return[];}
  }
  function mepSkLen(E){
    if(!E)return null;
    if(E.t==='line'){
      const A=mepSkPtOf(E,'p1'),B=mepSkPtOf(E,'p2');
      if(!A||!B)return null;
      return Math.hypot(B.x-A.x,B.y-A.y);
    }
    if(E.t==='circle')return 2*Math.PI*E.r;
    if(E.t==='arc')return null;
    return null;
  }
  /* points d'une entité via closure sur sk (set par mepSkSolve) */
  let _mepSkCur=null;
  function mepSkPtOf(E,k){const sk=_mepSkCur;return sk&&E[k]?sk.pts[E[k]]:null;}
  function mepVars(sk){
    // variables = points (x,y) + rayons des cercles/arcs
    const vars=[];
    Object.keys(sk.pts).forEach(pid=>{
      vars.push({get:()=>sk.pts[pid].x,set:v=>{sk.pts[pid].x=v;}});
      vars.push({get:()=>sk.pts[pid].y,set:v=>{sk.pts[pid].y=v;}});
    });
    sk.ents.forEach(e=>{
      if(e.t==='circle'||e.t==='arc')vars.push({get:()=>e.r,set:v=>{e.r=Math.max(0.01,v);}});
    });
    return vars;
  }
  function mepSkSolve(sk,iters){
    if(!sk||!sk.ents.length&&!sk.cons.length)return;
    _mepSkCur=sk;
    iters=iters||40;
    const vars=mepVars(sk);
    const n=vars.length;if(!n)return;
    for(let it=0;it<iters;it++){
      // collecte résidus actifs
      const rows=[];
      sk.cons.forEach(c=>{
        const r=mepSkResidual(sk,c);
        r.forEach(v=>{if(isFinite(v))rows.push({c,v});});
      });
      if(!rows.length)break;
      // jacobien numérique + GN step
      const m=rows.length;
      const J=new Float64Array(m*n);
      const R=new Float64Array(m);
      rows.forEach((row,i)=>{R[i]=row.v;});
      const eps=1e-4;
      for(let j=0;j<n;j++){
        const x0=vars[j].get();
        vars[j].set(x0+eps);
        sk.cons.forEach(()=>{}); // recalc ci-dessous
        let k=0;
        for(let ri=0;ri<sk.cons.length;ri++){
          const r=mepSkResidual(sk,sk.cons[ri]);
          for(let q=0;q<r.length;q++){
            if(k>=m)break;
            if(isFinite(r[q]))J[k*n+j]=(r[q]-R[k])/eps;
            k++;
          }
        }
        vars[j].set(x0);
      }
      // (JtJ + λI) δ = -JtR  — λ léger pour stabilité
      const A=[];
      for(let i=0;i<n;i++)A.push(new Float64Array(n+1));
      const lam=1e-3;
      for(let i=0;i<n;i++){
        for(let j=0;j<n;j++){
          let s=0;
          for(let k=0;k<m;k++)s+=J[k*n+i]*J[k*n+j];
          A[i][j]=s+(i===j?lam:0);
        }
        let s=0;
        for(let k=0;k<m;k++)s+=J[k*n+i]*R[k];
        A[i][n]=-s;
      }
      // élimination de Gauss
      let ok=true;
      for(let col=0;col<n;col++){
        let piv=col;
        for(let r2=col+1;r2<n;r2++)if(Math.abs(A[r2][col])>Math.abs(A[piv][col]))piv=r2;
        if(Math.abs(A[piv][col])<1e-12){ok=false;break;}
        if(piv!==col){const t=A[piv];A[piv]=A[col];A[col]=t;}
        for(let r2=col+1;r2<n;r2++){
          const f=A[r2][col]/A[col][col];
          if(!f)continue;
          for(let c2=col;c2<=n;c2++)A[r2][c2]-=f*A[col][c2];
        }
      }
      if(!ok)break;
      const dx=new Float64Array(n);
      for(let i=n-1;i>=0;i--){
        let s=A[i][n];
        for(let j=i+1;j<n;j++)s-=A[i][j]*dx[j];
        dx[i]=s/A[i][i];
      }
      let moved=0;
      for(let j=0;j<n;j++){vars[j].set(vars[j].get()+dx[j]);moved+=Math.abs(dx[j]);}
      if(moved<1e-6)break;
    }
    _mepSkCur=null;
  }
  /* ═══════════════ Q. esquisse de planche : outils de dessin ═══════════════ */
  function mepSkEnsure(sh){
    if(!sh.sk)sh.sk=mepSkNew();
    if(!sh.sk.pts)sh.sk.pts={};
    if(!sh.sk.ents)sh.sk.ents=[];
    if(!sh.sk.cons)sh.sk.cons=[];
    if(!sh.sk.seq)sh.sk.seq=1;
    return sh.sk;
  }
  /* snap sur géométrie projetée (toutes vues) + points d'esquisse */
  function mepSnapPt(sx,sy,sh){
    sh=sh||mepSheet();
    const tol=6/mepSt.zoom; // 6 mm papier écran
    let best={x:sx,y:sy,hit:null};
    let bd=tol;
    const consider=(x,y,hit)=>{
      const d=Math.hypot(x-sx,y-sy);
      if(d<bd){bd=d;best={x,y,hit};}
    };
    sh.views.forEach(v=>{
      const g=mepGeoOf(v);
      g.els.forEach((e,i)=>{
        if(e.t==='L'){
          consider(v.x+e.x1*v.scale,v.y+e.y1*v.scale,{t:'end',vid:v.id,i});
          consider(v.x+e.x2*v.scale,v.y+e.y2*v.scale,{t:'end',vid:v.id,i});
          // milieu de segment
          consider(v.x+(e.x1+e.x2)/2*v.scale,v.y+(e.y1+e.y2)/2*v.scale,{t:'mid',vid:v.id,i});
          // projection sur le segment
          const ax=v.x+e.x1*v.scale,ay=v.y+e.y1*v.scale,bx=v.x+e.x2*v.scale,by=v.y+e.y2*v.scale;
          const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
          if(L2>1e-12){
            const t=Math.max(0,Math.min(1,((sx-ax)*dx+(sy-ay)*dy)/L2));
            consider(ax+dx*t,ay+dy*t,{t:'onSeg',vid:v.id,i});
          }
        }else if(e.t==='C'||e.t==='A'){
          const cx=v.x+e.cx*v.scale,cy=v.y+e.cy*v.scale,r=e.r*v.scale;
          if(e.t==='C'){
            consider(cx,cy,{t:'ctr',vid:v.id,i});
            const a=Math.atan2(sy-cy,sx-cx);
            consider(cx+r*Math.cos(a),cy+r*Math.sin(a),{t:'onC',vid:v.id,i});
          }else{
            consider(cx,cy,{t:'ctr',vid:v.id,i});
            const a=Math.atan2(sy-cy,sx-cx);
            // borne l'angle à l'arc : projection sur l'arc sinon extrémité la plus proche
            let aa=a;
            const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
            let an=a;
            while(an<lo)an+=2*Math.PI;
            if(an>hi){
              const d0=Math.abs(a-e.a0),d1=Math.abs(a-e.a1);
              aa=d0<d1?e.a0:e.a1;
            }else aa=an;
            consider(cx+r*Math.cos(aa),cy+r*Math.sin(aa),{t:'onC',vid:v.id,i});
          }
        }
      });
    });
    // points d'esquisse
    const sk=sh.sk;
    if(sk)Object.keys(sk.pts).forEach(pid=>{
      const p=sk.pts[pid];
      consider(vxOf(p),vyOf(p),{t:'skPt',pid});
    });
    function vxOf(p){return p.x;} // pts déjà en mm papier
    function vyOf(p){return p.y;}
    return best;
  }
  /* mm papier → coordonnées locales d'une vue (pour création de cote) */
  function mepHitViewEnt(sh,sx,sy){
    // → {vid,i,e,lx,ly} entité projetée la plus proche
    let best=null,bd=4/mepSt.zoom;
    sh.views.forEach(v=>{
      const g=mepGeoOf(v);
      g.els.forEach((e,i)=>{
        const lx=(sx-v.x)/v.scale,ly=(sy-v.y)/v.scale;
        if(e.t==='L'){
          const ax=e.x1,ay=e.y1,bx=e.x2,by=e.y2;
          const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
          let d;
          if(L2<1e-12)d=Math.hypot(lx-ax,ly-ay);
          else{
            const t=Math.max(0,Math.min(1,((lx-ax)*dx+(ly-ay)*dy)/L2));
            d=Math.hypot(lx-(ax+dx*t),ly-(ay+dy*t));
          }
          const dp=d*v.scale;
          if(dp<bd){bd=dp;best={vid:v.id,i,e,lx,ly};}
        }else if(e.t==='C'||e.t==='A'){
          let d;
          if(e.t==='C')d=Math.abs(Math.hypot(lx-e.cx,ly-e.cy)-e.r)*v.scale;
          else{
            const dx=lx-e.cx,dy=ly-e.cy,dh=Math.hypot(dx,dy);
            const a=Math.atan2(dy,dx);
            const lo=Math.min(e.a0,e.a1),hi=Math.max(e.a0,e.a1);
            let an=a;while(an<lo)an+=2*Math.PI;
            if(dh<1e-9||an>hi){
              // hors plage angulaire : distance à l'extrémité la plus proche
              const p0=[e.cx+e.r*Math.cos(e.a0),e.cy+e.r*Math.sin(e.a0)],p1=[e.cx+e.r*Math.cos(e.a1),e.cy+e.r*Math.sin(e.a1)];
              d=Math.min(Math.hypot(lx-p0[0],ly-p0[1]),Math.hypot(lx-p1[0],ly-p1[1]))*v.scale;
            }else d=Math.abs(dh-e.r)*v.scale;
          }
          if(d<bd){bd=d;best={vid:v.id,i,e,lx,ly};}
        }
      });
    });
    return best;
  }
  /* ═══════════════ R. dessin 2D (esquisse de planche) ═══════════════ */
  function mepSkAddLine(sh,x1,y1,x2,y2){
    const sk=mepSkEnsure(sh);
    const a=mepSkPt(sk,x1,y1),b=mepSkPt(sk,x2,y2);
    mepSkEnt(sk,{t:'line',p1:a,p2:b});
  }
  function mepSkAddRect(sh,x1,y1,x2,y2){
    const sk=mepSkEnsure(sh);
    const a=mepSkPt(sk,x1,y1),b=mepSkPt(sk,x2,y1),c=mepSkPt(sk,x2,y2),d=mepSkPt(sk,x1,y2);
    const e1=mepSkEnt(sk,{t:'line',p1:a,p2:b});
    const e2=mepSkEnt(sk,{t:'line',p1:b,p2:c});
    const e3=mepSkEnt(sk,{t:'line',p1:c,p2:d});
    const e4=mepSkEnt(sk,{t:'line',p1:d,p2:a});
    mepSkCons(sk,{type:'horizontal',a,b});
    mepSkCons(sk,{type:'vertical',a,d});
    mepSkCons(sk,{type:'horizontal',c,d});
    mepSkCons(sk,{type:'vertical',b,c});
    mepSkSolve(sk,20);
  }
  function mepSkAddCircle(sh,cx,cy,r){
    const sk=mepSkEnsure(sh);
    const c=mepSkPt(sk,cx,cy);
    mepSkEnt(sk,{t:'circle',pc:c,r:Math.max(0.1,r)});
  }
  function mepSkAddArc(sh,cx,cy,r,a0,a1){
    const sk=mepSkEnsure(sh);
    const c=mepSkPt(sk,cx,cy);
    const p1=mepSkPt(sk,cx+r*Math.cos(a0),cy+r*Math.sin(a0));
    const p2=mepSkPt(sk,cx+r*Math.cos(a1),cy+r*Math.sin(a1));
    mepSkEnt(sk,{t:'arc',pc:c,p1,p2,r:Math.max(0.1,r),a0,a1});
  }
  function mepSkAddPt(sh,x,y){
    const sk=mepSkEnsure(sh);
    mepSkPt(sk,x,y);
  }
  /* ajuster (trim) : retire le tronçon entre 2 intersections */
  function mepSkTrim(sh,sx,sy){
    const sk=mepSkEnsure(sh);
    const hit=mepHitViewEnt(sh,sx,sy); // non : chercher dans l'esquisse
    // chercher segment d'esquisse
    let best=null,bd=4/mepSt.zoom;
    sk.ents.forEach(e=>{
      if(e.t!=='line')return;
      const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;
      const dx=B.x-A.x,dy=B.y-A.y,L2=dx*dx+dy*dy;
      if(L2<1e-12)return;
      const t=Math.max(0,Math.min(1,((sx-A.x)*dx+(sy-A.y)*dy)/L2));
      const px=A.x+dx*t,py=A.y+dy*t;
      const d=Math.hypot(sx-px,sy-py);
      if(d<bd){bd=d;best={e,t,A,B};}
    });
    if(!best)return false;
    const{e,t,A,B}=best;
    // intersections avec les autres entités
    const xs=[];
    sk.ents.forEach(o=>{
      if(o===e)return;
      if(o.t==='line'){
        const C=sk.pts[o.p1],D=sk.pts[o.p2];if(!C||!D)return;
        const ip=(typeof interLineLine==='function')?interLineLine(A,B,C,D):null;
        if(ip&&ip.t>0.001&&ip.t<0.999)xs.push(ip.t);
      }else if(o.t==='circle'){
        const cc=sk.pts[o.pc];if(!cc)return;
        const pts=(typeof interLineCircle==='function')?interLineCircle(A,B,cc,o.r):[];
        pts.forEach(p=>{if(p.t>0.001&&p.t<0.999)xs.push(p.t);});
      }
    });
    xs.sort((a,b)=>a-b);
    if(xs.length<2){mepStatus('Ajuster : aucune intersection de part et d’autre du tronçon.');return false;}
    // tronçon cliqué = entre les 2 intersections bornant t
    let lo=-0.01,hi=1.01;
    xs.forEach(v=>{if(v<t)lo=Math.max(lo,v);else hi=Math.min(hi,v);});
    if(hi-lo<1e-4)return false;
    // remplace la ligne par 2 sous-lignes
    const mk=(t0,t1)=>{
      if(t1-t0<1e-4)return;
      const x1=A.x+(B.x-A.x)*t0,y1=A.y+(B.y-A.y)*t0;
      const x2=A.x+(B.x-A.x)*t1,y2=A.y+(B.y-A.y)*t1;
      const pa=mepSkPt(sk,x1,y1),pb=mepSkPt(sk,x2,y2);
      mepSkEnt(sk,{t:'line',p1:pa,p2:pb});
    };
    mk(0,lo);mk(hi,1);
    mepSkRmEnt(sk,e.id);
    return true;
  }
  /* ═══════════════ S. rendu esquisse + brouillons ═══════════════ */
  function mepDrawSk(mk,sh){
    const sk=sh.sk;if(!sk)return;
    const drawEnt=(e,col,w)=>{
      const cls='mepEnt '+(col||'mepSharp');
      const st=col==='mepSkFree'?COL.skFree:COL.skFull;
      const attr={class:cls,stroke:st,'stroke-width':w||0.9};
      if(e.t==='line'){
        const A=sk.pts[e.p1],B=sk.pts[e.p2];if(!A||!B)return;
        mk('line',Object.assign({x1:A.x,y1:A.y,x2:B.x,y2:B.y},attr));
      }else if(e.t==='circle'){
        const C=sk.pts[e.pc];if(!C)return;
        mk('circle',Object.assign({cx:C.x,cy:C.y,r:e.r},attr));
      }else if(e.t==='arc'){
        const C=sk.pts[e.pc],P1=sk.pts[e.p1],P2=sk.pts[e.p2];
        if(!C||!P1||!P2)return;
        const a0=Math.atan2(P1.y-C.y,P1.x-C.x),a1=Math.atan2(P2.y-C.y,P2.x-C.x);
        let da=a1-a0;
        while(da<=0)da+=2*Math.PI;
        const large=da>Math.PI?1:0;
        const x1=C.x+e.r*Math.cos(a0),y1=C.y+e.r*Math.sin(a0);
        const x2=C.x+e.r*Math.cos(a1),y2=C.y+e.r*Math.sin(a1);
        mk('path',Object.assign({d:'M'+x1+','+y1+' A'+e.r+','+e.r+' 0 '+large+' 1 '+x2+','+y2,fill:'none'},attr));
      }
    };
    sk.ents.forEach(e=>drawEnt(e,'mepSkFull',1));
    // points
    Object.keys(sk.pts).forEach(pid=>{
      const p=sk.pts[pid];
      const sel=mepSt.skSel&&mepSt.skSel.has(pid);
      mk('circle',{cx:p.x,cy:p.y,r:sel?2.2:1.4,class:'mepSkPt',stroke:sel?COL.sel:'#64d2ff',fill:'#fff'});
    });
  }
  function mepDrawDraft(mk){
    const P=mepSt.pick;
    if(!P)return;
    const dashed={class:'mepDraft'};
    if(P.kind==='viewDrag'){
      // rien de spécial (la vue suit déjà)
    }else if(P.kind==='line'||P.kind==='rect'){
      const s=P.start,c=P.cur;
      if(P.kind==='line')mk('line',Object.assign({x1:s.x,y1:s.y,x2:c.x,y2:c.y},dashed));
      else mk('rect',Object.assign({x:Math.min(s.x,c.x),y:Math.min(s.y,c.y),width:Math.abs(c.x-s.x),height:Math.abs(c.y-s.y)},dashed));
    }else if(P.kind==='circle'){
      const r=Math.hypot(P.cur.x-P.start.x,P.cur.y-P.start.y);
      mk('circle',Object.assign({cx:P.start.x,cy:P.start.y,r},dashed));
    }else if(P.kind==='arc'){
      mk('circle',Object.assign({cx:P.start.x,cy:P.start.y,r:P.r||0},dashed));
    }else if(P.kind==='cut2'&&P.pts&&P.pts.length){
      const pts=P.pts.concat([P.cur]).filter(Boolean);
      if(pts.length>=2)mk('line',Object.assign({x1:pts[0].x,y1:pts[0].y,x2:pts[pts.length-1].x,y2:pts[pts.length-1].y,class:'mepCut','stroke-dasharray':'6 2'}));
    }else if(P.kind==='det2'){
      if(P.cur&&P.start)mk('circle',Object.assign({cx:P.start.x,cy:P.start.y,r:Math.hypot(P.cur.x-P.start.x,P.cur.y-P.start.y),class:'mepEnt mepSel','stroke-dasharray':'3 2'}));
    }else if(P.kind==='dim'){
      // rappel visuel entre les 2 points
      const a=P.a,b=P.cur;
      if(a&&b)mk('line',Object.assign({x1:a.x,y1:a.y,x2:b.x,y2:b.y},dashed));
    }
  }
  /* ═══════════════ T. interactions souris ═══════════════ */
  function mepSetTool(t){
    mepSt.tool=t||'select';
    mepSt.pick=null;mepSt.dim=null;mepSt.cutPts=[];mepSt.detC=null;mepSt.skSel=new Set();
    mepToolSync();
    const msg={
      select:'Sélection : clic = vue / cote · glisser = déplacer · Suppr = effacer',
      line:'Ligne : cliquez le départ, puis l’arrivée (snap auto). Échap pour annuler.',
      rect:'Rectangle : clic 1 = coin, clic 2 = opposé.',
      circle:'Cercle : centre + un point du rayon.',
      arc:'Arc 3 points : centre, départ, arrivée.',
      point:'Point : cliquez pour placer.',
      trim:'Ajuster : cliquez le tronçon à couper entre 2 intersections.',
      dim:'Cote : clic sur cercle = Ø · segment = longueur · 2 points = distance · Ctrl+2 segments = angle · R+ cercle = rayon',
      cut2:'Coupe : 2 clics sur la ligne de coupe.',
      det2:'Détail : centre + rayon.'
    }[t]||'';
    if(msg)mepStatus(msg);
  }
  function mepToolSync(){/* plus de barre d'outils interne — le panneau latéral gère l'outil actif */}
  function mepOnDown(ev){
    if(ev.button===1||(ev.button===0&&ev.altKey)){ // middle / alt = pan
      mepSt.pick={kind:'pan',sx:ev.clientX,sy:ev.clientY,px:mepSt.pan.x,py:mepSt.pan.y};
      mepSvgEl.setPointerCapture(ev.pointerId);
      ev.preventDefault();
      return;
    }
    if(ev.button!==0)return;
    mepSvgEl.setPointerCapture(ev.pointerId);
    const P=mepPt(ev);
    const sh=mepSheet();
    const tool=mepSt.tool;
    if(tool==='select'){
      // cote ?
      const dim=mepDimAt(sh,P.x,P.y);
      if(dim){mepSt.selDim=dim.id;mepSt.sel=null;mepSideShow();mepRender();return;}
      const v=mepViewAt(sh,P.x,P.y);
      if(v){
        mepSt.sel=v.id;mepSt.selDim=null;
        mepSt.pick={kind:'viewDrag',vid:v.id,ox:P.x-v.x,oy:P.y-v.y,moved:false};
        mepSideShow();mepRender();
      }else{
        mepSt.sel=null;mepSt.selDim=null;mepSideShow();mepRender();
      }
      return;
    }
    if(tool==='cut2'){
      const v=mepViewAt(sh,P.x,P.y);
      if(!v){mepStatus('Coupe : cliquez sur la vue parente.');return;}
      const lx=(P.x-v.x)/v.scale,ly=(P.y-v.y)/v.scale;
      mepSt.cutPts.push({x:lx,y:ly,vid:v.id});
      if(mepSt.cutPts.length===1){mepStatus('Coupe : 2ᵉ point de la ligne de coupe.');return;}
      const A=mepSt.cutPts[0],B=mepSt.cutPts[1];
      const par=mepView(sh,A.vid);
      if(!par){mepSt.cutPts=[];return;}
      mepSt.tool='select';mepSt.cutPts=[];
      mepSectionFromPicks(par,A,B);
      mepToolSync();
      return;
    }
    if(tool==='det2'){
      const v=mepViewAt(sh,P.x,P.y);
      if(!v){mepStatus('Détail : cliquez sur la vue parente.');return;}
      const lx=(P.x-v.x)/v.scale,ly=(P.y-v.y)/v.scale;
      if(!mepSt.detC){
        mepSt.detC={x:lx,y:ly,vid:v.id};
        mepStatus('Détail : cliquez un 2ᵉ point pour le rayon.');
        return;
      }
      const C=mepSt.detC;
      const par=mepView(sh,C.vid);
      const R=Math.hypot(lx-C.x,ly-C.y);
      mepSt.detC=null;mepSt.tool='select';
      if(par&&R>0.5)mepDetailFromPicks(par,C,R);
      else mepStatus('Détail : rayon trop petit.');
      mepToolSync();
      return;
    }
    if(tool==='dim'){
      mepDimClick(sh,P,ev.ctrlKey||ev.metaKey,ev.shiftKey,ev.altKey);
      return;
    }
    /* outils de dessin 2D */
    const snap=mepSnapPt(P.x,P.y,sh);
    const pt={x:snap.x,y:snap.y,snap:snap.hit};
    if(tool==='line'||tool==='rect'||tool==='circle'||tool==='arc'){
      if(!mepSt.pick||!mepSt.pick.start){
        mepSt.pick={kind:tool,start:pt,cur:pt,pts:[pt]};
      }else{
        // 2ᵉ (ou 3ᵉ) clic
        const P0=mepSt.pick;
        mepEdit('dessin '+tool,()=>{
          if(tool==='line')mepSkAddLine(sh,P0.start.x,P0.start.y,pt.x,pt.y);
          else if(tool==='rect')mepSkAddRect(sh,P0.start.x,P0.start.y,pt.x,pt.y);
          else if(tool==='circle'){
            const r=Math.hypot(pt.x-P0.start.x,pt.y-P0.start.y);
            mepSkAddCircle(sh,P0.start.x,P0.start.y,r);
          }else if(tool==='arc'){
            // arc 3 points : centre + départ + arrivée
            P0.pts.push(pt);
            if(P0.pts.length>=3){
              const[C,A,B]=P0.pts;
              const r=Math.hypot(A.x-C.x,A.y-C.y);
              mepSkAddArc(sh,C.x,C.y,r,Math.atan2(A.y-C.y,A.x-C.x),Math.atan2(B.y-C.y,B.x-C.x));
            }else return; // attend le 3ᵉ
          }
        });
        mepSt.pick=null; // on reste dans l'outil pour enchaîner
        mepStatus('Dessin OK — un nouveau clic redémarre.');
      }
      return;
    }
    if(tool==='point'){
      mepEdit('point',()=>mepSkAddPt(sh,pt.x,pt.y));
      return;
    }
    if(tool==='trim'){
      mepEdit('ajuster',()=>{mepSkTrim(sh,P.x,P.y);});
      return;
    }
  }
  function mepOnMove(ev){
    const P=mepPt(ev);
    const sh=mepSheet();
    const pk=mepSt.pick;
    if(pk){
      if(pk.kind==='pan'){
        mepSt.pan.x=pk.px-(ev.clientX-pk.sx)*mepPxToMm();
        mepSt.pan.y=pk.py-(ev.clientY-pk.sy)*mepPxToMm();
        mepRender();
        return;
      }
      if(pk.kind==='viewDrag'){
        const v=mepView(sh,pk.vid);
        if(v){
          let nx=P.x-pk.ox,ny=P.y-pk.oy;
          if(v.kind==='proj'){
            // vue projetée : glissement contraint sur l'axe libre ; l'axe commun reste verrouillé sur la mère
            const par=mepView(sh,v.parent);
            const axis=(MEP_PROJ[v.proj||'']||{}).axis||'x';
            if(par){
              if(axis==='x')ny=par.y; // côté gauche/droit : hauteur = mère, x libre
              else nx=par.x;          // dessus/dessous : x = mère, distance libre
            }
          }
          const dx=nx-v.x,dy=ny-v.y;
          v.x=nx;v.y=ny;pk.moved=true;
          if(dx||dy)mepProjFollow(sh,v,dx,dy);
          mepRender();
        }
        return;
      }
      if(pk.start!==undefined||pk.kind==='cut2'||pk.kind==='det2'){
        const snap=mepSnapPt(P.x,P.y,sh);
        pk.cur={x:snap.x,y:snap.y,snap:snap.hit};
        mepRender();
        return;
      }
    }
    if(mepSt.tool==='dim'&&mepSt.dim&&mepSt.dim.a){
      mepSt.dim.cur=P;
      mepRender();
      return;
    }
    // survol vue (feedback)
    const v=mepViewAt(sh,P.x,P.y);
    const id=v?v.id:null;
    if(id!==mepSt.hovView){mepSt.hovView=id;try{mepRender();}catch(e){}}
  }
  function mepOnUp(ev){
    const pk=mepSt.pick;
    if(!pk)return;
    if(pk.kind==='viewDrag'){
      if(pk.moved){
        const v=mepView(mepSheet(),pk.vid);
        if(v)mepEdit('déplacement vue',()=>{}); // position déjà mutée ; push undo avec état courant
      }
      mepSt.pick=null;
      return;
    }
    if(pk.kind==='pan'){mepSt.pick=null;return;}
    mepSt.pick=null;
  }
  function mepOnWheel(ev){
    ev.preventDefault();
    const P=mepPt(ev);
    // sens de la molette inversable (paramètre Vue) : deltaY<0 (molette vers le haut)
    // = zoom avant par défaut ; zoomRev intervertit avant/arrière.
    const up=ev.deltaY<0;
    const k=(mepSt.zoomRev?!up:up)?1.12:1/1.12;
    const z0=mepSt.zoom;
    const z1=Math.min(20,Math.max(0.08,z0*k));
    if(z1===z0)return;
    // zoom autour du pointeur : le point P reste fixe à l'écran
    const vb=mepSvgViewBox();
    const ratio=z1/z0;
    mepSt.pan.x=P.x-(P.x-mepSt.pan.x)/ratio;
    mepSt.pan.y=P.y-(P.y-mepSt.pan.y)/ratio;
    mepSt.zoom=z1;
    mepRender();
  }
  function mepOnDbl(ev){
    const P=mepPt(ev);
    const sh=mepSheet();
    // double-clic sur étiquette de vue → renommer
    const v=mepViewAt(sh,P.x,P.y);
    if(v){
      const n=prompt('Libellé de la vue :',v.label||'');
      if(n!==null){mepEdit('libellé vue',()=>{v.label=n;});}
      return;
    }
    const d=mepDimAt(sh,P.x,P.y);
    if(d){
      const t=prompt('Texte de cote (vide = calculé) :',d.txt||'');
      if(t!==null){mepEdit('texte cote',()=>{d.txt=t||undefined;});}
      return;
    }
  }
  function mepOnKey(ev){
    if(!mepSt.open)return;
    const t=ev.target;
    if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    const k=ev.key;
    if(k==='Escape'){
      if(mepSt.pick||mepSt.tool!=='select'||mepSt.dim||mepSt.cutPts.length||mepSt.detC){
        mepSt.pick=null;mepSt.dim=null;mepSt.cutPts=[];mepSt.detC=null;
        mepSetTool('select');
        ev.preventDefault();ev.stopPropagation();
      }
      return;
    }
    if(k==='Delete'||k==='Backspace'){
      const sh=mepSheet();
      if(mepSt.selDim){
        mepEdit('suppression cote',()=>{sh.dims=sh.dims.filter(d=>d.id!==mepSt.selDim);mepSt.selDim=null;});
        mepSideShow();
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      if(mepSt.sel){
        mepDelView(mepSt.sel);
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      // esquisse
      if(mepSt.tool==='select'&&sh.sk&&mepSt.skSel.size){
        mepEdit('suppression esquisse',()=>{
          Array.from(mepSt.skSel).forEach(eid=>mepSkRmEnt(sh.sk,eid));
          mepSt.skSel=new Set();
        });
        ev.preventDefault();ev.stopPropagation();
      }
      return;
    }
    const ctrl=ev.ctrlKey||ev.metaKey;
    if(ctrl&&!ev.altKey){
      const kk=k.toLowerCase();
      if(kk==='z'&&!ev.shiftKey){if(typeof docUndo==='function')docUndo();ev.preventDefault();ev.stopPropagation();return;}
      if(kk==='y'||(kk==='z'&&ev.shiftKey)){if(typeof docRedo==='function')docRedo();ev.preventDefault();ev.stopPropagation();return;}
      return; // ne pas voler le reste
    }
    if(k==='F'){try{mepFitSheet();mepRender();}catch(e){}}
    if(k==='v'||k==='V')mepSetTool('select');
    if(k==='l'||k==='L')mepSetTool('line');
    if(k==='r'||k==='R')mepSetTool(ev.shiftKey?'rect':'dim'); // R seul = outil cote (rayon via clic)
    if(k==='c'||k==='C')mepSetTool('circle');
    if(k==='a'||k==='A')mepSetTool('arc');
    if(k==='p'||k==='P')mepSetTool('point');
    if(k==='t'||k==='T')mepSetTool('trim');
    if(k==='d'||k==='D')mepSetTool('dim');
  }
  function mepViewAt(sh,sx,sy){
    // vue dont la bbox (papier) contient le point ; priorité à la plus « petite »
    let best=null,bw=1e18,byArea=1e18;
    sh.views.forEach(v=>{
      const bb=mepViewSheetBBox(v);if(!bb)return;
      const pad=2;
      if(sx>=bb.x-pad&&sx<=bb.x+bb.w+pad&&sy>=bb.y-pad&&sy<=bb.y+bb.h+pad){
        const area=(bb.w+pad*2)*(bb.h+pad*2);
        if(area<byArea){byArea=area;best=v;}
      }
    });
    return best;
  }
  function mepDimAt(sh,sx,sy){
    let best=null,bd=5/mepSt.zoom;
    sh.dims.forEach(d=>{
      const w=mepDimWorld(sh,d);if(!w)return;
      // approximation : distance au segment cote
      const ax=w.a.x,ay=w.a.y,bx=w.b.x,by=w.b.y;
      const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
      let px=ax,py=ay;
      if(L2>1e-12){
        const t=Math.max(0,Math.min(1,((sx-ax)*dx+(sy-ay)*dy)/L2));
        px=ax+dx*t;py=ay+dy*t;
      }
      // aussi proche du texte (milieu + offset)
      const off=(d.off||8);
      const nx=-dy/(Math.hypot(dx,dy)||1)*off,ny=dx/(Math.hypot(dx,dy)||1)*off;
      const mx=(ax+bx)/2+nx,my=(ay+by)/2+ny;
      const d1=Math.hypot(sx-px,sy-py),d2=Math.hypot(sx-mx,sy-my);
      const dd=Math.min(d1,d2);
      if(dd<bd){bd=dd;best=d;}
    });
    return best;
  }
  /* ═══════════════ U. outil cote unique ═══════════════ */
  function mepDimClick(sh,P,ctrl,shift,alt){
    const tool=mepSt.dim; // état en cours : {kind,a,vid,ent}
    if(!tool){
      // 1ᵉʳ clic : identifier la cible
      const hit=mepHitViewEnt(sh,P.x,P.y);
      if(hit&&(hit.e.t==='C'||hit.e.t==='A')){
        // cercle → Ø (ou R si Alt)
        const kind=alt?'rad':'dia';
        mepSt.dim={kind,a:{x:hit.lx,y:hit.ly,hint:{t:'ctr',i:hit.i}},vid:hit.vid,off:8};
        mepStatus(kind==='dia'?'Cote Ø : cliquez la position du texte.':'Cote R : cliquez la position du texte.');
        return;
      }
      if(hit&&hit.e.t==='L'){
        mepSt.dim={kind:'len',a:{x:hit.lx,y:hit.ly,hint:{t:'seg',i:hit.i}},vid:hit.vid,off:8,ctrl:ctrl};
        mepStatus('Longueur : cliquez la position (Ctrl = angle si 2ᵉ segment).');
        return;
      }
      // sinon : point libre (distance)
      const snap=mepSnapPt(P.x,P.y,sh);
      const v=mepViewAt(sh,snap.x,snap.y);
      const lx=v?(snap.x-v.x)/v.scale:0,ly=v?(snap.y-v.y)/v.scale:0;
      if(!v){mepStatus('Cote : cliquez une arête ou un cercle projeté.');return;}
      mepSt.dim={kind:'dist',a:{x:lx,y:ly},vid:v.id,off:8};
      mepStatus('Distance : cliquez le 2ᵉ point.');
      return;
    }
    /* 2ᵉ clic */
    const D=mepSt.dim;
    const sh2=sh;
    if(D.kind==='dist'&&!D.b){
      const snap=mepSnapPt(P.x,P.y,sh2);
      const v=mepView(sh2,D.vid);
      if(!v){mepSt.dim=null;return;}
      const lx=(snap.x-v.x)/v.scale,ly=(snap.y-v.y)/v.scale;
      D.b={x:lx,y:ly};
      D._pp=P; // position papier du 2ᵉ clic → futur placement
      mepStatus('Distance : encore un clic pour placer la cote.');
      return;
    }
    if(D.kind==='dist'&&D.b&&D._pp){
      // placement final
      const a=D.a,b=D.b,vid=D.vid;
      const off=mepDimOff(a,b,P);
      mepEdit('cote distance',()=>{
        sh2.dims.push({id:mepUid('d'),kind:'dist',vid,vid2:null,a,b,off,ref:shift,tol:null});
      });
      mepSt.dim=null;
      mepStatus('Cote posée.');
      return;
    }
    if(D.kind==='len'){
      // Ctrl + 2ᵉ segment → angle
      if(ctrl){
        const hit=mepHitViewEnt(sh2,P.x,P.y);
        if(hit&&hit.e.t==='L'){
          mepEdit('cote angle',()=>{
            sh2.dims.push({id:mepUid('d'),kind:'ang',vid:D.vid,vid2:hit.vid,
              a:D.a,b:{x:hit.lx,y:hit.ly,hint:{t:'seg',i:hit.i}},off:10,ref:shift,tol:null});
          });
          mepSt.dim=null;
          mepStatus('Cote angulaire posée.');
          return;
        }
      }
      // placement : la cote porte sur les DEUX extrémités de l'arête (point cliqué ≠ cote)
      const v=mepView(sh2,D.vid);
      if(v){
        // orienter l'offset perpendiculairement au segment
        const g=mepGeoOf(v);
        const e=g.els[D.a.hint?D.a.hint.i:null];
        let A={x:D.a.x,y:D.a.y},B={x:D.a.x,y:D.a.y};
        if(e&&e.t==='L'){A={x:e.x1,y:e.y1};B={x:e.x2,y:e.y2};}
        const ax=v.x+A.x*v.scale,ay=v.y+A.y*v.scale;
        const bx=v.x+B.x*v.scale,by=v.y+B.y*v.scale;
        const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy);
        const nx=L>1e-9?-dy/L:0,ny=L>1e-9?dx/L:-1;
        // côté du clic (signe conservé : la ligne de cote se pose du bon côté)
        const side=(P.x-ax)*nx+(P.y-ay)*ny;
        const off=(side<0?-1:1)*Math.max(6,Math.abs(side));
        mepEdit('cote longueur',()=>{
          sh2.dims.push({id:mepUid('d'),kind:'len',vid:D.vid,vid2:null,a:A,b:B,off,ref:shift,tol:null});
        });
      }
      mepSt.dim=null;
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
      mepSt.dim=null;
      mepStatus('Cote posée.');
      return;
    }
    // repli
    mepSt.dim=null;
  }
  function mepDimOff(a,b,P){
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1;
    const nx=-dy/L,ny=dx/L;
    return Math.abs((P.x-a.x)*nx+(P.y-a.y)*ny)||8;
  }
  /* ═══════════════ V. panneau propriétés ═══════════════ */
  function mepSideShow(){
    if(!mepSideEl)return;
    const sh=mepSheet();
    const v=mepSt.sel?mepView(sh,mepSt.sel):null;
    const d=mepSt.selDim?sh.dims.find(x=>x.id===mepSt.selDim):null;
    mepSideEl.classList.add('open');
    mepSideEl.innerHTML='';
    if(v)mepSideView(mepSideEl,v,sh);
    else if(d)mepSideDim(mepSideEl,d,sh);
    else mepSideHome(mepSideEl,sh);
    mepSideInject();
  }
  /* injecte #mepSide dans aside.right (Paramètres) — sinon repli sur le plan */
  let mepSideHost=null,mepSideNext=null;
  function mepSideInject(){
    try{
      const right=document.querySelector('aside.right');
      if(!right)return;
      if(mepSideEl.parentNode===right)return; // déjà injecté
      if(!mepSideHost){
        mepSideHost=document.createElement('div');
        mepSideHost.className='panel';
        mepSideHost.id='mepSidePanel';
        const ttl=document.createElement('p');
        ttl.className='panel-title';
        ttl.textContent='Paramètres — Plan';
        mepSideHost.appendChild(ttl);
      }
      mepSideNext=mepSideEl.nextSibling;
      mepSideHost.appendChild(mepSideEl);
      right.insertBefore(mepSideHost,right.firstChild);
      try{window.dispatchEvent(new Event('resize'));}catch(e){}
    }catch(e){}
  }
  function mepSideEject(){
    try{
      if(mepSideEl&&mepSideEl.parentNode!==document.getElementById('mepBody')){
        const body=document.getElementById('mepBody');
        if(body)body.appendChild(mepSideEl);
      }
      if(mepSideHost&&mepSideHost.parentNode)mepSideHost.parentNode.removeChild(mepSideHost);
      try{window.dispatchEvent(new Event('resize'));}catch(e){}
    }catch(e){}
  }
  /* panneau par défaut : création de vues + outils + planche */
  function mepSideHome(root,sh){
    const mkBtn=(lab,fn,tip)=>{
      const b=document.createElement('button');
      b.textContent=lab;if(tip)b.title=tip;
      b.onclick=e=>{e.stopPropagation();fn();};
      root.appendChild(b);
      return b;
    };
    const rowEl=()=>{const r=document.createElement('div');r.className='row';root.appendChild(r);return r;};
    const h=el=>{
      const t=document.createElement('h4');
      t.textContent=el;
      root.appendChild(t);
    };
    /* — planche — */
    h('Planche');
    let r=rowEl();
    const bFmt=mkBtn(sh.format+' ⌄',mepCycleFormat,'Format de la planche (A0…A4)');
    bFmt.style.flex='1';
    const bOri=mkBtn(sh.orient==='landscape'?'⇄':'↕',mepCycleOrient,'Portrait / paysage');
    bOri.style.flex='1';
    /* — cartouche (projet / auteur / date) — */
    const tt=sh.title||(sh.title={});
    const tit=(lab,key,ph)=>{
      const i=document.createElement('input');
      i.value=tt[key]!==undefined?tt[key]:'';i.placeholder=ph||'';
      i.onchange=()=>{mepEdit('cartouche',()=>{tt[key]=i.value;});};
      r=rowEl();
      const L=document.createElement('label');L.textContent=lab;
      r.appendChild(L);r.appendChild(i);
    };
    tit('Projet','projet','Nom du projet');
    tit('Auteur','auteur','—');
    tit('Date','date',new Date().toLocaleDateString('fr-FR'));
    /* — dessin — */
    h('Dessin 2D');
    r=rowEl();
    [['▲','select','Sélection / déplacement'],['━','line','Ligne'],['▭','rect','Rectangle'],
     ['○','circle','Cercle'],['◠','arc','Arc (3 points)'],['·','point','Point']].forEach(([lab,t,tip])=>{
      const b=mkBtn(lab,()=>mepSetTool(t),tip);
      b.className=mepSt.tool===t?'active':'';
      b.style.flex='1';
    });
    r=rowEl();
    [['✂','trim','Ajuster (trim)'],['📏','dim','Cote (outil unique)']].forEach(([lab,t,tip])=>{
      const b=mkBtn(lab,()=>mepSetTool(t),tip);
      b.className=mepSt.tool===t?'active':'';
      b.style.flex='1';
    });
    /* — vue — */
    h('Vue');
    r=rowEl();
    const bGrid=mkBtn((mepSt.grid?'▣':'▢')+' grille',()=>{mepSt.grid=!mepSt.grid;mepSideShow();mepRender();},'Grille 10 mm');
    bGrid.style.flex='1';
    const bZRev=mkBtn((mepSt.zoomRev?'▣':'▢')+' zoom ↕',()=>{
      mepSt.zoomRev=!mepSt.zoomRev;
      try{ localStorage.setItem('minifusion_mepZoomRev',mepSt.zoomRev?'1':'0'); }catch(e){}
      mepSideShow();
    },'Inverser le sens du zoom de la molette (haut = avant ou arrière)');
    bZRev.style.flex='1';
    mkBtn('−',()=>mepZoomBy(1/1.3),'Zoom arrière').style.flex='1';
    mkBtn('Ajuster',()=>{mepFitSheet();mepRender();},'Tout la feuille').style.flex='1';
    mkBtn('+',()=>mepZoomBy(1.3),'Zoom avant').style.flex='1';
    /* — sorties — */
    h('Sortie');
    r=rowEl();
    mkBtn('⟳ Rejeter',()=>{mepReproject(null);mepStatus('Toutes les vues rejetées.');},'Rejeter toutes les vues').style.flex='1';
    mkBtn('SVG',mepExportSvg,'Exporter la planche en SVG').style.flex='1';
    mkBtn('🖨',mepPrint,'Imprimer la planche').style.flex='1';
    const note=document.createElement('div');
    note.className='note';
    note.textContent=sh.views.length+' vue(s) · '+sh.dims.length+' cote(s) · outil actif : '+
      ({select:'sélection',line:'ligne',rect:'rectangle',circle:'cercle',arc:'arc',point:'point',trim:'ajuster',dim:'cote'}[mepSt.tool]||mepSt.tool);
    root.appendChild(note);
  }
  function mepSideView(root,v,sh){
    const h=document.createElement('h4');
    h.textContent=v.kind==='section'?'Coupe '+(v.label||''):(v.kind==='detail'?'Détail '+(v.label||''):
      (v.kind==='proj'?'Projection '+(v.label||'')+' ('+((MEP_PROJ[v.proj||'']||{}).lab||'?')+')':'Vue '+(v.label||v.vk||'')));
    root.appendChild(h);
    const row=(lab,el)=>{
      const r=document.createElement('div');r.className='row';
      const L=document.createElement('label');L.textContent=lab;
      r.appendChild(L);if(el)r.appendChild(el);
      root.appendChild(r);
      return r;
    };
    // libellé
    const inp=document.createElement('input');
    inp.value=v.label||'';
    inp.onchange=()=>{mepEdit('libellé',()=>{v.label=inp.value;});};
    row('Libellé',inp);
    // échelle
    const sel=document.createElement('select');
    MEP_SCALES.forEach(([s,lab])=>{
      const o=document.createElement('option');
      o.value=s;o.textContent=lab;
      if(Math.abs(s-v.scale)<1e-6)o.selected=true;
      sel.appendChild(o);
    });
    sel.onchange=()=>{mepEdit('échelle',()=>{v.scale=+sel.value;});};
    row('Échelle',sel);
    // corps
    const body=document.createElement('select');
    const o0=document.createElement('option');o0.value='';o0.textContent='Assemblée';
    body.appendChild(o0);
    try{
      (doc.bodies||[]).forEach(b=>{
        const o=document.createElement('option');
        o.value=b.id;o.textContent=b.name||b.id;
        if(v.bodyId===b.id)o.selected=true;
        body.appendChild(o);
      });
    }catch(e){}
    body.onchange=()=>{mepEdit('corps',()=>{v.bodyId=body.value||null;});};
    row('Corps',body);
    // cases
    const mkChk=(lab,key)=>{
      const c=document.createElement('input');c.type='checkbox';c.checked=!!v[key];
      c.onchange=()=>{mepEdit(lab,()=>{v[key]=c.checked;});};
      row(lab,c);
    };
    // rendu : fil de fer / cachées supprimées (défaut) / cachées en pointillé
    const modeSel=document.createElement('select');
    [['wire','Fil de fer (tout)'],['hide','Cachées supprimées'],['dash','Cachées en pointillé']].forEach(([k,l])=>{
      const o=document.createElement('option');
      o.value=k;o.textContent=l;
      if((v.mode||'hide')===k)o.selected=true;
      modeSel.appendChild(o);
    });
    modeSel.onchange=()=>{mepEdit('rendu',()=>{v.mode=modeSel.value;});};
    row('Rendu',modeSel);
    mkChk('Arêtes tangentielles','tangent');
    mkChk('Inverser (flip)','flip');
    // projections 1er angle (depuis une vue quelconque sauf coupe/détail)
    if(v.kind==='base'||v.kind==='aux'||v.kind==='proj'){
      const pr=document.createElement('div');pr.className='row';
      [['Dessus','top'],['Dessous','bottom'],['Gauche','left'],['Droit','right']].forEach(([lab,k])=>{
        const b=document.createElement('button');
        b.textContent=lab;b.title='Vue projetée (1er angle) : '+MEP_PROJ[k].lab;
        b.style.flex='1';
        b.onclick=()=>{mepAddProjected(v,k);};
        pr.appendChild(b);
      });
      row('Projection',pr);
    }
    // actions
    const act=document.createElement('div');act.className='row';
    const bFit=document.createElement('button');bFit.textContent='Cadrer';
    bFit.onclick=()=>mepFitViewContent(v);
    const bRep=document.createElement('button');bRep.textContent='Rejeter';
    bRep.onclick=()=>{mepReproject(v.id);mepStatus('Vue rejetée.');};
    const bDel=document.createElement('button');bDel.textContent='Supprimer';bDel.className='danger';
    bDel.onclick=()=>mepDelView(v.id);
    [bFit,bRep,bDel].forEach(b=>act.appendChild(b));
    root.appendChild(act);
    const note=document.createElement('div');
    note.className='note';
    note.textContent=v.section?'Plan de coupe : normale '+mepRound(v.section.n):(v.kind==='detail'?'Détail ×'+mepFmtNum(v.scale,2):
      (v.kind==='proj'?'1er angle — glissement contraint, échelle liée à la mère':'dir '+mepRound(v.dir)));
    root.appendChild(note);
  }
  function mepSideDim(root,d,sh){
    const h=document.createElement('h4');
    h.textContent={len:'Longueur',dist:'Distance',rad:'Rayon',dia:'Diamètre',ang:'Angle'}[d.kind]||'Cote';
    root.appendChild(h);
    const row=(lab,el)=>{
      const r=document.createElement('div');r.className='row';
      const L=document.createElement('label');L.textContent=lab;
      r.appendChild(L);if(el)r.appendChild(el);
      root.appendChild(r);
      return r;
    };
    const val=mepDimMeasure(sh,d);
    const read=document.createElement('div');
    read.className='note';
    read.textContent=mepFmtNum(val,2)+(d.kind==='ang'?'°':' mm');
    root.appendChild(read);
    // mode tolérance
    const sel=document.createElement('select');
    [['','—'],['pm','± symétrique'],['dbl','Double'],['cls','Classe ISO 286']].forEach(([k,l])=>{
      const o=document.createElement('option');o.value=k;o.textContent=l;
      if((d.tol&&d.tol.m)===k||(k===''&&!d.tol))o.selected=true;
      sel.appendChild(o);
    });
    sel.onchange=()=>{
      mepEdit('tolérance',()=>{
        const m=sel.value;
        if(!m){d.tol=null;return;}
        d.tol={m,s:0.1,hi:0.1,lo:-0.1,cls:''};
      });
      mepSideShow();
    };
    row('Tolérance',sel);
    if(d.tol&&d.tol.m==='pm'){
      const s=document.createElement('input');s.type='number';s.step='0.01';s.value=d.tol.s;
      s.onchange=()=>{mepEdit('±',()=>{d.tol.s=+s.value||0;});};
      row('± mm',s);
    }
    if(d.tol&&d.tol.m==='dbl'){
      const hi=document.createElement('input');hi.type='number';hi.step='0.01';hi.value=d.tol.hi;
      hi.onchange=()=>{mepEdit('+',()=>{d.tol.hi=+hi.value||0;});};
      const lo=document.createElement('input');lo.type='number';lo.step='0.01';lo.value=d.tol.lo;
      lo.onchange=()=>{mepEdit('−',()=>{d.tol.lo=+lo.value||0;});};
      row('+',hi);row('−',lo);
    }
    if(d.tol&&d.tol.m==='cls'){
      const c=document.createElement('select');
      MEP_TOL_CLASSES.forEach(cl=>{
        const o=document.createElement('option');o.value=cl;o.textContent=cl||'—';
        if(d.tol.cls===cl)o.selected=true;
        c.appendChild(o);
      });
      c.onchange=()=>{mepEdit('classe',()=>{d.tol.cls=c.value;});};
      row('Classe',c);
    }
    // référence
    const ref=document.createElement('input');ref.type='checkbox';ref.checked=!!d.ref;
    ref.onchange=()=>{mepEdit('référence',()=>{d.ref=ref.checked;});};
    row('Cote de référence',ref);
    const act=document.createElement('div');act.className='row';
    const bDel=document.createElement('button');bDel.textContent='Supprimer';bDel.className='danger';
    bDel.onclick=()=>{
      mepEdit('suppression cote',()=>{sh.dims=sh.dims.filter(x=>x.id!==d.id);mepSt.selDim=null;});
      mepSideShow();
    };
    act.appendChild(bDel);
    root.appendChild(act);
  }
  /* ═══════════════ W. export SVG / impression ═══════════════ */
  function mepExportSvg(){
    try{
      const sh=mepSheet();
      const pg=mepPage();
      const clone=mepSvgEl.cloneNode(true);
      clone.removeAttribute('id'); // ne pas laisser la règle UI #mepSvg{css} écraser les mm
      clone.setAttribute('xmlns',NS);
      clone.setAttribute('viewBox','0 0 '+pg.W+' '+pg.H);
      clone.setAttribute('width',pg.W+'mm');
      clone.setAttribute('height',pg.H+'mm');
      // strip UI helpers
      clone.querySelectorAll('#mepGHlp,.mepDraft').forEach(n=>n.parentNode&&n.parentNode.removeChild(n));
      // les éléments ne portent que des classes : embarquer la feuille de style PLAN
      const st=document.createElementNS(NS,'style');
      st.textContent=css.textContent;
      clone.insertBefore(st,clone.firstChild);
      const xml='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(clone);
      const blob=new Blob([xml],{type:'image/svg+xml'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download=(doc.name||'plan').replace(/[^\w.-]+/g,'_')+'_'+sh.name.replace(/\s+/g,'')+'.svg';
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},400);
      mepStatus('SVG exporté : '+a.download);
    }catch(e){mepStatus('Export SVG impossible : '+e.message);}
  }
  function mepPrint(){
    try{
      const sh=mepSheet();
      const pg=mepPage();
      const clone=mepSvgEl.cloneNode(true);
      clone.removeAttribute('id'); // idem export : la règle #mepSvg ne doit pas s'appliquer
      clone.setAttribute('xmlns',NS);
      clone.setAttribute('viewBox','0 0 '+pg.W+' '+pg.H);
      clone.style.width='100%';clone.style.height='100%';
      clone.querySelectorAll('#mepGHlp,.mepDraft').forEach(n=>n.parentNode&&n.parentNode.removeChild(n));
      const w=window.open('','_blank');
      if(!w){mepStatus('Popup bloquée — autorisez les popups pour imprimer.');return;}
      w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+sh.name+'</title>'+
        '<style>@page{size:'+(sh.orient==='landscape'?'landscape':'portrait')+' margin:8mm}'+
        'html,body{margin:0;padding:0;height:100%}svg{width:100%;height:100%}'+
        css.textContent+'</style></head><body>'+
        new XMLSerializer().serializeToString(clone)+'</body></html>');
      w.document.close();
      setTimeout(()=>{try{w.focus();w.print();}catch(e){}},250);
      mepStatus('Impression ouverte.');
    }catch(e){mepStatus('Impression impossible : '+e.message);}
  }
  /* ═══════════════ X. activation espace + init ═══════════════ */
  function mepAutoViews(){
    // à l'ouverture : planche vide + corps → Face + Dessus/Côté droit en PROJECTIONS 1er angle
    const sh=mepSheet();
    if(sh.views.length)return; // planche déjà peuplée : ne rien toucher
    const has=typeof bodies!=='undefined'&&bodies.some(b=>b&&!b.ghost&&b.kind!=='ghost'&&b.mesh&&b.mesh.visible!==false);
    if(!has)return;
    try{
      const front=mepAddStandardView('front');
      mepAddProjected(front,'top');   // dessous de la mère, alignée en x
      mepAddProjected(front,'right'); // à gauche de la mère, alignée en hauteur
      mepGeoCache.clear();
      mepRender();
    }catch(e){try{console.warn('mepAutoViews',e);}catch(e2){}}
  }
  function mepSetActive(on){
    if(on)mepEnsure();
    if(on){
      mepBuildUI();
      mepSt.open=true;
      mepWrapEl.classList.add('open');
      mepTabsRender();
      mepSideShow();
      mepFitSheet();
      try{mepRender();}catch(e){console.warn(e);}
      mepStatus('Espace PLAN — planches, vues, cotes. '+mepSheet().name);
      // masque les commandes CAO/FAO du ruban via data-ws
      try{document.body.setAttribute('data-ws','plan');}catch(e){}
      // vues standards auto si planche vide et corps présents
      mepAutoViews();
    }else{
      mepSt.open=false;
      if(mepWrapEl)mepWrapEl.classList.remove('open');
      mepSideEject();
      /* data-ws géré par mfWs (97) — ne pas écraser ici */
    }
    try{if(typeof mfWs==='function'&&on){/* mfWs('plan') géré par 97 */}}catch(e){}
  }
  function mepReset(){
    // docResetEmpty() : ferme l'espace SANS recréer doc.mep (doc.mep=null déjà posé par l'appelant)
    mepSt.open=false;mepSt.sel=null;mepSt.selDim=null;mepSt.tool='select';
    mepGeoCache.clear();
    if(mepWrapEl)mepWrapEl.classList.remove('open');
    mepSideEject();
    try{document.body.setAttribute('data-ws','cao');}catch(e){}
  }
  function mepInit(){
    mepEnsure();
    // raccourci global Ctrl+P dans le plan
    window.addEventListener('keydown',e=>{
      if(!mepSt.open)return;
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='p'){e.preventDefault();mepPrint();}
    },true);
  }
  /* hooks documentaires : doc.mep doit exister partout (voir aussi 00/90/95) */
  try{
    if(typeof doc!=='undefined'&&!doc.mep)doc.mep=null;
  }catch(e){}
  // exports publics
  window.mepSetActive=mepSetActive;
  window.mepInit=mepInit;
  window.mepReset=mepReset;
  window.mepIsOpen=()=>mepSt.open;
  window.mepAddSheet=mepAddSheetCmd;
  window.mepExport=mepExportSvg;
  window.mepPrint=mepPrint;
  window.mepReprojectAll=()=>mepReproject(null);
  window.mepReprojectView=id=>{mepSetActive(true);return mepReproject(id||mepSt.sel);};
  // valeur (mm modèle) d'une cote, indépendante de l'échelle de la vue
  window.mepDimValue=d=>{const sh=mepSheet();return sh?mepDimMeasure(sh,d):0;};
  window.mepSetTool=mepSetTool;
  window.mepAddViewStd=vk=>{mepSetActive(true);return mepAddStandardView(vk);};
  window.mepAddCameraViewCmd=()=>{mepSetActive(true);return mepAddCameraView();};
  window.mepBeginAuxCmd=()=>{mepSetActive(true);mepBeginAux();};
  window.mepProjectView=(which,parent)=>{mepSetActive(true);return mepAddProjected(parent||mepView(mepSheet(),mepSt.sel),which);};
  window.mepBeginSectionCmd=()=>{mepSetActive(true);mepBeginSection();};
  window.mepBeginDetailCmd=()=>{mepSetActive(true);mepBeginDetail();};
  // auto-init une fois le DOM prêt
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{try{mepInit();}catch(e){}});
  else try{mepInit();}catch(e){}
})();
