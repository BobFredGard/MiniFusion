/* ----- auto-tests embarqués : non-régression esquisse rejouée dans l'app ----- */
function runSelfTests(){
  const out=[];let okN=0;
  const T=(name,fn)=>{try{const m=fn();out.push((!m?'✅ ':'❌ ')+name+(m?' — '+m:''));if(!m)okN++;}catch(e){out.push('❌ '+name+' — '+String((e&&e.message)||e));}};
  const rect=()=>({points:{p1:{x:0,y:0},p2:{x:40,y:0},p3:{x:40,y:20},p4:{x:0,y:20}},
    entities:[{id:'a',t:'line',p1:'p1',p2:'p2'},{id:'b',t:'line',p1:'p2',p2:'p3'},{id:'c',t:'line',p1:'p3',p2:'p4'},{id:'d',t:'line',p1:'p4',p2:'p1'}],
    constraints:[],dims:[],seq:50});
  const holeSq=cw=>{const s=rect();
    const q=cw?[[10,5],[30,5],[30,15],[10,15]]:[[10,5],[10,15],[30,15],[30,5]];
    q.forEach((p,i)=>s.points['q'+i]={x:p[0],y:p[1]});
    [[0,1],[1,2],[2,3],[3,0]].forEach((e,i)=>s.entities.push({id:'h'+i,t:'line',p1:'q'+e[0],p2:'q'+e[1]}));
    return s;};
  const holesOf=tr=>tr.solids.reduce((a,s)=>a+s.holes.length,0)+tr.circleHoles.length;
  T('Trace : rect → 1 solide',()=>{const tr=skLoopTrace(rect());return tr.solids.length===1&&!tr.opens.length?null:`solides=${tr.solids.length} opens=${tr.opens.length}`;});
  T('Trou horaire → 1 solide + 1 trou',()=>{const tr=skLoopTrace(holeSq(true));return tr.solids.length===1&&holesOf(tr)===1?null:`solides=${tr.solids.length} trous=${holesOf(tr)}`;});
  T('Trou anti-horaire → idem',()=>{const tr=skLoopTrace(holeSq(false));return tr.solids.length===1&&holesOf(tr)===1?null:`solides=${tr.solids.length} trous=${holesOf(tr)}`;});
  T('Cercle inscrit = trou',()=>{const s=rect();s.points.pc={x:20,y:10};s.entities.push({id:'c',t:'circle',pc:'pc',r:5});const tr=skLoopTrace(s);return tr.circleHoles.length===1?null:`trous=${tr.circleHoles.length}`;});
  T('Ouvert détecté (2 bouts)',()=>{const s=rect();s.entities=s.entities.slice(0,3);const tr=skLoopTrace(s);return tr.solids.length===0&&tr.opens.length===2?null:`solides=${tr.solids.length} opens=${tr.opens.length}`;});
  T('Tangence converge (< 0.05)',()=>{const s={points:{pc:{x:0,y:8},p1:{x:-20,y:0},p2:{x:20,y:0}},entities:[{id:'c',t:'circle',pc:'pc',r:10},{id:'l',t:'line',p1:'p1',p2:'p2'}],constraints:[{id:'k',type:'tangent',line:'l',ent:'c'}],dims:[],seq:50};
    solveSketch(s);const A=s.points.p1,B=s.points.p2,C=s.points.pc,dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);
    const dd=Math.abs(Math.abs((C.x-A.x)*(-dy/L)+(C.y-A.y)*(dx/L))-10);return dd<0.05?null:`écart=${dd.toFixed(3)}`;});
  T('Milieu point↔ligne converge (< 0.05)',()=>{const s={points:{p1:{x:-20,y:0},p2:{x:20,y:0},m:{x:3,y:7}},entities:[{id:'l',t:'line',p1:'p1',p2:'p2'}],constraints:[{id:'k',type:'midpoint',p:'m',line:'l'}],dims:[],seq:50};
    solveSketch(s);const A=s.points.p1,B=s.points.p2,M=s.points.m,d=Math.hypot(M.x-(A.x+B.x)/2,M.y-(A.y+B.y)/2);
    return d<0.05?null:`écart=${d.toFixed(3)}`;});
  T('Milieu 2 lignes converge (< 0.05)',()=>{const s={points:{a1:{x:-20,y:0},a2:{x:20,y:0},b1:{x:0,y:10},b2:{x:10,y:10}},
    entities:[{id:'la',t:'line',p1:'a1',p2:'a2'},{id:'lb',t:'line',p1:'b1',p2:'b2'}],
    constraints:[{id:'k',type:'midpoint',a:'la',b:'lb'}],dims:[],seq:50};
    solveSketch(s);const P=s.points,ma={x:(P.a1.x+P.a2.x)/2,y:(P.a1.y+P.a2.y)/2},mb={x:(P.b1.x+P.b2.x)/2,y:(P.b1.y+P.b2.y)/2};
    const d=Math.hypot(ma.x-mb.x,ma.y-mb.y);return d<0.05?null:`écart=${d.toFixed(3)}`;});
  T('Congé périmètre : bords du prisme retenus (haut/bas)',()=>{
    const n={x:0,y:0,z:1},o={x:0,y:0,z:0};
    const mk=(src,a,b)=>({src,pts:[a,b],mid:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]});
    const edges=[mk(0,[0,40,10],[60,40,10]),mk(1,[0,40,0],[60,40,0]),mk(2,[0,40,0],[0,40,10]),mk(3,[0,40,5],[0,-40,5])];
    const jobs=rimEdgeJobs(edges,o,n,10,3,2);
    if(jobs.length!==2)return 'attendu 2, obtenu '+jobs.length;
    if(jobs[0].src!==0||jobs[0].r!==3)return 'haut raté';
    if(jobs[1].src!==1||jobs[1].r!==2)return 'bas raté';
    return null;});
  T('Trim raccourcit la ligne',()=>{const s={points:{pc:{x:0,y:0},p1:{x:-20,y:5},p2:{x:20,y:5}},entities:[{id:'c',t:'circle',pc:'pc',r:10},{id:'l',t:'line',p1:'p1',p2:'p2'}],constraints:[],dims:[],seq:50};
    const m=trimEntity(s,s.entities[1],15,5),B=s.points[s.entities[1].p2];
    return /ajustée|retiré|scindé/.test(m)&&B.x<15?null:m;});
  T('Congé R5 ×4 coins',()=>{const r=applyFilletsToSketch(rect(),[{corners:[{x:40,y:0},{x:0,y:0},{x:0,y:20},{x:40,y:20}],radius:5}]);
    if(r.applied!==4)return 'applied='+r.applied+' '+r.warnings.join(';');
    const tr=skLoopTrace(r.sk);return tr.solids.length===1?null:`solides=${tr.solids.length}`;});
  T('Persistance : round-trip JSON garde les 14 types de contraintes',()=>{
    const s={points:{p1:{x:0,y:0},p2:{x:40,y:0},p3:{x:40,y:20},p5:{x:50,y:50},p6:{x:60,y:50},p7:{x:70,y:50},pc:{x:20,y:30},pc2:{x:20,y:40},pa:{x:15,y:40},pb:{x:25,y:40}},
      entities:[{id:'a',t:'line',p1:'p1',p2:'p2'},{id:'b',t:'line',p1:'p2',p2:'p3'},{id:'g',t:'line',p1:'p5',p2:'p6'},{id:'h2',t:'line',p1:'p6',p2:'p7'},{id:'e',t:'circle',pc:'pc',r:8},{id:'f',t:'arc',pc:'pc2',pa:'pa',pb:'pb',r:5}],
      constraints:[{id:'k01',type:'h',line:'a'},{id:'k02',type:'v',line:'b'},{id:'k03',type:'parallel',a:'a',b:'h2'},{id:'k04',type:'perpendicular',a:'g',b:'h2'},{id:'k05',type:'equal',a:'a',b:'b'},{id:'k06',type:'fix',p:'p1'},{id:'k07',type:'fix',ent:'e'},{id:'k08',type:'tangent',line:'a',ent:'e'},{id:'k09',type:'tangent',line:'b',ent:'f'},{id:'k10',type:'tangent2',a:'e',b:'f'},{id:'k11',type:'coaxial',a:'e',b:'f'},{id:'k12',type:'symmetric',a:'a',b:'b',mid:'g'},{id:'k13',type:'coincident',a:'p1',b:'p5'},{id:'k14',type:'oncircle',p:'p7',ent:'e'},{id:'k15',type:'online',p:'p5',line:'b'},{id:'k16',type:'midpoint',p:'p5',line:'b'},{id:'k17',type:'midpoint',a:'a',b:'b'}],
      dims:[{id:'d1',type:'length',line:'a',value:40,ox:0,oy:0},{id:'d2',type:'radius',ent:'e',value:8,ox:0,oy:0}],seq:200};
    const n0=s.constraints.length,nD=s.dims.length;
    const back=JSON.parse(JSON.stringify(s));
    migrateSketch(back);cleanupSk(back);
    if(back.constraints.length!==n0)return 'contraintes '+n0+'→'+back.constraints.length;
    if(back.dims.length!==nD)return 'cotes '+nD+'→'+back.dims.length;
    const types=new Set(back.constraints.map(c=>c.type));
    const manque=['h','v','parallel','perpendicular','equal','fix','tangent','tangent2','coaxial','symmetric','coincident','oncircle','online','midpoint'].filter(t=>!types.has(t));
    return manque.length?'types perdus : '+manque.join(','):null;});
  T('⟂ implicite H×V non ajoutée à la création (mais ⟂ vraie si)',()=>{
    const keepE=skEdit,keepU=skUndoStack,keepR=skRedoStack,keepC=skChain,keepI=skInfer;
    const keepUL=skUndoStack.length,keepRL=skRedoStack.length;
    try{
      // cible V + nouvelle H → ⟂ implicite : H seule, pas de ⟂
      const sk={points:{p1:{x:0,y:0},p2:{x:0,y:20},p9:{x:0,y:20}},entities:[{id:'va',t:'line',p1:'p1',p2:'p2'}],constraints:[{id:'k0',type:'v',line:'va'}],dims:[],seq:50};
      skEdit=sk;skUndoStack=[];skRedoStack=[];skChain=null;skInfer={h:true,perp:'va'};
      const nl=skCommitLine(sk,'p9',null,30,20,0);
      if(!nl)return 'ligne non créée';
      const hasH=sk.constraints.some(c=>c.type==='h'&&c.line===nl.id);
      const hasPerp=sk.constraints.some(c=>c.type==='perpendicular');
      if(!hasH||hasPerp)return 'H='+hasH+' ⟂='+hasPerp+' (attendu H seule)';
      // cible diagonale (sans ─/│) + nouvelle H → ⟂ UTILE : H ET ⟂
      const sk2={points:{q1:{x:0,y:0},q2:{x:20,y:19},q9:{x:0,y:20}},entities:[{id:'dg',t:'line',p1:'q1',p2:'q2'}],constraints:[],dims:[],seq:60};
      skEdit=sk2;skUndoStack=[];skRedoStack=[];skChain=null;skInfer={h:true,perp:'dg'};
      const nl2=skCommitLine(sk2,'q9',null,30,20,0);
      if(!nl2)return 'ligne 2 non créée';
      const hasH2=sk2.constraints.some(c=>c.type==='h'&&c.line===nl2.id);
      const hasPerp2=sk2.constraints.some(c=>c.type==='perpendicular');
      if(!hasH2||!hasPerp2)return 'cas diagonal : H='+hasH2+' ⟂='+hasPerp2+' (attendu les deux)';
      return null;
    }finally{skEdit=keepE;skUndoStack.length=keepUL;skRedoStack.length=keepRL;skChain=keepC;skInfer=keepI;}
  });
  T('Dedup : doublons + ⟂ implicite purgés, utile gardée',()=>{
    const sk={points:{p1:{x:0,y:0},p2:{x:40,y:0},p3:{x:40,y:20},p4:{x:50,y:50},p5:{x:60,y:60}},
      entities:[{id:'a',t:'line',p1:'p1',p2:'p2'},{id:'b',t:'line',p1:'p2',p2:'p3'},{id:'g',t:'line',p1:'p4',p2:'p5'}],
      constraints:[{id:'k1',type:'h',line:'a'},{id:'k2',type:'h',line:'a'},{id:'k3',type:'v',line:'b'},{id:'k4',type:'perpendicular',a:'a',b:'b'},{id:'k5',type:'perpendicular',a:'g',b:'a'}],
      dims:[],seq:20};
    const out=skDedupConstraints(sk);
    // attendu : h(a)×1, v(b)×1, ⟂(g,a) gardée (g sans ─/│) → 3
    if(out.length!==3)return 'restantes='+out.length+' (attendu 3)';
    if(!out.some(c=>c.type==='perpendicular'&&((c.a==='g'&&c.b==='a')||(c.a==='a'&&c.b==='g'))))return '⟂ utile perdue';
    return null;});
  const tri=()=>({points:{p1:{x:0,y:0},p2:{x:40,y:0},p3:{x:20,y:30}},
    entities:[{id:'a',t:'line',p1:'p1',p2:'p2'},{id:'b',t:'line',p1:'p2',p2:'p3'},{id:'c',t:'line',p1:'p3',p2:'p1'}],
    constraints:[],dims:[],seq:50});
  T('Congé 2D : arc + 2 tangentes + R pilotée, contour fermé',()=>{
    const s=tri();
    const r=skFilletCorner(s,'a','b',5);
    if(!r.ok)return r.msg;
    solveSketch(s);
    const tg=s.constraints.filter(c=>c.type==='tangent'&&c.ent===r.arcId);
    if(tg.length!==2)return 'tangentes='+tg.length+' (attendu 2)';
    if(!s.dims.some(d=>d.type==='radius'&&d.ent===r.arcId))return 'cote R absente';
    const au=skAudit(s).all||[];
    const bad=tg.map(c=>(au.find(o=>o.id===c.id)||{}).viol||0);
    if(bad.some(v=>v>0.05))return 'tangence non convergée ±'+Math.max.apply(null,bad).toFixed(3);
    const arc=s.entities.find(e=>e.id===r.arcId);
    if(!arc||Math.abs(arc.r-5)>0.6)return 'R='+(arc?arc.r:'?');
    const tr=skLoopTrace(s);
    return tr.solids.length===1&&!tr.opens.length?null:`solides=${tr.solids.length} ouverts=${tr.opens.length}`;});
  T('Chanfrein 2D : coupe + cote, contour fermé',()=>{
    const s=tri();
    const r=skChamferCorner(s,'a','b',6);
    if(!r.ok)return r.msg;
    solveSketch(s);
    if(!s.dims.some(d=>d.type==='length'&&d.line===r.segId))return 'cote longueur absente';
    const au=(skAudit(s).all||[]).find(o=>o.id===(s.dims.find(d=>d.line===r.segId)||{}).id);
    if(au&&au.viol>0.05)return 'cote non convergée ±'+au.viol.toFixed(3);
    const tr=skLoopTrace(s);
    return tr.solids.length===1&&!tr.opens.length?null:`solides=${tr.solids.length} ouverts=${tr.opens.length}`;});
  T('Extrusion à trou (THREE)',()=>{const b=sketchShape(holeSq(true));const nH=b.shapes.length?(b.shapes[0].holes||[]).length:0;return b.shapes.length===1&&nH===1?null:`shapes=${b.shapes.length} trous=${nH}`;});
  T('Face → tous les coins du corps sélectionné',()=>{
    // simule la sélection par face : prend un esquisse rect, trace les solides,
    // puis vérifie que chainNodesOf de chaque solide couvre les 4 coins
     const r=rect(); const tr=skLoopTrace(r);
     if(!tr.solids.length)return 'pas de solide';
     const nC=tr.solids.reduce((a,s)=>a+chainNodesOf(s.chain).length,0);
     return nC>=4?null:`coins par boucle=${nC}`;
   });
   if($('sketchOverlay').classList.contains('open'))out.push('Test undo : ignoré (esquisse ouverte)');
  else{
    try{
      const keepE=skEdit,keepU=skUndoStack,keepR=skRedoStack;
      skEdit={points:{a:{x:0,y:0}},entities:[{id:'e1',t:'cpoint',p:'a'}],constraints:[],dims:[],seq:9};
      skUndoStack=[];skRedoStack=[];
      skPushUndo();skEdit.entities.push({id:'e2',t:'cpoint',p:'a'});
      skUndoTrans();const n1=skEdit.entities.length;
      skRedoTrans();const n2=skEdit.entities.length;
      skEdit=keepE;skUndoStack=keepU;skRedoStack=keepR;
      if(keepE){drawSketch2D();renderSkPanel();}
      out.push((n1===1&&n2===2?'✅ ':'❌ ')+'Undo/redo restaure ('+n1+'/'+n2+')');if(n1===1&&n2===2)okN++;
    }catch(e){out.push('❌ Undo/redo — '+String((e&&e.message)||e));}
  }
  $('selfTest').textContent=`${okN}/${out.length} OK\n`+out.join('\n');
  log(`Auto-tests : ${okN}/${out.length} OK`);
}

/* ----- ✓ Valider : 7 phases diagnostic + réparation, rapport dans #selfTest ----- */
function runValidate(){
  // Chaque phase pose un diagnostic ET répare ce qui l'est ; le compte rendu
  // (✅ vert / ⚠ signalé / ❌ échec) s'écrit dans la zone Auto-tests (#selfTest),
  // et le texte revient aussi en valeur de retour (les tests du dépôt le lisent).
  const L=[];let rep=0;
  const line=(n,st,txt)=>L.push(n+' '+st+' '+txt);
  // 1) DOCUMENT — docSanitise : instances orphelines/doublons, copies bornées, noms de
  //    congé/dépouillage/coque réalignés sur la géométrie réelle.
  try{
    const r=docSanitise()||{};
    const n=(r.dup||0)+(r.orph||0)+(r.sk||0)+(r.cap||0)+(r.ren||0);rep+=n;
    line(1,'✅','Document — '+(n?n+' anomalie(s) réparée(s) (doublons '+r.dup+', instances orphelines '+r.orph+', esquisses abandonnées '+r.sk+', copies bornées '+r.cap+', noms réalignés '+r.ren+')':'aucune anomalie'));
  }catch(e){line(1,'❌','Document — '+String((e&&e.message)||e));}
  // 2) RÉPÉTITIONS — écart paramètre source/instance, puis balayage repGenAll().
  try{
    const PF=['distance','dist','angle','thick','radius','op','flip','mid','tangent'];
    const eqv=(a,b)=>JSON.stringify(a===undefined?null:a)===JSON.stringify(b===undefined?null:b);
    const staleOf=k=>{const s=doc.features.find(f=>f.id===k._src);if(!s)return 0;for(const p of PF)if(!eqv(s[p],k[p]))return 1;return 0;};
    const kids=doc.features.filter(f=>f.repeatId);
    let st=0;kids.forEach(k=>{st+=staleOf(k);});
    repGenAll();
    let st2=0;doc.features.filter(f=>f.repeatId).forEach(k=>{st2+=staleOf(k);});
    if(st&&st2<st)rep+=st-st2;
    line(2,st2?'❌':'✅','Répétitions — '+doc.features.filter(f=>f.type==='repeat').length+' répétition(s), '+kids.length+' instance(s)'+
      (st?' — '+st+' désynchronisée(s) réalignée(s)':' à jour')+
      (st2?' — '+st2+' restent désynchronisée(s)':st?' — 0 reste après balayage':''));
  }catch(e){line(2,'❌','Répétitions — '+String((e&&e.message)||e));}
  // 3) ESQUISSES — skAudit : contraintes/cotes non respectées. Diagnostic seulement :
  //    réparer tout seul demanderait de choisir entre sous- et sur-contrainte.
  try{
    const bad=[];
    (doc.sketches||[]).forEach(sk=>{
      let a=null;try{a=skAudit(sk);}catch(e){}
      const n=((a&&a.all)||[]).filter(o=>(o.viol||0)>0.05).length;
      if(n)bad.push((sk.name||sk.id)+' ('+n+')');
    });
    line(3,bad.length?'⚠':'✅','Esquisses — '+(doc.sketches||[]).length+' esquisse(s)'+
      (bad.length?', dont '+bad.length+' avec contrainte(s)/cote(s) violée(s) : '+bad.join(', '):', aucune violation'));
  }catch(e){line(3,'❌','Esquisses — '+String((e&&e.message)||e));}
  // 4) FONCTIONS — rejeu complet, puis lecture des marques : _err (échec) et
  //    _m.m<_m.t (fonction dégradée : visage introuvable après modification amont).
  try{
    if(!(typeof buildKeyUpToDate==='function'&&buildKeyUpToDate()))rebuild();
    const fsx=doc.features.filter(f=>f.type!=='repeat');
    const err=fsx.filter(f=>f._err);
    const miss=fsx.filter(f=>f._m&&f._m.t&&f._m.m<f._m.t);
    const noms=a=>a.slice(0,4).map(f=>f.name||f.type).join(', ')+(a.length>4?'…':'');
    line(4,err.length?'❌':(miss.length?'⚠':'✅'),'Fonctions — '+fsx.length+' fonction(s) rejouée(s)'+
      (err.length?' — '+err.length+' en erreur : '+noms(err):'')+
      (miss.length?' — '+miss.length+' dégradée(s) : '+noms(miss):'')+
      (err.length||miss.length?'':' — aucune erreur'));
  }catch(e){line(4,'❌','Fonctions — rejeu impossible : '+String((e&&e.message)||e));}
  // 5) MOTEUR+CACHES — état d'OCCT, puis hardRefresh : jet de TOUS les caches et
  //    rejeu du modèle entier (le filet qui remet d'aplomb un état caché périmé).
  try{
    const eng=(typeof occtReady!=='undefined'&&occtReady)?'OCCT chargé':'repli maillage (OCCT absent)';
    hardRefresh();rep++;
    line(5,'✅','Moteur+caches — '+eng+' ; caches jetés + rejeu complet');
  }catch(e){line(5,'❌','Moteur+caches — '+String((e&&e.message)||e));}
  // 6) CORPS+IMPORTS — fiche de corps manquante (ensureBodies), visibilités orphelines
  //    (bodyVis sans corps) et géométrie d'import dont la fonction a disparu.
  try{
    ensureBodies();
    const ids=new Set((doc.bodies||[]).map(b=>b.id));
    let ov=0;for(const k of Object.keys(doc.bodyVis||{})){if(!ids.has(k)){delete doc.bodyVis[k];ov++;}}
    let io=0;
    try{
      const viv=new Set((doc.features||[]).filter(f=>f.type==='import').map(f=>f.id));
      for(const id of Array.from(importGeom.keys())){if(viv.has(id)||(typeof importIdStillReachable==='function'&&importIdStillReachable(id)))continue;io++;}
      importHydrate(); // purge réelle + re-brochage des meshes déstripés
    }catch(e){}
    rep+=ov+io;
    line(6,'✅','Corps+imports — '+(doc.bodies||[]).length+' corps'+
      (ov+io?', '+ov+' visibilité(s) orpheline(s) et '+io+' import(s) orphelin(s) purgé(s)':' — cohérent'));
  }catch(e){line(6,'❌','Corps+imports — '+String((e&&e.message)||e));}
  // 7) RAPPORT — agrégat des 6 phases + total des réparations, écrit dans #selfTest.
  const ok6=L.filter(s=>s.indexOf(' ✅ ')>=0).length;
  const txt='VALIDATION : '+(ok6+1)+'/7 phases OK — '+rep+' réparation(s)\n'+L.join('\n')+
    '\n7 ✅ Rapport — '+ok6+'/6 phases vertes, '+rep+' réparation(s) : écrit dans la zone Auto-tests';
  try{$('selfTest').textContent=txt;}catch(e){}
  try{faceEl.textContent='✓ Valider : '+(ok6+1)+'/7 phases, '+rep+' réparation(s) — rapport dans Auto-tests.';}catch(e){}
  try{log('Validation : '+(ok6+1)+'/7 OK, '+rep+' réparation(s)');}catch(e){}
  return txt;
}

// Bouton « ✓ Valider » : monté depuis le JS à côté de « 🧪 Auto-tests » (la coque HTML
// n'est jamais éditée à la main — même régime que ↩ Annuler). Idempotent.
(function(){
  try{
    if(typeof document==='undefined'||document.getElementById('btnValidate'))return;
    const hote=document.getElementById('btnSelfTest');
    if(!hote||!hote.parentNode)return;
    const b=document.createElement('button');
    b.id='btnValidate';
    b.textContent='✓ Valider';
    b.title='Valider le modèle : 7 phases diagnostic + réparation (document, répétitions, esquisses, fonctions, moteur, corps) — rapport dans Auto-tests';
    b.onclick=()=>runValidate();
    hote.parentNode.insertBefore(b,hote);
  }catch(e){}
})();


