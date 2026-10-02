// Style du corps : UNE source de vérité (doc.bodies[].color / .op) partagée par le
// panneau des propriétés, le clic-droit de l'arbre, le clic-droit de la vue 3D et le
// rendu. Vérifie la migration de l'ancien modèle (couleur/opacité PAR FONCTION +
// teinte pièce globale), la persistance, et la synchronisation des miroirs du menu.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const SRC=path.join(ROOT,'src');
let staticKo=[];
// ── garde statique : l'ancien modèle ne doit réapparaître nulle part ──────────
fs.readdirSync(SRC).filter(f=>f.endsWith('.js')).forEach(f=>{
  const s=fs.readFileSync(path.join(SRC,f),'utf8');
  if(/function (colorField|opacityField|bodyColorField|partTintField|applyFeatOp|presetRow)\b/.test(s))
    staticKo.push(f+' : ancien champ de couleur/opacité encore défini');
  if(/\bcolorField\s*\(|\bopacityField\s*\(|\bapplyFeatOp\s*\(/.test(s))
    staticKo.push(f+' : appel à un ancien champ de couleur/opacité');
  if(/\b(f|ff)\.color\s*=[^=]/.test(s))
    staticKo.push(f+' : écriture f.color (couleur par fonction)');
  if(/\b(f|ff)\.opacity\s*=[^=]/.test(s))
    staticKo.push(f+' : écriture f.opacity (transparence par fonction)');
});
const html=fs.readFileSync(path.join(ROOT,'fusion_mvp.html'),'utf8');
if(/id="ctxColorAuto"/.test(html))staticKo.push('fusion_mvp.html : bouton « Auto » du clic-droit encore présent');
if(/optTint/.test(html))staticKo.push('fusion_mvp.html : teinte pièce globale (optTint) encore présente');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- la source unique et ses miroirs existent
    "att(typeof bodyColorOf==='function'&&typeof bodyOpOf==='function','lectures du style');",
    "att(typeof setBodyColor==='function'&&typeof setBodyOp==='function','écritures du style');",
    "att(typeof applyBodyStyle==='function'&&typeof applyBodyStyleLive==='function','application au rendu');",
    "att(typeof bodyStyleField==='function','panneau : bodyStyleField');",
    "att(typeof ctxStyleSync==='function'&&typeof ctxBodyId==='function','miroirs : ctxStyleSync/ctxBodyId');",
    // --- MIGRATION : couleur et opacité PAR FONCTION + teinte pièce → fiche du corps
    "doc={name:'Ancien',sketches:[],features:[{id:'e1',type:'extrude',name:'P1',color:0xff0000,opacity:0.4},{id:'e2',type:'extrude',name:'P2',color:0x00ff00}],bodies:[],bodyVis:{},tint:0x0000ff,bodySeq:1,activeBody:null,fold:{}};",
    "ensureBodies();",
    "att(doc.features.every(f=>f.color===undefined),'migration : f.color supprimée');",
    "att(doc.features.every(f=>f.opacity===undefined),'migration : f.opacity supprimée');",
    "att(!(doc.tint>0),'migration : teinte pièce retirée');",
    "att(bodyColorOf('b1')===0xff0000,'migration : couleur portée sur la fiche du corps');",
    "const _mig=JSON.stringify(doc);ensureBodies();",
    "att(JSON.stringify(doc)===_mig,'migration idempotente (deuxième appel sans effet)');",
    // --- écritures bornées, lecture sans effet de bord
    "newBody();",
    "att(bodyColorOf('b2')>0,'corps sans fiche : couleur auto stable');",
    "setBodyColor('b2',0x0a84ff);att(bodyColorOf('b2')===0x0a84ff,'setBodyColor écrit et se relit');",
    "setBodyOp('b2',0.4);att(bodyOpOf('b2')===0.4,'setBodyOp 40 %');",
    "setBodyOp('b2',0.02);att(bodyOpOf('b2')===0.15,'plancher de transparence 15 %');",
    "setBodyOp('b2',1);att(bodyOpOf('b2')===1,'retour opaque');",
    "att(!('op' in bodyEntryOf('b2')),'100 % : aucun champ op (document opaque par défaut)');",
    "const _nb=doc.bodies.length;att(bodyEntryOf('zzz')===null,'bodyEntryOf ne crée pas');",
    "att(doc.bodies.length===_nb,'lecture seule : aucune fiche ajoutée');",
    // --- persistance : serialise → deserialise (sans rejeu)
    "setBodyColor('b1',0xbf5af2);setBodyOp('b1',0.65);",
    "const _js=serialise();",
    "await deserialise(_js,{rebuild:false});",
    "att(bodyColorOf('b1')===0xbf5af2,'round-trip : couleur conservée');",
    "att(bodyOpOf('b1')===0.65,'round-trip : transparence conservée');",
    // --- ancien fichier chargé SANS rejeu : la migration a lieu quand même
    "const _old=JSON.stringify({app:'MiniFusion',v:1,name:'Vieux',sketches:[],features:[{id:'e1',type:'extrude',name:'P',body:'b1',color:0x00ff00,opacity:0.3}],bodies:[{id:'b1',name:'Corps 1'}],bodySeq:2,activeBody:'b1',tint:0xff0000});",
    "await deserialise(_old,{rebuild:false});",
    "att(doc.features[0].color===undefined,'ancien fichier : f.color migrée au chargement');",
    "att(doc.features[0].opacity===undefined,'ancien fichier : f.opacity migrée au chargement');",
    "att(bodyColorOf('b1')===0x00ff00,'ancien fichier : couleur du corps présente');",
    "att(!(doc.tint>0),'ancien fichier : teinte pièce reportée puis retirée');",
    // --- cible du clic-droit → corps conteneur (en mode maillage l'id cliqué est
    //     celui de la fonction, jamais celui de la fiche)
    "att(ctxBodyId(null)===null,'ctxBodyId(null) → null');",
    "att(ctxBodyId({kind:'body',id:'b1'})==='b1','ctxBodyId : id de corps');",
    "att(ctxBodyId({kind:'body',id:'e1'})==='b1','ctxBodyId : id cliqué = fonction → corps conteneur');",
    "att(ctxBodyId({kind:'feature',id:'e1'})==='b1','ctxBodyId : fonction → son corps');",
    "att(ctxBodyId({kind:'body',id:'zzz'})===null,'ctxBodyId : inconnu → null');",
    // --- miroirs : le menu de l'arbre montre EXACTEMENT la source
    "doc.bodies=[{id:'b1',name:'Corps 1',c:null,color:0xff9f0a,op:0.5,open:true},{id:'b2',name:'Corps 2',c:null,open:true}];",
    "doc.bodySeq=3;doc.activeBody='b1';doc.features=[];",
    "const _reg=ctxStyleReg.filter(r=>r.menu==='ctxMenu');",
    "att(_reg.length>=2,'miroir arbre : rangées de style enregistrées');",
    "const _rc=_reg.find(r=>r.c),_ro=_reg.find(r=>r.o&&r.v);",
    "att(!!_rc&&!!_ro,'miroir arbre : couleur + transparence présentes');",
    "ctxTarget={kind:'body',id:'b1'};ctxStyleSync();",
    "att(_rc.c.value===cssHex(0xff9f0a),'miroir arbre : couleur lue dans la source');",
    "att(_ro.o.value===50,'miroir arbre : transparence lue dans la source');",
    "att(_ro.v.textContent==='50%','miroir arbre : pourcentage affiché');",
    "setBodyColor('b1',0x30d158);ctxStyleSync();",
    "att(_rc.c.value==='#30d158','miroir arbre : suit une écriture');",
    "ctxTarget={kind:'body',id:'b2'};ctxStyleSync();",
    "att(_rc.c.value===cssHex(bodyColorOf('b2')),'miroir arbre : suit le changement de cible');",
    "att(_ro.o.value===100,'miroir arbre : corps opaque = 100 %');",
    // --- la transparence du clic-droit écrit DANS la source (fantôme = preset 25 %)
    "ctxSetBodyOp(25,true);att(bodyOpOf('b2')===0.25,'clic-droit : la transparence écrit dans la fiche');",
    "ctxSetBodyColor(0x64d2ff,true);att(bodyColorOf('b2')===0x64d2ff,'clic-droit : la couleur écrit dans la fiche');",
    "att(_rc.c.value==='#64d2ff','clic-droit : l AUTRE miroir suit immédiatement');",
    // --- visibilité : rangées masquées quand il n y a pas de cible (esquisse, fond de vue)
    "ctxStyleShow('ctxMenu',true);att(_reg.every(r=>r.wrap&&r.wrap.style.display===''),'ctxStyleShow : visible');",
    "ctxStyleShow('ctxMenu',false);att(_reg.every(r=>r.wrap&&r.wrap.style.display==='none'),'ctxStyleShow : masqué');",
    "ctxTarget=null;",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'corps_style.js'});
  console.log(r);
  if(staticKo.length){console.log('ECHECS statiques :');staticKo.forEach(m=>console.log('  x '+m));}
  process.exit((/ECHECS|  x /.test(r)||staticKo.length)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
