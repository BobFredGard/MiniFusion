# Analyse du projet MiniFusion

*État au 2026-10-26 — version `V0.9.7`.*

## Nature du projet

MiniFusion est une application web **mono-page** de **CAO paramétrique, FAO et mise en plan** utilisable hors-ligne. Le livrable est un **HTML unique** (`fusion_mvp.html`, ~2,6 Mo) généré à partir des sources de `src/` et des fiches machines de `PostPro/`. Aucune installation, aucun compte, aucune dépendance runtime : l'application fonctionne en `file://`, avec un serveur statique facultatif.

Le noyau géométrique exact est **OpenCascade (OCCT) compilé en WebAssembly**. En cas d'indisponibilité, l'application bascule automatiquement sur un moteur maillage (CSG).

## Organisation

| Élément | Rôle |
|---|---|
| `src/*.js` | Sources, **77 fichiers** (~55 200 lignes), concaténés dans l'ordre numérique par `build.js`. |
| `PostPro/*.js` | Fiches machines (Fagor 8065, Siemens 630 et 1520), insérées par `build.js` après `88-fao-60-postprocesseurs.js`. Les `.cps` Autodesk restent locaux. |
| `fusion_mvp.html` | Livrable généré. **Ne jamais l'éditer à la main.** |
| `build.js` | Concaténation + bandeaux de section ; `--check` échoue si le livrable est périmé. |
| `tests/` | **115 suites** Node (`tests/run.cjs`, toutes en CI) + **23** rapides (`tests/run-fast.cjs`) ; parcours navigateur Playwright dans `tests/browser/`. |
| `tools/lint.cjs` | Lint ESLint du script concaténé, dans l'ordre exact du build. |
| `tools/mcp-minifusion.cjs` | Serveur MCP (stdio, sans dépendance) : relaie les scripts JSON vers la page par un WebSocket local (127.0.0.1). |
| `threejs/` | three.js, OrbitControls et CSG (MIT). |
| `occt/` | Noyau OCCT WebAssembly (LGPL), `.wasm` suivis par Git LFS. |
| `Exemples/` | Projets `.miniFusion` et STEP de référence (Git LFS). |
| `Backup/` | Instantanés locaux par version (non versionnés). |
| `docs/` | Captures et notes de conception. |

## Architecture des sources

- `00` : métadonnées (`APP_VER`, `CACHE_VER`), utilitaires, thème, caches.
- `10`–`20` : scène three.js, repère, rejeu paramétrique, noyau exact OCCT et repli maillage.
- `30`–`45` : marqueur de temps, arbre/propriétés, bandeau de timeline (`41`), annuler/rétablir documentaire.
- `46`–`48` : composants (arbre de composants imbriqués et composant actif, modes Modéliser / Placer, placement). `doc` reste la pièce globale : c'est le **composant actif**, l'arbre vit à côté (`asm`). `48-composants-depuis-corps.js` : extraire un corps (ou une esquisse) et tout ce qui le construit vers un composant. `47-composants-lies.js` : composants liés à un fichier (dossier de projets, édition sur place, mise à jour). Arêtes des autres composants projetables dans une esquisse (`asmSkExt*`, 46).
- `49`–`60` : esquisse 2D, solveur Levenberg-Marquardt, paramètres (`51`), configurations (`52`, tables de variantes), scripts JSON et pont de pilotage (`53`), trim et interactions souris ; `62-esquisse-intersection.js` : outil Intersection (section exacte `BRepAlgoAPI_Section` du solide ou des faces par le plan, courbes de référence suivies au rejeu par `updateAssociativeProjections`).
- `78`–`79` : géométrie de construction (modèle et résolution, puis affichage, saisie, panneau).
- `70`–`87` : fonctions 3D (extrusion, révolution, perçage, combiner, congés, chanfreins, faces, dépouille, coque). `70-extrusion-dynamique.js` et `71-fenetre-dynamique.js` : fenêtre dynamique (aperçu immédiat, poignée dans la vue, champ flottant, Annuler / OK) de l’extrusion, puis de la révolution, du perçage et du congé.
- `88-fao-00` à `88-fao-94` : FAO découpée par domaine (état, outils, brut, parcours 2,5D, zones, caches, post-processeurs (3+2 Siemens par CYCLE800), simulation — `70` grille et lecture, `75` cavités des posages 3+2 en voxels (repli sans WebGL2), `76` rendu GPU instancié, `77` cartes par orientation et lancer de rayons, `78` moteurs tri-dexel (retiré du choix) et champ de distance, `79` taille des cartes sur la carte graphique —, interface, ébauche 3D, contour, sélection 3+2).
- `89` : modules FAO spécialisés (chanfrein, contour, crêtes, faces, géodésique, outils, perçage, posage, torique).
- `90` : picking, mesure, import/export STEP/STL/OBJ.
- `95`–`99` : barre d'outils, aide, interface moderne, fichiers/projets, mise en plan (+ style, import DXF), initialisation, raccourcis d'esquisse (`99-raccourcis-esquisse.js`, ex-`shortcuts.js`).

L'exécution reste **un seul script global** : les fichiers ne sont pas des modules ES, ils partagent la portée du livrable. C'est ce qui permet le double-clic sur le fichier HTML, mais c'est aussi la principale contrainte d'architecture. Aucune fonction de haut niveau n'est déclarée deux fois (vérifié le 2026-10-23).

## Chaîne de qualité

1. `node build.js` reconstruit le livrable.
2. `node build.js --check` vérifie qu'il correspond aux sources.
3. `node tests/chk_syntaxe.cjs` vérifie la syntaxe du script généré.
4. `node tests/run.cjs` exécute les 115 suites **en parallèle** (pool de processus, plus longues d'abord ; ~3,5 min au lieu de ~20 en série sur 8 cœurs) ; `tests/run-fast.cjs` en exécute 23.
5. `npm run lint` vérifie les identifiants non définis ; `npm run lint:all` inclut les avertissements (`catch` vides).
6. `npm run ci` enchaîne build, syntaxe, tests rapides et lint (~1 min) ; `npm run ci:full` fait de même avec les 115 suites.
7. `.github/workflows/ci.yml` lance à chaque push `npm run ci:full`, puis `npm run test:browser` : parcours critiques dans un vrai Chromium headless avec le noyau OCCT réel (ouverture d'`Axe.miniFusion`, esquisse → extrusion, FAO → G-code).

Le harnais de test (`tests/appvm.cjs`) exécute le vrai script dans une machine virtuelle Node avec des stubs DOM/THREE ; environ 70 suites chargent en plus le noyau OCCT réel. Ce qu'il ne voit pas (rendu WebGL, interface cliquée, chargement du `.wasm` par le navigateur) est couvert par les tests Playwright, sur quelques parcours seulement.

## Points forts

- Distribution **sans installation**, adaptée à un usage atelier.
- Fonctionnalités couvrant CAO, FAO (2,5D, 3D, 3+2, perçage, simulation, G-code multi-machines) et mise en plan.
- Nombreux tests de non-régression, tous référencés dans `tests/run.cjs`, et discipline de build (`--check`).
- Repli maillage automatique quand OCCT n'est pas disponible.
- Caches versionnés (géométrie, parcours) et empreinte documentaire pour éviter les rejeux inutiles.
- Version unique : tag Git = `APP_VER` = `package.json` = CHANGELOG.

## Risques et dette restante

- **Suites FAO lentes** : sept suites (`test_fao_brut_corps`, `_ebauche_brut`, `_bornage`, `_couverture`, `_securite`, `_faces`, `_torique`) durent 85 à 145 s chacune et fixent la durée minimale de la suite parallèle, quel que soit le nombre de cœurs.
- **1288 avertissements `no-empty`** (1046 en V0.3.5) : les `catch(e){}` silencieux augmentent au lieu de diminuer.
- **Gros fichiers** : `98-mise-en-plan.js` (~9 400 lignes), `50-esquisse-2d-solveur.js` (~4 000), `20-noyau-et-operations-solides.js` (~2 900).
- **Monolithe global** : namespace unique sans modules ni types ; les identifiants publics passent par `window`.
- **Couverture navigateur étroite** : trois parcours Playwright seulement ; le reste de l'interface réelle se valide à la main.
- **Dépôt dans Dropbox** : la synchronisation crée des copies en conflit et peut abîmer `.git` (pack sans index constaté) ; `.git` pèse ~213 Mo, et `Backup/` (~227 Mo) et `occt/*.bak` (~50 Mo), ignorés par Git, sont quand même synchronisés.
- **CHANGELOG volumineux** (~650 Ko, 306 versions).

## Priorités suivantes

1. Réduire les `catch` vides en journalisant l'erreur ou en justifiant l'ignorance.
2. Découper `98-mise-en-plan.js` et `50-esquisse-2d-solveur.js` par domaine, en chunks contigus.
3. Découper les sept suites FAO lentes pour descendre la suite complète sous 2 min.
4. Étendre les parcours Playwright (mise en plan, congés, 3+2).
5. Envisager de sortir le dépôt de Dropbox.
