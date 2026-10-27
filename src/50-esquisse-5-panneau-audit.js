// Esquisse 2D (5/5) : panneau latéral, annuler/rétablir, santé, audit et degrés de liberté, pose des cotes.
/* ----- panneau latéral esquisse ----- */
function skStatus(msg){skMsg=msg||'';const el=$('skStatus');if(el)el.textContent=skMsg||skDefaultStatus();}
function skDefaultStatus(){
  if(!skEdit)return '';
  const sk=skEdit,fix=skFixed(sk);
  const freeP=Object.keys(skPts(sk)).filter(p=>!fix.has(p)).length;
  const freeR=(sk.entities||[]).filter(e=>(e.t==='circle'||e.t==='arc')&&!rLocked(sk,e)).length;
  const locked=(freeP===0&&freeR===0&&Object.keys(skPts(sk)).length>0);
  void locked;
  const dof=skDofInfo(sk).dof,Au=sk._audit||{residual:0};
  let s;
  if(Au.residual>0.05&&dof<=0)s=`⚠ Sur-contrainte probable (résidu ${Au.residual.toFixed(2)} mm — voir lignes rouges)`;
  else if(Au.residual>0.05)s=`🔵 Sous-contrainte · résidu ${Au.residual.toFixed(2)} mm`;
  else s=(dof<=0&&Object.keys(skPts(sk)).length>0)?'⚫ Entièrement contrainte':`🔵 Sous-contrainte (${Math.max(dof,0)} libertés)`;
  s+=` · ${sk.entities.length} entités · ${sk.constraints.length} contraintes · ${sk.dims.length} cotes`;
  const H=sk._health;
  if(H)s+=H.opens.length?` · ⚠ ${H.opens.length} bout(s) ouvert(s)`:` · ✓ ${H.loops} contour(s)${H.holes?` · ${H.holes} trou(s)`:''}`;
  return s;
}
function conDesc(sk,c){
  // Texte SANS glyphe : l'icône (registre SK_CON) est posée à côté par la liste.
  const nm=id=>{const e=entById(sk,id);return e?({line:'ligne',circle:'cercle',arc:'arc',cpoint:'point'}[e.t]||'?')+'…'+String(id).slice(-3):'?';};
  const pt=id=>'pt…'+String(id).slice(-3);
  const R=SK_CON[c.type],N=R?R.nom:c.type;
  if(c.type==='h'||c.type==='v')return N+' '+nm(c.line);
  if(c.type==='fix')return N+' '+(c.p?pt(c.p):nm(c.ent));
  if(c.type==='tangent')return N+' '+nm(c.line)+' / '+nm(c.ent);
  if(c.type==='symmetric')return N+' '+nm(c.a)+' / '+nm(c.b)+' | axe '+nm(c.mid);
  if(c.type==='coincident')return N+' '+pt(c.a)+' / '+pt(c.b)+(c.a===SK_ORIGIN||c.b===SK_ORIGIN?' (origine)':'');
  if(c.type==='oncircle')return 'Point '+pt(c.p)+' sur '+nm(c.ent);
  if(c.type==='online')return 'Point '+pt(c.p)+' sur '+nm(c.line);
  if(c.type==='midpoint')return c.p?('Milieu : '+pt(c.p)+' au centre de '+nm(c.line)):('Milieux égaux '+nm(c.a)+' / '+nm(c.b));
  if(c.type==='offset')return N+' '+nm(c.c)+'→'+nm(c.d)+' = '+nm(c.a)+'→'+nm(c.b);
  if(c.a&&c.b)return N+' '+nm(c.a)+' / '+nm(c.b);
  return N;
}
function dimDesc(sk,d){
  if(d.type==='length')return'Longueur = '+d.value.toFixed(2);
  if(d.type==='distance')return'Distance = '+d.value.toFixed(2);
  if(d.type==='diameter')return'Ø = '+d.value.toFixed(2);
  if(d.type==='radius')return'R = '+d.value.toFixed(2);
  if(d.type==='angle')return'Angle = '+(d.value*180/Math.PI).toFixed(1)+'°';
  if(d.type==='gap')return'Entraxe = '+d.value.toFixed(2);
  if(d.type==='distline')return'Point ↔ ligne = '+d.value.toFixed(2);
  return d.type;
}
function renderSkPanel(){
  if(!skEdit)return;const sk=skEdit;
  $('skStat').textContent=skDefaultStatus()+(sk._refNote?` · ${sk._refNote}`:'');
  if(!skMsg)$('skStatus').textContent=skDefaultStatus();
  // sélection → champs numériques
  const box=$('skSelBox');box.innerHTML='';
  const mkRow=(lab,val,fn)=>{
    const r=document.createElement('div');r.className='skrow';
    const l=document.createElement('label');l.textContent=lab;r.appendChild(l);
    const i=document.createElement('input');i.type='number';i.step='0.5';i.value=(+val).toFixed(2);
    i.onchange=()=>{const f=parseFloat(i.value);if(isFinite(f)){skPushUndo();fn(f);skSolveOrRevert(sk,'Valeur');drawSketch2D();renderSkPanel();}};
    r.appendChild(i);box.appendChild(r);
  };
  const addBtn=(label,fn)=>{
    const b=document.createElement('button');b.className='skbtn';b.textContent=label;b.onclick=fn;box.appendChild(b);return b;
  };
  const note=t=>{const s=document.createElement('span');s.className='note';s.textContent=t;box.appendChild(s);};
  if(skSel&&skSel.kind==='ent'){
    const e=entById(sk,skSel.id);
    const pn=e&&e.projName?(e.projName+(e.srcName?' ← '+e.srcName:'')+' · '):'';
    if(!e){skSel=null;note('Entité supprimée.');}
    else if(e.t==='line'){const A=sk.points[e.p1],B=sk.points[e.p2];
      note(`${pn}Ligne${e.ref?' (référence 3D)':(e.construction?' (construction)':'')} · L=${lineLen(sk,e).toFixed(2)} mm`);mkRow('x1',A.x,v=>A.x=v);mkRow('y1',A.y,v=>A.y=v);mkRow('x2',B.x,v=>B.x=v);mkRow('y2',B.y,v=>B.y=v);}
    else if(e.t==='circle'){const C=sk.points[e.pc];note(`${pn}Cercle`+(e.construction?' (construction)':'')+' · Ø='+(e.r*2).toFixed(2)+' mm');mkRow('cx',C.x,v=>C.x=v);mkRow('cy',C.y,v=>C.y=v);mkRow('r',e.r,v=>e.r=Math.max(v,.1));}
    else if(e.t==='arc'){const C=sk.points[e.pc],an=arcAngles(sk,e);note(`${pn}Arc`+(e.construction?' (construction)':'')+' · R='+e.r.toFixed(2)+' mm');mkRow('cx',C.x,v=>C.x=v);mkRow('cy',C.y,v=>C.y=v);mkRow('r',e.r,v=>{e.r=Math.max(v,.1);});if(an){const d1=an.a1*180/Math.PI,d2=an.a2*180/Math.PI;mkRow('a1°',d1,v=>{const a=v*Math.PI/180,A=sk.points[e.pa];A.x=C.x+e.r*Math.cos(a);A.y=C.y+e.r*Math.sin(a);});mkRow('a2°',d2,v=>{const a=v*Math.PI/180,B=sk.points[e.pb];B.x=C.x+e.r*Math.cos(a);B.y=C.y+e.r*Math.sin(a);});}}
    else if(e.t==='cpoint'){const Q=sk.points[e.p];note(e.hole?'Centre de perçage (fonction 3D « Perçage »)':'Point de construction');mkRow('x',Q.x,v=>Q.x=v);mkRow('y',Q.y,v=>Q.y=v);}
    addBtn('🗑 Supprimer',deleteSkSel);
  }else if(skSel&&skSel.kind==='point'){
    const p=sk.points[skSel.pid];
    if(!p){skSel=null;note('Point supprimé.');}
    else if(skSel.pid===SK_ORIGIN)note('Origine (0,0) — point fixe permanent ⌖ (ancre de cotes et de centres).');
    else{note('Point'+(skFixed(sk).has(skSel.pid)?' 🔒 fixe':''));mkRow('x',p.x,v=>p.x=v);mkRow('y',p.y,v=>p.y=v);addBtn('🗑 Supprimer',deleteSkSel);}
  }else if(skSel&&(skSel.kind==='con'||skSel.kind==='dim')){
    note('Voir listes ci-dessous (✕ pour retirer).');addBtn('🗑 Supprimer',deleteSkSel);
  }else note('Cliquez une entité (outil ➤). Ctrl/Cmd = multi-sélection.');
  // santé / docteur : chaque problème a son bouton de réparation
  const hl=$('skHealth');hl.innerHTML='';
  const H0=sk._health;
  const hrow=(txt,btn,fn)=>{
    const d=document.createElement('div');d.className='li';
    const s=document.createElement('span');s.textContent=txt;s.style.flex='1';d.appendChild(s);
    if(btn){const b=document.createElement('button');b.className='skbtn';b.textContent=btn;b.onclick=fn;d.appendChild(b);}
    hl.appendChild(d);
  };
  if(!H0)hrow('—');
  else{
    hrow(`Contours : ${H0.loops}`+(H0.holes?` · trous : ${H0.holes}`:'')+(H0.opens.length?` · ⚠ ${H0.opens.length} bout(s) ouvert(s)`:''),H0.opens.length?'Voir':null,()=>{if(H0.gapPair){skView.cx=(H0.gapPair[0].x+H0.gapPair[1].x)/2;skView.cy=(H0.gapPair[0].y+H0.gapPair[1].y)/2;drawSketch2D();}});
    if(H0.gapPair&&H0.gapD<5)hrow(`Écart ${H0.gapD.toFixed(2)} mm en (${H0.gapPair[0].x.toFixed(1)}, ${H0.gapPair[0].y.toFixed(1)})`,'Refermer',()=>skCloseGap());
    if(H0.dupes.length)hrow(`${H0.dupes.length} point(s) quasi-dupliqué(s)`,'Fusionner',()=>{skPushUndo();H0.dupes.forEach(([a,b])=>{if(sk.points[a]&&sk.points[b])mergePoints(sk,b,a);});afterEdit();});
    if(H0.degen.length)hrow(`${H0.degen.length} entité(s) dégénérée(s)`,'Supprimer',()=>{skPushUndo();sk.entities=sk.entities.filter(e=>!H0.degen.includes(e.id));if(skSel&&H0.degen.includes(skSel.id))skSel=null;afterEdit();});
    H0.selfints.slice(0,5).forEach(p=>hrow(`Croisement en (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`,'Voir',()=>{skView.cx=p.x;skView.cy=p.y;drawSketch2D();}));
  }
  // contraintes
  const cl=$('skConsList');cl.innerHTML='';
  if(!sk.constraints.length)cl.innerHTML='<span class="note">Aucune.</span>';
  sk.constraints.forEach(c=>{
    const d=document.createElement('div');d.className='li'+(skSel&&skSel.kind==='con'&&skSel.id===c.id?' sel':'');
    const wA=((sk._audit||{}).all||[]).find(o=>o.id===c.id);
    const bad=wA&&wA.viol>0.05;
    const ic=document.createElement('span');ic.className='skli-ic';ic.innerHTML=skIcon((SK_CON[c.type]||{}).ic||'fix',15);d.appendChild(ic);
    const s=document.createElement('span');s.textContent=conDesc(sk,c)+(bad?`  ⚠±${wA.viol.toFixed(2)}`:'');s.style.flex='1';d.appendChild(s);
    if(bad)d.style.borderColor='#ff453a';
    const x=document.createElement('span');x.className='x';x.textContent='✕';x.title='Retirer';
    x.onclick=ev=>{ev.stopPropagation();skPushUndo();sk.constraints=sk.constraints.filter(k=>k.id!==c.id);if(skSel&&skSel.id===c.id)skSel=null;solveSketch(sk);drawSketch2D();renderSkPanel();};
    d.appendChild(x);d.onclick=()=>{skSel={kind:'con',id:c.id};drawSketch2D();renderSkPanel();};cl.appendChild(d);
  });
  // cotes
  const dl=$('skDimsList');dl.innerHTML='';
  if(!sk.dims.length)dl.innerHTML='<span class="note">Aucune — outil 📐.</span>';
  sk.dims.forEach(d=>{
    const r=document.createElement('div');r.className='li'+(skSel&&skSel.kind==='dim'&&skSel.id===d.id?' sel':'');
    const wD=((sk._audit||{}).all||[]).find(o=>o.id===d.id);
    const badD=wD&&wD.viol>0.05;
    const icD=document.createElement('span');icD.className='skli-ic';icD.innerHTML=skIcon(SK_DIM_IC[d.type]||'dim',15);r.appendChild(icD);
    const s=document.createElement('span');s.textContent=dimDesc(sk,d)+(badD?`  ⚠±${wD.viol.toFixed(2)}`:'');s.style.flex='1';r.appendChild(s);
    if(badD)r.style.borderColor='#ff453a';
    // V0.11.23 : bascule pilotante ⇄ référence à la demande (aussi au clic droit sur la cote)
    const tg=document.createElement('span');tg.className='x';tg.textContent=d.ref?'( )':'⇄';tg.title=d.ref?'Cote de référence (mesure seulement) — rendre pilotante':'Rendre cote de référence (mesure seulement)';
    tg.onclick=ev=>{ev.stopPropagation();skDimToggleRef(d.id);};
    r.appendChild(tg);
    const x=document.createElement('span');x.className='x';x.textContent='✕';x.title='Retirer';
    x.onclick=ev=>{ev.stopPropagation();skPushUndo();sk.dims=sk.dims.filter(k=>k.id!==d.id);if(skSel&&skSel.id===d.id)skSel=null;drawSketch2D();renderSkPanel();};
    r.appendChild(x);
    r.onclick=()=>{skSel={kind:'dim',id:d.id};drawSketch2D();renderSkPanel();};
    r.ondblclick=()=>editDim(d.id);dl.appendChild(r);
  });
}
function skSelectedEnts(){
  const out=[];if(!skEdit)return out;
  if(skSel&&skSel.kind==='ent'){const e=entById(skEdit,skSel.id);if(e)out.push(e);}
  skSelX.forEach(s=>{if(s.kind==='ent'){const e=entById(skEdit,s.id);if(e&&!out.includes(e))out.push(e);}});
  return out;
}
function toggleConstr(){
  if(!skEdit)return;
  const ents=skSelectedEnts().filter(e=>e.t==='line'||e.t==='circle'||e.t==='arc');
  if(!ents.length){skStatus('Sélectionnez une ligne, un cercle ou un arc (➤), puis basculez en construction (X).');return;}
  skPushUndo();
  const toCon=!ents.some(e=>e.construction);
  ents.forEach(e=>{if(toCon)e.construction=true;else delete e.construction;});
  afterEdit();
  skStatus(toCon?'Géométrie de construction ⇄ — trait discontinu, hors profil.':'Géométrie normale ⇄ — participe au profil.');
}
function applyCon(type){
  if(!skEdit)return;const sk=skEdit,ents=skSelectedEnts();
  if(type==='construction'){toggleConstr();return;}
  const lines=ents.filter(e=>e.t==='line');
  // V0.2.2 : COÏNCIDENT en contrainte (l'outil ⌖ reste) — 2 points : confondus ; 1 point + 1 ligne :
  // le point reste sur la DROITE (prolongement compris : distance à la droite infinie) ;
  // 1 point + 1 cercle / arc : sur la courbe.
  if(type==='coincident'){
    const pts=[];if(skSel&&skSel.kind==='point')pts.push(skSel.pid);
    skSelX.forEach(s=>{if(s.kind==='point'&&!pts.includes(s.pid))pts.push(s.pid);});
    const curv=ents.filter(e=>e.t==='circle'||e.t==='arc');
    const has=f=>(sk.constraints||[]).some(f);
    if(pts.length===2&&!ents.length){
      const[a,b]=pts;
      if(has(c=>c.type==='coincident'&&((c.a===a&&c.b===b)||(c.a===b&&c.b===a)))){skStatus('Coïncidence déjà posée.');return;}
      skPushUndo();sk.constraints.push({id:skNewEid(sk),type:'coincident',a,b});
    }else if(pts.length===1&&lines.length===1&&ents.length===1){
      const p=pts[0],l=lines[0];
      if(l.p1===p||l.p2===p){skStatus('Ce point est déjà une extrémité de la ligne.');return;}
      if(has(c=>c.type==='online'&&c.p===p&&c.line===l.id)){skStatus('Point déjà sur cette ligne.');return;}
      skPushUndo();sk.constraints.push({id:skNewEid(sk),type:'online',p,line:l.id});
    }else if(pts.length===1&&curv.length===1&&ents.length===1){
      const p=pts[0],e=curv[0];
      if(e.pc===p){skStatus('Ce point est le centre : utilisez Coaxial ou déplacez-le.');return;}
      if(has(c=>c.type==='oncircle'&&c.p===p&&c.ent===e.id)){skStatus('Point déjà sur ce cercle.');return;}
      skPushUndo();sk.constraints.push({id:skNewEid(sk),type:'oncircle',p,ent:e.id});
    }else{skStatus('Coïncident : sélectionnez 2 points, ou 1 point + 1 ligne (il glissera sur toute la droite), ou 1 point + 1 cercle/arc (Ctrl/Cmd+clic pour le 2ᵉ).');return;}
    skMsg='';const ok=skSolveOrRevert(sk,'Contrainte');drawSketch2D();renderSkPanel();
    if(ok)skStatus(pts.length===2?'Points coïncidents ⌖.':(lines.length?'Point sur la droite ⌖ — il peut glisser au-delà du segment.':'Point sur la courbe ⌖.'));
    return;
  }
  if(type==='h'||type==='v'){
    if(!lines.length){skStatus('Sélectionnez d’abord une ou plusieurs lignes (outil ➤).');return;}
    skPushUndo();
    lines.forEach(l=>{if(!hasHV(sk,l.id,type))sk.constraints.push({id:skNewEid(sk),type,line:l.id});});
  }
  if(type==='equal'){
    if(ents.length!==2){skStatus('Égal : sélectionnez exactement 2 lignes ou 2 cercles/arcs.');return;}
    const[a,b]=ents;
    const ok=(a.t==='line'&&b.t==='line')||((a.t==='circle'||a.t==='arc')&&(b.t==='circle'||b.t==='arc'));
    if(!ok){skStatus('Égal : types incompatibles.');return;}
    skPushUndo();
    sk.constraints.push({id:skNewEid(sk),type:'equal',a:a.id,b:b.id});
  }
  if(type==='tangent'){
    if(ents.length!==2){skStatus('Tangence : sélectionnez 1 ligne + 1 cercle/arc (ou 2 cercles).');return;}
    const[a,b]=ents,isL=e=>e.t==='line',isC=e=>e.t==='circle'||e.t==='arc';
    if(isL(a)&&isC(b)){skPushUndo();sk.constraints.push({id:skNewEid(sk),type:'tangent',line:a.id,ent:b.id});skPinTangent(sk,a.id,b.id);}
    else if(isL(b)&&isC(a)){skPushUndo();sk.constraints.push({id:skNewEid(sk),type:'tangent',line:b.id,ent:a.id});skPinTangent(sk,b.id,a.id);}
    else if(isC(a)&&isC(b)){skPushUndo();sk.constraints.push({id:skNewEid(sk),type:'tangent2',a:a.id,b:b.id});}
    else{skStatus('Tangence : ligne↔cercle ou cercle↔cercle uniquement.');return;}
  }
  if(type==='coaxial'){
    const curves=ents.filter(e=>e.t==='circle'||e.t==='arc');
    if(ents.length!==2||curves.length!==2){skStatus('Coaxial : sélectionnez exactement 2 cercles ou arcs.');return;}
    const[a,b]=curves;
    if(a.id===b.id||a.pc===b.pc){skStatus('Ces deux courbes ont déjà le même centre (coaxiales ⌾).');return;}
    if((sk.constraints||[]).some(c=>c.type==='coaxial'&&((c.a===a.id&&c.b===b.id)||(c.a===b.id&&c.b===a.id)))){skStatus('Coaxialité déjà posée.');return;}
    skPushUndo();
    sk.constraints.push({id:skNewEid(sk),type:'coaxial',a:a.id,b:b.id});
  }
  if(type==='parallel' || type==='perpendicular'){
    if(lines.length!==2){skStatus((type==='parallel'?'Parallèle':'Perpendiculaire')+' : sélectionnez exactement 2 lignes.');return;}
    const[a,b]=[lines[0].id,lines[1].id];
    // Doublon exact : déjà posée (dans un sens ou dans l'autre) → rien à faire.
    if(type==='parallel'&&skHasParallel(sk,a,b)){skStatus('Parallèle déjà posée ∥.');return;}
    if(type==='perpendicular'&&skHasPerp(sk,a,b)){skStatus('Perpendiculaire déjà posée ⟂.');return;}
    // ─/│ prime sur ⟂ (comme à la création) : H×V implique ⟂, l'ajouter ne sert à rien.
    if(type==='perpendicular'&&skPerpImplied(sk,a,b)){skStatus('⟂ implicite par ─/│ : non ajoutée (déjà acquise).');return;}
    skPushUndo();
    sk.constraints.push({id:skNewEid(sk),type:type,a:lines[0].id,b:lines[1].id});
  }
  if(type==='collinear'){
    if(lines.length!==2){skStatus('Colinéaire : sélectionnez exactement 2 lignes.');return;}
    const[a,b]=lines;
    if(a.id===b.id){skStatus('Colinéaire : 2 lignes distinctes.');return;}
    if((sk.constraints||[]).some(c=>c.type==='collinear'&&((c.a===a.id&&c.b===b.id)||(c.a===b.id&&c.b===a.id)))){skStatus('Colinéaire déjà posée.');return;}
    if((sk.constraints||[]).some(c=>c.type==='perpendicular'&&((c.a===a.id&&c.b===b.id)||(c.a===b.id&&c.b===a.id)))){skStatus('Colinéaire impossible : ces lignes sont perpendiculaires (⟂ posée).');return;}
    skPushUndo();
    sk.constraints.push({id:skNewEid(sk),type:'collinear',a:a.id,b:b.id});
    sk.constraints=skDedupConstraints(sk); // la ∥ éventuelle sur cette paire devient redondante
    skMsg='';const ok=skSolveOrRevert(sk,'Contrainte');drawSketch2D();renderSkPanel();
    if(ok)skStatus('Colinéaire — les 2 lignes portées par la même droite.');
    return;
  }
  if(type==='symmetric'){
    if(lines.length!==3){skStatus('Symétrie : sélectionnez 3 lignes — 2 à symétriser + l’axe en dernier (ex : clic axe en dernier).');return;}
    const a=lines[0],b=lines[1],mid=lines[2];
    if(new Set([a.id,b.id,mid.id]).size!==3){skStatus('Symétrie : 3 lignes distinctes requises.');return;}
    if((sk.constraints||[]).some(c=>c.type==='symmetric'&&((c.a===a.id&&c.b===b.id)||(c.a===b.id&&c.b===a.id))&&c.mid===mid.id)){skStatus('Symétrie déjà posée.');return;}
    skPushUndo();
    sk.constraints.push({id:skNewEid(sk),type:'symmetric',a:a.id,b:b.id,mid:mid.id});
  }
  if(type==='fix'){
    const pts=[];if(skSel&&skSel.kind==='point')pts.push(skSel.pid);
    skSelX.forEach(s=>{if(s.kind==='point'&&!pts.includes(s.pid))pts.push(s.pid);});
    const circ=ents.filter(e=>e.t==='circle'||e.t==='arc');
    const fixAll=new Set([...pts,...lines.flatMap(l=>[l.p1,l.p2])].filter(p=>p!==SK_ORIGIN));
    if(!fixAll.size&&!circ.length){skStatus(pts.includes(SK_ORIGIN)&&!pts.some(p=>p!==SK_ORIGIN)?'Origine (0,0) : déjà fixe.':'Fixe : sélectionnez un point, une ligne ou un cercle.');return;}
    skPushUndo();
    fixAll.forEach(p=>sk.constraints.push({id:skNewEid(sk),type:'fix',p}));
    circ.forEach(e=>sk.constraints.push({id:skNewEid(sk),type:'fix',ent:e.id}));
  }
  if(type==='midpoint'){
    const pts=[];if(skSel&&skSel.kind==='point')pts.push(skSel.pid);
    skSelX.forEach(s=>{if(s.kind==='point'&&!pts.includes(s.pid))pts.push(s.pid);});
    const finish=()=>{skMsg='';const ok=skSolveOrRevert(sk,'Contrainte');drawSketch2D();renderSkPanel();return ok;};
    if(lines.length===2&&pts.length===0){
      const[a,b]=lines;
      if(a.id===b.id){skStatus('Milieu : sélectionnez 2 lignes distinctes.');return;}
      if((sk.constraints||[]).some(c=>c.type==='midpoint'&&((c.a===a.id&&c.b===b.id)||(c.a===b.id&&c.b===a.id)))){skStatus('Milieux égaux déjà posés ⊕.');return;}
      skPushUndo();
      sk.constraints.push({id:skNewEid(sk),type:'midpoint',a:a.id,b:b.id});
      if(finish())skStatus('Milieux égaux ⊕ — les 2 lignes se centrent l\u2019une sur l\u2019autre.');
    }else if(lines.length===1&&pts.length===1){
      if((sk.constraints||[]).some(c=>c.type==='midpoint'&&c.p===pts[0]&&c.line===lines[0].id)){skStatus('Point au milieu déjà posé ⊕.');return;}
      skPushUndo();
      sk.constraints.push({id:skNewEid(sk),type:'midpoint',p:pts[0],line:lines[0].id});
      if(finish())skStatus('Point au milieu de la ligne ⊕ — la ligne reste entière.');
    }else{
      skStatus('Milieu ⊕ : sélectionnez 2 lignes (milieux égaux) ou 1 point + 1 ligne (point au centre).');
    }
    return;
  }
  skMsg='';skSolveOrRevert(sk,'Contrainte');drawSketch2D();renderSkPanel();
}
function deleteSkSel(){
  // Supprime la sélection SIMPLE ou MULTIPLE (fenêtre, Ctrl/Cmd+clic) : entités, points
  // (+ leurs entités attachées), contraintes et cotes. Un seul undo pour tout le lot.
  if(!skEdit)return;const sk=skEdit;
  const killEnts=new Set(),killPts=new Set(),killCons=new Set(),killDims=new Set();
  const take=s=>{
    if(!s)return;
    if(s.kind==='ent')killEnts.add(s.id);
    else if(s.kind==='point')killPts.add(s.pid);
    else if(s.kind==='con')killCons.add(s.id);
    else if(s.kind==='dim')killDims.add(s.id);
  };
  take(skSel);(skSelX||[]).forEach(take);
  if(!killEnts.size&&!killPts.size&&!killCons.size&&!killDims.size){skStatus('Rien à supprimer — sélectionnez (fenêtre, Ctrl/Cmd+clic).');return;}
  const blockedOrigin=killPts.has(SK_ORIGIN);
  if(blockedOrigin)killPts.delete(SK_ORIGIN);
  skPushUndo();
  if(killEnts.size)sk.entities=sk.entities.filter(x=>!killEnts.has(x.id));
  if(killPts.size)sk.entities=sk.entities.filter(x=>!(x.t==='line'&&(killPts.has(x.p1)||killPts.has(x.p2)))&&!((x.t==='circle'||x.t==='arc')&&killPts.has(x.pc))&&!(x.t==='arc'&&(killPts.has(x.pa)||killPts.has(x.pb)))&&!(x.t==='cpoint'&&killPts.has(x.p)));
  if(killCons.size)sk.constraints=sk.constraints.filter(c=>!killCons.has(c.id));
  if(killDims.size)sk.dims=sk.dims.filter(d=>!killDims.has(d.id));
  const n=killEnts.size+killPts.size+killCons.size+killDims.size;
  skSel=null;skSelX=[];cleanupSk(sk);solveSketch(sk); // orphelins + cotes orphelines nettoyés
  skStatus((blockedOrigin?'L’origine (0,0) est permanente — gardée. ':'')+n+' élément(s) supprimé(s) — Ctrl+Z pour annuler.');
  drawSketch2D();renderSkPanel();
}
/* ----- transactions (undo/redo) : chaque action = snapshot, rien n'est destructeur ----- */
let skUndoStack=[],skRedoStack=[];
function skSnap(){return JSON.parse(JSON.stringify({points:skEdit.points,entities:skEdit.entities,constraints:skEdit.constraints,dims:skEdit.dims}));}
// skCheckpoint / skBaseSync (45) : filet qui relève aussi les modifications sans skPushUndo
function skPushUndo(){if(!skEdit)return;try{skCheckpoint();}catch(e){}skUndoStack.push(skSnap());if(skUndoStack.length>100)skUndoStack.shift();skRedoStack=[];try{skBaseSync();}catch(e){}skUndoBtn();}
function skRestore(s){skEdit.points=s.points;skEdit.entities=s.entities;skEdit.constraints=s.constraints;skEdit.dims=s.dims;solveSketch(skEdit);cleanupSk(skEdit);skRefreshHealth();drawSketch2D();renderSkPanel();try{skBaseSync();}catch(e){}skUndoBtn();}
function skUndoTrans(){try{skCheckpoint();}catch(e){}if(!skEdit||!skUndoStack.length){skStatus('Rien à annuler.');return;}skRedoStack.push(skSnap());skRestore(skUndoStack.pop());skStatus('Annulé ↩.');}
function skRedoTrans(){try{skCheckpoint();}catch(e){}if(!skEdit||!skRedoStack.length){skStatus('Rien à rétablir.');return;}skUndoStack.push(skSnap());skRestore(skRedoStack.pop());skStatus('Rétabli ↪.');}
function skUndoBtn(){const u=$('skUndo'),r=$('skRedo');if(u)u.disabled=!skUndoStack.length;if(r)r.disabled=!skRedoStack.length;try{docUndoUI();}catch(e){}} // V0.7.6 : flèches du haut
/* ----- santé d'esquisse (docteur) : bouts ouverts, doublons, dégénérés, croisements ----- */
function skRefreshHealth(){if(skEdit){skEdit._health=skHealth(skEdit);skEdit._audit=skAudit(skEdit);}}
/* ----- audit du solveur : résidu mesuré + libertés comptées + pires violations ----- */
function skAudit(sk){
  const P=sk.points||{},out=[];
  const push=(id,desc,viol)=>{out.push({id,desc,viol});};
  (sk.dims||[]).forEach(d=>{
    if(d.ref)return;
    if(d.type==='length'){const l=entById(sk,d.line);if(l&&l.t==='line'){
      const A=P[l.p1],B=P[l.p2];
      const cur=(d.orient==='h'||d.orient==='v')&&A&&B?dimMeasureOf(A,B,d.orient):lineLen(sk,l);
      push(d.id,'longueur',Math.abs(cur-d.value));}}
    if(d.type==='distance'){const A=P[d.a],B=P[d.b];if(A&&B)push(d.id,'distance',Math.abs(dimMeasureOf(A,B,d.orient)-d.value));}
    if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);if(e&&(e.t==='circle'||e.t==='arc'))push(d.id,d.type,Math.abs((d.type==='diameter'?e.r*2:e.r)-d.value));}
    if(d.type==='angle'){const fr=angleFrame(sk,d);
      if(fr){const TAU=Math.PI*2;
        const want=angleWant(d,fr.delta);
        let e=want-fr.delta;
        if(e>Math.PI)e-=TAU;else if(e<-Math.PI)e+=TAU;
        push(d.id,'angle',Math.abs(e)*skAngScale(fr));}}
    if(d.type==='gap'){const A=entById(sk,d.a),B=entById(sk,d.b);
      if(A&&B&&A.t==='line'&&B.t==='line'){const P0=sk.points;
        const A1=P0[A.p1],A2=P0[A.p2],B1=P0[B.p1],B2=P0[B.p2];
        if(A1&&A2&&B1&&B2){const dx=A2.x-A1.x,dy=A2.y-A1.y,L=Math.hypot(dx,dy)||1e-9;
          const sg=(B1.x-A1.x)*(-dy/L)+(B1.y-A1.y)*(dx/L);
          push(d.id,'entraxe',(d.sgn===1||d.sgn===-1)?Math.abs(sg-d.sgn*d.value):Math.abs(Math.abs(sg)-d.value));}}}
    if(d.type==='distline'){const l=entById(sk,d.line),Pt=P[d.p];
      if(l&&l.t==='line'&&Pt){const A=P[l.p1],B=P[l.p2];
        if(A&&B){const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1e-9;
          const sg=(Pt.x-A.x)*(-dy/L)+(Pt.y-A.y)*(dx/L);
          push(d.id,'⟂ centre↔ligne',(d.sgn===1||d.sgn===-1)?Math.abs(sg-d.sgn*d.value):Math.abs(Math.abs(sg)-d.value));}}}
  });
  (sk.constraints||[]).forEach(c=>{
    if(c.type==='h'||c.type==='v'){const l=entById(sk,c.line);if(l&&l.t==='line'){const A=P[l.p1],B=P[l.p2];if(A&&B)push(c.id,c.type,Math.abs(c.type==='h'?A.y-B.y:A.x-B.x));}}
    if(c.type==='parallel'||c.type==='perpendicular'||c.type==='collinear'){
      // ABSENTS de l'audit jusqu'au 2026-10-15-007 : une ∥/⟂ violée n'était jamais
      // signalée ⚠, et le choix LM/relaxation (meilleur résidu d'audit) l'ignorait.
      const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B&&A.t==='line'&&B.t==='line'){const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
        if(A1&&A2&&B1&&B2){
          const ax=A2.x-A1.x,ay=A2.y-A1.y,La=Math.hypot(ax,ay),bx=B2.x-B1.x,by=B2.y-B1.y,Lb=Math.hypot(bx,by);
          if(La>1e-9&&Lb>1e-9){
            if(c.type==='collinear'){const nx=-ay/La,ny=ax/La;
              push(c.id,'colinéaire',Math.max(Math.abs((B1.x-A1.x)*nx+(B1.y-A1.y)*ny),Math.abs((B2.x-A1.x)*nx+(B2.y-A1.y)*ny)));}
            else{const cr=(ax*by-ay*bx)/(La*Lb),dt=(ax*bx+ay*by)/(La*Lb);
              // sin de l'écart × longueur de la plus courte : flèche en mm au bout de la ligne
              push(c.id,c.type==='parallel'?'parallèle':'perpendiculaire',Math.abs(c.type==='parallel'?cr:dt)*Math.min(La,Lb));}
          }}}
    }
    if(c.type==='equal'){const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B){if(A.t==='line'&&B.t==='line')push(c.id,'égal',Math.abs(lineLen(sk,A)-lineLen(sk,B)));
        else if((A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc'))push(c.id,'égal',Math.abs(A.r-B.r));}}
    if(c.type==='tangent'){const L=entById(sk,c.line),E=entById(sk,c.ent);
      if(L&&E&&L.t==='line'&&(E.t==='circle'||E.t==='arc')){const A=P[L.p1],B=P[L.p2],CC=P[E.pc];
        if(A&&B&&CC){const dx=B.x-A.x,dy=B.y-A.y,Ln=Math.hypot(dx,dy)||1e-9;
          const t=((CC.x-A.x)*dx+(CC.y-A.y)*dy)/(Ln*Ln);
          // distance au SEGMENT : le pied (projection du centre) doit rester dans le segment,
          // sinon le cercle semble décollé à l'écran même si la droite infinie est tangente
          let seg;
          if(t<0)seg=Math.hypot(CC.x-A.x,CC.y-A.y);
          else if(t>1)seg=Math.hypot(CC.x-B.x,CC.y-B.y);
          else seg=Math.abs((CC.x-A.x)*(-dy/Ln)+(CC.y-A.y)*(dx/Ln));
          const side=SK_TAN_SIDE.get(c),sd=(CC.x-A.x)*(-dy/Ln)+(CC.y-A.y)*(dx/Ln);
          push(c.id,'tangence',(side&&sd*side<-1e-6)?Math.abs(sd)+E.r:Math.abs(seg-E.r));}}}
    if(c.type==='symmetric'){
      const A=entById(sk,c.a),B=entById(sk,c.b),M=entById(sk,c.mid);
      if(A&&B&&M&&A.t==='line'&&B.t==='line'&&M.t==='line'){
        const P0=sk.points,A1=P0[A.p1],A2=P0[A.p2],B1=P0[B.p1],B2=P0[B.p2],M1=P0[M.p1],M2=P0[M.p2];
        if(A1&&A2&&B1&&B2&&M1&&M2){
          const mx=M2.x-M1.x,my=M2.y-M1.y,ml=Math.hypot(mx,my)||1e-9,ux=mx/ml,uy=my/ml;
          const mp=(Px,Py)=>{const wx=Px-M1.x,wy=Py-M1.y,pr=wx*ux+wy*uy;return{x:M1.x+ux*pr,y:M1.y+uy*pr};}
          const ra1=(()=>{const p=mp(A1.x,A1.y);return{x:2*p.x-A1.x,y:2*p.y-A1.y};})();
          const ra2=(()=>{const p=mp(A2.x,A2.y);return{x:2*p.x-A2.x,y:2*p.y-A2.y};})();
          const bx=B2.x-B1.x,by=B2.y-B1.y,bl=Math.hypot(bx,by)||1e-9,nx=-by/bl,ny=bx/bl;
          const d=c.inf?Math.max(Math.abs((ra1.x-B1.x)*nx+(ra1.y-B1.y)*ny),Math.abs((ra2.x-B1.x)*nx+(ra2.y-B1.y)*ny))
            :Math.min(Math.hypot(ra1.x-B1.x,ra1.y-B1.y)+Math.hypot(ra2.x-B2.x,ra2.y-B2.y),
                           Math.hypot(ra1.x-B2.x,ra1.y-B2.y)+Math.hypot(ra2.x-B1.x,ra2.y-B1.y));
          push(c.id,'symétrie',d);
        }
      }
    }
    if(c.type==='tangent2'){const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B){const CA=P[A.pc],CB=P[B.pc];
        if(CA&&CB)push(c.id,'tangence',Math.abs(Math.hypot(CB.x-CA.x,CB.y-CA.y)-(A.r+B.r)));}}
    if(c.type==='coaxial'){const A=entById(sk,c.a),B=entById(sk,c.b);
      if(A&&B&&(A.t==='circle'||A.t==='arc')&&(B.t==='circle'||B.t==='arc')){const CA=P[A.pc],CB=P[B.pc];
        if(CA&&CB)push(c.id,'coaxiaux',Math.hypot(CB.x-CA.x,CB.y-CA.y));}}
    if(c.type==='coincident'){const A=P[c.a],B=P[c.b];
      if(A&&B)push(c.id,'coïncident',Math.hypot(B.x-A.x,B.y-A.y));}
    if(c.type==='offset'){const v1=skOffsetVal(sk,c.a,c.b,c.sa),v2=skOffsetVal(sk,c.c,c.d,c.sb);
      if(v1!=null&&v2!=null)push(c.id,'décalage égal',Math.abs(v2-v1));}
    if(c.type==='oncircle'){const Pt=P[c.p],E=entById(sk,c.ent);
      if(Pt&&E&&(E.t==='circle'||E.t==='arc')){const CC=P[E.pc];
        if(CC)push(c.id,'point sur '+({circle:'cercle',arc:'arc'}[E.t]),Math.abs(Math.hypot(Pt.x-CC.x,Pt.y-CC.y)-E.r));}}
    if(c.type==='online'){const Pt=P[c.p],l=entById(sk,c.line);
      if(Pt&&l&&l.t==='line'){const A=P[l.p1],B=P[l.p2];
        if(A&&B){const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);
          if(L>1e-9)push(c.id,'point sur ligne',Math.abs((Pt.x-A.x)*(-dy/L)+(Pt.y-A.y)*(dx/L)));}}}
    if(c.type==='midpoint'){
      if(c.p!=null){const Pt=P[c.p],l=entById(sk,c.line);
        if(Pt&&l&&l.t==='line'){const A=P[l.p1],B=P[l.p2];
          if(A&&B)push(c.id,'milieu',Math.hypot(Pt.x-(A.x+B.x)/2,Pt.y-(A.y+B.y)/2));}}
      else if(c.a&&c.b){const A=entById(sk,c.a),B=entById(sk,c.b);
        if(A&&B&&A.t==='line'&&B.t==='line'){const A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
          if(A1&&A2&&B1&&B2)push(c.id,'milieux égaux',Math.hypot((A1.x+A2.x)/2-(B1.x+B2.x)/2,(A1.y+A2.y)/2-(B1.y+B2.y)/2));}}
    }
  });
  let res=0;out.forEach(o=>{if(o.viol>res)res=o.viol;});
  // score de CHOIX entre solutions : une violation géométrique pèse SK_GEO_W fois une cote
  const dimIds=new Set((sk.dims||[]).map(d=>d.id));let score=0;
  out.forEach(o=>{const v=o.viol*(dimIds.has(o.id)?1:SK_GEO_W);if(v>score)score=v;});
  out.sort((a,b)=>b.viol-a.viol);
  return{residual:res,score:score,all:out};
}
/* 2026-10-16-001 : DEGRÉS DE LIBERTÉ RÉELS par analyse de rang du jacobien des
   contraintes + cotes pilotantes (variables : x,y des points non fixés, rayons libres).
   Une variable est DÉTERMINÉE si elle n'apparaît dans aucun vecteur du noyau. Mis en
   cache par état de l'esquisse. Sert aux couleurs (vert / blanc), au statut et au
   repérage des cotes qui sur-contraignent. */
function skJacobian(sk,skipDim){
  const fix=skFixed(sk);
  const B=sklsBuild(sk,fix);B.r0={};
  // TOUS les rayons sont des inconnues ici (sklsBuild écarte ceux qu'une cote verrouille :
  // la cote de rayon d'un congé paraissait alors « redondante » → passée en référence à tort).
  // Exception : un cercle / arc FIXÉ (« Fixe » sur l'entité : projections, intersections) a un
  // rayon CONSTANT pour le solveur — en faire une inconnue sans équation laissait 1 DDL
  // fantôme : l'arc et tout ce qui s'y appuie (point sur cercle, tangence) restaient bleus
  // alors que l'esquisse était entièrement contrainte (Cavité Test, Esquisse 3).
  const rFixed=e=>(sk.constraints||[]).some(c=>c.type==='fix'&&c.ent===e.id);
  (sk.entities||[]).forEach(e=>{if((e.t==='circle'||e.t==='arc')&&B.rad.indexOf(e.id)<0&&!rFixed(e))B.rad.push(e.id);});
  B.n=2*B.pts.length+B.rad.length;
  const n=B.n;if(!n)return{B,J:[],m:0,n:0};
  const x=new Float64Array(n);
  B.pts.forEach((pid,i)=>{const p=sk.points[pid];x[2*i]=p.x;x[2*i+1]=p.y;});
  B.rad.forEach((eid,j)=>{const e=entById(sk,eid);x[2*B.pts.length+j]=e?e.r:1;});
  const dims0=sk.dims;
  if(skipDim)sk.dims=(sk.dims||[]).filter(d=>d!==skipDim);
  const f0=[],fp=[],fm=[];
  skForRank=true;
  skRankDegen=new Set((sk.entities||[]).filter(e=>{if(e.t!=='line')return false;const A=sk.points[e.p1],Bp=sk.points[e.p2];return A&&Bp&&Math.hypot(Bp.x-A.x,Bp.y-A.y)<1e-6;}).map(e=>e.id));
  try{
    sklsApply(sk,B,x);sklsCollect(sk,f0,B);
    const m=f0.length,J=[];for(let r=0;r<m;r++)J.push(new Float64Array(n));
    for(let j=0;j<n;j++){
      const xj=x[j],h=1e-6*Math.max(1,Math.abs(xj));
      x[j]=xj+h;sklsApply(sk,B,x);sklsCollect(sk,fp,B);
      x[j]=xj-h;sklsApply(sk,B,x);sklsCollect(sk,fm,B);
      x[j]=xj;
      if(fp.length===m&&fm.length===m)for(let r=0;r<m;r++)J[r][j]=(fp[r]-fm[r])/(2*h);
    }
    sklsApply(sk,B,x);
    return{B,J,m,n};
  }finally{sk.dims=dims0;skForRank=false;skRankDegen=null;}
}
function skRref(J,m,n){
  // Échelonnement réduit (pivot partiel) : rang + colonnes pivots + matrice réduite.
  // lignes normalisées (cote d'angle en rad ≈ 1/L, contraintes pondérées ×SK_GEO_W : le rang
  // ne doit pas dépendre de l'échelle) ; une ligne quasi nulle (bruit) est mise à zéro.
  const nr=J.map(r=>{let q=0;for(let k=0;k<r.length;k++)q+=r[k]*r[k];return Math.sqrt(q);});
  const nMax=Math.max(0,...nr);
  const A=J.map((r,i)=>{const v=Float64Array.from(r);const q=nr[i];for(let k=0;k<v.length;k++)v[k]=q>nMax*1e-6?v[k]/q:0;return v;});
  let scale=0;for(let r=0;r<m;r++)for(let c=0;c<n;c++)if(Math.abs(A[r][c])>scale)scale=Math.abs(A[r][c]);
  const tol=Math.max(1e-9,scale*1e-7);
  const piv=[];let row=0;
  for(let c=0;c<n&&row<m;c++){
    let best=row,bv=Math.abs(A[row][c]);
    for(let r=row+1;r<m;r++){const v=Math.abs(A[r][c]);if(v>bv){bv=v;best=r;}}
    if(bv<=tol)continue;
    const tmp=A[row];A[row]=A[best];A[best]=tmp;
    const pv=A[row][c];for(let k=c;k<n;k++)A[row][k]/=pv;
    for(let r=0;r<m;r++){if(r===row)continue;const f=A[r][c];if(Math.abs(f)<1e-15)continue;for(let k=c;k<n;k++)A[r][k]-=f*A[row][k];}
    piv.push(c);row++;
  }
  return{rank:piv.length,piv,A};
}
let skDofCache={key:null,info:null};
function skDofKey(sk){
  let s='';const P=sk.points||{};
  for(const k in P)s+=k+':'+P[k].x.toFixed(5)+','+P[k].y.toFixed(5)+';';
  (sk.entities||[]).forEach(e=>{s+=e.id+e.t+(e.r!=null?(+e.r).toFixed(5):'')+'|';});
  s+=JSON.stringify(sk.constraints||[])+JSON.stringify((sk.dims||[]).map(d=>[d.id,d.type,d.ref?1:0,d.line,d.a,d.b,d.p,d.ent]));
  return s;
}
function skDofInfo(sk){
  const key=sk.id+'#'+skDofKey(sk);
  if(skDofCache.key===key&&skDofCache.info)return skDofCache.info;
  let info;
  try{
    const{B,J,m,n}=skJacobian(sk,null);
    const det=new Set();
    let rank=0;
    if(n){
      const R=skRref(J,m,n);rank=R.rank;
      const pivSet=new Set(R.piv),free=[];for(let c=0;c<n;c++)if(!pivSet.has(c))free.push(c);
      R.piv.forEach((c,k)=>{let ok=true;for(const fc of free){if(Math.abs(R.A[k][fc])>1e-6){ok=false;break;}}if(ok)det.add(c);});
    }
    const ptVars={};B.pts.forEach((pid,i)=>{ptVars[pid]=[2*i,2*i+1];});
    const radVar={};B.rad.forEach((eid,j)=>{radVar[eid]=2*B.pts.length+j;});
    const ptFull=pid=>{const v=ptVars[pid];if(!v)return true;return det.has(v[0])&&det.has(v[1]);};
    const entFull=e=>{
      const pids=[e.p1,e.p2,e.p,e.pc,e.pa,e.pb].filter(Boolean);
      if(!pids.every(ptFull))return false;
      if((e.t==='circle'||e.t==='arc')&&radVar[e.id]!=null&&!det.has(radVar[e.id]))return false;
      return true;
    };
    info={dof:n-rank,rank,n,ptFull,entFull};
  }catch(e){info={dof:skDof(sk),rank:0,n:0,ptFull:()=>false,entFull:()=>false};}
  skDofCache={key,info};
  return info;
}
// V0.11.13 : signature (type, entités, orientation) de la cote au dernier contrôle — jamais
// enregistrée. Une cote en pose change de nature (longueur → point↔ligne, entraxe, angle ;
// alignée → H / V) : le contrôle fait à la création ne vaut plus. Avant, la 1re cote prise sur
// une arête projetée restait grise après le clic sur le coin, et une distance H qui doublait
// une largeur déjà cotée restait pilotante (esquisse sur-contrainte sans le dire).
const SK_DIM_SIG=new WeakMap();
function skDimSig(d){return [d.type,d.line,d.a,d.b,d.p,d.ent,d.orient||''].join('|');}
function skCheckNewDims(sk){
  // 2026-10-16-001 : une cote NOUVELLE qui n'ajoute aucun rang (redondante ou en
  // conflit) devient une cote de RÉFÉRENCE : grise, entre parenthèses, mesurée.
  // Cote vers un AXE de rotation : affichée et saisie en Ø (le solveur garde la distance).
  (sk.dims||[]).forEach(d=>{
    const sg=skDimSig(d),was=SK_DIM_SIG.get(d);
    if(d.chk&&(was===undefined||was===sg))return;
    d.chk=1;SK_DIM_SIG.set(d,sg);
    const axisLine=id=>{const e=entById(sk,id);return !!(e&&e.axis);};
    if(!d.dia&&((d.type==='distline'&&axisLine(d.line))||(d.type==='gap'&&(axisLine(d.a)||axisLine(d.b)))))d.dia=true;
    const wasRef=!!d.ref;
    if(d.ref){if(was===undefined||d.refV!==2)return;delete d.ref;delete d.refV;} // cote changée : référence automatique réévaluée
    try{
      const a=skJacobian(sk,d),b=skJacobian(sk,null);
      const ra=a.n?skRref(a.J,a.m,a.n).rank:0,rb=b.n?skRref(b.J,b.m,b.n).rank:0;
      if(rb<=ra){d.ref=true;d.refV=2;
        // V0.11.23 : la barre d'état NOMME ce qui détermine déjà la cote (SolidCraft : « already determined by … »)
        let by=[];try{by=skDimDeterminedBy(sk,d,3);}catch(e){}
        try{skStatus('Cote en sur-contrainte → cote de RÉFÉRENCE (grise, entre parenthèses) : elle mesure sans piloter'+(by.length?' — déjà déterminée par '+by.join(' · '):'')+'.');}catch(e){}}
      else if(wasRef){try{skStatus('Cote PILOTANTE — cliquez (vide) pour poser.');}catch(e){}}
    }catch(e){if(wasRef){d.ref=true;d.refV=2;}}
  });
}
function skDimDeterminedBy(sk,d,max){
  // V0.11.23 : quelles cotes / contraintes déterminent déjà la cote d (redondante) ? Chacune est
  // retirée à son tour : si la cote ajouterait alors du rang, c'est elle qui la rend redondante.
  // Borné à `max` réponses et ~250 ms (deux analyses de rang par candidat).
  const out=[],t0=Date.now(),lim=max||3;
  const late=()=>Date.now()-t0>250;
  for(const x of (sk.dims||[])){
    if(x===d||x.ref||out.length>=lim||late())continue;
    x.ref=true;let ok=false;try{ok=skDimCanDrive(sk,d);}finally{delete x.ref;}
    if(ok)out.push(dimDesc(sk,x));
  }
  const cons=sk.constraints||[];
  for(const c of cons){
    if(out.length>=lim||late())break;
    sk.constraints=cons.filter(k=>k!==c);let ok=false;try{ok=skDimCanDrive(sk,d);}finally{sk.constraints=cons;}
    if(ok)out.push(conDesc(sk,c));
  }
  return out;
}
function skDimCanDrive(sk,d){
  // vrai si la cote d (de référence) ajouterait du RANG en devenant pilotante
  const was=d.ref;
  try{
    d.ref=false;
    const a=skJacobian(sk,d),b=skJacobian(sk,null);
    const ra=a.n?skRref(a.J,a.m,a.n).rank:0,rb=b.n?skRref(b.J,b.m,b.n).rank:0;
    return rb>ra;
  }catch(e){return false;}finally{d.ref=was;}
}
function skDimMeasure(sk,d){
  // Valeur MESURÉE d'une cote (référence) — même unité que d.value.
  const P=sk.points||{};
  try{
    if(d.type==='length'||d.type==='distance')return dimCurValue(sk,d);
    if(d.type==='diameter'||d.type==='radius'){const e=entById(sk,d.ent);return e?(d.type==='diameter'?2*e.r:e.r):null;}
    if(d.type==='angle'){const fr=angleFrame(sk,d);return fr?Math.abs(fr.delta):null;}
    if(d.type==='gap'||d.type==='distline'){const sg=skDimSignedOf(sk,d);return sg==null?null:Math.abs(sg);}
  }catch(e){}
  return null;
}
function skDof(sk){
  const P=sk.points||{};
  const nR=(sk.entities||[]).filter(e=>e.t==='circle'||e.t==='arc').length;
  const nO=P[SK_ORIGIN]?2:0; // l'origine est toujours fixe (2 DOF en moins)
  let eq=0;
  (sk.constraints||[]).forEach(c=>{eq+=skConDof(c);}); // registre SK_CON (49)
  eq+=(sk.dims||[]).length;
  return 2*Object.keys(P).length+nR-eq-nO;
}
function pidNear(sk,x,y,maxD){let best=null,bd=maxD;Object.keys(skPts(sk)).forEach(pid=>{const p=sk.points[pid];const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=pid;}});return best;}
function skHealth(sk){
  const tr=skLoopTrace(sk),P=sk.points||{};
  const ends=tr.opens;
  let gapPair=null,gapD=1e9;
  for(let i=0;i<ends.length;i++)for(let j=i+1;j<ends.length;j++){
    const d=Math.hypot(ends[i].x-ends[j].x,ends[i].y-ends[j].y);
    if(d<gapD){gapD=d;gapPair=[ends[i],ends[j]];}
  }
  const pids=Object.keys(P),dupes=[];
  const coinc=new Set(); // points volontairement coïncidents (contrainte) → pas doublon
  (sk.constraints||[]).forEach(c=>{if(c.type==='coincident'){if(c.a)coinc.add(c.a);if(c.b)coinc.add(c.b);}});
  for(let i=0;i<pids.length;i++)for(let j=i+1;j<pids.length;j++){
    if(pids[i]===SK_ORIGIN||pids[j]===SK_ORIGIN)continue; // l'origine n'est jamais un « doublon »
    if(coinc.has(pids[i])&&coinc.has(pids[j]))continue;
    const A=P[pids[i]],B=P[pids[j]];
    if(Math.hypot(A.x-B.x,A.y-B.y)<1e-3)dupes.push([pids[i],pids[j]]);
  }
  const degen=[];
  (sk.entities||[]).forEach(e=>{
    if(e.construction||e.ref)return; // hors profil : pas d'alerte
    if(e.t==='line'){const A=P[e.p1],B=P[e.p2];if(A&&B&&Math.hypot(B.x-A.x,B.y-A.y)<1e-6)degen.push(e.id);}
    if((e.t==='circle'||e.t==='arc')&&!(e.r>1e-6))degen.push(e.id);
  });
  const segs=(sk.entities||[]).filter(e=>e.t==='line'&&!e.construction&&!e.ref&&P[e.p1]&&P[e.p2]).map(e=>({id:e.id,A:P[e.p1],B:P[e.p2]}));
  const selfints=[];
  for(let i=0;i<segs.length;i++)for(let j=i+1;j<segs.length;j++){
    const s1=segs[i],s2=segs[j];
    if(s1.A===s2.A||s1.A===s2.B||s1.B===s2.A||s1.B===s2.B)continue; // jonction structurelle normale
    const h=interLineLine(s1.A,s1.B,s2.A,s2.B);
    if(h&&h.t>1e-6&&h.t<1-1e-6&&h.u>1e-6&&h.u<1-1e-6)selfints.push({x:h.x,y:h.y});
  }
  let nH=0;tr.solids.forEach(s=>nH+=(s.holes||[]).length);nH+=tr.circleHoles.length;
  return{loops:tr.solids.length+tr.circlesOut.length,holes:nH,opens:ends,gapPair,gapD,dupes,degen,selfints};
}
function skCloseGap(){
  if(!skEdit)return;const H=skEdit._health;
  if(!H||!H.gapPair){skStatus('Rien à refermer.');return;}
  const[a,b]=H.gapPair;
  const pa=pidNear(skEdit,a.x,a.y,50),pb=pidNear(skEdit,b.x,b.y,50);
  if(!pa||!pb||pa===pb){skStatus('Refermer : points introuvables.');return;}
  skPushUndo();mergePoints(skEdit,pb,pa);afterEdit();skStatus('Bouts refermés ⌖.');
}
function skToggleAxis(id){
  // 9. Ligne ↔ axe de rotation : hors profil (construction), trait mixte ; les cotes
  // prises depuis l'axe (entraxe, point ↔ ligne) sont en Ø ; la révolution le prend
  // comme axe par défaut.
  if(!skEdit)return;const e=entById(skEdit,id);if(!e||e.t!=='line')return;
  skPushUndo();
  if(e.axis){delete e.axis;}else{e.axis=true;e.construction=true;}
  (skEdit.dims||[]).forEach(d=>{
    const on=(d.type==='distline'&&d.line===id)||(d.type==='gap'&&(d.a===id||d.b===id));
    if(on){if(e.axis)d.dia=true;else delete d.dia;}
  });
  afterEdit();
  skStatus(e.axis?'Axe de rotation ⟲ — les cotes depuis cet axe sont en Ø.':'Ligne normale (axe retiré).');
}
function afterEdit(){if(!skEdit)return;try{skCheckNewDims(skEdit);}catch(e){}solveSketch(skEdit);cleanupSk(skEdit);skRefreshHealth();drawSketch2D();renderSkPanel();}
function skClearAll(){if(!skEdit||!confirm('Tout effacer ?'))return;skPushUndo();skEdit.entities=[];skEdit.points={};skEdit.constraints=[];skEdit.dims=[];ensureOrigin(skEdit);skSel=null;skSelX=[];skChain=null;drawSketch2D();renderSkPanel();}
let skDimLine=null, skDimRef=null; // 1re ligne armée (Ctrl/Cmd+clic) pour cote paire angle/entraxe (sketch ou 3D ref)
function lineAngle(sk,A,B){
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1||!B2)return 0;
  const sA=Math.atan2(A2.y-A1.y,A2.x-A1.x),sB=Math.atan2(B2.y-B1.y,B2.x-B1.x);
  const x=((sB-sA)%Math.PI+Math.PI)%Math.PI;
  return Math.min(x,Math.PI-x); // angle entre lignes non orientées ∈ [0,π/2] — indépendant de l'ordre
}
function angleFrame(sk,d){
  // Secteur : V = sommet partagé (stable) ou pseudo-sommet ; sA/sB = rayons V→extrémités
  // lointaines (toujours du bon côté, indépendant de l'ordre p1/p2) ; delta ∈ (-π,π].
  const A=entById(sk,d.a),B=entById(sk,d.b);
  if(!A||!B||A.t!=='line'||B.t!=='line')return null;
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1||!B2)return null;
  const V=angleVertex(sk,d);if(!V)return null;
  const fA=(Math.hypot(A1.x-V.x,A1.y-V.y)>Math.hypot(A2.x-V.x,A2.y-V.y))?A1:A2;
  const fB=(Math.hypot(B1.x-V.x,B1.y-V.y)>Math.hypot(B2.x-V.x,B2.y-V.y))?B1:B2;
  const sA=Math.atan2(fA.y-V.y,fA.x-V.x),sB=Math.atan2(fB.y-V.y,fB.x-V.x);
  const TAU=Math.PI*2;
  let delta=(sB-sA)%TAU;if(delta<=-Math.PI)delta+=TAU;else if(delta>Math.PI)delta-=TAU;
  // rA/rB : longueurs des rayons du secteur — échelle (mm) du résidu d'angle
  return{V,sA,sB,delta,rA:Math.hypot(fA.x-V.x,fA.y-V.y),rB:Math.hypot(fB.x-V.x,fB.y-V.y)};
}
// échelle (mm) d'un écart d'angle : au bout du PLUS LONG rayon, là où il se voit (au plus court, un
// côté écrasé ramenait l'écart en radians et un angle faux de 2,6° passait sous le seuil d'alerte)
function skAngScale(fr){return Math.max(1,fr.rA||0,fr.rB||0);}
function createAngleDim(sk,A,B){ // cote d'angle depuis le secteur RÉEL |delta|∈(0,π) — jamais l'angle aigu lineAngle (=renversement)
  if(!sk||!A||!B||A.t!=='line'||B.t!=='line')return null;
  const fr=angleFrame(sk,{a:A.id,b:B.id});
  const ad=fr?Math.abs(fr.delta):0;
  if(!fr||ad<0.03||Math.PI-ad<0.03)return null; // trop proche de 0°/180° : non cotable
  const dup=findDupDim(sk,{type:'angle',a:A.id,b:B.id});
  if(dup)return dup.id;
  skPushUndo();
  const id=skNewEid(sk);
  sk.dims.push({id,type:'angle',a:A.id,b:B.id,value:+ad.toFixed(4),ccw:fr.delta>0?1:0,ox:0,oy:0});
  return id;
}
function lineGap(sk,A,B){
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1)return 0;
  const dx=A2.x-A1.x,dy=A2.y-A1.y,L=Math.hypot(dx,dy)||1e-9;
  // Distance perpendiculaire moyenne : identique de part et d'autre pour deux droites
  // exactement parallèles, et bien plus juste que le seul point B1 quand elles ne le sont
  // qu'approximativement (esquisse sous-contrainte).
  if(!B2)return Math.abs((B1.x-A1.x)*(-dy/L)+(B1.y-A1.y)*(dx/L));
  const d1=Math.abs((B1.x-A1.x)*(-dy/L)+(B1.y-A1.y)*(dx/L));
  const d2=Math.abs((B2.x-A1.x)*(-dy/L)+(B2.y-A1.y)*(dx/L));
  return (d1+d2)/2;
}
// Angle entre les DEUX DROITES, en radians ∈ [0, π/2] — calculé sur les VECTEURS DE
// DIRECTION, donc exact, indépendant de l'ordre des extrémités et surtout indépendant de
// l'existence d'un sommet commun.
// POURQUOI : le test « parallèles ? » se faisait sur angleFrame(), qui part d'un SOMMET.
// Or deux lignes parallèles distinctes (côté d'une rainure, deux lignes de construction
// distantes) n'ont AUCUN sommet commun : angleVertex() renvoie alors un pseudo-sommet
// (milieu du segment joignant les milieux des deux lignes) et l'angle mesuré est alors
// ARBITRAIRE. Constaté sur le fichier réel de l'utilisateur (Esquisse 5) : deux lignes
// horizontales avec une contrainte « parallel » entre elles, écartées de 3.037 mm, étaient
// classées « angle » à 175,74° — parce que |π − 175.74°| = 4.26° dépassait la tolérance de
// 1.7°. Le même coup par chance marchait pour deux lignes verticales (179.81° ≤ 1.7° de
// π). Le comportement dépendait donc de l'orientation, pas de la géométrie.
function skLinesAngle(sk,A,B){
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  if(!A1||!A2||!B1||!B2)return null;
  const ax=A2.x-A1.x,ay=A2.y-A1.y,bx=B2.x-B1.x,by=B2.y-B1.y;
  const la=Math.hypot(ax,ay),lb=Math.hypot(bx,by);
  if(la<1e-9||lb<1e-9)return null;               // ligne dégénérée
  return Math.atan2(Math.abs(ax*by-ay*bx)/(la*lb),Math.abs(ax*bx+ay*by)/(la*lb));
}
// Partagent-elles un sommet commun (donc un angle réellement interprétable) ?
function skShareVertex(sk,A,B){
  return !!(A&&B&&(A.p1===B.p1||A.p1===B.p2||A.p2===B.p1||A.p2===B.p2));
}
// Angle à afficher pour une cote d'angle : sommet commun → secteur réel (angleFrame) ;
// lignes disjointes → angle entre les directions, seul sens défini (le pseudo-sommet
// d'angleFrame donnerait un nombre arbitraire).
function skAngleForDim(sk,A,B){
  // sommet commun OU intersection des droites : le secteur réel d'angleFrame, celui que le
  // solveur pilote et que l'arc dessine (2026-10-23 : aussi pour les lignes disjointes)
  {const fr=angleFrame(sk,{a:A.id,b:B.id});
    if(fr)return Math.abs(fr.delta);
  }
  const v=skLinesAngle(sk,A,B);
  if(v===null)return 0;
  if(skShareVertex(sk,A,B))return v;
  // disjointes : le sens est celui des extrémités p1→p2 (le seul dessinable)
  const P=sk.points,A1=P[A.p1],A2=P[A.p2],B1=P[B.p1],B2=P[B.p2];
  const ax=A2.x-A1.x,ay=A2.y-A1.y,bx=B2.x-B1.x,by=B2.y-B1.y;
  const cr=ax*by-ay*bx,dt=ax*bx+ay*by;
  return Math.abs(Math.atan2(cr,dt));            // |δ| ∈ [0, π]
}
// Tolérance de parallélisme : 3°. Un angle entre deux droites inférieur à 3° est un cas
// dégénéré, alors que des lignes « parallel » sous-contraintes peuvent traîner à 1-2°.
// Au-dessus, on bascule en entraxe — le sens le plus utile, et jamais un angle de 0,05°.
const SK_PARALLEL_TOL=3*Math.PI/180;
function tryExtendDim(dd,ent,pid){ // pose type Fusion : pendant qu'une cote vit, cliquer une 2ᵉ entité la convertit
  const sk=skEdit;if(!sk||!dd)return false;
  const toDistLine=(ptId,lineId)=>{
    const Pt=sk.points[ptId],l=entById(sk,lineId);
    if(!Pt||!l||l.t!=='line')return false;
    const A=sk.points[l.p1],B=sk.points[l.p2];if(!A||!B)return false;
    const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1e-9;
    const v=Math.abs((Pt.x-A.x)*(-dy/L)+(Pt.y-A.y)*(dx/L));
    skPushUndo();
    dd.type='distline';dd.p=ptId;dd.line=lineId;delete dd.ent;delete dd.w;delete dd.sl;
    dd.value=+Math.max(v,0.01).toFixed(2);
    afterEdit();skStatus('Converti en ⟂ centre↔ligne = '+dd.value.toFixed(2)+' — cliquez (vide) pour poser.');
    return true;
  };
  if(dd.type==='length'){
    const src=entById(sk,dd.line);if(!src)return false;
    // un point (hors extrémités de la ligne cotée) passe avant la ligne qui le porte
    if(pid&&pid!==src.p1&&pid!==src.p2)return toDistLine(pid,dd.line);
    if(ent&&ent.t==='line'&&ent.id!==dd.line){ // 2ᵉ ligne → entraxe (//) ou angle (sécantes)
      skPushUndo();
      // Parallélisme décidé sur les VECTEURS DE DIRECTION (skLinesAngle), pas sur un
      // sommet : voir le commentaire de skLinesAngle — avec le sommet, deux lignes
      // parallèles sans sommet commun étaient classées « angle » (Esquisse 5 : 175.74°
      // au lieu d'un entraxe de 3.037 mm).
      const va=skLinesAngle(sk,src,ent);
      const par=(va!==null&&skParallelPair(sk,src,ent));
      if(par){
        dd.type='gap';dd.a=src.id;dd.b=ent.id;delete dd.line;delete dd.w;
        dd.value=+lineGap(sk,src,ent).toFixed(2);
        afterEdit();skStatus('Converti en entraxe ⇔ '+dd.value.toFixed(2)+' (lignes '+
          (va*180/Math.PI).toFixed(2)+'° d\'écart) — cliquez pour poser.');
      }else{
        const ad=skAngleForDim(sk,src,ent);
        dd.type='angle';dd.a=src.id;dd.b=ent.id;delete dd.line;delete dd.w;
        dd.value=+ad.toFixed(4);
        dd.ccw=skShareVertex(sk,src,ent)?(angleFrame(sk,{a:src.id,b:ent.id})||{delta:0}).delta>0?1:0:0;
        afterEdit();skStatus('Converti en angle ∠'+(ad*180/Math.PI).toFixed(1)+'° — déplacez (rayon) puis cliquez.');
      }
      return true;
    }
    if(ent&&(ent.t==='circle'||ent.t==='arc')&&ent.pc)return toDistLine(ent.pc,dd.line); // cercle → centre↔ligne
    if(pid&&!(ent&&ent.id===dd.line))return toDistLine(pid,dd.line); // point/cpoint → centre↔ligne
    return false;
  }
  if(dd.type==='diameter'||dd.type==='radius'){
    const src=entById(sk,dd.ent);if(!src||!src.pc)return false;
    // un point (extrémité de ligne, origine…) passe avant la ligne : distance centre ↔ point
    if(pid&&pid!==src.pc&&pid!==src.pa&&pid!==src.pb&&!(ent&&(ent.t==='circle'||ent.t==='arc')&&ent.pc===pid)){
      const A=sk.points[src.pc],B=sk.points[pid];
      if(A&&B){skPushUndo();
        dd.type='distance';dd.a=src.pc;dd.b=pid;delete dd.ent;delete dd.w;delete dd.sl;
        dd.value=+Math.hypot(B.x-A.x,B.y-A.y).toFixed(2);
        afterEdit();skStatus('Converti en distance centres ⟷ '+dd.value.toFixed(2)+' — cliquez pour poser.');
        return true;}
    }
    if(ent&&(ent.t==='circle'||ent.t==='arc')&&ent.id!==dd.ent&&ent.pc){ // 2ᵉ cercle → entraxe centres
      const A=sk.points[src.pc],B=sk.points[ent.pc];if(!A||!B)return false;
      skPushUndo();
      dd.type='distance';dd.a=src.pc;dd.b=ent.pc;delete dd.ent;delete dd.w;delete dd.sl;
      dd.value=+Math.hypot(B.x-A.x,B.y-A.y).toFixed(2);
      afterEdit();skStatus('Converti en entraxe centres ⟷ '+dd.value.toFixed(2)+' — cliquez pour poser.');
      return true;
    }
    if(ent&&ent.t==='line')return toDistLine(src.pc,ent.id); // ligne → centre du cercle ↔ ligne
    if(pid&&!(ent&&(ent.id===dd.ent||ent.pc===src.pc))){ // point (dont origine) → distance centres
      const A=sk.points[src.pc],B=sk.points[pid];
      if(A&&B){skPushUndo();
        dd.type='distance';dd.a=src.pc;dd.b=pid;delete dd.ent;delete dd.w;delete dd.sl;
        dd.value=+Math.hypot(B.x-A.x,B.y-A.y).toFixed(2);
        afterEdit();skStatus('Converti en distance centres ⟷ '+dd.value.toFixed(2)+' — cliquez pour poser.');
        return true;}
    }
    return false;
  }
  return false; // distline/gap/angle/distance : déjà combinée → le clic suivant pose
}
function samePair(x,y,a,b){return(x===a&&y===b)||(x===b&&y===a);}
function findDupDim(sk,spec){
  // true doublon (même type, mêmes refs, ordre indifférent) ou null. Jamais de cote en double.
  return (sk.dims||[]).find(d=>{
    if(!d||d.type!==spec.type)return false;
    if(spec.type==='length')return d.line===spec.line;
    if(spec.type==='diameter'||spec.type==='radius')return d.ent===spec.ent;
    if(spec.type==='distance')return samePair(d.a,d.b,spec.a,spec.b);
    if(spec.type==='distline')return d.line===spec.line&&d.p===spec.p;
    if(spec.type==='gap'||spec.type==='angle')return samePair(d.a,d.b,spec.a,spec.b);
    return false;
  })||null;
}
function reuseDim(dup){
  if(!skEdit||!dup)return false;
  skSel={kind:'dim',id:dup.id};skSelX=[];
  skStatus('Cote déjà existante — sélectionnée (pas de doublon).');
  drawSketch2D();renderSkPanel();
  return true;
}
function dimClick(x,y,shift){
  const sk=skEdit;if(!sk)return;
  const ent0=nearestEntity(sk,x,y,SK_PICK);
  const ref0=nearestRef(sk,x,y,SK_PICK);
  const pick0=ent0||ref0;
  if(shift&&pick0){
    const isRef0=!!ref0 && !ent0;
    const id0=isRef0 ? `ref_${ref0.idx}` : ent0.id;
    // si 1re pick déjà armée
    if((skDimLine||skDimRef) && (skDimLine!==id0 && skDimRef!==ref0?.idx)){
      let A,B, aIsRef=false, bIsRef=isRef0;
      if(skDimRef!==null){
        const r=sk._refs[skDimRef];
        const tmpId=createRefLine(sk, r);
        A=entById(sk,tmpId); aIsRef=true;
      } else A=entById(sk,skDimLine);
      if(isRef0){
        const tmpId=createRefLine(sk, ref0.ref);
        B=entById(sk,tmpId); bIsRef=true;
      } else B=ent0;
      if(A&&B){
        // même règle qu'au clic simple : parallélisme sur les DIRECTIONS, angle sur le
        // secteur réel quand les lignes partagent un sommet.
        const va=skLinesAngle(sk,A,B);
        const par=(va!==null&&skParallelPair(sk,A,B));
        let newId=null;
        if(par){
          const dup=findDupDim(sk,{type:'gap',a:A.id,b:B.id});
          if(dup){skDimLine=null;skDimRef=null;reuseDim(dup);return;}
          skPushUndo();
          const g=lineGap(sk,A,B);
          newId=skNewEid(sk);
          sk.dims.push({id:newId,type:'gap',a:A.id,b:B.id,value:+g.toFixed(2),ox:0,oy:0});
          skStatus('Cote entraxe créée'+(aIsRef||bIsRef?' (dont 3D)':'')+' — déplacez puis cliquez pour poser.');
        }else{
          const ad=skAngleForDim(sk,A,B);
          const ccw=(angleFrame(sk,{a:A.id,b:B.id})||{delta:0}).delta>0?1:0; // sens du secteur réel (disjointes comprises)
          const dup=findDupDim(sk,{type:'angle',a:A.id,b:B.id});
          if(dup){skDimLine=null;skDimRef=null;reuseDim(dup);return;}
          skPushUndo();
          newId=skNewEid(sk);
          sk.dims.push({id:newId,type:'angle',a:A.id,b:B.id,value:+ad.toFixed(4),ccw,ox:0,oy:0});
          skStatus('Cote angle créée ∠'+(ad*180/Math.PI).toFixed(1)+'° — déplacez (rayon) puis cliquez pour poser.');
        }
        skDimLine=null; skDimRef=null; skDimPlace={id:newId}; afterEdit();return;
      }
    }
    if(isRef0){ skDimRef=ref0.idx; skDimLine=null; skStatus('Cote paire : 1re ligne 3D sélectionnée (violet) → cliquez la 2ᵉ ligne.'); }
    else { skDimLine=ent0.id; skDimRef=null; skStatus('Cote paire : cliquez la 2ᵉ ligne (angle si sécantes, entraxe si //). Re-clic = longueur.'); }
    drawSketch2D();return;
  }
  if(skPendPt){
    const pid=nearestPoint(sk,x,y,SK_SNAP);
    const ent=nearestEntity(sk,x,y,SK_PICK);
    const other=pid||(ent&&ent.t==='cpoint'?ent.p:null);
    if(other&&other!==skPendPt){
      const A=sk.points[skPendPt],B=sk.points[other];
      if(A&&B){skPushUndo();const newId=skNewEid(sk);
        sk.dims.push({id:newId,type:'distance',a:skPendPt,b:other,value:+Math.hypot(B.x-A.x,B.y-A.y).toFixed(2)});
        skDimPlace={id:newId};skStatus('Cote distance — déplacez puis cliquez pour poser.');}
    }
    skPendPt=null;afterEdit();return;
  }
  const ent=nearestEntity(sk,x,y,SK_PICK);
  // 2026-10-26 : un POINT sous le curseur (extrémité, centre, origine) passe AVANT la ligne
  // qui le porte, comme dans Fusion et l'outil Sélection — sinon cliquer l'extrémité d'une
  // droite cotait toujours la droite et la cote entre 2 points était impossible.
  const pidFirst=nearestPoint(sk,x,y,SK_PT);
  if(pidFirst){skPendPt=pidFirst;skStatus('Cote distance : cliquez un second point.');drawSketch2D();return;}
  if(ent&&ent.t==='line'){skDimLine=null;skDimRef=null;skPushUndo();const newId=skNewEid(sk);
    sk.dims.push({id:newId,type:'length',line:ent.id,value:+lineLen(sk,ent).toFixed(2)});
    skDimPlace={id:newId};skStatus('Cote longueur — déplacez puis cliquez pour poser.');afterEdit();return;}
  if(ent&&ent.t==='circle'){const newId=skNewEid(sk);skPushUndo();
    sk.dims.push({id:newId,type:'diameter',ent:ent.id,value:+(ent.r*2).toFixed(2)});
    skDimPlace={id:newId};skStatus('Cote Ø — cliquez un 2ᵉ cercle (entraxe) ou une ligne (dist. centre), ou posez (vide).');afterEdit();return;}
  if(ent&&ent.t==='arc'){const newId=skNewEid(sk);skPushUndo();
    sk.dims.push({id:newId,type:'radius',ent:ent.id,value:+ent.r.toFixed(2)});
    skDimPlace={id:newId};skStatus('Cote R — cliquez un 2ᵉ cercle (entraxe) ou une ligne (dist. centre), ou posez (vide).');afterEdit();return;}
  const ref=nearestRef(sk,x,y,SK_PICK);
  if(ref){
    skPushUndo();
    const nid=createRefLine(sk, ref.ref);
    skStatus('Référence 3D projetée → ligne de construction créée (fixe). Sélectionnez-la pour coter (Ctrl/Cmd+2 lignes).');
    afterEdit();return;
  }
  const pid=nearestPoint(sk,x,y,SK_SNAP);
  const p0=pid||(ent&&ent.t==='cpoint'?ent.p:null);
  if(p0){skPendPt=p0;skStatus('Cote distance : cliquez un second point.');drawSketch2D();return;}
  skStatus('Cote : ligne=longueur, cercle=Ø, arc=R, 2 points=distance · Ctrl/Cmd+clic 2 lignes = angle/entraxe · étiquettes déplaçables au glisser.');
}
