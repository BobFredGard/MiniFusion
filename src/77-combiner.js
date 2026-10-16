/* ---------- Combiner des corps : union / soustraction / intersection (2026-10-16-009) ----------
   Fonction de la timeline {type:'combine', body:cible, tools:[corps outils], mode, keep}.
   Le rejeu (src/20) applique le booléen au corps CIBLE avec l'état des corps outils à cet
   endroit de la timeline ; sans « garder », les corps outils sont consommés (plus affichés). */
const COMBINE_MODES=[['union','⊕ Union (joindre)'],['cut','⊖ Soustraction (couper)'],['intersect','⊗ Intersection (garder le commun)']];
function combineName(f){
  const nm=id=>{const e=(doc.bodies||[]).find(b=>b.id===id);return e?e.name:id;};
  const m=(COMBINE_MODES.find(x=>x[0]===f.mode)||COMBINE_MODES[0])[1].replace(/ \(.*\)$/,'');
  return m+' : '+(f.tools||[]).map(nm).join(', ')+' → '+nm(f.body);
}
function combineBodySel(val,excl){
  const s=document.createElement('select');
  (doc.bodies||[]).forEach(b=>{if(excl&&excl.indexOf(b.id)>=0)return;const o=document.createElement('option');o.value=b.id;o.textContent=b.name;s.appendChild(o);});
  if(val)s.value=val;return s;
}
function combineRow(p,label,el){const l=document.createElement('label');l.textContent=label;l.appendChild(el);p.appendChild(l);return l;}
let combineNew=null;
function openCombine(){
  try{ensureBodies();}catch(e){}
  if((doc.bodies||[]).length<2){try{faceEl.textContent='Combiner : il faut au moins 2 corps (Création solide → Nouveau corps, ou extrusion « Nouveau corps »).';}catch(e){}return;}
  const act=doc.activeBody&&doc.bodies.some(b=>b.id===doc.activeBody)?doc.activeBody:doc.bodies[0].id;
  combineNew={body:act,tool:(doc.bodies.find(b=>b.id!==act)||{}).id,mode:'union',keep:false};
  sel={kind:null,id:null};renderCombineNew();
}
function renderCombineNew(){
  if(!combineNew)return;const c=combineNew;
  const p=$('props');p.innerHTML='';
  const h=document.createElement('div');h.style.fontSize='.83rem';
  h.innerHTML='<b>⊕ Combiner des corps</b><br><span class="note">Le corps CIBLE reçoit le résultat ; le corps OUTIL est consommé sauf si « garder » est coché.</span>';
  p.appendChild(h);
  const sT=combineBodySel(c.body);sT.onchange=()=>{c.body=sT.value;if(c.tool===c.body)c.tool=(doc.bodies.find(b=>b.id!==c.body)||{}).id;renderCombineNew();};combineRow(p,'Corps cible',sT);
  const sO=combineBodySel(c.tool,[c.body]);sO.onchange=()=>{c.tool=sO.value;};combineRow(p,'Corps outil',sO);
  const sM=document.createElement('select');COMBINE_MODES.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sM.appendChild(o);});sM.value=c.mode;sM.onchange=()=>{c.mode=sM.value;};combineRow(p,'Opération',sM);
  const kl=document.createElement('label');const k=document.createElement('input');k.type='checkbox';k.checked=!!c.keep;k.onchange=()=>{c.keep=k.checked;};kl.appendChild(k);kl.appendChild(document.createTextNode(' Garder le corps outil'));p.appendChild(kl);
  const row=document.createElement('div');row.className='row';row.style.marginTop='8px';
  const ok=document.createElement('button');ok.className='primary';ok.textContent='✔ Combiner';ok.onclick=combineNewOk;row.appendChild(ok);
  const no=document.createElement('button');no.textContent='✖ Annuler';no.onclick=()=>{combineNew=null;renderProps();};row.appendChild(no);
  p.appendChild(row);
}
function combineNewOk(){
  const c=combineNew;if(!c||!c.body||!c.tool||c.body===c.tool)return;
  const nf={id:uid('cb'),type:'combine',name:'',body:c.body,tools:[c.tool],mode:c.mode,keep:!!c.keep,visible:true};
  nf.name=combineName(nf);
  combineNew=null;addFeature(nf);
  sel={kind:'feature',id:nf.id};markDirty();rebuild();renderTree();renderProps();
}
function combineProps(p,f){
  const box=document.createElement('div');box.className='col';box.style.gap='4px';
  const apply=()=>{f.name=combineName(f);markDirty();rebuild();renderTree();renderProps();};
  const sT=combineBodySel(f.body);sT.onchange=()=>{f.body=sT.value;f.tools=(f.tools||[]).filter(t=>t!==f.body);if(!f.tools.length){const o=doc.bodies.find(b=>b.id!==f.body);if(o)f.tools=[o.id];}apply();};combineRow(box,'Corps cible',sT);
  const sO=combineBodySel((f.tools||[])[0],[f.body]);sO.onchange=()=>{f.tools=[sO.value];apply();};combineRow(box,'Corps outil',sO);
  const sM=document.createElement('select');COMBINE_MODES.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sM.appendChild(o);});sM.value=f.mode||'union';sM.onchange=()=>{f.mode=sM.value;apply();};combineRow(box,'Opération',sM);
  const kl=document.createElement('label');const k=document.createElement('input');k.type='checkbox';k.checked=!!f.keep;k.onchange=()=>{f.keep=k.checked;apply();};kl.appendChild(k);kl.appendChild(document.createTextNode(' Garder le corps outil'));box.appendChild(kl);
  p.appendChild(box);
}
// bouton (rangé dans « Modifier le solide » par 96-bandeau-groupes)
(function(){
  try{
    if(document.getElementById('btnCombine'))return;
    const ref=document.getElementById('btnRepeat')||document.getElementById('btnExtrude');
    if(!ref||!ref.parentNode)return;
    const b=document.createElement('button');b.id='btnCombine';b.textContent='⊕ Combiner';
    b.title='Combiner des corps : union, soustraction ou intersection';
    b.onclick=()=>openCombine();
    ref.parentNode.insertBefore(b,ref.nextSibling);
  }catch(e){}
})();
