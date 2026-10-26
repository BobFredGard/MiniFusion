# Analyse du projet MiniFusion

*État au 2026-10-26 au soir — version `V0.11.12`.*

## Nature du projet

MiniFusion est une application web **mono-page** de **CAO paramétrique, assemblage, FAO, mise en plan et rendu** utilisable hors-ligne. Le livrable est un **HTML unique** (`fusion_mvp.html`, ~3,5 Mo) généré à partir des sources de `src/` et des fiches machines de `PostPro/`. Aucune installation, aucun compte, aucune dépendance runtime : l'application fonctionne en `file://`, avec un serveur statique facultatif.

Le noyau géométrique exact est **OpenCascade (OCCT) compilé en WebAssembly**. En cas d'indisponibilité, l'application bascule automatiquement sur un moteur maillage (CSG).

## Organisation

| Élément | Rôle |
|---|---|
| `src/*.js` | Sources, **101 fichiers** (~59 200 lignes), concaténés dans l'ordre numérique par `build.js`. |
| `PostPro/*.js` | Fiches machines (Fagor 8065, Siemens 630 et 1520), insérées par `build.js` après `88-fao-60-postprocesseurs.js`. Les `.cps` Autodesk restent locaux. |
| `fusion_mvp.html` | Livrable généré. **Ne jamais l'éditer à la main.** |
| `build.js` | Concaténation + bandeaux de section ; `--check` échoue si le livrable est périmé. |
| `tests/` | **169 suites** Node (171 entrées dans `tests/run.cjs`, certaines suites longues coupées en parties) + **54** rapides (`tests/run-fast.cjs`) ; non-régression des parcours FAO (`tests/parcours/`, `npm run parcours`) ; Playwright dans `tests/browser/` (`parcours.spec.cjs`, 20 parcours ; `gpu.spec.cjs`, 4 tests sur la vraie carte graphique). |
| `tools/lint.cjs` | Lint ESLint du script concaténé, dans l'ordre exact du build. |
| `tools/mcp-minifusion.cjs` | Serveur MCP (stdio, sans dépendance) : relaie les scripts JSON vers la page par un WebSocket local (127.0.0.1). |
| `threejs/` | three.js, OrbitControls et CSG (MIT). |
| `occt/` | Noyau OCCT WebAssembly (LGPL), `.wasm` suivis par Git LFS. |
| `Exemples/` | Projets `.miniFusion` et STEP de référence (Git LFS), commités à chaque livraison. |
| `Backup/` | Instantanés locaux par version (non versionnés). |
| `docs/` | Captures et notes de conception. |

## Architecture des sources

- `00` : métadonnées (`APP_VER`, `CACHE_VER`), utilitaires, thème, caches.
- `10`–`20` : scène three.js, repère (`11`), bibliothèque de matériaux de rendu (`12`), rejeu paramétrique, noyau exact OCCT et repli maillage.
- `30`–`45` : marqueur de temps, arbre/propriétés, bandeau de timeline (`41`), arbre unifié modèle + assemblage (`42-arbre-modele.js` : `treeModel` / `treeDraw`), règle d'antériorité (`43`), annuler/rétablir (`45` : `undoDispatch` unique pour Ctrl+Z / Ctrl+Y, filet `docCheckpoint`).
- `46`–`48` : assemblage — modèle des composants (`46`, `doc` = composant actif, l'arbre vit à côté dans `asm`), interface et mode Assembler (`47`), composants liés à un fichier (`47`), accroches, apparence, placement, composants depuis les corps, inspection (interférences, propriétés physiques), mise en plan d'assemblage (`48-*`). Liaisons rigide / pivot / glissière / pivot glissant / plan / rotule avec limites, sans solveur global.
- `49`–`62` : esquisse 2D (registre d'icônes `49`, cinq fichiers `50-esquisse-*`, solveur Levenberg-Marquardt), paramètres (`51`), configurations (`52`, tables de variantes), scripts JSON et pont de pilotage (`53`), trim et souris (`60`), Intersection (`62`, section exacte `BRepAlgoAPI_Section`, suivie au rejeu).
- `70`–`87` : fonctions 3D — extrusion (avec fenêtre dynamique `70`/`71`), révolution, perçage, combiner, congés et chanfreins (reprise NURBS quand le noyau refuse la chaîne), déplacer une face, **déplacer un corps** (translation, rotation, point à point), **scinder par un plan**, supprimer une face, dépouille, coque.
- `78`–`79` : géométrie de construction (modèle et résolution, puis affichage, saisie, panneau).
- `88-fao-00` à `88-fao-94` : FAO découpée par domaine (état, outils, brut, parcours 2,5D, zones, caches, post-processeurs (3+2 Siemens par CYCLE800, avance F modale), simulation — `70` grille et lecture, `75` cavités des posages 3+2 en voxels (repli sans WebGL2), `76` rendu GPU instancié, `77` cartes par orientation et lancer de rayons, `78` tri-dexel (retiré du choix) et champ de distance, `79` taille des cartes sur la carte graphique —, interface, ébauche 3D, contour, sélection 3+2).
- `89` : modules FAO spécialisés (chanfrein, contour, crêtes, faces, géodésique, outils, perçage, repère de posage, torique).
- `90` : picking, mesure, import/export STEP/STL/OBJ.
- `95`–`99` : barre d'outils, aide, bandeau de groupes, interface moderne (onglets Modèle / Usinage, onglets de posages), fichiers/projets, mise en plan (style, import DXF, treize fichiers `98-mep-*`), **rendu** (`98-rendu.js`, `98-rendu-vue.js`, `98-rendu-reliefs.js`), initialisation, raccourcis d'esquisse.

L'exécution reste **un seul script global** : les fichiers ne sont pas des modules ES, ils partagent la portée du livrable. C'est ce qui permet le double-clic sur le fichier HTML, mais c'est aussi la principale contrainte d'architecture.

## État fonctionnel vérifié dans le code

### Perçage (`89-fao-percage.js`) — traité

- **Reconnaissance des trous** sur la géométrie exacte OCCT, dans le repère du posage : Ø, Z haut / bas, débouchant ou borgne, angle de pointe, chanfrein ou lamage d'entrée, filets modélisés.
- **Sélection par groupe** (même Ø, même hauteur de départ), dans la fiche ou par clic dans la vue ; re-résolue à chaque reconstruction.
- **Cycles** : pointage, perçage, débourrage (Q), taraudage (sortie à la même avance), **lamage fraisé en hélice** (en avalant, anneaux concentriques si besoin).
- **Gamme automatique** pointage → perçage (débourrage au-delà de 4 × Ø) → lamage fraisé → taraudage, avec forets pris dans la bibliothèque ou créés.
- **Post** : CYCLE81/82/83/84 côté Siemens (y compris dans le plan incliné en CYCLE800), G81/G83 côté Fagor.
- **Tests** : `test_fao_percage`, `test_percage_3d`, `test_fao_percage_tranche`, et l'exemple « Perçages » dans la non-régression des parcours.

### Posage (`89-fao-posage-repere.js`, `97-interface-moderne.js`) — presque fini

| Étape prévue le 16/10 | État |
|---|---|
| Origine sur les 27 points cardinaux du brut ou du modèle | Fait |
| Directions Z et X depuis un axe, une face ou une arête, cases « Inverser » | Fait (posage et opération) |
| Parcours calculés dans le repère du posage, 3+2 réglé par opération | Fait (`faoShapeToF`, `faoOpFrame`) |
| Onglets de posages | Fait (`mfPosTabs`, en tête du panneau Usinage, avec « ＋ ») |
| Arcs de rotation sur les repères pour les tourner à la main | **Pas fait** |

## Chaîne de qualité

1. `node build.js` reconstruit le livrable.
2. `node build.js --check` vérifie qu'il correspond aux sources.
3. `node tests/chk_syntaxe.cjs` vérifie la syntaxe du script généré.
4. `node tests/run.cjs` exécute les 169 suites **en parallèle** (pool de processus, plus longues d'abord, ouvriers épinglés sur les cœurs P / E) ; `tests/run-fast.cjs` en exécute 54.
5. `npm run parcours` recalcule chaque opération des exemples suivis et compare son résumé à `tests/parcours/reference.json`.
6. `npm run lint` vérifie les identifiants non définis ; `npm run lint:all` inclut les avertissements (`catch` vides).
7. `npm run ci` enchaîne build, syntaxe, tests rapides et lint ; `npm run ci:full` fait de même avec toutes les suites.
8. `.github/workflows/ci.yml` lance à chaque push `npm run ci:full`, puis `npm run test:browser` dans un Chromium headless avec le noyau OCCT réel. `npm run test:gpu` (vraie carte graphique) reste local.

Le harnais de test (`tests/appvm.cjs`) exécute le vrai script dans une machine virtuelle Node avec des stubs DOM/THREE ; environ 70 suites chargent en plus le noyau OCCT réel. Ce qu'il ne voit pas (rendu WebGL, interface cliquée, chargement du `.wasm` par le navigateur) est couvert par Playwright.

## Points forts

- Distribution **sans installation**, adaptée à un usage atelier.
- Couverture fonctionnelle large : CAO, assemblage, FAO (2,5D, 3D, géodésique, 3+2, perçage complet, simulation GPU, G-code multi-machines), mise en plan, rendu réaliste.
- Nombreux tests de non-régression, tous référencés dans `tests/run.cjs`, non-régression chiffrée des parcours, discipline de build (`--check`).
- Annuler / Rétablir unifié pour tous les modules.
- Repli maillage automatique quand OCCT n'est pas disponible.
- Caches versionnés (géométrie, parcours) et empreinte documentaire pour éviter les rejeux inutiles.
- Version unique : tag Git = `APP_VER` = `package.json` = CHANGELOG.

## Risques et dette restante

- **Rythme de livraison très élevé** : 254 commits depuis le 1ᵉʳ octobre, une trentaine par jour les 25 et 26/10, sur tous les modules à la fois. L'Ébauche 3D, considérée comme validée, a été retouchée en V0.9.2, V0.11.11 et V0.11.12 : à revérifier dans l'application sur les exemples.
- **1 875 avertissements `no-empty`** (1 288 en V0.9.13, 1 046 en V0.3.5) : les `catch(e){}` silencieux augmentent à chaque version.
- **Gros fichiers** : `20-noyau-et-operations-solides.js` (~3 300 lignes), `88-fao-90-ebauche3d.js` (~2 400), `88-fao-80-interface.js` (~2 100), `90-picking-mesure-import.js` (~1 900), `88-fao-92-contour.js` (~1 850). Les fichiers `98-mep-*` partagent une fonction englobante et ne se lisent qu'assemblés.
- **Monolithe global** : namespace unique sans modules ni types ; les identifiants publics passent par `window`.
- **Couverture navigateur** : 20 parcours Playwright + 4 tests GPU ; le Rendu et une bonne part de l'interface se valident encore à la main.
- **Dépôt dans Dropbox** : la synchronisation crée des copies en conflit et peut abîmer `.git` (pack sans index constaté) ; `.git` pèse ~274 Mo, et `Backup/` (~256 Mo) et `occt/*.bak`, ignorés par Git, sont quand même synchronisés.
- **CHANGELOG volumineux** (~790 Ko).

## Priorités suivantes

1. Consolider : revérifier l'Ébauche 3D et la Géodésique (chiffres de référence RETARD) dans l'application, relancer `npm run parcours`.
2. Réduire les `catch` vides en journalisant l'erreur ou en justifiant l'ignorance.
3. Arcs de rotation sur les repères de posage et d'opération (dernière étape du posage).
4. Étendre les parcours Playwright (mise en plan, congés, 3+2, Rendu).
5. Découper `20-noyau-et-operations-solides.js` et les gros fichiers FAO.
6. Envisager de sortir le dépôt de Dropbox.
