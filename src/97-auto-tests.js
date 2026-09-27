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

