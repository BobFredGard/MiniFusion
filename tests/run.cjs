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
//
// PARTIES : une entrée « suite:partie » lance `node tests/suite.cjs partie` ; la suite
// ne fait alors qu'une partie de ses contrôles (sans argument, elle fait tout). Les
// suites longues sont ainsi coupées en morceaux qui tournent en même temps.
//
// CŒURS P / E (Windows, processeur hybride, voir tests/coeurs.cjs) : un étalonnage
// épinglé trouve les cœurs rapides (résultat dans tests/.coeurs.json). Chaque
// ouvrier est épinglé sur les cœurs P ou sur les cœurs E (`start /affinity`) ; un ouvrier
// libre prend la plus longue suite qu'aucun autre ouvrier ne finirait plus tôt (durées
// gardées en équivalent cœur P). L'écart de vitesse P / E se mesure sur les suites
// elles-mêmes (~1,8 ; la boucle d'étalonnage, en racines carrées, exagère : ~4) : chaque
// exécution compare la durée d'une suite sur cœur E à sa dernière durée sur cœur P, et la
// médiane est gardée dans tests/.coeurs.json (2 au départ). Processeur homogène, hors
// Windows ou TEST_AFFINITE=0 : pool homogène, comme avant. TEST_PCORES=0-7 force la liste
// des cœurs P, TEST_RAPPORT=1.8 l'écart de vitesse.
const path = require('path'), fs = require('fs'), os = require('os');
const SUITES = [
  "test_highlight_order",
  "test_draft_sel",
  "test_xmove",
  "test_deplacer_corps",
  "test_coque_sel",
  "test_suppression_face",
  "test_suppression_face_step",
  "test_suppression_face_edition",
  "test_noyau_exceptions",
  "test_suppression_face_worker",
  "test_decoupe_coplanaire",
  "test_coque_depouille",
  "test_repeat_mir2",
  "test_symetrie_conges",
  "test_repeat_fonctions",
  "test_repeat_session",
  "test_repeat_circ_tour",
  "test_esquisse_angle",
  "test_mirror_arc",
  "test_extrude_flip_draft",
  "test_apercu_diff",
  "test_normales_exactes",
  "test_apercu_edition",
  "test_conge_reel",
  "test_conge_sur_conge",
  "test_hote_oriphelin",
  "test_conge_fond_poche",
  "test_conge_tangent",
  "test_conge_plan_decale",
  "test_arbre_selection",
  "test_arbre_v2",
  "test_anteriorite",
  "test_undo_document",
  "test_undo_filet",
  "test_undo_aller_retour",
  "test_revolve",
  "test_skctxmenu",
  "test_esquisse_transparence",
  "test_esquisse_arbre_rabat",
  "test_esquisse_face_conges",
  "test_esquisse_fao_cache",
  "test_esquisse_projection",
  "test_esquisse_intersection",
  "test_cote_points",
  "test_esquisse_cotes_pose",
  "test_esquisse_arc_fixe_ddl",
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
  "test_fao_ebauche_brut:a",
  "test_fao_ebauche_brut:b",
  "test_fao_faces",
  "test_fao_brut_corps:a",
  "test_fao_brut_corps:b",
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
  "test_materiaux",
  "test_rendu_patine",
  "test_rendu_scene",
  "test_noms_globaux",
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
  "test_parametres_partout",
  "test_corps_combiner",
  "test_scinder",
  "test_cylindre_unique",
  "test_revolutions_jointives",
  "test_conge_dechire",
  "test_corps_cache_aretes",
  "test_conge_arete_seule",
  "test_posage_repere",
  "test_interface_moderne",
  "test_coincident_contrainte",
  "test_cao_passe",
  "test_aretes_import",
  "test_fao_chain_step",
  "test_precision_affichage",
  "test_fao_lock",
  "test_bool_import",
  "test_step_schema",
  "test_import_regen",
  "test_ctx_step",
  "test_ctx_menu_viewport",
  "test_fao_reset",
  "test_fao_passes",
  "test_fao_barre3d",
  "test_fao_zlim",
  "test_fao_pose_fond",
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
  "test_mep_cylindre",
  "test_filet_modele",
  "test_construction_modele",
  "test_assemblage_modele",
  "test_composants_modele",
  "test_composants_corps",
  "test_composants_lies",
  "test_composants_references",
  "test_composants_aretes_esquisse",
  "test_composants_aretes_occ",
  "test_composants_plan_bulles",
  "test_enregistrement_sur",
  "test_configurations",
  "test_scripts",
  "test_mcp_serveur",
  "test_cartouche_modele",
  "test_simulation_moteurs",
  "test_post_cycle800",
  "test_composants_liaisons",
  "test_composants_inspection",
  "test_composants_plan",
  "test_composants_accroches",
  "test_composants_apparence",
  "test_extrusion_dynamique",
  "test_fenetre_dynamique",
  "test_repeat_lin2",
  "test_repeat_imbrique",
  "test_repeat_corps",
  "test_filet_visibilite",
  "test_corps_temps",
  "test_fao_percage_tranche",
  "test_fao_32_fiches",
  "test_simulation_rendu",
  "test_simulation_cartes",
  "test_fao_chanfrein",
  "test_oracle",
  "test_construction_esquisse"
];
const TIMEOUT = 20 * 60 * 1000;
const DUREES = path.join(__dirname, '.durees.json');
const argv = process.argv.slice(2);
const VERBOSE = argv.includes('--verbose');
const iJ = argv.findIndex(a => a === '-j' || a === '--jobs');
const { NCPU, masque, lancerProc, tuer, coeursPE, ecrire } = require('./coeurs.cjs');
// Taille du pool : un cœur laissé libre, et ~600 Mo de mémoire DISPONIBLE par processus
// (pic mesuré : ~550 Mo pour une suite qui charge le noyau OCCT). Au-delà, la machine
// swappe et tout ralentit ; -j N force la valeur.
const auto = Math.max(1, Math.min(NCPU - 1, Math.floor(os.freemem() / (600 * 1024 ** 2))));
const JOBS = Math.max(1, parseInt(iJ >= 0 ? argv[iJ + 1] : process.env.TEST_JOBS, 10) || auto);

const sec = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';

(async () => {
  const { pcores, ecores, C } = await coeursPE(JOBS);
  let rapport = (C && C.rapportSuites) || 2;
  if (pcores && process.env.TEST_RAPPORT) rapport = +process.env.TEST_RAPPORT || rapport;
  // ouvriers : autant d'ouvriers P que de cœurs P, le reste sur les cœurs E
  const ouvriers = Array.from({ length: Math.min(JOBS, SUITES.length) }, (_, i) => {
    if (!pcores) return { aff: null, vit: 1, libre: 0, P: false };
    const P = i < pcores.length;
    return { aff: masque(P ? pcores : ecores), vit: P ? 1 : rapport, libre: 0, P };
  });

  let anciennes = {};
  try { anciennes = JSON.parse(fs.readFileSync(DUREES, 'utf8')); } catch (e) { /* première exécution : ordre de la liste */ }
  // Durée estimée (équivalent cœur P) ; une suite inconnue passe en tête (elle peut être longue).
  const est = e => anciennes[e] ?? anciennes[e.split(':')[0]] ?? Infinity;
  const file = SUITES.slice().sort((a, b) => est(b) - est(a));

  const res = {};
  const t0 = Date.now();
  let fini = 0;
  // Choix « au plus tôt fini » : la plus longue suite qu'aucun autre ouvrier (libre plus
  // tard, mais plus rapide) ne finirait avant celui-ci ; à défaut, la plus courte.
  function choisir(w) {
    const now = Date.now();
    for (let i = 0; i < file.length; i++) {
      const d = est(file[i]);
      if (!isFinite(d)) return file.splice(i, 1)[0];
      const f = now + d * w.vit;
      if (ouvriers.every(o => o === w || Math.max(o.libre, now) + d * o.vit >= f - 1)) return file.splice(i, 1)[0];
    }
    return file.pop();
  }
  function lancer(e, w) {
    return new Promise(resolve => {
      const [s, partie] = e.split(':');
      const debut = Date.now(), sortie = [];
      w.libre = debut + (isFinite(est(e)) ? est(e) * w.vit : 0);
      const p = lancerProc(path.join(__dirname, s + '.cjs'), partie ? [partie] : [], w.aff);
      p.stdout.on('data', d => sortie.push(d));
      p.stderr.on('data', d => sortie.push(d));
      const minuterie = setTimeout(() => { sortie.push(Buffer.from('\n✗ délai dépassé (' + sec(TIMEOUT) + ')\n')); tuer(p, w.aff); }, TIMEOUT);
      p.on('close', code => {
        clearTimeout(minuterie);
        const ms = Date.now() - debut, vert = code === 0;
        res[e] = { vert, ms, eq: ms / w.vit, P: w.P };
        w.libre = Date.now();
        fini++;
        if (!vert || VERBOSE) {
          console.log('\n──── ' + e + ' ────');
          process.stdout.write(Buffer.concat(sortie));
        }
        console.log((vert ? '✓ ' : '✗ ') + e + ' — ' + sec(ms) + (pcores ? (w.P ? ' (P)' : ' (E)') : '') + '  [' + fini + '/' + SUITES.length + ']');
        resolve();
      });
    });
  }
  async function ouvrier(w) { for (let e; file.length && (e = choisir(w));) await lancer(e, w); }

  console.log('SUITE : ' + SUITES.length + ' suites, ' + ouvriers.length + ' en parallèle' +
    (pcores ? ' (cœurs P ' + pcores.join(',') + ' : ' + ouvriers.filter(o => o.P).length + ' ouvriers ; cœurs E : ' +
      ouvriers.filter(o => !o.P).length + ' ouvriers, ' + String(rapport).replace('.', ',') + ' fois plus lents)' : ''));
  await Promise.all(ouvriers.map(ouvrier));
  const total = Date.now() - t0;
  const ko = SUITES.filter(s => !res[s].vert);
  const cumul = SUITES.reduce((n, s) => n + res[s].ms, 0);
  const durees = {};
  SUITES.forEach(s => { durees[s] = Math.round(res[s].eq); });
  try { fs.writeFileSync(DUREES, JSON.stringify(durees, null, 1)); } catch (e) { console.log('(durées non enregistrées : ' + e.message + ')'); }
  if (pcores && C) { // écart P / E appris : dernière durée de chaque suite sur P et sur E
    const mP = C.mesP || {}, mE = C.mesE || {};
    SUITES.forEach(s => { if (res[s].vert) (res[s].P ? mP : mE)[s] = res[s].ms; });
    const r = SUITES.filter(s => mP[s] > 3000 && mE[s] > 3000).map(s => mE[s] / mP[s]).sort((a, b) => a - b);
    Object.assign(C, { mesP: mP, mesE: mE });
    if (r.length >= 3) C.rapportSuites = +r[r.length >> 1].toFixed(2);
    ecrire(C);
    if (r.length >= 3) console.log('Écart P / E mesuré sur ' + r.length + ' suites : ' + String(C.rapportSuites).replace('.', ','));
  }
  console.log('');
  console.log('Plus lentes :');
  SUITES.slice().sort((a, b) => res[b].ms - res[a].ms).slice(0, 10)
    .forEach(s => console.log('  ' + sec(res[s].ms).padStart(9) + '  ' + s + (pcores ? (res[s].P ? ' (P)' : ' (E)') : '')));
  console.log('Durée : ' + sec(total) + ' (cumul des suites ' + sec(cumul) + ', ' + ouvriers.length + ' en parallèle)');
  console.log('SUITE: ' + (SUITES.length - ko.length) + '/' + SUITES.length + ' OK' + (ko.length ? ' — KO: ' + ko.join(', ') : ''));
  process.exit(ko.length ? 1 : 0);
})();
