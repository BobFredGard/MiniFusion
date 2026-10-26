// Cœurs P / E et lancement épinglé, partagés par tests/run.cjs et tests/parcours/run.cjs.
// Windows, processeur hybride (i9-14900KF = 8 cœurs P + 16 cœurs E ~2,7 fois plus lents) :
// un étalonnage épinglé (tests/etalon-coeur.cjs, une petite boucle par cœur logique, toutes
// lancées ensemble) trouve les cœurs rapides ; résultat mis en cache dans tests/.coeurs.json
// (non versionné) par modèle de processeur. Hors Windows, processeur homogène ou
// TEST_AFFINITE=0 : aucun épinglage. TEST_PCORES=0-7 force la liste des cœurs P.
const { spawn } = require('child_process'), path = require('path'), fs = require('fs'), os = require('os');
const COEURS = path.join(__dirname, '.coeurs.json');
const NCPU = os.cpus().length;

const masque = l => l.reduce((m, c) => m | (1n << BigInt(c)), 0n).toString(16).toUpperCase();
const liste = t => {
  const l = [];
  String(t).split(',').forEach(p => {
    const [a, b] = p.split('-').map(Number);
    for (let c = a; c <= (isFinite(b) ? b : a); c++) if (c >= 0 && c < NCPU) l.push(c);
  });
  return l;
};

// Lancement d'un script Node, épinglé si `aff` (masque hexadécimal des cœurs permis) : le
// code de sortie traverse `start /wait` par `exit !errorlevel!` (cmd /v:on).
function lancerProc(fichier, args, aff) {
  if (!aff) return spawn(process.execPath, [fichier].concat(args), { stdio: ['ignore', 'pipe', 'pipe'] });
  const q = a => '"' + a + '"';
  const ligne = '/d /v:on /s /c "start "" /b /wait /affinity ' + aff + ' ' + q(process.execPath) + ' ' + q(fichier) +
    args.map(a => ' ' + q(a)).join('') + ' & exit !errorlevel!"';
  return spawn(process.env.ComSpec || 'cmd.exe', [ligne], { windowsVerbatimArguments: true, stdio: ['ignore', 'pipe', 'pipe'] });
}
function tuer(p, aff) {
  if (aff) { try { spawn('taskkill', ['/T', '/F', '/PID', String(p.pid)], { stdio: 'ignore' }); return; } catch (e) { /* repli */ } }
  p.kill();
}

// cœurs P = ceux qui vont à moins de 1,5 fois le plus rapide ; hétérogène si le plus lent
// est au moins 1,3 fois plus lent
const BOUCLE = path.join(__dirname, 'etalon-coeur.cjs');
async function etalonner() {
  const cle = (os.cpus()[0] || {}).model + ' × ' + NCPU;
  try { const c = JSON.parse(fs.readFileSync(COEURS, 'utf8')); if (c.cle === cle) return c; } catch (e) { /* à mesurer */ }
  const ms = await Promise.all(Array.from({ length: NCPU }, (_, c) => new Promise(res => {
    const p = lancerProc(BOUCLE, [], masque([c]));
    let o = '';
    p.stdout.on('data', d => { o += d; });
    p.on('close', () => res(parseInt(o, 10) || Infinity));
  })));
  const min = Math.min(...ms), max = Math.max(...ms.filter(isFinite));
  const p = ms.map((m, c) => (m < 1.5 * min ? c : -1)).filter(c => c >= 0);
  const r = { cle, ms, pcores: max >= 1.3 * min ? p : null, rapport: +(max / min).toFixed(2) };
  ecrire(r);
  return r;
}
function ecrire(C) { try { fs.writeFileSync(COEURS, JSON.stringify(C, null, 1)); } catch (e) { /* cache facultatif */ } }

// { pcores, ecores, C } — pcores null : pas d'épinglage
async function coeursPE(jobs) {
  if (process.platform !== 'win32' || process.env.TEST_AFFINITE === '0' || jobs <= 1) return { pcores: null, ecores: [], C: null };
  const C = await etalonner();
  let pcores = process.env.TEST_PCORES ? liste(process.env.TEST_PCORES) : (C.pcores && C.pcores.length < NCPU ? C.pcores : null);
  const ecores = pcores ? Array.from({ length: NCPU }, (_, c) => c).filter(c => !pcores.includes(c)) : [];
  if (pcores && (!pcores.length || !ecores.length)) pcores = null;
  return { pcores, ecores, C };
}

module.exports = { NCPU, masque, lancerProc, tuer, coeursPE, ecrire };
