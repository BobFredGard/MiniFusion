/* ---------- géométrie de construction : plans, axes, points, repères (V0.5.0) ----------
   Éléments de construction de la pièce, comme dans Fusion 360. Ils vivent dans doc.cgeo,
   À PART des fonctions 3D : doc.features est lu partout comme « ce qui fait le solide »
   (partition par corps, featSig, répétitions…) et un plan n'en fait pas partie.
   Leur place dans la timeline est donnée par `at` : l'id de la fonction APRÈS laquelle ils
   sont évalués (null = avant toute fonction). `ai` mémorise l'index de cette fonction au
   dernier rejeu : si elle disparaît, l'élément se raccroche à celle qui la précédait.
   Le repère résolu `fr` {o,x,y,z} est PERSISTÉ : ouverture sans noyau ou référence perdue
   → on garde la dernière position connue (⚠), l'esquisse et le solide ne sautent pas.
     plan   : o + x,y dans le plan, z = normale
     axe    : o + z = direction
     point  : o
     repère : o, x, y, z (orthonormé direct)
   Références (`refs[]`, toutes sérialisables) :
     {k:'o',id:'XY'|'XZ'|'YZ'|'X'|'Y'|'Z'|'O'}   origine
     {k:'cg',id,sub?}                              autre élément (sub : plan ou axe d'un repère)
     {k:'skpt',sk,pt}                              point d'esquisse
     {k:'face'|'edge'|'vtx',…}                     géométrie du modèle (noyau exact, 78/79)
   Une référence s'évalue en formes génériques (cgEvalRef) : {plane,axis,point,frame} ;
   chaque méthode demande des emplacements « de type plan / axe / point / repère ». */
const CG_KINDS={
  plane:{lab:'Plan',ic:'▱'},
  axis:{lab:'Axe',ic:'↗'},
  point:{lab:'Point',ic:'•'},
  frame:{lab:'Repère',ic:'⊹'}
};
// Méthodes : emplacements [type, libellé, facultatif] et valeurs numériques {clé:{lab,def,unit}}
const CG_FR_PAR={dx:{lab:'Décalage X',def:0,unit:'mm'},dy:{lab:'Décalage Y',def:0,unit:'mm'},dz:{lab:'Décalage Z',def:0,unit:'mm'},rz:{lab:'Rotation autour de Z',def:0,unit:'°'}};
const CG_HOW={
  plane:{
    offset:{lab:'Décalé',slots:[['plane','Plan ou face']],par:{d:{lab:'Distance',def:10,unit:'mm'}},flip:true},
    angle:{lab:'À un angle',slots:[['plane','Plan ou face'],['axis','Axe de rotation']],par:{a:{lab:'Angle',def:30,unit:'°'}},flip:true},
    '3pts':{lab:'Par 3 points',slots:[['point','Point 1'],['point','Point 2'],['point','Point 3']],flip:true},
    mid:{lab:'Médian',slots:[['plane','Plan 1'],['plane','Plan 2']],flip:true},
    normal:{lab:'Normal à un axe',slots:[['axis','Axe'],['point','Point',1]],flip:true},
    ext:{lab:'Depuis un autre composant',slots:[],ext:true,flip:true}
  },
  axis:{
    ref:{lab:'Arête, cylindre ou axe',slots:[['axis','Arête droite, cylindre ou axe']],flip:true},
    '2pts':{lab:'Par 2 points',slots:[['point','Point 1'],['point','Point 2']],flip:true},
    inter:{lab:'Intersection de 2 plans',slots:[['plane','Plan 1'],['plane','Plan 2']],flip:true},
    normal:{lab:'Normal à un plan',slots:[['plane','Plan ou face'],['point','Point']],flip:true},
    ext:{lab:'Depuis un autre composant',slots:[],ext:true,flip:true}
  },
  point:{
    ref:{lab:'Sommet, centre ou point d’esquisse',slots:[['point','Point']]},
    xyz:{lab:'Coordonnées',slots:[['frame','Repère (origine si vide)',1]],par:{dx:{lab:'X',def:0,unit:'mm'},dy:{lab:'Y',def:0,unit:'mm'},dz:{lab:'Z',def:0,unit:'mm'}}},
    inter:{lab:'Intersection axe / plan',slots:[['axis','Axe'],['plane','Plan ou face']]},
    ext:{lab:'Depuis un autre composant',slots:[],ext:true}
  },
  frame:{
    zx:{lab:'Origine, Z et X',slots:[['point','Origine'],['axis','Direction Z'],['axis','Direction X',1]],par:CG_FR_PAR,flip:true},
    face:{lab:'Sur un plan ou une face',slots:[['plane','Plan ou face'],['axis','Direction X',1]],par:CG_FR_PAR,flip:true},
    '3pts':{lab:'Par 3 points',slots:[['point','Origine'],['point','Point sur X'],['point','Point dans XY']],par:CG_FR_PAR,flip:true},
    ext:{lab:'Depuis un autre composant',slots:[],ext:true,par:CG_FR_PAR,flip:true}
  }
};
// ext (V0.6.4) : référence à un élément (ou à l'origine) d'une AUTRE instance de l'assemblage,
// el.ext = {ctx (instance où l'on travaille), path (instance visée), cg | o, frozen, last} —
// résolue par asmExtFrame (46) ; figée, elle garde sa position.
const CG_DEF_HOW={plane:'offset',axis:'ref',point:'xyz',frame:'zx'};
/* ── vecteurs (tableaux [x,y,z]) : le modèle ne dépend pas de three.js ── */
const cgAdd=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const cgSub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cgMul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const cgDot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cgCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const cgLen=a=>Math.hypot(a[0],a[1],a[2]);
function cgUnit(a){const L=cgLen(a);if(!(L>1e-12))throw new Error('direction nulle');return [a[0]/L,a[1]/L,a[2]/L];}
function cgArr(v){return Array.isArray(v)?[+v[0]||0,+v[1]||0,+v[2]||0]:[+v.x||0,+v.y||0,+v.z||0];}
function cgRot(p,o,d,ang){
  // Rotation de p autour de la droite (o, d unitaire) d'un angle ang (radians) — Rodrigues
  const v=cgSub(p,o),c=Math.cos(ang),s=Math.sin(ang);
  const r=cgAdd(cgAdd(cgMul(v,c),cgMul(cgCross(d,v),s)),cgMul(d,cgDot(d,v)*(1-c)));
  return cgAdd(r,o);
}
function cgRotDir(v,d,ang){return cgRot(v,[0,0,0],d,ang);}
function cgBasisN(n,uHint){
  // (u,v) dans le plan de normale n : u = uHint projeté (sinon X, sinon Y du monde).
  // Plan vertical ou incliné : v vers le HAUT, comme une esquisse posée sur une face.
  n=cgUnit(n);
  let u=null;
  if(uHint){u=cgSub(uHint,cgMul(n,cgDot(n,uHint)));if(cgLen(u)<1e-8)u=null;}
  if(!u){u=cgSub([1,0,0],cgMul(n,n[0]));if(cgLen(u)<1e-8)u=cgSub([0,1,0],cgMul(n,n[1]));}
  u=cgUnit(u);
  let v=cgCross(n,u);
  if(!uHint&&Math.abs(n[2])<0.95&&v[2]<-1e-6){u=cgMul(u,-1);v=cgMul(v,-1);}
  return {u,v,n};
}
function cgOrtho(z,xHint){
  // Repère direct à partir de Z et d'une direction X (projetée ⟂ Z) — même règle que faoFrame
  z=cgUnit(z);
  let warn='';
  let x=xHint?cgSub(xHint,cgMul(z,cgDot(z,xHint))):null;
  if(!x||cgLen(x)<1e-8){
    if(xHint)warn='X parallèle à Z : X remplacé';
    x=cgBasisN(z,null).u;
  }
  x=cgUnit(x);
  return {x,y:cgCross(z,x),z,warn};
}
/* ── accès ── */
function cgList(){if(!doc.cgeo)doc.cgeo=[];return doc.cgeo;}
function cgGet(id){return (doc.cgeo||[]).find(c=>c&&c.id===id)||null;}
function cgClean(c){
  // Copie sans transitoires (_…) : sauvegarde, instantané d'annulation, empreinte
  const o={};Object.keys(c||{}).forEach(k=>{if(k[0]!=='_')o[k]=c[k];});
  if(o.p&&typeof o.p==='object'){const p={};Object.keys(o.p).forEach(k=>{if(k[0]!=='_')p[k]=o.p[k];});o.p=p;}
  return o;
}
function cgValid(c){return !!(c&&typeof c.id==='string'&&CG_KINDS[c.kind]&&CG_HOW[c.kind]&&Array.isArray(c.refs));}
function cgAutoName(kind){
  const lab=CG_KINDS[kind].lab;let mx=0;
  (doc.cgeo||[]).forEach(c=>{const m=new RegExp('^'+lab+' (\\d+)$').exec(c&&c.name||'');if(m)mx=Math.max(mx,+m[1]);});
  return lab+' '+(mx+1);
}
function cgAtNow(){
  // Place d'un nouvel élément : après la dernière fonction rejouée (avant le marqueur temps)
  const m=tlIdx(),F=doc.features||[];
  const i=(m<0?F.length:m)-1;
  return i>=0?F[i].id:null;
}
function cgDefaults(kind,how){
  const H=CG_HOW[kind][how],p={};
  Object.keys((H&&H.par)||{}).forEach(k=>{p[k]=H.par[k].def;});
  return p;
}
function cgNew(kind,how,refs,p,name){
  // Création (instantané d'annulation compris). L'appelant fait markDirty + rebuild.
  if(!CG_KINDS[kind])throw new Error('type inconnu : '+kind);
  how=how||CG_DEF_HOW[kind];
  if(!CG_HOW[kind][how])throw new Error('méthode inconnue : '+how);
  const el={id:uid('cg'),kind,how,name:name||cgAutoName(kind),refs:(refs||[]).map(r=>r?JSON.parse(JSON.stringify(r)):null),
    p:Object.assign(cgDefaults(kind,how),p||{}),at:cgAtNow(),visible:true,fr:null,st:'ok',msg:''};
  docPushUndo('création de « '+el.name+' »');
  cgList().push(el);
  try{cgResolveOne(el,{});}catch(e){}
  return el;
}
function cgDelete(id){
  const el=cgGet(id);if(!el)return false;
  docPushUndo('suppression de « '+el.name+' »');
  doc.cgeo=doc.cgeo.filter(c=>c.id!==id);
  // Les esquisses posées dessus restent où elles sont (plan figé, comme un hôte perdu)
  (doc.sketches||[]).forEach(sk=>{if(sk.plane==='CG'&&sk.cg&&sk.cg.id===id)cgDetachSketch(sk);});
  // Les éléments qui en dépendaient gardent leur dernière position (⚠ au rejeu)
  return true;
}
function cgDetachSketch(sk){
  sk.plane='FACE';delete sk.cg;sk.host=null;
}
function cgUsers(id){
  // Ce qui s'appuie sur l'élément : esquisses et autres éléments (pour prévenir avant suppression)
  const sks=(doc.sketches||[]).filter(sk=>sk.plane==='CG'&&sk.cg&&sk.cg.id===id);
  const cgs=(doc.cgeo||[]).filter(c=>c.id!==id&&(c.refs||[]).some(r=>r&&r.k==='cg'&&r.id===id));
  return {sks,cgs};
}
/* ── place dans la timeline ── */
function cgPos(el){
  // Index (dans doc.features) de la fonction après laquelle l'élément est évalué, -1 = au début.
  // Fonction d'ancrage disparue : on se raccroche à celle qui la précédait (index mémorisé).
  const F=doc.features||[];
  if(el.at==null)return -1;
  let i=F.findIndex(f=>f.id===el.at);
  if(i<0){
    i=Math.min(isFinite(+el.ai)?+el.ai:F.length,F.length)-1;
    el.at=i>=0?F[i].id:null;
  }
  return i;
}
function cgLocked(el){const m=tlIdx();return m>=0&&cgPos(el)>=m;}
function cgUpto(el){
  // Nombre de fonctions VISIBLES rejouées avant l'élément (upto d'occFinalShape)
  const i=cgPos(el);
  return (doc.features||[]).slice(0,i+1).reduce((n,f)=>n+(f.visible!==false?1:0),0);
}
function cgOrder(){
  // Ordre de résolution : place dans la timeline, puis ordre de création
  const L=(doc.cgeo||[]).filter(cgValid).map((c,k)=>({c,k,i:cgPos(c)}));
  L.sort((a,b)=>(a.i-b.i)||(a.k-b.k));
  return L.map(o=>o.c);
}
/* ── évaluation d'une référence ── */
const CG_O_PLANES={XY:{u:[1,0,0],v:[0,1,0],n:[0,0,1]},XZ:{u:[1,0,0],v:[0,0,1],n:[0,-1,0]},YZ:{u:[0,1,0],v:[0,0,1],n:[1,0,0]}};
const CG_FRAME0={o:[0,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]};
function cgFrameSub(F,sub){
  // Plan / axe d'un repère, mêmes conventions que les plans d'origine (planeBasis)
  if(sub==='XY')return {plane:{o:F.o,u:F.x,v:F.y,n:F.z}};
  if(sub==='XZ')return {plane:{o:F.o,u:F.x,v:F.z,n:cgMul(F.y,-1)}};
  if(sub==='YZ')return {plane:{o:F.o,u:F.y,v:F.z,n:F.x}};
  if(sub==='X')return {axis:{o:F.o,d:F.x}};
  if(sub==='Y')return {axis:{o:F.o,d:F.y}};
  if(sub==='Z')return {axis:{o:F.o,d:F.z}};
  return null;
}
function cgShapes(el){
  // Formes génériques qu'offre un élément résolu
  const F=el&&el.fr;if(!F)return null;
  if(el.kind==='plane')return {plane:{o:F.o,u:F.x,v:F.y,n:F.z},point:{o:F.o}};
  if(el.kind==='axis')return {axis:{o:F.o,d:F.z},point:{o:F.o}};
  if(el.kind==='point')return {point:{o:F.o}};
  return {frame:F,point:{o:F.o},plane:{o:F.o,u:F.x,v:F.y,n:F.z},axis:{o:F.o,d:F.z}};
}
function cgEvalRef(ref,ctx){
  // → {plane?,axis?,point?,frame?} ou null (référence introuvable)
  if(!ref)return null;
  if(ref.k==='o'){
    const P=CG_O_PLANES[ref.id];
    if(P)return {plane:{o:[0,0,0],u:P.u,v:P.v,n:P.n},point:{o:[0,0,0]}};
    if(ref.id==='X'||ref.id==='Y'||ref.id==='Z')return Object.assign(cgFrameSub(CG_FRAME0,ref.id),{point:{o:[0,0,0]}});
    if(ref.id==='O')return {point:{o:[0,0,0]},frame:CG_FRAME0};
    return null;
  }
  if(ref.k==='cg'){
    const el=cgGet(ref.id);if(!el||!el.fr)return null;
    if(ctx&&ctx.self&&ctx.order&&ctx.order.indexOf(el)>ctx.order.indexOf(ctx.self))ctx.later=true; // référence postérieure
    if(ref.sub&&el.kind==='frame'){const s=cgFrameSub(el.fr,ref.sub);if(s)s.point={o:el.fr.o};return s;}
    return cgShapes(el);
  }
  if(ref.k==='skpt'){
    const sk=(doc.sketches||[]).find(s=>s.id===ref.sk);if(!sk)return null;
    const q=sk.points&&sk.points[ref.pt];if(!q)return null;
    const B=sketchBasis(sk);
    const o=cgAdd(cgAdd(cgArr(B.o),cgMul(cgArr(B.u),+q.x||0)),cgMul(cgArr(B.v),+q.y||0));
    return {point:{o}};
  }
  // Face d'un AUTRE composant de l'assemblage (46 : asmXfEval)
  if(ref.k==='xf')return typeof asmXfEval==='function'?asmXfEval(ref):null;
  // Géométrie du modèle (faces, arêtes, sommets) : noyau exact
  return cgEvalModelRef(ref,ctx);
}
/* ── construction ── */
function cgSlot(el,ctx,i,type,opt){
  const r=el.refs[i];
  if(!r){if(opt)return null;throw new Error('référence '+(i+1)+' manquante');}
  const g=cgEvalRef(r,ctx);
  if(!g){
    if(r.k==='cg')throw new Error('référence '+(i+1)+' supprimée ou non résolue');
    if(r.k==='xf')throw new Error('référence '+(i+1)+' : face de l’autre composant introuvable — position mémorisée');
    if((r.k==='face'||r.k==='edge'||r.k==='vtx')&&!(typeof occHas==='function'&&occHas()))throw new Error('noyau exact indisponible : position mémorisée');
    throw new Error('référence '+(i+1)+' introuvable — la pièce a changé');
  }
  if(!g[type])throw new Error('référence '+(i+1)+' : ce n’est pas un '+({plane:'plan',axis:'axe',point:'point',frame:'repère'})[type]);
  return g[type];
}
function cgNum(el,k){const v=+(el.p&&el.p[k]);return isFinite(v)?v:0;}
function cgFrPlane(o,u,v,n){return {o:cgArr(o),x:cgUnit(u),y:cgUnit(v),z:cgUnit(n)};}
function cgFrAxis(o,d){const z=cgUnit(d),B=cgBasisN(z,null);return {o:cgArr(o),x:B.u,y:B.v,z};}
function cgBuild(el,ctx){
  // → {fr,warn} ; lève une Error lisible si la construction est impossible
  const S=(i,t,opt)=>cgSlot(el,ctx,i,t,opt);
  const flip=!!(el.p&&el.p.flip);
  let fr=null,warn='';
  // référence externe (ext) : repère de l'élément visé, exprimé dans ce composant
  if(el.how==='ext'&&el.ext&&el.ext.frozen&&el.fr)return {fr:el.fr,warn:''};
  const X=()=>{const F=asmExtFrame(el);if(!F)throw new Error('référence externe introuvable : position mémorisée');el.ext.last=cgRound(F);return F;};
  if(el.kind==='plane'){
    if(el.how==='offset'){
      const P=S(0,'plane');
      fr=cgFrPlane(cgAdd(P.o,cgMul(P.n,cgNum(el,'d'))),P.u,P.v,P.n);
    }else if(el.how==='angle'){
      const P=S(0,'plane'),A=S(1,'axis'),d=cgUnit(A.d);
      if(Math.abs(cgDot(d,cgUnit(P.n)))>1e-6)warn='axe non contenu dans le plan : rotation autour de l’axe quand même';
      const a=cgNum(el,'a')*Math.PI/180;
      // origine : projection de l'origine du plan sur l'axe (le plan pivote AUTOUR de l'axe)
      const o=cgAdd(A.o,cgMul(d,cgDot(cgSub(P.o,A.o),d)));
      fr=cgFrPlane(o,cgRotDir(P.u,d,a),cgRotDir(P.v,d,a),cgRotDir(P.n,d,a));
    }else if(el.how==='3pts'){
      const a=S(0,'point').o,b=S(1,'point').o,c=S(2,'point').o;
      const n=cgCross(cgSub(b,a),cgSub(c,a));
      if(cgLen(n)<1e-9*Math.max(1,cgLen(cgSub(b,a))*cgLen(cgSub(c,a))))throw new Error('points alignés : aucun plan unique');
      const u=cgUnit(cgSub(b,a));
      fr=cgFrPlane(a,u,cgCross(cgUnit(n),u),n);
    }else if(el.how==='mid'){
      const P=S(0,'plane'),Q=S(1,'plane'),n1=cgUnit(P.n);let n2=cgUnit(Q.n);
      if(cgDot(n1,n2)<0)n2=cgMul(n2,-1);
      if(cgDot(n1,n2)<1-1e-6)throw new Error('plans non parallèles : pas de plan médian');
      const e=cgDot(n1,cgSub(Q.o,P.o));
      fr=cgFrPlane(cgAdd(P.o,cgMul(n1,e/2)),P.u,P.v,n1);
    }else if(el.how==='normal'){
      const A=S(0,'axis'),Pt=S(1,'point',true),n=cgUnit(A.d);
      const B=cgBasisN(n,null);
      fr=cgFrPlane(Pt?Pt.o:A.o,B.u,B.v,n);
    }else if(el.how==='ext'){
      const F=X();fr=cgFrPlane(F.o,F.x,F.y,F.z);
    }
    if(fr&&flip){fr.y=cgMul(fr.y,-1);fr.z=cgMul(fr.z,-1);}
  }else if(el.kind==='axis'){
    let o,d;
    if(el.how==='ref'){const A=S(0,'axis');o=A.o;d=A.d;}
    else if(el.how==='2pts'){
      const a=S(0,'point').o,b=S(1,'point').o;
      if(cgLen(cgSub(b,a))<1e-9)throw new Error('points confondus');
      o=a;d=cgSub(b,a);
    }else if(el.how==='inter'){
      const P=S(0,'plane'),Q=S(1,'plane'),n1=cgUnit(P.n),n2=cgUnit(Q.n);
      d=cgCross(n1,n2);
      if(cgLen(d)<1e-9)throw new Error('plans parallèles : pas d’intersection');
      const c1=cgDot(n1,P.o),c2=cgDot(n2,Q.o),k=cgDot(n1,n2),den=1-k*k;
      const p0=cgAdd(cgMul(n1,(c1-c2*k)/den),cgMul(n2,(c2-c1*k)/den));
      const du=cgUnit(d),m=cgMul(cgAdd(P.o,Q.o),0.5);
      o=cgAdd(p0,cgMul(du,cgDot(cgSub(m,p0),du))); // au droit du milieu des deux origines
    }else if(el.how==='normal'){
      const P=S(0,'plane'),Pt=S(1,'point'),n=cgUnit(P.n);
      o=cgSub(Pt.o,cgMul(n,cgDot(cgSub(Pt.o,P.o),n))); // pied sur le plan
      d=n;
    }else if(el.how==='ext'){const F=X();o=F.o;d=F.z;}
    if(d&&flip)d=cgMul(d,-1);
    fr=cgFrAxis(o,d);
  }else if(el.kind==='point'){
    let o;
    if(el.how==='ref')o=S(0,'point').o;
    else if(el.how==='xyz'){
      const F=S(0,'frame',true)||CG_FRAME0;
      o=cgAdd(cgAdd(cgAdd(F.o,cgMul(F.x,cgNum(el,'dx'))),cgMul(F.y,cgNum(el,'dy'))),cgMul(F.z,cgNum(el,'dz')));
    }else if(el.how==='inter'){
      const A=S(0,'axis'),P=S(1,'plane'),d=cgUnit(A.d),n=cgUnit(P.n),den=cgDot(n,d);
      if(Math.abs(den)<1e-9)throw new Error('axe parallèle au plan : pas d’intersection');
      o=cgAdd(A.o,cgMul(d,cgDot(n,cgSub(P.o,A.o))/den));
    }else if(el.how==='ext')o=X().o;
    fr={o:cgArr(o),x:[1,0,0],y:[0,1,0],z:[0,0,1]};
  }else if(el.kind==='frame'){
    let O,R;
    if(el.how==='zx'){
      O=S(0,'point').o;const Z=S(1,'axis'),X=S(2,'axis',true);
      R=cgOrtho(Z.d,X?X.d:null);
    }else if(el.how==='face'){
      const P=S(0,'plane'),X=S(1,'axis',true);
      O=P.o;R=cgOrtho(P.n,X?X.d:P.u);
    }else if(el.how==='3pts'){
      const a=S(0,'point').o,b=S(1,'point').o,c=S(2,'point').o;
      const X=cgSub(b,a),Z=cgCross(X,cgSub(c,a));
      if(cgLen(X)<1e-9)throw new Error('origine et point sur X confondus');
      if(cgLen(Z)<1e-9*Math.max(1,cgLen(X)*cgLen(cgSub(c,a))))throw new Error('points alignés : plan XY indéfini');
      O=a;R=cgOrtho(Z,X);
    }else if(el.how==='ext'){const F=X();O=F.o;R={x:F.x,y:F.y,z:F.z};}
    warn=R.warn||'';
    let x=R.x,y=R.y,z=R.z;
    if(flip){z=cgMul(z,-1);y=cgMul(y,-1);}
    const rz=cgNum(el,'rz')*Math.PI/180;
    if(rz){const c=Math.cos(rz),s=Math.sin(rz);const xn=cgAdd(cgMul(x,c),cgMul(y,s));y=cgAdd(cgMul(y,c),cgMul(x,-s));x=xn;}
    O=cgAdd(cgAdd(cgAdd(cgArr(O),cgMul(x,cgNum(el,'dx'))),cgMul(y,cgNum(el,'dy'))),cgMul(z,cgNum(el,'dz')));
    fr={o:O,x,y,z};
  }
  if(!fr)throw new Error('méthode inconnue : '+el.how);
  return {fr,warn};
}
function cgRound(fr){
  // Arrondi stable (empreinte, signature d'esquisse) : 1 nm sur la position, 1e-9 sur les axes
  const r=(v,q)=>v.map(x=>{const y=Math.round(x*q)/q;return Object.is(y,-0)?0:y;});
  return {o:r(fr.o,1e6),x:r(fr.x,1e9),y:r(fr.y,1e9),z:r(fr.z,1e9)};
}
function cgSameFr(a,b){
  if(!a||!b)return false;
  for(const k of ['o','x','y','z'])for(let i=0;i<3;i++)if(Math.abs((a[k]||[])[i]-(b[k]||[])[i])>1e-9)return false;
  return true;
}
function cgResolveOne(el,ctx){
  // Résout UN élément ; garde l'ancien repère si c'est impossible (⚠). → true si fr a changé
  const prev=el.fr;
  ctx=ctx||{};ctx.self=el;ctx.later=false;
  try{
    const r=cgBuild(el,ctx);
    const fr=cgRound(r.fr);
    const later=ctx.later?'référence à un élément créé après':'';
    el.st=(r.warn||later)?'warn':'ok';el.msg=[r.warn,later].filter(Boolean).join(' ; ');
    if(cgSameFr(prev,fr))return false;
    el.fr=fr;return true;
  }catch(err){
    el.st='warn';el.msg=(err&&err.message)||String(err);
    return false;
  }finally{ctx.self=null;}
}
function cgSketchBase(sk){
  // Base (o,u,v,n) d'une esquisse posée sur un élément de construction, ou null
  if(!sk||sk.plane!=='CG'||!sk.cg)return null;
  const g=cgEvalRef({k:'cg',id:sk.cg.id,sub:sk.cg.sub||null},null);
  return g&&g.plane?g.plane:null;
}
function cgSyncSketch(sk){
  // Recopie la base de l'élément porteur dans l'esquisse (origin/axU/axV/axN) → true si changé
  if(!sk||sk.plane!=='CG')return false;
  if(!sk.cg||!cgGet(sk.cg.id)){cgDetachSketch(sk);return true;}
  const P=cgSketchBase(sk);if(!P)return false;
  const o=P.o.map(v=>+(+v).toFixed(6)),u=cgArr(P.u),v=cgArr(P.v),n=cgArr(P.n);
  const same=(a,b)=>Array.isArray(a)&&a.length===3&&a.every((x,i)=>Math.abs(x-b[i])<1e-9);
  if(same(sk.origin,o)&&same(sk.axU,u)&&same(sk.axV,v)&&same(sk.axN,n))return false;
  sk.origin=o;sk.axU=u;sk.axV=v;sk.axN=n;
  return true;
}
function cgResolveAll(){
  // Appelé à chaque rejeu (rebuildInner), après les hôtes de faces et avant les projections.
  // Ordre timeline ; chaque élément résolu transmet aussitôt sa base aux esquisses posées
  // dessus. → true si une esquisse a bougé (l'appelant refait passer les hôtes de faces).
  let ch=false;
  const order=cgOrder(),ctx={order,shapes:new Map()};
  try{
    for(const el of order){
      el.ai=cgPos(el);
      if(!cgLocked(el))cgResolveOne(el,ctx);
      for(const sk of (doc.sketches||[]))if(sk.plane==='CG'&&sk.cg&&sk.cg.id===el.id){if(cgSyncSketch(sk))ch=true;}
    }
    // esquisses dont l'élément porteur a disparu (fichier abîmé, suppression hors cgDelete)
    for(const sk of (doc.sketches||[]))if(sk.plane==='CG'&&(!sk.cg||!cgGet(sk.cg.id))){cgDetachSketch(sk);ch=true;}
  }finally{
    cgShapesRelease(ctx);
  }
  return ch;
}
function cgKindLabel(el){return el?(CG_KINDS[el.kind]||{lab:'?'}).lab:'?';}
function cgHowLabel(el){const H=el&&CG_HOW[el.kind]&&CG_HOW[el.kind][el.how];return H?H.lab:'?';}
/* ── géométrie du modèle : faces, arêtes, sommets (noyau exact) ── */
function cgShapeFor(ctx){
  // Solide sur lequel résoudre : pendant le rejeu, celui qui précède l'élément (antériorité,
  // occFinalShape mis en cache par position le temps de la passe) ; à la création ou dans
  // l'aperçu, le solide affiché — celui sur lequel l'utilisateur vient de cliquer.
  if(ctx&&ctx.shapes&&ctx.self&&(doc.cgeo||[]).indexOf(ctx.self)>=0){
    const up=cgUpto(ctx.self);
    if(!ctx.shapes.has(up)){let FR=null;try{FR=occFinalShape(up);}catch(e){FR=null;}ctx.shapes.set(up,FR);}
    const FR=ctx.shapes.get(up);
    return FR&&FR.shape&&!FR.shape.IsNull()?FR.shape:null;
  }
  return (occLive&&occLive.shape)?occLive.shape:null;
}
function cgEdgesOf(shape,ctx){
  // Arêtes (données pures : mid, pts, len) — une seule énumération par solide et par passe
  if(ctx){ctx.edges=ctx.edges||new Map();if(ctx.edges.has(shape))return ctx.edges.get(shape);}
  let L=[];try{L=occListEdges(shape);}catch(e){L=[];}
  if(ctx)ctx.edges.set(shape,L);
  return L;
}
function cgFindEdge(edges,se){
  // Même nommage persistant que les congés exacts : ancre d'esquisse (suit les éditions),
  // départagée par la dernière position connue ; sinon la plus proche de même longueur.
  if(!se.anchor){try{const a=xAnchorFor(se.pos);if(a)se.anchor=a;}catch(e){}}
  const dist=i=>{const m=edges[i].mid;return Math.hypot(m[0]-se.pos[0],m[1]-se.pos[1],m[2]-se.pos[2]);};
  let anc=[];try{anc=se.anchor?xAnchorMatch(se,edges):[];}catch(e){anc=[];}
  if(anc.length){anc.sort((a,b)=>dist(a)-dist(b));return anc[0];}
  let best=-1,bd=2.5;
  edges.forEach((e,i)=>{
    const d=dist(i);if(d>bd)return;
    if(se.len>0&&Math.abs(e.len-se.len)>Math.max(2,0.35*se.len))return;
    bd=d;best=i;
  });
  return best;
}
function cgEdgeGeom(P){
  // Droite → {line:{a,b}} ; cercle ou arc → {circ:{c,n,r}} ; sinon null
  if(!P||P.length<2)return null;
  const a=P[0],b=P[P.length-1],d=cgSub(b,a),L=cgLen(d);
  if(L>1e-9){
    let dev=0;for(const q of P){dev=Math.max(dev,cgLen(cgCross(cgSub(q,a),d))/L);}
    if(dev<=Math.max(1e-4,0.002*L))return {line:{a,b}};
  }
  if(P.length<5)return null;
  const p0=P[0],p1=P[Math.floor(P.length/3)],p2=P[Math.floor(2*P.length/3)];
  const u=cgSub(p1,p0),w=cgSub(p2,p0),n=cgCross(u,w),nn=cgDot(n,n);
  if(nn<1e-12)return null;
  // centre du cercle circonscrit (3D)
  const c=cgAdd(p0,cgMul(cgAdd(cgMul(cgCross(n,u),cgDot(w,w)),cgMul(cgCross(w,n),cgDot(u,u))),1/(2*nn)));
  const r=cgLen(cgSub(p0,c));
  for(const q of P){if(Math.abs(cgLen(cgSub(q,c))-r)>Math.max(0.02,0.01*r))return null;}
  return {circ:{c,n:cgUnit(n),r}};
}
function cgEvalModelRef(ref,ctx){
  // Références à la pièce (face / arête / sommet), résolues sur le solide qui précède l'élément.
  // Sans noyau exact, ou référence introuvable : null → l'élément garde sa position (⚠).
  if(!ref||!(typeof occHas==='function'&&occHas()))return null;
  const shape=cgShapeFor(ctx);if(!shape)return null;
  if(ref.k==='face'){
    let f=null,ad=null;
    try{
      f=occFindFaceAny(shape,ref.ref);if(!f)return null;
      const b=occFaceBox(f);if(!b)return null;
      ad=new occt.BRepAdaptor_Surface_2(f,true);
      const T=occt.GeomAbs_SurfaceType,gt=ad.GetType();
      if(gt===T.GeomAbs_Plane){
        const n=occFaceOutNormal(f);if(!n)return null;
        const B=cgBasisN(n,null);
        return {plane:{o:b.pos,u:B.u,v:B.v,n:B.n},point:{o:b.pos}};
      }
      if(gt===T.GeomAbs_Cylinder||gt===T.GeomAbs_Cone){
        const ax=(gt===T.GeomAbs_Cylinder?ad.Cylinder():ad.Cone()).Axis();
        const d=cgUnit([ax.Direction().X(),ax.Direction().Y(),ax.Direction().Z()]),lo=[ax.Location().X(),ax.Location().Y(),ax.Location().Z()];
        const o=cgAdd(lo,cgMul(d,cgDot(cgSub(b.pos,lo),d))); // au droit du centre de la face
        return {axis:{o,d},point:{o}};
      }
      return {point:{o:b.pos}};
    }catch(e){return null;}
    finally{try{if(ad)ad.delete();}catch(e){}try{if(f)f.delete();}catch(e){}}
  }
  if(ref.k==='edge'||ref.k==='vtx'){
    const edges=cgEdgesOf(shape,ctx);
    const i=cgFindEdge(edges,ref);if(i<0)return null;
    const E=edges[i];
    ref.pos=E.mid.map(v=>+v.toFixed(4));ref.len=+E.len.toFixed(4); // la référence suit l'arête (comme un congé)
    if(ref.k==='vtx'){
      const a=E.pts[0],b=E.pts[E.pts.length-1],q=ref.vpos||a;
      const o=(cgLen(cgSub(a,q))<=cgLen(cgSub(b,q)))?a:b;
      ref.vpos=o.map(v=>+v.toFixed(4));
      return {point:{o}};
    }
    const G=cgEdgeGeom(E.pts);if(!G)return {point:{o:E.mid}};
    if(G.line)return {axis:{o:E.mid,d:cgSub(G.line.b,G.line.a)},point:{o:E.mid}};
    const B=cgBasisN(G.circ.n,null);
    return {point:{o:G.circ.c},axis:{o:G.circ.c,d:G.circ.n},plane:{o:G.circ.c,u:B.u,v:B.v,n:B.n}};
  }
  return null;
}
function cgShapesRelease(ctx){
  // Libère les solides rejoués le temps d'une passe de résolution
  if(!ctx||!ctx.shapes)return;
  ctx.shapes.forEach(FR=>{try{occCleanup(FR,null);}catch(e){}});
  ctx.shapes.clear();
}
