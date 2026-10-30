// V0.22.7 : cartouche EXTÉRIEUR (fichier .mfcartouche d'entreprise, gardé hors dépôt) — le modèle
// impose son format et son cadre, dessine son propre tableau des révisions (champs « rev »),
// indices O, A, B…, hauteur réservée imposée (hRes), textes tournés et resserrés (rot, fit).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};
    const T=window.__mepTest;
    docResetEmpty();
    // indices O, A, B…
    att(T.sk.revIdx('O',0)==='O'&&T.sk.revIdx('O',1)==='A'&&T.sk.revIdx('O',3)==='C','1 : indices O, A, B, C');
    att(T.sk.revNext('O',[{i:'O'}])==='A'&&T.sk.revNext('O',[{i:'O'},{i:'A'}])==='B'&&T.sk.revNext('O',[])==='O','2 : révision suivante : O → A → B');
    // modèle minimal : bord, tableau de 3 rangs (indice, date, vérifié), trait de toute la hauteur, texte vertical
    const sk={pts:{o:{x:0,y:0},p1:{x:-180,y:-40},p2:{x:-180,y:0},p3:{x:-178,y:-270},p4:{x:-178,y:0},p5:{x:-175,y:-2},p6:{x:-170,y:-10},p7:{x:-150,y:-10},p8:{x:-170,y:-15},p9:{x:-60,y:-20}},
      ents:[{id:'e1',t:'line',p1:'p1',p2:'p2'},{id:'e2',t:'line',p1:'p3',p2:'p4'},
        {id:'e3',t:'text',p:'p5',f:'txt',s:'CONFIDENTIEL',h:2,rot:90},
        {id:'e4',t:'text',p:'p6',f:'rev',k:'i',r:0,h:3},{id:'e5',t:'text',p:'p7',f:'rev',k:'d',r:0,h:3},{id:'e6',t:'text',p:'p8',f:'rev',k:'i',r:1,h:3},
        {id:'e7',t:'text',p:'p6',f:'rev',k:'v',r:2,h:3},{id:'e8',t:'text',p:'p9',f:'tth',h:3,nd:1,fit:12}],cons:[],seq:20};
    const M={kind:'sk',name:'Société X A4V',sk,hRes:45,page:{format:'A4',orient:'portrait'},
      frame:{l:11,r:9,t:9.5,b:10,lw:1,zones:true,zw:42,zh:74,zx0:32,zy0:64.5,col:'#0070e0'},vals:{revFmt:'O',tth:''},cust:{unite:'Usine'}};
    const pack=JSON.parse(JSON.stringify({format:'miniFusion-cartouches',v:1,tbs:{[M.name]:M}})).tbs[M.name];
    const sh=T.sheet();
    T.sk.tbApply(sh,pack);
    const tt=sh.title;
    att(sh.format==='A4'&&sh.orient==='portrait'&&sh.frame.zw===42&&sh.frame.col==='#0070e0','3 : le modèle impose format (A4 portrait) et cadre (zones 42 × 74, bleu)');
    att(T.sk.tbH(sh)===45,'4 : hauteur réservée imposée (le trait de toute la hauteur ne prend pas la feuille)');
    att(T.sk.revRows(sh)===3&&tt.revFmt==='O'&&tt.revs.length===1&&tt.revs[0].i==='O','5 : tableau dessiné de 3 rangs : 1re révision « O » créée d’office');
    tt.revs.push({i:'A',d:'31/10/2026',n:'FB',t:'Chanfrein',v:'Dupont'});
    att(T.sk.tbValue(sh,{f:'rev',k:'i',r:0})==='O'&&T.sk.tbValue(sh,{f:'rev',k:'i',r:1})==='A'&&T.sk.tbValue(sh,{f:'rev',k:'v',r:1})==='Dupont'&&T.sk.tbValue(sh,{f:'rev',k:'v',r:0})===''&&T.sk.tbValue(sh,{f:'indice'})==='A','6 : cases du tableau : O en bas, A au-dessus ; INDICE = dernière révision');
    tt.revs.push({i:'B'},{i:'C'});
    att(T.sk.tbValue(sh,{f:'rev',k:'i',r:0})==='A'&&T.sk.tbValue(sh,{f:'rev',k:'i',r:2})==='C','7 : plus de révisions que de rangs : les dernières s’affichent');
    // rendu : texte tourné, case vide sans « — », pas de tableau des révisions posé au-dessus
    const els=[];const mk=(tag,o)=>{const e={tag,a:Object.assign({},o),textContent:'',setAttribute(k,v){this.a[k]=v;},getComputedTextLength(){return 0;}};els.push(e);return e;};
    T.sk.drawSk(mk,sh,{sk:tt.tb.sk,ox:200,oy:287,tb:true},'tb');
    const conf=els.find(e=>e.textContent==='CONFIDENTIEL');
    att(conf&&/rotate\\(-90 /.test(conf.a.transform||''),'8 : texte vertical (rot 90°)');
    att(!els.some(e=>e.textContent==='—'),'9 : champ vide (TTH) laissé vide, pas de « — »');
    const rv=[];T.drawRevs((tag,o)=>{const e={textContent:''};rv.push(tag);return e;},sh,{ix:0,iw:400},100);
    att(rv.length===0,'10 : pas de tableau des révisions au-dessus d’un cartouche qui a le sien');
    tt.tth='Nitruration ionique 0,1 profondeur';els.length=0;T.sk.drawSk(mk,sh,{sk:tt.tb.sk,ox:200,oy:287,tb:true},'tb');
    const nit=els.find(e=>/^Nitruration/.test(e.textContent));
    att(nit&&nit.a.textLength==='12.00'&&nit.a.lengthAdjust==='spacingAndGlyphs','11 : texte trop long pour sa case : resserré (fit 12 mm)');
    return {ATT,OK};
  `;
  const o=await vm.runInContext('(async function(){'+R+'})()',ctx);
  console.log('=== V0.22.7 : cartouche extérieur ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
