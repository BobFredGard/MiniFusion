// V0.8.6 : un modèle de cartouche emporte TOUT — traits, textes, logo, valeurs des champs
// (« l'export n'exporte pas le texte et les images ; enregistrer fait pareil ; le cartouche est vide
// au rappel »). Cartouche dessiné et Standard : paquet, rappel sur une planche vide, export /
// import par fichier, modèle par défaut d'une nouvelle planche, anciens modèles (sans valeurs).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};
    const T=window.__mepTest;
    docResetEmpty();
    const sh=T.sheet(),tt=sh.title;
    const LOGO='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    Object.assign(tt,{projet:'Plaque de Base',societe:'JUSTET',client:'Merlin',nplan:'MERLIN-XX-YYY',auteur:'BobFred',matiere:'EN AW-7075',traitement:'Anodisation dure',tth:'Sans',tolgen:'ISO 2768-mK',logo:LOGO,cust:{adr:'7 Av Lucien Jalabert'}});
    // ── Standard ──
    let p=T.tbPack(sh,'Justet std');
    att(p.kind==='std'&&p.logo===LOGO&&p.vals.societe==='JUSTET'&&p.vals.auteur==='BobFred'&&p.cust.adr==='7 Av Lucien Jalabert','1 : Standard : logo, valeurs et champs perso dans le modèle');
    att(!('date' in p.vals),'2 : la date reste celle de la planche');
    let t2=T.tbUnpack({projet:'',date:'01/01/2027'},p);
    att(t2.logo===LOGO&&t2.societe==='JUSTET'&&t2.nplan==='MERLIN-XX-YYY'&&t2.date==='01/01/2027'&&t2.tb===null&&t2.cust.adr==='7 Av Lucien Jalabert','3 : rappel sur une planche vide : tout revient (date gardée)');
    // ── dessiné ──
    tt.tb=T.sk.fromStd(sh);tt.tb.name='Justet';
    p=T.tbPack(sh,'Justet');
    att(p.kind==='sk'&&p.sk&&p.sk.ents.some(e=>e.t==='text')&&p.logo===LOGO&&p.vals.matiere==='EN AW-7075','4 : dessiné : esquisse (textes) + logo + valeurs');
    t2=T.tbUnpack({},p);
    att(t2.tb&&t2.tb.kind==='sk'&&!t2.tb.logo&&!t2.tb.vals&&t2.logo===LOGO&&t2.traitement==='Anodisation dure','5 : rappel : esquisse dans tb, logo et valeurs sur la planche (pas en double)');
    // ── bibliothèque (Enregistrer…) et modèle par défaut d'une nouvelle planche ──
    let lsOK=true;try{localStorage.setItem('mep_tb_lib',JSON.stringify({Justet:p,'Ancien':Object.assign({},p,{logo:undefined,vals:undefined,cust:undefined,name:'Ancien'})}));localStorage.setItem('mep_tb_def','Justet');lsOK=!!T.tbLib().Justet;}catch(e){lsOK=false;}
    if(lsOK){
      const ns=T.newSheet(2);
      att(ns.title.logo===LOGO&&ns.title.societe==='JUSTET'&&ns.title.tb&&ns.title.tb.kind==='sk'&&ns.title.date,'6 : nouvelle planche avec le modèle par défaut : cartouche rempli (logo, société…), date du jour');
      const old=T.tbUnpack({projet:'P'},JSON.parse(JSON.stringify(Object.assign({},p,{logo:undefined,vals:undefined,cust:undefined}))));
      att(old.tb&&old.projet==='P'&&!old.logo,'7 : ancien modèle (sans valeurs) : esquisse seule, rien d’effacé');
      localStorage.removeItem('mep_tb_lib');localStorage.removeItem('mep_tb_def');
    }else{const old=T.tbUnpack({projet:'P'},JSON.parse(JSON.stringify(Object.assign({},p,{logo:undefined,vals:undefined,cust:undefined}))));
      att(old.tb&&old.projet==='P'&&!old.logo,'7 : ancien modèle (sans valeurs) : esquisse seule, rien d’effacé (stockage local absent du banc : 6 vérifié au navigateur)');}
    // fichier .mfcartouche : le paquet survit à JSON
    const back=JSON.parse(JSON.stringify({format:'miniFusion-cartouches',v:1,tbs:{Justet:p}})).tbs.Justet;
    const t3=T.tbUnpack({},back);
    att(t3.logo===LOGO&&t3.client==='Merlin'&&t3.tb.sk.ents.length===p.sk.ents.length,'8 : export / import (.mfcartouche) : tout revient');
    return {ATT,OK};
  `;
  const o=await vm.runInContext('(async function(){'+R+'})()',ctx);
  console.log('=== V0.8.6 : modèle de cartouche complet ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
