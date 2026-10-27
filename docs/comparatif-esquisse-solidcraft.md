# Esquisse : MiniFusion face à SolidCraft (point du 2026-10-27)

Source : dépôt `tangency-labs/solidcraft` (Rust, noyau truck → SMLib), lu via l'API GitHub le
2026-10-27 : `crates/engine/src/cmd/sketch*.rs` (commandes et leurs `CommandSpec`),
`crates/sketch/src/{model,solver,construct,decompose,redundancy,dims}.rs` (modèle, solveur,
cotes), `crates/ui-egui/src/{dim_view,sketch_dims,sketch_tools}.rs` (UI), `docs/features.md`,
`docs/roadmap-detail.md` (jalon M1). Version MiniFusion de référence : V0.11.21 ; ce qui a été
réalisé à la suite de ce point est livré en **V0.11.23** (voir CHANGELOG).

## 1. Architecture (ce qui compte pour les comparaisons)

| | SolidCraft | MiniFusion |
|---|---|---|
| Modèle | `Sketch{points, curves, constraints}` ; **une cote est une contrainte** (`ConstraintKind::Distance{value}`…) avec `param` (nom de modèle `d1`, `d2`…), `driven` (référence) et `text` (position du texte **relative au repère de la cote** : (le long, en travers) pour une linéaire, décalage depuis le centre / sommet sinon) | `sk.points`, `sk.entities`, `sk.constraints`, `sk.dims` séparés ; une cote porte `value`, `name` (si nommée), `expr` (ƒx), `ref` / `refV` (référence auto = 2, voulue = 1), `w` / `sl` (écart et glissement), `ox` / `oy` (R / Ø, angle) |
| Solveur | Levenberg-Marquardt par composante connexe, Jacobien par différences finies **précédé d'un placement constructif** (Owen 1991, Fudos & Hoffmann 1997 : deux lieux sur des points déjà placés → intersection, décomposition en clusters rigides) qui garde la **branche** (orientation de chaque triangle) : une édition de cote ne retourne pas l'esquisse ; drag re-résolu par image ; redondance jugée sur le rang du Jacobien ligne par ligne, cohérence sur le résidu | Levenberg-Marquardt au **moindre déplacement** (`sklsSolveLMCore`), rang par `skRref` du Jacobien, refus d'une contrainte qui écrase une ligne (V0.11.14), cotes pondérées moins que les contraintes géométriques (V0.11.13) ; pas de placement constructif (une édition brusque peut choisir la solution miroir : `skDragWalkTo` ne traite que le drag) |
| Paramètres | Tout est paramètre : chaque cote reçoit `d<n>` ; paramètres utilisateur avec **unités** (`in`, `mm`, `deg`), fonctions, cycles signalés, renommage suivi | Cote **nommée** par l'utilisateur (`nom = valeur`), paramètres ƒx globaux, `pi`, expressions partout (V0.11.15) ; depuis V0.11.23 : nom automatique `d<n>` au clic, unités collées au nombre |
| Commandes | 96 commandes `sketch.*` scriptables (CLI, MCP) ; `sketch.draw.dimensioned` crée géométrie + cotes en une étape | Outils de la barre et menu contextuel, scripts via `53-scripts.js` (pas de registre de commandes par nom) |

## 2. Commandes de création et de modification

| Commande SolidCraft | MiniFusion | Comment SolidCraft fait |
|---|---|---|
| Ligne (`sketch.line`), ligne par le milieu | ✅ ligne (L) ; ❌ par le milieu | boîtes de valeur en ligne (longueur, angle) dès le 1er point, Tab entre elles, Entrée pose avec cotes ; accroche H / V à 2,5°, sur un point, sur une courbe (glisse jusqu'à l'intersection avec l'axe) |
| Rectangle 2 points, 3 points, centre, arrondi | ✅ 2 points, centre (Ctrl) ; ❌ 3 points, arrondi | cotes largeur / hauteur (+ rayon) tapées pendant le tracé |
| Cercle centre-Ø, 2 points, 3 points, 2 tangentes, 3 tangentes | ✅ centre-Ø ; ❌ les autres | 2 points = diamètre ; 3 tangentes résolues puis contraintes de tangence posées |
| Arc centre, 3 points, **tangent** | ✅ centre ; ❌ 3 points, tangent | arc tangent : départ sur l'extrémité d'une courbe, tangence posée |
| Oblong : centre à centre, global, centré, arc | ✅ oblong (B) ; ❌ variantes et oblong courbe | `SlotOverallLength` : cote de longueur hors tout (entraxe + 2 rayons) |
| Polygone inscrit / circonscrit / par le côté | ❌ | contrainte `Polygon` (côtés égaux, sommets sur un cercle) |
| Ellipse, conique (rho), splines (points de passage, points de contrôle, degré 5), courbe de raccord G1–G4 | ❌ | profils exacts NURBS jusqu'au noyau ; peignes de courbure |
| Texte (`sketch.text`, polices installées) | ❌ | texte converti en contours, déplaçable, expressions dans le texte |
| Point, point 3D | ✅ point de construction, centre de perçage | — |
| Projection (`sketch.project`), inclure 3D, auto-projection des arêtes de la face support | ✅ projection associative (P), aussi d'autres composants ; ❌ auto-projection | géométrie **liée** avec avertissement de référence perdue et `break_link` |
| Intersection (`sketch.intersect`, courbe d'intersection 3D, isoparamétrique, profil tourné) | ✅ intersection plan / faces / corps (I) ; ❌ courbes 3D | — |
| Ajuster (T), **prolonger**, **couper** (`sketch.break`), ajuster le long d'un chemin | ✅ ajuster ; ❌ prolonger, couper | prolonger : jusqu'à la courbe la plus proche, un arc se referme en cercle ; couper : aux intersections ou à des positions |
| Congé (F), chanfrein (égal, 2 distances, distance + angle) | ✅ congé, chanfrein égal ; ❌ 2 distances, distance + angle | coin **virtuel** gardé quand une cote s'y appuie (`virtual_corners`) |
| Décalage (O), rupture du lien | ✅ décalage (O) avec cotes ; ❌ associatif (le nôtre copie) | `OffsetDistance` : cote de décalage pilotante, topologie suivie (coins retirés) |
| Miroir (`sketch.mirror`) | ❌ (contrainte de symétrie seulement) | copies + contraintes de symétrie |
| Répétition rectangulaire / circulaire | ❌ (répétitions 3D seulement) | contraintes `PatternPoint` / `PatternRadius` associatives, nombre et pas en expressions, éditables |
| Déplacer / copier, échelle, transformer (G) | ❌ (déplacement d'entité ou de composante rigide au glisser seulement) | — |
| Couper / copier / coller entre esquisses | ❌ | — |
| Ligne de construction (X), **ligne d'axe** (`centerline`) | ✅ construction (X), axe de révolution ⟲ | cote à une ligne d'axe = **diamètre linéaire** (`LinearDiameter`) |
| Ligne infinie | ❌ | — |
| Insérer DXF / SVG, canevas / décalcomanie, courbes ajustées sur une section de maillage | ❌ | — |
| Extrémités libres (`loose_ends`, `tie`) | ✅ santé : bouts ouverts, « Refermer », doublons, dégénérés | — |
| Inspecter (`sketch.inspect`), glyphes de contraintes, instantané d'accrochage | ✅ panneau : DDL, contraintes, cotes, audit ; badges sur le dessin | — |

## 3. Contraintes

| Contrainte SolidCraft | MiniFusion | Remarque |
|---|---|---|
| Coïncident (points, point–courbe, point–axe, 2 lignes par les bouts les plus proches, 2 cercles → concentrique + égal) | ✅ coïncident, point sur ligne, point sur cercle (F1) | les axes X / Y de l'esquisse ne sont pas des entités chez nous (ligne de construction à tracer) |
| Horizontal / vertical (ligne, ou 2 points, dont milieux via Maj) | ✅ H / V (F2) ; ❌ entre 2 points | `HorizontalPoints` / `VerticalPoints` |
| Parallèle, perpendiculaire, colinéaire | ✅ (F5, F6, F9) | — |
| Tangent (courbe–courbe) | ✅ (F3) | — |
| Égal (2 à 200 entités en une fois) | ✅ (F4), par paires | — |
| Concentrique | ✅ coaxial (F8) | — |
| Milieu (point–ligne, 2 lignes dont les milieux coïncident) | ✅ (F7) | — |
| Symétrie (par rapport à une ligne, ou à un **point**) | ✅ par rapport à une ligne (F10) ; ❌ par rapport à un point | — |
| Fixe (point ou courbe, bascule) | ✅ (F12) | — |
| **Courbure** (G2 entre deux courbes) | ❌ (pas de splines) | — |
| **Polygone** (régulier) | ❌ | — |
| **AutoConstrain** (tolérances distance / angle, puis cotes jusqu'à contrainte complète), « Terminer avec AutoConstrain » | ❌ (inférences H / V / ⟂ / tangence au tracé seulement) | infère les contraintes sur une esquisse déjà dessinée |
| Refus de sur-contrainte | ✅ (V0.11.13–14) : cote redondante → référence, contrainte qui écrase une ligne refusée | SolidCraft **refuse** et nomme la cause (`determined_by`) ; MiniFusion nomme la cause depuis V0.11.23 |

## 4. Cotation (le cœur du point)

| Aspect | SolidCraft | MiniFusion V0.11.21 | V0.11.23 |
|---|---|---|---|
| Entités acceptées | 1 ligne (longueur, H, V, **angle à l'axe X**) ; 1 cercle / arc (R, Ø, **longueur d'arc**, balayage) ; 2 points (alignée / H / V selon la position du texte, 2 milieux) ; point–ligne (distance, Ø linéaire si ligne d'axe) ; **arc + son extrémité = longueur d'arc** ; 2 lignes // (distance) ou sécantes (angle, 4 secteurs, aigu par défaut, ou le plus proche de la valeur tapée) ; **ligne–cercle = distance au bord** (0 = tangent, « inside » si la ligne coupe) ; **point–cercle = distance au bord** ; **2 cercles = écart entre bords** (séparés, sécants, emboîtés) ; ellipse (grand / petit rayon) ; oblong (hors tout) | 1 ligne (longueur, H, V), 1 cercle (Ø), 1 arc (R), 2 points (alignée / H / V), point–ligne, 2 lignes (entraxe / angle, secteur par le curseur), cercle–ligne et cercle–cercle **entre centres**, Ø depuis un axe | idem |
| Pilotante / référence | `driven: true` ou `if_redundant: "driven"` ; `sketch.toggle_driven` à la demande | référence automatique quand la cote n'ajoute pas de rang ; promotion automatique quand elle le peut | + **référence ⇄ pilotante à la demande** (menu, liste), gardée à la réouverture |
| Création | type-first : la valeur prend le clavier dès que les clics déterminent la cote, le texte suit le curseur jusqu'au clic ou Entrée ; 1re cote = mise à l'échelle de l'esquisse (`scale_sketch`) ; refus si redondante, en nommant ce qui détermine déjà | pose au clic, saisie ouverte après le clic ; 1re cote = mise à l'échelle (`skFirstDimScale`) ; redondante → référence grise | + **valeur tapée pendant la pose** (chiffre ou Entrée) ; + **cause nommée** (« déjà déterminée par … ») |
| Édition | double-clic (ou clic de l'outil Cote) sur le texte : boîte en place, expression, complétion des paramètres, **clic sur une autre cote insère son nom** ; cotes d'une esquisse finie éditables depuis la vue modèle | double-clic, `nom = valeur`, expression ƒx ; outil Cote sur une cote existante = nouvelle cote | + **clic de l'outil Cote = édition** ; + **nom inséré au clic** (`d<n>` automatique) |
| Position du texte | `text` relatif au repère de la cote : glisser le texte déplace **toute** la cote (ligne comprise), texte hors des lignes de rappel → ligne de rappel prolongée en « leader », flèches dehors si trop serré, lignes de rappel qui atteignent la partie la plus proche de la ligne mesurée (#1361), arc prolongé si la flèche d'un R dépasse l'arc (#3393) ; `reset` = place par défaut | ligne de cote glissable (`w`, `sl` pour l'entraxe), **texte « glissable » mais dessiné au milieu** (défaut) ; R / Ø et angle : décalage libre | **texte glissé = ligne déplacée + glissement le long** ; « Replacer le texte » |
| Expressions | unités partout (`2 in`, `50 mm`), `name = expr` crée un paramètre utilisateur ; l'angle entre 2 lignes choisit la lecture (θ ou 180°−θ) la plus proche de la valeur tapée | `mm` / `°` en fin seulement ; `nom = valeur` nomme la cote | **unités collées au nombre** (`2 cm + 3`, `1 in`), « Ø24 » / « R5 » acceptés |
| Affichage | R / Ø, `fx:` devant une valeur pilotée par expression, parenthèses pour une référence, unité affichée | idem (ƒx, parenthèses, grise), pas d'unité affichée | idem |

## 5. Ce qui est fragile chez MiniFusion (relevé en lisant le code)

- **Pas de placement constructif** : à l'édition d'une cote qui bouge beaucoup, LM peut converger vers la solution miroir (arc retourné, triangle à l'envers) ; SolidCraft garde la branche. Atténué par le moindre déplacement et `skSolveOrRevert`, mais sans garantie.
- **Rang au 1er ordre seulement** : au point courant, une longueur du haut d'un rectangle est « déterminée » par la longueur du bas et les deux verticales (les horizontales n'y changent rien au 1er ordre). Même critère que SolidCraft, mais il faut le savoir en lisant « déjà déterminée par … ».
- **Angle** : refusé à moins de 0,03 rad de 0° / 180°, pas d'angle rentrant (> 180°) ; parallélisme décidé à 3° (`SK_PARALLEL_TOL`).
- **Cote d'angle entre deux lignes disjointes** : sommet = intersection des droites (corrigé le 2026-10-23), mais le secteur suit l'ordre p1 → p2 des lignes.
- **ox / oy** restent écrits dans les fichiers pour les cotes linéaires (ignorés au dessin depuis la mise en page « sur la ligne ») ; V0.11.23 les laisse à 0 et n'utilise que `w` / `sl`.
- **Saisie** : un seul champ `<input>` flottant ; pas de complétion des noms (la fenêtre ƒx les liste).

## 6. Propositions, classées par coût

### Faible (réalisées en V0.11.23)

1. Texte glissé = ligne de cote déplacée, « Replacer le texte ».
2. Valeur tapée pendant la pose (type-first), Entrée pose.
3. Clic de l'outil Cote sur une cote existante = édition.
4. Référence ⇄ pilotante à la demande (menu contextuel de la cote, liste).
5. Nom d'une autre cote inséré au clic pendant la saisie, nom automatique `d<n>`.
6. Cause d'une cote redondante nommée dans la barre d'état.
7. Unités collées aux nombres, préfixes Ø / R / ∠ acceptés.

### Moyen (cotation, à faire ensuite)

8. **Longueur d'arc** (`ArcLength`) : résidu `r·|balayage| − valeur`, dessin = arc de cote concentrique avec le signe ⌒. Touche solveur, dessin, panneau, `cleanupSk`, DDL. ~½ journée.
9. **Distance au bord d'un cercle** (ligne–cercle, point–cercle, cercle–cercle, « inside » quand ils se coupent) : résidus `|d(centre, ligne)| − r`, `|P − C| − r`, `|C1 − C2| − r1 − r2` ; aujourd'hui le clic sur un cercle cote le **centre**, comme Fusion quand on clique le centre. Proposer les deux (Maj = bord). ~1 journée.
10. **Angle d'une ligne à l'axe X** (`LineAngle`) : une seule ligne + choix « angle » (Maj pendant la pose ?) ; résidu `atan2 − valeur`. ~½ journée.
11. **Lecture de l'angle la plus proche de la valeur tapée** (θ ou 180°−θ) : quand l'utilisateur tape 120 sur une cote posée à 60, SolidCraft bascule le secteur. Petit, mais à tester avec `skDimAngleAt`.
12. **Cote H / V entre 2 points par leurs milieux** (Maj au clic sur une ligne = son milieu, point persistant avec contrainte Milieu). ~½ journée.
13. **Lignes de rappel « intelligentes »** (#1361 de SolidCraft) : une cote point–ligne part de la partie la plus proche de la ligne, pas du pied ; texte hors des rappels → leader ; flèches dehors si la cote est trop courte (la nôtre superpose les flèches). ~½ journée, dessin seul.
14. **Cotes d'une esquisse finie éditables depuis la vue 3D** (double-clic sur l'étiquette) : MiniFusion affiche déjà des étiquettes 3D pour l'extrusion ; un affichage « Montrer les cotes » par esquisse manque. ~1 journée.

### Moyen à élevé (hors cotation)

15. **Prolonger / Couper** (`sketch.extend`, `sketch.break`) : l'ajustement existe (`trimEntity`, `entHits`), les deux inverses sont à portée (mêmes intersections). ~1 journée.
16. **Miroir d'entités** avec contraintes de symétrie posées (la contrainte existe). ~½ journée.
17. **Répétition rectangulaire / circulaire d'esquisse** associative (contraintes `PatternPoint`) : copie + contraintes de translation / rotation rigides ; le solveur doit apprendre un résidu « P = R(θ)·Q + t ». ~2 jours.
18. **Déplacer / copier / échelle / rotation** d'une sélection (`sketch.move`, `sketch.scale`, `sketch.transform`). ~1 jour.
19. **Rectangle 3 points, arrondi ; cercle 2 points, 3 points, 2 / 3 tangentes ; arc 3 points, tangent ; polygone** : chacun ½ journée, les tangents demandent la résolution initiale (cercle tangent à 2 / 3 courbes : lieux → `lineCircleInt` / `circleCircleInt` existent).
20. **AutoConstrain** (inférer H / V / ⟂ / tangence / égal / coïncident à tolérance, puis coter jusqu'à contrainte complète) : utile sur les projections et DXF. ~2 jours.
21. **Chanfrein d'esquisse à 2 distances / distance + angle** : le 3D l'a depuis V0.11.19 ; `skChamferCorner` ne prend qu'une distance. ~½ journée.
22. **Placement constructif avant LM** (Owen / Fudos-Hoffmann) : le vrai écart de robustesse (branche gardée, mirroring évité). Plusieurs jours ; d'abord un pas réduit : « propagation » simple des points à deux lieux (coïncidence, distance + H / V, point sur ligne + distance) avant LM, en gardant l'orientation courante.
23. **Splines, ellipse, conique, texte, DXF / SVG** : dépendent du noyau et du profil (OCCT sait les NURBS : `BRepBuilderAPI_MakeEdge` sur `Geom_BSplineCurve`) ; chantier à part.

## 7. Ce qui n'est pas à reprendre

- Le nommage automatique systématique de toutes les cotes (`d1`…) : MiniFusion nomme à la demande, ce qui garde les listes ƒx lisibles ; V0.11.23 ne nomme que la cote cliquée.
- La cote « angle d'un arc » (`ArcSweep`) : l'angle d'un congé se pilote par ses tangences.
- Le registre de commandes scriptables : utile à SolidCraft pour son CLI / MCP ; MiniFusion a ses scripts (`53-scripts.js`) sans besoin d'un nom par commande.
