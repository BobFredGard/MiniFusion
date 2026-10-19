// Lint sans bundler : assemble les sources dans l'ordre de build.js, puis passe
// ESLint sur le script concaténé. Cette forme reproduit le livrable et évite les
// faux « no-undef » entre fichiers.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const BUNDLE = path.join(ROOT, '.lint-bundle.js');
const parts = fs.readdirSync(SRC).filter(f => /^\d\d-.*\.js$/.test(f)).sort();

if (!parts.length) {
  console.error('src/ est vide');
  process.exit(1);
}

const code = parts
  .map(f => fs.readFileSync(path.join(SRC, f), 'utf8').replace(/\s+$/, ''))
  .join('\n\n');

// Les modules exposent des fonctions par `window.nom = ...` (ex. espace PLAN)
// puis les appellent par leur nom nu. On les déclare à ESLint pour éviter les
// faux « no-undef », sans changer le code source.
const publicNames = new Set();
const assign = /\b(?:window|globalThis|self)\.([A-Za-z_$][\w$]*)\s*=(?!=)/g;
let m;
while ((m = assign.exec(code))) publicNames.add(m[1]);
const header = publicNames.size
  ? '/* global ' + [...publicNames].sort().join(', ') + ' */\n'
  : '';
fs.writeFileSync(BUNDLE, header + code + '\n', 'utf8');

const eslintBin = path.join(ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js');
try {
  if (!fs.existsSync(eslintBin)) {
    console.error('ESLint absent : lancez `npm install`.');
    process.exitCode = 1;
  } else {
    const args = [eslintBin];
    if (!process.argv.includes('--all')) args.push('--quiet');
    args.push(BUNDLE);
    const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
    if (r.error) throw r.error;
    process.exitCode = r.status || 0;
  }
} finally {
  try { fs.unlinkSync(BUNDLE); } catch (e) {}
}
