/* ---------- bandeau de timeline façon Fusion 360 (bas de la vue 3D, espace CAO) ----------
   Une icône par étape, dans l'ordre du fil : fonctions (doc.features, instances de répétition
   repliées dans leur répétition), esquisses (juste avant leur fonction consommatrice, sinon
   après leur hôte), géométrie de construction (après sa fonction d'ancrage `at`, cf. cgPos).
   Survol = nom · clic = sélection (même `sel` que l'arbre) · double-clic = édition ·
   ⏱ marqueur glissable entre deux étapes (tlSetPtr : au-delà = grisé, comme tlLocked) ·
   glisser une fonction = la réordonner dans son corps (crans featMoveRaw : mêmes règles que ▲▼).
   Remplace l'ancien panneau #timeline (puces) : renderTimeline() est appelé en fin de
   renderTree, donc à chaque rejeu et à chaque changement de sélection. Visibilité par CSS :
   interface moderne, espace CAO, hors édition d'esquisse (body.mf-sk). */
let tlbEl=null,tlbDrag=null,tlbNoClick=false;
(function(){
  try{
    const st=document.createElement('style');st.id='tlbCss';
    st.textContent=
      '#mfTl{display:none;position:absolute;left:12px;right:12px;bottom:10px;z-index:22;align-items:center;gap:6px;padding:4px 6px;'+
        'background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.28);'+
        'backdrop-filter:blur(8px);user-select:none;-webkit-user-select:none;color:var(--text);font-size:.8rem}'+
      'body.ui-modern[data-ws="cao"]:not(.mf-sk) #mfTl{display:flex}'+
      'body.ui-modern[data-ws="cao"]:not(.mf-sk) #treeOverlay{max-height:calc(100% - 108px)}'+ // l'arbre s'arrête au-dessus du bandeau
      '#mfTl .tlbC{display:flex;gap:1px;flex:none}'+
      '#mfTl .tlbC button{padding:2px 5px;min-width:22px;font-size:.72rem;line-height:1.2;background:none;border:1px solid transparent;border-radius:6px;color:var(--text)}'+
      '#mfTl .tlbC button:hover{border-color:var(--border);color:var(--primary)}'+
      '#mfTl .tlbR{display:flex;align-items:center;gap:3px;flex:1;min-width:0;overflow-x:auto;overflow-y:hidden;padding:5px 4px 3px;scrollbar-width:none}'+
      '#mfTl .tlbR::-webkit-scrollbar{display:none}'+
      // V0.23.26 : barre de défilement fondue sur le bandeau (fine, translucide, au survol), posée
      // dans la marge sous les icônes : elle ne couvre aucune étape, les clics passent
      '#mfTl .tlbB{position:absolute;bottom:2px;height:4px;border-radius:2px;background:var(--muted);opacity:0;transition:opacity .2s;cursor:ew-resize;display:none}'+
      '#mfTl .tlbB.on{display:block}#mfTl:hover .tlbB.on{opacity:.35}#mfTl .tlbB.on:hover,#mfTl .tlbB.drag{opacity:.75!important}'+
      '#mfTl .tlbS{flex:none;position:relative;display:flex;align-items:center;justify-content:center;min-width:34px;height:32px;padding:0 4px;box-sizing:border-box;'+
        'border-radius:7px;border:1px solid var(--border);background:rgba(127,127,127,.1);cursor:pointer;font-size:.95rem;line-height:1;white-space:nowrap}'+
      '#mfTl .tlbS.sk{background:rgba(255,159,10,.13)}'+
      '#mfTl .tlbS.cg{background:rgba(255,214,10,.1);border-style:dashed}'+
      '#mfTl .tlbS:hover{border-color:var(--primary)}'+
      '#mfTl .tlbS.sel{background:var(--primary);border-color:var(--primary);color:#fff}'+
      '#mfTl .tlbS.hid{opacity:.6}'+
      '#mfTl .tlbS.off{opacity:.32;filter:grayscale(1)}'+
      '#mfTl .tlbS.warn{border-color:#ff453a;box-shadow:inset 0 0 0 1px #ff453a}'+
      '#mfTl .tlbS .w{position:absolute;top:-5px;right:-5px;line-height:1;font-size:.74rem;color:#ff453a;text-shadow:0 0 2px var(--bg)}'+
      '#mfTl .tlbS.drag{opacity:.35}'+
      '#mfTl .tlbM{flex:none;position:relative;width:5px;height:30px;margin:0 2px;border-radius:3px;background:var(--warn);cursor:ew-resize}'+
      '#mfTl .tlbM::before{content:"";position:absolute;left:-4px;top:-4px;border:6.5px solid transparent;border-top-color:var(--warn);border-bottom:none}'+
      '#mfTl .tlbM.on{box-shadow:0 0 0 3px var(--glow)}'+
      '#mfTl .tlbD{flex:none;width:3px;height:30px;border-radius:2px;background:var(--primary)}'+
      '#mfTl .tlbE{color:var(--muted);font-size:.72rem;padding:0 6px;white-space:nowrap}'+
      '#mfTl .tlbN{flex:none;color:var(--muted);font-size:.68rem;white-space:nowrap;padding:0 2px}';
    (document.head||document.body||document.documentElement).appendChild(st);
  }catch(e){}
})();
function tlbSteps(){
  // Étapes du fil, triées par clé : 4·i+2 pour la fonction i, 4·i+1 pour l'esquisse qu'elle
  // consomme, 4·p+3 pour ce qui vient après la fonction p (construction ancrée, esquisse sur
  // face ; p = -1 : en tête), 4·n pour une esquisse libre (fin du fil). Marqueur avant la
  // fonction m = clé 4·m : tout ce qui est au-delà est hors rejeu (off).
  const F=doc.features||[],S=[],m=tlIdx();
  const at=id=>F.findIndex(f=>f.id===id);
  const warnF=f=>!!((f._m&&f._m.m<f._m.t)||f._err);
  F.forEach((f,i)=>{if(!f.repeatId)S.push({kind:'feature',id:f.id,o:f,key:4*i+2,sub:0,warn:warnF(f)});});
  const cgKey={};
  (doc.cgeo||[]).filter(cgValid).forEach((c,k)=>{
    const key=4*cgPos(c)+3;cgKey[c.id]=key;
    S.push({kind:'cg',id:c.id,o:c,key,sub:k,warn:c.st==='warn'});
  });
  (doc.sketches||[]).forEach((sk,k)=>{
    if(skIsRepCopy(sk))return; // copie d'une répétition : comme ses fonctions d'instance, hors du fil
    const h=tlHostFeatureOfSketch(sk);let key;
    if(h&&(h.sketchId===sk.id||h.pathId===sk.id))key=4*at(h.id)+1;                                  // consommée : juste avant sa fonction
    else if(sk.plane==='CG'&&sk.cg&&cgKey[sk.cg.id]!=null)key=cgKey[sk.cg.id];    // sur un élément de construction : après lui
    else if(h)key=4*at(h.id)+3;                                                  // sur une face : après la fonction hôte
    else key=4*F.length;                                                         // libre : en fin de fil
    S.push({kind:'sketch',id:sk.id,o:sk,key,sub:1e6+k,warn:false});
  });
  S.sort((a,b)=>(a.key-b.key)||(a.sub-b.sub));
  S.forEach(s=>{s.off=m>=0&&s.key>4*m;});
  return S;
}
function tlbMarkGap(S){
  // Interstice du marqueur : avant la première étape hors rejeu (S.length = fin, pas de marqueur)
  const i=S.findIndex(s=>s.off);return i<0?S.length:i;
}
function tlbGapFeature(S,g,skip){
  // Fonction qui suit l'interstice g (avant laquelle se pose le marqueur), null = fin du fil
  for(let i=g;i<S.length;i++)if(S[i].kind==='feature'&&S[i].id!==skip)return S[i].o;
  return null;
}
function tlbGapBefore(S,g,skip){
  // Fonction qui précède l'interstice g, null = tête du fil
  for(let i=Math.min(g,S.length)-1;i>=0;i--)if(S[i].kind==='feature'&&S[i].id!==skip)return S[i].o;
  return null;
}
function tlbSetMark(f){
  // Pose le marqueur avant la fonction f (null = rejouer tout) puis rejoue
  const id=f?f.id:null;
  if(id===(tlIdx()<0?null:tlMark))return false;
  tlSetPtr(f);markDirty();rebuild();renderTree();renderProps();
  return true;
}
function tlbStep(dir){
  // ⏮ ◀ ▶ ⏭ : le marqueur saute d'une fonction de premier niveau (jamais dans un bloc de répétition)
  const F=doc.features||[],T=F.filter(f=>!f.repeatId);
  if(!T.length)return false;
  if(dir===-2)return tlbSetMark(T[0]);
  if(dir===2)return tlbSetMark(null);
  const m=tlIdx(),cur=m<0?T.length:T.findIndex(f=>F.indexOf(f)>=m);
  const k=Math.max(0,Math.min(T.length,(cur<0?T.length:cur)+dir));
  return tlbSetMark(k>=T.length?null:T[k]);
}
function tlbMoveTo(id,g,S){
  // Glisser-déposer : la fonction (ou le bloc de répétition) va dans l'interstice g, par crans
  // featMoveRaw sur une copie — même corps, blocs entiers. On s'arrête au dernier cran qui ne
  // dépasse pas la cible (fonction qui suit l'interstice en descendant, celle qui le précède en
  // montant). Une seule étape d'annulation, un seul rejeu. Retourne true si l'ordre a changé.
  S=S||tlbSteps();
  featMoveWhy=null;
  const f=(doc.features||[]).find(x=>x.id===id);
  const si=S.findIndex(s=>s.kind==='feature'&&s.id===id);
  if(!f||f.repeatId||si<0)return false;
  let A=doc.features.slice(),refus=null;
  if(g>si){ // vers la droite : avant T (null = fin du fil)
    const T=tlbGapFeature(S,g,id);
    for(let n=0;n<A.length;n++){
      const B=A.slice();
      if(!featMoveRaw(B,id,1)){refus=featMoveWhy;break;}
      if(T&&B.indexOf(f)>B.indexOf(T))break;
      A=B;
    }
  }else if(g<si){ // vers la gauche : après P (null = tête du fil)
    const P=tlbGapBefore(S,g,id);
    for(let n=0;n<A.length;n++){
      const B=A.slice();
      if(!featMoveRaw(B,id,-1)){refus=featMoveWhy;break;}
      if(P&&B.indexOf(f)<B.indexOf(P))break;
      A=B;
    }
  }
  // un cran refusé (antériorité, 43) annule tout le déplacement : pas d'arrêt à mi-chemin
  if(refus){try{faceEl.textContent='⛔ Déplacement refusé : '+refus;}catch(e){}return false;}
  if(A.every((x,i)=>x===doc.features[i]))return false;
  featMoveApply(A,'déplacement de « '+f.name+' »');
  return true;
}
// V0.7.6 : les icônes du RUBAN (SVG, 97-interface-moderne) au lieu de caractères — la même image
// que la commande qui a créé l'étape ; vert = ajout de matière, rouge + « − » = enlèvement
const TLB_COL={add:'#30d158',cut:'#ff453a',sk:'#ff9f0a',mod:'#64d2ff',rep:'#bf5af2',cg:'#ffd60a'};
function tlbSvgKey(s){
  const f=s.o;
  if(s.kind==='sketch')return ['sketch','sk'];
  if(s.kind==='cg')return [{plane:'cgPlane',axis:'cgAxis',point:'cgPoint',frame:'cgFrame'}[f.kind]||'cgPlane','cg'];
  const cut=(f.op||'add')==='cut';
  switch(f.type){
    case 'extrude':return ['extrude',cut?'cut':'add',cut];
    case 'revolve':return ['revolve',cut?'cut':'add',cut];
    case 'sweep':return ['sweep',cut?'cut':'add',cut];
    case 'hole':return ['hole','cut'];
    case 'xfillet':{let k='';try{k=xKindOf(f);}catch(e){}return [/cham/i.test(k)?'chamfer':'fillet','mod'];}
    case 'fillet':return ['fillet','mod'];
    case 'repeat':return ['pattern','rep'];
    case 'combine':return ['combine',f.mode==='cut'?'cut':'mod',f.mode==='cut'];
    case 'xmove':case 'xdelface':return ['face','mod'];
    case 'xdraft':return ['draft','mod'];
    case 'xshell':return ['shell','cut'];
    case 'xsplit':return ['split','mod'];
    case 'bmove':return ['move','mod'];
    case 'import':return ['import','mod'];
  }
  return null;
}
function tlbIcon(s){
  let k=null;try{k=tlbSvgKey(s);}catch(e){k=null;}
  const svg=k&&typeof mfI==='function'?mfI(k[0],22):null;
  if(svg){
    const col=tlbIsSel(s)?'':'color:'+TLB_COL[k[1]]+';';
    return '<span class="tlbI" style="'+col+'display:inline-flex;position:relative">'+svg+
      (k[2]?'<b style="position:absolute;right:-4px;bottom:-5px;font-size:12px;line-height:1;font-weight:900">−</b>':'')+'</span>';
  }
  if(s.kind==='feature')return featIconOf(s.o);
  if(s.kind==='sketch')return '✏️';
  return (CG_KINDS[s.o.kind]||{ic:'◇'}).ic;
}
function tlbName(s){
  if(s.kind==='feature')return s.o.name+(s.o.type==='repeat'?' · '+(doc.features||[]).filter(k=>k.repeatId===s.o.id).length+' instance(s)':'');
  if(s.kind==='sketch')return s.o.name+' · esquisse';
  try{return cgLabel(s.o);}catch(e){return s.o.name||'Construction';}
}
function tlbIsSel(s){
  if(s.kind==='feature')return (sel.kind==='feature'&&sel.id===s.id)||treeSel.indexOf(s.id)>=0;
  return (sel.kind===(s.kind==='cg'?'cg':'sketch')&&sel.id===s.id)||treeSel.indexOf(s.id)>=0;
}
function tlbClick(s,ev){
  if(tlbNoClick){tlbNoClick=false;return;}
  if(s.kind==='cg'){
    if(cgTreePick({k:'cg',id:s.id}))return; // saisie de construction en cours : référence
    sel={kind:'cg',id:s.id};treeSel=[];renderTree();renderProps();try{cgDraw();}catch(e){}
    return;
  }
  if(s.kind==='feature'&&treeSelClick('feature',s.id,ev))return;
  if(s.kind==='feature'&&ghostHide===s.id)ghostHide=null;
  treeSel=s.kind==='feature'?[s.id]:[];
  sel={kind:s.kind,id:s.id};
  renderTree();renderProps();refreshParts();
}
function tlbDbl(s){
  // Double-clic = édition : esquisse, congé/chanfrein exact, dépouille, coque, construction
  if(s.kind==='sketch'){openSketch(s.id);return;}
  if(s.kind==='cg'){if(!cgMode)cgEdit(s.id);return;}
  const f=s.o;
  sel={kind:'feature',id:f.id};treeSel=[];
  if(f.type==='xfillet')enterExactFilletMode(f);
  else if(f.type==='xdraft')enterDraftMode(f);
  else if(f.type==='xshell'||f.type==='xdelface')enterCoqueMode(f);
  else if(f.type==='xsplit')enterSplitMode(f);
  else{renderTree();renderProps();}
}
function tlbHost(){
  if(tlbEl)return tlbEl;
  const vp=$('vpwrap');if(!vp)return null;
  const d=document.createElement('div');d.id='mfTl';
  const C=document.createElement('div');C.className='tlbC';
  [['⏮',-2,'Marqueur au début du fil'],['◀',-1,'Marqueur une fonction plus tôt'],['▶',1,'Marqueur une fonction plus tard'],['⏭',2,'Marqueur en fin de fil (tout rejouer)']].forEach(([t,k,h])=>{
    const b=document.createElement('button');b.textContent=t;b.title=h;b.onclick=()=>tlbStep(k);C.appendChild(b);
  });
  const R=document.createElement('div');R.className='tlbR';
  const N=document.createElement('span');N.className='tlbN';
  const B=document.createElement('div');B.className='tlbB';
  d.appendChild(C);d.appendChild(R);d.appendChild(N);d.appendChild(B);
  d._row=R;d._cnt=N;d._steps=[];d._bar=B;
  R.addEventListener('scroll',tlbBarSync);
  window.addEventListener('resize',tlbBarSync);
  B.onpointerdown=e=>{
    if(e.button)return;const x0=e.clientX,s0=R.scrollLeft;B.classList.add('drag');
    try{B.setPointerCapture(e.pointerId);}catch(_){}
    B.onpointermove=ev=>{R.scrollLeft=s0+(ev.clientX-x0)*R.scrollWidth/Math.max(1,R.clientWidth);};
    B.onpointerup=B.onpointercancel=()=>{B.onpointermove=null;B.classList.remove('drag');};
    try{e.preventDefault();}catch(_){}
  };
  // la vue 3D ne doit ni tourner ni zoomer sous le bandeau ; molette = défilement horizontal
  ['pointerdown','mousedown','dblclick'].forEach(t=>d.addEventListener(t,e=>{try{e.stopPropagation();}catch(_){}}));
  d.addEventListener('wheel',e=>{try{e.stopPropagation();if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){R.scrollLeft+=e.deltaY;e.preventDefault();}}catch(_){}},{passive:false});
  d.addEventListener('contextmenu',e=>{try{e.stopPropagation();}catch(_){}});
  window.addEventListener('pointermove',tlbDragMove);
  window.addEventListener('pointerup',tlbDragEnd);
  vp.appendChild(d);tlbEl=d;
  return d;
}
function tlbGapAt(x){
  // Interstice sous l'abscisse x : nombre d'étapes dont le centre est à gauche
  const L=tlbEl?tlbEl._steps:[];let g=0;
  for(const el of L){const r=el.getBoundingClientRect();if(x>r.left+r.width/2)g++;else break;}
  return g;
}
function tlbPlaceAt(node,g){
  // Glisse le marqueur / l'indicateur de dépose dans l'interstice g (aperçu en direct)
  const R=tlbEl._row,L=tlbEl._steps;
  try{R.insertBefore(node,g<L.length?L[g]:null);}catch(e){}
}
function tlbDragMove(e){
  const D=tlbDrag;if(!D||!tlbEl)return;
  if(!D.on){if(Math.abs(e.clientX-D.x0)<5)return;D.on=true;
    if(D.t==='feat'){D.node=document.createElement('div');D.node.className='tlbD';if(D.el)D.el.className+=' drag';}
    else D.node.className='tlbM on';
  }
  D.gap=tlbGapAt(e.clientX);
  tlbPlaceAt(D.node,D.gap);
}
function tlbDragEnd(){
  const D=tlbDrag;tlbDrag=null;
  if(!D||!D.on)return;
  tlbNoClick=D.t==='feat'; // le relâcher d'un glisser n'est pas un clic de sélection
  setTimeout(()=>{tlbNoClick=false;},0);
  const S=tlbSteps();
  if(D.t==='mark'){if(!tlbSetMark(tlbGapFeature(S,D.gap)))renderTimeline();}
  else if(!tlbMoveTo(D.id,D.gap,S)){
    if(!featMoveWhy)try{faceEl.textContent='Déplacement impossible ici : une fonction reste dans son corps, une répétition se déplace en bloc.';}catch(e){}
    renderTimeline();
  }
}
function renderTimeline(){
  const h=tlbHost();if(!h)return;
  if(tlbDrag)return; // pas de re-rendu sous un glisser en cours
  const R=h._row;R.innerHTML='';h._steps=[];
  const S=tlbSteps(),mg=tlbMarkGap(S),mOn=tlIdx()>=0;
  const mk=()=>{
    const M=document.createElement('div');M.className='tlbM';
    M.title=mOn?'⏱ Marqueur temps — glisser pour rejouer jusqu’à une autre étape (au-delà : grisé, hors rejeu)':'⏱ Marqueur temps (fin du fil) — glisser vers la gauche pour revenir en arrière dans l’historique';
    M.onpointerdown=e=>{if(e.button)return;tlbDrag={t:'mark',x0:e.clientX,on:false,gap:mg,node:M};try{e.preventDefault();}catch(_){}};
    M.ondblclick=()=>tlbSetMark(null);
    return M;
  };
  S.forEach((s,i)=>{
    if(i===mg)R.appendChild(mk());
    const d=document.createElement('div');
    const vis=s.o.visible!==false;
    d.className='tlbS '+(s.kind==='feature'?'ft':(s.kind==='sketch'?'sk':'cg'))+(tlbIsSel(s)?' sel':'')+(vis?'':' hid')+(s.off?' off':'')+(s.warn?' warn':'');
    d.innerHTML='<span>'+tlbIcon(s)+'</span>'+(s.warn?'<span class="w">⚠</span>':'');
    const why=s.warn&&s.kind==='cg'&&s.o.msg?' — ⚠ '+s.o.msg:(s.warn?' — ⚠ à vérifier (résultat incomplet)':'');
    d.title=tlbName(s)+why+(s.off?' — hors rejeu (au-delà du marqueur)':'')+(vis?'':' — masqué')+
      '\nClic = sélectionner · double-clic = '+(s.kind==='sketch'?'modifier l’esquisse':(s.kind==='cg'?'modifier':'éditer'))+(s.kind==='feature'?' · glisser = réordonner dans le corps':'');
    d.onclick=ev=>tlbClick(s,ev);
    d.ondblclick=()=>tlbDbl(s);
    d.oncontextmenu=e=>{e.preventDefault();showCtx(e.clientX,e.clientY,{kind:s.kind,id:s.id});};
    if(s.kind==='feature')d.onpointerdown=e=>{if(e.button)return;tlbDrag={t:'feat',id:s.id,x0:e.clientX,on:false,gap:i,el:d};};
    R.appendChild(d);h._steps.push(d);
  });
  if(mg>=S.length&&S.length)R.appendChild(mk());
  if(!S.length){const e=document.createElement('span');e.className='tlbE';e.textContent='Fil vide — créez une esquisse puis une extrusion.';R.appendChild(e);}
  const nF=S.filter(s=>s.kind==='feature').length,nA=S.filter(s=>s.kind==='feature'&&!s.off).length;
  h._cnt.textContent=nF?(mOn?nA+' / '+nF:nF)+' fonction(s)':'';
  // V0.23.26 : sélection changée → l'étape choisie, hors de vue, vient au centre du bandeau (42)
  const k=selRevealKey();
  tlbBarSync();
  if(k!==tlbRevealLast){const el=R.querySelector('.tlbS.sel');if(!el||el.offsetParent){tlbRevealLast=k;if(el)try{selRevealIn(R,el,true);}catch(e){}}}
}
let tlbRevealLast='';
function tlbBarSync(){
  // Curseur de la barre fondue : position et longueur proportionnelles au défilement de la rangée
  const h=tlbEl;if(!h||!h._bar)return;
  const R=h._row,B=h._bar,sw=R.scrollWidth,cw=R.clientWidth;
  if(!(sw>cw+1)){B.classList.remove('on');return;}
  const w=Math.max(24,cw*cw/sw),x=R.offsetLeft+(cw-w)*R.scrollLeft/Math.max(1,sw-cw);
  B.style.left=x+'px';B.style.width=w+'px';B.classList.add('on');
}
