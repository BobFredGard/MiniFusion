// Non-régression des PARCOURS FAO sur les exemples : `npm run parcours`.
// Chaque opération active de chaque Exemples/*.miniFusion suivi par Git est recalculée
// (tests/parcours/calcul.cjs, un processus par opération, en parallèle, les plus longues
// d'abord sur les cœurs P — voir tests/coeurs.cjs), puis son résumé chiffré est comparé
// à la référence versionnée tests/parcours/reference.json :
//   nombre de mouvements, longueurs de coupe et de rapides, rapides et remontées, Z mini /
//   maxi de coupe, temps estimé, longueur de coupe à plat par cote (niveaux).
// Un écart n'est pas forcément une erreur : il dit QUOI a bougé (« Ébauche 3D : niveau 46
// 3 118 → 520 mm »). Après vérification, `npm run parcours -- --ecrire` accepte les
// nouveaux chiffres (référence + tableau docs/parcours.md). Un parcours qui bouge veut
// aussi dire CACHE_VER à changer.
//   node tests/parcours/run.cjs                     compare (sortie 1 si écart ou erreur)
//   node tests/parcours/run.cjs --ecrire            écrit la référence
//   node tests/parcours/run.cjs --fichier Cavité    seulement les fichiers qui contiennent « Cavité »
//   node tests/parcours/run.cjs -j 4                taille du pool
//   APP_FILE=<autre fusion_mvp.html> node tests/parcours/run.cjs   compare une autre version
//                                                   (ex. `git show V0.9.2:fusion_mvp.html`)
const path = require('path'), fs = require('fs'), os = require('os'), { execFileSync } = require('child_process');
const { NCPU, masque, lancerProc, tuer, coeursPE } = require('../coeurs.cjs');
const ROOT = path.join(__dirname, '..', '..');
const REF = path.join(__dirname, 'reference.json');
const DOC = path.join(ROOT, 'docs', 'parcours.md');
const TIMEOUT = 15 * 60 * 1000;
const argv = process.argv.slice(2);
const ECRIRE = argv.includes('--ecrire');
const iF = argv.indexOf('--fichier'), FILTRE = iF >= 0 ? argv[iF + 1] : null;
const iJ = argv.findIndex(a => a === '-j' || a === '--jobs');
const auto = Math.max(1, Math.min(NCPU - 1, Math.floor(os.freemem() / (700 * 1024 ** 2))));
const JOBS = Math.max(1, parseInt(iJ >= 0 ? argv[iJ + 1] : process.env.TEST_JOBS, 10) || auto);
const sec = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';
const nb = v => (v === null || v === undefined) ? '—' : Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 3 });

// fichiers suivis par Git (pas les copies .bak ni les essais non versionnés)
function exemples() {
  let l;
  try {
    l = execFileSync('git', ['-c', 'core.quotepath=off', 'ls-files', 'Exemples'], { cwd: ROOT, encoding: 'utf8' }).split('\n');
  } catch (e) { l = fs.readdirSync(path.join(ROOT, 'Exemples')).map(f => 'Exemples/' + f); }
  return l.filter(f => /\.miniFusion$/.test(f) && (!FILTRE || f.includes(FILTRE))).sort();
}
const TYPES = { facing: 'Surfaçage', rough3d: 'Ébauche 3D', geofinish: 'Finition', geodesic: 'Géodésique', pocket: 'Poche',
  contour: 'Contour', drill: 'Perçage', chamfer: 'Chanfrein' };
function taches() {
  const t = [];
  for (const f of exemples()) {
    let b; try { b = JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { continue; }
    const d = b.doc || b;
    ((d.fao && d.fao.setups) || []).forEach(s => (s.ops || []).forEach((o, i) => {
      if (!o || o.on === false) return;
      t.push({ cle: f.replace(/^Exemples\//, '') + ' › ' + (s.name || s.id) + ' › ' + (i + 1) + '. ' + (TYPES[o.type] || o.type) + ' (' + o.id + ')',
        fichier: path.join(ROOT, f), setup: s.id, op: o.id });
    }));
  }
  return t;
}

// comparaison d'un résumé à sa référence : liste de phrases (vide = identique)
function ecarts(a, b) {
  const e = [];
  const rel = (k, lib, u) => {
    const x = a[k], y = b[k];
    if (x === y) return;
    if (typeof x === 'number' && typeof y === 'number' && Math.abs(y - x) <= 1e-3 * Math.max(1, Math.abs(x))) return;
    const pc = (typeof x === 'number' && x) ? ' (' + ((y - x) / x * 100 >= 0 ? '+' : '') + ((y - x) / x * 100).toFixed(1).replace('.', ',') + ' %)' : '';
    e.push(lib + ' ' + nb(x) + ' → ' + nb(y) + (u || '') + pc);
  };
  rel('n', 'mouvements'); rel('coupe', 'coupe', ' mm'); rel('rapide', 'rapides', ' mm'); rel('nRap', 'nombre de rapides');
  rel('remontees', 'remontées'); rel('zMin', 'Z mini'); rel('zMax', 'Z maxi'); rel('minutes', 'temps', ' min');
  const na = a.niveaux || {}, nb2 = b.niveaux || {};
  const zs = Array.from(new Set(Object.keys(na).concat(Object.keys(nb2)))).sort((p, q) => q - p);
  const niv = [];
  for (const z of zs) {
    const x = na[z], y = nb2[z];
    if (x === undefined) niv.push(nb(+z) + ' nouveau (' + nb(y) + ' mm)');
    else if (y === undefined) niv.push(nb(+z) + ' disparu (' + nb(x) + ' mm)');
    else if (Math.abs(y - x) > Math.max(1, 0.002 * x)) niv.push(nb(+z) + ' ' + nb(x) + ' → ' + nb(y) + ' mm');
  }
  if (niv.length) e.push('niveaux : ' + niv.slice(0, 12).join(' ; ') + (niv.length > 12 ? ' ; … (' + niv.length + ')' : ''));
  return e;
}

function ecrireDoc(res) {
  const L = ['# Parcours de référence', '',
    'Résumé chiffré de chaque opération active des exemples, recalculée par `npm run parcours` ' +
    '(noyau OCCT réel, maillage FAO du solide exact). Généré par `npm run parcours -- --ecrire` le ' +
    new Date().toISOString().slice(0, 10) + ' ; source : `tests/parcours/reference.json`.', '',
    '| Opération | Mouvements | Coupe (m) | Rapides (m) | Remontées | Z mini | Z maxi | Temps (min) | Niveaux |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|'];
  for (const k of Object.keys(res).sort()) {
    const r = res[k].resume;
    L.push('| ' + k + ' | ' + nb(r.n) + ' | ' + nb(Math.round(r.coupe / 10) / 100) + ' | ' + nb(Math.round(r.rapide / 10) / 100) + ' | ' +
      nb(r.remontees) + ' | ' + nb(r.zMin) + ' | ' + nb(r.zMax) + ' | ' + nb(r.minutes) + ' | ' + Object.keys(r.niveaux || {}).length + ' |');
  }
  fs.mkdirSync(path.dirname(DOC), { recursive: true });
  fs.writeFileSync(DOC, L.join('\n') + '\n');
}

(async () => {
  let ref = {};
  try { ref = JSON.parse(fs.readFileSync(REF, 'utf8')); } catch (e) { /* première référence */ }
  const file = taches().sort((a, b) => ((ref[b.cle] || {}).ms ?? Infinity) - ((ref[a.cle] || {}).ms ?? Infinity));
  const total = file.length;
  const { pcores, ecores } = await coeursPE(JOBS);
  const ouvriers = Array.from({ length: Math.min(JOBS, total) }, (_, i) =>
    (pcores ? { aff: masque(i < pcores.length ? pcores : ecores), P: i < pcores.length } : { aff: null }));
  console.log('PARCOURS : ' + total + ' opérations, ' + ouvriers.length + ' en parallèle' + (pcores ? ' (cœurs P d’abord)' : ''));
  const res = {}, err = {};
  const t0 = Date.now();
  let fini = 0;
  function lancer(t, w) {
    return new Promise(resolve => {
      const debut = Date.now(); let out = '';
      const p = lancerProc(path.join(__dirname, 'calcul.cjs'), [t.fichier, t.setup, t.op], w.aff);
      p.stdout.on('data', d => { out += d; });
      p.stderr.on('data', d => { out += d; });
      const minuterie = setTimeout(() => { out += '\n✗ délai dépassé'; tuer(p, w.aff); }, TIMEOUT);
      p.on('close', () => {
        clearTimeout(minuterie);
        const m = out.match(/RESUME (.*)\s*$/);
        let r = null; try { r = m && JSON.parse(m[1]); } catch (e) { r = null; }
        fini++;
        if (r && r.resume) { res[t.cle] = { type: r.type, outil: r.outil, ms: Date.now() - debut, resume: r.resume }; }
        else err[t.cle] = (r && r.err) || out.slice(-1500);
        console.log((res[t.cle] ? '· ' : '✗ ') + t.cle + ' — ' + sec(Date.now() - debut) + (w.P === undefined ? '' : (w.P ? ' (P)' : ' (E)')) + '  [' + fini + '/' + total + ']');
        resolve();
      });
    });
  }
  // les plus longues d'abord ; à t = 0, les premiers ouvriers lancés sont ceux des cœurs P
  async function ouvrier(w) { for (let t; (t = file.shift());) await lancer(t, w); }
  await Promise.all(ouvriers.map(ouvrier));
  console.log('');
  for (const k of Object.keys(err)) console.log('✗ ' + k + '\n' + String(err[k]).split('\n').map(l => '    ' + l).join('\n'));
  if (ECRIRE) {
    const nouv = FILTRE ? Object.assign({}, ref, res) : res;
    fs.writeFileSync(REF, JSON.stringify(nouv, null, 1) + '\n');
    ecrireDoc(nouv);
    console.log('Référence écrite : ' + Object.keys(res).length + ' opérations (' + path.relative(ROOT, REF) + ', ' + path.relative(ROOT, DOC) + ')');
    console.log('Durée : ' + sec(Date.now() - t0));
    process.exit(Object.keys(err).length ? 1 : 0);
  }
  let nEc = 0;
  const cles = Object.keys(res).sort();
  for (const k of cles) {
    if (!ref[k]) { console.log('+ ' + k + ' : absente de la référence'); nEc++; continue; }
    const e = ecarts(ref[k].resume, res[k].resume);
    if (e.length) { nEc++; console.log('≠ ' + k + '\n    ' + e.join('\n    ')); }
  }
  if (!FILTRE) for (const k of Object.keys(ref)) if (!res[k] && !err[k]) { console.log('− ' + k + ' : disparue (opération supprimée ou désactivée)'); nEc++; }
  const ko = Object.keys(err).length;
  console.log('Durée : ' + sec(Date.now() - t0));
  console.log('PARCOURS : ' + (cles.length - nEc) + '/' + total + ' identiques' + (nEc ? ', ' + nEc + ' écart(s)' : '') + (ko ? ', ' + ko + ' erreur(s)' : '') +
    (nEc ? ' — après vérification : npm run parcours -- --ecrire' : ''));
  process.exit(nEc || ko ? 1 : 0);
})();
