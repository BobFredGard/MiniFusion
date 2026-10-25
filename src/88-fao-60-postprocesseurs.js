/* ================= post-processeurs ================= */
// Table des machines : UN FICHIER PAR MACHINE dans PostPro/*.js (2026-10-23), intégré au
// livrable par build.js juste après ce fichier ; chacun appelle faoMachine({…}).
// `kind` porte le dialecte (en-tête, commentaires, cycles) — le corps du programme est
// commun ; le reste (axes, numérotation, codes M, changement d'outil, fin) vient du fichier.
const FAO_POSTS={};
const FAO_POST_DEF={
  siemens:{ext:'mpf',axes:5,numbers:null,coolant:{flood:'M7',through:'M8',off:'M9'},
    toolChange:['T{T} D1','M6'],spindle:'S{S} M3',end:['G0 SUPA Z600 D0','M30']},
  fagor:{ext:'nc',axes:3,numbers:{start:10,step:5},coolant:{flood:'M08',through:'M08',off:'M09'},
    toolChange:['T{T} D1 M06'],spindle:'S{S} M03',end:['G0 Z{ZRETR}','#MSG[""]','M30']}
};
function faoMachine(def){
  if(!def||!def.id)return;
  const kind=def.kind==='fagor'?'fagor':'siemens',D=FAO_POST_DEF[kind];
  FAO_POSTS[def.id]=Object.assign({},D,def,{kind:kind,label:def.label||def.id,
    coolant:Object.assign({},D.coolant,def.coolant||{})});
}
// lignes d'un modèle de la fiche machine : {T}, {S}, {ZRETR}, {NAME}
function faoPostLines(tpl,v){
  return (Array.isArray(tpl)?tpl:(tpl?[tpl]:[])).map(function(l){
    return String(l).replace(/\{(\w+)\}/g,function(m,k){return v[k]!==undefined?String(v[k]):m;});
  });
}
function faoToday(){ try{ return new Date().toISOString().slice(0,10); }catch(e){ return ''; } }

function faoArcWords(m,ox,oy,oz){
  // Bloc G2/G3 complet, IJK incrémental (centre relatif au départ).
  return (m.arc.cw?'G2 ':'G3 ')+'X'+faoFmtXYZ(m.x-ox)+' Y'+faoFmtXYZ(m.y-oy)+
    ' Z'+faoFmtXYZ(m.z-oz)+' I'+faoFmtXYZ(m.arc.i)+' J'+faoFmtXYZ(m.arc.j);
}
/* ----- cycle de perçage dialecte (P1-a) -----
   Mêmes valeurs que le déroulé G0/G1 (retrait = plan d'usinage de l'opération
   depuis 2026-10-08-002, plan de référence = ztop, profondeur = zbot) : la
   prévisualisation, l'estimation et le garde-fou « sous le brut » restent
   calés sur le déroulé.
   Siemens 840D : CYCLE81(RTP,RFP,SDIS,DP) / CYCLE83 (broche à va-et-vient,
   paramètres alignés sur PostPro/630-5axes.cps).
   Fagor 8065    : `G98 G81 X Y Z I F` / `G98 G83 X Y Z I J F` (aligné sur
   PostPro/fagor-8065.cps) + annulation `G80` (cycles modaux). */
function faoDrillCycle(op,job,oz){
  if(!op||op.type!=='drill')return null;
  if(faoOpFrame(job,op))return null; // repère d'opération incliné : perçage émis en déroulé G0/G1
  if(op.cycle==='helix')return null; // fraisage hélicoïdal : émis en G1/G2/G3 comme un parcours
  // 2026-10-15-011 : un plan PAR TROU (départ et fond propres — trous du modèle à
  // des hauteurs différentes), dans l'ordre optimisé. Saisie XY : comme avant.
  const plan=faoDrillPlan(op,job);
  if(!plan.length)return null;
  // retrait du cycle = plan d'usinage de l'opération, jamais sous un départ de trou
  const secuAbs=faoZoneSecu(op,job);
  const zTopMax=plan.reduce(function(m,p){return Math.max(m,p.rfp);},-Infinity);
  const RTP=Math.max(secuAbs,zTopMax+2)-oz;
  const cyc=op.cycle||'drill';
  const dwell=isFinite(+op.dwell)&&+op.dwell>0?+op.dwell:0;
  const holes=plan.map(function(p){
    const RFP=p.rfp-oz, DP=p.zTip-oz, span=p.rfp-p.zTip;
    let peck=(cyc==='peck'||cyc==='chip'||(!op.cycle&&+op.peck>0))?(isFinite(+op.peck)&&+op.peck>0?+op.peck:0):0;
    if(!(peck>0&&span>peck))peck=0;
    return {x:p.x,y:p.y,RFP:RFP,SDIS:Math.max(0,RTP-RFP),DP:DP,span:span,peck:peck};
  });
  const h0=holes[0];
  // compat : pts / RFP / DP / peck / span du 1er trou (anciens appelants, tests)
  const tT=faoToolById(job,op.toolId);
  return {holes:holes,pts:plan.map(function(p){return [p.x,p.y];}),RTP:RTP,RFP:h0.RFP,SDIS:h0.SDIS,DP:h0.DP,
    peck:h0.peck,span:h0.span,chip:cyc==='chip',dwell:dwell,
    tap:cyc==='tap'?{p:(tT&&+tT.p>0)?+tT.p:1}:null};
}
// Post unifié : un seul corps de programme, dialecte réduit à la tête/pied + style de ligne.
//  - Siemens 840D : lignes brutes, commentaires `;`, fin SUPA Z600 + parc machine
//  - Fagor 8065    : lignes numérotées `N##` (+5), commentaires `( … )`, retrait Z classique
// Plongée : le F de plongée ne s'applique qu'à la première plongée Z après un rapide —
// un pur déplacement XY garde l'avance de coupe (correctif du bug Fagor).
function faoPost(job,postId){
  const id=postId||(job&&(job.machine||job.post))||'siemens630';
  const post=FAO_POSTS[id]||FAO_POSTS.siemens630||FAO_POSTS[Object.keys(FAO_POSTS)[0]];
  const fag=post.kind==='fagor';
  const ax3=post.axes===3; // machine sans axe rotatif : 3+2 jamais commandé
  const name=faoProgName(job.name);
  const wcs=job.wcs||'G54';
  const OG=faoOriginPoint(job), ox=OG[0], oy=OG[1], oz=OG[2];
  // Repli : plan de retrait du posage (aucune op ON -> groupe sans bloc).
  const retr=faoRetractZ(job);
  let retrPrev=retr; // plan de retrait du groupe précédent (retrait inter-outils)
  // Indexation 3+2 (table C + B) : {0,0} = 3 axes strictement inchangé.
  const ORI=faoOrient(job), ori32=(ORI.b!==0||ORI.c!==0);
  const groups=faoJobMoves(job);
  const SEQ=faoSeqSafe(job); // rapids normalisés au plan de sécurité
  const safe=faoSafeZ(job);
  // Garde-fou : aucun move de coupe (G1/G2/G3) sous le fond du brut — signalé en
  // tête de programme (le opérateur le voit) et remonté dans le résultat (warns).
  const z0=(job&&job.stock&&isFinite(+job.stock.z0))?+job.stock.z0:0;
  let sousBrut=0, zMin=Infinity;
  groups.forEach(function(g){ g.blocks.forEach(function(b){ b.moves.forEach(function(m){
    if(!m.r&&isFinite(+m.z)&&+m.z<z0-1e-6){ sousBrut++; if(+m.z<zMin)zMin=+m.z; }
  });}); });
  const warns=[];
  if(sousBrut)warns.push(sousBrut+' move(s) de coupe sous le brut (Zmin '+
    faoFmtXYZ(zMin)+' < fond du brut '+faoFmtXYZ(z0)+')');
  if(ori32&&ax3)warns.push('3+2 (B'+ORI.b+' C'+ORI.c+') : '+post.label+' = machine 3 axes — indexation '+
    'IGNORÉE : B/C non commandés, programme émis en 3 axes (la pièce ne sera PAS inclinée). '+
    'Remettre 3 axes ou exporter sur Siemens.');
  const staleCh=(job.ops||[]).filter(function(o){
    return o&&o.on!==false&&((o.limit&&(o.limit.mode==='chain'||o.limit.mode==='sketch')&&o.limit.stale)||
      (o.limit2&&(o.limit2.mode==='chain'||o.limit2.mode==='sketch')&&o.limit2.stale)||(o.zlim&&o.zlim.stale));
  }).length;
  if(staleCh)warns.push(staleCh+' opération(s) : limite « chaîne »/« esquisse »/îlot/Z obsolète (arêtes du modèle '+
    'non retrouvées ou esquisse modifiée) — re-sélectionner / re-choisir avant export');
  const L=[], NUM=post.numbers; let n=NUM?+NUM.start||10:0;
  const nc=function(s){ if(NUM){ L.push('N'+n+' '+s); n+=+NUM.step||5; } else L.push(s); };
  const cmt=function(s){ L.push(fag?('( '+s+' )'):('; '+s)); };
  const CO=post.coolant;
  const cool=(job.coolant==='off')?null:(job.coolant==='through'?CO.through:CO.flood);
  // G40 (annule la compensation d'outil) + G80 (annule les cycles en canneau) en
  // entête : programme démarré proprement, jamais laissé d'un usage précédent.
  if(fag){
    L.push('('+name+' - MiniFusion FAO '+FAO_VER+' - '+post.label+' - '+faoToday()+')');
    L.push('('+faoOriginLabel(job)+' - origine '+wcs+')');
    if(warns.length)cmt('ATTENTION : '+warns.join(' ; '));
    nc('G71 G40 G80 G17 G90 G94 '+wcs);
  }else{
    L.push('; %_N_'+name+'_MPF');
    L.push('; MiniFusion FAO '+FAO_VER+' — '+post.label+' — '+faoToday());
    L.push('; Origine '+wcs+' : '+faoOriginLabel(job)+
      ' ('+faoFmtXYZ(ox)+','+faoFmtXYZ(oy)+','+faoFmtXYZ(oz)+')');
    if(warns.length)cmt('ATTENTION : '+warns.join(' ; '));
    nc('G71');
    nc('G40 G80 G17 G90 G94 '+wcs);
  }
  // 3+2 : indexation de table AVANT tout usinage. Siemens : TRAORI(1) — le
  // contrôleur transforme XYZ (arcs et cycles restent dans le repère pièce).
  // Fagor 8065 = machine 3 AXES uniquement : aucun axe rotatif — ne JAMAIS
  // commander B/C (alarme CN) ni laisser croire à une inclinaison : à plat.
  if(ori32){
    if(ax3){
      cmt('3+2 : B'+faoFmtXYZ(ORI.b)+' C'+faoFmtXYZ(ORI.c)+
        ' demandé — machine 3 axes : B/C NON commandés, usinage à plat (voir avertissement)');
    }else{
      nc('TRAORI(1)');
      nc('G0 B'+faoFmtXYZ(ORI.b)+' C'+faoFmtXYZ(ORI.c));
    }
  }
  nc('G0 Z'+faoFmtXYZ(safe-oz)); // plan de sécurité : Z seul avant tout déplacement XY
  let qi=0, prev=null;
  // 2026-10-16-020 : orientation 3+2 PAR OPÉRATION (repère propre de l'opération) ;
  // l'ancien 3+2 du posage reste l'orientation par défaut.
  let oriCur={b:ORI.b,c:ORI.c}, traOn=ori32&&!ax3, fagWarn=false;
  groups.forEach(function(g,gi){
    const t=g.tool;
    const S=faoFmtS(t.s), F=faoFmtF(t.f), FP=faoFmtF(t.plunge);
    // Plan de retrait du groupe en cours = plan de sa 1re opération (hérité
    // du posage sinon) — 2026-10-08-002, plans par opération.
    let retrCur=retr;
    for(let bi=0;bi<(g.blocks||[]).length;bi++){
      const qb=g.blocks[bi]&&g.blocks[bi].op;
      if(qb&&qb.on!==false){ retrCur=faoRetractAbs(qb,job); break; }
    }
    if(gi>0){ nc(CO.off); nc('G0 Z'+faoFmtXYZ(retrPrev-oz)); }
    retrPrev=retrCur;
    const toolF=faoToolById(job,t.id)||{};
    cmt('OUTIL T'+(t.num||1)+' '+faoKindLabel(toolF.kind)+
      ' D'+faoFmtXYZ(t.d)+' S'+S+' F'+F);
    faoPostLines(post.toolChange,{T:t.num||1,NAME:name}).forEach(nc);
    faoPostLines(post.spindle,{S:S}).forEach(nc);
    if(cool)nc(cool);
    let sCur=S;
    g.blocks.forEach(function(b){
      // 2026-10-15-010 : conditions de coupe de CETTE opération (fiche outil ou
      // surcharge de l'opération). Par défaut identiques au groupe → sortie inchangée.
      const CB=b.cut||faoOpCutting(b.op,job);
      const SB=faoFmtS(CB.s), F=faoFmtF(CB.f), FP=faoFmtF(CB.plunge), FE=faoFmtF(CB.entry), FR=faoFmtF(CB.retract);
      if(SB!==sCur){ nc('S'+SB); sCur=SB; }
      cmt(faoOpLabel(b.op,job));
      // 2026-10-13-007 : #MSG par opération sur Fagor (rétro-ingénierie
      // cav.txt : N60 #MSG["OPT1: Paroies"]) — l'opérateur voit l'opération
      // en cours sur la CN. Sanitisé ASCII, sans G1 ni F (parité post intacte).
      if(fag){ try{ nc('#MSG["'+faoOpAscii(faoOpLabel(b.op,job))+'"]'); }catch(e){} }
      const OB=faoOpBC(job,b.op)||{b:ORI.b,c:ORI.c};
      if(OB.b!==oriCur.b||OB.c!==oriCur.c){
        if(ax3){
          cmt('3+2 : B'+faoFmtXYZ(OB.b)+' C'+faoFmtXYZ(OB.c)+' demandé — machine 3 axes : B/C NON commandés');
          if(!fagWarn){ fagWarn=true; warns.push('Repère d’opération incliné : '+post.label+' = machine 3 axes — orientation B/C ignorée à l’export.'); }
        }else{
          const zr=Math.max(safe,prev?+prev.z:safe); // déjà au-dessus après un 3+2 : ne pas redescendre
          nc('G0 Z'+faoFmtXYZ(zr-oz)); // dégagement AVANT de réorienter l'outil
          if(prev)prev={x:prev.x,y:prev.y,z:zr};
          if(OB.b!==0||OB.c!==0){
            if(!traOn){ nc('TRAORI(1)'); traOn=true; }
            nc('G0 B'+faoFmtXYZ(OB.b)+' C'+faoFmtXYZ(OB.c));
          }else{
            nc('G0 B0 C0');
            if(traOn){ nc('TRAFOOF'); traOn=false; }
          }
        }
        oriCur={b:OB.b,c:OB.c};
      }
      const sq=SEQ[qi++]||{moves:b.moves};
      // Plan de dégagement de CETTE opération (hérité du posage sinon) —
      // 2026-10-08-002 : la plongée/translation passe par son propre plan.
      const safeB=faoClearAbs(b.op,job);
      // P1-a : perçage émis en cycle dialecte — le déroulé G0/G1 reste la
      // source prévisualisation/estimation/garde-fou mais n'est pas écrit ici.
      const DC=faoDrillCycle(b.op,job,oz);
      if(DC){
        // 2026-10-15-011 : départ (RFP) et fond (DP) PAR TROU ; temporisation (G82 /
        // CYCLE82, CYCLE83 DTB) ; brise-copeaux : CYCLE83 VARI=0 (Siemens), passes
        // explicites G1/G0 sur Fagor (syntaxe G73 8065 à confirmer en atelier).
        (DC.holes||[]).forEach(function(H){
          const X='X'+faoFmtXYZ(+H.x-ox), Y='Y'+faoFmtXYZ(+H.y-oy);
          const DTB=DC.dwell>0?faoFmtXYZ(DC.dwell):'';
          if(DC.tap){
            // 2026-10-15-013 : TARAUDAGE RIGIDE (F = pas × S). Siemens : CYCLE84 avec
            // PIT = pas (positif = filet à droite), SDAC=3 (M3 après cycle), SST = SST1 = S.
            // Fagor 8065 : G84 rigide (R1) — syntaxe à valider sur la machine.
            if(fag){
              nc('G98 G84 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+' I'+faoFmtXYZ(H.DP)+' K0 R1 F'+F);
            }else{
              nc('G0 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP));
              nc('CYCLE84('+faoFmtXYZ(DC.RTP)+', '+faoFmtXYZ(H.RFP)+', '+faoFmtXYZ(H.SDIS)+', '+faoFmtXYZ(H.DP)+', , '+DTB+', 3, , '+faoFmtXYZ(DC.tap.p)+', 0, '+SB+', '+SB+')');
            }
            return;
          }
          if(fag){
            if(H.peck&&DC.chip){
              nc('G0 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP));
              nc('G0 Z'+faoFmtXYZ(H.RFP+Math.min(2,H.SDIS)));
              let z=H.RFP;
              while(z>H.DP+1e-6){
                z=Math.max(H.DP,z-H.peck);
                nc('G1 Z'+faoFmtXYZ(z)+' F'+FP);
                if(z>H.DP+1e-6)nc('G0 Z'+faoFmtXYZ(z+0.5));
              }
              if(DC.dwell>0)nc('G4 K'+faoFmtXYZ(DC.dwell));
              nc('G0 Z'+faoFmtXYZ(DC.RTP));
            }else if(H.peck){
              const pl=Math.max(Math.floor(H.span/H.peck),1);
              const inc=-(H.span/pl);
              nc('G98 G83 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+
                ' I'+faoFmtXYZ(inc)+' J'+pl+' F'+FP);
            }else if(DC.dwell>0){
              nc('G98 G82 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+
                ' I'+faoFmtXYZ(H.DP)+' K'+faoFmtXYZ(DC.dwell)+' F'+FP);
            }else{
              nc('G98 G81 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+
                ' I'+faoFmtXYZ(H.DP)+' F'+FP);
            }
          }else{
            // F de plongée sur chaque G0 : séquence d'avances identique au Fagor.
            nc('G0 '+X+' '+Y+' Z'+faoFmtXYZ(DC.RTP)+' F'+FP);
            nc(H.peck
              ? 'CYCLE83('+faoFmtXYZ(DC.RTP)+', '+faoFmtXYZ(H.RFP)+', '+
                faoFmtXYZ(H.SDIS)+', '+faoFmtXYZ(H.DP)+', , '+
                faoFmtXYZ(H.RFP-H.peck)+', , 0, '+DTB+', , 1, '+(DC.chip?'0':'1')+', , '+
                faoFmtXYZ(H.peck)+', 0, 0, 0)'
              : (DC.dwell>0
                ? 'CYCLE82('+faoFmtXYZ(DC.RTP)+', '+faoFmtXYZ(H.RFP)+', '+
                  faoFmtXYZ(H.SDIS)+', '+faoFmtXYZ(H.DP)+', , '+DTB+')'
                : 'CYCLE81('+faoFmtXYZ(DC.RTP)+', '+faoFmtXYZ(H.RFP)+', '+
                  faoFmtXYZ(H.SDIS)+', '+faoFmtXYZ(H.DP)+', )'));
          }
        });
        if(fag)nc('G80'); // Fagor : les cycles sont modaux, annulation obligatoire
        // La machine repose au plan du cycle (dessus + sortie) sur le dernier trou.
        if(DC.pts.length){
          const lp=DC.pts[DC.pts.length-1];
          prev={x:+lp[0],y:+lp[1],z:faoZoneSecu(b.op,job)};
        }
        return;
      }
      let first=true; const b32=!!(b.op&&faoOpFrame(job,b.op));
      sq.moves.forEach(function(m){
        // Plan de sécurité : retrait sur place -> translation au plan -> plongée.
        const ins=b32?null:faoSafeAhead(prev,m,safeB); // 3+2 : déjà fait le long de son Z (faoSeqSafeOp)
        if(ins)for(let q=0;q<ins.length;q++){
          const J=ins[q];
          nc('G0 X'+faoFmtXYZ(J.x-ox)+' Y'+faoFmtXYZ(J.y-oy)+' Z'+faoFmtXYZ(J.z-oz));
          first=true;
        }
        const X='X'+faoFmtXYZ(m.x-ox), Y='Y'+faoFmtXYZ(m.y-oy), Z='Z'+faoFmtXYZ(m.z-oz);
        if(m.r){ nc('G0 '+X+' '+Y+' '+Z); first=true; }
        else if(m.arc){ nc(faoArcWords(m,ox,oy,oz)+' F'+(m.ent?FE:F)); first=false; }
        else{
          // première plongée après un rapide : avance de plongée ; mouvement d'entrée
          // (rampe, hélice, approche) : F entrée ; remontée verticale : F remontée ;
          // sinon avance de coupe.
          const plunge=first&&/Z/.test(Z);
          const up=!plunge&&prev&&Math.abs(m.x-prev.x)<1e-6&&Math.abs(m.y-prev.y)<1e-6&&m.z>prev.z+1e-6;
          nc('G1 '+X+' '+Y+' '+Z+' F'+(plunge?FP:(m.ent?FE:(up?FR:F))));
          first=false;
        }
        prev=m;
      });
    });
  });
  // 3+2 : annuler la transformation AVANT les coordonnées machine de fin (SUPA/park).
  if(traOn)nc('TRAFOOF');
  nc(CO.off);
  // fin de la fiche machine (Fagor : retrait + #MSG[""] qui efface le message op — cav.txt N243150 ;
  // Siemens : SUPA Z600 + parc machine)
  faoPostLines(post.end,{ZRETR:faoFmtXYZ(retrPrev-oz),NAME:name}).forEach(nc);
  return {code:L.join('\n')+'\n', ext:post.ext, warns:warns};
}

function faoOpAscii(s){
  // 2026-10-13-007 : libellé sanitisé ASCII pour #MSG Fagor (rétro-ingénierie
  // cav.txt : #MSG["OPT1: Paroies"]) — la CN n'aime ni les accents ni les
  // guillemets dans les messages.
  try{
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[#"\r\n]/g,' ').slice(0,64);
  }catch(e){ return String(s||'').replace(/[^\x20-\x7e]/g,' ').slice(0,64); }
}
function faoOpLabel(op,job){
  if(!op)return '?';
  const t=op.type;
  const tool=job?faoToolById(job,op.toolId):null;
  const tag=tool?(' [T'+tool.num+' D'+tool.d+']'):'';
  const off=(op&&op.on===false)?' (désactivée)':'';
  const RA=faoRA(op||{});
  const ra=((op&&(op.type==='pocket'||op.type==='contour'||op.type==='rough3d'||op.type==='facing'))&&(RA.radial>0||RA.axial>0))?(' R'+RA.radial+' A'+RA.axial):'';
  const lim=((op&&op.limit&&(op.limit.mode==='rect'||((op.limit.mode==='chain'||op.limit.mode==='sketch')&&(op.limit.loop||[]).length>=3)))
    ?' [limite]'+(op.limit.stale?'⚠':''):'')
    +((op&&op.limit2&&(op.limit2.mode==='rect'||((op.limit2.mode==='chain'||op.limit2.mode==='sketch')&&(op.limit2.loop||[]).length>=3)))
    ?' [îlot]'+(op.limit2.stale?'⚠':''):'')
    +((op&&op.zlim)?' [Z]'+(op.zlim.stale?'⚠':''):'')
    +((op&&Array.isArray(op.protect)&&op.protect.length)?' ['+op.protect.length+' intouchable'+(op.protect.length>1?'s':'')+']':'')
    +((op&&op.type==='geofinish'&&Array.isArray(op.faces)&&op.faces.length)?' ['+op.faces.length+' usinable'+(op.faces.length>1?'s':'')+']':'');
  if(t==='facing')return 'Surfaçage Z='+op.z+tag+off+ra+lim;
  if(t==='pocket'&&faoPocketAdapt(op))return 'Poche adaptative '+((op.limit&&op.limit.nEdges)?op.limit.nEdges+' arêtes ':'(bord à sélectionner) ')+op.ztop+' -> '+op.zbot+ra+tag+off;
  if(t==='pocket')return 'Poche ['+op.x0+','+op.y0+' -> '+op.x1+','+op.y1+'] '+op.ztop+' -> '+op.zbot+ra+tag+off+lim;
  if(t==='chamfer')return 'Chanfrein '+((op.limit&&op.limit.nEdges)?op.limit.nEdges+' arêtes ':'(arêtes à sélectionner) ')+(+op.w||0.5)+' mm'+tag+off;
  if(t==='contour'&&faoContourProfil(op))return 'Contour '+((op.limit&&op.limit.nEdges)?op.limit.nEdges+' arêtes ':'(profil à sélectionner) ')+op.ztop+' -> '+op.zbot+ra+tag+off;
  if(t==='contour')return 'Contour ['+op.x0+','+op.y0+' -> '+op.x1+','+op.y1+'] '+op.ztop+' -> '+op.zbot+ra+tag+off+lim;
  if(t==='drill')return 'Perçage '+(op.pts||[]).length+' trou(s) '+op.ztop+' -> '+op.zbot+((+op.peck)>0?' Q'+op.peck:'')+tag+off+lim;
  if(t==='rough3d')return 'Ébauche 3D '+op.ztop+' -> '+op.zbot+' ap '+op.ap+ra+tag+off+lim;
  if(t==='geofinish')return 'Finition pas '+op.step+tag+off+lim;
  if(t==='geodesic')return 'Géodésique pas '+op.step+' ('+((op.faces||[]).length?(op.faces.length+' face'+(op.faces.length>1?'s':'')):'faces à choisir')+')'+tag+off;
  return t;
}

/* ================= prévisualisation 3D (décor, jamais de rejeu) ================= */
let faoPrevGroup=null, faoPrevOn=true;
let faoPrevStale=false; // « calculer puis valider » : vrai = aperçu/programme périmé
let faoPrevWanted=false; // 'full'/'lecture' : travail reporte jusqu'a la fin de la lecture du cache
let faoGenBtnEl=null;   // refs RÉELLES des boutons (lecture par id ambiguë sous stub)
let faoExportBtnEl=null;
function faoClearPreview(){
  try{
    if(faoPrevGroup&&typeof scene!=='undefined'&&scene){
      faoDel3D(faoPrevGroup);
      try{ faoPrevGroup.traverse(function(o){ if(o.geometry&&o.geometry.dispose)o.geometry.dispose(); }); }catch(e){}
    }
  }catch(e){}
  faoPrevGroup=null;
}
let faoPrevMissing=0; // ops sans parcours en memoire lors du dernier redraw en LECTURE
function faoSegSplit(moves,clip,prev0){
  // Segments par PAIRE CONSECUTIVE de la séquence réelle : coupe->coupe en
  // vert, tout passage par un rapide en rouge. Aucune liaison fantôme.
  // `clip` (zone de l'opération) ne borne QUE la coupe : la zone est une
  // frontière inviolable pendant le travail, mais un G0 a le droit de la
  // traverser — retour chercher un outil, liaison entre opérations.
  // 2026-10-08-004 : PLOONGÉES en bleu — un G1 strictement vertical qui
  // descend (plongée d'outil) sort du vert coupe ; les G0 restent rouges.
  // `prev0` (2026-10-09-005) : move précédent fourni par l'appelant — le
  // premier segment d'un découpage incrémental n'est jamais fantôme. Le
  // dernier move est renvoyé (`out.prev`) pour enchaîner le fragment suivant.
  // -> {cut:[x,y,z,...], rap:[x,y,z,...], plg:[x,y,z,...], prev:move|null}
  const out={cut:[],rap:[],plg:[],prev:null};
  if(!moves||!moves.length){ out.prev=(prev0===undefined)?null:prev0; return out; }
  let prev=(prev0===undefined)?null:prev0;
  const seg=function(arr,ax,ay,az,bx,by,bz,coupe){
    if(!clip||!coupe){ arr.push(ax,ay,az,bx,by,bz); return; }
    clip(ax,ay,az,bx,by,bz,function(x1,y1,z1,x2,y2,z2){ arr.push(x1,y1,z1,x2,y2,z2); });
  };
  moves.forEach(function(m){
    if(prev!==null){
      // plongée = G1 vertical descendant (mêmes XY, Z qui baisse) — bleu.
      const plg=!m.r&&!m.arc&&Math.abs(m.x-prev.x)<1e-9&&Math.abs(m.y-prev.y)<1e-9&&m.z<prev.z-1e-9;
      // 2026-10-08-005 : les moves étiquetés ent (hélice, rampe, arc circ,
      // descente d'entrée) sont regroupés en « plongée » pour le tracé bleu.
      // 2026-10-14-006 : TRANSITIONS entre traces (m.tr : liaisons au contact)
      // en vert avec les plongées (demande : « transitions en vert, comme pour
      // la plongée »).
      const arr=(m.r)?out.rap:((plg||m.ent||m.tr)?out.plg:out.cut); // le segment prend la commande de SA destination (G0 -> rouge)
      const coupe=!m.r;
      if(m.arc&&!prev.r){
        let pp={x:prev.x,y:prev.y,z:prev.z};
        faoArcSegs(prev,m).forEach(function(q){
          seg(arr,pp.x,pp.y,pp.z,q[0],q[1],q[2],coupe); pp={x:q[0],y:q[1],z:q[2]};
        });
      }else{
        seg(arr,prev.x,prev.y,prev.z,m.x,m.y,m.z,coupe);
      }
    }
    prev=m;
  });
  out.prev=prev;
  return out;
}
// 2026-10-14-006 : TRAITS ÉPAIS (rapides, plongées, transitions — demande :
// « changer leur épaisseur, un poil plus que l'actuel ») — WebGL trace
// toujours les LineSegments à 1 px : chaque segment devient un quad étiré
// à l'écran par le shader (largeur constante en pixels, quel que soit le
// zoom). arr = [ax,ay,az,bx,by,bz,...].
function faoThickSegs(arr,color,alpha,px){
  const n=arr.length/6;
  const pos=new Float32Array(n*12),oth=new Float32Array(n*12),side=new Float32Array(n*4),idx=new Uint32Array(n*6);
  for(let i=0;i<n;i++){
    const a=i*6,v=i*12,k=i*4;
    // sommets : A(+n), A(−n), B(+n), B(−n) — vu de B la direction s'inverse,
    // d'où les signes (+1,−1,−1,+1)
    for(let q=0;q<4;q++){
      const atA=q<2,o=v+q*3;
      pos[o]=arr[a+(atA?0:3)];pos[o+1]=arr[a+(atA?1:4)];pos[o+2]=arr[a+(atA?2:5)];
      oth[o]=arr[a+(atA?3:0)];oth[o+1]=arr[a+(atA?4:1)];oth[o+2]=arr[a+(atA?5:2)];
    }
    side[k]=1;side[k+1]=-1;side[k+2]=-1;side[k+3]=1;
    const t=i*6;idx[t]=k;idx[t+1]=k+1;idx[t+2]=k+2;idx[t+3]=k+1;idx[t+4]=k+3;idx[t+5]=k+2;
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('other',new THREE.BufferAttribute(oth,3));
  g.setAttribute('side',new THREE.BufferAttribute(side,1));
  g.setIndex(new THREE.BufferAttribute(idx,1));
  const res=new THREE.Vector2(1000,1000);
  const mat=new THREE.ShaderMaterial({
    uniforms:{col:{value:new THREE.Color(color)},op:{value:alpha===undefined?1:alpha},w:{value:px||2},res:{value:res}},
    vertexShader:[
      'attribute vec3 other; attribute float side; uniform vec2 res; uniform float w;',
      'void main(){',
      '  vec4 a=projectionMatrix*modelViewMatrix*vec4(position,1.0);',
      '  vec4 b=projectionMatrix*modelViewMatrix*vec4(other,1.0);',
      '  vec2 d=(b.xy/b.w-a.xy/a.w)*res;',
      '  float l=length(d);',
      '  vec2 u=l>1e-6?d/l:vec2(1.0,0.0);',
      '  vec2 nrm=vec2(-u.y,u.x);',
      '  a.xy+=nrm*side*w/res*a.w;',
      '  gl_Position=a;',
      '}'].join(String.fromCharCode(10)),
    fragmentShader:'uniform vec3 col; uniform float op; void main(){ gl_FragColor=vec4(col,op); }',
    transparent:alpha!==undefined&&alpha<1,depthWrite:!(alpha!==undefined&&alpha<1),side:THREE.DoubleSide
  });
  const mesh=new THREE.Mesh(g,mat);
  mesh.frustumCulled=false;
  mesh.onBeforeRender=function(rd){ try{ rd.getDrawingBufferSize(res); res.divideScalar(rd.getPixelRatio()||1); }catch(e){} }; // épaisseur en px CSS (pixelRatio 1,25)
  return mesh;
}
function faoPrevAdd(group,sp){
  // Ajoute le résultat d'un faoSegSplit au groupe de l'aperçu : coupe bleue
  // 2f80ff, rapides orange ff9f0a (30% de transparence), plongées/entrées
  // vertes 30d158 — palette façon Fusion 360 (2026-10-13-007). Renvoie les objets créés (pour retrait provisoire
  // — 2026-10-09-005, dessin progressif) ; échec silencieux (stubs/tests).
  const objs=[];
  if(!group||!sp)return objs;
  const add=function(arr,color,alpha,px){
    if(arr.length<6)return;
    if(px>1){ try{ const ms=faoThickSegs(arr,color,alpha,px); group.add(ms); objs.push(ms); return; }catch(e){} }
    try{
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(arr),3));
      const mat=new THREE.LineBasicMaterial({color:color});
      // Rapides en transparence : ils ne doivent pas masquer le parcours vert.
      if(alpha!==undefined&&alpha<1){ mat.transparent=true; mat.opacity=alpha; mat.depthWrite=false; }
      const ls=new THREE.LineSegments(g,mat);
      group.add(ls); objs.push(ls);
    }catch(e){}
  };
  // 2026-10-13-007 : palette façon Fusion 360 — coupe BLEUE, rapides
  // ORANGE, plongées/entrées VERTES (feed). Rapides en transparence : ils
  // ne doivent pas masquer le parcours bleu.
  add(sp.cut,0x2f80ff);
  // 2026-10-13-003 : rapides selon faoViewerRap (tous 30 % / fondu 8 % /
  // masqués) — bouton « Rapides » de la barre Exécution.
  if(faoViewerRap!=='masque')add(sp.rap,0xff9f0a,faoViewerRap==='fondu'?0.08:0.3,2);
  add(sp.plg||[],0x30d158,undefined,2);
  return objs;
}
function faoPrevDrop(objs){
  // Retire et libère les objets dessinés (traits provisoires remplacés par le
  // rendu canonique final). Silencieux sur les stubs/tests.
  if(!objs||!objs.length)return;
  for(let i=0;i<objs.length;i++){
    const o=objs[i];
    try{ if(o&&o.parent)o.parent.remove(o); }catch(e){}
    try{ if(o&&o.geometry&&o.geometry.dispose)o.geometry.dispose(); }catch(e){}
    try{ if(o&&o.material&&o.material.dispose)o.material.dispose(); }catch(e){}
  }
}
function faoRefreshPreview(mode){
  // mode='calcule' : SEUL cas ou l'on PRODUIT les parcours absents — réservé à
  // « Tout régénérer ». Défaut (et mode=true) : LECTURE SEULE — on dessine ce
  // qui existe déjà en mémoire. Un affichage (ouverture, œil Masquer, repli de
  // l'arbre, modification, annuler/rétablir) ne doit jamais régénérer : sans
  // entrée en base, il laisserait simplement un trou (faoPrevMissing).
  const seule=(mode!=='calcule');
  faoClearPreview();
  if(!faoPrevOn)return 0;
  const job=faoDoc(); let total=0; faoPrevMissing=0;
  try{
    if(typeof THREE==='undefined'||typeof scene==='undefined'||!scene)return 0;
    faoPrevGroup=new THREE.Group(); faoPrevGroup.name='faoPreview';
    const mk=function(moves,clip){
      // Coupe en vert, rapides en rouge, plongées en bleu — faoSegSplit borne la
      // coupe à la zone et laisse les G0 traverser librement (cf. faoSegSplit).
      if(!moves||!moves.length)return;
      try{ faoPrevAdd(faoPrevGroup,faoSegSplit(moves,clip)); }catch(e){}
    };
    faoSeqSafe(job,seule).forEach(function(b){
      const op=b.op;
      if(op&&op.hidden===true)return; // traces masquées dans la vue (op.hidden) — le G-code, lui, les garde
      if(b.absent){ faoPrevMissing++; return; } // pas de parcours en memoire : on n'invente rien
      const mv=b.moves; total+=mv.length;
      mk(mv,faoSegClipper(op,job));
    });
    faoAdd3D(faoPrevGroup);
    if(typeof faoVw!=='undefined'&&faoVw)faoPrevGroup.visible=false; // viewer : traces restent cachées
  }catch(e){}
  return total;
}
function faoPreviewGenerate(){
  // « Tout régénérer » = TOUT, à la demande : on purge le cache (chaque opération
  // est recalculée, même celles à jour), puis on ré-affiche TOUTES les traces.
  // Les traces masquées à la main (op.hidden) le RESTENT : le masquage se fait
  // ligne par ligne, jamais remis à zéro en cachette. Le triangle ⚠ d'une ligne,
  // lui, ne régénère QUE son opération.
  faoPrevOn=true;
  if(!faoSolidSettled()){
    // Generer maintenant produirait une trajectoire (et une cle) sur le MAILLAGE DE
    // REPLI : elle serait rejetee des la fin du rejeu. On diffère, on le dit.
    faoRegenWhenSettled=true;
    try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : le solide exact n\'est pas encore en place (rejeu en cours) — régénération automatique à la fin du rejeu.'; }catch(e){}
    return 0;
  }
  faoOpMovesPurge();
  faoStaleClear();
  const n=faoRefreshPreview('calcule');
  faoTouch();
  faoPrevStale=false; faoStaleUI();
  try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : '+n+' points de parcours.'+(n?'':' Aucune trajectoire.'); }catch(e){}
  return n;
}

/* ----- dessin PROGRESSIF (2026-10-09-005) : les courbes apparaissent pendant
   la génération au lieu d'un écran figé de ~60 s. Même séquence que
   faoPreviewGenerate (purge -> calcul -> rendu canonique final), mais chaque
   niveau de l'ébauche 3D rend la main au navigateur et dessine ses courbes
   (traits provisoires bruts, remplacés in fine par le rendu CANONIQUE
   faoRefreshPreview('calcule') — source unique de vérité, strictement
   identique à l'ancien flux synchrone). Un rafraîchissement concurrent
   (ouverture, modification, ⚠) prend la main via le jeton faoStreamTok. */
let faoStreamTok=0;
async function faoRefreshPreviewStream(){
  faoClearPreview();
  if(!faoPrevOn)return 0;
  const job=faoDoc();
  if(typeof THREE==='undefined'||typeof scene==='undefined'||!scene)return 0;
  const tok=++faoStreamTok;
  faoPrevGroup=new THREE.Group(); faoPrevGroup.name='faoPreview';
  faoAdd3D(faoPrevGroup);
  if(typeof faoVw!=='undefined'&&faoVw)faoPrevGroup.visible=false; // viewer : traces restent cachées
  const ops=((job&&job.ops)||[]).filter(function(op){ return op&&op.on!==false; });
  for(let i=0;i<ops.length;i++){
    if(tok!==faoStreamTok)return -1; // un autre rafraîchissement a pris la main
    const op=ops[i];
    try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : génération '+(i+1)+'/'+ops.length+'…'; }catch(e){}
    try{
      if(faoMeshOp(op)){
        // Long : les yields (un par niveau / mini-passe / finition) déposent
        // les fragments au fur et à mesure — traits PROVISOIRES (bruts, sans
        // arrondi/zone/sécurité rapide) qui seront tous remplacés par le rendu
        // canonique final.
        const st={n:0,prev:null};
        await faoOpMovesStream(op,job,function(marr){
          if(tok!==faoStreamTok||!marr||marr.length<=st.n)return;
          const delta=(op.hidden===true)?null:marr.slice(st.n);
          st.n=marr.length;
          if(!delta)return;
          try{
            const sp=faoSegSplit(delta,faoSegClipper(op,job),st.prev);
            st.prev=sp.prev;
            faoPrevAdd(faoPrevGroup,sp);
          }catch(e){}
        });
      }else{
        // Opérations 2.5D : calcul (coups de cache = instantané) + dessin.
        const mv=faoOpMoves(op,job);
        if(mv&&mv.length&&op.hidden!==true)
          try{ faoPrevAdd(faoPrevGroup,faoSegSplit(mv,faoSegClipper(op,job))); }catch(e){}
      }
    }catch(e){}
    await faoYieldUI();
  }
  if(tok!==faoStreamTok)return -1;
  // Rendu CANONIQUE : tout est en mémoire (coups de cache) — c'est exactement
  // ce que le bouton faisait en un bloc : rapides sécurisés, arrondis, zones,
  // op. masquées, faoPrevMissing… strictement identique au flux synchrone.
  try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : affichage…'; }catch(e){}
  return faoRefreshPreview('calcule');
}
async function faoPreviewGenerateAsync(){
  // Version FLUX de faoPreviewGenerate() : même séquence, mais les courbes
  // apparaissent au fur et à mesure. Utilisée UNIQUEMENT par le bouton
  // « Tout régénérer » (l'ancien chemin synchrone reste en place pour
  // faoRegenFlush, l'ouverture de document et les tests).
  faoPrevOn=true;
  if(!faoSolidSettled()){
    // Generer maintenant produirait une trajectoire (et une cle) sur le MAILLAGE DE
    // REPLI : elle serait rejetee des la fin du rejeu. On diffère, on le dit.
    faoRegenWhenSettled=true;
    try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : le solide exact n\'est pas encore en place (rejeu en cours) — régénération automatique à la fin du rejeu.'; }catch(e){}
    return 0;
  }
  faoOpMovesPurge();
  faoStaleClear();
  let n=0;
  try{ n=await faoRefreshPreviewStream(); }catch(e){
    n=-1;
    try{ if(typeof console!=='undefined'&&console&&console.log)console.log('faoPreviewGenerateAsync',e); }catch(e2){}
  }
  if(n<0)return 0; // supersede : un autre rafraîchissement a déjà peint
  faoTouch();
  faoPrevStale=false; faoStaleUI();
  try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : '+n+' points de parcours.'+(n?'':' Aucune trajectoire.'); }catch(e){}
  return n;
}
