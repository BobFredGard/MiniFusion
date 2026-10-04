# MiniFusion

**Un logiciel de CAO paramétrique Expérimental — esquisses, contraintes, solides, congés — entièrement contenu dans un seul fichier HTML.**
Zéro build, zéro framework : tu ouvres la page, tu dessines.

MiniFusion est un MVP de CAO historique (paramétrique, esprit Fusion 360) qui tourne dans le navigateur : esquisses 2D contraintes et cotées, solides générés par extrusion avec historique rejouable, congés, mesures, import/export STEP. Le kernel géométrique exact s'appuie sur **OpenCascade compilé en WebAssembly**, avec repli automatique en mode maillage (CSG) quand le noyau n'est pas disponible.

Une partie FAO est en travail, ce sera long !

## L'interface Graphique
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fb209e0f-b424-4b6e-a7de-71ccb580213f" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/08af6ef9-c3dd-4a52-8f9e-8bec83e9d1c7" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/528000a9-be2f-4f03-bed9-a4fdbcdb0e63" />

## Fonctionnalités

### Noyau géométrique
- **Deux moteurs interchangeables** : noyau **exact OpenCascade (WebAssembly)** (BRep,Congés/chanfreins sur vraies arêtes) et **moteur maillage** (CSG) en repli automatique. Le mode courant est affiché en permanence, avec le nombre de faces/triangles.
- Chargement du `.wasm` manuel (**⚙ Noyau .wasm…**), puis **mis en cache IndexedDB** : aux lancements suivants, y compris en `file://`, la page démarre le noyau exact d'elle-même.
- Opérations solides : union, soustraction, **coalescence des surfaces** (`ShapeUpgrade_UnifySameDomain`) pour supprimer les coutures internes, prismes, disques, plans de coupe.

### Esquisse — dessin
- Outils : **sélection/déplacement de points**, ligne, rectangle, oblong/rainure, cercle, arc, point de construction, coïncidence (fusionner 2 extrémités), **congé 2D sur 2 arêtes (arc tangent + R pilotée, `F`)**, **chanfrein 2D (coupe + cote, `H`)**, **décalage — offset (`O`)**, **ajuster (trim)**.
- **Grille magnétique 1 mm**, zoom+/−/ajuster, annuler/rétablir, vider, valider, exporter l'esquisse en SVG.
- Rectangle et oblong posés en **2 clics** (1ᵉʳ coin → 2ᵉ coin, `Shift` = centré) avec **cotes automatiques**.
- **Décalage (`O`, ⇄)** : sélectionnez lignes/cercles/arcs (`Shift` = lot), cliquez le côté → copies **parallèles** (cote `gap` pilotée) ou **concentriques** (cote rayon pilotée). Chaînes lignes+arcs **raccordées** (mitre aux coins), **boucles fermées** (côté auto ou cliqué), cercles isolés concentriques. Cotes persistantes, modifiables au double-clic.

### Esquisse — contraintes & solveur
- **12 contraintes** : horizontal, vertical, parallèle, perpendiculaire, égal, symétrie, tangence, coaxiale, milieu, fixe, construction — avec **auto-inférence** (perpendiculaire/tangente détectées à la création, **─/│ prioritaire sur ⟂ implicite**, doublons purgés).
- **Solveur maison** : Levenberg-Marquardt + relaxation, avec panneau « Santé » (degrés de liberté, résidus), convergence mesurée.
- **Cotes pilotées** : longueur, Ø, rayon, distance, angle, entraxe. Elles se posent en **H, V ou aligné selon la position du curseur**, avec gestion des angles complémentaires (secteur obtus respecté). **Shift+clic sur 2 lignes** : entraxe si elles sont **parallèles** (à 3° près), angle sinon — la parallèle est décidée sur les **vecteurs de direction**, donc deux lignes parallèles sans sommet commun sont bien reconnues.
- **Pendant l'édition** : le solide reste **visible en translucide (75 %)**, calé sur le bon état du timeline — l'état **avant la fonction qui consomme l'esquisse**, ou **le modèle complet** pour une esquisse posée sur face non consommée (la porteuse est toujours antérieure : les fonctions suivantes, congés compris, restent visibles — la face ne disparaît jamais de l'écran). Le fondu est reposé après chaque rejeu et entièrement restauré à la fermeture.

### Cotation, mesures & annotations
- **Projections associatives** : projeter une arête 3D du solide dans l'esquisse (⧉, ligne ou cercle + centre) pour la coter — **l'entité suit les changements du modèle**. **Vives ET de tangence**, même hors plan : les arêtes du plan d'esquisse l'emportent sur celles qui ne font que se projeter dessus, les références sont affichées pendant l'outil, et **sans noyau OCCT** on retombe sur les références des corps visibles (le message « noyau requis » n'apparaît plus que s'il n'y a rien à projeter).
- **Mesures 3D** : face→face, Ø, entraxe, avec lignes de cotation et pieds de ligne affichés en 3D.
- **Références nommées** : chaque arête de congé, face porteuse et projection reçoit un nom persistant (`Arête 1`, `Face 2`, `Projetée 3`) — visible dans les panneaux, conservé à la sauvegarde.

### Fonctions de modélisation
- **Extrusions additives (➕ Plot) et soustractives (➖ Poche)**, avec **historique rejouable** : toute édition d'une fonction ou d'une esquisse reconstruit le solide à partir de ce point.
- **Sens** : un côté, ou **symétrique (miroir)** autour du plan de l'esquisse. Bouton **⇄ Inverser le sens** : miroir de la course par rapport au plan d'esquisse **sans changer l'opération** (Plot reste un ajout, Poche un retrait) — le côté actuel (+n/−n) est rappelé.
- **Dépouille d'extrusion** : champ **Dépouille (°)**, angle **signé** par rapport au plan d'esquisse (profil exact au plan, évasé ou rétréci selon le signe, 0 = parois droites). Angle impossible → avertissement + extrusion droite conservée.
- **Étendue** : **📏 Distance** (valeur toujours positive — le signe est déterminé par l'opération, plus besoin de basculer Plot/Poche), **🎯 Jusqu'à la face…** (clic direct sur la face cible, avec suivi d'identité géométrique : la face est retrouvée par centre/normale/aire, pas par indice) et **⤴ A travers tout** (borné à l'étendue réelle de la pièce traversée).
- Boutons **Inverser le sens**, **Changer d'esquisse**, **Changer la face cliquée**, **🔧 Éditer l'esquisse** (clic droit sur la fonction).
- **Esquisses sur face** : posées sur n'importe quelle orientation, elles **suivent leur face d'attache** quand le modèle change (épaisseur réduite, profil élargi, face latérale déplacée).

### 🔄 Révolution
- **Révolution 360°** (➕ Plot / ➖ Poche), symétrique de l'extrusion : le profil d'une esquisse **pivote autour d'un axe**, avec historique rejouable comme toute autre fonction.
- **Axe** : une **ligne de l'esquisse** — la ligne de construction d'axe est proposée par défaut — ou un **axe système X/Y/Z**. Modifiable à tout moment depuis le panneau de la fonction, avec changement d'esquisse et suppression.
- **Angle** de 1° à 360° (360° par défaut) : le champ angle est réellement appliqué au solide.
- **Le profil doit être d'un seul côté de son axe** : à 360°, un profil qui le franchit s'auto-intersecte. Le refus est explicite (« le profil est de part et d'autre de son axe… »), jamais un résultat faux. Les arcs et les cercles sont échantillonnés, pas seulement leur centre.
- Profils acceptés : **lignes, arcs, cercles**, contours percés (le trou suit), un ou plusieurs contours par esquisse. Solide exact OCCT, avec repli maillage `LatheGeometry` si le noyau échoue.

### Déplacement de face (push/pull 📐)
- **Cliquez une face** du solide exact : elle est déplacée le long de sa **normale sortante**, distance réglable ensuite (positive = la face avance, négative = elle rentre).
- La face est mémorisée par sa **géométrie** (centre + normale + dimensions), pas par son numéro : elle est retrouvée à chaque rejeu. Résultat fusionné en **un seul corps** (faces coplanaires recollées), face introuvable = message + solide intact.

### Dépouille (angle de démoulage 🛡️)
- **2 temps** : 1) la **face de référence** (plan neutre, fixe), 2) les **faces à dépouiller** (re-clic = retirer), puis l'**angle** → Appliquer. Noyau `BRepOffsetAPI_DraftAngle`, édition en place, historique rejouable.
- **Dépouille d'extrusion** : voir ci-dessus (angle signé / plan d'esquisse, sans fonction séparée).

### Coque (évidage paroi mince ⚙)
- **Clic des faces à retirer** (les ouvertures, re-clic = retirer), **épaisseur** de paroi, Appliquer : le noyau évide le solide (`BRepOffsetAPI_MakeThickSolid`). Fonction paramétrique rejouable (`xshell`), édition en place.

### Congés & chanfreins
- **Congé 2D** (maillage) sur les verticales d'une extrusion, rayon unique, plus **congé de périmètre** (rims haut et/ou bas).
- **Congés/chanfreins exacts OCCT** : toutes les arêtes du solide sont cliquables, **rayon ou distance par arête**, sélection d'une arête ou d'une boucle de face. **Un clic = une arête** ; l'option « 🔗 arêtes tangentes » (cochée par défaut) y ajoute automatiquement la chaîne tangente — les arêtes cliquées sont en jaune, celles déduites en rouge. L'option **et les arêtes germe sont persistées** avec le congé : une seule arête cliquée suffit, et **à chaque rejeu** l'appli retrouve seule toute la chaîne (entrées perdues rattachées, arêtes apparues ajoutées au rayon du germe).
- **Références durables** : chaque arête sélectionnée est ancrée sur la géométrie qui l'a produite (point, entité, **niveau du clic** haut/bas — fond, rebord et couture d'une même poche se distinguent même s'ils projetent au même point d'esquisse) et **retrouve sa place** après n'importe quelle modification du modèle, y compris sur les arêtes nées d'un autre congé. La position d'origine (pos0) est figée et sert de référence de départage : une sélection = **une** arête, jamais deux, **quel que soit l'ordre d'énumération d'OCCT** — un congé sur le fond d'une poche y reste après toute modification amont — et un mauvais appariement ne peut plus s'aggraver d'un rejeu à l'autre.
- **Édition en place** : ✏️ *Modifier la sélection* (ou double-clic dans l'arbre) ajoute/retrait des arêtes, ajuste les rayons arête par arête, sans créer de seconde fonction. L'appariement est reporté en direct : `✅ n/n arêtes retrouvées` ou `⚠ n/n`.
- **Aperçu avant validation** : dès qu'une arête est sélectionnée, le résultat s'affiche **en rouge translucide** (la pièce s'estompe derrière) et se recalcule à chaque changement de rayon — congé comme chanfrein. L'aperçu disparaît en quittant le mode ou après application.
- Repli maillage complet si le noyau exact n'est pas disponible.

### Répétitions
- **Fonction de premier ordre** (type `repeat`) : **Linéaire**, **Circulaire**, **Symétrie** — nombre de copies, axe ou plan (X/Y/Z ou **la face sélectionnée**), distance / angle total.
- **Symétrie double** : cochez **2ᵉ plan** — la 2ᵉ passe miroite la base **et** les instances de la 1ʳᵉ passe (la 1ʳᵉ symétrie est comprise dans la 2ᵉ, ainsi que l'opération initiale). Plans identiques = 2ᵉ passe sans effet (signalé).
- **Ctrl+clic** dans l'arborescence pour **ajouter ou retirer une fonction source** (extrusion, découpe, congé, chanfrein) : les instances sont régénérées, y compris leurs esquisses transformées.
- Les instances sont **regroupées sous la répétition**, repliées par défaut, et **paramétriques** : elles suivent leur source (profondeur, opération, sens, étendue, congé, angle, épaisseur, arêtes de congé) **à chaque modification de la session** — panneaux de propriétés comme éditions en place des outils — et régénèrent en place sans perdre leurs identifiants ; les boutons **Recalcul** et **Rafraîchissement dur** balayent toutes les répétitions (filet de réparation).

### FAO — fraisage 2.5D / 3D + G-code (Pas fonctionnel pour l'heure)
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/da18f37d-f24a-413e-95cd-7d01e5157d07" />

- **Posages** façon setup Fusion : machine, origine `G54`–`G59`, point de bloc, **indexation 3+2** (table C + B, degrés, bouton 3 axes **et « Sur la pièce »** : cliquez une face sortante, `B`/`C` calculés depuis sa normale — face vers le bas refusée), modèle (tous les corps ou sélection), **brut en 3 sources** (tous les corps + marge / **corps choisi** — désigné par la liste **Source** de la fiche, **masqué dans la vue dès choisi**, `👁` de la ligne corps pour le revoir / **manuel** 6 champs, jamais recalculé), bridage mémorisé. **Arbre FAO dédié** — ligne de corps `🧱` : **👁 œil = vue seule**, **⏻ = rejeu** (œil ne coupe plus les fonctions, `📦` retiré) ; ligne dès usinage : bouton **Masquer** pour ses traces ; **chaque posage porte une flèche ▼/▶** qui replie/déplie **ses opérations** (état `s.open` **enregistré dans le document**) ; les **7 boutons + usinage** ont quitté le panneau pour une **barre posée sur la vue 3D** (même pilule que `Iso`/`Dessus`, **en haut à droite, au-dessus du panneau FAO** — les deux reposent dans la même colonne `#faoWrap`, **même hauteur que la pilule des vues (34px)** : la barre reste sur **une seule ligne** (défilement horizontal invisible si l'écran est étroit, jamais de 2ᵉ ligne — elle ne peut donc plus écraser sa voisine), sans jamais toucher la pilule des vues ; titre `+ Usinage`, libellés sans `+`, **masquée dès que le panneau FAO est rabattu**) ; le panneau est **toujours présent** (le bouton `FAO` de la barre d'outils a été retiré) et se **rabat sur sa droite** par l'onglet `❯`/`❮` (procédé de l'arbre des corps, état en `localStorage`) ; ses actions sont **regroupées sous un libellé** — **POSAGE** (`+ Posage`, `Outils`), **EXÉCUTION** (`▶ Usinage`, `Générer + aperçu`), **EXPORT** (`Exporter G-code`) — la fiche ne gardant que la configuration, fiches posage/opération dans le panneau droit ; **« Nouveau modèle » remet toute la FAO à zéro** (mode lecture fermé, fenêtre outils fermée, traces retirées, posages et opérations remis au défaut).
- **Bibliothèque d'outils** : cylindrique, boule, torique (ex. `T6 D25 R2` de la gamme atelier `CAV-75-25`) — `Vc`/`fz` → `S`/`F` calculés, plongée 30 % — **bouton « Outils » (groupe POSAGE du panneau FAO) → fenêtre flottante fermable (Échap/✕)** avec la bibliothèque éditable (nom, type, D, r, dents, Vc/fz, + Outil).
- **Opérations 2.5D** : **surfaçage** zigzag — **« écart » : seul paramètre de recouvrement XY** (l'ancien couple « Passes »/« écart » est supprimé : le **nombre de lignes s'affiche en lecture seule** ; un document ancien piloté par « Passes » reste lu tel quel et bascule à la première saisie de l'écart) **+ « pz » : passes en Z / brut** (l'ébauche descend du dessus du brut `Z1` jusqu'à la cote `Z` en `pz` passes égales, le pas **ap est calculé** `(Z1−Z)/pz` et affiché ; `pz=1` = passe unique) **+ 1ʳᵉ et dernière ligne à mordant** (elles entrent dans la matière de la valeur d'écart, plafonnée au rayon — plus tangentes à l'arête du brut ; le label « N lignes » reste exact) **+ champ « Sortie » rappelé dans la fiche de l'opération** (réglable là où l'on paramètre la passe), **poche** concentrique, **contour** compensé du rayon, **perçage**, **débourrage poche** (hélice `R = 0,4×D` + spirale + tours de parois, calé sur la gamme `CAV-75-25`).
- **Ébauche 3D** : **mode trocoïdal unique** (effort constant : `ae ≤ ¼×D` à grande profondeur, pelage à `ap` constant sans retrait, **trochoïdes G2/G3** dans les goulets, ombre exacte des niveaux supérieurs — aucun voile fin traversé, entrées hélice/rampe/micro-hélice vérifiées sur toute l'ombre du niveau, surfaçage pleine largeur au-dessus de la pièce, **marges et congés usinés à distance ≥ r de l'emprise** — plus de manchette autour des plots, **sens long** : brut plus haut que large → pelage le long de Y, **mini-passes Z** : `nb` contours de parois seuls entre deux plans trocoïdaux, profondeur `k·ap/(nb+1)` sous le plan du dessus (strictement entre les plans), décalage radial décroissant `laisse·(nb−k)/nb` nul au plus profond — champ **« mini »** de la fiche, `0` = off). Les anciennes stratégies **Morph**/**Zigzag**/**Adaptive** et les passes fines `ap2` ont été supprimées : documents migrés à la lecture, l'`ae` fin suit les marches.
- **Finition géodésique** : **passes horizontales iso-Z** sur les faces en pente (chaque liaison part à Z constant) + **anneaux géodésiques** (Dijkstra) sur les plateaux, **limites Haut/Bas** (au-delà, relief non fini), **fraise droite refusée sur ce qui n'est pas horizontal** (note dans la fiche), sortie centre-outil selon le type de fraise.
- **Réglages communs** : surépaisseurs **radiale** (parois) + **axiale** (fond), champ **« Sortie »** (mm hors matière, pas 0,5, défaut 5, ex-« Sécur » — **(1)** dépassement XY en bout de ligne avant le demi-tour **+ (2)** retrait Z des G0, fin de chaque opération et fin de parcours, viewer + G-code ; rappelé et éditable dans la fiche Surfaçage), plan de retrait, **limites** rectangle ou chaîne d'arêtes tangentes (règle centre/intérieur/extérieur + marge) — la chaîne est **re-suie automatiquement à chaque rejeu** (ancres des germes sur les arêtes du nouveau solide ; alerte fiche + export si les arêtes ont trop bougé), **arrondi des coins en G2/G3**, fiches en sections titrées avec infobulles et alertes (`ae` trop grand en mode trocoïdal).
- **Post-processeurs** : **Siemens 840D** (variantes 630 / 1520) et **Fagor 8065**, multi-outils, origine relative au point de bloc. Perçage en **cycles dialecte** (`CYCLE81` / `CYCLE83` à broche à va-et-vient par pas `Q`, `G98 G81` / `G83` + `G80` côté Fagor). **3+2** : `TRAORI(1)` + positionnement `B`/`C` sur Siemens (XYZ restent repère pièce, `TRAFOOF` en pied) ; **Fagor 8065 = machine 3 axes** : indexation refusée à l'export (aucun `B`/`C` émis, alerte fiche + `ATTENTION` en tête de programme). Aperçu 3D (coupe vert / rapides rouge) + estimation du temps par opération. **▶ Viewer d'usinage** (groupe **EXÉCUTION** du panneau FAO) : cache les traces, fait apparaître la **boîte du brut** (+ le corps-brut masqué s'il y en a un), anime **l'outil** le long du parcours et dessine la **trace au fil de l'eau** (vert coupe / rouge rapide, **arcs développés en subdivision adaptative — écart de corde ≤ 0,05 mm : les grands cercles restent ronds à l'écran**) — barre flottante `▶ ⏸ ⏹ ✕` avec temps `mm:ss / mm:ss · %` et **vitesse ×1 à ×20**, lecture/pause/stop, fin de parcours en pause automatique — **sortie du mode garantie** (bouton « ■ Quitter l'usinage », **Échap** ou **✕** : outil, brut et matière retirés, traces réaffichées) et **matière usinée en surface Z-map ◼ matière** (un seul mesh — **maille anisotrope : jusqu'à 60 000 colonnes ≈ 0,5 mm en XY, 32 couches Z grossières** (la Z-map reste continue, seules les colonnes comptent à l'écran), colonnes jointives du brut **aux extents exacts** (plus de débordement d'un pas), le sommet descend **à la cote exacte de coupe à chaque passe** (colonnes touchées recalculées **même quand aucun voxel n'est tué** — plus de passe qui n'enlève rien à l'écran) sous l'outil, plus de cubes —, toggle dans la barre, Stop la restaure) — lecture sans **gel après les arcs** (les arcs développés ne faussent plus le temps).
- Menée **en parallèle du dessin** : `doc.fao` persisté, modifications FAO sans rejeu géométrique (`_docVersion` untouched).

### Antériorité & historique
- Arborescence complète dans la vue 3D (repliable, avec œil de visibilité, icône par type, marqueur de temps).
- **⏱ Marqueur de temps** : clic droit sur une fonction → le rejeu s'arrête **avant** elle, les fonctions suivantes sont exclues et **filtrées de l'arbre** (l'arbre ne montre que ce qui est rejoué — bandeau + ligne « marqueur ici » indiquent ce qui est masqué) et les **nouvelles fonctions sont insérées à ce niveau**. Levée automatique à l'édition.
- **Annuler / rétablir** sur l'esquisse et sur le document.

### Interface & navigation
- **Bandeau regroupé par type** : Esquisse / Extrusion / Révolution en direct, le reste en menus déroulants — **🔧 Modifier le solide** (Congé, Chanfrein, Déplacer une face, Répétition…), **💾 Fichier** (Importer, STEP/STL/OBJ), **📁 Projet**.
- **Vue 3D sans sidebar** : l'arborescence est une superposition semi-transparente à gauche, avec onglet de repli. Les corps se pilotent par l'œil de la fonction, le clic droit, ou **🎯 Isoler / ✅ Tout afficher**.
- **Vues** : la pilule `Iso` · `Dessus` · `Face` · `Droite` · `Tout afficher` (F5, qui cadre toute la pièce — corps + esquisses, jamais de pièce coupée) · `⚙` vit **en haut à gauche, au-dessus du panneau des corps** (arbre repoussé dessous) ; le menu `⚙` s'ouvre juste sous la pilule.
- **Menu ⚙** : vues, sol miroir,repère (axes XYZ), inversion du zoom, mode d'affichage des arêtes, **rafraîchissement dur**, **coupe par plan** (hauteur + côté inversé).
- **Affichage des arêtes** (vives en noir, coutures lisses en gris) : les contours sont **tracés à la courbe**, pas à 12 points fixes — un cercle est découpé en autant de segments que nécessaire pour que l'écart reste sous **0,02 mm** (37 segments pour R5, 61 pour R15), et une droite tient en 2 points. Un revolution ne se lit plus comme un polygone, même en fort zoom.
- **Annuler / rétablir** : `Ctrl+Z` / `Ctrl+Y`, ou les boutons **↩ Annuler / ↪ Rétablir** du panneau *État* qui affichent le nombre d'étapes disponibles. Couvre **toute** modification du modèle : création d'extrusion, de révolution, de congé/chanfrein, de répétition, suppression, changement de paramètre. 40 étapes d'historique.
- **Suppression au clavier** : `Suppr` supprime la (ou les) fonction(s) sélectionnée(s) dans l'arbre, après confirmation nommant chacune. **Ctrl+clic** construit le lot, **Échap** le vide. Les fonctions qui en dépendent (congé sans sa cible, répétition sans une source) sont **emportées** et annoncées ; les esquisses posées sur les faces disparues sont conservées, avec un avertissement. Un clic simple remplace le lot : plus de sélection fantôme.
- **Répétition** : le bouton 🔁 ouvre son panneau, où les fonctions à répéter se choisissent par **cases à cocher** (et non plus par `Ctrl+clic`, réservé à la multi-suppression). **À la création comme à l'édition**, la même liste s'affiche — cochée sur les sources actuelles, et cocher/décocher met la répétition à jour immédiatement (annulable par `Ctrl+Z`). Une répétition affichée dans l'arbre montre ses instances ; ses **sources portent un repère ◀** et sa ligne affiche **◀ n** (en orange si aucune : elle ne produirait rien).
- Couleur et opacité par corps, outils translucides masqués après l'opération (aperçu explicite au clic sur la découpe), repère d'origine avec plans visibility par défaut.
- **Raccourcis** en esquisse : `L C R B P T D F H O` (ligne, cercle, rectangle, oblong, projection, trim, cote, congé, chanfrein, **décalage**), `F5` vue complète, `Ctrl+Maj+R` rafraîchissement dur.

### Import, export & persistance
- Import **STEP / STL**, export **STEP / STL / OBJ** — et **clic droit sur un corps** (arbre ou vue 3D) → **⬇ Exporter ce corps en STEP** : **seul ce corps** (shape exacte OCCT de `perBody`, jamais l'assemblage de tous les corps), fichier `.step` au nom du corps (les noms d'invalides sont remplacés par `-`) — sans OCCT : alerte claire. Le menu se **repositionne dans le viewport** (et défile s'il dépasse) : cette entrée, dernière du menu, est toujours visible.
- **Booléens avec un import** : une esquisse peut **soustraire ou s'unir** à un STEP inséré (corps exact entrant dans la chaîne de rejeu) — le solide importé reste affiché seul tant qu'aucune autre fonction ne le concerne, puis n'est plus dessiné en double une fois fusionné.
- Projet **`.minifusion.json`** (entièrement paramétrique : esquisses, contraintes, cotes, fonctions, répétitions, ancrages) + **sauvegarde locale automatique** (autosave) et cache de la dernière pièce finie.
- **🧪 Auto-tests** : batterie de non-régression de l'esquisse et des contraintes, lançable depuis le panneau.

### Performance & robustesse
- **Cache de rejeu par points de contrôle** : le solide est mémorisé après chaque fonction, une modification de fin de timeline ne refait que les fusions concernées (jusqu'à ~4× plus rapide), avec invalidation dès qu'un octet de la signature change.
- **Rejeu inutile sauté** (contrôle O(1)), `docHash` et sauvegardes différées hors du chemin critique, écriture forcée à la fermeture.
- **🔁 Recalculer** force le rejeu, **⟳⟳ Hard** jette tous les réservoirs périmés et **rejoue puis rapporte** ce qu'il a fait (durée, moteur, fonctions, corps, triangles avant/après).
- **✓ Valider** : contrôle du modèle en **7 phases diagnostic + réparation** — 1 document (instances orphelines, doublons, copies bornées…), 2 répétitions (instances désynchronisées réalignées), 3 esquisses (contraintes/cotes violées signalées en ⚠), 4 fonctions (rejeu, erreurs/dégradations), 5 moteur+caches (état d'OCCT + rafraîchissement dur), 6 corps+imports (fiches de corps, visibilités et géométries d'imports orphelines), 7 rapport. Chaque phase répare ce qui l'est automatiquement ; le compte `VALIDATION : N/7 phases OK — M réparation(s)` s'écrit dans la zone **🧪 Auto-tests**.
- **Rejeu rapide** par défaut (points de contrôle réutilisés, ~4× plus rapide — exactitude prouvée par `test_cache_exact` depuis le filet featSig -011) — commutable en **rafraîchissement dur** dans le menu ⚙ pour reconstruire le modèle entier à chaque modification.
- Robustesse : nettoyage des documents pollués au chargement, garde anti-rejeu imbriqué, échec d'un congé **isolé et non destructif**, avertissements explicites plutôt que plantage, version du code affichée en permanence (anti-cache navigateur).

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
- Dans l'application : **🧪 Auto-tests** rejoue la batterie de non-régression de l'esquisse ; **✓ Valider** exécute les 7 phases de diagnostic + réparation du modèle (rapport dans la zone Auto-tests).

## Architecture du dépôt

| Chemin | Rôle |
|---|---|
| `fusion_mvp.html` | **Fichier généré** — l'application complète en un seul HTML (~16 100 lignes). Ne pas l'éditer à la main : il est reconstruit par `node build.js` |
| `src/*.js` | **Les sources**, découpées par opération (21 fichiers, du bandeau d'en-tête à l'init). C'est ici qu'on travaille |
| `CHANGELOG.md` | **Le journal des modifications** : une entrée par version (cause, correctif, test) |
| `build.js` | Assemble `src/*.js` → `fusion_mvp.html`. `node build.js --check` échoue si le livrable est périmé |
| `occt/` | Noyau OpenCascade WebAssembly (~111 Mo) + ses `.bak` locaux (non suivis) |
| `threejs/` | Rendu 3D (three.js), OrbitControls, CSG |
| `PostPro/` | Post-processeurs G-code : **Siemens 840D** (variantes 630 / 1520) et **Fagor 8065** |
| `tests/` | Suite Node portable (harnais `appvm.cjs` + 54 suites + fixtures) : `node tests/run.cjs` ou `npm test` |
| `Backup/` | Snapshots des versions vertes |
| `Server.bat` | Lancement local (npx serve, port 3000) |

Le découpage en `src/` est une **partition contiguë** du script : l'ordre d'exécution est
conservé, et **le livrable reste un seul fichier HTML** — le double-clic et le mode `file://`
(functionnement) continuent exactement comme avant. L'utilisateur ne voit rien, l'endroit
n'a qu'un fichier à ouvrir.

### Travailler sur le code

```bash
# 1. éditer un fichier de src/ (jamais fusion_mvp.html)
# 2. reconstruire le livrable
node build.js
# 3. régression verte (harnais + 54 suites)
npm test
# 4. bump APP_VER (src/00-entete-et-outils.js) + entrée CHANGELOG.md
# 5. vérifier que le livrable est à jour (à mettre en CI)
node build.js --check
# 6. snapshot Backup/ puis push
```

### Synchronisation Mac ↔ Windows

Le dépôt est commité depuis les deux machines (même dépôt GitHub, ou dossiers
Dropbox partagés) ; `.gitattributes` verrouille les deux sources de divergence :

- **Fins de ligne** : `* text=auto` + règles explicites → l'index est **toujours en LF**,
  que le working tree soit en CRLF (Windows) ou en LF (macOS) ; plus de « fichiers
  modifiés » fantômes d'un OS à l'autre. `build.js` régénère `fusion_mvp.html`
  **en CRLF à l'identique** (il normalise `src/` avant concaténation) : le livrable est
  donc byte-à-byte identique sur les deux machines, aucun conflit de rebuild.
- **Noms de fichiers en Unicode NFC** : macOS (HFS+) et Dropbox écrivent du **NFD**,
  ce qui créait des renommages fantômes (`Pièce` ↔ `Pie` + combining). Les chemins de
  l'index sont normalisés en NFC ; ne jamais réintroduire un nom d'export macOS.

Configuration **à faire une fois par clone** :

```bash
# macOS
git config core.autocrlf input
git config core.precomposeunicode true     # valeur par défaut, à vérifier
# Windows
git config core.autocrlf true
```

Avant chaque push : `git status` (vide), `node build.js --check`, `npm test`.

| Fichier de `src/` | Contenu |
|---|---|
| `00-entete-et-outils.js` | bandeau de version, changelog, constantes et utilitaires |
| `10-scene-3d.js` | scène, caméra, couleurs, repli par maillage, plans d'origine |
| `20-noyau-et-operations-solides.js` | noyau exact OCCT : prismes, fusions, découpes, application des congés |
| `30-marqueur-temps.js` | blocage du rejeu à une position (timeline 360) |
| `40-interface-arbre-props.js` | arborescence, timeline, panneaux de propriétés |
| `45-annuler-document.js` | annuler/rétablir du **document** (pile d'instantanés JSON), boutons et raccourcis |
| `50-esquisse-2d-solveur.js` | esquisse 2D, solveur de contraintes, cotes, SVG, santé |
| `60-trim-et-souris.js` | ajuster (trim), toutes les interactions souris |
| `70-extrusion.js` | extrusion : menu, étendue, « jusqu'à la face », visée |
| `75-revolve.js` | révolution 360° : axe (ligne d'esquisse ou X/Y/Z), Plot/Poche, angle, noyau exact + repli maillage |
| `80-conges-chanfreins.js` | congés maillage + **mode exact**, références durables, aperçu rouge |
| `85-deplacement-face.js` | **déplacement de face** (push/pull le long de la normale sortante) |
| `86-draft-depouillage.js` | **dépouille** (angle de démoulage, plan neutre + faces) |
| `87-coque.js` | **coque** (évidage paroi mince : faces retirées + épaisseur) |
| `88-fao.js` | **FAO** : posages, outils Vc/fz, ops 2.5D/3D (Adaptive, géodésique), limites, G2/G3, posts Siemens/Fagor |
| `90-picking-mesure-import.js` | sélection 3D, mesures, F5, menus contextuels, coupe, import/export, sauvegarde |
| `95-toolbar.js` | barre d'outils et raccourcis |
| `96-bandeau-groupes.js` | **regroupement du bandeau** par type (menus Modifier / Fichier / Projet) |
| `96-noyau-occt-tiers-lgpl.js` | **code tiers** (OpenCascade 1.1.4, LGPL) — laissé intact |
| `97-auto-tests.js` | auto-tests embarqués |
| `99-init.js` | amorçage |

Pas de build côté utilisateur : le livrable est du HTML+JS commenté, versionné par `APP_VER`
en tête de `src/00-entete-et-outils.js`. Le seul build est l'assemblage des sources en un
fichier unique (voir « Travailler sur le code »).

## Tests

- **In-app** : 🧪 Auto-tests (non-régression esquisse, contraintes, cotes) et **✓ Valider** (7 phases diagnostic + réparation du modèle, rapport dans la zone Auto-tests) — depuis le panneau latéral.
- **Dev** : harnais Node hors navigateur (solveur, cotation orientée, suivi de faces, références, projections associatives, congés/chanfreins exacts, menu d'extrusion, prismes miroir, répétitions, marqueur temps, performance…) ; certains scénarios s'exécutent sur le **noyau OCCT réel** (`.wasm` chargé en Node), et la version (`APP_VER`) est vérifiée avant chaque sauvegarde dans `Backup/`.
- **Suite repo** : `tests/` (harnais `appvm.cjs` + 54 suites + fixtures, dont `test_fao`, `test_fao3d`, `test_fao_barre3d`, `test_fao_zlim`, `test_corps_style`, `test_esquisse_contraintes`, `test_esquisse_arbre_rabat`, `test_esquisse_face_conges`, `test_esquisse_fao_cache`, `test_ctx_menu_viewport`, `test_conge_fond_poche`, `test_conge_tangent`, `test_repeat_session`, `test_validate`, `test_tree_filter`, `test_view_reframe`, `test_prodver_badge`, `test_cache_exact`, `test_sk_offset_contraintes`, `test_sk_offset_joints`, `test_proj_arc_sens`, `test_sk_offset_projetee`, `test_fresh_default`, `test_hard_phases`, `test_sk_origin`, `test_sk_hv_drag` et `test_coque_depouille`) — portable, aucun chemin absolu : `node tests/run.cjs` ou `npm test` depuis la racine, sur n'importe quel PC.

## Historique

- **[`CHANGELOG.md`](CHANGELOG.md)** — une entrée par version (cause, correctif, test). C'est là qu'il est, **pas** dans ce README et **pas** dans le fichier généré.
- **`git log`** — l'historique des commits.
- `src/00-entete-et-outils.js` ne garde que la description du projet et ses garde-fous, avec un renvoi vers `CHANGELOG.md`.

## Où en est le projet

MVP fonctionnel — version **2026-09-32n** (CAO + FAO fraisage 2.5D/3D avec G-code Siemens/Fagor). Pistes envisagées : sauvegarde paramétrique complète des imports STEP (rejeu), mode bureau (Electron déjà en dépendance de dev), 5 axes continu.

> **Note contributeurs** : les anciennes zones gelées (sketch, contraintes, congés, antériorité) sont **dégelées depuis le 2026-09-29** — modification libre sous la discipline projet : on édite **`src/*.js`** (jamais `fusion_mvp.html`, qui est généré) → `node build.js` → régression verte → bump `APP_VER` + **entrée dans [`CHANGELOG.md`](CHANGELOG.md)** → `node build.js --check` → snapshot `Backup/` → push. `node build.js --check` échoue si le livrable est périmé : impossible d'oublier de reconstruire. Seul le noyau exact OCCT (`occApplyXFillets`, `occFinalShape`) demande une validation navigateur : il n'est pas entièrement couvert par le harnais. **Versions depuis le 2026-10-01 : `AAAA-MM-JJ-NNN`** (date réelle + compteur quotidien à 001 — voir bloc VERSIONS en tête de `src/00-entete-et-outils.js`).

- **En cours** :
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f872f039-248a-48f6-bf1e-2cabe61d33ef" />

## Licences

- Code principal : **ISC** (voir `package.json`).
- `threejs/` : three.js & OrbitControls sous **MIT**, CSG.js — leurs licences s'appliquent.
- `occt/` : OpenCascade Technology sous **LGPL**.
