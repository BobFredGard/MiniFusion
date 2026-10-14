# Crêtes constantes façon Fusion 360

Rétro-ingénierie du parcours « Crêtes constantes » de Fusion 360 et algorithme
retenu dans MiniFusion (`src/89-fao-cretes.js`, trajectoire `op.traj='scallop'`
de l'opération **Crêtes Constantes**, défaut à la création depuis `2026-10-14-001`).

## Données de référence

| Fichier | Rôle |
|---|---|
| `Exemples/cav.txt` | G-code Fagor 8065 produit par Fusion 360 (boule D6, pas 1 mm), 48 636 lignes |
| `Exemples/Cavité Usinage.miniFusion` | le même modèle dans MiniFusion (op « Crêtes Constantes » du posage 1) |
| `fusion360_capture.webp` | capture du parcours dans Fusion 360 |
| `parse.cjs`, `rings.cjs` | lecture du G-code (G0/G1/G2/G3, I/J relatifs) et découpe en anneaux/liaisons |

## Ce que fait Fusion (mesuré dans `cav.txt`)

![Fusion 360](fusion360_cav.png)

- **7 blocs** reliés par des rapides (`G0 Z+5` locaux), tout le reste en avance.
- **Bloc 0 : 30 anneaux FERMÉS** partant du bord de l'îlot (fond plat à z −30),
  vers l'extérieur. Sur le plat, le périmètre augmente de 2π par anneau : offsets
  exacts de 1 mm. Tous **horaires**.
- **Bloc 1 : 24 anneaux FERMÉS** partant du bord haut, vers le bas, tous
  **anti-horaires**. En haut de paroi, z = 49,86 → 49,41 → 48,69 → 47,80 … : l'écart
  vaut 1 mm **sur la surface décrite par le centre de l'outil** (et non sur la pièce,
  où l'arrondi du bord ne fait que quelques dixièmes).
- **Blocs 2 à 6 : zones restantes** entre les deux fronts (4 coins, séparés aux
  bosses) remplies de **boucles concentriques en lentille** de plus en plus petites
  (périmètres 240 → 217 → 121 → 86 → 64 → 46 → 28 mm), anti-horaires.
- **Sens** : le côté déjà usiné est toujours à droite du sens d'avance, la
  matière à gauche. En broche M3, c'est de l'avalant. Les anneaux d'un front ne
  changent **pas** de sens de l'un à l'autre.
- **Liaisons** : d'un anneau au suivant, une courbe en S d'environ 4,5 mm
  (≈ 0,75·D) **au contact**, qui se décale d'un pas tout en avançant dans le sens
  de coupe. Les départs successifs dérivent en diagonale (la ligne verte de la
  capture). Entrées et sorties en quart de cercle vertical de rayon ~5 mm.

## Algorithme retenu

1. **Région** : sommets dont la position outil (contact + n·R, axe décalé de
   D/2 − r pour un torique) est dans la zone de l'op (limite ∧ ¬îlot), dans la
   fenêtre Z, normale non tournée vers le bas. Le maillage est **raffiné** (arêtes ≤ ~pas,
   budget 160 000 triangles) avec des normales lissées **par nappe** (pas de mélange
   à travers une arête vive > 35°).
2. **Fronts** = composantes connexes du bord de la région ; le bord est coupé par
   dichotomie sur les arêtes (pas d'escalier). Tolérance 0,05 mm pour une limite tracée
   pile sur une arête vive.
3. **Distance géodésique par front**, en *Fast Marching* (mise à jour en onde plane
   par triangle). Elle est mesurée sur la **surface du centre outil** : c'est ce qui
   reproduit les anneaux de Fusion au bord.
4. **Anneaux** à k·pas, front par front, tant que l'iso-ligne est faite de boucles
   **fermées** restant dans le **territoire** du front (plus près de son bord que de
   tout autre) : les fronts se rencontrent à mi-chemin.
5. **Restes** : champ d_L = min_k(d_k − couvert_k), boucles à m·Δ avec
   Δ = Mx/(n+½) ≤ pas (Mx = profondeur de la zone restante). La crête au milieu ne
   dépasse jamais le pas. Les micro-boucles (< max(4·pas, D)) sont écartées.
6. **Positions outil** : XY = contact + offset, lissage gaussien adaptatif (σ 0,8 mm,
   2 mm là où la boucle est bruitée, au ras d'une arête vive), **Z par descente
   de l'outil** sur le maillage d'origine (boule exacte ; torique : anneau de 24
   boules + disque ; fraise droite : disque) → aucune surcoupe, même dans un
   creux de rayon < R.
7. **Séquences** : groupe par groupe (fronts du bas vers le haut, puis restes), une
   boucle n'est disponible que si ses « mères » (niveau précédent, à proximité) sont
   faites. Enchaînement au niveau suivant par **liaison en S au contact** (Hermite
   XY tangente aux deux boucles, Z par descente outil) ; sinon sortie en arc vertical,
   saut local (+5 mm au-dessus de la matière sur le trajet, borné par la sécurité),
   entrée en arc vertical.

## Résultat sur la cavité

![MiniFusion](minifusion_cav.png)

Superposition d'un quart (orange = Fusion, bleu = MiniFusion, vert = liaisons) :

![quart](overlay_quart.png)

Bord haut, à x = 0 (y/z du centre-pointe, en mm) :

| Fusion | 60,60/49,86 | 59,70/49,41 | 59,01/48,69 | 58,55/47,80 | 58,13/46,90 |
|---|---|---|---|---|---|
| MiniFusion | 60,55/49,85 | 59,69/49,40 | 58,99/48,65 | 58,53/47,76 | 58,11/46,86 |

![bord](overlay_bord.png)

- 2 fronts, 24 + 24 anneaux, environ 40 boucles de reste, 14 à 16 séquences ; environ 2 s en Node
  sur le maillage fin du test, 0,7 s dans le navigateur (maillage d'affichage).
- **Différence connue** : dans le document MiniFusion, l'îlot de l'op (esquisse 66 × 26,5,
  marge −5, garde D/2) exclut |x| < 64. Fusion part de 58,9 parce que son îlot est réglé
  autrement. C'est un réglage de l'opération, pas l'algorithme.

Tests : `tests/test_fao_cretes.cjs` (cuvette synthétique, outils, FMM, descente outil,
op, cavité réelle `tests/fixtures/cavite_usinage_mesh.json`).
