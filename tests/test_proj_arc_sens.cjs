// 2026-10-03-001 : projection d'arête CIRCULAIRE — jamais l'inverse (le complément de l'arc).
// Bug document réel (arêtes.json de l'utilisateur) : rectangle 110x80 extrudé 20 mm en biseau
// 15° + 4 congés r=20 → face haute arrondie (R≈19.06). Esquisse 6 (sk_9_mush0fu4) projette
// 4 lignes + 4 arcs ; dans le document SAUVEGARDÉ, Projetée 3 (e17, coin haut-droit) a
// span CCW = 268.5° au lieu de 91.5° : l'arc entité va TOUJOURS de pa à pb en trigonométrique
// (arcAngles), mais la projection prenait pa=pts[0]/pb=pts[dernier] dans l'orientation OCCT
// de l'arête — orientation arbitraire : quand l'arête est parcourue « à l'envers », le CCW
// devient le COMPLÉMENT de l'arête (l'inverse). e30/e43/e56 étaient bons par chance.
// CONTRAT :  A) après rejeu (updateAllProjections), chaque arc projeté couvre SON arête
//               (le milieu source srcMid projeté tombe dans le secteur pa→pb) ;
//            B) projeter au milieu d'une arête circulaire renvoie un arc CONTENANT le clic
//               et LA même arête source — jamais son complément.
// Harnais : noyau OCCT réel (wasm) + le document utilisateur (fixture tests/fixtures/arêtes.json).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'tests','fixtures','arêtes.json'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body='const DOC='+JSON.stringify(json)+';\n'+`
    const out={fails:[],info:{}};
    const A=(c,m)=>{if(!c)out.fails.push(m);};
    await deserialise(DOC,{rebuild:false});
    occCkClear();markDirty();rebuild();
    const sk=doc.sketches.find(s=>s.id==='sk_9_mush0fu4');
    A(!!sk,'Esquisse 6 (sk_9_mush0fu4) présente dans le document');
    const arcs=(sk?sk.entities:[]).filter(e=>e.t==='arc'&&e.proj);
    out.info.nProjArcs=arcs.length;
    A(arcs.length===4,'Esquisse 6 : 4 arcs projetés ('+arcs.length+')');
    // milieu 3D source projeté dans le plan d'esquisse
    const mid2=(e)=>{const b=sketchBasis(sk),m=e.srcMid;if(!m)return null;
      const o=b.o,u=b.u,v=b.v;
      return [(m[0]-o.x)*u.x+(m[1]-o.y)*u.y+(m[2]-o.z)*u.z,
              (m[0]-o.x)*v.x+(m[1]-o.y)*v.y+(m[2]-o.z)*v.z];};
    const inArc=(sk,e)=>{const C=sk.points[e.pc],an=arcAngles(sk,e),m=mid2(e);
      if(!C||!an||!m)return null;
      return angInArc(Math.atan2(m[1]-C.y,m[0]-C.x),an.a1,an.a2);};
    const diag=(e)=>{const C=sk.points[e.pc],an=arcAngles(sk,e),m=mid2(e);
      if(!C||!an||!m)return e.id+':?';
      const am=Math.atan2(m[1]-C.y,m[0]-C.x);
      return e.id+' span='+((an.a2-an.a1)*180/Math.PI).toFixed(1)+'° sensOK='+angInArc(am,an.a1,an.a2);};
    // ── A : rafraîchissement associatif — jamais le complément de l'arête ──
    updateAllProjections();
    out.info.A=arcs.map(diag);
    A(arcs.every(e=>inArc(sk,e)===true),
      'A1 : après rejeu, chaque arc projeté couvre SON arête (pa→pb trigonométrique contenant le milieu) — '+out.info.A.join(' | '));
    // ── B : création — le clic est CONTENU dans l'arc renvoyé, sur la BONNE arête ──
    out.info.B=[];
    arcs.forEach((e,i)=>{
      const m=mid2(e);
      const pr=m?projectEdgeAt(sk,m[0],m[1]):null;
      let ok=false,edge=false;
      if(pr&&pr.type==='arc'){
        const a1=Math.atan2(pr.y1-pr.cy,pr.x1-pr.cx),a2=Math.atan2(pr.y2-pr.cy,pr.x2-pr.cx);
        ok=angInArc(Math.atan2(m[1]-pr.cy,m[0]-pr.cx),a1,a2);
        edge=!!(pr.srcMid&&e.srcMid&&
          Math.hypot(pr.srcMid[0]-e.srcMid[0],pr.srcMid[1]-e.srcMid[1],pr.srcMid[2]-e.srcMid[2])<1e-6);
      }
      const d=e.id+' '+(pr?pr.type:'aucune')+' sensOK='+ok+' memeArrete='+edge;
      out.info.B.push(d);
      A(!!(pr&&pr.type==='arc'),'B'+(i+1)+'.1 : arête circulaire détectée au milieu de '+e.id+' — '+(pr?JSON.stringify(pr):'aucune'));
      if(pr&&pr.type==='arc'){
        A(ok,'B'+(i+1)+'.2 : l\\'arc renvoyé contient le point cliqué (jamais son complément) — '+d);
        A(edge,'B'+(i+1)+'.3 : LA bonne arête source est choisie — '+d);
      }
    });
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  console.log('=== projection circulaire : le sens de l\'arête, jamais son inverse ===');
  Object.keys(o.info||{}).forEach(k=>console.log('  '+k+' : '+JSON.stringify(o.info[k])));
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
