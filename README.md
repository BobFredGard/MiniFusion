# MiniFusion

**Un logiciel de CAO paramétrique — esquisses, contraintes, solides, congés — entièrement contenu dans un seul fichier HTML.**
Zéro build, zéro framework : tu ouvres la page, tu dessines.

MiniFusion est un MVP de CAO historique (paramétrique, esprit Fusion 360) qui tourne dans le navigateur : esquisses 2D contraintes et cotées, solides générés par extrusion avec historique rejouable, congés, mesures, import/export STEP. Le kernel géométrique exact s'appuie sur **OpenCascade compilé en WebAssembly**, avec repli automatique en mode maillage (CSG) quand le noyau n'est pas disponible.

## Image de l'interface
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b066f7e6-5170-4a59-b83a-301ff77b9692" />

## Fonctionnalités

### Esquisse contrainte & cotée
- **Dessin** : ligne, rectangle, oblong/rainure, cercle, arc, point de construction, ajustement (trim), fusion de points.
- **Contraintes** : horizontal/vertical, parallèle, perpendiculaire, égal, symétrie, tangence, coaxiale, fixe, construction — avec auto-inférences (perpendicular/tangent détectées à la création).
- **Cotes pilotées** : longueur, Ø, rayon, distance, angle, entraxe. Les cotes se posent en **H, V ou aligné selon la position du curseur**, avec angles complémentaires gérés (secteur obtus respecté).
- **Solveur maison** : Levenberg-Marquardt + relaxation, panneau « Santé » (degrés de liberté, résidus), annuler/rétablir, grille magnétique.
- **Projections associatives** : projeter une arête 3D du solide dans l'esquisse (⧉) pour la coter — l'entité suit les changements du modèle.

### Du plan au solide
- Extrusions **additives (➕) et soustractives (➖)**, arborescence avec historique rejouable à chaque modification.
- **Esquisses sur face** : posées sur n'importe quelle orientation, elles **suivent leur face d'attache** quand le modèle change (épaisseur réduite, profil élargi, face latérale qui bouge).
- **Congés exacts OCCT** : toutes les arêtes sont cliquables, rayon par arête, **sélection éditable** (ajout/retrait d'arêtes sur un congé existant, double-clic dans l'arbre), ancrages persistants qui retrouvent leurs arêtes après édition (repli maillage sans noyau).
- **Références nommées** : chaque arête de congé, face porteuse et projection reçoit un nom persistant (`Arête 1`, `Face 2`, `Projetée 3`) — visible dans les panneaux, conservé à la sauvegarde.
- Cotes de cotations, mesures 3D (face→face, Ø, entraxe), coupe par plan, vues standard, sol miroir.

### Mesure & échange
- Import **STEP / STL**, export **STEP / STL / OBJ**.
- Projets `.minifusion.json` (paramétriques) + sauvegarde locale automatique (autosave).

## Démarrage

```bat
Server.bat          &:: sert le dossier sur http://localhost:3000
```

ou, n'importe quel serveur statique :

```bash
npx serve . -l 3000
python -m http.server 3000
```

- **Avec serveur** : tout fonctionne, y compris le noyau exact OCCT.
- **En `file://`** (double-clic sur `fusion_mvp.html`) : mode maillage ; clique sur **⚙ Noyau .wasm…** et désigne `occt/opencascade.wasm.wasm` pour activer le noyau exact sans serveur.
- Dans l'application : **🧪 Auto-tests** rejoue la batterie de non-régression de l'esquisse.

## Architecture du dépôt

| Chemin | Rôle |
|---|---|
| `fusion_mvp.html` | L'intégralité de l'app (~7 800 lignes : UI, solveur de contraintes, kernel, rendu, historique) |
| `occt/` | Noyau OpenCascade WebAssembly (~111 Mo) + ses `.bak` locaux (non suivis) |
| `threejs/` | Rendu 3D (three.js), OrbitControls, CSG |
| `Backup/` | Snapshots des versions vertes (`2026-09-28n` → `2026-09-29b`) |
| `Server.bat` | Lancement local (npx serve, port 3000) |

Pas de build : du HTML+JS commenté, versionné par `APP_VER` en tête de fichier avec changelog complet dans l'en-tête du code.

## Tests

- **In-app** : 🧪 Auto-tests (non-régression esquisse, contraintes, cotes) — lançables depuis le panneau latéral.
- **Dev** : harnais Node hors navigateur (31 scénarios : solveur, cotation orientée, suivi de faces, références, projections associatives, congés exacts, menu d'extrusion, prismes miroir… ; 3 exigent le noyau OCCT du navigateur) ; la version est vérifiée (`APP_VER`) avant chaque sauvegarde dans `Backup/`.

## Journal des modifications

Résumé des derniers push (changelog complet dans l'en-tête de `fusion_mvp.html`) :

| Version | Objet |
|---|---|
| `2026-09-28x` | Congé du périmètre (rims haut/bas) en voie exacte OCCT : `rimEdgeJobs` + `occRimFillets`, échec isolé non destructif — `test_fillet_rim` |
| `2026-09-28y` | Projections associatives qui suivent l'édition de la source : nettoyage `occCleanup` différé (use-after-free), scoring d'identité + `wantType`, `projRefreshRerun` rejoue le solide après MAJ — `test_proj_follow` |
| `2026-09-28z` | Congés ∥ X/Y fiables : repli position côté opposé corrigé (`zref`), `occFilletRun` lot → arête par arête (une arête ne fait plus tomber le lot) pour `occApplyXFillets` + rims — `test_xfillet_flow` |
| `2026-09-29a` | Congé exact : correspondance sélection→arête fiabilisée (`xAnchorFor` voit les esquisses masquées, passe 2 et `xAnchorMatch` en meilleur candidat unique, dédoublonnage des docs corrompus) + **édition de congé** (bouton ✏️ / double-clic → rejeu sans la fonction `occSkipFeat`, mise à jour en place) + transparence esquisse 0.75 — `test_xmatch_n`, régression 29/29 |
| `2026-09-29b` | **Menu d'extrusion** refondu (Sens un côté/symétrique, Étendue distance ou **vers un objet** avec antériorité + visée ±n, 🎯 sens via face cliquée, flèche 3D avec commit distance, renommage auto) + **faces verticales UNE seule face** : `occSpanPrism`/`occDiskPrism` en **prisme unique** au plan décalé `z=lo` (fin de la fusion 0→hi + 0→lo = couture au plan médian — 6 faces au lieu de 10) + `occUnify` (`ShapeUpgrade_UnifySameDomain`, fallback sans exception) après chaque union additive → mode **Uni par Additif** sans couture — `test_extmenu_n`, `test_mirror_uni_n`, régression 31/31 |

## Où en est le projet

MVP fonctionnel — version **2026-09-29b**. Pistes envisagées : sauvegarde paramétrique complète des imports STEP (rejeu), mode bureau (Electron déjà en dépendance de dev), plus d'opérations solides.

> **Note contributeurs** : les anciennes zones gelées (sketch, contraintes, congés, antériorité) sont **dégelées depuis le 2026-09-29** — modification libre sous la discipline projet : régression 29/29 → bump `APP_VER` → snapshot `Backup/` → **entrée dans « Journal des modifications » de ce README** → push. Seul le noyau exact OCCT (`occApplyXFillets`, `occFinalShape`) reste sous **accord systématique** : il n'est pas couvert par le harnais, toute modification exige une validation navigateur.

## Licences

- Code principal : **ISC** (voir `package.json`).
- `threejs/` : three.js & OrbitControls sous **MIT**, CSG.js — leurs licences s'appliquent.
- `occt/` : OpenCascade Technology sous **LGPL**.
