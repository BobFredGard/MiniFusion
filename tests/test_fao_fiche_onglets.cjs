// FAO — FICHE D'OPÉRATION EN ONGLETS (2026-10-14-011) : sections rangées par
// onglet (Zone, Hauteurs, Passes, Entrées, Matière…), un seul onglet visible,
// mémorisé par opération, ligne d'aide par onglet, champs numériques arrondis.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const all=function(root){const out=[];(function w(n){out.push(n);(n.children||[]).forEach(w);})(root);return out;};",
    "const tabs=function(c){return all(c).filter(n=>n.className==='fao-tab'||n.className==='fao-tab on');};",
    "const S=faoSetup();",
    "const card=function(type){const op=faoOpDefaults(type);op.id='t_'+type;return {op:op,c:faoOpCardElement(S,op,0)};};",
    "const R3=card('rough3d'),GF=card('geofinish'),PK=card('pocket'),CT=card('contour');",
    "const names=function(c){return tabs(c).map(b=>b.textContent).join('|');};",
    "p('ébauche : '+names(R3.c)+' ; finition : '+names(GF.c)+' ; poche : '+names(PK.c)+' ; contour : '+names(CT.c));",
    "att(names(R3.c)==='Outil|Zone|Hauteurs|Passes|Entrées|Matière|Repère','ébauche 3D : onglets Outil, Zone, Hauteurs, Passes, Entrées, Matière ('+names(R3.c)+')');",
    "att(names(GF.c)==='Outil|Zone|Hauteurs|Passes|Entrées|Matière|Repère','finition : mêmes onglets ('+names(GF.c)+')');",
    "att(/Attaches/.test(names(CT.c))&&/Zone/.test(names(CT.c)),'contour : onglet Attaches et profil ('+names(CT.c)+')');",
    "att(/Zone/.test(names(PK.c))&&/Matière/.test(names(PK.c)),'poche : bord et matière ('+names(PK.c)+')');",
    // un seul onglet visible ; clic = bascule ; mémorisé par opération
    "const panes=function(c){return all(c).filter(n=>n.className==='fao-pane');};",
    "const vis=function(c){return panes(c).filter(p=>p.style.display!=='none').length;};",
    "att(vis(R3.c)===1,'un seul onglet visible ('+vis(R3.c)+')');",
    "const bPasses=tabs(R3.c).find(b=>b.textContent==='Passes');bPasses.onclick();",
    "att(bPasses.className==='fao-tab on'&&faoTabSel[R3.op.id]==='Passes','clic : onglet Passes actif et mémorisé');",
    "const c2=faoOpCardElement(S,R3.op,0);",
    "att(tabs(c2).find(b=>b.className==='fao-tab on').textContent==='Passes','réouverture : onglet mémorisé');",
    // chaque onglet a sa ligne d'aide ; champs : en-tête et bilan hors onglets
    "att(panes(R3.c).every(p=>all(p).some(n=>n.className==='fao-tip'&&n.textContent.length>10)),'aide présente dans chaque onglet');",
    "att(all(R3.c).some(n=>n.className==='fao-opnum'),'en-tête (n° + type) visible hors onglets');",
    // champ d'avance « ap » trouvable par son titre, valeur arrondie
    "const op5=faoOpDefaults('geofinish');op5.id='t5';op5.step=1.0000000004;const c5=faoOpCardElement(S,op5,0);",
    "const stepIn=all(c5).find(n=>n.tagName==='INPUT'&&n.type==='number'&&/Écart entre deux passes/.test(n.title||''));",
    "att(stepIn&&stepIn.value==='1','valeur affichée arrondie (vu '+(stepIn&&stepIn.value)+')');",
    "att(all(R3.c).some(n=>n.className==='fao-lab'&&n.textContent==='Descente ap'),'libellé en clair : Descente ap');",
    "att(all(PK.c).some(n=>n.className==='fao-lab'&&n.textContent==='Finir le fond'),'poche : case « Finir le fond » (onglet Matière)');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return {txt:P.join(String.fromCharCode(10)),ko:ATT.length};"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_fiche_onglets.js'});
  console.log(r.txt);
  process.exit(r.ko?1:0);
})().catch(e=>{console.log('FATAL',e&&e.stack||e);process.exit(1);});
