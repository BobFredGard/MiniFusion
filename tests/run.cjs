// Lance toute la suite Node du dépôt : `node tests/run.cjs` (ou `npm test`).
// Chaque suite sort 0 si verte. Portable : aucun chemin absolu (voir paths via ROOT).
//
// Suites lancées EN PARALLÈLE (pool de processus) : ~70 d'entre elles recompilent le
// noyau OCCT (.wasm de 66 Mo), ce qui prenait ~25 min en série. Chaque suite reste un
// processus isolé ; sa sortie est mise en mémoire et affichée d'un bloc quand elle échoue
// (ou toujours avec --verbose), pour que les journaux ne s'entremêlent pas.
//   node tests/run.cjs              pool automatique (cœurs et mémoire)
//   node tests/run.cjs -j 1         en série, comme avant
//   node tests/run.cjs --verbose    affiche aussi la sortie des suites vertes
//   TEST_JOBS=4 node tests/run.cjs  taille du pool par variable d'environnement
// Les durées de la dernière exécution (tests/.durees.json, non versionné) servent à
// lancer les suites les plus longues en premier : la fin du pool n'attend plus un
// retardataire démarré trop tard.
const { spawn } = require('child_process'), path = require('path'), fs = require('fs'), os = require('os');
const SUITES = [
  "test_highlight_order",
  "test_draft_sel",
  "test_xmove",
  "test_coque_sel",
  "test_suppression_face",
  "test_coque_depouille",
  "test_repeat_mir2",
  "test_repeat_session",
  "test_repeat_circ_tour",
  "test_esquisse_angle",
  "test_mirror_arc",
  "test_extrude_flip_draft",
  "test_apercu_diff",
  "test_apercu_edition",
  "test_conge_reel",
  "test_conge_sur_conge",
  "test_hote_oriphelin",
  "test_conge_fond_poche",
  "test_conge_tangent",
  "test_arbre_selection",
  "test_undo_document",
  "test_undo_aller_retour",
  "test_revolve",
  "test_skctxmenu",
  "test_esquisse_transparence",
  "test_esquisse_arbre_rabat",
  "test_esquisse_face_conges",
  "test_esquisse_fao_cache",
  "test_esquisse_projection",
  "test_proj_arc_sens",
  "test_esquisse_contraintes",
  "test_fao",
  "test_fao3d",
  "test_fao_escargot",
  "test_fao_sens",
  "test_fao_zone2",
  "test_fao_sketch_zone",
  "test_fao_cretes",
  "test_fao_geodesique",
  "test_fao_ebauche_brut",
  "test_fao_faces",
  "test_fao_brut_corps",
  "test_fao_poche",
  "test_fao_contour",
  "test_fao_torique",
  "test_fao_fiche_onglets",
  "test_fao_bornage",
  "test_fao_chain",
  "test_fao_couverture",
  "test_fao_helice",
  "test_fao_circ",
  "test_fao_fond_finition",
  "test_fao_planes",
  "test_fao_securite",
  "test_fao_stale",
  "test_fao_refresh",
  "test_fao_cache_idb",
  "test_fao_attente_cache",
  "test_fao_solide_cache",
  "test_fao_arbre_ouverture",
  "test_fao_bundle",
  "test_fao_stale_why",
  "test_corps",
  "test_timeline_bandeau",
  "test_corps_iso",
  "test_corps_style",
  "test_import_vie",
  "test_import_persist",
  "test_ouverture_deterministe",
  "test_esquisse_colineaire",
  "test_esquisse_echelle",
  "test_regeneration_chaine",
  "test_fao_outils",
  "test_fao_percage",
  "test_percage_3d",
  "test_fao_taraudage",
  "test_esquisse_regles",
  "test_parametres",
  "test_regen_perf",
  "test_raccourcis",
  "test_projection_arcs",
  "test_parametres_3d",
  "test_corps_combiner",
  "test_conge_arete_seule",
  "test_posage_repere",
  "test_interface_moderne",
  "test_coincident_contrainte",
  "test_aretes_import",
  "test_fao_chain_step",
  "test_precision_affichage",
  "test_fao_lock",
  "test_bool_import",
  "test_ctx_step",
  "test_ctx_menu_viewport",
  "test_fao_reset",
  "test_fao_passes",
  "test_fao_barre3d",
  "test_fao_zlim",
  "test_validate",
  "test_tree_filter",
  "test_view_reframe",
  "test_prodver_badge",
  "test_cache_exact",
  "test_sk_offset_contraintes",
  "test_sk_offset_joints",
  "test_sk_offset_projetee",
  "test_fresh_default",
  "test_hard_phases",
  "test_sk_origin",
  "test_sk_hv_drag",
  "test_esquisse_crochet",
  "test_esquisse_angle_cavite",
  "test_esquisse_moindre_deplacement",
  "test_esquisse_retour_arriere",
  "test_esquisse_aleatoire",
  "test_vue_centre",
  "test_ws_pose_cao",
  "test_mise_en_plan",
  "test_mep_step",
  "test_mep_coupe_brisee",
  "test_mep_hachures_cotes",
  "test_filet_modele",
  "test_construction_modele",
  "test_assemblage_modele",
  "test_composants_modele",
  "test_composants_corps",
  "test_composants_lies",
  "test_composants_references",
  "test_composants_liaisons",
  "test_composants_inspection",
  "test_composants_plan",
  "test_composants_accroches",
  "test_oracle",
  "test_construction_esquisse"
];
const TIMEOUT = 20 * 60 * 1000;
const DUREES = path.join(__dirname, '.durees.json');
const argv = process.argv.slice(2);
const VERBOSE = argv.includes('--verbose');
const iJ = argv.findIndex(a => a === '-j' || a === '--jobs');
// Taille du pool : un cœur laissé libre, et ~600 Mo de mémoire DISPONIBLE par processus
// (pic mesuré : ~550 Mo pour une suite qui charge le noyau OCCT). Au-delà, la machine
// swappe et tout ralentit ; -j N force la valeur.
const auto = Math.max(1, Math.min(os.cpus().length - 1, Math.floor(os.freemem() / (600 * 1024 ** 2))));
const JOBS = Math.max(1, parseInt(iJ >= 0 ? argv[iJ + 1] : process.env.TEST_JOBS, 10) || auto);

let anciennes = {};
try { anciennes = JSON.parse(fs.readFileSync(DUREES, 'utf8')); } catch (e) { /* première exécution : ordre de la liste */ }
// Plus longues d'abord ; une suite inconnue passe en tête (elle peut être longue).
const file = SUITES.slice().sort((a, b) => (anciennes[b] ?? Infinity) - (anciennes[a] ?? Infinity));

const sec = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';
const res = {};
const t0 = Date.now();
let fini = 0;

function lancer(s) {
  return new Promise(resolve => {
    const debut = Date.now(), sortie = [];
    const p = spawn(process.execPath, [path.join(__dirname, s + '.cjs')], { stdio: ['ignore', 'pipe', 'pipe'] });
    p.stdout.on('data', d => sortie.push(d));
    p.stderr.on('data', d => sortie.push(d));
    const minuterie = setTimeout(() => { sortie.push(Buffer.from('\n✗ délai dépassé (' + sec(TIMEOUT) + ')\n')); p.kill(); }, TIMEOUT);
    p.on('close', code => {
      clearTimeout(minuterie);
      const ms = Date.now() - debut, vert = code === 0;
      res[s] = { vert, ms };
      fini++;
      if (!vert || VERBOSE) {
        console.log('\n──── ' + s + ' ────');
        process.stdout.write(Buffer.concat(sortie));
      }
      console.log((vert ? '✓ ' : '✗ ') + s + ' — ' + sec(ms) + '  [' + fini + '/' + SUITES.length + ']');
      resolve();
    });
  });
}

async function ouvrier() { for (let s; (s = file.shift());) await lancer(s); }

console.log('SUITE : ' + SUITES.length + ' suites, ' + JOBS + ' en parallèle');
Promise.all(Array.from({ length: Math.min(JOBS, SUITES.length) }, ouvrier)).then(() => {
  const total = Date.now() - t0;
  const ko = SUITES.filter(s => !res[s].vert);
  const cumul = SUITES.reduce((n, s) => n + res[s].ms, 0);
  const durees = {};
  SUITES.forEach(s => { durees[s] = res[s].ms; });
  try { fs.writeFileSync(DUREES, JSON.stringify(durees, null, 1)); } catch (e) { console.log('(durées non enregistrées : ' + e.message + ')'); }
  console.log('');
  console.log('Plus lentes :');
  SUITES.slice().sort((a, b) => res[b].ms - res[a].ms).slice(0, 10)
    .forEach(s => console.log('  ' + sec(res[s].ms).padStart(9) + '  ' + s));
  console.log('Durée : ' + sec(total) + ' (cumul des suites ' + sec(cumul) + ', ' + JOBS + ' en parallèle)');
  console.log('SUITE: ' + (SUITES.length - ko.length) + '/' + SUITES.length + ' OK' + (ko.length ? ' — KO: ' + ko.join(', ') : ''));
  process.exit(ko.length ? 1 : 0);
});
