/* ---------- déplacer un corps (V0.9.11) ----------
   Fonction de la timeline {type:'bmove', body, steps:[…]}, comme « Déplacer / Copier » de
   Fusion 360 : très utile pour poser un STEP importé à sa place. Les étapes s'enchaînent
   dans l'ordre, en coordonnées de la pièce :
     {k:'t', v:[x,y,z]}                       translation libre
     {k:'d', o, d:[unitaire], dist, name}       translation suivant une direction
     {k:'r', o, d:[unitaire], deg, name}        rotation autour d'un axe (o, d)
     {k:'p', a, b, na, nb}                      point à point (a → b)
   Les points et les axes choisis dans la vue sont FIGÉS en coordonnées (comme Fusion) :
   la fonction ne suit pas une référence qui bouge ensuite. Le rejeu (20 : occReplayBody)
   transforme le solide exact du corps (BRepBuilderAPI_Transform) ; un import seul entre
   alors dans la chaîne exacte et se déplace avec son BRep.
   Saisie dans la vue (bmPick) : clic sur une face → ses points d'accroche (centre, coins,
   milieux et bouts d'arêtes, centres de cercles — 48 : asmSnapItems) ou ses axes (axe du
   cylindre, des cercles, arêtes droites, normale) ; clic sur une pastille = choix. Le
   panneau propose aussi l'origine, les centres des corps et la géométrie de construction.
   Un composant (occurrence) se déplace, lui, en mode Assembler — s'il n'est ni fixé ni lié. */
let bmPick=null; // saisie en cours {fid, want:'from'|'to'|'axis'|'dir', from?, face?:{pts|axes}}
const BM_AX={X:[1,0,0],Y:[0,1,0],Z:[0,0,1]};
function bmFeat(id){return (doc.features||[]).find(f=>f&&f.id===id&&f.type==='bmove')||null;}
function bmBodyName(id){const e=(doc.bodies||[]).find(b=>b.id===id);return e?e.name:'corps';}
function bmName(f){return 'Déplacer « '+bmBodyName(f.body)+' »';}
function bmFmt(v,n){return String(+(+v||0).toFixed(n==null?3:n)).replace('.',',');}
function bmP(p){return '('+p.map(v=>bmFmt(v,2)).join(' ; ')+')';}
/* ── géométrie : composition des étapes ── */
function bmFrame(f){
  // Repère image du repère de la pièce : p ↦ o + x·px + y·py + z·pz (même forme que asmTrsf)
  let F={o:[0,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]};
  const add=(v)=>{F.o=[F.o[0]+v[0],F.o[1]+v[1],F.o[2]+v[2]];};
  (f.steps||[]).forEach(s=>{
    if(!s)return;
    if(s.k==='t')add((s.v||[]).map(x=>+x||0));
    else if(s.k==='d'){const d=asmV.unit(s.d||[0,0,0]);if(d)add(asmV.mul(d,+s.dist||0));}
    else if(s.k==='p')add(asmV.sub(s.b,s.a));
    else if(s.k==='r'){
      const d=asmV.unit(s.d||[0,0,0]),ang=(+s.deg||0)*Math.PI/180;if(!d||!ang)return;
      F={o:cgRot(F.o,s.o,d,ang),x:cgRotDir(F.x,d,ang),y:cgRotDir(F.y,d,ang),z:cgRotDir(F.z,d,ang)};
    }
  });
  return F;
}
function bmIsIdentity(F){
  const I=[[0,0,0],[1,0,0],[0,1,0],[0,0,1]],V=[F.o,F.x,F.y,F.z];
  return V.every((v,i)=>v.every((x,j)=>Math.abs(x-I[i][j])<1e-12));
}
function bmPt(F,p){return [0,1,2].map(i=>F.o[i]+F.x[i]*p[0]+F.y[i]*p[1]+F.z[i]*p[2]);}
function occApplyBodyMove(result,f){
  // Rejeu (20) : {shape, warnings} comme occApplyMoveFace ; le solide d'entrée est libéré
  const F=bmFrame(f);
  if(bmIsIdentity(F))return {shape:result,warnings:(f.steps||[]).length?[]:['aucune étape — le corps reste en place']};
  let t=null,b=null;
  try{
    t=asmTrsf(F);b=new occt.BRepBuilderAPI_Transform_2(result,t,true);
    const s=b.Shape();if(!s||s.IsNull())throw new Error('transformation vide');
    try{result.delete();}catch(e){}
    return {shape:s,warnings:[]};
  }catch(e){
    return {shape:result,warnings:['déplacement impossible ('+((e&&e.message)||e)+')'],fatal:true};
  }finally{try{if(b)b.delete();}catch(e){}try{if(t)t.delete();}catch(e){}}
}
/* ── références proposées ── */
function bmBodyCentre(bid){
  // Centre de gravité du corps tel qu'affiché (solide exact), sinon centre de sa boîte
  const bd=(typeof bodies!=='undefined'?bodies:[]).find(b=>b.id===bid||(b.bodyId===bid&&b.mesh));
  if(!bd)return null;
  try{if(bd.shape&&typeof asmVolCom==='function'){const r=asmVolCom(bd.shape);if(r&&r.v>1e-9)return r.c;}}catch(e){}
  try{const B=new THREE.Box3().setFromObject(bd.mesh),c=B.getCenter(new THREE.Vector3());if(!B.isEmpty())return [c.x,c.y,c.z];}catch(e){}
  return null;
}
function bmStaticPts(){
  // [{name, p}] : origine, centre de chaque corps, points / origines de repères de construction
  const out=[{name:'Origine',p:[0,0,0]}];
  (doc.bodies||[]).forEach(b=>{const c=bmBodyCentre(b.id);if(c)out.push({name:'Centre de « '+b.name+' »',p:c});});
  (doc.cgeo||[]).forEach(c=>{if(c&&c.fr&&(c.kind==='point'||c.kind==='frame'))out.push({name:(c.name||'Point')+(c.kind==='frame'?' (origine)':''),p:c.fr.o.slice()});});
  return out;
}
function bmStaticAxes(f){
  // [{name, o, d}] : X / Y / Z par l'origine et par le centre du corps, axes et repères de construction
  const out=[],c=bmBodyCentre(f.body);
  ['X','Y','Z'].forEach(k=>out.push({name:k+' (origine)',o:[0,0,0],d:BM_AX[k]}));
  if(c)['X','Y','Z'].forEach(k=>out.push({name:k+' (centre du corps)',o:c,d:BM_AX[k]}));
  (doc.cgeo||[]).forEach(g=>{
    if(!g||!g.fr)return;
    if(g.kind==='axis')out.push({name:g.name||'Axe',o:g.fr.o,d:g.fr.z});
    if(g.kind==='frame')['x','y','z'].forEach(k=>out.push({name:(g.name||'Repère')+' · '+k.toUpperCase(),o:g.fr.o,d:g.fr[k]}));
  });
  return out;
}
function bmFaceAxes(F){
  // Axes d'une face d'accroche : axe du cylindre, normale, axes des cercles, arêtes droites
  const out=[];
  if(F.k==='cyl')out.push({name:'Axe du cylindre Ø'+bmFmt(2*F.r),o:F.c,d:F.n});
  else out.push({name:'Normale de la face',o:F.c,d:F.n});
  const seen=new Set();
  (F.edges||[]).forEach(e=>{
    if(e.k==='circ'){const k=e.c.map(v=>v.toFixed(4)).join(',');if(seen.has(k))return;seen.add(k);out.push({name:'Axe du cercle Ø'+bmFmt(2*e.r),o:e.c,d:e.n});}
    else if(e.k==='line')out.push({name:'Arête droite',o:e.m,d:e.d});
  });
  return out;
}
/* ── commande ── */
function openBodyMove(bid){
  try{ensureBodies();}catch(e){}
  const id=bid&&(doc.bodies||[]).some(b=>b.id===bid)?bid:(doc.activeBody&&(doc.bodies||[]).some(b=>b.id===doc.activeBody)?doc.activeBody:((doc.bodies||[])[0]||{}).id);
  if(!id){try{faceEl.textContent='Déplacer : aucun corps.';}catch(e){}return null;}
  if(!(doc.features||[]).some(f=>f.body===id&&f.visible!==false)){try{faceEl.textContent='Déplacer : « '+bmBodyName(id)+' » est vide.';}catch(e){}return null;}
  bmPickExit(true);
  const f={id:uid('bm'),type:'bmove',name:'',body:id,steps:[],visible:true};
  f.name=bmName(f);
  addFeature(f);
  sel={kind:'feature',id:f.id};treeSel=[f.id];
  markDirty();rebuild();renderTree();renderProps();
  try{faceEl.textContent='Déplacer « '+bmBodyName(id)+' » : ajoutez une translation, une rotation ou un point à point dans le panneau.';}catch(e){}
  return f;
}
function bmChange(f,label,fn){
  // Une modification = une étape d'annulation + rejeu
  docPushUndo(label+' (« '+f.name+' »)');
  fn();f.name=bmName(f);
  markDirty();rebuild();renderTree();renderProps();
}
function bmAddStep(f,s){bmChange(f,'étape de déplacement',()=>{f.steps=(f.steps||[]).concat([s]);});}
/* ── saisie dans la vue ── */
const BM_WANT={from:'le point de départ',to:'le point d’arrivée',axis:'l’axe de rotation',dir:'la direction'};
function bmPickStart(f,want,from){
  bmPick={fid:f.id,want,from:from||null,face:null};
  bmMarks();renderProps();
  try{faceEl.textContent='Déplacer : choisissez '+BM_WANT[want]+' — clic sur une face pour ses '+(want==='axis'||want==='dir'?'axes':'points')+', ou dans le panneau. Échap = annuler.';}catch(e){}
}
function bmPickExit(silent){
  if(!bmPick)return;
  bmPick=null;bmMarks();
  if(!silent){try{renderProps();faceEl.textContent='Déplacer : saisie annulée.';}catch(e){}}
}
function bmChoosePt(it){
  const P=bmPick,f=P&&bmFeat(P.fid);if(!f)return bmPickExit(true);
  if(P.want==='from'){bmPickStart(f,'to',it);return;}
  if(P.want!=='to')return;
  bmPick=null;bmMarks();
  const a=P.from.p.slice(),b=it.p.slice();
  bmAddStep(f,{k:'p',a,b,na:P.from.name,nb:it.name});
  try{faceEl.textContent='Point à point : '+P.from.name+' → '+it.name+' (Δ '+bmP(asmV.sub(b,a))+' mm).';}catch(e){}
}
function bmChooseAxis(ax){
  const P=bmPick,f=P&&bmFeat(P.fid);if(!f)return bmPickExit(true);
  bmPick=null;bmMarks();
  const d=asmV.unit(ax.d);if(!d)return;
  if(P.want==='axis')bmAddStep(f,{k:'r',o:ax.o.slice(),d,deg:90,name:ax.name});
  else bmAddStep(f,{k:'d',o:ax.o.slice(),d,dist:10,name:ax.name});
  try{faceEl.textContent=(P.want==='axis'?'Rotation de 90° autour de « '+ax.name+' » — réglez l’angle':'Translation de 10 mm suivant « '+ax.name+' » — réglez la distance')+' dans le panneau.';}catch(e){}
}
function bmPickAt(e){
  // Clic dans la vue pendant la saisie : pastille → choix ; face → ses points / axes
  const P=bmPick;if(!P)return;
  const G=scene.getObjectByName('bmMarks');
  if(G){
    const r=renderer.domElement.getBoundingClientRect();
    rayc.setFromCamera(new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);
    G.updateMatrixWorld(true);
    const ms=[];G.traverse(m=>{if(m.isMesh&&m.userData.bm!=null)ms.push(m);});
    const h=rayc.intersectObjects(ms,false)[0];
    if(h&&P.face){const i=h.object.userData.bm;if(P.face.axes)bmChooseAxis(P.face.axes[i]);else bmChoosePt(P.face.pts[i]);return;}
  }
  let F=null;
  try{
    const h=pick(e);
    const hit=h&&h.object?occFaceOfHit(h.object,h.faceIndex):null;
    if(hit&&hit.face){const g=asmSnapExtract([hit.face]);F=g.faces[0]||null;try{hit.face.delete();}catch(err){}}
  }catch(err){F=null;}
  if(!F){try{faceEl.textContent='Déplacer : cliquez une face plane ou cylindrique d’un corps exact, ou choisissez dans le panneau.';}catch(err){}return;}
  const ax=P.want==='axis'||P.want==='dir';
  P.face=ax?{axes:bmFaceAxes(F),name:asmSnapFaceName(F)}:{pts:asmSnapItems(F).map(it=>({name:asmSnapFaceName(F)+' · '+it.name,p:it.fr.o})),name:asmSnapFaceName(F)};
  bmMarks();renderProps();
  try{faceEl.textContent=P.face.name+' : '+(ax?P.face.axes.length+' axe(s)':P.face.pts.length+' point(s)')+' — cliquez une pastille (ou dans le panneau).';}catch(err){}
}
function bmMarks(){
  // Pastilles des points / axes de la face cliquée, et le point de départ retenu
  let G=scene.getObjectByName('bmMarks');
  if(G){scene.remove(G);G.traverse(m=>{try{if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();}catch(e){}});}
  const P=bmPick;if(!P)return;
  G=new THREE.Group();G.name='bmMarks';scene.add(G);
  let size=1;try{const B=new THREE.Box3();bodies.forEach(b=>{if(b.mesh&&b.visible!==false)B.expandByObject(b.mesh);});if(!B.isEmpty())size=Math.max(0.4,0.012*B.getSize(new THREE.Vector3()).length());}catch(e){}
  const ball=(p,col,i)=>{const s=new THREE.Mesh(new THREE.SphereGeometry(size,14,10),new THREE.MeshBasicMaterial({color:col,depthTest:false,transparent:true,opacity:0.95}));
    s.position.set(p[0],p[1],p[2]);s.renderOrder=995;if(i!=null)s.userData.bm=i;G.add(s);};
  if(P.from)ball(P.from.p,0x0a84ff,null);
  if(P.face&&P.face.pts)P.face.pts.forEach((it,i)=>ball(it.p,/cercle|arc/.test(it.name)?0xffb020:0x30d158,i));
  if(P.face&&P.face.axes)P.face.axes.forEach((a,i)=>{
    ball(a.o,0xffb020,i);
    const L=size*14,d=asmV.unit(a.d)||[0,0,1];
    const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...asmV.sub(a.o,asmV.mul(d,L))),new THREE.Vector3(...asmV.add(a.o,asmV.mul(d,L)))]);
    const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffb020,depthTest:false}));l.renderOrder=994;G.add(l);
  });
}
/* ── panneau ── */
function bmoveProps(p,f){
  const mk=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const Row=(lab,ctl)=>{const r=mk('div','pnl-row');r.appendChild(mk('label',null,lab));if(ctl)r.appendChild(ctl);p.appendChild(r);return r;};
  const num=(v,fn,w)=>{const i=document.createElement('input');i.type='text';i.inputMode='decimal';i.style.width=(w||58)+'px';i.value=bmFmt(v);
    const go=()=>{const x=parseFloat(String(i.value).replace(',','.'));if(isFinite(x)&&x!==+v)fn(x);};i.addEventListener('change',go);i.addEventListener('keydown',e=>{if(e.key==='Enter')go();});return i;};
  const btn=(txt,title,fn,cls)=>{const b=mk('button',cls||'mini',txt);if(title)b.title=title;b.onclick=fn;return b;};
  const set=(label,fn)=>bmChange(f,label,fn);
  p.appendChild(mk('div','pnl-h','✥ Déplacer un corps'));
  // corps déplacé
  const sb=document.createElement('select');
  (doc.bodies||[]).forEach(b=>{const o=document.createElement('option');o.value=b.id;o.textContent=b.name;if(b.id===f.body)o.selected=true;sb.appendChild(o);});
  sb.onchange=()=>set('corps déplacé',()=>{f.body=sb.value;});
  Row('Corps',sb);
  // étapes
  const S=f.steps||[];
  if(!S.length)p.appendChild(mk('div','pnl-note','Aucune étape : le corps reste en place.'));
  S.forEach((s,i)=>{
    const head=mk('div','pnl-note');head.style.cssText='display:flex;align-items:center;gap:6px;margin-top:6px';
    const lab=s.k==='t'?'↔ Translation':s.k==='d'?'➜ Suivant « '+(s.name||'direction')+' »':s.k==='r'?'⟳ Rotation autour de « '+(s.name||'axe')+' »':'⊙ '+(s.na||'?')+' → '+(s.nb||'?');
    const t=mk('span',null,(i+1)+'. '+lab);t.style.flex='1';head.appendChild(t);
    if(i>0)head.appendChild(btn('▲','Monter l’étape',()=>set('ordre des étapes',()=>{const A=f.steps;[A[i-1],A[i]]=[A[i],A[i-1]];})));
    head.appendChild(btn('🗑','Supprimer l’étape',()=>set('suppression d’étape',()=>{f.steps=f.steps.filter((q,j)=>j!==i);})));
    p.appendChild(head);
    if(s.k==='t')['X','Y','Z'].forEach((k,j)=>Row(k+' (mm)',num(s.v[j],x=>set('translation',()=>{s.v=s.v.slice();s.v[j]=x;}))));
    else if(s.k==='d'){
      const w=mk('span');w.style.cssText='display:flex;gap:4px;align-items:center';
      w.appendChild(num(s.dist,x=>set('distance',()=>{s.dist=x;})));
      w.appendChild(btn('⇄','Inverser le sens',()=>set('sens',()=>{s.dist=-(+s.dist||0);})));
      Row('Distance (mm)',w);
    }else if(s.k==='r'){
      const w=mk('span');w.style.cssText='display:flex;gap:4px;align-items:center';
      w.appendChild(num(s.deg,x=>set('angle',()=>{s.deg=x;}),50));
      // ajouter ±90° / 180°, ramené dans ]−180 ; 180]
      const turn=a=>{let v=(((+s.deg||0)+a)%360+540)%360-180;if(v===-180)v=180;return +v.toFixed(6);};
      [-90,90,180].forEach(a=>w.appendChild(btn((a>0?'+':'−')+Math.abs(a)+'°',null,()=>set('angle',()=>{s.deg=turn(a);}))));
      Row('Angle (°)',w);
      p.appendChild(mk('div','pnl-note','Axe par '+bmP(s.o)+', direction '+bmP(s.d)));
    }else if(s.k==='p')p.appendChild(mk('div','pnl-note','Δ '+bmP(asmV.sub(s.b,s.a))+' mm'));
  });
  // ajouter une étape
  const P=bmPick&&bmPick.fid===f.id?bmPick:null;
  if(!P){
    p.appendChild(mk('div','pnl-h','Ajouter'));
    const b=mk('div','pnl-btns');
    b.appendChild(btn('↔ Translation X Y Z','Décalage libre en X, Y, Z',()=>bmAddStep(f,{k:'t',v:[0,0,0]})));
    b.appendChild(btn('➜ Suivant une direction…','Une distance le long d’un axe, d’une arête, d’une normale ou d’un axe de cylindre',()=>bmPickStart(f,'dir')));
    b.appendChild(btn('⟳ Rotation…','Rotation autour d’un axe choisi',()=>bmPickStart(f,'axis')));
    b.appendChild(btn('⊙ Point à point…','D’un point (centre de la pièce, d’un cercle…) à un autre (origine, repère…)',()=>bmPickStart(f,'from')));
    p.appendChild(b);
    const F=bmFrame(f);
    if(!bmIsIdentity(F))p.appendChild(mk('div','pnl-note','Bilan : origine de la pièce → '+bmP(F.o)+' mm.'));
    return;
  }
  // saisie en cours
  p.appendChild(mk('div','pnl-h','Choisir '+BM_WANT[P.want]));
  if(P.from)p.appendChild(mk('div','pnl-note','Départ : '+P.from.name+' '+bmP(P.from.p)));
  const list=(items,fn,name)=>{const b=mk('div','pnl-btns');items.forEach(it=>b.appendChild(btn(name(it),null,()=>fn(it))));p.appendChild(b);};
  const ax=P.want==='axis'||P.want==='dir';
  if(P.face){
    p.appendChild(mk('div','pnl-note',P.face.name+' :'));
    if(ax)list(P.face.axes,bmChooseAxis,a=>a.name);else list(P.face.pts,bmChoosePt,it=>it.name.replace(/^.*? · /,''));
  }
  p.appendChild(mk('div','pnl-note',ax?'Axes de référence :':'Points de référence :'));
  if(ax)list(bmStaticAxes(f),bmChooseAxis,a=>a.name);else list(bmStaticPts(),bmChoosePt,it=>it.name);
  p.appendChild(mk('div','pnl-note','Ou cliquez une face dans la vue.'));
  const c=mk('div','pnl-btns');c.appendChild(btn('Annuler',null,()=>bmPickExit(false)));p.appendChild(c);
}
/* ── menus contextuels (arbre et vue) : « ✥ Déplacer… » sur un corps — bouton créé à la
   première ouverture, APRÈS la boucle qui câble les boutons data-act des menus (90) ── */
const bmCtxBtns={};
function bmCtxSync(menuId,t){
  const m=document.getElementById(menuId);if(!m)return;
  let b=bmCtxBtns[menuId];
  if(!b){
    b=document.createElement('button');b.textContent='✥ Déplacer…';
    b.title='Translation, rotation autour d’un axe, point à point (fonction de la timeline)';
    const at=m.querySelector('button[data-act="isolate"]')||m.querySelector('button[data-act="del"]');
    // jamais en dernier : l'export STEP reste la dernière entrée (test_ctx_menu_viewport)
    let step=null;try{step=menuId==='ctxMenu3D'?ctxStepBtn3d:ctxStepBtn;}catch(e){}
    if(at&&at.parentNode===m)m.insertBefore(b,at.nextSibling);else m.insertBefore(b,step&&step.parentNode===m?step:null);
    b.onclick=()=>{const T=b._t;try{hideCtx();hideCtx3D();}catch(e){}if(T)openBodyMove(ctxBodyId(T)||T.id);};
    bmCtxBtns[menuId]=b;
  }
  b._t=t;
  b.style.display=(t&&t.kind==='body'&&t.id&&asmMode!=='asm')?'':'none';
}
// bouton (rangé dans « Modifier le solide » par 96-bandeau-groupes ; ruban moderne : 97)
(function(){
  try{
    if(document.getElementById('btnBodyMove'))return;
    const ref=document.getElementById('btnMoveFace')||document.getElementById('btnExtrude');
    if(!ref||!ref.parentNode)return;
    const b=document.createElement('button');b.id='btnBodyMove';b.textContent='✥ Déplacer un corps';
    b.title='Déplacer le corps actif : translation, rotation autour d’un axe, point à point (pose d’un STEP importé)';
    b.onclick=()=>{const t=(typeof sel!=='undefined'&&sel&&sel.kind==='body')?sel.id:null;openBodyMove(t);};
    ref.parentNode.insertBefore(b,ref.nextSibling);
  }catch(e){}
})();
