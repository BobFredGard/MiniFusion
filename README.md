# MiniFusion

**Un logiciel de CAO paramétrique — esquisses, contraintes, solides, congés — entièrement contenu dans un seul fichier HTML.**
Zéro build, zéro framework : tu ouvres la page, tu dessines.

MiniFusion est un MVP de CAO historique (paramétrique, esprit Fusion 360) qui tourne dans le navigateur : esquisses 2D contraintes et cotées, solides générés par extrusion avec historique rejouable, congés, mesures, import/export STEP. Le kernel géométrique exact s'appuie sur **OpenCascade compilé en WebAssembly**, avec repli automatique en mode maillage (CSG) quand le noyau n'est pas disponible.

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
- **Congés exacts OCCT** : toutes les arêtes sont cliquables, rayon par arête, ancrages persistants qui retrouvent leurs arêtes après édition (repli maillage sans noyau).
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
| `fusion_mvp.html` | L'intégralité de l'app (~7 600 lignes : UI, solveur de contraintes, kernel, rendu, historique) |
| `occt/` | Noyau OpenCascade WebAssembly (~111 Mo) + ses `.bak` locaux (non suivis) |
| `threejs/` | Rendu 3D (three.js), OrbitControls, CSG |
| `Backup/` | Snapshots des versions vertes (`2026-09-28n` → `v`) |
| `Server.bat` | Lancement local (npx serve, port 3000) |

Pas de build : du HTML+JS commenté, versionné par `APP_VER` en tête de fichier avec changelog complet dans l'en-tête du code.

## Tests

- **In-app** : 🧪 Auto-tests (non-régression esquisse, contraintes, cotes) — lançables depuis le panneau latéral.
- **Dev** : harnais Node hors navigateur (24 scénarios : solveur, cotation orientée, suivi de faces, références…) ; la version est vérifiée (`APP_VER`) avant chaque sauvegarde dans `Backup/`.

## Où en est le projet

MVP fonctionnel — version **2026-09-28v**. Pistes envisagées : sauvegarde paramétrique complète des imports STEP (rejeu), mode bureau (Electron déjà en dépendance de dev), plus d'opérations solides.

> **Note contributeurs** : les anciennes zones gelées (sketch, contraintes, congés, antériorité) sont **dégelées depuis le 2026-09-29** — modification libre sous la discipline projet (régression 24/24 → bump `APP_VER` → snapshot `Backup/` → push). Seul le noyau exact OCCT (`occApplyXFillets`, `occFinalShape`) reste sous **accord systématique** : il n'est pas couvert par le harnais, toute modification exige une validation navigateur.

## Licences

- Code principal : **ISC** (voir `package.json`).
- `threejs/` : three.js & OrbitControls sous **MIT**, CSG.js — leurs licences s'appliquent.
- `occt/` : OpenCascade Technology sous **LGPL**.
