/* ---------- paramètres utilisateur & cotes nommées (2026-10-16-002) ----------
   Comme Fusion 360 :
   • dans la saisie d'une cote, « R_cong = 5 » NOMME la cote (nom choisi par l'utilisateur) ;
   • une autre cote peut valoir « R_cong », « R_cong*2 », « (L - 2*R_cong)/3 »… (ƒx) ;
   • des paramètres libres (doc.params : nom + expression) se gèrent dans la fenêtre ƒx.
   Unités : celles AFFICHÉES par la cote (mm, Ø pour une cote de diamètre ou depuis un
   axe, degrés pour un angle). sin/cos/tan en degrés. Décimale « 12,5 » acceptée ;
   arguments séparés par « ; » (ou « , » suivi d'un espace).
   Une cote nommée sert de paramètre partout (toutes esquisses) ; modifier sa valeur
   met à jour les cotes qui en dépendent, dans toutes les esquisses, puis le modèle. */
const PAR_FN={sqrt:Math.sqrt,abs:Math.abs,min:Math.min,max:Math.max,round:Math.round,floor:Math.floor,ceil:Math.ceil,
  sin:x=>Math.sin(x*Math.PI/180),cos:x=>Math.cos(x*Math.PI/180),tan:x=>Math.tan(x*Math.PI/180),
  asin:x=>Math.asin(x)*180/Math.PI,acos:x=>Math.acos(x)*180/Math.PI,atan:x=>Math.atan(x)*180/Math.PI};
const PAR_CONST={pi:Math.PI,PI:Math.PI};
const PAR_ID=/^[A-Za-z_][A-Za-z0-9_]*$/;
function parEval(src,lookup){
  // descente récursive : + - * / ^ ( ) fonctions, noms → lookup(nom)
  let s=String(src==null?'':src).trim().replace(/(\d),(\d)/g,'$1.$2').replace(/\s*(mm|°|deg)\s*$/i,'');
  let i=0;
  const sp=()=>{while(i<s.length&&/\s/.test(s[i]))i++;};
  const err=m=>{throw new Error(m);};
  const expr=()=>{let v=term();for(;;){sp();const c=s[i];if(c==='+'){i++;v+=term();}else if(c==='-'){i++;v-=term();}else return v;}};
  const term=()=>{let v=unary();for(;;){sp();const c=s[i];if(c==='*'){i++;v*=unary();}else if(c==='/'){i++;const d=unary();if(d===0)err('division par zéro');v/=d;}else return v;}};
  const unary=()=>{sp();if(s[i]==='-'){i++;return -unary();}if(s[i]==='+'){i++;return unary();}return pow();};
  const pow=()=>{const b=atom();sp();if(s[i]==='^'){i++;return Math.pow(b,unary());}return b;};
  const atom=()=>{
    sp();const c=s[i];
    if(c==='('){i++;const v=expr();sp();if(s[i]!==')')err('« ) » manquante');i++;return v;}
    const mN=/^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
    if(mN){i+=mN[0].length;let v=parseFloat(mN[0]);
      // V0.11.23 : unité collée au nombre (« 2 cm + 3 », « 1 in », « 1.5 rad ») — mm, cm, m, in / ", ° / deg, rad.
      // Avant : seul « mm » en fin d'expression était toléré (« 5 mm + 3 » refusé).
      const mU=/^\s*(mm|cm|m|in|"|°|deg|rad)(?![A-Za-z0-9_])/.exec(s.slice(i));
      if(mU){i+=mU[0].length;const u=mU[1];v*=u==='cm'?10:u==='m'?1000:(u==='in'||u==='"')?25.4:u==='rad'?180/Math.PI:1;}
      return v;}
    const mI=/^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
    if(mI){
      const nm=mI[0];i+=nm.length;sp();
      if(s[i]==='('){
        const f=PAR_FN[nm];if(!f)err('fonction inconnue « '+nm+' »');
        i++;const args=[];sp();
        if(s[i]!==')'){for(;;){args.push(expr());sp();if(s[i]===';'||s[i]===','){i++;continue;}break;}}
        sp();if(s[i]!==')')err('« ) » manquante');i++;return f.apply(null,args);
      }
      if(Object.prototype.hasOwnProperty.call(PAR_CONST,nm))return PAR_CONST[nm];
      return lookup(nm);
    }
    err(i>=s.length?'expression incomplète':'caractère inattendu « '+c+' »');
  };
  if(!s)err('expression vide');
  const v=expr();sp();
  if(i<s.length)err('caractère inattendu « '+s[i]+' »');
  if(!isFinite(v))err('résultat non fini');
  return v;
}
function parIsNumber(t){return /^\s*[+-]?(\d+([.,]\d*)?|[.,]\d+)\s*$/.test(String(t));}
function parDimUser(d){return d.type==='angle'?d.value*180/Math.PI:(d.dia?2*d.value:d.value);}
function parDimFromUser(d,f){return d.type==='angle'?f*Math.PI/180:(d.dia?f/2:f);}
function parAll(){
  const m=new Map();
  (doc.params||[]).forEach(p=>{if(p&&p.name)m.set(p.name,{kind:'param',p});});
  (doc.sketches||[]).forEach(sk=>(sk.dims||[]).forEach(d=>{if(d&&d.name)m.set(d.name,{kind:'dim',d,sk});}));
  parHolders().forEach(({h,f})=>{if(h.pname)Object.keys(h.pname).forEach(k=>{const nm=h.pname[k];if(nm)m.set(nm,{kind:'feat',h,k,f});});});
  return m;
}
// 2026-10-16-008 : valeurs des FONCTIONS 3D (distance d'extrusion, Ø et profondeurs de perçage,
// rayons de congé, angles…) : h.expr[clé] = expression, h.pname[clé] = nom. Porteurs : la
// fonction, son taraudage (f.thread) et chaque arête d'un congé / chanfrein exact (f.edges[i]).
function parHolders(){
  const out=[];
  (doc.features||[]).forEach(f=>{if(!f||f.repeatId)return;out.push({h:f,f}); // instances de répétition : elles suivent leur source
    if(f.thread&&typeof f.thread==='object')out.push({h:f.thread,f});
    (Array.isArray(f.edges)?f.edges:[]).forEach(s=>{if(s&&typeof s==='object')out.push({h:s,f});});});
  // géométrie de construction : distances, angles, décalages (cg.p) — 78-construction-modele.js
  (doc.cgeo||[]).forEach(c=>{if(c&&c.p&&typeof c.p==='object')out.push({h:c.p,f:c});});
  return out;
}
function parHolderVal(h,k){const v=+h[k];return k==='distance'?Math.abs(v):v;}
function parHolderSet(h,k,v){
  // distance d'extrusion : la saisie est une COURSE (positive), le sens reste celui choisi
  if(k==='distance'){const sg=(+h[k]<0)?-1:1;v=sg*Math.abs(v);}
  if(Math.abs((+h[k]||0)-v)>1e-9){h[k]=v;return true;}
  return false;
}
const parPending=new Set(); // esquisses dont une cote a changé, à résoudre (survit aux évaluations intermédiaires)
function parResolve(){
  // Évalue paramètres et cotes ƒx (ordre de dépendance, cycles détectés). Une cote dont
  // l'expression échoue garde sa dernière valeur et porte d.exprErr (⚠ à l'écran).
  const m=parAll(),val=new Map(),busy=new Set(),changed=new Set();
  const get=nm=>{
    if(val.has(nm))return val.get(nm);
    const e=m.get(nm);if(!e)throw new Error('« '+nm+' » inconnu');
    if(busy.has(nm))throw new Error('référence circulaire (« '+nm+' »)');
    busy.add(nm);let v;
    try{
      const ex=e.kind==='param'?e.p.expr:(e.kind==='feat'?(e.h.expr&&e.h.expr[e.k]):e.d.expr);
      v=(ex!=null&&String(ex).trim()!=='')?parEval(ex,get):(e.kind==='param'?+e.p.value:(e.kind==='feat'?parHolderVal(e.h,e.k):parDimUser(e.d)));
    }finally{busy.delete(nm);}
    if(!isFinite(v))throw new Error('« '+nm+' » sans valeur');
    val.set(nm,v);return v;
  };
  (doc.params||[]).forEach(p=>{if(!p)return;try{p.value=p.name?get(p.name):parEval(p.expr,get);delete p.err;}catch(e){p.err=e.message;}});
  (doc.sketches||[]).forEach(sk=>(sk.dims||[]).forEach(d=>{
    if(!d||d.ref||d.expr==null||String(d.expr).trim()==='')return;
    try{
      const v=d.name?get(d.name):parEval(d.expr,get);
      if(!(v>0)||(d.type==='angle'&&v>=180))throw new Error('valeur hors domaine ('+(+v.toFixed(4))+')');
      const nv=parDimFromUser(d,v);
      if(Math.abs(nv-d.value)>1e-9){d.value=nv;changed.add(sk);parPending.add(sk);}
      delete d.exprErr;
    }catch(e){d.exprErr=e.message;}
  }));
  let featChanged=false;
  parHolders().forEach(({h,f})=>{
    if(!h.expr)return;
    Object.keys(h.expr).forEach(k=>{
      const ex=h.expr[k];if(ex==null||String(ex).trim()===''){delete h.expr[k];return;}
      try{
        const nm=h.pname&&h.pname[k];
        const v=nm?get(nm):parEval(ex,get);
        if(!isFinite(v))throw new Error('valeur non finie');
        if(parHolderSet(h,k,v)){featChanged=true;f._fxDirty=1;}
        if(h.exprErr)delete h.exprErr[k];
      }catch(err){h.exprErr=h.exprErr||{};h.exprErr[k]=err.message;}
    });
  });
  return{changed:[...changed],get,featChanged};
}
function parApplyAll(){
  // Réévalue tout et résout les esquisses dont une cote a changé (y compris l'esquisse ouverte).
  const r=parResolve();
  const todo=[...parPending];parPending.clear();
  todo.forEach(sk=>{if((doc.sketches||[]).indexOf(sk)>=0){try{solveSketch(sk);}catch(e){}}});
  // fonctions 3D dont une valeur ƒx a changé : nom à jour + instances de répétition resynchronisées
  (doc.features||[]).forEach(f=>{if(!f||!f._fxDirty)return;delete f._fxDirty;
    try{const nm=({extrude:typeof extName==='function'?extName:null,revolve:typeof revolveName==='function'?revolveName:null,xmove:typeof mvName==='function'?mvName:null,xdraft:typeof draftName==='function'?draftName:null})[f.type];if(nm)f.name=nm(f);}catch(e){}
    try{if(typeof repSyncForFeature==='function'&&!f.repeatId)repSyncForFeature(f);}catch(e){}});
  return r;
}
function parNameCheck(nm,selfDim,selfParam,selfH,selfK){
  if(!PAR_ID.test(nm))return'Nom invalide « '+nm+' » : lettres, chiffres, _ (sans espace ni accent, pas de chiffre en tête).';
  if(PAR_FN[nm]||Object.prototype.hasOwnProperty.call(PAR_CONST,nm))return'« '+nm+' » est réservé (fonction / constante).';
  const e=parAll().get(nm);
  // selfH._fxOf : porteur provisoire d'une commande en cours d'ÉDITION (copie de la fonction éditée)
  if(e&&!((e.kind==='dim'&&e.d===selfDim)||(e.kind==='param'&&e.p===selfParam)||(e.kind==='feat'&&((e.h===selfH&&e.k===selfK)||(selfH&&selfH._fxOf===e.h&&e.k===((selfH._fxKeys&&selfH._fxKeys[selfK])||selfK))))))return'Le nom « '+nm+' » est déjà utilisé.';
  return true;
}
function parRename(oldN,newN){
  try{if(typeof cfgRename==='function')cfgRename(oldN,newN);}catch(e){} // V0.8.4 : colonne de configuration
  // renomme partout dans les expressions (mot entier)
  if(!oldN||!newN||oldN===newN)return;
  const re=new RegExp('\\b'+oldN+'\\b','g');
  (doc.params||[]).forEach(p=>{if(p&&p.expr)p.expr=String(p.expr).replace(re,newN);});
  (doc.sketches||[]).forEach(sk=>(sk.dims||[]).forEach(d=>{if(d&&d.expr)d.expr=String(d.expr).replace(re,newN);}));
  parHolders().forEach(({h})=>{if(h.expr)Object.keys(h.expr).forEach(k=>{h.expr[k]=String(h.expr[k]).replace(re,newN);});});
}
function parFxSet(h,k,txt){
  // Saisie « [nom =] valeur|expression » sur une valeur de fonction 3D. Retour {ok,v}|{ok:false,msg}.
  // ok + v : la valeur numérique à appliquer (le code de la fonction l'applique lui-même).
  const s=String(txt==null?'':txt).trim();
  const mm=/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(s);
  const name=mm?mm[1]:null,expr=(mm?mm[2]:s).trim();
  if(!expr)return{ok:false,msg:'Valeur vide.'};
  if(name){const ok=parNameCheck(name,null,null,h,k);if(ok!==true)return{ok:false,msg:ok};}
  const oldN=h.pname&&h.pname[k],oldE=h.expr&&h.expr[k];
  const restore=()=>{if(oldN!==undefined){h.pname=h.pname||{};h.pname[k]=oldN;}else if(h.pname)delete h.pname[k];
    if(oldE!==undefined){h.expr=h.expr||{};h.expr[k]=oldE;}else if(h.expr)delete h.expr[k];if(h.exprErr)delete h.exprErr[k];};
  if(name&&oldN&&name!==oldN)parRename(oldN,name);
  if(name){h.pname=h.pname||{};h.pname[k]=name;}
  if(parIsNumber(expr)){if(h.expr)delete h.expr[k];return{ok:true,v:parseFloat(expr.replace(',','.'))};}
  h.expr=h.expr||{};h.expr[k]=expr;
  const before=h[k];
  // porteur hors document (commande en cours de création : congé, coque, répétition…) :
  // parResolve ne le voit pas, l'expression est évaluée ici avec les valeurs du document
  const inDoc=parHolders().some(x=>x.h===h);
  let v=NaN;
  try{const R=parResolve();if(!inDoc){v=parEval(expr,R.get);if(!isFinite(v))throw new Error('valeur non finie');}}
  catch(e){h.exprErr=h.exprErr||{};h.exprErr[k]=e.message;}
  if(h.exprErr&&h.exprErr[k]){const msg=h.exprErr[k];if(name&&oldN&&name!==oldN)parRename(name,oldN);restore();h[k]=before;return{ok:false,msg:'Expression : '+msg};}
  if(inDoc)v=parHolderVal(h,k);
  h[k]=before; // le code de la fonction applique la valeur (contrôles, nom, rejeu)
  return{ok:true,v};
}
function parFxCopy(src,dst,keys){
  // Reporte expression / nom ƒx d'un porteur provisoire (état d'une commande) vers la fonction
  // créée ou éditée. keys : ['angle'] ou {cléSource:cléCible}. Une valeur saisie en clair efface.
  if(!src||!dst)return dst;
  const M=Array.isArray(keys)?Object.fromEntries(keys.map(k=>[k,k])):keys;
  Object.keys(M).forEach(a=>{const b=M[a];
    const ex=src.expr&&src.expr[a],nm=src.pname&&src.pname[a];
    if(ex){dst.expr=dst.expr||{};dst.expr[b]=ex;}else if(dst.expr){delete dst.expr[b];if(!Object.keys(dst.expr).length)delete dst.expr;}
    if(nm){dst.pname=dst.pname||{};dst.pname[b]=nm;}
    if(dst.exprErr)delete dst.exprErr[b];});
  return dst;
}
function parFxFrom(f,dst,keys){
  // Inverse de parFxCopy : une commande ouverte en ÉDITION reprend les expressions de la fonction
  // (le champ affiche « nom = expression ») ; dst._fxOf évite que son propre nom soit « déjà utilisé ».
  if(!f||!dst)return dst;
  const M=Array.isArray(keys)?Object.fromEntries(keys.map(k=>[k,k])):keys;
  delete dst.expr;delete dst.pname;
  Object.keys(M).forEach(b=>{const a=M[b];
    if(f.expr&&f.expr[a]){dst.expr=dst.expr||{};dst.expr[b]=f.expr[a];}
    if(f.pname&&f.pname[a]){dst.pname=dst.pname||{};dst.pname[b]=f.pname[a];}});
  dst._fxOf=f;dst._fxKeys=M;
  return dst;
}
function parValueNow(nm){
  // valeur ACTUELLE d'un nom (sans réévaluer le document)
  const e=parAll().get(nm);if(!e)throw new Error('« '+nm+' » inconnu');
  if(e.kind==='param')return(e.p.value!=null&&isFinite(+e.p.value))?+e.p.value:parEval(e.p.expr,parValueNow);
  return e.kind==='feat'?parHolderVal(e.h,e.k):parDimUser(e.d);
}
function parFxNum(txt,h,k){
  // Lecture d'une saisie numérique : nombre, expression (L/2 + 3) ou, avec un porteur h/k,
  // « nom = expression » mémorisé comme parFx. Retour {ok,v}|{ok:false,msg}.
  const s=String(txt==null?'':txt).trim().replace(/\s*(mm|°|deg)\s*$/i,'');
  if(parIsNumber(s)){if(h&&h.expr&&h.expr[k])delete h.expr[k];return{ok:true,v:parseFloat(s.replace(',','.'))};}
  if(h)return parFxSet(h,k,s);
  if(/=/.test(s))return{ok:false,msg:'« nom = valeur » : nommer n’est possible que sur une valeur de fonction.'};
  try{return{ok:true,v:parEval(s,parValueNow)};}catch(e){return{ok:false,msg:e.message};}
}
function parFx(inp,h,k){
  // Branche un champ numérique de fonction 3D sur ƒx : appelé JUSTE APRÈS la création du champ
  // (avant ses propres gestionnaires) — une expression / « nom = » est mémorisée puis remplacée
  // par sa valeur numérique, que le gestionnaire existant applique comme d'habitude.
  if(!inp||!h)return inp;
  inp._parFx=1; // le filet global (parFxGlobal) laisse ce champ à son gestionnaire ƒx
  const ex=h.expr&&h.expr[k],nm=h.pname&&h.pname[k];
  if(ex||nm){inp.value=(nm?nm+' = ':'')+(ex||String(+parHolderVal(h,k).toFixed(4)).replace('.',','));
    inp.style.width=Math.max(parseInt(inp.style.width)||70,Math.min(240,8*inp.value.length+20))+'px';}
  inp.title=(inp.title?inp.title+' — ':'')+'ƒx : valeur, expression (L/2 + 3) ou « nom = valeur » pour la nommer';
  if(h.exprErr&&h.exprErr[k])inp.style.borderColor='#ff9f0a';
  const go=()=>{
    const s=String(inp.value).trim();
    if(inp._fxDone===s)return;
    if(parIsNumber(s)){if(h.expr&&h.expr[k]){delete h.expr[k];}inp._fxDone=s;return;}
    const r=parFxSet(h,k,s);
    if(!r.ok){try{faceEl.textContent='ƒx : '+r.msg;}catch(e){}inp.value=String(+parHolderVal(h,k).toFixed(4)).replace('.',',');inp._fxDone=inp.value;return;}
    inp.value=String(+r.v.toFixed(12)).replace('.',',');inp._fxDone=inp.value;
    try{faceEl.textContent='ƒx : '+(h.pname&&h.pname[k]?h.pname[k]+' = ':'')+(h.expr&&h.expr[k]?h.expr[k]+' → ':'')+(+r.v.toFixed(4));}catch(e){}
  };
  inp.addEventListener('change',go);inp.addEventListener('blur',go);
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  return inp;
}
function parDimInputText(d){
  // texte proposé dans la saisie : « nom = expression » / « nom = valeur » / expression / valeur
  const base=d.type==='angle'?String(+(d.value*180/Math.PI).toFixed(2)):String(+(+(d.dia?2*d.value:d.value)).toFixed(4));
  const rhs=(d.expr!=null&&String(d.expr).trim()!=='')?String(d.expr):base;
  return (d.name?d.name+' = ':'')+rhs;
}
function parDimCommit(sk,d,txt){
  // Applique une saisie « [nom =] valeur|expression » à la cote d. Retour {ok,nv}|{ok:false,msg}.
  const s=String(txt==null?'':txt).trim();
  const mm=/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(s);
  const name=mm?mm[1]:null,expr=(mm?mm[2]:s).trim().replace(/^[ØøR∠]\s*(?=[\d.,(-])/,''); // V0.11.23 : « Ø20 », « R5 », « ∠45 » acceptés tels qu'affichés
  if(!expr)return{ok:false,msg:'Valeur vide.'};
  if(name){const ok=parNameCheck(name,d,null);if(ok!==true)return{ok:false,msg:ok};}
  const old={name:d.name,expr:d.expr,value:d.value};
  const restore=()=>{if(old.name!==undefined)d.name=old.name;else delete d.name;if(old.expr!==undefined)d.expr=old.expr;else delete d.expr;d.value=old.value;delete d.exprErr;};
  if(name&&old.name&&name!==old.name)parRename(old.name,name);
  if(name)d.name=name;
  let f;
  if(parIsNumber(expr)){f=parseFloat(expr.replace(',','.'));delete d.expr;}
  else{
    d.expr=expr;
    try{parResolve();}catch(e){d.exprErr=e.message;}
    if(d.exprErr){const msg=d.exprErr;if(name&&old.name&&name!==old.name)parRename(name,old.name);restore();return{ok:false,msg:'Expression : '+msg};}
    f=parDimUser(d);
  }
  if(!isFinite(f)||f<=0||(d.type==='angle'&&f>=180)){if(name&&old.name&&name!==old.name)parRename(name,old.name);restore();return{ok:false,msg:'Valeur invalide.'};}
  return{ok:true,nv:parDimFromUser(d,f)};
}
function parDecor(id,str){
  // étiquette : « nom=valeur », « ƒx valeur », ⚠ si l'expression ne s'évalue plus
  const sk=(typeof skEdit!=='undefined')?skEdit:null;
  const d=sk&&(sk.dims||[]).find(x=>x.id===id);if(!d)return str;
  if(d.exprErr)str='⚠'+str;
  if(d.name)return d.name+'='+str;
  if(d.expr!=null&&String(d.expr).trim()!=='')return'ƒx '+str;
  return str;
}

/* ---------- fenêtre ƒx Paramètres ---------- */
function parAfterChange(){
  parApplyAll();
  try{if(typeof skEdit!=='undefined'&&skEdit){drawSketch2D();renderSkPanel();}}catch(e){}
  try{markDirty();rebuild();}catch(e){}
}
function openParamsDlg(){
  let ov=document.getElementById('parDlg');if(ov)ov.remove();
  if(!Array.isArray(doc.params))doc.params=[];
  try{parResolve();}catch(e){}
  ov=document.createElement('div');ov.id='parDlg';
  ov.style.cssText='position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center';
  const box=document.createElement('div');
  box.style.cssText='background:#1c1c20;color:#e8e8ea;border:1px solid #3a3a40;border-radius:10px;padding:14px 16px;min-width:560px;max-width:92vw;max-height:80vh;overflow:auto;font-size:13px;box-shadow:0 14px 40px rgba(0,0,0,.6)';
  ov.appendChild(box);
  const render=()=>{
    box.innerHTML='';
    const h=document.createElement('div');h.innerHTML='<b style="font-size:15px">ƒx Paramètres</b><div style="opacity:.7;margin:4px 0 10px">Nommez une cote en tapant « nom = valeur » dans sa saisie ; utilisez le nom dans d’autres cotes (« nom*2 », « (L-2*nom)/3 »). Angles en degrés.</div>';
    box.appendChild(h);
    const tbl=document.createElement('table');tbl.style.cssText='border-collapse:collapse;width:100%';
    tbl.innerHTML='<tr style="text-align:left;opacity:.7"><th style="padding:3px 6px">Nom</th><th style="padding:3px 6px">Expression</th><th style="padding:3px 6px">Valeur</th><th style="padding:3px 6px">Origine</th><th></th></tr>';
    const inpCss='background:#101012;color:#fff;border:1px solid #3a3a40;border-radius:5px;padding:3px 6px;width:100%;box-sizing:border-box';
    const row=(o)=>{
      const tr=document.createElement('tr');
      const td=()=>{const t=document.createElement('td');t.style.padding='3px 6px';tr.appendChild(t);return t;};
      const n=document.createElement('input');n.value=o.name||'';n.style.cssText=inpCss;n.placeholder='nom';td().appendChild(n);
      const x=document.createElement('input');x.value=o.expr;x.style.cssText=inpCss;td().appendChild(x);
      const v=td();v.textContent=o.err?('⚠ '+o.err):(isFinite(o.val)?String(+o.val.toFixed(12)).replace('.',',')+(o.unit||''):'');if(o.err)v.style.color='#ff9f0a';
      td().textContent=o.origin;
      const del=td();
      if(o.del){const b=document.createElement('button');b.textContent='🗑';b.title='Supprimer';b.onclick=()=>{o.del();parAfterChange();render();};del.appendChild(b);}
      n.onchange=()=>{const r=o.rename(n.value.trim());if(r!==true){alert(r);n.value=o.name||'';return;}parAfterChange();render();};
      x.onchange=()=>{const r=o.setExpr(x.value.trim());if(r!==true){alert(r);x.value=o.expr;return;}parAfterChange();render();};
      tbl.appendChild(tr);
    };
    (doc.params||[]).forEach(p=>row({name:p.name,expr:String(p.expr==null?'':p.expr),val:p.value,err:p.err,origin:'Paramètre',
      rename:nm=>{if(!nm)return'Nom requis.';const ok=parNameCheck(nm,null,p);if(ok!==true)return ok;parRename(p.name,nm);p.name=nm;return true;},
      setExpr:ex=>{if(!ex)return'Expression vide.';const o=p.expr;p.expr=ex;parResolve();if(p.err){const m=p.err;p.expr=o;parResolve();return'Expression : '+m;}return true;},
      del:()=>{doc.params=doc.params.filter(q=>q!==p);}}));
    (doc.sketches||[]).forEach(sk=>(sk.dims||[]).forEach(d=>{
      if(!d||(!d.name&&(d.expr==null||String(d.expr).trim()==='')))return;
      const unit=d.type==='angle'?'°':(d.dia||d.type==='diameter'?' (Ø)':'');
      row({name:d.name,expr:(d.expr!=null&&String(d.expr).trim()!=='')?String(d.expr):String(+parDimUser(d).toFixed(4)),val:parDimUser(d),unit,err:d.exprErr,origin:(sk.name||sk.id)+' · cote',
        rename:nm=>{if(!nm){delete d.name;return true;}const ok=parNameCheck(nm,d,null);if(ok!==true)return ok;parRename(d.name,nm);d.name=nm;return true;},
        setExpr:ex=>{const r=parDimCommit(sk,d,ex);if(!r.ok)return r.msg;d.value=r.nv;return true;}});
    }));
    // valeurs de fonctions 3D nommées ou en expression
    const featLbl={distance:'distance',draft:'dépouille',angle:'angle',dist:'distance',thick:'épaisseur',radius:'rayon',r:'rayon',d:'Ø',depth:'profondeur',cbD:'Ø lamage',cbH:'prof. lamage',csD:'Ø fraisure',len:'longueur filetée'};
    parHolders().forEach(({h,f})=>{
      const ks=new Set([...Object.keys(h.expr||{}),...Object.keys(h.pname||{})]);
      ks.forEach(k=>{
        if(!(h.expr&&h.expr[k])&&!(h.pname&&h.pname[k]))return;
        row({name:h.pname&&h.pname[k],expr:(h.expr&&h.expr[k])?String(h.expr[k]):String(+parHolderVal(h,k).toFixed(4)),val:parHolderVal(h,k),unit:/angle|draft/.test(k)?'°':'',err:h.exprErr&&h.exprErr[k],origin:(f.name||f.id)+' · '+(featLbl[k]||k),
          rename:nm=>{if(!nm){if(h.pname)delete h.pname[k];return true;}const ok=parNameCheck(nm,null,null,h,k);if(ok!==true)return ok;const o=h.pname&&h.pname[k];if(o)parRename(o,nm);h.pname=h.pname||{};h.pname[k]=nm;return true;},
          setExpr:ex=>{const r=parFxSet(h,k,ex);if(!r.ok)return r.msg;parHolderSet(h,k,r.v);return true;}});
      });
    });
    box.appendChild(tbl);
    // constantes toujours disponibles (lecture seule) : pi à 12 décimales
    const cst=document.createElement('div');cst.className='parConst';cst.style.cssText='margin-top:8px;opacity:.85';
    cst.innerHTML='<b>Constantes</b> (toujours disponibles) : <code>pi</code> = '+PAR_CONST.pi.toFixed(12).replace('.',',')+' — ex. « pi*D », « 2*pi*R », « D*pi/4 ».';
    box.appendChild(cst);
    try{cfgSection(box,render);}catch(e){} // V0.8.4 : configurations (52-configurations)
    const bar=document.createElement('div');bar.style.cssText='display:flex;gap:8px;justify-content:flex-end;margin-top:12px';
    const add=document.createElement('button');add.textContent='+ Paramètre';
    add.onclick=()=>{let k=1;while(parAll().has('P'+k))k++;doc.params.push({name:'P'+k,expr:'10',value:10});parAfterChange();render();};
    const close=document.createElement('button');close.textContent='Fermer';close.onclick=()=>ov.remove();
    bar.appendChild(add);bar.appendChild(close);box.appendChild(bar);
  };
  render();
  ov.addEventListener('mousedown',e=>{if(e.target===ov)ov.remove();});
  ov.addEventListener('keydown',e=>{if(e.key==='Escape'){ov.remove();}e.stopPropagation();});
  document.body.appendChild(ov);
}
/* ---------- ƒx partout (V0.11.15) ----------
   Filet global : tout champ NUMÉRIQUE de l'interface (FAO, assemblage, mise en plan, outils…)
   accepte une expression à la validation (Entrée / sortie du champ) : « L + 2 », « P1*3 »,
   « (L - 2*R)/3 », « 12,5 / 4 »… Elle est remplacée par sa valeur AVANT le gestionnaire du champ
   (écoute en phase de capture), qui applique un nombre comme d'habitude. Valeur figée : seuls les
   champs branchés par parFx (fonctions 3D et commandes qui les créent) gardent le lien.
   Champ numérique = champ texte dont la valeur à l'entrée était un nombre, ou inputMode décimal. */
function parFxEligible(t){
  if(!t||t.tagName!=='INPUT'||t._parFx||t.readOnly||t.disabled)return false;
  if(t.type!=='text'&&t.type!=='')return false;
  if(t.dataset&&t.dataset.nofx!=null)return false;
  try{if(t.closest&&t.closest('#parDlg'))return false;}catch(e){}
  return true;
}
function parNumKeys(i){
  // champ texte décimal qui remplace un type=number : ↑ / ↓ ajoutent / retirent le pas (i.step, défaut 1)
  if(!i||!i.addEventListener)return i;
  i.addEventListener('keydown',e=>{
    if(e.key!=='ArrowUp'&&e.key!=='ArrowDown')return;
    const v=parseFloat(String(i.value).replace(',','.'));if(!isFinite(v))return;
    const st=Math.abs(parseFloat(i.step))||1,n=v+(e.key==='ArrowUp'?st:-st);
    i.value=String(+n.toFixed(6));e.preventDefault();
    try{i.dispatchEvent(new Event('change',{bubbles:true}));}catch(e2){}
  });
  return i;
}
function parFxNumeric(t){return t.inputMode==='decimal'||t.inputMode==='numeric'||parIsNumber(t._fxPrev);}
function parFxGlobal(e){
  const t=e.target;
  if(e.type==='keydown'&&e.key!=='Enter')return;
  if(!parFxEligible(t)||!parFxNumeric(t))return;
  const s=String(t.value).trim();
  if(!s||parIsNumber(s)||s===t._fxLast||/=/.test(s))return; // « nom = … » : réservé aux champs parFx / cotes
  if(!/[A-Za-z_(+*\/^-]/.test(s.replace(/^\s*-/,'')))return;
  let v;
  try{v=parEval(s,parValueNow);}
  catch(err){
    // nom inconnu, parenthèse… : ne JAMAIS laisser parseFloat lire « 2*X » comme 2
    if(/[A-Za-z_]/.test(s)||/[+*\/^]/.test(s)){
      if(t._fxPrev!=null)t.value=t._fxPrev;
      try{faceEl.textContent='ƒx : '+err.message+' — valeur inchangée.';}catch(e2){}
    }
    return;
  }
  const out=String(+v.toFixed(12)); // 12 décimales (pi = 3.141592653590) ; point décimal : certains champs lisent parseFloat(valeur) brut
  t.value=out;t._fxLast=out;
  try{faceEl.textContent='ƒx : '+s+' → '+(+v.toFixed(4));}catch(e2){}
  try{t.dispatchEvent(new Event('input',{bubbles:true}));}catch(e2){} // champs à l'écoute de « input »
}
try{
  document.addEventListener('focusin',e=>{const t=e.target;if(parFxEligible(t)){t._fxPrev=t.value;t._fxLast=null;}},true);
  document.addEventListener('keydown',parFxGlobal,true);
  document.addEventListener('change',parFxGlobal,true);
}catch(e){}
// boutons ƒx : bandeau principal (après Perçage / Extrusion) et barre d'esquisse (avant ↩)
(function(){
  try{
    if(!document.getElementById('btnParams')){
      const ref=document.getElementById('btnHole')||document.getElementById('btnExtrude');
      if(ref&&ref.parentNode){const n=document.createElement('button');n.id='btnParams';n.textContent='ƒx Paramètres';
        n.title='Paramètres : cotes nommées (« nom = valeur » dans la saisie d’une cote) et paramètres libres, réutilisables dans les expressions des cotes.';
        ref.parentNode.insertBefore(n,ref.nextSibling);n.onclick=()=>openParamsDlg();}
    }
    if(!document.getElementById('skParams')){
      const u=document.getElementById('skUndo');
      if(u&&u.parentNode){const n=document.createElement('button');n.id='skParams';n.textContent='ƒx';
        n.title='Paramètres (cotes nommées, expressions)';u.parentNode.insertBefore(n,u);n.onclick=()=>openParamsDlg();}
    }
  }catch(e){}
})();
