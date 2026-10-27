/* ============ FAO : fiches outils + conditions de coupe par opération ============
   2026-10-15-010 — demande : « piloter la vitesse de rotation et l'avance, par outil
   et par opération, avec un onglet spécial outil ; une page outil plus grande avec la
   liste des outils à gauche et leurs paramètres à droite ; leur taille, zone de coupe,
   de dégagement, longueur sous mandrin… ; retrouver S et les avances travail,
   plongée, remontée, rapide. Modifier l'outil dans l'opération ne touche PAS sa
   fiche ; par défaut on prend les valeurs de la fiche au choix de l'outil. »

   MODÈLE — un outil (setup.tools[]) garde ses champs historiques (id, num, name, kind,
   d, cornerR, flutes, vc, fz) ; les nouveaux champs sont OPTIONNELS (défaut calculé) :
     géométrie : lc (longueur de coupe), dDeg/lDeg (Ø et longueur de dégagement),
                 dq (Ø queue), lsm (longueur sous mandrin), lt (longueur totale),
                 dPo (Ø du porte-outil / mandrin), mat (matière de l'outil)
     coupe     : fPl (plongée), fEnt (entrée/rampe), fRet (remontée), rapide (G0)
                 — S et F restent DÉRIVÉS de Vc et fz (S = Vc·1000/πD, F = fz·z·S) ;
                 saisir S ou F réécrit Vc ou fz.
   OPÉRATION — op.cut = SURCHARGES champ par champ {s,f,fPl,fEnt,fRet,rapide} : un champ
   absent HÉRITE de la fiche outil (une fiche modifiée se propage aux opérations qui
   n'ont pas surchargé ce champ). Changer d'outil dans l'opération efface op.cut : les
   valeurs de la nouvelle fiche s'appliquent. Les surcharges ne remontent JAMAIS dans
   la fiche.
   CACHE — les avances ne changent aucune trajectoire : la clé de cache des parcours ne
   voit que les champs historiques de l'outil et ignore op.cut (aucun recalcul).
   G-CODE — sorties IDENTIQUES par défaut (entrée = remontée = travail) ; une S
   différente entre deux opérations du même outil émet « S… » ; les mouvements
   d'entrée (rampe, hélice, arc d'approche) prennent F entrée, les remontées en G1
   F remontée, la 1re descente après un rapide F plongée (règle historique). */
const FAO_TOOL_LEGACY=['id','num','name','kind','d','cornerR','flutes','vc','fz'];
function faoToolKeyObj(t){
  // Sous-ensemble HISTORIQUE (ordre conservé) pour la clé de cache des parcours :
  // ajouter des champs aux fiches ne périme aucune trajectoire existante.
  const o={};if(!t)return o;
  FAO_TOOL_LEGACY.forEach(function(k){ if(t[k]!==undefined)o[k]=t[k]; });
  return o;
}
const faoR1=function(v){ return Math.round(v*10)/10; };
function faoToolDims(t){
  // Géométrie complète, défauts plausibles (fraise carbure monobloc) si non saisis.
  // Foret à centrer : D = Ø du CORPS d2 (= la queue), coupe courte au-dessus du cône 60°.
  const D=faoToolBodyD(t), ctr=!!(t&&t.kind==='center');
  const num=function(k,def){ const v=t&&+t[k]; return (isFinite(v)&&v>0)?{v:v,def:false}:{v:def,def:true}; };
  const tp=ctr?faoToolTipProfile(t):null;
  const lc=num('lc',ctr?faoR1(tp[tp.length-1][1]+D*0.4):faoR1(Math.max(D*2.5,3)));
  const dDeg=num('dDeg',D);
  const lDeg=num('lDeg',lc.v);
  const QS=[6,8,10,12,16,20,25,32]; // queues standard (mm)
  const dq=num('dq',ctr?D:(QS.find(function(q){return q>=D;})||Math.ceil(D)));
  const lsm=num('lsm',faoR1(Math.max(lDeg.v+Math.max(8,D),D*3.5)));
  const lt=num('lt',faoR1(Math.max(lsm.v+Math.max(25,dq.v*2.5),50)));
  const dPo=num('dPo',faoR1(dq.v+Math.max(12,dq.v)));
  return {D:D,lc:lc,dDeg:dDeg,lDeg:lDeg,dq:dq,lsm:lsm,lt:lt,dPo:dPo};
}
function faoToolCut(t,setup){
  // Conditions de coupe de la FICHE (valeurs par défaut de toute opération).
  const sf=faoToolSF(t||{},setup);
  const pos=function(k){ const v=t&&+t[k]; return (isFinite(v)&&v>0)?Math.round(v):null; };
  return {s:sf.s,f:sf.f,
    plunge:pos('fPl')||sf.plunge,
    entry:pos('fEnt')||sf.f,
    retract:pos('fRet')||sf.f,
    rapid:pos('rapide')||faoRapide(setup)};
}
const FAO_CUT_FIELDS=[ // [clé op.cut, clé résultat, libellé, aide]
  ['s','s','S (tr/min)','Vitesse de rotation de la broche.'],
  ['f','f','F travail','Avance de coupe (mm/min) : passes, contours, balayages.'],
  ['fPl','plunge','F plongée','Avance de la 1re descente après un rapide (mm/min), et des cycles de perçage.'],
  ['fEnt','entry','F entrée','Avance des mouvements d’entrée : rampe, hélice, arc d’approche (mm/min).'],
  ['fRet','retract','F remontée','Avance des remontées en G1 (sortie de matière en Z, mm/min).'],
  ['rapide','rapid','Rapide G0','Vitesse des déplacements rapides (mm/min) — sert à l’estimation du temps ; la machine fait ses G0 à sa propre vitesse.']
];
function faoOpCutting(op,setup){
  // Conditions EFFECTIVES d'une opération : surcharge op.cut sinon fiche outil.
  const t=faoToolById(setup,op&&op.toolId);
  const b=faoToolCut(t,setup);
  const c=(op&&op.cut&&typeof op.cut==='object')?op.cut:{};
  const out={src:{}};
  FAO_CUT_FIELDS.forEach(function(F){
    const v=+c[F[0]];
    if(isFinite(v)&&v>0){ out[F[1]]=Math.round(v); out.src[F[1]]='op'; }
    else{ out[F[1]]=b[F[1]]; out.src[F[1]]='fiche'; }
  });
  const D=(t&&+t.d>0)?+t.d:10;
  out.vc=Math.round(out.s*Math.PI*D/1000);
  out.tool=t;
  return out;
}
function faoToolNewFrom(t,n){
  const c=JSON.parse(JSON.stringify(t||{kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06}));
  c.id='T'+n+'_'+Date.now().toString(36);c.num=n;
  c.name=t?((t.name||'Outil')+' (copie)').slice(0,32):'Fraise D10';
  return c;
}
/* ----- schéma coté de l'outil (vue de profil) ----- */
function faoToolSvg(t){
  const g=faoToolDims(t),D=g.D;
  const cr=faoToolEffCr(t);
  const W=300,H=360,pad=44;
  // échelle : longueur totale + porte-outil sur la hauteur, Ø porte-outil sur la largeur
  const holderH=Math.max(g.dPo.v*0.9,18);
  const totH=g.lsm.v+holderH;
  const sc=Math.min((H-2*pad)/totH,(W-150)/Math.max(g.dPo.v,D));
  const cx=110,yTip=H-pad;
  const Y=function(z){ return yTip-z*sc; };
  const X=function(r){ return cx+r*sc; };
  const parts=[];
  const rect=function(r,z0,z1,fill,stroke,dash){
    parts.push('<rect x="'+X(-r).toFixed(1)+'" y="'+Y(z1).toFixed(1)+'" width="'+(2*r*sc).toFixed(1)+'" height="'+((z1-z0)*sc).toFixed(1)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.2"'+(dash?' stroke-dasharray="3 2"':'')+'/>');
  };
  // porte-outil (mandrin) au-dessus de la longueur sous mandrin
  rect(g.dPo.v/2,g.lsm.v,g.lsm.v+holderH,'rgba(142,142,147,.25)','#8e8e93',true);
  // queue
  rect(g.dq.v/2,g.lDeg.v,g.lsm.v,'rgba(100,210,255,.12)','#64d2ff');
  // dégagement (col)
  if(g.lDeg.v>g.lc.v+1e-6)rect(g.dDeg.v/2,g.lc.v,g.lDeg.v,'rgba(100,210,255,.08)','#64d2ff');
  // partie coupante (avec bout plat / torique / boule)
  const r=D/2,c2=Math.min(cr,r);
  const p=[];
  const tp=faoToolTipProfile(t);
  let zFl=0; // bas des hélices (au-dessus de la pointe d'un foret)
  if(tp){
    // 2026-10-22-001 : profil réel — cône du foret / foret à pointer, pilote + cône 60°
    // du foret à centrer (DIN 333 A) ; le contour monte par la droite et redescend à gauche.
    const top=g.lc.v; // profil écrêté à la longueur de coupe
    const q=tp.map(function(p){ return [p[0],Math.min(p[1],top)]; });
    const pr=q.map(function(p){ return 'L'+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1); });
    const pl=q.slice().reverse().map(function(p){ return 'L'+X(-p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1); });
    parts.push('<path d="M'+X(-r).toFixed(1)+' '+Y(g.lc.v).toFixed(1)+' '+pl.join(' ')+' '+pr.join(' ')+' L'+X(r).toFixed(1)+' '+Y(g.lc.v).toFixed(1)+'Z" fill="rgba(255,159,10,.28)" stroke="#ff9f0a" stroke-width="1.4"/>');
    zFl=q[q.length-1][1];
    const a=q[1];
    parts.push('<text x="'+(X(a[0])+4).toFixed(1)+'" y="'+(Y(a[1]/2)+4).toFixed(1)+'" fill="#ff9f0a" font-size="10">'+faoToolAngle(t)+'°</text>');
    if(t.kind==='center'){
      const b=q[2],c=q[3];
      parts.push('<text x="'+(X((b[0]+c[0])/2)+6).toFixed(1)+'" y="'+(Y((b[1]+c[1])/2)+4).toFixed(1)+'" fill="#ff9f0a" font-size="10">60°</text>');
      parts.push('<text x="'+(X(-b[0])-6).toFixed(1)+'" y="'+(Y(b[1]/2)+4).toFixed(1)+'" fill="#ff9f0a" font-size="10" text-anchor="end">Ø'+faoR1(2*b[0])+'</text>');
    }
  }else{
  p.push('M'+X(-r).toFixed(1)+' '+Y(g.lc.v).toFixed(1));
  p.push('L'+X(-r).toFixed(1)+' '+Y(c2).toFixed(1));
  if(c2>0)p.push('A'+(c2*sc).toFixed(1)+' '+(c2*sc).toFixed(1)+' 0 0 0 '+X(-r+c2).toFixed(1)+' '+Y(0).toFixed(1));
  p.push('L'+X(r-c2).toFixed(1)+' '+Y(0).toFixed(1));
  if(c2>0)p.push('A'+(c2*sc).toFixed(1)+' '+(c2*sc).toFixed(1)+' 0 0 0 '+X(r).toFixed(1)+' '+Y(c2).toFixed(1));
  p.push('L'+X(r).toFixed(1)+' '+Y(g.lc.v).toFixed(1)+'Z');
  parts.push('<path d="'+p.join(' ')+'" fill="rgba(255,159,10,.28)" stroke="#ff9f0a" stroke-width="1.4"/>');
  }
  // hélices (décor)
  for(let k=1;k<4;k++){const z=zFl+(g.lc.v-zFl)*k/4;parts.push('<path d="M'+X(-r).toFixed(1)+' '+Y(z).toFixed(1)+' L'+X(r).toFixed(1)+' '+Y(Math.min(g.lc.v,z+Math.min(D,g.lc.v/4))).toFixed(1)+'" stroke="rgba(255,159,10,.45)" stroke-width="1"/>');}
  // cotes verticales à droite
  const dimV=function(z0,z1,x,txt,col){
    const a=Y(z0),b=Y(z1);
    parts.push('<line x1="'+x+'" y1="'+a.toFixed(1)+'" x2="'+x+'" y2="'+b.toFixed(1)+'" stroke="'+col+'" stroke-width="1"/>');
    parts.push('<path d="M'+(x-3)+' '+(a-5).toFixed(1)+' L'+x+' '+a.toFixed(1)+' L'+(x+3)+' '+(a-5).toFixed(1)+' M'+(x-3)+' '+(b+5).toFixed(1)+' L'+x+' '+b.toFixed(1)+' L'+(x+3)+' '+(b+5).toFixed(1)+'" fill="none" stroke="'+col+'" stroke-width="1"/>');
    parts.push('<text x="'+(x+5)+'" y="'+((a+b)/2+4).toFixed(1)+'" fill="'+col+'" font-size="11">'+txt+'</text>');
  };
  const xr=X(Math.max(g.dPo.v,D)/2)+14;
  dimV(0,g.lc.v,xr,'Lc '+g.lc.v,'#ff9f0a');
  if(g.lDeg.v>g.lc.v+1e-6)dimV(0,g.lDeg.v,xr+52,'Ldég '+g.lDeg.v,'#64d2ff');
  dimV(0,g.lsm.v,xr+(g.lDeg.v>g.lc.v+1e-6?104:52),'Lsm '+g.lsm.v,'#e9e9ec');
  // cote Ø au bout
  const yb=Y(0)+16;
  parts.push('<line x1="'+X(-r).toFixed(1)+'" y1="'+yb+'" x2="'+X(r).toFixed(1)+'" y2="'+yb+'" stroke="#ff9f0a" stroke-width="1"/>');
  parts.push('<text x="'+cx+'" y="'+(yb+13)+'" fill="#ff9f0a" font-size="11" text-anchor="middle">Ø'+D+(c2>0&&c2<r?(' R'+faoR1(c2)):'')+'</text>');
  parts.push('<text x="'+cx+'" y="'+(Y(g.lsm.v+holderH)-6).toFixed(1)+'" fill="#8e8e93" font-size="10" text-anchor="middle">mandrin Ø'+g.dPo.v+'</text>');
  return '<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" style="display:block">'+parts.join('')+'</svg>';
}
/* ----- bibliothèque : liste à gauche, fiche à droite ----- */
let faoToolSelId=null;
function faoToolsElement(setup){
  const wrap=document.createElement('div');wrap.className='fao-tl';
  const tools=setup.tools||(setup.tools=[]);
  if(!tools.some(function(t){return t.id===faoToolSelId;}))faoToolSelId=tools[0]?tools[0].id:null;
  const rerender=function(){ try{ wrap.parentNode&&faoToolsWindowRefresh(); }catch(e){} };
  // ── colonne gauche : liste ──
  const L=document.createElement('div');L.className='fao-tl-list';
  tools.forEach(function(t){
    const it=document.createElement('div');it.className='fao-tl-it'+(t.id===faoToolSelId?' on':'');
    const nOps=((setup.ops)||[]).filter(function(o){return o&&o.toolId===t.id;}).length;
    const a=document.createElement('div');a.className='fao-tl-n';a.textContent='T'+t.num+'  '+(t.name||'');
    const b=document.createElement('div');b.className='fao-tl-s';
    const sf=faoToolCut(t,setup);
    b.textContent=faoKindLabel(t.kind)+' Ø'+t.d+(t.kind==='bull'?(' R'+(t.cornerR||0)):'')+' · S'+sf.s+' F'+sf.f+(nOps?(' · '+nOps+' op'):'');
    it.appendChild(a);it.appendChild(b);
    it.onclick=function(){ faoToolSelId=t.id; rerender(); };
    L.appendChild(it);
  });
  const lb=document.createElement('div');lb.className='fao-tl-btns';
  const mkB=function(txt,title,fn){const x=document.createElement('button');x.className='fao-mini';x.textContent=txt;x.title=title;x.onclick=fn;lb.appendChild(x);return x;};
  mkB('+ Nouveau','Ajouter un outil (fraise Ø10 par défaut)',function(){
    faoSnapshot('nouvel outil');const n=tools.reduce(function(m,t){return Math.max(m,+t.num||0);},0)+1;
    const t=faoToolNewFrom(null,n);t.name='Fraise D10';tools.push(t);faoToolSelId=t.id;faoChanged();rerender();});
  mkB('⧉ Dupliquer','Copier l’outil sélectionné',function(){
    const s=tools.find(function(t){return t.id===faoToolSelId;});if(!s)return;
    faoSnapshot('dupliquer l’outil');const n=tools.reduce(function(m,t){return Math.max(m,+t.num||0);},0)+1;
    const t=faoToolNewFrom(s,n);tools.push(t);faoToolSelId=t.id;faoChanged();rerender();});
  mkB('✕ Supprimer','Supprimer l’outil (impossible s’il est utilisé par une opération ou s’il est le dernier)',function(){
    const i=tools.findIndex(function(t){return t.id===faoToolSelId;});if(i<0||tools.length<=1)return;
    const used=(setup.ops||[]).filter(function(o){return o&&o.toolId===tools[i].id;}).length;
    if(used){try{faceEl.textContent='Outil T'+tools[i].num+' utilisé par '+used+' opération(s) : changez-leur d’outil avant de le supprimer.';}catch(e){}return;}
    faoSnapshot('supprimer l’outil');tools.splice(i,1);faoToolSelId=tools[0]?tools[0].id:null;faoChanged();rerender();});
  const left=document.createElement('div');left.className='fao-tl-left';
  left.appendChild(L);left.appendChild(lb);
  wrap.appendChild(left);
  // ── colonne droite : fiche ──
  const t=tools.find(function(x){return x.id===faoToolSelId;});
  const R=document.createElement('div');R.className='fao-tl-detail';
  if(!t){R.textContent='Aucun outil.';wrap.appendChild(R);return wrap;}
  const g=faoToolDims(t),cut=faoToolCut(t,setup),sf=faoToolSF(t,setup);
  const set=function(k,v,title){ faoSnapshot(title||k); if(v===null||v===''||!(isFinite(+v)))delete t[k]; else t[k]=+v; };
  const field=function(parent,lab,val,isDef,fn,title,step,unit){
    const p=document.createElement('label');p.className='fao-tl-f'+(isDef?' def':'');p.title=title||lab;
    const s=document.createElement('span');s.textContent=lab;p.appendChild(s);
    const i=document.createElement('input');i.type='text';i.inputMode='decimal';i.className='fao-in fao-num';i.value=String(+(+val).toFixed(4));
    if(step)i.step=step;
    i.onchange=function(){const v=parseFloat(String(i.value).replace(',','.'));if(isFinite(v)&&v>0){fn(v);faoChanged();rerender();}};
    parNumKeys(i);
    p.appendChild(i);
    if(unit){const u=document.createElement('em');u.textContent=unit;p.appendChild(u);}
    parent.appendChild(p);return i;
  };
  const sec=function(title){const h=document.createElement('div');h.className='fao-tl-h';h.textContent=title;R.appendChild(h);
    const b=document.createElement('div');b.className='fao-tl-grid';R.appendChild(b);return b;};
  // identification
  const s1=sec('Identification');
  const pN=document.createElement('label');pN.className='fao-tl-f';pN.title='Numéro d’outil (T) dans le magasin';
  pN.innerHTML='<span>T n°</span>';const iN=document.createElement('input');iN.type='number';iN.className='fao-in';iN.value=t.num;
  iN.onchange=function(){const v=Math.round(+iN.value);if(v>0){faoSnapshot('numéro d’outil');t.num=v;faoChanged();rerender();}};pN.appendChild(iN);s1.appendChild(pN);
  const pT=document.createElement('label');pT.className='fao-tl-f wide';pT.innerHTML='<span>Nom</span>';
  const iT=document.createElement('input');iT.type='text';iT.className='fao-in';iT.value=t.name||'';
  iT.onchange=function(){faoSnapshot('nom d’outil');t.name=String(iT.value||t.name).slice(0,32);faoChanged();rerender();};pT.appendChild(iT);s1.appendChild(pT);
  const pK=document.createElement('label');pK.className='fao-tl-f';pK.innerHTML='<span>Type</span>';
  const sK=document.createElement('select');sK.className='fao-sel';
  [['flat','Cylindrique'],['bull','Torique'],['ball','Boule'],['chamfer','Fraise à chanfreiner'],['drill','Foret'],['spot','Foret à pointer'],['center','Foret à centrer'],['tap','Taraud']].forEach(function(o){const e=document.createElement('option');e.value=o[0];e.textContent=o[1];sK.appendChild(e);});
  sK.value=t.kind||'flat';
  sK.onchange=function(){faoSnapshot('type d’outil');t.kind=sK.value;if(t.kind==='ball')t.cornerR=t.d/2;else if(t.kind!=='bull')t.cornerR=0;
    if(faoToolIsDrill(t)&&!(+t.ang>0))t.ang=t.kind==='spot'?90:118;
    if(t.kind==='chamfer'){ if(!(+t.ang>0))t.ang=90; if(!(+t.dt>=0))t.dt=0.5; }faoChanged();rerender();};
  pK.appendChild(sK);s1.appendChild(pK);
  const pM=document.createElement('label');pM.className='fao-tl-f';pM.innerHTML='<span>Matière</span>';
  const sM=document.createElement('select');sM.className='fao-sel';
  ['Carbure','Carbure revêtu','ARS / HSS','Plaquettes'].forEach(function(o){const e=document.createElement('option');e.value=o;e.textContent=o;sM.appendChild(e);});
  sM.value=t.mat||'Carbure';sM.onchange=function(){faoSnapshot('matière d’outil');t.mat=sM.value;faoChanged();};
  pM.appendChild(sM);s1.appendChild(pM);
  // géométrie
  const s2=sec('Géométrie (mm) — valeurs grisées = défaut calculé, à préciser');
  field(s2,t.kind==='center'?'Ø pilote d1':'Ø coupe',t.d,false,function(v){set('d',Math.max(0.1,v),'Ø outil');if(t.kind==='ball')t.cornerR=t.d/2;},'Diamètre de coupe',0.1);
  if(t.kind==='bull')field(s2,'Rayon de coin',t.cornerR||0,false,function(v){set('cornerR',Math.min(v,t.d/2),'rayon de coin');},'Rayon du coin torique',0.1);
  if(t.kind==='tap'){
    const pT=document.createElement('label');pT.className='fao-tl-f';pT.innerHTML='<span>Filet</span>';
    const sT=document.createElement('select');sT.className='fao-sel';
    ISO_THREADS.forEach(function(q){for(let k=2;k<q.length;k++){const e=document.createElement('option');e.value=q[0]+'|'+q[k];e.textContent=q[0]+(k>2?('×'+q[k]):'')+' (pas '+q[k]+')';sT.appendChild(e);}});
    sT.value=(t.size||'M8')+'|'+(t.p||1.25);
    sT.onchange=function(){const q=sT.value.split('|');faoSnapshot('filet du taraud');t.size=q[0];t.p=+q[1];const T=isoThread(q[0]);if(T)t.d=T[1];t.name='Taraud '+holeThreadLabel({size:t.size,p:t.p});faoChanged();rerender();};
    pT.appendChild(sT);s2.appendChild(pT);
  }
  if(faoToolIsDrill(t))field(s2,'Angle de pointe',faoToolAngle(t),!(+t.ang>0),function(v){set('ang',Math.min(179,Math.max(30,v)),'angle de pointe');},
    t.kind==='center'?'Angle de pointe du pilote (°) : 118 (DIN 333) — le cône de centrage fait 60°':'Angle de pointe du foret (°) : 118 / 135 / 140 ; foret à pointer 90 (ou 120)',1,'°');
  if(t.kind==='center'){
    const cd=faoCenterDims(t);
    field(s2,'Ø corps d2',cd.d2,!(+t.d2>0),function(v){set('d2',Math.max(v,(+t.d||1)*1.05),'Ø du corps');},'Diamètre du corps (fin du cône 60°) — défaut DIN 333 forme A',0.05);
    field(s2,'Long. pilote',cd.lp,!(+t.lp>0),function(v){set('lp',v,'longueur du pilote');},'Longueur du pilote d1 depuis la pointe jusqu’au début du cône 60° — défaut DIN 333 forme A',0.1);
  }
  if(t.kind==='chamfer'){ // V0.7.9
    field(s2,'Angle',faoToolAngle(t),!(+t.ang>0),function(v){set('ang',Math.min(150,Math.max(30,v)),'angle de la fraise à chanfreiner');},'Angle inclus du cône (°) : 90 pour un chanfrein à 45°, 60, 120…',1,'°');
    field(s2,'Ø de pointe',isFinite(+t.dt)?+t.dt:0.5,!(+t.dt>=0),function(v){set('dt',Math.max(0,Math.min(v,(+t.d||6)*0.9)),'Ø de pointe');},'Diamètre du méplat en bout de la fraise à chanfreiner (0 = pointe vive)',0.1);
  }
  field(s2,'Dents',t.flutes||2,false,function(v){set('flutes',Math.max(1,Math.round(v)),'nombre de dents');},'Nombre de dents (sert au calcul de F = fz × z × S)',1);
  field(s2,'Long. de coupe Lc',g.lc.v,g.lc.def,function(v){set('lc',v,'longueur de coupe');},'Longueur de la partie coupante (hélices) depuis le bout',0.5);
  field(s2,'Ø dégagement',g.dDeg.v,g.dDeg.def,function(v){set('dDeg',Math.min(v,t.d),'Ø de dégagement');},'Diamètre du col au-dessus de la coupe (≤ Ø coupe) : permet de plonger plus profond que Lc sans frotter',0.1);
  field(s2,'Long. dégagée',g.lDeg.v,g.lDeg.def,function(v){set('lDeg',Math.max(v,g.lc.v),'longueur dégagée');},'Longueur depuis le bout jusqu’au début de la queue (profondeur atteignable sans que la queue frotte)',0.5);
  field(s2,'Ø queue',g.dq.v,g.dq.def,function(v){set('dq',v,'Ø de queue');},'Diamètre de la queue (serrage)',0.5);
  field(s2,'Long. sous mandrin',g.lsm.v,g.lsm.def,function(v){set('lsm',v,'longueur sous mandrin');},'Longueur qui dépasse du porte-outil (sortie d’outil) : profondeur maximale avant collision du mandrin',0.5);
  field(s2,'Long. totale',g.lt.v,g.lt.def,function(v){set('lt',v,'longueur totale');},'Longueur totale de l’outil',0.5);
  field(s2,'Ø mandrin',g.dPo.v,g.dPo.def,function(v){set('dPo',v,'Ø du porte-outil');},'Diamètre du porte-outil / mandrin au nez',0.5);
  // coupe
  const s3=sec('Conditions de coupe — valeurs par défaut des opérations');
  const D=+t.d>0?+t.d:10,z=+t.flutes>0?Math.round(+t.flutes):2;
  field(s3,'Vc',t.vc||250,false,function(v){set('vc',v,'Vc');},'Vitesse de coupe (m/min) — S = Vc × 1000 / (π × Ø)',1,'m/min');
  field(s3,'S',sf.s,false,function(v){set('vc',+(v*Math.PI*D/1000).toFixed(2),'S (via Vc)');},'Vitesse de rotation (tr/min) — saisir S recalcule Vc',10,'tr/min');
  if(t.kind==='tap'){
    const nt=document.createElement('span');nt.className='fao-meta';nt.textContent='F = pas × S = '+(t.p||'?')+' × '+sf.s+' = '+sf.f+' mm/min (imposée par le filet)';s3.appendChild(nt);
  }else if(faoToolIsDrill(t)){
    field(s3,'f par tour',faoToolFr(t),!(+t.fr>0),function(v){set('fr',v,'avance par tour');},'Avance par tour du foret (mm/tr) — F = f × S',0.005,'mm/tr');
    field(s3,'F perçage',sf.f,false,function(v){set('fr',+(v/sf.s).toFixed(4),'F (via f/tr)');},'Avance de perçage (mm/min) — saisir F recalcule f/tr',10,'mm/min');
  }else{
  field(s3,'fz',t.fz||0.05,false,function(v){set('fz',v,'fz');},'Avance par dent (mm) — F = fz × dents × S',0.005,'mm/dt');
  field(s3,'F travail',sf.f,false,function(v){set('fz',+(v/(z*sf.s)).toFixed(4),'F (via fz)');},'Avance de coupe (mm/min) — saisir F recalcule fz',10,'mm/min');
  }
  field(s3,'F plongée',cut.plunge,!(+t.fPl>0),function(v){set('fPl',v,'F plongée');},'Avance de plongée (mm/min). Défaut : '+faoPlungePct(setup)+' % de F travail (posage)',10,'mm/min');
  field(s3,'F entrée',cut.entry,!(+t.fEnt>0),function(v){set('fEnt',v,'F entrée');},'Avance des entrées : rampe, hélice, arc d’approche (mm/min). Défaut : F travail',10,'mm/min');
  field(s3,'F remontée',cut.retract,!(+t.fRet>0),function(v){set('fRet',v,'F remontée');},'Avance des remontées en G1 (mm/min). Défaut : F travail',10,'mm/min');
  field(s3,'Rapide G0',cut.rapid,!(+t.rapide>0),function(v){set('rapide',v,'rapide');},'Vitesse des rapides pour l’estimation du temps (mm/min). Défaut : celle du posage',100,'mm/min');
  const rz=document.createElement('div');rz.className='fao-tl-btns';
  const bz=document.createElement('button');bz.className='fao-mini';bz.textContent='↺ Avances par défaut';
  bz.title='Remet F plongée / entrée / remontée / rapide sur leurs valeurs calculées';
  bz.onclick=function(){faoSnapshot('avances par défaut');['fPl','fEnt','fRet','rapide'].forEach(function(k){delete t[k];});faoChanged();rerender();};
  rz.appendChild(bz);R.appendChild(rz);
  const body=document.createElement('div');body.className='fao-tl-body';
  body.appendChild(R);
  const pic=document.createElement('div');pic.className='fao-tl-pic';pic.innerHTML=faoToolSvg(t);
  body.appendChild(pic);
  wrap.appendChild(body);
  return wrap;
}
function faoToolsWindowRefresh(){
  try{
    if(!faoToolsWin||!faoToolsWinBody)return;
    const setup=faoSetup();
    const keep=faoToolsWinBody.scrollTop;
    faoToolsWinBody.innerHTML='';faoToolsWinBody.appendChild(faoToolsElement(setup));
    faoToolsWinBody.scrollTop=keep;
  }catch(e){}
}
function faoToolsOpenOn(toolId){
  // « Modifier la fiche » depuis une opération : ouvre la bibliothèque sur CET outil.
  faoToolSelId=toolId||faoToolSelId;
  if(faoToolsWin)faoToolsWindowRefresh();else faoToolsWindowOpen();
  try{ if(faoToolsWin)faoToolsWin.classList.add('fao-toolwin'); }catch(e){}
}
/* ----- fiche d'opération : onglet « Outil » ----- */
function faoOpToolSection(setup,op){
  const box=document.createElement('div');
  box.appendChild(faoH('Outil et conditions de coupe'));
  const t=faoToolById(setup,op.toolId);
  const C=faoOpCutting(op,setup);
  const g=faoToolDims(t);
  const r0=faoRow();
  r0.appendChild(faoLab('Outil'));
  r0.appendChild(faoSel(faoToolOpts(setup),op.toolId,function(v){ op.toolId=v; delete op.cut; },
    'Outil de l’opération — en changer reprend les vitesses et avances de SA fiche'));
  r0.appendChild(faoMini('Fiche…',function(){ faoToolsOpenOn(op.toolId); },'Ouvrir la fiche de cet outil dans la bibliothèque'));
  box.appendChild(r0);
  const info=document.createElement('div');info.className='fao-meta';
  info.textContent=faoKindLabel(t.kind)+' Ø'+t.d+(t.kind==='bull'?(' R'+(t.cornerR||0)):'')+' · '+(t.flutes||2)+' dents · Lc '+g.lc.v+' · sous mandrin '+g.lsm.v+' mm · Vc '+C.vc+' m/min';
  box.appendChild(info);
  FAO_CUT_FIELDS.forEach(function(F){
    const r=faoRow();
    r.appendChild(faoLab(F[2]));
    const isOp=C.src[F[1]]==='op';
    const inp=faoNum(C[F[1]],function(v){
      if(!(v>0))return;
      if(!op.cut||typeof op.cut!=='object')op.cut={};
      op.cut[F[0]]=Math.round(v);
    },60,F[0]==='rapide'?100:10,F[3]+' — modifié ici, il ne vaut que pour cette opération (la fiche outil reste inchangée).');
    if(!isOp)inp.style.opacity='0.62';
    r.appendChild(inp);
    const tag=document.createElement('span');tag.className='fao-meta';
    tag.textContent=isOp?'opération':'fiche';
    tag.style.color=isOp?'#ff9f0a':'';
    r.appendChild(tag);
    if(isOp)r.appendChild(faoMini('↺',function(){ if(op.cut){ delete op.cut[F[0]]; if(!Object.keys(op.cut).length)delete op.cut; } },
      'Revenir à la valeur de la fiche outil'));
    box.appendChild(r);
  });
  // portée de l'outil : profondeur atteinte vs longueurs de la fiche
  try{
    const w=faoOpReachWarn(op,setup,t,g);
    if(w){const n=document.createElement('div');n.className='fao-note';n.textContent=w;box.appendChild(n);}
  }catch(e){}
  return box;
}
function faoOpReachWarn(op,setup,t,g){
  // Profondeur usinée (dessus du brut → Z le plus bas en coupe) comparée à la
  // longueur de coupe, à la longueur dégagée et à la sortie sous mandrin.
  const mv=(typeof faoMovesStat==='function')?faoMovesStat(op,setup):null;
  if(!mv||!mv.length)return null;
  // repère 3+2 : profondeur mesurée le long du Z de l'OPÉRATION, depuis le brut qu'elle voit
  let fr=null;try{fr=faoOpFrame(setup,op);}catch(e){fr=null;}
  const zOf=function(m){return fr?faoToF(fr,faoToW(fr.P,[+m.x,+m.y,+m.z]))[2]:+m.z;};
  let zmin=Infinity;
  for(let i=0;i<mv.length;i++){const m=mv[i];if(m&&!m.r&&isFinite(+m.z)){const z=zOf(m);if(z<zmin)zmin=z;}}
  if(!isFinite(zmin))return null;
  let top=null;try{const st=fr?faoOpView(setup,op).stock:faoStock();top=(st&&isFinite(+st.z1))?+st.z1:null;}catch(e){}
  if(top===null||!isFinite(top))return null;
  const prof=faoR1(top-zmin);
  if(prof>g.lsm.v)return '⚠ Profondeur usinée '+prof+' mm > longueur sous mandrin '+g.lsm.v+' mm : COLLISION du mandrin — sortez l’outil ou changez d’outil.';
  if(prof>g.lDeg.v)return '⚠ Profondeur usinée '+prof+' mm > longueur dégagée '+g.lDeg.v+' mm : la queue (Ø'+g.dq.v+') frotte sur les parois.';
  if(prof>g.lc.v)return 'Profondeur usinée '+prof+' mm > longueur de coupe '+g.lc.v+' mm : vérifiez que le col dégagé (Ø'+g.dDeg.v+') passe.';
  return null;
}
