/* ─────────────────────────────────────────────────────────────────────────────
   FACES USINABLES (bleu) / INTOUCHABLES (rouge) — 2026-10-21-003.

   Demande : « pouvoir sélectionner un ensemble de surfaces ou un solide que l'on
   définirait comme intouchables (rouge persistant) et une surface ou ensemble
   de surfaces usinables (bleu persistant) — interdire rapidement à la fraise
   d'aller usiner ce que l'on ne veut pas usiner ». Choix validés :
     • listes PAR OPÉRATION : op.faces (bleu : Finition, Géodésique) et
       op.protect (rouge : Ébauche 3D, Finition, Géodésique) ;
     • rouge = JAMAIS touché, avec une marge op.protectM (défaut 0,5 mm) :
       aucune position d'outil à moins de la marge ; un SOLIDE entier (Maj+clic)
       entre aussi dans le modèle (les rapides le contournent) ;
     • bleu = seules les positions où l'outil repose sur une face bleue
       (Finition) ; faces pilotes (Géodésique) ;
     • couleurs affichées tant que l'opération est sélectionnée.
   Entrée de liste : {b: id du corps, f: rang de face BRep (occGroups)} ou
   {b, all:1} (solide entier).
   ───────────────────────────────────────────────────────────────────────── */
const FAO_PROTECT_M=0.5;
function faoFaceOps(op){return !!(op&&(op.type==='rough3d'||op.type==='geofinish'||op.type==='geodesic'));}
function faoFaceBlueOp(op){return !!(op&&(op.type==='geofinish'||op.type==='geodesic'));}
function faoFaceList(op,key){return (op&&Array.isArray(op[key]))?op[key]:[];}
function faoProtectM(op){return (op&&isFinite(+op.protectM)&&+op.protectM>=0)?+op.protectM:FAO_PROTECT_M;}
// nettoyage d'une liste (sanitize document)
function faoFaceListClean(L){
  return (Array.isArray(L)?L:[]).filter(function(q){return q&&q.b!==undefined&&q.b!==null&&(q.all||isFinite(+q.f));})
    .map(function(q){return q.all?{b:q.b,all:1}:{b:q.b,f:+q.f};});
}
// Triangles d'une liste (faces et/ou solides) -> {v,t} dans le repère du posage
function faoFaceMesh(job,list){
  try{
    if(!list||!list.length||typeof bodies==='undefined'||!bodies)return null;
    const want=new Map();
    list.forEach(function(s){const k=String(s.b);if(!want.has(k))want.set(k,{all:false,f:new Set()});const w=want.get(k);if(s.all)w.all=true;else w.f.add(+s.f);});
    const F=faoFrame(job);
    const V=[],T=[];
    for(let bi=0;bi<bodies.length;bi++){
      const b=bodies[bi];if(!b||b.ghost)continue;
      const w=want.get(String(b.id));if(!w)continue;
      const g=(typeof faoFineGeo==='function')?faoFineGeo(b):null;
      const mm=(g&&faoMeshFromBodyFineCached(b))||faoMeshFromBodyCached(b);
      if(!mm)continue;
      const groups=(g&&g.userData&&g.userData.occGroups)||null;
      const remap=new Map();
      const W=function(i){let j=remap.get(i);if(j===undefined){j=V.length;const p=mm.v[i];V.push(F.id?p.slice():faoToF(F,p));remap.set(i,j);}return j;};
      const addTri=function(k){const t=mm.t[k];if(!t||t[0]===t[1]||t[1]===t[2]||t[0]===t[2])return;T.push([W(t[0]),W(t[1]),W(t[2])]);};
      if(w.all||!groups){for(let k=0;k<mm.t.length;k++)addTri(k);continue;}
      for(let q=0;q<groups.length;q++){const gr=groups[q];if(!w.f.has(gr.f))continue;
        for(let k=gr.start;k<gr.start+gr.count&&k<mm.t.length;k++)addTri(k);}
    }
    return T.length?{v:V,t:T}:null;
  }catch(e){return null;}
}
// Solides rouges entiers (à ajouter au modèle : obstacles des liaisons)
function faoProtectBodiesMesh(job,op){
  const L=faoFaceList(op,'protect').filter(function(q){return q.all;});
  return L.length?faoFaceMesh(job,L):null;
}
function faoMeshConcat(a,b){
  if(!a)return b;if(!b)return a;
  const off=a.v.length;
  return {v:a.v.concat(b.v),t:a.t.concat(b.t.map(function(t){return [t[0]+off,t[1]+off,t[2]+off];}))};
}

/* ----- « Interdire devant la face » (2026-10-21-007) -----
   Demande : les faces rouges « ne jamais usiner » — en « Tout couvrir », la
   fraise descendait le long des flancs rouges pour enlever le brut DEVANT eux
   (Malaxeur Retard : bande de 2,25 mm sur 30,8 m), sans toucher la face. Avec
   op.protectFront, chaque triangle rouge est prolongé le long de sa normale
   EXTÉRIEURE jusqu'à la sortie de la boîte du brut : le prisme obtenu (face,
   face translatée, côtés) rejoint les obstacles rouges — même marge, mêmes
   règles (aucune position d'outil, rapides par le dégagement). */
function faoFrontPrism(red,st){
  if(!red||!red.t||!red.t.length||!st||!faoStockValid(st))return null;
  const B=[+st.x0,+st.y0,+st.z0,+st.x1,+st.y1,+st.z1];
  // distance de sortie de la boîte le long de n depuis p (0 si déjà dehors)
  const exitD=function(p,n){
    let t=1/0;
    for(let k=0;k<3;k++){
      if(n[k]>1e-9)t=Math.min(t,(B[k+3]-p[k])/n[k]);
      else if(n[k]<-1e-9)t=Math.min(t,(B[k]-p[k])/n[k]);
    }
    return (t<1/0&&t>0)?t:0;
  };
  const V=[],T=[];
  const add=function(p){V.push(p);return V.length-1;};
  for(let i=0;i<red.t.length;i++){
    const t=red.t[i],A=red.v[t[0]],Bv=red.v[t[1]],C=red.v[t[2]];
    const ux=Bv[0]-A[0],uy=Bv[1]-A[1],uz=Bv[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];
    let n=[uy*wz-uz*wy,uz*wx-ux*wz,ux*wy-uy*wx];const l=Math.hypot(n[0],n[1],n[2]);
    if(!(l>1e-12))continue;n=[n[0]/l,n[1]/l,n[2]/l];
    const L=Math.max(exitD(A,n),exitD(Bv,n),exitD(C,n));
    if(!(L>1e-6))continue;
    const P=[A,Bv,C],Q=P.map(function(p){return [p[0]+n[0]*L,p[1]+n[1]*L,p[2]+n[2]*L];});
    const ip=P.map(add),iq=Q.map(add);
    T.push([ip[0],ip[1],ip[2]],[iq[0],iq[2],iq[1]]);
    for(let e=0;e<3;e++){const a=e,b=(e+1)%3;T.push([ip[a],iq[a],iq[b]],[ip[a],iq[b],ip[b]]);}
  }
  return T.length?{v:V,t:T}:null;
}
// Obstacles rouges de l'opération : faces/solides rouges (+ leur prisme avant
// si « Interdire devant la face »), repère du posage — null sans rouge.
function faoProtectMesh(job,op){
  const red=faoFaceMesh(job,faoFaceList(op,'protect'));
  if(!red||!(op&&op.protectFront))return red;
  let st=null;try{st=(job&&job.stock&&faoStockValid(job.stock))?job.stock:faoStock();}catch(e){st=null;}
  return faoMeshConcat(red,faoFrontPrism(red,st));
}

/* ----- BRUT = CORPS (2026-10-21-010) -----
   Retour : « le brut pris en compte n'est pas la pièce mais un cube, pourtant un
   corps est bien sélectionné ». L'ébauche et la simulation ne lisaient que la
   BOÎTE du brut. Carte des hauteurs du DESSUS du corps-brut (repère du posage,
   pas 1 mm, raster exact des triangles) : la simulation part de cette forme, et
   l'ébauche n'usine qu'où l'outil rencontre de la matière du brut au-dessus de
   la cote (dilatation du dessus par le rayon d'outil). */
function faoStockBodyId(setup){
  try{
    if(!setup)return null;
    if(setup.stock&&setup.stock.solid!=null)return setup.stock.solid;
    if(setup.stockSrc==='body'&&setup.stockBody!=null&&faoStockShape(setup)==='solid')return setup.stockBody;
  }catch(e){}
  return null;
}
function faoStockTop(setup,g){
  const id=faoStockBodyId(setup);if(id==null)return null;
  const m=faoFaceMesh(setup,[{b:id,all:1}]);if(!m)return null;
  g=g>0?g:1;
  let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;
  for(const p of m.v){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}
  x0-=g;y0-=g;x1+=g;y1+=g;
  const nx=Math.ceil((x1-x0)/g)+1,ny=Math.ceil((y1-y0)/g)+1,h=new Float32Array(nx*ny).fill(-1/0);
  for(const t of m.t){const A=m.v[t[0]],B=m.v[t[1]],C=m.v[t[2]];
    const d=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(d)<1e-12)continue;
    const i0=Math.max(0,Math.floor((Math.min(A[0],B[0],C[0])-x0)/g)),i1=Math.min(nx-1,Math.ceil((Math.max(A[0],B[0],C[0])-x0)/g));
    const j0=Math.max(0,Math.floor((Math.min(A[1],B[1],C[1])-y0)/g)),j1=Math.min(ny-1,Math.ceil((Math.max(A[1],B[1],C[1])-y0)/g));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=x0+i*g,y=y0+j*g;
      const l1=((B[1]-C[1])*(x-C[0])+(C[0]-B[0])*(y-C[1]))/d,l2=((C[1]-A[1])*(x-C[0])+(A[0]-C[0])*(y-C[1]))/d,l3=1-l1-l2;
      if(l1<-1e-9||l2<-1e-9||l3<-1e-9)continue;const z=l1*A[2]+l2*B[2]+l3*C[2];const k=j*nx+i;if(z>h[k])h[k]=z;}}
  const at=function(x,y){const i=Math.round((x-x0)/g),j=Math.round((y-y0)/g);
    if(i<0||j<0||i>=nx||j>=ny)return -1/0;return h[j*nx+i];};
  // dessus dilaté par le rayon r : matière du brut quelque part sous le disque d'outil
  const dil=function(r){
    const n=Math.ceil(r/g),out=new Float32Array(nx*ny).fill(-1/0),off=[];
    for(let dj=-n;dj<=n;dj++)for(let di=-n;di<=n;di++)if((di*di+dj*dj)*g*g<=(r+g*0.71)*(r+g*0.71))off.push([di,dj]);
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const v=h[j*nx+i];if(!(v>-1/0))continue;
      for(const o of off){const ii=i+o[0],jj=j+o[1];if(ii<0||jj<0||ii>=nx||jj>=ny)continue;const k=jj*nx+ii;if(v>out[k])out[k]=v;}}
    return function(x,y){const i=Math.round((x-x0)/g),j=Math.round((y-y0)/g);if(i<0||j<0||i>=nx||j>=ny)return -1/0;return out[j*nx+i];};
  };
  return {x0:x0,y0:y0,nx:nx,ny:ny,g:g,h:h,at:at,dil:dil};
}

/* ----- prédicats pour les générateurs ----- */
// Finition : position outil (x,y) admise si le rouge ne relève pas l'outil
// gonflé de la marge (aucun point rouge à moins de m) et, avec du bleu, si
// l'outil repose sur une face bleue (sa descente sur le bleu seul = sur tout).
function faoFaceOkAt(job,op,model,tool,laisse){
  const red=faoProtectMesh(job,op);
  const blue=faoFaceBlueOp(op)&&op.type==='geofinish'?faoFaceMesh(job,faoFaceList(op,'faces')):null;
  if(!red&&!blue)return null;
  const kind=tool.kind||'ball',D=+tool.d||10,cr=tool.cornerR,L=+laisse||0,m=faoProtectM(op);
  const dA=faoScDropper(model,kind,D,cr,L);
  const dR=red?faoScDropper(red,kind,D,cr,L+m):null;
  const dB=blue?faoScDropper(blue,kind,D,cr,L):null;
  return function(x,y){
    const a=dA.tip(x,y);
    if(!(a>-1/0))return !blue;
    if(dR){const r=dR.tip(x,y);if(r>a+1e-4)return false;}
    if(dB){const b=dB.tip(x,y);if(!(b>-1/0)||Math.abs(b-a)>0.005)return false;}
    return true;
  };
}
// Ébauche 3D / Géodésique : cote de pointe minimale imposée par le rouge
// (outil gonflé de la marge) — null sans rouge.
function faoProtectTip(job,op,tool,laisse,flat){
  const red=faoProtectMesh(job,op);
  if(!red)return null;
  const kind=flat?'flat':(tool.kind||'ball'),D=+tool.d||10;
  const d=faoScDropper(red,kind,D,flat?0:tool.cornerR,(+laisse||0)+faoProtectM(op));
  return function(x,y){return d.tip(x,y);};
}

// Ébauche 3D : au-dessus d'une face rouge le brut n'est JAMAIS vidé — un
// rapide qui en survole l'emprise sous le plan de dégagement y entrerait en
// pleine matière. Il passe donc par le plan de dégagement (montée sur place,
// traversée, descente au point d'arrivée).
function faoProtectRapids(mv,pT,secu){
  if(!pT||!mv||!mv.length||!isFinite(+secu))return mv;
  const out=[];let n=0;
  for(let i=0;i<mv.length;i++){
    const b=mv[i],a=i>0?mv[i-1]:null;
    if(!a||!b.r||(a.z>=secu-1e-6&&b.z>=secu-1e-6)){out.push(b);continue;}
    const L=Math.hypot(b.x-a.x,b.y-a.y);
    let hit=false;
    if(L>1e-9){const ns=Math.max(1,Math.ceil(L));
      for(let k=0;k<=ns&&!hit;k++){const t=k/ns;if(pT(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t)>-1e8)hit=true;}}
    if(!hit){out.push(b);continue;}
    if(a.z<secu-1e-6)out.push({r:1,x:a.x,y:a.y,z:secu});
    out.push({r:1,x:b.x,y:b.y,z:secu});
    if(b.z<secu-1e-6)out.push(b);
    n++;
  }
  try{out.diag=mv.diag;}catch(e){}
  return n?out:mv;
}

/* ----- saisie dans la vue ----- */
let faoFacePick=null; // {setupId, opId, key:'faces'|'protect'}
function faoFacePickStart(setupId,opId,key){
  faoFacePick={setupId:setupId,opId:opId,key:key};
  try{renderer.domElement.style.cursor='crosshair';}catch(e){}
  try{faceEl.textContent=(key==='protect'?'Faces INTOUCHABLES (rouge)':'Faces USINABLES (bleu)')+' : cliquez les faces (un clic sur une face choisie la retire)'+(key==='protect'?' — Maj+clic = tout le solide':'')+' — Échap ou « Terminer » pour finir.';}catch(e){}
  try{renderProps();}catch(e){}
}
function faoFacePickCancel(){
  faoFacePick=null;
  try{renderer.domElement.style.cursor='default';}catch(e){}
  try{renderProps();}catch(e){}
}
// Face BRep sous le clic -> {b: corps, f: rang occGroups} ou null
function faoFaceAt(h){
  if(!h||!h.object||h.faceIndex===undefined||h.faceIndex===null)return null;
  const b=(bodies||[]).find(function(q){return q&&q.mesh===h.object;});
  if(!b)return null;
  const gs=(h.object.geometry&&h.object.geometry.userData&&h.object.geometry.userData.occGroups)||[];
  const g=gs.find(function(q){return h.faceIndex>=q.start&&h.faceIndex<q.start+q.count;});
  return g?{b:b,f:g.f}:{b:b,f:null};
}
// Ajoute / retire une face (et ses tangentes) ou un solide entier — message d'état.
// Une face posée dans une liste quitte l'autre (jamais bleue ET rouge).
function faoFaceToggle(op,key,b,f,whole){
  const other=key==='protect'?'faces':'protect';
  op[key]=faoFaceList(op,key).slice();
  const same=function(q,g){return String(q.b)===String(b.id)&&!q.all&&+q.f===+g;};
  if(whole||f===null||f===undefined){
    const has=op[key].some(function(q){return String(q.b)===String(b.id)&&q.all;});
    op[key]=op[key].filter(function(q){return String(q.b)!==String(b.id);});
    if(!has){op[key].push({b:b.id,all:1});
      if(Array.isArray(op[other]))op[other]=op[other].filter(function(q){return String(q.b)!==String(b.id);});}
    return 'solide « '+(b.name||b.id)+' » '+(has?'retiré':'ajouté');
  }
  const has=op[key].some(function(q){return same(q,f);});
  const set=(op.tangent!==false)?faoGeoTangentFaces(b,[f],8):[f];
  if(has)op[key]=op[key].filter(function(q){return !(String(q.b)===String(b.id)&&!q.all&&set.indexOf(+q.f)>=0);});
  else{
    set.forEach(function(g){if(!op[key].some(function(q){return same(q,g);}))op[key].push({b:b.id,f:+g});});
    if(Array.isArray(op[other]))op[other]=op[other].filter(function(q){return !(String(q.b)===String(b.id)&&!q.all&&set.indexOf(+q.f)>=0);});
  }
  return 'face '+(has?'retirée':'ajoutée')+(set.length>1?' avec '+(set.length-1)+' face(s) tangente(s)':'');
}
function faoFacePickCommit(e){
  const t=faoFacePick;if(!t)return;
  const setup=faoSetup(t.setupId);
  const op=setup&&(setup.ops||[]).filter(function(o){return o.id===t.opId;})[0];
  if(!op){faoFacePickCancel();return;}
  let hit=null;try{hit=faoFaceAt(pick(e));}catch(err){hit=null;}
  if(!hit){try{faceEl.textContent='Aucune face ici — cliquez sur le modèle.';}catch(err){}return;}
  const whole=t.key==='protect'&&!!(e&&e.shiftKey);
  faoSnapshot(t.key==='protect'?'faces intouchables':'faces usinables');
  const msg=faoFaceToggle(op,t.key,hit.b,hit.f,whole);
  faoChanged();
  try{faceEl.textContent=(t.key==='protect'?'Intouchables : ':'Usinables : ')+msg+' — '+faoFaceList(op,t.key).length+' élément(s). Parcours à régénérer.';}catch(err){}
  try{renderProps();}catch(err){}
}
// compat Géodésique (tests) : faces pilotes = liste bleue
function faoGeoToggleFace(op,b,f){return faoFaceToggle(op,'faces',b,f,false);}

/* ----- fiche : listes bleue / rouge ----- */
function faoFaceListRow(d,setup,op,key){
  const L=faoFaceList(op,key),n=L.length;
  const r=faoRow();
  const lab=faoLab((key==='protect'?'Intouchables':'Usinables')+' : '+(n?n+' élément'+(n>1?'s':''):'aucun'));
  lab.style.color=key==='protect'?'#ff453a':'#40e0ff';
  r.appendChild(lab);
  const picking=!!(faoFacePick&&faoFacePick.opId===op.id&&faoFacePick.key===key);
  r.appendChild(faoMini(picking?'Terminer':'Choisir dans la vue',function(){
    if(picking)faoFacePickCancel(); else faoFacePickStart(setup.id,op.id,key);
  },picking?'Fermer la saisie.':(key==='protect'
    ?'Cliquez les faces que la fraise ne doit JAMAIS toucher (Maj+clic : tout le solide, ex. étau, bride).'
    :'Cliquez les faces à usiner : seules elles sont finies.')));
  if(n)r.appendChild(faoMini('Effacer',function(){op[key]=[];},'Vider la liste.'));
  d.appendChild(r);
}
function faoFaceListsFiche(d,setup,op){
  if(!faoFaceOps(op))return;
  d.appendChild(faoH('Faces'));
  if(faoFaceBlueOp(op))faoFaceListRow(d,setup,op,'faces');
  faoFaceListRow(d,setup,op,'protect');
  const r=faoRow();
  const cb=document.createElement('input');cb.type='checkbox';cb.checked=op.tangent!==false;
  cb.onchange=function(){faoSnapshot('faces tangentes');op.tangent=cb.checked;faoChanged();};
  const lb=document.createElement('label');lb.className='fao-check';
  lb.title='Un clic choisit aussi les faces raccordées en tangence (ensemble de faces tangentes, comme Fusion 360).';
  lb.appendChild(cb);lb.appendChild(document.createTextNode('Faces tangentes'));
  r.appendChild(lb);
  if(faoFaceList(op,'protect').length){
    r.appendChild(faoLab('Marge'));
    r.appendChild(faoNum(faoProtectM(op),function(v){op.protectM=Math.max(0,v);},44,0.1,'Distance minimale entre l’outil et les faces intouchables (mm).'));
    const cf=document.createElement('input');cf.type='checkbox';cf.checked=!!op.protectFront;
    cf.onchange=function(){faoSnapshot('interdire devant la face');if(cf.checked)op.protectFront=true;else delete op.protectFront;faoChanged();};
    const lf=document.createElement('label');lf.className='fao-check';
    lf.title='Aucune passe DEVANT les faces rouges : le volume entre chaque face rouge et le bord du brut, le long de sa normale, est interdit (le brut y reste). Sans la case : l’outil peut usiner jusqu’à la marge de la face.';
    lf.appendChild(cf);lf.appendChild(document.createTextNode('Interdire devant la face'));
    r.appendChild(lf);
  }
  d.appendChild(r);
  if(op.type==='geodesic'&&!faoFaceList(op,'faces').length)
    d.appendChild(faoHelp('Choisissez les faces usinables (bleu) : les passes les suivent à distance constante mesurée sur la surface, de leurs bords vers le centre.'));
}

/* ----- surlignage persistant (opération sélectionnée) ----- */
let faoFaceHlGrp=null,faoFaceHlSig='';
function faoFaceHlClear(){
  if(faoFaceHlGrp){try{faoFaceHlGrp.traverse(function(o){if(o.geometry)o.geometry.dispose();if(o.material&&o.material.dispose)o.material.dispose();});if(faoFaceHlGrp.parent)faoFaceHlGrp.parent.remove(faoFaceHlGrp);}catch(e){}}
  faoFaceHlGrp=null;
}
function faoFaceHlSync(){
  try{
    if(typeof scene==='undefined'||!scene||typeof THREE==='undefined')return;
    let op=null;
    const ws=document.body&&document.body.getAttribute?document.body.getAttribute('data-ws'):null;
    if(ws!=='cao'&&ws!=='plan'&&typeof sel!=='undefined'&&sel&&sel.kind==='faoOp'){
      const st=faoSetup(sel.setup);op=st&&(st.ops||[]).filter(function(o){return o.id===sel.id;})[0]||null;
    }
    if(!faoFaceOps(op)||(!faoFaceList(op,'faces').length&&!faoFaceList(op,'protect').length)){
      if(faoFaceHlGrp){faoFaceHlClear();faoFaceHlSig='';}return;}
    const sig=op.id+'|'+JSON.stringify(op.faces||[])+'|'+JSON.stringify(op.protect||[])+'|'+bodies.map(function(b){return b.id+(b.mesh&&b.mesh.geometry?b.mesh.geometry.uuid:'');}).join(',');
    if(sig===faoFaceHlSig&&faoFaceHlGrp)return;
    faoFaceHlSig=sig;faoFaceHlClear();
    const g=new THREE.Group();g.name='faoFaceHl';
    const add=function(list,color){
      const want=new Map();
      list.forEach(function(s){const k=String(s.b);if(!want.has(k))want.set(k,{all:false,f:new Set()});const w=want.get(k);if(s.all)w.all=true;else w.f.add(+s.f);});
      bodies.forEach(function(b){
        const w=b&&want.get(String(b.id));if(!w||!b.mesh||!b.mesh.geometry)return;
        const geo=b.mesh.geometry,pos=geo.attributes&&geo.attributes.position;if(!pos)return;
        const gs=(geo.userData&&geo.userData.occGroups)||[];
        const out=[];
        const arr=pos.array,idx=geo.index&&geo.index.array;
        const take=function(k){for(let q=0;q<3;q++){const v=idx?idx[k*3+q]:k*3+q;out.push(arr[v*3],arr[v*3+1],arr[v*3+2]);}};
        if(w.all){const nt=idx?idx.length/3:pos.count/3;for(let k=0;k<nt;k++)take(k);}
        else gs.forEach(function(gr){if(w.f.has(gr.f))for(let k=gr.start;k<gr.start+gr.count;k++)take(k);});
        if(!out.length)return;
        const bg=new THREE.BufferGeometry();
        bg.setAttribute('position',new THREE.Float32BufferAttribute(out,3));
        // couleurs franches : la pièce est déjà bleue — cyan vif pour l'usinable
        const mat=new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:0.7,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
        const m=new THREE.Mesh(bg,mat);m.raycast=function(){};
        try{b.mesh.updateMatrixWorld(true);m.matrixAutoUpdate=false;m.matrix.copy(b.mesh.matrixWorld);}catch(e){}
        g.add(m);
      });
    };
    if(faoFaceBlueOp(op))add(faoFaceList(op,'faces'),0x40e0ff);
    add(faoFaceList(op,'protect'),0xff2d20);
    scene.add(g);faoFaceHlGrp=g;
  }catch(e){}
}
