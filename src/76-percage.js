/* ═══════════════════════════════════════════════════════════════════════════
   PERÇAGE (fonction 3D) — 2026-10-15-012
   Demande : « une fonction Perçage dans la modélisation 3D, en rapport avec
   l'opération Perçage FAO : une esquisse avec des points dédiés aux centres de
   trous, et on crée des trous ou des trous taraudés, avec lamage et fraisure
   intégrés, comme Fusion 360 ; la FAO le reconnaît automatiquement si créé avec ».

   • Points : entités cpoint `hole:true` de l'esquisse (outil ⊕ Centre de perçage) —
     seuls ces points portent un trou.
   • f = {type:'hole', sketchId, kind:'simple'|'cbore'|'csink', d (Ø de perçage),
          thread:null|{size:'M8',p:1.25,len}, cbD,cbH (lamage), csD,csA (fraisure),
          end:'blind'|'through', depth (profondeur à plein Ø), tip (angle de pointe,
          0 = fond plat), flip (sens), op:'cut'}
     Taraudé : d = Ø de perçage du taraud (M − pas), filet non modélisé (comme
     Fusion « filet cosmétique ») — l'info voyage jusqu'à la FAO.
   • Géométrie exacte : par point, un outil de révolution (lamage/fraisure + corps +
     pointe) le long de −n (ou +n si inversé), unis puis découpés du corps.
   ═══════════════════════════════════════════════════════════════════════════ */
// Métrique ISO : [taille, Ø nominal, pas gros, pas fins…]
const ISO_THREADS=[['M2',2,0.4],['M2.5',2.5,0.45],['M3',3,0.5],['M4',4,0.7],['M5',5,0.8],['M6',6,1,0.75],
  ['M8',8,1.25,1],['M10',10,1.5,1.25,1],['M12',12,1.75,1.5,1.25],['M14',14,2,1.5],['M16',16,2,1.5],
  ['M18',18,2.5,2,1.5],['M20',20,2.5,2,1.5],['M22',22,2.5,2,1.5],['M24',24,3,2]];
// Vis CHC (ISO 4762) : passage moyen, lamage Ø, profondeur de lamage
const ISO_CHC=[['M3',3.4,6.5,3.4],['M4',4.5,8,4.4],['M5',5.5,10,5.4],['M6',6.6,11,6.4],['M8',9,15,8.6],
  ['M10',11,18,10.8],['M12',13.5,20,13],['M14',15.5,24,15],['M16',17.5,26,17.5],['M20',22,33,21.5],['M24',26,40,25.5]];
function isoThread(size){ return ISO_THREADS.find(function(t){return t[0]===size;})||null; }
function tapDrill(size,p){ const t=isoThread(size); return t?+(t[1]-(p||t[2])).toFixed(2):null; }
function holeThreadLabel(th){ if(!th||!th.size)return ''; const t=isoThread(th.size); return th.size+((t&&+th.p!==t[2])?('×'+String(th.p).replace('.',',')):''); }
function holePoints(sk){
  // Centres de perçage de l'esquisse (2D) : [{id,x,y}]
  if(!sk)return [];
  return (sk.entities||[]).filter(function(e){return e&&e.t==='cpoint'&&e.hole&&sk.points&&sk.points[e.p];})
    .map(function(e){const Q=sk.points[e.p];return {id:e.id,x:Q.x,y:Q.y};});
}
function holeName(f){
  const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});
  const n=holePoints(sk).length;
  const fr=function(v){return String(+(+v).toFixed(2)).replace('.',',');};
  let t=f.thread&&f.thread.size?('Taraudé '+holeThreadLabel(f.thread)):('Ø'+fr(f.d));
  if(f.kind==='cbore')t+=' lamé Ø'+fr(f.cbD);
  if(f.kind==='csink')t+=' fraisé Ø'+fr(f.csD);
  const fin=f.end==='through'?' débouchant tout':(f.end==='next'?' débouchant':(f.end==='upto'?' jusqu’à la face':''));
  return 'Perçage '+t+fin+' ×'+n;
}
function holeNorm(f){
  // Valeurs bornées (jamais de géométrie dégénérée)
  const d=Math.max(0.2,+f.d||6.6);
  return {d:d,r:d/2,
    kind:f.kind==='cbore'||f.kind==='csink'?f.kind:'simple',
    cbD:Math.max(d+0.2,+f.cbD||d*1.7),cbH:Math.max(0.1,+f.cbH||d*0.9),
    csD:Math.max(d+0.2,+f.csD||d*2),csA:Math.min(150,Math.max(60,+f.csA||90)),
    end:(f.end==='through'||f.end==='next'||f.end==='upto')?f.end:'blind',
    through:f.end==='through',depth:Math.max(0.2,+f.depth||d*2.5),
    tip:(f.tip===0||f.tip==='0')?0:Math.min(170,Math.max(60,+f.tip||118))};
}
function holeAxis(f,sk){
  // Origine monde de chaque point + direction de perçage (−n par défaut).
  const B=sketchBasis(sk);
  const s=f.flip?1:-1;
  return {dir:{x:B.n.x*s,y:B.n.y*s,z:B.n.z*s},pts:holePoints(sk).map(function(p){const w=occW(sk,p.x,p.y);return {id:p.id,x:w[0],y:w[1],z:w[2]};})};
}
const HOLE_THROUGH=2000; // « débouchant » : la course traverse toute pièce raisonnable
function holeProfileSegs(N,zEndPt){
  // Segments le long de l'axe (distance depuis le plan, rayons début/fin) pour un trou.
  const s=[];let z=0;
  if(N.kind==='cbore'){s.push([z,N.cbH,N.cbD/2,N.cbD/2]);z=N.cbH;}
  else if(N.kind==='csink'){const h=(N.csD-N.d)/2/Math.tan(N.csA*Math.PI/360);s.push([z,h,N.csD/2,N.r]);z=h;}
  const zEnd=Math.max(isFinite(zEndPt)?zEndPt:(N.through?(N.thruLen||HOLE_THROUGH):N.depth),z+0.05);
  s.push([z,zEnd-z,N.r,N.r]);
  if(N.end==='blind'&&N.tip>0){const h=N.r/Math.tan(N.tip*Math.PI/360);s.push([zEnd,h,N.r,0]);}
  return s;
}
function occShapeOfHole(f){
  const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});
  if(!sk)throw new Error('esquisse introuvable');
  const A=holeAxis(f,sk);
  if(!A.pts.length)throw new Error('aucun centre de perçage dans l’esquisse (outil ⊕)');
  const N=holeNorm(f);
  // Débouchant : course limitée à la PIÈCE déjà construite (+1 mm) — sinon l'outil
  // fantôme affiché à la sélection serait une tige de 2 m.
  if(N.through&&typeof occThroughBase!=='undefined'&&occThroughBase){
    try{
      const bb=new occt.Bnd_Box_1();occt.BRepBndLib.Add(occThroughBase,bb,true);
      const a=bb.CornerMin(),b=bb.CornerMax();let L=0;
      const cs=[[a.X(),b.X()],[a.Y(),b.Y()],[a.Z(),b.Z()]];
      A.pts.forEach(function(P){for(let i=0;i<8;i++){const c=[cs[0][i&1],cs[1][(i>>1)&1],cs[2][(i>>2)&1]];
        L=Math.max(L,(c[0]-P.x)*A.dir.x+(c[1]-P.y)*A.dir.y+(c[2]-P.z)*A.dir.z);}});
      try{bb.delete();}catch(e){}
      if(L>0)N.thruLen=L+1;
    }catch(e){}
  }
  const bins=[],warnings=[];
  const base=(typeof occThroughBase!=='undefined')?occThroughBase:null;
  const zEndOf=function(P){
    // Profondeur (plein Ø) de CE trou selon la fin choisie.
    if(N.end==='upto'){
      const t=holePlaneDist(f.uptoPlane,P,A.dir);
      if(t===null){warnings.push('fin « jusqu’à la face » : face non choisie ou parallèle à l’axe — profondeur saisie utilisée');return N.depth;}
      return t;
    }
    if(N.end==='next'){
      const t=holeNextExit(base,P,A.dir);
      if(t===null){warnings.push('fin « débouchant » : aucune sortie de matière trouvée — profondeur saisie utilisée');return N.depth;}
      return t+0.05; // franchit la face de sortie (jamais de pellicule)
    }
    if(N.through)return N.thruLen||HOLE_THROUGH;
    return N.depth;
  };
  // longueur filetée effective (information FAO ; le filet n'est pas modélisé)
  try{
    if(f.thread&&f.thread.size&&A.pts.length){
      const m=f.thread.lenMode||'len',P0=A.pts[0];
      let L=+f.thread.len||0;
      if(m==='upto'){const t=holePlaneDist(f.thread.uptoPlane,P0,A.dir);if(t!==null)L=t;else warnings.push('longueur filetée « jusqu’à la face » : face non choisie');}
      else if(m==='next'){const t=holeNextExit(base,P0,A.dir);if(t!==null)L=t;}
      f._thLen=+L.toFixed(3);
    }
  }catch(e){}
  const D=A.dir;
  const dir=occBinPush(bins,new occt.gp_Dir_4(D.x,D.y,D.z));
  let tool=null;
  const add=function(sh){ if(!tool){tool=sh;return;} const u=occFuse(tool,sh); try{tool.delete();}catch(e){} try{sh.delete();}catch(e){} tool=u; };
  const OVER=0.02; // départ légèrement au-dessus du plan : jamais de face coplanaire
  A.pts.forEach(function(P){
    const segs=holeProfileSegs(N,zEndOf(P));
    segs.forEach(function(sg,i){
      const z0=sg[0]-(i===0?OVER:0),h=sg[1]+(i===0?OVER:0);
      // 1er segment rallongé de OVER au-dessus du plan : un CÔNE (fraisure) est prolongé
      // sur sa génératrice, sinon le Ø au ras de la face serait trop petit (10,96 pour 11).
      const r0=(i===0&&sg[1]>1e-9)?sg[2]+OVER*(sg[2]-sg[3])/sg[1]:sg[2];
      const o=occBinPush(bins,new occt.gp_Pnt_3(P.x+D.x*z0,P.y+D.y*z0,P.z+D.z*z0));
      const ax=occBinPush(bins,new occt.gp_Ax2_3(o,dir));
      let sh=null;
      if(Math.abs(sg[2]-sg[3])<1e-9){const mk=new occt.BRepPrimAPI_MakeCylinder_3(ax,sg[2],h);sh=mk.Shape();try{mk.delete();}catch(e){}}
      else{const mk=new occt.BRepPrimAPI_MakeCone_3(ax,r0,sg[3],h);sh=mk.Shape();try{mk.delete();}catch(e){}}
      add(sh);
    });
  });
  return {shape:tool,bins:bins,warnings:warnings};
}
function legacyHoleGeos(f,msgs){
  // Repli maillage (sans noyau exact) : cylindres approchés.
  const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});
  if(!sk)throw new Error('esquisse introuvable');
  const A=holeAxis(f,sk),N=holeNorm(f),geos=[];
  const segs=holeProfileSegs(N,N.end==='upto'?(holePlaneDist(f.uptoPlane,A.pts[0]||{x:0,y:0,z:0},A.dir)||N.depth):(N.end==='next'?N.depth:undefined));
  const up=new THREE.Vector3(0,1,0),dv=new THREE.Vector3(A.dir.x,A.dir.y,A.dir.z);
  const q=new THREE.Quaternion().setFromUnitVectors(up,dv);
  A.pts.forEach(function(P){
    segs.forEach(function(sg){
      const len=Math.min(sg[1],N.through?60:sg[1]); // repli maillage : course bornée
      // rayon nul (pointe) → 0,01 mm : un sommet dégénéré corrompt le booléen BSP (CSG)
      const g=new THREE.CylinderGeometry(Math.max(sg[3],0.01),Math.max(sg[2],0.01),len,24);
      g.applyQuaternion(q);
      const c=sg[0]+len/2;
      g.translate(P.x+dv.x*c,P.y+dv.y*c,P.z+dv.z*c);
      geos.push(g);
    });
  });
  if(!geos.length)throw new Error('aucun centre de perçage');
  return geos;
}
function holePlaneDist(pl,P,D){
  // Distance le long de l'axe jusqu'au plan choisi {p:[x,y,z],n:[x,y,z]} ; null si absent/parallèle/derrière.
  if(!pl||!pl.p||!pl.n)return null;
  const dn=D.x*pl.n[0]+D.y*pl.n[1]+D.z*pl.n[2];
  if(Math.abs(dn)<1e-6)return null;
  const t=((pl.p[0]-P.x)*pl.n[0]+(pl.p[1]-P.y)*pl.n[1]+(pl.p[2]-P.z)*pl.n[2])/dn;
  return t>0.01?t:null;
}
function holeNextExit(sh,P,D){
  // « Jusqu'à la prochaine face » : distance le long de l'axe jusqu'à la PREMIÈRE
  // sortie de matière (entrée dans le solide, puis sortie). Marche + dichotomie.
  if(!sh||typeof occt==='undefined')return null;
  let cl=null;
  try{
    cl=new occt.BRepClass3d_SolidClassifier_2(sh);
    const IN=occt.TopAbs_State.TopAbs_IN;
    const inAt=function(t){const p=new occt.gp_Pnt_3(P.x+D.x*t,P.y+D.y*t,P.z+D.z*t);cl.Perform(p,1e-7);const r=cl.State()===IN;try{p.delete();}catch(e){}return r;};
    let bb=null,Lmax=2000;
    try{bb=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,bb,true);const a=bb.CornerMin(),b=bb.CornerMax();Lmax=Math.hypot(b.X()-a.X(),b.Y()-a.Y(),b.Z()-a.Z())+1;bb.delete();}catch(e){}
    const step=0.25;let t=0.05,seenIn=false,prevIn=false;
    for(;t<=Lmax;t+=step){
      const i=inAt(t);
      if(i){seenIn=true;prevIn=true;continue;}
      if(seenIn&&prevIn){ // sortie entre t-step et t
        let lo=t-step,hi=t;
        for(let k=0;k<30;k++){const m=(lo+hi)/2;if(inAt(m))lo=m;else hi=m;}
        return hi;
      }
      prevIn=false;
    }
    return null;
  }catch(e){return null;}
  finally{try{if(cl)cl.delete();}catch(e){}}
}
let holeFacePick=null; // {fid, which:'end'|'thread'}
function holeFacePickStart(fid,which){
  holeFacePick={fid:fid,which:which};
  try{renderer.domElement.style.cursor='crosshair';}catch(e){}
  try{faceEl.textContent='Perçage : cliquez une face PLANE de la pièce ('+(which==='thread'?'fin du filetage':'fin du trou')+') — Échap pour annuler.';}catch(e){}
}
function holeFacePickCancel(){holeFacePick=null;try{renderer.domElement.style.cursor='default';}catch(e){}}
function holeFacePickAt(e){
  if(!holeFacePick)return false;
  const f=doc.features.find(function(x){return x.id===holeFacePick.fid;});
  if(!f){holeFacePickCancel();return false;}
  const h=pick(e);if(!h){try{faceEl.textContent='Perçage : aucune face sous le curseur.';}catch(e2){}return true;}
  let G=null;try{G=occFaceGeom(h.object,h.faceIndex);}catch(e2){G=null;}
  if(!G||G.kind!=='plan'){try{faceEl.textContent='Perçage : choisissez une face PLANE.';}catch(e2){}return true;}
  const pl={p:[G.p.x,G.p.y,G.p.z],n:[G.n.x,G.n.y,G.n.z]};
  docPushUndo('perçage : face');
  if(holeFacePick.which==='thread'){if(!f.thread)f.thread={};f.thread.uptoPlane=pl;f.thread.lenMode='upto';}
  else{f.uptoPlane=pl;f.end='upto';}
  holeFacePickCancel();
  f.name=holeName(f);markDirty();rebuild();renderTree();renderProps();
  try{faceEl.textContent='Perçage : face retenue.';}catch(e2){}
  return true;
}
/* ----- création ----- */
function askHole(presetSketchId){
  const lastWithHoles=function(){for(let i=doc.sketches.length-1;i>=0;i--){if(holePoints(doc.sketches[i]).length)return doc.sketches[i].id;}return null;};
  const skId=(presetSketchId&&holePoints(doc.sketches.find(function(s){return s.id===presetSketchId;})).length)?presetSketchId:lastWithHoles();
  if(!skId){alert('Perçage : placez d’abord des CENTRES DE PERÇAGE dans une esquisse (outil ⊕ de la barre d’esquisse), puis sélectionnez-la.');return;}
  const sk=doc.sketches.find(function(s){return s.id===skId;});
  const nf={id:uid('ho'),type:'hole',name:'',sketchId:skId,kind:'simple',d:6.6,thread:null,
    cbD:11,cbH:6.4,csD:13,csA:90,end:'blind',depth:15,tip:118,flip:false,op:'cut',visible:true};
  // sens automatique : vers la matière (le plan d'une face pointe vers l'extérieur)
  try{
    if(occHas()&&occLive&&occLive.shape){
      const A=holeAxis(nf,sk),P=A.pts[0],D=A.dir;
      const cl=new occt.BRepClass3d_SolidClassifier_2(occLive.shape);
      const st=function(s){const p=new occt.gp_Pnt_3(P.x+D.x*s,P.y+D.y*s,P.z+D.z*s);cl.Perform(p,1e-6);const r=cl.State();try{p.delete();}catch(e){}return r;};
      const IN=occt.TopAbs_State.TopAbs_IN;
      if(st(0.6)!==IN&&st(-0.6)===IN)nf.flip=true;
      try{cl.delete();}catch(e){}
    }
  }catch(e){}
  nf.name=holeName(nf);
  docPushUndo('perçage');
  addFeature(nf);
  if(sk.visible!==false)sk.visible=false;
  ghostHide=nf.id;
  sel={kind:'feature',id:nf.id};
  markDirty();rebuild();renderTree();renderProps();
  faceEl.textContent='Perçage créé : '+nf.name+' — réglez type, taraudage et profondeur dans Paramètres.';
}
/* ----- panneau de la fonction ----- */
function renderHoleProps(p,f){
  const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});
  const go=function(){f.name=holeName(f);markDirty();rebuild();renderTree();renderProps();};
  const row=function(lab,el){const l=document.createElement('label');l.textContent=lab;l.appendChild(el);p.appendChild(l);return l;};
  const sel=function(opts,val,fn){const s=document.createElement('select');s.innerHTML=opts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>';}).join('');s.value=String(val);s.onchange=function(){docPushUndo('perçage');fn(s.value);go();};return s;};
  const num=function(val,fn,w){const i=document.createElement('input');i.type='text';i.inputMode='decimal';i.value=String(+(+val).toFixed(3)).replace('.',',');i.style.width=(w||70)+'px';
    const c=function(){const v=parseFloat(String(i.value).replace(',','.'));if(isFinite(v)&&v>0){docPushUndo('perçage');fn(v);go();}};
    i.addEventListener('change',c);i.addEventListener('keydown',function(e){if(e.key==='Enter'){c();i.blur();}e.stopPropagation();});i.addEventListener('click',function(e){e.stopPropagation();});return i;};
  const nP=holePoints(sk).length;
  const hd=document.createElement('span');hd.className='note';hd.textContent=nP+' centre(s) de perçage dans « '+(sk?sk.name:'?')+' »'+(nP?'':' — ajoutez-en avec l’outil ⊕ de l’esquisse');p.appendChild(hd);
  // ── type
  row('Type',sel([['simple','Simple'],['cbore','Lamage'],['csink','Fraisure']],f.kind||'simple',function(v){f.kind=v;}));
  // ── taraudage
  const thOpts=[['','Aucun (trou lisse)']];
  ISO_THREADS.forEach(function(t){thOpts.push([t[0]+'|'+t[2],t[0]+' (pas '+String(t[2]).replace('.',',')+')']);
    for(let k=3;k<t.length;k++)thOpts.push([t[0]+'|'+t[k],t[0]+'×'+String(t[k]).replace('.',',')+' (fin)']);});
  row('Taraudage',sel(thOpts,f.thread&&f.thread.size?(f.thread.size+'|'+f.thread.p):'',function(v){
    if(!v){f.thread=null;return;}
    const q=v.split('|'),pz=+q[1];f.thread={size:q[0],p:pz,len:(f.thread&&+f.thread.len)||Math.max(2*isoThread(q[0])[1],+f.depth-2*pz)};
    f.d=tapDrill(q[0],pz);
    if(f.kind==='csink')f.csD=+(isoThread(q[0])[1]*1.1+0.4).toFixed(2);
  }));
  // ── vis CHC (lamage) : préréglages ISO 4762
  if(f.kind==='cbore')row('Vis CHC',sel([['','—']].concat(ISO_CHC.map(function(c){return [c[0],c[0]+' : Ø'+String(c[1]).replace('.',',')+' / lamage Ø'+c[2]+' × '+String(c[3]).replace('.',',')];})),'',function(v){
    const c=ISO_CHC.find(function(x){return x[0]===v;});if(!c)return;f.thread=null;f.d=c[1];f.cbD=c[2];f.cbH=c[3];}));
  // ── Ø de perçage
  const lD=row(f.thread&&f.thread.size?'Ø de perçage (taraud '+holeThreadLabel(f.thread)+')':'Ø du trou',num(f.d,function(v){f.d=v;}));
  void lD;
  if(f.thread&&f.thread.size){
    row('Longueur filetée',sel([['len','Longueur'],['upto','Jusqu’à la face…'],['next','Jusqu’à la prochaine face']],f.thread.lenMode||'len',function(v){
      f.thread.lenMode=v; if(v==='upto'&&!f.thread.uptoPlane)setTimeout(function(){holeFacePickStart(f.id,'thread');},0);}));
    const tm=f.thread.lenMode||'len';
    if(tm==='len')row('Longueur (mm)',num(f.thread.len||f.depth,function(v){f.thread.len=v;}));
    else if(tm==='upto'){const b=document.createElement('button');b.textContent=(f.thread.uptoPlane?'✓ Face choisie — ':'')+'Sélectionner la face (filetage)';b.onclick=function(){holeFacePickStart(f.id,'thread');};p.appendChild(b);}
    if(f._thLen)p.appendChild(Object.assign(document.createElement('span'),{className:'note',textContent:'Longueur filetée effective : '+String(f._thLen).replace('.',',')+' mm'}));
  }
  if(f.kind==='cbore'){row('Ø lamage',num(f.cbD,function(v){f.cbD=v;}));row('Profondeur lamage',num(f.cbH,function(v){f.cbH=v;}));}
  if(f.kind==='csink'){row('Ø fraisure',num(f.csD,function(v){f.csD=v;}));row('Angle fraisure (°)',sel([['90','90°'],['82','82° (UNC)'],['100','100°'],['120','120°']],String(f.csA||90),function(v){f.csA=+v;}));}
  // ── fin
  row('Fin',sel([['blind','Distance (borgne)'],['upto','Jusqu’à la face…'],['next','Débouchant (prochaine face)'],['through','Débouchant tout']],f.end||'blind',function(v){
    f.end=v; if(v==='upto'&&!f.uptoPlane)setTimeout(function(){holeFacePickStart(f.id,'end');},0);}));
  if(f.end==='upto'){const b=document.createElement('button');b.textContent=(f.uptoPlane?'✓ Face choisie — ':'')+'Sélectionner la face (fin du trou)';b.onclick=function(){holeFacePickStart(f.id,'end');};p.appendChild(b);}
  if(!f.end||f.end==='blind'){
    row('Profondeur (plein Ø)',num(f.depth,function(v){f.depth=v;}));
    row('Fond',sel([['118','Pointe 118°'],['135','Pointe 135°'],['140','Pointe 140°'],['90','Pointe 90°'],['0','Fond plat']],String(f.tip===0?0:(f.tip||118)),function(v){f.tip=+v;}));
  }
  row('Sens',sel([['0','Vers la matière (auto)'],['1','Inversé']],f.flip?'1':'0',function(v){f.flip=(v==='1');}));
  const b1=document.createElement('button');b1.textContent='🔧 Éditer l’esquisse (centres)';b1.onclick=function(){if(sk)openSketch(sk.id);};p.appendChild(b1);
}
/* ----- image du taraudage (filet cosmétique) — 2026-10-15-012 -----
   « Peut-on voir une image de taraudage sur les trous taraudés ? » : hélice au pas
   réel dessinée DANS le trou (juste en deçà du Ø de perçage, donc visible par
   l'ouverture) sur la longueur filetée, + cercle du Ø nominal à l'entrée. Le solide
   reste percé au Ø du taraud (juste pour la FAO) ; rien n'est modélisé. */
function holeThreadOverlay(){
  try{
    const old=scene.getObjectByName('holeThreads');
    if(old){scene.remove(old);old.traverse(function(o){try{if(o.geometry)o.geometry.dispose();}catch(e){}});}
    const grp=new THREE.Group();grp.name='holeThreads';
    (doc.features||[]).forEach(function(f){
      if(!f||f.type!=='hole'||f.visible===false||!f.thread||!f.thread.size)return;
      if(typeof tlLocked==='function'&&tlLocked(f))return;
      const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});if(!sk)return;
      const t=isoThread(f.thread.size);if(!t)return;
      const pz=+f.thread.p||t[2],Rn=t[1]/2,N=holeNorm(f);
      const rh=Math.max(0.05,N.r-0.04);
      const len=Math.max(pz,+f._thLen||+f.thread.len||N.depth);
      const A=holeAxis(f,sk),D=new THREE.Vector3(A.dir.x,A.dir.y,A.dir.z);
      // repère orthonormé autour de l'axe
      const ref=Math.abs(D.z)<0.9?new THREE.Vector3(0,0,1):new THREE.Vector3(1,0,0);
      const U=new THREE.Vector3().crossVectors(D,ref).normalize(),V=new THREE.Vector3().crossVectors(D,U).normalize();
      const off=(N.kind==='cbore')?N.cbH:0;
      const helix=[],ring=[];
      A.pts.forEach(function(P){
        const O=new THREE.Vector3(P.x,P.y,P.z);
        const turns=len/pz,steps=Math.max(24,Math.ceil(turns*24));
        let prev=null;
        for(let i=0;i<=steps;i++){
          const a=i/steps*turns*Math.PI*2,z=off+i/steps*len;
          const q=O.clone().addScaledVector(D,z).addScaledVector(U,rh*Math.cos(a)).addScaledVector(V,rh*Math.sin(a));
          if(prev)helix.push(prev.x,prev.y,prev.z,q.x,q.y,q.z);prev=q;
        }
        let pr=null;
        for(let k=0;k<=48;k++){const a=k/48*Math.PI*2;
          const q=O.clone().addScaledVector(D,off-0.03).addScaledVector(U,Rn*Math.cos(a)).addScaledVector(V,Rn*Math.sin(a));
          if(pr)ring.push(pr.x,pr.y,pr.z,q.x,q.y,q.z);pr=q;}
      });
      const mkL=function(arr,col,op,dash){
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
        const m=dash?new THREE.LineDashedMaterial({color:col,dashSize:0.8,gapSize:0.6,transparent:true,opacity:op}):new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op});
        const l=new THREE.LineSegments(g,m);if(dash&&l.computeLineDistances)l.computeLineDistances();l.renderOrder=5;l.raycast=function(){};return l;};
      if(helix.length)grp.add(mkL(helix,0xffb340,0.9,false));
      if(ring.length)grp.add(mkL(ring,0xffb340,0.95,true));
    });
    if(grp.children.length)scene.add(grp);
  }catch(e){}
}
