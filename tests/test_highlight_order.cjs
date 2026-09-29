// L'aperçu translucide ne doit JAMAIS recouvrir les surbrillances de sélection :
// overlay (vert/bleu/rouge) et flèche TOUJOURS au-dessus du preview, lui-même au-dessus
// de la pièce estompée. Régression 31q : le preview à 1000 recouvrait l'overlay à 996,
// la référence verte devenait bleue uniforme et la coque une bouillie verte/rouge.
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..', 'src') + path.sep;
let ko = 0;
const A = (c, m) => { if (!c) { ko++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const ord = (file, marqueur) => {
  const s = fs.readFileSync(R + file, 'utf8');
  const ms = [...s.matchAll(/renderOrder\s*=\s*(\d+)/g)].map(m => +m[1]);
  return { file, ordres: ms, marqueur };
};
for (const f of ['86-draft-depouillage.js', '87-coque.js']) {
  const s = fs.readFileSync(R + f, 'utf8');
  // overlay de sélection : le mesh avec vertexColors (vert/bleu/rouge par sommet)
  const overlay = [...s.matchAll(/vertexColors[\s\S]{0,200}?renderOrder\s*=\s*(\d+)|renderOrder\s*=\s*(\d+)[\s\S]{0,200}?vertexColors/g)];
  const mOverlay = s.match(/const m=new THREE\.Mesh\(g,new THREE\.MeshBasicMaterial\(\{vertexColors[\s\S]*?m\.renderOrder=(\d+)/);
  const mPrev = s.match(/mesh\.renderOrder=(\d+);?\s*\n.*userData\.bid='(draft_preview|coque_preview)'/);
  const oOrd = mOverlay ? +mOverlay[1] : null;
  const pOrd = mPrev ? +mPrev[1] : null;
  console.log(`  ${f} : overlay=${oOrd} preview=${pOrd}`);
  A(oOrd !== null && pOrd !== null, f + ' : ordres trouvés');
  A(oOrd > pOrd, f + ' : overlay (' + oOrd + ') AU-DESSUS du preview (' + pOrd + ')');
}
{
  // la flèche de sens (dépouille) au-dessus de tout
  const s = fs.readFileSync(R + '86-draft-depouillage.js', 'utf8');
  const mArr = s.match(/o\.renderOrder=(\d+);[^]*?draftGroup\.add\(ar\)/);
  const aOrd = mArr ? +mArr[1] : null;
  const mPrev = s.match(/mesh\.renderOrder=(\d+);?\s*\n.*userData\.bid='draft_preview'/);
  console.log('  flèche=' + aOrd);
  A(aOrd !== null && mPrev && aOrd > +mPrev[1], 'flèche AU-DESSUS du preview');
}
console.log(ko ? '\n*** ' + ko + ' PROBLEME(S) ***' : '\n*** TOUT PASSE ***');
process.exit(ko ? 1 : 0);
