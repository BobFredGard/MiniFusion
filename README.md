# MiniFusion

**CAO paramétrique, assemblage, FAO, mise en plan et rendu, dans un seul fichier HTML.** On ouvre la page et on travaille : ni installation, ni compte, ni connexion.

[![▶ Lancer MiniFusion dans le navigateur](https://img.shields.io/badge/%E2%96%B6%20Lancer%20MiniFusion-noyau%20OCCT%20inclus-2ea44f?style=for-the-badge)](https://bobfredgard.github.io/MiniFusion/)

![Support de pédale déportée R1200RT en alu anodisé rouge sur béton, lancer de rayons de l'atelier RENDU (2048 échantillons)](docs/captures/rendu-pedale.jpg)

Le noyau géométrique exact est **OpenCascade compilé en WebAssembly**. S'il n'est pas disponible, l'application bascule seule sur un moteur maillage (CSG). Version actuelle : **V0.25.0** (voir le [journal des modifications](CHANGELOG.md)).

| | |
|---|---|
| ![Espace CAO](docs/captures/cao-percages.png) | ![Espace FAO](docs/captures/fao-parcours.png) |
| **CAO** : esquisses contraintes, solides à historique, congés exacts, perçages taraudés | **FAO** : posages, 2,5D, 3D, 3+2, perçage, simulation, G-code Siemens et Fagor |
| ![Espace PLAN](docs/captures/plan-percages.png) | ![Atelier RENDU](docs/captures/rendu-atelier.png) |
| **PLAN** : planches cotées ISO, coupes, cartouche, nomenclature | **RENDU** : images réalistes 1920×1080 ou 4K, moteur rapide ou lancer de rayons |

## Sommaire

- [Interface](#interface)
- [CAO](#cao) : esquisse, construction, fonctions 3D, corps et fichiers
- [Assemblage](#assemblage) : composants, liaisons, références entre composants
- [FAO](#fao) : posage, opérations, perçage, simulation, 3+2, G-code
- [PLAN](#plan) : planches, vues, coupes, cotation, sorties
- [RENDU](#rendu) : deux moteurs, matériaux et patine, HDRI, finition, calques
- [Souris et clavier](#souris-et-clavier)
- [Démarrage](#démarrage) · [Scripts et MCP](#scripts-et-pilotage-par-claude-mcp) · [Développement](#développement) · [Licences](#licences)

## Interface

Quatre espaces dans le bandeau supérieur : **CAO**, **FAO**, **PLAN** et **RENDU**.
- **Bandeau** : barre rapide (annuler, rétablir, fichiers), **recherche de commandes** (`Ctrl+K`), état du noyau, **Régénérer**, nom du document (● = non enregistré) et version.
- **Ruban à icônes** propre à chaque espace.
- **Navigateur Modèle / Usinage / Plan** à gauche, avec des **onglets de posages** ; **propriétés** à droite ; **timeline** en bas de la vue 3D.
- **Fenêtres de fonctions** à boutons-icônes, aperçu immédiat, poignées dans la vue, **Annuler / OK**.
- **Annuler / Rétablir partout** (`Ctrl+Z` / `Ctrl+Y`) : CAO, esquisse, assemblage, FAO, PLAN et RENDU.
- **Cinq thèmes** : Nuit, Graphite, Atelier, Clair, Contraste élevé.
- **Vue 3D** : cube de vue, orbite contrainte ou libre, centre de rotation sur la sélection, sol miroir, transparence « verre ».
- **Coupe X / Y / Z** (⚙ › Coupe) : plan de coupe glissé ou saisi au mm, côté inversable, faces coupées remplies.
- **Écran de démarrage** animé « ◧ MiniFusion » pendant le chargement (10 s ; un clic ou `Échap` le passe).

## CAO

![Crochet : extrusion, congés, perçages fraisés](docs/captures/cao-crochet.png)

### Esquisse

- **Tracé guidé** : accroche aux points, milieux et centres ; inférences H / V, ⟂, tangente, **parallèle** et **prolongement** d'une ligne (guide tracé, contrainte posée au clic) ; un point glissé s'accroche aux points, milieux, lignes et cercles et la **contrainte est posée au lâcher** ; longueur et angle tapés pendant le tracé.
- **Outils** : ligne, rectangle, oblong, cercle, arc, points de construction et de perçage, **projection associative** d'arêtes (aussi celles des autres composants), **intersection** du plan avec des faces ou un corps, congé, chanfrein, décalage 2D, ajustement.
- **13 contraintes** (horizontal, vertical, parallèle, perpendiculaire, colinéaire, égal, symétrie, tangence, coaxial, milieu, fixe, coïncident, construction) et **cotes pilotées** (longueur, Ø, rayon, distance, angle, entraxe).
- **Cotation souple** : la valeur se tape pendant la pose (Entrée pose), le texte se glisse avec sa ligne de cote, clic de l'outil Cote sur une cote existante pour la modifier, cote de **référence** à la demande (clic droit), nom d'une autre cote inséré d'un clic pendant la saisie (`d1`, `d2`…), unités dans les expressions (`2 cm + 3`, `1 in`), et la barre d'état nomme ce qui détermine déjà une cote redondante.
- **Solveur** Levenberg-Marquardt au moindre déplacement : une cote impossible est refusée et la barre d'état dit pourquoi ; degrés de liberté réels, esquisse bleue (sous-contrainte) ou blanche (totalement contrainte).
- **Vue d'esquisse** à plat ou dans la vue 3D courante, pièce en transparence, orbite au clic-molette, touche `N` pour revenir à plat.
- **Paramètres nommés**, **expressions ƒx** et **configurations** (tables de variantes).

### Géométrie de construction

Plans (décalé, à un angle, 3 points, médian, normal), axes, points et **repères**, désignés dans la vue ou dans l'arbre. Ils sont **associatifs** : un plan posé sur une face suit la pièce quand une cote change.

### Fonctions 3D

Historique rejouable, timeline à icônes (vert = ajout, rouge = enlèvement), marqueur de temps glissable, réordonnancement par glisser-déposer. Une fonction ne s'appuie que sur ce qui la précède (**règle d'antériorité**).
- **Extrusion** et **révolution** dynamiques : distance, jusqu'à une face, à travers tout, symétrique, dépouille, nouveau corps.
- **Balayage** d'un profil le long d'une ligne, d'un arc ou d'une **spline**.
- **Perçage** simple, lamé, fraisé, **alésé** (fond plat avec ou sans perçage, ou débouchant ; classe ISO 286 : H7…) ou **taraudé**, débouchant ou borgne. Le filet ISO 68-1 est **réellement creusé dans le corps**, après l'avant-trou ; il est calculé en tâche de fond.
- **Congés et chanfreins exacts** sur la chaîne tangente ou l'arête seule (un clic ajoute ou retire une arête), avec reprise NURBS quand le noyau refuse la chaîne. Chanfrein à **distance égale, deux distances ou distance + angle**, première face inversable.
- **Répétition** linéaire, en grille, circulaire, symétrie.
- **Modifier** : déplacer ou supprimer une face, **dépouille** (angle signé, sens inversable), coque, **scinder** par un plan, **déplacer un corps** (translation, rotation, point à point), **combiner** (union, soustraction, intersection).

### Corps, mesures, fichiers

- **Corps** : matériau (bibliothèque commune avec le RENDU, masse estimée), couleur, transparence, isoler.
- **Mesures** : face à face, Ø, entraxe, entre deux arêtes.
- **Fichiers** : import STEP / STL, export STEP / STL / OBJ, projet **`.miniFusion`** (pièce, FAO, planches, rendu), sauvegarde locale automatique.
- **STEP multi-corps** : arborescence des sous-ensembles et pièces avec leurs noms, pièces **masquables** (👁), **une couleur par pièce ou par occurrence** ; les gros fichiers (44 Mo, 73 000 faces) s'ouvrent et se manipulent sans à-coups.
- **Enregistrement sûr** : contenu vérifié avant écriture, version précédente gardée (`nom.miniFusion.bak` et copie dans le navigateur).

## Assemblage

Comme dans Fusion 360, **tout est composant** : le fichier est le composant racine, ses enfants sont des pièces complètes, à n'importe quelle profondeur.
- **Arbre unifié** : pièce et composants dans une seule arborescence, avec recherche et glisser-déposer ; sélection multiple (Ctrl+clic, Shift+clic) aussi en mode Assembler.
- **Modéliser** le composant actif (le reste de l'assemblage affiché autour) ou **Assembler** ses enfants (manipulateur, pas de 1 mm et 5°). Dans les deux modes, la vue tourne autour du composant visé.
- **FAO** permise seulement quand une **pièce** est active (pas en mode Assembler).
- **Composant**, **Occurrence**, **Insérer** un autre fichier, **Depuis corps** pour convertir une pièce multicorps sans rien remodéliser.
- **Normalisés** : vis ISO 4762 / ISO 10642 (pas gros par défaut, pas fins au choix), vis ANSI SHCS / FHCS 82° (UNC ou UNF), bouchons six pans creux DIN 906, DIN 908 et NPTF, goupilles ISO 2338, 8734, 2339, 8752 et ANSI (dowel, spring), clavettes ISO 773 formes A, B, C ; de vraies fonctions (révolution, six pans creux), avec aperçu coté. **Sur des trous** : un clic sur un trou pose la pièce dans tous les trous identiques de la pièce (simples, lamés, fraisés), en liaison rigide qui suit les trous (vis FHC 0,2 mm sous la surface, goupilles par leur centre : milieu du trou, arête haute ou basse, au plus court du clic). **Dans une rainure** : une clavette se pose au fond d’une rainure (fermée ou débouchante), par le centre de face ou contre un bout rond, et toutes les rainures identiques sont équipées. **Modifier…** (propriétés ou clic droit) rouvre la fenêtre sur la pièce : toutes ses occurrences, ou celle-ci seulement.
- **Composants liés** à un fichier du dossier de projets : édition sur place, mise à jour, conflits gérés.
- **Aligner** un repère ou un **point d'accroche** (centre et points cardinaux d'une face, axe d'un cylindre, centre d'un cercle) sur un autre composant, de façon associative.
- **Liaisons** : rigide, pivot, glissière, pivot glissant, plan, rotule, avec limites, curseurs et animation.
- **Références entre composants** : faces, arêtes, sommets, plans et axes d'un autre composant servent de références, et suivent ses changements.
- **Inspecter** : propriétés physiques (volume, masse, centre de gravité) et interférences.

## FAO

![Simulation : programme complet taillé dans le brut](docs/captures/fao-simulation.png)

### Posage

- Le repère du posage est **le repère d'usinage** : origine sur un des **27 points cardinaux** du brut ou du modèle, directions Z / X sur un axe, une face ou une arête, cases « Inverser ».
- **Brut** : boîte, cylindre ou corps réel du modèle ; marges et surépaisseurs.
- **Machine** : Siemens 840D (630 / 1520) ou Fagor 8065, origine G54–G59, plans de dégagement et de retrait.
- **Outils** : fraises cylindriques, boules, toriques, à chanfreiner, forets, forets à pointer et à centrer (DIN 333 A), tarauds.

### Opérations

- **Surfaçage**, **Contour** (côté auto, passes radiales, attaches), **Chanfrein** sur arêtes cliquées.
- **Perçage** : les trous sont **reconnus sur le modèle** (Ø, profondeur, débouchant ou borgne, lamage, filet) et choisis par groupe ; pointage, perçage, débourrage, taraudage, **lamage fraisé en hélice** ; **gamme automatique** pointage → perçage → lamage → taraudage, avec les forets pris dans la bibliothèque ou créés.
- **Ébauche 3D** : niveaux en Z, minipasses, une région finie avant l'autre ; deux stratégies :
  - **Trochoïdal** : spirale avec arcs de dégagement ;
  - **Escargot** : anneaux concentriques autour des îlots, départ par l'extérieur, suivi du brut restant (carte du brut).

  Les entrées ne plongent **jamais en pleine matière** : par l'extérieur en arc, en hélice ou en rampe douce (pente ≤ 0,4). Les descentes dans l'air se font en **rapide**, jusqu'au brut restant.
- **Contour** : descente en **paliers** ou en **pente** (pente réglable).
- **Finition** (passes parallèles ou à crête constante) et **Géodésique** (passes à distance constante depuis les bords des faces).
- **Faces usinables / intouchables** par opération, **zones** (rectangle, chaîne d'arêtes, esquisse, îlots), hauteurs par références.
- **Limites propres à la FAO** (ruban FAO → Limites) : esquisses et extrusions, en **solide** ou en **surface**, qui servent de murs ou de surfaces infranchissables sans toucher au modèle.
- **Copier / coller** (`Ctrl+C` / `Ctrl+V`) une ou plusieurs opérations, ou un posage complet.

### Simulation, 3+2 et G-code

- **Simulation** sur la **carte graphique** : outil réel, matière enlevée à partir du vrai brut, rendu réel ou lisse (sol miroir et plan d'ombre placés sous le brut) ; moteur **cartes de hauteurs** (une par orientation en 3+2, lancer de rayons) ou **champ de distance**.
- **3+2** : chaque opération peut avoir son propre Z et X ; sur Siemens, le plan de travail pivote par **`CYCLE800`** et les arcs G2/G3 et cycles de perçage sont écrits dans le plan incliné.
- **G-code** multi-outils, cycles du dialecte (CYCLE81 à 84, G81 / G83), avance F modale. *Validez toujours un premier programme à vide sur la machine.*
- **Cache des parcours** : rien n'est recalculé tant que la géométrie ne change pas.

## PLAN

![Planche A4 du Crochet : vues, cotes, perçages, vue 3D](docs/captures/plan-crochet.png)

### Planches

- **Formats** A4 à A0, paysage ou portrait, ou format manuel ; plusieurs planches en onglets.
- **Cadre** réglable (préréglages Justet, ISO 5457, Classique), **cartouche** éditable avec logo, **nomenclature** et tableau des révisions ; le **cartouche d'entreprise** peut venir d'un modèle externe, gardé hors du dépôt.
- **Écriture ISO 3098** et paramètres du plan enregistrés par projet (`.mfplan`).

### Vues

- **Face, projection, ISO, caméra, auxiliaire, coupe et détail**, par corps ou en assemblage (une hachure par pièce, bulles automatiques).
- **Orientation de la vue principale** : Face, Arrière, Côté gauche, Côté droit, Dessus, Dessous ; les projections suivent.
- **Arêtes exactes** du noyau (HLR OCCT), y compris pour un STEP importé ; perspective et cavalière ; **rendu réaliste** des vues au choix.
- **Ligne de coupe** droite ou brisée (ISO 128-44), **hachures** (ISO 128-50), **filetages** (ISO 6410), **axes** (ISO 128-2) ; nom de vue affiché seulement sur les coupes et détails.
- **Coupe locale** : contour libre plus une arête du plan, modifiable ou supprimable (double-clic sur ses hachures).

### Cotation et sorties

- **Cote** unique (longueur, distance, Ø, rayon, angle), **tolérances ISO 286** (toutes les classes, alésages A … ZC et arbres a … zc, IT01 … IT18, ajustements), cotes associatives qui suivent la pièce.
- **Perçages** cotés depuis la fonction Perçage (« Perçages auto » cote toute la planche ; la tolérance d'un alésé s'y écrit d'office), **ordonnées X / Y**, notes à flèche.
- **Hauteur du texte** des cotes, avec flèches et tolérances proportionnelles ; épaisseur des lignes d'attache et des axes de trous ; **Sauvegarder par défaut** / **Appliquer les défauts**.
- **Dessin 2D** sur la planche avec contraintes.
- **Sorties** : SVG, **DXF R12** par calques, **PDF** au format exact, impression (dans une fenêtre dédiée), en couleur ou tout en noir.

## RENDU

Une image soignée de la pièce ou de l'assemblage, en **1920×1080 ou 4K**, enregistrée en PNG. L'atelier a sa propre scène : la vue CAO n'est jamais touchée.
- **Deux moteurs**, tous deux sur la carte graphique :
  - **Rapide** : l'image s'affine passe après passe, quelques secondes ;
  - **Lancer de rayons** (three-gpu-pathtracer) : lumière renvoyée, reflets entre pièces, vrai verre ; 128, 512 ou 2048 échantillons pour l'image finale, chargé seulement quand on le choisit.
- **Matériaux** de la bibliothèque commune (aciers, aluminiums usinés ou anodisés, laiton, titane, plastiques, élastomères, peintures, bois, verres) :
  - **couches** : paillettes sous vernis, irisation (titane bleui, peinture nacrée) ;
  - **reliefs procéduraux** : brossé, sablé, moleté, bois ;
  - **patine** par corps : taches de teinte, usure des arêtes vives, salissure des creux, de légère à très usée.
- **Ambiances** générées à la volée (studio, studio lumineux, atelier, extérieur, scène noire), ou **image HDRI importée** (`.hdr`, `.exr`) dont le soleil porte l'ombre ; gardée par le navigateur, jamais dans le fichier.
- **Fond et sol** : dégradé, uni, transparent (PNG détouré), **studio courbe** ou l'HDRI elle-même ; sol miroir, ombre réglable, **supports** texturés (béton, plateau de bois, marbre, tapis de découpe).
- **Appareil photo** : focale en mm, ouverture et **profondeur de champ**, mise au point au clic, exposition, rendu des tons ; **vues enregistrées** avec la pièce.
- **Finition** : débruitage (lancer de rayons), halo, vignettage, grain, contraste, saturation, température ; préréglages Neutre, Photo, Cinéma.
- **Calques séparés** au choix : une archive `.zip` avec l'image finale, le masque, la profondeur, les normales, une couleur par corps et l'ombre seule, prêts pour la retouche.

## Souris et clavier

| | Vue 3D | Esquisse |
|---|---|---|
| Clic gauche | sélection | dessin, sélection |
| Glisser gauche | rotation | dessin, déplacement d'entités, sélection au cadre |
| Clic-molette glissé | rotation | rotation autour du dessin |
| Clic droit glissé | déplacement | déplacement |
| Clic droit court | menu contextuel | menu contextuel / annuler l'action |
| Molette | zoom | zoom sous le curseur |
| Clavier | `Ctrl+K` commandes, `Suppr` supprimer, `Ctrl+Z` / `Ctrl+Y` | `N` à plat, `Échap` fin d'outil, `F1`–`F12` contraintes, `L` `C` `R` `B` `P` `T` `D` `F` `O` outils, `H` perçage, `X` construction, `I` intersection |

## Démarrage

**En ligne** : [bobfredgard.github.io/MiniFusion](https://bobfredgard.github.io/MiniFusion/) ouvre la dernière version publiée, noyau OCCT chargé automatiquement (≈ 65 Mo au premier lancement, puis en cache). Le site est republié à chaque tag de version par `.github/workflows/pages.yml`.

**En local** :

```bat
Server.bat
```

`Server.bat` sert le dossier sur `http://localhost:3000`. N'importe quel serveur statique convient aussi :

```bash
npx serve . -l 3000
```

En `file://` (double-clic sur `fusion_mvp.html`), l'application démarre en mode maillage ; le bouton **Noyau .wasm…** active le noyau exact, gardé ensuite en cache. Des projets d'exemple se trouvent dans `Exemples/` : **Perçages** (plaque usinée complète, avec sa planche), **Crochet**, **Support Pédale Déportée R1200RT 2011**, **Axe**, **Cavité Usinage**, **Malaxeur Retard**…

Le dépôt stocke les gros binaires (`occt/*.wasm`, `Exemples/*.miniFusion`, `Exemples/*.step`) via **Git LFS**. Après un clone : `git lfs install` puis `git lfs pull`.

## Scripts et pilotage par Claude (MCP)

- **Script JSON** (menu Projet → 📜) : `new`, `param`, `sketch`, `extrude`, `revolve`, `config`, `info`, `undo`. Le script est **atomique** et compte pour **une** étape d'annulation.

```json
[{"op":"param","name":"L","expr":"60"},
 {"op":"sketch","id":"s1","plane":"XY","shapes":[{"rect":[0,0,60,40]},{"circle":[30,20,6]}]},
 {"op":"extrude","sketch":"s1","distance":10},
 {"op":"info"}]
```

- **Serveur MCP** `tools/mcp-minifusion.cjs` (Node, sans dépendance) : Claude, ou tout client MCP, envoie des scripts à la page et lit l'état du modèle (`minifusion_run_script`, `minifusion_info`, `minifusion_commands`). Installation : `claude mcp add minifusion -- node <chemin>/tools/mcp-minifusion.cjs`, puis menu Projet → **🔌 Pilotage (MCP)…** dans MiniFusion (WebSocket local 127.0.0.1:47811).

## Développement

| Chemin | Rôle |
|---|---|
| `src/*.js` | **Les sources** : 116 fichiers concaténés dans l'ordre numérique (noyau, esquisse, fonctions 3D, assemblage, FAO découpée par domaine, mise en plan, rendu). C'est ici qu'on travaille. |
| `fusion_mvp.html` | **Livrable généré** par `node build.js`. On n'édite jamais son script à la main. |
| `PostPro/` | Une fiche par machine (`siemens-630.js`, `siemens-1520.js`, `fagor-8065.js`). Nouvelle machine = copier une fiche, la modifier, `npm run build`. |
| `tests/` | 210 suites Node lancées en parallèle (`node tests/run.cjs`), 81 rapides (`node tests/run-fast.cjs`), non-régression des parcours FAO (`npm run parcours`), tests de référence (`tests/oracle/`, [docs/oracle.md](docs/oracle.md)). |
| `tests/browser/` | Playwright dans un vrai Chromium : parcours critiques et Rendu (`npm run test:browser`, seul projet lancé par la CI GitHub, déclenchée à la main) et carte graphique réelle (`npm run test:gpu`, en local). |
| `tools/` | Lint du script concaténé (`npm run lint`), serveur MCP, **captures du README** (`npm run captures`). |
| `occt/`, `threejs/` | Noyau OpenCascade WebAssembly, rendu three.js. |
| `docs/` | Captures du README, analyses, tableaux de référence. |

Cycle de livraison :
1. modifier `src/` ;
2. `node build.js` ;
3. `npm run ci` (build à jour, syntaxe, tests rapides, lint), qui doit être vert ; la suite complète et les tests navigateur quand c'est utile ;
4. incrémenter `APP_VER` (`src/00-entete-et-outils.js`) et `version` (`package.json`), ajouter une entrée au CHANGELOG ;
5. commit, push et tag annoté `V0.x.y`.

**Un seul numéro de version** : `APP_VER` = `package.json` = tag Git.

Les captures de ce README sont refaites par `npm run captures` (Chromium sur la carte graphique, exemples Perçages, Crochet et Support Pédale ; les fichiers ne sont jamais réécrits). `npm run captures -- <dossier> rendu` n'en refait qu'une.

## Licences

- Code : **ISC** (voir `package.json`).
- `threejs/` : three.js et OrbitControls sous **MIT**, CSG.js.
- `threejs/rendu-rayons.js` : three.js, three-mesh-bvh, three-gpu-pathtracer et fflate, sous **MIT**.
- `occt/` : OpenCascade Technology sous **LGPL**.
