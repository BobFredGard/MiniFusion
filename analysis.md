# Analyse du projet MiniFusion

*État au 2026-10-19 — version `V0.3.5`.*

## Nature du projet

MiniFusion est une application web **mono-page** de **CAO paramétrique et FAO** utilisable hors-ligne. Le livrable est un **HTML unique** (`fusion_mvp.html`, ~2 Mo) généré à partir des sources de `src/`. Aucune installation, aucun compte, aucune dépendance runtime : l'application fonctionne en `file://`, avec un serveur statique facultatif.

Le noyau géométrique exact est **OpenCascade (OCCT) compilé en WebAssembly**. En cas d'indisponibilité, l'application bascule automatiquement sur un moteur maillage (CSG).

## Organisation

| Élément | Rôle |
|---|---|
| `src/*.js` | Sources, **48 fichiers** (~37 000 lignes), concaténés dans l'ordre numérique par `build.js`. |
| `fusion_mvp.html` | Livrable généré. **Ne jamais l'éditer à la main.** |
| `build.js` | Concaténation + bandeaux de section ; `--check` échoue si le livrable est périmé. |
| `tests/` | **105 suites** Node portables (`tests/run.cjs`) + sous-ensemble CI (`tests/run-fast.cjs`). |
| `tools/lint.cjs` | Lint ESLint du script concaténé, dans l'ordre exact du build. |
| `threejs/` | three.js, OrbitControls et CSG (MIT). |
| `occt/` | Noyau OCCT WebAssembly (LGPL), `.wasm` suivis par Git LFS. |
| `PostPro/` | Fiches machines (une par machine, intégrées par build.js). |
| `Backup/` | Instantanés locaux par version (non versionnés). |
| `docs/` | Captures et notes de conception. |

## Architecture des sources

- `00` : métadonnées (`APP_VER`), utilitaires, thème, caches.
- `10`–`20` : scène three.js, rejeu paramétrique, noyau exact OCCT et repli maillage.
- `30`–`45` : marqueur de temps, arbre/propriétés, annuler/rétablir documentaire.
- `49`–`60` : esquisse 2D, solveur Levenberg-Marquardt, contraintes, trim et interactions souris.
- `70`–`88` : fonctions 3D (extrusion, révolution, perçage, congés, chanfreins, dépouille, coque) puis FAO découpée par domaine :
  - `88-fao-00` à `88-fao-30` : constantes, état, outils, brut, parcours 2,5D ;
  - `88-fao-40` à `88-fao-50` : zones, plans, caches, dispatch, estimation ;
  - `88-fao-60` à `88-fao-70` : post-processeurs, prévisualisation, simulation ;
  - `88-fao-80` à `88-fao-94` : interface, ébauche 3D, suivi de contour, sélection 3+2.
- `89` : modules FAO spécialisés (contour, crêtes, outils, perçage, posage, torique).
- `90` : picking, mesure, import/export STEP/STL/OBJ.
- `95`–`99` : barre d'outils, interface moderne, fichiers/projets, aide, mise en plan, initialisation.

L'exécution reste **un seul script global** : les fichiers ne sont pas des modules ES, ils partagent la portée du livrable. C'est ce qui permet le double-clic sur le fichier HTML, mais c'est aussi la principale contrainte d'architecture.

## Chaîne de qualité

1. `node build.js` reconstruit le livrable.
2. `node build.js --check` vérifie qu'il correspond aux sources.
3. `node tests/chk_syntaxe.cjs` vérifie la syntaxe du script généré.
4. `node tests/run.cjs` exécute les 105 suites ; `tests/run-fast.cjs` en exécute 19 pour la CI.
5. `npm run lint` vérifie les identifiants non définis ; `npm run lint:all` inclut les avertissements (`catch` vides).
6. `.github/workflows/ci.yml` enchaîne build, syntaxe, tests rapides et lint.

Le harnais de test (`tests/appvm.cjs`) exécute le vrai script dans une machine virtuelle Node avec des stubs DOM/THREE ; plusieurs tests chargent en plus le noyau OCCT réel. Le noyau exact n'est toutefois pas couvert à 100 % par la suite Node : les évolutions critiques demandent une validation navigateur.

## Points forts

- Distribution **sans installation**, adaptée à un usage atelier.
- Fonctionnalités couvrant CAO, FAO, simulation, G-code et mise en plan.
- Nombreux tests de non-régression et discipline de build (`--check`).
- Repli maillage automatique quand OCCT n'est pas disponible.
- Caches versionnés (géométrie, parcours) et empreinte documentaire pour éviter les rejeux inutiles.
- Documentation de projet dense (README, CHANGELOG, commentaires de cause à effet).

## Risques et dette restante

- **Monolithe global** : malgré le découpage FAO, le script reste un namespace unique sans modules ni types ; les identifiants publics passent par `window`.
- **Fichier généré volumineux** : ~2 Mo, difficile à déboguer directement.
- **1046 avertissements `no-empty`** : les `catch(e){}` silencieux restent nombreux ; le lint les signale sans bloquer la CI.
- **OCCT non couvert par le harnais Node** : validation navigateur manuelle nécessaire.
- **Suite complète longue** : exécution sérielle, certains tests chargent le vrai WASM.
- **Git LFS** : nécessaire pour cloner les `.wasm` et les gros exemples ; un clone sans LFS donnera des pointeurs.
- **Historique Git** : les anciens blobs volumineux restent dans l'historique ; leur migration complète demanderait une réécriture (`git lfs migrate`).

## État des cinq axes d'amélioration

1. **Documentation et versions** : README, CHANGELOG, `analysis.md` et `package.json` alignés sur `V0.3.2` ; compteurs corrigés.
2. **Découpage de la FAO** : `88-fao.js` remplacé par 12 fichiers contigus, concaténation vérifiée identique.
3. **Git LFS** : `.wasm` et gros exemples suivis par LFS ; blobs existants convertis dans l'index.
4. **CI** : workflow GitHub Actions avec build, syntaxe, tests rapides et lint.
5. **Lint** : ESLint sans bundler sur le script concaténé ; `no-undef` en erreur, `no-empty` en avertissement. Le lint a déjà révélé deux défauts réels (`PRE` hors portée, `msgs` hors portée), corrigés.

## Priorités suivantes

1. Réduire progressivement les `catch` vides en journalisant l'erreur ou en justifiant l'ignorance.
2. Découper aussi les gros modules restants (`50-esquisse`, `98-mise-en-plan`) par domaine, toujours en chunks contigus.
3. Ajouter un test CI navigateur (Playwright) pour les parcours OCCT critiques.
4. Finaliser la migration LFS de l'historique si le poids du clone devient bloquant.
5. Maintenir la discipline : toute modification de `src/` suivie de `build`, tests, lint, bump `APP_VER`, CHANGELOG, snapshot et tag.
