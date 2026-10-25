/* ---------- FAO : opération CHANFREIN (V0.7.9) ----------
   « L'opération Poche n'a pas l'air utile car l'Ébauche 3D fait aussi bien le travail. Il faudrait la
   transformer en opération à chanfreiner. » La Poche reste lisible et calculée (anciens fichiers),
   mais le ruban propose Chanfrein à sa place.
   Arêtes : une CHAÎNE d'arêtes du haut de la paroi (même saisie que le Contour). Outil : fraise à
   chanfreiner (angle, Ø de pointe) ou foret à pointer (pointe vive). Réglages : largeur du chanfrein
   (sur le dessus), décalage de pointe (la pointe descend sous le chanfrein pour couper avec le flanc).
   Géométrie, outil de demi-angle θ, pointe plate de rayon rt, largeur a, décalage t :
     jambe sur la paroi   b = a / tan θ
     pointe à             z = Z arête − b − t
     axe décalé de        d = rt + t·tan θ   (vers le vide, depuis l'arête)
     contact haut à       ρ = d + a ≤ Ø/2 de l'outil (sinon ⚠ : outil trop petit)
   Le parcours est un contour à la distance d, à la cote de pointe, une passe, avec entrées et sorties
   tangentes (faoGenContourProfil) — côté de l'outil déduit de la matière (bossage ou alésage). */
function faoChamferToolOk(t){ return !!(t&&(t.kind==='chamfer'||t.kind==='spot')); }
function faoChamferTool(t){
  // {rt, th (rad, demi-angle), R} d'un outil à chanfreiner ; null = outil sans cône
  if(!faoChamferToolOk(t))return null;
  const ang=faoToolAngle(t),R=((+t.d>0)?+t.d:6)/2;
  const rt=t.kind==='chamfer'?Math.max(0,Math.min(R*0.9,isFinite(+t.dt)&&+t.dt>=0?+t.dt/2:0.25)):0;
  return {rt:rt,th:ang*Math.PI/360,R:R,ang:ang};
}
function faoChamferGeom(op,t){
  // -> {a, b, t, d, zTip, rho, R, ok, warn} ; null sans outil conique ou sans arête
  const T=faoChamferTool(t);if(!T)return null;
  const zTop=+op.z;if(!isFinite(zTop))return null;
  const a=Math.max(0.01,isFinite(+op.w)?+op.w:0.5);
  const off=Math.max(0,isFinite(+op.tipOff)?+op.tipOff:0.3);
  const tn=Math.tan(T.th);
  const b=a/tn,d=T.rt+off*tn,rho=d+a;
  const g={a:a,b:b,t:off,d:d,zTip:zTop-b-off,rho:rho,R:T.R,ang:T.ang,rt:T.rt,ok:rho<=T.R+1e-9,warn:''};
  if(!g.ok)g.warn='outil trop petit : le contact haut du chanfrein est à Ø'+(2*rho).toFixed(2)+', l’outil fait Ø'+(2*T.R).toFixed(2);
  return g;
}
function faoGenChamfer(mesh,op,job,secu){
  const L=op&&op.limit;
  if(!L||!(L.loop||[]).length||L.loop.length<3)return [];
  const t=faoToolById(job,op.toolId),G=faoChamferGeom(op,t);
  if(!G)return [];
  const mv=faoGenContourProfil(mesh,L.loop,{
    toolD:2*Math.max(0.05,G.d),ztop:+op.z,zbot:G.zTip,ap:1e6,nR:1,fin:0,ae:1,
    side:op.cside==='ext'||op.cside==='int'?op.cside:null,sens:op.sens==='opp'?'opp':'climb',
    leadR:isFinite(+op.leadR)&&+op.leadR>0?+op.leadR:Math.max(1,Math.min(4,G.rho)),
    overlap:isFinite(+op.overlap)&&+op.overlap>=0?+op.overlap:1,tabN:0,secu:secu});
  try{ if(mv&&mv.diag){ mv.diag.chamfer={zTip:+G.zTip.toFixed(3),d:+G.d.toFixed(3),b:+G.b.toFixed(3),rho:+G.rho.toFixed(3)}; op.geoDiag=mv.diag; } }catch(e){}
  return mv;
}
function faoChamferToolMake(setup,op){
  // crée (ou reprend) une fraise à chanfreiner Ø6 90° et l'affecte à l'opération
  const tools=setup.tools||(setup.tools=[]);
  let t=tools.find(function(x){return x&&x.kind==='chamfer';});
  if(!t){
    const n=tools.reduce(function(m,x){return Math.max(m,+x.num||0);},0)+1;
    t={id:'T'+n+'_'+Date.now().toString(36),num:n,name:'Fraise à chanfreiner D6 90°',kind:'chamfer',d:6,ang:90,dt:0.5,cornerR:0,flutes:2,vc:150,fz:0.03};
    tools.push(t);
  }
  op.toolId=t.id;
  return t;
}
function faoChamferRows(d,setup,op){
  const t=faoToolById(setup,op.toolId);
  d.appendChild(faoH('Arêtes à chanfreiner'));
  const L=(op.limit&&op.limit.mode==='chain')?op.limit:null;
  const has=!!(L&&(L.loop||[]).length>=3);
  const gd=op.geoDiag||{};
  const rc=faoRow();
  const info=document.createElement('span');info.className='fao-meta';
  info.textContent=has
    ?(L.nEdges||'?')+' arête(s), boucle '+(L.closed?'fermée':'refermée')+(isFinite(+op.z)?' à Z '+faoDsp(op,+op.z,2):'')+
      (gd.side?' · outil '+(gd.side==='ext'?'à l’EXTÉRIEUR (arête de bossage)':'à l’INTÉRIEUR (arête de poche / de trou)'):'')
    :'aucune arête — cliquez les arêtes du HAUT à chanfreiner';
  rc.appendChild(info);
  rc.appendChild(faoMini(has?'Re-sélectionner':'Sélectionner les arêtes',function(){ faoChainStart(setup.id,op.id); },
    'Cliquez les arêtes du haut de la paroi à chanfreiner (contour d’un bossage, bord d’une poche ou d’un trou). La cote de l’arête est prise sur la sélection.'));
  d.appendChild(rc);
  d.appendChild(faoH('Chanfrein'));
  const r1=faoRow();
  r1.appendChild(faoLab('Largeur'));
  r1.appendChild(faoNum(isFinite(+op.w)?+op.w:0.5,function(v){op.w=Math.max(0.01,v);},48,0.1,'Largeur du chanfrein sur la face du dessus (mm). La hauteur sur la paroi suit l’angle de l’outil (90° : égale à la largeur).'));
  r1.appendChild(faoLab('Décalage de pointe'));
  r1.appendChild(faoNum(isFinite(+op.tipOff)?+op.tipOff:0.3,function(v){op.tipOff=Math.max(0,v);},48,0.1,'La pointe descend de cette valeur sous le chanfrein : le flanc coupe, pas la pointe (fragile). 0,2 à 0,5 mm.'));
  d.appendChild(r1);
  const r2=faoRow();
  r2.appendChild(faoLab('Côté'));
  r2.appendChild(faoSel([['auto','Auto (matière)'],['ext','Extérieur'],['int','Intérieur']],op.cside||'auto',function(v){op.cside=v;},'Côté de l’outil par rapport aux arêtes : déduit de la matière par défaut'));
  r2.appendChild(faoLab('Sens'));
  r2.appendChild(faoSel([['avalant','Avalant'],['opp','Opposition']],op.sens==='opp'?'opp':'avalant',function(v){op.sens=v;},'Sens de coupe'));
  d.appendChild(r2);
  // outil et géométrie
  const G=faoChamferGeom(op,t);
  const n=document.createElement('div');
  if(!faoChamferToolOk(t)){
    n.className='fao-alert';
    n.textContent='⚠ L’outil T'+(t?t.num:'?')+' ('+(t?faoKindLabel(t.kind):'?')+') n’a pas de cône : choisissez une fraise à chanfreiner ou un foret à pointer.';
    d.appendChild(n);
    const rb=faoRow();
    rb.appendChild(faoMini('Créer une fraise à chanfreiner Ø6 90°',function(){ faoSnapshot('outil de chanfrein'); faoChamferToolMake(setup,op); faoChanged(); try{renderProps();}catch(e){} },
      'Ajoute à la liste d’outils une fraise à chanfreiner Ø6 à 90° (pointe Ø0,5) et l’affecte à cette opération.'));
    d.appendChild(rb);
  }else if(G){
    n.className=G.ok?'fao-help':'fao-alert';
    n.textContent=(G.ok?'':'⚠ '+G.warn+'. ')+'Outil '+G.ang+'°'+(G.rt>0?' pointe Ø'+(2*G.rt).toFixed(2):' pointe vive')+
      ' : chanfrein '+G.a.toFixed(2)+' × '+G.b.toFixed(2)+' mm ; pointe à Z '+faoDsp(op,G.zTip,2)+', axe à '+G.d.toFixed(3)+' mm de l’arête ; contact haut sur Ø'+(2*G.rho).toFixed(2)+'.';
    d.appendChild(n);
  }
}
