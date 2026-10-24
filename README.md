# MiniFusion

**CAO paramétrique, FAO et mise en plan dans un seul fichier HTML.** Esquisses contraintes, solides à historique, congés exacts, posages, parcours 2,5D / 3D, 3+2, G-code et planches cotées ISO. On ouvre la page et on travaille : il n'y a ni installation ni compte.

Le noyau géométrique exact est **OpenCascade compilé en WebAssembly**. Si le noyau n'est pas disponible, l'application bascule seule sur un moteur maillage (CSG). Version actuelle : **V0.4.9** (voir le [journal des modifications](CHANGELOG.md)).

## Sommaire

- [Interface](#interface)
- [CAO](#cao) : esquisse, fonctions 3D, corps, mesures, fichiers
- [FAO](#fao) : posage, brut, opérations, simulation, 3+2, G-code
- [PLAN](#plan) : planches, vues, coupes, cotation, sorties
- [Souris et clavier](#souris-et-clavier)
- [Démarrage](#démarrage) · [Développement](#développement) · [Licences](#licences)

## Interface

![Interface](docs/captures/interface-moderne.png)

Une seule interface, organisée en **trois espaces** : **CAO**, **FAO** et **PLAN**.
- **Ruban à icônes** propre à chaque espace, **recherche de commandes** (`Ctrl+K`), barre rapide (annuler, rétablir, enregistrer).
- **Navigateur Modèle / Usinage** avec des **onglets de posages**, et panneau de propriétés à droite.
- **Barre d'état** : noyau, mesure, enregistrement, version ; au premier lancement, le bouton **Noyau .wasm…** y active le noyau exact.
- **Cinq thèmes** (bouton palette) : **Nuit**, **Graphite**, **Atelier**, **Clair** (vue 3D claire comprise) et **Contraste élevé**. Le choix est mémorisé.

![Thème clair](docs/captures/theme-clair.png)

**Vue 3D**
- **Cube de vue** cliquable (faces, ⌂ = vue iso complète) et vues Dessus / Face / Droite / Iso.
- **Orbite contrainte** (Z en haut) ou **orbite libre** dans tous les sens, au choix par le bouton ⟲ du cube ; le **centre de rotation** est la face sélectionnée, sinon le centre des pièces visibles.
- **Sol miroir** sous la pièce (sous le brut en FAO). En FAO, le haut de la vue est le Z du posage ou de l'opération.

## CAO

![Esquisse](docs/captures/cao-esquisse.png)

### Esquisse

**Vue d'esquisse, façon Fusion 360**
- À l'ouverture, l'esquisse se met **à plat**, face choisie **devant et à l'endroit** (le Z du monde en haut). Si on décoche la case **« À plat »**, la **vue 3D courante est gardée** : on dessine sur le plan sans quitter son point de vue, et la vue reste orientée ainsi à la sortie.
- **Orbite** pendant le dessin : **clic-molette glissé**, cube de vue, ou bouton **⟳** (vue inclinée ↔ à plat). La touche **N** remet la vue à plat dans le plan de l'esquisse. Le tracé, l'accrochage, le zoom et le déplacement restent exacts sur le plan sous tous les angles, et les cotes restent lisibles.
- La **pièce est affichée en transparence** : faces légèrement teintées, toutes les arêtes tracées comme en 3D (gris clair devant, gris plus sombre derrière). Pour une esquisse consommée par une fonction, c'est l'état de la pièce **avant** cette fonction.
- **Grille** affichable ou masquée (bouton **▦**, masquée par défaut, choix mémorisé) ; les axes de l'origine restent toujours visibles. L'accroche au pas (« Grille 1 mm ») marche dans les deux cas.
- Une esquisse posée sur une face verticale a son axe vertical vers le haut : elle ne s'ouvre plus à l'envers.

![Esquisse en vue 3D inclinée : pièce en transparence, arêtes visibles et cachées](docs/captures/cao-esquisse-3d.jpg)

**Dessin et contraintes**
- **Outils** : ligne, rectangle (coin ou centre), oblong, cercle, arc, points de construction et de perçage, **projection associative** d'arêtes 3D, congé, chanfrein et décalage 2D, ajustement (trim).
- **Contraintes** (13) : horizontal, vertical, parallèle, perpendiculaire, colinéaire, égal, symétrie (y compris par rapport à une droite infinie), tangence (le côté se choisit), coaxial, milieu, fixe, coïncident, construction.
- **Solveur** : moindres carrés (Levenberg-Marquardt). Le panneau « Santé » affiche les degrés de liberté réels ; l'esquisse est bleue (sous-contrainte) ou blanche (totalement contrainte).
- **Cotes pilotées** : longueur, Ø, rayon, distance, angle, entraxe ; cotes de référence ; saisie dynamique de la longueur et de l'angle pendant le tracé.
- **Paramètres nommés** (`nom = valeur`) et **expressions ƒx**, dans les cotes comme dans les champs des fonctions 3D.
- **Raccourcis** `F1`–`F12` (contraintes), `H` (centre de perçage), `L` `C` `R` `B` `P` `T` `D` `F` `O` (outils), `X` (construction), `N` (à plat), plus une aide intégrée.

![Pièce de révolution, congés, chanfreins, perçages répétés](docs/captures/cao-axe.png)

### Fonctions 3D

Historique rejouable, arborescence et marqueur de temps.
- **Extrusion** : ajout ou découpe, sur une distance, jusqu'à une face ou à travers tout, en symétrique, avec dépouille ; elle peut créer un **nouveau corps**.
- **Révolution** autour d'une ligne de l'esquisse ou d'un axe X / Y / Z.
- **Perçage** simple, lamé, fraisé ou taraudé (filet ISO réellement modélisé), débouchant ou borgne, répétable.
- **Congés et chanfreins exacts** sur les arêtes cliquées, en suivant la chaîne tangente ou sur l'arête seule ; aperçu avec les nouvelles faces en orange.
- **Modifier le solide** : déplacer une face (push / pull), **supprimer une face** (`Suppr`, les voisines se prolongent : congé → arête vive, trou rebouché), dépouille, coque, répétition linéaire, circulaire ou par symétrie, **combiner** des corps (union, soustraction, intersection).

### Corps, mesures, fichiers

- **Corps** : couleur, intensité, **transparence « verre »** avec arêtes cachées en filigrane, isoler, tout afficher.
- **Mesures** : face à face, Ø, entraxe, et mesure entre 2 arêtes avec `Ctrl+clic`.
- **Repère pièce** : point central, axes et 3 petits plans cliquables (esquisse dessus) ; chaque élément se masque séparément.
- **Fichiers** : import STEP / STL ; export STEP / STL / OBJ (aussi pour un seul corps) ; projet **`.miniFusion`** (document, parcours FAO, planches) ; sauvegarde locale automatique.

## FAO

![Posage : brut, points cardinaux, repère](docs/captures/fao-posage.png)

### Posage et brut

- Le repère du posage est **le repère d'usinage** : son origine est le **Z0** de toutes ses opérations et du G-code. Tous les calculs se font dans ce repère.
- **Origine** : un des **27 points cardinaux** du brut ou du modèle, cliqué dans la vue. **Orientation Z / X** sur les axes de la pièce, par clic sur une face ou une arête, ou par **rotation autour de X**.
- **Brut** : **boîte**, **cylindre** (axe X / Y / Z, Ø exact) ou **corps réel** (un corps du modèle sert de brut, il est usiné et simulé tel quel) ; marge XY et surépaisseurs Z+ / Z− ; affiché en transparence quand le posage est sélectionné.
- **Fiche posage en onglets** : Général, Repère, Modèle, Brut, Plans, Temps.
- **Réglages machine** : Siemens 840D (630 / 1520) ou Fagor 8065, origine G54–G59, plans de dégagement et de retrait, bridage.
- **Outils** : fraises cylindriques, boules, toriques, forets et forets à pointer (pointe réelle), **foret à centrer DIN 333 A**, tarauds.

![Simulation d'usinage avec enlèvement de matière](docs/captures/fao-simulation.png)

### Opérations

- **Surfaçage**, **Poche**, **Contour** (avec attaches), **Perçage** (cycles 81 / 82 / 83, débourrage, brise-copeaux, taraudage, fraisage hélicoïdal, pointage).
- **Ébauche 3D** : niveaux en Z, minipasses entre les niveaux, entrées par l'extérieur quand l'air est à portée, sinon en hélice ; option **« Finir une région avant l'autre »** ; calcul sur un maillage précis (0,05 mm) du solide exact.
- **Finition** (passes parallèles ou à crête constante) et **Géodésique** (passes à distance constante sur les faces choisies, depuis leurs bords, rejointes en glissant au contact).
- **Faces usinables (bleu) / intouchables (rouge)** par opération, avec marge et **« Interdire devant la face »** : la fraise ne descend jamais le long d'un flanc rouge.
- **Zones** : rectangle, chaîne d'arêtes du modèle ou esquisse, avec îlots ; hauteurs par références (dessus du brut, haut ou bas du modèle, bridage, face cliquée, origine).
- **Simulation** : outil réel, matière enlevée au fil des passes à partir du vrai brut, rendu réel ou lisse, temps estimé.
- **Cache des parcours** : rien n'est recalculé tant que la géométrie ne change pas.

![3+2 : surfaçage d'un chanfrein, outil incliné](docs/captures/fao-3plus2.png)

### Repère d'opération (3+2) et G-code

- Une opération peut avoir **son propre Z et X**, pris sur une face ou une arête, avec un **centre commun** avec le posage. Elle est calculée dans ce repère et le G-code oriente l'outil par **B / C** avant l'opération (Siemens `TRAORI` ; le Fagor 3 axes est signalé). La simulation incline l'outil.
- **G-code** multi-outils, cycles du dialecte, coordonnées relatives à l'origine du posage. *Validez toujours un premier programme à vide sur la machine.*

## PLAN

**Mise en plan 2D** : les planches sont enregistrées avec la pièce et la FAO, et suivent le modèle.

![Planche A3 : vues, coupe B-B, cotation, vue 3D](docs/captures/plan-planche.png)

### Planches

- **Formats** A4 à A0 en paysage (H) ou portrait (V), ou **format manuel** en mm ; plusieurs planches en onglets (nouvelle, dupliquer).
- **Cadre** réglable : marges, traits, couleurs, zones de repérage, repères de centrage ; préréglages **Justet**, **ISO 5457**, Classique.
- **Cartouche** éditable (esquisse contrainte, champs matière, TTS, TTH…), export / import `.mfcartouche` ; **nomenclature** et **tableau des révisions**.
- **Écriture ISO 3098** : hauteurs des cotes, des repères et des textes.
- **Paramètres du plan** enregistrés par projet, export / import `.mfplan`. Panneau en onglets : Planche, Cartouche, Dessin 2D, Axes, Cotation, Vue, Sortie.

### Vues

- **Types** : Face, Projection (1er angle, liée à sa vue mère), ISO, Caméra (depuis la 3D), Auxiliaire, **Coupe** et **Détail**, par corps ou en assemblage.
- **Arêtes exactes** du noyau (HLR OCCT), y compris pour un STEP importé ; cachées supprimées ou en pointillé, tangentes au choix ; ombrage ou rendu 3D.
- **Projection** : orthogonale, **perspective** comme la vue 3D (la « fuyante » règle l'angle de champ) ou **cavalière** (angle et coefficient des fuyantes).
- **Ligne de coupe** droite ou **brisée** (ISO 128-44), liée aux perçages, traits d'axe et arêtes (elle suit le trou) ; on tire un tronçon pour le déplacer, **Ctrl + clic** ajoute une brisure, **Maj + clic** l'enlève.
- **Hachures** (ISO 128-50) : double-clic → motif, angle, échelle, couleur, pour toutes les coupes.
- **Filetages** (ISO 6410) des perçages taraudés : 3/4 de cercle en bout, fond de filet et fin de filetage en coupe.
- **Axes** (ISO 128-2) : trou, alignement, cercle de perçage, cylindres d'un STEP, **symétrie** entre deux droites (associatif) ; ils s'étirent, s'accrochent et se cotent.

![Hachures : motif, angle, échelle, couleur](docs/captures/plan-hachures.png)

![Vue caméra en perspective, réglage de la fuyante](docs/captures/plan-perspective.png)

### Cotation

- **Cote** (outil unique) : longueur, distance, Ø, rayon, angle. On tire une cote le long de ses lignes de rappel et sa valeur le long de la ligne ; double-clic = sens des flèches. Les cotes accrochées à un axe ou à une arête **suivent** quand la pièce change.
- **Tolérances** : ± symétrique, double, **classe ISO 286** avec ses écarts (`Ø40 H7 (+0,025 / 0)`) ; cotes de référence.
- **Perçages** : étiquette depuis la fonction Perçage (Ø, lamage, fraisure, taraudage, n×), avec tolérance ; « Perçages auto » cote toute la planche.
- **Ordonnées X / Y** : une origine « 0 », des valeurs alignées qui se déplacent ensemble, une tolérance par valeur.
- **Notes** à flèche et **alignement** de cotes sur une cote de référence.

![Cotation : ordonnées, tolérance ISO 286, perçages, note](docs/captures/plan-cotation.png)

**Dessin 2D** sur la planche : ligne, rectangle, cercle, arc, point, ajustement, texte ; contraintes et accrochage sur les vues.

**Sortie** : SVG, **DXF R12** (calques CONTOUR, CACHE, AXE, COTES, HACHURES, FILETAGE…), **PDF** au format exact de la planche, impression ; en couleur ou tout en noir.

## Souris et clavier

| | Vue 3D | Esquisse |
|---|---|---|
| Clic gauche | sélection | dessin, sélection (jamais de rotation) |
| Glisser gauche | rotation | dessin, déplacement d'entités, sélection au cadre |
| Clic-molette glissé | rotation | **rotation** (orbite autour du centre du dessin) |
| Clic droit glissé | déplacement | **déplacement** |
| Clic droit court | menu contextuel | menu contextuel / annuler l'action |
| Molette | zoom | zoom sous le curseur |
| Clavier | `Ctrl+K` commandes, `Suppr` supprimer une face | `N` à plat, `Échap` fin d'outil, `F1`–`F12`, `H`, `X`, `Ctrl+Z` / `Ctrl+Y` |

## Démarrage

```bat
Server.bat
```

`Server.bat` sert le dossier sur `http://localhost:3000`. N'importe quel serveur statique convient aussi :

```bash
npx serve . -l 3000
```

En `file://` (double-clic sur `fusion_mvp.html`), l'application démarre en mode maillage. Le bouton **Noyau .wasm…** active le noyau exact, qui est ensuite gardé en cache. Des modèles d'exemple se trouvent dans `Exemples/`.

Le dépôt stocke les gros binaires (`occt/*.wasm`, `Exemples/*.miniFusion`, `Exemples/*.step`) via **Git LFS**. Après un clone : `git lfs install` puis `git lfs pull`.

## Développement

| Chemin | Rôle |
|---|---|
| `src/*.js` | **Les sources** (54 fichiers, de l'en-tête à l'initialisation ; la FAO est découpée par domaine : parcours, caches, post-processeurs, simulation, interface, ébauche 3D, contour, géodésique, crêtes, perçage). C'est ici qu'on travaille. |
| `fusion_mvp.html` | **Livrable généré** par `node build.js` (le HTML et le CSS de base vivent dans ce fichier, hors de la balise `<script>`). On n'édite jamais le script à la main. |
| `tests/` | Suite Node portable (plus de 100 suites, dont certaines sur le noyau OCCT réel) : `node tests/run.cjs`, en parallèle (`-j N` pour la taille du pool, `--verbose` pour toutes les sorties) ; sous-ensemble rapide : `node tests/run-fast.cjs`. |
| `tools/lint.cjs` | Lint ESLint du script concaténé (même ordre que le build) : `npm run lint` (erreurs) ou `npm run lint:all`. |
| `.github/workflows/ci.yml` | CI : build à jour, syntaxe, tests rapides, lint. |
| `CHANGELOG.md` | Une entrée par version : cause, correctif, test. |
| `occt/`, `threejs/` | Noyau OpenCascade WebAssembly, rendu three.js (`.wasm` via Git LFS). |
| `PostPro/` | Une fiche par machine (`siemens-630.js`, `siemens-1520.js`, `fagor-8065.js`) : nom, extension, dialecte, axes, codes M, changement d'outil, fin de programme. Nouvelle machine = copier une fiche, la modifier, `npm run build`. |
| `docs/` | Captures du README, analyses (crêtes constantes). |

Cycle de livraison :
1. modifier `src/` ;
2. `node build.js` ;
3. `npm run ci` (build à jour, syntaxe, tests rapides, lint), qui doit être vert ; la suite complète `node tests/run.cjs` quand c'est utile ; `npm run test:browser` pour les parcours critiques dans un vrai Chromium headless (noyau OCCT réel : ouverture d'Axe, esquisse → extrusion, FAO → G-code ; une fois : `npx playwright install chromium`, et `git lfs pull` pour les `.wasm`) ;
4. incrémenter `APP_VER` dans `src/00-entete-et-outils.js` et `version` dans `package.json`, ajouter une entrée au CHANGELOG ;
5. commit, push et tag annoté `V0.x.y`.

**Un seul numéro de version** : `APP_VER` = `package.json` = tag Git.

## Licences

- Code : **ISC** (voir `package.json`).
- `threejs/` : three.js et OrbitControls sous **MIT**, CSG.js.
- `occt/` : OpenCascade Technology sous **LGPL**.
