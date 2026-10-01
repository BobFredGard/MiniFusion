// Lance toute la suite Node du dépôt : `node tests/run.cjs` (ou `npm test`).
// Chaque suite sort 0 si verte. Portable : aucun chemin absolu (voir paths via ROOT).
const { execFileSync } = require('child_process'), path = require('path');
const SUITES = [
  "test_highlight_order",
  "test_draft_sel",
  "test_xmove",
  "test_coque_sel",
  "test_repeat_mir2",
  "test_mirror_arc",
  "test_extrude_flip_draft",
  "test_apercu_diff",
  "test_apercu_edition",
  "test_conge_reel",
  "test_arbre_selection",
  "test_undo_document",
  "test_undo_aller_retour",
  "test_revolve",
  "test_skctxmenu",
  "test_fao",
  "test_fao3d",
  "test_corps",
  "test_corps_iso",
  "test_import_vie",
  "test_aretes_import",
  "test_precision_affichage",
  "test_fao_lock",
  "test_bool_import",
  "test_ctx_step"
];
let ok = 0; const ko = [];
for (const s of SUITES) {
  try {
    execFileSync(process.execPath, [path.join(__dirname, s + '.cjs')], { stdio: 'inherit', timeout: 20 * 60 * 1000 });
    ok++;
  } catch (e) { ko.push(s); }
}
console.log('');
console.log('SUITE: ' + ok + '/' + SUITES.length + ' OK' + (ko.length ? ' — KO: ' + ko.join(', ') : ''));
process.exit(ko.length ? 1 : 0);
