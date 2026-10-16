// 2026-10-16-001 : règles d'esquisse (liste de l'utilisateur, 13 points).
//  1-3 couleurs selon l'état de contrainte (analyse de RANG) · 4 cote en sur-contrainte →
//  RÉFÉRENCE (grise, entre parenthèses) · 5 saisie immédiate · 6 double-clic ligne de cote ·
//  7 lignes d'attache prolongées · 8 H/V/tangence prioritaires sur les cotes ·
//  9-10 axe de rotation + cotes en Ø · 11 1re cote = mise à l'échelle, congé proportionné ·
//  12 ligne en chaîne / cercle actif · 13 Échap · + rayons de congé jamais « référence ».
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx}=loadApp();
  const R=[
'const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};',
'const L=(id,a,b)=>({id:id,t:"line",p1:a,p2:b});',
'const mount=sk=>{ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);return skEdit;};',
'const rect=(cons,dims)=>mount({id:"r"+(rect.n=(rect.n||0)+1),name:"R",plane:"XY",visible:true,points:{O:{x:0,y:0},p0:{x:10,y:10},p1:{x:60,y:10},p2:{x:60,y:40},p3:{x:10,y:40}},',
'  entities:[L("e0","p0","p1"),L("e1","p1","p2"),L("e2","p2","p3"),L("e3","p3","p0")],',
'  constraints:[{id:"c0",type:"h",line:"e0"},{id:"c1",type:"v",line:"e1"},{id:"c2",type:"h",line:"e2"},{id:"c3",type:"v",line:"e3"}].concat(cons||[]),dims:dims||[],seq:50});',
// ── 1-3 couleurs
'let sk=rect();let I=skDofInfo(sk);',
'A(I.dof===4&&!sk.entities.some(e=>I.entFull(e)),"1 : rectangle H/V seul : 4 DDL, toutes les entités LIBRES (bleu) — "+I.dof);',
'sk.constraints.push({id:"co",type:"coincident",a:"p0",b:"O"});sk.dims.push({id:"d1",type:"length",line:"e0",value:50,ox:0,oy:0});afterEdit();I=skDofInfo(sk);',
'A(I.dof===1&&I.entFull(entById(sk,"e0"))&&!I.entFull(entById(sk,"e1")),"2 : partiellement contrainte : le bas (accroché + coté) est BLANC, les verticales restent bleues");',
'sk.dims.push({id:"d2",type:"length",line:"e1",value:30,ox:0,oy:0});afterEdit();I=skDofInfo(sk);',
'A(I.dof===0&&sk.entities.every(e=>I.entFull(e)),"3 : complètement contrainte : 0 DDL, tout BLANC");',
// ── 4 cote en sur-contrainte → référence
'sk.dims.push({id:"d3",type:"length",line:"e2",value:44,ox:0,oy:0});afterEdit();',
'const d3=sk.dims.find(d=>d.id==="d3");',
'A(d3.ref===true,"4a : une cote qui sur-contraint devient une cote de RÉFÉRENCE");',
'A(Math.abs(d3.value-50)<1e-6||(drawSketch2D(),Math.abs(d3.value-50)<1e-6),"4b : elle MESURE (50) au lieu d\\u2019imposer 44 ("+d3.value+")");',
'A((skAudit(sk).residual||0)<1e-6,"4c : aucune contrainte violée");',
'const nIn=document.body.children.length;editDim("d3");A(document.body.children.length===nIn,"4d : une cote de référence n\\u2019ouvre pas de saisie");',
// ── congé : sa cote de rayon n'est PAS une référence
'sk=rect();skFilletCorner(sk,"e0","e1",5);afterEdit();',
'const rd=sk.dims.filter(d=>d.type==="radius");',
'A(rd.length===1&&!rd[0].ref,"4e : la cote de rayon d\\u2019un congé reste PILOTANTE (pas de parenthèses)");',
// ── congés sur un rectangle coté : la cote hors-tout est gardée (capture utilisateur 90 × 105)
'sk=rect([],[{id:"W",type:"length",line:"e2",value:50,chk:1,ox:0,oy:0},{id:"H",type:"length",line:"e1",value:30,chk:1,ox:0,oy:0}]);solveSketch(sk);',
'skFilletCorner(sk,"e1","e2",5);afterEdit();skFilletCorner(sk,"e2","e3",5);afterEdit();',
'const W=sk.dims.find(d=>d.id==="W"),Hd=sk.dims.find(d=>d.id==="H");',
'const xk=Object.keys(sk.points).filter(k=>k!=="O").map(k=>sk.points[k].x),wid=Math.max(...xk)-Math.min(...xk);',
'A(W.type==="gap"&&Math.abs(W.value-50)<1e-6&&Math.abs(wid-50)<1e-6,"4f : 2 congés en haut : la cote 50 devient HORS-TOUT, le rectangle garde 50 de large ("+W.type+" "+wid.toFixed(3)+")");',
'A(Hd.type==="gap"&&Math.abs(Hd.value-30)<1e-6,"4g : la hauteur 30 aussi (côté droit rogné) → hors-tout ("+Hd.type+")");',
// ── 8 priorité : cotes incompatibles (posées en données) → les cotes cèdent, pas H/V
'sk=rect([],[{id:"a",type:"length",line:"e0",value:50,chk:1,ox:0,oy:0},{id:"b",type:"length",line:"e2",value:40,chk:1,ox:0,oy:0}]);solveSketch(sk);',
'const au=skAudit(sk),hv=au.all.filter(o=>/^c/.test(o.id)).reduce((m,o)=>Math.max(m,o.viol),0);',
'A(hv<1e-3,"8 : conflit de cotes : H/V restent respectées ("+hv.toExponential(1)+" mm), l\\u2019écart va aux cotes");',
// ── 8b glisser le CENTRE d'un congé : il ne traverse pas la ligne (capture utilisateur)
'sk=rect([],[{id:"W",type:"length",line:"e0",value:50,chk:1,ox:0,oy:0},{id:"H",type:"length",line:"e1",value:30,chk:1,ox:0,oy:0}]);solveSketch(sk);',
'["e0|e1","e1|e2","e2|e3","e3|e0"].forEach(k=>{const q=k.split("|");skFilletCorner(sk,q[0],q[1],5);afterEdit();});',
'{const arc=sk.entities.find(e=>e.t==="arc"&&sk.points[e.pc].x>50&&sk.points[e.pc].y>30),c0=sk.points[arc.pc];',
' const Cx=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};',
' const E=(t,p,ex)=>Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,clientX:p[0],clientY:p[1],preventDefault(){},stopPropagation(){}},ex||{});',
' skTool="select";const x0=c0.x,y0=c0.y;svg.dispatchEvent(E("pointerdown",Cx(x0,y0),{buttons:1}));',
' for(let k=1;k<=10;k++)svg.dispatchEvent(E("pointermove",Cx(x0+1.2*k,y0+1.2*k),{buttons:1}));svg.dispatchEvent(E("pointerup",Cx(x0+12,y0+12)));',
' const C=sk.points[arc.pc],ys=sk.entities.filter(e=>e.t==="line").map(l=>[sk.points[l.p1],sk.points[l.p2]]).flat();',
' const yMax=Math.max(...ys.map(p=>p.y)),xMax=Math.max(...ys.map(p=>p.x));',
' A(C.y<yMax-1&&C.x<xMax-1&&(skAudit(sk).residual||0)<1e-3,"8b : centre de congé glissé : il reste DANS le coin (arc non retourné) — résidu "+(skAudit(sk).residual||0).toExponential(1));}',
// ── 8c rectangle PAR LE CENTRE 90 × 64 + 4 congés (capture utilisateur) : hors-tout gardé, 0 DDL, centre de congé immobile
'sk=mount({id:"cr",name:"CR",plane:"XY",visible:true,points:{O:{x:0,y:0}},entities:[],constraints:[],dims:[],seq:20});',
'{const Cx=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};',
' const E=(t,p,ex)=>Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,clientX:p[0],clientY:p[1],preventDefault(){},stopPropagation(){}},ex||{});',
' skTool="rect";svg.dispatchEvent(E("pointerdown",Cx(0,0),{buttons:1,ctrlKey:true}));svg.dispatchEvent(E("pointerup",Cx(0,0),{ctrlKey:true}));',
' svg.dispatchEvent(E("pointermove",Cx(45,32),{ctrlKey:true}));svg.dispatchEvent(E("pointerdown",Cx(45,32),{buttons:1,ctrlKey:true}));svg.dispatchEvent(E("pointerup",Cx(45,32),{ctrlKey:true}));',
' const Ls=sk.entities.filter(e=>e.t==="line"&&!e.construction),cs=[];for(let i=0;i<Ls.length;i++)for(let j=i+1;j<Ls.length;j++){const a=Ls[i],b=Ls[j];if([a.p1,a.p2].some(p=>p===b.p1||p===b.p2))cs.push([a.id,b.id]);}',
' cs.forEach(q=>{skFilletCorner(sk,q[0],q[1],5);afterEdit();});',
' const arcs=sk.entities.filter(e=>e.t==="arc"),ok=arcs.length===4&&arcs.every(a=>Math.abs(Math.abs(sk.points[a.pc].x)-40)<1e-4&&Math.abs(Math.abs(sk.points[a.pc].y)-27)<1e-4);',
' A(ok&&skDofInfo(sk).dof===0&&(skAudit(sk).residual||0)<1e-6,"8c : rectangle par le centre 90×64 + 4 congés R5 : hors-tout gardé, 0 DDL (tout blanc), aucune contrainte violée");',
' const arc=arcs.find(a=>sk.points[a.pc].x>0&&sk.points[a.pc].y>0),c0={...sk.points[arc.pc]};skTool="select";',
' svg.dispatchEvent(E("pointerdown",Cx(c0.x,c0.y),{buttons:1}));for(let k=1;k<=10;k++)svg.dispatchEvent(E("pointermove",Cx(c0.x+0.8*k,c0.y+k),{buttons:1}));svg.dispatchEvent(E("pointerup",Cx(c0.x+8,c0.y+10)));',
' const c1=sk.points[arc.pc];A(Math.hypot(c1.x-c0.x,c1.y-c0.y)<1e-4&&(skAudit(sk).residual||0)<1e-5,"8d : glisser le centre d’un congé d’une esquisse complète : rien ne bouge, rien ne se retourne");}',
// ── 9-10 axe + cotes en Ø
'sk=mount({id:"ax",name:"AX",plane:"XY",visible:true,points:{O:{x:0,y:0},a0:{x:0,y:0},a1:{x:0,y:50},q:{x:12,y:20}},entities:[L("ax","a0","a1"),{id:"cp",t:"cpoint",p:"q"}],constraints:[],dims:[],seq:20});',
'skToggleAxis("ax");const ax=entById(sk,"ax");',
'A(ax.axis&&ax.construction,"9 : ligne → axe de rotation (hors profil)");',
'sk.dims.push({id:"dd",type:"distline",line:"ax",p:"q",value:12,ox:0,oy:0});afterEdit();const dd=sk.dims.find(d=>d.id==="dd");',
'A(dd.dia===true&&!dd.ref,"10a : cote depuis l\\u2019axe = cote de DIAMÈTRE");',
'editDim("dd");const inp=document.body.children[document.body.children.length-1];',
'A(inp&&String(inp.value)==="24","10b : saisie en Ø : 24 affiché pour un rayon de 12 ("+(inp&&inp.value)+")");',
'try{inp.value="30";inp.dispatchEvent({type:"keydown",key:"Enter",stopPropagation(){}});}catch(e){}',
'A(Math.abs(sk.points.q.x-15)<1e-6,"10c : Ø30 saisi → point à 15 de l\\u2019axe ("+sk.points.q.x+")");',
// ── 11 1re cote : mise à l'échelle de toute l'esquisse ; congé proportionné
'sk=mount({id:"tr",name:"T",plane:"XY",visible:true,points:{O:{x:0,y:0},a:{x:100,y:100},b:{x:180,y:100},c:{x:140,y:160}},entities:[L("u","a","b"),L("v","b","c"),L("w","c","a")],constraints:[],dims:[],seq:20});',
'sk.dims.push({id:"t1",type:"length",line:"u",value:80,ox:0,oy:0});afterEdit();',
'const lv0=lineLen(sk,entById(sk,"v"));skFirstDimScale(sk,sk.dims[0],8);sk.dims[0].value=8;solveSketch(sk);',
'A(Math.abs(lineLen(sk,entById(sk,"u"))-8)<1e-6&&Math.abs(lineLen(sk,entById(sk,"v"))-lv0/10)<1e-6,"11a : 1re cote 80 → 8 : toute l\\u2019esquisse ×0,1 (proportions gardées)");',
'A(skNiceVal(0.2*7)===1&&skNiceVal(0.2*80)===10,"11b : congé / chanfrein par défaut proportionné (valeur ronde ≤ 20 % de la ligne)");',
// ── 12 ligne en chaîne / cercle actif · 13 Échap
'sk=mount({id:"ch",name:"CH",plane:"XY",visible:true,points:{O:{x:0,y:0}},entities:[],constraints:[],dims:[],seq:20});',
'const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};',
'const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,detail:1,pointerId:1,preventDefault(){},stopPropagation(){}},ex||{});r.clientX=x;r.clientY=y;return r};',
'const click=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev("pointerdown",p[0],p[1],{buttons:1}));svg.dispatchEvent(ev("pointerup",p[0],p[1]));};',
'const mv=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev("pointermove",p[0],p[1]));};',
'skTool="line";click(10,10);mv(30,10);click(30,10);mv(30,30);click(30,30);',
'const nl=sk.entities.filter(e=>e.t==="line").length;',
'A(nl===2&&skTool==="line"&&!!skDown,"12-1 : 2 lignes enchaînées, l\\u2019outil Ligne reste actif et la 3e est armée ("+nl+")");',
'{const ov=$("sketchOverlay");ov.classList=Object.assign({},ov.classList,{contains:()=>true});}window.dispatchEvent({type:"keydown",key:"Escape",target:document.body,preventDefault(){},stopPropagation(){}});',
'A(skTool==="select"&&!skDown,"13 : Échap termine la chaîne et revient à la sélection");',
'skTool="circle";click(60,60);mv(70,60);click(70,60);',
'A(sk.entities.filter(e=>e.t==="circle").length===1&&skTool==="circle","12-2 : cercle créé, l\\u2019outil Cercle reste actif");',
// ── icône
'A(/fill="currentColor"/.test(SK_ICONS.hpoint)&&/circle/.test(SK_ICONS.hpoint),"icône centre de perçage : cible + foret");',
// ── ligne < 0,5 mm (seuil en pixels écran, plus en mm)
'sk=mount({id:"pt",name:"PT",plane:"XY",visible:true,points:{O:{x:0,y:0}},entities:[],constraints:[],dims:[],seq:20});',
'skView.s=400;skUpdateTols();skTool="line";click(1,1);mv(1.2,1);click(1.2,1);',
'const sl=sk.entities.filter(e=>e.t==="line");',
'A(sl.length===1&&Math.abs(lineLen(sk,sl[0])-0.2)<1e-3,"14 : zoomé, une ligne de 0,2 mm se crée ("+(sl[0]?lineLen(sk,sl[0]).toFixed(3):"aucune")+")");',
'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-16-001 : règles d’esquisse ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
