// V0.11.23 : cotation plus souple — comparatif avec SolidCraft (tangency-labs/solidcraft).
// Contrôles (rectangle 60×40 à (10,10), H/V posées ; souris et clavier simulés) :
//  A. glisser le TEXTE d'une cote linéaire déplace la ligne de cote (d.w) et fait glisser le texte le
//     long d'elle (d.sl) ; la zone de clic suit le texte (avant : ox/oy bougeaient la zone, pas le texte) ;
//  B. outil Cote, clic sur une cote existante (texte) → sa saisie s'ouvre, aucune cote ajoutée ;
//  C. pendant la pose, taper « 2 » pose la cote là où elle est et ouvre la saisie avec « 2 » ; Entrée pose sans valeur ;
//  D. référence ⇄ pilotante à la demande (refV=1 gardée à la réouverture), replacer le texte ;
//  E. saisie ouverte : un clic sur une autre cote insère son nom (nommée d1 au besoin), pas une cote de référence ;
//  F. cote redondante : la barre d'état nomme ce qui la détermine (« déjà déterminée par Longueur = 60 … ») ;
//  G. expressions : unités collées au nombre (2 cm + 3 = 23 ; 1 in = 25,4 ; 5 mm + 3 = 8), « Ø20 » / « R5 » acceptés ;
//  H. menu contextuel d'une cote : 4 entrées (valeur, référence ⇄ pilotante, replacer, supprimer).
// Harnais : DOM/THREE stubbé, sans OCCT.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
function inVm(){
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
  confirm=function(){return true;};alert=function(){};prompt=function(){return null;};
  const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};
  const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,detail:1,pointerId:1,preventDefault(){},stopPropagation(){}},ex||{});r.clientX=x;r.clientY=y;return r;};
  const pmove=(x,y,ex)=>{const p=C(x,y);svg.dispatchEvent(ev('pointermove',p[0],p[1],Object.assign({buttons:0},ex||{})));};
  const pdown=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerdown',p[0],p[1],{button:0,buttons:1}));};
  const pup=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointerup',p[0],p[1]));};
  const click=(x,y)=>{pmove(x,y);pdown(x,y);pup(x,y);};
  const key=(k)=>{let pd=false;const e={type:'keydown',key:k,target:document.body,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,repeat:false,preventDefault(){pd=true;},stopPropagation(){}};window.dispatchEvent(e);return pd;};
  const dof=()=>{skDofCache={key:null};return skDofInfo(skEdit).dof;};
  const last=()=>skEdit.dims[skEdit.dims.length-1];
  const mk=()=>{const sk={id:'s1',name:'S',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],seq:20,visible:true};
    [['p0',10,10,'e0','p1'],['p1',70,10,'e1','p2'],['p2',70,50,'e2','p3'],['p3',10,50,'e3','p0']].forEach(l=>{sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});
    sk.constraints.push({id:'c0',type:'h',line:'e0'},{id:'c1',type:'v',line:'e1'},{id:'c2',type:'h',line:'e2'},{id:'c3',type:'v',line:'e3'});
    doc.sketches=[sk];doc.features=[];openSketch('s1');{const ov=$('sketchOverlay');ov.classList=Object.assign({},ov.classList,{contains:()=>true});}skTool='dim';return skEdit;};
  const near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);
  const sec=(nm,fn)=>{try{fn();}catch(e){out.fails.push(nm+" : exception "+(e&&e.message)+" @ "+String(e&&e.stack).split("\n")[1]);}};
  // A. glisser le texte d'une cote linéaire
  sec("A",()=>{
  let sk=mk();sk.dims.push({id:'d0',type:'length',line:'e0',value:60,chk:1});afterEdit();skTool='select';
  {const d=sk.dims[0];const t0=dimLabelPos(sk,d);
    A(near(t0.x,40)&&near(t0.y,15),'A. cote longueur : texte au milieu de la ligne de cote ('+t0.x.toFixed(1)+', '+t0.y.toFixed(1)+')');
    pdown(t0.x,t0.y);pmove(t0.x+12,t0.y-25,{buttons:1});pup(t0.x+12,t0.y-25);
    const t1=dimLabelPos(sk,d);
    A(near(t1.x,52,1e-3)&&near(t1.y,-10,1e-3),'A. texte glissé en (52, −10) : il suit le curseur ('+t1.x.toFixed(2)+', '+t1.y.toFixed(2)+')');
    A(near(d.w,-20,1e-3)&&near(d.sl,12,1e-3),'A. ligne de cote déplacée (w = '+(+d.w.toFixed(2))+', glissement sl = '+(+d.sl.toFixed(2))+')');
    const S=dimSeg(sk,d);A(near(S.a.y,-10,1e-3)&&near(S.b.y,-10,1e-3),'A. la ligne de cote passe sous le texte (y = '+S.a.y.toFixed(2)+')');
    const p=w2s(t1.x,t1.y);A(hitDimLabel(sk,p[0],p[1])==='d0','A. la zone de clic suit le texte');
    const p0=w2s(40,15);A(hitDimLabel(sk,p0[0],p0[1])!=='d0','A. l’ancienne place du texte ne répond plus');
    skDimResetText('d0');const t2=dimLabelPos(sk,d);
    A(d.w===undefined&&d.sl===undefined&&near(t2.x,40)&&near(t2.y,15),'A. « Replacer le texte » : texte et ligne de cote à leur place par défaut');
    // entraxe : le texte glisse avec sa ligne
    sk.dims.push({id:'d1',type:'gap',a:'e0',b:'e2',value:40,ox:0,oy:0,chk:1});afterEdit();
    const g=sk.dims[1],g0=dimLabelPos(sk,g);pdown(g0.x,g0.y);pmove(g0.x+15,g0.y+3,{buttons:1});pup(g0.x+15,g0.y+3);
    const g1=dimLabelPos(sk,g);A(near(g1.x,g0.x+15,1e-3)&&near(g.sl,15,1e-3),'A. entraxe : le texte glisse de 15 avec sa ligne (sl = '+(+g.sl.toFixed(2))+')');
  }
  });
  // B. outil Cote : clic sur une cote existante → saisie
  sec("B",()=>{
  sk=mk();sk.dims.push({id:'d0',type:'length',line:'e0',value:60,chk:1});afterEdit();
  {const n0=sk.dims.length;const t=dimLabelPos(sk,sk.dims[0]);click(t.x,t.y);
    A(sk.dims.length===n0&&!!skDimEditInp&&skDimEditInp._dimId==='d0','B. clic de l’outil Cote sur le texte : saisie ouverte, aucune cote ajoutée');
    skDimEditInp._cancel();A(!skDimEditInp,'B. saisie refermée');}
  });
  // C. valeur tapée pendant la pose
  sec("C",()=>{
  sk=mk();
  {click(40,50);A(!!skDimPlace&&last().type==='length','C. cote longueur vivante sur la ligne du haut');
    pmove(40,62);A(key('2'),'C. touche « 2 » pendant la pose : consommée');
    A(!skDimPlace&&!!skDimEditInp&&skDimEditInp.value==='2'&&last().orient==='h'&&near(last().w,12,1e-3),'C. cote posée là où elle était (w = '+(+(last().w||0).toFixed(2))+'), saisie ouverte avec « 2 »');
    skDimEditInp.value='25';skDimEditInp.dispatchEvent({type:'keydown',key:'Enter',preventDefault(){},stopPropagation(){}});
    A(!skDimEditInp&&near(last().value,25,1e-6)&&near(sk.points.p1.x-sk.points.p0.x,25,1e-3),'C. Entrée : 25 appliqué, rectangle 25 de large');
    // 1re cote : esquisse remise à l’échelle (les lignes ont bougé) ; ligne de droite (le haut est déjà coté : un re-clic sélectionnerait la cote existante)
    {const P=sk.points,mx=P.p1.x,my=(P.p1.y+P.p2.y)/2;click(mx,my);pmove(mx+15,my);}
    A(key('Enter'),'C. Entrée pendant la pose : consommée');
    A(!skDimPlace&&!!skDimEditInp&&last().line==='e1'&&skDimEditInp.value==='16.67','C. Entrée sans valeur : cote posée, saisie ouverte sur la valeur courante ('+skDimEditInp.value+')');
    skDimEditInp._cancel();}
  });
  // D. référence ⇄ pilotante à la demande
  sec("D",()=>{
  sk=mk();sk.dims.push({id:'d0',type:'length',line:'e0',value:60,chk:1});afterEdit();
  {const d0=dof();A(skDimToggleRef('d0')&&sk.dims[0].ref===true&&sk.dims[0].refV===1&&dof()===d0+1,'D. « Rendre RÉFÉRENCE » : grise, un DDL rendu ('+d0+' → '+dof()+')');
    closeSketch(true);openSketch('s1');
    A(skEdit.dims[0].ref===true&&skEdit.dims[0].refV===1,'D. réouverture : la référence voulue est gardée (pas repromue pilotante)');
    sk=skEdit;A(skDimToggleRef('d0')&&!sk.dims[0].ref&&dof()===d0,'D. « Rendre PILOTANTE » : pilotante de nouveau, DDL '+dof());
    sk.dims.push({id:'d1',type:'length',line:'e2',value:60,chk:0});afterEdit();
    A(sk.dims[1].ref===true&&sk.dims[1].refV===2,'D. cote redondante : référence automatique (refV = 2)');
    A(!skDimToggleRef('d1')&&sk.dims[1].ref===true,'D. une référence sur-contrainte ne peut pas devenir pilotante (refus expliqué)');}
  });
  // E. clic sur une autre cote pendant la saisie
  sec("E",()=>{
  sk=mk();sk.dims.push({id:'d0',type:'length',line:'e0',value:60,chk:1},{id:'d1',type:'length',line:'e1',value:40,chk:1});afterEdit();skTool='select';
  {editDim('d1');A(!!skDimEditInp&&skDimEditInp.value==='40','E. saisie de la hauteur ouverte (« 40 »)');
    A(skDimEditInp._parFx===1&&!parFxEligible(skDimEditInp),'E. la saisie de cote est hors du filet global ƒx (il remplaçait « d1/2 » par sa valeur avant le gestionnaire de la cote)');
    const t=dimLabelPos(sk,sk.dims[0]);pdown(t.x,t.y);pup(t.x,t.y);
    A(sk.dims[0].name==='d1'&&skDimEditInp&&skDimEditInp.value==='d1','E. clic sur la largeur : nommée « d1 », la valeur seule est remplacée par le nom ('+skDimEditInp.value+')');
    skDimEditInp.value='d1/2 + ';skDimEditInp.selectionStart=skDimEditInp.selectionEnd=skDimEditInp.value.length;
    pdown(t.x,t.y);pup(t.x,t.y);
    A(skDimEditInp.value==='d1/2 + d1','E. expression en cours : le nom est inséré au curseur ('+skDimEditInp.value+')');
    skDimEditInp.value='d1/2';skDimEditInp.dispatchEvent({type:'keydown',key:'Enter',preventDefault(){},stopPropagation(){}});
    A(!skDimEditInp&&sk.dims[1].expr==='d1/2'&&near(sk.dims[1].value,30,1e-6),'E. Entrée : hauteur = d1/2 = 30');
    sk.dims[0].value=80;parApplyAll();A(near(sk.dims[1].value,40,1e-6),'E. largeur 80 → hauteur suit (40)');
    sk.dims.push({id:'d2',type:'length',line:'e2',value:80,chk:0});afterEdit();
    editDim('d1');const t2=dimLabelPos(sk,sk.dims[2]);pdown(t2.x,t2.y);pup(t2.x,t2.y);
    A(skDimEditInp&&skDimEditInp.value==='d1/2'&&!sk.dims[2].name&&/RÉFÉRENCE/.test(skMsg),'E. clic sur une cote de référence : rien inséré, explication en barre d’état');
    skDimEditInp._cancel();}
  });
  // F. cote redondante : ce qui la détermine
  sec("F",()=>{
  sk=mk();sk.dims.push({id:'d0',type:'length',line:'e0',value:60,chk:1});afterEdit();skTool='dim';
  {click(40,50);
    A(last().ref&&/déjà déterminée par/.test(skMsg)&&/Longueur = 60/.test(skMsg),'F. longueur du haut : « '+skMsg.replace(/^.*— /,'')+' »');
    const by=skDimDeterminedBy(sk,last(),5);
    A(by.length===3&&by.some(s=>/Longueur = 60/.test(s))&&by.filter(s=>/Vertical/.test(s)).length===2,'F. skDimDeterminedBy (rang au 1er ordre : longueur + 2 verticales, les horizontales n’y changent rien au point courant) : '+by.join(' · '));
    skCancelDraft();}
  });
  // G. expressions : unités, préfixes Ø / R
  sec("G",()=>{
  {const e=s=>parEval(s,()=>{throw new Error('inconnu');});
    A(near(e('2 cm + 3'),23)&&near(e('1 in'),25.4)&&near(e('5 mm + 3'),8)&&near(e('0.5 m'),500)&&near(e('1 rad'),180/Math.PI),'G. unités collées au nombre : 2 cm + 3 = 23, 1 in = 25,4, 5 mm + 3 = 8, 0.5 m = 500, 1 rad = 57,3°');
    let bad=false;try{e('2 min(3;4)');}catch(x){bad=true;}A(bad,'G. « 2 min(3;4) » reste refusé (pas de produit implicite)');
    sk=mk();sk.entities.push({id:'cc',t:'circle',pc:'pc',r:10});sk.points.pc={x:40,y:30};sk.dims.push({id:'dc',type:'diameter',ent:'cc',value:20,chk:1});afterEdit();
    const r1=parDimCommit(sk,sk.dims[sk.dims.length-1],'Ø24');A(r1.ok&&near(r1.nv,24),'G. « Ø24 » accepté sur un diamètre → 24');
    const r2=parDimCommit(sk,sk.dims[sk.dims.length-1],'L = R12');A(r2.ok&&near(r2.nv,12)&&sk.dims[sk.dims.length-1].name==='L','G. « L = R12 » : nommée L, valeur 12');}
  });
  // H. menu contextuel d'une cote
  sec("H",()=>{
  sk=mk();sk.dims.push({id:'d0',type:'length',line:'e0',value:60,chk:1});afterEdit();skTool='select';
  {const t=dimLabelPos(sk,sk.dims[0]);const p=C(t.x,t.y);const m=$('skCtxMenu');m.children.length=0;
    svg.dispatchEvent(ev('contextmenu',p[0],p[1],{button:2}));
    const labels=m.children.map(b=>b.textContent||'');
    A(skSel&&skSel.kind==='dim'&&skSel.id==='d0','H. clic droit sur le texte : la cote est sélectionnée');
    A(labels.length===4&&/Modifier/.test(labels[0])&&/RÉFÉRENCE/.test(labels[1])&&/Replacer/.test(labels[2])&&/Supprimer/.test(labels[3]),'H. menu : '+labels.join(' | '));}
  });
  closeSketch(false);
  return out;
}
const {ctx}=loadApp();
const out=vm.runInContext('('+inVm.toString()+')()',ctx,{filename:'test_esquisse_cotes_souples.js'});
console.log('=== Esquisse : cotation plus souple (texte glissé, saisie pendant la pose, référence à la demande, ƒx au clic) ===');
out.log.forEach(m=>console.log('  ✓ '+m));
out.fails.forEach(m=>console.log('  ✗ '+m));
console.log(out.fails.length?'\n*** '+out.fails.length+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(out.fails.length?1:0);
