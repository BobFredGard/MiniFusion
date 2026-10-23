# Analyse du projet MiniFusion

*État au 2026-10-23 — version `V0.4.7`.*

## Nature du projet

MiniFusion est une application web **mono-page** de **CAO paramétrique, FAO et mise en plan** utilisable hors-ligne. Le livrable est un **HTML unique** (`fusion_mvp.html`, ~2,6 Mo) généré à partir des sources de `src/` et des fiches machines de `PostPro/`. Aucune installation, aucun compte, aucune dépendance runtime : l'application fonctionne en `file://`, avec un serveur statique facultatif.

Le noyau géométrique exact est **OpenCascade (OCCT) compilé en WebAssembly**. En cas d'indisponibilité, l'application bascule automatiquement sur un moteur maillage (CSG).

## Organisation

| Élément | Rôle |
|---|---|
| `src/*.js` | Sources, **54 fichiers** (~47 000 lignes), concaténés dans l'ordre numérique par `build.js`. |
| `PostPro/*.js` | Fiches machines (Fagor 8065, Siemens 630 et 1520), insérées par `build.js` après `88-fao-60-postprocesseurs.js`. Les `.cps` Autodesk restent locaux. |
| `fusion_mvp.html` | Livrable généré. **Ne jamais l'éditer à la main.** |
| `build.js` | Concaténation + bandeaux de section ; `--check` échoue si le livrable est périmé. |
| `tests/` | **115 suites** Node (`tests/run.cjs`) + **23** en CI (`tests/run-fast.cjs`). |
| `tools/lint.cjs` | Lint ESLint du script concaténé, dans l'ordre exact du build. |
| `threejs/` | three.js, OrbitControls et CSG (MIT). |
| `occt/` | Noyau OCCT WebAssembly (LGPL), `.wasm` suivis par Git LFS. |
| `Exemples/` | Projets `.miniFusion` et STEP de référence (Git LFS). |
| `Backup/` | Instantanés locaux par version (non versionnés). |
| `docs/` | Captures et notes de conception. |

## Architecture des sources

- `00` : métadonnées (`APP_VER`, `CACHE_VER`), utilitaires, thème, caches.
- `10`–`20` : scène three.js, repère, rejeu paramétrique, noyau exact OCCT et repli maillage.
- `30`–`45` : marqueur de temps, arbre/propriétés, annuler/rétablir documentaire.
- `49`–`60` : esquisse 2D, solveur Levenberg-Marquardt, paramètres, trim et interactions souris.
- `70`–`87` : fonctions 3D (extrusion, révolution, perçage, combiner, congés, chanfreins, faces, dépouille, coque).
- `88-fao-00` à `88-fao-94` : FAO découpée par domaine (état, outils, brut, parcours 2,5D, zones, caches, post-processeurs, simulation, interface, ébauche 3D, contour, sélection 3+2).
- `89` : modules FAO spécialisés (contour, crêtes, faces, géodésique, outils, perçage, posage, torique).
- `90` : picking, mesure, import/export STEP/STL/OBJ.
- `95`–`99` : barre d'outils, aide, interface moderne, fichiers/projets, mise en plan (+ style, import DXF), initialisation, raccourcis d'esquisse (`99-raccourcis-esquisse.js`, ex-`shortcuts.js`).

L'exécution reste **un seul script global** : les fichiers ne sont pas des modules ES, ils partagent la portée du livrable. C'est ce qui permet le double-clic sur le fichier HTML, mais c'est aussi la principale contrainte d'architecture. Aucune fonction de haut niveau n'est déclarée deux fois (vérifié le 2026-10-23).

## Chaîne de qualité

1. `node build.js` reconstruit le livrable.
2. `node build.js --check` vérifie qu'il correspond aux sources.
3. `node tests/chk_syntaxe.cjs` vérifie la syntaxe du script généré.
4. `node tests/run.cjs` exécute les 115 suites ; `tests/run-fast.cjs` en exécute 23 pour la CI.
5. `npm run lint` vérifie les identifiants non définis ; `npm run lint:all` inclut les avertissements (`catch` vides).
6. `npm run ci` et `.github/workflows/ci.yml` enchaînent build, syntaxe, tests rapides et lint (~1 min).

Le harnais de test (`tests/appvm.cjs`) exécute le vrai script dans une machine virtuelle Node avec des stubs DOM/THREE ; plusieurs tests chargent en plus le noyau OCCT réel. Le noyau exact n'est toutefois pas couvert à 100 % par la suite Node : les évolutions critiques demandent une validation navigateur.

## Points forts

- Distribution **sans installation**, adaptée à un usage atelier.
- Fonctionnalités couvrant CAO, FAO (2,5D, 3D, 3+2, perçage, simulation, G-code multi-machines) et mise en plan.
- Nombreux tests de non-régression, tous référencés dans `tests/run.cjs`, et discipline de build (`--check`).
- Repli maillage automatique quand OCCT n'est pas disponible.
- Caches versionnés (géométrie, parcours) et empreinte documentaire pour éviter les rejeux inutiles.
- Version unique : tag Git = `APP_VER` = `package.json` = CHANGELOG.

## Risques et dette restante

- **Suite complète rarement lancée** : la CI n'exécute que 23 suites sur 115. Deux tests d'esquisse sont restés en échec de V0.4.0 à V0.4.7 sans être vus (corrigés le 2026-10-23 et ajoutés à la suite rapide). Lancer `npm test` avant chaque tag.
- **1288 avertissements `no-empty`** (1046 en V0.3.5) : les `catch(e){}` silencieux augmentent au lieu de diminuer.
- **Gros fichiers** : `98-mise-en-plan.js` (~9 400 lignes), `50-esquisse-2d-solveur.js` (~4 000), `20-noyau-et-operations-solides.js` (~2 900).
- **Monolithe global** : namespace unique sans modules ni types ; les identifiants publics passent par `window`.
- **OCCT non couvert par le harnais Node** : validation navigateur manuelle nécessaire.
- **Dépôt dans Dropbox** : la synchronisation crée des copies en conflit et peut abîmer `.git` (pack sans index constaté) ; `.git` pèse ~318 Mo.
- **CHANGELOG volumineux** (~650 Ko, 306 versions).

## Priorités suivantes

1. Lancer la suite complète avant chaque tag (par ex. un script `npm run ci:full`).
2. Réduire les `catch` vides en journalisant l'erreur ou en justifiant l'ignorance.
3. Découper `98-mise-en-plan.js` et `50-esquisse-2d-solveur.js` par domaine, en chunks contigus.
4. Ajouter un test CI navigateur (Playwright) pour les parcours OCCT critiques.
5. Envisager de sortir le dépôt de Dropbox.
