/* ---------- configurations : tables de variantes (V0.8.4) ----------
   doc.configs = {active: id | null, cols: [nom…], rows: [{id, name, vals: {nom: expression}, off: [id de fonction…]}]}
   • une COLONNE = une valeur nommée du modèle : paramètre libre, cote nommée, valeur nommée d'une
     fonction (ƒx, 51-parametres) ;
   • une LIGNE = une variante : la valeur de chaque colonne (nombre ou expression, vide = inchangée)
     et les fonctions SUPPRIMÉES dans cette variante (comme l'œil de l'arbre : hors du rejeu).
   Activer une ligne écrit ses valeurs dans les expressions, supprime / rétablit les fonctions que
   la table pilote (celles supprimées dans au moins une ligne ; les autres ne sont pas touchées),
   puis régénère : une étape d'annulation. Le document porte les valeurs de la variante active :
   une version antérieure de MiniFusion l'ouvre telle quelle. */
function cfgOf(d){const c=(d||doc).configs;return c&&Array.isArray(c.rows)&&c.rows.length?c:null;}
function cfgEnsure(){
  if(!doc.configs||typeof doc.configs!=='object')doc.configs={active:null,cols:[],rows:[]};
  const c=doc.configs;if(!Array.isArray(c.cols))c.cols=[];if(!Array.isArray(c.rows))c.rows=[];
  return c;
}
function cfgNorm(c){
  // Table relue d'un fichier : champs valides seulement ; null si vide
  if(!c||typeof c!=='object'||!Array.isArray(c.rows))return null;
  const cols=(Array.isArray(c.cols)?c.cols:[]).filter(n=>typeof n==='string'&&PAR_ID.test(n));
  const rows=c.rows.filter(r=>r&&typeof r.id==='string').map(r=>{
    const vals={};if(r.vals&&typeof r.vals==='object')cols.forEach(n=>{const v=r.vals[n];if(v!=null&&String(v).trim()!=='')vals[n]=String(v);});
    return {id:r.id,name:String(r.name||r.id),vals,off:(Array.isArray(r.off)?r.off:[]).filter(x=>typeof x==='string')};
  });
  if(!rows.length)return null;
  return {active:rows.some(r=>r.id===c.active)?c.active:null,cols:[...new Set(cols)],rows};
}
function cfgCurrent(nm){
  // Expression actuelle d'une valeur nommée (texte), ou '' si inconnue
  const e=parAll().get(nm);if(!e)return '';
  if(e.kind==='param')return String(e.p.expr==null?'':e.p.expr);
  if(e.kind==='dim')return (e.d.expr!=null&&String(e.d.expr).trim()!=='')?String(e.d.expr):String(+parDimUser(e.d).toFixed(6));
  return (e.h.expr&&e.h.expr[e.k])?String(e.h.expr[e.k]):String(+parHolderVal(e.h,e.k).toFixed(6));
}
function cfgSetExpr(nm,ex){
  const e=parAll().get(nm);if(!e)return false;
  ex=String(ex).trim();
  if(e.kind==='param')e.p.expr=ex;
  else if(e.kind==='dim'){e.d.expr=ex;parPending.add(e.sk);}
  else{e.h.expr=e.h.expr||{};e.h.expr[e.k]=ex;}
  return true;
}
function cfgPiloted(c){const s=new Set();(c.rows||[]).forEach(r=>(r.off||[]).forEach(id=>s.add(id)));return s;}
function cfgApply(id,opt){
  // → {ok, msg, missing:[noms absents du modèle], errs:[messages]}
  const c=cfgOf();const row=c&&c.rows.find(r=>r.id===id);
  if(!row)return {ok:false,msg:'configuration introuvable',missing:[],errs:[]};
  if(!(opt&&opt.noUndo))docPushUndo('configuration « '+row.name+' »');
  const missing=[],m=parAll();
  c.cols.forEach(nm=>{const ex=row.vals[nm];if(ex==null||String(ex).trim()==='')return;if(!m.has(nm)){missing.push(nm);return;}cfgSetExpr(nm,ex);});
  const P=cfgPiloted(c),off=new Set(row.off||[]);
  (doc.features||[]).forEach(f=>{if(!f||f.repeatId||!P.has(f.id))return;const on=!off.has(f.id);f.visible=on;
    if(f.type==='repeat')doc.features.forEach(k=>{if(k.repeatId===f.id)k.visible=on;});});
  c.active=id;
  try{parApplyAll();}catch(e){}
  const errs=[];
  (doc.params||[]).forEach(p=>{if(p&&p.err)errs.push(p.name+' : '+p.err);});
  (doc.sketches||[]).forEach(sk=>(sk.dims||[]).forEach(d=>{if(d&&d.exprErr)errs.push((d.name||'cote')+' : '+d.exprErr);}));
  if(!(opt&&opt.noRebuild)){try{markDirty();rebuild();}catch(e){}try{renderTree();renderProps();}catch(e){}}
  const msg='Configuration « '+row.name+' »'+(missing.length?' — absent(s) du modèle : '+missing.join(', '):'')+(errs.length?' — ⚠ '+errs.join(' ; '):'');
  try{faceEl.textContent=msg+'.';}catch(e){}
  return {ok:!errs.length,msg,missing,errs};
}
function cfgCapture(id){
  // Valeurs ACTUELLES du modèle (et fonctions supprimées) → ligne id
  const c=cfgOf();const row=c&&c.rows.find(r=>r.id===id);if(!row)return false;
  c.cols.forEach(nm=>{const v=cfgCurrent(nm);if(v!=='')row.vals[nm]=v;});
  row.off=(doc.features||[]).filter(f=>f&&!f.repeatId&&f.visible===false).map(f=>f.id);
  return true;
}
function cfgAddRow(name){
  // Nouvelle variante = l'état actuel du modèle
  const c=cfgEnsure();let k=c.rows.length+1;while(c.rows.some(r=>r.id==='cf'+k))k++;
  const row={id:'cf'+k,name:name||('Configuration '+k),vals:{},off:[]};
  c.rows.push(row);cfgCapture(row.id);if(!c.active)c.active=row.id;
  return row;
}
function cfgAddCol(nm){
  const c=cfgEnsure();if(!parAll().has(nm)||c.cols.includes(nm))return false;
  c.cols.push(nm);const v=cfgCurrent(nm);c.rows.forEach(r=>{if(r.vals[nm]==null)r.vals[nm]=v;});
  return true;
}
function cfgDelRow(id){const c=cfgOf();if(!c)return;c.rows=c.rows.filter(r=>r.id!==id);if(c.active===id)c.active=c.rows.length?c.rows[0].id:null;if(!c.rows.length)doc.configs=null;}
function cfgDelCol(nm){const c=cfgOf();if(!c)return;c.cols=c.cols.filter(n=>n!==nm);c.rows.forEach(r=>{delete r.vals[nm];});}
function cfgRename(oldN,newN){
  // une valeur nommée renommée (fenêtre ƒx) : la colonne suit
  const c=doc.configs;if(!c||!Array.isArray(c.cols)||!c.cols.includes(oldN))return;
  c.cols=c.cols.map(n=>n===oldN?newN:n);(c.rows||[]).forEach(r=>{if(oldN in r.vals){r.vals[newN]=r.vals[oldN];delete r.vals[oldN];}});
}
/* ── interface : section « Configurations » de la fenêtre ƒx, sélecteur dans l'arbre ── */
function cfgSection(box,rerender){
  const inpCss='background:#101012;color:#fff;border:1px solid #3a3a40;border-radius:5px;padding:3px 6px;width:100%;box-sizing:border-box';
  const h=document.createElement('div');h.style.cssText='margin:16px 0 6px;display:flex;align-items:baseline;gap:10px';
  h.innerHTML='<b style="font-size:14px">Configurations</b><span style="opacity:.7">une ligne par variante : valeurs des paramètres, fonctions supprimées ; ◉ = active</span>';
  box.appendChild(h);
  const c=cfgOf();
  const redo=()=>{try{rerender();}catch(e){}};
  if(c){
    const tbl=document.createElement('table');tbl.id='cfgTable';tbl.style.cssText='border-collapse:collapse;width:100%';
    const hd=document.createElement('tr');hd.style.cssText='text-align:left;opacity:.75';
    const th=(t,x)=>{const e=document.createElement('th');e.style.padding='3px 6px';e.textContent=t;if(x)e.appendChild(x);hd.appendChild(e);return e;};
    th('');th('Variante');
    c.cols.forEach(nm=>{const x=document.createElement('span');x.textContent=' ✕';x.style.cssText='cursor:pointer;opacity:.6';x.title='Retirer la colonne';
      x.onclick=()=>{docPushUndo('configurations');cfgDelCol(nm);redo();};th(nm,x);});
    th('Supprimées');th('');
    tbl.appendChild(hd);
    c.rows.forEach(r=>{
      const tr=document.createElement('tr');const td=()=>{const t=document.createElement('td');t.style.padding='3px 6px';tr.appendChild(t);return t;};
      const rb=document.createElement('input');rb.type='radio';rb.name='cfgAct';rb.checked=c.active===r.id;rb.title='Activer cette configuration';
      rb.onchange=()=>{cfgApply(r.id);redo();};td().appendChild(rb);
      const n=document.createElement('input');n.value=r.name;n.style.cssText=inpCss;n.onchange=()=>{docPushUndo('configurations');r.name=n.value.trim()||r.name;try{renderTree();}catch(e){}};td().appendChild(n);
      c.cols.forEach(nm=>{const x=document.createElement('input');x.value=r.vals[nm]==null?'':r.vals[nm];x.style.cssText=inpCss;x.placeholder='—';
        x.onchange=()=>{docPushUndo('configurations');const v=x.value.trim();if(v)r.vals[nm]=v;else delete r.vals[nm];
          if(c.active===r.id)cfgApply(r.id,{noUndo:true});redo();};td().appendChild(x);});
      const so=td();const b=document.createElement('button');b.textContent=(r.off||[]).length?((r.off||[]).length+' fonction(s)'):'aucune';
      b.title='Fonctions supprimées dans cette variante';b.onclick=()=>cfgOffPick(r,b,redo);so.appendChild(b);
      const dl=td();const d=document.createElement('button');d.textContent='🗑';d.title='Supprimer la configuration';
      d.onclick=()=>{docPushUndo('configurations');cfgDelRow(r.id);try{renderTree();}catch(e){}redo();};dl.appendChild(d);
      tbl.appendChild(tr);
    });
    box.appendChild(tbl);
  }
  const bar=document.createElement('div');bar.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px';
  const add=document.createElement('button');add.id='cfgAdd';add.textContent='+ Configuration';add.title='Nouvelle variante = l’état actuel du modèle';
  add.onclick=()=>{docPushUndo('configurations');const r=cfgAddRow();if(cfgOf().rows.length===1){cfgOf().active=r.id;}try{renderTree();}catch(e){}redo();};
  bar.appendChild(add);
  const names=[...parAll().keys()].filter(n=>!(c&&c.cols.includes(n)));
  if(names.length){
    const s=document.createElement('select');s.id='cfgColSel';
    const o0=document.createElement('option');o0.value='';o0.textContent='+ Colonne…';s.appendChild(o0);
    names.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;s.appendChild(o);});
    s.onchange=()=>{if(!s.value)return;docPushUndo('configurations');if(!cfgOf())cfgAddRow();cfgAddCol(s.value);redo();};
    bar.appendChild(s);
  }
  if(c&&c.active){
    const cap=document.createElement('button');cap.textContent='Mémoriser l’état actuel';cap.title='Les valeurs actuelles du modèle et les fonctions masquées deviennent celles de la configuration active';
    cap.onclick=()=>{docPushUndo('configurations');cfgCapture(c.active);redo();};bar.appendChild(cap);
  }
  box.appendChild(bar);
}
function cfgOffPick(r,anchor,redo){
  const items=(doc.features||[]).filter(f=>f&&!f.repeatId).map(f=>{
    const on=(r.off||[]).includes(f.id);
    return {html:(on?'☑ ':'☐ ')+String(f.name||f.id).replace(/</g,'&lt;'),fn:()=>{
      docPushUndo('configurations');r.off=on?r.off.filter(x=>x!==f.id):(r.off||[]).concat(f.id);
      const c=cfgOf();if(c&&c.active===r.id)cfgApply(r.id,{noUndo:true});redo();}};
  });
  if(!items.length)items.push({html:'<span style="opacity:.6">Aucune fonction</span>',fn:()=>{}});
  try{mfPop(anchor,items);}catch(e){}
}
function cfgTreeRow(t){
  // Sélecteur de configuration en tête de l'arbre (seulement s'il y a une table)
  const c=cfgOf();if(!c)return;
  const d=document.createElement('div');d.className='tgroup';d.id='cfgTree';d.style.cssText='display:flex;align-items:center;gap:6px';
  const l=document.createElement('span');l.textContent='⚙ Configuration';d.appendChild(l);
  const s=document.createElement('select');s.style.cssText='flex:1;min-width:0';
  c.rows.forEach(r=>{const o=document.createElement('option');o.value=r.id;o.textContent=r.name;if(r.id===c.active)o.selected=true;s.appendChild(o);});
  if(!c.active){const o=document.createElement('option');o.value='';o.textContent='—';o.selected=true;s.insertBefore(o,s.firstChild);}
  s.onchange=()=>{if(s.value)cfgApply(s.value);};
  s.onclick=e=>e.stopPropagation();
  d.appendChild(s);t.appendChild(d);
}
