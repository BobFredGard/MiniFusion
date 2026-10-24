/* ---------- composants depuis les corps, déplacer vers un composant (V0.6.2) ----------
   Convertir une pièce multicorps en assemblage sans la remodéliser :
     · « Créer un composant depuis ce corps » : le corps et TOUT ce qui le construit (ses
       fonctions, les esquisses et la construction dont elles dépendent, les paramètres) passent
       dans un composant neuf, enfant du composant actif, placé à l'identité : rien ne bouge ;
     · « Déplacer vers un composant » : un corps (ou une esquisse) vers un composant existant.
   Dépendances : tout se cite par identifiant (esquisse d'une fonction, fonction hôte d'une
   esquisse sur face, construction, sources d'une répétition) ; on parcourt donc les chaînes de
   chaque élément (asmIdsIn). Ce qui part ne doit pas s'appuyer sur une fonction qui reste, et
   ce qui reste ne doit rien citer de ce qui part : sinon l'opération est refusée, avec la raison.
   Une esquisse ou une construction nécessaire est DÉPLACÉE si plus rien ne la cite ici, sinon
   COPIÉE (elle reste aussi dans la source). L'opération est une seule étape d'annulation,
   documents compris (46 : asmPush avec docs). */
function asmItemIndex(d){
  const m=new Map();
  (d.features||[]).forEach(f=>{if(f&&f.id)m.set(f.id,{kind:'feature',o:f});});
  (d.sketches||[]).forEach(s=>{if(s&&s.id)m.set(s.id,{kind:'sketch',o:s});});
  (d.cgeo||[]).forEach(c=>{if(c&&c.id)m.set(c.id,{kind:'cg',o:c});});
  return m;
}
function asmIdsIn(o,idx,self){
  // Identifiants d'éléments du document cités par o (parcours profond) — sans les
  // transitoires (clés _…), son propre identifiant, ni l'ancrage d'une construction dans le
  // fil (at : une position, pas une dépendance — recalé au transfert)
  const out=new Set();
  const walk=(v,top)=>{
    if(typeof v==='string'){if(v!==self&&idx.has(v))out.add(v);return;}
    if(Array.isArray(v)){v.forEach(x=>walk(x,false));return;}
    if(v&&typeof v==='object'){for(const k of Object.keys(v)){if(k[0]!=='_'&&!(top&&k==='at'))walk(v[k],false);}}
  };
  walk(o,true);return out;
}
function asmSplitPlan(d,sel){
  // Ce qui part : sel.bodies (leurs fonctions) ou sel.sketches. → {ok, why[], M (part),
  // move (dépendances déplacées), copy (dépendances copiées), bodies}
  const idx=asmItemIndex(d),why=[];
  const bodies=new Set(sel.bodies||[]);
  const nm=id=>{const it=idx.get(id);return '« '+((it&&it.o.name)||id)+' »';};
  const bn=b=>'« '+(((d.bodies||[]).find(e=>e.id===b)||{}).name||b)+' »';
  const M=new Set();
  if(bodies.size)(d.features||[]).forEach(f=>{if(f&&bodies.has(f.body))M.add(f.id);});
  (sel.sketches||[]).forEach(id=>{if(idx.has(id))M.add(id);});
  const refs=new Map();
  const R=id=>{if(!refs.has(id))refs.set(id,asmIdsIn(idx.get(id).o,idx,id));return refs.get(id);};
  // ce qui part, et tout ce dont il dépend
  const need=new Set(M),q=[...M];
  while(q.length){
    const id=q.pop(),it=idx.get(id);
    if(it.kind==='feature')(it.o.tools||[]).forEach(b=>{if(!bodies.has(b))why.push(nm(id)+' combine avec le corps '+bn(b)+' qui reste');});
    R(id).forEach(r=>{
      if(idx.get(r).kind==='feature'&&!M.has(r)){why.push(nm(id)+' s’appuie sur '+nm(r)+', qui reste');return;}
      if(!need.has(r)){need.add(r);q.push(r);}
    });
  }
  // dépendances : déplacées si plus rien de ce qui reste ne les cite, sinon copiées
  const move=new Set([...need].filter(id=>!M.has(id)));
  let ch=true;
  while(ch){
    ch=false;
    for(const x of [...move]){
      for(const id of idx.keys()){if(M.has(id)||move.has(id))continue;if(R(id).has(x)){move.delete(x);ch=true;break;}}
    }
  }
  const copy=new Set([...need].filter(id=>!M.has(id)&&!move.has(id)));
  // ce qui reste ne doit rien citer de ce qui part
  for(const [id,it] of idx){
    if(M.has(id)||move.has(id))continue;
    if(it.kind==='feature'&&(it.o.tools||[]).some(b=>bodies.has(b)))why.push(nm(id)+' combine avec un corps qui part');
    R(id).forEach(r=>{if(M.has(r))why.push(nm(id)+', qui reste, utilise '+nm(r));});
  }
  return {ok:!why.length,why:[...new Set(why)],M,move,copy,bodies:[...bodies]};
}
function asmSplitApply(src,dst,plan){
  // Transfère selon le plan : copies dans dst (identifiants renouvelés s'ils y existent déjà),
  // retrait de src. → {features, sketches, cg, bodies (ids dans dst)}
  const take=id=>plan.M.has(id)||plan.move.has(id)||plan.copy.has(id);
  const cl=o=>JSON.parse(JSON.stringify(o,(k,v)=>k&&k[0]==='_'?undefined:v));
  ['features','sketches','cgeo','bodies','params'].forEach(k=>{if(!Array.isArray(dst[k]))dst[k]=[];});
  const have=new Set([].concat(dst.features,dst.sketches,dst.cgeo).map(o=>o&&o.id));
  const map={};
  [...plan.M,...plan.move,...plan.copy].forEach(id=>{if(have.has(id))map[id]=uid(String(id).split('_')[0]||'id');});
  const re=o=>{const w=v=>{if(typeof v==='string')return map[v]||v;if(Array.isArray(v))return v.map(w);
    if(v&&typeof v==='object'){const r={};for(const k of Object.keys(v))r[k]=w(v[k]);return r;}return v;};return w(o);};
  // corps : identifiant neuf s'il est déjà pris dans la cible
  let seq=+dst.bodySeq||1;
  dst.bodies.forEach(e=>{const m=/^b(\d+)$/.exec(e.id||'');if(m)seq=Math.max(seq,+m[1]+1);});
  const bmap={};
  plan.bodies.forEach(b=>{bmap[b]=dst.bodies.some(e=>e.id===b)?'b'+(seq++):b;});
  dst.bodySeq=seq;
  const n0=dst.features.length;
  const F=(src.features||[]).filter(f=>plan.M.has(f.id)).map(f=>{const g=re(cl(f));
    if(bmap[g.body])g.body=bmap[g.body];if(Array.isArray(g.tools))g.tools=g.tools.map(b=>bmap[b]||b);return g;});
  const S=(src.sketches||[]).filter(s=>take(s.id)).map(s=>re(cl(s)));
  const C=(src.cgeo||[]).filter(c=>take(c.id)).map(c=>re(cl(c)));
  dst.features.push(...F);dst.sketches.push(...S);
  // construction : ancrée après la dernière fonction transférée qui la précédait, sinon
  // après les fonctions que la cible avait déjà
  const srcIdx=new Map((src.features||[]).map((f,i)=>[f.id,i]));
  C.forEach((c,k)=>{
    const o=(src.cgeo||[]).filter(x=>take(x.id))[k];
    let i=o.at==null?-1:(srcIdx.has(o.at)?srcIdx.get(o.at):Math.min(isFinite(+o.ai)?+o.ai:0,(src.features||[]).length)-1);
    let at=null;
    for(;i>=0;i--){const f=src.features[i];if(plan.M.has(f.id)){at=map[f.id]||f.id;break;}}
    if(at==null&&o.at!=null&&n0>0)at=dst.features[n0-1].id;
    c.at=o.at==null?null:at;
    c.ai=c.at==null?0:dst.features.findIndex(f=>f.id===c.at)+1;
  });
  dst.cgeo.push(...C);
  // fiches des corps, visibilité, paramètres (ceux qui manquent)
  plan.bodies.forEach(b=>{
    const e=(src.bodies||[]).find(x=>x.id===b);
    if(e){
      const k=Object.assign(cl(e),{id:bmap[b]});
      // couleur automatique (rang du corps) figée : le corps garde sa couleur à l'écran
      if(!(k.color>0)){try{k.color=src===doc?bodyColorOf(b):autoCol(Math.max(0,src.bodies.indexOf(e)));}catch(err){}}
      dst.bodies.push(k);
    }
    if(src.bodyVis&&src.bodyVis[b]===false){dst.bodyVis=dst.bodyVis||{};dst.bodyVis[bmap[b]]=false;}
  });
  (src.params||[]).forEach(p=>{if(p&&p.name&&!dst.params.some(q=>q&&q.name===p.name))dst.params.push(cl(p));});
  if(!dst.bodies.some(e=>e.id===dst.activeBody))dst.activeBody=dst.bodies.length?dst.bodies[0].id:null;
  // retrait de la source
  src.features=(src.features||[]).filter(f=>!plan.M.has(f.id));
  src.sketches=(src.sketches||[]).filter(s=>!plan.M.has(s.id)&&!plan.move.has(s.id));
  src.cgeo=(src.cgeo||[]).filter(c=>!plan.move.has(c.id));
  if(plan.bodies.length){
    // la couleur automatique dépend du RANG du corps : on fige celle des corps qui restent,
    // sinon retirer un corps repeindrait les suivants
    (src.bodies||[]).forEach((e,i)=>{if(!plan.bodies.includes(e.id)&&!(e.color>0)){
      try{e.color=src===doc?bodyColorOf(e.id):autoCol(i);}catch(err){}}});
    src.bodies=(src.bodies||[]).filter(e=>!plan.bodies.includes(e.id));
    if(src.bodyVis)plan.bodies.forEach(b=>{delete src.bodyVis[b];});
    if(!src.bodies.length){const n=src.bodySeq=(+src.bodySeq||1);src.bodySeq=n+1;src.bodies.push({id:'b'+n,name:'Corps '+n,c:null});}
    if(!src.bodies.some(e=>e.id===src.activeBody))src.activeBody=src.bodies[0].id;
  }
  return {features:F.length,sketches:S.length,cg:C.length,bodies:plan.bodies.map(b=>bmap[b])};
}
function asmCompsFromBodies(ids){
  // Un composant par corps (enfant du composant actif, à l'identité). Les corps refusés
  // (dépendances croisées) restent, avec leur raison. → {made:[{comp,occ,body}], refused:[{body,name,why}]}
  asmEnsure();
  const src=asmActiveComp(),d=src.doc,out={made:[],refused:[]};
  const name=b=>((d.bodies||[]).find(e=>e.id===b)||{}).name||b;
  const ok=ids.filter(b=>{const p=asmSplitPlan(d,{bodies:[b]});if(!p.ok)out.refused.push({body:b,name:name(b),why:p.why});return p.ok;});
  if(!ok.length)return out;
  asmPush(ok.length>1?'composants depuis '+ok.length+' corps':'composant depuis « '+name(ok[0])+' »',[src.id]);
  ok.forEach(b=>{
    const p=asmSplitPlan(d,{bodies:[b]});
    if(!p.ok){out.refused.push({body:b,name:name(b),why:p.why});return;}
    const nm=name(b);
    const c={id:uid('cp'),kind:'comp',name:nm,doc:asmEmptyDoc(nm),occ:[],link:null};
    {const L=asmLinkOwner(src);if(L)c.of=L.id;} // dans un composant lié : il en fait partie
    asmSplitApply(d,c.doc,p);
    asm.comps.push(c);
    const o=asmNewOccObj(c.id,nm+':1');src.occ.push(o);
    out.made.push({comp:c,occ:o,body:b});
  });
  return out;
}
function asmMoveToComp(sel,targetId,newName){
  // Corps ou esquisses du composant actif vers un autre composant ('_new' : un composant neuf,
  // enfant du composant actif, nommé newName — dans la MÊME étape d'annulation). → {ok, why[], r, comp}
  asmEnsure();
  const src=asmActiveComp();
  let T=targetId==='_new'?null:asmComp(targetId);
  if(targetId!=='_new'&&(!T||T===src))return {ok:false,why:['composant cible invalide']};
  const p=asmSplitPlan(src.doc,sel);
  if(!p.ok)return {ok:false,why:p.why};
  const nm=T?T.name:(newName||'Composant');
  asmPush('déplacer vers « '+nm+' »',T?[src.id,T.id]:[src.id]);
  if(!T){
    T={id:uid('cp'),kind:'comp',name:nm,doc:asmEmptyDoc(nm),occ:[],link:null};
    {const L=asmLinkOwner(src);if(L)T.of=L.id;}
    asm.comps.push(T);src.occ.push(asmNewOccObj(T.id,nm+':1'));
  }
  const r=asmSplitApply(src.doc,T.doc,p);
  T._stale=true;
  return {ok:true,why:[],r,comp:T};
}
function asmRelToComp(targetId){
  // Repère de l'instance éditée vu depuis la (première) instance du composant cible : ce que
  // subit la géométrie déplacée (identité = elle ne bouge pas dans l'assemblage)
  const W=asmWorld(asm.path),tp=asmFirstPath(targetId),T=tp?asmWorld(tp):null;
  return W&&T?asmCompose(asmInverse(T),W):null;
}
function asmIsIdentity(F){
  const I=asmFr0();
  return !!F&&['o','x','y','z'].every(k=>F[k].every((v,i)=>Math.abs(v-I[k][i])<1e-7));
}
/* ── commandes ── */
function asmAfterSplit(msg){
  // Après un transfert : la source est rejouée, les composants touchés recapturés
  try{markDirty();rebuild();}catch(e){}
  try{asmBuildSnapshots();}catch(e){}
  asmNotify();
  try{renderTree();renderProps();docUndoUI();}catch(e){}
  try{faceEl.textContent=msg;}catch(e){}
}
function asmCmdFromBodies(ids){
  // ids absents : le corps sélectionné, sinon tous les corps (après confirmation)
  if(typeof skEdit!=='undefined'&&skEdit){try{faceEl.textContent='Fermez d’abord l’esquisse.';}catch(e){}return null;}
  if(asmMode==='asm'){try{faceEl.textContent='Composants depuis les corps : modélisez d’abord le composant qui porte les corps.';}catch(e){}return null;}
  const all=(doc.bodies||[]).filter(e=>(doc.features||[]).some(f=>f.body===e.id)).map(e=>e.id);
  if(!ids){
    if(sel.kind==='body'&&all.includes(sel.id))ids=[sel.id];
    else{
      if(!all.length){try{faceEl.textContent='Aucun corps avec des fonctions à transformer en composant.';}catch(e){}return null;}
      if(!confirm('Créer un composant pour chacun des '+all.length+' corps ?'))return null;
      ids=all;
    }
  }
  try{asmLeavePart();}catch(e){}
  const r=asmCompsFromBodies(ids);
  if(r.refused.length)alert('Non converti(s) :\n'+r.refused.map(x=>'• '+x.name+' : '+x.why.slice(0,3).join(' ; ')).join('\n'));
  if(!r.made.length)return r;
  sel={kind:null,id:null};treeSel=[];
  asmAfterSplit(r.made.length+' composant(s) créé(s) depuis les corps ('+r.made.map(m=>m.comp.name).join(', ')+'), à la même place. Double-clic pour les modéliser, « Placer » pour les déplacer.');
  return r;
}
function asmCmdMoveTo(kind,id,targetId){
  // kind 'body' | 'sketch' ; targetId : composant existant, ou '_new' (composant neuf)
  if(typeof skEdit!=='undefined'&&skEdit){try{faceEl.textContent='Fermez d’abord l’esquisse.';}catch(e){}return null;}
  asmEnsure();
  if(targetId==='_new'&&kind==='body')return asmCmdFromBodies([id]);
  const T=targetId==='_new'?null:asmComp(targetId),rel=T?asmRelToComp(targetId):asmFr0();
  if(T&&!asmIsIdentity(rel)&&!confirm('« '+T.name+' » n’est pas placé comme ce composant : la géométrie gardera ses coordonnées, donc se retrouvera décalée dans l’assemblage.\nContinuer ?'))return null;
  try{asmLeavePart();}catch(e){}
  const r=asmMoveToComp(kind==='body'?{bodies:[id]}:{sketches:[id]},targetId,(doc.sketches.find(s=>s.id===id)||{}).name);
  if(!r.ok){alert('Déplacement impossible :\n• '+r.why.slice(0,5).join('\n• '));return r;}
  sel={kind:null,id:null};treeSel=[];
  asmAfterSplit((kind==='body'?'Corps déplacé':'Esquisse déplacée')+' vers « '+r.comp.name+' » ('+r.r.features+' fonction(s), '+r.r.sketches+' esquisse(s)'+(r.r.cg?', '+r.r.cg+' construction(s)':'')+').');
  return r;
}
function asmMoveTargets(){
  // Composants cibles possibles (tous sauf le composant actif), nommés par leur chemin
  if(!asm)return [];
  const seen=new Set([asm.active]),out=[];
  asmInstances(asm.root).forEach(inst=>{
    if(seen.has(inst.comp))return;seen.add(inst.comp);
    const names=[];let c=asmRoot();
    inst.path.forEach(id=>{const o=c.occ.find(q=>q.id===id);names.push(o.name);c=asmComp(o.comp);});
    out.push({id:inst.comp,label:inst.path.length?names.join(' › '):'« '+asmRoot().name+' » (racine)'});
  });
  return out;
}
/* ── menu contextuel de l'arbre (corps, esquisse) — boutons créés à la première ouverture,
   APRÈS la boucle qui câble les boutons de #ctxMenu (90) ── */
let asmCtxBtns=null;
function asmCtxSync(t,x,y){
  const m=document.getElementById('ctxMenu');if(!m)return;
  if(!asmCtxBtns){
    // juste après « Supprimer » : au-dessus du bloc couleur, toujours visible sans défiler
    let at=m.querySelector('button[data-act="del"]');
    // jamais en dernier : l'export STEP reste la dernière entrée (test_ctx_menu_viewport)
    const mk=(txt,title)=>{const b=document.createElement('button');b.textContent=txt;b.title=title;
      if(at&&at.parentNode===m){m.insertBefore(b,at.nextSibling);at=b;}else m.insertBefore(b,ctxStepBtn||null);return b;};
    asmCtxBtns={
      from:mk('🧩 Créer un composant depuis ce corps','Le corps et tout ce qui le construit passent dans un composant neuf, à la même place'),
      move:mk('➡ Déplacer vers un composant…','Vers un composant existant (ou neuf), avec tout ce qui le construit')
    };
    asmCtxBtns.from.onclick=()=>{const T=asmCtxBtns.t;hideCtx();if(T)asmCmdFromBodies([ctxBodyId(T)||T.id]);};
    asmCtxBtns.move.onclick=()=>{
      const T=asmCtxBtns.t,X=asmCtxBtns.x,Y=asmCtxBtns.y;hideCtx();if(!T)return;
      const id=T.kind==='body'?(ctxBodyId(T)||T.id):T.id;
      const items=asmMoveTargets().map(g=>({html:'🧩 '+asmEsc(g.label),fn:()=>asmCmdMoveTo(T.kind,id,g.id)}));
      items.push({html:'➕ Nouveau composant',fn:()=>asmCmdMoveTo(T.kind,id,'_new')});
      try{mfPop({getBoundingClientRect:()=>({left:X,right:X+220,top:Y-6,bottom:Y-6,width:220,height:0})},items);}catch(e){}
    };
  }
  asmCtxBtns.t=t;asmCtxBtns.x=x;asmCtxBtns.y=y;
  const body=!!t&&t.kind==='body'&&asmMode!=='asm',sk=!!t&&t.kind==='sketch'&&asmMode!=='asm';
  asmCtxBtns.from.style.display=body?'':'none';
  asmCtxBtns.move.style.display=(body||sk)?'':'none';
}
