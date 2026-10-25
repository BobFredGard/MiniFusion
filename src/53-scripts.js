/* ---------- scripts JSON et pilotage (V0.8.5) ----------
   Un script = une liste de commandes {op, …}, exécutées dans l'ordre sur le document actif :
     {op:'new', name}                                    nouveau document (vide)
     {op:'param', name, expr}                            crée ou modifie un paramètre ƒx
     {op:'sketch', id, name, plane:'XY'|'XZ'|'YZ', offset, shapes:[…]}
         shapes : {rect:[x0,y0,x1,y1]} · {circle:[cx,cy,r]} · {poly:[[x,y],…]} · {line:[x1,y1,x2,y2]}
                  (+ construction:true) — coordonnées dans le plan, offset le long de sa normale
     {op:'extrude', sketch, distance, cut, symmetric, name}
     {op:'revolve', sketch, axis:'X'|'Y'|'Z', angle, cut, name}
     {op:'config', name}                                 active une configuration (52)
     {op:'info'}                                         état : fonctions, paramètres, corps (volume, centre, boîte)
     {op:'undo'}
   Une commande peut viser une esquisse par l'id donné dans le script, son id réel ou son nom.
   Le script est ATOMIQUE : une erreur remet le document tel qu'avant le script (et la dit, avec
   le numéro de la commande). Une seule étape d'annulation pour tout le script.
   Pilotage : le pont (🔌, menu Projet) relie la page à un serveur local (tools/mcp-minifusion.cjs,
   serveur MCP) par WebSocket sur 127.0.0.1 — seulement quand l'utilisateur le demande. */
const MF_SCRIPT_OPS=['new','param','sketch','extrude','revolve','config','info','undo'];
function mfNum(v,what){const n=+v;if(!isFinite(n))throw new Error(what+' : nombre attendu ('+JSON.stringify(v)+')');return n;}
function mfSketchFind(ref,ids){
  if(ref==null)return null;const r=String(ref);
  const id=ids[r]||r;
  return (doc.sketches||[]).find(s=>s.id===id)||(doc.sketches||[]).find(s=>s.name===r)||null;
}
function mfSketchShapes(sk,shapes){
  // Entités d'esquisse à partir de formes simples ; points partagés, coins fermés
  let n=0;const P=(x,y)=>{const id='p'+(++n);sk.points[id]={x:mfNum(x,'x'),y:mfNum(y,'y')};return id;};
  let e=0;const E=o=>{o.id='e'+(++e);sk.entities.push(o);return o;};
  (shapes||[]).forEach((s,k)=>{
    if(!s||typeof s!=='object')throw new Error('forme '+(k+1)+' : objet attendu');
    const cons=s.construction?{construction:true}:{};
    if(Array.isArray(s.rect)){const [x0,y0,x1,y1]=s.rect.map(v=>mfNum(v,'rect'));
      if(!(Math.abs(x1-x0)>1e-9&&Math.abs(y1-y0)>1e-9))throw new Error('forme '+(k+1)+' : rectangle plat');
      const a=P(x0,y0),b=P(x1,y0),c=P(x1,y1),d=P(x0,y1);
      [[a,b],[b,c],[c,d],[d,a]].forEach(([p1,p2])=>E(Object.assign({t:'line',p1,p2},cons)));}
    else if(Array.isArray(s.circle)){const [cx,cy,r]=s.circle.map(v=>mfNum(v,'circle'));
      if(!(r>0))throw new Error('forme '+(k+1)+' : rayon > 0 attendu');E(Object.assign({t:'circle',pc:P(cx,cy),r},cons));}
    else if(Array.isArray(s.poly)){if(s.poly.length<3)throw new Error('forme '+(k+1)+' : au moins 3 sommets');
      const ids=s.poly.map(q=>P(q[0],q[1]));ids.forEach((p1,i)=>E(Object.assign({t:'line',p1,p2:ids[(i+1)%ids.length]},cons)));}
    else if(Array.isArray(s.line)){const [x1,y1,x2,y2]=s.line;E(Object.assign({t:'line',p1:P(x1,y1),p2:P(x2,y2)},cons));}
    else throw new Error('forme '+(k+1)+' : rect, circle, poly ou line attendu');
  });
}
function mfInfo(){
  try{if(typeof builtVersion!=='undefined'){markDirty();rebuild();}}catch(e){}
  const out={name:doc.name,sketches:(doc.sketches||[]).map(s=>({id:s.id,name:s.name,plane:s.plane})),
    features:(doc.features||[]).filter(f=>f&&!f.repeatId).map(f=>{const o={id:f.id,name:f.name,type:f.type};if(f.visible===false)o.suppressed=true;if(f.err||f.msg)o.message=f.err||f.msg;return o;}),
    params:(doc.params||[]).map(p=>({name:p.name,expr:p.expr,value:p.value,error:p.err||undefined})),
    configs:(typeof cfgOf==='function'&&cfgOf())?{active:cfgOf().active,rows:cfgOf().rows.map(r=>r.name)}:null,
    engine:typeof builtEngine!=='undefined'?builtEngine:null,bodies:[]};
  try{
    if(typeof occHas==='function'&&occHas()){
      asmExactActive().forEach(b=>{try{const m=asmVolCom(b.shape),B=asmBox(b.shape);
        out.bodies.push({id:b.id,name:b.name,volume:+m.v.toFixed(3),center:m.c.map(v=>+v.toFixed(3)),box:{min:B.min.map(v=>+v.toFixed(3)),max:B.max.map(v=>+v.toFixed(3))}});}finally{try{b.shape.delete();}catch(e){}}});
    }else out.bodies=((typeof bodies!=='undefined'&&bodies)||[]).filter(b=>b&&!b.ghost).map(b=>({id:b.id,name:b.name||b.id,volume:null}));
  }catch(e){out.bodiesError=String(e&&e.message||e);}
  return out;
}
function mfScriptRun(script){
  // → {ok, results:[…], error?, at?} ; atomique
  let cmds=script;
  if(typeof cmds==='string'){try{cmds=JSON.parse(cmds);}catch(e){return {ok:false,results:[],error:'JSON illisible : '+e.message};}}
  if(cmds&&!Array.isArray(cmds)&&Array.isArray(cmds.commands))cmds=cmds.commands;
  if(!Array.isArray(cmds))return {ok:false,results:[],error:'liste de commandes attendue'};
  const snap=docSnap(),u0=docUndoStack.length,ids={},results=[];
  let changed=false,at=-1;
  try{
    cmds.forEach((c,i)=>{
      at=i;
      if(!c||typeof c!=='object'||!MF_SCRIPT_OPS.includes(c.op))throw new Error('op inconnue ('+JSON.stringify(c&&c.op)+') — '+MF_SCRIPT_OPS.join(', '));
      if(c.op==='new'){docResetEmpty();doc.name=String(c.name||'Script');changed=true;results.push({op:'new',name:doc.name});return;}
      if(c.op==='param'){
        if(!PAR_ID.test(String(c.name||'')))throw new Error('param : nom invalide');
        if(!Array.isArray(doc.params))doc.params=[];
        const ex=String(c.expr!=null?c.expr:c.value);let p=doc.params.find(q=>q.name===c.name);
        if(!p){const ok=parNameCheck(c.name,null,null);if(ok!==true)throw new Error('param : '+ok);p={name:c.name,expr:ex,value:0};doc.params.push(p);}else p.expr=ex;
        parApplyAll();if(p.err)throw new Error('param '+c.name+' : '+p.err);
        changed=true;results.push({op:'param',name:p.name,value:p.value});return;
      }
      if(c.op==='sketch'){
        const pl=String(c.plane||'XY').toUpperCase();if(!['XY','XZ','YZ'].includes(pl))throw new Error('sketch : plan XY, XZ ou YZ');
        const sk={id:uid('sk'),name:String(c.name||('Esquisse '+((doc.sketches||[]).length+1))),plane:pl,entities:[],points:{},constraints:[],dims:[],seq:1,visible:true,origin:[0,0,0]};
        ensureSketchBasis(sk);
        const off=c.offset!=null?mfNum(c.offset,'offset'):0;sk.origin=sk.axN.map(v=>v*off);
        mfSketchShapes(sk,c.shapes);
        doc.sketches.push(sk);if(c.id!=null)ids[String(c.id)]=sk.id;
        changed=true;results.push({op:'sketch',id:sk.id,name:sk.name,entities:sk.entities.length});return;
      }
      if(c.op==='extrude'||c.op==='revolve'){
        const sk=mfSketchFind(c.sketch,ids);if(!sk)throw new Error(c.op+' : esquisse « '+c.sketch+' » introuvable');
        let f;
        if(c.op==='extrude'){
          const d=mfNum(c.distance,'extrude.distance');if(!(Math.abs(d)>1e-9))throw new Error('extrude : distance non nulle attendue');
          f={id:uid('ex'),type:'extrude',name:'',sketchId:sk.id,distance:d,op:c.cut?'cut':'add',visible:true,mid:!!c.symmetric,upto:null};
          f.name=c.name?String(c.name):(typeof extName==='function'?extName(f):'Extrusion');
        }else{
          const ax=String(c.axis||'Z').toUpperCase();if(!['X','Y','Z'].includes(ax))throw new Error('revolve : axe X, Y ou Z');
          const a=c.angle!=null?mfNum(c.angle,'revolve.angle'):360;if(!(a>0&&a<=360))throw new Error('revolve : angle dans ]0 ; 360]');
          f={id:uid('rv'),type:'revolve',name:'',sketchId:sk.id,axis:{k:'sys',d:ax},angle:a,op:c.cut?'cut':'add',visible:true};
          f.name=c.name?String(c.name):(typeof revolveName==='function'?revolveName(f):'Révolution');
        }
        sk.visible=false;addFeature(f);if(c.id!=null)ids[String(c.id)]=f.id;
        changed=true;results.push({op:c.op,id:f.id,name:f.name});return;
      }
      if(c.op==='config'){
        const C=typeof cfgOf==='function'&&cfgOf();const row=C&&C.rows.find(r=>r.name===c.name||r.id===c.name);
        if(!row)throw new Error('config : « '+c.name+' » introuvable');
        const r=cfgApply(row.id,{noUndo:true,noRebuild:true});if(r.errs.length)throw new Error('config : '+r.errs.join(' ; '));
        changed=true;results.push({op:'config',name:row.name});return;
      }
      if(c.op==='undo'){results.push({op:'undo',ok:!!docUndo()});changed=true;return;}
      if(c.op==='info'){if(changed){markDirty();rebuild();changed=false;}results.push(Object.assign({op:'info'},mfInfo()));return;}
    });
  }catch(e){
    // atomique : tout le script est défait
    try{docApplySnap(snap);docUndoStack.length=Math.min(docUndoStack.length,u0);markDirty();rebuild();renderTree();renderProps();}catch(e2){}
    return {ok:false,results,error:String(e&&e.message||e),at:at+1};
  }
  // une seule étape d'annulation pour tout le script
  if(docUndoStack.length>u0){docUndoStack.length=u0;}
  if(changed||docSnap()!==snap){docUndoStack.push({snap,label:'script ('+cmds.length+' commande(s))',t:++undoTick});docRedoStack.length=0;try{docUndoUI();}catch(e){}}
  if(changed){try{markDirty();rebuild();}catch(e){}}
  try{renderTree();renderProps();}catch(e){}
  try{faceEl.textContent='Script : '+cmds.length+' commande(s) exécutée(s).';}catch(e){}
  return {ok:true,results};
}
/* ── fenêtre « Script JSON » ── */
function mfScriptDlg(){
  let ov=document.getElementById('mfScriptDlg');if(ov){ov.remove();return;}
  ov=document.createElement('div');ov.id='mfScriptDlg';
  ov.style.cssText='position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center';
  const box=document.createElement('div');
  box.style.cssText='background:#1c1c20;color:#e8e8ea;border:1px solid #3a3a40;border-radius:10px;padding:14px 16px;width:640px;max-width:92vw;font-size:13px;box-shadow:0 14px 40px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:8px';
  box.innerHTML='<b style="font-size:15px">📜 Script JSON</b><div style="opacity:.7">Liste de commandes {op, …} : '+MF_SCRIPT_OPS.join(', ')+'. Le script est défait en entier à la première erreur ; une seule étape d’annulation.</div>';
  const ta=document.createElement('textarea');ta.id='mfScriptTxt';ta.spellcheck=false;
  ta.style.cssText='height:220px;background:#101012;color:#fff;border:1px solid #3a3a40;border-radius:6px;padding:8px;font:12px monospace';
  try{ta.value=localStorage.getItem('minifusion_script')||'';}catch(e){}
  if(!ta.value)ta.value=JSON.stringify([{op:'param',name:'L',expr:'60'},{op:'sketch',id:'s1',plane:'XY',shapes:[{rect:[0,0,60,40]},{circle:[30,20,6]}]},{op:'extrude',sketch:'s1',distance:10},{op:'info'}],null,1);
  const outEl=document.createElement('pre');outEl.id='mfScriptOut';outEl.style.cssText='max-height:180px;overflow:auto;background:#101012;border-radius:6px;padding:8px;margin:0;font:11px monospace;white-space:pre-wrap';
  const bar=document.createElement('div');bar.style.cssText='display:flex;gap:8px;justify-content:flex-end';
  const run=document.createElement('button');run.className='primary';run.textContent='▶ Exécuter';
  run.onclick=()=>{try{localStorage.setItem('minifusion_script',ta.value);}catch(e){}const r=mfScriptRun(ta.value);
    outEl.textContent=(r.ok?'✓ ':'✗ commande '+r.at+' : '+r.error+'\n')+JSON.stringify(r.results,null,1);};
  const close=document.createElement('button');close.textContent='Fermer';close.onclick=()=>ov.remove();
  bar.appendChild(run);bar.appendChild(close);
  box.appendChild(ta);box.appendChild(bar);box.appendChild(outEl);ov.appendChild(box);
  ov.addEventListener('mousedown',e=>{if(e.target===ov)ov.remove();});
  ov.addEventListener('keydown',e=>{if(e.key==='Escape')ov.remove();e.stopPropagation();});
  document.body.appendChild(ov);try{ta.focus();}catch(e){}
}
/* ── pont de pilotage (serveur MCP local) ── */
let mfBridge=null; // {ws, url, n}
const MF_BRIDGE_URL='ws://127.0.0.1:47811';
function mfBridgeState(){return mfBridge&&mfBridge.ws&&mfBridge.ws.readyState===1?'on':(mfBridge?'wait':'off');}
function mfBridgeConnect(url){
  // L'utilisateur relie la page au serveur local : il recevra des scripts, rendra leurs résultats
  mfBridgeClose();
  url=url||MF_BRIDGE_URL;
  if(!/^ws:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(url))throw new Error('pont : adresse locale seulement (ws://127.0.0.1)');
  const ws=new WebSocket(url);mfBridge={ws,url,n:0};
  ws.onopen=()=>{try{ws.send(JSON.stringify({type:'hello',app:'MiniFusion',ver:APP_VER,doc:doc.name}));}catch(e){}mfBridgeUI();
    try{faceEl.textContent='🔌 Piloté par le serveur local ('+url+').';}catch(e){}};
  ws.onmessage=ev=>{
    let m;try{m=JSON.parse(ev.data);}catch(e){return;}
    if(!m||m.type!=='run')return;
    let r;try{r=m.info?{ok:true,results:[Object.assign({op:'info'},mfInfo())]}:mfScriptRun(m.script);}catch(e){r={ok:false,results:[],error:String(e&&e.message||e)};}
    mfBridge&&mfBridge.n++;
    try{ws.send(JSON.stringify({type:'result',id:m.id,result:r}));}catch(e){}
    mfBridgeUI();
  };
  ws.onclose=()=>{if(mfBridge&&mfBridge.ws===ws){mfBridge=null;mfBridgeUI();try{faceEl.textContent='🔌 Pilotage terminé.';}catch(e){}}};
  ws.onerror=()=>{try{faceEl.textContent='🔌 Serveur local introuvable ('+url+') — lancez « node tools/mcp-minifusion.cjs ».';}catch(e){}};
  mfBridgeUI();
  return mfBridge;
}
function mfBridgeClose(){if(mfBridge){try{mfBridge.ws.close();}catch(e){}mfBridge=null;mfBridgeUI();}}
function mfBridgeUI(){
  try{const b=document.getElementById('btnBridge');if(!b)return;const s=mfBridgeState();
    b.innerHTML='<i>🔌</i>'+(s==='on'?'Pilotage : connecté ('+((mfBridge&&mfBridge.n)||0)+')':s==='wait'?'Pilotage : connexion…':'Pilotage (MCP)…');}catch(e){}
}
function mfScriptMenu(){
  // entrées du menu Projet (construit après ce fichier : appel différé)
  try{
    const nb=document.getElementById('btnNew'),menu=nb&&nb.parentNode;
    if(menu&&menu.classList&&menu.classList.contains('ddMenu')&&!document.getElementById('btnScript')){
      const s=document.createElement('button');s.id='btnScript';s.innerHTML='<i>📜</i>Script JSON…';s.title='Exécuter une liste de commandes JSON sur le document';s.onclick=()=>mfScriptDlg();
      const b=document.createElement('button');b.id='btnBridge';b.title='Relier la page au serveur local de pilotage (tools/mcp-minifusion.cjs, serveur MCP) — 127.0.0.1 seulement';
      b.onclick=()=>{if(mfBridgeState()==='off'){try{mfBridgeConnect();}catch(e){alert(e.message);}}else mfBridgeClose();};
      menu.appendChild(s);menu.appendChild(b);mfBridgeUI();
    }
  }catch(e){}
}
try{setTimeout(mfScriptMenu,0);setTimeout(mfScriptMenu,1500);}catch(e){}
