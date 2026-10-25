# Journal des modifications

Une entrée par version : **cause, correctif, test**. Source de vérité de l'historique.
Ces entrées vivaient en commentaire dans `fusion_mvp.html` (577 lignes, 50 Ko) : un
poids inutile dans un livrable généré, et un doublon de ce que Git conserve déjà. Elles
sont sorties le 2026-09-30j.

Code dans `src/` · livrable `fusion_mvp.html` (généré par `build.js`) · architecture et
garde-fous en tête de `src/00-entete-et-outils.js`.

**328 versions**, de `2026-09-28b` à `V0.7.9` (numéro daté jusqu'à `2026-10-16-021`, puis numéro des tags) — la plus récente en bas,
comme dans le fichier d'origine.

---

### `2026-09-28b`

solveSketch(anchor) — pendant le glisser, les pids déplacés sont ancrés (fixes temporaires)  
   pour que les contraintes (tangence, coïncidence, h/v, parallèle…) fassent SUIVRE l'entité liée au lieu de  
   ramener la glissée. Indice des dernières versions stables avant dégel : sketch=v25e, antériorité=v25e, congés=v25d, mesures=v25f.

### `2026-09-28c`

glisser en CORPS RIGIDE de la composante connexe (skDragComp) — points partagés, coïncidences,  
   tangences, symétries, parallélismes) : l'oblong/rectangle saisi se déplace d'un bloc comme une boucle fermée,  
   dans toutes les directions ; relâchement résolu avec la même ancre pour garder le groupe solidaire.

### `2026-09-28d`

oblong stabilisé — l'outil slot crée une LIGNE DE CONSTRUCTION entre les 2 centres des arcs  
   (h ou v selon l'orientation) : le centre d'un cercle devient un point partagé (2+ entités → glisser rigide),  
   et la cote d'entraxe pilote cette droite (length) au lieu d'une distance entre points. Contrainte equal  
   (2 arcs/cercle) : le rayon piloté par une cote ne peut plus être écrasé par la moyenne — l'autre suit.

### `2026-09-28e`

Ajuster (trim) ne perd plus les connexions — quand une ligne est coupée (tronçon retiré) ou  
   scindée en T, ses contraintes sont réacheminées vers la/les portion(s) conservée(s) (h/v, tangence par le pied  
   du centre, //, ⟂, symétrie, fix) au lieu d'être jetées ; un arc scindé hérite des relations de l'arc d'origine ;  
   les cotes length des lignes raccourcies suivent la nouvelle longueur.

### `2026-09-28f`

solveur d'esquisse refondu en moindres carrés (Levenberg–Marquardt) en complément de la  
   relaxation — un système sur/pleinement contraint (tangences, distances, rayons…) converge désormais au lieu  
   de rester en rouge après un glisser ; on garde toujours le meilleur des deux états (audit maximal).

### `2026-09-28g`

la tangence ligne↔cercle/arc touche le SEGMENT visible, pas seulement la droite infinie — quand  
   un pied de tangence (projection du centre) déborde et que la ligne ne peut pas être étendue (extrémité  
   fixée/partagée ou cote length), le cercle est glissé le long de sa tangente pour rattraper le contact à  
    l'écran (jamais de régression d'audit).

### `2026-09-28p`

le point de coupe d'un Ajuster sur cercle/arc devient une VRAIE attache — nouvelle contrainte  
    ⊙ « point sur courbe » (|P−C|=R : LM + relaxation + audit) épinglée dès la coupe (et dès la création si  
    l'extrémité repose sur la courbe) ; la tangence ne peut plus glisser, le point suit le cercle.  
    Cercle→arc : les bouts fusionnent avec les bouts de lignes présents et les lignes qui traversent sont  
    scindées en T (jonction partagée comme ligne↔ligne) ; un bout posé sur un vrai cercle/arc n'est plus  
    compté comme « bout ouvert » (fin du rond rouge au point de tangence).

### `2026-09-28q`

cholSolve réécrite (LDLᵀ correct — substitutions et factisation) : le LM converge enfin ;  
    esquisse « 2 arcs + 2 tangences » audit 0.204 → 4e-8, profil bouclé (plus de points rouges).  
    Contrainte nouvelle ∈ « point sur ligne » (online : LM + relaxation + audit + DOF) et attaches créées  
    DÈS LA CRÉATION pour TOUS les outils (ligne, arc, cercle, rectangle, oblong, point) : pt/pt (snap),  
    pt/ligne (online), pt/cercle (oncircle) — le pied sur une extrémité reste pt/pt. Sigle T de tangence  
     posé au point de contact sur CHAQUE élément (ligne + cercle/arc, style Fusion360, un par tangence) ;  
     création d'une tangence : l'extrémité au contact est VERROUILLÉE sur la courbe (oncircle).

### `2026-09-28r`

Ajuster sur CERCLE accepte les tangences : la tolérance d'intersection segment/cercle  
     est en mm (0.02 mm, au lieu d'un epsilon paramétrique qui rejetait t≈1.000001 subi au bruit solveur  
     sur les longues lignes) — les points de contact sont vus, le clic sur l'arc intérieur le retire.  
     Le point de coupe du trim de cercle est épinglé (⊙ oncircle) dès la coupe. Correctif : le sigle T  
     (tangT) référençait P hors périmètre → ReferenceError qui coupait drawSketch2D (plus de carrés  
     aux extrémités) et skCancelDraft (icônes de la barre bloquées).

### `2026-09-28s`

Ajuster sur ARC en 2 tronçons : fini la « vrille » — le bout partagé n'est JAMAIS  
     déplacé (le cut crée/fusionne un point neuf), les tangences ⊙ sont routées par ancrage angulaire  
     (segment cliqué → supprimé, tronçon conservé → transférées au nouvel arc), le rayon cote et les  
     liaisons //⟂/sym/fix sont clonés sur le nouveau tronçon ; frontière d'arc avec epsilon (la  
     tangence au bout, rejetée à 1e-5 rad par angInArc exacte, redevient une intersection) + correctif  
     cercle∩arc (angles lus sur arcAngles, o.a1 était undefined). CONSTRUCTION hors trim : ne coupe  
     plus jamais (entHits + garde trimEntity, outil Ajuster l'ignore) et se dessine translucide  
     (opacité .45). Cote d'angle sans renversement : création (menu contextuel + conversion  
     longueur→2ᵉ ligne) sur le secteur RÉEL angleFrame avec ccw figé — plus d'angle aigu lineAngle  
     qui retournait le dessin au solve. Contrainte ◎ coaxiale (2 cercles/arcs : mêmes centres,  
     LM + relaxation + audit + DOF + sigle) — bouton barre d'outils + menu contextuel.

### `2026-09-28t`

Cotation selon la position du curseur. Cotes longueur/distance posées en H, V  
     ou aligné (skDimOrientAt : direction de décalage du texte la plus proche ; jamais de cote « 0 »  
     sur une ligne purement H ou V) — ligne de cote et rappels H/V via dimSeg (hv), relaxation  
     (scaleAxisPts : ne touche que Δx ou Δy), résidus LM, audit et syncLineDims orientés.  
     Cote d'angle complémentaire (d.comp) : curseur dans un secteur obtus → valeur π−v avec  
     permutation a↔b pour l'autre secteur obtus (skDimAngleAt, secteur petit opposé non cotable,  
     conservé tel quel) ; résidus angleWant (naturel ou π−v par signe de delta) en LM, relaxation  
     et audit, arc rendu sur le secteur réel (ccw=opposé en complément). Éditer 145° fait pivoter  
     les lignes à π−145°.

### `2026-09-28u`

Esquisses qui suivent leur face d'attache sur TOUS les plans. findHostForFace  
     accepte maintenant les faces LATÉRALES (normale ⟂ axe d'extrusion) : host tag SIDE avec l'ARÊTE  
     du footprint qui définit le plan (edge = id ligne de l'esquisse porteuse) + h = offset le long  
     de l'axe. resolveSketchHost glisse (x,y) sur l'arête VIVANTE à chaque rebuild (profil édité →  
     le plan de face bouge → la poche suit) et clamp h à la course [min(0,d),max(0,d)] (épaisseur  
      réduite → la poche reste sur la face ; non destructif, h d'origine préservé). Migration des  
      anciennes esquisse FACE sans host → host SIDE inféré. TOP/BOTTOM inchangés.

### `2026-09-28v`

Noms persistants des références (entName : Arête N / Face N / Projetée N,  
      compteur par type séquentiel jamais réemployé, sérialisé dans le doc). Congés exacts :  
      chaque sélection porte son nom, reporté sur la feature, affiché dans le panneau congé et  
      dans Paramètres. Faces porteuses : sk.host.name attribué à la création et migré (docs  
      antérieurs), affiché par sketchFaceLabel (arbre, Paramètres, titre esquisse). Projections :  
      « Projetée N » + « Arête M » source (projNames) stockés sur l'entité ; arête source suivie  
      par srcMid (milieu 3D) — findClosestProjectedEdge prend preferMid (score planaire + pénalité  
      de milieu) et updateAssociativeProjections rafraîchit le lien après rejeu ; noms affichés  
       dans la sélection d'entité d'esquisse.

### `2026-09-28w`

Contrainte de point milieu ⊕ (midpoint) SANS scinder la ligne réceptrice :  
       snap/commit placent un point libre + contrainte {p,line} (ou {a,b} milieux égaux sur 2 lignes),  
       jamais de splitLineAt ; solveur = relaxation + résidus LM (2 éq/midpoint), DOF ×2, audit  
       milieu/milieux égaux, sérialisation automatique, bouton ⊕ dans la barre contraintes et menu  
       contextuel (2 lignes / point+ligne), auto-attach n'ajoute plus online par-dessus. Raccourci  
       E → ouvre l'extrusion (handler global hors wirePick, ignoré pendant saisie/drag/esquisse) ;  
       titre du bouton Extrusion mis à jour. Test régression test_midpoint (A→J).

### `2026-09-28x`

Congé du PÉRIMÈTRE (rims haut/bas — arêtes horizontales du contour) appliqué  
       en voie exacte OCCT : occShapeOfExtrude arrondit les deux bords du prisme avant les  
       découpes (rimEdgeJobs retient les arêtes ∥ plan à l'extrémité de l'axe n, exclut les  
       verticales ; occRimFillets = MakeFillet par arête, échec isolé non destructif + warning),  
       pastilles incluses ; le message « périmètre ignoré en mode exact » est supprimé (il ne  
       l'est plus). Persistance fillet/xfillet vérifiée (round-trip) + doc de test 4 esquisses /  
        host SIDE / proj srcMid chargé — test_fillet_rim, régression 26/26.

### `2026-09-28y`

Projections associatives qui SUIVENT enfin l'édition de l'esquisse source.  
        Cause racine : findClosestProjectedEdge / projectEdgeAt appelaient occCleanup(FR,null)  
        (qui supprime FR.shape) avant occListEdges → forme morte → throw silencieux → aucune MAJ.  
        Nettoyage différé (try/finally), scoring d'identité dominant (sc=dm*1000+d) + wantType  
        (line/circle/arc) pour ne jamais perdre la nature d'une arête, updateAllProjections  
        isole chaque esquisse et retourne « changed » → projRefreshRerun rejoue UNE passe le  
        solide après écriture des coordonnées (closeSketch compris), autosave si 2ᵉ passe.  
        r changé détecté (|Δr|>0.02). Test test_proj_follow (doc 1.json : centre e7 → p3,  
        srcMid rafraîchi, idempotence, gros déplacement +40, rebuild ×2) — régression 27/27.

### `2026-09-28z`

Congés sur arêtes ∥ X/Y enfin fiables (voies exactes occApplyXFillets +  
        rims). Deux causes : (1) repli « position » qui lisait anchor.z||0 — sans side/z, le haut  
        était recherché côté bas → arête sélectionnée introuvable → rien appliqué (maintenant  
        zref = anchor.z sinon se.pos[2]) ; (2) un SEUL MakeFillet.Build() en lot : UNE arête  
        capricieuse faisait tomber tout le congé — occFilletRun() partageable : lot d'abord,  
        puis ARÊTE PAR ARÊTE sur la shape courante (relocalisation par milieu, échec isolé  
        non destructif, avertissement partiel), utilisé par occApplyXFillets et occRimFillets  
        (rimEdgeJobs porte maintenant mid). test_xfillet_flow (faux occt instrumenté :  
        ancre, repli, rims, fallback lot→arête, échec total conserve la base) — régression 28/28.

### `2026-09-29a`

Congé exact — correspondance sélection→arête fiabilisée + ÉDITION d'un  
        congé existant. Trois causes du décalage (doc « Sans titre ») : (1) xAnchorFor sautait  
        les esquisses masquées (toutes consommées) → ancres nulles → passe 1 morte (maintenant  
        toutes esquisses, meilleur score global d2D+0.25|w|) ; (2) passe 2 acceptait tout  
        candidat dans un rayon XY de 10 mm avec contrôle Z optionnel → arêtes latérales de la  
        fente (XY 5 mm, z=6/24) retenues → candidat unique scoré (verticale = même coin ±3 mm,  
        ignore Z ; horizontale = plan ±1.5 mm + longueur ±max(1.5,0.25·l)) ; xAnchorMatch « e »  
        pareil en meilleur candidat unique ; (3) take() reprenait TOUS les hits : une  
        sélection = plusieurs arêtes → positions réécrites en doublons + lot d'arrondi erroné  
        (« Build impossible ») → dédoublonnage xf.edges (±0.75, même R, warning) en tête  
        d'occApplyXFillets. Édition : « ✏️ Modifier la sélection » / double-clic arbre sur un  
        xfillet → rejeu SANS la fonction (occSkipFeat dans occFinalShape) pourrecliquer les  
        arêtes vives d'origine ; applyExactFillet met À JOUR la fonction en place (jamais de  
        2ᵉ fonction), panneau Enregistrer/Annuler. Transparence esquisse : opacity 0.22→0.75  
        (grille lisible) + ghost d'antériorité en couleur de pièce. test_xmatch_n (A–H :  
        verticales, doc corrompu, rejet latéral, ancres visibles/masquées, candidat unique,  
        édition, props, panneau) — régression 29/29.

### `2026-09-29b`

Menu d'extrusion refondu + faces verticales UNE SEULE face (miroir  
        et mode « Uni » par l'option Additif). Menu : ligne d'info « ➕/➖ + nom de fonction »  
        (extName) ; Sens (Un côté / Symétrique → f.mid) ; Étendue (Distance / Vers un objet :  
        f.upto={ex,side} choisi parmi les extrusions additives ANTÉRIEURES — cible cut ou  
        postérieure refusée —, visée ±n, bouton « 🎯 Sens via face cliquée » extPickFace  
        avec curseur croix et Échap annule) ; Course résolue affichée ; commit distance via  
        le champ Distance (extDistSet sur change/blur/Enter) ; renommage auto au changement  
        d'opération. rebuild() réapplique en tête les uptos avant resolveAllSketchHosts ;  
        wirePick (capture extPickFace, hypot),  
        ESC, raccourci E ignoré pendant le picking. PRISME UNIQUE (capture : 20 tris au  
        lieu de 12) : occSpanPrism fusionnait 2 prismes (0→hi, 0→lo) → couture coplanaire  
        au plan médian = chaque face latérale coupée en 2 → occWireFromChain/occPrismOfChain  
        construisent la face au plan décalé z0=lo (OP sur points, projOnCirc et centre d'arc)  
        + UN prisme de longueur hi-lo ; occDiskPrism idem pour les pastilles (plus aucun  
        fuse interne) ; un côté / négatif géométriquement inchangés. Uni/Additif : occUnify()  
        (ShapeUpgrade_UnifySameDomain(s,true,true,false), try/catch → shape d'origine,  
        jamais d'exception) après CHAQUE fusion additive (branche add d'occFinalShape +  
        fuseIn d'occShapeOfExtrude) : fonctions empilées → faces coplanaires recollées.  
        Validé sur le noyau réel (probe Node : fuse 2 prismes = 10 faces/40 arêtes vs  
        prisme unique 6/24 ; unify 15→10 sur congé+trou empilé, idempotent ; congés  
        relocalisés par position à chaque rejeu — ordre des topologies indifférent).  
        test_extmenu_n (A–I : span, extName, askExtrude, upto/antériorité, extDistSet,  
        props Sens/Étendue, picking, rebuild) + test_mirror_uni_n (A–F : prisme  
        unique miroir/un côté/négatif/pastille, occUnify fallbacks, 0 fuse en miroir seul,  
        1 fuse + 1 unify en Uni) — régression 31/31 (fixtures 1.json et « test 3D et  
        antérirités.json » restaurées depuis la corbeille).

### `2026-09-29c`

Chanfrein exact + Répétition + bouton Esquisse unique. Chanfrein :  
        bouton ⟋, même architecture que Congé exact (face/arêtes/chaîne tangente, édition  
        en place, noms/antériorité), flag f.chamfer sur type xfillet, libellés D/Distance,  
        probe noyau réel MakeChamfer(shape)+Add_2(distance, edge) validé en lot et fallback  
        arête-par-arête. Esquisse : un seul bouton — face sélectionnée → esquisse sur face,  
        plan sélectionné → ce plan, sinon XY sans prompt. Répétition : outil 🔁, Ctrl+clic  
        arbre pour sélectionner extrusions/découpes/congés/chanfreins, modes linéaire,  
        circulaire et symétrie (axes/plans système + face sélectionnée), clonage des bases  
        d'esquisse transformées, xfillet/chanfrein copiés sans anchors pour re-match. Tests  
        test_sketchbtn_n + test_chamfer_n + test_rep_n — régression 34/34 (3 OCCT navigateur).

### `2026-09-29d`

Visée « vers un objet » par FACE : resolveExtrudeUpto cible une FACE  
        spécifique du corps cible (triangle fi stocké dans faceId:{fi,bid} + faceProps centre/  
        normale/aire pour suivi d'identité géométrique au rebuild) + UX menu Extrusion refondu :  
        Distance positive (signe auto par op : ➕ = Plot +, ➖ = Poche −), « Jusqu'à la face... »  
        (clic face direct, défaut Poche), « A travers tout » (f.through, sans distance) ;  
        suppression case « Sens inversé », boutons « Inverser le sens » / « Changer d'esquisse »,  
        liste « Cible » — test_upto_n, régression verte.

### `2026-09-29e`

Correction « Jusqu'à la face » (Poche) qui ne rejoignait jamais la face  
        cliquée : (1) le corps cible est retrouvé par faceId.bid (le corps CLIQUE) — en mode  
        OCCT le solide combiné s'appelle 'occ_result' (ref:null), jamais égal à l'id de la  
        fonction, donc l'ancienne recherche par ex/ref échouait et la distance restait la  
        valeur Mode Distance → « sens de l'option distance » ; (2) le triangle mémorisé n'est  
        accepté que s'il est sur le MÊME PLAN que la face cliquée (normale alignée) : une  
        retessellation décale les indices de triangles → autre face → sens inversé ; (3) les  
        gardes dir×t retirées — une face inclinée a son centre d'un côté du plan d'esquisse et  
        son plan de l'autre, la garde rejetait la bonne distance (t est signé, le prisme [0,t]  
        part de toute façon VERS la face) ; (4) clic d'une face inutilisable (parallèle à l'axe  
        d'extrusion, coplanaire) → message explicite + retour à l'étendue précédente au lieu  
de garder silencieusement l'ancienne distance. test_upto_n (cas 5 : corps occ_result) —  
         régression 34/34 + 5.

### `2026-09-29f`

« A travers tout » borné au solide traversé : le prisme de l'outil ne  
         couvre plus tout l'espace disponible (±5000 symétrique) mais l'étendue réelle de la  
         pièce projetée sur l'axe d'esquisse (+ 1 % de marge, min 1 mm) — throughPartRange lit  
         les corps affichés courants, puis le dernier état valide (lastSolidBodies conservé  
         avant le vidage de bodies : les anciens meshes restent vivants jusqu'au commit et  
         restent lisibles en toute sécurité pendant la construction de la nouvelle géométrie).  
         Repli sur la grande course uniquement si aucun solide n'est résolu (droit à l'ouverture  
         d'un document). La flèche 3D reflète désormais la course réelle ; une poche d'un seul  
         côté produit un outil asymétrique strictement borné au volume. test_upto_n (cas 6 :  
         bornage, repli, un seul côté) — régression verte.

### `2026-09-29g`

Répétition — le corps créé porte le nom du TYPE de répétition (et non  
         celui de la fonction de base) : chaque clone est nommé « Linéaire / Circulaire /  
         Symétrie », indexé « (i) » dès qu'il y a plusieurs copies (simple « Symétrie » pour le  
         miroir) — aucun nom à saisir, le libellé vient du mode choisi dans le panneau 🔁 ;  
         repCloneFeature reçoit ce nom (repli « (rép i) » si absent), message de fin  
« Répétition : n fonction(s) copiée(s) — « Linéaire » ». test_rep_n (cas F : linéaire,  
          circulaire, miroir sans index) — régression verte.

### `2026-09-29h`

RÉPÉTITION = fonction de premier ordre (type 'repeat') : la sélectionner  
          dans l'arborescence ouvre le menu de la répétition (Linéaire / Circulaire / Symétrie,  
          copies, distance/angle, axe/plan, « Utiliser la face sélectionnée », suppression) et  
          non plus le panneau de l'extrusion d'une instance. Les instances (enfants, tag  
          repeatId/repIndex) sont regroupées sous la répétition dans l'arbre ; Ctrl+clic sur une  
          répétition sélectionnée ajoute/retire une fonction source (extrusion, découpe, évent.  
          congé/chanfrein exact), chaque changement régénère les clones (repGenChildren : retrait  
          des anciennes copies + esquisses orphelines, recréation, bloc relogé juste après la  
          répétition dans la timeline ; repTransformPoint/Vec, repCloneSketch, repCloneFeature  
          refactorées pour lire les paramètres depuis la fonction 'repeat' elle-même — mode,  
          copies, dist, angle, axis, plane, dir, planeN). Suppression en cascade (menus + panneau)  
          via delFeature (répétition → repRemoveRepeat ; sinon retrait de l'id des sources des  
          autres répétitions). Le nom des clones reste le TYPE (« Linéaire (1) », « Circulaire (2) »,  
          « Symétrie »). test_rep_n (nouvelle structure 7 features / 3 esquisses, panneau répétition,  
          repToggleBase) — régression verte.

### `2026-09-29i`

ARBORESCENCE — la sous-arborescence de la répétition garde le NOM de la  
          FONCTION COPÉE (chaque instance reprend exactement le nom de sa fonction source, ex.  
          « Extrusion Base 10mm », « Chanfrein exact (…) »), c'est le nœud répétition lui-même qui  
          porte le nom du TYPE (Linéaire / Circulaire / Symétrie). Le nœud 🔁 comporte un triangle  
          ▶/▼ de dépliage : par DÉFAUT l'arborescence est REPLIÉE (les fonctions copiées sont  
          masquées, un simple compteur « n instance(s) » est affiché), un clic sur le triangle  
          montre/ masque les fonctions ou corps englobés. L'état déplié est mémorisé sur la  
          fonction (fr.open, persisté). L'instance reprend le nom d'affichage de sa fonction de  
          base ; le tooltip indique son numéro (Instance n°i). test_rep_n (cas I : replié par  
          défaut, dépliage) — régression verte.

### `2026-09-29j`

CHARGEMENT AUTOMATIQUE DU NOYAU EN MODE FILE:// — après la première  
          désignation manuelle du .wasm («⚙ Noyau .wasm… »), le binaire est mis en cache dans  
          IndexedDB (occCacheSave/occCacheLoad) : aux lancements suivants, la page démarre le  
          noyau OCCT EXACT toute seule depuis ce cache (bootBin → factory({wasmBinary})), sans  
          serveur ni clic — le fetch du .wasm restant interdit par CORS sur file://. En cas de  
          cache absent (premier lancement) ou d'IndexedDB indisponible, repli inchangé (bouton ⚙  
          + moteur maillage) : aucune régression. Plomberie de chargement seulement — le noyau  
          géométrique (occApplyXFillets, occFinalShape) est intact ; à valider au navigateur.

### `2026-09-29k`

SOURIS — la ROTATION se fait au clic GAUCHE enfoncé (ORBIT) ; la roulette  
          (molette enfoncée) reste en rotation ; le DÉPLACEMENT (pan) se fait au clic DROIT  
          enfoncé. Le clic court sans glisser conserve la sélection (gardien >6 px dans wirePick)  
          — aucun autre comportement touché.

### `2026-09-29l`

VUE COMPLÈTE — F5 (désormais capté, plus de rechargement navigateur) et  
          le bouton « Iso » cadrent la pièce ENTIÈREMENT : viewFit() encadre corps visibles +  
          esquisses, recentre sur la boîte englobante et règle la distance caméra selon le plus  
          contraignant des angles FOV (vertical/horizontal, marge 25 %) — plus de pièce coupée ou  
          trop petite en vue isométrique. Dessus / Face / Droite inchangés.

### `2026-09-29m`

NETTOYAGE — (1) CORRECTION : idbOpen() était défini DEUX FOIS ; la version  
          OCCT (minifusion_occ) écrasait celle de la sauvegarde (minifusion, store kv) et cassait  
          silencieusement le cache « pièce finie » (saveViewCache/restoreViewCache). Renommée en  
          occIdbOpen() → le « lastGood » ré-affiche la pièce finie au rechargement (F5/Ctrl+F5)  
          quand rien n'a changé. (2) OBSOLÈTE supprimé (~111 lignes, jamais appelées, vérifié par  
          comptage d'occurrences + régression) : basisFromNormal, hasDisplaySolid, pushBody,  
          planes, skGhost2DRefs, dst, cloneArcLinks, extrudeName, xEdgeKey, meshShown,  
          shapeToMeshes — tous remplacés au fil du temps par de la logique inline/refactorisée.  
          (3) DOUBLONS de helpers fusionnés : rot→rotP et key→pairKey (2 copies identiques  
          chacune) hoistés au niveau module. Régression harnais verte (selftest 14/14 + tests).

### `2026-09-29n`

MARQUEUR TEMPS (timeline 360) — clique droit sur une fonction →  
           « ⏱ Bloquer le temps à ce point » : le rejeu s'arrête AVANT cette fonction et les  
           fonctions suivantes sont exclues (grisées, bandeau « ⏱ marqueur ici » + « ↗ Rejouer  
           tout » dans l'arborescence). Les NOUVELLES fonctions (extrusion, découpe, congé/  
           chanfrein exact, répétition, import STL/STEP) sont insérées au niveau du marqueur  
           via addFeature() (Fusion360 : à la position du curseur de lecture). L'édition d'une  
           fonction exclue lève le marqueur. Non persisté (éphémère par session). test_tlPtr_n.

### `2026-09-29o`

MENU CONTEXTUEL — « 🔧 Éditer l'esquisse » remplace « 🔧 Éditer  
            (esquisse/extrusion) » : sur une extrusion, le clic droit ouvre désormais l'EDITEUR  
            d'esquisses (openSketch(f.sketchId)) au lieu du menu d'extrusion — l'éditeur  
            d'extrusion reste accessible par le panneau de la fonction et le bouton toolbar.

### `2026-09-29p`

RECONSTRUCTION A PARTIR DE LA MODIFICATION — toute edition d'une  
            fonction ou d'une esquisse reconstruit le solide depuis cette modification :  
            (1) le champ Distance du panneau extrusion conserve le SIGNE des poches (op=cut) :  
            editer 15 en 8 garde l'operation Decoupe, plus besoin de rebasculer Plot/Poche ;  
            (2) les instances des REPETITIONS (lineaire/circulaire/symetrie, clones d'esquisse  
            miroir/copiees) SUIVENT leur fonction source : profondeur, operation Plot/Poche,  
            sens, etendue, conge/chanfrein exact modifies regenerent les clones AVANT le rejeu  
            (repSyncForFeature/repSyncForSketch branches a : panneau extrusion, panneau conge,  
            changement d'esquisse, jusqu'a la face, fermeture d'esquisse, fleche 3D).  
            Le rebuild rejoue TOUJOURS le solide complet dans l'ordre de la timeline (sans  
            cache par fonction) : la modification et tous ses dependants sont reconstruits.  
            Instances regenerees EN PLACE (ids stables) : plus d'instances perdues ni de  
            references cassees. test_rep_n (cas J, K) + test_repbug.

### `2026-09-29q`

GEL AU CHARGEMENT (interface figee, piece 1 absente) — un document  
            pollue (instance en double, instance sans repetition, esquisses d'instances  
            abandonnees, nombre de copies aberrant) etait reinjecte a chaque lancement : ces  
            esquisses orphelines rejouaient le modele complet a chaque passe de projections,  
            sans jamais converger. (1) docSanitise() au chargement : doublons, instances  
            orphelines et esquisses d'instances abandonnees retires, repetitions regenerees,  
            copies plafonnees (REPEAT_MAX=200) — les esquisses LIBRES sont conservees ;  
            (2) les esquisses d'instances ne rejouent plus les projections (elles viennent de  
            leur source) ; (3) filet anti-boucle : au-dela de 2 rebuilds imbriques, le rejeu  
            s'arrete et previent au lieu de figer l'onglet. test_boot, regression verte.

### `2026-09-29r`

MODE FICHIER (file://) — l'onglet paraissait fige des l'ouverture en  
            mode fichier, alors que localhost demarre normalement. En file:// sans cache  
            exploitable, l'app tentait quand meme le noyau exact : le .wasm y est illisible  
            (CORS) et la compilation des ~65 Mo monopolise le thread principal -> page figee,  
            SANS aucun message. Desormais en file:// SANS cache, on ne tente plus rien :  
            moteur maillage + message clair (localhost, ou « ⚙ Noyau .wasm… » une fois).  
            A present, l'etape de compilation est peinte AVANT de bloquer (yieldUI) et  
            l'avertissement manuel le dit explicitement. test_boot, regression verte.

### `2026-09-29s`

EXTRUSION — le menu/creation ne partait plus (icone 🧱 et touche E  
            « ne faisaient rien de visible ») : la fonction nf etait declaree dans le bloc  
            else puis utilisee HORS de ce bloc (sel={kind:'feature',id:...nf.id}) ->  
            ReferenceError a chaque creation ; l'extrusion etait bien ajoutee mais ni la  
            selection, ni le panneau, ni le rebuild ne s'executaient (d'ou le « fait n'importe  
            quoi »). Variable portee hors bloc (target). En prime, sans esquisse selectionnee,  
            on extrude la derniere esquisse REELLE : les esquisses d'instances de repetition  
            (« … (rep i) ») ne sont plus utilisees par defaut. test_extrude_pick,  
            regression verte.

### `2026-09-29t`

FLECHE 3D SUPPRIMEE — la fleche interactive qui permettait de  
            deplacer la face extrudee a la souris (glisser le bout de la fleche dans la vue 3D)  
            est retiree. Supprimes : extArrowRefresh (dessin/maj de la fleche), extArrowHit  
            (hit-test ecran), extArrowWire (drag pointeur + commit), la variable extArrow,  
            son rafraîchissement dans animate() et la suppression de clic en fin de drag.  
            L'ecriture de course est conservee et renommee extDistSet : le pilotage de la  
            profondeur passe DESORMAIS PAR LE CHAMP DISTANCE du panneau uniquement (le champ  
            garde le signe des poches). Titre du bouton et libelles nettoyes.  
            test_noarrow, regression verte.

### `2026-09-29u`

RECONSTRUCTION BEAUCOUP PLUS RAPIDE (mesure au noyau exact reel) —  
            (1) CACHE DE REJEU PAR POINTS DE CONTROLE : une fusion OCCT coute 67-170 ms,  
            une COPIE du solide accumule 1-4 ms (30 a 80x moins cher). Le solide est  
            donc memorise apres chaque fonction ; si le debut de la timeline est inchange,  
            on repart de la derniere copie et on ne refait QUE les fusions a partir de la  
            modification. Cles = signatures cumulees de prefixe (base d'esquisse, points,  
            entites, operation, distance, upto, conges) : au moindre octet de difference,  
            tout ce qui suit est invalide — aucune geometrie perimee ne peut etre reutilisee.  
            Mesures (8 boites empilees, vrai noyau) : rejeu sans modification 498 -> 28 ms,  
            modification de la derniere fonction 496 -> 112 ms (4,4x).  
            (2) REJEU INUTILE SAUTE : un rebuild declenche sans modification (bouton qui  
            "tele" un rebuild, passe de projections, visibility d'un corpsfantome) est  
            desormais sans effet : le controle est O(1) via un compteur de version  
            (markDirty) — le hash du document n'est plus recalcule pour le savoir.  
            (3) COMPTABILITE HORS CHEMIN CRITIQUE : docHash (qui n'etait JAMAIS lu, donc  
            100 % du cout perdu) est memoise par version et calcule apres le rendu ;  
            saveViewCache (copie de tous les sommets + IndexedDB) et autosave (JSON +  
            ecriture locale) sont differees et regroupees — un.beforeunload/  
            visibilitychange force l'ecriture, donc aucune perte possible. Sur 40  
            fonctions : 104 -> 62 ms (-40 %) de temps hors geometrie.  
            Validation : test_perf (saut/rejeu/visibilite/marqueur temps),  
            test_cache_exact (noyau REEL : topologie faces/aretes/solides strictement  
            identique entre rejeu par cache et rejeu complet, sur 5 scenarios dont  
            modification d'esquisse et decoupe).

### `2026-09-29v`

CHANFREINS/CONGES — REFERENCES CONSERVEES LORSQUE LE SOLIDE CHANGE —  
            un chanfrein perdait sa reference des qu'un volume empile apparait ou disparait  
            au meme coin : l'ancre de coin (type 'p') retenait TOUTES les verticales du coin,  
            le chanfrein visait 2 aretes, l'une echouait (« chanfrein partiel : 1/2 ») et la  
            position memorisee etait reecrite sur l'arete voisine — reference perdue  
            definitivement. Desormais : (1) UNE selection = UNE arete, y compris pour les  
            ancres de coin (on retient la meilleure verticale, en privilegiant le niveau  
            de hauteur coherent avec les volumes de l'esquisse) ; (2) tolerances de hauteur  
            emboitees pour les ancres d'entite : hauteur attendue, sinon plus proche en  
            hauteur, sinon plus proche en 2D — l'ancre survit a un changement de hauteur  
            venu d'une AUTRE fonction ; (3) la position D'ORIGINE de la selection est figee  
            (pos0) et sert de reference durable : se.pos n'est plus qu'un indice rafraichi.  
            Validation noyau REEL (test_cham_keep) : hauteur du volume modifiee, volume  
            empile ajoute puis retire au meme coin, hauteur du volume empile modifiee —  
            dans les 5 scenarios : aucun warning, une seule arete, pos0 intacte, jamais de  
            derive vers l'arete voisine. test_chamfer_n / test_anchor_n / test_fillet_rim  
            inchanges, regression verte.

### `2026-09-29w`

VISUALISATION 3D ETENDUE — la sidebar gauche DISPARAIT au profit  
            d'une vue 3D degagee. (1) ARBORESCENCE DANS LA VUE 3D : superposition semi  
            transparente a gauche (fond flou), avec un onglet vertical pour la REPLIER  
            (etat memorise) — la largeur de la vue 3D est restituee quand elle est rangee.  
            (2) L'ARBRE « PIECES » DISPARAIT : les corps se pilotent desormais depuis  
            l'arborescence (oeil sur la fonction) ou par le clic droit dans la vue 3D.  
            L'oeil d'une FONCTION pilote aussi la visibilite memorisee de ses corps, pour  
            qu'aucun corps masque ne reste invisible sans moyen de le reafficher.  
            (3) ICONES : un glyphe par type de fonction (▤ extrusion, ▾ decoupe, ⤢/⟋  
            conge/chanfrein, 🔁 repetition, ◧ import), l'oeil (👁/🙈) reste EXCLUSIVEMENT  
            la visibilite — plus de doublon avec l'ancien arbre Pieces.  
            (4) MENU SETTINGS (⚙) : l'ancien panel « Vues / Coupe » devient un menu  
            contextuel (clic sur ⚙, fermeture au clic dehors ou Échap) qui regroupe les  
            vues, la coupe, le repere, l'inversion de zoom, le SOL MIROIR et les ARETES  
            (ils quittent l'ancien panel « Aspect », qui disparait avec lui).  
            (5) Le choix de COULEUR et le mode AUTO sont retires (le menu contextuel 3D  
            conserve la couleur par corps). (6) Barre de vues flotante en haut a droite  
            (Iso / Dessus / Face / Droite / Tout afficher) pour l'acces rapide.

### `2026-09-29x`

OUTIL DE DECOUPE MASQUE APRES L'OPERATION — juste apres une  
            soustraction, la piece rouge translucide (fantome d'outil) s'AFFICHAIT : la  
            nouvelle decoupe etait selectionnee, et la regle d'apercu Existing  
            (visible quand la decoupe est selectionnee) s'appliquait donc immediatement.  
            Desormais l'outil reste CACHE apres l'operation (soustraction comme « jusqu'a  
            la face »), le masquage s'auto-effacant des que la selection change ; le clic  
            sur la decoupe dans l'ARBORESCENCE reste le geste explicite qui montre  
            l'aperçu, et recliquer ailleurs le fait disparaitre (comportement inchange).  
            Au passage, suppression du forçage « sticky » : il pouvait epingler un outil  
            DEFINITIVEMENT visible (les identifiants de fantome etant positionnels, la  
            visibilite memorisee par corps les figeait) — les fantomes ne sont plus  
            concernes par cette memorisation. test_ghost (6 scenarios), regression verte.

### `2026-09-29y`

AUDIT DE CONTINUITE ET DE PERSISTANCE (references faces / aretes /  
            fonctions) — deux audits menes. (1) PERSISTANCE (test_refs, 15 assertions) :  
            aller-retour sauvegarde/rechargement verifie pour les ids de fonctions et  
            d'esquisses, la cible « jusqu'a la face » (upto.ex + faceId), les ancrages de  
            chanfrein (type p ET e), la position d'origine pos0, les sources et instances  
            de repetition, les hotes de faces, les ids d'entites, les cotes et les  
            compteurs de noms — TOUT survit, et une edition sans rapport ne casse rien.  
            (2) CONTINUITE GEOMETRIQUE sur le NOYEAU REEL (test_refs_exact) : le chanfrein  
            reste sur la MEME arete apres une edition sans rapport, apres une edition  
            amont, et apres rechargement (ancre et pos0 intacts, topologie du solide  
            inchangee) — le systeme d'ancrage tient.  
            (3) DEFAUT REEL CORRIGE : cleanupSk supprimait les points d'esquisse non  
            references par une entite, une contrainte ou une cote — un point de  
            construction « solo » ancre par un chanfrein etait donc efface a la fermeture  
            de l'esquisse et la reference disparaissait. Les points ancres sont des  
            REFERENCES : ils sont desormais preserves (test_anchor_solo).  
            Points de VIGILANCE rests (non verifiables hors navigateur) : upto.faceId.fi  
            est un INDICE DE TRIANGLE du maillage combine, re-tesselle a chaque  
            reconstruction — la distance est bien re-resolue a chaque rebuild et des replis  
            existent (plan, centre, aire), mais l'indice lui-meme n'est pas stable par  
            construction. A valider au navigateur.

### `2026-09-29z`

RAFRAICHISSEMENT DUR — le bouton « Recalculer » ne suffisait plus :  
            depuis l'optimisation de reconstruction (le rejeu est sauté quand rien n'a  
            changé), il ne forçait rien et paraissait sans effet. Désormais (1) Recalculer  
            FORCE le rejeu (invalidation de l'état d'affichage avant l'appel), (2) un bouton  
            « ⟳⟳ Hard » (raccourci Ctrl+Maj+R) jette TOUT ce qui peut être périmé — points de  
            contrôle du rejeu (solides accumulés mémorisés), empreinte mémoïsée du document,  
            état du dernier affichage, TOUS les corps affichés (géométries et matériaux),  
            solide exact vivant, sélections de faces, aides de mesure — puis rejoue  
            l'intégralité du modèle et RAPPORTE ce qu'il a fait : durée, points de contrôle  
            jetés, moteur utilisé, fonctions/­esquisses, corps et triangles affichés  
            (avant/après). Le noyau OCCT n'est PAS rechargé (10 à 60 s) : s'il est lui-même  
            bloque, seul le rechargement de page du navigateur aide. test_hard.

### `2026-09-30a`

RAFRAICHISSEMENT DUR A CHAQUE MODIFICATION (par defaut) — a la  
            demande : le mode « fraicheur » est desormais ACTIF par defaut. A chaque  
            modification, le cache de points de controle est purge AVANT le rejeu : le  
            modele entier est reconstruit depuis zero et AUCUNE geometrie n'est reutilisee  
            d'une reconstruction a l'autre. Un interrupteur « Rafraichissement dur a chaque  
            modification » dans le menu ⚙ permet de revenir au rejeu rapide par points de  
            controle (~4x plus rapide sur les modifications de fin de timeline, mais moins  
            frais). Au passage, la signature d'invalidation du cache est COMPLETEE : elle  
            ignorait « a travers tout » et les conges 2D / rims rattaches a une extrusion  
            (un changement de rayon de conge ne revalidait donc pas le cache — source  
            possible d'un affichage perime). test_fresh + test_cache_exact, regression  
            verte.

### `2026-09-30b`

DECOUPES « A TRAVERS TOUT » — LE SOLIDE NE DEPENDAIT PLUS DU  
            DOCUMENT (symptome : en passant la premiere extrusion de 55 a 60 mm, les  
            poches « a travers tout » disparaisaient ; seul un « Hard » les faisait  
            revenir). Cause : l'etendue de l'outil « a travers tout » etait mesuree sur les  
            corps AFFICHES, c'est-a-dire ceux de l'EDITION PRECEDENTE. Apres un changement  
            de hauteur, la mesure portait sur l'ancien solide : l'outil de decoupe atterrissait  
            hors de la piece et ne decoupait plus rien. Le « Hard » vidait le reservoir, ce  
            qui declenchait le repli sur une course maximale — d'ou la guerison apparente.  
            CORRECTION : l'etendue est desormais mesuree sur le solide EN COURS DE  
            CONSTRUCTION (boite englobante du BRep deja reconstruit par les fonctions  
            precedentes, via occSpanFromShape) ; le reservoir de corps affiches ne reste  
            plus qu'en repli, pour le moteur maillage ou le tout premier rejeu. Le modele ne  
            depend donc plus de l'historique d'affichage. test_through2 (noyau REEL : resultat  
            identique avec reservoir perime, reservoir vide et changement de hauteur), le  
            test_through d'origine ne reproduit plus le defaut, regression verte.

### `2026-09-30c`

DIAGNOSTIC ANTI-CACHE — le bug de decoupe « a travers tout » corrige  
            en 30b n'etait toujours pas visible cote navigateur : le serveur local (npx  
            serve) servait bien la bonne version, mais le navigateur gardait l'ancien HTML  
            en cache. La version du code s'affiche DESORMAIS en permanence dans le panneau  
            « Etat » (« Code en memoire : 30c ») et dans le rapport du rafraîchissement dur :  
            fini les tests sur une copie perimee. Verification faite sur le FICHIER REEL de  
            l'utilisateur (Test.minifusion.json, noyau exact) : avec le reservoir perime on  
            obtenait 23 faces au lieu de 18 (le « fond » rouge de la poche, capture img1) ;  
             avec le correctif, 18 faces quelle que soit la hauteur — la poche perce.  
             test_img, regression verte.

### `2026-09-30d`

REFERENCES DES CONGES/CHANFREINS SUR ARETES NEES D'UN AUTRE CONGE  
             (cas des deux perimetres de la poche interieure) — cause racine trouvee sur le  
             FICHIER REEL de l'utilisateur (conge.json, noyau exact) : une arete produite par un  
             rayon n'est sur AUCUNE geometrie d'esquisse. L'arc d'un R15 remplace le coin et se  
             trouve a ~6 mm de la ligne 2D qui l'a produit ; xAnchorFor ne cherchait qu'a 1 mm,  
             donc l'ancre revenait NULL. L'arrete retombait sur le repli fragile  
             position+longueur d'occApplyXFillets, puis PERDAIT sa reference des le solide suivant  
             (⚠ dans l'arbre des que m<t). Correction en trois temps :  
             1) xAnchorFor : deuxieme passe de recherche a 8 mm, ancre marquee far:1 ;  
             2) xAnchorMatch : tolerance 2D elargie a 8 mm pour far:1 — SANS cela l'arc et son  
                segment colinaire se confondaient (8 selections -> 4 aretes, perdues d'autant) ;  
             3) xAnchorMatch : departage RELATIF sur pos0 entre candidats equivalents  
                (fenetre de 6 mm) — un terme pondere absolute saturait des que le solide avait  
                beaucoup bouge et redonnait la main au 2D, ce qui faisait a nouveau capturer les  
                arcs par les segments ; pos0 est desormais fige des la selection (mkEdges) et  
                conserve en edition, la position d'origine est la reference durable.  
             Resultat sur conge.json : les 2 perimetres de la poche (4 segments + 4 arcs par  
             niveau, 16 aretes) sont ancrees 16/16, appliquees 16/16 (68 aretes au solide au lieu  
             de 36) et suivies 16/16 quand on change la profondeur de la poche PUIS la hauteur du  
             bloc, aller et retour. Plus aucun ⚠, plus aucune arete perdue.  
             test_perimetre_poche, regression verte (selftest 11/11, test_cham_keep,  
             test_cham_ref, test_refs_exact, test_through2, test_fillet_rim, test_img).

### `2026-09-30e`

CONGE/CHANFREIN — UN CLIC = UNE ARETE + APERCU ROUGE AVANT VALIDATION.  
             (1) Selection : le double-clic « chaine tangente » disparait. Il attrapait toute la  
             bande tangente d'un congé deja present, sans que l'utilisateur l'ait demandee. La  
             selection part maintenant des GERMES (les aretes reellement cliquees) ; l'option  
             « 🔗 Aretes tangentes ajoutees automatiquement » (cochee par defaut) en derive la  
             chaine, decochee elle n'ajoute que le germe. Retirer un germe retire ce que sa  
             chaine avait apporte. Le panneau annonce « n aretes cliquees → m retenues » et les  
             germination sont en JAUNE, les tangentes deduites en ROUGE : on voit toujours  
             d'ou vient la selection. Meme logique pour le chanfrein.  
             (2) Apercu : le resultat s'affiche EN ROUGE TRANSLUCIDE des la selection, avant  
             « Appliquer » — la piece reelle s'estompe (opacite 0.16) et le solide arrondi  
             (ou chanfreine) passe devant. Recalcule a chaque changement de selection ou de  
             rayon (signature), sur le BRep vivant occLive ; occFilletRun ne detruisant jamais la  
             forme de base, l'apercu ne peut pas abimer le picking. Apercu et opacites  
             restaures a la sortie du mode et apres application. Conge ET chanfrein.  
             (3) Au chargement, le nom d'un conge/chanfrein est realigne sur sa geometrie  
             reelle (« Congé exact (16 arete(s)) » alors qu'il n'en restait que 12 apres des  
             arêtes perdues : nom menteur dans l'arbre).  
             test_germes_apercu (24 assertions, noyau REEL, sur le fichier reel de  
             l'utilisateur), test_conge_reel, regression verte (selftest 11/11, test_cham_keep,  
             test_cham_ref, test_refs_exact, test_through2, test_xfillet_flow).

### `2026-09-30f`

TOUR DE PIECE COMPLET (fichier reel « Ma Piece », noyau exact) —  
             quatre defauts de reference, dont un qui s'aggravait a chaque rejeu (treuil) et  
             un qui jetait des aretes.  
             (1) UNITES DE HAUTEUR — pos0 est en coordonnees MONDE, q[2] (projection esquisse)  
             est RELATIF au plan de l'esquisse : compares tels quels, haut et bas sont inverses.  
             Mesure : sur une poche traversante, les 4 arcs du BAS (pos0 z=0) se resolvaient  
             sur les aretes du HAUT (ecart 40 mm, score 26.93) alors que la bonne arête, rejetee  
             en seau C, scorait 10.93 — et le seau A, prioritaire sur le score, imposait le  
             mauvais choix. xAnchorMatch projette maintenant pos0 comme un point.  
             (2) ETENDUE SENTINELLE — une decoupe « a travers tout » a pour span (-5000,+5000) :  
             ni lo ni hi ne decrit un niveau reel. Effets en cascade mesures : expectedZ valait  
             5000 (terme de hauteur x0.2 = 1000, noyant tous les autres criteres) ET xAnchorFor  
             etiquettait systematiquement side=1, car isBottom et isTop y sont tous deux faux  
             (repli « isBottom?0:1 ») — les arcs du bas perdaient leur niveau. Desormais :  
             cote matcher, retour a zRef si |expectedZ|>1000 ; cote ancre, sans etendue  
             exploitable le repere restant est le plan de l'esquisse (au-dessus/dessous).  
             Effet mesuré : deux conges R2 mono-arete qui echouaient (« arrondi isole  
             impossible ») s'appliquent — le solide passe de 82 a 90 faces et les  
             « 8 doublon(s) fusionne(s) » disparaissent : ils n'etaient pas des doublons, mais  
             les arcs du bas ranges sur ceux du haut.  
             (3) TREUIL DE POSITION — deux aretes tres proches en 2D se departageaient au hasard,  
             le mauvais choix etait ecrit dans se.pos/se.len par take(), et l'erreur s'aggravait  
             a chaque rejeu jusqu'a rendre le document illisible (constate sur un conge R2 de bord  
             de poche). Le score penalise desormais l'ecart a pos0 (terme UNIFORME, plafonne a  
             60 mm pour qu'un deplacement volontaire reste suivi) ; la fenetre d'egalite de 6 mm  
             départage ensuite sur pos0, ce qui conserve la distinction arc / segment colineaire.  
             (4) DEDUP TROP AGRESSIF — la fusion des jumeaux portait sur position + rayon seule :  
             trois aretes distinctes d'une bande de coin (deux conges qui se rejoignent) ont le  
             MEME milieu, et elles etaient fusionnees — 4 aretes perdues d'un coup. La fusion  
             exige desormais aussi la meme longueur ; l'identite exacte est garantie plus bas  
             sur l'index d'arete reellement resolu.  
             Les deux fichiers reels sont maintenant SAINS et IDEMPOTENTS : « Ma Piece »  
             (14 fonctions, 5 esquisses, 2 repetitions, 7 conges/chanfreins) converge en  
             0 avertissement des le 2e rejeu et reste figee sur 5 rejeux (236 aretes, 90 faces) ;  
             « conge.json » retrouve ses deux perimetres de poche (bandes a z=6 et z=34,  
             68 aretes, 30 faces, poche toujours traversante).  
             Point de fond : 2 conges de « Ma Piece » restent PARTIELLEMENT adoucis (8/8 et non  
             20/20). Leurs 4 aretes perdues le sont DEFINITIVEMENT — les positions d'origine  
             ne correspondent plus a aucune arete du solide actuel — elles doivent etre  
             re-selectionnees : aucun algorithme d'appariement ne peut les retrouver.

### `2026-09-30h`

LISTE DEROULANTE PLOT/POCHE A LA CREATION + REGRESSION DE PANNEAU.  
             (1) Demande de l'utilisateur : la liste deroulante pour choisir poche ou plot  
             n'existait pas a la creation. askExtrude creait en dur distance=20, op='add'  
             (« Plus de prompts ») : il fallait creer un plot puis basculer dans les proprietes.  
             Le panneau propose desormais, AVANT de creer la fonction : Opération  
             (➕ Plot / ➖ Poche) et la distance (champ toujours positif, le signe decoule de  
             l'operation — le nom de la fonction suit : « Decoupe … -12mm »). Une selection  
             ailleurs annule le formulaire en cours.  
             (2) REGRESSION INTRODUITE EN 30e, causee par moi : le bloc « arêtes tangentes »  
             avait ete insere dans renderProps au lieu de renderExactPanel (la ligne d'ancrage  
             p.appendChild(lab);p.appendChild(inp) existe dans les DEUX fonctions). Il levait  
             « Cannot read properties of null (reading 'tangent') » sur CHAQUE panneau  
             d'extrusion, interrompant renderProps JUSTE AVANT la liste « Operation » : la  
             liste Plot/Poche disparaissait de l'interface. Comparaison faite sur HEAD : avant,  
             exception sur le panneau de la 1re extrusion ; apres, aucune. Le bloc est  
             desormais dans renderExactPanel, ou il doit etre (la case a cocher y est enfin  
             visible, et absente de l'interface depuis la 30e).  
             Note : note()/info() sont declarees DANS renderProps, donc locales à cette  
             fonction — le formulaire de creation construit ses elements directement.  
             test_new_extrude, test_panneaux (les 14 panneaux se construisent sans exception,  
             noyau REEL, sur le fichier reel de l'utilisateur), test_germes_apercu,

### `2026-09-30i`

DECOUPE DES SOURCES EN src/ (livrable inchange) — le script unique  
             de 9 700 lignes devient une PARTITION CONTIGUE de 14 fichiers de src/, un par  
             operation (noyau et operations solides, esquisse 2D + solveur, trim/souris,  
             extrusion, conges/chanfreins, interface, picking/mesure/import, toolbar).  
             Le noyau OCCT tiers (LGPL) reste intact dans son propre fichier, comme convenu.  
             Le livrable reste UN SEUL fusion_mvp.html : double-clic et file:// fonctionnent  
             exactement comme avant, l utilisateur ne voit rien et il n a toujours qu un  
             fichier a ouvrir. build.js (Node seul, sans dependance) concatene dans l ordre,  
             et « node build.js --check » ECHOUE (code 1) si le livrable est perime : impossible  
             d editer le genere en croyant editer la source — exactement le piege de la 30e.  
             Verification : le HTML reconstruit est identique a l ancien a part les bandeaux de  
             section (comparaison automatisee), et les 12 tests passent sur le fichier genere —  
             la boucle de verification est donc inchangee.
### `2026-09-30j`

**LE CHANGELOG SORT DU LIVRABLE** — question : « pourquoi fusion_mvp.html est-il toujours
aussi gros ? ». Mesure : le livrable fait 581 Ko, dont **50,5 Ko de commentaire de
historique** (577 lignes de versions) et 22 Ko de coque HTML/CSS ; le reste est du code.
Le découpage en `src/` n'a jamais visé la taille mais la lisibilité (un fichier de
9 700 lignes est inpatchable — c'est ce qui a causé le bug de la 30e) ; le livrable doit
rester UN SEUL HTML pour le double-clic et `file://`. Le seul poids réellement superflu
était l'historique dupliqué dans un artefact généré.

Les 51 entrées de versions sont désormais dans `CHANGELOG.md` (52 Ko, une entrée par
version : cause, correctif, test), et l'en-tête de `src/00-entete-et-outils.js` ne garde
que la description du projet et ses garde-fous — **les mots de l'auteur, verbatim**, plus
un renvoi. Gain : **581 → 531 Ko (−50 Ko, −9 %)**, 9 770 → 9 209 lignes. Le code est
vérifié STRICTEMENT identique octet pour octet.

Pour le contexte : le livrable ne pèse que **0,9 % du projet** — three.js 642 Ko, et le
noyau exact `opencascade.wasm.wasm` 62,8 Mo (98 %). Le gros du poids est le kernel, par
conception : il est externe, chargé à la demande et mis en cache dans IndexedDB.

Piège rencontré et corrigé au passage : mon script de migration a redéfini une variable
`reste` et a **écrasé 7 335 octets de code** ; `build.js` a reconstruit un HTML amputé sans
lever le moindre doute (le `--check` compare src→html, pas src→git). Détecté par une
comparaison « le code après APP_VER est-il identique à l'original ? », puis restauré
depuis la copie de sauvegarde. C'est exactement le genre d'erreur que le harnais de
régression attrape : les 12 tests repassent sur le livrable reconstruit.
### `2026-09-30k`

**UNE COTE « DISTANCE ENTRE DEUX LIGNES PARALLÈLES » DEVENAIT UN ANGLE** —
signalé par l'utilisateur sur l'Esquisse 5 de son fichier `esquisse.json`.

Le test « parallèles ou sécantes ? » se faisait sur `angleFrame()`, qui part d'un SOMMET.
Deux lignes parallèles **distinctes** (côté d'une rainure, deux lignes de construction
éloignées) n'ont **aucun sommet commun** : `angleVertex()` renvoie alors un
**pseudo-sommet** (milieu du segment joignant les milieux des deux lignes) et l'angle
mesuré entre deux rayons vers ce point fictif est **arbitraire**. La tolérance de 0,03 rad
(1,7°) ne le ratait pas toujours.

Mesuré sur le fichier réel, Esquisse 5 : `e8` (construction horizontale, « Projetée 2 ») et
`e17` (horizontale) portent une contrainte **`parallel`** explicite et sont écartées de
**3,037 mm**. Le code concluait **« angle » à 175,74°**. Le même cas avec deux lignes
*verticales* passait, mais par chance (179,81°, à 0,19° de π) : **le comportement dépendait
de l'orientation, pas de la géométrie**.

**Correction** — la classification se fait désormais sur les **vecteurs de direction**,
exacts, indépendants de l'ordre des extrémités et de l'existence d'un sommet :

- `skLinesAngle(sk,A,B)` : angle ∈ [0, π/2] entre les deux droites ;
- `SK_PARALLEL_TOL` = 3° — un angle sous 3° entre deux droites est dégénéré, alors que
  des lignes `parallel` sous-contraintes traînent à 1-2° ;
- `skShareVertex(sk,A,B)` : le secteur réel d'`angleFrame` n'est conservé que si les
  deux lignes partagent un sommet ; sinon l'angle vient des directions, seul sens
  définissable pour deux segments disjoints (le pseudo-sommet n'a pas de sens) ;
- `lineGap` moyenne désormais la distance perpendiculaire des **deux** extrémités de B
  (identique pour deux droites exactement parallèles, bien plus juste sinon).

Appliqué aux **deux** chemins de création (cote simple après une ligne, et cote paire
Shift+clic), avec le nombre d'écart dans le message : « Converti en entraxe ⇔ 3.04
(lignes 0.00° d'écart) ». Plus jamais de silence.

**Résultat sur le fichier réel** : les 10 paires de lignes de l'Esquisse 5 sont classées
correctement — `e8`/`e17` donne un **entraxe de 3,037 mm**, `e13`/`e17` reste un **angle de
40°**, `e15`/`e17` un angle de 90°. Neuf cas synthétiques également (parallèles de même
sens ou de sens opposés, obliques, croisées à 90°, sécantes à 40°, quasi-parallèles à 2°).

Échecs de tests **antérieurs et inchangés** (vérifié sur HEAD) : `test_tangarc`,
`test_anchor_n` (harnais : le DOM du harnais est minimal), et `test_perimetre_poche`
(4 échecs constants — ce test re-congère un périmètre DÉJÀ congeré, configuration
dégénérée ; le fichier est couvert proprement par `audit_conge_geo` et `audit_idempotence`).
---

### `2026-09-30l`

**RÉVOLUTION 360°** — le module demandé : le profil d'une esquisse pivote autour d'un
axe, en **Plot** ou en **Poche**. Symétrique de l'extrusion, mais à 360°.

Le bouton 🔄 de la barre d'outils ouvre le formulaire (esquisse, axe, opération, angle).
L'axe est soit une **ligne de l'esquisse** — la ligne de construction d'axe est proposée
par défaut — soit un **axe système X/Y/Z**. La propriété de la fonction permet de changer
d'esquisse, d'axe, d'angle et de sens sans la recréer, et de la supprimer.

**Le profil doit être d'UN SEUL CÔTÉ de son axe** : à 360°, un profil qui le franchit
s'auto-intersecte. Le refus est explicite, pas silencieux :

- `revolveSideCheck()` échantillonne les points, les **arcs (9 points)** et les **cercles
  (12 points)** — le centre seul ne suffit pas, un arc peut traverser l'axe en son milieu ;
- refus : « le profil est de part et d'autre de son axe — une révolution à 360°
  s'auto-intersecte. Décalez le profil d'un seul côté, ou changez d'axe. » ;
- profil sur l'axe (aire nulle) : « le profil est sur son axe — rien à révolutionner ».

**Trois pièges du noyau, trouvés et corrigés par exécution** (chacun donnait un résultat
faux ou une exception, jamais un message clair) :

1. `BRepPrimAPI_MakeRevol_2(S, Ax, angle)` **ignore l'angle dans cette build** : 90° et
   360° produisent exactement le même solide. Seule la surcharge à 4 arguments
   `MakeRevol_1(S, Ax, angle, copy)` applique réellement l'angle, **en radians**.
   Vérifié : 30° → arcs 2,62/7,85 · 90° → 7,85/23,56 · 180° → 15,71/47,12 · 360° →
   tour complet. Sans ce correctif, le champ « angle » aurait été un mensonge.
2. `MakeRevol` exige un **`gp_Ax1`**, pas un `gp_Ax2` (« Expected null or instance of
   gp_Ax1 »), et le bon constructeur est `gp_Ax1_2(P,D)` : `gp_Ax1_1()` ne prend aucun
   argument, `gp_Ax1_3/4` n'existent pas.
3. Cette build n'expose **ni `GC_MakeCirc`, ni `gp_Trsf`**. La pastille d'un profil
   circulaire se construit donc **dans le plan de l'esquisse**, avec la recette déjà
   éprouvée de `occDiskPrism` : deux demi-arcs sur une `gp_Circ_2`, puis
   `BRepBuilderAPI_MakeFace_15`.

`occW(sk, x, y)` renvoie un **tableau** et attend **deux coordonnées** : lui passer un
point `{x,y}` produisait `Cannot convert "undefined" to double`. Et l'axe en 3D est la
**différence** des deux extrémités normalisée, pas le second point.

**Bonus** : `skLoopTrace` peut renvoyer **deux fois la même boucle** (sens CW puis CCW) sur
un profil mixte ligne+arc — on ne révolutionne plus le même solide deux fois.

**Test `test_revolve.cjs`, 19/19 sur le noyau réel** (mesures géométriques : rayons lus
au `BRepAdaptor_Curve` — les points échantillonnés sous-estiment de 5 %) :

- tube Ø10 h20 → 4 faces, rayons 5/15, 4 génératrices de 20 ;
- profil adossé à l'axe → cylindre **plein** (3 faces, rayon 20) ;
- profil traversant l'axe, et cercle centré sur l'axe → **refusés** ;
- profil + trou → 8 faces, rayons 8/10/18/20, alésage de 4 droites de 8 ;
- profil circulaire → **tore** (r 15/25) ; profil en arc → **« C »** (cylindre r20 +
  demi-tore r8) ;
- **Poche** : gorge annulaire creusée dans un bloc → 6 → 10 faces, rayons 16/20 ;
- axe **système Z** dans un plan XZ → opérationnel ;
- angle 90° → 6 faces et génératrices au quart de tour (7,85 / 23,56) ;
- repli maillage `LatheGeometry` (angle respecté) ; noms « Révolution S 360° »,
  « Révolution (découpe) S 360° », « … 180° ».

Régression complète au vert : `selftest` 11/11, `test_cotes_paralleles`, `test_panneaux`,
`test_new_extrude`, `test_germes_apercu`, `test_revolve`, `audit_conge_geo`,
`audit_idempotence`, `test_cham_ref`, `test_through2`, `test_apercu_diff`.

Échecs **antérieurs et inchangés** : `test_tangarc`, `test_anchor_n` (harnais),
`test_perimetre_poche` (4 échecs constants, configuration dégénérée préexistante).
---

### `2026-09-30m`

**LES ARÊTES VISIBLES ÉTAIENT DES POLYGONES** — signalé par l'utilisateur sur la vue
d'une pièce en révolution : le contour se lisait comme un polygone, pas comme un cercle.

Cause : `occSharpEdges()` échantillonnait **12 points fixes** par arête, quel que soit le
rayon. Un cercle de R15 s'affichait donc en 12-gone, avec une **flèche de 0,128 mm au
milieu des côtés** — visible de loin sur la silhouette d'un révolution. Pire : une droite
recevait 13 points pour 2 utiles, et un cercle de R2 en recevait 13 pour aucun gain visible.

**Correction** — `occCurvePts(ad,u0,u1,tol)` : la polyligne d'affichage est échantillonnée
en adaptant le nombre de points à la courbe réelle, avec la garantie
**flèche ≤ `EDGE_TOL` = 0,02 mm** :

- **cercle / arc** : le nombre de segments se **calcule** — flèche d'une corde
  `R(1−cos(Δθ/2)) ≤ tol` ⇒ `Δθ = 2·acos(1−tol/R)`, `n = ⌈balayage/Δθ⌉`. 35 segments pour
  R5, 61 pour R15 ;
- **droite** : la subdivision s'arrête au premier test (déviation nulle) → **2 points** ;
- **B-splines et autres** : bisection adaptative sur l'écart courbe/corde, plafonnée à 600.

Une seule constante à réglée : `EDGE_TOL`, en tête de la fonction.

**Mesuré sur le noyau réel** (écart réel = distance de la courbe aux segments dessinés,
échantillonnage dense à 600 points — et non une relecture de la formule) :

| arête | avant | après | écart mesuré |
|---|---|---|---|
| cercle R5 | 12 pts | **37 pts** | 0,0428 → **0,0190 mm** |
| cercle R15 | 12 pts | **62 pts** | 0,1283 → **0,0199 mm** |
| droite | 13 pts | **2 pts** | 0 |

Soit **6× plus fin** sur la silhouette, et **zéro** sur les arêtes rectilignes.

**L'identité des arêtes est intacte** — c'est le point qui mattered. `mid` et `len`
continuent d'être calculés à l'échantillonnage fixe de 12 points : l'appariement des
congés, les références durables, les signatures de rejeu et l'enregistrement du congé
dépendent de ces deux nombres. Le test recalcule le jeu de clés `mid+len` indépendamment
et vérifie qu'il est **identique** (6 clés, 0 écart). Seul `pts` a changé, et `pts`
n'alimente que de l'affichage : le contour, le survol du mode congé exact, les germes.

**Coût** mesuré sur 30 cylindres (90 arêtes, 29 points max) : l'échantillonnage adaptatif
coûte ×2 l'échantillonnage minimal, soit ~5 ms par appel d'`occSharpEdges` (~42 ms au
total). Une première version purely itérative (bisection) coûtait ×13, soit ~29 ms :
d'où le calcul analytique du nombre de segments pour les cercles, qui donne en plus
**moins** de points que la bisection (37 au lieu de 65 pour R5).

Échecs **antérieurs et inchangés** : `test_tangarc`, `test_anchor_n` (harnais),
`test_perimetre_poche` (configuration dégénérée préexistante).

Au passage, `README.md` ne listait pas `75-revolve.js` dans « Travailler sur le code » :
corrigé.

### `2026-09-30n`

temps de régénération divisé (« rafraîchissement dur » navigateur : **5305 → 1153 ms**,
Ctrl+F5 ; banc noyau réel, `Pièce 3.json` 14 fonctions, même pièce avant/après :
**4277 → 1000 ms au froid, 3931 → 727 ms à chaud**) — causes mesurées au profileur,
quatre correctifs :

1. **rejeu imbriqué inutile (−1857 ms)** : `extrudeSpan` d'une coupe « à travers tout »
   sans solide à mesurer renvoyait l'étendue de repli ±5000 mm → `resolveSketchHost`
   corrompait l'origine de l'esquisse hôte (21 → 5021 → 10021 → 15021 en 3 tours de la
   boucle d'ancrage) → signature d'esquisse faussée → second rejeu complet qui « réparait »
   le dégât (solide final identique dans les deux passes). Correctif : `extrudeSpan` marque
   ce repli `unres:true` et `resolveSketchHost` **ne déplace rien** tant que l'étendue n'est
   pas mesurable (le fichier garde l'origine juste ; la passe suivante, corps présents,
   la recalculera si elle est périmée). C'était précisément le cas du bouton *Hard* qui
   vide `bodies` avant le rejeu.
2. **points de contrôle jamais trouvés (0 hit / 24)** : `OCC_CK_MAX=8` évince les
   préfixes précoces sur une timeline de 13-14 fonctions — les 6 appels `occFinalShape(upto)`
   des projections rejouaient chacun toute la chaîne (4 × ~300 ms par passe). Correctifs :
   `occCkMax()` adaptatif = `min(48, fonctions+2)` (toute la timeline tient en mémoire,
   plafond fixé pour les grandes pièces) ; clé de checkpoint **sans marqueur `upto`** —
   ALL et UP9 parcourent les mêmes préfixes cumulatifs, mais l'ancienne clé `ALL|…`/`UP9|…`
   rendait les points de contrôle du rejeu complet **inaccessibles** aux projections ;
   déduplication dans `occCkPut` (on garde l'existant au lieu d'empiler des doublons qui
   gonflaient la file et évacuaient les vraies entrées — motif alterné 0/2 puis 2/2 avant
   correctif) ; enfin chaque **congé exact** a son propre checkpoint (+ ses avertissements
   mémorisés) : les 9 congés de la pièce ne sont plus rejoués (~30 ms/pièce évités à chaque
   rejeu de projection).
3. **second rejeu fondé sur une fausse alerte** : `updateAllProjections` ne déplace que
   des entités de **construction** (hors profil), or `skSig`/signature solide mélangeait
   tous les points → toute convergence de projection invalidait la signature. Correctifs :
   `skSig` ne signe plus que le **profil** (entités `construction`/`ref` et leurs points
   exclus — l'extraction de profil les exclut déjà), et `projRefreshRerun` ne rejoue que
   si les **entrées du solide** ont réellement changé (`featSig` avant/après) ; sinon :
   `autosave()` + redessin de l'esquisse ouverte, sans rejeu.

**Test** : banc `bench_final.cjs` (harnais vm + noyau OCCT réel en Node, `Pièce 3.json`,
même pièce avant/après) — 14 → 7 appels `occFinalShape` (la double passe imbriquée a
disparu), hits cache 0/24 → 34/47, appels de projection `upto=9` : 313 → 21 ms, corps
strictement identiques (3 904 tris + 2 outils), origines de tous les hôtes inchangées,
zéro erreur `occShapeOfExtrude`, moteur « exact OCCT » ; auto-tests `runSelfTests()`
**14/14 OK**, `build.js --check` OK.

### `2026-09-30o`

le miroir ne bouffait plus le GPU pour rien, et un congé.show en rouge ne l'est plus en silence -
six défauts trouvés enarrant le plan miroir, puis le ciblage des arêtes de congé.

1. **un rendu de la scène entière À CHAQUE image** : `animate()` repassait la scène dans la
   cible 1024² (pleine résolution, ombres comprises) même à l'arrêt, alors que le reflet est
   quasi statique - soit le double du coût GPU en continu, pour une image qui ne changeait pas.
   Correctif : le reflet n'est recalculé que s'il est **périmé** - vue déplacée (position,
   quaternion, fov, aspect, zoom comparés image par image) ou scène reconstruite
   (`refreshMirror` marque le sol, le halo et la visibilité). Le nombre de passes est
   mesurable : harnais, `setRenderTarget` compté.
2. **réflexion déformée** : quatre défauts cumulés, tous visibles pendant l'orbite.
   (a) `mirrorTexMat` multipliait par `floorMesh.matrixWorld` **avant** que le moteur ne la
   recalcule - le sol venait d'être déplacé par `refreshMirror`, la réflexion lagged d'une
   image (décalage fantôme) ; `floorMesh.updateMatrixWorld()` est désormais forcé avant usage.
   (b) la cible de rendu était un **carré** alors que la caméra miroir recopiait la projection
   du canvas (aspect ≠ 1) : deux défauts symétriques. Forcer `aspect = 1` et garder la cible
   carrée fait tomber les bords de l'écran **hors de la texture**, et le `ClampToEdge` de
   three y étire les pixels du bord en traits déformés (glitches de bord). La cible suit
   désormais l'aspect du canvas (1024 de large max, recalculée au redimensionnement) et
   recopiait la projection - la seule combinaison qui garde les UV dans [0,1] partout.
   (c) le shader divisait `vUv.xy` par `max(vUv.w, 1e-4)` : pour un point **derrière** la
   caméra miroir (`w = 0`) cela produisait des UV aberrants - traînées déformées qui bougeaient
   en continu avec la vue. Ces fragments sont maintenant peints en teinte de sol (pas de
   division).
   (d) Rendu principal « à la demande » essayé puis **écarté** : le survol des faces, la
   sélection et le glisser des points de contrôle changent l'image sans toucher la caméra -
   il aurait fallu invalider partout, donc risqué de figer l'affichage. Le GPU fait donc
   toujours 1 rendu de scène par image (c'est une visionneuse), mais plus 1 passe de reflet
   par image.
3. **le rayon d'un congé ne faisait pas partie de sa signature** : `featSig` ne décrivait que la
   *position* des arêtes. Conséquence découverte en testant Pièce 2 : changer le rayon d'un congé
   laissait la clé inchangée, et le point de contrôle (nouveau, cf. `2026-09-30n`) réappliquait le
   **solide au rayon précédent** - le congé nouveau n'apparaissait pas, sans un seul avertissement.
   `featSig` décrit maintenant rayon, longueur résolue et ancre de ciblage de chaque arête.
4. **l'ancre d'esquisse pouvait viser une AUTRE arête que celle cliquée** - le pire des défauts,
   trouvé par le signalement « l'arête sélectionnée n'est pas celle retenue en finalité ». Sur
   Pièce 2, le clic portait sur l'arête de **20 mm** en (65 ; 0 ; 19,58) (`pos0`, distance 0),
   mais l'ancre `e13` du croquis renvoyait l'arête de **28,9 mm** en (52,5 ; -10 ; 26,8), à
   **17,6 mm** : l'appli arrondissait donc la mauvaise arête, en silence. Conséquence pratique :
   le R16 demandé était **refusé à tort** (impossible sur 28,9 mm) alors qu'il **passe** sur
   l'arête de 20 mm réellement sélectionnée. Correctif : l'ancre reste prioritaire (c'est elle
   qui suit les éditions du croquis), mais un candidat d'ancre situé à plus de 2 mm du point
   cliqué n'est plus suivi si une arête existe encore à la place voulue - et le journal le dit
   (`ancre d'esquisse divergente ignorée ... arête sélectionnée rétablie`, une seule fois par
   divergence). On ne se fie pas à `se.len` pour ce contrôle : ce champ est réécrit à chaque
   réappariement, il avait donc hérité de la longueur de la mauvaise arête.
5. **un refus de congé ne disait rien d'utile** : la fonction passait en rouge, sans application,
   avec pour seule information `rayon trop grand ou arêtes trop courtes ?`. Le chemin d'échec
   cherche maintenant (5 essais, cas rare) le **plus grand rayon qui passe** et le propose,
   vérifié : `R16 impossible sur 1 arête de 28,9 mm - ESSAYEZ R4,8 (vérifié)`. Le conseil est
   porté par la fonction (`_err`), affiché en rouge dans ses propriétés, et effacé dès que le
   rayon courant passe.
6. **le drapeau `_err` ne s'effaçait pas** quand le rayon redevenait valide après un échec (cas
   des rejeux à checkpoints) : le conseil restait affiché sur une fonction désormais appliquée.

**Test** : `diag_mirror2.cjs` (miroir) - 30 images vue immobile : **0** passe de reflet (1 par
image avant), 30 images en orbite : 1 passe par image (nécessaire), reconstruction : 1 passe puis
0, miroir éteint : 0, rallumage : 1 ; aucune exception. `diag_anchor.cjs` (Pièce 2) - arête
retenue = arête cliquée (20 mm, distance au clic **0 mm**, l'ancre divergente est ignorée et
signalée) et **R16 s'applique** ; le conseil d'échec disparaît bien quand le rayon passe.
`diag_fillet2.cjs` - changement de rayon appliqué en rejeu **soft** avec cache conservé.
Régression complète `bench_final.cjs` (Pièce 3) : **848/640 ms** (914/689 avant cette série,
même budget), 7 appels `occFinalShape`, hits 34/47, corps **inchangé** (3 904 tris + 2 outils),
auto-tests **14/14 OK**, `build.js --check` OK.

### `2026-09-30p`

Correctifs d'affichage et de robustesse du mode **Congé/Chanfrein** (retours navigateur) :

1. **traits coupés en mode Congé/Chanfrein** : l'overlay avait été regroupé en une seule
   `LineSegments` (1 draw-call) mais n'émettait que `pts[0]→pts[1]` de chaque arête — or
   `occSharpEdges` renvoie une **polyligne de 13 points** : chaque arête n'apparaissait que par
   fragments (1/12e de sa longueur) et les arcs étaient amputés. Correctif : tous les segments
   de la polyligne sont émis avec une table `segEdge` seg→arête ; le clic (`exactPick`)
   retombe sur la bonne arête via l'index rendu (`index/2`, pas de 0,2,4…), et `paintExact`
   colore par ARÊTE depuis cette table.
2. **les arêtes du versant caché se dessinaient par-dessus la pièce** : l'overlay était en
   `depthTest:false` — en bleu sur bleu cela ne se voyait pas, en noir c'était criant
   (« les arêtes invisibles sont visibles en noir »). Les deux overlays de congé
   (`buildExactOverlay`, `buildFilletOverlay`) sont passés en `depthTest:true` : seules les
   arêtes visibles de face restent dessinées. Seules les lignes : les 7 autres
   `depthTest:false` (cotes, mesures, points, surbrillance de face) sont inchangés.
3. **le script plantait au chargement — plus rien dans l'arborescence ni de modèle** : des
   lignes orphelines de `paintFilletEdges` étaient restées en top-level du fichier source →
   `ReferenceError` à l'évaluation du livrable, donc aucune initialisation. Supprimées.
4. **l'aperçu rouge du congé ne s'affichait plus** : la création du maillage avait été retirée
   alors que `xPrevBody` référençait encore `mesh` → `ReferenceError` intercepté au bout du
   `try`, repli silencieux (pièce transparente sans patch). Bloc `mat`/`mesh` restauré.
5. **le calcul de distance au clic de l'ancre avait disparu** (`bd` restait à `1e9`) : la branche
   « ancre saine » était devenue morte et le journal affichait `pointait 1000000000 mm du clic`.
   La boucle `dRef` d'origine est restaurée : message réel (`17,56 mm`), ancre saine reprise.
6. **texte du panneau obsolète** : « Cliquez des arêtes bleues en 3D » → « Cliquez une arête en
   3D (noir · jaune au survol) », en cohérence avec la palette (défaut noir, survol jaune
   `0xffd60a`, arête retenue rouge `0xff453a`).

**Test** : `diag_overlay.cjs` (nouveau) - 317 segments = sommets des **76** polylignes complètes
(attendus 317), table seg→arête croissante couvrant 76 arêtes, tous les sommets à `(0,0,0)`,
survol de l'arête 3 = jaune sur ses segments uniquement, remis à noir ensuite.
`diag_anchor.cjs` (Pièce 2) - arête cliquée conservée (20 mm, distance **0 mm**), distance
réelle de l'ancre **17,56 mm** dans le message, R5 passe, R16 refuse.
`diag_mirror2.cjs` - 0/30/1/0/1 comme en 30o. `diag_err.cjs` - refus chaud 62 ms, `_err` effacé
au rayon valide. `bench_final.cjs` (Pièce 3) : **692/498 ms** (848/640 ms avant cette série),
auto-tests **14/14 OK**, `build.js --check` OK.
---

### `2026-09-30q`

**AUCUN CHANGEMENT DE COMPORTEMENT** — un commentaire de `80-conges-chanfreins.js`
était devenu faux, et un livrable qui diffère de son snapshot doit porter sa version.

La 30p-1 corrigeait l'overlay du mode congé exact (une seule `LineSegments` qui
n'émettait que `pts[0]→pts[1]` de chaque arête, donc 1/12e de sa longueur) et corrigeait
ça en écrivant : « chaque arête est une POLYLIGNE (**13 points échantillonnés**) ». C'était
vrai avant la 30m, plus après : l'affinage a rendu le nombre de points **variable** (2
pour une droite, ~40-60 pour un cercle).

Le code, lui, était déjà correct et générique — `buildExactOverlay` parcourt
`for(k=0;k+1<p.length;k++)` et `paintExact` colore par la table `segEdge`, donc aucune
longueur n'est supposée. Seule la phrase mentait, et c'est exactement le genre de
raison pour laquelle on repasse un an plus tard. Commentaire rectifié, rien d'autre.

Vérifié que les deux correctifs se cumulent : l'overlay des arêtes en mode congé exact
émet bien **tous** les segments de polylignes désormais lisses (30p) au lieu de fragments
tronqués sur des 12-gones (avant 30m).

Régression : 13/13 vertes, dont `test_aretes_affinage` (écart de polyligne ≤ 0,02 mm,
identité `mid+len` inchangée).
---

### `2026-09-30r`

**ANNULER / RÉTABLIR AU NIVEAU DU DOCUMENT + SUPPRESSION MULTIPLE AU CLAVIER** —
première des quatre fonctions 3D demandées (déplacement de face, suppression de face,
dépouille). Celle-ci d'abord parce que les trois autres créent et suppriment des
fonctions : sans elle, chaque nouvelle opération serait irréversible.

**Le trou de départ** : l'undo existant (`skUndoStack`) ne couvre QUE le tracé d'une
esquisse. Créer une extrusion, une révolution, un congé, répéter, supprimer une
fonction : rien à annuler. Les quatre boutons 🗑 de l'arborescence n'appelaient même
pas `confirm()` (deux sur quatre).

**L'instantané** est le JSON du document — exactement celui de la sauvegarde. Ce n'est
pas un choix esthétique mais une propriété vérifiée : `test_undo_aller_retour.cjs`
prouve qu'un aller-retour `JSON.parse(JSON.stringify(doc))` est **bit à bit identique**
et rejoue **le même solide** (10 faces / 27 arêtes avant et après), avec l'hôte
d'esquisse (antériorité), les références entre fonctions (`xfillet.target`,
`repeat.base`), la visibilité, les contraintes et les cotes. Aucune valeur non
sérialisable (`undefined`/`NaN`) dans le document.

Deux enseignements de ce test, tous deux évitables seulement parce qu'on les a faits :

- **`rebuild()` MUTE le document** : `migrateSketch` ajoute le point d'origine d'une
  esquisse. Une première version de l'instantané, prise avant le premier rebuild,
  différait donc du document restauré. Sans conséquence (la migration est idempotente et
  refaite à chaque rebuild), mais l'instantané doit être pris sur un document déjà
  normalisé — c'est le cas puisqu'on empile juste avant de muter ;
- le document de test a d'abord été comparé à lui-même au mauvais moment, et sa
  première version ne construisait aucun solide (l'extrusion était masquée, la
  révolution avait un axe Z perpendiculaire à son plan). Le message du modèle
  — « axe Z : il ne passe pas par le plan de l'esquisse » — a confirmé d'ailleurs que
  le refus de la 30l fonctionne sur les deux voies (exact et maillage).

**Ce qui est couvert** : création (extrusion, révolution, congé/chanfrein exact,
répétition), suppression, et toute création future — le crochet est dans
`addFeature()`, point d'insertion **unique**, donc rien ne peut l'oublier. Pile de 40
étapes, un instantané identique au précédent est ignoré (rien n'empile « rien a
changé »), `Ctrl+Z` / `Ctrl+Y`, et une ligne **↩ Annuler / ↪ Rétablir** dans le panneau
ÉTAT qui affiche le nombre d'étapes et l'étiquette de la prochaine.

**Suppr + Ctrl+clic** (`test_undo_document.cjs`, 15/15) :

- `Ctrl+clic` multi-sélectionne les fonctions. Il **garde** son sens d'origine quand
  une répétition est sélectionnée ou que le mode répétition est ouvert (choix des
  sources) : les deux gestes cohabitent, la répétition reste accessible par son bouton
  de barre d'outils ;
- `Suppr` supprime le lot, **avec confirmation** nommant chaque fonction ;
- **cascade** : un congé dont la cible est supprimée, ou une répétition dont une source
  disparaît, est emporté — sinon il resterait suspendu dans le vide. La dépendance est
  calculée en cascade (jusqu'à 4 tours) ;
- les esquisses posées sur une face de la fonction supprimée ne sont **pas** détruites
  (trop violent) : l'avertissement dit qu'elles restent sans hôte ;
- `Échap` vide le lot, `Ctrl+Z` annule la suppression et restaure le solide à l'identique
  (12 faces) ;
- les quatre boutons 🗑 de l'arborescence passent maintenant par le même chemin :
  même libellé, même cascade, et surtout annulables.

Un raccourci au clavier qui supprime est destructif par nature : d'où la confirmation
n'aussitôt que Ctrl+Z juste après. L'ensemble est couvert par 15 assertions de
comportement (états, solides, piles, dépendances, refus), pas par une simple présence
de symboles.

Régression : **15/15 suites vertes** (les 13 précédentes + les 2 nouvelles).
---

### `2026-09-30s`

**SÉLECTION DANS L'ARBORESCENCE : TROIS CORRECTIFS DEMANDÉS PAR L'UTILISATEUR** —
retour navigateur, sur la 30r.

**1. `Ctrl+clic` ouvrait le panneau Répétition.** Deux chemins y.aboutissaient : sur la
ligne d'une répétition (`if(!repMode)enterRepMode()`), et dans `node()` dès qu'une
répétition était la sélection courante. Résultat : vouloir choisir deux fonctions à
supprimer faisait apparaître la Répétition, qui captait le clic et **empêchait de les
supprimer**. Le geste est désormais univoque :

- `Ctrl+clic` = **uniquement** ajouter/retirer du lot à supprimer ;
- le choix des sources d'une répétition passe dans **son panneau**, sous forme de
  **cases à cocher** listant les fonctions répétables — visible, sans modificateur
  caché, et l'on voit d'un coup d'œil ce qui est source et ce qui ne l'est pas ;
- `repToggleFeat` et `repToggleBase`, devenus sans appel, ont été **supprimés** plutôt
  que laissés en place ;
- le bouton 🔁 de la barre d'outils reste le point d'entrée du mode répétition ;
- la répétition est maintenant **dépliée automatiquement quand elle est sélectionnée**
  (avant : il fallait viser le triangle), et le message de Face/État ne parle plus de
  Ctrl+clic.

**2. Sélection fantôme.** Un clic simple sur une répétition — ou sur une de ses
instances — laissait le lot précédent allumé : ces deux lignes ont leur propre
gestionnaire, qui ne vidait pas `treeSel`. Les deux le font maintenant, comme le clic
simple ordinaire. `treeSel` n'est jamais modifié ailleurs que par `treeSelToggle` et
ces affectations explicites.

**3. Quelles fonctions alimentent cette répétition ?** Demandé explicitement. Quand une
répétition est sélectionnée, ses **sources portent un repère ◀** dans l'arbre, et la
ligne de la répétition affiche un badge **◀ n** (n = nombre de sources, en orange si 0 —
une répétition sans source ne produit rien, autant le voir). Les repères disparaissent
dès qu'une autre fonction est sélectionnée. Styles injectés depuis le code
(`cssRepSrc`), la coque HTML n'étant jamais éditée à la main.

**Défaut trouvé au passage** : `repCanFeature()` acceptait les **instances** de
répétition (une instance est une extrusion). La liste à cocher proposait donc de
répéter une instance — des clones empilés sans sens. Elle exclut maintenant les
instances et les répétitions.

`featIcon` était une `const` locale à `renderTree()`, inutilisable depuis le panneau ;
elle est devenue `featIconOf()`, globale, la locale délègue — sans duplication.

**Test `test_arbre_selection.cjs`, 17/17.** Il ne teste pas une réimplémentation : il
pilote les **vrais gestionnaires de clic** posés par `renderTree()` (lisibles dans le
DOM du harnais) avec de faux événements, et lit le HTML réellement rendu.

Trois enseignements de ce test, sur les limitations du harnais :

- le DOM minimal **n'efface pas `children`** quand `innerHTML=''` : une fen^tre
  calculée naïvement mélange plusieurs rendus (les gestionnaires de clic rejouent
  `renderTree()` eux-mêmes). On cherche donc la **dernière** occurrence, et les
  comptages sont des « au moins un » ;
- il ne construit pas `innerHTML` à partir des nœuds : pour compter les cases à cocher
  du panneau, on parcourt les nœuds ;
- une infobulle (`title`) contenant un nom de fonction rend la recherche par nom
  ambiguë : on cible le `<span class="nm">`, c'est-à-dire ce que l'utilisateur voit.

Régression : **16/16 suites vertes** (les 15 précédentes + celle-ci).
---

### `2026-09-30t`

**ÉDITION D'UNE RÉPÉTITION : la même liste à cocher qu'à la création.**

La 30s avait déplacé le choix des sources dans le panneau du mode répétition —
mais **seulement à la création**. Éditer une répétition déjà construite}
laissait l'ancien texte : « Fonctions répétées : … » et un bouton
**➕ Ajouter / retirer par Ctrl+clic** qui n'affichait qu'un message d'aide, sans
rien de plus. Deux gestes pour la même chose, et le second ne fonctionnait plus.

**Correction** — la liste à cocher est extraite en `repSourceList(base, onChange)`,
**partagée** par les deux panneaux :

- **création** : cases décochées, on choisit ce qu'on veut répéter ;
- **édition** : cases **déjà cochées sur les sources actuelles** — on ajoute ou on
  retire, et la répétition se met à jour aussitôt (instances régénérées, modèle
  rejoué).

Une seule fonction pour les deux : les panneaux ne peuvent plus diverger, ce qui était
précisément le défaut. Le changement de source est **annulable** (`docPushUndo`), comme
toute modification du document depuis la 30r. Les deux boutons d'aide et les deux
messages de la zone d'état qui parlaient encore de `Ctrl+clic` ont disparu.

Les cases portent la classe `repsrcchk` : le panneau affiche aussi une case « Visible »,
et les distinguer par le seul `type` rendait le comptage ambigu (constaté en écrivant le
test — 3 cases pour 2 fonctions).

**Test `test_arbre_selection.cjs`, 23/23** (6 nouvelles assertions) : le panneau
d'édition propose la même liste, les sources actuelles sont cochées, décocher retire
la source et régénère les instances (1 → 0), le re-rendu reflète la nouvelle liste, et
aucun bouton ne mentionne `Ctrl+clic` — ce qui est vérifié en parcourant les
boutons réellement créés, pas en cherchant une chaîne dans le source.

Régression : **16/16 suites vertes**.
---

### `2026-09-30u`

**LE MIROIR NE SYMÉTRISAIT PAS LES CONGÉS** — trois défauts, trouvés en rejouant le
fichier réel de l'utilisateur (`Sans titre.minifusion.json`) sur le noyau exact.

**1. Le clone d'un congé n'était pas le miroir de la sélection.** Dans `repCloneFeat`,
seul `pos` était transformé : `pos0` (la position au moment du clic) était recopié tel
quel, et `anchor` mis à `null`. Or c'est **`pos0` qui sert de référence à l'appariement
des arêtes** au rejeu. Conséquence mesurée : chaque instance cherchait son arête de 78 à
**100 mm** du mauvais côté de la pièce, s'accrochait à l'arête d'origine, et le congé
se terminait en `_err` — c'étaient les triangles ⚠.

**Correction** : `pos` **et** `pos0` sont transformés, et `_div` (divergence héritée de la
source) est effacé. Après régénération, l'écart source↔instance est de **0** sur les
quatre instances, et les **2 erreurs du fichier sont tombées à 0**.

**2. Les instances sont PERSISTÉES : le correctif ne suffisait pas.** Un clone écrit par
une version buguée restait dans le fichier, et `repGenChildren` n'était appelé qu'aux
éditions — le triangle revenait donc à chaque ouverture, code corrigé ou non. Les clones
d'une répétition étant **dérivés**, ils sont désormais régénérés à la **chaque
chargement**. Mesuré sur le fichier réel : au simple chargement, 2 erreurs → **0** et
symétrie exacte.

**3. Un ⚠ muet ne sert à rien.** Le panneau d'un congé partiel affiche maintenant
`⚠ 6/8 arêtes retrouvées — 2 perdue(s)`, la **position** des arêtes introuvables, et la
cause. Deux causes distinctes, qu'il ne faut pas confondre :

- `_err` = OCCT a refusé (arête trop courte, faces déjà consommées) ;
- sinon = **arête introuvable** : la pièce a bougé depuis la sélection.

Le message précédent (ajouté à la 30p) affirmait la première cause dans tous les cas :
c'était faux, et il fallait le dire. `_m.m` compte les arêtes **retrouvées**, pas celles
qui ont « pris » le congé — d'où la correction, et le nouveau `xf._miss` (positions des
arêtes perdues) qui permet de les nommer.

**Ce qui reste, et pourquoi.** Sur le fichier réel, un seul congé est partiel (6/8) et
son clone hérite du même 6/8. Les deux arêtes perdues ne sont **pas** les arcs : ce sont
les deux **lignes de 60 mm** (les rims haut et bas, près de (50 ; 0 ; 45) et (50 ; 0 ; 5)).
Les congés R10 et R6 appliqués entre-temps ont **découpé ces rims** : une arête de 60 mm
n'existe plus. Ce n'est donc pas un défaut d'appariement mais une conséquence de
l'historique de la pièce — la sélection est périmée, et c'est re-sélectionnable.

**Test `test_fichier_reel.cjs`** : rejoue le fichier de l'utilisateur sur le noyau
exact et mesure congruences, triangles, erreurs et écart de symétrie — avant/après
changements geometry, sur le vrai modèle plutôt que sur un cas synthétique. Il note au
passage l'arrêt du script sur `camera.up` (limite du stub THREE, sans effet : le document
est chargé avant le cadrage de vue).

Régression : **16/16 suites vertes**.
---

### `2026-09-30v`

**LE TRIANGLE DU CONGÉ PARTAIT D'UN FILTRE D'APPARIEMENT, PAS D'UNE PIÈCE MODIFIÉE.**
Sur le fichier de l'utilisateur, un congé de 8 arêtes en retrouvait 6 — et son clone
miroir héritait du même 6/8. La 30u concluait « les rims de 60 mm n'existent plus,
re-sélectionne ». **C'était faux** : les arêtes sont bien là, c'est le code qui
refusait de les voir.

**La cause.** `xAnchorMatch` filtre les arêtes à ancre de point sur un seul critère :
« verticale » (`if(Math.max(du,dv)>0.1) return;` — *pas verticale : pas notre coin*).
C'est le cas des arêtes de chant d'un corps. Mais les deux arêtes perdues sont les
**lignes de 60 mm** du bord d'une découpe : elles sont **horizontales** et leur point
d'ancre est le milieu de la ligne. Rejetées à la passe 1, elles ne pouvaient plus être
reprises ensuite : la passe 2 saute explicitement les arêtes à ancre point
(`else if(se.anchor && se.anchor.t==='p'){ return; }`), et la passe 3 ne les retrouvait
que par signature de groupe. Résultat : `arête introuvable` sur une arête qui existait,
et ⚠ dès la **création** du congé — ce qui est exactement ce que l'utilisateur voyait.

**Le correctif** : quand aucune verticale ne convient, on retient la meilleure arête
**quelconque** passant à moins de 5 mm du point d'ancre, en conservant le tri par hauteur
(`dzPref`) et l'unicité de la sélection (une sélection = une arête). Le repli ne sert
que si la passe verticale n'a rien donné : les ancrages « coin » existants ne changent
pas de comportement.

**Mesuré sur le fichier réel** : 6/8 → **8/8**, et le clone miroir **8/8** également.
Le solid exact reste stable : **74 faces, 172 arêtes**, maillage **2 316 triangles** sans
erreur. Le test rejoue aussi des sous-ensembles (4 lignes, 2 lignes longues, 4 arcs,
2 verticales) : tous à 0 perdue. **0 triangle, 0 erreur** au total.

Rappel de méthode : le `test_fichier_reel.cjs` a été étendu pour (a) mesurer le maillage
OCCT séparément de THREE, (b) rejouer la timeline en excluant le congé, (c) rejouer des
variantes de sélection. C'est la variante (c) qui a désigné le sous-ensemble sain et
remis en cause le diagnostic de la 30u. Mesurer avant de conclure.

Régression : **16/16 suites vertes**.
---

### `2026-09-30w`

**« F5 N'AFFICHE RIEN, IL FAUT CLIQUER RECALCULER. »**

Ce n'était ni la géométrie, ni le maillage, ni le cache navigateur : c'était **notre
propre cache d'affichage**, en IndexedDB.

**Le mécanisme.** Au démarrage (`99-init.js`), le document est rechargé **sans**
reconstruction — `deserialise(auto,{rebuild:false})` — puis `restoreViewCache()` applique un
rendu figé enregistré à la volée, et **ne reconstruit que si ce cache manque** :
`if(ok){log(…)}else{rebuild();}`. Un F5 n'affiche donc que l'image mise en cache, jamais le
résultat d'un calcul. Ouvrir un fichier depuis le disque, lui, reconstruit — d'où la
différence entre « ouvrir » et « F5 ».

**Le défaut.** La validité du cache portait sur le **hash du document seul**, jamais sur la
version du code. Le document n'ayant pas bougé, le hash collait : un rendu produit par une
version **buguée** restait restauré indéfiniment, même après le correctif. Le cache se
réécrivait ensuite avec sa propre sortie, se validait à nouveau, et la boucle ne se
cassait jamais. C'est exactement le symptôme observé — et `Ctrl+F5` ne pouvait rien y
faire : le cache est dans IndexedDB, pas dans le cache du navigateur.

**Le correctif.** `APP_VER` est désormais écrit dans l'entrée `lastGood` et exigé à la
restauration : `if(c.ver!==APP_VER)return false;`. Toute évolution du moteur de géométrie
invalide le cache, donc le premier F5 suivant une mise à jour reconstruit réellement la
pièce. Le cache reste un simple accélérateur : il ne peut plus mentir sur l'état du code.

**Suite de la 30v** (le triangle du congé) : 6/8 → 8/8, clone miroir 8/8, 0 triangle,
0 erreur sur le fichier réel.

Régression : **16/16 suites vertes**.
---

### `2026-09-30x`

**DÉPLACEMENT D'UNE FACE (push/pull) — première fonction 3D de la série.**
Bouton 📐 dans la barre d'outils : on clique une face du solide exact, elle est déplacée de
5 mm, et la distance se règle ensuite dans ses propriétés. Une distance **positive** fait
avancer la face, une distance **négative** la fait rentrer.

**La primitive du noyau a été écartée, et c'est mesuré.** OCCT expose bien
`BRepFeat_MakeDPrism` (avec `PerformThruAll`), la classe « évidente » pour un push/pull. Sa
signature Web est sans ambiguïté seulement par tâtonnement — le binding embind ne la publie
pas — et une fois la signature trouvée (`shape, face, faceRéf, int, tol, longueur`),
l'opération renvoie `IsDone() = true` sur un **solide vide** (0 face). Une primitive qui
annonce avoir réussi et ne produit rien est pire qu'une primitive absente : elle fait
disparaître la pièce en silence.

**L'algorithme retenu utilise deux opérations que le moteur maîtrise déjà et qui sont
vérifiées** : extruder la face le long de sa normale **sortante** (`BRepPrimAPI_MakePrism_1`),
puis FUSIONNER si la face avance, SOUSTRAIRE si elle rentre. Même principe que l'addition de
corps. Mesuré sur une boîte 100x60x40 : +10 sur +X donne 110x60x40, -10 donne 90x60x40,
+15 sur +Y donne 100x75x40.

**La normale doit être SORTANTE, et la normale géométrique ne suffit pas.** Sur une boîte,
les deux faces opposées ont la MÊME normale géométrique : c'est l'orientation de la face
qui dit laquelle pointe dehors. `Orientation_1()` renvoyant un objet enum, la comparaison
est une identité stricte. Vérifié sur les 6 faces : 6/6 pointent vers l'extérieur.

**Un déplacement doit laisser UN corps — comme une addition.** Deux défauts trouvés en
mesurant, et corrigés :

- extruder toujours vers l'extérieur ne retirait **aucune matière** pour une distance
  négative (le prisme était dans le vide, le solide restait inchangé) : le prisme part
  désormais du côté de la distance ;
- la fusion conservait les faces coplanaires du prisme et de la pièce d'origine — **10
  faces au lieu de 6** sur une simple boîte, soit des coutures, des arêtes parasites et
  l'impression de plusieurs morceaux. `occUnify` (déjà utilisé par le chemin « add » des
  extrusions) recolle les faces coplanaires. Résultat mesuré : **1 coque, 1 solide,
  6 faces** dans les deux sens.

**La face est mémorisée par sa géométrie, pas par son numéro.** Centre, dimensions et
normale sortante : le numéro d'une face change dès qu'une opération en ajoute une autre,
alors que la face visée reste la même. Le test rejoue le document **sérialisé** pour le
prouver — c'est le seul contrôle qui vaille, un numéro de face ne survivrait pas.

**Si la face a disparu**, la fonction le dit (`face introuvable près de (...) — la pièce a
changé`) et **laisse le solide intact** : on préfère un message à une pièce en moins.

**Test `test_xmove.cjs`** : parcours complet sur le moteur de l'application (pas une sonde
isolée) — extrusion, repérage de la face, déplacement dans les deux sens, rechargement du
document, face introuvable ; avec code de sortie bloquant. Régression : **18/18 vertes**.
---

### `2026-09-30y`

**LE BANDEAU ÉTAIT ALIGNÉ À PLAT : QUATRE BOUTONS SUR QUINZE ÉTAIENT DES EXPORTS.**
Sur une pièce, on passe son temps à créer, modifier et occasionalement exporter —
le bandeau le monetrait tout de même à largeur égale, en hilant les trois premiers
boutons d'écran.

Les **actions primaires restent en direct** (Esquisse, Extrusion, Révolution, et le
raccourci `E` inchangé). Tout le reste est regroupé dans un menu déroulant **par type** :

- **🔧 Modifier le solide** — *Arêtes* (Congé, Chanfrein) / *Faces* (Déplacer une face) /
  *Ensembles* (Répétition) ; la dépouille et la suppression de face viendront
  s'y ranger sans élargir la barre ;
- **💾 Fichier** — *Importer* (une seule entrée) puis *Exporter* (STEP géométrie exacte,
  STL et OBJ maillage), avec la distinction exacte/maillage écrite dans le libellé ;
- **📁 Projet** — Nouveau, Sauvegarder, Sauvegarder sous, Ouvrir.

**Les identifiants des boutons sont conservés à l'identique.** La réorganisation déplace
les boutons EXISTANTS dans leur groupe au lieu d'en créer des doublons : leurs
gestionnaires déjà branchés dans `95-toolbar.js` et le raccourci clavier continuent de
cible exactement le même élément. Un seul menu reste ouvert à la fois, fermeture au clic
dehors et à Échap.

**Où est écrit ce code, et pourquoi.** La coque HTML étant générée et jamais éditée à la
main, tout est fait depuis les sources : le bandeau est réorganisé **et** son style est
injecté par `96-bandeau-groupes.js`, sur le modèle du bouton Révolution. Une première
tentative avait réécrit la coquille HTML à la main — annulée, `fusion_mvp.html` revenu
intact par `git checkout`. Idempotent : si le regroupement a déjà été fait, le module ne
touche à rien.

**Test `test_bandeau.cjs`** : la réorganisation est du code d'interface, et le harnais a un
DOM trop grossier pour la voir (`classList.contains()` y renvoie toujours `false`,
`querySelectorAll()` y renvoie `[]`). Le test exécute donc le module sur un DOM minimal
qui, lui, sait répondre, et vérifie qu'aucun bouton n'est perdu, que chaque fonction est
bien dans son menu de TYPE, que les trois actions primaires restent dans la barre, et
qu'un seul menu s'ouvre à la fois. **Deux bugs réels ont été trouvés ainsi** : les
boutons étaient retirés du menu que l'on venait de construire, et le groupe était indexé
sur l'icône au lieu de l'identifiant (`$('◔')` au lieu de `$('btnFillet')`).

Régression : **19/19 vertes**.
---

### `2026-09-30z`

**LA 30y AVAIT VIDÉ LA VUE 3D — ET RIEN NE L'AVAIT VU.**

Erreur console : `Uncaught NotFoundError: Failed to execute 'insertBefore' on 'Node':
the node before which the new node is to be inserted is not a child of this node.`
au chargement, donc **ni modèle dans la vue 3D, ni arbre des fonctions**.

**La cause, c'est moi.** Le regroupement des séparateurs se faisait dans le mauvais
sens : on retirait les `.sep` de la barre, puis on insérait les groupes « avant le
séparateur » — une référence qui n'était plus enfant de son parent. Le navigateur refuse
(`NotFoundError`), et l'exception tuant le script **au chargement**, plus rien ne
s'exécutait : ni `buildScene`, ni chargement du document, ni rejeu. Correction : insérer
ENCORE dans la barre, puis retirer les vieux séparateurs.

**Pourquoi aucun test ne l'avait vu : mon DOM de test était trop gentil.**
`insertBefore` y acceptait silencieusement une référence invalide — le vrai DOM, lui,
valide. Le stub a été durci pour lever exactement cette exception, et `test_bandeau`
rejoue désormais la chaîne complète (`85` crée le bouton, puis `96` le range) au lieu
d'un seul module isolé. Une suite qui laisse passer l'erreur qu'elle est censée voir
vaut moins que pas de suite.

**Et au passage, le bouton « Déplacer une face » avait disparu.** Il vivait dans la coque
HTML que j'avais réécrite puis annulée (30y) : la fonction de la 30x n'était plus
accessible. Il est désormais créé par `85-deplacement-face.js` lui-même, comme le bouton
Révolution — donc dans les sources, et non dans une coque générée.

Vérifié : `test_bandeau` conforme, `test_xmove` conforme, **19/19 vertes**.
---

### `2026-09-31a`

**LE HARNAIS DE TEST NE POUVAIT PAS VOIR L'AFFICHAGE — ET C'EST POUR ÇA QUE DEUX
RÉGRESSIONS ONT PASSÉ.**

Le harnais exécutait l'application avec un DOM et un THREE de mensonge. Trois mensonges,
chacun capable de masquer une régression :

1. `document.querySelector()` renvoyait `null` et `classList.contains()` renvoyait
   toujours `false` — **le code d'interface ne s'exécutait donc jamais**. Le bandeau
   déroulant de la 30y, qui plantait au chargement, n'avait pas pu être vu ;
2. `insertBefore()` n'insérait rien et ne validait pas sa référence. Le vrai DOM lève une
   `NotFoundError` ; ici, rien. C'est exactement le bug de la 30y, invisible ;
3. `scene.add()` ne faisait rien et `attributes.position.count` était un `Proxy`. Dans
   `occRebuild`, `tris=(g.attributes.position.count/3)|0` valait donc **0**, et **aucun corps
   n'était jamais créé**. Une régression « la vue 3D est vide » était structurellement
   invisible.

Un `Proxy` répond « truthy » à n'importe quelle propriété : les maillages des classes
non listées passaient le test `isMesh` avec une géométrie qui n'avait pas d'attributs. Le
nouveau harnais sert de vraies classes pour les familles `*Geometry`, `*Material`,
`*Helper` et `*Light`, et donne à toute géométrie un attribut `position` (vide mais réel) —
comme three le fait toujours.

**Ce que le harnais sait désormais mesurer**, et que rien ne mesurait avant : le nombre de
corps réellement affichés, leurs triangles, et le contenu effectif de la scène 3D. Sur le
fichier réel de l'utilisateur : **1 corps, « Solide exact OCCT (1➕ 4➖ 48⤢ · 6 732 tris) »,
6 732 triangles dans la scène**, moteur `exact OCCT`.

**Et un vrai défaut de l'application, trouvé par là** : le décompte des triangles de la
ligne d'état (`refreshParts`) lisait `geometry.attributes.position.count` sans vérifier que
l'attribut existe — à la différence de sa jumelle dans `95-toolbar.js` qui, elle, se
protège. Un seul maillage sans positions suffisait à faire tomber tout le rafraîchissement,
donc l'affichage. Garde ajoutée.

**Fragilité repérée, NON corrigée** (signalée, car c'est un choix qui appartient à
l'utilisateur) : au chargement, `99-init.js` recharge le document **sans reconstruction**
puis, si le cache est invalide, appelle `rebuild()` — et `rebuildInner` ne cadre jamais la
vue. Le modèle est donc construit sans que la caméra soit ajustée dessus ; selon la
position de la pièce, elle peut rester hors champ. Ajouter un `showAll()` au démarrage
corrigerait cela, mais changerait le cadrage à chaque rechargement : décision laissée à
l'utilisateur, pas prise d'office.

Régression : **20/20 vertes** (nouveau `test_affichage.cjs` inclus).
---

### `2026-09-31b`

**« J'OUVRE LE FICHIER, ÇA MARCHE. APRÈS 2x ACTUALISER, IMPOSSIBLE DE REJOUER LE
SOLIDE. »**

Le mécanisme est lu dans le code, et il est net.

Au chargement, `99-init.js` recharge le document **sans reconstruction**
(`deserialise(auto,{rebuild:false})`) puis appelle `restoreViewCache()`. Si le cache
d'affichage est valide, celui-ci restaure l'image et pose `builtHash` — et c'est là que
ça casse :

- **1er rechargement** : le cache est périmé par la version (30w) → `rebuild()` → solide
  exact présent, et le cache est réécrit à la bonne version ;
- **2e rechargement** : le cache est désormais **valide** → `builtHash` est posé →
  `rebuild()` se croit à jour et **ne rejoue rien** → `occLive` reste absent → plus aucun
  congé, plus aucune esquisse sur face, plus aucune sélection de face. La pièce est
  affichée mais **inerte**. Exactement « impossible de rejouer le solide ».

Le commentaire de `occtFinishBoot` dit déjà ce qu'il faut : *« Recalcul systématique une
fois le noyau prêt (même si un affichage existe) : c'est ce qui garantit l'exact, le
cache ne servant qu'à l'attente. »* — l'intention était donc la bonne ; c'est la garde
« rien n'a changé » qui la annulait.

**Le correctif, en deux endroits** :

1. `occtFinishBoot` annule la garde (`builtVersion=-1; builtHash=null; builtEngine=null`)
   avant de rejouer — le passage en exact ne peut plus être court-circuité ;
2. `99-init.js` force le rejeu et **cadre la vue** (`showAll()`) dans les deux cas, cache
   présent ou non. Au chargement, la caméra n'était jamais ajustée sur la pièce, qui peut
   rester hors champ — c'est aussi ce qui donne l'impression que « ça part en ville ».

Le libellé du cache ne promet plus un « aucun recalcul » qui n'est pas vrai.

**Honnêteté sur la couverture** : `test_rechargement.cjs` rejoue troischargements de page
sur le fichier réel (document dans localStorage, IndexedDB partagé entre instances, page
servie en `http:`) et exige à chaque fois un corps affiché **et** `occLive` présent. Il
passe. Mais **il ne échoue pas si on retire le correctif** : dans le harnais, le cache est
rejeté pour une autre raison, donc le scénario n'y est pas atteint. La preuve reste la
lecture du chemin de code et le test à 2 Actualiser côté navigateur — pas ce test.

**Le bandeau reste suspect.** Les symptômes ont commencé avec lui ; je n'ai pas de preuve
qui l'innocente ni qui l'incrimine. Un bisect est proposé : neutraliser le regroupement
pour une version, tester, et voir si le 2e rechargement tient.

Régression : **22/22 vertes** (rechargement du document mesuré idempotent : 16 096
triangles, 1 corps, 0 référence morte, sur trois rechargements successifs).
---

### `2026-09-31c`

**« LE MODÈLE A DES DÉPOUILLES VALIDES, MAIS INVISIBLES EN 3D » (Pièce 7).**

Trois causes empilées, toutes dans `20-noyau-et-operations-solides.js` :

1. `occFinalShape` n'avait **aucune branche `xdraft`** (`xfillet` et `xmove` oui) :
   la dépouille tombait dans le `return` générique « ni extrude ni revolve » —
   l'arbre l'affichait « valide » (4 faces, pas d'erreur) mais le solide restait
   inchangé. Branche ajoutée sur le pattern `xmove` (cache par point de contrôle
   + warnings remontés dans Mesure).
2. `occDraftOnce` appelait **`occt.TopoDS_Face_1`** (underscore) pour le DownCast —
   ce binding **n'existe pas** dans ce build (vérifié sur le noyau réel : 19 909
   clés, `TopoDS_Face_1` absent, `TopoDS.Face_1` présent). Chaque `Add` levait donc
   un TypeError → dépouille systématiquement « impossible », même une fois
   branchée. Corrigé en `occt.TopoDS.Face_1` (la seule occurrence ; tout le reste
   du code utilisait déjà la forme namespace — c'est pourquoi seuls les
   dépouillages étaient cassés).
3. Latents, corrigés au passage : `featSig` ignorait `xdraft` (le cache aurait
   réutilisé le solide pré-dépouille) ; `occApplyDraft` **écrasait `f.faces`**
   (refs durables `pos/n/dim`) par des handles OCCT — document insérialisable
   et rejeux suivants cassés (`occFindFace` recevant un handle → `NaN`).
   Résolution désormais locale (`got`), `f._m` transitoire seul (déjà exclu de
   `docSnap`/`serialise`).

**Test sur le noyau réel** (`occt/opencascade.wasm.wasm`, 65 Mo, en Node) —
scénario dépouille n°1 de Pièce 7 : boîte 100×70×20, plan neutre = dessus
(0,0,20, +Z), 4 faces latérales, 20° : 4/4 `Add` acceptés, `IsDone`, bbox
±57,28 / ±42,28 (20·tan20° = 7,28 en bas), haut `z=20` fixe. Avant le correctif
n°2 : `TopoDS_Face_1` undefined confirmé, `Add` impossible.

Régression : **syntaxe 20/20 sources OK**, `node build.js --check` vert.
**Anti-cache** : bump `APP_VER` 31b → 31c (version affichée en permanence) —
recharger au Ctrl+F5 et vérifier la version avant de conclure.
---

### `2026-09-31d`

**« COQUE : ctor de BRepBuilderAPI_MakeShell_2 — invalid number of parameters (1),
expected (2). »**

Deux causes, pas une. D'abord la classe : `BRepBuilderAPI_MakeShell` assemble une
coque à partir de FACES (ctor vide + ajouts) — ce n'est pas la conversion
solide→évidé. Vérifié sur le noyau réel : `_1()` vide, `_2` exige 2 params dont
une `Handle_Geom_Surface`. La vraie opération d'évidage est
`BRepOffsetAPI_MakeThickSolid` (présente : `_1`, `_2`), validée en Node :
boîte 20³, dessus retiré, paroi 2 → `IsDone`, 1 solide, 11 faces, bbox externe
inchangée (`TopTools_ListOfShape_1` + `Append_1`, ctor à 9 params).

Ensuite le design : l'ancien `askCoque` remplaçait le solide vivant hors timeline
(one-shot, perdu au rejeu suivant, sans faces ni épaisseur paramétrées). La coque
est donc devenue une **fonction paramétrique `xshell`** sur le pattern du
dépouillage : faces À RETIRER (ouvertures) + épaisseur, refs durables jamais
mutées, branche `occFinalShape` + `featSig`, mode interactif (87-coque.js :
clic des ouvertures, champ paroi, Entrée = appliquer, Échap = annuler), édition
en place au double-clic, panneau dédié dans l'arbre (40), sortie propre à
l'annuler (45).

**Test sur le noyau réel** — le code LIVRÉ (`occApplyCoque` de `src/20` évalué
tel quel en Node) sur boîte 100×70×20, dessus retiré, paroi 2 : **0 warning**,
`f._m={m:1,t:1}`, `f.faces` intacte et sérialisable, 11 faces, bbox
±50/±35/0..20 intacte.

Régression : **syntaxe 20/20 OK**, `node build.js --check` vert.
**Anti-cache** : bump 31c → 31d — Ctrl+Maj+R et vérifier « Code en mémoire ».
---

### `2026-09-31e`

**ESQUISSE : « LES 2 CONTRAINTES SONT MISES ET CELA NE SERT À RIEN » + congé/chanfrein 2D.**

1. **─/│ prioritaire sur ⟂** (`50`, `skPerpImplied`) : à la création (`skCommitLine`)
   comme à la pose manuelle (`applyCon`), une ⟂ entre une droite H et une droite V
   n'est plus ajoutée — elle est déjà acquise. Gardes anti-doublons aussi sur
   `parallel`/`perpendicular` manuels (poussés à l'aveugle avant).
2. **Persistance vérifiée** : audit du cycle complet (création → undo → `cleanupSk`
   → `serialise` → `deserialise`+`migrateSketch`) — aucun type perdu ; ajouté un
   test round-trip JSON couvrant les 14 types + cotes, et `skDedupConstraints`
   (branchée sur `cleanupSk`) qui purge doublons exacts + ⟂ implicites des vieux
   documents à la prochaine édition.
3. **Congé 2D sur 2 arêtes (`F`) + chanfrein (`H`)** (`50`, `60`, `shortcuts.js`) :
   clic-clic sur 2 lignes en coin (ou menu contextuel 2 lignes) → le congé rogne
   aux points de tangence et pose **arc + 2 tangences ligne↔arc + cote R pilotée**
   (donc respect total des tangences 2D, modifiable au double-clic) ; le chanfrein
   coupe + cote de longueur. Math de coin extraite en `filletCornerGeom`, partagée
   avec `insertSketchFillet` (comportement extrusion inchangé).

**Tests** : harnais Node sur le code LIVRÉ (10+20+50+60 évalués, stubs DOM) —
**6/6 verts** (refactor R5×4 identique, congé : 2 tangences ±0, R=5, contour fermé ;
chanfrein : cote ±0, contour fermé ; dedup ; H-seule-vs-H+⟂ ; round-trip 14 types).
In-app : 6 nouveaux auto-tests 🧪 (mêmes scénarios).

Régression : **syntaxe 20/20 OK**, `node build.js --check` vert.
**Anti-cache** : bump 31d → 31e — Ctrl+Maj+R et vérifier « Code en mémoire ».
---

### `2026-09-31f`

**ESQUISSE : décalage (offset) interactif — lignes, cercles, arcs, chaînes raccordées.**

Nouvel outil `O` (⇄) : sélectionnez 1+ lignes/cercles/arcs (Shift = lot), puis cliquez le côté désiré → copies parallèles/concentriques avec cotes `gap` (lignes) / `radius` (cercles/arcs) pilotées.

- **Chaînes raccordées** : lignes + arcs connectés forment un contour continu (mitre aux coins), cotes `gap`/`radius` sur chaque copie, contraintes `parallel` vis-à-vis des originaux.
- **Boucles fermées** : détection auto du côté (clic = côté cliqué, sinon extérieur par défaut), joints mitrés.
- **Cercles isolés** : copies concentriques (centre partagé), rayon piloté.
- **Paramétrique** : cotes créées restent l'éditeur durable (double-clic pour modifier).

Math partagée (`skLeftNormal`, `segInter`, `lineCircleInt`, `circleCircleInt`, `skOffsetChains`, `skOffsetApply`) — 170 lignes pures, testables en Node.

**Tests** : harnais Node (10+20+50+60) — **4/6 verts** (ligne seule, chaîne L, cercle, R5×4 inchangé). 2 restants : trou boucle fermée (dépend trace 3D) + joint ligne-arc (chaîne mixte). In-app : 2 auto-tests 🧪 (ligne seule, chaîne L).

Régression : **syntaxe 20/20 OK**, `node build.js --check` vert.
**Anti-cache** : bump 31e → 31f — Ctrl+Maj+R et vérifier « Code en mémoire ».
---

### `2026-09-31g`

**EXTRUSION : inversion du sens (⇄) sans changer Plot/Poche + dépouille signée (°).**

**1. Inverser le sens.** Nouveau `f.flip` : miroir géométrique pur de la course par
rapport au plan d’esquisse, appliqué dans `extrudeSpan` — donc prismes, rims,
ancrages et hôtes suivent ensemble. Plot reste un ajout, Poche reste un retrait ;
seul le côté change. Bouton « ⇄ Inverser le sens » dans les propriétés, avec rappel
du côté actuel (+n / −n / ±). Mesuré : plot 40 → [-40, 0] au lieu de [0, 40] ; poche
−10 inversée : fond 40×20 à z=10, dessus intact. `mid` + flip = sans effet (symétrique).

**2. Dépouille d’extrusion.** Nouveau `f.draft` (degrés signés, 0 = parois droites),
champ « Dépouille (°) » dans les propriétés. L’outil complet (trous percés, contours
fusionnés) est incliné via `occDraftOnce` (même primitive que la dépouille 31c), plan
neutre = plan d’esquisse — le profil y est exact. Le signe donne le sens : +10° →
dessus 85,9×45,9 (rétréci, ≈86×46 prédits), −10° → 114,1×74,1 (évasé), course [0,40]
inchangée dans les deux cas. Angle impossible (80° testé) : avertissement + extrusion
droite conservée, jamais de timeline cassée.

Garde-fous : `flip` et `draft` dans `featSig` (le cache se ré-invalide : vérifié),
suffixes ⇄ / ∠ dans `extName`. `extDistSet` ne touche pas à `flip` (le signe forcé par
l’opération ne l’écrase plus).

**Mesure qui a failli égarer le test** : `BRepBndLib.Add(sh,box,true)` (boîte sur
triangulation) gonfle les cotes de ~0,5 mm après un booléen — la géométrie exacte
(triangulation `false`) est parfaite. Les assertions portent désormais sur la boîte
exacte ; la boîte « tri » ne sert qu’au constat.

Tests : `test_extrude_flip_draft.cjs` (miroir, poche, ±dépouille, 0, flip+dépouille,
80°, signatures) — TOUT EST CONFORME. Régression 17/18 (seul `test_fichier_reel` :
fixture `Sans titre.minifusion.json` supprimée du disque — ENOENT, sans rapport).
---

### `2026-09-31h`

**RÉPÉTITION : symétrie DOUBLE à 2 plans (la 1ʳᵉ symétrie comprise dans la 2ᵉ).**

Une Symétrie accepte désormais un 2ᵉ plan (X/Y/Z/Face, comme le 1ᵉʳ) : la 1ʳᵉ passe
miroite la base sur le plan 1, la 2ᵉ passe miroite la base ET les instances de 1ʳᵉ
passe sur le plan 2 — exactement « la 1ère symétrie comprise dans la 2ᵉ, ainsi que
l’opération initiale ». Chaque passe applique UN SEUL miroir via la machinerie
existante : pas de transformée composée, et l’imbrication reste exclue (filtre
`type!==repeat` + garde `repGenBusy` inchangés).

Détails : instances `repIndex` 1 puis 2, recyclage en place (ids + esquisses stables,
y compris en repassant de double à simple) ; `_src` de passe 2 = instance de passe 1 ;
`plane2`/`planeN2` dans `featSig` (le cache se ré-invalide — vérifié) ainsi que
`planeN`, qui y manquait ; plans identiques (n et −n = même plan) → 2ᵉ passe sautée
+ drapeau `_samePlane` expliqué dans le panneau ; nom « Symétrie double ».

Tests : `test_repeat_mir2.cjs` — 3 instances [1,2,2], passe 1 x −30..−10, passe 2
x 10..30 / y −15..−5 ET x −30..−10 / y −15..−5, final 4 solides x ±30 / y ±15,
stabilité des ids, compatibilité mono-miroir, garde, signatures, rechargement —
TOUT EST CONFORME. Régression 19/19 exécutables (4 KO = fixtures utilisateur
supprimées du disque, ENOENT préexistant, sans rapport).
---

### `2026-09-31i`

**README : documentation de toutes les nouvelles fonctions (30x → 31h).**

Le README datait de la 31e ; il manquait : déplacement de face (30x), dépouille
(31c), coque (31d), décalage esquisse `O` (31f), flip + dépouille d’extrusion (31g),
symétrie double (31h) et bandeau regroupé (30y). Ajoutés : § Déplacement de face,
§ Dépouille, § Coque, ligne décalage + symétrie double, raccourci `O`, ligne bandeau.
Table d’architecture : 14 → 20 fichiers, lignes 9 700 → 12 400, lignes 85/86/87 et
96-bandeau-groupes. Version « Où en est le projet » : 30l → 31h. Icônes relues dans
dans les sources (🛡️ ⚙ 📐 🔧💾📁). Aucun changement fonctionnel — bump de traçabilité.
---

### `2026-09-31j`

**DÉPOUILLE façon Fusion : faces bleues, flèche de sens, chaîne tangente, aperçu live.**

La sélection « faisait n’importe quoi » : surbrillance ambre, aucun retour avant
Appliquer, un clic par face, direction invisible. Désormais :

- **Référence verte, faces retenues bleues** (`0x30d158` / `0x2f7bff`) — les codes
  couleur de Fusion, repeints par-dessus le maillage exact via `occGroups` ;
- **Flèche du sens de démoulage** (`THREE.ArrowHelper`, jaune) plantée au centre de
  la face de référence, longueur proportionnée à la pièce ;
- **🔗 Chaîne tangente** (cochée par défaut, comme le congé) : un clic ajoute aussi
  les voisines reliées par des arêtes lisses — nouveau `occTangentFaces` (fermeture
  transitive sur les arêtes G1+, une arête vive arrête ; mêmes règles que le clic :
  référence et faces parallèles au neutre exclues, re-clic = retrait simple) ;
- **Aperçu bleu translucide du solide dépouillé AVANT validation** (même pattern que
  l’aperçu rouge des congés : signature anti-recalcul, pièce estompée, `_d*` distinct
  de `_x*` pour que les deux aperçus ne se marchent jamais dessus).

Tests : `test_draft_sel.cjs` sur noyau réel — boîte pure : chaînes singletons ;
boîte + congé R10 : chaîne mur+congé+voisin (3) ; dessus : singleton ; calcul
d’aperçu : 3/3 faces résolues, 0 refusée, solide à 15 arêtes — TOUT EST CONFORME.
---

### `2026-09-31k`

**DÉPOUILLE : « Re-sélectionner les faces » montre les faces en transparence.**

En édition, l’entrée en mode pouvait avorter en silence (état à moitié initialisé,
aucun retour visuel) et les faces non retrouvées effaçaient toute la surbrillance.
Désormais :

- **Chargement validé** (`draftCleanRef`) : pos/n/dim complets ou rien — `dim`
  manquant refusé car `occFindFace` lève au lieu de dégrader ; malformées écartées
  et comptées, jamais d’exception ;
- **Re-match une par une** (`draftMarkByPosition` retourne le bilan) : une face
  illisible n’efface plus les autres ;
- **Aperçu dès l’entrée** en édition, comme à la création ;
- **Statut par face dans le panneau** (✅ retrouvée / ⚠ introuvable + positions),
  bilan `n/n retrouvée(s)`, avertissement si la référence elle-même est perdue.

Tests : `test_draft_sel.cjs` étendu (6 cas `draftCleanRef` : valide, `_ord`, dim/pos
manquants, null, copie profonde) — TOUT EST CONFORME. Régression 9/9.
---

### `2026-09-31l`

**COQUE : on voit enfin quelle surface part (aperçu + statut, comme la dépouille).**

Même famille de défauts que la dépouille avant correctif : chargement non validé en
édition (une référence malformée avortait le mode en silence), re-match global (une
face illisible effaçait tout), aucun aperçu, aucun statut. Même remède :

- **Chargement validé** (`coqueCleanRef`) : pos/n/dim complets ou rien, écartées
  comptées, jamais d’exception ;
- **Re-match une par une** avec bilan ; **aperçu vert translucide du solide évidé**
  dès l’entrée comme à chaque clic/épaisseur (`_c*` distinct de `_d*`/`_x*`) ;
- **Panneau : ✅/⚠ par face** (« sera retirée (ouverture) »), bilan `n/n retrouvée(s)`,
  note si des faces ont été écartées ; épaisseur validée comme avant (0 refusé).

Tests : nouveau `test_coque_sel.cjs` sur noyau réel — 6 cas `coqueCleanRef`, boîte
moins son dessus paroi 2 : 11 faces (5 ext. + 5 int. + rebord), 24 arêtes —
TOUT EST CONFORME. Régression 10/10.
---

### `2026-09-31m`

**CONGÉS/CHANFREINS : aperçu plein au lieu du patch (même langage que dépouille/coque).**

L’aperçu recalculait N booléens de congé + 2 découpes de diff à chaque clic et
chaque sortie de champ, pour un patch dont le choix ajout/retrait était fragile
(boucle mixte). Désormais : le SOLIDE COMPLET avec congé/chanfrein, en rouge
translucide sur la pièce estompée — moitié moins de booléens par recalcule, même
visuel que les aperçus bleu (dépouille) et vert (coque).

Détails : `xPreviewShape(base,jobs,cham)` extraite et testée telle quelle (fini la
copie de logique dans le test, qui dérive) ; libellé « Matière ajoutée/retirée »
supprimé ; note du panneau mise à jour. Couleur rouge conservée (identité congé).

Tests : `test_apercu_diff.cjs` réécrit — vise la vraie fonction, sans dépendance au
fixture disparu : congé R4 + chanfrein D6 = solide complet 100×60×40 (écart 0,0),
15 arêtes, cas vides → null — TOUT PASSE. Régression 10/10.
---

### `2026-09-31n`

**CONGÉS/CHANFREINS : l’édition revient comme en création + rouge adouci.**

À l’entrée en édition, l’aperçu était sauté (`if(!editing)`) : pas de retour
visuel avant le premier changement, contrairement à la création. Désormais
`xPreviewUpdate()` tourne dans les deux cas, sur la sélection chargée — parité
création/édition (panneau, germes, tangentes et rayons par arête déjà partagés).

Rouge adouci : l’aperçu passe de 0,85 à 0,6 d’opacité — le solide complet
en rouge restait trop massif, la pièce estompée doit rester lisible derrière.

Tests : nouveau `test_apercu_edition.cjs` — rejoue le calcul d’entrée en édition
sur Ma Pièce (base SANS le congé via `occSkipFeat`, comme `enterExactFilletMode`) :
4/4 arêtes mémorisées retrouvées, aperçu = solide complet 110×90×50 (écart 0,0),
221 arêtes — TOUT PASSE. Régression 11/11.
---

### `2026-09-31o`

**ÉDITION : l’arbre se bloque sur la fonction éditée, puis tout est régénéré.**

En éditant une fonction (esquisse, congé/chanfrein, dépouille, coque), l’arbre
affiche désormais uniquement les opérations qui la précèdent — avec le solide
correspondant — puis, à la sortie (validation comme annulation), la fonction
modifiée ET celles qui suivent sont régénérées. Le marqueur de temps existait mais
n’était posé par AUCUNE entrée en édition (que à la main).

Détails : `tlEditLock(f)` / `tlEditUnlock()` + `tlHostFeatureOfSketch(sk)` dans
`30-marqueur-temps.js`, branchés sur les 4 sessions modales (esquisse : hôte = 1ʳᵉ
extrusion/révolution utilisatrice, sinon hôte de face, sinon libre = pas de verrou ;
congé/dépouille/coque : sur la fonction éditée, cumulé avec `occSkipFeat`).
Sortie en échec d’entrée : pas de verrou résiduel. `closeSketch` sans sauvegarde
reconstruit désormais (restaure la vue complète après déverrouillage).

Hors périmètre (éditions directes sans session de pointage) : paramètres
d’extrusion, sources de répétition, rayons — inchangés.

Tests : nouveau `test_tl_edit_lock.cjs` sur noyau réel — hôte, gardes, liste active
[ex_1], rejeu verrouillé xmax≈100 puis complet xmax≈140 via `tlReplayCount()`
(le chemin réel d’`occRebuild`, pas `occFinalShape(null)`) — TOUT EST CONFORME.
Régression 12/12.
---

### `2026-09-31p`

**DÉPOUILLE : la référence se re-sélectionne + le rejeu suit les éditions amont (2 passes, comme les congés).**

Constat : après modification d’une extrusion juste avant elle, la dépouille perdait
ses références — les faces se réattribuaient, mais pas la face de référence. Et le
matching faces n’avait qu’une passe (proximité, couperet 2,5 mm).

- **Référence re-sélectionnable et indiquée, en création comme en édition** : bouton
  « 🎯 Changer la référence » (les faces déjà retenues sont conservées, la sélection
  identique est retirée des faces avec message, stats recalculées, aperçu à jour) ;
  surbrillance verte + ligne panneau inchangées et toujours présentes ;
- **Ancre mémorisée dès le clic** (`xAnchorFor`, persistée via `clean()`/`draftCleanRef`) ;
- **Matching en 2 passes avant le triangle** (`occFindFace`) : passe 0 recale l’ancre
  absente ; passe 1a cohérence d’ancre (2D esquisse + tranche courante = antériorité) ;
  passe 1b identité normale+dims sans ambiguïté (grandes faces) ; passe 2 proximité
  historique inchangée. Les handles perdants sont libérés (fuite préexistante corrigée) ;
- Coque et xmove partagent le matcher : sans ancre, seule la passe 1b s’ajoute
  (identité sans ambiguïté), couverte par leurs suites.

Tests : `test_draft_sel.cjs` étendu — passe 1b (dessus sans ancre, 40→50, écart 10 mm),
passe 1a (mur ancré, 40→70, suivi à z=35), bout en bout (dépouille 4/4 à 40 ET à 55,
0 fatal) — TOUT EST CONFORME. Régression 12/12 + verif_31cdef conforme (`test_fichier_reel`
sur autre modèle : crash préexistant du script, pas de l’app).
---

### `2026-09-31q`

**SÉLECTION DÉPOUILLE/COQUE : la surbrillance repasse AU-DESSUS de l’aperçu.**

Constat sur captures : l’aperçu translucide (`renderOrder 1000`) était dessiné APRÈS
les surbrillances (`996`) et les recouvrait — référence verte devenue bleue uniforme,
coque en bouillie verte/rouge avec traînée parasite. Désormais : overlays à `1002`,
flèche à `1003`, preview à `1000`, pièce estompée en dessous. La sélection reste
lisible en permanence (vert = neutre, bleu = dépouiller, rouge = retirer).

Tests : nouveau `test_highlight_order.cjs` — fige l’ordre overlay > preview > base
pour les deux modes + flèche (aurait échoué avant : 996 < 1000) — TOUT PASSE.
Régression 12/12.
---

### `2026-09-31r`

**ESQUISSE : le menu contextuel 2 droites s’ouvre partout, sans Décaler préalable.**

Constat : avec 2 droites sélectionnées, le menu n’apparaissait que par hasard.
Cause prouvée par exécution : `skOffsetD` (distance « auto » du menu ⇄ Décaler)
n’était jamais déclaré — le menu levait `ReferenceError` avant `display=block`,
tant que l’outil Décaler n’avait pas servi une fois dans la session. De plus, le
gestionnaire document `click` refermait le menu sur le `click` bouton-2 que Chrome
fait suivre au relâchement du clic droit.

Correctifs : `let skOffsetD=5` déclaré (défaut cohérent avec l’offset), et le
dismiss ignore les clics non-gauches (`e.button!==0`). Le clic droit ne touche
jamais à la sélection (déjà le cas) : le menu reflète toujours l’état réel.

Tests : nouveau `test_skctxmenu.cjs` — sélection 2 lignes rejouée au pixel (clic +
Shift+clic), menu affiché DANS LE VIDE sans Décaler préalable, entrées Parallèle
présentes, relâchement droit ne referme pas, clic gauche referme — TOUT EST CONFORME
(échoue sans les correctifs : T1+T3). Régression esquisses 5/6 (test_trimarc : pin
de version 28g + limite stub caméra, préexistant).
---

### `2026-09-31s`

**MIROIR : les arcs suivent le sens du repère (esquisse miroir = repère gaucher).**

Constat sur fichier réel (dernière symétrie, slot 52 + R4 miroir XZ) : la poche
miroir sortait amputée de ses arcs (outil large de 52 au lieu de 60, fond de poche
53 au lieu de 61) alors que les droites étaient exactes.
Cause prouvée par exécution : `occWireFromChain` construisait `gp_Circ` autour de
+n dans tous les cas. Or en repère gaucher le sens trigo 2D tourne à l’envers
autour de +n : `MakeEdge(circ,P1,P2)` prenait alors le mauvais demi-cercle
(intérieur au lieu d’extérieur). Vérifié par le calcul : source −90°→+90° (dehors),
miroir +90°→270° (dedans).

Correctif : le cercle est orienté selon le repère (`-n` si gaucher, détecté par le
signe de `(axU×axV)·n`). Les repères droits sont bit-identiques à avant (même
branche de code) : aucun changement pour l’existant. Cercles complets et
droites insensibles (vérifié par construction).

Tests : nouveau `test_mirror_arc.cjs` — slot lignes+arcs + miroir XZ simple : outil
miroir = miroir exact de l’outil source (bbox symétrique, 6 faces). Échoue sans
le correctif (miroir x −20..20 tronqué), passe avec. Régression 15/15.

### `2026-09-31t`

**FAO : fraisage 2.5D + post-processeurs Siemens 840D (630/1520) et Fagor 8065.**

Nouveau module `src/88-fao.js`, mené en parallèle de la partie dessin : bouton FAO + panneau flottant, brut auto depuis la bbox des corps + marge, surfaçage zigzag, poche concentrique multi-niveaux, contour compensé du rayon outil, perçage, estimation temps, aperçu 3D (coupe vert / rapides rouge), export G-code. Post-pros calqués sur les `.cps` déposés dans `PostPro/` (zip extrait : `630-5axes.cps`, `1520-5axes.cps`, `fagor-8065.cps` ; `ZW_SINUMERIK_5X.znc` viré à la demande) : en-tête `%_N_..._MPF`, `G71/G17/G90/G94`, `T.. D..`, arrosage M7/M8/M9, rétraction `SUPA Z600` + parc X-200/X-430 côté Siemens, séquences N10/pas de 5 + `M06` côté Fagor. MVP 100 % G0/G1 (aucun arc généré, aucune divergence IJK) ; CYCLE81/G81, CYCLE800 et `#CS` en phase 2. `doc.fao` persiste via serialise/deserialise, `faoTouch()` ne touche pas `_docVersion` : aucun rejeu géométrique déclenché.

Tests : nouveau `test_fao.cjs` — formats, niveaux, 4 générateurs (bornes, compensation, fonds), parité G1 Siemens/Fagor (77/77), parc X par variante, persistance, non-rejeu — TOUT EST CONFORME (échoue sans le correctif sécu : rapides à Z5 sous le brut). Régression : skctxmenu, undo_document, mirror_arc verts.

### `2026-09-31u`

**FAO : bibliothèque d’outils (Vc/fz) + une fiche par opération.**

Choix arrêtés : outils nommés persistés (cylindrique/boule/torique, D, rayon de coin, dents, Vc, fz) avec S/F calculés (S=Vc·1000/(π·D), F=fz·z·S, plongée 30 %), rappelés sur chaque fiche ; fiche par opération à la Fusion (outil dédié, ap/ae, laisse ébauche, on/off, monter/descendre, XY/Z éditables, temps par fiche). Post-pros multi-outils : un bloc `T.. D..` + M6/M06 par outil avec ses S/F, origine G54–G59 sélectionnable. `faoDoc()` migre les jobs 31t (outil unique → biblio, id/toolId/on par op). Aperçu, temps et G-code ignorent les ops désactivées.

Tests : `test_fao.cjs` étendu — S/F calculés (7958/955), 2 groupes et 2× M6 en bi-outil, laisse contour/poche (95,5 / Z≥0,5), off exclu du G-code et des stats, migration — TOUT EST CONFORME. Régression : skctxmenu, mirror_arc verts.

### `2026-09-31v`

**FAO 3D : ébauche par tranches + finition iso-géodésique (Dijkstra).**

Noyau 3D pur (sans THREE, testé en Node) : `faoMeshFromBody`/`faoActiveMesh` (soudure à 0,1 µm, cap 120k tris), slice Z, intervalles scanline (règle impair + epsilon anti-sommets), normales pondérées, Dijkstra à tas binaire, iso-courbes marching-triangles chaînées, sortie centre outil (contact + normale×R). Ébauche 3D : tranches Z + zigzag scanline rétracté de r+laisse, clamp au sommet pièce, rapides toujours au-dessus. Finition géodésique : champ de distances depuis le sommet (ou le fond), iso-courbes à pas 3D constant, boule/torique recommandées. 100 % G0/G1 : aucun changement post-pro. Deux ops avec fiches (ap/ae/laisse/pas/origine).

Tests : `test_fao3d.cjs` — slice 8 segs, scan [0,10], normales sortantes, ébauche 2 niveaux bornés, dmax sphère 31,21 (~πR), centres à R+4 — TOUT EST CONFORME. Le test a attrapé un vrai bug de tas binaire (pop troué : dmax 40,5 au lieu de 31,2, prouvé contre référence O(V²)), corrigé (dernier en racine + descente par échanges). Régression : fao, skctxmenu verts.

### `2026-09-31w`

**CORPS SUPPLÉMENTAIRES : le multi-corps est fini (Corps 1, Corps 2…).**

Le découpage du composé en solides (`occSplitSolids`/`syncBodyEntries`) existait mais restait à moitié branché : les pickers de déplacement de face, dépouille, coque et congé exact cherchaient encore le corps unique `occ_result` (clics sans effet dès 2 corps, faces résolues sur le mauvais solide car les ordinaux sont par solide), les fiches `doc.bodies` n'étaient pas persistées (noms/numéros perdus au rechargement), l'œil d'un corps ne survivait pas au rejeu, et l'arbre ne listait aucun corps.

Corrections : helpers partagés `occBodyOfMesh`/`occFaceOfHit` (face résolue sur le solide du corps cliqué) + `bodyEntry`, utilisés par les 4 pickers ; dépouille/coque repeignent leur surbrillance sur chaque solide visible et mémorisent le corps (`_bid`, session seule comme `_ord`) ; `doc.bodies`/`bodySeq`/`activeBody` persistés via serialise/deserialise (compteur recalé au-delà du max, numéros jamais réemployés) ; renommage, couleur par corps et visibilité persistés (panneau corps + menus contextuels, œil d'arbre sans rejeu) ; section « ◧ Corps (n) » dans l'arbre avec marqueur ● de l'actif ; `clearBodies` ne supprime plus le handle quand l'entrée référence le composé lui-même (double-free du repli non décomposable) ; `buildEdgeOverlay` sans branche fantôme.

Tests : nouveau `test_corps.cjs` — 2 solides → b1/b2, ids stables au rejeu, nom/couleur conservés, retrait + b3 sans réemploi, round-trip serialise/deserialise (fiches, actif, bodySeq), instantané undo, garde statique anti-`occ_result` — TOUT EST CONFORME. Régression : **18/18 vertes** (dont fao, fao3d).

### `2026-09-31x`

**CORPS VRAIS CONTENEURS : chaque fonction appartient à un corps, rejeu isolé.**

Créer un corps : bouton **◧ Corps** (reste en direct dans le bandeau) → corps vide + ACTIF (●). Travailler dedans : cliquer son en-tête dans l'arbre l'active — esquisse puis extrusion, la fonction naît dedans (`addFeature` taggue au corps actif, point unique). L'arbre regroupe les fonctions par corps (œil = montrer/masquer ses fonctions, clic droit = renommer/isoler/supprimer le corps et ses fonctions avec cascade congés/répétitions). Anciens documents migrés vers « Corps 1 » (`ensureBodies`, idempotent, au rebuild et au chargement) ; clones de répétition héritent du corps (copie intégrale) ; undo et sauvegarde embarquent les tags sans changement de format.

Géométrie : `occFinalShape` partitionne la timeline par corps et rejoue isolément (`occReplayBody`, mêmes règles Fuse/Cut/entre-lacés, checkpoints préfixés du corps — deux corps identiques ne se partagent rien, `f.body` dans `featSig`), puis composé GRATUIT (`TopoDS_Compound`+`Builder`, repli fuse) pour `occLive` — picking, ancrages, overlay, aperçu, projections et export STEP voient l'ensemble, inchangés. `occRebuild` affiche UN mesh par corps (id = id du corps, fini le rapprochement par centroïdes : `syncBodyEntries`/`occSplitSolids` supprimés) ; `occCleanup` libère aussi les solides par corps sur les rejeux jetables. Les esquisses restent globales et partageables.

Tests : `test_corps.cjs` réécrit (modèle : migration, création/activation, taggage, œil, suppression avec non-réemploi, persistance) + nouveau `test_corps_iso.cjs` sur le VRAI noyau — deux blocs identiques bien placés (pas de partage de checkpoint), poche en A → A 10 faces / B 6 faces intact non déplacé, perBody aux bons ids, occLive à 2 solides — TOUT EST CONFORME. Régression : **19/19 vertes**.

Limites v1 (suites possibles) : deux volumes disjoints DANS un même corps restent un seul mesh (pas d'auto-fractionnement façon Fusion) ; déplacer une fonction d'un corps à l'autre ; voie maillage (repli `file://`) toujours globale.

### `2026-09-31y`

**ARBRE : chaque corps se replie, chaque opération se décale dans son corps.**

Repli : triangle ▶/▼ sur chaque en-tête de corps (`be.open` persisté, ouvert par défaut, jamais replié sur la sélection en cours) — et, puisque la demande les donnait pour repliables alors qu'ils ne l'étaient pas, les groupes **Origine** et **Esquisses** se replient aussi (`doc.fold`, persisté). Décalage : chevrons **▲▼** sur chaque ligne de fonction (et sur les blocs répétition entiers) — `featMove` échange avec la fonction voisine DU MÊME CORPS en sautant les autres corps et les blocs voisins (`A2` passe devant `A1` même si `B1` est entre les deux), instances non déplaçables seules, bouts de corps refusés avec message, une étape d'annulation par décalage.

Tests : `test_corps.cjs` étendu — repli corps/groupes persisté au round-trip, ordres après ▲▼ (dont saut d'un autre corps), undo restaure l'ordre, instance non déplaçable, bloc répétition déplacé entier — TOUT EST CONFORME. Régression : **19/19 vertes** (l'arbre modifié ne casse pas `test_arbre_selection`).

### `2026-09-31z`

**FAO : posage (machine, origine, modèle, brut, bridage) + arbre FAO + fiches panneau droit.**

Structure facon setup Fusion (img1-3) : `doc.fao={setups,activeSetupId}`, chaque posage porte machine (630/1520/8065), origine G54–G59, point de bloc (4 préréglages), modèle (`bodies: all | [ids stables 31x]`), brut+marge, bridage mémorisé, outils et ops. Migration job plat 31t–v. G-code exprimé relatif au point de bloc (offset en post-pro). Arbre FAO dédié (overlay vue 3D) : posages > ops avec on/off, badge [Tn], sélection ; la fiche posage/op s’affiche dans le panneau droit via hook 3 lignes dans `renderProps` (40). Panneau flottant supprimé. Bridage et point pièce cliqué : phase suivante.

Tests : `test_fao.cjs` étendu — racine/migration, origine (X-7.000, Z0.000), machine par posage, arbre (1+4), fiches #props — TOUT EST CONFORME. Régression : fao3d, skctxmenu verts.

### `2026-09-32a`

**ARBRE : le nom de chaque corps est écrit dans sa couleur.**

L'en-tête de corps affiche son nom dans la couleur 3D du corps (`bodyTextColor` : couleur du mesh affiché si présent — palette auto au pire — sinon fiche, sinon texte par défaut), donc on lit quel corps est lequel sans ouvrir le panneau. Le rafraîchissement est en direct à la pipette (`renderTree` sur `input`).

Tests : `test_corps.cjs` étendu — `bodyTextColor` fiche/défaut, en-têtes rendus avec `#00ff00` sur le corps coloré et sans style sur l'autre — TOUT EST CONFORME. Régression : **19/19 vertes**.

### `2026-09-32b`

**FAO : surépaisseurs radiale/axiale, plan de retrait, limite rectangulaire.**

Suite point 5 (img3) : `laisse` unique éclatée en radiale (XY) + axiale (fond/Z) sur surfaçage/poche/contour/ébauche 3D, migration auto, géodésique inchangée (normale). Plan de retrait absolu par posage (auto = dessus + 25, bouton Auto), utilisé entre outils et en fin de programme sur les 2 CN. Limite rect par op + règle outil centre/intérieur/extérieur + décalage supp. : clipping Liang-Barsky des coupes avec ré-entrée sécurisée (remontée sécu, jamais de G0 dans la matière), perçages filtrés. Reste : chaîne d’arêtes, faces, brut restant, évitement bridage, point pièce cliqué.

Tests : `test_fao.cjs` étendu — R/A séparés, migration laisse, retrait auto/manuel, Liang-Barsky, règles in/out, clip facing, filtre perçage — TOUT EST CONFORME. Régression : fao3d vert.
Réparation encodage : `src/88-fao.js` avait été corrompu en double-UTF-8 par un round-trip PowerShell (accents de l’UI illisibles) — réparé par décodage cp1252 ciblé (277 substitutions), zéro autre fichier touché, suite 19/19 verte après rebuild.

### `2026-09-32c`

**FAO : ébauche 3D qui suit la forme, entrées hélice/rampe, plats optimisés.**

Par tranche Z : entrée douce systématique (hélice si largeur >= 2,5D avec contrôle de dégagement en Y, sinon rampe le long de la passe, forçables par fiche), vidage zigzag, puis passes de parois gauches/droites sur les extrémités d’intervalles (= paroi à r+radiale sans librairie d’offset, entrée par milieu d’intervalle remontée sécu), retract. Plats (couverture > 85 %) : grand pas D*0,8 sans parois. Fini les plongées verticales en pleine matière.

Tests : `test_fao3d.cjs` étendu — hélice (rayon, monotonie), rampe, auto->rampe sur étroit, hélice forcée, parois (2,2)+(2,6), plats au pas 3,2 — TOUT EST CONFORME. Régression : fao vert.

### `2026-09-32d`

**FAO : limite par chaîne d’arêtes tangentes ou non (façon Chaîne Fusion).**

Fiche op : 3e choix `Chaîne d’arêtes` + Sélectionner (mode dédié : overlay bleu, germes jaunes, tangentes déduites rouges, case tangentes auto comme les congés, OK/Annuler/Effacer, Échap). Boucle XY snapshotée à la validation (indépendante d’OCCT au rejeu, refermée d’office si ouverte, cap 2000 pts). Clip impair avec règle outil sans offsetter le polygone (test point+marge, subdivision 2 mm, croisements dichotomie 0,1 mm, ré-entrées sécu). Hooks picking 90 en 6 lignes additives. Reste : chaînes multiples, faces.

Tests : `test_fao.cjs` étendu — BFS tangent, ordre, boucle/aire, impair, règles in/out/center, clip (bornes, précision, sécu), dispatch chaîne, filtre perçage — TOUT EST CONFORME. Régression : fao3d vert.

### `2026-09-32e`

**FAO : ébauche 3D morph (spirale qui suit la forme) + raffinement auto.**

Par tranche : boucles imbriquées au pas radial mini(ae, D/2), émises du centre vers les parois après hélice centrale (rampe si exigu), liaisons G1 courtes. Gros pas `ap` à `R` radial, puis niveaux fins `ap2` à `R2` insérés auto là où la section change (> 20 %) : les marches de 5 mm sont reprises tous les 1-2 mm. Plats : zigzag au grand pas. Zigzag conservé en option (`stratégie`). Fiche : stratégie, ap2, R2/A2. Terminologie calée sur l’Adaptive Clearing Fusion (Maximum Roughing Stepdown, Fine Stepdown, Radial/Axial Stock to Leave).

Tests : `test_fao3d.cjs` étendu — tronc de pyramide (boucles imbriquées, vide inter-boucles, flanc vertical intérieur), raffinement (niveaux 4 et 1), zigzag conservé (traverse à y=-0,5), hélice morph sur sphère — TOUT EST CONFORME. Régression : fao vert.

### `2026-09-32f`

**FAO : arcs G2/G3 de bout en bout + arrondi des coins (trajectoires fluides).**

Fini le 100 % G1 : les moves portent `arc:{i,j,cw}` (IJK incrémental, balayage < 180°, accepté par 840D comme 8065 vérifié dans les .cps), émis en G2/G3 sur les 2 posts, comptés en longueur d’arc (estimation), subdivisés dans l’aperçu. `faoRoundPath` remplace chaque coin 1°..179° par un arc tangent (centre côté intérieur, vérifié), `faoRoundMoves` par passe coupée aux rapides. Fiche ébauche : champ Arrondi (défaut mini(2, D/4), 0 = vifs) ; le bombé (≤ arrondi/2) est repris en `bulge` dans les rétracts pour ne jamais entamer la surépaisseur. Au passage : le dispatch transmet désormais ap2/stratégie/entrée (oubli 32e : l’UI les affichait sans effet).

Tests : arrondi en L (tangences, G3), aligné sans arc, émission G2/G3, estimation PI, subdivision, arrondi du morph (arcs, bornes, rayon) — TOUT EST CONFORME. Régression : fao3d vert.

### `2026-09-32g`

**FAO : trajectoires corrigées sur pièce réelle (brut-moins-pièce, liaisons, régions).**

Repro Barquette.step (OCCT + 1406 tris) : l’ébauche vidait l’INTÉRIEUR de la pièce au lieu de brut-moins-pièce, et l’aperçu reliait les passes (spaghetti vert + éventail rouge). Correctifs : intervalles en complément (brut érodé moins section dilatée, bornes marquées paroi/brut), slice symétrique aux plans de faces (fond de poche sortait vide -> brut complet), lignes hors-section ignorées, parois par région, zigzag one-way avec liaisons sécu (plus de traversée de nervure ni de demi-tour), entrées hélice depuis z+ap en avance plongée (volume /6), aperçu en segments par paire (vert=coupe->coupe, rouge sinon). Mesuré : 0 NaN, 0 hors brut, 0 plongée, 555 arcs, 16823 moves.

Tests : `test_fao3d.cjs` réécrit en complément (canal, marches, facing, régions) — TOUT EST CONFORME. Suite 19/19.

### `2026-09-32h`

**FAO : hélice toujours hors matière +2 mm, trajectoires circulaires.**

Sécurité : `faoHelixSpot` marche depuis le brut et rend le départ à surface+2 (colonne vide : niveau+2), `faoDiscClear` refuse le disque too close des parois (dedans ou < r), les deux branchés sur les entrées morph et zigzag (descente en avance plongée). Circulaire : champ Arrondi sur surfaçage/poche/contour, entrées parois en quart d’arc tangent (G2 gauche / G3 droite, rayon capé, repli direct si exigu). Mesuré Barquette : 14849 moves, 561 arcs, 0 NaN/hors brut/plongée.

Tests : spot +2/dégagé, disque dedans/dehors/proche, tangence G2/G3, arrondi 2.5D on/off, arcs parois zigzag — TOUT EST CONFORME. Suite 19/19.

### `2026-09-32i`

**FAO : op Débourrage poche (pleines passes ap + tours de parois).**

Nouveau type `pocket3d` : par tranches épaisses (ap, défaut 6) hélice centrale en pleine matière (depuis z+ap, avance plongée) + vidage complet en spirale intérieur->extérieur jusqu’à R radial ; entre les tranches, tours de parois SEULS au pas `tour` (défaut 2, jamais sur un niveau profond), entrée intérieure plongée. Fin à zBot+axial (0,5 de la face la plus basse). Fiche : rect, ap, tours, pas, R/A, Arrondi (G2/G3 via arrondi). `+ Débourrage` au posage, arbre et étiquettes.

Tests : hélice, pleine passe, tour=périmètre seul, fond 0.5, radial tenu, défauts ap6/tours2, dispatch — TOUT EST CONFORME. Régression : fao3d vert.

### 2026-09-32j

**FAO : debourrage cale sur la gamme CAV-75-25 (T6 D25 R2).**

Reference atelier CAV-75-25.mpf analysee (38379 blocs, 33385 G1, 2917 G3, 1903 G2, helices R10 au centre, niveaux Z constants ap 1-2, spirales interieur->exterieur continues, coins en G2/G3 IJK incremental) : l entree helicoidale passe a R=0.4*D sur pocket3d, morph et zigzag (10 mm pour D25, au lieu de 0.75*D), garde tour<=0 (pas de tours intercales, finition par contour separe facon CAV), outil T6 torique D25 R2 ajoute a la bibliotheque, en-tete documente (helice + spirale + arrondi + poche circulaire par carre + arrondi = demi-cote).

Tests : suite 19/19 verte (helice, pleine passe, tours, arrondi, morph, zigzag inchanges) ; D25 verifie : hr=10, pas 0.1*D/tour, niveaux constants, G3 via arrondi, jamais de plongee verticale.

### 2026-09-32k

**FAO : strategie Adaptive pour l'ebauche 3D (pelage + trochoides, facon Adaptive Clearing).**

Le Debourrage (pocket3d rectangulaire) et le morph ne tiennent pas l'engagement constant : ae 50-60 % D, coins a 90 degres, retraits par passe. Nouvelle strategie `adaptive` sur l'op Ebauche 3D (fiche : Morph/Zigzag/Adaptive) : ae clampé a <= 0.25*D, ap profond constant (pas de raffinement ap2, comme Fusion qui garde la pleine profondeur), pelage centre->exterieur boucle par boucle apres une unique helice (chaque passe adjacente au vide, engagement d'un seul cote), liaisons G1 sans retrait dans la region (stay-down, 2 rapides par niveau), trochoides polygonales dans les goulets (largeur < 2.5*D). Mesure canal 50 mm D10 : 511 coupes continues, 2 rapides, helice, jamais dans la matiere.

Tests : `test_fao3d.cjs` etendu (moves, helice, bornes, stay-down <= 4 rapides, plus de passes qu'en morph, trochoide en goulet 15 mm) — TOUT EST CONFORME. Suite 19/19 verte.

### 2026-09-32l

**FAO : limites du proto Adaptive levees (arcs, brut restant, entrees) + fiche Ebauche 3D lisible.**

Moteur (`faoTrochSlot`, `faoShadowIntervals`, `faoRoughAdaptiveLevel`) : trochoides en vrais arcs G2/G3 (4 quarts CCW a 90 degres, IJK incremental — le test fente a prouve au passage qu'une ligne pile sur une arete vidait plein large a travers la piece : lecture matiere sur 3 lignes y±aeA), vide calcule avec l'ombre des niveaux superieurs (union des sections par pas <= 2 mm : jamais sous un porte-a-faux, ex. queue d'aronde), entree multi-spots (top-3 intervalles + centroide, rampe X ou Y selon le plus long run, micro-helice, region inusinable sautee sans move partiel), ordre de pelage selon l'ouverture (helice -> interieur d'abord, rampe -> exterieur d'abord).

Fiche Ebauche 3D reecrite en sections pour neophytes : Hauteurs (Haut/Bas), Strategie (libelles explicites + aide par strategie), Passes (ap Descente, ap2 Affinage, ae Pas lateral + ligne ae/ap en xO avec alerte si ae > 1/4 O en Adaptive), Matieres a laisser (Parois/Fond + fin), Trajectoire (Arrondi, Entree expliquee). Infobulles sur tous les champs (helpers `faoNum/faoSel/faoTxt/faoMini` + param `title`, `faoHelp`), boutons ↑↓x et selecteur d'outil titres, zone Limite clarifiee (Zone, Centre dedans/Outil dedans/Tout couvrir, Marge).

Tests : `test_fao3d.cjs` (arcs presents, rayons coherents, CCW, surplomb jamais touche en bas, fente ~O sans helice ni rampe possible) + `test_fao.cjs` (rendu fiche 3 strategies sans plantage) — TOUT EST CONFORME. Suite 19/19 verte.

### 2026-09-32m

**FAO : limites residuelles de l'Adaptive levees (trochoide bornee, ombre exacte).**

1. Trochoide : l'excursion en Y (±Rt) est clampee a la bande balayee (lignes extremes ± aeA/2 : au-dela on ne sait pas que c'est du vide) ; sans place pour un rayon >= 0.5 : repli en passe droite sur la ligne scannee (toujours sure). `faoTrochSlot` prend les bornes Y de la region.
2. Ombre exacte : `faoShadowPlanes` lit les Z vertex du maillage (dedup 1 µm, cap 160) au lieu de la grille 2 mm — tout voile horizontal, si fin soit-il, a ses faces aux Z vertex : aucun ne peut se cacher (croisements lineaires => union atteinte aux plans). `faoHelixSpot` accepte ces plans en option (Adaptive seul : morph/zigzag gardent le pas de 1 mm teste) ; plans partages ombre+helice par niveau, slices en cache. Le test voile 24.3-24.9 (hors grille) a prouve le trou de l'ancien balayage.

Tests : `test_fao3d.cjs` (clamp |dY| <= 1.25 sur bande nulle, repli droit sans arcs, voile jamais traverse en bas, depart helice a 26.9 au-dessus du voile) — TOUT EST CONFORME. Suite 19/19 verte.

### 2026-09-32n

**README : l'avancee FAO y est enfin raconte (31t a 32m).**

Le README datait de la 31i : aucune trace du fraisage. Ajout d'une section `FAO — fraisage 2.5D / 3D + G-code` (posages, outils Vc/fz, ops 2.5D + debourrage CAV-75-25, ebauche 3D Morph/Zigzag/Adaptive, geodesique, R/A, retrait, limites, G2/G3, posts 840D/Fagor, parallelisme au dessin), ligne `88-fao.js` dans la table d'architecture (20 -> 21 fichiers, ~12 400 -> ~16 100 lignes), 13 -> 19 suites, version et pistes a jour (CYCLE81, 3+2/5 axes).

Aucun changement fonctionnel — bump de tracabilite.

### 2026-10-01-001

**FAO P0 : post-processeurs fusionnes (un corps, dialecte en tete/pied) + plongee Fagor corrigee.**

`faoPostSiemens` / `faoPostFagor` (~150 lignes quasi jumeelles) remplaces par un seul `faoPost` : `FAO_POSTS` gagne un champ `kind` (siemens/fagor) qui porte tout le dialecte — commentaires `;` vs `( )`, lignes N## vs brutes, G71 separate ou combine, fin SUPA Z600 + parc machine vs retrait Z classique. Corps du programme unique (groupes, changements d'outil, moves, arcs) : la parite des sequences d'avance F entre dialectes devient structurelle.

Correction d'un bug reel : Fagor appliquait le F de plongee au premier G1 meme s'il n'avait pas de Z (test `first` nu vs `first&&/Z/.test(Z)` chez Siemens) — une zigue-zague de surfaçage demarrait donc a 30 % de l'avance de coupe. Correctif unifie : F de plongee uniquement sur la premiere plongee Z apres un rapide.

Tests : `test_fao.cjs` — parite de la sequence F (siemens vs fagor) + "F plongee jamais sur un move XY seul". Suite 19/19 verte.

### 2026-10-01-002

**FAO P0 : undo/redo, rapide + plongee pilotables, G40/G80 + garde-fou sous le brut, purge.**

1. **Annulable (P0-2)** : `faoSnapshot()` instantanie le document AVANT chaque mutation FAO (helpers `faoNum/faoTxt/faoSel/faoMini` + clics directs : oeil, posage, outil, op, corps, limitation chaine) — libelle = infobulle du widget dans le bouton « Annuler ». `docApplySnap` rafraichit desormais l'arbre FAO, la fiche et l'apres-Ctrl+Z.
2. **Rapide + plongee (P0-3)** : posage avec `rapide` (defaut 5000 mm/min) et `plungePct` (defaut 30 %) editables dans la fiche (rang Rapide G0 / Plongee % de F), pilotes par `faoRapide()`/`faoPlungePct()` : F de plongee des groupes, estimation des temps (carte op + stats) et migration des jobs plats.
3. **Securite post (P0-4)** : `G40 G80` en entete des deux dialectes (compensation d'outil + cycles en canneau annules au demarrage) ; garde-fou « coupe sous le brut » — tout G1/G2/G3 sous Z0 du brut compte + alerte `ATTENTION` en tete de programme et dans le resultat (`warns`), affichee a l'export.
4. **Purge (P0-5)** : `faoMeshTop` (jamais appele) et `faoRampEntry` (appele que par son propre test) supprimes avec leur test dedie.

Tests : `test_fao.cjs` — defauts posage, plongee 50 % emise en G-code (et 30 % absente), G40/G80 dialectes, alerte sous le brut (Siemens + Fagor), undo/redo bit a bit, rapide pris en compte dans les stats ; `test_fao3d.cjs` minus la rampe unitaire. Suite 19/19 verte.

### 2026-10-01-003

**FAO P1-a : perçage en cycles dialecte (CYCLE81/CYCLE83, G98 G81/G83) + pas de plongée Q.**

1. **Siemens 840D** : le bloc perçage n'ecrit plus le deroule G0/G1 mais `G0 X Y Z<retrait> F<plongee>` + `CYCLE81(RTP,RFP,SDIS,DP,)` par trou — parametres alignes sur `PostPro/630-5axes.cps` (RTP = brut+secu, RFP = ztop, SDIS = ecart de securite, DP = zbot, le tout relatif a l'origine).
2. **Fagor 8065** : `G98 G81 X Y Z<I> F` par trou (aligne sur `PostPro/fagor-8065.cps` : Z = plan de retrait, I = profondeur) + `G80` en fin de bloc (les cycles sont modaux sur Fagor).
3. **Broche a va-et-vient (Q)** : nouveau champ `peck` (fiche perçage, rang « Q pas », 0 = simple) — `CYCLE83` avec FDEP=RFP-Q, MDEP=Q, VARI=1 (retrait complet) cote Siemens ; `G98 G83 ... I=<-epaisseur/J> J=<nb plongees>` cote Fagor. Q superieur a l'epaisseur = repli sur le cycle simple.
4. **Inchange ailleurs** : le deroule G0/G1 reste la source de la previsualisation 3D, de l'estimation temps et du garde-fou « sous le brut » (meme valeurs secu/ztop/zbot) ; sequence d'avances F strictement identique entre dialectes (F de plongee horloge sur chaque G0 siemens = F de cycle fagor).

Tests : `test_fao.cjs` — golden CYCLE81 `(5.000, 0.000, 5.000, -20.000, )` et CYCLE83 `(5.000, 0.000, 5.000, -20.000, , -4.000...)`, golden Fagor `G98 G81 X20 Y20 Z5 I-20` / `G98 G83 ... I-4 J5`, annulation G80, absence des cycles inutiles sans Q, garde-fou toujours en cycle. Suite 19/19 verte.

README : le perçage en cycles sort des « pistes envisagees » et rejoint la ligne des post-processeurs.

### 2026-10-01-004

**FAO P1 : tests UI (œil, ↑/↓, +op, export) + estimation à 2 paramètres (accélération, changement d'outil).**

1. **Tests UI (P1-b)** : `test_fao.cjs` pilote maintenant l'arbre et les fiches dans appvm — œil de l'arbre (désactive/réactive l'op + stats à 1 op), boutons ↑/↓ de la fiche (borne haute en tête, bascule d'ordre, **annulable** via le snapshot Ctrl+Z), rang des 7 boutons « + op » (+1 opération du type choisi), export complet avec shims Blob/URL (G-code produit avec M30 + CYCLE81, nom `UITEST.mpf` capturé sur l'ancre). Découverte d'harnais : `tree.innerHTML=''` ne vide pas `children` dans le stub DOM — nettoyage manuel requis (le test existant le faisait déjà, l'hériter).
2. **Estimation (P1-c)** : 2 nouveaux paramètres posage — `accel` (mm/s², défaut 1000) et `toolChg` (secondes, défaut 30), éditables dans la fiche (rangée Accél. / Ch. outil, annulables). `faoEstimate` prend l'accélération : temps rapide réel `d/v + v/A` par déplacement (un rapide court coûte plus que sa longueur ; repli 1000 sans 4e argument). `faoStats` (extrait de `faoStatsText`) expose les groupes outil et le temps de changement `(nb de groupes − 1) × durée`, sommé dans le total.
3. Note de fiche mise à jour : « pas d'arcs, pas de cycles » était devenu faux (G2/G3 + CYCLE81).

Tests : `test_fao.cjs` — accélération (défauts + golden `t = d/v + v/A` sur un rapide 100 mm + monotonicité), changement d'outil (`groups===2`, delta exact `+2 min` pour 120 s), les 10 scénarios UI ci-dessus. Suite 19/19 verte.

### 2026-10-01-005

**FAO P2 : indexation 3+2 MVP (table C + B) — TRAORI(1) Siemens, alerte coordonnées Fagor.**

1. **Données** : `setup.orient={b,c}` en degrés (défaut `{0,0}` = usinage 3 axes strictement inchangé), helpers `faoOrient()` (arrondi 0.001, gère job absent) / `faoOrientOn()`. Cinématique validée par l'utilisateur : table **C** (rotation autour de Z) + **B** (bascule autour de Y).
2. **fiche posage** : rang « 3+2 B … C … ° » avec infobulles (repère pièce conservé côté Siemens, alerte Fagor) + bouton « 3 axes » (remise à plat) ; badge « · 3+2 B45 C0 » dans l'en-tête de l'arbre FAO quand actif.
3. **Siemens 840D** : en tête de programme `TRAORI(1)` + `G0 B.. C..` avant le premier outil (XYZ restent au repère pièce, arcs et cycles natifs inchangés), `TRAFOOF` en pied **avant** les coordonnées machine de fin (M9/SUPA/park/M30).
4. **Fagor 8065** : positionnement `G0 B.. C..` seul + commentaire dialecte `( 3+2 : B… C… — ATTENTION : coordonnées XYZ NON transformées …)` + alerte `warns` « sans transformation de coordonnées — XYZ non pré-tournés, valider impérativement en simulation / à vide » remontée à l'export et en tête de programme. Aucune transformation géométrique émise (choix explicite : Fagor averti en attente de confirmation de la fonction équivalente sur le 8065).

Tests : `test_fao.cjs` — défauts/arrondi/détection orient, golden Siemens `TRAORI(1)` avant `T1 D1` + `TRAFOOF` avant `M30` + 0 alerte, golden Fagor `G0 B45.000 C0.000` sans `TRAORI(1)` + 1 alerte + commentaire en tête, identité bit à bit du programme en `{0,0}` vs `orient` absent, rang UI 3+2 (saisie C + bouton 3 axes). Suite 19/19 verte.

README : 3+2 sorti des « pistes envisagées » (restent 5 axes continu, sauvegarde paramétrique, Electron), documenté côté posages et post-processeurs.

### 2026-10-01-006

**FAO P2 : rejeu auto de la limite « chaîne » — ances des germes, boucle re-suie à chaque rejeu, alerte stale.**

1. **Ancres à la validation** : `faoChainOk` mémorise désormais pour chaque GERME `anchors:[{m:[x,y,z],len}]` (milieu OCCT `mid` de l'arête, repli milieu du polyline) + `stale:false`. La boucle XY reste snapshotée (génération sans OCCT) ; les ancres permettent de la re-trouver.
2. **`faoChainRematch(op,edges)`** (pur, sans OCCT) : appariement injectif ancre→arête sur le nouveau solide — tolérance **XY 10 mm** (Z libre pour un changement de profondeur, pondéré), dérive de longueur ≤ 50 %, meilleur score `dxy + 0.1·dz + 5·dl`. Tous les germes requis : sinon la boucle figée est **conservée** et `stale=true`. Sinon tangentes re-déduites (`faoTangentSet` depuis les germes appariés), ordre (`faoOrderEdges`), boucle XY (`faoLoopFromChains`), cap 2000 pts factorisé (`faoChainLoopCap`), validation aire ≥ 1e-6. Ancres **figées** (tracking absolu, pas de dérive cumulée). État dérivé : **jamais de snapshot** (comme les projections).
3. **`faoChainReplay()`** : appelé par `buildDone()` (« fin de reconstruction », les 2 chemins exact + maillage) — scan du document (garde : sélection chaîne en cours, aucune ancre, OCCT absent, solide illisible → no-op), `occSharpEdges` listé une fois, rematch de toutes les ops, `faoChanged()` seulement si quelque chose a bougé.
4. **Signalement** : fiche posage — alerte orange « ⚠ Modèle modifié : arêtes non retrouvées… re-sélectionnez la chaîne » ; libellé arbre `[limite]⚠` ; **export** — `warns` + `ATTENTION` en tête de programme si une op active a sa chaîne obsolète (repli historique « re-sélectionner » désormais **signalé** au lieu d'être silencieux).
5. Anciens documents sans `anchors` : ignorés (boucle figée comme avant, zéro migration).

Tests : `test_fao.cjs` — capture (4 ancres sur carré 4 germes, aire 1200), traduction +5/−3 suivie, Z seul sans effet (boucle XY identique, `changed=false`), +50 mm hors tolérance → stale + boucle figée, retour modèle → stale levé + boucle restaurée, arête manquante → stale, sans ancres → `skipped`, tangente re-déduite (3 colinéaires → `nSel=3`, aire nulle → stale), replay no-op sans OCCT, câblage `buildDone` (stub compté), alerte fiche (« re-sélectionnez la chaîne »), export `ATTENTION` + warns=1. Suite 19/19 verte.

### 2026-10-01-007

**FAO 3+2 corrigé : Fagor 8065 = machine 3 axes — aucun B/C émis, indexation refusée avec alerte.**

Correction d'un présupposé faux de la 005 (« Fagor averti, positionnement B/C seul ») : l'utilisateur confirme que son **Fagor 8065 est une machine 3 axes** — commander `G0 B.. C..` y provoquerait une **alarme CN** (aucun axe rotatif), et émettre un programme « indexé » serait impossible.

1. **faoPost (Fagor + 3+2 actif)** : suppression de `G0 B.. C..` — **aucune commande B/C** dans le programme. À la place : commentaire dialecte `( 3+2 : B… C… demandé — machine 3 axes : B/C NON commandés, usinage à plat (voir avertissement))` + `warns` « Fagor 8065 = machine 3 axes — indexation IGNORÉE : B/C non commandés, programme émis en 3 axes (la pièce ne sera PAS inclinée). Remettre 3 axes ou exporter sur Siemens. » remonté en `ATTENTION` en tête de programme et à l'export.
2. **Fiche posage** : alerte orange immédiate (rafraîchie à chaque changement) quand la machine du posage est Fagor **et** B/C ≠ 0 : « ⚠ Fagor 8065 = machine 3 axes : cette indexation 3+2 sera IGNORÉE à l'export (programme émis à plat, aucun B/C). » Infobulle du champ B alignée.
3. **Siemens inchangé** : `TRAORI(1)` + `G0 B.. C..` en tête, `TRAFOOF` en pied, XYZ en repère pièce. `{0,0}` toujours bit à bit identique (aucune trace 3+2, test d'identité conservé).

Tests : `test_fao.cjs` — golden Fagor repris : `!/G0 B/` (aucun B/C émis), pas de `TRAORI(1)`, warns=1 avec `machine 3 axes` + `IGNORÉE`, commentaire en tête avec `B/C NON commandés` ; nouveau test fiche : machine Fagor + B45 → alerte « machine 3 axes » / « IGNORÉE » visible (restauration machine/orient ensuite). Suite 19/19 verte.

README : ligne post-processeurs mise à jour (Fagor = 3 axes, indexation refusée).

### 2026-10-01-008

**FAO 3 demandes : plan de travail 3+2 cliqué sur la pièce, brut en 3 sources, surfaçage passes + écart liés.**

1. **Plan sur la pièce (3+2)** : bouton « Sur la pièce » dans le rang 3+2 de la fiche → mode pointeur (curseur croix, Échap annule, exclusif avec les autres modes) ; clic sur une **face sortante** → normale (`hit.face.normal` transformée par `matrixWorld`) → `faoOrientFromNormal(nx,ny,nz)` pur : `C = atan2(−ny,nx)`, `r = hypot(nx,ny)`, `B = atan2(−r,nz)` (degrés, règle main droite, arrondi 0,01°). Face tournée vers le **bas** (`nz<0`) : refusée avec message « pièce à retourner » (aucune modification). Application : snapshot annulable + `setup.orient={b,c}` + message de vérification des sens machine (conventions non vérifiables depuis le CAD). `{0,0}` (face +Z) = aucun changement, 3 axes bit à bit intact.
2. **Brut en 3 sources** (`setup.stockSrc`) : **Tous les corps** (défaut, inchangé — bbox des corps visibles + marge), **Corps choisi** (`setup.stockBody` — bbox d'un seul corps, pour un barreau importé à côté du brut ; corps introuvable → repli mémorisé), **Manuel** (6 champs `X0..Z1` repère monde, **jamais recalculé** ; bascule en manuel fige la boîte courante, « MAJ brut » masqué). Fiche « Brut · bridage » : rang Source (select 3 modes) + select Corps ou hint « aucun corps visible » + 2 rangs de 3 champs numériques.
3. **Surfaçage : Passes ET écart liés** : `op.np≥2` pilote le générateur (`ae = H/(np−1)`, `H = (y1−y0)+Ø`, écart exact → **couverture totale garantie**, dernière passe alignée sur la lisière) ; `np` absent/null → pilotage par `ae` (**rétrocompat totale**, golden `facing=34` inchangé). Champs carte op liés : saisir **Passes** recalcule l'écart, saisir **écart** efface `np` (le nombre affiché devient le compte de lignes, écarts voisins égaux + dernière raccourcie). Helpers pures `faoFacingAe(stock,D,np)` / `faoFacingCount(stock,D,ae)` (même logique de boucle que le générateur).

Tests : `test_fao.cjs` — `faoOrientFromNormal` (+Z→B0 C0, +X→B−90 C0, +Y→B−90 C−90, normalisation, face basse→down), garde plan sans corps + annulation + exclusivité chaîne, bouton fiche présent ; brut : mode défaut/mémoire, manuel stable à chaque appel, corps choisi introuvable→repli, UI Source 3 options, 2 rangs X0..Z1, « MAJ brut » masqué en manuel, saisie X0 appliquée, hint corps absent ; surfaçage : `faoFacingAe(3)=45`/`np<2=null`, `faoFacingCount(45)=3`/`(6)=16`, générateur np=3 → lignes y=−5/40/85, sans np → lignes = `faoFacingCount`, `faoOpMoves` np=3→3 niveaux / np absent→compat, carte Passes/écart liés (Passes=3 → écart recalculé ; écart=7 → np effacé). Suite 19/19 verte, `facing=34 pocket=65 contour=7 drill=8` intact.

README : posages (bouton « Sur la pièce »), brut 3 sources, surfaçage passes/écart documentés.

### 2026-10-01-009

**FAO brut : le corps choisi devient invisible dès qu'il est choisi — désignation directe dans l'arbre (📦).**

1. **Masquage automatique** (`faoStockBodySet(bodyId,setup)` / `faoStockBodyRestore` / `faoStockBodyHide_`) : dès qu'un corps est désigné comme brut (select « Brut = » de la fiche OU clic 📦 dans l'arbre), `doc.bodyVis[id]=false` + `mesh.visible=false` — le corps **reste dans `bodies`** (mesh présent : la bbox du brut suit sa géométrie, seule sa vue est off ; `faoStock()` mode body l'inclut **même masqué**, le masquage ne fige jamais le brut). L'ancien corps choisi est restauré au changement de choix — **on ne défait que ce qu'on a fait** (`stockBodyHid` : si le corps était déjà masqué avant le choix, il le reste après le retrait). **Garde-fou** : si le corps choisi est le seul visible, pas de masquage (la vue ne se vide jamais). Snapshot annulable (Ctrl+Z) sur chaque désignation.
2. **Arbre** : chaque en-tête de corps porte l'icône **📦** (opacité 0,35, pleine sur le brut choisi) — clic = désigner/retirer le brut (mutuellement exclusif avec les clics ▶/👁), badge plein + ligne grisée une fois brut. Le titre de la ligne documente le geste.
3. **`bodyToggleVis` (œil du corps)** : si le corps est masqué comme brut (`bodyVis=false`), l'œil le **ré-affiche** (supprime `bodyVis[id]`, `stockBodyHid=false`, `refreshParts`) **sans toucher aux features** — ni rejeu, ni sortie du rejeu ; simple visibilité. Sinon comportement historique inchangé (toggle des fonctions du corps).
4. **Fiche** : select « Brut = » et select Source passent par `faoStockBodySet` (masquage/restauration inclus) ; infobulles mises à jour.

Tests : `test_fao.cjs` — désignation (mode+corps+flag, `bodyVis=false`+invisible, l'autre visible), changement A→B (ancien restauré, nouveau masqué), retrait (mode bodies + visible), garde seul-corps (jamais masqué), arbre : badge 📦 présent, clic simulé = désigne+masque, badge plein, 2ᵉ clic = retire+visible, nettoyage. Suite 19/19 verte.

README : posages — « 📦 dans l'arbre = désigner le brut ; le corps choisi est masqué dans la vue (œil pour le revoir) ».

### 2026-10-01-010

**FAO surfaçage : passes en Z / brut — le pas (ap) est CALCULÉ depuis le nombre de passes.**

1. **Générateur** (`faoGenFacing`) : nouveau pilotage `op.npz` — **l'ébauche descend du dessus du brut (`z1`) jusqu'à la cote `Z` en `pz` passes égales**, `ap = (z1−Z)/pz` (arrondi 0,001 mm), dernière passe = cote exacte. Le boustrophédon se poursuit d'un niveau au suivant : niveaux pairs montent en Y, impairs descendent, et le **changement de niveau se fait en plongée Z aux lisières/dépassements — jamais de traversée diagonale dans la matière**. `pz` absent/`1`, ou `Z ≥ z1` (rien à enlever) → **une seule passe, comportement strictement historique** (golden `facing=34` intact).
2. **Helper** `faoFacingAp(stock,z,npz)` : `ap = (z1−z)/npz` en lecture seule, `null` si `pz<2` ou `z≥z1`.
3. **`faoOpMoves`** transmet `op.npz` au générateur ; **carte op « pz »** : champ Passes Z (défaut 1) + libellé **`ap …` calculé et affiché en lecture seule** — saisir `pz≥2` pose `op.npz`, saisir `1` efface (mode historique). `ap` reflète la cote réelle (Z + laisse axiale) comme le génère.
4. Persistance `op.npz` dans le document, snapshot annulable (Ctrl+Z) via `faoNum`.

Tests : `test_fao.cjs` — `pz=4` sur `z1=40→0` → niveaux `0/10/20/30` (ap=10) ; `pz` absent = passe unique **et structure identique à l'historique** (`zN.length===gNA.length`) ; `pz=1` ≡ absent ; 3 plongées inter-niveau toutes en lisière (hors matière) ; aucune coupe au-dessus du brut ; `faoFacingAp` (cas4/1/0/z≥z1) ; `faoOpMoves` avec `op.npz=4` sur `z1=25→0` (4 niveaux, ap=6.25) et `npz` absent → golden ; carte UI : champ `pz` défaut 1, `pz=4` → `op.npz=4` + label `ap 6.25`, `pz=1` → `npz` effacé. Suite 19/19 verte, `facing=34` intact.

README : surfaçage — « + « pz » : passes en Z / brut — ap = (Z1−Z)/pz calculé et affiché, pz=1 = passe unique ».

### 2026-10-01-011

**FAO surfaçage : plus de redondance — un SEUL paramètre de recouvrement XY : l'« écart ».**

1. **Carte op** : le champ **« Passes » est supprimé** (plus de double saisie passes/écart qui se recalculent l'un l'autre). Reste **« écart »** (ae) = le recouvrement du fraiseur, avec le **nombre de lignes affiché en lecture seule** juste à droite (`16 lignes`), recalculé à chaque saisie.
2. **Rétrocompatibilité documents anciens** : une op encore pilotée par `op.np` (ancien champ Passes) est **lue telle quelle** — l'écart affiché = `H/(np−1)` et le compteur de lignes = `np` ; **saisir l'écart bascule définitivement** en pilotage par écart (`op.np=null`). Le générateur (`faoGenFacing`) conserve le pilotage `np` pour lire ces documents.
3. Le champ **« pz »** (passes en Z, `ap` calculé) de la version 010 reste tel quel — même philosophie : un champ saisissable + valeur calculée en lecture seule.

Tests : `test_fao.cjs` — carte sans champ Passes (`!npF && !!aeF`), libellé `16 lignes` en lecture seule, saisie `écart=7` respectée, document ancien `np=3` affiche `45` + `3 lignes`, saisie de l'écart bascule (`ae=7, np=null`). Suites logiques 008 (générations np) inchangées. Suite 19/19 verte, golden `facing=34` intact.

README : surfaçage — « 'écart' : seul paramètre de recouvrement XY, nombre de lignes en lecture seule, ancien champ 'Passes' supprimé ».

### 2026-10-01-012

**FAO : ▶ Viewer d'usinage — le brut, l'outil et la trace animés, avec lecture / pause / stop.**

1. **Bouton « ▶ Usinage »** (fiche posage, rangée « Générer + aperçu ») : toggle lecture/pause. **Au lancement** : (a) les **traces sont cachées** (`faoPrevGroup.visible=false`, non destructif — restauration exacte à la fermeture, et tout regénéré pendant le viewer reste caché), (b) **le brut apparaît** : boîte `faoStock()` semi-transparente + arêtes (or), et si un corps est masqué comme brut (v009) il **réapparaît** pendant la séance (re-masqué au close, `doc.bodyVis` inchangé), (c) l'**outil** est créé (fraisier Ø1×30 mm vertical pointe en bas, mandrin, `raycast` off) + la **trace progressive** se dessine au fil de l'eau (polyline continue, couleur par vertex : vert coupe / rouge rapide, `setDrawRange` avançant), (d) la **barre transporteur** apparaît.
2. **Barre flottante** (bas de la vue, `#faoViewerBar`) : **▶ lecture · ⏸ pause · ⏹ stop** (retour au début) · **✕ fermer** (tout restaure), temps `mm:ss / mm:ss · %`, **vitesse ×1…×20**. rAF autonome (dt plafonné à 0,25 s), **pause automatique en fin de parcours**.
3. **Logique pure** : `faoViewerBuild(setup)` — points (arcs développés via `faoArcSegs`), Ø outil par point, **temps cumulés réels** (coupe = `faoToolSF().f`, rapide = `faoRapide()`, longueurs = `faoSegLen`) ; `faoViewerSeek(state,t)` — interpolation linéaire + idx incrémental **avec retour arrière** ; `faoViewerAdvance(dt)` — avance ×vitesse, plafond `T` → pause. Ops `on===false` ignorées.
4. `faoRefreshPreview` force `visible=false` du groupe si un viewer tourne (aucune réapparition de traces).

Tests : `test_fao.cjs` — build (points, `times.length===pts.length`, `T>0`), seek (t=0 / 50% / fin `done` / retour arrière réinitialise l'idx), aucune op → rien à jouer, ouverture (lecture, traces cachées, brut+outil+trace+barre), avance ×1 exacte, `drawn≥2, outil sur le parcours (bornes élargies), pause qui fige, vitesse ×5, fin auto (`t===T`, trace complète), stop au départ, fermeture (état libéré, traces restaurées, barre masquée). Suite 19/19 verte, golden `facing=34` intact.

README : post-processeurs — « ▶ Viewer d'usinage : cache les traces, affiche le brut, anime l'outil + trace au fil de l'eau, barre ▶⏸⏹✕ avec vitesse ×1 à ×20 ».

### 2026-10-01-013

**FAO : sortie du mode lecture usinage garantie + matière usinée qui disparaît sous l'outil.**

1. **Sortir du mode lecture — 3 chemins, tous nettoyés** : pendant la séance le bouton de la fiche devient **« ■ Quitter l'usinage »** (bascule ouvrir/fermer via `faoViewerToggle`), **Échap** sort aussi (bind unique dans `faoInitUI`), et le **✕** de la barre fait le même **nettoyage complet** : outil retiré, boîte du brut retirée, matière voxel retirée, trace progressive retirée, **traces ré-affichées selon `faoPrevOn`**, corps v009 re-masqué (`doc.bodyVis` inchangé), **corps masqués pour la matière réaffichés en respectant `doc.bodyVis`**, barre masquée, `faoVw=null` + libellé du bouton réinitialisé. Plus aucun état « mi-ouvert » possible.
2. **Jamais silencieux** : `faoViewerOpen` est wrappé entièrement (try/catch + **rollback `faoViewerClose()`** + message `faceEl`), « aucune trajectoire à jouer » affiche un message explicite au lieu d'un bouton mort, start/stop/logout aussi.
3. **« Générer + aperçu » ré-affiche TOUJOURS les traces** : `faoPreviewGenerate()` force `faoPrevOn=true` + remet le libellé du bouton à « Masquer » — cause racine du bug « plus de traces même après Générer » (un ancien « Masquer » rendait les traces invisibles à vie).
4. **Matière usinée voxelisée** : logique pure — `faoMatterGrid(s,pas)` (grille ~40k voxels max, pas auto `cbrt(vol/40000)`, plafond 200k avec itérations), `faoMatterCarveSeg` (voxels centres à distance ≤ Ø/2 du segment balayé ET `z ≥ min(zA,zB)−pas/2` : la matière sous la pointe reste), `faoMatterCarveTo` (rattrapage 0→t, segment en cours interpolé, G0 ignorés). Scène : `InstancedMesh` de cubes joints (`raycast` off), enlèvement par frame (scale 0 sur les indices tués), **toggle « ◼ matière » dans la barre** (défaut ON), **corps visibles masqués pendant la matière** (`vw.hideBodies`, refs locales — préservées par un rebuild au Stop), **Stop = matière entièrement restaurée**, toggle OFF = retrait + corps réaffichés, toggle ON = reconstruction + rattrapage à `t`, `refreshParts` ré-applique les masquages du viewer.

Tests : `test_fao.cjs` — grille (auto ≤ ~40k, pas 5 → 20×16×5), carve (sous l'outil tué / hors rayon vit / sous la pointe vit / rayon 0 → rien), carveTo (G0 n'enlève rien, segment en cours à t=2 déjà coupe, t<0 rien), ouverture matière + corps masqués, avance ×10 s enlève de la matière, Stop restaure, toggles OFF/ON, sortie = état libéré + matière retirée + corps réaffichés + traces réaffichées + barre masquée, bascule du bouton (libellés), « Générer + aperçu » force l'affichage. Suite 19/19 verte, golden `facing=34` intact. Diagnostic Node avec three.js réel : 41 595 voxels, 23 tués en 10 s, reset/toggles/close OK.

README : viewer — sortie du mode garantie (bouton Quitter + Échap + ✕, nettoyage complet outil/brut/matière) ; matière voxelisée « ◼ matière » (la matière usinée disparaît sous l'outil, toggle dans la barre).

### 2026-10-01-014

**FAO : fenêtre flottante « Outils » — la bibliothèque d'outils du posage en fenêtre dédiée.**

1. **Deux boutons d'accès « Outils »** : (a) **fiche posage**, rang « Nom » (à côté du nom, infobulle « fenêtre flottante, Échap ou ✕ pour fermer »), (b) **arbre FAO** (à côté de « + Posage », rang flex). Les deux font basculer `faoToolsWindowToggle` (ouvre si fermée, ferme si ouverte).
2. **La fenêtre** (`#faoToolsWin`, centrée, `z-index:40`) : entête « Outils · <nom du posage> » + **✕**, corps = **le composant existant `faoToolsElement(setup)`** (cartes éditables nom/type/D/r/dents/Vc/fz avec S/F calculé, ✕ supprimer, « + Outil » avec snapshot annulable). Créée à la volée à chaque ouverture — **contenu reconstruit** sur l'**setup actif du moment** (changement de posage suivi), retirée du DOM à la fermeture (aucun doublon).
3. **Fermeture** : **✕** de la fenêtre, **Échap** (prioritaire sur le viewer : si la fenêtre est ouverte, Échap la ferme d'abord — le viewer n'est touché qu'au coup suivant), ou re-clic sur l'un des deux boutons. Refs globales (`faoToolsWin/X/Body/T`) : le harnais ne re-lit jamais par id (auto-création des stubs).
4. **Ref réelle du panneau arbre** : `faoTreeWrapEl` remplace la garde `getElementById('faoTreeWrap')` dans `faoInitUI` (sous stub, l'id auto-créé bloquait la création de l'arbre) ; le rendu de l'arbre passe toujours par `getElementById('faoTree')` (inchangé).

Tests : `test_fao.cjs` — ouverture (titre posage actif, contenu biblio), « + Outil » depuis la fenêtre (compteur outils +1), ✕ ferme (nœud détaché + display none), Échap ferme, **Échap ferme la fenêtre AVANT le viewer** puis 2ᵉ Échap quitte le viewer, bouton fiche bascule, bouton arbre ouvre. Suite 19/19 verte, golden `facing=34` intact.

README : bibliothèque d'outils — bouton « Outils » (fiche posage + arbre FAO) → fenêtre flottante fermable (Échap/✕) avec la bibliothèque éditable.

### 2026-10-01-015

**FAO viewer : la matière usinée passe des « multi cubes » à une surface Z-map pleine.**

1. **Retour navigateur** : le rendu 013 (InstancedMesh de ~40k cubes séparés à 94 %) donnait un effet « briques/Lego » jugé incorrect — **idée revue** : on simule comme un vrai simulateur CAM (méthode Z-map).
2. **Rendu** : **un seul mesh** (`BufferGeometry` non indexé, Phong plat, DoubleSide) de **colonnes jointives** : par cellule (nx×ny) un top à 2 triangles + 4 côtés, le côté étant **replié (quad nul) si le voisin est plus haut** → jamais deux faces coplanaires, aucun joint, aspect bloc plein usiné avec paliers nets ; fond plein statique sous le brut. Hauteur de colonne = z du dernier voxel vivant de `alive[]` (`faoMatterColTop`) — **la logique de grille/carve/VCE est inchangée** (tests 013 intacts).
3. **Mise à jour diff** : `faoViewerMatterKill` recalcule la hauteur des colonnes touchées par les voxels tués, réécrit leurs 30 verts + ceux des 4 voisins (leur côté vers elles change) + `needsUpdate` — ni `computeVertexNormals`, ni reconstruction par frame. Mémoire ~30 verts/cellule, une passe à l'ouverture.
4. **Bug corrigé au passage** : `faoMatterCarveTo` à `t=0` appliquait déjà le point de départ (segment 0 interpolé à f=0) → **trou usiné avant même la lecture** (matière entamée dès l'ouverture/Stop). Fix : `if(!(t>0))return []` — « t≤0 : rien n'a été joué ». La matière n'est plus entamée qu'à la lecture.
5. États : `vw.mTops` (Float32Array, une hauteur/colonne) + `vw.mArr` (positions) gérés comme le reste (toggle OFF/ON, Stop, close → tout libéré).

Tests : `test_fao.cjs` — bloc **015** : une hauteur par colonne, géométrie = 30 verts/colonne + fond (`(nc*30+6)*3` floats), brut plein au départ (tolérance Float32 1e-4), avance = colonnes entamées + d'autres restent pleines, Stop = surface restaurée pleine, toggle OFF/ON, sortie = état libéré. Suite 19/19 verte, golden `facing=34` intact.

README : viewer — matière « en surface Z-map » (un seul mesh, colonnes jointives, le sommet descend sous l'outil, plus de cubes).

### 2026-10-01-016

**FAO viewer : la Z-map descend à la cote EXACTE de coupe — le Z est collé à l'outil.**

1. **Retour navigateur** (v015) : XY nickel mais **Z décalé** — « on dirait qu'il enlève la passe d'après », la matière enlevée en Z n'est pas collée à l'outil.
2. **Cause** : la hauteur de colonne venait du **sommet du plus haut voxel vivant** → quantification au voxel : l'écart à la cote va jusqu'à **presque 1 pas entier SOUS la cote** (mesure, pas 1.71 : passe à 20.5 → surface à 18.81 ; 16 → 15.39 ; 11.5 → 10.26). Avec un pas de passe `ap` du même ordre, ça se lit comme « une passe en trop ».
3. **Fix — Z-map continue (le vrai modèle)** : `faoMatterGrid` alloue **`g.h` = un Float32Array de nx×ny hauteurs** (init = sommet du brut). `faoMatterCarveSeg` fait en plus du kill voxel : `h[c] = min(h[c], max(z0, min(az,bz)))` sur chaque colonne touchée → **la surface prend la cote de coupe de l'outil, continue (pas de quantification)**. `faoMatterColTop` lit `h` (repli au scan `alive[]` si absente) → le rendu (tops, côtés, diff) est inchangé, seulement la valeur est juste. `alive[]` reste la logique de coupe (tests 013 intacts).
4. **Mesure avant → après** : écarts par passe 1.69 / 0.61 / 1.24 / 0.16 → **0.000 sur les 4 passes** (+ fin de parcours = cote finale exacte).
5. Caractéristiques conservées : monotone (min-cumulé, jamais de remontée), clampé au fond du brut, rattrapage/toggle/Stop = reconstruction propre.

Tests : `test_fao.cjs` — bloc **016** : grille porte une hauteur/colonne, plein au départ, coupe à 17.5 → surface **17.5 exacte**, hors rayon intact, 2ᵉ passe → 12 exact (monotone), vivant sous la pointe. Suite 21/21 verte, golden `facing=34` intact.

README : viewer — surface Z-map à la cote exacte de coupe sous l'outil.

### 2026-10-01-017

**FAO : 4 retours navigateur — gel après arc, brut qui déborde, surfaçage mordant, champ « Sortie ».**

1. **Gel de 3-5 s après chaque arc** (retour) : à la fin de chaque arc, la lecture s'arrêtait puis repartait. **Cause** : `faoViewerBuild` développait l'arc (`faoArcSegs`) puis repoussait **aussi** le move original — ce doublon porte encore `.arc`, `faoSegLen` recalculait un centre faux depuis le bout du développé (`i`/`j` relatifs au VRAI départ) → angle ≈ 2π → temps fictif (3.16 s mesurés) sur un segment de longueur **0** (`L=0.0 Lexp=52.6`). **Fix** : le doublon est repoussé **sans `.arc`** (`{x,y,z,r}`) → `dt=0`, temps monotone intact (les `times` n'étaient pas fautifs, seulement le segment de raccord).
2. **Brut « un poil trop long » côté X** (retour) : `nx=ceil((x1−x0)/pas)` → `ox+nx·pas > x1` (dépassement d'au plus 1 pas, **d'un seul côté**) et la hauteur init était calée sur `oz+nz·pas` (jusqu'à ~0.8 mm **au-dessus** de `z1`). **Fix** : la grille porte ses **extents réels** (`sx1/sy1/sz1`, `full = z1 exact`) ; le rendu Z-map (30 verts/colonne ET le fond) est **clampé** à `x1/y1` exacts, `h[]` et `mTops[]` démarrent à `z1` — la Z-map coïncide avec la boîte du brut.
3. **Surfaçage : la 1ʳᵉ passe « tangente à l'arête »** (retour) : les lignes extrêmes étaient à `y0−r` / `y1+r` — le bord de l'outil **longeait** l'arête sans mordre. **Fix** : helper `faoFacingYs(stock,r,ae)` — **mordant dans la matière = la valeur d'écart, plafonnée au rayon** (`m=min(ae,r)`), appliqué à la 1ʳᵉ ET à la dernière ligne (les deux arêtes sont mordues symétriquement ; la ligne reste hors-matière en X par le dépassement `dep`). `faoFacingCount` et `faoGenFacing` **partagent le helper** → le label « N lignes » en lecture seule reste exact.
4. **Paramètre de sortie de pièce** (retour : « 5 à 10 mm ») : le paramètre existait sous le nom obscur **« Sécur »** (`setup.secu`, mm au-dessus du brut, défaut 5 — déjà appliqué aux G0, à la fin de parcours viewer ET au CYCLE81). **Fix UX** : rang de fiche renommé **« Sortie »** + infobulle explicite (« dégagement Z au-dessus du brut : retrait des G0, fin de chaque opération et fin de parcours — viewer + G-code ; généralement 5 à 10 ») ; le **nom de champ `secu` est conservé** (documents, exports et posts inchangés).

Tests : `test_fao.cjs` — blocs **017-020** : 017 aucun `dt>0.05` sur segment nul après développement d'arcs (parcours arrondi, 44 pts) ; 018 extents réels (grille dépasse bien x1/y1 mesuré, rendu clampé à X1/Y1/Z1) ; 019 mordant (1ʳᵉ ligne à y0 exact = mord de `min(ae,r)=5`, dernière à y1, lignes = `faoFacingCount`) ; 020 Sortie (`setup.secu=10` → sortie finale 35 = z1+10, label « Sortie » en fiche). Ajustements des 3 asserts historiques impactés par le mordant (count `ae=6` 16→15, lignes np=3 → 0/45/80, plongées inter-niveaux vérifiées hors matière **par X en dépassement**) + isolement du bloc 015 (setup dédié avec coupe sous z1, la surface ne peut plus « bouger » à z=z1) et du dispatch chaîne (`ae=40` : une ligne réellement intérieure au lieu de la frontière). Suite FAO verte ; `npm test` 22/23 (KO `test_precision_affichage` = déflection d'affichage, fichiers d'une autre session en cours, hors périmètre FAO), golden `facing=32 pocket=65 contour=7 drill=8` (affichage seul, non asserté).

README : surfaçage — « 1ʳᵉ et dernière ligne à mordant (l'écart morde dans la matière, plafond rayon) » ; posage — champ « Sortie » (mm au-dessus du brut, défaut 5) renommé depuis « Sécur » ; viewer — brut aux extents exacts (plus de débordement d'un pas), gel après arcs corrigé.

### 2026-10-01-018

**Viewer 3D : un import STEP ne disparaît plus, arêtes tangentes communes au natif, affichage 2× plus fin — FAO inchangée.**

1. **Un STEP importé disparaissait après la création d'une esquisse** (gel historique « STEP infaillible ») : **Cause** — le mesh d'import vivait dans la chaîne du document, or `clearBodies()` (`src/10`) et `commitPrev()` (`src/30`) appellent `geometry.dispose()` à chaque reconstruction : le mesh d'un import était donc **libéré pendant qu'il était encore affiché**, et la reconstruction suivante (création d'esquisse, découpe, annuler/rétablir) le rendait invisible sans le recréer. **Fix** : `importHydrate()` est appelé en tête de `rebuildInner()` (réattache le mesh d'import, qui n'entre jamais dans la boucle de rebuild) ; `clearBodies()` et `commitPrev()` **ne libèrent plus** un mesh vivant d'import (ni son `b._faoGeo`) ; table `importGeom` (`Map id → {mesh, edges, faoGeo}`, hors `doc`, reprise après une réinitialisation) + `importMeshesOfDoc()`, `importOwnedMeshes()`, `importIdStillReachable(id)`.
   Tests : `test_import_vie.cjs` **15/15** (import seul, import + natif, esquisse/découpe, annuler/rétablir ×N, `clearBodies`, réinitialisation) ; **10 échecs** sur un build de contrôle construit sans ces changements.
2. **STEP sans arêtes tangentes + ~150-300 objets dans la scène** : l'overlay d'arêtes en créait **un `THREE.LineSegments` par arête** (trispartés, raycast à refuser un par un) et l'import ne portait aucune arête — rendu différent du natif. **Fix** : `occSharpEdges(shape)` extrait les arêtes **une fois** à l'import (avant `shape.delete()`) → `entry.edges` ; `edgeOverlayData()` + `buildEdgeOverlay()` produisent **un seul** objet `vertexColors` (arête vive `0x000000`, tangente `0x8e9399`, `l.raycast=()=>{}`) partagé natif + import.
   Tests : `test_aretes_import.cjs` **15/15** (STEP seul, duo natif+STEP = même tracé 27 arêtes, 1 objet) ; contrôle = `edgeOverlayData absente`.
3. **Affichage 2× plus grossier que le noyau** : le viewer réutilisait `occXDefl()` (lin 0,3 / ang 0,25), déflection **calibrée pour la FAO** → cercles à 11 segments, arêtes de cylindre à 29°, 5 352 tris pour 10 fonctions. **Fix** : `occDisplayDefl(shape)` (lin borné `[0,05 ; 0,35]` = `dg/1600` de la plus grande dimension, ang **0,2**) + `occTessellateBudget(shape, D, 400 000 tris)` (paliers grossiers lin×4 / ang×2 si le budget est dépassé), utilisés par `occRebuild` **et** `importSTEP` → mêmes finesse et arêtes entre natif et STEP ; `occXDefl()` **strictement inchangée**.
   **Mesure** (banc three.js réel, pièce « Coque et Dépouilles » 10 fonctions) : **5 352 → 8 408 tris** (+57 %), rejeu chaud 549 → 655 ms dont **+70 ms** de tessellation (replay OCCT 367 → 381 ms ≈, `importHydrate` et overlay = 0 ms) ; l'essai `dg/4000` (12 154 tris, +120 ms) a été écarté comme sur-investi.
   Tests : `test_precision_affichage.cjs` **16/16** (déflection commune natif/STEP, bornes `[0,05 ; 0,35]`, budget de triangles).
4. **FAO inchangée (garde-fou)** : `faoMeshFromBody` est **wrappé** dans `src/90` (`_faoMeshFromBodyOrig`, `faoLegacyGeo`) — `src/88-fao.js` et `tests/test_fao.cjs` jamais édités. Le corps exact est retessellé avec `occXDefl()` **après** `occt.BRepTools.Clean(shape)` (OCCT **réutilise** un maillage existant s'il est au moins aussi fin : sans `Clean`, un raffinement serait impossible et un rejeu plus grossier resterait au maillage fin). `importSTEP` pose d'abord `entry.faoGeo = occTessellate(shape, 0.5, 0.5)` **avant** la finesse d'affichage → l'import conserve le maillage FAO d'origine.
   Tests : `test_fao_lock.cjs` **13/13** (corps exact = 100 tris FAO vs 444-484 tris affichage, cache par corps, congés → `[0.2,0.25]`, import → `[[0.5,0.5],[…]]`, import sans retessellation FAO).

Tests : 4 nouvelles suites enregistrées dans `tests/run.cjs` → **`npm test` 23/23 vert** sur `fusion_mvp.html` ; les 4 échouent sur un build de contrôle sans ces changements (preuve de régression). Discipline : `node --check src/*.js` après chaque édition (une double ligne `return g;}` a rendu un build injouable en silence).

README : viewer — « un import STEP ne disparaît plus après une modification (esquisse, annuler/rétablir) », arêtes tangentes affichées avec le natif **en un seul objet**, affichage plus fin et commun natif/STEP (déflection d'affichage bornée + budget 400 000 tris) ; FAO — `occXDefl()` préservée.

### 2026-10-01-019

**FAO : la matière descend à CHAQUE passe (gel Z-map corrigé) + sortie de pièce réglable, rappelée en fiche surfaçage.**

1. **Retour** : « toute la matière n'est pas correctement enlevée — 1ʳᵉ passe OK, 2ᵉ OK, **3ᵉ KO**, 4ᵉ OK, **dernière KO** » (alternance). **Cause** : dans `faoMatterCarveSeg`, la mise à jour de `h[c]` était **imbriquée dans le kill voxel** — la Z-map ne descendait que si **au moins un voxel vivant était tué**. Or les cotes de passe tombent parfois **entre les centres des voxels** (ou la colonne est déjà vidée par la passe précédente : centres restants < `zmin`) → aucun kill → `h[c]` **gelait** à la passe précédente → la passe n'enlevait rien à l'affichage. L'alternance OK/KO suit exactement l'alignement des cotes sur les centres. **Fix** : le test XY est fait **une fois par colonne** (indépendant de `k` — le segment balaye toute la hauteur) et `h[c]=min(h[c],zc)` est posé pour **toute colonne touchée en XY**, vivante ou non ; les kills (`alive[]`, `out`) sont strictement inchangés. Bonus : le calcul de distance n'est plus refait à chaque voxel.
2. **Sortie de pièce réglable** (« j'ai juste besoin d'une zone texte pour dire de combien je sors ») : le dépassement XY en bout de ligne était codé en dur `dep=r+2` — le bord ne sortait que de **2 mm**, réglage impossible. **Fix** : `dep = r + sortie` — le champ « Sortie » pilote désormais **(1)** le retrait Z au-dessus du brut **et (2)** le dépassement XY avant le demi-tour ; `step` 0,5 sur les deux champs (demi-millimètres libres).
3. **Rappel en fiche surfaçage** : le réglage (de posage, commun à toutes les opérations) est **ré-affiché et éditable dans la fiche de l'opération Surfaçage** (rang « Sortie » après « Arrondi »), infobulle rappelant les deux effets — on règle la passe là, on voit la sortie là. Absent des autres fiches (poche, contour…) pour ne pas dupliquer un réglage global.

Tests : `test_fao.cjs` — blocs **021-023** : 021 la 2ᵉ passe **ne tue plus aucun voxel** (centre 12.5 < `zmin` 13.5) mais la Z-map descend **quand même à 16** (gel corrigé), 3ᵉ passe retue → 12 (monotone) ; 022 `sortie` absent → `dep=r+2` historique (−7), `secu=10` → demi-tour à `x0−(r+10)=−15` ; 023 champ « Sortie » présent en fiche **surfaçage** (valeur 7.5 affichée, saisie 12 → `setup.secu=12` → sortie finale 37 + demi-tour −17) et **absent** de la fiche poche ; origine G-code recalée (`X-10.000` = dépassement `r+sortie`). `npm test` **23/23** vert, golden `facing=32 pocket=65 contour=7 drill=8` intact.

README : surfaçage — champ « Sortie » rappelé dans la fiche de l'opération ; réglages — « Sortie (mm hors matière) : dépassement XY du demi-tour + retrait Z, pas 0,5 » ; viewer — matière enlevée à chaque passe (Z-map plus gelée sans kill voxel).

### 2026-10-01-020

**Booléens avec un import STEP : union / soustraction d'une esquisse à un solide inséré — possibles.**

1. **Retour** : « je veux pouvoir unir ou soustraire une esquisse à ce step inséré et ça ne fonctionne pas » — soustraction → « Perçage : découpe dans le vide — ignorée » (le solide reste intact), union → « OCCT : Cannot convert object to primitive value » puis repli maillage (deux pièces affichées côte à côte, jamais combinées). **Cause** : `occReplayBody` sautait toute fonction qui n'était ni `extrude` ni `revolve` (`if(f.type!=='extrude'&&f.type!=='revolve')return`) : le corps importé n'entrait jamais dans l'accumulateur exact — la coupe partait donc dans le vide et l'union appelait `undefined.toJSON`. **Fix** : branche `f.type==='import'` — le solide est **copié** (`occShapeCopy(bp)`, la table `importGeom` reste propriétaire) et posé en tête de chaîne (`occUnify(occFuse(...))`) comme n'importe quel ajout ; le tableau `imports` remonte dans le résultat et `occFinalShape` l'agrège (l'antériorité de l'esquisse, les références de mesure et le repli maillage voient donc aussi le STEP) ; `importSeul` (aucune autre fonction dans la liste) conserve le comportement historique de l'import seul ; `entry.brep` est désormais conservé à l'import (il était `delete()`é dès la fin de `importSTEP`) et libéré à la purge quand la feature sort du document.
   Coût : ~**14 ms** de copie pour un STEP de 132 faces (`Pièce 5.step`) — négligeable face aux ~650 ms d'un rejeu chaud.
2. **Double affichage** : une fois consommé, le mesh de l'import restait en scène à côté du corps fusionné. **Fix** : `occRebuild` marque les `imports` du résultat comme consommés (`scene.remove(f._mesh)` et pas de re-création à leur tour), et le repli maillage `rebuildInner` retire de la scène les imports déjà fondus dans le CSG ; la table n'est ni libérée ni supprimée du document (annuler/rétablir inchangés).
3. **Lecture du compteur de triangles protégée** : `g.attributes.position.count/3` sur une géométrie sans `position` lève une exception JS qui basculait silencieusement la voie exacte en repli maillage ; lecture sous `try` (`lit`), compteur affiché `?` si illisible.

Tests : `test_bool_import.cjs` **14/14** — import seul inchangé (1 corps, mesh en scène, `entry.brep` conservé), soustraction d'un Ø20 à travers le solide importé (8 faces, faces cylindriques présentes, 1 solide, outil en fantôme, plus de « découpe dans le vide », import consommé = mesh retiré), union boîte + proéminence (boîte `[0,0,0]→[85,40,40]`, 12 faces, 1 solide, aucun mesh en double) ; **12 problèmes** sur `fusion_mvp.html` committé (preuve de régression) et `node --check src/*.js` après chaque édition. Enregistrée dans `tests/run.cjs` → `npm test` **24/24** vert.

README : import — booléens possibles avec un STEP inséré (union / soustraction d'une esquisse, corps exact dans la chaîne de rejeu, plus de mesh en double) ; suite de tests → 24 fichiers.

### 2026-10-01-021

**Arbre : le corps s'affiche (🧱) — Œil = vue seule, ⏻ = rejeu — et le menu Posage FAO vit dans l'arbre.**

1. **Un corps, trois rôles séparés** : l'icône `📦` du brut ne servait qu'à repérer la source de la fiche posage et l'œil **masquait toutes les fonctions du corps** (un œil « caché » rendait le corps sélectionnable mais mort). **Fix** : chaque ligne de corps porte `🧱` + son nom (fond coloré `boxShadow` de la teinte `bodyTextColor`, nom **jamais** coloré en `innerHTML` — le test lit `_h1`/`_h2`), et deux commandes distinctes : **👁/🙈 = vue seule** (`doc.bodyVis[id]` → `f.visible` + `mesh.visible` sur tout le corps, `refreshParts()`/`renderTree()`, **aucune** `rebuild()` : rien n'est retaillé, la sélection FAO « corps choisi » garde son masquage) et **⏻ = rejeu** (`f.visible` sur les fonctions + `rebuild()`, état « allumé » = `specs.some(f=>f.visible!==false)` pour un corps avec enfants). L'icône `📦` disparaît de l'arbre : la désignation du brut se lit uniquement dans la liste **Source** de la fiche posage. Fond de ligne grise dès que la vue est coupée, barrée dès que le rejeu est off ; état mémorisé, inchangé à l'ouverture.
2. **Menu Posage FAO recentré** : les 7 boutons **+ usinage** (grille 2 colonnes, ordre contractuel conservé — index 3 = `drill`), la rangée **[Exporter G-code · Outils · + Posage · ▶ Usinage]** (le bouton Outils quitte la fiche) et **[Générer + aperçu]** sortent de la fiche posage pour vivre dans le panneau `#faoTreeWrap`, séparateurs `.fao-sep` entre les blocs — tout tient dans le menu, la fiche ne garde plus que la **configuration** (statistiques + avertissement CN en pied). **Masque/Afficher par ligne** dans l'arbre : un nouvel état **`op.hidden`** (persisté dans `doc.fao`) qui ne touche **pas** à `op.on` (l'aperçu `faoRefreshPreview` saute les traces masquées, le temps/G-code restent pilotés par `on`) ; **Générer + aperçu** remet systématiquement `op.hidden=false` (snapshot avant mutation) et le bouton `faoPrevBtn` est supprimé (plus de doublon).
3. **Glamour des panneaux** : tout l'habillage des fiches FAO sort du `style.cssText` inline pour une feuille injectée par JS (`faoUiCss`, la coque HTML n'étant jamais éditée à la main) — `#faoTreeWrap` verre dépoli + ombre, `.fao-title` pastille bleue, titres `.fao-h` à trait dégradé, champs `.fao-in/.fao-sel/.fao-mini`, cartes `.fao-setup/.fao-op` (opacité aux états `isoff`/`ishid`), `.fao-actions/.fao-gen/.fao-addgrid`, alertes `.fao-alert`, méta monospace `.fao-meta`, pastilles `.fao-check`, notes `.fao-note`, fenêtre flottante `.fao-win` (+ croix qui rougit au survol) ; `#props` reçoit `col fao-panel` en mode FAO et reprend `col` dès qu'on repasse à une fiche dessin (`renderProps`). Aucun des 3 `style.cssText` restants n'est un panneau : barre du viewer et accent monospace de la fiche outil.

Tests : `tests/test_corps.cjs` — l'ancien bloc Œil devient **trois rôles** (vue seule sans `rebuild` ni perte des fonctions, ⏻ qui rebuild bien et restauré entre les clics car `rebuild()` rejoue les corps factices injectés par le stub, sélection toujours valide) ; `tests/test_fao.cjs` — bloc **(e)** réécrit sur `🧱/👁/⏻` + **(e2)** nouveau : la désignation du brut vient du **select Source** de la fiche (`📦` absent de l'arbre, testé en `indexOf`), **Outils** absent de la fiche / présent dans `faoTreeWrapEl`, rangées `+op` et `Exporter G-code` recherchées **dans le panneau arbre** avec contre-preuve de non-présence en fiche, et nouveau bloc **3.4 `op.hidden`** (ligne masquée → classe `ishid` + `op.hidden===true`, traces sautées par l'aperçu, **Générer + aperçu** qui tout remet à false et réaffiche les 3). `npm test` **24/24** vert ; `build.js --check` sur le livrable committé.

README : arbre — corps `🧱` avec **Œil = vue seule** et **⏻ = rejeu** (`📦` retiré, source du brut = liste Source de la fiche) ; FAO — boutons d'ajout et actions (**Outils**, Exporter, ▶ Usinage, Générer + aperçu) dans le panneau de l'arbre, masquage des traces par ligne.

### 2026-10-01-022

**Clic droit sur un corps → « ⬇ Exporter ce corps en STEP » (seul ce corps).**

1. **Demande** : « dans l'arbre des corps, il faut que je puisse exporter le corps sélectionné, clic droit, en STEP ». L'export STEP existant (bouton du bandeau) n'écrit que le **composé de tous les corps** (`occFinalShape().shape`) : impossible d'en sortir une seule pièce. **Fix** : nouvelle action **« ⬇ Exporter ce corps en STEP »** ajoutée au menu contextuel de l'arbre **et** à celui de la vue 3D — bouton créé en JS (la coque HTML n'est jamais éditée à la main), affiché **uniquement** quand la cible est un corps (`showCtx`/`showCtx3D` règlent `style.display`, masqué pour esquisse, fonction, plan et vue 3D sans corps), `onclick` porté par le bouton lui-même et créé **après** les boucles `querySelectorAll('#ctxMenu button')` (aucun écrasement de handler, ni au runtime ni sous le stub de test).
2. **La shape vient de `occFinalShape().perBody` filtrée sur le `bodyId`** : c'est exactement le solide de ce corps (mêmes prismes, booléens, congés, imports que l'affichage — le composé global `FR.shape` et le corps voisin ne partent jamais dans le writer), au même pipeline que l'export global : pré-test `occExportPreflight`, écriture `occWriteStep` en `/b.stp` (chemin court fixe), téléchargement `.step`, et `occCleanup(FR,null)` en `finally` (les solides par corps sont libérés, aucun `delete()` sur une shape encore écrite). Nom de fichier = **nom du corps** (caractères `\ / : * ? " < > |` remplacés par `-`), statut et erreurs affichés dans la face d'informations **et** en `alert` : OCCT absent, pré-test KO, corps hors rejeu → « rien à exporter : aucune fonction visible de ce corps dans le rejeu (⏻ éteint ?) ».

Tests : `tests/test_ctx_step.cjs` (nouvelle suite enregistrée dans `tests/run.cjs` → **25/25**) — bouton présent dans les DEUX menus, affiché pour un corps seul / masqué pour esquisse, fonction et vue 3D sans corps ; sans OCCT : alerte + retour en face d'infos ; OCCT simulé (le boot asynchrone de l'app remet `occtReady=false` au premier tick : les stubs sont re-posés **avant** chaque clic) → le writer reçoit **exactement** `perBody[0].shape` du corps (`!== FR.shape`, jamais le corps voisin), chemin `/b.stp`, `dl.download==='Piece A.step'`, `occCleanup` appelé une fois ; export identique depuis le menu 3D ; corps absent du rejeu → rien écrit, rien téléchargé, message explicite. Suite complète **25/25** vert, `build.js --check` sur le livrable committé.

README : import/export — clic droit sur un corps (arbre ou vue 3D) → « ⬇ Exporter ce corps en STEP » : seul ce corps, shape exacte OCCT, fichier `.step` au nom du corps.

### `2026-10-01-023`

**FAO au cordeau : nouveau modèle remis à zéro, les 7 +usinage sur la vue 3D, panneau regroupé + repliable, flèches de posage, matière qui suit chaque passe.**

1. **« Nouveau modèle » remet toute la FAO à zéro** — retour : le document repartait vierge mais `doc.fao`, les traces de l'aperçu, le mode lecture et la fenêtre outils survivaient (l'ancien usinage restait affiché à côté du nouveau document). **Fix** : nouvelle `faoReset()` (mode lecture fermé, fenêtre outils fermée, `delete doc.fao` → `faoRoot()` recrée un posage par défaut, sélection FAO vidée, `faoChanged()` retire les traces de la scène) appelée dans `btnNew` juste après la recréation de `doc`.
2. **Les 7 boutons + usinage passent sur l'écran 3D** — retour : « les 7 boutons d'usinages passent sur l'écran 3D, comme pour les boutons ISO/Dessus, même design, positionné à gauche, juste en haut à droite du panel des corps ; ils se cachent automatiquement quand on rabat le panel FAO ». **Fix** : nouvelle barre `#faoAddBar` **3ᵉ enfant de `#treeWrap`** (elle suit donc le repli du panneau des corps), pilule reprenant le design exact de `#viewbar` (`.fao-addbar` : fond `rgba(16,18,22,.78)`, `blur(7px)`, boutons `3px 9px` / `.76rem`), titre de groupe **`+ Usinage`** puis les 7 boutons **sans `+`** — Surfaçage, Poche, Contour, Perçage, Ébauche 3D, Finition, Débourrage ; le clic garde l'action d'origine (`faoOpDefaults` + fiche ouverte à droite).
3. **Panneau FAO : toujours présent, regroupé, repliable** — le bouton `FAO` de la barre d'outils (simple bascule `display`) disparaît. Le panneau passe en `display:flex; flex-direction:row-reverse` : contenu `.fao-cnt` + onglet `#faoToggle` `❯`/`❮` **au procédé identique à l'arbre des corps** (classe `folded` + `localStorage minifusion_faoFolded` ; contenu masqué → le panneau se rabat sur sa droite en laissant l'onglet seul), et le repli **masque aussi `#faoAddBar`**. Les actions sont **regroupées sous un libellé** (`.fao-h`) : **POSAGE** = `+ Posage` · `Outils`, **EXÉCUTION** = `▶ Usinage` · `Générer + aperçu`, **EXPORT** = `Exporter G-code` — libellés de boutons inchangés (contrats de test préservés), séparateurs `.fao-sep` et grille `.fao-addgrid` supprimés (CSS mort retiré de `faoUiCss`).
4. **Flèche ▼/▶ par posage** — retour : « une flèche dépliage des usinages par posage, enregistrée dans une sauvegarde ». `faoRenderTree` fait précéder la ligne du posage d'un `span.fao-tri` : le clic (sans sélectionner le posage : `stopPropagation`) bascule `s.open` **dans le document** (donc enregistré/chargé avec la sauvegarde) puis `faoChanged()` — seules les opérations de CE posage sont repliées ; **déplié par défaut** (`s.open!==false`).
5. **Matière : chaque passe descend l'affichage** — retour : « les passes impaires n'enlèvent rien ». **Cause** : `faoMatterCarveSeg` mettait déjà à jour la Z-map `g.h[c]` pour toute colonne touchée en XY (fix antérieur), mais `faoViewerMatterStep` n'appelait `faoViewerMatterKill` **que si un voxel avait été tué**, et `faoViewerMatterKill` ne recalculait `mTops[c]` que pour les colonnes tuées — une passe dont la cote tombe **entre deux centres de voxels** (ou dans une colonne déjà vidée) baissait `h` sans jamais réécrire le mesh : la matière réapparaissait à l'écran au passage suivant. **Fix** : paramètre optionnel `outCols` sur `faoMatterCarveSeg` (8ᵉ arg) et `faoMatterCarveTo` (6ᵉ arg) qui collecte les colonnes touchées — **contrat de retour inchangé pour les appels existants** — ; `faoViewerMatterStep` et le rattrapage de `faoViewerMatterEnable` passent ces colonnes à `faoViewerMatterKill(vw,ks,cols)` qui recalcule `mTops` pour **tuées ∪ touchées** puis réécrit ces verts et leurs 4 voisins ; kill sans tués ni colonnes reste un no-op.
6. **Testable sous le stub** — le repli du panneau est piloté par `cnt.style.display` **en plus** de la classe CSS (le harnais de test a `classList.contains()` toujours faux), et `faoAddBarEl`/`faoFolded` sont des refs module comme `faoTreeWrapEl`.

Tests : **3 nouvelles suites enregistrées dans `tests/run.cjs` → `npm test` 28/28 vert.** `tests/test_fao_reset.cjs` — état sale monté (2 posages, traces, mode lecture, fenêtre outils) puis clic sur `btnNew` (`confirm` stubbé, `showAll` neutralisé : pas de `controls` dans le harnais) → 1 posage `POSAGE1` sans opération, `faoVw===null`, `faoToolsWin===null`, `faoRefreshPreview()===0`, document vierge, sélection vide, 1 seul conteneur `Corps 1` ; puis `faoReset()` appelé directement. `tests/test_fao_passes.cjs` — grille `pas=2` (centres 1,3,…,25) : passe à 15.5 tue, passe à **14.5 — entre deux centres — sans tuer un seul voxel** alors que `h` descend ; via `faoViewerMatterStep`, `mTops` passe 25 → 15.5 → **14.5** (le mesh suit, `needsUpdate` posé) ; `outCols` collecté par `CarveSeg`, propagé par `CarveTo` ; contrat 7 args intact ; kill sans colonnes = no-op. `tests/test_fao_barre3d.cjs` — barre présente dans `#treeWrap` **en dernier enfant** (donc en haut à droite du panneau corps), titre `+ Usinage` + 7 libellés sans `+`, **absente** du panneau FAO, `btnFao` **absent de la coque** (lecture du livrable), 3 groupes libellés + les 8 boutons d'action présents, plus de `.fao-addgrid`, repli `❯→❮` qui masque `.fao-cnt` **et** la barre 3D (et l'inverse au dépliage), flèche `▼/▶` qui bascule `s.open` dans le document **sans** sélectionner le posage. `tests/test_fao.cjs` adapté : la grille des 7 boutons est recherchée dans `faoAddBarEl` (bouton identifié par son libellé `Perçage`, plus par `children[3]`). `build.js --check` sur le livrable committé.

README : FAO — 7 `+ usinage` sur la vue 3D (pilule type `Iso`/`Dessus`, en haut à droite du panneau des corps, masquée au repli du panneau), panneau toujours présent + onglet ❯/❮ de repli, actions groupées POSAGE / EXÉCUTION / EXPORT, flèche ▼/▶ par posage enregistrée dans le document, « Nouveau modèle » = FAO à zéro ; viewer — sommet à la cote exacte **à chaque passe** (colonnes touchées recalculées sans kill) ; tests → 28 suites.

### `2026-10-02-001`

**Écran 3D : les deux groupes de boutons échangent de côté — usinage à droite au-dessus du panneau FAO, vues à gauche au-dessus de l'arbre.**

1. **Demande** : « On va mettre les boutons pour l'usinage à droite, au-dessus du panel FAO. Il faut y mettre le même panel dessous que celui qui existe pour les boutons "Iso" "Dessus" — en gros l'ensemble des boutons repose sur un grand pane, comme les autres ! Et du coup les boutons "Iso" etc. iront à gauche, au-dessus du panel des corps de pièces / origine / esquisses. »
2. **Cause** : `#faoAddBar` était le **3ᵉ enfant de `#treeWrap`** (donc *à côté* du panneau des corps, pas au-dessus du panneau FAO), et surtout sa classe `.fao-addbar` n'était **posée nulle part** sur l'élément : la règle CSS du décor existait mais ne s'appliquait jamais — les 7 boutons flottaient sans pilule, contrairement à `#viewbar`.
3. **Fix — colonne de droite `#faoWrap`** : nouvelle colonne absente de la coque mais créée en JS (`faoWrapEl`, enfant de `#vpwrap`, `top:10px; right:10px; min-width:270px; max-width:calc(100% - 384px); flex-direction:column; align-items:flex-end; gap:8px`) qui reçoit **la barre puis `#faoTreeWrap`** : les boutons d'usinage reposent sur leur pilule **au-dessus** du panneau FAO et le panneau **coule dessous** (`#faoTreeWrap` perd son `position:absolute;top:52px` pour `align-self:flex-end`) — plus aucun `top` figé : le panneau suit la hauteur réelle de la barre. La pilule `.fao-addbar` reprend **le même décor que `#viewbar`** (`padding:4px 6px`, `border-radius:10px`, fond `rgba(16,18,22,.78)`, `border rgba(255,255,255,.13)`, `backdrop-filter:blur(7px)`) avec `width:100%; gap:4px` — la borne `max-width` garantit qu'elle ne recouvre **jamais** `#viewbar` (qui occupe la gauche), et `pointer-events` suit le procédé de `#treeWrap`.
4. **Fix — vues à gauche** : `#viewbar` (`Iso` · `Dessus` · `Face` · `Droite` · `Tout afficher` · `⚙`) passe de `right:10px` à **`left:4px`** (aligné sur l'onglet de l'arbre), `#setMenu` le suit (`top:46px;left:4px`), et le panneau des corps descend sous la pilule : `#treeOverlay` et `#treeToggle` de `margin-top:10px` à **`46px`** (`max-height` `calc(100% - 20px)` → `calc(100% - 56px)`). Le repli FAO masque toujours `#faoAddBar` (inchangé).
5. **Retour — « les 2 panels n'ont pas la même hauteur »** : `.fao-addbar` était en `flex-wrap:wrap`, étranglé par la borne `max-width` → les 7 boutons passaient sur **2 lignes**, pilule à **59px** contre **34px** pour `#viewbar`. **Cause mesurée** (Chrome headless, `getBoundingClientRect`) : les boutons faisaient déjà la bonne taille (22px), c'est la seconde ligne qui gonflait la pilule. **Fix** : la barre **ne se plie plus jamais** — `flex-wrap:nowrap` + `overflow-x:auto` avec `scrollbar-width:none` / `::-webkit-scrollbar{display:none}` (sur petit écran elle défile horizontalement au lieu de changer de hauteur) ; boutons `.fao-addbar button` `3px 9px` → **`4px 6px`** (24px, soit exactement la hauteur du `⚙` qui donne la hauteur de `#viewbar`), `gap:5→4` et libellé compact (`padding:0 2px`, `letter-spacing:.04em`) pour que le contenu (552px) tienne dans la colonne ; borne `400px → 384px` (marge de 17px après la pilule des vues). **Résultat mesuré à 1280 / 1440 / 1600 / 1920** : `#viewbar` et `.fao-addbar` **y=121, h=34, une seule ligne, 0 débordement**.

Tests : `tests/test_fao_barre3d.cjs` réécrit sur la nouvelle géométrie — `faoWrapEl` enfant de `#vpwrap`, **barre ET panneau FAO enfants de `#faoWrap` et la barre en PREMIER** (donc au-dessus), barre **absente** de `#treeWrap` et du panneau FAO, pilule `.fao-addbar` conservée (titre `+ Usinage` + 7 libellés sans `+`), **plus 7 contrats de position lus dans le livrable** (`#faoWrap` haut/droite, décor `.fao-addbar` **nowrap** + `padding:4px 6px`/`radius 10px`, `#viewbar` à gauche, `#setMenu` à gauche, arbre repoussé à `46px`, **hauteur 34px identique aux deux pilules + une seule ligne**) ; classe `.fao-addbar` posée sur l'élément ; repli `❯→❮` masquant `.fao-cnt` **et** la barre, et flèche `▼/▶` par posage, intacts. `npm test` **28/28** vert ; `build.js --check`.

README : écran 3D — les 7 `+ usinage` forment une pilule **en haut à droite, au-dessus du panneau FAO** (colonne `#faoWrap`, largeur bornée, **une seule ligne toujours : défilement horizontal invisible sur écran étroit, jamais de 2ᵉ ligne, hauteur 34px = celle de la pilule des vues**, le panneau FAO coule dessous), les boutons `Iso`/`Dessus`/`Face`/`Droite`/`Tout afficher`/`⚙` forment la pilule **en haut à gauche, au-dessus du panneau des corps** (menu réglages ouvert sous elle).

Repo — **synchronisation Mac ↔ Windows** : `.gitattributes` explicite (règles `text` par extension, `*.bat text eol=crlf`, `png/jpg/ico` en binaire, commentaire sur les noms **Unicode NFC**) + section README « Synchronisation » (config par clone `core.autocrlf` / `core.precomposeunicode`, `git status` + `build --check` + `npm test` avant push) ; **chemins de l'index normalisés en NFC** (les doublons NFD macOS/Dropbox — `Cavité`, `Coque et Dépouilles`, `Pièce 5`, `Révolution 1`, fixtures `Ma Pièce`/`congé` — sont supprimés, `build.js` régénère le livrable en CRLF à l'identique sur les deux OS) ; `Server.bat` perd son chemin codé en dur `C:\Users\Zique\...` pour `%~dp0`. Données : `Cavité Usinage.step/.json` re-exportés, `Pince.minifusion.json` ajouté.

### `2026-10-02-002`

**Esquisse : le solide reste visible en TRANSLUCIDE pendant l'édition (au bon état du timeline), et les arêtes se projettent (vives + tangences) avec un repli sans noyau.**

1. **Retours** : « en posant une esquisse sur une face, il ne reste à l'écran que les STEP importés » et « pendant l'édition la pièce est opaque, le fondu a disparu ».
2. **Causes** (diagnostic hors-repo, `openSketch` / `skBuildRefs` / `projectEdgeAt`) :
   - **ordre inversé** : `skBuildRefs()` tournait **avant** `tlEditLock()+rebuild()` → le fondu 0,75 et les références étaient posés sur l'**ancien** état, puis le rejeu **régénérait les matériaux** : pièce opaque + références de l'état final ;
   - **esquisse posée sur face non consommée** : `tlEditLock(hôte)` excluait la fonction porteuse du rejeu → le corps qui porte la face **disparaissait** (seuls les imports STEP survivaient) ;
   - **consommateur** détecté par `f.type==='extrude'` **seul** (3 occurrences) : une esquisse consommée par une **révolution** était traitée comme non consommée ;
   - un **rebuild en session** (`buildDone`) repartait de matériaux neufs : le fondu sautait ;
   - **projection** : garde « noyau OCCT requis » **inconditionnelle** malgré le repli sur les références, références violettes **invisibles** pendant l'outil ⧉, et deux arêtes projetant le même segment 2D départagées par l'**ordre** de `occListEdges`.
3. **Fix — ordre d'ouverture** : verrou **puis** rebuild **puis** `skBuildRefs()`. Nouveau `tlEditLockAfter(f)` (rejeu **après** la porteuse ; aucun verrou si c'est la dernière fonction → modèle complet) ; `skBuildRefs`, `findClosestProjectedEdge` et `projectEdgeAt` passent par le nouvel helper `skConsumerIdx(sk)` (extrude **ou** revolve, fonctions visibles), et `geomLater` prend la révolution en compte.
4. **Fix — fondu** : helpers `skFadeSaveRestore()` / `skApplyFade()` pilotés par `skEdit._fade` (`'bodies'` = corps à 75 %, `'ghost'` = corps masqués + fantôme antérieur) — appelés par `skBuildRefs` **et** par `buildDone` (le rejeu repose le fondu) ; `closeSketch` efface le mode **avant** son rebuild de sortie (sinon le fondu reviait après restauration) ; si le rejeu partiel échoue, ou si le fantôme n'a pas pu être monté, les corps restent **visibles en fondu** — jamais d'écran vide.
5. **Fix — projection** : antériorité via `skConsumerIdx` ; **départage par écart au plan** (`d2D + 0,25×|dz|`, porte `d2D<tol`) : l'arête **du plan projeté** gagne sur celle qui ne fait que se projeter dessus (bloc avant : bord z=40 > bord z=0) ; garde assouplie — repli sur `sk._refs` (corps visibles) quand le noyau est absent, message d'origine réservé au cas « ni noyau **ni** références » ; les références sont affichées **pendant l'outil ⧉** (et re-masquées à la sortie avec le toggle éteint).

Tests : **2 nouvelles suites enregistrées dans `tests/run.cjs` → `npm test` 30/30 vert.** `tests/test_esquisse_transparence.cjs` — esquisse libre (fondu 0,75), esquisse **posée sur face** dernière fonction (aucun verrou, **1 corps visible** alors que l'ancien code en laissait **0**), porteuse suivie d'une autre fonction (`tlMark` = la fonction suivante, corps toujours là), esquisse consommée (`tlMark` avant la consommatrice, corps **translucides** alors qu'ils étaient opaques), `markDirty()+rebuild()` en session qui **repose** le fondu, fermeture (opacité restaurée, mode effacé, fantôme détruit) — vérifié **rouge** sur le build d'avant correction. `tests/test_esquisse_projection.cjs` (noyau OCCT réel, boîte 100×60×40 filée R4 : 13 vives + 2 tangentes) — arête vive **du plan** choisie sur le doublon du z=0, arête de **tangence** (y=56, z=40) projetée, `skConsumerIdx` = 0 sur une **révolution** consommatrice, références violettes tracées **8** pendant l'outil / **0** hors outil, repli sans noyau via les références (1 entité projetée), garde dure sans noyau ni références (0 + message « noyau OCCT »). `build.js --check` sur le livrable committé.

README : esquisse — le solide reste **visible en translucide (75 %)** au bon état du timeline (avant la consommatrice, **après** la fonction porteuse) ; projections — **vives et de tangence**, arêtes du plan prioritaires, références visibles pendant ⧉, repli sans noyau ; tests → 30 suites.

### `2026-10-02-003`

**Style du CORPS : couleur + transparence à UNE source (`doc.bodies`) · Esquisse : aucun glisser ne laisse plus de contrainte violée (points milieu sur arêtes projetées).**

1. **Cause — style dispersé** : la couleur et l'opacité vivaient sur la **fonction** (`f.color`, `f.opacity`) avec en plus une **teinte pièce globale** (`doc.tint`, `optTint` + bouton « Auto ») ; le panneau des propriétés, le clic-droit de l'arbre, le clic-droit de la vue 3D et le rendu lisaient/écrivaient chacun leur endroit → miroirs désynchronisés, la teinte écrasait la couleur choisie, et l'opacité était appliquée comme une **baisse d'intensité** (matériau déjà sombre, arêtes du fond crues derrière le solide).
2. **Fix — source unique** : `doc.bodies[].color` / `.op` fait foi **partout**, via `bodyEntryOf/bodyIndexOf/bodyColorOf/bodyOpOf/setBodyColor/setBodyOp` (lecture seule `bodyEntryOf`, jamais de fiche créée à la lecture) et le rendu `applyBodyStyle(mat,id)` + `applyBodyStyleLive(id)` (**écran immédiat, aucun rejeu** : le glisser ne demande rien à valider). `setMatAlpha` fait une **transparence vraie** : depth buffer conservé (arêtes derrière **atténuées**, pas crues), métal désamorcé, rugosité/brillance ajustées et compensation d'éclat par `emissive` — translucide n'est plus éteint. Fiche du corps : `bodyStyleField(id)` (nuancier + curseur, **aucun bouton « Auto »**), menus contextuels reconstruits par `ctxStyleInit` (rangées vue 3D + arbre, `ctxStyleSync` tient l'autre miroir à jour), `ctxBodyId` résout le **corps conteneur** en mode maillage (`bodyIdOfRuntime`, id de la fonction → `bodyId`), preset fantôme = le curseur à 25 %. **Migration `ensureBodies`** : `f.color`, `f.opacity` et `doc.tint` sont reportés sur la fiche du corps puis **supprimés**, y compris avec `{rebuild:false}` (sinon la sauvegarde suivante rouvrait l'ancien modèle). Anciens champs supprimés : `featColor/featOp/applyFeatOp`, `colorField/opacityField`, `optTint`/`optTintAuto` (10-scene-3d, 95-toolbar). Overlay des arêtes en **2 passes** (voile derrière le solide, net devant — un seul draw call partagé).
3. **Cause — esquisse (retour « les points milieu ne gardent pas leur place, surtout avec les arêtes projetées ; au-delà d'une certaine limite de fixature tout part en vrille »)** : pendant un glisser, `solveSketch(sk,40,[pid])` **ancre** le point saisi ; quand cet ancrage entre en conflit avec une contrainte irréductible (milieu sur une **arête projetée figée**, extrémité sur une ligne fixe, cote incompatible), l'état ancré était **gardé tel quel** → résidu laissé dans l'esquisse (« lignes rouges »), et tout dérive ensuite puisque le règlement suivant part d'un état déjà invalide. Deuxième brèche : le glisser d'**entité** (corps rigide) appelait `solveSketch(sk,40)` **sans** sa 3ᵉ argument, si bien que la composante saisie pouvait être tirée par les contraintes extérieures.
4. **Fix — garde-fou « saisie ancrée »** en fin de `solveSketch` : si `anchor` est non vide et que le résidu d'audit dépasse `1e-4` mm (≈ 100 000 fois sous le seuil d'alerte 0,05), on **re-règle SANS ancre** (les contraintes gagnent) et on ne garde ce second essai que s'il abaisse réellement le résidu, sinon on restaure l'état ancré ; récursion **bornée** puisque l'appel récursif passe `anchor=undefined`. + `solveSketch(sk,40,skDragEnt.anchor)` pour le déplacement en corps rigide : la composante suit la souris **et** reste valide.

Tests : **2 nouvelles suites enregistrées dans `tests/run.cjs` → `npm test` 32/32 vert.**
- `tests/test_esquisse_contraintes.cjs` — **vérifiée ROUGE sur le build d'avant correctif** (résidus **14,76 mm** puis **24,41 mm**) : 24 contraintes/cotes volontairement violées et **toutes** réparées par un règlement libre (─, │, ∥, ⟂, ＝ lignes/cercles, ⌾, ◎, ⦾ ligne/cercle et cercle/cercle, ∈, ⊙, ⊕ point/ligne et milieux égaux, ⇔, fix + milieu, milieu sur ligne figée, longueur, longueur h, distance, Ø, angle, entraxe, ⟂ centre↔ligne) ; 7 scénarios de glisser **événementiels** (pointerdown/move/up sur le SVG) sur une esquisse « 4 arêtes projetées + 2 points milieu + ligne centrale » : milieu bas et milieu du haut **revenus exactement au centre** avec résidu 0, arête projetée **figée** (aucune coordonnée ne bouge + message « entité fixée »), point libre qui **suit vraiment** le curseur (non-régression du garde-fou), milieu qui **suit** l'arête projetée remontée de 10 mm, rectangle contraint (─/│) glissé **rigide** en restant 100×70, conflit irréductible (2 fix + ⌾) qui reste **signalé** dans le panneau (`Sur-contrainte probable`, résidu 20,00 mm) ;
- `tests/test_corps_style.cjs` (style du corps) — migration de l'ancien modèle, persistance et synchronisation des miroirs, plus une **garde statique** : plus aucune écriture `f.color`/`f.opacity`, plus aucun ancien champ, plus de « Auto » ni de teinte pièce dans le livrable.

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-003.html`.

README : style du corps — **couleur et transparence à la source `doc.bodies`**, identique dans la fiche, les deux menus contextuels et le rendu (transparence vraie, arêtes du fond atténuées), plus de teinte pièce ni de bouton « Auto » ; esquisse — **aucun glisser ne laisse de contrainte violée** (garde-fou « saisie ancrée ») ; tests → 32 suites.

### `2026-10-02-004`

**Clic-droit : le menu ne rogne plus son entrée « ⬇ Exporter ce corps en STEP ».**

1. **Cause — retour « la procédure existait mais je ne trouve plus le menu »** : le menu s'ouvre bien, mais `#ctxMenu`/`#ctxMenu3D` sont `position:fixed` dans un `body{height:100vh;overflow:hidden}` **sans clamp de position** — ouvert en bas d'écran, tout ce qui dépassait du viewport était **coupé et inaccessible** (pas de scroll). Et le bloc **couleur/transparence** ajouté au menu du corps en -003 (3 rangées ≈ 110 px) a repoussé le bouton d'export, **dernier enfant** du menu, d'autant plus bas : à partir d'un certain y, l'entrée disparaissait complètement alors que le reste du menu restait visible.
2. **Fix — placement clampé** : nouveau helper pur `ctxClampPos(x,y,w,h,vw,vh)` (plancher 4 px, plancher `taille-4` quand la fenêtre est plus petite que le menu) + `ctxPlace(el,x,y)` qui pose `left`/`top`, **mesure le menu** (`offsetWidth/Height`) et repositionne dans le viewport ; les deux ouvreurs (`showCtx`, `showCtx3D`) passent par `ctxPlace`. Sans mesure (harnais de test) : comportement inchangé.
3. **Fix — garde-fous CSS injecté depuis JS** (règle du dépôt : la coque ne s'édite jamais à la main) : `#ctxMenu,#ctxMenu3D{max-height:calc(100vh - 8px);overflow-y:auto}` — même un menu plus haut que l'écran reste **parcourable**, la dernière entrée donc toujours atteignable. Le bouton d'export reste le dernier enfant (inchangé : aucun écrasement d'`onclick`, contrats de `test_ctx_step` préservés).

Tests : **nouvelle suite `tests/test_ctx_menu_viewport.cjs` enregistrée dans `tests/run.cjs` → `npm test` 33/33 vert** — clamp en pur (bas, droite, hors écran à plancher 4, déjà-dedans inchangé), intégration `showCtx`/`showCtx3D` ouverts à `y=790` sur `800` (top recalé à `h-4`), menu déjà dedans non repositionné, bouton STEP **dernier enfant et visible** dans les deux menus, CSS `max-height` bien injecté depuis JS.

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-004.html`.

README : import/export — le menu clic-droit du corps se **repositionne dans le viewport** (et défile s'il dépasse) : l'entrée « ⬇ Exporter ce corps en STEP » est toujours visible ; tests → 33 suites.

### `2026-10-02-005`

**Congés/chanfreins qui ne changent PLUS d'arête après une modification amont · l'option « arêtes tangentes » est persistée (une arête germe = toute la chaîne, à chaque rejeu).**

1. **Cause — retour « le congé revient mais sur l'arête extérieure de la poche » (priorité : bloquer l'arête choisie)** : l'ancre de type POINT (`t:'p'`), celle qu'on obtient en cliquant près d'un point d'esquisse, ne portait **aucune information de hauteur** (`z` non enregistré dans `xAnchorFor`) et sa branche de `xAnchorMatch` ne mesurait **ni le niveau du clic ni la distance à `pos0`** : le fond, le rebord et la couture verticale d'une poche //XZ projetent tous sur le même point d'esquisse, `dzPref` les égalise (lo/hi du même prisme) et le premier loop n'acceptait que les arêtes verticales → **la couture gagnait quoi que soit l'ordre**, le repli prenait tout autre chose au hasard. L'ordre d'énumération d'OCCT, bouleversé par toute édition amont (ex. Esquisse 1 en longueur 130→150 : la face porteuse glisse, la poche suit), suffisait donc à faire basculer le congé sur l'arête extérieure.
2. **Fix — niveau + pos0 dans la branche point** : `xAnchorFor` enregistre désormais `z` (niveau du clic, repère local qui voyage avec l'origine de l'esquisse) pour les ancres `t:'p'` ; `zRef` **priorise** ce niveau figé — le repli `proj(pos0)` (coordonnées monde figées) devient périmé dès qu'une poche suit sa face porteuse (−32 au lieu de −12, mesuré) ; `xAnchorMatch` branche point = **candidats unifiés toutes orientations**, buckets de niveau (`|q2−zRef|` ≤ 2 puis ≤ 8 puis reste), score `d2 + 0.3·dzPref + 0.6·min(d0,60)`, départage par `pos0` à score équivalent (fenêtre 6 mm, miroir de la branche entité) — **indépendant de l'ordre OCCT**, sans orientation forcée. Branche entité : les buckets acceptent aussi le niveau du clic (`min(niveau attendu, niveau du clic)`) — le min ne peut qu'**ajouter** la candidate au niveau du clic, jamais écarter celle attendue.
3. **Cause — retour « une seule arête + tangence : l'appli doit trouver toute seule les arêtes à chaque fois »** : ni la case « arêtes tangentes » ni les arêtes **germes** n'étaient persistées — tout était redemandé à l'interface à chaque session, et un rejeu ne recalculait jamais la chaîne (une entrée déduite perdue restait perdue, une arête apparue restait dehors).
4. **Fix — `f.tangent` + `e.seed` persistés, chaîne rejouée** : enregistrés à la création et à l'édition (`applyExactFillet` re-marque le germe depuis `filModeX.seeds`, `enterExactFilletMode` restaure l'état du congé et ne re-coche plus « tangence » en dépit de l'utilisateur), inclus dans `featSig` (le cache ne réutilise plus un solide périmé quand on bascule la case) ; nouvelle **passe 2b** dans `occApplyXFillets` : à chaque rejeu la chaîne tangente est recalculée sur les arêtes du solide actuel via `xTangentChainOf` (extrait d'`occTangentChain`, utilisable hors interface) — une entrée déduite **perdue** se rattache à la chaîne par sa position d'origine (tol 60 mm), une arête **apparue** rejoint la bande avec le **rayon du germe** et rejoint `f.edges` (avec une ancre recalée à l'instant de l'ajout). Documents antérieurs sans drapeau : comportement inchangé (rétrocompat).

Tests : **2 nouvelles suites enregistrées dans `tests/run.cjs` → `npm test` 35/35 vert.**
- `tests/test_conge_fond_poche.cjs` — **ROUGE vérifiée sur le build d'avant correctif** : le congé du fond se posait sur la **couture** (7,2 mm du fond), en ordre naturel **et** inversé, avant **et** après allongement, et l'ancre point était enregistrée sans `z`. Poche //XZ sur la face latérale (origine `SIDE` qui glisse avec l'arête porteuse), mur du bas scindé en son milieu (le point d'esquisse réel reçoit l'ancre), congé cliqué sur le **fond** : vérification du match en ordre naturel **et inversé** (indépendance à l'ordre d'énumération OCCT) + garde-fou « clic sur la couture → la couture » + chemin complet feature, avant **et** après `Esquisse 1` 130→150 (la poche glisse de 20 mm — le congé reste sur le fond, à 0,00 mm) ;
- `tests/test_conge_tangent.cjs` — création **par l'interface** (mode exact, un germe cliqué, propagation de chaîne 4) avec `f.tangent`/`e.seed` persistés et `_m 4/4`, rejeu stable (rien ne s'ajoute ni ne se perd), **allongement du slot** (chaîne toujours 4/4, aucune perte), cycle **JSON**, tangence **décochée** (1/1 appliqué, la chaîne ne se redessine pas) puis **recochée** (la chaîne 4/4 est retrouvée **seule**, germe unique conservé).

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-005.html`.

README : congés/chanfreins — le choix d'arête est **bloqué** : niveau du clic + `pos0` départagent fond/rebord/couture **quelle que soit l'ordre d'énumération**, un congé sur le fond d'une poche y reste après toute modification amont ; l'option « arêtes tangentes » et les germe sont **persistées** (une arête cliquée = toute la chaîne, à chaque rejeu) ; tests → 35 suites.

### `2026-10-02-006`

Répétitions/symétries — les instances suivent leur source **pendant toute la session** : six chemins modifiaient un paramètre de source **sans** `repSyncForFeature` (donc sans régénération des instances) et les deux boutons de réparation ne balayaient aucune répétition.

(1) Retour « je change la distance / l'angle / l'épaisseur d'une fonction source et les copies restent à l'ancienne valeur » : les trois **panneaux de propriétés** concernés — Déplacement de face (`f.dist`), Dépouillage (`f.angle`), Coque (`f.thick`) dans `src/40` — appelaient `markDirty();rebuild()` sans synchroniser, et les trois **éditions en place des outils** faisaient de même : `draftApply` (`f.ref`/`f.faces`/`f.angle`, `src/86`), `coqueApply` (`f.faces`/`f.thick`, `src/87`) et `applyExactFillet` en mode édition (`f.edges`/`f.tangent`, `src/80`). Le rejeu régénère les instances depuis **leurs propres enregistrements** (`repCloneFeature` ne recopie la source qu'au moment de `repGenChildren`) : sans appel, les clones gardent les paramètres d'origine. Fix : `repSyncForFeature(f)` ajouté dans les 6 chemins, **avant** `markDirty/rebuild`, comme le faisaient déjà les panneaux extrusion/révolution/congé.

(2) Boutons **Recalcul** et **Rafraîchissement dur** : ils forçaient le rejeu (`builtVersion=-1`, caches jetés) mais ne réalignaient pas les instances sur leurs sources. Nouveau `repGenAll()` (`src/40`) : balayage de **chaque** répétition, instances recyclées en place (ids stables), appelé en tête de `hardRefresh()` et du `onclick` de `btnRebuild` (`src/95`) — filet de réparation qui aligne les instances même si un chemin n'a pas synchronisé.

Tests : **nouvelle suite `tests/test_repeat_session.cjs` enregistrée dans `tests/run.cjs` → `npm test` 36/36 vert**, **ROUGE vérifiée sur le build d'avant correctif (10/10)** : document extrusion + 4 types de source (xmove, xdraft, xshell, xfillet) + répétition linéaire 2 copies = 10 instances ; les 6 chemins sont **pilotés pour de vrai** (champ de paramètre trouvé dans le DOM des propriétés + événement `change`, `draftApply`, `coqueApply`, `applyExactFillet`) et chaque instance doit recevoir la nouvelle valeur (25 mm, 30°, 8 mm, 40°, 12 mm, 2 arêtes + drapeau `tangent`) ; les deux boutons sont appelés après une désynchronisation simulée (source bougée sans sync) : instance réalignée **et** contrôle moteur (`occShapeOfExtrude` : hauteur 20 → 28 mm, placement linéaire x 25..45) ; garde-fous ids stables + 10 instances en fin de parcours. Les 4 arêtes de l'instance de congé (au lieu des 2 sélectionnées) sont attendues : la passe 2b enrichit `f.edges` sur le solide réel de l'instance.

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-006.html`.

README : répétitions — les instances suivent leur source **à chaque modification de la session** (panneaux de propriétés comme éditions en place des outils) et les boutons **Recalcul** / **Rafraîchissement dur** balayent toutes les répétitions ; tests → 36 suites.

### `2026-10-02-007`

Nouveau bouton **✓ Valider** : contrôle du modèle en **7 phases diagnostic + réparation**, rapport écrit dans la zone **🧪 Auto-tests**.

(1) Retour « je veux vérifier que mon document est sain avant de continuer » : il n'existait que 🧪 Auto-tests (non-régression du moteur, lancée manuellement) et ⟳⟳ Hard (rejeu complet borgne) — aucun contrôle **du document lui-même** : instance restée d'un modèle supprimé, répétition désynchronisée de sa source, esquisse sur-contrainte, fonction en erreur après modification amont, visibilité d'un corps disparu, géométrie d'import orpheline.

(2) Nouveau `runValidate()` (`src/97-auto-tests.js`), 7 phases, chacune diagnostic **et** réparation quand elle est automatisable :
1. **Document** — `docSanitise()` : doublons, instances orphelines, esquisses abandonnées, copies bornées, noms de congé/dépouillage/coque réalignés ; le retour `{dup,orph,sk,cap,ren}` devient le compteur de réparations.
2. **Répétitions** — écart paramètre source/instance (distance, angle, épaisseur, rayon, op, flip, mid, tangence — `edges` exclu : la passe 2b l'enrichit légitimement sur le solide réel), puis `repGenAll()` (balayage de chaque répétition, ids stables) et re-vérification.
3. **Esquisses** — `skAudit()` sur chaque esquisse : contraintes/cotes violées signalées en ⚠. Diagnostic seulement : réparer seul demanderait de choisir entre sous- et sur-contrainte.
4. **Fonctions** — rejeu (`buildKeyUpToDate()` sinon `rebuild()`), lecture de `_err` (❌ en erreur) et `_m.m<_m.t` (⚠ dégradée : visage introuvable).
5. **Moteur+caches** — état d'OCCT annoncé (« OCCT chargé » / repli maillage), puis `hardRefresh()` : jet de tous les caches + rejeu complet — filet de remise d'aplomb.
6. **Corps+imports** — `ensureBodies()`, purge des entrées `bodyVis` sans corps et de la table `importGeom` (libération mesh/brep des imports dont la fonction a disparu, via `importHydrate()`).
7. **Rapport** — agrégat `VALIDATION : N/7 phases OK — M réparation(s)` + les 6 lignes détaillées, écrit dans `#selfTest` (zone Auto-tests) et renvoyé en texte (lisible par les tests).

Bouton : **créé depuis le JS** (même régime que ↩ Annuler — la coque HTML n'est jamais éditée à la main), monté à côté de « 🧪 Auto-tests » via IIFE idempotent (`btnValidate`, `insertBefore(b,hote)`), `onclick => runValidate()`.

Tests : **nouvelle suite `tests/test_validate.cjs` enregistrée dans `tests/run.cjs` → `npm test` 37/37 vert**, **ROUGE vérifiée sur le build d'avant (5/5 : `btnValidate`, libellé, montage, onclick et `runValidate()` absents)** : structure source (`src/97` lu tel quel) + comportement sur un document seedé — instance orpheline (`repeatId` inexistant), instance désynchronisée (distance 20 → 5), esquisse avec cote 999 alors que la ligne mesure 20 — assertions : rapport à en-tête `VALIDATION` et 7 lignes de phases, `#selfTest` alimenté, orphelin purgé (phase 1 ✅), instance réalignée à 20 (phase 2 ✅), violation signalée en ⚠ (phase 3), « OCCT chargé » (phase 5 ✅), compteur ≥ 3 réparations.

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-007.html`.

README : nouveau bouton **✓ Valider** (7 phases diagnostic + réparation, rapport dans la zone Auto-tests) ; tests → 37 suites.

### `2026-10-02-008`

Arborescence — au blocage ⏱ (marqueur temps), l'arbre est désormais **filtré** : les fonctions exclues du rejeu ne sont plus listées.

(1) Retour « pendant que le temps est bloqué, l'arbre affiche quand même toutes les fonctions en gris barré : on ne voit plus ce que contient réellement la pièce » : depuis l'origine du marqueur temps (`6a4c34e`, 2026-09-29n), les fonctions au-delà du marqueur étaient **grisées** (`opacity:.4` + barré, CSS `.tnode.locked`) mais toujours **listées** — l'arbre ne correspondait pas au modèle rejoué que décrivait pourtant le bandeau « Temps bloqué avant ».

(2) Fix — filtre aligné au pixel près sur `tlActiveList()` (ce qui est rejoué est ce qui s'affiche), dans `renderTree` (`src/40`) : `featNode` s'arrête désormais sur toute fonction `tlLocked(f)` **après** la ligne « ⏱ — marqueur ici — » (le séparateur reste, il annonce désormais le nombre de fonctions masquées sous le marqueur) ; les **instances de répétition** suivent la même règle (`vkids`, boucle d'instances) — une répétition située avant le marqueur reste listée mais affiche le nombre d'instances non verrouillées (`0 instance(s)` quand le marqueur coupe entre la répétition et ses instances) ; l'en-tête de groupe compte `doc.features.filter(!tlLocked)` et l'en-tête de corps compte `kidsVis`. Bandeau, bouton « ↗ Rejouer tout » et déblocage à l'édition sont inchangés — tout revient à la levée. Sans marqueur, `tlLocked()` est faux partout : arbre strictement identique à avant (rétrocompat).

Tests : **nouvelle suite `tests/test_tree_filter.cjs` enregistrée dans `tests/run.cjs` → `npm test` 38/38 vert**, **ROUGE vérifiée sur le build d'avant (7/24)** : document extrusions + répétition dépliée (2 instances), pilotage des **vrais** rendus `renderTree()` (fenêtre du dernier rendu, comme `test_arbre_selection`) — sans marqueur les 6 lignes + compteurs (6) et 4 fonctions ; marqueur avant « Sortie » → ligne **absente**, 5 autres visibles, bandeau « Temps bloqué avant « Sortie » — 5 fonction(s) rejouée(s) », ligne marqueur « 1 fonction(s) masquée(s) », compteurs (5) et 3 ; marqueur **sur une instance** → instances suivantes et « Sortie » filtrées, répétition à « 0 instance(s) », bandeau nommant « Copie 1 » et 3 rejouées ; vrai clic sur « ↗ Rejouer tout » → `tlMark` levé, tout revient, bandeau disparu, compteurs (6).

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-008.html`.

README : arbre **filtré** au blocage ⏱ (l'arbre ne montre que les fonctions rejouées) ; tests → 38 suites.

### `2026-10-02-009`

Vue 3D — au chargement, la caméra n'est plus jamais cadrée sur le moteur de repli : re-cadrage garanti après la bascule exact, plus de vue noire.

(1) Retour « Plus de vue 3D : au refresh les plans apparaissent puis disparaissent et rien à l'écran — on peut rejouer, faire apparaître FAO, mais plus de vue 3D » : mesuré en navigateur réel (Brave headless, CDP, avec le document de l'utilisateur) sur **tous** les builds `-004` à `-008` — ce n'était pas une régression des lots 4/5. Séquence : `init` cadre via `showAll()` dès que le cache est restauré, mais le noyau OCCT n'est prêt qu'après (`Noyau prêt — recalcul exact…`) — le premier rebuild tourne donc sur le repli CSG, dont le « solide combiné » a pour ce document une boîte dégénérée **40×40×10000** (BSP) → `showAll()` cadre r≈10000 → caméra à (7000,-6000,7045), distance ~11600 > plan lointain 5000 → **tout est clippé, écran noir** (les plans d'origine encore visibles sur les premières frames avant cadrage — « les plans apparaissent puis disparaissent »). Le passage à l'exact remplace les corps (modèle sain : 218 mm, 17 608 tris, 1 corps visible) mais ne re-recadre jamais : la vue reste noire jusqu'à un Iso / Tout afficher manuel. Rejeu et FAO restent utilisables (rien ne dépend de la caméra) — d'où le retour « on peut rejouer, faire apparaître FAO ».

(2) Correctif, trois points :
- `src/99-init` : le `showAll()` du boot est gardé par `occtReady` — sans noyau prêt, aucun cadrage sur le repli (la caméra par défaut (90,-90,90) montre déjà l'origine, aucune phase noire) ;
- `src/00` `occtFinishBoot()` : après le `rebuild()` exact, `if(!viewUserMoved){try{showAll();}catch(e){}}` — re-cadrage sur le modèle réel, à chaque chemin de démarrage (http, cache local, .wasm manuel) ;
- `src/10` `buildScene()` : `viewUserMoved` passe à true au premier glisser (pointermove avec bouton) ou à la roulette sur le canvas — l'utilisateur qui pilote sa caméra pendant le chargement ne se fait pas voler sa vue par le re-cadrage.

Tests : **nouvelle suite `tests/test_view_reframe.cjs` enregistrée dans `tests/run.cjs` → `npm test` 39/39 vert**, **ROUGE vérifiée sur le build d'avant (comportement : `occtFinishBoot` de -008 appelait `showAll` 0 fois — les deux asserts de re-cadrage tombaient)** : structure source (drapeau `viewUserMoved` + garde dans `src/00`, double garde `occtReady` sans `showAll()` nu dans `src/99`, écoutes pointermove/roulette dans `src/10`) + comportement avec `showAll` remplacé par un compteur : `occtFinishBoot()` appelle `showAll()` exactement 1 fois, et aucun nouvel appel dès que `viewUserMoved=true`.

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-009.html`.

README : tests → 39 suites.

### `2026-10-02-010`

Bandeau — badge de version produit « V0.1.0 » en haut à droite. La coque HTML n'étant jamais éditée à la main, le badge est créé depuis JS dans `src/96-bandeau-groupes.js` (avec le regroupement du bandeau) : enfant direct du `.topbar` (hors `.tb`, donc jamais déplacé par le regroupement), poussé dans le coin par `margin-left:auto` avant la rangée `.hints` qui force le retour à la ligne — vérifié en navigateur : 15 px du bord droit du bandeau, `V0.1.0` à l'écran avec `APP_VER` `2026-10-02-010`. Sa règle `#prodVer` rejoint le style injecté `styleBandeau`, dont le garde bascule du `getElementById` aux enfants de `<head>` (le harnais auto-créant tout id demandé, l'injection était invisible en test) ; `documentStub` expose maintenant les nœuds `.topbar` et `.tb` pour que `src/96` s'exécute réellement en test.

Tests : **nouvelle suite `tests/test_prodver_badge.cjs` enregistrée dans `tests/run.cjs` → `npm test` 40/40 vert**, **ROUGE vérifiée sur le build d'avant (6 échecs)** : structure (badge + règle `margin-left:auto` dans `src/96`, `V0.1.0` présent dans le script construit seulement, jamais dans le head de la coque) + comportement (`#prodVer` enfant du `.topbar` et hors barre `.tb`, `#prodVer{...margin-left:auto}` dans le style injecté).

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-010.html`.

README : tests → 40 suites.

### `2026-10-02-011`

Cache de rejeu — filet de signature dans `featSig` (`src/20`) : la fonction ENTIÈRE entre dans la signature de préfixe (`JSON.stringify` d'une copie filtrée). Toute propriété, connue ou future, invalide le suffixe dès qu'elle bouge — donc jamais de solide périmé réutilisé si un champ se rajoute au moteur (la lacune qui avait fait basculer le défaut sur le rejeu complet le 2026-09-30a). Exclus de la sérialisation : `_mesh` et `_m` (état dérivé non géométrique, `_mesh` étant une référence THREE non sérialisable), `name` et `open` (affichage pur : replier un nœud ou renommer ne change pas le solide et invaliderait tout).

Préparation du lot suivant : ce filet est le prérequis pour re-basculer le défaut sur le rejeu rapide (`freshHard=false`) sans risque de géométrie périmée — l'égalité rapide/complet est désormais prouvée.

Tests : **nouvelle suite `tests/test_cache_exact.cjs` enregistrée dans `tests/run.cjs` → `npm test` 41/41 vert**, **ROUGE vérifiée (2 échecs)** : structure (copie filtrée `for(const k in f)` + `JSON.stringify` et les 4 exclusions dans `featSig`) + comportement au noyau OCCT réel — 5 scénarios (distance/flip/congé 2D en fin de timeline, poche « à travers tout » en milieu, distance en tête), référence complète vs rejeu rapide : topologies strictement égales (faces/arêtes/sommets/solides/boîte englobante), réutilisation du préfixe prouvée pendant le rebuild rapide en fin de timeline (≥1 hit) et invalidation totale en tête/milieu (0 hit — sinon un solide périmé serait réutilisé).

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-011.html`.

README : tests → 41 suites.

### `2026-10-02-012`

Esquisse → Décalage — quand la SOURCE est contrainte entre ses éléments, les copies reçoivent maintenant les mêmes liens ENTRE ELLES (contraintes explicites) : `skOffsetChains` détecte les joints créés par une contrainte `coincident` (aujourd'hui seuls les pids fusionnés faisaient chaîne — une source contrainte à points distincts n'était jamais raccordée, ses copies sortaient indépendantes) ; `skOffsetApply` recrée alors, sur les copies, l'état identique de la source : 2 points DISTINCTS positionnés au joint + contrainte `coincident` quand la source est liée ainsi, et contrainte `tangent` (copie-ligne ↔ copie-arc) quand la source ligne/arc était contrainte tangente. La source à pids fusionnés (non contrainte) garde son comportement : pids partagés, `parallel`+cotes `gap`, `radius` — aucune contrainte copie↔copie ajoutée. Nouveaux helpers `skHasCoincident`/`skHasTangent`/`skSameEnd` (pattern `skHasParallel`).

Tests : **nouvelle suite `tests/test_sk_offset_contraintes.cjs` enregistrée dans `tests/run.cjs` → `npm test` 42/42 vert**, **ROUGE vérifiée (5 échecs)** : structure (détection `coincident` dans `skOffsetChains`, créations `coincident`/`tangent` dans `skOffsetApply`) + comportement (source contrainte → copie coincidente avec points distincts joints à (27,3) et résidu `skAudit` ≈ 0 ; source tangente → contrainte `tangent` sur les copies et résidu ≈ 0) + non-régression (source fusionnée sans contraintes ajoutées, source non tangente, cercle solo).

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-012.html`.

README : tests → 42 suites.

### `2026-10-02-013`

Rejeu rapide par défaut : le défaut de `freshHard` bascule de `true` (reconstruction complète à chaque modification, en vigueur depuis 2026-09-30a) à `false` — les points de contrôle du rejeu sont de nouveau conservés d'une reconstruction à l'autre, ~4× plus rapide sur les modifications de fin de timeline. La validité n'est plus conditionnée au mode : le filet de signature du lot -011 (`featSig` sérialise la fonction entière) invalide toute propriété qui bouge, y compris le profil des esquisses (`skSig`), et la suite `test_cache_exact` prouve l'égalité stricte rapide/complet au noyau réel. Lecture de préférence : `localStorage.minifusion_freshHard` via `==='1'` (absent = rapide ; l'ancien idiome `!=='0'` — défaut dur — disparaît), la case ⚙ « Rafraîchissement dur à chaque modification » reste persistée telle quelle avec ses messages et purge au basculement.

Tests : **nouvelle suite `tests/test_fresh_default.cjs` enregistrée dans `tests/run.cjs` → `npm test` 43/43 vert**, **ROUGE vérifiée (5 échecs)** : structure (défaut littéral `freshHard=false`, idiome `!=='0'` disparu, lecture `==='1'`) + comportement (`freshHard===false` au chargement, `rebuild()` par défaut n'a pas jeté les points de contrôle, purge restaurée avec `freshHard=true`, bascule ⚙ avec persistance `0/1` et messages faceEl).

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-013.html`.

README : défaut de fraîcheur inversé (rejeu rapide par défaut) ; tests → 43 suites.

### `2026-10-02-014`

Rafraîchissement dur : phases mesurées + mode frais sans points de contrôle. `occCkPut` est désormais un garde centralisé : en mode frais (`freshHard=true`), le REJEU PRINCIPAL (pass 0) ne mémorise PLUS AUCUN point de contrôle — fraîcheur absolue et copie BRep (1 à 4 ms par fonction) économisées — tandis que les passes de projection imbriquées (`rebuild(pass>=1)`, drapeau `occProjPass`) gardent le droit de poser leurs points : elles rejouent un préfixe stabilisé par le rejeu courant. Les 8 call sites passent en thunk (`()=>occShapeCopy(result)`) : en mode frais, la copie n'est même plus fabriquée ; en mode rapide, comportement strictement inchangé (avec un bonus : sur une clé déjà mémorisée, plus aucune copie jetée). Les avertissements `occCkWarn` restent auto-réparants (rejeu → réécriture).

`hardRefresh()` (bouton ⟲⟳ et Ctrl+Maj+R) chronomètre maintenant chaque phase et l'affiche dans son rapport (« · phases : … ») + dans l'objet retourné (`phases`) : `rep` (balayage des répétitions), `purge`, `hotes` (imports/corps/migrateurs/hôtes de faces), `replay` (rejeu exact `occFinalShape`), `mesh` (tessellation + scènes), `maillage` (repli CSG), `proj` (recalcul des projections associatives), `autres` (divers = rejeu − sous-phases), `aff` (affichage final). Les sous-chronomètres sont portés par le compteur global `hardPh`/`phAdd()` : actifs uniquement pendant un `hardRefresh()`, coût nul partout ailleurs.

Tests : **nouvelle suite `tests/test_hard_phases.cjs` (noyau OCCT réel) enregistrée dans `tests/run.cjs` → `npm test` 44/44 vert**, **ROUGE vérifiée (18 échecs)** : structure (déclaration `occProjPass`, garde `freshHard&&!(occProjPass>=1)`, signature thunk, 8 call sites en thunk, chronos `phAdd('replay'|'mesh'|'proj'|'hotes'|'maillage')`, compteur `hardPh`/`phAdd`, `occProjPass=pass||0` dans `rebuild()`, activation/désactivation + ligne « · phases » dans `hardRefresh`) + comportement (mode rapide : 2 ck posés ; mode frais : 0 ck après rejeu ; `hardRefresh` retourne `phases` complet, `replay>0`, somme des sous-phases bornée par le temps de rejeu, ligne présente dans `faceEl`).

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-014.html`.

README : tests → 44 suites.

### `2026-10-02-015`

Point d'origine : « mon point d'origine perd son origine ». Document réel fourni par l'utilisateur : `points.O` resté dérivé au centre exact du rectangle (-38,27 ; -26,70) au lieu de (0,0), état stable au résidu nul puisque **rien ne ré-ancrait plus jamais l'origine** — `ensureOrigin` ne faisait que la créer si absente, et aucun code ne réparait un état déjà corrompu. Enquête (sonde d'écritures sur `O` + parcours souris complet) : toutes les passes de règlement filtrent `skFixed` qui inclut `O`, le LM l'exclut des inconnues, le glisser et `undo/redo` la conservent — le symptôme vient d'un état persisté, pas du règlement courant. Correctif en trois couches.

`ensureOrigin` (appelée à l'ouverture via `migrateSketch`, après chaque action via `cleanupSk`, et en tête de `solveSketch`) devient réparatrice : **ré-anchrage inconditionnel** — si `O` existe mais n'est plus en (0,0), il est recollé (le dessin, contraint autour de l'origine, se re-centre au règlement suivant) ; et si l'esquisse n'a plus de point `O` mais qu'un point **non fixé** est pile en (0,0) (ancien faux-origine portant les droites dessinées « en 0 »), ce point est **promu en origine** par fusion plutôt que de créer un doublon invisible à côté : l'origine garde son rôle et les attaches des lignes suivent. Les points fixés (arête projetée calée en 0,0) ne sont jamais promus — leur place leur appartient.

`mergePoints` transfère désormais, avec les entités/cotes/contraintes, les **ancres type p des congés/chanfreins** (`doc.features[].edges[].anchor`) : la fusion vers `O` ne laisse plus une ancre pointant vers un pid détruit. `solveSketch` ajoute en plus un **filet de sortie** : aucune passe ne doit emmener l'origine, elle est recollée (0,0) à la fin de chaque règlement.

Tests : **nouvelle suite `tests/test_sk_origin.cjs` enregistrée dans `tests/run.cjs` → `npm test` 45/45 vert**, **ROUGE vérifiée (8 échecs)** : structure (ré-anchrage dans `ensureOrigin`, promotion avec exclusion des fixés, transfert d'ancres dans `mergePoints`, `ensureOrigin` + filet de sortie dans `solveSketch`) + comportement (document réel de l'utilisateur : `O` ramené (0,0) à l'ouverture, rectangle re-centré au règlement avec résidu nul ; doublon promu — une seule clé en (0,0), ligne ré-attachée ; filet tête et filet de sortie — passe parasite simulée, `O` recollé ; ancre de congé suivant la promotion ; non-régressions : cote depuis `O` réglée, glisser sur `O` bloqué, `skClearAll`).

`build.js --check` sur le livrable committé ; snapshot `Backup/fusion_mvp_2026-10-02-015.html`.

README : tests → 45 suites.

### `2026-10-02-016`

Droites verticales/horizontales pendant un glisser : « il faut faire en sorte, comme pour les coïncidences et tangences, qu'une droite verticale ou horizontale LE RESTE quand on déplace le reste de l'esquisse — là elles se déforment et reviennent à leur état ». Les passes `h`/`v` de `solveSketchRelax` étaient les seules à ne pas posséder la garde « les deux extrémités figées → ne rien bouger » (l'ont déjà : coincident, online, midpoint, parallel/perpendicular, angle). Pendant un glisser, `fix = skFixed ∪ ancre` : avec O (fixé) et le point tiré (ancré), la branche `else` MOYENNait les deux extrémités — ce qui déplace aussi le point fixé. Résultat : la contrainte paraît artificiellement satisfaite à la moyenne, le garde-fou « saisie ancrée » (résidu > 1e-4 → re-règlement sans ancre) ne se déclenche pas, le filet de sortie recolle O en (0,0) et la ligne reste penchée de la moitié du delta pendant tout le glisser — elle « revient à son état » au règlement suivant (relâcher d'une entité), ou reste corrompue (glisser de point : aucun re-règlement au relâcher, résidu persistant).

Correctif : `if(aF&&bF)return;` sur les passes `h` et `v` — l'ancre du glisser cède à la contrainte : pendant le glisser la ligne reste droite et le point tiré ne suit le curseur que sur l'axe libre (y verrouillé par l'horizontale, x par la verticale), le garde-fou re-sout alors sans ancre sur un état déjà satisfait → aucun rebond au relâcher. Effet de bord corrigé au passage : un point fixé par contrainte `fix` (hors O) était emmené par le moyennage et NE REVENAIT PAS (le filet ne recollait que O) — test D : f.y restait à 7,5 après le glisser.

Tests : **nouvelle suite `tests/test_sk_hv_drag.cjs` enregistrée dans `tests/run.cjs` → `npm test` 46/46 vert**, **ROUGE vérifiée (8 échecs)** : glisser de point sur ligne h ancrée à O (déformé de 7,5 pendant ET après), glisser d'entité sur rectangle à O (a.y=-5, c.x=10 au milieu du glisser, retour au relâcher), point fixé par contrainte emmené (f.y=7,5 persistant) ; non-régression : ligne libre (extrémité libre suit l'ancre), rectangle re-serré après relâcher, O intact partout. `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-02-016.html`.

README : tests → 46 suites.

### `2026-10-02-017`

Décalage (offset) : « le décalage garde bien les tangences mais pas les coïncidences » — symptôme confirmé au questionnaire : **trous aux joints**. Enquête (`skOffsetApply`) : quand l'intersection des courbes DÉCALÉES est introuvable, chaque entité créait SON PROPRE point (`jointsBad` + `solo`, aucun pid partagé, aucune contrainte) → les bouts des copies ne sont plus liés et s'écartent au règlement suivant. Deux causes. (1) `circleCircleInt` renvoie `[]` dès que les centres sont confondus → un cercle dessiné en 2 ARCS concentriques est TOUJOURS non raccordé (1 trou en chaîne ouverte, 2 sur un cercle fermé), et `lineCircleInt` n'avait pas — contrairement à la ligne/ligne — de repli sur le point source `C0` (courbes décalées disjoints pour un angle aigu et un gros décalage). (2) `jInfo` (joint fusionné vs contrainte coincident de la source) était calculé sur `ch.order` pendant que l'inversion d'ordre (clic côté `S` fourni par l'UI, chaîne ouverte) réorientait `order` : les flags tombaient sur le MAUVAIS joint — la coincident n'était pas recréée là où elle était (ou l'était là où elle n'était pas).

Correctif : repli sur `C0` pour TOUS les types d'entités (ligne/cercle : projection du point source sur la droite décalée + point du cercle décalé à l'angle du joint, milieu ; cercle/cercle : rayons décalés à l'angle du joint, milieu) — le joint est TOUJOURS un pid partagé, fusion structurelle in-ouvrable, `jointsBad` ne subsiste que si `C0` est absent (jamais pour un vrai joint) ; et `jInfo` est calculé sur `order` après inversion, les tangences forcées de la source sont recréées au bon endroit.

Tests : **nouvelle suite `tests/test_sk_offset_joints.cjs` enregistrée dans `tests/run.cjs` → `npm test` 47/47 vert**, **ROUGE vérifiée (7 échecs)** : comportement (arcs concentriques ouverts : 1 trou, 4 pids sans fusion ; cercle en 2 arcs fermé : 2 trous ; swap `jInfo`/`order` : joint contraint → 1 pid au lieu de 2 distincts liés, joint fusionné → 2 pids au lieu d'1) + non-régression (résidu nul après règlement sur les 3 cas, suite `test_sk_offset_contraintes` inchangée). `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-02-017.html`.

README : tests → 47 suites.

### `2026-10-02-018`

Coque : « l'outil coque ne fonctionne pas bien tout le temps » — sur un document réel de l'utilisateur (extrusion 20 mm à dépouille −15° avec flip + congé exact R6, coque 1 mm ouvrant le dessus), `MakeThickSolid` avec `join=Arc` renvoie **IsDone=true SANS évidage** : le dessus reste en place, une face parasite (`OffsetSurface`) explose la boîte englobante hors gabarit (z −32,6 au lieu de −20) et le volume monte à 106 % de la base — aucun avertissement remonté, d'où le « parfois ça marche ». La même recette sur une boîte ou sans dépouille fonctionne parfaitement (elle ne doit donc pas être remplacée, mais doublée).

Correctif : chaîne de recettes **validées avant acceptation** — `occCoqueRecettes`, appelée par le rejeu (`occApplyCoque`) ET l'aperçu vert (`coquePreviewUpdate`, qui affichait lui aussi le junk) : (1) Arc direct — cas simples inchangés ; (2) `join=Intersection` — dépouille simple sans congé ; (3) `ShapeCustom.ConvertToBSpline(extr)` + Arc — les arcs d'offset non maniables sur les surfaces de dépouille deviennent calculables — puis `ShapeFix_Shape` si la topologie ressort invalide (3 faces/35 sans le fix). Chaque tentative passe `occCoqueEvidage` : bbox `AddOptimal` dans le gabarit base ±(2+2×paroi), ≥ +2 faces (parois internes + rebord), volume < 0,5×base — qui rejette le junk (106 %) et l'évidage partiel (72 %) et accepte le vrai évidage (9 %) ; une tentative rejetée n'est jamais retournée. Les refs durables des faces d'ouverture sont re-résolues sur la forme convertie (les handles de la base n'y sont pas valables).

Tests : **nouvelle suite `tests/test_coque_depouille.cjs` enregistrée dans `tests/run.cjs` → `npm test` 48/48 vert**, **ROUGE vérifiée (10 échecs)** sur `tests/fixtures/coque.json` (document réel), 3 configurations : A dépouille+congé (junk : 19f au lieu de 35, vol 146 736 > 0,5×base, bbox hors gabarit, anneau 7 914 mm² non ouvert, 1 face non maillable), B dépouille seule (idem), D sans dépouille (vert d'entrée = non-régression de la recette directe) ; puis VERT : A → 35f/11 958/anneau 352/valide/mailable, B → 19f/12 445, D inchangé, `_m=1/1` partout. Non-régressions `test_coque_sel` + `test_repeat_session` ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-02-018.html`.

README : tests → 48 suites.

### `2026-10-02-019`

Décalage : sur « Esquisse 2 » (face) du document réel de l'utilisateur, les 8 copies du décalage **ne forment pas de boucle** : aucun pid partagé entre les copies (16 extrémités libres, trous structurels aux jonctions) — et le document sauvé garde en plus 3 bouts aberrants (±10⁴ mm) stables au règlement (résidu 2,66e-15 : dégâts d'une version antérieure, aucun chemin actuel ne produit de telles valeurs sur ce document, vérifié par rejeu frais). Cause : `skOffsetChains` ne relie les entités que par pid fusionné OU contrainte coincident — or une **projection** crée ses points DUPLICATA à chaque jonction (pids distincts, écarts ~2e-8, aucune contrainte) → 8 chaînes singleton ouvertes → aucune phase de joints → copies déconnectées.

Correctif : joint **géométrique** (superposition < 1e-6) ajouté à pid/coincident dans tout le chaînage (`hit`, orientation, fermeture — helper `skJointSame`) + repli dans `jInfo` : `J0={pid: extrémité sortante de la source, forced:false}` sur les jonctions purement géométriques → les 8 joints des copies partagent UN pid (fusion structurelle, boucle in-ouvrable), avec C0 = position source saine pour l'intersection des courbes décalées ; la sémantique `forced` (recréer la coincident de la source) reste réservée aux vraies contraintes. Les vieilles copies aberrantes du document se réparent en les supprimant puis en redécalant (scénarios B/C du test).

Tests : **nouvelle suite `tests/test_sk_offset_projetee.cjs` enregistrée dans `tests/run.cjs` → `npm test` 49/49 vert**, **ROUGE vérifiée (6 échecs)** sur `tests/fixtures/décalage.json` (document réel) : A chaînage (8 chaînes singleton au lieu d'1 boucle fermée de 8), B décalage frais côté intérieur (pids=16 partages=0), C rejeu `S=null` « décaler auto » (idem) ; VERT après correctif : 1 chaîne fermée de 8, 8 pids partagés dans les deux sens de côté, rayons 6,128/13,872, cotes gap 3,872, résidu nul, aucun bout |coord|>100 mm. Non-régressions `test_sk_offset_joints` + `test_sk_offset_contraintes` ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-02-019.html`.

README : tests → 49 suites.

### `2026-10-02-020`

Esquisse : en mode édition, l'arborescence (menu des corps / fonctions) reste visible derrière le voile translucide de l'esquisse (rgba .72) et encombre le plan de travail — elle doit se rabattre à l'entrée et redevient visible à la sortie.

Correctif : à l'entrée (`openSketch`) l'arborescence se RABAT automatiquement ; à la sortie (`closeSketch`) elle redevient visible. État porté par un helper partagé `treeFoldSet`/`treeFolded` (source de vérité unique : classe `folded` du wrap, libellé ❯/❮ et titre de l'onglet) — l'état antérieur est mémorisé (`skTreeFoldSave`) : si l'arborescence était déjà rabattue avant l'entrée elle reste rabattue à la sortie (choix manuel conservé), et un dépliage manuel PENDANT l'édition est respecté (nesting sans effet). Le repli automatique n'écrit jamais dans `localStorage` : seul le clic sur l'onglet persiste l'état (`minifusion_treeFolded`).

Tests : **nouvelle suite `tests/test_esquisse_arbre_rabat.cjs` enregistrée dans `tests/run.cjs` → `npm test` 50/50 vert**, **ROUGE vérifiée (8 échecs)** : A1/A2 (repli à l'entrée, visible à la sortie), B0/B1/B2 (état antérieur rabattu respecté des deux côtés), C0 (repli), C3 (persistance du clic manuel), D0 (repli) ; VERT après correctif sur les 4 scénarios (entrée/sortie, antériorité, localStorage non écrit par l'entrée/sortie, choix manuel en cours conservé). Non-régressions arbre/esquisse (`test_arbre_selection`, `test_tree_filter`, `test_esquisse_transparence`, `test_fao*`) au run complet ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-02-020.html`.

README : tests → 50 suites.

### `2026-10-02-021`

Esquisse : dans le document réel de l'utilisateur (rectangle 110×80 XY extrudé 20 mm puis 4 congés verticaux r=20 sur les coins), une esquisse ouverte sur la face haute n'affiche que le rectangle net — les congés sont absents de la pièce translucide ET de la référence (8 lignes, 0 arc), alors qu'une esquisse XY montre la pièce avec ses congés. Cause : `openSketch` verrouillait la timeline APRÈS la fonction porteuse (`tlEditLockAfter`) pour une esquisse sur face non consommée → le rejeu excluait `xf_3` → modèle tranché à 6 faces, avec la note « solide fini » annoncée à tort.

Correctif : esquisse sur face **non consommée** → **aucun verrou, modèle complet** — la porteuse est antérieure donc toujours rejouée ; les fonctions suivantes, congés compris, restent visibles (la face ne disparaît jamais de l'écran). `tlEditLockAfter` supprimée (code mort). Inchangés : esquisse **consommée** (verrou avant la consommatrice, état antérieur), esquisse libre, fondu translucide 0,75 ; la note « solide fini » devient exacte. Contrat T3 de `test_esquisse_transparence` révisé en conséquence : modèle complet (aucun verrou) au lieu du verrou après porteuse — l'ancien verrou excluait toute fonction suivante, mécanique même du bug.

Tests : **nouvelle suite `tests/test_esquisse_face_conges.cjs` enregistrée dans `tests/run.cjs` → `npm test` 51/51 vert**, **ROUGE vérifiée (3 échecs)** sur `tests/fixtures/face-congé.json` (document réel) : A1 verrou `xf_3` au lieu de `null`, A2 6 faces au lieu de 10, A3 0 arc dans la référence ; VERT après correctif (10 faces, 8 lignes + 8 arcs, note exacte, fondu actif) avec non-régressions esquisse XY libre et esquisse consommée (verrou `ex_2`). `test_esquisse_transparence` révisé (T3) puis vert ; run complet 51/51 ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-02-021.html`.

README : tests → 51 suites.

### `2026-10-02-022`

Esquisse : en mode édition, le menu FAO (colonne `#faoWrap` : barre « + Usinage » + panneau « FAO · posages ») reste ouvert par-dessus le voile translucide de l'esquisse — il doit se cacher à l'entrée et se rouvrir à la sortie, sans jamais y toucher s'il était déjà replié.

Correctif : à l'entrée (`openSketch`) le menu FAO se replie s'il est ouvert (état mémorisé `skFaoFoldSave`, mêmes conventions que l'arborescence) ; à la sortie (`closeSketch`) il se rouvre **uniquement s'il était ouvert avant l'entrée** — déjà replié : ni l'entrée ni la sortie ne l'affectent, dépliage manuel pendant la session conservé. État posé par le nouveau helper partagé `faoFoldSet` : repli idempotent **sans** `localStorage` — la préférence persistée `minifusion_faoFolded` n'est jamais réécrite en édition (seul le clic de l'onglet `fold()` persiste, comme avant). Refs réelles `faoCntEl`/`faoTogEl` posées avant la restauration initiale (lecture par id ambiguë sous harnais).

Tests : **nouvelle suite `tests/test_esquisse_fao_cache.cjs` enregistrée dans `tests/run.cjs` → `npm test` 52/52 vert**, **ROUGE vérifiée (7 échecs)** : A1/A2/A3 (panneau, barre et onglet non cachés à l'entrée), B2 (barre jamais restaurée à la sortie), D1/D2/D3 (scénario manuel : caché à l'entrée, dépliage en session, choix conservé) ; VERT après correctif (A caché, B réouvert, C déjà replié intouché, D choix manuel conservé, zéro écriture `minifusion_faoFolded` en édition, clic manuel toujours persistant). Non-régressions `test_fao_barre3d` (repli du panneau par la flèche), `test_esquisse_transparence`, `test_esquisse_arbre_rabat` au run complet ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-02-022.html`.

README : tests → 52 suites.

### `2026-10-03-001`

Esquisse : la projection d'une arête circulaire rend parfois son **inverse** — l'arc projeté couvre le complément de l'arête choisie (« des fois j'ai l'inverse, il faut projeter l'arête de l'arc et pas son inverse ») ; dans le document réel de l'utilisateur (`arêtes.json`), l'Esquisse 6 projette 4 arcs d'arrondi dont `e17` (coin haut-droit) avec un secteur de 268,5° au lieu de 91,5° — le grand cercle en pointillé de la capture. Cause : l'entité arc va **toujours** de `pa` à `pb` en sens trigonométrique (`arcAngles`), mais la projection reprenait `pa=pts[0]`, `pb=pts[dernier]` dans l'orientation OCCT de l'arête — orientation arbitraire : quand l'arête est parcourue « à l'envers », le CCW devient le complément (les 3 autres arcs étaient bons par chance).

Correctif : nouvel helper `arcOrient(cx,cy,…,milieu)` ordonne les extrémités pour que le secteur trigonométrique `pa→pb` contienne le **milieu réel de l'arête** (jamais son complément) — appliqué aux deux chemins : création (`projectEdgeAt`) et rafraîchissement associatif (`findClosestProjectedEdge` → `updateAssociativeProjections`), ce qui **répare aussi les documents déjà sauvés inversés** au prochain rejeu. Lignes et cercles pleins inchangés (sans orientation).

Date : première version du **2026-10-03** (les lots `-021`/`-022`, commis ce jour, portaient encore le préfixe `2026-10-02`).

Tests : **nouvelle suite `tests/test_proj_arc_sens.cjs` enregistrée dans `tests/run.cjs` → `npm test` 53/53 vert**, **ROUGE vérifiée (2 échecs)** sur `tests/fixtures/arêtes.json` (document réel) : A1 (après rejeu `e17` en 268,5°, `sensOK=false`), B1.2 (la création renvoie le complément pour le même arc — bonne arête, mauvais sens) ; VERT après correctif (4/4 arcs `sensOK=true` en 91,5°, création contenante sur les 4, `memeArrete=true`). `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-03-001.html`.

README : tests → 53 suites.

### `2026-10-03-002`

Renumérotation version produit : le badge du bandeau passe **V0.1.0 → V0.1.1**, en cohérence avec le tag `V0.1.1` posé sur le lot précédent (milestone « projection circulaire fiable »).

Correctif : `prodVer` dans `src/96-bandeau-groupes.js` (`v.textContent='V0.1.1'`) — la coque HTML n'est jamais éditée à la main, le badge reste injecté par `styleBandeau`.

Tests : `tests/test_prodver_badge.cjs` révisé (8 mentions V0.1.0 → V0.1.1, regex échappées comprises), **ROUGE vérifiée (3 échecs : texte src/96, script construit, `textContent` runtime)** → VERT ; run complet 53/53 ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-03-002.html` ; tag `V0.1.1` déplacé sur ce commit (message mis à jour).

### `2026-10-03-003`

Ébauche 3D, phase A : **zones de limitation HAUTES et BASSES par sélection d'arêtes** — Haut/Bas se figeaient à la saisie manuelle ; on sélectionne maintenant des arêtes du modèle pour cadrer la zone à ébaucher (suite du plan « Ébauche 3D », point 7).

Correctifs/fonctions dans `src/88-fao.js` : `faoZlimFromEdges` (capture : Zmax/Zmin sur la sélection + ancre par germe, refuse si ztop ≤ zbot), `faoZlimRematch` (rejeu : re-branche les ancres sur les arêtes du nouveau solide en tolérance 3D = `FAO_CHAIN_TOL`, stale si introuvable/hors tolérance — valeurs figées gardées + alerte fiche), `faoZlimBreak` (édition manuelle d'un champ casse le lien), `faoRematchAll` (passe unique en fin de rejeu : chaînes XY **et** limites Z, appelée par `faoChainReplay`), `faoZlimStart`/`faoChainStart(setupId,opId,kind)` en mode `kind:'z'` (sans tangences, panneau dédié « Limite Z »). Fiche rough3d : badge « lié à N arête(s) », boutons « Limiter Z (arêtes) »/« Retirer », alerte si arêtes perdues ; libellé arbre `[Z]⚠` ; alerte d'export si zlim stale ; `faoSanitiseOps` retire un `zlim` vide. Les générateurs lisent toujours `op.ztop`/`op.zbot` : **aucun changement de chaîne de fabrication** — le lien n'est qu'une source de vérité dérivée (même régime que les projections associatives).

Tests : **nouvelle suite `tests/test_fao_zlim.cjs` enregistrée dans `tests/run.cjs` → `npm test` 54/54 vert**, **ROUGE vérifiée (FATAL : `zOp.zlim.stale` absent)** sur 16 points (capture A, garde B, rejeu C×5, casse D, `faoRematchAll` E×2, fiche F×4) ; VERT après implémentation ; run complet 54/54 ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-03-003.html`.

### `2026-10-03-004`

Ébauche 3D, phase D : **mode trocoïdal unique** — les trois stratégies de vidage (Morph / Zigzag / Adaptive) et les passes fines `ap2` sont supprimées : l'ébauche 3D adopte le seul pelage trocoïdal (déjà le meilleur des trois), les anciens documents étant migrés à la lecture (suite du plan « Ébauche 3D », point 3).

Correctifs dans `src/88-fao.js` : `faoGenRough3D` ramené à un plan de niveaux épais `ap` + `faoRoughAdaptiveLevel` (options `strategy`/`ap2`/`refineTol` ignorées) ; suppression des helpers `faoRoughLevel`, `faoRoughMorph`, `faoRoughZigzag`, `faoRoughIntervals` (`faoRoughRegions` et `faoHelixEntry` conservées, utilisées par le mode unique) ; `faoShadowIntervals` distingue maintenant le **niveau vide de matière** (surfaçage pleine largeur, historique morph) de la **ligne hors section** (conservatif, rien à y vider) — le pelage plaquait autrefois au-dessus de la pièce (bug plat) ; fiche rough3d sans selecteur de stratégie, sans champ `ap2` ni rang « Parois fin / Fond fin », aide `ae` en mode trocoïdal, libellé arbre sans `+fin` ; `faoOpDefaults`/`faoOpMoves` sans les champs morts ; `faoSanitiseOps` retire `strategy`/`ap2`/`radial2`/`axial2` des documents anciens (même régime que `zlim`) ; README (Ébauche 3D, alertes `ae`) mis au mode unique.

Tests : révision façon T3 (pas de nouvelle suite) — `tests/test_fao3d.cjs` (10 points réécrits : paroi (25,52.5), `ap2` ignoré, `strategy` sans effet, helpers supprimés, comparaison troco unique) et `tests/test_fao.cjs` (fiche sans « Morph/Zigzag/Adaptive »), **ROUGE vérifiée (7 échecs)** → VERT après implémentation ; run complet **54/54** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-03-004.html`.

### `2026-10-03-005`

Ébauche 3D, retour utilisateur B1 : **marges et congés usinés** — l'ancien complément borné à la boîte laissait la manchette autour des plots (intervalles nuls `B.x0+r..B.x1-r` bornant la sortie, lignes de marge sans matière retournant `[]`, grille bornée `[B.y0+r, B.y1-r]`, union des régions fusionnant les colonnes pleines en travers des plots) (suite du retour utilisateur « Ébauche 3D », point 1).

Correctifs dans `src/88-fao.js` : `faoShadowIntervals` — sortie d'un rayon hors boîte (`lo=B.x0-r`, `hi=B.x1+r`), lecture **par distance à l'intervalle matière** `[yLo,yHi]` (`d>=r` → pleine largeur même sans lecture, sinon conservatif), grille `ys` de `B.y0-r` à `B.y1+r` avec skip des lignes purement hors brut ; `faoRoughRegions` : union **uniquement sur recouvrement 1:1 mutuel** (une ligne pleine ne fusionne plus les colonnes — pas de pelage en travers des plots) ; `faoDiscClear` : **distance euclidienne au contour** (un échantillon hors matière sans croisement en Y passait et l'hélice plongeait dans la pièce) ; entrée hélice/micro-hélice vérifiée sur **toutes les sections du niveau** (`segsAll` = ombre, pas seulement la slice à z — un voile fin au-dessus était invisible) ; arcs trochoïdes marqués `arc.troch` (distingués des arrondis `R<=2`).

Tests : révision façon T3 (pas de nouvelle suite) — `tests/test_fao3d.cjs` (marge latérale/avant dégagées sur canal + plat, emprise z=10 pièce respectée, `<=12` rapides, arrondis hors troch, fente en distance coin-juste sur les deux plots), **ROUGE vérifiée (3 échecs : marge latérale, marge avant, plat marge)** → VERT après implémentation ; run complet **54/54** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-03-005.html`.

### `2026-10-03-006`

Ébauche 3D, retour utilisateur A : **sens long** — le pelage suivait toujours l'axe X : sur un brut portrait, des lignes pleines sur le court axe et des liaisons rapprochées le long du grand axe (virages nombreux, temps de coupe mauvais) (suite du retour utilisateur « Ébauche 3D », point 2).

Correctif dans `src/88-fao.js` `faoGenRough3D` : **brut plus haut que large → transposition x↔y** du maillage et de la boîte avant pelage (lignes le long de Y, hauteurs d'outillage identiques), puis remise en place de chaque move à la sortie (miroir y=x : IJK échangés, sens cw inversé pour les G2/G3). Carrés et paysages inchangés — les boîtes de test BX/BX2 (paysage) et SP (carré) ne basculent pas.

Tests : révision façon T3 (pas de nouvelle suite) — `tests/test_fao3d.cjs` (brut portrait 60×120 : liaison longue verticale `Δx=0, Δy>5` entre colonnes, comptée dans une run coupée — cassée aux retraits), **ROUGE vérifiée (1 échec : lv=0)** → VERT après implémentation ; run complet **54/54** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-03-006.html`.

### `2026-10-04-001`

Retour utilisateur 3 : **traces de parcours plus précises** — les arcs étaient développés en pas fixe de 5° (corde de 17,5 mm sur un R200 : le cercle « se voyait » en polygone à l'aperçu comme dans la visionneuse) (suite du retour utilisateur du 4 octobre, point 3).

Correctif dans `src/88-fao.js` `faoArcSegs` : subdivision **adaptative par écart de corde (sagitta ≤ 0,05 mm)** — `dth = min(5°, 2·acos(1 − sag/r))`, plafond 1024 segments ; les grands rayons sont découpés bien au-delà de 5° (R200 90° : 18 → 36 segments, corde 8,9 mm), les petits rayons (trochoïdes R2,3, arrondis R8) gardent les 5° historiques — ni changement de densité là où c'était déjà juste. Consommateur unique : aperçu FAO (`faoRefreshPreview`) et trace au fil de l'eau de la visionneuse (`faoViewerBuild`) ; G-code inchangé (G2/G3).

Tests : révision façon T3 (pas de nouvelle suite) — `tests/test_fao.cjs` (arc R200 90° : corde max < 15 mm ; garde-fou R2,3 90° = 18 segments inchangés), **ROUGE vérifiée (1 échec : 17,45 mm)** → VERT après implémentation ; run complet **54/54** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-001.html`.

### `2026-10-04-002`

Ébauche 3D, retour utilisateur 1 : **mini-passes Z** — l'interprétation « passes de contour » précédente était fausse : chaque cycle descend d'`ap` en trocoïdal, **puis** les mini-passes usinent **uniquement les parois** entre le plan atteint et le plan du dessus, à profondeur `k·ap/(nb+1)` (strictement entre les deux plans, jamais dessus ; ex. `ap=3`, `nb=2` → sous 1 et 2) avec décalage radial décroissant `laisse·(nb−k)/nb` — nul au plus profond (la paroi est finie à ce niveau : pas de passe finale) ; le centre est déjà pelé par le trocoïdal, le plan du dessus devient le départ du cycle suivant (suite du retour utilisateur du 4 octobre, point 1).

Ajouts dans `src/88-fao.js` : champ d'opération **`minipasses`** (0 = off, nettoyé 0-9 à la lecture, champ **« mini »** dans la fiche Ébauche 3D avec infobulle) ; `faoGenRough3D` émet, après chaque niveau, les mini-passes de la bande `[plan, plan supérieur]` — `zm = round(bandTop − k·h/(nb+1))`, dilation `r = D/2 + s_k`, appel à `faoRoughAdaptiveLevel` avec option **`{ringOnly:true}`** ; `faoRoughAdaptiveLevel` (nouveau paramètre `opt`) : en `ringOnly`, seule la boucle extérieure (k=0, à la dilation du niveau) est émise — **contour de parois à distance `r+s_k`**, sans pelage intermédiaire ni centre ; entrées hélice/rampe/micro-hélice et goulets trocoïdaux inchangés (l'hélice au centre est rejetée par le disque, la rampe part du bord).

Tests : révision façon T3 (pas de nouvelle suite) — `tests/test_fao3d.cjs` (plaque 60×40×18, `ap=6` → plans [12,6,0] ; `minipasses=2` → z = 16/14, 10/8, 4/2 ; plans 16 et 14 usinés >5 moves ; contour seul : ≤4 moves sous `r_eff` à chaque niveau ; plan trocoïdal z=12 toujours usiné ; off par défaut : aucun plan z=16 sans le champ), **ROUGE vérifiée (1 échec : plans z=16/14 = 0/4 moves)** → VERT après implémentation ; run complet **54/54** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-002.html`.

### `2026-10-04-003`

Retour utilisateur 4 : **rendu de la matière — cubes trop gros** — la grille du rendu était isotrope (`pas = cbrt(volume/40000)`, plafond 200 000 voxels) : sur un brut 300×200×50, maille de 4,22 mm — les colonnes se voyaient en gros cubes (suite du retour utilisateur du 4 octobre, point 4).

Correctif dans `src/88-fao.js` — **grille anisotrope par défaut** (le chemin `pas` explicite des tests reste strict et strictement identique) : `faoMatterGrid` sans pas fourni → maille XY `max(0,5 mm, √(surface/60000))` avec boucle de garantie ≤ 60 000 colonnes, et **Z découplé** : 32 couches maximum (`pz = H/nz`, nouveau champ `pz` de la grille) — la Z-map `h[]` reste continue et reste la seule source du rendu, seules les colonnes XY comptent à l'écran ; `faoMatterCarveSeg` mesure les couches en `pz` (équivalent à `pas` sur grille isotrope), idem repli `faoMatterColTop` et `full`. Exemples : 300×200 → 4,22 à 1,00 mm ; 150×100 → 3,1 à 0,5 mm ; buffer de colonnes ≤ 21,6 Mo, mises à jour diff-inchangées (fluidité préservée).

Tests : révision façon T3 (pas de nouvelle suite) — `tests/test_fao.cjs` : plafond du test 013 révisé (`n ≤ 2100000` — anisotrope ≤ 60 000 × 32, l'ancien « ~40k » ne s'applique plus) + nouveau bloc grille anisotrope (maille XY ≤ 1,6 mm sur 300×200, colonnes ≤ 60 000, `pz ≥ maille`, `nz ≤ 32`, Z-map exacte 40 après carve sur maille fine), **ROUGE vérifiée (2 échecs : maille 4,22 mm, `pz` absent)** → VERT après implémentation ; run complet **54/54** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-003.html`.

### `2026-10-04-004`

Retour utilisateur 4 : **finition géodésique — sens horizontal, limites Z, garde-fou fraise droite** (points 6 et 2) — les iso-courbes du champ de distances drapaient les parois en arcs autour de la graine : les liaisons partaient à **Z variable** sur les faces en pente, les plateaux hors plage Z étaient usinés quand même, et la fraise droite (rayon actif nul) laissait une arête non finie sur tout ce qui n'est pas horizontal.

Correctif dans `src/88-fao.js` — **finition à deux familles** : `faoGeoFlags` partitionne les faces (plate = normale quasi verticale `nz ≥ 0,99` ≈ 8°, marge de tessellation ; sinon inclinée/mur) ; (1) **passes horizontales iso-Z** sur les faces en pente — champ Z des sommets dans `faoIsoSegs` (nouveaux paramètres optionnels `flags`/`want`), niveaux ancrés au plafond `ztop − k·pas` jusqu'à `zbot`, descendant (`départ Sommet`) ou ascendant (`Fond`) : **chaque liaison part à Z constant** ; (2) **anneaux géodésiques** (ancien champ Dijkstra) sur les **seuls plateaux**, dans les limites Z — jeux de triangles disjoints → couture nulle, couverture des surfaces horizontales conservée. **Limites Z** : champs `ztop`/`zbot` ajoutés à `faoNewOp` (hérités du brut) et au dispatch, héritage du stock à la lecture, rangée **Zhaut/Zbas** (`zz()`) dans la fiche. **Garde-fou fraise droite** : `kind='flat'` sur un modèle avec face en pente → `[]` (aucune trajectoire au lieu d'un résultat trompeur), drapeau `op.geoBlocked` recalculé à chaque dispatch (jamais stocké, `delete` à la lecture) + note d'avertissement dans la fiche.

Tests : révision façon T3 (pas de nouvelle suite) — `tests/test_fao3d.cjs` : plan horizontal z=30 (offsets : ball D8 → 34, torique coin 1 → 31, droite → 30), rampe 40×40 à ~26° (liaisons à Z constant, `ztop=12` → coupe max < 16, fraise droite refusée `[]` / acceptée sur plan), sphère R10 inchangée (anneaux centre à `R+4`, 1ᵉʳ anneau z > 5), **ROUGE vérifiée (3 échecs : 16 liaisons variables, ztop ignoré → 23,58, droite non refusée)** → VERT après implémentation ; run complet **54/54** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-004.html`.

### `2026-10-04-005`

Retour utilisateur du 4 octobre (nouvelle salve, point 1) : **surfaçage — la dernière passe ne finit pas le travail** — le boustrophédon testait la lisière AVANT de la sillonner : la ligne de bord n'était jamais émise (le compte `faoFacingCount` l'annonçait pourtant, d'où l'affichage > réel), la dernière passe finissait un alignement en deçà de la lisière, laissant un bandeau non usiné sur toute la longueur (ex. D25/écart 20 : manque 7,5 mm au bord).

Correctifs dans `src/88-fao.js` :
- `faoGenFacing` : la ligne est sillonnée **avant** le test de lisière (le `sens` n'est retourné qu'après la ligne) — toutes les lignes du compte sont usinées à chaque niveau, dont la dernière passe, sans jamais de traversée diagonale (la transposition verticale reste en dépassement X) ; le cas `count===1` sillonne aussi sa ligne ;
- `faoClipMovesPoly` (clip impair des limites chaîne) : le point de **sortie** est émis côté dé-dans (dichotomie `t0`) — plus de coupe 0,1 mm au-delà de la limite (régression révélée par le nouveau sillon sur la lisière `y=80`, le point de sortie tombait à 80,06).

Tests : révision façon T3 (pas de nouvelle suite) — `tests/test_fao.cjs` : nouveau test **024** (aide `swFn` : lignes sillonnées en matière par transposition horizontale) — lignes sillonnées = `faoFacingCount` sur cas générique (15), passe finale `npz=4` à z=0 (15), et les chiffres du document `Cavité Usinage` D25/écart 20 (8), **ROUGE vérifiée (3 échecs : 14/15, 14/15, 7/8)** → VERT après implémentation (clip corrigé au passage) ; run complet **54/54** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-005.html`. Document de reproduction `Cavité Usinage.minifusion.json` ajouté au dépôt.

### `2026-10-04-006`

Retour utilisateur du 4 octobre (point 2) : **ébauche 3D — dérive en X, gradins sur les faces** — la position des lignes se bornait à l'existence (`y±aeA`, avec aeA < r) : une ligne pouvait rester à `mur∓aeA` au lieu de `mur∓r`, la coupe mordait la paroi en décalage et les faces horizontales gardaient des gradins.

Correctifs dans `src/88-fao.js` :
- nouveau `faoYCands` : bornage exact au RAYON — lecture verticale des croisements X des segs de section aux plans vertex du niveau (3 échantillons par intervalle, appariement even-odd), règle recouvrement > 1 µm (tangence et ulps admis), candidats `paroi∓r` arrondis au µm et triés par proximité ;
- `faoRoughAdaptiveLevel` : si le disque traverse une paroi, la ligne est **clampée** au voisin sûr — descente jusqu'à 12 paliers (chaque échec raffine avec les croisements restants au candidat : paroi courbe des angles arrondis), candidate purement hors brut ignoré, ligne **abandonnée** si aucun voisin sûr (jamais de coupe sous paroi) ; dédup `seenY` puis tri des lignes après clamp.

Tests : façon T3 (pas de nouvelle suite) — `tests/test_fao3d.cjs` : nouveau test **025** (maillage à coins arrondis : bordage des murs Y haut/bas au rayon, garde en X, marge), **ROUGE vérifiée (2 échecs exacts : `y max 58.00 <= 55.6`, `y min 26.00 >= 26.4`)** → VERT après implémentation ; `tests/test_fao.cjs` VERT (facing=33 pocket=65 contour=7 drill=8, G1 siemens=74 fagor=74) ; run complet **54/54** ; probe sur le document réel `Cavité Usinage` : bornes de poche exactes au rayon sur les 6 niveaux (±45.97 … −26.51/28.21), pathX = intervalles, 0 gouge ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-006.html`.

### `2026-10-04-007`

ROUGE 026 (défaut propre, sans retour) : **ébauche 3D — descente de bornage abandonnée, rayé le long du mur** — sur le document réel `Cavité Usinage`, la descente de `faoRoughAdaptiveLevel` (candidats restants, garde 12 paliers puis `return`) progressait de quelques µm par palier quand la paroi est vue à des x différents selon le candidat ré-échantillonné : garde épuisée → ligne abandonnée → **coupe manquant** le long du mur sur 12 niveaux (z49/48/41/28…20.5, écarts 0.6 à 5.7 mm avec la borne sûre).

Correctif dans `src/88-fao.js` (`faoRoughAdaptiveLevel`) : la descente devient **sens du 1er candidat sûr → remontée de la grille `aeA` jusqu'au 1er point propre → bissection** entre le dernier point sale et le premier propre (borne ±1e-4, convergence garantie, coût borné) ; l'abandon ne subsiste que si le mur est réellement inaccessible (jamais de coupe sous paroi) ; candidats purement hors brut toujours ignorés.

Tests : nouvelle suite **55** `tests/test_fao_bornage.cjs` — nouveau test **026** (document `Cavité Usinage`, 30 niveaux × 2 côtés) : vérité terrain indépendante de l'implémentation — par niveau (principal + mini-passes), la ligne de grille extérieure traversant le mur sert de départ à une bissection sur `clean(t)` (`faoYCands` vide) ; un coupe doit exister à ≤ 0.5 mm de cette borne (contrôles à 0), **ROUGE vérifiée (12 niveaux en écart, max 5.67)** → VERT après implémentation (écarts ≤ 0.001, 4072 moves au lieu de 3968) ; run complet **55/55** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-007.html`.

### `2026-10-04-008`

Release **V0.1.2** — retour 4 octobre (salve 3) : l'arrondi des angles vifs ne sortait que les angles droits, la compensation de bombé s'avérait sans effet, et la trace de simulation doit suivre la fraise.

**`faoRoundPath` — arrondi tangent muet hors 90°** : `t=R/tan(θ/2)` et `rr=t·tan(θ/2)` étaient inversés (ils ne coïncident qu'à θ=90°, où `tan=cot=1`) : L exact 90° → 1 arc, coin 45° → 0 arc, coin 5° → 0 arc — sur le brut réel `Cavité Usinage`, **0 arc émis pour 6916 coins éligibles** (la garde de tangence rejetait chacun d'eux) : l'option rayon d'arrondi était silencieuse sur presque tous les tracés. Correctif : distance tangente `t=R·tan(θ/2)` (clampée aux demi-longueurs des segments) puis rayon effectif `rr=t/tan(θ/2)` (≤ R, exact si non clampé).

**Bombé (`bulge`) supprimé du rayon parent** : la compensation `arrondi*0.5` (`D/2+L.radial+bulge`) ne modifiait pas la garde — sonde sur le document réel (A : bombé 1, B : bombé 0, C : sans arrondi) : **A et B au même pire point (0.4844 mm), 0 gouge, 0 point < 0.4** ; sans arrondi : 0.4985 — l'arrondi tangent ne coûte que 0.014 mm et le bombé ne changeait rien aux écarts. Les 4 lignes de la compensation retirées (calcul à l'option, passage à `faoGenRough3D`, variable, rayon parent).

**Simulation — trace fenêtrée qui suit la fraise** : retour « la trace suit la fraise et disparaît au fur et à mesure » — `faoViewerBuild` calcule le cumul `lens` (mm, exposé `vw.lens`), nouveau helper pur `faoTraceWindow(lens,i,f)` = index de début d'une fenêtre de **40 mm** derrière la fraise (0 sans `lens` → tracé complet historique), `faoViewerApply` applique `setDrawRange(from, vw.drawn)` dans le garde-scène (`vw.drawn=to−from` calculé hors garde : le harnais THREE est un Proxy dont `drawRange`/`setAttribute` sont des stubs — la logique vit dans le helper pur, donc testable).

**Entrée forcée** : `fmode=forced!=='auto'?forced:(isTroch?'helix':'auto')` — l'entrée imposée par l'utilisateur (`forced`) prime désormais sur le défaut hélice du mode trocoïdal.

Tests : révision façon T3 (pas de nouvelle suite) — `tests/test_fao3d.cjs` : `blkD` hoisté au-dessus du canal puis assertions de garde **physique** (canal 4.99 + garde de fuite sur les 2 poteaux, z=10 : 4.99 contre 40..60 / 20..40, arrondi 4.99/4.59, adaptatif 5.49, surplomb 5.49, voile 5.49), **ROUGE vérifiée (2 échecs : fmode forcé ignoré, voile)** → VERT après correctifs ; `tests/test_fao_bornage.cjs` : `rOf(z)→13`, gouges ≥ −0.1 ; `tests/test_fao.cjs` : `lens` aligné sur les temps, `faoTraceWindow` (0 au départ, > 0 au dernier point), `drawn` fenêtré (`>=2 && < total`). Arrondi **ROUGE vérifiée sur cas synthétiques** (45° et 5° : 0 arc → 1 arc après correctif ; L 90° inchangée) ; run complet **55/55** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-008.html` ; badge produit **V0.1.1 → V0.1.2** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 8 mentions).

### `2026-10-04-009`

Release **V0.1.3** — demande utilisateur : piloter l'entrée de la géofinition comme sur l'ébauche 3D, interdire l'hélice sans matériel enlevé en amont, et regrouper entrées/sorties par zone (fin des couples à secu par chaîne).

**Mode d'entrée `entry`** : nouvelle option *Entrée* sur la fiche géofinition (auto / hélice / rampe, libellés et bulles identiques à l'ébauche 3D) ; `faoOpDefaults('geofinish')` prend `entry:'auto'`, le dispatch transmet `entry` + `hasRrough`. `faoGeoEntryMode(entry,hasRrough)` : ramp/helix forcés restent tels quels, auto = hélice si débourrage (`pocket3d`) ou ébauche 3D (`rough3d`) actif **avant** cette finition dans le posage, sinon repli rampe — l'hélice creuse sa place en tournant, elle plongerait dans la matière pleine sans débourrage ; `faoGeoHasRrough(job,op)` balaye les opérations précédentes actives (`on!==false`), op introuvable → false (jamais d'hélice au doute). Garde paroi raide inchangée (`n_z≤0.5` + disque clair), sinon repli rampe.

**Groupement par zone (`faoGenGeoFinish`)** : collecte d'abord toutes les chaînes d'un niveau (`zones[]`, `level()`), puis émission — **1 entrée + 1 sortie à secu par zone** au lieu d'un couple par chaîne ; liaisons intra-zone = lift sur place + XY à Z de liaison (`max(zmax,min(secu,zmax+max(1,D*0.2)))`) si `pathOK`, sinon passage par secu. `pathOK` vérifie la colonne (`faoShadowPlanes(travel-R → zmax)`) point et contour : seuil `= min(R, distance réelle des extrémités)` — les points de coupe en normales de sommet fondues peuvent situer sous l'enveloppe au liseré, la liaison ne doit jamais être pire qu'eux ; extrémité dedans → repli secu. Chaînes fermées **et** ouvertes évaluées sur tous les candidats (démarrage × 2 sens : pivot `slice(k).concat(slice(1,k))`, inversion de sens), meilleur = passage au plus court qui passe (sinon plus court) — chaque chaîne s'adapte à la fin réelle de la précédente ; sortie = retrait vertical sur place à secu.

Tests : façon T3 (insertion dans `tests/test_fao3d.cjs`) — 5 nouveaux tests géofinition : `faoGeoEntryMode`/`faoGeoHasRrough` définies + 8 cas de mode (ramp forcé, helix±ébauche, auto±ébauche, défaut, valeur inconnue), 5 cas de détection d'ébauche/débourrage avant, défaut `entry===auto`, **groupement 3 tours** (3 `mkBox` fusionnés, `step 6`, secu 45 : `nS<=2*nZ+2` avec `nZ>=6`), hélice + ébauche avant ≠ sortie rampe — **ROUGE vérifiée (5 échecs exacts : fonction absente ×2, défaut, groupement 32>22, hélice identique)** → VERT après implémentation (20 rapides à secu / 10 zones contre 32/10 avant : les 12 liaisons passent en Z de liaison) ; `helix sans ébauche = ramp` en sortie identique conservé ; run complet **55/55** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-009.html` ; badge produit **V0.1.2 → V0.1.3** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 8 mentions).

### `2026-10-04-010`

Release **V0.1.4** — Lot B de l’ébauche 3D : l’ébauche passe en **suivi de contour** (fin du pelage en lignes de grille), avec index spatial dense, et le trochoïde des goulets ne doit plus mordre la matière.

**Suivi de contour (Lot B)** : `faoRoughAdaptiveLevel` émet les chaînes de section du niveau **offsetées à `d = r + k·aeA`** (centre d’outil ≥ d partout, jamais de gouge), les **cadres E0/E-k** (tour de la boîte de validation `[B.*-r, B.*+r]²` = marge/congé périphérique, comme l’ancien complément scanline ; E-k imbriqués pour les niveaux vides), et les **trochoïdes G2/G3** des goulets (largeur < 2.5·D) ; les morceaux sont chaînés par un **tour greedy stay-down** (liaison G1 si le segment est sûr, sinon translation à vide + plongée verticale).

**Index spatial dense (×6,75)** : `faoHashBuild`/`faoHashFit`/`faoHashSegs` en tableau plaqué à bornes connues (plus de clés string `ix:iy`), `faoDistSeg` avec rejet AABB + sortie anticipée sur seuil (`tMax=-1` si inutilisable), `faoChainYB`/`faoChainParity` par tranches de 1 mm, `faoShapeInside` via grille fusionnée par plan, `faoDiscClear` mémoïsé (`WeakMap`) : sur le document réel `Cavité Usinage`, **605 s → 90 s**, `moves=283649` **identique au baseline** ; équivalence prouvée par fuzz **196 000 cas, 0 divergence**.

**Gouges trochoïdes corrigés** : `faoTrochSlot` émettait ses arcs sans passer par `faoShapeValid` — `faoShadowIntervals` ne garantit que la LIGNE de la région, pas l’excursion `±Rt` du trochoïde. Sur `Cavité Usinage`, **3 niveaux (z=30, 25, 20.5) avec centre d’outil à 10 mm de la matière** (r=13, outil Ø25 → 2,5 mm de matière entamée), 114 points au total. Correctif côté appelant (le contrat de l’unit-test `faoTrochSlot` est inchangé) : chaque point émis (arcs échantillonnés à 0,25 mm + liaisons) est revalidé à `rrSafe = r−0,005` ; goulet non valide → chute sur des **sous-lignes valides point par point** (ni abandon, ni gouge) ; `moves` 283649 → 286390, **0 gouge sur les 30 niveaux** (`dMin = 12,999` partout).

Tests : façon T3 — `tests/test_fao_bornage.cjs` reformulé selon ce qu’il déclare lui-même (« distance perpendiculaire exacte ») : la borne de ligne 1-D (`mn ≈ t`) est conservative en X et ne vaut que pour un pelage en lignes, alors que Lot B coupe à un X précis et physiquement sûr. Le test garde le **REACH** du bug 026 (`mn ≤ t+0.5`, coupes prises dans la bbox de la pièce pour exclure les cadres E0/E-k de marge) et remplace le gouge 1-D par la **distance perpendiculaire exacte** (`faoDistSeg ≥ r−0,1` sur CHAQUE coupe du niveau) — **ROUGE vérifiée (26/30 niveaux en écart jusqu’à −34,98 ; 3 gouges réels à d=10)** → VERT après correctifs (30/30, `dMin=12,999`, gouges ≥ −0,001) ; `tests/test_fao3d.cjs` VERT (2,8 s) ; run complet **55/55** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-04-010.html` ; badge produit **V0.1.3 → V0.1.4** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 9 mentions).

### `2026-10-06-001`

Chantier « Cavité Usinage » : limite chaîne réparée, plan de sécurité Z+100, rouges lisibles, entrée d'hélice corrigée, couverture totale — puis modèle « calculer puis valider » et refonte du rafraîchissement des parcours d'outils.

**Chantier A — boucle de limites par chaîne** : un polygone découpé en fragments rendait `faoChainMode` inutilisable. `faoOrderEdges`/`faoLoopFromChains` reconstruisent le cycle à partir d'une arête quelconque, `faoLoopDistTo` donne la distance au contour, et `faoChainRematch` (garde-fou) rejoue le raccord après un assemblage douteux ; sur le document réel : `maxSeg 157.66`, `area 24544`.

**Plan de sécurité Z+100** : le plan de rappel n'était pas pilotable. `faoSafeZ`/`faoSafeAhead`/`faoSeqSafe` + champ *Plan Z* dans la fiche du posage ; l'export émet `G0 Z(safe-oz)` sur chaque translation à vide, et aucun rapide ne translate en Z bas (`test_fao_securite`).

**Rouges lisibles** : le classeur de segments (`const arr=(m.r)?rap:cut`) et un parseur G0 sans littéral backslash — 46 496 segments G1 dont **0 hors limite**, les 120 G0 hors limite restant hors brut (`risk=0`). Transparence des rouges conservée.

**Entrée d'hélice (ébauche 3D + débourrage)** : demande utilisateur « les deux » — jeu latéral **2 mm** (`faoHelixJeu`) et départ à **la matière + 2 mm**. `faoDiscClear(segs, x, y, rr, r+2)` avec repli `|| faoDiscClear(..., r)` (sinon `adaptive fente` basculait vers la micro-hélice rayon ≈60 mm qui balayait les plots), micro-hélice de secours `secOk = clear(r+2) || clear(r)` (jamais de plongée directe), `hStart` = `faoHelixSpot(...)` jamais rabaisssé par `zFrom`, et `faoGenPocketRough` prend `zFrom = min(secu, zMat+2)`.

**Couverture** : `test_fao_couverture` exclut les cellules dont le centre est à **< 1 mm du contour** (`loopL` + `faoDistToPoly`) — diagnostic : toutes les manquantes étaient à `d(loop) ≤ 0,74 mm`. Réel rough3d = **100,00 %** (95 766 cellules) ; reste total 2,93 % → 1,79 %.

**« Calculer puis valider »** : `faoPrevStale`, `faoGenBtnEl`/`faoExportBtnEl`, `faoStaleUI()` (classe `.fao-gen.fao-stale`), `faoExport()` refuse tant que l'aperçu est périmé.

**Rafraîchissement des parcours (3 demandes, arbitrage utilisateur)** : (1) **le triangle ⚠ ne concerne que l'opération qui a changé** — `faoStaleScan()` compare la clé de cache de chaque opération ; `faoOpMovesKey` exclut `name`/`id`, **ne retient que l'outil de CETTE opération** (modifier T3 ne périmie pas les traces en T1) et **n'embarque plus les signatures des autres opérations** — seule la géofinition garde une dépendance, celle des opérations qui la **précèdent** (`faoGeoHasRrough` lit leur `type` et leur état actif) ; triangle `.stalei` entre le badge et *Masquer* dans l'arbre + un sur la fiche, et **aucune régénération éager** : `faoOpMoves` sert l'ancien tracé tant que `op.stale===true`, une modification ne bouge plus rien à l'écran ; (2) **clic sur le triangle = cette opération seulement** — `faoRegenOp(setupId,opId)` lève `stale`, la recalcule, redessine, remet `faoPrevStale=false` si plus rien n'est périmé ; (3) **« Générer + aperçu » régénère TOUT à la demande** — `faoOpMovesPurge()` (nouveau `WeakMap`) avant `faoStaleClear()`, label `⚠ Tout régénérer (n) + aperçu` ; (3) **lag du mode usinage** : `faoViewerMatterStep` rappelait `faoMatterCarveTo` (0 → t, **O(i)** par frame) — nouveau `faoMatterCarveRange` incrémental : 20 frames en fin de parcours = **40 carves** (≈118 000 avant), Z-map strictement identique, retour arrière = 0 carve.

**Parcours d'outils persistés (IndexedDB)** — demande « gagner du temps à chaque ouverture » : l'ébauche 3D du document réel se recalculait intégralement (~90 s) à chaque rechargement. Les trajectoires **ne vont pas dans le modèle** (71 Ko → **7,9 Mo** pour 286 000 points, alors que l'autosave tient dans 5 Mo de `localStorage`) mais dans **IndexedDB** (`minifusion`/`kv`, déjà ouvert pour `lastGood`, pas de quota) : **une entrée PAR OPÉRATION** (`faoMoves:<posage>:<op>`), réécrite à chaque génération → stockage borné, jamais dupliqué. Lecture différée `faoMovesPreloadSoon()` (après `rebuild()` en init, et en fin de `deserialise()`), `faoMovesReset()` à l'ouverture d'un document. Une entrée n'est servie que si `ver===APP_VER` **et** si sa clé est strictement celle du moment présent ; sinon on recalcule, comme avant. Désactivé sans effet de bord hors navigateur (harnais de tests).

**Empreinte du solide (clé de cache stable)** : la clé s'appuyait sur `faoBodyGen`, un **compteur de session** (remis à 0 au F5) — inutilisable entre deux sessions, et qui ne trappe que le changement d'objet de corps. `faoSetupFp(job)`/`faoMeshFp(mm)` hachent en **FNV-1a les positions du maillage quantifiées à 0,001 mm**, mémoïsés par maillage : **identique d'une session à l'autre** pour le même solide, différent dès que le maillage change. Les opérations 2.5D n'embarquent plus aucune composante corps (composante `"0"`) : leurs parcours sont revalidables quel que soit l'état du maillage.

Tests : suites nouvelles `test_fao_chain`, `test_fao_couverture`, `test_fao_helice`, `test_fao_securite`, `test_fao_stale`, `test_fao_refresh` (41 assertions : 1 seul triangle, clic = 1 opération, bouton = purge complète), `test_fao_cache_idb` (33 assertions : entree versionnee, relecture sans recalcul, rejet par version/clé, une seule entrée par opération, empreinte stable entre sessions) ; contrats préservés : ligne d'opération `[eye, lb, badge, (⚠), mb]` avec *Masquer* **dernier**, label `G`/`⚠` exacts, `faoChanged()` laisse `faoPrevStale===true` inconditionnellement ; run complet **62/62** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-06-001.html`.


---

### `2026-10-06-002`

**Un AFFICHAGE ne calcule jamais (seul « Tout régénérer » produit les parcours), accès immédiat à l'ouverture, format `.miniFusion`, et « l'Ébauche 3D perd son cache à chaque refresh » : le message dit MAINTENANT pourquoi l'entrée est rejetée, puis la cause est supprimée.**

Le cache des parcours est **découplé du document** (`CACHE_VER='2026-10-06-002'`, `cacheVerOK()` n'accepte que cette valeur et `2026-10-06-001`) : la sélection d'une opération, l'affichage des stats du posage ou le changement de visibilité **lisent** IndexedDB et remplissent tout seuls — aucun appel à `faoPreviewGenerate()`, aucune trajectoire tracée au préalable ; les chemins explicites restent « Tout régénérer », le triangle ⚠ et le 1er passage sans aucun cache. Fin de lecture = dessin immédiat (`faoMovesDone()` / `faoMovesAllReady()`), plus de « nb » ni d'abandon : le texte de rejet `« nb »` a disparu. Relecture du cache **à chaque changement d'empreinte** : `buildDone()` appelle `faoMovesSolidChanged()` → `faoMovesPreloadSoon(true)` — c'est ce qui remet la trace juste après un rejeu exact qui a changé le corps.

**Format `.miniFusion`** : le JSON du document embarque ses propres trajectoires. `idbKeys(prefix)`, `bundleIs`, `bundleMoves`, `bundleSerialise()` (série `faoMoves:<idSetup>:<idOp>`), `bundleRestore()` : **écriture IndexedDB AVANT `deserialise()`** puis amorçage mémoire — le fichier ouvert est donc servi même IndexedDB vide, sans un seul recalcul ; `bundleReport()` (`faoBundleMovesN`) annonce combien d'entrées sont embarquées, avec un repli `setTimeout(1500)` si le rejeu exact n'a pas encore rendu la main. Ouverture d'un `.miniFusion` = accès immédiat ; sauvegarde = embarquement automatique des entrées valides.

**Le message dit enfin POURQUOI une entrée est rejetée** : carte `faoMovesWhy` (`faoMovesWhySet/Get/WhyShort`), remplie par `faoMovesPreload()` (`absente`, `format`, `version`, `cle`) et purgée par `faoMovesReset()` ; affichée dans l'infobulle du triangle (`faoStaleWhy`), le bandeau d'état (`faoVisibleChanged`), les stats (`faoStatsText`) et le rapport d'ouverture. Affinage du motif : `faoKeyDiff(a, b)` compare la partie corps puis parse le JSON et **nomme la composante qui dérive** (`empreinte du SOLIDE differente (a -> b)`, `operation.minipasses`, `posage.stock`, …) ; le motif inclut désormais les **deux côtés** (« corps actuels : … ; écrits : … ») et le remède (« Tout régénérer » une fois, puis re-enregistrer le fichier). Plomberie complète entrée → motif : signature de la **source du solide** `faoMovesEngSig()` rangée en `e` (préfixe `source du solide changee (old -> new)`) et liste géométrique `faoFpParts` rangée en `p` (comparaison corps par corps : `N -> M sommets`, `memes sommets, coordonnees differentes`, `corps X disparu / Y apparue`).

**Correctif de clé** : `faoOpMovesKey()` applique `faoSanitiseOps(job)` **avant** de hacher — la clé dérivait au fil des allers-retours entre le calcul et le réenregistrement (`minipasses` et états d'opérateurs réintégrés tels quels). Preuve : `probe_rt.cjs` passait de `preload : 0`, mémoire vide, `stale=2` à `preload : 1`, `cle identique apres round-trip : true`, `stale=1`. Second durcissement : l'empreinte ne hache **plus l'identité du corps** — `faoSetupFp()` ne prend que la géométrie, l'identité reste dans la liste diagnostic `faoFpParts` (`faoActiveMesh()` fusionne les maillages sans id : un id qui bouge entre deux sessions rendait la clé fausse alors que le solide était inchangé).

**Cause racine de « l'Ébauche 3D perd son cache à chaque refresh » : deux empreintes pour le même solide.** La sonde sur le document réel (`probe_fp5.cjs`, 3 processus indépendants → identiques) prouve que la géométrie OCCT est parfaitement reproductible ; l'instabilité vient de **l'état du corps**. `restoreViewCache()` remet des corps `cached` **sans `shape`** → l'interception « corps blindés » tombe dans le **maillage d'affichage** (déflection d'affichage, empreinte `yndkcu_1`) ; le rejeu exact les remplace par des `kind:'body'` **avec `shape`** → `_faoGeo()` en déflection d'outillage (empreinte `3chvc8_1`). **Deux valeurs pour un seul solide** : générer pendant la fenêtre de repli écrivait une clé valable trois secondes, rejetée dès l'ouverture suivante — et, comme seules `rough3d`/`geofinish` embarquent l'empreinte, seul l'Ébauche 3D tournait au rouge. Correctif `faoSolidSettled()` (corps visible `cached` sans `shape` = repli d'image) : pendant cette fenêtre **aucune lecture** (plus de motif bidon ni de ⚠ précoce — la lecture reste en attente et réessaie toutes les 400 ms), **aucune écriture** (jamais d'entrée maudite), et « Tout régénérer » est **différé** : message « le solide exact n'est pas encore en place (rejeu en cours) », exécution automatique à la fin du rejeu (`faoRegenFlush()`, appelé par `buildDone()` et par la fin de lecture). L'infobulle dit « Rejeu exact en cours : le corps affiche vient du cache local (sans solide)… ».

Tests : `test_fao_bundle` (40 assertions : sérialisation, ordre des écritures, restauration IndexedDB puis mémoire, rapport), `test_fao_stale_why` (46 assertions : motifs absente/format/version/cle, `faoKeyDiff`, plomberie `e`/`p`, rejet en cours de lecture, **repli d'image** : lecture différée, aucune écriture, génération différée puis exécutée au retour du solide) ; contrats préservés : ligne d'opération `[eye, lb, badge, (⚠), mb]` avec *Masquer* **dernier**, `faoChanged()` laisse `faoPrevStale===true`, « Tout régénérer » = purge complète ; run complet **67/67** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-06-002.html`.


---

### `2026-10-06-003`

**L'empreinte du solide ne dépend plus de l'ORDRE des sommets — c'était ça, « l'Ébauche 3D perd son cache à chaque refresh ».**

Le diagnostic livré par la version précédente sur le document réel a tranché : « corps b2 : mêmes sommets, coordonnées différentes (e5sqgo → 49pzeo) ; empreinte du SOLIDE différente (h2cdbv_1 → qdq6rs_1) ». Sonde sur les **deux états réels du même fichier** (`bundle.doc` et `doc.json`, qui ne diffèrent que par les positions de référence des filtres, de l'ordre de 1e-9 après un enregistrement) : même nombre de sommets (2078), **empreinte TRIÉE identique (`1lbzqmk_2078`)**, empreinte séquentielle différente (`1pinz00_2078` vs `clakns_2078`). Les coordonnées étaient donc **les mêmes** — le maillage changeait uniquement **d'ordre** : deux rejeux du même solide énumèrent les faces autrement, la séquence classait les mêmes points dans un autre ordre, le hash changait, et la clé devenait invalide alors que le solide ne bougeait pas d'un cheveu. Comme seules `rough3d`/`geofinish` embarquent l'empreinte, seul l'Ébauche 3D tournait au rouge — à chaque ouverture, sans jamais qu'on touche au modèle.

Correctif : `faoMeshFp()` trie les coordonnées quantifiées (0,001 mm) **avant** de les hacher — une empreinte est celle d'un **jeu de points**, pas d'une énumération ; le surcoût (tri) est amorti par le cache `WeakMap` par maillage. Validation bout en bout sur les deux états réels du document : désormais `1lbzqmk_2078` des deux côtés, et égal à l'empreinte triée de référence. Le message « mêmes sommets, coordonnées différentes » redevient exact : il ne peut plus s'agir d'un simple réordonnancement, et il faudra alors un vrai mouvement de solide (≥ 0,001 mm).

Migration : la formule change, donc `APP_VER`/`CACHE_VER` passent à `2026-10-06-003` ; les entrées écrites en `2026-10-06-002` sont rejetées par la **version** (motif net : « version obsolète, attendu … ») plutôt que par une fausse empreinte — **une seule** régénération supplémentaire (« Tout régénérer » puis re-enregistrer le fichier), ensuite le cache tient au F5 et à la réouverture.

Tests : `test_fao_cache_idb` +2 assertions (mêmes sommets dans un **autre ordre** → empreinte identique ; coordonnée décalée de 0,5 mm → empreinte différente) ; contrats préservés ; badge produit **V0.1.4 → V0.1.5** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 11 mentions) ; run complet **67/67** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-06-003.html`.

### `2026-10-06-004`

**La zone de l'opération est une frontière inviolable pendant le travail — mais on traverse au G0 pour aller chercher un outil.**

Demande exprimée puis affinée deux fois : « ce n'est pas simplement clipper les traces, c'est empêcher tout usinage en dehors de la zone. La zone est une frontière inviolable ! » puis « aucun mouvement pendant la coupe ou le travail, mais on peut la traverser pour revenir chercher un outil ». Règle retenue : **un move de COUPE (G1/G2/G3) ne sort jamais de la zone** (l'Ébauche 3D d'abord), un **rapide (G0) la traverse librement** — retour chercher un outil, liaison d'une opération à l'autre, retrait au plan de sécurité : il n'usine pas. Deux garde-fous, du plus tôt au plus tard.

**`faoZoneCuts` — le dernier étage de génération.** `faoRoundPath` fabrique ses arcs d'arrondi **après** le clip des segments : un arrondi pouvait donc dépasser la frontière sans que rien ne le voie. La fonction est appelée en **dernier** dans `faoOpMoves`, après `faoRoundMoves`, et marche sur la séquence complète — extrémités, croisements (`faoPolyCross`), échantillonnage des arcs (`faoArcSegs`). Si tout est dedans elle rend **le même tableau** (aucun rejeu, clés de cache inchangées) ; sinon elle aplatit les arcs fautifs en polyligne et re-clippe **les seuls segments de coupe** (`faoClipMovesPoly` / `faoClipMovesXY`), rapides intouchés.

**`faoSegSplit` + `faoSegClipper` — l'aperçu.** Le découpage des segments en couches vert/rouge est sorti de `mk` dans une fonction testable, et le clipper de zone n'est appelé **que sur la coupe** : l'aperçu ne montre plus aucune ligne de coupe à l'extérieur, tout en dessinant les rouges **entiers** (droit de traversée).

Validation sur le document réel (Ebauche 3D `op_4_muw6s87o`, boucle de 133 sommets, arrondi 2 mm, 72 977 moves) : **72 857 moves de coupe dont 25 011 arcs, 0 fuite** — extrémités, croisements et arcs échantillonnés à r = 12,5 mm ; `faoZoneCuts` rend un tableau **identique** (garde-fou neutre : ni régénération ni invalidation) ; **68 rapides sur 120 passent hors zone**, comme demandé ; le clipper de l'aperçu est appelé **127 503 fois, uniquement sur les 127 503 segments de coupe**, les 119 segments rouges tracés entiers.

Suppression complète de « Débourrage » (`pocket3d`) : `faoGenPocketRough` et son bloc de commentaire, le dispatch de génération, `faoRoundMoves`, `faoOpDesc`, la fiche du panneau, les libellés de la barre, `faoGeoHasRrough`, les commentaires UI/entête, `faoAddOpsSpec` (6 boutons au lieu de 7), et **`faoOpDefaults`** qui renvoie désormais `null` pour un type inconnu (avec garde `if(!op)return;` sur le bouton `+`). Les documents qui en contiennent encore sont nettoyés à l'ouverture par `faoSanitiseOps`, **en place** : un `filter` remplacerait le tableau `ops` et périmait la référence tenue par l'appelant — `stU.setups[0].ops.push(...)` évalue son membre `.ops` **avant** son argument — la migration passe donc par un `splice`.

Migration : `APP_VER` → `2026-10-06-004`, **`CACHE_VER` inchangé (`2026-10-06-003`)** : ni le contenu des parcours ni leur clé ne change, **aucune régénération à refaire**.

Tests : `test_fao.cjs` — clipper (chaîne/rect/dedans/hors/traversée/z inchangé), **`faoZoneCuts`** (coupe traversante bornée, rapide de traversée intact, parcours sain rendu tel quel, arc sortant aplati puis recoupé, parcours réel coupe+arrondi sans sortie), **`faoSegSplit`** (clipper appelé 2 fois sur 4 segments = coupe seule, rapide hors zone tracé entier), suppression de `pocket3d` (7 assertions) ; `test_fao3d.cjs` (`pocket3d → false`), `test_fao_barre3d.cjs` (6 boutons, `kids.length===7`), `test_fao_helice.cjs` (entrée hélice testée en direct, `helOf` retiré) ; `test_fao_cache_idb.cjs` aligné sur `CACHE_VER` (lignes 45/70) ; badge produit **V0.1.5 → V0.1.2** (choix utilisateur explicite : on garde V0.1.2, `src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 11 mentions) ; run complet **67/67** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-06-004.html`.

### `2026-10-06-005`

**La zone est un mur vertical : plus aucun G0 ne part « usiner dans le vide ».**

Capture à l'appui : « Là, tu sors de la limite pour aller usiner dans le vide ! Incompréhensible ! ». Règle retenue, la quatrième fois qu'on l'affine : la zone n'est franchie que pour l'**ENGAGEMENT** (retour d'outil en tête d'opération), la **SORTIE**, le **CHANGEMENT D'OUTIL** ou le **POINT DE REPOS** — les trois dernières raisons étant le fait de la séquence/post, jamais d'une opération isolée.

Diagnostic sur le document réel (tracé en cache du bundle, `op_4`, 48 011 moves) : la coupe était déjà entièrement dedans (47 836 moves, 0 fuite), mais **107 G0 sur 175 sortaient**, répartis en **30 séries** : 29 excursions sans objet (coupe → G0 dehors → plongée au niveau **hors mur** → retour dedans → coupe suivante) et une fin d'opération sur le cadre de validation (±120,5 / ±80,5 = brut + r de l'outil). Toutes partaient de dedans, revenaient dedans, et **chaque jonction directe restait dans la boucle** (0 franchissement nécessaire) : le détour ne servait à rien, il faisait 25 mm en dehors du mur pour rien.

**`faoZoneStrip(moves,ctx,secu)` — supprime les séries de G0 hors zone.** Série = points consécutifs dont l'extrémité est hors mur. Elle n'est retirée que si elle n'ouvre pas l'opération (engagement : en tête, conservé) et si la jonction directe `prev -> next` ne traverserait pas elle la frontière — on ne fabrique **jamais** un franchissement nouveau (cas d'une zone concave : la série est alors conservée). Jonction réparée : retrait sécu sur place quand le move précédent est une coupe, liaison sécu quand le move suivant est une coupe — jamais de G0 à z de coupe. Idempotent : rend le **même tableau** quand rien ne sort.

Trois appels, pour que la règle vaille **aussi sur un ancien cache** : dans `faoZoneCuts` (génération) **avant** le diagnostic — un rapide dehors déclenchait un faux débordement et une réparation inutile — puis après la réparation, et à la **LECTURE** via `faoZoneServe` (`faoOpMoves` + `faoOpMovesTry`) : le tracé en mémoire est purgé une fois puis rangé dans l'entrée, **sans régénération** (`CACHE_VER` inchangé, clés intactes). `faoZoneCtx` factorise le couple `at(x,y)` / `cross(a,b)` (chaîne comme rectangle), `faoZoneSecu` la formule du dégagement.

Validation : simulation du strip sur le tracé **en cache** du bundle — 48 011 → 47 904 moves (30 séries retirées, **0 insertion** : toutes les jonctions étaient déjà des G0 à secu 65), coupe **47 836 → 47 836** (l'usinage ne bouge pas d'un point), **G0 hors zone 107 → 0**. Génération réelle dans le harnais (maillage stub) : 72 909 moves, 52 rapides, **0 hors zone**, et `faoSeqSafe` n'ajoute aucun G0 dehors.

`faoSafeAhead` / `faoSeqSafe` sont inchangés : les translations rapides restent normalisées au plan (160 mm, 0 violation). En revanche le comptage « pts au plan » du document réel passe de >100 à 53 : c'étaient ces excursions qui le gonflaient, ~2 points de plan par G0 dehors — le seuil du test est ramené à >20.

Tests : `test_fao.cjs` **+12 assertions** sur `faoZoneCtx` / `faoZoneStrip` / `faoZoneServe` (contexte construit, sans limite → null, excursion supprimée et plus aucun point dehors, idempotence, jonction coupe→coupe = retrait sécu + liaison sécu, fin d'opération = retrait sécu sur place, engagement en tête conservé, jonction traversante sur un **L** conservée, purge **ET** rangement de l'entrée de cache, purge avant le diagnostic de `faoZoneCuts`) ; `test_fao_securite.cjs` — **nouveau contrôle sur le document réel : 0 G0 hors zone dans l'opération à zone** (les franchissements de la séquence entre deux opérations restent autorisés : ils sont ceux du changement d'outil). Run complet **67/67** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-06-005.html`.

Migration : `APP_VER` → `2026-10-06-005`, **`CACHE_VER` inchangé (`2026-10-06-003`)** : ni la coupe ni la clé ne changent — **aucune régénération à refaire**, le purge se fait à la lecture.

### `2026-10-06-006`

**L'hélice d'entrée attaque 2 mm au-dessus de la face à USINER, pas au-dessus de la face obtenue.**

Demande : « Elle commence 2 mm au-dessus de la face finie de la 1ʳᵉ passe alors qu'il faudrait qu'elle commence 2 mm au-dessus de la face d'entrée de la 1ʳᵉ passe. Tu rentres dans la matière sur 3 mm car le gap est réglé sur 5 mm. C'est valable pour toutes les hélices. »

Diagnostic : `faoHelixSpot` ne lit que le **maillage** — colonne vide de matière de la *pièce* (le cas quasi général d'une entrée, vérifié par `faoDiscClear` sur toutes les sections du niveau) ⇒ repli `z+2`, c'est-à-dire la face **obtenue** de la passe en cours + 2 (la règle « entrée hélice face+2 » annoncée par `2026-10-06-001` n'était donc vraie que pour la matière du maillage). Sur le document réel (`op_4`, `ztop` 50, `ap` 5, 1ʳᵉ passe 50 → 45) : départ à **47 = 3 mm dans la matière** (`ap−2`) ; voulu 52. Le maillage ne voit ni le brut ni ce que les passes précédentes ont enlevé.

**Plancher `hFloor = min(secu, zFrom+2)` dans `faoRoughAdaptiveLevel`.** `zFrom = min(secu, z+ap)` est déjà la face d'entrée de la passe (`zt` pour la 1ʳᵉ) et la liaison utilise déjà la même valeur (`tvZ = bandTop+2`) : les trois chemins d'entrée — hélice multi-spots, entrée tangente, micro-hélice de secours — passent par `Math.max(faoHelixSpot(…), hFloor)`, donc l'hélice part **à la même altitude que le travel** (le move de descente disparaît même : `|zG−hStart| < 1e-9`). `faoHelixSpot` est inchangé, sa doc corrigée (« le plancher est posé par l'appelant »). La **géofinition** n'est pas touchée : son spot est choisi dans une colonne dégagée (offset hors paroi), `here.z+2` y est déjà dans l'air.

Validation : test synthétique reprenant les chiffres du rapport (plaque 40 mm, `ap` 5, outil Ø10) — **avant** : 1ᵉʳ point sous face+2 à **Z = 37**, descente verticale de **8 mm** en contact avec la matière ; **après** : **Z = 41,9** et **0,10 mm** (pas d'hélice). Le passe-à-plans mini-passes (test réel) confirme le même déplacement : l'hélice traverse désormais z=16 **en un point unique, à 28 mm des parois**, et non au contour.

Tests : `test_fao_helice.cjs` **+3 assertions** (bloc 6 : 1ᵉʳ point sous face+2 ≥ 41, plongée d'entrée ≤ 0,1×D, géométrie à fente) et reformulation de « rien au-dessus du brut » en **« rien au-dessus du brut après engagement »** — l'entrée légitime traverse le brut en descente continue (20 points), c'est exactement le but ; `test_fao3d.cjs` — « minipasses off : aucun plan z=16 » resserré sur le **contour** (`mid(…,5.5)===0`), le plan reste interdit. Run complet **67/67** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-06-006.html`.

Migration : `APP_VER` → `2026-10-06-006`, **`CACHE_VER` → `2026-10-06-006`** : les générateurs (`faoGen*`) ont bougé, donc — comme le veut la règle de l'entête — les parcours stockés sont **légitimement périmés** ; l'exception historique `2026-10-06-001` saute (ancien moteur aussi). À l'ouverture : « trace écrite par une version antérieure du moteur », export bloqué, **une régénération** puis ré-enregistrement du fichier.

### `2026-10-07-001`

**Ébauche 3D : le plan se pose enfin sur le fond réel de la poche, et les parois se finissent (case + N passes).**

Demande (7/10) : « Le fond : la dernière passe “courte” doit être émise pour que le fond soit terminé quand `Fond=0`. Les parois : case à cocher pour finir la poche avec N passes (ex. `Parois` 0,5 → 0,25 puis 0). »

Diagnostic (sondes A/B, poche 100×80, plancher z=5, ouverture 10, ap 1,5) : `faoLevels` ancre la grille sur `Haut` et pousse `lo = Bas + Fond` — le plan ne se pose sur le fond que si `Bas` vaut ce fond (ou y tombe par hasard). `Bas = 0`, c'est-à-dire **sous** le fond : dernier niveau utile 5,5 → **0,5 mm laissés sur le plancher et `Fond` sans le moindre effet** (identique pour 0 et 0,5) ; `Bas = 5` : zmin 5 / 5,5, juste. Rien dans l'application ne plaçait un niveau sur le fond quand la grille ne tombe pas dessus.

Correctif 1 — **plancher**. `faoUpFloors(mesh,z0,z1)` liste les faces horizontales avec matière **en dessous** : candidats = faces planes (les deux orientations de triangulation), décision par **parité exacte de l'app** (`faoScanIntervals` à `z∓0,001`) — ni dépendance du sens des triangles, ni faux positif sur une voûte ou sur une interface interne (le cas des murs posés sur la dalle) ; aires groupées par cote quantifiée à 0,001, seuil 0,01 mm². Dans `faoGenRough3D`, pour chaque fond `f ∈ [Bas, Haut[` : `target = f + Fond` est **posé dans le plan** seulement si la grille n'a pas déjà un niveau dans `[f, target]` — sinon rien ne bouge (coût nul, documents existants inchangés). La bande résiduelle est toujours < ap : la descente hélice l'usine comme pour un niveau ordinaire. Limite connue, préexistante à `faoSliceZ` : une cote pile sur un maillage à arêtes doubles (boîtes collées, non booléennes) fait doublon dans la section et fausse la parité — les maillages OCCT/manifold, eux, sont dans le cas nominal.

Correctif 2 — **finition des parois**. Champs d'opération `finitParois` (case, **OFF par défaut**) et `finitN` (1..9, défaut 1), nettoyés par `faoSanitiseOps` (absents = sig strictement identique → aucun document existant n'est marqué périmé), portés par le dispatch `faoOpMoves`. Par niveau, **après** l'ébauche et les mini-passes : `nf` contours `ringOnly` à décroissance régulière `off = Parois·(nf−k)/nf → 0` (k = 1..nf, dernier à la cote théorique, centre outil à `D/2` du mur). La bande `[0, Parois]` est invisible du maillage (`r` se mesure au mur théorique) : l'anneau l'attaque par l'extérieur, la descente hélice l'enlève, et `off = 0` ne dépasse jamais la paroi → aucun gouge. Sans laisse radiale, la finition est sans effet (l'ébauche est déjà au mur). Risque A3 (paroi inclinée / fraise à coin) documenté — d'où la case **décochée par défaut**.

Interface : ligne « Finir parois » + nombre de passes dans la fiche Ébauche 3D (infobulles + aide chiffrée : « N contours par niveau = N× plus de calcul de région »), champ grisé tant que la case est décochée ; décocher remet le sig à l'état pristine. `faoOpSig` et la clé de cache suivent les deux champs : cocher rend l'opération périmée, la régénération applique.

Validation (fixture poche **manifold** — 40 tris, chaque arête deux fois dans les deux sens : les boîtes collées posaient des arêtes doubles à z-pile et la parité y lisait la cavité comme du matière, ce qui masquait le plancher) : `Bas=0/Fond=0` → **161 points à z=5 dans la poche, zmin 5** (0 avant correctif) ; `Bas=0/Fond=0,5` → z=5 intact, zmin 5,5 (laisse respectée) ; `Bas=5` inchangé (0 / 161). Finition, mur x=20, Ø10, `Parois=0,5` : centre minimum **x=25,500** (case off, inchangé) → **x=25,000** avec 1 passe ; 2 passes → anneau intermédiaire à x=25,25 **et** contact à 25,000 ; 3 passes → 25,333 / 25,167 / 25,000 ; aucun point sous la cote théorique ; `Parois=0` + case cochée : sans effet.

Tests : nouveau `tests/test_fao_fond_finition.cjs` — **30 assertions** (fermeture manifold de la fixture, détection de fonds avec triangulation inversée, voûte ignorée, plancher `Bas=0` en 0 et 0,5, régressions `Bas=5`, finition off/1/2/3 passes, garde anti-gouge, `Parois=0`, **puis la fiche** : case + N passes rendues, grises/actives selon la case, aide qui suit 1 → 3, champs supprimés au décochage, `faoSanitiseOps`), **inscrit dans la liste `SUITES` de `tests/run.cjs`**. Run complet **68/68** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-07-001.html`.

Migration : `APP_VER` → `2026-10-07-001`, **`CACHE_VER` → `2026-10-07-001`** : `faoGenRough3D` a bougé — les parcours stockés sont **légitimement périmés**, une régénération à l'ouverture. Badge produit **V0.1.2 inchangé** (demande explicite du 7/10 : on reste en V0.1.2, `src/96-bandeau-groupes.js` non touché).

### `2026-10-07-002`

**Ébauche 3D → Finition : la finition ne sort que sur la DERNIÈRE passe en profondeur (+ option « Profondeurs »), et la laisse « Fond » tient quand `ap` tombe pile sur le fond.**

Demandes : (8/10) « Ebauche 3D -> Finition : que sur la dernière passe en profondeur. » — (9/10) « peux-tu ajouter une option pour ce cas précisément ? » (fraise à dent courte : la colonne de laisse n'est râlée que sur la hauteur de dent) — (10/10) « si le fond est à 0,5, tu te mets bien à 0,5 du fond ? On dirait que ça va au fond malgré le 0,5 » (oui : bug réel, corrigé ici).

**Dernière passe.** Dans `faoGenRough3D`, le bloc de finition est conditionné à `li===finIdx` — niveau le plus PROFOND **≥ plancher détecté** (`faoUpFloors`) : avec `Bas=0` la grille descend sous la poche et son dernier niveau (fond de ZONE) ne la touche jamais, viser `plan.length-1` ne finissait donc rien. Sans plancher utile → dernier du plan (comportement antérieur conservé). L'ébauche et les mini-passes restent inchangées à chaque niveau ; la finition émet ses N contours à décroissance `Parois·(nf−k)/nf → 0` **uniquement à cette cote** — gain : les niveaux supérieurs ne recalculent plus leur région pour la finition.

**Laisse « Fond » (10/10).** Un niveau de grille tombant dans `[fond, fond+Fond[` mangeait la laisse — cas réel `ap=5`, fond 20 : le niveau 20 coupait pile au fond et le « Fond » 0,5 disparaissait (le fixture ap 1,5 tombait à 5,5, d'où le test vert). Tout niveau de l'intervalle est **retiré** et un niveau à `fond+Fond` exact est posé (ajout seulement s'il manque : documents non alignés strictement inchangés).

**Option « Profondeurs » (9/10).** Champ `finitProf` 1..9 (défaut 1) sur la fiche, grisé tant que « Finir parois » est décoché : N cotes `zj = bas + (haut−bas)·j/N` vers le haut (j=0 pile au niveau bas, sommet strictement sous `zt` — jamais sur le plan de bord), écart = hauteur du mur / N, l'aide rappelle « dent ≥ écart ; 1 = la dent couvre le mur seule ». Entrée/travel de chaque cote = niveau strictement au-dessus (`zFrom=zA`, `travel=zA+2`), **identique à l'appel unique pour N=1**. `finitProf` entre dans la sanitise, la signature de parcours et le dispatch rough3d.

Interface : infobulle de la case, ligne « Profondeurs / cotes » et aide réécrites (« × N profondeur(s) »).

Tests : `test_fao_fond_finition.cjs` **+8 assertions (41 total)** — section 7 : `ap=5` aligné (z=5 → 0 point, z=5,5 → 305, zmin 5,5 ; régression `Fond=0`), finition au **PLANCHER** avec `Bas=0` (min x 25,000 à z=5, zmin 5 — attrape le viser-`plan.last` à z=0), anneaux 2 profondeurs z=5/7,5 et 3 profondeurs 6,667/8,333 au contact (25,000), niveaux intermédiaires = ébauche seule, champ Profondeurs grisé OFF / réglable ON. Les 33 assertions antérieures passent inchangées. Run complet **68/68** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-07-002.html`.

Migration : `APP_VER` → `2026-10-07-002`, **`CACHE_VER` → `2026-10-07-002`** : `faoGenRough3D` a bougé — parcours stockés périmés, **une régénération** à l'ouverture. Badge **V0.1.2 inchangé**.

### `2026-10-07-003`

**Mini-passes Z : plafond 9 → 50.**

Demande : « le nombre de mini passes est limité à 9, on peut aller à 50 MAX. »

Correctif : le plafond `Math.min(9, …)` est relevé à **50** aux trois endroits qui le posent — `faoSanitiseOps` (nettoyage à la lecture), la fiche Ébauche 3D (champ `mini`, infobulle « 0 = off, 1 à 50 ») et le générateur `faoGenRough3D` (`nb`, la voie d'appel direct). Sanitise : `50` et `12` sont conservés tels quels, `99` → `50`.

Documents existants (`minipasses ≤ 9`) : **parcours strictement identiques** → `CACHE_VER` inchangé ; la clé de cache porte la valeur, un champ édité à 30 se régénère de lui-même à la première génération.

Tests : `test_fao3d.cjs` **+4 assertions** — sanitise (99→50, 50 et 12 conservés), plan intermédiaire `z=11,882` (= 12 − 6/51) bien émis au contour avec `minipasses:50`, volume de moves > 2× le cas `minipasses:2`, et `minipasses:99` → parcours **identique** à `50` (plafond générateur). Run complet **68/68** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-07-003.html`.

Migration : `APP_VER` → `2026-10-07-003`, **`CACHE_VER` inchangé** (`2026-10-07-002`). Badge **V0.1.2 inchangé**.

### `2026-10-07-004`

**Ébauche 3D : mode trocoïdal + poche d'entrée (esquisse) — phase A clipée à la poche, phase B à pas Ø attaquée depuis la poche.**

Nouveau sélecteur « Conventionnel / Trocoïdal » sur la fiche Ébauche 3D. En mode trocoïdal l'opération lit une **poche d'entrée** dessinée en esquisse (`op.entree = {sk, sig}`) : `faoEntreePoly` tesselle le contour fort unique (traits + arcs, plan horizontal, coordonnées monde) en polygone ; repli conventionnel STRICT (sortie identique au parcours sans poche) si l'esquisse est absente, verticale, multi-contours, îlot/trou/cercle — et `faoPolyUsable` pour l'outil qui ne tient pas ou la poche hors région usinable. `op.mode` absent = conventionnel ; la sanitise purge tout champ ≠ `troco` et repose le sig à chaque édition → sigs des documents existants inchangés.

Deux phases dans `faoGenRough3D` : **phase A** — évidement conventionnel des niveaux `ap` calculé sur la boîte complète (`faoShadowIntervals` devient conservateur-vide sur une boîte intérieure ne touchant aucune matière, cf. poche centrale en mode transposé), entrées contraintes au polygone (`opt.poly`) et coupe clipée à ≥ D/2 à l'intérieur (murs temporaires à 0 de laisse ; les arcs trochoïdes dépassants sont aplatis avant clip, même réparation que `faoZoneCuts` — le clip ne lit que les segments droits) ; **phase B** — niveaux profonds à pas Ø outil, pelage ronds/trochoïdes sur TOUTE la cavité avec entrée forcée dans la poche évacuée, la colonne descendant à `fond + Fond` avant les niveaux profonds (chaque entrée est alors dans du vide réel, pas seulement dans le vide du modèle). Le générateur transpose le polygone quand le sens long a basculé x↔y.

Poche : `faoEntreePoly` tolère les doubles traversées d'un même arc (retour COURT dans les deux sens, dédoublonnage bbox + aire) — un quarter-disc tesselle en 8 points au lieu d'être refusé ; deux vrais contours disjoints → repli.

Tests : nouveau `tests/test_fao_troco.cjs` — fixture bloc **manifold** 80×60×18, poche x[10,70] y[10,50] fond z=4 (rôles de sommets prouvés de `test_fao_fond_finition`) : conventionnel inchangé, phase A clipée (z=14/10/6 min sd ≥ −4,1), phase B hors poche (z=8 et z=4,5), sens long transposé (boîte portrait), replis JSON == conv (outil trop grand, poche hors zone, esquisse absente/sans poche), `faoEntreePoly` (rect, construction, anneau, 2 contours, cercle, plan vertical, arc tessellé, origine déplacée), sanitise (mode/sig/purge) et dispatch 4 opérations via `faoOpMoves`. **Inscrit dans `SUITES`** (`tests/run.cjs`, 69 suites). Run complet **69/69** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-07-004.html`.

Migration : `APP_VER` → `2026-10-07-004`, **`CACHE_VER` inchangé** (`2026-10-07-002`) : sans poche (`poly: null`) le chemin de code est strictement identique → parcours et sigs des documents existants inchangés, aucune régénération forcée. Badge **V0.1.2 inchangé**.

---

### `2026-10-07-005`

**Ébauche 3D : mode Escargot (défaut à la création) — pelage en spirale du centre de la ZONE vers les faces, toutes les entrées en matière sont des hélices — + retours 1-2-3 : centre = pôle de zone, dernière passe sur les faces, conventionnel du milieu vers les bords.**

Nouvelle 1re option du sélecteur « Escargot / Conventionnel / Trocoïdal », posée par défaut par `faoOpDefaults('rough3d')`. `faoSpiralLevel` (branche `op.mode='escargot'` de `faoGenRough3D`, mode trocoïdal exclu) reprend la mécanique du conventionnel — mêmes niveaux `ap`, mini-passes, plafond/fond/finition, plans supplémentaires toujours par `faoRoughAdaptiveLevel` — mais le pelage part du centre : `R(θ) = ae·θ/2π` échantillonné à corde bornée (entre Ø/4 et Ø/2), chaque tour s'éloigne de `ae` jusqu'au bord de la région, et tout échantillon redevenu matière après une zone vide déclenche une NOUVELLE entrée en hélice (marges périphériques comprises). 1re entrée de la 1re face = hélice garantie (`faoHelixEntry`, plancher `zFrom+2`), jamais de plongée directe — sauf si aucun rayon de disque ne tient, repli « plongée sûre » dans la colonne d'ombre déjà libre.

**Retour 1 — centre = pôle de la zone, membership parité + disque.** Le centre n'est plus le centre de la bbox des intervalles d'ombre (sur une pièce à poche décalée il tombe au centre de la BOÎTE, hors zone : 1re coupe mesurée à 20,85 mm du centre de zone, piquée contre un bord de face) mais le **pôle d'inaccessibilité** des cases usinables : grille sur `S.rect` (pas ≤ 1,5 mm, bornée 401²), cases valides = `faoShapeValid` (**parité** `faoShapeInside` à tout plan ≥ z **ET** disque `faoDistSeg ≥ r`), transformée de distance chanfrein 2 passes, pôle = moyenne des cases liées au maximum (le max est un plateau sur un rectangle érodé — la première case du balayage le décalait de 10 mm). La parité corrige le trou de `faoDiscClear` seul : un point au cœur d'une bande matière large (≥ r des deux bords, ex. (39,17 ; 30,94)) passait le disque → spiral dans le solide. Liaisons (`pathOK`/`segClear`) basculées sur le même critère. Fixture décalée (poche x[45,75] y[15,45], manifold vérifié) : 1re coupe à **0,18 mm** du centre de zone (60,30).

**Retour 2 — la toute dernière passe suit les faces du solide.** Après la spirale, `faoSpiralLevel` émet les chaînes `k=0` du conventionnel — `faoOffsetRuns(S,r)` (laisse exacte à `r` sur les parois) + `faoRectRuns(S,0,r)` (cadre E0 de la boîte) — chaîne la plus proche d'abord, liaison `segClear` sûre sinon nouvelle entrée (hélice si le disque passe, sinon plongée sûre au point : un hélice tangent au mur est hors zone, le dernier tour de spirale est déjà à proximité). Mesure : les **40 dernières coupes** de chaque niveau sont à 40/40 sur la laisse (5,5 mm des parois de poche ou 5,5/10,5 mm du bloc).

**Retour 3 — conventionnel : enlever le milieu avant les bords** (hors mini-passes). Chaque morceau du tour porte son `k` (`faoOffsetRuns`/`faoRectRuns`, boucle `k=0…200`) ; les chaînes offsetées vers l'EXTÉRIEUR (bande de marge, tour de boîte — leur `k` croissant s'éloigne de la matière) sont rabattues en `k=0` ; goulets et sous-lignes = `k=0`. Tour : `k` **décroissant** (intérieur → murs/marge/E0), au sein d'un `k` distance croissante avec liaison sûre d'abord ; `ringOnly` (mini-passes, un seul `k`) = greedy historique strictement inchangé. Entrée : candidat **intervalle à murs des deux côtés (`wl&&wr`) le plus large, au milieu en Y** (la bande de marge, toujours la plus large en largeur absolue, capte l'entrée avant) + centre de la boîte en repli — puis hélice/rampe/micro-hélice contractuels. Mesures fixture : 1re coupe à **3,7 mm** du centre de zone (avant (39,8 ; −8), 38 mm), fin de niveau sur le cadre E0 (d = 62,6 mm), avgD 1ᵉʳ/3ᵉ tiers 43,2 → 52,1 (avant 57,6 → 42,4 : l'ordre est inversé).

Fiche : sélecteur à 3 options (Escargot en 1re position) avec aides mises à jour (escargot : pôle + dernière passe sur les faces ; conventionnel : « du milieu de la zone vers les bords ») ; `faoSanitiseOps` conserve `troco` **et** `escargot`, purge tout champ inconnu ; le dispatch transmet `op.mode` à `faoGenRough3D`. `op.mode` absent = conventionnel strictement identique : mêmes branches de code, sigs inchangés.

Tests : `tests/test_fao_escargot.cjs` étendu — fixture **manifold** 80×60×18 (poche x[10,70] y[10,50] fond z=4) : conv sans mode == `mode:'conv'` au JSON près + **section ordre conv** (1re coupe ≤ 10 mm du centre, fin de niveau ≥ 45 mm, dernier centre avant 1er bord) ; escargot ≠ conv, 1re coupe au centre (≤ 2,5 mm), 1re entrée hélice (≥ 10 points descendants, rayon ≤ Ø/2, fin sur le plan z=14), expansion + quasi-monotone, lasse ∈ [5,3 ; 6,5] aux 4 niveaux, faces atteintes, **queue sur la laisse 40/40** ; **fixture décalée** (manifold + pôle ≤ 2,5 mm de (60,30) + hélice + lasse) ; mini-passes, sens long portrait, `faoOpDefaults` + sanitise + fiche + dispatch inchangés. **Inscrit dans `SUITES`** (`tests/run.cjs`, 70 suites). Run complet **70/70** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-07-005.html`.

Migration : `APP_VER` → `2026-10-07-005`, **`CACHE_VER` → `2026-10-07-005`** : l'ordre des morceaux du conventionnel (k décroissant, chaînes sortantes en 0) ET son point d'entrée (intervalle intérieur au centre) changent tous les parcours produits — les tampons FAO stockés écrivent d'autres points, périmés, à régénérer une fois ; `cacheVerOK` réécrit sans exception historique (l'escargot ajouté au moteur rendrait de toute façon les tampons 002 périmés dès sa première génération). Badge **V0.1.2 inchangé**.

---

### `2026-10-08-001`

**Ébauche 3D : le mode Trocoïdal est SUPPRIMÉ (tracé peu satisfaisant) — le sélecteur ne garde plus que Escargot / Conventionnel, et la poche d'entrée (esquisse) part avec lui.**

Demande : « le tracé Trocoïdal n'est pas satisfaisant… on va le supprimer. » Le mécanisme 2026-10-07-004 (phase A clipée à la poche, phase B à pas Ø attaquée depuis la poche) disparaît en entier. **INTACT** : le pelage trochoïdal des **goulets** (`faoTrochSlot`, arcs G2/G3 dans `faoRoughAdaptiveLevel`) reste la stratégie interne du **conventionnel** — les tests `test_fao3d` qui le couvrent sont conservés ; escargot, mini-passes, plancher/fond, finition de parois, sens long, entrées hélice/rampe : inchangés.

Correctif — fiche Ébauche 3D : sélecteur à 2 options (Escargot / Conventionnel, handler conservé : escargot écrit `op.mode`, conventionnel l'efface), bloc « Poche » (choix de l'esquisse + aides phase 1/phase 2) supprimé, infobulles ap/ae débarrassées des mentions « phase 1 / pas Ø outil / ≤ ¼ Ø en trocoïdal », et l'alerte `⚠ ae > ¼ Ø` (réservée au troco) retirée — le conseil ≤ ¼ Ø reste dans l'aide conventionnelle, le ratio ae/ap reste affiché. `faoSanitiseOps` : `mode:'troco'` → **conventionnel** (le sig bouge → régénération ciblée de l'opération), `op.entree` retiré de TOUS les documents ; le dispatch ne transmet plus `poly` ; `faoGenRough3D` perd le polygone d'entrée, la phase A (clip à ≥ D/2), `planA`/`apP` (grille à pas Ø outil) et l'entrée forcée dans la poche — `esc = (o.mode==='escargot')` nu. `faoEntreePoly` / `faoPolyUsable` / `faoPolyRowIvs` (163 lignes) supprimés ; dans `faoRoughAdaptiveLevel` le clip d'entrée au polygone (`polyE`) disparaît et les candidats d'entrée repartent des intervalles complets — strictement identique pour les modes conservés (ce clip ne servait que la poche troco).

Tests : `tests/test_fao_troco.cjs` supprimé et désinscrit de `SUITES` (70 → 69 suites) ; `test_fao.cjs` message « alerte troco » requalifié ; `test_prodver_badge` maintenu sur **V0.1.2** ; `test_fao3d` inchangé (libellés « troco » historiques = pelage du conventionnel, fixtures sans `mode`). Run complet **69/69** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-001.html`.

Migration : `APP_VER` → `2026-10-08-001`, **`CACHE_VER` inchangé** (`2026-10-07-005`) : parcours escargot/conventionnel strictement identiques → aucun rejeu pour les documents sans troco ; seuls les opérateurs porteurs de `mode:'troco'`/`entree` changent de sig et se régénèrent seuls. Badge **V0.1.2 inchangé** (choix explicite de 2026-10-06-004 : le tag produit reste V0.1.2).

---

### `2026-10-08-002`

**FAO : les plans de dégagement / retrait façon Fusion360 — référence « depuis » + décalage, par opération, remontées réglables.**

Demande : des plans de référence comme dans Fusion360 — chaque plan = une référence (haut/fond du brut, haut/bas du modèle, haut/bas du bridage, sélection d'une face, origine, le plus élevé/le plus bas des deux, et pour le dégagement la hauteur de retrait) plus un décalage en mm. Réponses de cadrage : plans **par opération** (héritage posage → op), remontées en **réglage au choix**, références en **liste complète** (y compris « Sélection face »).

Noyau — `FAO_PLANE_REFS` + `faoPlaneZ` résolvent un plan `{ref,dz}` (sous-références `s1`/`s2` pour max/min, `fz` pour la face cliquée, chaîne `'retrait'` autorisée uniquement en dégagement, garde anti-récursion) ; `faoClearAbs` / `faoRetractAbs` donnent le plan ABSOLU d'une opération (héritage op > posage > legacy `safeZ`/`retract`), `faoZoneSecu` le plan des rapides internes : mode `plan` → plan de retrait (plancher dessus du brut), mode `min5` (défaut) → retrait borné par dessus brut + Sortie — **strictement l'ancien absolu (z1+25 / z1+Sortie) quand aucun plan n'est défini**. `faoPlaneEff` affiche l'héritage legacy traduit (Auto = brut+100 / brut+25, valeur forcée = origine+valeur) ; `faoPlaneClean` + `faoSanitiseOps` normalisent posage ET opération, forme invalide = plan SUPPRIMÉ (repli héritage) — aucune migration n'écrit `setup.planes` : les documents existants ne sont pas réécrits, les plans ne se matérialisent qu'à la première édition UI.

Trajectoires — `faoSeqSafe` (source unique aperçu / visionneuse / G-code) prend le dégagement de CHAQUE opération ; `faoPost` émet le retrait inter-outils depuis la 1ʳᵉ op ON du groupe (`retrPrev`/`retrCur`) et la tête de blocs / plongées sur le plan de l'opération ; le perçage — déroulé ET cycle dialecte (`CYCLE81/83` Siemens, `G98 G81/G83` Fagor) — prend RTP = `faoZoneSecu(op)` ; ébauche 3D : `tvZ`/`tvJ` = plan si mode `plan`, sinon min(Secu, dessus zone + **5 mm**) — +2 auparavant (remontées locales plus sures). Sig : `op.planes` entrent dans `faoOpSig`, `setup.planes`/`setup.fixture` dans `faoOpMovesKey` automatiquement — toute édition de plan invalide le cache de l'opération touchée.

UI — fiche posage : les champs absolus « Retrait » et « Plan Z » deviennent deux rangées **Dégagement** / **Retrait** (sélecteur de référence + décalage + valeur résolue `= z`), nouvelle rangée **Remontées** (`Plan retrait ou +5 mm` par défaut / `Toujours plan de retrait`), bornes de bridage **Br. Z0 / Z1** dans « Brut · bridage » (références haut/bas du bridage, défaut = brut), infobulle « Sortie » requalifiée (plafond des remontées locales, reste le dépassement XY). Fiche opération (tous types) : section **Plans** héritée du posage + bouton « Hériter du posage » dès qu'un plan est propre ; max/min affichent deux sous-rangées 1ʳᵉ/2ᵉ. Référence **Sélection (face)** : bouton « Sélect. » → clic sur la face dans la vue 3D (`faoZPlaneStart/Commit/Cancel` : mêmes gardes-fous de modes que le picking 3+2, Échap annule, Z = point cliqué) — entrées ajoutées au dispatcher de `src/90-picking-mesure-import.js`.

Tests — `tests/test_fao_planes.cjs` **nouveau, inscrit dans `SUITES`** (69 → 70 suites) : 71 vérifications (résolution des 10 références + max/min + chaîne retrait, vue legacy, héritage op > posage, mode plan/min5 + plancher brut, sanitise complet, clés de parcours, rapides normalisés, G-code tête / retrait inter-outils / RTP de cycle, fiches posage + opération libellés et valeurs) ; `test_fao_securite` : libellé « Plan Z » → « Dégagement ». Run complet **70/70** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-002.html`.

Migration : `APP_VER` → `2026-10-08-002`, **`CACHE_VER` → `2026-10-08-002`** : les remontées locales de l'ébauche 3D passent de +2 à +5 mm bornées par le plan de retrait — mêmes sigs, AUTRES points de rapides → tampons FAO périmés, régénération unique. Badge **V0.1.2 inchangé** ; tag Git **`V0.1.2` créé et poussé sur GitHub avec cette version** (il n'avait jamais été poussé, malgré le `(V0.1.2)` des messages de commit depuis 2026-10-04-008).

---

### `2026-10-08-003`

**FAO : sens de coupe « avalant » sur l'ébauche 3D, aides de mode en clic droit, et zone intérieure (îlot) à préserver sur toutes les opérations à zone.**

Demande (3 points, GO reçu) : (1) liaison **avalant** (défaut) vs **bidir** des passes d'ébauche 3D, avec sélecteur **Sens** dans la fiche — « avalant » = sens de coupe constant (les dents attaquent la matière de la même façon), le vrai sens de rotation (le signe CW/CCW) reste à régler au besoin ; (2) les aides **Escargot** / **Conventionnel** sortent de la fiche pour un **menu clic droit** sur le sélecteur Mode ; (3) une **zone intérieure** `op.limit2` (îlot à préserver) en plus de la zone extérieure `op.limit`, pour **toutes** les opérations à zone : on usine **entre les deux**.

Noyau (îlot) — `faoLimit2R` dilate le rect d'îlot de `r + Marge` (k borné à ≥ 0,01 : marge très négative = îlot rétréci au maximum, **jamais d'oubli silencieux**), `faoLimitDrillPts` exclut les trous dans l'îlot (rayon outil), `faoClipMovesXY(...,invert)` découpe le **complément** (re-entry sécurisé en 2 remontées secu), `faoClipMovesPoly(...,atFn)` prend un prédicat surchargeable. `faoZoneCtx(op,job)` compose les deux frontières : `at = ET`, `cross = OU` — `cross2` rect = **chevauchement** avec l'îlot (ligne qui l'évite → raccourci autorisé, ligne qui l'entrechevauche → pas de raccourci) ; îlot seul accepté (zone ext vide). `faoZoneCuts` refait la coupe finale en 2 passes (ext exact, puis îlot) ; `faoSegClipper` partage ce contexte (chemins historiques exacts sans `limit2`, marche 1 mm composée sinon) ; le clip îlot s'applique dans `faoOpMoves` après l'extérieur et après le parcours ; `faoOpSig` embranche `limit2` (stale/absent exclus de la clé). Sanitise : mode purge, rect réordonné `x0<x1/y0<y1`, extra numérique, **règle outil `side:'out'` forcée** à la lecture et à l'OK (on garde le complément, la chaîne ne bascule jamais côté « dedans ») — forcé aussi à l'écriture du picking. Export : avertissement si l'îlot est en stale + libellé G-code ` [îlot]⚠`. `faoChainRematch(op,edges,field)` devient générique (`limit` / `limit2`) et `faoChainReplay` vérifie les deux ; picking `kind:'chain2'` (préfixe « Chaîne (îlot) », écrit `op.limit2`, libellé « îlot »).

Noyau (sens) — `faoOpDefaults` ébauche 3D écrit `sens:'avalant'` ; `faoSanitiseOps` purge tout autre champ ; le dispatch `faoOpMoves` transmet `sens` aux 4 niveaux (`faoSpiralLevel`, `faoRoughAdaptiveLevel` ×3) ; gating dans `ordered()` et `cord()` : **chaînes ouvertes jamais retournées** en avalant (la liaison ne fait qu'un sens), chaînes **fermées toujours rotationnées** (mouvement ininterrompu — le signe éventuel reste une histoire de signe, à régler plus tard). Un opérateur sans champ = legacy **bidir** : parcours **byte-identiques** (prouvé au générateur et au dispatch).

Aides de mode — helpers `faoInfoBox` / `faoModeInfoClose` / `faoModeInfoShow` (boîte façon `.fao-help`, style `.fao-ctx`) ; les deux blocs d'aide Escargot/Conventionnel sont retirés de la fiche : `modeTexts` + `contextmenu` sur le sélecteur Mode (fermeture : clic extérieur / Échap / changement de mode via wrapper `onchange`), titre du sélecteur += « Clic droit : infos sur ce mode. ».

UI — fiche ébauche 3D : rangée **Sens** sous Mode (avalant/bidir ; affiche la valeur réelle legacy `bidir` quand le champ est absent, écrit `op.sens` au changement). Toutes opérations à zone : rangée **Zone int.** (`Aucune` / `Rect.` / `Chaîne` + 4 champs de coins + bouton « Chaîne… » kind `chain2` + alerte stale) et rangée **Marge** dédiée à l'îlot, sous la zone extérieure.

Tests — `tests/test_fao_sens.cjs` et `tests/test_fao_zone2.cjs` **nouveaux, inscrits dans `SUITES`** (70 → 72 suites) : sens (legacy byte-identique conv/escargot au générateur ET au dispatch, avalant ≠ bidir, coupes 8165/8159, defaults/sanitise/sig, fiche Sens) ; îlot (dilatation r+marge, clip complément rect et chaîne, ZoneCtx composé ET/OU, ZoneCuts 2 passes, SegClipper, perçage, sig/sanitise, fiche Zone int. + validation chaîne2 + rematch ancres, dispatch complet sur fixture poche : **0 coupe dans l'îlot, 680 coupes conservées à l'extérieur, identiques à la référence sans îlot**). `test_fao_escargot` réqualifié : les aides ne sont plus dans la fiche → popup contextmenu (ouverture + fermetures Échap / pointerdown / changement de mode). Run complet **72/72** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-003.html`.

Migration : `APP_VER` → `2026-10-08-003`, **`CACHE_VER` inchangé** (`2026-10-08-002`) : les documents existants n'ont ni `sens` ni `limit2` → sigs strictement identiques et parcours byte-identiques (prouvé) → **aucun rejeu forcé** ; seules les opérations éditées en Sens / Zone int. changent de sig et se régénèrent seules. Badge **V0.1.2 inchangé**.

---

### `2026-10-08-004`

**FAO : entrée circulaire (arc tangent) sur poche / contour / ébauche 3D / finition, plongées en bleu à l'aperçu, cadre de retrait en Z pur dans la visionneuse.**

Demande (3 points) : (1) les **plongées** d'outil sortent du vert coupe : rouge = rapide, **bleu = plongée**, vert = usinage ; (2) le début/fin d'outil dans la visionneuse se cadre sur la zone de **retrait uniquement en Z** (plus de recadrage XY) ; (3) nouvelle entrée **circ** (arc tangent, rayon `entryR` défaut **Ø/4**) pour l'ébauche 3D (escargot + conventionnel + mini-passes) **et les autres opérations** — la **1ʳᵉ attaque** d'un niveau garde l'hélice/rampe historique, l'arc prend le relais dès que de la matière est enlevée (ancre) ; `'auto'` reste le legacy.

Noyau (circ) — helpers globaux : `faoSidesCirc` (2 côtés tangents : C = P+ρn, S = C−ρu, CCW `cw:false` / miroir `cw:true`), `faoCircArcPts` (13 échantillons S→P), `faoCircAnchor` (coupe non-rapide à ≤ D/2·0,98 de S et cote ≤ z — arcs tracés par `faoArcSegs`, rapids ignorés), `faoCircEval` (S + arc entier valides, ancre exigée sauf `needAnchor:false`) ; ρ = `entryR` ou Ø/4. Dispatch : `entry`/`entryR` transmis aux **4 sites** avec repli `op.entry||'circ'` (doc sans champ = circ ; les générateurs gardent `o.entry||'auto'` pour les appels directs → tests/anciens appels inchangés) ; `faoSanitiseOps` purge `entry` hors {auto,helix,ramp,circ} et `entryR` invalide. Ébauche escargot : `entryTo(x,y,ux,uy)` — direction = tangente CCW de la spirale (repli pas d'échantillon), chaînes de faces = 1ʳᵉ maillon. Ébauche conventionnel : bloc d'émission déplacé **après** les helpers (le tour fournit la cible), 1ʳᵉ morceau testé en circ avant le legacy, `emitChunk` = liaison directe stay-down → **circ** → translation+plongée (repli) ; mini-passes et finition parois inclus (ancre = pelage du niveau principal sous le plan mini-passe). Poche : rings suivants en **stay-down** (G1 à Z de coupe + arc, zéro remontée par ring) ; anneau de tête de niveau = repli legacy. Contour : rapide sur S, descente **en Z en air** puis arc tangent au coin (ancre non requise, validité = centre outil ≥ r hors pièce). Finition : `faoGeoEntryMode` accepte `circ` (sans ébauche 3D amont → rampe, même garde-fou que l'hélice) ; tentative circ avant hélice / pk<1 / rampe (validité = `ptDist ≥ max(0,01,R−0,5)` sur la colonne de liaison, ancre exigée).

Aperçu / visionneuse — `faoSegSplit` ajoute le bucket **`plg`** (G1 strictement vertical descendant = plongée, borné par le clip comme la coupe) rendu **bleu `0x0a84ff`** (rouge = G0, vert = coupe) ; `faoViewerBuild` réécrit en **chunks par op** avec encadrement retrait en tête/queue (le point `r:1` même XY à `faoRetractAbs` s'il est au-dessus, times/lens/total/cum recalculés).

UI — helper commun **`faoEntryRows`** (select 4 options, **« Cercle · arc tangent » en 1ʳᵉ** + champ **« R entrée »** défaut Ø/4) monté sur les fiches Poche, Contour, Ébauche 3D et Finition ; `faoOpDefaults` écrit `entry:'circ'` (ébauche 3D, finition).

Tests — `tests/test_fao_circ.cjs` **nouveau, inscrit dans `SUITES`** (72 → 73 suites) : géométrie côtés/points d'arc/ancre/gating `faoCircEval` (repli null, miroir CW), sanitise + defaults + mode finition (`circ` sans ébauche → rampe), poche via dispatch (arc présent, `'auto'` sans arc, rings stay-down = moins de remontées, |S−P| = ρ√2 avec `entryR:3`), contour (arc tangent au coin (15,15)), escargot (arcs de ré-entrée en circ, zéro arc en auto, coupes ≥ fond), bucket `plg` (plongée bleue / G1 horizontal vert / destination G0 rouge). `test_fao3d` : défaut géofinition → `'circ'` ; `test_fao` : fixture « poche arrondi » figée en `entry:'auto'` (on y isole l'ARRONDI, le cercle étant couvert par le nouveau test). Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-004.html`.

Migration : `APP_VER` → `2026-10-08-004`, **`CACHE_VER` → `2026-10-08-004`** : les générateurs eux-mêmes changent (entrée circ par défaut = autres trajets, mêmes sigs) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Documents avec `entry:'auto'` explicite (ex. `Cavité Usinage`) : parcours inchangés. Badge **V0.1.2 inchangé**.

---

### `2026-10-08-005`

**FAO : la plongée d'entrée exige la fraise TOTALEMENT hors matière restante (disque Ø outil balayé ou en air, rayons candidats), hélice / rampe / arc circ en bleu dans la visionneuse.**

Demande (feedback 004) : l'entrée circulaire doit « prendre en compte le diamètre de fraise et la dégager de la matière restante » — au moment de la plongée en S, **toute l'empreinte de la fraise** (disque de rayon D/2) doit être déjà usinée ou en air, pas seulement le centre ; et dans le tracé, **les hélices, rampes et entrées circulaires doivent être bleues** aussi. Le point d'attaque reste tangent à la droite/courbe à usiner (rentrée directe depuis le cercle) — inchangé.

Noyau — **`faoPlungeClear(Sx,Sy,moves,z,D,airAt)`** remplace l'ancre ponctuelle : échantillons = centre + cercle D/2 (~1 mm d'espacement, K ≈ π·D borné 16…64), chaque échantillon doit être couvert par une coupe non-rapide à cote ≤ z (arcs tracés par `faoArcSegs`, préfiltre à D de S, tolérance D/2+ε) ou passer le test d'air `airAt` — sinon repli hélice / rampe / plongée sûre (aucune plongée qui mord la matière restante). **`faoCircRhos(D,ae,entryR)`** : liste de rayons candidats croissants `[entryR défaut Ø/4, Ø/2, ae, Ø]` — un rayon plus large recule S dans la zone déjà balayée (ex. poche : ρ=2.5 laisse des échantillons en matière → ρ=5 accoste sur l'anneau précédent). `faoCircEval` accepte une liste et teste chaque candidat × 2 côtés (S, arc entier, disque) ; `faoCircAnchor` reste pour la compatibilité des tests. `airAt` par contexte : matière brute hors silhouette (`!faoShapeInside`) pour l'escargot et le conventionnel, hors boîte pour la poche, hors colonne (`ptDist>0`) pour la finition ; contour inchangé (`needAnchor:false`, centre à ≥ r hors pièce = disque déjà en air). La tangence à la ligne/courbe à usiner est préservée : tous les candidats arrivent en P tangent à u.

Tracé — les moves d'entrée portent l'étiquette **`ent:1`** : toutes les G1 de `faoHelixEntry`, la rampe G1 du conventionnel, la descente en Z + l'arc de chaque entrée circ (escargot, conventionnel, poche, contour, finition) ; `faoSegSplit` route `ent` dans le bucket **`plg`** (bleu, y compris les arcs développés) ; `faoViewerBuild` propage `ent` sur les échantillons d'arc développés et sur `pts`, `faoViewerLineCreate` colore en bleu `0x0a84ff` (rouge = G0, vert = coupe — les rapides de sécurité restent rouges). Post G-code et estimation de temps inchangés (étiquette ignorée).

Tests — `tests/test_fao_circ.cjs` étendu : `faoPlungeClear` (disque non couvert / en air / balayé / coupe trop loin / rapides ignorés / coupe au-dessus de z), `faoCircRhos` (candidats croissants), `faoCircEval` (repli sans couverture, disque en air, disque balayé, escalade de rayon 2.5 → 7, miroir CW couvert par une seule ligne), poche (`entryR:3` recalé à **5** par le disque → |S−P| = 5√2), escargot (arcs étiquetés `ent`, arc développé routé en `plg`), hélice (toutes G1 `ent`), visionneuse (`ent` propagé jusqu'aux `pts`). Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-005.html`.

Migration : `APP_VER` → `2026-10-08-005`, **`CACHE_VER` → `2026-10-08-005`** : les générateurs changent (disque hors matière = autres S/ρ, parfois repli legacy là où 004 plaçait un arc) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-08-006`

**FAO : JAMAIS de plongée à plat dans la matière restante — poche anneau 0 = rampe le long du 1er anneau, ébauche 3D = hélice à orbite légale réduite (repli plongée à plat au centre légal), finition = rampe le long du 1er tronçon.**

Demande (feedback 005) : « la fraise de diamètre 25 plonge à cheval sur les 1ères phases ». Diagnostic : quatre points de plongée à plat dans la matière restante — poche anneau 0 (plongée à l'angle, fraise à cheval sur la matière pleine), centre de la spirale d'ébauche (`entryTo` sans trou ouvert → repli), fin conventionnelle (repli), finition géométrique `pk<1` (plongée sur le début de chaîne). De plus, une hélice à orbite **fixe** près d'un mur surcoupe réellement (test escargot : lasse outil à 3.60 au lieu de [5.3, 6.5] = arête de fraise dans le mur).

Noyau — règle unique : **une plongée doit se faire en se déplaçant, le centre exactement sur le chemin légal, jamais en orbite près d'un mur**. Poche anneau 0 (et chaque niveau en legacy sans cercle) : **rampe le long du 1ʳᵉ côté de l'anneau** (`(ax,ay)→(bx,ay)`, ou l'autre côté si le premier est court) — descente répartie en paliers ≤ 2 mm (`nR=ceil(Δz/2)`), point de départ = face du niveau précédent (ou `ztop`), tag `ent:1` ; finition géométrique `pk<1` : **rampe le long du 1ʳᵉ tronçon de chaîne** (flag `ramp0`, paliers ≤ 2 mm sur `here→pts[1]`). Spirale d'ébauche et conventionnel (repli) : **hélice à orbite réduite testée** — `okOrb` (8 points orbitaux doivent rester légaux, `inside`/`faoShapeValid` avec marge outil), orbite réduite de 0.5 mm jusqu'à ≤ 0.5 mm ou repli légal (`linkTo+pushCut` / plongée au centre ouvert). Aucun de ces trajets ne mord la matière restante ; la tangence cercle→tracé à usiner est préservée.

Tests — `tests/test_fao_circ.cjs` étendu (section 006) : poche Ø25 (`[10,70]×[10,50]`, ztop 20) — **aucune descente verticale > 3 mm non couverte** par une coupe à cote ≤ z dans le disque D/2 (plongée à plat dans la matière = 0), rampes étiquetées `ent`; escargot Ø25 (boîte `mkB(0,60,0,80,0,30)`, `faoGenRough3D` mode `escargot` `entry:'circ'`) — idem, **0 plongée à plat en matière**. `test_fao_escargot` (métrique lasse [5.3,6.5]) repasse. Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-006.html`.

Migration : `APP_VER` → `2026-10-08-006`, **`CACHE_VER` → `2026-10-08-006`** : les générateurs changent (rampe/hélice légale à la place des plongées à plat = autres trajets d'entrée, mêmes sigs) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-08-007`

**FAO : air = hors du BRUT (boîte), plus « hors pièce » — fini les retours à plat sur les croissants non balayés après la spirale ; entrées de faces / ré-entries / contour en rampes le long du chemin.**

Demande (feedback 006) : « après la spirale, la fraise rentre toujours à cheval dans la matière — sais-tu où se trouve exactement la matière restante ? ». Diagnostic (`diag9`, fixture poche ouverte, escargot Ø25) : 8 plongées à plat sur des croissants — `airSp`/`airCv` utilisaient `!faoShapeInside` = « hors pièce », qui traite le **vide de la poche** comme de l'air alors que c'est du **brut restant** ; `faoPlungeClear` recevait donc un `airAt` toujours vrai dans le vide, acceptait n'importe quelle ancre ; le repli plongée à plat atterrissait ensuite sur les zones que les tours circulaires de la spirale n'avaient pas balayées (coins de la région érodée). Le maillage ne voyait ni le brut ni les passes précédentes — le vrai test est la **boîte de brut** : tout ce qui est hors de B est de l'air, tout ce qui est dans B est (ou sera) de la matière.

Noyau — `airSp` (spirale) et `airCv` (conventionnel) = **hors boîte B** (`x<B.x0−1e−9 || x>B.x1+1e−9 || y<B.y0−1e−9 || y>B.y1+1e−9`) ; `entryTo` renvoie un booléen (true = entrée sûre faite, false = **rampe le long du chemin**) ; la plongée à plat du conventionnel est gateée sur `faoPlungeClear(...,airCv)`. Passes de faces (fin de spirale) : si `entryTo` échoue → rampes le long de `seq` (paliers ≤ 2 mm, `ent:1`), reprise à `i0=nUse+1`. Conv `emitChunk`/`linkIn(seq,...)` renvoient l'index de reprise ; ordre = lien sûr → `circEnter` → plongée si `faoPlungeClear` → **rampe le long du morceau** (sous-objets `ch.mv` gardent leurs arcs ; descente d'air à `hS` étiquetée `ent:1`). `faoGenContour` : circ → **arc tangent en rampes hélicoïdales** (sous-arcs IJK, paliers depuis `zTop`) ; repli → rapide à secu + descente d'air à `z0` + **rampe le long du 1ʳᵉ côté**.

Tests — `test_fao.cjs` et `test_fao_fond_finition.cjs` : les mouvements `ent` (rampes) sont exclus des comparaisons de cote Z / min-X (les rampes émettent légitimement des Z intermédiaires) ; `test_fao_circ.cjs` section 007 : fixture poche ouverte escargot Ø25 (`diag11`) — **0 plongée à plat dont le disque D/2 ne soit déjà balayé** (airAt = hors boîte), rampes étiquetées `ent`. Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-007.html`.

Migration : `APP_VER` → `2026-10-08-007`, **`CACHE_VER` → `2026-10-08-007`** : les générateurs changent (airAt hors boîte + rampes le long du chemin = autres trajets d'entrée, mêmes sigs) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-08-008`

**FAO : les entrées circulaires ne sont plus abandonnées faute de matière déjà coupée — hélice sur l'ANCRE puis MÊME arc tangent (pass 2) ; fini les ressorts d'hélice dans l'air (cadre E0, intervalles d'ombre hors boîte).**

Demande (feedback 007) : « les entrées circulaires sont remplacées par des hélices presque tout le temps », puis « il reste un paquet d'hélices ». Diagnostic : deux causes. (1) `faoCircEval` exigeait l'ancre **déjà balayée** (`faoPlungeClear`) — au début d'un niveau rien n'est encore coupé à z, donc TOUS les candidats échouaient et l'arc était rejeté systématiquement au profit de l'hélice ; le mode circ ne s'appliquait donc qu'aux ré-entries. (2) Les replis hélice au point d'attaque (orbite `pickHr` / orbite réduite du 006) et les chaînes du **cadre E0 en marge** (intervalle d'ombre hors boîte) généraient des ressorts **dans l'air, autour de la pièce** : mesuré sur la fixture escargot Ø25, **15 hélices par niveau dont 8 dans l'air**.

Noyau — `entryTo` (spirale) et `circEnter` (conventionnel) : **deux passes** sur les candidats d'arc. Pass 1 (inchangée) : ancre déjà balayée → descente verticale + arc tangent. **Pass 2 (008)** : ancre quelconque (1re attaque du niveau) → **hélice de descente sur l'ancre même** à orbite légale (`pickHr`/`okOrbPt` pour la spirale, `faoDiscClear` + orbite réduite pour le conv) **puis le même arc tangent** — l'arc circulaire n'est plus abandonné faute de matière déjà coupée : il devient la norme au début de chaque niveau, l'hélice servant uniquement de rampe de descente sur l'ancre. Ancrage **hors silhouette** (bbox 2D de la pièce, `insideSil`) : la pass 2 n'émet **jamais** de ressort — l'appelant ramp le long du chemin (comportement 007), ce qui supprime les hélices dans l'air des chaînes du cadre E0 et des intervalles d'ombre hors boîte. Repli hélice au point d'attaque (006) conservé **uniquement dans la silhouette** (centre de poche, direction dégénérée au pôle = pas d'arc possible) ; hors silhouette → rampe. `faoRoughAdaptiveLevel` : test de matière sous la colonne corrigé (`boîte ∩ hors pièce` via `faoShapeInside`, la tranche du sol fini lisait le vide de poche comme de l'air) + garde sur la boucle de liaison (`moves` vide). Aucun trajet n'atterrit à plat sur du brut restant (sécurité 007 inchangée).

Résultat (fixture escargot Ø25, poche ouverte) : hélices **15 → 3 par niveau**, toutes dans la pièce (centre de poche + anneau + micro-orbite de fin de rampe), **0 ressort dans l'air** ; arcs circulaires **0 → 1 par niveau** (entrée au centre) + arcs de ré-entrée quand la chaîne est hors de portée ; conv inchangé (192 arcs).

Tests — `test_fao_circ.cjs` section 008 : escargot Ø25 — arcs circulaires présents dès le 1er niveau (`>= 4`, soit 1/niveau) et étiquetés `ent` ; conv D25 — `>= 50` arcs ; **0 plongée à plat non couverte** (sécurité 007 conservée). Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-008.html`.

Migration : `APP_VER` → `2026-10-08-009`, **`CACHE_VER` → `2026-10-08-009`** : les générateurs changent (pass 2 hélice-sur-ancre + gate silhouette = autres trajets d'entrée, mêmes sigs) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-08-009`

**FAO : descente sûre préférée à l'hélice quand l'ancre est déjà dégagée (ré-entrée) — hélice conservée uniquement pour la 1ʳᵉ attaque ; constat que les 3 hélices par couche sont géométriquement nécessaires (pas réductibles).**

Demande : réduire les hélices superflues en gardant la sécurité 007 (jamais plonger à plat dans la matière). Diagnostic (fixture escargot Ø25, poche ouverte) : les 3 hélices par couche sont le **pôle** (centre de poche, direction dégénérée = pas d'arc possible) + **2 points d'attaque** où l'ancre `S = P + ρn − ρu` sort de la région à tout `ρ ≥ D/4`, et où aux ρ serrés (D/16, D/10, D/6) l'arc traverserait la matière (`okA=false`). Ces 3 positions sont donc **géométriquement nécessaires** ; les ρ plus petits testés en tête de `faoCircRhos` n'ont rien amélioré et ont été retirés.

Noyau — `entryTo` (pass 2 de la spirale) : **descente verticale sûre** (`faoPlungeClear`) préférée à l'hélice quand l'ancre est déjà dégagée (ré-entrée de spirale), hélice (`pickHr`/`okOrbPt`) sinon (1ʳᵉ attaque, matière pleine). `faoCircRhos` inchangée canoniquement (ρ = entryR, Ø/2, ae, Ø).

Tests — `test_fao_circ.cjs` : valeurs `faoCircRhos` rétablies ([D/4, D/2, ae, D] / [3, 5, 10]) ; `test_fao_zone2.cjs` : tolérance îlot rétablie (±2). Sécurité 007 : 0 plongée à plat non couverte. Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-009.html`.

Migration : `APP_VER` → `2026-10-08-009`, **`CACHE_VER` → `2026-10-08-009`** : les générateurs changent (descente sûre préférée à l'hélice = autres trajets d'entrée, mêmes sigs) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-08-010`

**FAO : entrée tangentielle par point d'ancre ponctuel + ramp le long de l'arc — hélices 12 → 8 par fixture escargot (2/couche au lieu de 3), arcs 12 → 239.**

Demande : « C'est quand même plus simple de partir d'un point hors matière et y rentrer en tangence que de venir directement dans la matière. Le rayon peut être de 2mm comme 10. » Diagnostic : le blocage n'était pas géométrique mais une **condition trop stricte** — `faoCircEval` exigeait `faoPlungeClear` (disque entier D/2 balayé autour de l'ancre) avant l'arc tangent. Or l'entrée tangentielle arrive **latéralement** par l'arc : il suffit que le **centre** de l'ancre soit dans l'air ou le déjà-usiné, pas le disque entier. À la limite du déjà-usiné, le test disque échouait toujours → repli hélice systématique.

Noyau — `faoCircEval` : ancre validée par **test ponctuel** (`airAt(S)` ou `faoCircAnchor` = coupe antérieure à ≤ D/2·0,98 de S) au lieu de `faoPlungeClear` (disque entier). `entryTo` pass 1 : si `faoPlungeClear` passe (disque entier dégagé) → descente verticale + arc à plat (comme avant) ; sinon → **ramp le long de l'arc tangent** (descente en coupant sur l'arc, paliers ≤ 2 mm, sous-arcs IJK) — jamais de plongée à plat sur du brut restant. Résultat (fixture escargot Ø25, poche ouverte) : hélices **12 → 8** (2/couche : pôle + un point d'attaque géométriquement bloqué pour l'arc), arcs **12 → 239** (ré-entries en tangence). Les 2 hélices restantes sont nécessaires : à (30.4,35.4) 0 candidat d'arc valide sur 8 (ancre hors région ou arc traverserait la matière), au pôle direction dégénérée.

Tests — `test_fao_circ.cjs` : entryR=3 accepté (test ponctuel, plus de recalage à ρ=5) ; split arc ent ≥ 6 coords (sous-arc du ramp). Sécurité 007 : 0 plongée à plat non couverte. Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-08-010.html`.

Migration : `APP_VER` → `2026-10-08-010`, **`CACHE_VER` → `2026-10-08-010`** : les générateurs changent (test ponctuel ancre + ramp arc = autres trajets d'entrée, mêmes sigs) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-09-001`

**FAO : VIDE D'ABORD — toute entrée restante plonge d'abord À PLAT dans le vide déjà usiné (point Q), puis accoste la cible à cote z et entre circulairement ; hélices 8 → 4 (pôle seul), descents non claires 309 → 81 (aucune près d'un vide).**

Demande : « on vient de finir la spirale et tu attaques le reste et tu rentres en pleine matière, en rampe circulaire, alors qu'il y a plein de vide avant où tu pourrais entrer bien à plat et circulairement… Ceci est valable pour tout le reste de cette poche » ; « dès la fin de la spirale, du vide il y en a tout le temps ! ». Diagnostic : le repli générique d'`entryTo` plongeait (hélice/plongée) AVANT tout test de disque clair, la pass 1 rampait dans l'arc quand l'ancre n'était pas entièrement balayée, et les faces rampaient depuis `rampZ0` — autant d'attaques en pleine matière alors que le vide de la poche est joignable juste à côté.

Noyau — drapeau `sweptNow` (coupe déjà émise à cote z dans CE niveau, posé par `pushCut`) ; helper **`voidWay(tx,ty)`** : cherche un point Q dans un anneau (k·step jusqu'à 45 mm max) tel que `segClear(Q→cible)` ET `faoPlungeClear(Q)` — Q est atteignable à plat depuis la position courante et dégagé pour plonger ; null si aucune coupe du niveau n'est encore émise. Helper **`arriveVoid(Q)`** : si la position précédente est déjà à cote z et le segment est sûr → `pushCut(Q)` sans lever (aucune plongée), sinon aller rapide + **plongée plate `ent:1`** dans le vide, puis `pushCut` de la cible. Appliqué dans la pass 1 (disque clair → plat + arc ; sinon `voidWay` → `arriveVoid` + arc ; sinon ramp d'arc 010), la pass 2 (clair → plat ; sinon `voidWay` → `arriveVoid` ; sinon hélice), et le repli générique (**clair d'abord** → `voidWay` → hélice `insideSil` en dernier recours) ; boucle des faces : refus d'accostage depuis une cote de rampage non redescendue (`P.z>z+1e-9`).

Résultat (fixture escargot Ø25, poche ouverte) : hélices **8 → 4** (pôle seul, 1/couche), arcs 239 → 48 (ramps d'arc multi-sous-arcs remplacées par une seule arrivée + arc), moves 2851 → 2492, descentes 573 → 152, descentes non claires 309 → 81 (toutes hélices de pôle, **aucune près d'un vide ≤ 30 mm**) ; couverture de la poche à 100 % (inchangée), boîte 52,2 → 53,2 %.

Tests — `test_fao_escargot.cjs` : expansion mesurée sur les coupes **dans la pièce** (le tour E0 hors silhouette, entrelacé greedy avec les faces, faussait les moyennes : c'est l'ordre d'attaque des chaînes, pas l'expansion) : **+19,4 mm** (1er → 3er tiers), quasi-monotone 1/143, lasse outil et faces inchangées. Sécurité 007 intacte (0 plongée à plat non couverte). Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-09-001.html`.

Migration : `APP_VER` → `2026-10-09-001`, **`CACHE_VER` → `2026-10-09-001`** : les générateurs changent (arrivées dans le vide avant entrée = autres trajets d'entrée, mêmes sigs) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-09-002`

**FAO : rapide au-delà de 50 mm (en deçà, glissement G1 à la cote), entrée circulaire sur toutes les mini-passes, morceaux déjà couverts dropés — « aller au plus vite en l'air » sans sauter à chaque anneau.**

Demande : « Oui change la préférence. je préfère aller au plus vite en l'air et pas en vitesse travail au sol ! » ; « maintenant que l'entrée circulaire fonctionne, il faut l'appliquer à toutes les mini passes » ; « une fois le tour complet fait, pas la peine de revenir finir puisque la fraise est passée partout… pour le moment elle vient usiner dans le vide, des fois avant le tour » ; puis : « on va déterminer une distance mini de 50 mm pour sauter en rapide car sinon, c'est n'importe quoi ! à chaque rayon, il saute 1x ! ».

Noyau — constante **`faoRapideMin=50`** (mm) : liaison < 50 mm ET sûre (`prev` à cote z + `segClear`) = **glissement G1 à la cote** (aucun lever) ; ≥ 50 mm ou segment bloqué = lever + rapide. Les quatre sites de liaison sont gouvernés : `linkIn` (conv), `linkTo` (renvoie false = glissement, l'appelant émet le G1), boucle des faces, `arriveVoid`. L'entrée circulaire couvre ensuite **toutes** les liaisons ≥ 50 mm, mini-passes (`ringOnly`) comprises, avec garde 007 sur l'ancre (`faoPlungeClear` ; sinon repli hélice pass 2 = même arc tangent). Ancre hors boîte brute + disque entièrement dégagé (balayé / hors boîte / hors silhouette) → **descente plate** directe (fini la ramp qui remontait au-dessus du brut après engagement). Mini-passes : helper **`chunkCovered`** — morceau dont chaque point a une coupe à la même cote ≤ r et le disque entier dégagé (`faoPlungeClear`) = déjà usiné → **dropé sans bouger** (couverture réévaluée à chaque choix du greedy) ; actif en `ringOnly` (mini-passes ET finition conventionnelle), parcours des passes normales inchangé.

Tests — `test_fao_zone2.cjs` : l'assertion comptable ±2 devient **inclusion géométrique** (`onlyBase=0` : toutes les cotes XY de la base refaites avec l'îlot ; les 131 extras ≤ 1,4 mm = empreintes d'entrée et anneau d'îlot) : avec la nouvelle politique d'entrée les comptes de mouvements divergent (663 vs 1414 non-ent) sans que l'usinage change. Corrigés au passage : `test_fao3d` (adaptive stay-down ≤ 12 rapides, troco ap2, couverture 027) et `test_fao_helice` (fente : plus de coupe au-dessus du brut après engagement). Sécurité 007 intacte (0 plongée à plat non couverte). Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-09-002.html`.

Migration : `APP_VER` → `2026-10-09-002`, **`CACHE_VER` → `2026-10-09-002`** : les générateurs changent (glissements < 50 mm, entrées circ sur ≥ 50 mm, drop des morceaux couverts = autres trajets, mêmes sigs) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-09-003`

**FAO : mini-passes — la fraise se positionne À PLAT dans le vide puis part en circulaire (0 rampe, 0 hélice) ; côté/arc de la 1re attaque jugés à la règle 008 de la spirale.**

Demande : « utiliser le plan de chaque mini passe, positionner la fraise à l'intérieur, dans le vide, et partir en circulaire, pas en rampe ». Diagnostic : en mini-passes l'entrée circulaire tombait sur le repli « diagonale » (`entry auto` = aucun arc) et, quand `circ` était forcé, tous les candidats de la pass 2 étaient rejetés par `validXY` (statique, exige ≥ r de TOUTE la matière restante) : le croissant de paroi du plan mini non encore coupé est précisément ce que l'arc d'entrée doit couper — aucun point tangent n'est donc « valide » à la 1re attaque, l'arc ne sortait jamais.

Noyau — gate `circEnter` : **`isRing` force l'entrée circulaire** quel que soit `entry` du document ; helpers **`voidWayC(tx,ty)`** (anneau de recherche : Q accessible à plat, `segClear` + `faoPlungeClear`) et **`arriveVoidC`** (plongée plate `ent:1` sur Q, puis accostage de la cible à cote z). Pass 1 : disque clair → plat + arc ; sinon `voidWayC` → arrivée depuis le vide + arc. Pass 2 : côté jaugeé à la **silhouette** (`insideSil`, règle 008 de la spirale : jamais dans l'air) au lieu de `validXY` pour `isRing` — l'arc coupe le croissant comme en spirale ; la plongée sur le côté reste gardée par `faoPlungeClear` (007), sinon `voidWayC(s2)` → vide + arc, l'hélice restant en dernier recours ; repli final = entrée depuis le vide sans arc (jamais de rampe). `linkIn` tente le vide avant toute rampe. Hors mini-passes, `validXY` strict et « auto sans arc » sont conservés à l'identique (tests 007/008 intacts).

Tests — pièce réelle `Cavité Usinage` (T6 D25, `entry auto`, minis 4) : 20 plans mini, **0 rampe / 0 hélice**, 1re attaque = **plongée plate dans le vide (`disq=clair`)** sur les 20, **18/20 plans émettent ≥ 1 arc** (repli sans arc sur 2 plans : chaînes de cadre hors silhouette + une zone fine), ≈ 2/3 des liaisons ≥ 50 mm entrent par l'arc. Plaque + canal (diags) : 14/14 plans 1er `disq=clair`, arcs sur les chaînes intérieures. Sécurité 007 intacte (0 plongée à plat non couverte). Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-09-003.html`.

Migration : `APP_VER` → `2026-10-09-003`, **`CACHE_VER` → `2026-10-09-003`** : les générateurs changent (entrées mini-passes depuis le vide + arc tangent en 1re attaque = autres trajets, mêmes sigs) → périmés légitimement, régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-09-004`

**FAO : hélices et rampes d'entrée restent BLEUES après clip/arrondi (la couleur `ent` survit aux filtres) + génération des parcours ×2,4 plus rapide (151 s → 60-65 s sur la pièce réelle) — index incrémental des coupes, rejet de cellule par bbox union, scan en couronnes autour du puits.**

Demande : « colorer les hélices et rampes d'entrée en bleu » (le clip XY/zone et l'arrondi remplaçaient `m.ent` par la couleur coupe) ; puis « accélérer la génération des parcours d'outil (151 s → ×2 minimum) — GPU / tous les CPU ? ».

Couleur — 4 sites écrasaient `ent` : `faoClipMovesXY` et `faoClipMovesPoly` raccourcis (`push0` conserve `m.ent`), expansion d'arc de `faoZoneCuts` (le `ent` de l'entrée suit chaque morceau), `faoRoundMoves` (arrêt sur `m.ent` : pas de fusion avec la coupe ordinaire). Vérifié : canari escargot **0 diagonale verte**, `ent` préservé sur clip/round/pk ; assertions **6bis** ajoutées à `test_fao_circ.cjs`.

Noyau perf — (1) **index incrémental `fmi`** par tableau `moves` (segments arcs-développés + zmax par cellule 6 mm, points !r par tranche µm de z) : `faoPlungeClose`/`near` interrogent l'index au lieu de O(tous les moves), `chunkCovered` idem ; (2) **`faoXBCand`** buckets X pour `faoYCands` ; (3) **`fsgGrid`** (grille flood-fill exacte, non-frontières) + `faoShapeInside` wrapper, `faoShapeValid` : parité O(1) d'abord, distance ensuite (ET logique) ; (4) **`faoDistSeg`** : bbox UNION par cellule (`H.b`, tenue à jour par `faoHashSegs`/`faoHashFit`) — chemin `tMax` ignore les cellules dont l'union est ≥ tm (seg ⊆ union = sur-ensemble conservateur, booléen exact), repli row-major exact sans `tMax` ; `faoDiscClear` passe `tMax` + lignes packées 5 nombres (croisement bit-à-bit identique, plus d'indirection `segs[idx]`) ; (5) **`faoPlungeClear`** : cellules `fmi` avec bbox union en tête — scan en **couronnes** autour du puits (left tombe plus vite) + rejet de cellule entière si union > near (tous ses segments échoueraient au testSeg), `testSeg` = boucle 65 échantillons simple (variantes « grilles indexées » mesurées PLUS lentes : 441 s puis 229 s, rebasculées) ; compteurs de plongées confirmés inchangés (180 909 appels, queue indexée 107 871). `fmiIdx`/`faoPlungeClose` en repli O(n) si pas de WeakMap.

Résultat (pièce réelle `Cavité Usinage`, T6 D25, minis 4 — flux identique, 107 873 moves) : **151 s → 60-65 s (×2,4-2,5)** — `faoPlungeClear` 37,9 → **5,6 s**, `faoOffsetRuns` 39 → **23 s**, profils CPU : `testSeg` 262 → fondu, `faoDistSeg` 60,8 → ~15 s, `faoDiscClear` 13,6 → moitié. La cible « ×2 minimum » est atteinte en mono-thread (workers/GPU : ultérieur si besoin).

Différentiel — `diff_core.cjs` : `faoDistSeg` **20 000/20 000** (exact sans `tMax`, booléen avec `tMax`) + `faoPlungeClear` **3 000/3 000** vs références O(n) d'origine ; canari escargot **identique bit-à-bit** (rawEnt 560 / postEnt 1050 / postArc 14110 / postN 52782, `diag:0`). Sécurité 007/008 intacte. Run complet **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-09-004.html`.

Migration : `APP_VER` → `2026-10-09-004`, **`CACHE_VER` → `2026-10-09-004`** : les générateurs changent (index/rejets/couronnes = code des faoGen* — sortie attendue identique, tampons régénérés par sécurité) ; régénération unique des tampons FAO à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-09-005`

**FAO : les courbes apparaissent AU FUR ET À MESURE pendant la génération (l'écran n'est plus figé ~60 s) — ébauche 3D en générateur qui cède le fil après chaque niveau, dessin incrémental provisoire, rendu canonique final strictement identique.**

Demande : « peut-on avoir les courbes qui apparaissent au fur et à mesure ? » — clarification : *pendant* la génération FAO (et non à l'ouverture ni en mode visualiseur).

Architecture — `faoGenRough3D` devient le **générateur `faoGenRough3DIt`** : `plan.forEach` → `for` (yield interdit en closure), `yield moves` après chaque pelage de niveau, mini-passe et finition ; la fonction `faoGenRough3D` reste le **drain synchrone** (tests, G-code, estimation : inchangés). `faoOpMoves` → `faoOpMovesIt` (`yield*` de l'ébauche) + drain sync `faoOpMoves` + **`faoOpMovesStream(op,job,onChunk)`** (Promise qui passe chaque fragment au dessinateur puis rend la main via `faoYieldUI` : rAF + garde temporisée 50 ms — le rAF no-op du harnais de tests ne bloque jamais). `faoSegSplit(moves,clip,prev0)` : 3ᵉ paramètre optionnel (le premier segment d'un découpage incrémental n'est jamais fantôme) + `out.prev` pour enchaîner.

Dessin — `faoRefreshPreviewStream()` : miroir async de `faoRefreshPreview('calcule')` avec jeton `faoStreamTok` (une ouverture/modification/⚠ concurrent(e) prend la main), traits **provisoires** par fragment (bruts — ni arrondi, ni zone, ni rapides sécurisés — op. masquées non dessinées), opérations 2.5D dessinées à leur tour ; fin du flux = **rendu canonique** `faoRefreshPreview('calcule')` en coups de cache (source unique de vérité : même sortie que l'ancien bloc synchrone). Helpers partagés **`faoPrevAdd`/`faoPrevDrop`** (le `mk` du rendu canonique *est* `faoPrevAdd` : couleurs vert `30d158` / rouge `ff453a` 30 % / bleu `0a84ff` inchangées). **`faoPreviewGenerateAsync()` réservée au bouton « Tout régénérer »** (grisé pendant le flux, progression « FAO : génération i/n… » dans la barre d'état) ; `faoPreviewGenerate()` synchrone intacte pour `faoRegenFlush`, l'ouverture de document et les tests.

Tests — `stream_eq.cjs` **16/16** : drain ≡ synchrone (12 yields, 16 390 ≡ 16 390 pts), `faoOpMovesStream` ≡ `faoOpMoves` (2 179 ≡ 2 179 avec `limit` rect → zone), **cache hit ≡ calcul direct** (`faoZoneServe` idempotent), pipeline `faoPreviewGenerateAsync` ≡ `faoPreviewGenerate` (**2 422 ≡ 2 422 pts, 101 921 ≡ 101 921 chars de parcours**), bouton grisé puis réactivé, garde rAF no-op (378 ms, sans blocage). `test_fao_solide_cache.cjs` : interception portée sur `faoGenRough3DIt` (l'entrée réelle du calcul — « 1 seul calcul » intact). Pièce réelle `Cavité Usinage` : **107 873 moves, stats pc/fi/npTail identiques, 66,2 s** (surcoute du drain ≈ 0). Run complet **73/73** ; canari escargot identique bit-à-bit (postN 52782, `diag:0`) ; `diff_core` **20 000/20 000** + **3 000/3 000** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-09-005.html`.

Migration : `APP_VER` → `2026-10-09-005`, **`CACHE_VER` → `2026-10-09-005`** : `faoGen*` restructurés en générateurs (sortie prouvée identique par `stream_eq`, tampons régénérés par sécurité — règle « le code qui produit change »). Badge **V0.1.2 inchangé**.

---

### `2026-10-09-006`

**FAO ébauche 3D, mode Conventionnel : bandes de lignes parallèles depuis le centre jusqu'aux faces + suivi des faces ; une seule entrée par niveau, le reste des liaisons se fait SUR LE PLAN (liaisons de coupe, plus de sortie/ré-entrée en hélice à chaque morceau) ; la 1ʳᵉ hélice a le droit de mordre la matière.**

Demande (livraison `2026-10-09-006`) : (1) bandes de lignes parallèles droites depuis le centre jusqu'aux faces, puis suivi des faces ; (2) une seule entrée par niveau, ensuite rester sur le plan ; (3) la 1ʳᵉ hélice peut mordre. Périmètre strict : l'escargot (`faoSpiralLevel`) et les mini-passes/finition (`isRing`) restent intacts.

Bandes — après `safeRun` (avant le bloc trochs), pour chaque `lines[li]`/région non-trochs, `safeRun(iv.a, iv.b, L.y)` en serpentin (`li%2` inversé), rangées `k=1000`. La boucle k n'applique les chaînes qu'aux niveaux **0..2** (au-delà : bandes seules, cadres `faoRectRuns` vidés) ; `trochIVs` exclut les régions de peeling ; `if(isRing)break` après k=0.

Liaisons de coupe — `linkCutOK(ax,ay,bx,by)` : échantillonnage 0,25 mm hors **ombre** `faoShapeValid(S,…,rrSafe)` (porte-à-faux/voile/surplomb interdits). Après l'entrée du niveau (`entered` posé à la première émission d'entrée), `linkIn` tente le direct, puis un chemin **en L** (un coude — les serpentin passent souvent par le coude), sinon cascade (circ multi-candidats sur les 8 cibles kTop, repli circ sur 40 cibles restantes, plongée, hélice). Pré-tour circ jusqu'à 8 candidats (`isRing` : un seul, inchangé). Fallback hélice mordante `fbHx` : centre **et** orbite (8 pts) doivent être valides — jamais sous porte-à-faux ; la 1ʳᵉ hélice n'est plus soumise au test de disque balayé (« a le droit de mordre »).

Tests — `test_fao3d.cjs` : 5 → 3 → 2 → **0 échec** (surplomb/voile corrigé par `faoShapeValid`, couverture 027 par les chaînes k≤2, mini50 par l'arrêt des anneaux lointains, faux plans z=26/24 éliminés par le chemin en L) ; asserts 006 ajoutés sur le canal : >20 longues lignes droites à cote constant, ≥12 y distincts (bandes, pas seulement cadres), ≤12 groupes d'entrée, stay-down ≤20 rapides. Suite complète **73/73** ; `diff_core` **20 000/20 000** + **3 000/3 000** (noyau intact) ; canari escargot : invariants **`diag:0`** (`aPkAuto`, `aPk25`, `aEsc`) — compteurs `esc` attendus différents (rawEnt 510, postEnt 1020, postArc 9630, postN 107 992) ; pièce réelle `Cavité Usinage` : **148 324 moves, 45,9 s** (×37 % de points mais ×30 % plus rapide : moins de cascades d'entrée) ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-09-006.html`.

Migration : `APP_VER` → `2026-10-09-006`, **`CACHE_VER` → `2026-10-09-006`** : la sortie du générateur de l'ébauche change (bandes + liaisons de coupe), tampons régénérés à l'ouverture. Badge **V0.1.2 inchangé**.

---

### `2026-10-10-001`

**FAO ébauche 3D — 3 correctifs validés sur la pièce réelle Ø25 : (1) bandes en sérpentin ORDONNÉ depuis le centre vers les deux bords (fini le greedy qui sautait de G à D) ; (2) la limite d'op est injectée EN GÉNÉRATION (fini de générer 43 % de points pour les jeter au clip) ; (3) CERCLES TANGENTS SÛRS RESTAURÉS : arc concave validé point par point en priorité (les 26 arcs dont 14 GOUGEAIENT la matière sont désormais sûrs), ligne droite en repli — l'escargot retrouve ses arcs d'entrée.**

Demande : plainte « usinage de la matière qu'il ne faut pas toucher » + escargot « rayons d'entrée tangents » — diagnostic `2026-10-09-006` mesuré sur `Cavité Usinage` (outil T6 Ø25) : 26 arcs d'entrée dont 14 avec centre à < 12,5 mm de la paroi (pire 7,79 mm — la fraise entrait 4,7 mm dans la matière, tous aux mini-passes), 61 276 des 142 459 points générés (43 %) jetés ensuite par `faoClipMovesPoly` (9,2 s) + `faoZoneCuts` (5,9 s ≈ 27 % du temps), et bandes en zigzag (13 lignes inversées sur 25 à z=35).

Fix 3 (entrées) — **ARC CONCAVE SÛR EN PRIORITÉ** (retour « je ne vois aucune entrée en cercles tangents ») : `arcEnter` (adaptatif : `linkIn`, gate, `pmE`) et `arcEntry` (escargot : `entryTo`) réintroduisent l'arc tangent (côtés `faoSidesCirc`, rayons `faoCircRhos`) avec la règle de sûreté — **chaque point de l'arc est validé** (≥ `rrSafe`/`rrM` de l'ombre + limite d'op en adaptatif) ; l'arc « vers l'intérieur » car tout arc sortant de la pièce/de la zone est rejeté ; le passe-droit `insideSil` (bbox) des mini-passes, cause du gouge 4,7 mm, disparaît. Modes d'accès de l'arc : accostage à cote / plongée 007 (disque dégagé) / vide 10-09-003 / hélice à orbite légale 008 sur l'ancre. **SEGMENT DROIT en repli** : `midEnter` (milieu M du 1ᵉʳ segment) quand l'arc est impossible ; cascade sûre finale inchangée (plongée/rampe). L'escargot (`faoSpiralLevel`) branchait depuis le Fix 3 **aucune** entrée circulaire (zéro cercle) : `arcEntry` rétablit le cercle tangent à chaque anneau/entrée. Les arcs sûrs sont admis **quel que soit le mode d'entrée** (l'ancien contrat « auto = 0 arc » datait des arcs risqués) ; la poche/contour 2.5D restent intacts.

Fix 1 (bandes) — création : lignes impaires inversées **et poussées en ordre décroissant** (vrai enjambement G↔D, marqueur `band=1`, `k=1000`). Tour : les bandes sont consommées en **ordre de création rayonnant depuis le centre du niveau vers les deux bords** (deux-pointeurs sur les y — « milieu d'abord » RETOUR 3 du canari conservé), liaison testée `segClear` puis **coude 006**, repli greedy seulement si les deux échouent, avec **resynchronisation** de la séquence après un repli (sinon cascade). Résidus d'inversion = chaînes murales k=0..2 (hors périmètre).

Fix 2 (limite) — `faoZoneCtx` calcule `at()` dans `faoOpMovesIt`, transmis `zoneAt` aux niveaux adaptatifs ; **toute validation de coupe l'exige en plus** (`safeRun`, `linkCutOK`, `segClear`, `validXY`, `mvSafe`, tang, ancre hélice, `surMatiere`) + **`zoneSplit`** découpe les morceaux à la frontière de zone dès la création (`any` de la boucle k calculé avant le filtre = sémantique d'arrêt identique) ; les rapides franchissent librement. `faoClipMovesPoly`/`faoZoneCuts` restent en filet (bisection de frontière) — sur la pièce réelle **zone ≡ final** (le clip ne jette plus rien) et `brut nArc` tombe à 0 ; `nSeg` brut 142 299 → **60 348** (−58 %).

Mesures (`Cavité Usinage`, T6) — gouges : **nBad 14+12 → 0**, hors limite **0** ; arcs d'entrée brut **26 (dont 14 gougeants) → 4, tous sûrs** (`badArc=0`) ; escargot fixture : **0 → 48 arcs d'entrée** ; `ms` 45,8 s → **~42 s** ; `nMoves` ~81 978. `test_fao_circ.cjs` réécrit : arcs rough3d admis mais **tous leurs points à ≥ r−ε de la matière** (fixtures distance, escargot circ/auto) ; `test_fao3d` 027 : seuil couverture 1,9 → **2,05 mm** ; trochoides du goulet mesurées hors arcs d'entrée (`ent!==1`). Canari escargot conforme (milieu avant bords rétabli, 1ʳᵉ entrée hélice+arc). Suite complète **73/73** ; `diff_core` **20 000/20 000** + **3 000/3 000** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-10-001.html`.

Migration : `APP_VER` → `2026-10-10-001`, **`CACHE_VER` → `2026-10-10-001`** : générateur rough3d changé (entrées, ordre des bandes, limite injectée), tampons régénérés à l'ouverture. Badge **V0.1.2 inchangé**.

### `2026-10-10-002`

**FAO — garde-brut des rapides hors pièce (lecture/affichage) : un G0 dont les DEUX bouts sont hors de la boîte du brut n'est plus tracé ni émis ; les engagements en tête, les retours d'outil en fin d'op et les franchissements nécessaires survivent.**

Demande : « usinages en rapide à l'extérieur de la pièce » + image montrant des traits rouges hors du brut (brut orange). Diagnostic sur le document live `Cavité Usinage` (cache v2026-10-08-002) : rough3d (T6 Ø25) **propre** (81 978 moves, 97 rapides, `rapOut=0`, `outside=0`, `nBad=0`) ; facing sans limite va bien à ±127.5 (`dep=r+sortie`) mais ses 3 rapides sont en **tête** (engagement) et ses coupes G1 sont vertes. Le trait rouge hors pièce ne vient donc pas du rough3d.

Correctif — **`faoBoxCross`** (nouvelle) : vrai test de franchissement de la boîte brut (une extrémité dedans XOR l'autre, ou intersection non triviale de longueur > ε avec une arête — un segment entièrement dedans ou entièrement dehors ne franchit rien). **Garde-brut dans `faoZoneStrip`, SANS zone uniquement** (`!ctx`) : les opérations sans limite (ex. facing) n'étaient jamais bornées — `faoZoneCtx` retourne `null` sans limite ; quand il y a une zone, `faoZoneStrip` gère déjà les rapides (pas de doublon). Séries de G0 100 % hors brut retirées **après** la tête ; préservées si en tête (engagement) ou en fin d'op (retour outil) ou si `faoBoxCross(prev,next)` (franchissement nécessaire) ; sinon re-jonexion en sécurité (retrait sécu sur place puis liaison sécu — jamais de coupe→coupe diagonale). Le garde-boîte dans `faoSegSplit` (aperçu) a été retiré (redondant, faux positifs sur fixtures).

Mesures — suite **73/73** (4 nouveaux tests garde-brut) ; `test_fao_bornage` bornes atteintes partout ; `test_fao_lock` TOUT PASSE ; rough3d réel inchangé (`rapOut=0`). `APP_VER` → `2026-10-10-002`, `CACHE_VER` inchangé (la génération ne change pas, seule la lecture/affichage est borné). Badge **V0.1.2 inchangé**.

### `2026-10-10-003`

**FAO ébauche 3D — bandes en UN CÔTÉ À LA FOIS : fini le zigzag au centre. Après la grande spirale d'ouverture, l'outil épuise d'abord entièrement le côté +Y (du centre vers le bord), puis revient et épuise le côté −Y ; une seule longue transition au retournement.**

Demande : « après la grande spirale d'ouverture, n'aller que dans un seul sens — finir un côté puis repartir dans l'autre sens finir l'autre côté ». Diagnostic sur `Cavité Usinage` (T6 Ø25) : les bandes (k=1000) étaient consommées en rayonnement alterné depuis le centre (`cB, cB+1, cB−1, cB+2, cB−2…`) — l'outil traversait le centre à **chaque** bande, enchaînant des allers-retours multipliés.

Correctif — **`ordY` unidirectionnel** (`faoSpiralLevel`, tour des morceaux) : l'ordre de consommation des bandes passe de l'alternance des deux-pointeurs à un **sweep par côté** — `cB, cB+1, …` jusqu'au bord +Y, puis `cB−1, …` jusqu'au bord −Y. Le démarrage au centre (« milieu d'abord », RETOUR 3) et le sérpentin (transitions courtes intra-côté, `segClear`/coude 006, repli greedy resynchronisé) sont **conservés** ; seul l'ordre des côtés change. Résultat : les deux sweeps restent monotones, une seule longue transition (du bord atteint au 1ᵉʳ band de l'autre côté) au lieu d'un enchaînement de traversées du centre. Les morceaux non-bandes (k<1000) et les mini-passes gardent le greedy historique.

Partie 2 (hélice au centre) — **déjà en place**, non modifiée : le centre de la pièce `(B.x0+B.x1)/2` est le candidat prioritaire d'entrée (avant la bande de zone la plus large) et n'est choisi que si le disque y est dégagé (test `faoDiscClear`/`faoShapeValid`) — sur la pièce réelle les niveaux profonds (z=30/32/33/44) s'engagent déjà à dCenter 3–5 mm. Un recentrage forcé du candidat a été essayé puis **reverti** (rejeté au niveau haut z=52 où le disque central mord encore la matière — comportement sûr inchangé).

Mesures — `test_fao_escargot` quasi-monotone **améliorée** (le retour central unique remplace les traversées multiples) ; `test_fao_sens` legacy byte-identique préservé (`avalant`/`bidir`/sans-champ inchangés en égalité) ; suite complète **73/73** ; `build.js --check`. `APP_VER` → `2026-10-10-003`, **`CACHE_VER` → `2026-10-10-003`** : l'ordre des bandes est cuit dans le tableau `mv` servi par le cache — sans bump, l'ancien parcours (alterné) serait resservi ; tampons régénérés à l'ouverture. Badge **V0.1.2 inchangé**.

### `2026-10-10-004`

**FAO ébauche 3D escargot — (1) limite d'op injectée EN GÉNÉRATION comme le conventionnel : fini d'aller au-delà de la chaîne d'arêtes sélectionnée ; (2) spirale limitée aux murs proches (Rcent) + éclaircissement des extrémités UN CÔTÉ PUIS L'AUTRE en zigzag horizontal ; (3) entrée des 1ʳᵉˢ passes AU CENTRE DE LA PIÈCE.**

Demande (1) : « d'abord, faire comme sur le mode Conventionnel, ne plus aller au-delà de la zone délimitée par la chaîne d'arêtes sélectionnée ». Diagnostic sur la pièce réelle `Cavité Usinage` (T6 Ø10) : le dispatch escargot **n'envoyait pas `zoneAt`** à `faoSpiralLevel` — le conventionnel l'injecte depuis le Fix 2 (2026-10-10-001 : `faoZoneCtx` → `zoneAt`, exigé par `safeRun`/`linkCutOK`/`segClear`/`validXY`), mais l'escargot ne consultait jamais la zone : ses coupes sortaient de la chaîne.

Correctif (1) — **`zoneAt` injecté dans `faoSpiralLevel`** (reçu via `opt`, transmis par le dispatch au même titre que le conventionnel) et exigé par **toute validation de coupe** : `inside()` (spirale + masque d'entrées/pôle/Rcent), le masque de cases, et `segClear()` (liaisons de coupe G1 + `arriveVoid` + `arcEntry` qui passent par `inside`). **Passe de faces** : les chaînes `faoOffsetRuns/faoRectRuns` sont en plus **découpées à la frontière de zone dès leur création** (copie du filet Fix 2 conventionnel — runs hors zone supprimés, runs dedans conservés en chaînes ouvertes). Diagnostic pré-clip (instrumentation temporaire, pièce réelle) : sans ce filet, la spirale était déjà propre (2 306 coupes toutes en zone) mais la passe de faces suivait les parois de tout le solide — **82 788 coupes hors zone** générées puis jetées en silence par `faoClipMovesPoly` ; avec le filet, **génération = 0 hors zone** (`preOut 0/11617`, post-clip 0 aussi, compte de coupes final inchangé 34 576 — aucune matière perdue). Les **rapides traversent librement** (`pathOK`) — identique au conventionnel (« les rapides franchissent librement »). Résultat pièce réelle : **hors zone = 0** pour l'escargot comme pour le conventionnel.

Demande (2) : « après la spirale, un côté entièrement puis l'autre » — l'axe Long suit la pièce (« si plus de place après la spirale en Y, on part en X+ et X− et inversement »). Sur fixture paysage 120×60 l'escargot était une spirale polaire `R(θ)=pitch·θ/2π` **sans bandes** tournant jusqu'à `Rmax` — à grand rayon elle sautait d'une extrémité à l'autre à chaque demi-tour, enchaînant des G0 de retrait longs qui « radiataient » entre les deux bouts.

Correctif (2) (3 temps, `faoSpiralLevel`) — (1) **`Rcent`** = distance du pôle au mur le plus proche + pas : la spirale s'arrête au disque central (`thMax` sur `Rcent`, plus sur `Rmax`) — les murs proches sont pelés, les extrémités lointaines ne sont plus « rayonnées » en zigzag. (2) **`clearSide`** : les extrémités restantes (le long de l'axe long, `SENS LONG` force X interne) sont éclaircies par **zigzag horizontal** (lignes Y constantes) — d'abord tout le côté X+ (de `cx` vers `rx1`), puis le côté X− (de `cx` vers `rx0`) ; le disque déjà balayé (`Rcent−pas`) est sauté (pas de recoupe) ; chaque ligne = segment horizontal validé `segClear` (aucun gouge) ; **sérpentin** reliant chaque ligne à son extrémité — l'arête lointaine (`rx0`/`rx1`, bord brut/pièce quasi droite) et le cercle central donnent des liaisons **courtes G1 à la cote** ; `entryTo` (retrait) seulement si le lien n'est pas sûr. (3) La passe de finition des faces est **inchangée**.

Correctif (3) — demande : « l'entrée des 1ᵉʳˢ passes doit se trouver au centre de la pièce sauf, vraiment, si pas de place ». L'entrée (hélice/plongée/arc) de chaque passe a lieu au 1ᵉʳ échantillon R=0 de la spirale = au **pôle d'inaccessibilité** (case légale la plus éloignée des murs) — souvent décalé du centre visuel de la pièce. Désormais le **centre géométrique du maillage** (`mBB`) devient le centre de spirale — donc le point d'attaque de chaque passe — **quand il est légal** : dedans la région avec la marge outil `rrM`, dans la zone de la chaîne, dans l'étendue du masque ; sinon (« vraiment pas de place » : hors zone, contre une paroi, dégagement trop étroit) on garde le pôle, comportement antérieur. `Rmax`/`Rcent`/`clearSide` suivent le centre choisi. Mesure pièce réelle `Cavité Usinage` (bbox [−110,−70,110,70], centre (0,0)) : 1ʳᵉ coupe escargot à **1,33 mm du centre** (orbite hélice rayon 3,85 mm autour de (0,0)), tous clusters d'entrée au centre ; avant = pôle décalé (et le conventionnel attaque à 34,7 mm).

Notes de conception — le zigzag est **horizontal** (lignes Y constantes) et non vertical (bandes X constantes) : le haut d'une bande verticale bougeait d'une colonne à l'autre et forçait un retract par bande ; l'arête lointaine quasi droite rend le zigzag horizontal auto-liaisonné (mesure pièce réelle : 131 liaisons G1 contre 27 entrées). `SENS LONG` transpose l'axe long en X à l'entrée (swap) et remet en place à la sortie — « X+ puis X− » devient « Y+ puis Y− » pour une pièce portrait, sans coder le sens en dur.

Mesures **pièce réelle `Cavité Usinage`, T6 Ø10** — escargot : **avant** (spirale à `Rmax`, hors zone) : 316 rapides, 119 longues >30 mm, max 175,6 mm, coupes hors zone ; **après** (zone + Rcent + clearSide) : **144 rapides (−54 %), 35 longues (−71 %), max 95,4 mm (−46 %), hors zone = 0** (conventionnel : 82 rapides, 13 longues, hors zone 0). Fixture paysage 120×60 : 214 → 142 rapides, hors brut 156 → 71. Couverture `test_fao_couverture` **100,00 %** ; `test_fao_escargot` **TOUT EST CONFORME** ; `test_fao_sens` legacy byte-identique ; suite complète **73/73** ; `build.js --check`. `APP_VER` → `2026-10-10-004`, **`CACHE_VER` → `2026-10-10-004`** : la zone, `Rcent` et le zigzag des côtés sont cuites dans le tableau `mv` servi par le cache — sans bump, l'ancienne spirale (hors zone, à `Rmax`) serait resservie ; tampons régénérés à l'ouverture. Badge **V0.1.2 inchangé**.

### `2026-10-11-001`

**FAO ébauche 3D escargot — (1) passes après la spirale en ARCS CONCENTRIQUES par côté (demi-anneaux « D » centrés sur le pôle, plan médian perpendiculaire à l'axe long) ; (2) AVALANT = sens de coupe constant ; (3) rapides entre passes non continues ni tangentes à +5 mm DU PLAN DE TRAVAIL (plus jamais le plan de retrait sauf nécessité de dégagement), sans attaquer le brut ; (4) seuil de lever entre 2 entrées 50 → 30 mm ; badge produit V0.1.2 → V0.1.3.**

Demande (1) : « après la spirale, les passes étaient circulaires avant, maintenant elles sont droites (zigzag) — je n'aime pas ; circulaire ≈ trochoides, utile plus tard » + choix explicites : **arcs concentriques par côté**, plan de coupe **perpendiculaire à l'axe long**, **côté de départ = côté de fin de spirale**, croisement unique au plan médian.

Correctif (1) — **`clearArcs` remplace `clearSide`** (`faoSpiralLevel`) : les extrémités X+/X− restantes après la spirale (`Rcent`) sont éclaircies par **demi-anneaux circulaires concentriques** centrés sur le pôle `(cx,cy)` — rayons `Rsp = pas·(⌊Rcent/pas⌋+1) … Rmax` par pas radial, bornes angulaires `thA/thB` = demi-plan du côté, échantillon `dth ≤ π/6`, **sérpentin bidir** au sein d'un côté, `side0 = (px≥cx)?+1:−1` = côté de fin de spirale d'abord, puis l'autre ; croisement unique par le plan médian (lien en G1 dans l'air déjà usiné). Émission = motif spirale : `segClear` → `pushCut`, sinon `entryTo` (retrait), repli rampe `rampTot/rampK/rampL` ; état `rampL=0` + recompute `atCut/prevIn` avant le bloc côtés. Le disque déjà balayé (`Rcent−pas`) est sauté (pas de recoupe).

Demande (2) : « quand Avalant est sélectionné, il faut travailler toujours dans le même sens ! ».

Correctif (2) — dans `faoSpiralLevel`, `rev = avalant ? false : …` et le flip par côté `if(had&&!avalant)rev=!rev` est neutralisé en avalant : le sérpentin garde son enchaînement optique mais **le sens de coupe ne s'inverse plus** (constant = le côté retourné usine dans le même sens que le côté précédent). `const avalant` unique déclaré avant `clearArcs` (le doublon du bloc faces disparaît). Sans-champ ≡ bidir byte-identique (contrat legacy `test_fao_sens`), `avalant` complet et distinct.

Demande (3) : « entre chaque passe non continue et non tangente, remonter de 5 mm dans le plan de travail actif, pas au plan de retrait, sans attaquer le brut ni le brut restant en rapide ».

Correctif (3) — **`pathMatTop` + 3 branches dans `gotoXY`** (`faoSpiralLevel`, escargot seul) : chemin dans l'air (`pathOK`) → `tz` (bande+5, inchangé) ; sinon hauteur de **matière le long du chemin** (`faoHelixSpot` par échantillon ≤ 2 mm, disque rayon `r+1` qui couvre l'écart, borné `brutTop`, sommet `+5`) → `zGo = max(tz, min(secu, zNeed))` ; repli `secu` seulement si indéterminable ou si la matière atteint le plan de retrait. Le brut restant (bande en cours) est couvert par `tz`, le brut/pièce par le maillage ; le conventionnel et ses mini-passes (`tvJ`) restent intacts. Mode **plan** (`remPlan`) continue de forcer `secu`.

Demande (4) : « j'avais mis une règle de 50 mm entre 2 positions pour lever l'outil entre 2 entrées, on va la passer à 30 » + « on passe en version V0.1.3 ».

Correctif (4) — **`faoRapideMin` 50 → 30** (`src/88-fao.js`) : en deçà de 30 mm la liaison reste un G1 à la cote (aucun lever), au-delà l'outil saute en rapide — les liaisons entre deux entrées de 30 à 50 mm lèvent désormais. La constante est partagée par les 4 sites de liaison (`arriveVoid`, `arcEntry`, `linkTo`, faces) ; commentaires alignés (« >= 30 mm »). Badge produit **V0.1.2 → V0.1.3** (`src/96-bandeau-groupes.js`), `test_prodver_badge.cjs` mis à jour (7 occurrences).

Mesures **pièce réelle `Cavité Usinage`, T6 Ø10, mode escargot** — A/B (seul `gotoXY` changé) : **rapides au plan de retrait 166 → 53 (−68 %), sous-secu 28 → 142**, les nouveaux vols à z ∈ {30; 35; 40; 45} = bande+5/matière+5 ; coupes **33 256 inchangées**, `outZone=0`, `zLevels=24`, `sideChanges=230` ; arcs : 195 rapides / 54 longues / max 131,2 mm (coût des liaisons inter-anneaux face au zigzag 004 : 144 / 35 / 95,4 — compensé par la chute des retraits) ; conv inchangé (82 rapides, 62 à `secu`, 20 sous — copie conventionnelle non touchée). Suite complète **73/73** ; `test_fao_sens` escargot `avalant` distinct (125 796 ≠ 124 880 sans-champ) ; couverture `test_fao_couverture` **100,00 %** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-11-001.html` (001-004 du 2026-10-10 figés, non écrasés).

Migration : `APP_VER` → `2026-10-11-001`, **`CACHE_VER` → `2026-10-11-001`** : les arcs concentriques, le sens avalant et la hauteur des rapides sont cuits dans le tableau `mv` servi par le cache — sans bump, l'ancien zigzag à `secu` serait resservi ; compteur quotidien reparti à 001 (règle 00-entete l.17-21) ; tampons régénérés à l'ouverture. Badge **V0.1.2 → V0.1.3**.

### `2026-10-11-002`

**FAO viewer usinage — rendu « forme réelle » : (1) l'outil a sa vraie forme (profil de révolution plat/torique/boule, gorges hélicoïdales, rotation pendant l'avance) ; (2) la matière est taillée au rayon d'arête de la fraise (l'arrondi R2 apparaît au bas des parois) ; (3) la surface Z-map devient continue et lissée — fini les cubes/briques, ~10× moins de mémoire géométrique ; (4) le brut au corps réel s'affiche en fantôme jaune — plus un bouton `◈ réel / ◇ simple` dans la barre du viewer : l'ancien rendu reste à un clic.**

Demande : « un viewer d'usinage plus exact — fraise torique rayon d'arête 2, formes d'outil visibles pendant l'usinage, plus proche de la réalité que des cubes », avec choix explicites : lots 1+2+3+4 complets, garder l'ancien rendu en toggle, gorges hélicoïdales + rotation de la fraise pendant l'avance.

Correctif (1) — **forme de l'outil transportée par point** : `faoToolEffCr` (rayon d'arête effectif : `flat`=0, `bull`=`cornerR` borné à D/2, `ball`=D/2 — la source de vérité de la forme de coupe) + `faoToolProfile` (profil de révolution unitaire PUR et testable : fond plat ρ=0.5−q, arc d'arête q, cylindre — un seul arc couvre torique ET boule, q=0.5 → pointe arrondie) ; `faoViewerBuild` émet `kt` (kind) et `cr` (mm) par point au même rang que `dd` (Ø). Rendu : `faoViewerToolCreate/BodyMake` construit un `LatheGeometry` (Ø unitaire, scale = Ø réel) + **3 gorges hélicoïdales** (`TubeGeometry`, ≈1,5 tour, teinte sombre, débordent de 1,5 % de Ø) sur un groupe « spin » qui **tourne pendant l'avance** (`faoViewerAdvance`, ω·vitesse) ; un changement d'outil en cours de parcours (T1→T6) reconstruit le seul corps via `faoViewerToolBodySwap` (signature kind + cr/Ø, mandrin et groupe conservés, géométries disposées).

Correctif (2) — **carve au rayon d'arête** : `faoMatterCarveSeg(g,…,r,outCols,cr)` — la cote de coupe d'une colonne à distance ρ passe de « plane à `zc` » à `zc + cr − √(cr²−(ρ−(r−cr))²)` pour ρ ∈ [r−cr, r] (arc sous l'arête), `zc` sous le fond plat (ρ ≤ r−cr) ; `cr=0` (défaut) = cylindre historique **byte-identique** (régression garantie), kill voxel aligné sur la cote par colonne. Les trois appelants (`faoMatterCarveTo`, `faoMatterCarveRange`, rattrapage 0→t) transmettent `vw.cr` **seulement en mode réel**.

Correctif (3) — **surface continue lissée** : `faoViewerMatterHFBuild/Update` remplace les colonnes « 30 verts/colonne `flatShading` » par un **heightfield indexé** — UN sommet partagé par nœud de grille ((nx+1)×(ny+1)), z = moyenne des colonnes adjacentes (lissage naturel de la Z-map), normales recalculées sur la zone sale uniquement (diff), murs de bord périmétriques + fond ; mémoire ~10× moindre (1,8 M → ~61 k floats sur une pièce courante). `vw.mTops` (une hauteur par colonne) reste le canon **identique dans les deux modes** ; le maillage historique est conservé tel quel derrière le toggle. Garde de `faoViewerMatterKill` adaptée (`mArr` non requis en mode réel).

Correctif (4) — **brut au corps réel** : quand `stockSrc='body'`, `faoViewerStockCreate` affiche un **clone fantôme jaune** (opacité 0,12 + arêtes) du maillage du corps au lieu de la boîte de bbox (repli boîte : corps absent, brut manuel, ou rendu simple).

Correctif (5) — **toggle** : bouton `◈ réel / ◇ simple` dans la barre transporteur (`faoViewerExactToggle`, défaut **réel**, `faoViewerExact`) — outil, brut et matière reconstruits **à la volée** avec rattrapage 0→t, temps et lecture préservés ; message utilisateur à chaque bascule (jamais silencieux).

Mesures — suite complète **73/73** ; `test_fao.cjs` enrichi : profil plat (3 points, bout vif) / torique D25 R2 (fond 0,42·D = 10,5 mm, sommet d'arête (0.5, 0.08)) / boule = arc q=0.5, `effCr` (4 bornes), `kt`/`cr` par point, carve R2 (fond plat → 20, arc ρ=11,75 → 20,439, hors emprise intacte, voxels k10 tués/k9 vifs, régression sans cr = coupe plate), bloc 015 mode-aware (nœuds+murs+fond, index 2 tris/cellule) et 015bis (bascule réel↔simple avec reconstruction complète) ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-11-002.html` (001-004 du 10/10 et 001 du 11/10 figés, non écrasés). Migration : `APP_VER` → `2026-10-11-002`, **`CACHE_VER` inchangé** : le viewer ne touche pas au tableau `mv` (génération FAO identique — precedent 2026-10-08-001) ; compteur quotidien 002 (règle 00-entete l.17-21) ; badge **V0.1.3 inchangé**.

### `2026-10-11-003`

**FAO viewer — précision demandée : (1) sens des dents corrigé — les gorges passent de l'hélice GAUCHE à l'hélice DROITE (fraise standard ; coupe M03 CW déjà conforme) ; (2) sélecteur « détail » dans la barre : 3 niveaux de finesse (8 000 / 60 000 / 100 000 colonnes — maille 2 / 0,5 / 0,25 mm) pilotant grille XY, reconstruction de l'outil et signature ; (3) deux cases — « corps pièce » (masque les corps 3D, brut + matière restent visibles : « je veux voir le brut en cours d'usinage ») et « corps outil » (masque le mandrin gris) ; (4) « surface nette » — le heightfield lissé de 002 est SUPPRIMÉ : plus de moyenne des 4 nœuds qui floutait les traces de l'outil d'une maille, les deux modes affichent chaque colonne à sa cote EXACTE.**

Demande (1) : « le sens des dents n'est pas bon » — vérification par recherche : hélice droite standard = tourner horairement vu du mandrin fait avancer l'outil dans la matière (Mitsubishi : RH end mill = RH helix + CW vu du côté mandrin ; ISCAR : RH helix s'enroule horaire en s'éloignant de l'extrémité ; engineeringtechnology.org : coupier droite + hélice droite = copeaux vers le haut) ; M03 = sens horaire vu du mandrin (bccncmilling, getgcode).

Correctif (1) — **`faoFluteTh(off,t) = off − 2π·1,5·t`** : les gorges de `faoViewerToolFill` passent de `+` (hélice gauche — `atan2(z,x)` croissant avec la hauteur) à `−` (hélice droite : `atan2(z,x)` décroissant, axe +y mandrin en haut). Le spin (`toolSpin.rotation.y -=`) était **déjà** en M03 CW vu du mandrin : inchangé, commentaires sources ajoutés.

Demande (2)-(3) : « le rendu n'est pas assez précis » + choix explicites (finesse dans la barre, « corps de pièce » pour voir le brut pendant l'usinage, « corps de l'outil » = mandrin gris).

Correctif (2) — **détail** : `faoDetailCfg` (3 niveaux : `B` budget colonnes, `F` maille XY, `lathe/tub/rad` segments outil — niveau 1 = byte-identique historique) + `faoViewerDetail` (défaut 1), `faoViewerDetailSet(v)` : sig `kind@cr/Ø#détail` nulle → `faoViewerApply` (reconstruit l'outil) + matière relancée avec rattrapage 0→t ; `faoMatterGrid` lit `B/F` sur sa branche défaut (branche `pas` stricte des tests intouchée) ; select dans la barre près de `◈ réel`.

Correctif (3) — **cases** : `faoViewerPieceBodyApply` — masquage par **LISTE `hideBodies`** (cochée → `HideBodies` ; décochée → `ShowBodies` + re-`HideBodies` si matière ON ; close → restaure les corps masqués) et `faoViewerHoldApply` (mandrin) ; appels dans `MatterToggle` / `ExactToggle` / `Open` ; deux `mkChk` dans la barre du viewer.

Correctif (4) — **surface nette** : `faoHFAddTri`, `faoViewerMatterHFBuild`, `faoViewerMatterHFUpdate` **supprimés** (tombstone en commentaire) ; `faoViewerMatterEnable` construit `mArr` (30 verts/colonne, `flatShading`) dans les DEUX modes, `faoViewerMatterKill` unifié sur le diff `WriteCol` (garde `!vw.mArr`) — chaque colonne affiche `T[c]` **exact**, côtés repliés si voisin plus haut : arêtes R2, marches d'escalier et limite coupe/non-coupe au pixel de maille ; `mH:null` conservé dans l'état. Les vraies différences de mode restent : carve au rayon d'arête (`cr`), fraise à gorges, fantôme de brut. (Le heightfield mémo-moins-10× rendu obsolète par la demande de précision : `mArr` = 360 B/cellule, ≤ 36 Mo au détail haut — comme le mode simple depuis toujours.)

Mesures — suite complète **73/73** ; `test_fao.cjs` : nouveau bloc **025** (gorges décroissantes `faoFluteTh`, spin `rotation.y−=` = M03, grille bas/haut + niveau de détail, sig `#1↔#2`, mandrin on/off, corps pièce via liste + toggles matière, barre ≥ 2 selects + ≥ 2 cases, close/restauration) ; blocs 015/015bis unifiés sur `mArr` + **assert cote exacte** (`arr[c*90+2] === mTops[c]`, aucune moyenne) ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-11-003.html` (001-003 du 11/10 figés, non écrasés). Migration : `APP_VER` → `2026-10-11-003`, **`CACHE_VER` inchangé** (la génération FAO ne bouge pas — précédent 002) ; compteur quotidien 003 (règle 00-entete l.17-21) ; badge **V0.1.3 inchangé**.

### `2026-10-11-004`

**FAO viewer — demandé : « Il faut que ce soit plus réel. Là je ne vois pas le rayon de l'outil sur les parois à 25°. Il faut que le rendu corresponde à ce que l'outil enlève, mais pas un flou, une version plus exacte. » : (1) budgets du niveau de détail relevés — maille du niveau normal 0,5 → 0,4 mm (l'arc R2 de 2 mm est désormais échantillonné à ~5 points par face, au lieu de 3 qui fondaient à l'œil), niveau haut 100 000 → 400 000 colonnes (0,305 mm) ; (2) carve « early-out » — les colonnes déjà retaillées à la cote courante sont sautées : rattrapage 0→t ×14 plus rapide (53,5 s → 3,8 s au niveau normal, 355,5 s → 25,5 s au niveau haut sur la pièce réelle), bit-identique (hashes `h` + sommes `alive` + arêtes identiques aux 3 budgets), colonnes poussées 65 M → 4 M — l'Array du rattrapage frôlait le plafond V8 2^27 (134 M) et picait à 520 Mo.**

Diagnostic — le carve au rayon d'arête (002) EST appliqué sur la pièce réelle (`faoToolEffCr` → `vw.cr` → 87 paliers contre 48 sans `cr` sur le profil X=0) : la physique est juste, c'est la MAILLE qui manque. À la maille effective de 0,788 mm (budget 60 000/0,5 mm écrêté par la boucle de budget sur la pièce 220×140), la bande d'arc ρ ∈ (r−cr, r] de 2 mm ne compte que ~3 colonnes à chaque bas de paroi — invisible à l'œil, comme si le rayon n'existait pas. (Le mur de coupe à X=0 est à ~49° et non 25° — les faces xdraft 25° sont ailleurs sur la pièce — mais le problème de discrétisation est le même sur chaque bas de paroi.)

Correctif (1) — `faoDetailCfg` : niveau 1 (défaut) `B 60000→200000, F 0.5→0.4` → pièce réelle à maille 0,400 mm nette (192 500 colonnes ≤ budget, l'arc fait ~5 pts par face) ; niveau 2 `B 100000→400000` (maille 0,305 mm, soupe 30 verts/cell ≈ 119 Mo, opt-in) ; niveau 0 inchangé. Le niveau reste 1 par défaut (`faoViewerDetail===1`, sig `#1`, `lathe/tub/rad` inchangés) : **la promesse « byte-identique » de 003 est abandonnée** (budgets documentés ici). Asserts à jour : 013 (`≤ 6,4 M` voxels, `≤ 200 000` colonnes), 025 (normal `pas ≥ 0,4 / ≤ 200 000`, haut `≤ 400 000 / n ≤ 13 M`).

Correctif (2) — `faoMatterCarveSeg` early-out : `g.hc` (Uint8 « colonne déjà retaillée », posé dès que `h` descend, amorcé `h<full` à la première utilisation) + saut `hc[c] && h[c] <= z2` — sûr parce que `zcol ≥ z2` toujours (l'arc relève : `zc+cr−√(cr²−e²) ≥ zc`), donc `h` ne peut pas descendre et les kills portent sur des voxels déjà morts (no-op) ; les flushs pile à `z=full` restent servis (`hc=0` tant que `h=full` → pas de saut, 016c intact) ; `faoViewerMatterKill` n'a rien à rattraper (les pushes supprimés étaient des no-ops : `mark(t !== T[c])` vide, et les murs périmétriques des cellules voisines sont réécrits via le voisinage marqué). `tc` (allocation `Uint8Array(nc)` par segment — 80 000 allocations au rattrapage) → tampon d'horodatage `g.tcs` (1 Uint32/colonne, `g.tsg+1` par segment, repli création si dépassement 4,2·10⁹).

Mesures — validation dédiée (orig vs early, pièce réelle, 3 budgets) : signatures `hash(h)|Σalive|arêtes` **identiques** aux 3 niveaux (60 000 : `620580598…|818308|15590`, 200 000 : `263597599…|2716609|47472`, 400 000 : `252211437…|5420114|92323`) ; carve complet 0→t : **53 491 → 3 810 ms / 178 758 → 12 752 ms / 355 467 → 25 532 ms** ; colonnes poussées (niveau normal) : 65 023 247 → 4 057 011 — l'original reproduit hors applicatif un `RangeError: Invalid array length` dès `B=200 000` (plafond V8 2^27 de l'Array). Nouveau bloc **028** (`test_fao.cjs`) : bande d'arc ≥ 8 pts à la maille défaut (mesuré : 10, 5 de chaque côté de la passe), formule d'arc à 1e-4 sur chaque point, montée > 1 mm, fond plat = cote exacte, hors emprise intacte, contrôle `cr=0` sans aucun point d'arc, replay = 0 kill + 0 drift `h` (early-out actif) ; suite complète **73/73** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-11-004.html` (001-003 du 11/10 figés, non écrasés). Migration : `APP_VER` → `2026-10-11-004`, **`CACHE_VER` inchangé** (génération FAO intacte — précédent 003) ; compteur quotidien 004 (règle 00-entete l.17-21) ; badge **V0.1.3 inchangé**.

### `2026-10-11-005`

**Ébauche 3D — demandé : « l'ébauche 3D n'usine que dans un seul sens X+/X− mais jamais Y+ ou Y− » et « à la fin l'ensemble tourne de 90° » (`Exemples/Cavité inverse.miniFusion`) ; principe : « Peu importe la position de la pièce : si le sens long est sur Y, tu travailles en Y ; s'il est à 38,5°, tu suis cet angle » — le parcours doit se dessiner sur la pièce dans sa position. La forme 3D était suivie correctement, c'est la ZONE qui tournait — `zoneAt` (prédicat MONDE de la limite d'op) était livré NON TRANSFORMÉ dans le repère transposé du SENS LONG (brut plus haut que large) : la zone ±42,5×±72,5 bornait alors Y à ±42,5 au lieu de ±72,5 et les extrémités de poche n'étaient JAMAIS usinées. Correctifs : (1) la zone part dans le repère (wrapper `zoneAt` : (y,x) sous miroir, R(+θ) sous rotation) ; (2) `faoLoopAxis` (PCA des sommets de la chaîne, tolérance 2°, ratio d'étendues ≥ 1,3) : axe PAYSAGE → repère = la pièce (aucune transformation), PORTRAIT (π/2) ou OBLIQUE (35°, 38,5°…) → rotation du repère sur l'axe de la poche, sortie +θ (isométrie : cw/IJK des arcs exacts) ; (3) **l'orientation vient de la MATIÈRE (la limite), plus de la boîte du brut** — poche paysage dans un brut portrait = bandes en X (l'ancien SENS LONG imposait Y par principe) ; sans zone, la boîte du brut reste le repli historique strict (miroir byte-identique) ; (4) les yields de l'aperçu progressif livrent une copie en COORDONNÉES PIÈCE : le tracé provisoire ne se dessine plus à 90° pendant la génération puis ne « saute » plus à la fin (le rendu canonique final reste identique).**

Mesures — « Cavité inverse » (harnais OCCT, brut ±75×±110 portrait, limite ±42,5×±72,5 → repère tourné π/2 sur l'axe de la poche) : avant `y −41,44..+41,98` (7 760 coupes, Y plafonné), après **`y −72,22..+72,21`** (zone ±72,5 atteinte à TOUS les niveaux, x ±41,8 = clip monde, 13 620 coupes) ; suite complète **73/73** ; `test_fao.cjs` : nouveau bloc **029** (maillage synthétique creux via override `faoActiveMesh` : (a) brut portrait + escargot → extrémité Y ≥ 60 — échouait à 42,50 ; (b) zone tournée 35° → toutes les coupes dans le rectangle + ≥ 70 % des segments ≥ 8 mm dans [30°,40°] — échouait 0/76 ; (c) brut portrait + poche PAYSAGE → ≥ 70 % des runs longs horizontaux (bandes en X, la matière décide — l'ancien SENS LONG les mettait en Y)) ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-11-005.html` (001-004 du 11/10 figés, non écrasés). Migration : `APP_VER` → `2026-10-11-005`, **`CACHE_VER` → `2026-10-11-002`** (la génération FAO change pour les documents à zone + brut non aligné — périmés, à régénérer une fois) ; compteur quotidien 005 (règle 00-entete l.17-21) ; badge **V0.1.3 inchangé**.

### `2026-10-11-006`

**Zone d'usinage sur import STEP — demandé : « quand j'insère un STEP, je n'ai pas accès aux arêtes pour délimiter une zone d'usinage » : la saisie « Chaîne d'arêtes » (zone extérieure, îlot, limite Z) refusait tout sur un STEP (`recalcul impossible`) alors que l'overlay « Arêtes » dessinait bien le modèle. Cause racine : un import SEUL n'entre JAMAIS dans la chaîne exacte (`occReplayBody` : `importSeul → return`), donc `occLive` reste `null` et `faoChainStart` / `faoChainReplay` ne lisaient QUE `occSharpEdges(occLive.shape)` — les arêtes du STEP existaient pourtant déjà, classées à l'import (`importGeom` `entry.edges`, cf. `2026-10-01o`). Même panne en document mixte (pièce native + STEP à côté) : le composé `occLive` ne contient que le natif, les arêtes du STEP n'étaient jamais listées. Correctif : `faoChainEdgesWorld()` — source unique pour l'ouverture de la saisie et le re-suivi à chaque rejeu : le composé `occLive` COMME AVANT (pièce native strictement inchangée) + les arêtes classées des imports affichés (repli maillage pour un STL sans classification, coords mesh → monde comme l'overlay) ; `faoChainStart` n'échoue à « recalcul impossible » que si AUCUNE arête n'est listable.**

Mesures — nouveau `tests/test_fao_chain_step.cjs` (vrai `importSTEP`, boîte 100×60×40 générée par OCCT, 21 asserts) : cause racine (`occLive` null sur import seul) ; 12 arêtes listées, message « 12 listées » sans « recalcul impossible » (refusé avant) ; capture des 4 arêtes de la face haute → boucle 100×60 **aire 6000**, 4 ancres, `stale=false`, boucle bornée [0..100]×[0..60] ; rejeu `faoChainReplay` = **0 changement** sur STEP statique (boucle inchangée, `stale=false`) ; mixte natif + STEP = **24 arêtes** (12+12) ; suite complète **74/74** (test enregistré dans `tests/run.cjs`) ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-11-006.html` (001-005 du 11/10 figés, non écrasés). Migration : `APP_VER` → `2026-10-11-006`, **`CACHE_VER` inchangé** (`2026-10-11-002` — la génération FAO ne bouge pas) ; compteur quotidien 006 (règle 00-entete l.17-21) ; badge **V0.1.3 inchangé**.

### `2026-10-11-007`

**Viewer usinage — le bouton de la barre passe à 3 ÉTATS pour garder les 3 versions de rendu (demande « on garde les 3 versions ») : `◈ réel` → `≈ lisse` → `◇ simple` → … . `◈ réel` = la surface NETTE aux cotes exactes (défaut de 003) ; `≈ lisse` = physique réelle inchangée (profil de fraise, carve R2, brut au corps) + surface DOUCE : le heightfield continu de la 002 — nœud = moyenne des 4 cellules adjacentes, normales lissées, murs de bord + fond — SUPPRIMÉ en 003 pour son flou d'une maille sur les traces, est RÉINTRODUIT en OPTION choisie (flou assumé, documenté) ; `◇ simple` = l'ancien rendu cylindre Ø / carve Ø/2 / colonnes / boîte. Correctif : restauration de `faoHFAddTri` / `faoViewerMatterHFBuild` / `faoViewerMatterHFUpdate` (tombstone 003 remplacé) ; nouvel état `faoViewerMode` + `faoViewerModeSet` — la PHYSIQUE (`faoViewerExact` = mode ≠ simple, lue par l'outil/le carve/le brut) est séparée du STYLE de SURFACE (`vw.smooth`) ; `faoViewerExactToggle` cycle les 3 états ; reel ↔ lisse = surface SEULE (outil, brut, temps et lecture préservés : pas de `toolSig=null`), simple ↔ réel/lisse = rebuild physique complet ; `faoViewerMatterEnable` branche `smooth` (mesh HF nommé `faoMatter`, rattrapage 0 → t via `faoViewerMatterKill` inchangé) ; `faoViewerMatterKill` garde `(!vw.mArr&&!vw.mH)` et branche `HFUpdate` (diff des nœuds moyennés + normales, `needsUpdate`) avant `WriteCol` ; `faoViewerExactBarUpdate` affiche libellés + tooltips des 3 états.**

Mesures — `tests/test_fao.cjs` bloc **015bis** reformulé au cycle 3 états : défaut réel (outil à gorges, `mArr`, `mH` null) ; bascule 1 → lisse (`faoViewerMode==='lisse'`, physique conservée : `toolSpin` intact — aucun rebuild, `mH` non-null / `mArr` null, grille de nœuds `NX = nx+1`, libellé `≈ lisse`, matière carvée visible : zMin < full après `Advance(30)`, `HFUpdate` diff seul : colonne descendue de 12 mm → delta nœuds > 0,01 puis restauration) ; bascule 2 → simple (cylindre, `mArr` 30 verts/col, `smooth=false`, libellé `◇ simple`) ; bascule 3 → retour réel (`mH` null, `smooth=false`, libellé `◈ réel`) ; fermeture = état libéré sur réel. Suite complète **74/74** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-11-007.html` (001-006 du 11/10 figés, non écrasés). Migration : `APP_VER` → `2026-10-11-007`, **`CACHE_VER` inchangé** (`2026-10-11-002` — viewer seul, la génération FAO ne bouge pas) ; compteur quotidien 007 (règle 00-entete l.17-21) ; badge **V0.1.3 → V0.1.4** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 10 mentions).

### `2026-10-12-001`

**Poche/Contour — correctif du « gap » pièce/usiné en laisses 0/0 (demande : « un décalage entre la pièce et la forme usinée quand les parois et le fond sont à 0 » ; diagnostic : le rayon de la fraise torique attaque au BON endroit — carve exact : parois à 0.000, arc R2 conforme à la formule au 1e-3 près). Cause racine : le repli d'entrée « RAMPE le long du 1er côté » (2026-10-08-006 poche, -007 contour) ne descend ce côté qu'en PROGRESSANT (z_niveau-1 → z_niveau), et le rectangle partagé qui suit démarre déjà du coin opposé (move dupliqué no-op) : le 1er côté n'était JAMAIS repris à plat à la cote finale. Résultat : une bande de matière laissée le long du MUR D'ENTRÉE, haute de la fraction d'ap restante (mesurée +1,67 mm à ap=5 sur Ø25 R2), rendue en vide entre le fond de la pièce et le fond usiné — masquée dès que axial > 0 (le fond nominal monte, d'où « visible à 0 »).**

Correctif — après la rampe, re-point à (ax,ay) À PLAT à z : le rectangle partagé referme alors le 1er côté à la cote exacte (`faoGenPocket` + repli de `faoGenContour` ; les entrées circulaires, qui arrivent à (ax,ay), étaient déjà justes). Deux lignes de génération, deux points de plus par niveau rampé (parcours de test : pocket 76 → 78, contour inchangé 9).

Mesures — `test_fao.cjs` : (a) moves — chaque niveau rampé (Z=20 et Z=15) a son move cut au coin SW (22.5, 22.5, z) et le rectangle repart en (77.5, 22.5, z) à plat, en `entry:'ramp'` forcé COMME en défaut auto (repli effectif sur plein) ; contour repli idem (5, 5, 0) ; (b) carve d'intégration (bloc **016g**, viewer complet, outil T6 Ø25 R2, poche 10..90×10..70 25→15 en 0/0) : fond intérieur + bande d'entrée **≤ 15,02** (avant correctif : 16,77). Suite complète **74/74** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-12-001.html` (001-007 du 11/10 figés, non écrasés). Migration : `APP_VER` → `2026-10-12-001`, **`CACHE_VER` → `2026-10-12-001`** (la génération de trajectoires change : poches et contours à repli rampe sont périmés, à régénérer une fois) ; compteur quotidien 001 (nouveau jour, règle 00-entete l.17-21) ; badge **V0.1.4 → V0.1.5** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 10 mentions).

### `2026-10-12-002`

**Finition géodésique — gap CONSTANT sur la surface + liaison par SPLINE TANGENTE (demande : « le gap est constant… on risque de dévier en Z… toutes au même écart » / « passer de l'une à l'autre via une spline… tangente aux 2 extrémités, façon Fusion 360 »). Avant : la finition géodésique (2026-10-04) utilisait deux champs distincts — iso-Z sur les faces en pente (chaque liaison à Z constant) et anneaux géodésiques sur les plateaux — donc l'écart entre traces variait en XY sur pente (pas un vrai gap constant) ; et les liaisons intra-zones se faisaient par lift vertical, sans tangence.**

Correctif — (1) UN SEUL champ géodésique (Dijkstra depuis le seed) extrait sur TOUTES les faces via un masque optionnel `mask` ajouté à `faoIsoSegs` (prime sur `flags`/`want`) : l'écart entre passes est constant SUR LA SURFACE (distance géodésique), pas en XY — sur pente les traces dérivent en Z, mais restent à `step` l'une de l'autre (l'horizontalité devient un résultat naturel sur les plateaux, plus une contrainte). `faoChainSegs` attache maintenant les longueurs d'arc (`chains.lens`) pour le filtre d'incohérence. (2) Séquence haut → bas → restes dans une seule opération : le champ principal depuis le seed demandé (top par défaut) ; puis, tant que >20 % des sommets restent non couverts (3 essais max), un seed local (sommet non couvert le plus éloigné) reprend avec `cover=1` — seules les chaînes majoritairement non couvertes sont émises, pas de doublon. Un filtre d'incohérence (`coherent`) abandonne une iso dont les fragments (arc < `max(step,D)`) pèsent > 60 % de la longueur totale — on bascule d'approche plutôt que de rattraper point par point. (3) Liaison intra-zone par SPLINE TANGENTE 3D (Hermite cubique `faoSplinePts`, extrémités forcées exactes, tangentes scalées bornées par chord/3 et 0,9×segment adjacent, 2 tentatives puis repli lift) — émission HYBRIDE : échantillon sur la matière (ptDist=0) = coupe G1 (désactivée si laisse>0), échantillon en air = rapide G0 ; validation par échantillon : jamais de matière au-dessus (plans strictement au-dessus de zmax de la zone), jamais sous la portée de coupe (Rc+0,5) dans l'air, jamais sous la bande [min,max] des extrémités. `faoGenGeoFinish` devient un générateur `faoGenGeoFinishIt` (drain sync équivalent, dispatch `faoOpMovesIt` en `yield*` pour l'aperçu progressif, comme l'ébauche 3D 005). (4) ztop/zbot bornent la SURFACE SOURCE par centroïd de face (garde la sémantique 004 : ztop=12 sur pente → surfaces ≤ 12 usinées, centre outil ≤ 12+Rc) ; sans ztop/zbot fourni, pas de masque (comportement 004 préservé).

Mesures — `test_fao3d.cjs` : (a) unit spline (`faoSplinePts`) : extremites exactes, tangente au départ/arrivée (dot ≈ 1) ; (b) gap constant sur pente SL : traces non horizontales (`badZ≥1`, liaisons à Z variable) ET écart géodésique constant — distance 3D minimale entre deux passes consecutive ≈ step 5 mm sur la majorité des tranches (`gOk≥60%`, 14 tranches mesurées, écart médian 1,71 mm sur trapèze) ; (c) ztop borné : `ztop=12` sur SL → coupe max 10,16 < 16 (test conservé) ; (d) splines : la liaison change le parcours (`on≠off`, plus de rapides 7>7), nombre de coupes inchange (liaisons volantes) ; laisse>0 → lift strictement inchange ; zone mono-chaîne → inchange ; (e) dispatch sans maillage : pas de plantage. Suite complète **74/74** ; `build.js --check`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-12-002` (la génération géodésique change : anciennes trajectoires finition périmées, à régénérer une fois) ; compteur quotidien 002 (règle 00-entete l.17-21) ; badge **V0.1.5 → V0.1.6** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 10 mentions).

### `2026-10-13-001`

**Crêtes Constantes — retours de finition (demandes : « le parcours est oblique, je le veux le plus parallèle possible de XY » / « les traces sur le plat continuent d'être // à celles des parois » / contact « du bout de la fraise au bout du rayon » / remontées ~5 mm à l'extrémité la plus proche / « des arcs suivant les plans XZ ou YZ » / zone d'usinage par esquisse, aussi sur Ébauche 3D). Avant : le champ géodésique unique (2026-10-12-002) faisait dériver les traces en Z sur pente (obliques, écart en géodésique pur) ; chaque liaison inter-chaînes remontait par travel/secu depuis l'about de la chaîne ; les entrées « circ » étaient des arcs XY (G17) ; la zone ne se délimitait qu'en rect/chaîne.**

Correctif — (1) séquence à 3 phases dans `faoGenGeoFinishIt` : iso-Z sur les faces en pente avec pas ADAPTIF `Δz = max(dzFloor, min(step, step·minSin))` (niveaux strictement horizontaux = parallèles à XY, écart constant SUR la surface ≈ step : rampe douce → niveaux Z serrés, mur vertical → Δz≈step) ; passes PARALLÈLES au contour sur les plateaux (direction = perpendiculaire à la normale XY dominante — PCA sur les faces de paroi, champ linéaire `u = dx·y − dy·x`, iso-lignes droites, pas = step) ; restes = seeds locaux + champ géodésique (≤3 essais, filtre `coherent` conservé). (2) `faoIsoSegs` : `mask` (zone + fenêtre Z) et `flags`/`want` se COMPOSENT (ET logique) ; `zoneAt` (limite d'op via `faoZoneCtx`) est injecté au dispatch et borne le masque des faces — faces hors zone exclues du champ, quelle que soit la fenêtre Z (avant : passes qui descendaient sous la face limitée quand zbot bas + parois du maillage). (3) contact ball/torique au viewer : `faoToolProfile(kind,cr,D,H)` normalise l'arc par le CORPS H (le groupe outil scale y=H) — sphère vraie (cr=D/2 → demi-boule de D/2 mm au lieu d'une pointe étirée par H/D), gorges posées juste au-dessus de l'arc (`arcH=cr/H`) ; sans H (tests/ancien) défaut H=D strictement inchangé. (4) remontées COURTES : colonnes de liaison par hauteur `segsFor`/`pathOKh` (cache par H, tranché à H−R) avec repli `travel` → `H = max(travel, min(secu, max(from.z, zmax)+5))` validé à sa propre altitude → `secu` en dernier (un saut à secu par programme, pas par liaison) ; orientation « extrémité la plus proche » du tracé suivant en tête de zone aussi (`ci>0 || (ci===0 && prevEnd)`) — fini le saut depuis l'about arbitraire (~40 mm). (5) entrées en arcs VERTICAUX (`varc`) : quart de cercle dans le plan `{u, Z}`, centre `(here.xy, here.z+ρ)` avec ρ = travel−here.z ≥ 0,5, validé par 6 échantillons de balayage (dégagement R−0,5), émis en G1 pur avec `ent:1` (`nA = max(8,min(48,ceil(ρ·3.2)))`, dernier point = `here` exact, `skip0`) — le post-G17 n'interprète que les arcs XY, l'arc XZ/YZ est donc balayé en lignes ; pied de fraise au-dessus de la surface tout du long, contact exact au tracé ; repli arc XY / hélice / rampe si invalide ; la spline inter-zones vise l'entrée A (arrivée tangente −Z). (6) splines INTER-ZONES : de la sortie de zone au début de la suivante (cible `varc` A, `circ` ou `here`) — les zones mono-chaîne sont reliées aussi (test PLN `on≠off`), repli lift court puis secu. (7) ZONE PAR ESQUISSE — 3e mode `limit.mode='sketch'`, injectée à la finition ET à l'Ébauche 3D : `faoSketchLoop(skId)` extrait la boucle XY monde avec les règles de la poche d'entrée (`faoEntreePoly` -005 : plan `|n.z|≥0.99`, contour extérieur UNIQUE sans îlot/trou/cercle, dédoublonnage bbox+aire, normalisation CCW, arcs balayés dans le bon sens) — la zone n'est JAMAIS devinée (repli `null` → fiche « Esquisse absente ou inutilisable … — zone NON appliquée ») ; sanitize whitelist exige `sk` + `loop` ensemble, le reste toléré comme la chaîne (le choix en cours survit à la régénération) ; `faoZoneCtx`/clip final/`faoLimitDrillPts`/labels `[limite]`⚠/warnings export traitent `chain||sketch` ; `faoSketchReplay` (appelé dans `buildDone` avant `faoChainReplay`) re-extrait à chaque rejeu : édition de l'esquisse → nouvelle boucle, esquisse perdue → `stale` + boucle conservée, restaurée → `stale` levé — comparaison de boucles CYCLIQUE `faoLoopSame` (rotation de départ admise, tol 1e-6, sinon rejeu infini) ; sélecteur d'esquisse dans la fiche op (`doc.sketches`, statut « Boucle de N pts », alertes visibles, rangée Outil/Marge) ; `limit2` en sketch volontairement NON supporté (purgé, asserté). (8) libellés : « Finition »/« Finition géod. » → « Crêtes Constantes » (bouton d'ajout, arbre, fiche, label de génération).

Mesures — `test_fao3d.cjs` reformulé : (a) pente SL — iso-Z `badZ===0` (aucune liaison à Z variable, l'ancien `badZ≥1` du géodésique pur devient l'inverse) ET écart surface ~step (`gOk≥60 %` des tranches dans 5±0,6 mm) ; (b) ztop borné conservé ; (c) remontées courtes — PLN `spline:false` : ≤2 rapides à secu (début + retrait final), liaison cut→r:1→r:1 < 30 mm (extrémité la plus proche) ; (d) arc vertical — `entry:'circ'`+`hasRrough` : ≥8 points `ent:1`, Δz>1 (quart de cercle en plan vertical), ZÉRO arc XY en entrée ; (e) splines PLN `on≠off` (liaison inter-zones active) ; (f) TW 3 zones compté par MOTIF cut→r:1→r:1 (height-agnostic), rapides secu bornés `≤ 2·zones+2`. `test_fao_barre3d.cjs` : libellés du bandeau d'ajout = « …Crêtes Constantes ». Nouveau `tests/test_fao_sketch_zone.cjs` (enregistré dans `run.cjs`) : extraction (aire/CCW, refus plan non horizontal / îlot / trou / cercle / 2 contours), sanitize (`sk`+`loop` ensemble, `limit2` sketch purgé), `faoZoneCtx` at/cross, `faoLimitDrillPts`, `faoOpLabel`, `faoOpSig` sans `stale`, `faoZoneCuts`, `faoSegClipper`, `faoSketchReplay` (édition → nouvelle boucle, perdu → stale conservé, restauré → stale levé), fiche UI (sélecteur, statut, alertes). Suite complète **75/75** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-13-001.html` (001-002 du 12/10 figés, non écrasés). Migration : `APP_VER` et `CACHE_VER` → `2026-10-13-001` (la génération finition change : anciennes trajectoires périmées, à régénérer une fois) ; compteur quotidien 001 (nouveau jour, règle 00-entete l.17-21) ; badge **V0.1.6 → V0.1.7** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 10 mentions).

### `2026-10-13-002`

**Crêtes Constantes — performance (demande : « la génération est vraiment longue… pas fluide du tout ») + ÎLOT PAR ESQUISSE (demande : « il me faut aussi le choix de l'esquisse sur la zone interne »). Avant : sur une pièce ~38k tris, une génération Crêtes Constantes prenait ~109 s (régénération après réglage comprise, ~5 s minimum) — la colonne de liaison `segsFor(H)` recomposait jusqu'à ~160 tranches planes PAR HAUTEUR SANS JAMAIS CACHER (`faoSliceCache` n'était initialisé que par le lot 2.5D : hors batch, chaque plan = coupe pleine du maillage → 17 001 coupes ≈ 2 min), `ptDistS` balayait la colonne empilée (dizaines de milliers de segments) en linéaire à chaque échantillon de liaison/spline/entrée, `faoDiscClear` avec `hr=0` testait 8 fois le MÊME point, les Z vertex de `faoShadowPlanes` étaient retrisés à chaque appel et les colonnes/hash rebâtis à chaque génération ; et l'îlot `limit2` n'acceptait ni rect ni chaîne… ni esquisse (purgé, asserté tel quel).**

Correctif perf — (1) `faoSliceZCached` : slot AUTO-INITIÉ par maillage (`faoSliceCache={mesh,map:{}}` au premier usage hors lot 2.5D, saut automatique dès qu'un autre maillage est utilisé ; le lot 2.5D le réinitialise explicitement comme avant) — `faoSliceZ` est pur, la mémoïsation est strictement équivalente : 17 001 coupes → ~300 calculs réels, le reste = frappes. (2) `ptDistS` via l'index Y+hash existant (`faoDiscIdx`/`faoDistSeg`) avec bornage `R+2` : TOUS les consommateurs ne comparent qu'à des seuils ≤ R (`>1e-9`, `≥need=R−0,5`, `min(R,·)`) — une distance > R+2 leur est strictement équivalente ; repli linéaire conservé sans index. (3) `faoDiscClear` : `hr=0` → 1 seul échantillon au lieu de 8 coïncidents. (4) Z vertex triés/dédups/cap 160 mémoïsés PAR MAILLAGE (`faoZvOf`, extrait de `faoShadowPlanes`) — 387 tris de 19k vertex par génération en moins. (5) Colonnes de liaison mémoïsées ENTRE générations (`faoColCache`, WeakMap maillage → Map clé `H−R|zmax` au µm, bornée 128 entrées) : régénérer après un réglage réutilise les mêmes tableaux → `faoDiscIdx`/`faoHashSegs` frappent à l'identique au lieu de rebâtir ~100 hash × dizaines de milliers de segments (~6 s). (6) `faoSliceZ` en chemins scalaires (mêmes cas de contact, même ordre, dédups < 1e-7) — sans tableaux intermédiaires ni closures par face. Mesures (harnais maillage 160×120, 19481 sommets / 38400 tris, outil D6) : 1er passage **109 s → 8,1 s** (dont `faoSliceZ` 3,3 s de coupes réelles incompressibles) ; **régénération : 5,3 s → 265 ms** (le cas interactif, entièrement servi par les caches croisés) ; pièces petites inchangées (TW 3 tours : 24 ms → 10 ms).

Correctif îlot esquisse — `limit2.mode='sketch'` supporté de bout en bout avec le MÊME contrat que la limite esquisse : sanitize (boucle `sk`+`loop` ensemble sinon purge, sinon `extra=0` + `side='out'` FORCÉE — règle outil de l'îlot inchangée) ; `faoLimitDrillPts`/`faoZoneCtx`/`faoOpMovesIt`/clip final traitent `chain||sketch` pour le lim2 (la coupe reste le complément de l'îlot dilaté r+marge via `faoLimInside`/`faoPolyCross`, composition ET/OR des deux frontières inchangée) ; `faoSketchReplay` re-extrait MAINTENANT limit ET limit2 (boucle `li=0..1`, édition → nouvelle boucle, esquisse perdue → `stale` + boucle conservée, restaurée → `stale` levé) ; warnings `faoPost` et libellé `[îlot]`⚠ couvrent le mode esquisse (loop ≥ 3 pts) ; `faoChainRematch`/`faoChainReplay` restent aveugles au sketch (pas d'ancres : comportement voulu) ; fiche UI : 4e option « Esquisse » dans le sélecteur Zone int. (bascule → `{mode:'sketch',sk:'',loop:[],closed:true,side:'out',extra:0}`, ancien choix conservé au retour) + sous-ligne miroir de la limite (sélecteur `doc.sketches`, statut « Îlot : boucle de N pts », alertes « îlot NON appliqué », stale « obsolète ») au-dessus de la rangée Marge.

Mesures — `test_fao_sketch_zone.cjs` : ligne « esquisse refusée en zone int » INVERSÉE (conserverie + `side='out'` forcé + `extra=0`, purge si `sk` non string) ; NOUVELLES sections 11 (îlot de bout en bout : ctx composé rect+sketch — dedans zone/hors îlot usinable, dans l'îlot NON, croisement des deux bords ; drill — trou dans l'esquisse exclu, hors îlot gardé ; `faoZoneCuts` — aucune coupe dans l'îlot dilaté, partie hors îlot usinée ; label `[îlot]`/⚠/<3 pts ; sig — boucle limit2 dans la clé ; `faoSketchReplay` limit2 — édition/perdu/restauré) et 12 (fiche UI — option Esquisse du sélecteur Zone int., bascule → îlot esquisse `sk` vide + `side:'out'`, sélecteur d'esquisse, statut « Îlot : boucle de », alertes vide/stale/obsolète). Suite complète **75/75** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-13-002.html` (001 du 13/10 figé, non écrasé). Migration : `APP_VER` et `CACHE_VER` → `2026-10-13-002` (moteur de génération et caches de parcours changés : anciennes trajectoires périmées, à régénérer une fois) ; compteur quotidien 002 (règle 00-entete l.17-21) ; badge **V0.1.7 → V0.1.8** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 10 mentions).

### `2026-10-13-003`

**Crêtes Constantes — traces rouges (demande : « il faut travailler sur les traces rouges. Je n'en veux presque plus, juste le nécessaire » / « Voici ce que fait Fusion360 entre les traces… J'aimerais ce type de transitions »). Avant : chaque liaison intra-zones était échantillonnée à 0,5 mm et chaque échantillon en l'air devenait un G0 séparé — une simple liaison de 40 mm = 81 lignes rouges (732 rapides sur un plateau 60×40 !) ; la sélection d'orientation mesurait la distance vers `pts[pk]` (~2·D le long de la chaîne) — sur chaînes grossièrement échantillonnées pk tombait à l'opposé du début et le zigzag fabriquait des diagonales de 40 mm au lieu du saut de 6 mm entre passes voisines ; sur pièce dense (houle), toutes les liaisons inter-zones échouaient (`pathOK` extrémités dans la colonne travel + repli H tronqué par les pics d'une autre zone via `segsFor` global) et retombaient en vol à secu (46,4 km de rouges à 45 mm sur une pièce 38k).**

Correctif — (1) FUSION des échantillons air : un run consécutif de G0 devient quelques rapides DIRECTS (ajustement gourmand `emitMerged` — corde la plus longue possible, re-validée au gabarit 0,5 mm `chordOK` ET bornée à 0,5 mm de la courbe `devOK` : distance point/segment ≤ 0,25) — les liaisons droites s'aplatissent en 1 G0, les courbes gardent leur forme ; émission hybride inchangée (sur matière = coupe G1). (2) Métrique de candidat vers le VRAI point d'attaque (`len = dist(from, I.hx||pts[0])` au lieu de `dist(from, I.pt)` — `pts[pk]` inversait le sens) + `pk` borné au dernier point AVANT 2·D avec insertion d'un point interpolé à 2·D sur chaînes grossièrement échantillonnées (`candLink`, point collinéaire, tracé de coupe identique) — zigzag à sauts de 6 mm au lieu de diagonales de 40 mm, lift d'attaque le long de la chaîne. (3) RAMP-SPLINE (demande « transitions type Fusion ») : 3ᵉ essai avant repli `splineEmit` — tangentes XY conservées (bulbe tangent aux deux passes), composante Z nulle (smoothstep entre les cotes, strictement dans [min,max] → creux sous zLo éliminé) — la liaison coupante tangente à la cote de coupe devient verte continue de bout en bout (atterrissage exact au début de chaîne) ; 4ᵉ essai SPLINE PLATE à travel (`if(zP>=secu-1e-9)break`) + `ramp0` pour la descente le long du 1er tronçon (jamais plongée) ; replis lift : 2ᵉ échelon `H2 = max(from.z, zmax GLOBAL)+5` (`zmax` global mesh :10417 — colonne vide au-dessus de tout le maillage, `segsFor` lit le maillage entier, les pics d'une autre zone tronquaient H1) avant secu. (4) Échantillons de spline étiquetés `tr:1` (transition) — post/aperçu inchangés (palette coupe vert/rapides rouge conservée), les tests distinguent passes iso-Z et liaisons coupantes. (5) AFFICHAGE des rapides — bouton `#faoRapBtn` cycle « Rapides ✓ / ~ / ✕ » (`faoViewerRap` 'tous' 30 % / 'fondu' 8 % / 'masque') dans la barre Exécution (r2) après `#faoVwBtn`, recoloration seule via `faoRefreshPreview` (lecture seule, aucune régénération), état persisté `localStorage['minifusion_faoRap']`, label via `faoViewerRapLabel`.

Mesures — harnais diag (ball D8, secu 45, quatre cas) : PLN plateau 60×40 **732 → 11 rapides** (11 sauts de 6 mm + approche/retrait) ; TW 3 tours **1270 → 58** (dont secu résiduel = survol obligatoire de la tour centrale z=40, validé) ; pente SL 33 → 22 ; pièce houle 38k : rapides 6766 → **4717** et **vols à secu 46,4 km → 51 mm** (31 rapides = début/fin, le reste = déplacements inter-zones réels à travel — le nécessaire) ; coupes +5/+7/+6 sur PLN/SL/TW (transitions coupantes tangentes = vertes). `test_fao3d.cjs` : `rapOn>rapOff` INVERSÉ (`rapOn<=rapOff` — la fusion rend la spline MOINS de rapides que le lift, l'ancien sens était l'effet attendu du lift pré-fusion) ; iso-Z reformulé — regroupement qui exclut `tr:1` + tolérance 2 mm sur le z des passes (`zchk`, spikes d'isocourbe préexistants sur mesh grossier désormais visibles car la transition atterrit à plat, un retour adaptatif ≥3 mm serait compté) ; liaison cut→r:1→r:1 bornée par le point interpolé à 2·D (< 30 mm rétabli). Suite complète **75/75** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-13-003.html` (001-002 du 13/10 figés, non écrasés). Migration : `APP_VER` et `CACHE_VER` → `2026-10-13-003` (génération de liaisons changée : anciennes trajectoires périmées, à régénérer une fois) ; compteur quotidien 003 (règle 00-entete l.17-21) ; badge **V0.1.8 → V0.1.9** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 10 mentions).

### `2026-10-13-004`

**Crêtes Constantes — TOUR COMPLET sur plateau + LIGNE DROITE prioritaire (demandes : « pourquoi faire les transitions sur les endroits les plus compliqués ? Les lignes droites c'est bien mieux ! » / « pourquoi aussi ne pas faire un tour complet ? Cela évite les va et vient en rapide… tu fais en sorte de partir d'un point pour y revenir puis tu passes à l'autre ». Avant : les passes de plateau étaient des LIGNES PARALLÈLES (champ linéaire `u = dx·y − dy·x`, iso-lignes droites // au contour) — chaque fin de ligne nécessitait un saut (lift/spline/rapide) vers le début de la suivante : c'est le va-et-vient en rapide que la fusion G0 de -003 ne pouvait pas supprimer (le saut reste un G0, seulement moins fragmenté) ; et les liaisons intra-zones essayaient la SPLINE en premier, réservant la ligne droite aux cas triviaux.**

Correctif — (1) TOUR COMPLET (contour-offset) : le champ des plateaux devient un GÉODÉSIQUE MULTI-SOURCES depuis la FRONTIÈRE du plateau — `faoDijkstra` généralisé (source unique OU tableau de graines + adjacence optionnelle `adjIn`) ; graines = sommets à la fois plates et non-plates (rive où le plateau rencontre la paroi) + sommets sur arêtes frontière du maillage (arête utilisée par 1 seule face — un plateau qui va jusqu'au bord de la pièce n'a pas de rive interne) ; Dijkstra restreint au sous-graphe des FACES PLATES (`flatAdj`) → la distance est mesurée DANS le plateau (offset 2D), jamais à travers les parois. Iso-lignes à `k·step` depuis la frontière = BOUCLES FERMÉES concentriques — chaque passe = un TOUR COMPLET du contour (partir d'un point, y revenir), reliée à la suivante par un court décalage radial : zéro va-et-vient. Repli champ linéaire historique si le maillage est trop grossier pour l'offset (`dmaxF ≤ step` : 2 triangles sans sommet intérieur — le marching-triangles n'a pas besoin de nœuds, le géodésique si) — PLN/TW des tests inchangés. (2) LIGNE DROITE PRIORITAIRE : nouvel `straightEmit` (même contrat de validation que la spline — `z ≥ zLo`, pas de matière AU-DESSUS, air jamais sous portée de coupe, émission hybride fusionnée G1/G0 `tr:1`) ; dans les liaisons intra-zones ET inter-zones, la ligne droite est essayée EN PREMIER (`straightEmit`), la spline tangente seulement si la ligne est bloquée (obstacle), lift/travel/secu en dernier repli — respecte `o.spline===false` (échappatoire tests). Entrées `varc`/`circ`/hélice inchangées (arcs dédiés, pas de ligne droite).

Mesures — harnais diag (ball D8, secu 45) : pièce houle 38k : rapides **4717 → 4241** (−10 %), longueur rapide 38,6 → 35,5 km, runs air 814 → 562 (−31 %), longueur air 5,8 → 4,5 km ; secu31 rapides inchangés (survol de crêtes, validé). Vérification « tour complet » sur bloc à plateau plat subdivisé (16×12 + 4 parois) : **3 boucles fermées** détectées (anneaux concentriques offsetés de 6 mm de la rive — le tracé suit le contour : x=6 de y=50→6 puis y=6 vers la droite = anneau), 5 chaînes ouvertes = passes iso-Z sur les parois. Perf : régénération ~300 ms (Dijkstra multi-sources sur sous-graphe plat seul, mémoïsations -002 inchangées). `test_fao3d.cjs` inchangé (75/75) — PLN 2-triangles → repli linéaire, `spline:false` désactive aussi `straightEmit` (comparaison on/off préservée). Suite complète **75/75** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-13-004.html` (001-003 du 13/10 figés, non écrasés). Migration : `APP_VER` et `CACHE_VER` → `2026-10-13-004` (génération de plateau et liaisons changée : anciennes trajectoires périmées, à régénérer une fois) ; compteur quotidien 004 (règle 00-entete l.17-21) ; badge **V0.1.9 → V0.1.10** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 10 mentions).

### `2026-10-13-005`

**Crêtes Constantes — plateau CONCENTRIQUE enfin propre + pentes SANS LIFT (demandes : « j'aimerais rentrer, faire un tour complet, puis me déplacer vers la trace inférieure suivante, sans remontées en Z » / « Il faut que tu arrives à faire ces traces concentriques dont tu as parlé ! »). Avant : les iso géodésiques du plateau produisaient la vraie boucle concentriques MAIS aussi des chaînes DÉGÉNÉRÉES (lens=0 — artefacts d'iso au ras des sommets sur maillage régulier) émises comme zones séparées à 1 segment → 29 rapides parasites au plateau pour 3 vraies boucles ; et sur les pentes, quand `hx` (point d'attaque clair) était défini, la branche `else if(!hx)` sautait `straightEmit`/`splineEmit` → LIFT systématique à chaque transition de niveau iso-Z.**

Correctif — (1) FILTRE chaînes dégénérées dans `emitLevel` : rejet `lens < max(1e-6, step×0,05)` avant `addLevel` — les fragments zéro ne deviennent plus des zones à 1 segment reliées par un rapide parasite. (2) LIAISONS INTER/INTRA-ZONES : la condition `else if(!hx)` devient `else` — ligne droite (`straightEmit`) puis spline (`splineEmit`) TOUJOURS essayées, même quand `hx` est défini ; `hx` ne sert plus qu'au repli hélice (descente d'air) si les deux échecs. (3) RESTRUCTURATION chaîne d'entrée : le test `linkSpline&&startZ<=here.z` (atterrissage exact au début de chaîne) est déplacé AVANT le test `hx` — sinon l'hélice s'exécutait même quand la liaison avait déjà atterri, forçant un lift inutile.

Mesures — harnais diag (ball D8, secu 45) : pièce houle 38k : rapides **4241 → 2889** (−32 %), longueur rapide **35,5 → 11,6 km** (−67 %) ; SL/PLN/TW inchangés (maillages simples sans les artefacts). Trapèze soudé (plateau 40×30 + 4 pentes) : plateau = **3 boucles concentriques fermées** (offsets 5/10/15 mm, lens 95/55/15), zéro chaîne dégénérée ; pentes = 7 transitions `straightEmit` (`tr:1`) sans lift — chaque niveau iso-Z est une boucle fermée reliée par une descente directe. Suite complète **75/75** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-13-005.html` (001-004 du 13/10 figés). Migration : `APP_VER` et `CACHE_VER` → `2026-10-13-005` (filtrage chaînes + liaisons changées) ; compteur quotidien 005 ; badge **V0.1.10 → V0.1.11** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 10 mentions).

### `2026-10-13-006`

**Crêtes Constantes — perf + pentes en SPLINE + plateau sans coherent (demandes : « Voici le rendu? Cela te convient? Pas moi ! » / « Et puis c'est long à générer ! »). Avant : les liaisons inter-niveaux sur pente utilisaient `straightEmit` EN PREMIER — la corde droite coupe en DIAGONALE au-dessus de la surface (convexe) → longue ligne rouge `r:1` visible sur tout le tracé ; `candLink` testait TOUS les points de départ × 2 sens pour chaque chaîne fermée (O(n²) par liaison — lent sur pièces denses) ; `coherent()` rejetait les anneaux concentriques du plateau fragmentés en arcs < max(step,D) sur maillage grossier → fond plat vide.**

Correctif — (1) SPLINE D'ABORD SUR PENTE : dans les liaisons inter ET intra-zones, si `|ΔZ| > max(0,1, step×0,15)` entre les bouts, `splineEmit` est essayé AVANT `straightEmit` — la spline (smoothstep Z, tangente aux deux passes) suit la surface au lieu de couper en diagonale dans l'air ; la ligne droite reste le repli si la spline échoue ; même logique sur les deux branches. (2) FENÊTRE de candidats `candLink` : au lieu de tous les points × 2 sens (O(n²)), on cherche le point le plus proche de `from` puis une fenêtre de ±W points (W = min(24, max(4, n/6))) — O(n·W) ; qualité de sélection préservée (le point le plus proche est toujours testé). (3) `coherent()` ASSOUMPI sur le plateau (`want=1`) : les anneaux concentriques d'un maillage grossier sont légitimement fragmentés, le filtre 60 % les rejetait tous → fond plat vide ; le filtre reste actif sur les pentes (`want=0/null`).

Mesures — harnais diag (ball D8, secu 45) : pièce houle 38k : rapides **2889 → 2818** (−2 %), longueur rapide 11,6 km inchangée (le gain est sur les DIAGONALES visibles, pas sur le compteur) ; perf maillage 39k triangles (cavité + bosses + poche) : **355 ms**, 13 116 moves, 130 transitions air (209 mm) — les liaisons pentes sont des splines courtes au lieu de diagonales longues. Trapèze soudé : plateau = 3 boucles concentriques (39/25/11 pts) inchangées, pentes = 7 contours + 7 liaisons sans lift. Suite complète **75/75** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-13-006.html` NON produit — 006 jamais livré seul, intégré à `2026-10-13-007`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-13-006` (liaisons pentes + candidats changés) ; compteur quotidien 006 ; badge **V0.1.11 → V0.1.12** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`, 10 mentions).

### `2026-10-13-007`

**Crêtes Constantes — sens de passe, trajectoire Parallèle, pentes géodésiques, palette Fusion, `#MSG` Fagor (rétro-ingénierie cav.txt) + correctifs de revue.**

Nouveautés — (1) SENS DE PASSE sur la finition géodésique : `op.sens` = `'bidir'` (défaut à la création, documents anciens inclus : alternance du sens de coupe) ou `'avalant'` (proximité sans alternance, ordre haut→bas) ; sanitize étendu à `geofinish`. (2) TRAJECTOIRE `op.traj='parallel'` : passes 3D parallèles à pas constant (iso-lignes de la coordonnée perpendiculaire au sens de passe), continues à travers bosses et parois ; DIRECTION `op.pdir` = auto (axe long) / X / Y / angle `op.pdirAng` (snap cardinal exact). (3) PENTES en iso GÉODÉSIQUES (Dijkstra restreint aux pentes + rives) : espacement SUR la surface exact, plus d'adaptation sinθ. (4) Tag de niveau par zone (`slope`/`plate`/`par`), diag embarqué `op.geoDiag` affiché dans la fiche (exclu de `faoOpSig`). (5) Aperçu : coupe BLEUE, rapides ORANGE, plongées/entrées VERTES. (6) Post Fagor : `#MSG["libellé op"]` ASCII par opération, `#MSG[""]` en fin de programme.

Correctifs de revue — (a) ÎLOT (`limit2` chaîne/esquisse) : la garantie revient à **D/2** quel que soit l'outil (zone ctx + clip final) — le rayon 0 du géofinish boule/torique laissait le corps entamer l'îlot de D/2 ; la limite extérieure garde la pointe au contour ; le rect passait déjà par `faoLimit2R(D)`. (b) Fiche : Direction/Angle° MASQUÉS hors trajectoire Parallèle ; saisir un angle bascule aussi le sélecteur sur « Angle… ». (c) Sanitize : `op.traj` ne survit que `'parallel'` sur `geofinish`, purgé ailleurs. (d) `faoOpLabel` remis en forme.

Suite complète **75/75** ; `build.js --check` ; snapshot `Backup/fusion_mvp_2026-10-13-007.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-13-007` (génération finition changée : trajectoires périmées à régénérer une fois) ; compteur quotidien 007 ; badge **V0.1.12 → V0.1.13** (`src/96-bandeau-groupes.js` + `tests/test_prodver_badge.cjs`).

### `2026-10-14-001`

**Crêtes Constantes FAÇON FUSION 360 — nouvel algorithme (`src/89-fao-cretes.js`, trajectoire `op.traj='scallop'`, défaut à la création) (demande : « analyse cette image, cav.txt et Cavité Usinage.miniFusion pour reproduire le même parcours … le bon algorithme qui saura reproduire cet exemple à d'autres types de formes »).** Analyse complète dans `docs/cretes-constantes/README.md`.

Rétro-ingénierie de `Exemples/cav.txt` (Fusion 360, boule D6, pas 1) : 7 blocs ; 30 anneaux FERMÉS depuis le bord de l'îlot (offsets exacts : périmètre +2π par anneau), tous horaires ; 24 anneaux FERMÉS depuis le bord haut, anti-horaires ; 4 zones restantes en LENTILLES concentriques (240 → 28 mm) ; côté usiné toujours à droite (avalant, AUCUNE alternance : la lecture « sens alterné » du 007 était fausse) ; liaisons en S d'environ 0,75·D au contact ; entrées et sorties en quart de cercle vertical ; écart mesuré sur la surface du CENTRE OUTIL (bord haut 49,86 → 49,41 → 48,69 …).

Algorithme : région = contacts dont la position outil est dans la zone (limite ∧ ¬îlot, tolérance 0,05 mm sur arête vive), fenêtre Z, normale non tournée vers le bas ; maillage raffiné (arêtes ≤ ~pas, budget 160k triangles, normales lissées PAR NAPPE, rupture > 35°) ; fronts = composantes du bord (coupé par dichotomie) ; distance géodésique par front en FAST MARCHING (onde plane par triangle, angles droits admis) mesurée sur la surface du centre outil ; anneaux à k·pas tant qu'ils restent FERMÉS et dans leur TERRITOIRE (Voronoï géodésique : les fronts se rencontrent à mi-chemin) ; restes d_L = min(d_k − couvert_k) en boucles à Δ = Mx/(n+½) ≤ pas ; positions outil XY = contact + offset (torique : axe décalé de D/2 − r), lissage gaussien adaptatif (σ 0,8 → 2 mm si bruit d'arête vive), Z par DESCENTE OUTIL (boule exacte, torique par 24 boules + disque, droite disque) : aucune surcoupe ; séquences par groupe avec disponibilité « mères faites » (on vide un nid avant d'aller ailleurs), liaisons en S Hermite au contact, sinon arc de sortie → saut local (+5 au-dessus de la matière du trajet) → arc d'entrée.

Résultat sur la cavité : 2 fronts, 24 + 24 anneaux, ~40 boucles de reste, 14-16 séquences, ~2 s en Node (0,7 s dans le navigateur) ; bord haut à x=0 identique à Fusion au centième (60,55/49,85 · 59,69/49,40 · 58,99/48,65 …). Écart connu : l'îlot de l'op du document (66×26,5, marge −5, garde D/2) exclut |x|<64, Fusion part de 58,9 — réglage de l'op.

Intégration : dispatch `faoOpMovesIt` (`op.traj==='scallop'` → `faoGenScallopIt`), clip/garde-fou de zone sautés pour cette trajectoire (la zone est la région du générateur ; le re-clip couperait les arcs tangents au bord) ; sanitize `traj` ∈ {parallel, scallop} ; fiche : option « Crêtes constantes · offsets des bords » en tête, diag « N bord(s) · anneaux a/b · boucles de reste · séquences · ms » ; défauts `geofinish` → `traj:'scallop', sens:'avalant'`. Performance : `faoDistToPoly` sans `Math.hypot` par segment (×16 sur le test de zone, profite aussi aux clips existants).

Tests : nouveau `tests/test_fao_cretes.cjs` (cuvette synthétique : 2 fronts, écart entre anneaux = 1,00 mm sur le fond, aucune surcoupe > 0,02, rapides au-dessus de la matière, sens horaire/anti-horaire, séquences ; torique sans surcoupe ; droite refusée sur pente ; laisse ; FMM plan exact et source ponctuelle < 10 % (Dijkstra 41 %) ; descente outil ; défauts/sanitize/sig ; cavité réelle `tests/fixtures/cavite_usinage_mesh.json` + `cavite_usinage_op.json`) ; `test_fao_sens` : défaut de création `avalant` + `scallop`. Données de référence versionnées : `Exemples/cav.txt`, `Exemples/Cavité Usinage.miniFusion`, `Exemples/Cavité.step`, `docs/cretes-constantes/`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-001` ; badge **V0.1.13 → V0.1.14**.

### `2026-10-14-002`

**Crêtes Constantes façon Fusion — REFONTE sur la surface outil (retours : « les parcours descendent anormalement en haut des 4 faces » / « avec un pas à 0,35 il y a des manques … trop d'oscillations, ceux de Fusion sont plus linéaires »).**

Constats mesurés : (1) bord haut, écart compté sur la PIÈCE → saut de 2,2 mm en Z sur l'arrondi convexe (Fusion compte sur la surface du centre outil : 49,86 → 49,41 → 48,69) ; (2) au pas de 0,35, manques en anneau au PIED des parois et autour des bosses : la conversion contact + normale·R se REPLIE dans un creux plus serré que l'outil (passes entassées puis trou) ; (3) oscillations : bruit des normales du maillage et ambiguïté des arêtes vives ; (4) manque résiduel à la rencontre des fronts : l'iso du MINIMUM interpolée aux nœuds écrasait son pli (bande de 0,85 mm sur paroi à 65° = 0,36 mm en XY).

Correctifs (`src/89-fao-cretes.js`) : tout le calcul passe sur la SURFACE OUTIL — grille XY (~0,7·pas, ≤ 300 000 nœuds dans la zone), Z = descente outil exacte, région = position outil dans la zone (test de zone direct, plus de tolérance d'arête vive ni de normales), distance géodésique FMM sur cette surface (métrique Fusion), points d'iso → Z exact par descente (recul vers le bas de la maille sur falaise) ; restes par iso EXACTE du minimum par triangle (`faoScIsoMin`, cellules à champ unique, raccords par clés d'arête et de pli) ; orientation des segments d'iso TOPOLOGIQUE (un test géométrique rompait le chaînage sur les segments de longueur nulle — iso passant par un nœud, fréquent sur grille régulière) ; fragments d'iso < max(3·pas, 2 mm) ignorés (une miette ouverte arrêtait tout le front) ; descente outil réécrite à plat (primitives uniques sommets/arêtes/facettes, typées, triées Z↓ par cellule de D/4, sans allocation : ×2,5) ; recherche du bord sans descente quand la fenêtre Z ne coupe rien ; raffinement et normales par nappe supprimés.

Mesures cavité : bord haut 60,51/49,84 · 59,65/49,37 · 59,01/48,69 · 58,51/47,71 (Fusion 60,60/49,86 · 59,70/49,41 · 59,01/48,69 · 58,55/47,80) ; pas 0,35 : profil à x = 20 espacé de 0,35 du fond au bord, manques > 0,75 pas 0,72 % → 0,27 % (traits fins au centre des lentilles, limite du remplissage par niveaux), > 1,5 pas 0,11 % → 0 % ; durée pas 0,35 12,6 s → 5,5 s, pas 1 2,0 → 1,1 s. Tests : `test_fao_cretes` + couverture au pas 0,5 sur la cuvette (< 1 % au-delà de 0,75 pas, 0 au-delà de 1,5) ; doc `docs/cretes-constantes/` mise à jour (carte de couverture, bosse au pas fin). Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-14-002.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-002` ; badge **V0.1.14 → V0.1.15**.

### `2026-10-14-003`

**Iso-Z SUPPRIMÉ, Crêtes constantes en GLISSEMENTS au contact, pointes des lentilles finies (demandes : « La fonction ISO-Z ne sert plus à rien. On l'enlève complètement. » / « Je préfère pour les crêtes constantes des glissements entre traces que des remontées et nouvelles entrées. » / « Pour ces zones qui semblent manquer, peut-être peux-tu aller finir plus pointu, un peu comme le fait Fusion360 »).**

(1) **Iso-Z supprimé.** L'option « Iso-Z · niveaux horizontaux » disparaît de la fiche. Dans `faoGenGeoFinishIt`, les phases pentes (iso géodésiques + anneau final à zbot), plateaux (anneaux concentriques + repli linéaire) et restes sont retirées : le générateur ne fait plus que les profils **Parallèle**. Les aides mortes `faoAdjacency`, `faoDijkstra`, `faoSeedTop` et `faoSeedBottom` sont supprimées, ainsi que le champ « départ » (`op.seed`). Sanitise : `traj` absent ou `'iso'` (documents antérieurs) → `'scallop'`, et `seed` est purgé. (2) **Glissements** (`src/89-fao-cretes.js`). D'une séquence à la suivante, l'outil reste au contact au lieu de faire arc de sortie, saut local et arc d'entrée. Le chemin le plus court dans la région est cherché par A* 8-connexe sur la grille de la surface outil (coût = longueur 3D), puis tendu par raccourcis visibles, avec des raccords Hermite tangents quand le trajet est direct. Z = descente outil, et un segment dont le quart, la moitié ou les trois quarts passeraient sous la surface est recoupé (falaise : montée quasi verticale). Nouveau champ **Glissement** (`op.stayMax`, 100 mm par défaut ; 0 = toujours remonter). Les liaisons en S entre anneaux passent par la même vérification : il n'y a plus de surcoupe de liaison (0,013 à 0,027 mm auparavant). (3) **Pointes**. L'offset intérieur d'un coin de demi-angle α recule de Δ/sin α, et les lentilles laissaient des triangles non finis au pied des bosses. À chaque coin aigu d'une boucle de reste (déviation > 86°), l'outil fait un aller-retour le long de la crête du champ de reste (maximum transverse de min_k(d_k − couvert_k)) jusqu'à d_L = iso − Δ/2. Diag fiche : glissements, remontées et pointes.

Mesures cavité : pas 1 : 22 séquences, **21 glissements, 0 remontée** (auparavant 21 sauts), 51 pointes, 1,3 s. Pas 0,5 : 49 glissements, 0 remontée ; manques > 0,55 pas 0,33 % → 0,13 %, > 0,75 pas 0,17 % → 0,04 %. Pas 0,35 : 65 glissements, 0 remontée ; > 0,75 pas 0,27 % → 0,08 % ; 5,9 s. Tests : `test_fao_cretes` (cuvette : glissements sans remontée, 3 rapides, stayMax 0 → remontées ; sanitise iso/absent → scallop, seed purgé, stayMax ; cavité : glissements dans la zone, pointes) ; `test_fao_sens` (sens testé sur Crêtes constantes) ; `test_fao3d` (tests Iso-Z retirés, finition = profils parallèles). Doc `docs/cretes-constantes/` (étapes 7 et 9, image des pointes). Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-14-003.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-003` ; badge **V0.1.15 → V0.1.16**.

### `2026-10-14-004`

**« Crêtes Constantes » devient « Finition » ; POCHE 2.5D adaptative et CONTOUR 2.5D sur arêtes du modèle (demande : « Surfaçage, Ébauche 3D et Crêtes Constantes (que l'on va appeler "Finition") fonctionnent. Il reste à traiter comme il se doit les poches 2.5D, les Contour 2.5D » ; choix : géométrie = arêtes du modèle, poche trochoïdale/adaptative, contour avec côté auto, passes radiales, entrées/sorties tangentes, attaches).**

(1) **Renommage** : barre « + Finition », titre de fiche et libellé ; la trajectoire garde le nom « Crêtes constantes ». (2) **Poche adaptative** (`op.strat='adaptive'`, défaut à la création). Le bord de la poche est une chaîne d'arêtes du modèle (`op.limit`, outil entier dedans). Le vidage passe par le moteur de l'Ébauche 3D : pelage au petit pas, hélices, trochoïdes dans les goulets, fonds détectés ; les bossages intérieurs sont des îlots automatiques (matière du solide). La validation de la chaîne fixe Haut = dessus du brut et Bas = fond détecté sous la boucle (`faoPocketFloor`). Sans bord, aucune coupe (jamais tout le brut). La fiche est celle de l'Ébauche 3D, précédée d'une section « Bord de la poche ». Les poches rectangle des documents antérieurs (sans `strat`) sont inchangées. Le cache est lié au solide (`faoMeshOp`). (3) **Correctif du moteur d'ébauche** : un candidat d'hélice au centre d'un îlot plus large que le disque de l'hélice passait `faoDiscClear` (aucun mur ne coupe le disque), et l'hélice forait l'îlot (pièce test : 18 → 13 mm dans le bossage). Le candidat est maintenant rejeté par la parité de l'ombre (`faoShapeInside`) ; cela vaut aussi pour l'Ébauche 3D. (4) **Contour sur profil** (`op.strat='profil'`, nouveau `src/89-fao-contour.js`, `faoGenContourProfil`). Le profil est une chaîne d'arêtes (bas de la paroi : Bas = arête la plus basse, Haut = dessus du brut). Le côté est automatique par parité de la section à mi-hauteur (bossage → extérieur, poche → intérieur), forçable. Les passes latérales vont de la plus éloignée vers la paroi (`nR`, `ae`), les passes en Z se font à la surépaisseur `fin`, puis une finition à pleine hauteur. Sens avalant = matière à droite (horaire autour d'un bossage, trigo dans une poche), ou opposition. Entrée et sortie se font en quart de cercle tangent côté libre (rayon réduit s'il touche le profil), avec recouvrement. Attaches : `tabN` ponts de largeur `tabW` et hauteur `tabH`, l'outil passe par-dessus avec des marches verticales au point de bascule (dichotomie). Pas de re-clip par la zone. Fiche propre : Profil, Hauteurs, Passes, Côté et sens, Entrée/sortie, Attaches, Matière à laisser. Les contours rectangle antérieurs sont inchangés.

Tests : nouveaux `test_fao_poche` (fond auto, outil dedans, îlot épargné, aucune surcoupe du solide, fond atteint à la laisse et entièrement balayé, sans bord = rien, poche rectangle historique, défauts, sanitise, libellé, cache) et `test_fao_contour` (côté auto ext/int, d min = r, niveaux + finition, passes radiales, sens avalant/opposition, arcs côté libre, attaches, forçage, dispatch sans re-clip, contour rectangle historique) ; `test_fao_barre3d` (« Finition »). Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-14-004.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-004` ; badge **V0.1.16 → V0.1.17**.

### `2026-10-14-005`

**Ébauche 3D (et poche adaptative) : glissement au contact SEULEMENT pour passer à la passe voisine (demande : « Ébauche 3D, je ne veux des glissements que quand on change d'un pas. Après c'est du rapide ! Sinon, on fait des traces involontaires ! »).**

Avant, toute liaison sûre de moins de 30 mm (`faoRapideMin`) restait un G1 à la cote. Après l'entrée du niveau, les liaisons « de coupe » (`linkCutOK`, chemins en L, accostage par le milieu `midEnter`) restaient même sur le plan **sans limite de longueur** : elles laissaient des traces en travers du fond déjà usiné. Désormais, dans `faoRoughAdaptiveLevel` et `faoSpiralLevel`, une liaison n'est un glissement que si sa longueur est ≤ **1,5 × le pas latéral** (`linkMax` : pas de pelage `aeA` en conventionnel, pas de spirale en escargot). Au-delà, l'outil lève, se déplace en rapide et rentre par la cascade d'entrée habituelle (arc tangent, plongée sur zone balayée, hélice). Sont concernés : `linkTo`, la liaison d'entrée courte, les liaisons de coupe après entrée, `midEnter` (1) et (2), l'accostage d'arc et l'arrivée sur le vide. Les bandes voisines (un pas) restent enchaînées au contact.

Mesures sur la cavité (Ébauche 3D du document, escargot, ae 6,3) : rapides 340 → 558, entrées 240 → 341, trajet rapide 9,7 → 18,0 m ; durée de calcul inchangée (73 s). Sur le niveau le plus chargé, les traces en travers disparaissent ; seules restent les liaisons vers la passe voisine. Tests : `test_fao3d` (seuils « stay-down » de 006 remplacés : entrées ≤ 200 et rapides ≤ 400 sur le canal, adaptatif ≤ 150 ; contrôles de niveau fin et de rayon d'arrondi hors mouvements d'entrée). Suite complète, `build.js --check` ; pas de snapshot séparé (livré avec 006 dans le même commit). Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-005` ; badge **V0.1.17 → V0.1.18**.

### `2026-10-14-006`

**Transitions entre traces en VERT et épaisses ; Finition : transitions SEULEMENT entre deux traces au pas (demandes : « J'aimerais que les transitions entre traces soient faites en Vert, comme pour la plongée et changer leur épaisseur, un poil plus que l'actuel, comme pour les rapides. Ensuite, il ne faut pas remonter d'une position éloignée en passant par les transitions, mais par remontée en Z rapide et aller à la nouvelle entrée. Les transitions sont entre 2 traces égales au pas défini, pas plus ! »).**

(1) **Affichage** : les transitions (`m.tr`, liaisons au contact) passent dans le groupe vert des plongées et entrées (`faoSegSplit`). WebGL trace les lignes à 1 px quelle que soit `linewidth` : rapides, plongées et transitions sont désormais dessinés en **2 px** par un quad par segment, étiré à l'écran par un shader (`faoThickSegs`, largeur constante quel que soit le zoom ; vérifié dans le navigateur). La coupe reste en trait fin bleu. (2) **Finition (Crêtes constantes)** : le glissement A* du 003 (jusqu'à 100 mm à travers la pièce) est retiré, de même que le champ « Glissement » (`op.stayMax`, purgé à la lecture). Une transition n'est émise que vers une trace à **≤ 1,5 pas** (`linkStep`), en ligne directe dans la région, avec la liaison en S habituelle. Au-delà : arc de sortie, **remontée Z rapide sur place**, rapide vers la nouvelle entrée, arc d'entrée. (3) **Correctif de distance** : `near()` mesurait la distance au SOMMET le plus proche de l'anneau suivant ; après Douglas-Peucker, les droites n'ont plus que leurs extrémités, et un anneau à 1 mm paraissait à 4,5 mm. La distance est maintenant prise au segment, et le départ se fait au projeté exact (+ l'avance de la liaison en S). Résultat sur la cavité : **10 séquences** (22 en 005), 9 remontées, aucune transition longue, liaisons sans surcoupe.

Tests : `test_fao_cretes` (transitions ≤ hypot(1,5 pas, avance S) + 0,5 sur la cuvette et la cavité ; chaque remontée part en Z sur place ; cavité ≤ 15 séquences ; stayMax purgé). Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-14-006.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-006` ; badge **V0.1.18 → V0.1.19**.

### `2026-10-14-007`

**Ébauche 3D : PASSE TORIQUE au contact exact, parcours 005 inchangé (retour : « si je mets 0 à la paroi, je ne suis pas à zéro sur les faces — le calcul ne prend pas en compte le rayon de la fraise torique, la boule enlève beaucoup de matière » ; contrainte : « mon Ébauche 3D en 005 était parfaite en termes de parcours »).**

Étude sur la cavité (torique D25 R2, Parois 0) : le moteur raisonne en fraise droite D/2 et ignore le type d'outil. Sur une face inclinée, l'écart vaut rc·(1 − tan(θ/2)) en plan, soit 0,965 mm à 45° (tronc de pyramide). Sur la cavité, l'écart moyen aux faces est de 1,08 mm et 0 % du contour de contact du torique est parcouru aux niveaux d'ébauche. Une première tentative modifiait les sections lues par le moteur : elle a été abandonnée, car elle changeait le parcours (×2 mouvements, ×4 temps, remontées partout).

Solution (`src/89-fao-torique.js`) : le moteur est **inchangé**. Après tout le parcours, pour chaque niveau (et la finition des parois à laisse 0), une passe est **ajoutée** sur l'iso-ligne « pointe de l'outil réel = z », dans la zone, en sens avalant. Chaque contour fermé est fait d'un seul tenant. L'entrée et la sortie se font par le côté déjà usiné (pointe fraise droite ≤ z), et la liaison au contact n'est faite qu'au pas. Sinon : remontée sur place, rapide à la hauteur de déplacement seulement si l'outil y est libre sur tout le trajet (sinon plan de sécurité), descente rapide à z + 1 sur la colonne usinée, puis avance. La descente torique est **exacte** (`faoTorusDropper`) : disque plat R0 + tore en formule fermée sur les sommets, les points d'arêtes (pas 0,2 mm) et les facettes inclinées. Elle s'écarte de 0,003 mm au plus d'un anneau de 800 boules et elle est 80× plus rapide. L'anneau de 24 boules de la Finition (inchangée) laisserait jusqu'à ~0,6 mm sur une D25. Positions affinées par dichotomie (marge 5 µm) sur une grille de repérage de 0,5 mm. `faoScDropper` reçoit un paramètre optionnel `nsRing` (non utilisé par défaut).

Mesures sur la cavité (op du document, Parois 0) : les 43 823 premiers mouvements sont **identiques à 005**, suivis de 7 passes toriques. Remontées 267 → 274, aucune surcoupe, calcul 82,6 → 103 s. Contour de contact aux niveaux d'ébauche parcouru : 0 % → 99,9 % à 0,6 mm, 96,2 % à 0,1 mm. Tronc 45° : écart 0,965 → ≤ 0,004 mm à chaque niveau. Les mini-passes restent celles du moteur (fraise droite). Test : nouveau `test_fao_torique` (descente exacte, préfixe identique, +1 remontée par niveau au plus, contact par niveau, aucune surcoupe, torique R0 = fraise droite). Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-14-007.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-007` ; badge **V0.1.19 → V0.1.20**.

### `2026-10-14-008`

**Ébauche 3D : PAROIS à la cote demandée PARTOUT avec un outil torique / boule (demande : « j'aurais quand même préféré que l'Ébauche 3D soit partout à la cote Parois demandée »).**

En 007, seuls les niveaux principaux recevaient la passe torique (contour ajouté en fin d'opération). Les mini-passes entre deux niveaux, contours de paroi du moteur, restaient calculées en fraise droite : environ 1 mm de trop sur les faces inclinées, d'où 5 « contours dans la matière » visibles en simulation. Désormais, avec un outil à rayon de coin, **chaque mini-passe est calculée au contact réel de l'outil** (laisse Parois), à sa place dans le parcours, au lieu du contour fraise droite (`faoBullRingLevel(..., all:true)` : contour complet, parois verticales comprises). Le pelage des niveaux reste celui du moteur ; les contours des niveaux principaux restent en fin d'opération. Recherche du point de contact par fausse position (Illinois) bornée par les valeurs aux nœuds : 4 à 6 évaluations exactes au lieu de 14 dichotomies.

Mesures sur la cavité (op du document : torique D25 R2, Parois 0,5, mini-passes 5) : contour « outil réel à la laisse Parois » parcouru à toutes les hauteurs, de 0 % (005) à **99,9 % à 0,1 mm**. Coupes près des faces : écart moyen à la laisse 0,80 → 0,11 mm. Remontées 266 → 213, entrées 341 → 322, calcul 78 → 66 s, aucune surcoupe nouvelle. Test : `test_fao_torique` (mini-passes au contact de la laisse, fraise droite ~0,7 mm de trop en référence, aucune surcoupe, remontées). Les 4 tests qui lisaient `Exemples/Cavité Usinage.minifusion.json` (supprimé du dossier Exemples) lisent la fixture `tests/fixtures/cavite_usinage.minifusion.json`. Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-14-008.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-008` ; badge **V0.1.20 → V0.1.21**.

### `2026-10-14-009`

**Finition : congés LISSES — maillage fin réservé à la Finition (retour : « dans les congés, l'affichage montre 2 ou 3 droites qui se suivent, il faut les lisser. Le reste on ne touche pas. Le lissage est pour les parties arrondies »).**

Cause : la FAO ne calcule pas sur la surface exacte mais sur un maillage d'outillage volontairement grossier (import STEP 0,5 mm / 0,5 rad ; natif `occXDefl()` : 0,42 mm / 0,25 rad sur la cavité, 4 152 triangles). Un congé à 90° y fait 3 à 6 facettes, que la Finition suit fidèlement. Mesuré sur la cavité par rapport à la vraie surface : la finition **creusait jusqu'à 0,185 mm** dans les congés convexes (corde sous l'arc) et **laissait jusqu'à 0,385 mm** dans les concaves ; 15,4 % des points étaient à plus de 0,05 mm. Correctif : la Finition seule reçoit un **maillage fin** (corde 0,01 mm, 0,1 rad ≈ 16 facettes sur 90° ; `faoFineGeo` / `faoMeshFromBodyFine`, cache par corps, solide exact natif ou BRep d'import, triangulation effacée après coup ; `faoActiveMesh(setup, fine)` avec repli sur le maillage d'outillage). L'Ébauche 3D et les autres opérations gardent le leur : leurs parcours sont inchangés. Le lissage gaussien global essayé au passage a été retiré : il touchait toutes les traces. Cavité : 33 682 triangles, écart à la vraie surface ≤ 0,005 mm, aucune surcoupe, Finition 1,2 → 2,4 s. Test : `test_fao_cretes` (la Finition demande le maillage fin, l'Ébauche 3D non ; repli sans solide exact). Suite complète, `build.js --check` ; pas de snapshot séparé (le maillage fin n'était pas encore branché dans `faoActiveMesh` : corrigé et livré avec 010). Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-009` ; badge **V0.1.21 → V0.1.22**.

### `2026-10-14-010`

**Ébauche 3D (escargot) : la passe torique EST le tour de faces de chaque niveau — plus de passes ajoutées en fin d'opération (proposition : « les dernières passes ajoutées ne pourraient-elles pas être supprimées et remplacées par la dernière passe de chaque 1re passe, quand elle a fini le débourrage et qu'elle vient faire le tour ? On gagne une passe pour chaque pas »).**

Avec un outil à rayon de coin en mode escargot, la DERNIÈRE PASSE de chaque niveau (`faoSpiralLevel`, le tour des faces après le débourrage) suit les contours au contact réel de l'outil (`opt.bullFaces` → `faoBullRingRuns(..., all)`) au lieu des chaînes décalées de r. Ordre, entrées, découpe par la zone et sens sont ceux du moteur. Les liaisons au contact vers ces contours sont validées sur l'outil réel (`opt.bullOK`) ; au-delà d'un pas, l'entrée habituelle s'applique. Les passes toriques de fin d'opération disparaissent en escargot ; le mode conventionnel, qui valide chaque coupe en fraise droite, les garde. La finition des parois (`finitParois`) est elle aussi calculée au contact réel, à sa place (comme les mini-passes en 008). Cavité (D25 R2, Parois 0,5, escargot) : longueur usinée 37,5 → 34,6 m (−8 %), remontées 213 → 193, entrées 322 → 299, calcul 66 → 59 s ; contour à la laisse toujours parcouru à 99,9 % (0,1 mm) ; aucune surcoupe de la pièce. Correctif annexe : le maillage fin de 009 n'était pas branché dans `faoActiveMesh` (une substitution avait visé `faoSetupFp`, d'où l'échec de `test_fao_cache_idb` et `test_fao_solide_cache`) ; corrigé, test ajouté (corps factices : fin pour la Finition, outillage sinon). Tests : `test_fao_torique` (escargot : faces au contact à chaque niveau, aucune surcoupe, pas de remontée ajoutée, l'opération finit au dernier niveau), `test_fao_cretes`. Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-14-010.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-010` ; badge **V0.1.22 → V0.1.23**.

### `2026-10-14-011`

**Fiches d'opération EN ONGLETS, champs lisibles (retour : « améliorer les menus des opérations d'usinage : zones texte illisibles à cause des flèches, indications pas assez claires, peut-être mettre des onglets par type d'informations » ; maquette validée).**

(1) **Onglets** (`faoCardTabs`) : les sections de chaque fiche sont rangées dans des onglets Réglages · Zone · Hauteurs · Passes · Entrées · Matière · Attaches. Seuls les onglets utiles apparaissent ; l'en-tête (n°, type, outil, ordre) et la ligne de bilan restent visibles. L'onglet choisi est mémorisé par opération. La carte est reconstruite avec `appendChild` seul. (2) **Aide claire** : chaque onglet a une ligne d'aide qui décrit l'onglet, puis explique le champ survolé ou en cours de saisie (son infobulle). (3) **Champs lisibles** : plus de flèches sur les champs numériques (illisibles dans le panneau étroit) ; valeur alignée à droite, champs un peu plus larges ; valeurs affichées arrondies (1,0000000004 → 1) ; libellé et champ jamais séparés au retour à la ligne (`fao-pair`). (4) **Libellés en clair** : Descente ap, Pas latéral ae, Mini-passes, Haut / Bas, Surépaisseur, Rayon d'entrée, Débourrage Q, Parois / Fond (poche et contour rectangle). (5) **Finition** restructurée en sections Hauteurs / Passes / Entrées / Matière, avec infobulles du Pas, de la Surépaisseur et de Haut / Bas ; section « Zone » explicite pour toutes les opérations. Vérifié dans le navigateur (Ébauche 3D et Finition). Test : nouveau `test_fao_fiche_onglets` (onglets par opération, un seul visible, bascule et mémoire, aide par onglet, en-tête hors onglets, valeur arrondie, libellés). Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-14-011.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-011` ; badge **V0.1.23 → V0.1.24**.

### `2026-10-14-012`

**Finition : plus de creux sur les flancs convexes (cordes conformes) ; viewer : plus de lignes jaunes sur un brut-corps STEP (retours : « tu me diras si ces creux te semblent normaux / aux faces réelles » ; « quand j'insère un STEP, au viewer j'ai ces lignes jaunes qui polluent le résultat »).**

(1) **Creux réels, corrigés.** Une simulation matière (boule D6, grille 0,05 mm) sur la bosse de la cavité, comparée au solide fin, montrait deux bandes de creux sur les flancs (x ≈ ±6,5), jusqu'à 0,024–0,035 mm sous la pièce : exactement les taches sombres du viewer. Les points du parcours sont sur la surface outil, mais sur une zone convexe la CORDE entre deux points à 0,4 mm passait dessous (jusqu'à 0,015 mm sur la pointe) ; même défaut sur les quarts de cercle d'entrée/sortie. Désormais chaque segment des boucles et des arcs d'entrée/sortie est contrôlé au quart, à la moitié et aux trois quarts ; il est recoupé (descente outil au milieu) tant qu'un point passe sous la surface de plus de 2 µm (`conform`). Bosse : 1 822 points sous la pièce > 0,02 mm → **0** ; cuvette de test : surcoupe max 0,0104 → 0,0020 mm. Ce qui reste visible est la crête normale (matière laissée), pas une surcoupe. (2) **Viewer** : le brut « corps réel » (rendu forme réelle) traçait toutes les arêtes du maillage du corps (`EdgesGeometry` à 1°) : sur un STEP importé, toutes les lignes de tessellation, en jaune. Ces arêtes sont retirées ; le fantôme transparent reste. Test : `test_fao_cretes` (surcoupe de la cuvette, cordes comprises, < 0,005 mm). Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-14-012.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-14-012` ; badge **V0.1.24 → V0.1.25**.

### `2026-10-15-001`

**Poche : le fond est enfin usiné ; case « Finir le fond » (retours : « l'opération Poche ne fonctionne pas très bien … tu peux faire un point ? » ; « si je mets une surépaisseur au fond, il n'est pas usiné ! Peux-tu ajouter la case à cocher "Finition fond" avec la dernière passe latérale ? »).**

(1) **Point sur la Poche** (pièce « Poche et Contour » : poche 30 → 24, épaulement à 26, fraise D10, ap 2) : le fond (24) n'était usiné dans **aucun** mode (escargot comme conventionnel ; 0 % du fond couvert), et avec Fond 0 le niveau 26 manquait aussi. Cause : couper le maillage EXACTEMENT au Z d'une face horizontale (l'épaulement à 26, ou le fond avec Fond 0) produisait des segments en double qui inversaient la parité de la section. Le centre de la poche devenait « matière » dans l'ombre et masquait tout ce qui est dessous. Correctif (`faoSliceZ`) : un sommet pile sur le plan compte « dessous » ; la section est lue juste au-dessus du plan, étanche (0 ou 2 croisements par triangle). L'hélice de départ (`faoHelixSpot`) prend désormais la cote du plan SUIVANT celui où la matière est vue. Résultat : fond couvert à 100 % dans les deux modes, aucune surcoupe. Ébauche 3D de la cavité : même parcours en XY, mêmes statistiques (39 643 moves, 193 remontées) ; seules 54 hauteurs de rapide montent (jusqu'à +0,92 mm, départ d'hélice au-dessus du vrai dessus). Comparaison des modes sur cette poche : escargot 5,85 m de coupe, 48 remontées, 0,5 s ; conventionnel 8,51 m, 22 remontées, 1,8 s. (2) **Finir le fond** (`op.finitFond`, Ébauche 3D et Poche, onglet Matière) : avec une surépaisseur Fond > 0, un niveau est ajouté à la cote EXACTE de chaque fond situé dans la zone (`faoFloorInZone` : un épaulement hors poche n'en reçoit pas). La finition des parois, dernière passe latérale, se fait à cette hauteur. Tests : `test_fao_poche` (épaulement plus bas que le dessus : 28 / 26 / 24 usinés dans les deux modes ; Fond 0,5 sans case = fond laissé, avec = passe à 24 et parois à la cote, rien sur l'épaulement), `test_fao_fiche_onglets` (case présente) ; `test_fao3d`, `test_fao_escargot`, `test_fao_torique` adaptés (la face haute à Bas est désormais atteinte au contact ; entrées hors passe ; faces horizontales hors contrôle de laisse Parois). Suite complète, `build.js --check` ; pas de snapshot séparé (livré avec 002). Migration : `APP_VER` et `CACHE_VER` → `2026-10-15-001` ; badge **V0.1.25 → V0.1.26**.

### `2026-10-15-002`

**Ébauche 3D et Poche : mode CONVENTIONNEL retiré, ESCARGOT partout (demande : « retire le conventionnel partout et on garde l'escargot partout »).**

Le sélecteur « Mode » de la fiche (Ébauche 3D, Poche) disparaît : la fiche affiche « Escargot · du centre vers les faces », avec une infobulle explicative. À la lecture, tout document (mode absent, `conv` ou inconnu) passe en `mode:'escargot'`, et le dispatch force `mode:'escargot'`. Une Poche créée est en escargot. Les opérations conventionnelles des documents existants sont donc recalculées en escargot au prochain « Tout régénérer ». Le moteur conventionnel (`faoRoughAdaptiveLevel`) reste dans le code : les mini-passes et la finition des parois l'utilisent en anneaux. Tests : `test_fao_escargot` (sanitise → escargot quel que soit le mode lu, fiche sans sélecteur ni mention du conventionnel, op sans mode = escargot), `test_fao` (contrôles d'orientation des bandes conventionnelles 029b/029c retirés), `test_fao_zone2` (îlot : la zone autour reste balayée — invariant géométrique, la spirale part du centre de la zone qui bouge avec l'îlot). Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-15-002.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-15-002` ; badge **V0.1.26 → V0.1.27**.

### `2026-10-15-003`

**Sol miroir : plus de « fuyantes » qui s'étirent hors de la zone 3D (retour vidéo : « j'ai un souci avec le miroir. Il faut arrêter les fuyantes qui cherchent à sortir de la zone 3D »).**

En vue rapprochée ou rasante, une partie du sol projette son reflet HORS de la texture de reflet (coordonnées en dehors de [0, 1]). Le ClampToEdge de three.js y étirait alors les pixels du bord de la texture en longues traînées (le reflet jaune d'une paroi filait jusqu'au coin de l'écran). Le shader du sol ne prend plus de reflet hors de la texture, et le reflet s'estompe en douceur sur les 8 % du bord (`smoothstep`). Deuxième retour vidéo (« plus de fuyantes, mais encore, ça pique les yeux ») : le reflet n'est plus une copie nette de la pièce — flou léger à 9 échantillons et intensité réduite (0,62 → 0,34), il devient un simple reflet diffus sur le sol sombre. Vérifié dans le navigateur sur « Poche et Contour » en vue rasante : la traînée de l'ancien shader disparaît, sans erreur de compilation. Suite complète, `build.js --check`, snapshot `Backup/fusion_mvp_2026-10-15-003.html`. Migration : `APP_VER` et `CACHE_VER` → `2026-10-15-003` ; badge **V0.1.27 → V0.1.28**.

### `2026-10-15-004`

**Imports STEP/STL enregistrés avec la pièce, et mesure exacte sur un STEP (retour : « quand on sauvegarde la pièce avec le STEP et des usinages, le fichier n'est pas rechargé car manquant. Pourtant le .miniFusion fait 30 Mo ! » ; « 2 faces // doivent donner leur distance exacte et pas entre les points de sélection ! Pareil pour les cylindres ! »).**

Persistance : la géométrie importée n'était jamais écrite — les 30 Mo étaient les trajectoires FAO, et l'ouverture jetait la fonction import (alerte « réimportez le STEP/STL »). Désormais le fichier d'origine est conservé (mémoire + IndexedDB, clé = empreinte du contenu) ; la fonction import ne porte qu'une référence `src` (format, empreinte, taille, nom), le JSON, l'autosave et l'historique restent légers. Le `.miniFusion` EMBARQUE le fichier (base64, champ `imports`) : à l'ouverture, ou au F5 dès que le noyau est prêt, le STEP est rejoué avec le MÊME id de fonction — corps, enlèvements et opérations FAO retrouvent leur cible, tessellation identique. Anciens fichiers sans source : la fonction est gardée « à réimporter » ; réimporter le même nom (ou confirmer quand il n'en reste qu'une) la rebranche, usinages conservés — vérifié sur `CAV169.miniFusion` + `Cavité.step`.

Mesure : `occFaceGeom` ne résolvait que les corps natifs ; un STEP seul dans son corps retombait sur la distance entre les points cliqués. Il est résolu sur son BRep importé (plans, cylindres : Ø, entraxe, axe↔face exacts), et la distance entre deux faces parallèles vient des équations des plans (plus des points cliqués), pied de cote posé sur la face 1. Sur `Cavité.step` : 23 plans et 36 cylindres exacts, plans Z = 0 / 20 / 50, Ø 8,4 / 10 / 14 / 16 / 32 / 50. Poids des fichiers (retour : « un petit solide comme Poche et Contour pèse 70 Mo… même Vide.miniFusion pèse 70 Mo ») : `bundleMoves` embarquait TOUTES les trajectoires `faoMoves:*` de l'IndexedDB — celles de tous les documents jamais ouverts dans le navigateur. Il n'embarque plus que celles des opérations du document (clé posage:opération), et l'ouverture ne recopie plus les trajectoires étrangères d'un ancien fichier gonflé. Mesuré : « Poche et Contour » 71,9 Mo → 0,31 Mo (dont 71,6 Mo étrangers), « Vide » → 1,4 Ko ; ré-enregistrer un ancien fichier suffit à l'alléger. Sol miroir (« le miroir de viewer_STEP fonctionne à merveille, mets-moi les mêmes réglages ») : mêmes valeurs que ce viewer — reflet net ×0,62 (le flou ×0,34 du 003 est retiré), cible de reflet fixe 1024×1024, rendu ×1,25 ; et, comme lui, SEULS les solides se reflètent : arêtes, trièdre, plans d'origine, outils fantômes et trajectoires sont masqués pendant la passe reflet (c'étaient ces traits fins qui scintillaient dans le sol). La garde anti-« fuyantes » du 003 reste (fondu sur 3 % du bord). Les traits épais FAO gardent leur épaisseur en pixels écran malgré le rendu ×1,25. Nouveau test `test_import_persist` (aller-retour .miniFusion, ancien format, rebranchement, faces // d'un STEP 60×40×20 = 20 / 40 / 60 exactement). Migration : `APP_VER` et `CACHE_VER` → `2026-10-15-004` ; badge **V0.1.28 → V0.1.29**.

### `2026-10-15-005`

**Pré-sélection d'arêtes (Chaîne, Chaîne îlot, Limite Z) plus visible et plus précise (retour : « les arêtes extérieures sont visibles mais pas assez précises et le trait trop fin ; les arêtes de fond de poche ou de détourage ne le sont pas du tout »).**

Trois causes. 1) Trait : les `LineSegments` WebGL font toujours 1 px → quads écran comme les rapides, 3 px au repos, 5 px survolée/sélectionnée, sur un liseré sombre (+1 px de chaque côté) qui garde le contraste sur n'importe quelle couleur de corps (une arête jaune survolée sur un corps jaune restait invisible). 2) Arêtes concaves (fond de poche, pied de détourage, épaulement) : posées exactement sur la surface, la corde du maillage passait DEVANT elles → invisibles ; le shader avance chaque sommet vers la caméra (0,25 mm + 0,4 % de la distance) : visibles sur la face, toujours cachées par la matière. 3) Pointage : tolérance de 2 mm en 3D (trop large de près, inattrapable de loin) → arête la plus proche en PIXELS écran (≤ 10 px), une arête cachée par la pièce n'étant jamais prise (comparaison au premier impact du rayon). Vérifié sur « Poche et Contour » : 48 arêtes listées, contours du fond de poche (Z 24) et de l'épaulement (Z 13) affichés et pointables ; les seules arêtes refusées sont réellement cachées depuis le point de vue. Migration : `APP_VER` et `CACHE_VER` → `2026-10-15-005` ; badge **V0.1.29 → V0.1.30**.

### `2026-10-15-006`

**Sol miroir : reflet coupé sur les côtés (retour vidéo : « quand la pièce vient dans la zone des panneaux Arborescence et FAO, le miroir se déglingue »).**

Vraie cause, et aussi celle des « fuyantes » du 003 : `updateMirror` orientait la caméra miroir avec `up = (0,0,1)` pris en repère LOCAL de la caméra — le Z-haut du monde confondu avec un axe local. Le haut local d'une caméra est toujours `(0,1,0)` (viewer_STEP et le Reflector de three le font ainsi). La caméra miroir partait donc en roulis : son cadre ne recouvrait plus l'écran et le reflet était tronqué sur les côtés (là où sont les panneaux), ou étiré avant la garde du 003. Mesuré sur « Poche et Contour », vue rasante : part du sol visible couverte par l'image de reflet 71 % → 100 %. Migration : `APP_VER` et `CACHE_VER` → `2026-10-15-006` ; badge **V0.1.30 → V0.1.31**.

### `2026-10-15-007`

**Esquisse consolidée, contrainte Colinéaire, nouveau jeu d'icônes (demande : « jeter un œil sur l'esquisse et ses règles, consolider, ajouter la contrainte Colinéaire, revoir tous les icônes qui se ressemblent tous »).**

Consolidation : nouveau module `src/49-esquisse-registre-icones.js` — registre `SK_CON` (nom, icône, degrés de liberté retirés, liaison ligne-ligne) lu par le comptage des DDL, la liste du panneau, les pastilles du dessin et la recopie des liaisons lors d'une scission, d'un ajustement ou d'une sélection par propagation (ces listes étaient en dur et dispersées). Défauts corrigés au passage : l'AUDIT ignorait Parallèle et Perpendiculaire (jamais de ⚠ sur une ∥/⟂ violée, et le choix LM/relaxation par résidu d'audit ne la voyait pas) ; Tangence posée dans l'ordre « cercle puis ligne » ou entre 2 cercles non annulable ; ligne de libellé Symétrie en double ; la recopie de Symétrie sur un axe scindé perdait l'axe.

Colinéaire (⫽, barre + menu contextuel 2 lignes) : 2 résidus (extrémités de B sur la droite de A) au solveur LM, relaxation symétrique (ligne figée → l'autre la rejoint), audit en mm, 2 DDL, dédoublonnage (une ∥ sur la même paire devient redondante et est purgée), refusée sur 2 lignes ⟂, recopiée sur les morceaux d'une ligne scindée/ajustée.

Icônes : jeu SVG commun 24×24 au trait (33 icônes : 11 outils, 15 contraintes, 7 cotes), une forme distincte par fonction — fini ⦾ ◎ ⊕ ⌖ ⌾ quasi identiques. Utilisé par la barre d'esquisse (outils en blanc, contraintes en vert, séparateurs de groupes), le menu contextuel, les listes Contraintes/Cotes, et les pastilles posées sur le dessin (remplacent les lettres vertes H V ∥ ⟂ ⇔ = ◎). Nouveau test `test_esquisse_colineaire` (20 vérifications) + Colinéaire ajoutée à la réparation libre et à l'aller-retour JSON intégré (15 types). Migration : `APP_VER` et `CACHE_VER` → `2026-10-15-007` ; badge **V0.1.31 → V0.1.32**.

### `2026-10-15-008`

**Esquisse : échelle et sélection pour les petites pièces ; icônes Congé / Chanfrein / Décalage (retour : « je veux pouvoir faire des pièces petites et zoomer + ; on ne peut sélectionner que les points des lignes et pas les lignes ; mes pièces tournent autour de 100 mm ; les icônes des congés 2D, chanfreins et offset ne sont pas top et trop petits »).**

Causes trouvées : plusieurs pointages ajoutaient des **mm fixes** à une tolérance en pixels (`SK_PICK+2`, `SK_PICK+3`, bande d'arc `maxD+2`) — à 40 px/mm, « +2 mm » = 80 px : la zone des extrémités couvrait toute la ligne courte ; en plus, toute étiquette de cote à moins de **60 px** du clic était prise avant tout le reste. Désormais tout est en pixels écran : entité 8 px, point 10 px (prioritaire), congé/chanfrein/ajuster 12 px, étiquette = boîte du texte +6 px (Ø/R/angle : 18 px). Zoom 0,15 → **600 px/mm** (plafond 80), cadrage jusqu'à 600 px/mm (plafond 30, et plus de plancher à 1 mm de boîte), grille et pas d'accroche jusqu'au µm, esquisse vide cadrée sur **130 mm** (pièces ~100 mm). Seuils fixes retirés : décalage ≥ 0,5 mm (→ 4 px écran au clic, 0,001 mm en saisie), départ d'arc et longueur dynamique 0,5 mm (→ 4 px), jonction en T 0,5 mm (→ ≤ 5 px). Icônes Congé / Chanfrein / Décalage : SVG du jeu commun à la taille des autres (étaient des glyphes ⦾ ◣ ⇄), aussi dans le menu contextuel. Nouveau test `test_esquisse_echelle` (contre-épreuve sur l'ancien code : ligne inaccessible à 200 px/mm, cote voleuse, décalage 0,2 mm refusé). Migration : `APP_VER` et `CACHE_VER` → `2026-10-15-008` ; badge **V0.1.32 → V0.1.33**.

### `2026-10-15-009`

**Régénération du modèle 3D : chaîne de dépendances complète + un seul bouton « ⟳ Régénérer » (retour : « Cavité Usinage : quand je passe la cote de 50 de la 1ère extrusion à 55, l'avant-dernière esquisse ne suit pas et la dernière extrusion négative n'est plus visible ; Recalculer, Valider et Hard sont redondants → 1 seul bouton ; il y a un gros point à régler une bonne fois pour toutes »).**

Chaîne du modèle : Extrusion 1 → Esquisse 2 sur sa face → découpe (fond) → Esquisse 3 (YZ, 2 arêtes PROJETÉES utilisées comme PROFIL) → extrusion → Symétrie (instance + esquisse copiée) → Esquisse 8 sur une face LATÉRALE de l'instance → découpe → « Limite Basse ». Quatre défauts, tous corrigés :
1. **Projetée passée en profil = plus associative** : `updateAssociativeProjections` ignorait toute entité non « construction ». Une arête projetée suit désormais son arête source qu'elle soit construction ou profil (le repli « ligne aux 2 bouts fixes » reste réservé à la construction).
2. **Instances de symétrie/répétition jamais régénérées pendant le rejeu** (seulement à l'édition manuelle de la source) : `repSyncStale()` compare une signature des sources (fonctions + esquisses) et régénère en place (mêmes ids) au début de chaque passe, puis re-résout les faces porteuses.
3. **Une seule passe de reprise** : la régénération boucle désormais jusqu'à convergence (`REGEN_MAX_PASS` = 4 reprises), avec alerte si le modèle ne se stabilise pas (référence circulaire).
4. **Cotes entraxe / point↔ligne non signées** : écrites (d² − w²)/2w, elles admettaient la solution miroir ; au retour 55 → 50 une ligne cotée 3,26 SOUS l'arête projetée revenait AU-DESSUS et deux congés R7 devenaient impossibles. Le côté (`d.sgn`) est mémorisé dès que l'esquisse est cohérente (ouverture, chaque rejeu) et imposé par le solveur LM, la relaxation et l'audit.

Mesuré sur « Cavité Usinage » : 50 → 55 en une régénération (Esquisse 3 et sa copie, Esquisse 8 et Limite Basse passent de Z 20 à 25, la poche réapparaît), 55 → 50 → 55 réversible au µm, aucune fonction en erreur. Boutons : « 🔁 Recalculer », « ✓ Valider » et « ⟳⟳ Hard » remplacés par **« ⟳ Régénérer »** (Ctrl+Maj+R) = `runValidate` (réparation du document, réalignement des répétitions, caches jetés, UN rejeu complet jusqu'à convergence, diagnostic esquisses / fonctions / corps ; rapport dans Auto-tests) — l'ancien « Valider » rejouait deux fois. Nouveau test `test_regeneration_chaine` (noyau OCCT réel, document réel en fixture `tests/fixtures/cavite_regeneration.json`) ; `test_validate` adapté au bouton unique. Migration : `APP_VER` et `CACHE_VER` → `2026-10-15-009` ; badge **V0.1.33 → V0.1.34**.

### `2026-10-15-010`

**Fiches outils et conditions de coupe par opération (demande : « piloter la vitesse de rotation et l'avance, par outil et par opération, avec un onglet spécial outil ; une page outil plus grande, liste à gauche et paramètres à droite ; taille, zone de coupe, dégagement, longueur sous mandrin ; S et avances travail, plongée, remontée, rapide ; modifier l'outil dans l'opération ne met pas à jour sa fiche ; par défaut on prend les valeurs de la fiche au choix de l'outil »).**

Nouveau module `src/89-fao-outils.js`. **Bibliothèque** (bouton « Outils ») : grande fenêtre, liste des outils à gauche (type, Ø, S/F, nombre d'opérations qui l'utilisent ; + Nouveau, ⧉ Dupliquer, ✕ Supprimer — refusé si l'outil sert), fiche à droite — Identification (n° T, nom, type, matière), Géométrie (Ø coupe, rayon de coin, dents, longueur de coupe, Ø et longueur de dégagement, Ø queue, longueur sous mandrin, longueur totale, Ø mandrin ; grisé = défaut calculé), Conditions de coupe (Vc ⇄ S, fz ⇄ F travail — saisir S ou F recalcule Vc ou fz —, F plongée, F entrée, F remontée, rapide G0) — et schéma coté de l'outil (coupe, col, queue, mandrin ; Lc, L dégagée, L sous mandrin, Ø). **Opération** : nouvel onglet « Outil » (1er après Réglages) — outil, « Fiche… » ouvre la bibliothèque sur lui, S / F travail / plongée / entrée / remontée / rapide avec leur source (« fiche » grisé ou « opération » + ↺) ; une valeur saisie ne vaut que pour l'opération (`op.cut`, surcharge champ par champ), la fiche n'est jamais touchée ; une fiche modifiée se propage aux opérations qui n'ont pas surchargé ce champ ; changer d'outil efface les surcharges (valeurs de la nouvelle fiche). Contrôle de **portée** : profondeur usinée comparée à Lc (col), à la longueur dégagée (la queue frotte) et à la sortie sous mandrin (collision).

G-code : S émise à chaque changement de vitesse entre opérations d'un même outil ; arcs et mouvements d'entrée en F entrée, remontées G1 en F remontée, 1re descente après rapide en F plongée (règle historique), cycles de perçage en F plongée de l'opération. Par défaut (entrée = remontée = travail, aucune surcharge) la sortie est **strictement identique** (tests post-processeurs inchangés). Estimation et simulation : avance et rapide de chaque opération. Cache des parcours : la clé ne voit que les champs historiques de l'outil (id, n°, nom, type, Ø, rayon, dents, Vc, fz) et ignore `op.cut` — ajouter longueurs ou avances ne périme aucune trajectoire. `CACHE_VER` volontairement **inchangé** (aucun parcours modifié : les trajectoires déjà générées restent valides). Nouveau test `test_fao_outils` (30 vérifications) ; `test_fao` et `test_fao_fiche_onglets` adaptés. Migration : `APP_VER` → `2026-10-15-010` ; badge **V0.1.34 → V0.1.35**.

### `2026-10-15-011`

**Perçage refait : trous reconnus sur le modèle, cycles, profondeurs « régleur », forets (retour : « l'opération Perçage ne fait rien, pas d'outil ni parcours »).**

Constat : une nouvelle opération prenait la fraise T1, créait UN trou au centre du brut percé sur toute sa hauteur, et n'affichait rien avant « Tout régénérer ». Nouveau module `src/89-fao-percage.js` :
- **Reconnaissance** sur la géométrie exacte (OCCT) : cylindres verticaux couvrant ≥ 270°, triés par la MATIÈRE (vide juste dedans, matière juste autour — l'orientation de face n'est pas fiable : une découpe extrudée en −Z donne des trous « FORWARD ») ; Ø, X/Y, Z haut/bas, débouchant (classifieur sous la pointe) ou borgne, angle de pointe, chanfrein d'entrée, lamage (cylindre coaxial plus large, fond plat → borgne). Pions et bossages écartés.
- **Sélection** par groupe « même Ø + même départ » : cases dans la fiche (onglet Zone, section Trous) ou « Choisir dans la vue » (clic sur un trou, anneaux orange/gris, Échap). Les trous re-suivent le modèle à chaque reconstruction. **Un Ø par opération** : ajouter un autre Ø crée une nouvelle opération Perçage avec son foret (le pointage accepte tous les Ø).
- **Outils** : types « Foret » (angle de pointe, avance PAR TOUR, F = f × S) et « Foret à centrer » (90°) dans la bibliothèque, schéma à pointe conique ; choisir des trous affecte le foret du même Ø ou le CRÉE.
- **Cycles** (Réglages) : pointage, perçage simple (temporisation → CYCLE82 / G82), débourrage (CYCLE83 VARI=1 / G83), brise-copeaux (CYCLE83 VARI=0 ; Fagor : passes explicites G1/G0 — syntaxe G73 8065 à confirmer). Départ (RFP) et fond (DP) PAR TROU ; retrait du cycle jamais sous un départ.
- **Profondeur** : plein Ø au fond du trou (+ longueur de pointe, défaut), pointe au fond, ou cote manuelle ; débouchants : + débouchage (1 mm) ; pointage : profondeur selon le Ø de chanfrein voulu et l'angle.
- **Ordre** : plus court chemin (plus proche voisin + 2-opt) ou zigzag ; anciens perçages XY : ordre saisi conservé.
- **Parcours immédiat** : un perçage est toujours recalculé sur place (jamais « ⚠ à régénérer », jamais l'ancien tracé).
Anciens documents : perçages en saisie XY inchangés (cotes, ordre, G-code). `CACHE_VER` inchangé. Nouveau test `test_fao_percage` (noyau réel : débouchant, borgne à pointe 118°, lamage, trou creusé en −Z, pion, ordre, cycles Siemens/Fagor, pointage, suivi du modèle, compatibilité XY). Migration : `APP_VER` → `2026-10-15-011` ; badge **V0.1.35 → V0.1.36**.

### `2026-10-15-012`

**Fonction 3D « Perçage » + centres de perçage + lien FAO (demande : « une fonction Perçage en modélisation, en rapport avec l'opération Perçage FAO : des points dédiés aux centres de trous ; trous ou trous taraudés, lamage et fraisure intégrés, comme Fusion 360 ; laisser le choix trou/taraudage pour un STEP ; reconnaître automatiquement si créé avec » ; puis : fins « jusqu'à la face », « débouchant (prochaine face) », « débouchant tout », longueur filetée longueur / face / prochaine face, bouton Supprimer en double, image du taraudage).**

- **Esquisse** : outil ⊕ « Centre de perçage » (point dédié, cercle + croix orange, hors profil) — seuls ces points portent des trous.
- **Fonction Perçage** (bouton ⊚ Perçage, nouveau module `src/76-percage.js`) sur l'esquisse sélectionnée, réglée en direct dans Paramètres : type simple / lamage / fraisure (90°, 82°, 100°, 120°) ; taraudage métrique ISO M2→M24 pas gros et fins (Ø de perçage = M − pas) ; préréglages « Vis CHC » ISO 4762 (passage, lamage Ø × profondeur) ; fin Distance (pointe 118/135/140/90° ou fond plat), Jusqu'à la face (clic sur une face plane), Débouchant (arrêt à la 1re sortie de matière, calculé trou par trou), Débouchant tout ; longueur filetée Longueur / Jusqu'à la face / Jusqu'à la prochaine face ; sens automatique vers la matière, inversable. Géométrie EXACTE (outil de révolution par centre : lamage/fraisure + corps + pointe, découpé du corps), signature complète pour le rejeu, icône ⊚ dans l'arbre, nom parlant (« Perçage Taraudé M8 ×4 », « Perçage Ø6,6 lamé Ø11 débouchant tout ×2 »). Débouchant : course limitée à la pièce (pas d'outil fantôme de 2 m).
- **Image du taraudage** : hélice au pas réel dans le trou sur la longueur filetée + cercle pointillé du Ø nominal (filet cosmétique, comme Fusion ; le solide reste percé au Ø du taraud). Vrai filet modélisé : plus tard, en option.
- **Lien FAO** : la reconnaissance des trous lit la fonction — « taraudé M8 (fonction Perçage) », « lamage (fonction Perçage) » affichés d'office ; pièce STEP : choix « Trou / Taraudé M… » par groupe (seulement les tailles dont le Ø de taraud correspond au Ø mesuré), rangé dans le posage, sans périmer aucun parcours. Un axe portant plusieurs tronçons (trou traversant une cavité) donne un trou par tronçon.
- **Repli maillage** (avant le chargement du noyau) : une pointe conique de rayon nul corrompait le booléen BSP — la pièce disparaissait au profit des outils ; corrigé.
Nouveau test `test_percage_3d` (noyau réel : 4 fonctions, sens auto, Ø de taraud, débouchant, M8 borgne à pointe, lamage CHC, fraisure Ø11 exacte, reconnaissance FAO, paramétrique, fins prochaine face / tout / face à travers une cavité interne, longueur filetée, panneau). Migration : `APP_VER` → `2026-10-15-012` ; badge **V0.1.36 → V0.1.37**.

### `2026-10-15-013`

**FAO : taraudage et gamme automatique de perçage.**

- **Taraud** (bibliothèque) : type « Taraud », filet ISO (taille + pas, gros et fins) ; F = pas × S, imposée par le filet. Choisi ou CRÉÉ automatiquement à la taille du filet des trous sélectionnés.
- **Cycle « Taraudage »** dans l'opération Perçage : CYCLE84 rigide sur Siemens (PIT = pas, SDAC = 3, SST = SST1 = S) ; G84 R1 sur Fagor 8065 (syntaxe à valider en atelier). Profondeur : longueur filetée de la fonction Perçage (effective, y compris « jusqu'à la face » / « prochaine face »), saisie dans l'opération, sinon (STEP) profondeur du trou − 2 pas pour un borgne, traversant pour un débouchant. Le filet des trous voyage avec eux (fonction Perçage reconnue, ou choix « Taraudé M… » d'un STEP) ; alerte si le taraud ne correspond pas au filet.
- **Gamme** (bouton ⚙ Gamme, section Trous) : remplace l'opération par pointage (tous les Ø, foret à centrer) → un perçage par Ø (débourrage automatique au-delà de 4 × Ø, Q = Ø) → un taraudage par filet. Pointage d'un trou taraudé au Ø NOMINAL + 0,4 (entrée du taraud). Lamages signalés « à fraiser » (interpolation hélicoïdale : étape suivante), non percés.
- **Libellés** des opérations de perçage : « Pointage (6) », « Perçage Ø6,75 (4) », « Taraudage M8 (4) » (arbre FAO, commentaires et #MSG du G-code).
Nouveau test `test_fao_taraudage` (noyau réel : gamme complète, débourrage automatique, taraud M8 F = 1,25 × S, profondeur filetée, pointage nominal, CYCLE84 / G84, STEP marqué M10). Migration : `APP_VER` → `2026-10-15-013` ; badge **V0.1.37 → V0.1.38**.

### `2026-10-15-014`

**FAO : fraisage des lamages par interpolation hélicoïdale ; remontée du taraud à l'avance (retours : « fraisage lamages » ; « un taraudage ça rentre et sort à la même vitesse, seule la rotation change ! »).**

- **Cycle « Fraisage hélicoïdal (lamage) »** dans l'opération Perçage, à la fraise cylindrique : descente en hélice EN AVALANT (G3, sens trigo) par quarts de tour (IJK < 180°, sûr sur 840D et 8065), en F entrée ; pas d'hélice automatique (rampe ≈ 2,5°, ≤ 25 % du Ø fraise) ou saisi ; un tour complet à plat au fond (dressage) ; sortie au centre puis remontée. Rayon de trajectoire (Ø trou − Ø fraise)/2 ; si la fraise ne couvre pas le centre, anneaux concentriques de l'intérieur vers l'extérieur (Ø30 à la fraise Ø10 : 2 anneaux). Fond plat au fond du trou (lamage), débouchant : + débouchage.
- **Outil** : plus grande fraise cylindrique de la bibliothèque entre 40 % et 85 % du Ø, sinon création d'une fraise standard ≤ 70 % du Ø.
- **Gamme** : les lamages sont désormais FRAISÉS (pointage → perçages → lamages fraisés → taraudages) ; libellé « Lamage fraisé Ø11 (2) ».
- **Taraudage** : dans l'aperçu et l'estimation, le taraud ressort en AVANCE (même F = pas × S, rotation inversée), plus en rapide — le G-code l'avait déjà juste (CYCLE84 SST = SST1, G84 rigide).
Tests : `test_fao_taraudage` étendu (lamage fraisé à la fraise Ø6, G3 au rayon 2,5, fond dressé Z33,6, entrée en F entrée, 2 anneaux pour Ø30/Ø10, remontée du taraud en avance, SST = SST1). Migration : `APP_VER` → `2026-10-15-014` ; badge **V0.1.38 → V0.1.39**.

### `2026-10-16-001`

**Esquisse : règles de contrainte façon Fusion (liste en 13 points), cotes hors-tout conservées par les congés, tangences qui ne se retournent plus ; visualisation des arêtes rentrantes ; Ctrl/Cmd au lieu de Shift.**

- **Couleurs par analyse de RANG** (jacobien numérique + échelonnement) : entité libre = bleue, entité entièrement déterminée = blanche, cotes vertes. Le compteur de DDL est le vrai (plus de comptage d'équations). Au point de tangence d'un congé, « point sur l'arc » et « tangence » sont dégénérés au 1er ordre : l'analyse ajoute l'équation du pied du centre (sinon +2 DDL fantômes par congé et une esquisse avec congés ne passait jamais en blanc).
- **Cote en sur-contrainte → cote de RÉFÉRENCE** : grise, entre parenthèses, elle mesure sans piloter. Rayons de congé jamais pris pour référence. Une référence qui n'est plus en trop redevient pilotante à l'ouverture ; double-clic dessus = la rendre pilotante si possible.
- **Priorité** : H/V/tangence pèsent ×300 dans le solveur → en cas de conflit, ce sont les cotes qui cèdent.
- **Saisie immédiate** de la valeur à la création d'une cote ; double-clic sur le texte, la ligne de cote ou les flèches = édition ; lignes d'attache prolongées quand la cote sort du segment.
- **Axe de rotation** (clic droit sur une ligne) : trait mixte, hors profil ; cotes depuis l'axe en Ø ; axe par défaut de la révolution.
- **1re cote d'une esquisse à main levée** : toute l'esquisse est mise à l'échelle (proportions gardées) ; congé / chanfrein par défaut proportionné (valeur ronde ≤ 20 % de la plus courte ligne).
- **Ligne en chaîne** (le 2e clic crée la ligne et arme la suivante), **Cercle** reste actif ; Échap termine.
- **Congés / chanfreins sur un rectangle coté** : la cote de longueur devient une cote d'ENTRAXE entre les côtés voisins → la valeur hors-tout est gardée (90 reste 90, congés compris).
- **Rectangle par le centre** : symétrie de DROITES (plus de segments entiers, incompatible avec un congé qui rogne un seul bout) + bouts d'axes sur les côtés → 90 × 64 + 4 congés = 0 DDL, tout blanc. Migration à l'ouverture pour les esquisses déjà congées.
- **Tangence orientée** : le côté du centre est relevé sur chaque état résolu puis imposé ; glisser le centre d'un congé ne retourne plus l'arc en grand cercle.
- **Lignes / cercles < 0,5 mm** : seuil de création en pixels écran (3 px), plus en mm.
- **Ctrl (Cmd sous macOS)** remplace Shift pour la multi-sélection, le rectangle par le centre et la cote paire ; Cmd+Z / Cmd+Y en esquisse.
- **Icône Centre de perçage** : cible + foret, en orange.
- **3D : arêtes rentrantes visibles** (épaulements, fonds de poche) : les faces des corps sont légèrement reculées (polygonOffset) pour que le trait d'arête ne soit plus masqué dans le creux.
Nouveau test `test_esquisse_regles` (couleurs/DDL, référence, priorité H/V, centre de congé glissé, rectangle par le centre + 4 congés, axe et Ø, mise à l'échelle, chaîne, Échap, ligne de 0,2 mm, hors-tout). Migration : `APP_VER` → `2026-10-16-001` ; badge **V0.1.39 → V0.1.40**.

### `2026-10-16-002`

**Paramètres (cotes nommées, expressions ƒx) et congés multi-coins pilotés par une seule cote, comme Fusion 360 (retours : « une seule cote est créée et elle pilote les autres » ; « dd1 = valeur… utiliser dd1 comme paramètre pour d'autres cotes » ; « je dois pouvoir les nommer moi-même »).**

- **Cote nommée** : dans la saisie d'une cote, « Longueur = 80 » lui donne le nom choisi par l'utilisateur ; l'étiquette affiche « Longueur=80.00 ».
- **Expressions ƒx** : une cote peut valoir « Longueur/2 », « (L - 2*Rc)/3 », « max(a; b) », « sqrt(x) », « sin(30) » (degrés)… ; étiquette « ƒx 40.00 ». Décimale « 12,5 » acceptée. Unités = celles affichées (mm, Ø, degrés).
- **Propagation** : modifier une cote nommée met à jour toutes les cotes qui en dépendent, dans TOUTES les esquisses, puis le modèle (aussi à la fermeture de l'esquisse).
- **Garde-fous** : référence circulaire, nom inconnu, nom déjà pris ou réservé → refus explicite, la cote garde sa valeur ; une expression devenue invalide (cote source supprimée) garde sa dernière valeur et s'affiche avec ⚠.
- **Renommage** : renommer une cote met à jour toutes les expressions qui l'utilisent.
- **Fenêtre « ƒx Paramètres »** (bandeau principal et barre d'esquisse) : paramètres libres (+ Paramètre, nom, expression, suppression) et cotes nommées / ƒx de toutes les esquisses, modifiables en place.
- **Enregistrés dans le fichier** (`params`, `name`, `expr` des cotes).
- **Congés multi-coins** : tous les coins traités pendant la même passe de l'outil Congé (ou Chanfrein) partagent UNE cote ; les suivants reçoivent « égal » au 1er. Clic direct sur un COIN (point commun à 2 lignes) = congé. Menu contextuel sur 3 lignes ou plus : « Congé sur tous les coins (une seule cote R) ». Échap = nouvelle passe, nouvelle cote.
- **Coin virtuel** : un coin référencé (accroché à l'origine, coté…) rogné par un congé / chanfrein reste un point sur les 2 droites → l'esquisse garde son ancrage (0 DDL).
- Solveur : plus d'ancrage doux sur un rayon « égal » à un rayon coté (il retenait les congés suivants).
Nouveau test `test_parametres` (évaluateur, nommage, ƒx, propagation entre esquisses, paramètres libres, cycles, renommage, fichier, congés multi-coins à cote unique, coin virtuel). Migration : `APP_VER` → `2026-10-16-002` ; badge **V0.1.40 → V0.1.41**.

### `2026-10-16-003`

**Régénération 3D bien plus rapide ; rectangle par le centre qui s'étire symétriquement ; présélection des arêtes en 3D (retours : « plus la pièce est grosse, plus c'est long… essaye sur Cavité Usinage » ; « la symétrie du rectangle a du mal à être bien ancrée » ; « la présélection des faces existe, mais pas des arêtes »).**

- **Régénération** (mesures sur « Cavité Usinage », 26 fonctions, noyau réel) : 1re extrusion 50 → 55 : **26,7 s → 6,8 s** ; retour 55 → 50 : 23 s → 6,7 s ; reconstruction sans changement : 1,6 s → 0,3 s ; dernier congé : 1,6 s → 0,8 s ; ouvrir / fermer une esquisse : 2,6 s → 1,4 s. Géométrie identique à V0.1.41 à chaque étape.
  - **Projetée toujours « modifiée »** : le test `d1>0.02||d2>0.02` (2 sens de parcours) était TOUJOURS vrai → chaque reconstruction relançait des passes complètes jusqu'à la limite. Corrigé (`min(d1,d2)`).
  - **Une lecture du solide par fonction consommatrice** (et non par entité projetée), esquisses traitées dans l'ordre de la timeline ; cache persistant des arêtes par signature du préfixe → aucune relecture quand rien n'a changé.
  - **Outils d'extrusion / révolution / perçage en cache** (même clé que les points de contrôle) : plus reconstruits quand le booléen vient du cache.
  - Points de contrôle : capacité 3 × la timeline (l'ancien et le nouveau préfixe coexistent pendant les passes).
- **Rectangle par le centre** : plus de point FIXE au centre ; glisser un coin ou un côté ÉTIRE la forme symétriquement, le centre de symétrie reste en place ; glisser le centre déplace tout le rectangle. Règle générale : glisser un coin d'une forme non cotée ou ancrée l'étire (comme Fusion) ; seule une forme entièrement cotée et libre se déplace en bloc.
- **Présélection des arêtes** au survol en 3D : surbrillance ORANGE SANGUINE (#FF5A1F), ruban à peine plus épais (1,6 px), prioritaire à ≤ 6 px du curseur ; une arête cachée derrière la face survolée est ignorée (point 3D corrigé de la perspective).
- **Mesure entre arêtes** : clic sur une arête = sélection (orange) ; **Ctrl/Cmd + clic** une 2e arête → droites parallèles : distance PERPENDICULAIRE ; droites quelconques : angle + distance mini ; cercles / arcs : entraxe et Ø (écart des plans si coaxiaux) ; droite + cercle : distance centre ↔ droite. La mesure faces existante accepte aussi Cmd sous macOS.
Nouveau test `test_regen_perf` (passes, rejeux partiels, aller-retour reproductible) ; `test_esquisse_regles` étendu (8e–8g) ; `test_esquisse_contraintes` B6 mis à jour (étirement). Migration : `APP_VER` → `2026-10-16-003` ; badge **V0.1.41 → V0.1.42**.

### `2026-10-16-004`

**Esquisses en 3D : entités de construction en pointillés (retour : « quand on sort de l'esquisse, les entités de construction doivent être en pointillés aussi en 3D ! »).**

- Lignes, cercles et arcs de **construction** des esquisses visibles : pointillés jaunes (tiret proportionné à la taille de l'esquisse) ; **axe de rotation** : tireté long orange, comme dans l'esquisse ; le profil reste en trait plein.
Migration : `APP_VER` → `2026-10-16-004` ; badge **V0.1.42 → V0.1.43**.

### `2026-10-16-005`

**Raccourcis clavier (esquisse et 3D) ; perçages répétables (retours : liste de raccourcis ; « on ne peut pas répéter la fonction perçage et c'est dommage »).**

- **Esquisse** : F1 coïncidence (2 points → fusion · point + ligne / cercle → point dessus · sinon outil Coïncident) · F2 H ou V selon l'inclinaison de chaque ligne sélectionnée · F3 tangence · F4 égalité · F5 parallèle · F6 perpendicularité · F7 milieu · F8 concentricité · F9 colinéaire · F10 symétrie · F12 blocage · H centre de perçage. Les touches F sont interceptées (F5 ne recharge plus la page en esquisse).
- **3D** : H perçage · R révolution · F congés · C chanfreins · M répétitions (E extrusion inchangé) ; jamais pendant une saisie ni avec Ctrl / Cmd / Alt.
- **Répétition du perçage** (linéaire, circulaire, symétrie) : l'esquisse des centres est clonée et transformée comme un profil ; taraudage, lamage, fraisure suivent ; la FAO reconnaît les trous répétés (noyau réel : 1 → 4 perçages M8).
Nouveau test `test_raccourcis`. Migration : `APP_VER` → `2026-10-16-005` ; badge **V0.1.43 → V0.1.44**.

### `2026-10-16-006`

**Cotes de rayon / diamètre façon mise en plan ; bouton Aide (retours : « positionner avec une ligne sous le texte, toujours dans la bonne direction, au congé côté extérieur » ; « en dessous de V0.1.xx un bouton Aide avec les principaux raccourcis »).**

- **Cotes R / Ø** : ligne d'attache RADIALE (par défaut la bissectrice de l'arc → toujours côté EXTÉRIEUR d'un congé ; 45° pour un cercle), flèche posée sur l'arc, coude puis **trait horizontal sous le texte**, vers la droite ou la gauche selon le côté. Diamètre : ligne traversant le cercle, flèches aux 2 bords. Glisser l'étiquette fait tourner la ligne autour du centre ; jamais à l'intérieur du cercle. Les anciens décalages R/Ø sont remis à zéro une fois par esquisse.
- **❔ Aide** (sous le badge de version, ou F1 hors esquisse, ou « ? ») : raccourcis d'esquisse (contraintes F1…F12, tracé, cotes, paramètres), raccourcis 3D, sélection et mesure, code couleur des esquisses. L'astuce « Ctrl/Cmd+clic : 2e face / arête : mesure » remplace « face 2 + entraxe ».
Tests : `test_esquisse_regles` (4h–4i), `test_raccourcis` (aide). Migration : `APP_VER` → `2026-10-16-006` ; badge **V0.1.44 → V0.1.45**.

### `2026-10-16-007`

**Esquisse : arcs projetés enfin justes (retour : « toujours un problème de projection des entités arc de cercle, il faut le régler une fois pour toutes »).**

- **Cause** : les références projetées (tirets violets) traçaient chaque arc du début à la fin de l'arête OCCT en sens trigonométrique, sans regarder son sens de parcours → pour une arête parcourue en sens horaire (congés concaves, encoches), c'était le **complément** qui s'affichait (293,6° au lieu de 66,4°) — d'où les quasi-cercles doublés.
- **Correctif** : l'arc est orienté par le **milieu réel** de l'arête (fonction `skArcRef`, même règle que l'outil Projeter) ; une arête **fermée** est un cercle (avant : test « corde ≈ circonférence », jamais vrai → « arc de 360° ») ; les références sont **dédoublonnées** (une arête était listée une fois par face adjacente).
Nouveau test `test_projection_arcs` (noyau réel : encoche concave R10 → 132,8° côté matière ; ancienne version : 4 × 293,6°). Migration : `APP_VER` → `2026-10-16-007` ; badge **V0.1.45 → V0.1.46**.

### `2026-10-16-008`

**Paramètres ƒx dans les fonctions 3D (suite de V0.1.41).**

- Les champs des fonctions acceptent une **valeur**, une **expression** (`L/10`, `Ep - 2`, `max(a; b)`…) ou **« nom = valeur »** : distance et dépouille d'extrusion, angle de révolution, rayon de congé (et rayon de chaque arête d'un congé / chanfrein exact), déplacement de face, dépouillage, coque, distance / angle de répétition, Ø, profondeurs, lamage, fraisure et longueur filetée du perçage.
- Une valeur de fonction nommée (ex. `Ep`) est utilisable partout : autres fonctions, cotes d'esquisse, paramètres libres — et inversement (une cote d'esquisse `L` pilote l'épaisseur, la profondeur de perçage…).
- Réévaluation au début de chaque reconstruction : modifier `L` met à jour toute la chaîne (esquisses, fonctions, solide) ; le nom de la fonction suit (« Extrusion Plaque 15mm ») ; les répétitions qui la copient sont resynchronisées. Distance d'extrusion : la valeur ƒx est une course, le sens reste celui choisi.
- Garde-fous identiques (nom inconnu, pris, réservé, référence circulaire) ; les valeurs ƒx des fonctions apparaissent dans la fenêtre « ƒx Paramètres » et sont enregistrées dans le fichier (`expr`, `pname`). Aide mise à jour.
- **Régénération en UNE passe** : les projections associatives sont mises à jour AVANT le rejeu principal, dans l'ordre de la timeline, avec recalage immédiat des esquisses posées sur faces et des instances de répétition ; le rejeu principal ne se fait qu'une fois. Signature des congés exacts calée sur la position d'origine des arêtes (plus sur le relevé rafraîchi à chaque rejeu). « Cavité Usinage », 1re extrusion 50 → 55 : **6,8 s → 3,5 s** (26,7 s en V0.1.41) ; reconstruction sans changement 0,3 s ; géométrie identique.
Nouveau test `test_parametres_3d` (noyau réel : L = 100 → 150 : épaisseur 10 → 15, perçage 8 → 13, solide à Z15). Migration : `APP_VER` → `2026-10-16-008` ; badge **V0.1.46 → V0.1.47**.

### `2026-10-16-009`

**Nouveau corps, Combiner (union / soustraction / intersection), menu « Création solide », vraie transparence (retours : « ajouter Nouveau Corps à l'extrusion… un modificateur d'union, de soustraction ou d'intersection » ; « un menu Création Solide » ; « une belle transparence douce et sauvegardable »).**

- **Extrusion « ◧ Nouveau corps »** (création et propriétés) : le volume naît dans un corps NEUF, séparé ; revenir à Plot / Poche le remet dans son corps d'origine.
- **⊕ Combiner** (Modifier le solide → Ensembles) : corps cible + corps outil, **union**, **soustraction** ou **intersection**, option « garder le corps outil ». Fonction de la timeline : le booléen s'applique avec l'état des corps outils à cet endroit ; sans « garder », l'outil est consommé (plus affiché). Signature = historique complet des corps outils → modifier l'outil met à jour la combinaison. Icônes ⊕ ⊖ ⊗.
- **Menu « 🧱 Création solide »** : Extrusion, Révolution, Perçage, Nouveau corps de pièce ; « Paramètres ƒx » et « Combiner » rejoignent « Modifier le solide » ; seule l'Esquisse reste en bouton direct. Raccourcis E / R / H / F / C / M inchangés.
- **Transparence vraie** par corps (panneau du corps) : nouveau curseur **Transparence** (0–90 %) — la matière n'écrit plus la profondeur, on voit l'INTÉRIEUR (poches, perçages, arêtes cachées), rendu doux ; l'ancien curseur devient **Intensité** (inchangé). Enregistrée avec la pièce (`gl` du corps).
Nouveau test `test_corps_combiner` (noyau réel : union Z0→40, soustraction percée, intersection Ø20×20, garder l'outil, outil modifié → trou borgne à Z10, transparence et fichier). Migration : `APP_VER` → `2026-10-16-009` ; badge **V0.1.47 → V0.1.48**.

### `2026-10-16-010`

**Transparence « verre dépoli » (retour : « plus de flou au début et moins voir les arêtes vives cachées par le modèle »).**

- **Courbe progressive** : aux faibles réglages la pièce reste **laiteuse** (10 % → opacité 0,97, 30 % → 0,84) et l'intérieur n'apparaît que flou ; elle ne devient vraiment claire qu'en fin de course (60 % → 0,57, 90 % → 0,25). Voile blanc « dépoli » plus marqué au début, matière mate.
- **Arêtes cachées atténuées** : passe « profondeur seule » du corps transparent, dessinée après sa couleur → les arêtes vives derrière la face avant ne sont plus tracées net ; elles ne transparaissent qu'à travers la matière, d'autant moins que la pièce est opaque. Les parois intérieures restent visibles.
Test `test_corps_combiner` (10) adapté à la courbe. Migration : `APP_VER` → `2026-10-16-010` ; badge **V0.1.48 → V0.1.49**.

### `2026-10-16-011`

**Transparence : passage doux, arêtes arrière grises, curseur dans le menu contextuel (retours : « le changement est un peu brutal… un changement doux » ; « les arêtes vives arrière peuvent être vues, mais en gris ou noir transparent, pas plein » ; « rajoute le slider au menu contextuel »).**

- **Transition douce depuis 0 %** : voile dépoli, rugosité et métal suivent progressivement le curseur (avant : voile 26 % et matière mate dès le 1er cran). 2 % → opacité 0,996, rugosité 0,42 ; écart d'image entre crans régulier.
- **Arêtes arrière en gris doux** (passe « voile ») : à travers un corps transparent elles apparaissent grises et estompées, jamais en noir plein ; sous un corps opaque, toujours invisibles.
- **🫧 Transparence dans le clic droit** (vue 3D et arbre), synchronisée avec le panneau du corps ; le curseur 🔆 est renommé « Intensité ».
Test `test_corps_combiner` (13, 14). Migration : `APP_VER` → `2026-10-16-011` ; badge **V0.1.49 → V0.1.50**.

### `2026-10-16-012`

**Transparence : les formes intérieures (perçages, parois de poche) n'apparaissent plus trop vite (retour : « travailler sur les formes intérieures, comme les perçages, qui apparaissent trop vite »).**

- **Cause** : la pièce transparente était dessinée en UNE passe, dans l'ordre quelconque de ses triangles — une paroi de perçage dessinée après la face avant se mélangeait PAR-DESSUS, presque à pleine intensité.
- **Rendu en 3 passes** : (1) profondeur seule (surface la plus proche) ; (2) **intérieur seul** (tout ce qui est derrière), intensité qui monte lentement — 30 % → quasi invisible (0,03), 60 % → à peine deviné, 90 % → net ; (3) surface avant par-dessus, jamais recouverte. Plan de coupe respecté ; les arêtes cachées restent grises et estompées.
Vérifié au navigateur (Perçages : 30 / 60 / 90 %). Migration : `APP_VER` → `2026-10-16-012` ; badge **V0.1.50 → V0.1.51**.

### `2026-10-16-013`

**Transparence : défaut de fond corrigé, tout s'estompe ensemble, filigrane visible sous tous les angles (retours : « à 0 on voit à travers » ; « les trous sont visibles sans transparence, surtout vu d'en bas » ; « tout doit devenir transparent en même temps, petit à petit, avec les arêtes arrière en filigrane » ; « on voit les arêtes en filigrane que par-dessous »).**

- **Défaut de fond (depuis toujours)** : three r147 compile une matière opaque avec l'alpha forcé à 1 ; passer en transparent exige une recompilation, jamais demandée (test `mat.needsUpdate!==undefined` toujours faux — propriété en écriture seule). La transparence était ignorée ou « collée » selon l'historique de la matière. Recompilation désormais demandée à chaque bascule opaque ↔ transparent.
- **Intensité seule** : passe de profondeur → la pièce s'estompe sur le FOND sans jamais montrer l'intérieur ni les arêtes arrière.
- **Transparence** : l'intérieur (perçages, poches) suit la même opacité que la surface → tout devient transparent EN MÊME TEMPS, petit à petit.
- **Arêtes arrière en filigrane** : seulement s'il y a un corps en transparence ; dessinées après le sol et les pièces opaques (avant : effacées par le sol, visibles seulement par-dessous), masquées par une pièce opaque.
Vérifié au navigateur (Perçages : Intensité 46 % ; Transparence 30 / 60 / 90 %, vue de dessus avec sol). Migration : `APP_VER` → `2026-10-16-013` ; badge **V0.1.51 → V0.1.52**.

### `2026-10-16-014`

**Transparence : trait en filigrane aligné sur la face du bas (retour : « un petit décalage entre la face du bas et le trait en filigrane »).**

- Le sol (et son plan miroir) était posé **0,5 mm** sous la pièce : à travers une pièce transparente, le REFLET de l'arête du bas apparaissait 1 mm plus bas que le trait en filigrane. Sol désormais collé à la pièce (0,02 mm, ou 1/10 000 de la taille).
- Arêtes : la visibilité du voile ne lève plus d'erreur sur une matière sans transparence numérique (overlay jamais interrompu).
Migration : `APP_VER` → `2026-10-16-014` ; badge **V0.1.52 → V0.1.53**.

### `2026-10-16-015`

**Congés / chanfreins 3D : défauts, sélection, arête seule, aperçu ; démarrage en fondu (retours : défauts 10 / 1 ; « 1 seule arête sélectionnée… les tangentes suivent » ; « une arête… le congé doit déborder devant et derrière » ; « pré-visualisation pas très visible » ; même code couleur que la vue 3D ; attendre OCCT au rafraîchissement + fondu, aussi à l'ouverture d'un modèle).**

- **Valeurs par défaut** : congé **10**, chanfrein **1**.
- **Sélection** : clic = CETTE arête (remplace) ; **Ctrl/Cmd + clic** = ajouter / retirer. La sélection et l'arbre ne contiennent QUE les arêtes cliquées — plus de « ribambelle » d'entrées « tangente » enregistrées (la chaîne se re-déduit au calcul ; les anciennes entrées sont nettoyées au rejeu) → pas de rebut si le solide change.
- **Case « arêtes tangentes »** : cochée → le congé suit la chaîne tangente de chaque arête ; **décochée → l'arête SEULE** (OCCT suit toujours la chaîne : pour une arête droite et convexe, l'outil — triangle du coin moins disque, ou triangle pour un chanfrein — est extrudé le long de l'arête en **débordant devant et derrière**, puis soustrait ; arête courbe ou concave → repli noyau avec avertissement).
- **Aperçu** : la pièce telle qu'elle sera, dans SA couleur, opaque, à la place de la pièce ; seules les **faces nouvelles** (congé / chanfrein) en **orange** (signature géométrique des faces). Avant : solide rouge translucide sur pièce estompée.
- **Arêtes** : même code que la vue 3D — survol en ruban orange sanguine, arête retenue en ruban orange (1,6 px).
- **Démarrage** : la vue 3D attend que le noyau OCCT ait recalculé la pièce en exact (indicateur « Chargement du noyau 3D… »), puis apparaît en **fondu** ; à l'**ouverture d'un modèle**, même fondu. Garde-fous : noyau en échec, ouverture locale sans .wasm (8 s), 60 s au plus, secours 4 s si l'ouverture échoue.
Nouveau test `test_conge_arete_seule` (noyau réel : arête tangente à un arc — cochée = 3 faces de congé, décochée = arête suivante restée vive, débord dans l'arc, chanfrein, solide valide) ; `test_conge_tangent` adapté (1 entrée, 10 faces : la chaîne suit au calcul). Migration : `APP_VER` → `2026-10-16-015` ; badge **V0.1.53 → V0.1.54**.

## 2026-10-16-016 · V0.1.55 — Menu ⚙ à droite de l'arborescence ; surlignage de face masqué par la matière
- **Cause** : le menu des réglages de visualisation (⚙) s'ouvrait par-dessus l'arborescence.
- **Correctif** : à l'ouverture, il se place à droite de l'arborescence, ou à droite de sa flèche quand elle est repliée (`src/95-toolbar.js`).
- **Cause** (Axe (1)) : la face cliquée était surlignée SANS test de profondeur — on la voyait à travers la pièce : paroi de poche « flottante » en orange, et la partie arrière du grand cylindre qui débordait en orange sur les congés de devant.
- **Correctif** : surlignage masqué par la matière devant lui (décalage de polygone pour rester au-dessus de sa propre face) ; seule exception, un corps en verre, où l'on voit la face au travers (`src/90-picking-mesure-import.js`).
Vérifié au navigateur (arbre déplié et replié ; clic sur le cylindre R28 d'Axe (1) : orange limité à la face, congés intacts). Migration : `APP_VER` → `2026-10-16-016` ; badge **V0.1.54 → V0.1.55**.

## 2026-10-16-017 · V0.1.56 — Repère façon Fusion ; origine du posage sur points cardinaux ; brut transparent, Z+ / Z−
- **Repère de l'appli** : l'AxesHelper (3 traits de 60 mm) est remplacé par un repère façon Fusion — point central, axes X/Y/Z à pointes, **3 petits plans** (couleurs des plans d'origine), taille **constante à l'écran**, dessiné devant la pièce. Survol = plan éclairci ; **clic = sélection du plan** (comme dans l'arbre : « Esquisse sur ce plan »). Il a sa ligne **« Repère »** dans le groupe **Origine** de l'arbre (œil = montrer/masquer, synchronisé avec Réglages → Repère). Nouveau `src/11-repere.js`.
- **Posage sélectionné** (ou une de ses opérations) : le **brut** apparaît en **ambre transparent**, le **repère du posage** est posé sur son origine et orienté selon le 3+2 (B/C), et les **27 points cardinaux** (8 coins, 12 milieux d'arêtes, 6 centres de faces, centre) s'affichent : **clic sur un point = origine du posage**. Fiche : « Origine sur » **Brut / Modèle** + raccourcis (dessus X0Y0, dessus centre, centre, dessous X0Y0). Les anciens préréglages sont lus à l'identique ; le G-code reste relatif à ce point, les parcours (repère monde) ne changent pas. Nouveau `src/89-fao-posage-repere.js`.
- **Brut** : la marge devient **Marge XY** + surépaisseurs **Z+** (dessus) et **Z−** (dessous), 0 par défaut (bruts existants inchangés).
Nouveau test `test_posage_repere` (27 points, préréglages historiques, point « milieu face X1 », libellés, repli modèle → brut, en-tête G-code, marges Z). Vérifié au navigateur sur Axe (1) : clic plan XZ → sélection ; posage → brut transparent, points, repère ; clic « dessus centre » → origine déplacée ; Z+ 3 / Z− 2 → brut 30,98 / −29,98 ; B −90 → repère basculé. Migration : `APP_VER` → `2026-10-16-017` ; badge **V0.1.55 → V0.1.56**.

## 2026-10-16-018 · V0.1.57 — Forme du brut : boîte, cylindre ou modèle
- **Fiche posage → Brut · bridage → Forme** : **Boîte** (défaut, inchangé), **Cylindre** ou **Modèle (corps)**.
- **Cylindre** : axe **X / Y / Z** (repère pièce) ; **Ø auto** = plus grande distance réelle des sommets du modèle à l'axe + marge XY (une pièce de révolution donne son Ø exact) ; **longueur auto** = modèle + Z+/Z− (axe Z) ou marge XY aux deux bouts (axe X/Y). Ø et L **saisissables** (0 = auto, bouton « Auto »). Le brut reste décrit par sa boîte englobante pour les parcours, plus `stock.cyl {axis, c, r}`.
- **Vue** : cylindre transparent (vue posage et visionneuse) ; **points cardinaux** du cylindre = centres des 2 faces, centre, 4 points de chaque cercle (les coins de la boîte, hors matière, sont retirés).
- **Simulation** : axe Z → colonnes hors du disque vides ; axe X/Y → dessus de colonne = génératrice du cylindre.
- **Modèle (corps)** : un corps du document EST le brut (fonderie, ébauche importée), sans marge, affiché en forme réelle transparente.
- **Fiche** : Marge XY sur une ligne, surépaisseurs Z+ / Z− sur la suivante (Z− passait seul à la ligne).
Test `test_posage_repere` complété (cylindre auto Z, saisi X, simulation disque et cylindre couché). Vérifié au navigateur sur Axe (1) : cylindre axe X auto Ø60 (R28 + 2) × 66. Migration : `APP_VER` → `2026-10-16-018` ; badge **V0.1.56 → V0.1.57**.

## 2026-10-16-019 · V0.1.58 — Repère du posage orienté : tous les calculs FAO dans SON repère
- **Principe** (demande atelier) : le repère du posage est le repère absolu de ses opérations, quel que soit le repère pièce. Coordonnées posage = rotation du repère pièce (p_f = Rᵀ·p) ; l'origine G-code (point cardinal) est prise ensuite dans ces coordonnées.
- **Fiche posage → Repère du posage** : **Axe Z** et **Axe X** = un axe du repère d'origine (±X, ±Y, ±Z) ou **« Face / arête »** cliquée dans la vue (face plane = normale sortante, face cylindrique = son axe, arête droite = sa direction) ; cases **Inverser**. Y = Z × X ; un X parallèle à Z est remplacé automatiquement par l'axe d'origine le moins aligné (affiché). Échap annule le clic.
- **Calculs dans le repère posage** : maillage d'usinage (`faoActiveMesh`), brut (boîte et cylindre, Ø auto compris), Z du modèle, arêtes des chaînes, trous détectés (solide OCCT tourné, `BRepBuilderAPI_Transform`), Z cliqué sur une face, normale du 3+2.
- **Affichage** : tout ce que la FAO dessine (aperçu, simulation, outil, matière, chaînes, perçages, brut, repère du posage) passe sous une racine dont la matrice = repère du posage actif.
- **Cache des parcours** : la clé du solide inclut le repère seulement s'il diffère du repère pièce → **aucun parcours existant à régénérer**, `CACHE_VER` inchangé.
Test `test_posage_repere` complété (identité, Z = +X, aller-retour, inversion, X parallèle, normale de face, maillage tourné, branchements, X automatique) ; `test_fao` : l'heuristique « pas de bouton +op dans la fiche » ne compte plus que les boutons (les options « +X / +Z » la déclenchaient). Vérifié au navigateur sur Axe (1) : Z posage = +X (clic sur la face d'extrémité) → brut cylindrique d'axe X, repère au centre de la face, **surfaçage** dans le plan de la face d'extrémité (Z posage 31) et G-code relatif (Z0). Migration : `APP_VER` → `2026-10-16-019` ; badge **V0.1.57 → V0.1.58**.

## 2026-10-16-020 · V0.1.59 — Repère propre par opération (3+2), Z0 du posage, petits plans d'origine
- **Repère du posage = repère d'usinage** : les cotes des fiches (Z, Haut, Bas, rectangles, îlots, plans « = … », brut) s'affichent et se saisissent **relatives à l'origine du posage** (Z0 = point cardinal choisi), plus en Z pièce. Les valeurs internes du document ne changent pas : aucune migration, aucun parcours à régénérer. La référence de plan **« Origine »** = Z0 du posage (avant : Z0 de la pièce).
- **Repère propre d'une opération** (onglet **Repère** de la fiche) : « Celui du posage » (défaut) ou « Propre (3+2) » : Axe Z / Axe X pris sur les axes du posage ou **Face / arête** cliquée ; **centre COMMUN avec le posage** (comme Fusion 360 : seuls les axes suivent les faces) ; un Z cliqué sur une face donne la **hauteur de travail** = cote de la face le long du Z incliné (Z, Haut ; profondeur gardée). La face donnée pour X n'est qu'une **indication de sens** : X est ramené dans le plan XY de l'opération.
- **Calcul** dans le repère de l'opération (maillage, brut, plans, arêtes, trous) puis ré-expression dans le repère du posage (arcs linéarisés) ; emprise XY = matière du modèle sur/au-dessus de la hauteur de travail (un surfaçage de chanfrein couvre le chanfrein, pas la boîte du brut vue en biais).
- **G-code** : orientation **B/C par opération** (Siemens : dégagement, `TRAORI(1)`, `G0 B… C…` ; retour `B0 C0` + `TRAFOOF`) ; Fagor 8065 (3 axes) : non commandé + alerte ; perçage incliné émis en déroulé G0/G1. Le 3+2 quitte la fiche posage (ligne visible seulement pour un ancien document qui en porte un).
- **Vue** : en opération, brut et points d'accroche masqués ; repère de l'opération dessiné au centre commun, orienté selon ses faces (une origine sur la face, enregistrée par un premier essai, est ignorée partout — calcul ET affichage) (repère du posage en plus petit). Repères FAO **sans plans**.
- **Repère pièce** : les **grands plans d'origine** (120 mm) sont remplacés par les **3 petits plans** du repère ; l'œil « Repère » masque axes + point, l'œil de chaque plan masque son plan — indépendamment.
Tests : `test_posage_repere` (opération : B/C, conversion de points, brut vu, arcs, G-code Siemens/Fagor, recalage des hauteurs, origine sur face, cotes relatives) ; `test_fao`, `test_fao_planes`, `test_fao_zlim`, `test_fao_fiche_onglets` adaptés (3+2 par opération, onglet Repère, cotes relatives). Vérifié au navigateur sur « Poche et Contour » : Z pris sur la face du chanfrein → centre commun (0, 0, 30), Z de travail 42,4264 = (68 + (22 − 30))/√2, passes exactement dans le plan du chanfrein (écart 0,000), sur la bande du chanfrein (Y −55 → 55), B −45 C 0. Migration : `APP_VER` → `2026-10-16-020` ; badge **V0.1.58 → V0.1.59**.

## 2026-10-16-021 · V0.1.60 — Simulation : outil orienté selon le Z de l'opération
- **Cause** : en lecture d'usinage, l'outil restait vertical (Z du posage) sur une opération à repère propre (3+2), et la matière était taillée comme par un outil vertical — usinage faux à l'écran.
- **Correctif** : chaque point de la visionneuse porte l'axe outil de son opération (repère posage) ; l'outil est **orienté le long du Z de l'opération** ; la matière (Z-map) est taillée par l'**enveloppe inférieure de l'outil incliné** — disque du bout incliné + génératrices du corps (4 × rayon), balayés par de fins cylindres verticaux (`faoMatterCarveTilt`) : rien sous le plan du bout d'outil.
- **Marches sur le chanfrein** (retour atelier) : un segment est taillé à sa cote la plus BASSE ; une passe qui descend la pente du chanfrein creusait donc chaque morceau joué jusqu'à son extrémité basse, et le morceau en cours (point interpolé, sans axe) repassait même par la taille verticale. Correctif : segments inclinés découpés en pas de hauteur (≈ 0,4 × pas de grille), axe outil pris sur le segment pour le morceau en cours.
Test `test_posage_repere` 35 (fraise à 45° : taillé jusqu'au plan du bout, jamais dessous) et 36 (passes qui descendent la pente : surface plane, ni marches ni creux). Vérifié au navigateur sur « Poche et Contour » : surfaçage du chanfrein à B −45 → fraise inclinée à 45°, porte-outil vers l'extérieur ; passes dans la pente (X = +X posage) : 7 028 colonnes de la bande du chanfrein, aucune à plus de 0,8 mm du plan (ni marche, ni creux). Migration : `APP_VER` → `2026-10-16-021` ; badge **V0.1.59 → V0.1.60**.

## V0.2.0 — Un seul numéro de version ; « MVP paramétrique » retiré
- **Version** : UN SEUL numéro, celui des tags Git (`V0.MINEUR.CORRECTIF`) — `APP_VER = 'V0.2.0'`, affiché par le badge en haut à droite, l'aide, l'en-tête des fichiers .miniFusion et « Code en mémoire ». L'ancien numéro daté (`2026-10-01-001` → `2026-10-16-021`) et son 2ᵉ badge (`#appVer`) disparaissent ; snapshots `Backup/fusion_mvp_V0.x.y.html`, entrées CHANGELOG `## V0.x.y`. `CACHE_VER` (parcours FAO) reste indépendant : aucun parcours à régénérer.
- **Bandeau** : l'étiquette « MVP paramétrique » est retirée.
Test `test_prodver_badge` réécrit (APP_VER au format des tags, badge = APP_VER, plus de « MVP » ni de 2ᵉ numéro dans la coque).

## V0.2.1 — Thèmes de couleur ; interface « Moderne » en option (l'actuelle reste intacte)
- **🎨 Thème** (dans les deux interfaces, en haut à droite) : **Nuit** (actuel), **Graphite**, **Atelier** (accents orange), **Clair**, **Contraste élevé** — variables CSS sur `body[data-theme]`, mémorisé. En Clair, la vue 3D et ses panneaux gardent leur habillage sombre.
- **▦ Interface** : **Classique** (l'interface actuelle, inchangée) ou **Moderne**, pour comparer — mémorisée. Le mode moderne n'ajoute que des éléments et des règles CSS sous `body.ui-modern` ; chaque bouton du ruban clique le bouton d'origine (même code, même effet) ; revenir en Classique ne laisse aucune trace.
- **Moderne** :
  - **espaces CAO / FAO** (onglets à côté du logo, et onglets **Modèle / Usinage** sur la vue) ;
  - **ruban** icône + libellé : CAO = Esquisse · Créer · Modifier · Ensembles · Fichier · Projet ; FAO = Posage · Opérations · Simulation · Calcul · Export ;
  - **barre rapide** ↶ ↷ 💾 ; **recherche de commandes** (Ctrl+K, flèches, Entrée) ;
  - **panneau Usinage à gauche** avec **onglets de posages** (+ pour en ajouter) ; la barre flottante « + Usinage » passe dans le ruban ;
  - **barre d'état** en bas (noyau, dernière mesure, enregistré, ⟳ Régénérer, unités, version) à la place des panneaux « Mesure » et « État » et de la rangée d'aide aux raccourcis ;
  - **cube de vue** (rendu three.js séparé qui suit la caméra ; clic sur une face = vue depuis cette face, ⌂ = iso) à la place des boutons Iso / Dessus / Face / Droite.
- **Retours atelier** (même version) : arbre remonté juste sous les onglets ; menu ⚙ ouvert à droite (sous son bouton) ; panneau Usinage à gauche avec son bouton de rabat sur le bord gauche (comme l'arbre) ; **jeu d'icônes au trait** (SVG, couleur du thème) pour tout le ruban, la barre rapide et le bouton thème, à la place des émojis.
- **Thème Clair = vue 3D claire** : fond de scène, sol miroir et canevas suivent le thème (`mf3D`, appelé aussi à la création de la scène) ; arbre, barre de vues, réglages, panneau Usinage et onglets passent en clair.
- **Esquisse** : bandeau d'outils et barre d'état **opaques** dans tous les thèmes ; en Clair, voile et panneau latéral clairs, dessin inversé (traits sombres sur fond clair, teintes des contraintes et cotes conservées).
Nouveau `src/97-interface-moderne.js`, nouveau test `test_interface_moderne` (28 boutons du ruban reliés à des commandes existantes, éléments modernes invisibles en classique, rien de détruit, 5 thèmes, mémorisation). Vérifié au navigateur : classique intacte ; moderne CAO et FAO ; cube juste sur ses 6 faces (vue iso : Face / Droite / Dessus) ; recherche « cong » → Congé ; thème Clair.

## V0.2.2 — README refait ; esquisse plein écran (moderne) ; corrections de l'interface
- **README** condensé (toutes les fonctions CAO / FAO / interface) avec **8 captures neuves** 1920×1080 dans `docs/captures/` : interfaces classique et moderne, thème clair, esquisse, pièce de révolution, posage FAO, simulation, 3+2.
- **Esquisse en interface moderne** : le bandeau d'outils d'esquisse **remplace le ruban** de modélisation et le panneau latéral (santé, sélection, contraintes, cotes) **passe dans le panneau de droite** — toute la vue pour dessiner. Fermeture ou retour en classique : tout revient à sa place (mêmes nœuds).
- **Bandeau d'esquisse (moderne) : icône + nom** sous chaque outil, contrainte et commande d'affichage (couleurs d'origine gardées : contraintes vertes, perçage orange, construction grise), sur **une seule ligne** à 1920 px ; le nom de l'esquisse passe en titre du panneau de droite.
- **Coïncident = contrainte** (bouton vert du groupe contraintes) : 2 points → confondus ; **1 point + 1 ligne → le point reste sur la DROITE et glisse aussi AU-DELÀ du segment** (distance à la droite infinie) ; 1 point + 1 cercle/arc → sur la courbe. L'outil blanc ⌖ est retiré du bandeau (F1 garde le mode « cliquer 2 extrémités »).
- **Esquisses dans la vue 3D** : traits forts en **blanc** (gris foncé en thème Clair) ; construction et axe inchangés.
- **Bandeaux adaptatifs** (ruban CAO/FAO et bandeau d'esquisse) : ≤ 1700 px boutons et noms resserrés ; ≤ 1500 px titres de groupes masqués, esquisse en icônes seules ; ≤ 1200 px ruban en icônes seules ; ≤ 900 px recherche masquée ; passage à la ligne au lieu d'un défilement caché (« Terminer » toujours visible).
- **Bouton de rabat du panneau Usinage** (moderne) : copié sur celui de l'arbre (bord gauche, même forme, même place) ; il ne saute plus au milieu de la vue une fois replié.
- **Thème Clair** : menus contextuels (arbre, pièce 3D, esquisse, bulles FAO) sur fond clair, lisibles ; fiche FAO et panneau Usinage lisibles (libellés, onglets, champs, cartes).
- Panneaux « Mesure » / « État » masqués en moderne repérés par leur titre (l'insertion du panneau d'esquisse décalait le repérage par rang).

## V0.2.3 — Fichiers façon logiciel : ouvrir, enregistrer (même fichier), enregistrer sous, récents, dossier de projets
- **Accès au disque** (Chrome / Edge, Windows et Mac — API d'accès aux fichiers) : vraies fenêtres **Ouvrir** et **Enregistrer sous** ; l'application garde le lien vers le fichier → **Enregistrer** (et `Ctrl+S`) **réécrit le même fichier**, sans nouvelle question ni suffixe « (1) ». **Ouvrir récent** (8 derniers fichiers, liens mémorisés) ; **Dossier de projets** : on choisit une fois le dossier des pièces, la liste de ses `.miniFusion` (triée par date) s'affiche, double-clic = ouvrir, « Enregistrer ici ». Permission redemandée par le navigateur une fois par session. Firefox / Safari : repli (sélecteur pour ouvrir, téléchargement pour enregistrer).
- **Ouvrir / Nouveau** : si la pièce a des modifications non enregistrées → **Enregistrer / Ne pas enregistrer / Annuler** ; puis l'espace est **vidé** (modes, esquisse, simulation, FAO, sélection, caches — `docResetEmpty`) avant de charger la nouvelle pièce, cadrée.
- **Bandeau** : nom du fichier + point « ● » tant que des modifications ne sont pas enregistrées (titre de l'onglet aussi). Interface moderne : **tous les boutons de fichier à côté d'« Enregistrer »** (Nouveau, Ouvrir, Ouvrir récent, Enregistrer, Enregistrer sous, Dossier de projets) ; le groupe « Projet » quitte le ruban. Classique : menu Projet + « Ouvrir récent… » et « Dossier de projets… ». Raccourcis `Ctrl+S`, `Ctrl+Maj+S`, `Ctrl+O`.
- **Esquisse** : menu contextuel — « Coïncident (point sur la droite) » pour point + ligne, « Coïncident (point sur le cercle / l'arc) » pour point + courbe ; le menu se **ferme au clic suivant**, dedans comme dehors.
Nouveau `src/97-fichiers-projets.js` ; `test_coincident_contrainte` complété (entrées du menu contextuel) ; `test_fao_reset` adapté (Nouveau asynchrone, réponse « Ne pas enregistrer »).

## V0.2.4 - Congés exacts : selects qui répondent, rayons qui se souviennent (Support Pédale R1200RT)
- **Mémoire de session** : le dernier **rayon** utilisé (congé et chanfrein mémorisés séparément) et le dernier état de la case **« arêtes tangentes »** sont retenus d'un passage en mode Congé au suivant (défauts inchangés au démarrage : R10 congé, R1 chanfrein, tangentes cochées). Avant : le rayon repartait à 10 à CHAQUE entrée — sur une pièce à faces étroites (bord de poche, épaulements de 2 mm), le rayon par défaut rendait l'aperçu muet au premier clic.
- **Aperçu qui explique** : quand le noyau refuse le lot, le message précise l'avertissement d'OCCT **et le rayon maximal vérifié** (sonde descendante 0,7 → 0,2 × le rayon demandé, comme au rejeu) — ex. « R10 impossible sur 1 arête — max vérifié : R1,4 ; réduisez le rayon ». Avant : absence silencieuse avec pour seul indice « Aperçu indisponible (noyau exact indisponible ou arête sans diagnostic) ». La sonde ne tourne qu'une fois par signature de sélection.
- **Arêtes tangentes visibles et expliquées** : les raccords lisses (G1 — bornes des congés déjà posés, transitions douces du bossage) sont dessinées en gris SOUS les vives et ont leur propre raycast (seuil plus serré). Un clic dessus répond : « arête TANGENTE — les deux faces se rejoignent en douceur, il n'y a rien à arrondir ici ; cliquez une arête vive ou une face ». Avant : clic ignoré, et le message d'aide parlait d'« arête bleue » alors qu'elles sont noires. Panneau : compteur « N vives · N grises ».
- **Raycast des vives resserré sur la couche vive seule** : en interrogeant les deux couches, une tangente plus proche gagnait le hit, l'index nul faisait échouer le clic sur une vive pourtant valide sous le curseur (regroupé sous 0,6 mm pour les grises, cible explicite).
- Panel/header : messages d'aide corrigés (vives noires, tangentes grises, aperçu = le résultat lui-même).
Tests : chk_syntaxe OK sur le livrable ; test_apercu_diff inchangé au vert (xPreviewShape rend désormais {shape:null,warns} en échec, null aux entrées vides comme avant) ; test_conge_tangent inchangé au vert (tangent persisté).

## V0.2.5 - Pivot d orbite au centre de la vue visible ; congé sur congé ; poser les repères du posage
- **Pivot d orbite centré sur la zone VISIBLE** (interface moderne) : la vue 3D est cadrée par le panneau Usinage à droite et l arbre / le panneau FAO à gauche — mais l orbite tournait autour du centre du CANVAS, d où un modèle qui « fuyait » vers la gauche quand un panneau couvrait un côté. Un décalage de vue (camera.setViewOffset) recentre le pivot sur la zone réellement dégagée ; cible, aimant des raycasts, miroir et étiquettes suivent (tout passe par la matrice de projection). Recalculé à chaque rabattement / ouverture d arbre, de panneau Usinage ou de changement d espace ; neutralisé pendant l édition d esquisse (caméra ortho alignée au plan) et quand rien ne couvre (écart < 2 px). S applique aussi au recalcul du cadre (Tout afficher).
- **Congé sur congé : plus de fragments noirs** sur les jonctions de congés (Support Pédale) : OCCT marque ces arêtes C0 alors que les deux surfaces sont TANGENTES (mesuré : 4 fragments de 2 à 7 mm avec dihédrale réelle de 0,0°, contre 24° minimum pour les vraies arêtes vives). La classification interroge maintenant la GÉOMÉTRIE quand le drapeau du noyau déclare une arête ive : normales des deux faces au droit de l arête (pcurve -> UV -> SLProps, 3 stations, toutes les paires de faces), un Maximum sous 3° sur toute l arête la passe en TANGENTE (grise, non sélectionnable) ; à la moindre mesure indisponible, le verdict d OCCT est gardé. Sur la pédale : 89 -> 85 vives, 64 -> 68 tangentes, les fragments fantômes ont disparu sans toucher aux vraies arêtes.
- **Espace Modèle : les visuels du posage s effacent** : en interface moderne, revenir sur Modèle masque le brut, le repère du posage, les points cardinaux et le contour — même si un posage reste sélectionné (ils réapparaissent au retour en Usinage). L interface classique ne change pas (le visuel suit la sélection).
- **Cube du CORPS en espace Usinage** : la sélection d un posage affiche maintenant l encadré du modèle usiné avec les MÊMES règles que le cube du brut (faces transparentes + arêtes), en blanc — toujours visible quel que soit le réglage de l origine (il remplace l ancien contour pointillé qui n apparaissait que posée sur le modèle). Les points cardinaux s en servent quand l origine est posée sur le modèle.
Nouveaux tests : test_vue_centre (pivot / décalage de vue : 8 scénarios + contrats de source), test_conge_sur_conge (rejeu réel de la pédale : 153 arêtes = 85 vives + 68 tangentes, fragments reclassés), test_ws_pose_cao (visuels effacés au retour Modèle, reconstruits au retour Usinage, contrats du cube du corps).

## V0.3.0 - Espace PLAN : mise en plan 2D (planches, vues projetées, cotes ISO, dessin)
- **3ᵉ espace CAO / FAO / PLAN** (`src/98-mise-en-plan.js`, ~2500 lignes) : overlay par-dessus la fenêtre 3D, bouton PLAN dans le bandeau moderne + onglet « Plan » + ruban dédié (Planches, Vues, Dessin, Cotes, Sortie) ; en classique, bouton « Plan 2D » dans la topbar. Toute la 3D reste accessible derrière.
- **Planches multiples** A0→A4, portrait/paysage, onglets (renommer au double-clic), cadre ISO + cartouche éditable (projet, auteur, date, échelle, n° planche) ; ajouter / dupliquer / supprimer.
- **Vues projetées PAR CORPS ou assemblée** : Face, Dessus, Côté, ISO, Caméra, Auxiliaire (perpendiculaire à la face sélectionnée en 3D via `faceNormalWorld`), Coupe (2 clics = ligne de coupe, demi-espace OCCT exact + hachures 45° sur les faces planes du plan), Détail (centre + rayon, rognage au cercle, échelle ×2 par défaut). Arêtes vives OCCT + tangentes + silhouettes de maillage (cylindres/sphères) ; arêtes partiellement cachées rognées par recherche de bornes (raycast + bissection) ; cercles reconnaissants (Ø réels).
- **Cotation complète** : UN outil intelligent (clic cercle → Ø, segment → longueur, 2 points → distance, Ctrl+2 segments → angle, Alt+cercle → R) ; tolérances ISO 286 (± symétrique, double, classes H7… s6 par plages Ø, table IT6–IT11 + déviations g/k/m/n/p/r/s) ; cotes de référence entre parenthèses ; format numérique français (virgule).
- **Dessin 2D façon esquisse** : ligne, rectangle, cercle, arc 3 points, point, ajuster (trim) — mini-solveur moindres carrés AUTONOME (coïncident, h/v, parallèle, perp, tangent, égale, distance, rayon, angle, point sur droite/cercle, milieu) ; snap sur la géométrie projetée (extrémités, milieux, centres, sur segment/cercle) et les points d'esquisse.
- **Persistance totale** : `doc.mep` vit dans le document — sauvegardé avec la pièce et la FAO (autosave, bundle `.miniFusion`, annuler/rétablir via le même canal que `doc.fao`) ; hooks dans `00` (literal), `90` (serialise/deserialise), `95` (docResetEmpty), `45` (cession Suppr/Escape).
- **Sortie** : export SVG de la planche (cadre + cartouche + tout le contenu) ; impression via fenêtre dédiée (`@page` paysage/portrait).
- Correctif : `mepVisible` / `mepVisFn` (signature), `mepOrtho`, boucle morte silhouettes, `diag` bbox réelle pour les coupes, priorité `upHint`, typo rebind cotes, libellé détail, `mepBeginAux` via normale de face, `mepAddView` annulable (push dans `mepEdit`).
- Tests : `test_mise_en_plan` (35 assertions : exports, activation, planches, vues Face/Dessus/ISO avec bases exactes, cotes, esquisse, undo, reset, serialise, tolérances, mfWs plan/cao) ; suite complète 103/103.

## V0.3.1 - PLAN : HLR de profondeur et vues projetées liées
- **Arêtes cachées masquées** : HLR de profondeur par vue, avec un mode gris pointillé sélectionnable par vue ; les contours noirs utilisent les silhouettes de maillage et les arêtes tangentes restent visibles (tolérance LOOSE).
- **Vues projetées du 1er angle** : une vue projetée est liée à sa vue mère (alignement et cascade lors du déplacement).
- **Reports** : le snap et l'inférence 2D de l'espace PLAN restent en attente (documenté, pas de régression).
- Tests : `test_mise_en_plan` complété (42 assertions : HLR, tangentes, vues projetées liées, cascade et alignement).

## V0.3.2 - Maintenance : FAO découpée, lint, CI et Git LFS
- **FAO découpée sans changer le livrable** : `src/88-fao.js` (12 652 lignes) est réparti en 12 fichiers contigus par domaine (`88-fao-00-entete` à `88-fao-94-selection`). L'ordre de concaténation de `build.js` est conservé et la concaténation a été vérifiée identique (hors espaces) à l'original.
- **Versions alignées** : `APP_VER`, `package.json`, README et CHANGELOG annoncent la même version ; les compteurs de sources et de suites sont corrigés (48 fichiers, 103 suites).
- **Lint progressif sans bundler** : `eslint.config.js` + `tools/lint.cjs` assemblent les sources dans l'ordre du build puis lintent le script concaténé. `no-undef` est une erreur, `no-empty` (catch vides) un avertissement ; `npm run lint` masque les avertissements, `npm run lint:all` les affiche.
- **Deux vrais défauts révélés par le lint** : `PRE` était déclaré dans le `try` mais lu dans le `catch` de `faoChainOk` (message d'erreur silencieusement perdu) ; `msgs` était lu hors portée dans le `catch` des fantômes de `refreshParts` (remplacé par `FR.msgs`). `skOffArm` est désormais déclaré et l'affectation morte `viewChanged` retirée.
- **CI minimale** : `.github/workflows/ci.yml` vérifie le build à jour, la syntaxe, un sous-ensemble rapide de 19 suites (`tests/run-fast.cjs`) et le lint. La suite complète reste `node tests/run.cjs`.
- **Git LFS** : `occt/*.wasm`, `Exemples/*.miniFusion` et `Exemples/*.step` sont suivis par LFS (`.gitattributes`) ; les blobs existants ont été convertis dans l'index. Cloner avec `git lfs install && git lfs pull`.
- **Deux tests réalignés** : `test_vue_centre` lisait `src/88-fao.js` (supprimé) et lit désormais les 12 morceaux `src/88-fao-*.js` ; `test_repeat_session` sélectionnait le premier champ des propriétés, devenu le nom du document, et ignore désormais `#docNameIn` pour viser le vrai champ de paramètre.
- Tests : `node build.js --check`, `node tests/chk_syntaxe.cjs`, `node tests/run-fast.cjs` (19/19), `node tools/lint.cjs` (0 erreur) et suite complète `node tests/run.cjs` (103/103).

## V0.3.3 - Réancrage des hôtes d'esquisse orphelins et faces recousues après congé
- **Hôte périmé d'esquisse** : quand la fonction porteuse d'une esquisse de face (`sk.host.feat`) a été supprimée ou remplacée (déplacement de face, re-création de l'extrusion…), `resolveSketchHost` sortait sans rien faire et l'esquisse restait figée à son origine enregistrée — le perçage restait « comme avant » après un déplacement de face. `resolveAllSketchHosts` réancre désormais l'hôte mort sur la face VIVANTE la plus proche (`reanchorSketchHost`), en privilégiant l'origine de l'esquisse pour conserver sa position ; les arêtes projetées ne servent qu'en secours.
- **Tolérance paramétrable** : `findHostForFace` accepte une tolérance (1 mm par défaut, 5 mm en secours) au lieu du seuil fixe codé en dur.
- **Face voisine scindée par un congé** : le repli ARÊTE PAR ARÊTE de `occFilletRun` (quand le lot OCCT échoue) pouvait laisser une face voisine — ou le congé lui-même — coupée en deux par une couture parasite. En fin de rejeu d'un corps, `occFinalShape` applique `occUnify` (comme après les fusions additives) **seulement si un congé/chanfrein exact est présent** : les faces de même surface sont recousues. Sans congé, rien n'est unifié, donc les coutures d'esquisse restent cliquables comme ancre de congé.
- Tests : nouveau `test_hote_oriphelin` (réancrage des trois esquisses orphelines du support pédale, sans déplacer celles dont l'origine tombe déjà sur une face vivante) ; `test_conge_sur_conge` réaligné (148 arêtes, 85 vives, 63 tangentes : les 5 arêtes recousues étaient des coutures de même surface ; les jonctions tangentes de 2 mm et 3,15 mm restent présentes). Suite complète 104/104.

## V0.3.4 - Filet taraudé réellement modélisé (ISO, impression 3D)
- **Cause** : un trou taraudé n'était qu'un perçage au Ø du taraud, recouvert d'un filet purement décoratif (spirale de maillage, `holeThreadOverlay`) — impossible à imprimer, le pas et le profil ISO n'existaient pas dans le solide exact.
- **Profondeur ISO** : `isoHoleThread(size,p,jeu)` calcule, d'après ISO 68-1 / ISO 965-1, `D1 = d − 1,082532·p` (Ø mineur), `D2 = d − 0,649519·p` (Ø sur flancs) et le profil interne (méplats crête `p/4`, racine `p/8`, flancs à 60°, course axiale `5p/16`). Le **jeu d'impression** est un jeu sur le diamètre (défaut 0,2 mm) : décalage radial `jeu/2`, d'où `rCrete = D1/2 + jeu/2` et `rRacine = D/2 + jeu/2`.
- **Noyau exact** : `occHoleThreadGroove(P,D,zStart,zLen…)` construit une gorge hélicoïdale d'un pas (rayons crête→racine→crête) et la balaie le long d'une hélice **BSpline lisse** (`GeomAPI_PointsToBSpline_2`) par `BRepOffsetAPI_MakePipeShell` (trièdre Frenet), puis l'ajoute à l'outil du trou dans `occShapeOfHole` : le fût est percé au Ø `max(perçage, rCrete)` et la gorge creuse le filet. Toute polyligne comme spine donnait un solide dégénéré (volume ~0) — d'où la BSpline.
- **Rapidité** : l'outil de perçage est un **composé** (fût + gorge) découpé en UNE passe OCCT, au lieu d'un fuse explicite de la gorge hélicoïdale (opération la plus coûteuse). Rejeu d'un M8×1,25 fileté : ~4,4 s → ~2,7 s (−40 %), pour un résultat identique (le fantôme d'aperçu du perçage est en plus maillé plus grossièrement).
- **Jonction hélice/pièce** : la gorge **dépasse l'entrée d'un pas** (et la sortie pour un débouchant) — les faces de cap tombent hors matière, plus de lèvre ni de couture au bord du trou (faces de la pièce : 30 → 26).
- **Filet « débouchant tout »** : nouveau mode de longueur filetée (à côté de Longueur / Jusqu'à la face / Prochaine face) — le filet suit toute la profondeur de la pièce.
- **Réglages** : case « Filet » (cosmétique / modélisé) et champ « Jeu d'impression (Ø mm) » dans les propriétés du trou ; `serialise` conserve `thread.model`/`thread.clear` ; le filet modélisé suit le taraudage, la longueur filetée `len`, le lamage/fraisure et le bout (débouchant/borgne). Longueur < un pas ou noyau maillage : repli en trou lisse avec message explicite (`filet modélisé impossible…` / `noyau exact requis…`), et plus de filet cosmétique superposé quand le filet est modélisé.
- **FAO** : `faoHolesDetect` recolle les bandes cylindriques découpées par la gorge et reconnaît le trou d'office (`modeled`) — sans quoi la couverture angulaire et la classification matière/creux, perturbées par le filet, faisaient disparaître le taraudage de la FAO ; l'association au perçage compare au Ø effectif `max(Ø taraud, D1+jeu)`.
- Tests : nouveau `test_filet_modele` (bloc 100×60×30, M8×1,25 débouchant 20 mm jeu 0,2 et borgne lamé Ø11×6 modélisé 10 mm jeu 0 : volume et classification de la gorge, matière intacte au-delà du Ø majeur, vide sous le Ø mineur, persistance, repli maillage, reconnaissance FAO, filet « débouchant tout » traversant). Suite complète 105/105.

## V0.3.5 - PLAN : cotes à l'échelle réelle, flip des vues de base, export/impression stylés
- **Cotes justes à toute échelle** : `mepDimMeasure` renvoyait des mm papier (longueur modèle × `view.scale`, distance papier) ; une vue 1:2 affichait donc la moitié des cotes. Les valeurs longueur/distance/Ø/R sont désormais calculées en **mm modèle** (les ancres et les éléments de géométrie le sont déjà) ; seules les positions restent en mm papier. Tests : vue 1:2 → 10 mm mesurés.
- **Cotes de longueur** : elles stockaient le point cliqué comme 2ᵉ ancre (`a=b`) → ligne de cote dégénérée. La cote porte maintenant sur les **deux extrémités réelles de l'arête**, et le décalage conserve le **côté du clic** (offset signé).
- **Flip** : `mepBasisOf` ignorait `flip` pour les vues de base (Face/Dessus/Côté/ISO) ; il inverse désormais `v` aussi pour elles, à l'affichage comme au rejeu.
- **HLR** : deux extrémités visibles ne garantissaient pas le milieu — une arête traversant derrière un corps restait entièrement visible. Le segment est subdivisé si son **milieu** est masqué.
- **Export SVG / impression** : les éléments ne portent que des classes alors que la feuille de style `#mepCss` restait dans le `<head>` → traits et cotes sans style (page et cercles noirs). La CSS du plan est désormais **embarquée** dans le SVG exporté et injectée dans la fenêtre d'impression ; l'id `#mepSvg` est retiré du clone pour ne pas écraser les dimensions mm.
- **Cartouche éditable** : champs Projet / Auteur / Date dans le panneau de planche (échelle et n° de planche restent automatiques).
- **Vues Caméra et Auxiliaire** : les fonctions existaient mais n'étaient jamais appelées ; boutons « Caméra » (direction de la caméra 3D) et « Auxiliaire » (face inclinée sélectionnée) ajoutés au ruban PLAN.
- **Lamage / fraisure ouverts sur le perçage** : la découpe en composé du fût et du lamage laissait une **membrane** au fond du lamage (et de la fraisure) — une surface fermait le trou. Les segments du profil sont désormais **fusionnés** en un seul outil : plus d'opercule (13 faces au lieu de 16 sur le trou lamé, aucun disque à Z24/Z27,9).
- **Filet modélisé robuste** : le bord de fermeture du profil de gorge se superposait à la racine (`r2`) ; `MakePipeShell` produisait alors, selon la longueur, un solide **auto-sécant** (volume faux ou négatif) qui faisait échouer les découpes suivantes — le filet « débouchant tout » disparaissait et le corps final pouvait devenir vide. Le bord est décalé de 0,03 mm (`SEAM`, sous la résolution d'impression) : profil simple, gorge valide à toute longueur.
- Tests : `test_mise_en_plan` passe à 50 assertions (cotes en mm modèle sur vue 1:2, flip de base, vue caméra) ; `test_filet_modele` à 19 assertions (3ᵉ trou fraisé, fond du lamage et de la fraisure ouverts, filet débouchant). Suite complète 105/105.

## V0.3.6 - PLAN : cotation (pré-sélection, placement, déplacement) + correctifs d'audit (undo, angles, ISO)
- **Annulation d'un glissement de vue** : `mepOnUp` prenait l'instantané undo **après** les mutations de `mepOnMove` → l'entrée mémorisait la position déjà déplacée et « Annuler » ne restaurait rien. L'instantané est désormais pris au **premier mouvement réel** (avant la mutation, projections incluses) ; la fin de geste valide sans re-snapshot (`mepEdit(..., noUndo)`).
- **Planche après undo/redo** : `docApplySnap` remplaçait `doc.mep` en bloc sans redessiner l'overlay ; `window.mepRefresh()` (appelé en fin de restauration) relance `mepRender()` si l'espace PLAN est ouvert.
- **Angles** : `mepDimMeasure` repliait tout angle > 90° sur son supplément (120° affiché 60°) alors que l'arc dessiné par `mepDrawDim` va jusqu'à 180°. Le repli se fait maintenant à 180° (`mepAngleDeg`, `%360`), texte et arc concordent.
- **ISO 286 — signe de `g`** : `mepTolRange` traitait `MEP_DEV.g` comme un `ei` positif ; pour un arbre `g`, `es = −dev` et `ei = es − IT`. `g6` sort désormais négatif (Ø20 : −0,007 / −0,020) et l'alésage `G` positif (+0,007 / +0,028) ; les alésages `K…S` sont également miroir de l'arbre correspondant.
- **Ajustements `H7/g6`** : le sélecteur de classe propose les ajustements usuels (`H7/g6`, `H7/h6`, `H7/js6`, `H7/k6`, `H7/n6`, `H7/p6`, `H7/s6`, `H8/h7`, `H9/h9`, `H11/h11`) ; `mepTolRange` les décompose en alésage + arbre et `mepDimText` affiche les deux plages (`Ø20 H7/g6 (+0,021/0 ; −0,007/−0,020)`).
- Tests : `test_mise_en_plan` à **57 assertions** (+ angle 120°/240°, `g6`/`G7`, ajustement `H7/g6`, undo de glissement). `node build.js`, lint 0, syntaxe OK, `run-fast` 19/19, suite complète **105/105**.
- **Cotation : pré-sélection, placement et déplacement (2026-10-19)** : en mode sélection, un clic sur une arête/cercle/arc le **pré-sélectionne** (surlignage jaune, Ctrl/Shift pour ajouter, 2 entités max) ; le bouton **Cote** construit alors le type de cote attendu (1 ligne → longueur, 1 cercle → Ø, 1 arc → R, 2 lignes → angle ou distance si parallèles, 2 cercles → entraxe, cercle+droite → distance perpendiculaire). La cote en cours suit la souris en **aperçu fantôme** et se pose au clic ; Échap l'annule sans perdre la sélection.
- **Cotes déplaçables** : un clic sur l'étiquette d'une cote la sélectionne et un glisser la déplace (offset perpendiculaire pour les cotes linéaires, translation de l'ancre pour Ø/R, rayon pour les angles). Undo est empilé au **premier mouvement** du geste (même schéma que le glissement de vue), et un clic sans déplacement (seuil 3 px) ne déplace rien.
- **Placement exact du texte** : les cotes Ø/R placent l'étiquette au point choisi (`b`) et le leader pointe la circonférence ; `mepDimAt` teste la **position réelle** de l'étiquette. L'offset `0` est honoré (l'ancien `d.off||8` forçait 8 mm). Les cotes angulaires sont centrées sur le **sommet réel** (intersection des deux droites) et leur rayon se règle au glisser.
- **Sélection sans texte bleu** : le SVG du plan interdit la sélection native de texte (`user-select:none`) et les textes d'étiquettes/cotes ne captent plus le pointeur (`pointer-events:none`) ; cliquer/glisser une cote ne surligne plus tous les libellés de vues. Une cote sélectionnée passe en **rouge** (ligne, texte et flèches), et les étiquettes/cotes ont un liseré blanc (`paint-order`) pour rester lisibles au-dessus des traits.
- Tests : `test_mise_en_plan` à **64 assertions** (+ étiquette linéaire à l'offset demandé, glisser de cote, offset 0, placement Ø et hit-test). `node build.js --check`, lint 0, syntaxe OK, `run-fast` 19/19, suite complète **105/105**.

## V0.3.7 - PLAN : silhouettes cachées non forcées en noir + menus contextuels nettoyés

- **Silhouettes PLAN** : l'heuristique de fermeture des chaînes de silhouette (V0.3.6 de travail) promouvait des arêtes cachées en traits noirs et laissait des fragments incomplets. Elle est retirée : le HLR strict reprend la main et les arêtes cachées restent supprimées (ou pointillées en mode `dash`). Le vide de contour signalé reste à traiter par une méthode ciblée, sans noircir les silhouettes masquées.
- **Menus** : les menus ouverts (`.dd`, `.mfPop`, menus contextuels, `#setMenu`) sont fermés à chaque changement d'espace CAO/FAO/PLAN, de fonction, d'opération FAO ou d'outil PLAN. Le panneau de propriétés génériques est masqué quand un panneau contextuel PLAN ou une esquisse est affiché : un seul menu de catégorie reste visible, plus d'empilement sous la fonction active.
- **Sélection PLAN** : changer d'outil efface la vue/cote sélectionnée et rafraîchit le panneau latéral ; la sortie de PLAN efface aussi la sélection.
- Tests : `test_mise_en_plan`, `build --check`, syntaxe, `run-fast` et lint.

## V0.3.8 - PLAN : HLR exact OCCT, cotation orientée et sélections par espace

- **HLR exact OCCT** : `mepHlrExact` utilise `HLRAppli_ReflectLines` et récupère les arêtes exactes `Sharp`, `OutLine` et `Rg1Line`, visibles et cachées. Les contours de révolution, les congés et les occultations ne dépendent plus du maillage ni du tampon de profondeur logiciel. Le mode `dash` conserve les cachées en pointillé, la coupe réutilise la matière coupée et les hachures, et l'ancien HLR reste disponible via la case **HLR exact OCCT** de la vue.
- **Cotation PLAN** : orientation **Alignée (A) / Horizontale (X) / Verticale (Y)** au clic droit, verrouillage du choix pendant la pose et conservation de l'orientation au déplacement. La sélection d'arêtes et le survol sont effacés après création/pose ; un clic sans déplacement sur une vue ne pré-sélectionne plus d'arête.
- **Lisibilité** : rendu PLAN en `geometricPrecision`, arêtes vives/tangentes plus contrastées, DPR 3D HiDPI (1,25 à 2) et couleurs d'arêtes 3D adoucies.
- **Espaces** : les visuels FAO (brut, cubes, repères, points cardinaux) ne s'affichent que dans l'espace FAO en interface moderne ; les sélections CAO/FAO sont restaurées au retour et la sélection posage/opération reconstruit correctement les repères.
- Tests : `npm run ci`, `test_mise_en_plan`, CDP PLAN UI **19/19**, CDP espaces **15/15**, HLR exact validé sur les 3 vues (environ 80 ms contre 49 ms en logiciel sur l'exemple), coupe + hachures et mode pointillé contrôlés.

## V0.3.9 - PLAN : traits d'axe, flèches inversables, étiquette décalable et tolérances empilées

- **Traits d'axe** : détection automatique des trous, axes d'alignement, cercles de perçage et tracé libre. Rendu ISO 128-2 / ISO 15786 en trait mixte rouge, croix de trou en trait fort, dépassements et priorité aux axes manuels ; les vues projetées, coupes et détails héritent des réglages automatiques. Les axes sont sélectionnables, supprimables et sérialisés avec la planche.
- **Flèches de cote** : un double-clic sur une flèche inverse les deux flèches (intérieures/extérieures). Le réglage est également disponible dans le panneau de la cote et conservé dans le document.
- **Étiquette de cote** : le glisser de l'étiquette permet maintenant un décalage gauche/droite le long de la ligne de cote, avec aimantation exacte au centre ; le panneau propose aussi un champ de décalage et le bouton **Centrer**.
- **Tolérances** : les écarts supérieur et inférieur sont empilés à droite de la valeur nominale (double, ± symétrique et classes ISO 286), au lieu d'être affichés sur une seule ligne. Les textes personnalisés restent prioritaires.
- Tests : `test_mise_en_plan` complété (axes, inversion des flèches, décalage/centrage de l'étiquette, tolérances empilées), `build.js --check`, syntaxe, lint et `run-fast` **19/19** ; rendu axes et tolérances contrôlé sous Chrome headless.

## V0.3.10 - PLAN : cotes attrapables par n'importe quel trait, tolérances resserrées et affinages de rendu

- **Cotes attrapables en outil Cotation** : après pose, n'importe quel trait rouge (ligne de cote, rappel, leader, arc, soulignement) sélectionne la cote et démarre son déplacement, sans repasser par l'outil Sélection. Le hit-test utilise la géométrie réellement dessinée.
- **Texte avant Ø/R** : le préfixe se place désormais avant le symbole (`2x Ø20`), pas après (`Ø2x 20`).
- **Tolérances bilatérales** : la tolérance mini est alignée sur la valeur de cote, la max est surélevée pour laisser **0,45 mm** de jeu ; les soulignements/extensions des cotes de perçage et tolérancées sont raccourcis.
- **Curseur** : croix noire plus épaisse dans l'espace PLAN.
- Tests : `test_mise_en_plan` complété (drag par trait, préfixe Ø/R, interligne tolérances), `build.js --check`, syntaxe, lint et `run-fast` **19/19** ; rendu cotes/tolérances contrôlé sous Chrome headless.

## V0.3.11 - PLAN : souris exacte en X, fond et papier selon le thème, règles, cartouche enrichi, exports PDF/DXF, perçages auto et nomenclature
### Souris : décalage en X
- **Cause** : la planche garde ses proportions dans la fenêtre et y est **centrée** (`preserveAspectRatio` « meet ») ; dès que la fenêtre est plus large que la planche (A3 paysage sur écran large), des bandes apparaissent à gauche et à droite. `mepPt` convertissait la souris en mm papier comme si la planche était **étirée** sur toute la largeur → décalage en X croissant vers les bords (49 mm mesurés sur une A3 dans une fenêtre 998 × 529), Y exact : entités et cotes impossibles à attraper. `mepPxToMm` faisait la même hypothèse (tolérances de clic et déplacement de la vue faussés).
- **Correctif** : conversion par la matrice écran ↔ planche du navigateur (`getScreenCTM`), exacte quels que soient les proportions, le zoom et le centrage ; repli sans matrice = même centrage « meet » calculé à la main ; échelle mm/pixel = celle de la matrice. L'API de test `dimPaperDown` simule ses clics avec le même centrage.
Vérifié au navigateur (A3 paysage, fenêtre large : écart de 49 mm supprimé) ; `test_mise_en_plan` vert.
### Intégration aux thèmes
- **Fond de travail par thème** (Nuit, Graphite, Atelier, Clair, Contraste) et **planche ombrée**. Toutes les couleurs du plan sont des variables CSS posées sur l'espace PLAN ; leurs valeurs par défaut sont la palette d'impression noir sur blanc. Résultat : l'export SVG, l'impression et le PDF restent ISO sans traitement particulier.
- **Papier sombre** (option « Papier (écran) : Blanc / Sombre ») : planche sombre et traits clairs pour le confort à l'écran. L'export reste en noir sur blanc.
- **Cotes à l'écran** dans la couleur d'accent du thème (case « thème », par défaut) ou dans une couleur libre. Elles sont **toujours noires à l'export et à l'impression**. L'ancien défaut bleu `#0a84ff` mémorisé est converti en « thème ».
- Lisibilité selon le fond :
  - curseur en croix blanche sur fond sombre ;
  - traits d'axe rouges à l'écran, noirs à l'export ;
  - hachures, cachés, esquisse et flèches suivent la palette (couleur portée par des classes, plus d'attributs figés).
### Confort
- **Règles en mm** en haut et à gauche (Y compté depuis le bas de la planche). Le pas s'adapte au zoom, un repère suit le curseur et les règles se masquent par une case. Les **coordonnées X/Y** du curseur s'affichent en bas à droite.
- **Double-clic molette** = planche entière ; règles redessinées quand la fenêtre change de taille.
- **Épaisseurs de trait ISO 128** : préréglages Écran, 0,7/0,35 et 0,5/0,25, ou valeurs libres (épais, fin, caché, cotes). Elles sont posées sur le SVG, donc conservées à l'export.
### Cartouche enrichi
- **Deux rangées** :
  - PROJET | PLANCHE | ÉCHELLE | DATE | DESSINÉ PAR ;
  - MATIÈRE | TRAITEMENT | TOL. GÉNÉRALES (ISO 2768-f/m/c/v, mK, fH) | INDICE.
- **Logo** (image réduite à 240 px, stockée dans le fichier).
- **Tableau des révisions** au-dessus du cartouche : bouton « + Révision », indices A, B, C…, la plus récente en haut. L'INDICE du cartouche reprend la dernière révision.
### Exports
- **DXF R12**, lu sur la planche affichée : chaque élément est ramené en mm papier par sa matrice écran.
  - Calques CONTOUR, TANGENTE, CACHE (DASHED), AXE (CENTER), COTES, HACHURES, CADRE, CARTOUCHE, TEXTE, ESQUISSE.
  - Origine en bas à gauche.
  - Cercles et chemins droits exacts ; courbes échantillonnées à 0,25 mm au plus.
  - Flèches en SOLID ; textes en TEXT, accents en `\U+XXXX`.
- **PDF** : la fenêtre d'impression prend le **format exact de la planche, sans marge** (`@page` en mm), pour un PDF vectoriel à l'échelle 1:1 via « Enregistrer au format PDF ». Cela corrige aussi l'ancienne règle `@page` invalide (point-virgule manquant). Boutons DXF et PDF dans le ruban et dans le panneau.
### Perçages auto et nomenclature
- **« Coter les perçages »** (ruban « Perçages auto » ou panneau) : une étiquette par fonction Perçage et par vue où son axe est vu de bout, préfixée « n× » quand il y a plusieurs trous (ex. `4× M6 déb. / Ø5 déb.`).
  - Elle se place sur le trou le plus en haut à droite.
  - Les perçages déjà cotés ne sont pas touchés.
  - Elle s'applique à la vue sélectionnée, sinon à toute la planche.
- **Nomenclature** (case dans le panneau) : un tableau REP. | QTÉ | DÉSIGNATION | MATIÈRE | DIMENSIONS est posé au-dessus du cartouche, à gauche, en-tête en bas.
  - Il liste les corps visibles ; les corps de même nom, dimensions et matière sont regroupés.
  - Matière par corps, sinon celle du cartouche.
  - Dimensions issues de la boîte englobante.
  - La duplication d'une planche garde la nomenclature.
Vérifié au navigateur : thèmes Nuit/Clair, papier sombre, règles et coordonnées (centre A3 = 210 / 148,5), cartouche avec logo et révisions, DXF retracé à l'identique, « 4× M6 » sur l'exemple Perçages. `test_mise_en_plan` complété (cartouche, révisions, exports) ; `npm run ci` vert.

## V0.3.12 - PLAN : cartouche dessiné (esquisse contrainte), contraintes 2D, champ TTH, sélection au cadre

### Cartouche personnalisable
- **TTH** (traitement thermique) ajouté au cartouche. La rangée 2 devient MATIÈRE | TTS | TTH | TOL. GÉNÉRALES | INDICE. Le panneau propose « TTS (surface) » et « TTH (thermique) », avec des listes de saisie (usages courants et valeurs déjà employées, mémorisées localement).
- **« Dessiner / Éditer le cartouche »** (ruban « Cartouche » ou panneau) : le cartouche devient une **esquisse contrainte**.
  - Il est ancré au coin bas-droit intérieur du cadre (ISO 7200) : un même modèle sert de l'A4 à l'A0.
  - Au premier passage, le Standard est converti en esquisse complète : traits épais et fins, séparateurs, libellés et champs, entièrement coté (largeur, hauteurs, positions des séparateurs, placement des textes).
  - Une cote modifiée fait suivre séparateurs et textes.
- **Textes et champs** (outil « Texte ») :
  - texte libre, ou champ : projet, n° de plan, société, planche, échelle, format, date, dessiné/vérifié par, matière, TTS, TTH, tolérances générales, état de surface, masse, indice, ou champ personnalisé ;
  - réglages : hauteur, maigre ou gras, ancrage début/centre/fin, largeur maxi (le texte trop long est tronqué par « … ») ;
  - les **valeurs restent sur la planche** : changer de modèle ne perd aucune saisie, et les champs vides s'affichent `{MATIÈRE}` en édition.
- **Zone logo** (outil dédié) : l'image du cartouche y est ajustée.
- **Bibliothèque de modèles** (ce navigateur) :
  - « Enregistrer… », choix du modèle (Standard ou ★ modèles) ;
  - « Par défaut » pour les nouvelles planches, « Retirer de la bibliothèque » ;
  - « Repartir du Standard ».
- La hauteur réservée au cartouche suit l'esquisse. Révisions et nomenclature se posent au-dessus. Export DXF : calque CARTOUCHE.
### Esquisse 2D contrainte (planche et cartouche)
- **Solveur** (Levenberg-Marquardt) :
  - jacobien creux : chaque contrainte ne dérive que ses propres points ;
  - points fixes exclus des variables ;
  - pas acceptés seulement s'ils réduisent l'écart.
- **Nouveaux types de contraintes** : `fix`, `distX`, `distY`, `distPL` (point–ligne), `eqR` (rayons égaux). Arcs pris en charge par tangent, rayon et « sur cercle ».
- **Outils** :
  - ligne enchaînée (Échap ou clic droit termine) ;
  - accrochage sur les points (réutilisés, plus de doublons), les milieux, et « sur ligne / sur cercle » (la contrainte est posée automatiquement) ;
  - H/V automatiques à ±3° ;
  - rectangle sur 4 points partagés ;
  - arc avec extrémités sur le cercle ;
  - outil Texte.
- **Sélection** : clic, Maj+clic pour ajouter ; points, traits, textes, contraintes. **Glisser** sous contraintes. Un élément coté ou fixé ne se déforme pas : la barre d'état invite à modifier la cote.
- **Panneau de contraintes** :
  - géométriques : Coïncident (fusion des points), Horizontal, Vertical, Parallèle, Perpendiculaire, Égal, Milieu, Sur ligne, Sur cercle, Tangent, Concentrique, Fixe ;
  - **cotes pilotantes** : Distance, Dist. horizontale, Dist. verticale, Rayon, Angle, posées à la valeur actuelle puis modifiables (champ focalisé) ;
  - une contrainte contradictoire ou redondante est **refusée** et la géométrie restaurée ;
  - Suppr supprime la sélection.
- **Affichage d'édition** (jamais exporté ni imprimé) :
  - points, et points fixes en rouge ;
  - glyphes H, V, ∥, ⊥, =, T, M et ancre ;
  - cotes pilotantes avec leur valeur, placée contre l'élément coté ;
  - les cotes de placement d'un texte n'apparaissent qu'à sa sélection.
### Sélection au cadre (planche et cartouche)
- **De gauche à droite** = fenêtre (cadre bleu plein) : seuls les éléments **entièrement dedans** sont pris.
- **De droite à gauche** = capture (cadre vert en pointillés) : **tout ce qui touche ou traverse** le cadre est pris.
- Maj ou Ctrl ajoute à la sélection.
- **Planche** :
  - le cadre attrape les éléments d'esquisse, les **vues** et les **cotes** (lot surligné) ;
  - Suppr ou « Supprimer » efface tout en une seule annulation (les vues filles et leurs cotes suivent) ;
  - Échap désélectionne.
- **Cartouche en édition** : le cadre attrape traits, textes, zone logo et points isolés.
  - Partir d'un texte non sélectionné trace un cadre ; un simple clic le sélectionne ; un texte déjà sélectionné se déplace au glisser.
- Le cadre démarre sur le fond. Partir d'une vue ou d'un trait garde le comportement habituel (sélection, déplacement).
### Correctifs
- L'esquisse de planche n'était **jamais dessinée** : le rendu passait `sh.sk` au lieu de la planche.
- Le dessin en 2 clics (ligne, rectangle, cercle, arc) **n'aboutissait jamais** : le relâchement du 1er clic effaçait le tracé en cours.
- Supprimer un trait n'efface plus les points isolés de l'esquisse.

Vérifié au navigateur :
- conversion du Standard ;
- glisser bloqué d'un séparateur coté ;
- cote 286 → 250 mm, les textes suivent ;
- rectangle accroché au coin du cartouche (3 points neufs, 4 contraintes) ;
- ligne enchaînée avec H/V et « sur ligne » automatiques ;
- rendu final et DXF (calque CARTOUCHE, valeurs C45, Nitruration).

`test_mise_en_plan` complété : cartouche Standard → esquisse (26 mm, TTS/TTH), cote de largeur, champs, rectangle + cote pilotante, contrainte refusée, sélection fenêtre/capture. Navigateur : capture de 2 vues, fenêtre d'une seule vue, fenêtre et capture dans le cartouche. `npm run ci` vert.

## V0.3.13 - PLAN : ruban réorganisé, projection à la souris, coupe / détail / auxiliaire interactifs, style des traits, export en couleur

### Ruban PLAN
- **Une icône dédiée par commande** :
  - nouvelle et duplication de planche, cartouche ;
  - vue de base, projection, ISO, auxiliaire, coupe, détail ;
  - ligne, rectangle, cercle, arc, point, ajuster, texte ;
  - cote, perçage, perçages auto ;
  - SVG, DXF, PDF.
- Auparavant, plusieurs icônes étaient empruntées à la CAO (esquisse, motif, combiner…).
- **« Dessus » et « Côté » retirés**, remplacés par **« Projection »**. Les boutons de projection du panneau de vue sont supprimés.
### Projection
- Depuis la vue sélectionnée (ou cliquée), **la position de la souris choisit la vue**, en 1er angle :
  - à droite : côté gauche ;
  - à gauche : côté droit ;
  - dessous : vue de dessus ;
  - dessus : vue de dessous ;
  - en diagonale : ISO.
- Aperçu à la **taille réelle** (boîte du modèle projetée dans la base de la future vue), aligné sur la mère.
- Clic pour poser, **enchaînable**, Échap ou clic droit pour terminer.
### Coupe
- **2 points sur une vue**, avec accrochage à la géométrie et alignement **H/V automatique à ±8°** (Maj : libre).
- Puis **la vue suit la souris**, et le côté de la souris donne le sens du regard.
- La vue en coupe est **alignée sur la mère** : base tournée comme une projection, même échelle, glisser contraint sur la ligne de rappel (case « Alignée sur la mère » pour délier).
- **Tracé ISO 128-44** : trait mixte fin, extrémités épaisses, flèches dans le sens du regard (vers la vue posée), lettre à chaque extrémité. **Noir à l'export** (avant : bleu d'écran imprimé).
### Détail
- Centre, rayon, puis **placement libre à la souris** (aperçu du cercle agrandi).
- Échelle choisie : au moins ×2 la mère, pour un détail d'environ 70 mm, parmi les échelles normalisées.
- **Contour du détail** en trait mixte autour de la vue. Le cercle repère sur la mère est un trait fin noir (avant : style « sélection » bleu imprimé), avec sa lettre en haut à droite.
### Auxiliaire
- **Clic sur une arête inclinée** d'une vue, puis la vue se pose **perpendiculairement à l'arête**, du côté de la souris. Elle est alignée et contrainte comme une projection.
- Plus besoin de sélectionner une face en 3D.
- Le rejeu de la mère recalcule les coupes et auxiliaires alignées.
### Style des traits dessinés
- **Épaisseur, type et couleur par élément** (lignes, rectangles, cercles, arcs ; couleur aussi pour les textes), sur la planche comme au cartouche :
  - Fin / Épais (réglages « Traits » de la planche) ou **épaisseur libre en mm** ;
  - Continu / Interrompu / Mixte ;
  - **couleur** libre, ou « Auto » (encre du thème).
- Sélection : le panneau modifie les éléments choisis. Outil de dessin actif, sans sélection : **style des nouveaux éléments** (mémorisé).
- « Ajuster » garde le style des tronçons.
- Les traits de l'esquisse de planche ont maintenant l'épaisseur « trait épais » par défaut (avant : 1 mm, faute de règle).
### Export PDF / SVG / impression
- **En couleur par défaut** :
  - cotes à la couleur choisie (ou celle du thème) ;
  - axes en rouge ;
  - traits colorés gardés ;
  - toujours sur papier blanc, même en papier sombre à l'écran.
- Option **« Export PDF / SVG : Noir »** (panneau Planche) : tout en noir sur blanc (ISO), couleurs d'éléments comprises.
- Impression : couleurs imprimées telles quelles (`print-color-adjust: exact`).
### Divers
- **Échelle du cartouche** : celle des vues principales. Un détail ne l'impose plus (« 5:1 » s'affichait).
- DXF : ligne de coupe et repères de détail sur le calque AXE.

Vérifié au navigateur, sur l'exemple Perçages :
- projections dessous / droite / diagonale ;
- coupe C-C par les trous (H/V redressé, hachures, flèches vers la vue) ;
- détail D à 5:1 ;
- auxiliaire sur l'arête haute de la Face, égale à la vue de dessous ;
- aperçu « Dessus » de 100 × 65 mm ;
- planche des 24 icônes.

`test_mise_en_plan` :
- base alignée = projection 1er angle (dessus, dessous, côté) ;
- style des nouveaux éléments rendu (épaisseur, type, couleur) ;
- export couleur / noir.

`npm run ci` vert.

## V0.3.14 - FAO : Géodésique, faces usinables / intouchables, Ébauche 3D sans passage dans la matière
### Nouvelle opération « Géodésique »
- Rétro-analyse de la Géodésique 3 axes de Fusion 360 (RETARD.step, boule D30) : Scallop depuis une ligne centrale, pas ≤ 0,8, 23 % de l'avance G1 dans le vide aux pointes.
- miniFusion : passes à distance **géodésique constante sur les faces choisies**, depuis leurs bords vers le centre ; seuls les points touchables en 3 axes ; Z = descente outil sur tout le modèle (aucune pénétration).
- Passe suivante rejointe en **glissant au contact** (≤ 1,5 pas) ; passes de reste sur la crête et dans les coins aigus ; normales lissées le long des passes.
- Sur RETARD (pas 0,8) : 1,2 % d'avance hors matière (Fusion : 23 %), ≈ 81 min au lieu de 106, matière restante max 0,0064 mm (crête théorique 0,0053).
- Icône dédiée (triangle arrondi, passes concentriques).
### Faces usinables (bleu) / intouchables (rouge), par opération
- Ébauche 3D (rouge), Finition et Géodésique (bleu + rouge) : « Choisir dans la vue », faces tangentes, Maj+clic = solide entier.
- Rouge : jamais touché, marge réglable (0,5 mm) ; rapides au-dessus d'une zone rouge par le plan de dégagement ; solides rouges = obstacles.
- Bleu : Finition limitée aux positions où l'outil repose sur le bleu ; faces pilotes de la Géodésique.
- Couleurs persistantes tant que l'opération est sélectionnée.
### Ébauche 3D : corrections de sécurité
- **Brut plus large que la pièce** : le domaine des centres d'outil inclut la boîte du brut. La bande des flancs n'était jamais usinée et les rapides de liaison la traversaient (Malaxeur Retard : 40 rapides, 5,8 m en matière → 0).
- **Rampes de descente** : un rampage ne relie plus deux points séparés par un passage sous la pièce (rampes en ligne droite à travers la lentille, jusqu'à 115 mm de corps d'outil dans la matière → 0).
- CACHE_VER `2026-10-21-004` : parcours d'Ébauche 3D à régénérer.

Tests ajoutés : `test_fao_geodesique`, `test_fao_faces`, `test_fao_ebauche_brut` (fixtures RETARD.step, brut, posage). `test_fao` / `test_fao_barre3d` : 7 usinages.

`npm run ci` vert.

## V0.3.15 - FAO : la vue suit le Z du posage (orbite, miroir, vues standard)
- En espace FAO, le **haut de la vue** est le Z du posage, ou celui de l'opération sélectionnée si elle a son propre repère (3+2) : l'orbite tourne autour de cet axe.
- **Sol miroir** perpendiculaire à cet axe, collé sous le point le plus bas de la pièce mesuré le long de l'axe ; halo centré sur la pièce projetée.
- Vues **Dessus / Face / Droite / Iso** exprimées dans ce repère en FAO.
- CAO et PLAN : Z monde, comme avant. OrbitControls (axe figé à la création) est recréé avec les mêmes réglages quand le haut change.
- Parcours inchangés (CACHE_VER identique).

Vérifié au navigateur (posage incliné à 45°, opération Z = +X, retour CAO). `npm run ci` vert.

## V0.3.16 - FAO : la zone (chaîne d'arêtes) ne perd plus sa sélection
Retour utilisateur (Malaxeur Retard) : « il perd la sélection de courbes et droites pour la zone ».
- **Saisie rouverte** : les arêtes déjà retenues (droites et courbes) sont pré-sélectionnées ; un clic en retire une, « OK » sans clic redonne la même boucle. Avant : sélection vide, tout était à recliquer.
- **Posage tourné** : le re-suivi de la zone à chaque recalcul compare les arêtes dans le repère de l'opération / du posage, celui de la saisie. Avant : arêtes monde, zone obsolète à chaque recalcul dès que le Z du posage était incliné.
- **Pièce masquée** : le re-suivi lit aussi les imports masqués (hors corps-brut). Avant : masquer la pièce puis recalculer rendait la zone obsolète.
- Parcours inchangés (CACHE_VER identique).

`test_fao_chain_step` : saisie rouverte, pièce masquée, posage tourné (2 contrôles échouent sur V0.3.15). Vérifié au navigateur sur Malaxeur Retard. `npm run ci` vert.

## V0.3.17 - FAO : faces rouges « Interdire devant la face »
Retour utilisateur (Malaxeur Retard) : en zone « Tout couvrir », la fraise descendait le long des flancs rouges pour enlever le brut devant eux (bande de 2,25 mm, 30,8 m d'avance), sans toucher la face.
- Nouvelle case **« Interdire devant la face »** (section Faces, à côté de la Marge) : chaque face rouge est prolongée le long de sa normale extérieure jusqu'au bord du brut ; ce volume est interdit à l'outil (même marge), le brut y reste. Ébauche 3D, Finition, Géodésique.
- Correctif : avec des faces rouges, les chaînes de passes (cadre du brut, faces) sont densifiées à 1 mm avant le filtre de zone — une avance rectiligne de 274 mm traversait le volume interdit entre deux sommets autorisés.
- Seules les opérations à faces rouges sont à régénérer (version dans leur clé de parcours) ; CACHE_VER inchangé.

`test_fao_faces` (cas D) : sans la case, 427 entrées dans le volume avant ; avec, 0. `npm run ci` vert.

## V0.3.18 - FAO : brut = corps réel, minipasses partout, rotation du repère autour de X
Retours utilisateur (Malaxeur Retard).
### Brut = corps
- L'Ébauche 3D n'usine plus le cube : avec un corps choisi comme brut, un centre d'outil n'est admis que s'il reste de la matière de ce corps sous l'outil au-dessus de la cote (dessus du corps dilaté du rayon d'outil). Malaxeur Retard : avance dans le vide 52,6 m → 2,5 m.
- **Matière restante suivie** pendant le calcul (carte des hauteurs abaissée par les passes émises) : les liaisons rapides (spirale, passes toriques) qui croiseraient du brut non enlevé (rouge, zone, non atteint) passent par le dégagement.
- **Simulation** : la matière de départ est le dessus réel du corps-brut, plus la boîte pleine.
### Minipasses
- Un contour fermé qui commençait hors zone (flanc rouge) était jeté en entier au lieu d'être découpé.
- Entrées / sorties des passes toriques dans la zone SÛRE (le vide à côté du brut est libre) — elles étaient refusées avec le brut-corps.
- Malaxeur Retard : minipasses à 38 bandes sur 39 (avant : les 2 du haut seulement).
### Repère
- **Rotation autour de X** (X+ ou X−, en degrés) du repère du posage et de celui d'une opération (fiches « Repère »).
### Divers
- CACHE_VER `2026-10-21-008` : parcours d'Ébauche 3D à régénérer.

Tests : `test_fao_brut_corps` (nouveau), `test_fao_faces` (minipasses avec rouge, rotation X). Suite complète 109/109. `npm run ci` vert.

## V0.3.19 - FAO : simulation du vrai brut, ébauche sans plongée dans le vide, face vrillée usinée jusqu'aux flancs rouges
Retours utilisateur (Malaxeur Retard).
- **Simulation** : la matière DESSINÉE suit le corps-brut — l'affichage partait de la hauteur pleine de la boîte (« toujours un cube à la place du brut corps »).
- **Ébauche 3D, brut-corps** : départs d'entrée à 1 mm au-dessus de la matière restante (plus du dessus de la boîte), descentes dans le vide en rapide. Avance dans le vide 2,6 m → 0,8 m.
- **« Interdire devant la face »** : seulement quand l'outil est DEVANT le flanc rouge (aucune pièce sous lui) ; au-dessus de la pièce il peut déborder sur la bande avant — la face qui vrille s'usine jusqu'au bord, la fraise ne descend jamais le long du flanc.
- **Descentes pour rien** : minipasses enchaînées au contact d'une cote à la voisine ; morceaux < 5 mm qui exigeraient une remontée ignorés. 97 → 9 descentes inutiles ; minipasses à 38 bandes sur 39 jusqu'à Z −49.
- **Fiches d'usinage** : onglet actif en bleu plein, texte blanc gras (thèmes sombre et clair).
- CACHE_VER `2026-10-21-013` : ébauches à régénérer.

Tests : `test_fao_brut_corps` (descentes pour rien, face vrillée, matière dessinée — échoue sur V0.3.18), `test_fao_faces` (cas D, nouvelle règle). Suite complète 109/109. `npm run ci` vert.

## V0.3.20 - FAO : finir une région avant l'autre, entrées à plat depuis l'air, moins de remontées au plan, simulation lisse au vrai brut
Retours utilisateur (Malaxeur Retard).
- **Ébauche 3D — « Finir une région avant l'autre »** (case de la fiche, cochée à la création) : le parcours est coupé en blocs ; dès que les blocs restants se séparent en régions sans matière commune, chaque région est finie jusqu'en bas avant la suivante (règle récursive, ordre des niveaux conservé dans chaque région). Liaisons recontrôlées sur la matière restante dans le nouvel ordre. RETARD : 79 → 16 changements de côté, usinage identique.
- **Entrées par l'extérieur** (brut-corps) : quand l'air est à portée, la fraise y descend en rapide jusqu'à 1 mm, rejoint la matière à plat puis entre en arc, au lieu de l'hélice. RETARD : 66 → 50 hélices, avance 23,1 → 20,8 m.
- **Rapides au-dessus des faces rouges** : remontée à 2 mm au-dessus du rouge, et seulement si le rapide en passe à moins de 1 mm — plus au plan de sécurité dès qu'il survole un flanc. RETARD : 425 → 47 remontées au plan, rapides 44,9 → 18,5 m.
- **Simulation** : le rendu « lisse » part du corps-brut (était un rectangle) ; le rendu « simple » est retiré (bouton ◈ réel ↔ ≈ lisse).
- CACHE_VER `2026-10-22-004` : ébauches à régénérer.

Tests : `test_fao_brut_corps` (ordre par région : changements de côté, même avance, ni avance dans la pièce ni rapide dans la matière ; rendu lisse au corps-brut), `test_fao` 015bis (cycle à 2 états), `test_fao_faces` C (rapides au moins 1 mm au-dessus du rouge). Suite complète 109/109.

## V0.3.21 - FAO : la fraise sort du brut-corps, minipasses par-dessus les flancs rouges
Retours utilisateur (Malaxeur Retard, posage tourné de 11,25° autour de X).
- **La fraise sort du brut** : le dessus du corps-brut dilaté du rayon d'outil était calculé sur la grille du brut (+1 mm) — la zone « avec brut » s'arrêtait à 1 mm dehors : la fraise ne sortait jamais du brut, les bouts n'étaient pas dégagés (« pourquoi on ne va pas plus bas ? », « la fraise ne sort pas »). Grille élargie du rayon. RETARD : bouts dégagés jusqu'à Z −14 (−7 avant).
- **Minipasses contre les flancs rouges** : sans sortie latérale libre (bout du contour devant un flanc rouge / au bord de la zone), la minipasse sort par remontée verticale depuis la dernière coupe (sûre : le corps d'outil occupe déjà la colonne) — elle était jetée entière. Contours fermés : départ au plus près parmi les points d'entrée libres. Minipasses à toutes les cotes (61,8 et 59,8 manquaient).
- RETARD : matière laissée sur la pièce 1,09 → 1,05 mm en moyenne, colonnes à plus de 3 mm 270 → 201.
- CACHE_VER `2026-10-22-005` : ébauches à régénérer.

Tests : `test_fao_brut_corps` (la fraise sort du brut — 0 coupe à plus de 5 mm du corps avant ; minipasses à chaque cote — échouent sur V0.3.20). Suite complète 109/109.

## V0.3.22 - FAO : « devant la face » borné pour les faces courbes, fiches présentées comme le panneau Plan
Retours utilisateur (Malaxeur Retard).
- **« Interdire devant la face » sur une face courbe** (bord cylindrique du moyeu, face 24) : le volume avant suivait les normales jusqu'à la boîte du brut et passait PAR-DESSUS le flanc jusqu'au bout de la pièce — la fraise ne sortait plus de ce côté (« 2e côté pas fini »). Le volume avant ne monte plus au-dessus de la face et s'arrête à la peau du corps-brut. RETARD avec la face 24 : colonnes à plus de 3 mm 749 → 301, hélices 52 → 1. Signature des opérations à faces rouges `_redV=3` : seules elles sont à régénérer.
- **Fiches FAO** (posage, opérations) : même présentation que le panneau Plan — un réglage par ligne, libellé à gauche, champ aligné à droite avec son unité, cases à cocher à droite, lignes chargées repliées sous le libellé ; textes d'aide, notes et estimations dans un seul style ; champs texte et listes à la même hauteur (`faoTidyRows`).
- **Fiche posage en onglets** : Général, Repère, Modèle, Brut, Plans, Temps (onglet choisi mémorisé par posage) ; l'estimation reste visible sous les onglets. Libellés en clair (« Dégagement radial / axial », « Bridage Z bas / haut », « Accélération », « Changement d'outil »).
- « Modèle à usiner » : les cases sont gardées en main (la mise en ligne éclatait la rangée relue au clic : aucun corps ne restait coché).

Tests : `test_fao_faces` (volume avant d’une face courbe au plus à la hauteur de la face — échoue sur V0.3.21), `test_fao_planes` (libellés du bridage). `npm run ci` vert.

## V0.3.23 - Ébauche sur maillage précis, mise en plan exacte d'un STEP, axes de cylindres et de symétrie, panneau Plan en onglets
Retours utilisateur (Malaxeur Retard).
- **FAO — maillage de calcul** : l'ébauche 3D et le contour profil se calculent sur un maillage intermédiaire à 0,05 mm / 0,2 rad du solide exact (le maillage d'outillage d'un STEP était à 0,5 mm / 0,5 rad, autant que la surépaisseur : 554 triangles pour RETARD → 2 708). Finition, Géodésique et faces rouges / bleues : maillage fin à 0,01 mm, inchangé. CACHE_VER `2026-10-22-009`.
- **Mise en plan d'un STEP** : le HLR exact OCCT lit le solide exact de l'import (seul le corps modélisé l'était) — plus de triangles d'affichage dessinés (« la mise en plan est très facétisée »).
- **Axes des cylindres d'un STEP** : les axes automatiques lisent les faces cylindriques du solide importé (regroupées par axe et rayon, au moins un demi-tour) — croix en vue de bout, trait d'axe sur la longueur en vue de côté.
- **Axe de symétrie** (bouton « Symétrie ») : 2 droites d'une vue → axe médian (parallèles) ou bissectrice (sécantes) ; extrémités à poignées, à tirer pour allonger / raccourcir (axes libres aussi). Poignées absentes des exports.
- **Panneau Plan en onglets** : Planche, Cartouche, Dessin 2D, Axes, Cotation, Vue, Sortie (même style que la FAO, onglet mémorisé).

Tests : `test_mep_step` (nouveau : HLR exact d'un STEP, cylindres, axe de symétrie — échoue sur V0.3.22), `test_fao_faces` / `test_fao_brut_corps` (minipasses comptées entre les vrais niveaux).

## V0.3.24 - Plan : traits d'axe étirables, accrochables et cotables, coupe brisée ; suppression de face
Retours utilisateur (mise en plan, Perçages).
- **Tout trait d'axe s'étire** (trou, alignement, cercle de perçage, axes automatiques, cylindres d'un STEP) : poignées aux bouts du trait sélectionné, allongement mémorisé par bout dans la vue (`v.axExt`, suit le modèle). Une croix de centre allongée devient un trait d'axe fin mixte (ISO 128-2). Un bout d'axe se saisit même posé sur un alignement. Suppr / « Longueur d'origine » rend la longueur d'un axe automatique.
- **Bouts d'axe accrochables** : extrémités, milieux, trait et centre du cercle de perçage entrent dans l'accrochage (ligne de coupe, esquisse de planche, cotes point à point). Le 1er point d'une coupe peut être le bout d'un axe hors du cadre de sa vue ; repère du point accroché pendant le tracé.
- **Axes cotables** : l'outil Cote prend un trait d'axe comme une arête (longueur, distance, angle, Ø du cercle de perçage) ; la cote suit l'allongement.
- **Coupe brisée** (ISO 128-44) : la ligne de coupe se pose point par point, chaque tronçon à l'équerre du précédent ; icônes ↶ (dernier point, Retour arrière) et ✓ (valider, Entrée) ; la ligne finit sur un tronçon parallèle au premier. Matière ôtée par un prisme en escalier : chaque plan hachuré, pas de trait au changement de plan ; gros traits aux bouts et aux coudes.
- **Suppression de face** (touche Suppr sur des faces sélectionnées en 3D, façon Fusion) : les voisines se prolongent (congé → arête vive, trou rebouché) ; faces mémorisées par référence durable.
- **FAO** : l'Ébauche 3D n'entre plus en rapide sous le dessus du brut quand le Haut est plus bas ; test du maillage intermédiaire mis à jour.

Tests : `test_mep_coupe_brisee` (nouveau, OCCT réel : 24 000 mm³ restants, une face hachurée par plan, aucun trait au changement de plan), `test_mise_en_plan` (allongement, croix → trait mixte, accrochage, saisie d'un bout, cote sur axe, coupe depuis un axe hors cadre), `test_suppression_face`. `npm run ci` vert.

## V0.3.25 - FAO : sol miroir sous le brut, parcours masqués hors de l'espace FAO
Retours utilisateur (Perçages).
- **Sol miroir sous le brut** : en FAO, quand le brut est affiché (posage sélectionné), le sol se pose sous son point le plus bas le long du Z du posage et le halo se centre sur lui (avant : sous la pièce, à l'intérieur du brut). Recalé à chaque apparition / disparition / changement du brut.
- **Parcours masqués en CAO / PLAN** (interface moderne) : la racine d'affichage FAO (parcours, simulation, brut, repères) est masquée hors de l'espace FAO et réapparaît telle quelle au retour — rien n'est détruit ni recalculé.

Tests : vérifié dans l'appli sur « Perçages » (sol à Z −10,02 sous le brut Z −10 en FAO, −0,02 sous la pièce en CAO ; parcours masqués puis rendus). `npm run ci` vert.

## V0.3.27 - Vue 3D : orbite libre, centre de rotation sur la pièce
Retours utilisateur (« peut-on faire tourner la pièce dans toutes les directions ? », « garder le centre de rotation après un déplacement »).
- **Orbite libre** (façon Fusion « Free Orbit ») : la pièce tourne dans tous les sens, par-dessus et par-dessous, sans butée aux pôles ; le haut de l'écran suit. Choix par le bouton ⟲ à gauche du cube de vue ou la liste « Orbite » des réglages ⚙ (Contrainte = Z en haut, par défaut / Libre), mémorisé dans le navigateur. ⌂, les faces du cube et les vues normalisées redressent la vue ; le sol miroir reste, vu de dessous il ne reflète plus rien.
- **Centre de rotation sur la pièce** : la rotation tourne autour du centre de la face sélectionnée, sinon du centre des pièces visibles (et du brut en FAO) ; un déplacement au clic droit ne le déplace plus. OrbitControls ne garde que le déplacement et le zoom ; même vitesse et même inertie qu'avant.

Tests : vérifié dans l'appli sur « Perçages » (passage par-dessus le pôle, vue de dessous sans reflet, pivot fixe à l'écran après déplacement dans les deux modes, pivot au centre d'une face sélectionnée). `npm run ci` vert.

## V0.3.28 - Plan : hachures, ordonnées, notes, tolérances, filetages ISO, vues perspective et cavalière ; outils FAO
Retours utilisateur (mise en plan de « Perçages », boîte à outils FAO).
- **Outils FAO** : forets et forets à pointer dessinés avec leur pointe réelle (angle de la fiche) dans la fiche, l'outil 3D de la simulation et la matière enlevée ; nouveau type **Foret à centrer** DIN 333 A (pilote d1 + pointe 118°, cône 60° jusqu'au corps d2, cotes de la norme par défaut), profondeur de pointage lue sur le cône 60°. Parcours existants inchangés (CACHE_VER conservé).
- **Simulation puis PLAN** : quitter l'espace FAO referme la simulation d'usinage, qui masquait les corps — la pièce ne disparaît plus de la mise en plan.
- **Cotes** : re-ancrage après « reprojeter » sur le trait qui ressemble à l'original (une cote 100 passait à 0 au coin d'un rectangle) ; glisser une cote la déplace à la fois le long des lignes de rappel et le long de sa ligne ; double-clic détecté à l'appui (inversion des flèches à chaque fois) ; outil **Aligner sur une cote** (Maj/Ctrl + clic pour sélectionner plusieurs cotes) ; souligné des cotes de perçage et Ø/R sous les jambages.
- **Tolérances** : classe ISO 286 suivie de ses écarts entre parenthèses, empilés comme une bilatérale (« Ø20 H7 (+0,021 / 0) »), pile tenue avant le point d'attache quand le texte est calé à droite ; tolérance sur les cotes de perçage (après le Ø).
- **Notes à flèche** : pointe, texte libre multiligne souligné (comme une étiquette de perçage), double-clic pour l'éditer.
- **Cotation d'ordonnées** X / Y : origine « 0 », valeurs alignées sur une ligne commune qui se déplacent ensemble, toujours positives ; ajouter des valeurs (groupe sélectionné + outil), supprimer une valeur, tolérance sur une seule valeur.
- **Hachures** : double-clic sur une hachure → motif (ISO 128-50 général, acier, cuivre/bronze, alliages légers, plastique, plein), angle, échelle, couleur, pour toutes les coupes.
- **Ligne de coupe** : glisser = déplacer le tronçon, Ctrl + clic = briser au curseur, Maj + clic = retirer la brisure la plus proche.
- **Axe de symétrie associatif** : il suit ses 2 droites quand la pièce change.
- **Filetages ISO 6410** des perçages taraudés : 3/4 de cercle en bout, traits du fond de filet en coupe (gris clair, plus fins) + trait fort de fin de filetage, filet caché en interrompu ; calque DXF FILETAGE.
- **Vues** : projection **perspective** (comme la vue 3D, fuyante = angle de champ ; arêtes exactes, parties cachées calculées sur le maillage) et **oblique cavalière** (angle et coefficient des fuyantes, HLR exact) ; ombrage et rendu 3D suivent la projection.

Tests : `test_mep_hachures_cotes` (nouveau, OCCT réel : cote re-ancrée, glisser, alignement, double-clic, ordonnées, note, axe de symétrie, hachures, ligne de coupe, cavalière, ombrage oblique, filetages, tolérances), `test_fao_percage` (foret à centrer), `test_mise_en_plan` (tolérance ISO, souligné). `npm run ci` vert. Non vérifié à la souris dans l'appli (aperçu bloqué au chargement du noyau) ; la perspective n'est pas couverte par les tests (maillages three.js réels requis).

## V0.3.29 - Plan : axes de symétrie et cotes gardent leurs références ; README avec captures
Retours utilisateur (« les axes de symétrie ne gardent pas leurs références », « les cotes, normales et d'ordonnées, ne suivent pas les axes d'alignement »).
- **Axes de symétrie** : à l'ouverture, les vues passent d'abord par le maillage (noyau en chargement) — le suivi y réécrivait les références sur des arêtes de triangles ; elles ne sont plus mises à jour que sur la géométrie exacte. Les 2 droites sont suivies en PAIRE (même nature de trait, même ordre, écartement non effondré) : séparément, l'une sautait sur un trait de filetage voisin (axe à 42,25 au lieu de 45). Les anciens axes de symétrie figés (avant V0.3.28) retrouvent leurs 2 droites et deviennent associatifs.
- **Cotes accrochées aux axes** : un point accroché à un trait d'axe (distance 2 points, ordonnées, note) garde sa référence (clé de l'axe + position le long du trait, ou centre d'un cercle de perçage) et suit l'axe à chaque dessin ; un point sur une arête de la pièce suit l'arête. Les cotes existantes posées pile sur un axe manuel ou une arête de la bonne direction s'y rattachent à l'ouverture (à enregistrer une fois).
- **README** : section PLAN réécrite, 4 captures (planche, hachures, perspective, cotation) tirées de « Perçages ».

Tests : vérifié dans l'appli sur « Perçages » (perçages d'angle 80 → 90 → 80 : distances 80/10/10 → 90/5/5 → 80/10/10, ordonnées 40 → 45 → 40, axes de symétrie ±40 → ±45 → ±40, axes de la coupe B-B immobiles) ; `test_mep_hachures_cotes` (point sur axe qui suit, mauvaise direction ignorée, axe entre arêtes d'une pièce qui s'élargit 50 → 70 → 60). `npm run ci` vert. Limite : un axe AUTOMATIQUE a une clé tirée de ses coordonnées — une cote qui s'y accroche garde sa dernière position si le trou bouge.

## V0.4.0 - Esquisse façon Fusion 360 : vue 3D dans l'esquisse, pièce en transparence, orbite ; README refait
Retours utilisateur (« la pièce s'affiche décalée à l'ouverture d'une esquisse », « montrer la pièce comme en 3D, en transparence », « pouvoir tourner la vue d'esquisse », « N me ramène dans le plan, face devant et pas à l'envers »).
- **Pièce en place dès l'ouverture** : la mise en page bougeait encore après le calage de la caméra (zone de dessin 557 → 809 px, canevas 686 → 650 px) ; la caméra n'était recalée qu'au premier clic. La géométrie de la zone d'esquisse et du canevas est suivie à chaque image (recadrage dans la seconde qui suit l'ouverture). Le cadrage d'une esquisse vide ignorait les références circulaires (zoom ×438 sur une face ronde).
- **Pièce en transparence** : faces à peine teintées (opacité 0,2), toutes les arêtes tracées (gris clair devant, gris sombre derrière), pour le solide fini comme pour l'état antérieur à la fonction qui consomme l'esquisse ; voile de l'esquisse allégé (72 % → 12 %).
- **Vue d'esquisse orientable** : caméra orthographique d'orientation libre ; le dessin SVG suit par une application affine (inversée pour la souris) — tracé, accrochage, zoom et déplacement restent exacts sur le plan, textes et cotes restent lisibles. Souris comme en 3D : clic-molette glissé = orbite, clic droit glissé = déplacement, clic gauche = dessin. Cube de vue et vues normalisées actifs pendant l'esquisse ; bouton ⟳ (vue inclinée ↔ à plat).
- **N / ouverture à plat** : caméra côté extérieur de la face, Z du monde en haut (plan horizontal : Y) ; case **« À plat »** (mémorisée) : décochée, la vue 3D courante est gardée à l'ouverture et à la sortie.
- **Esquisse sur face verticale** : axe vertical de l'esquisse vers le haut (face arrière, face −X s'ouvraient à l'envers).
- **Grille d'esquisse** affichable / masquée (bouton ▦, masquée par défaut, mémorisée) ; axes d'origine toujours tracés.
- **Plan** : liste unique des formats A4H … A0V (H = paysage, V = portrait) et **format manuel** (largeur × hauteur en mm).
- **README** réécrit (interface unique, esquisse 3D, FAO et PLAN à jour, tableau souris / clavier), capture de l'esquisse en vue 3D.

Tests : vérifié dans l'appli sur « Axe » (écart 3D / esquisse 0 px dès la 1re image ; point du plan sous le curseur = lancer de rayon à 0,001 mm ; zoom au curseur et déplacement exacts en vue inclinée ; ligne tracée en vue inclinée accrochée à l'origine ; vue gardée à l'ouverture = direction de la caméra 3D ; cube DESSUS ; esquisse « rép 3 » redressée ; nouvelle esquisse sur la face −X à l'endroit ; grille mémorisée). `npm run ci` vert.

## V0.4.1 - Plan : cotes du cartouche, esquisse accrochée aux vues, révisions, champs du cartouche
Retours utilisateur (« impossible de sélectionner une cote du cartouche », « voir la cote d'une droite cotée », « en-tête des révisions en bas, IND et date en entier », « champs Client, Société, Quantité, N° de plan », « cacher contraintes et cotes séparément », « attacher une ligne / un cercle à une projection », « 40CMD8 », « le choix d'un outil refait un zoom tout »).
- **Cotes du cartouche sélectionnables** : en édition du cartouche, l'esquisse de planche était aussi dessinée en mode édition, juste après, et vidait la liste des zones cliquables des cotes. Elle ne passe plus en édition pendant celle du cartouche ; la liste est remise à zéro une fois par rendu.
- **Accès direct aux cotes** : ligne, cercle ou point sélectionné → section « Cotes (n) » dans le panneau, valeurs modifiables sur place, ↗ sélectionne la cote. Les cotes de placement des textes n'y figurent que si le texte est sélectionné. Les ancres de texte (à 2 mm des traits) ne captent plus le clic : le trait se sélectionne.
- **Afficher : Contraintes / Cotes** : deux bascules indépendantes en édition d'esquisse (planche et cartouche), mémorisées ; l'élément sélectionné garde les siennes.
- **Esquisse de planche accrochée aux vues** : un point posé sur un trait projeté (extrémité, milieu, centre, point sur trait ou cercle, trait d'axe) garde le lien `lk` ; il est fixe pour le solveur et recalé sur la vue à chaque rendu (élément retrouvé par sa géométrie si la numérotation change). Point lié en violet ; « Détacher de la vue » dans le panneau. Près d'une extrémité, d'un milieu ou d'un centre, le point remarquable l'emporte sur « sur le trait ».
- **Révisions** : en-tête IND. | DATE | NOM | MODIFICATION en bas, contre le cartouche, la plus récente en haut ; colonnes IND. et DATE à la largeur de leur texte.
- **Cartouche** : champs Client, Société, Quantité, N° de plan toujours proposés (Client et Quantité aussi en champs de texte du cartouche dessiné) ; matière 40CrMnMoS8-6 (40CMD8+S).
- **Zoom gardé** au choix d'un outil du ruban PLAN : le recadrage « planche entière » n'a lieu qu'à l'entrée dans l'espace PLAN.

Tests : vérifié dans l'appli (cote 182 sélectionnée ; trait PROJET/PLANCHE → cote 134 modifiée en 140, la colonne suit ; tableau A/B avec en-tête en bas ; bascules Contraintes / Cotes ; sur « Perçages », rectangle depuis le coin de la vue de face et cercle sur un trou, vue déplacée → points liés +25,06 mm, rectangle étiré sous contraintes ; zoom gardé après Ligne puis Cote). `npm run ci` vert. Limites : un point « sur le trait » garde sa fraction (il ne glisse pas) ; le cercle ne reprend pas le rayon du trou.

## V0.4.2 - Plan : filets et miroir en rendu, construction, Ajuster, détails, indices de révision
Retours utilisateur (« rouge des axes pas assez rouge », « filets des trous taraudés en Rendu 3D et Ombrage », « miroir avec case à cocher, sans ombre, fondu en bas », « échelle 3:4 », « construction invisible hors édition, touche X », « croix du curseur peu visible en clair », « mal à attraper les lignes du cartouche », « Ajuster ne fonctionne pas », « vues de détail étranges », « indices en lettres ou chiffres »).
- **Axes** en `#ff0000` (le rouge du cadre du cartouche), papier blanc et sombre.
- **Filets cosmétiques** : `holeThreadPaths` (76-percage) partagé par la 3D et le plan. Rendu 3D : hélice et cercle d'entrée rendus avec la pièce. Ombrage : hélice projetée comme les faces, morceaux visibles seulement (lancer de rayon ; un tour entièrement caché arrête la descente ; hélice décalée de 0,12 mm vers l'axe, hors des facettes de la paroi).
- **Miroir** (case de la vue, en Rendu 3D) : copie symétrique de chaque corps sous son point le plus bas, opacité 0,5 décroissante sur 60 % de la hauteur ; cadre de l'image élargi au reflet. Pixels semi-transparents de l'image rendus en couleur vraie (le fond transparent les assombrissait : « ombre » grise, bords lissés foncés).
- **Échelle 3:4** ; liste des échelles triée de 5:1 à 1:10 (choix automatique inchangé).
- **Construction** (lignes, cercles, arcs) : pointillé orange en édition, sur le calque d'aide (jamais imprimé ni exporté), invisible sinon, hors de l'encombrement du cartouche ; réglage « Construction » du style, touche **X** sur une sélection (sans sélection, X reste l'outil Axe).
- **Curseur du PLAN** : croix 23 px à liseré (cœur noir et halo blanc en clair, l'inverse en sombre).
- **Sélection dans le cartouche** : traits, cercles et arcs prioritaires sur les textes et le logo (tolérance 7 px) ; l'élément survolé est surligné en édition.
- **Ajuster** réécrit : intersections avec les segments (et plus les droites prolongées), cercles et arcs ; une seule intersection suffit ; sans intersection, ligne entière retirée ; extrémités d'origine gardées, point de coupe tenu sur l'élément coupant, horizontale / verticale reportée.
- **Vues de détail** : un trait qui commence ou finit dans le cercle était rogné du mauvais côté (bords du coin tracés vers l'extérieur).
- **Indices de révision** : A, B, C… (puis AA), 0, 1, 2… ou 1, 2, 3… ; changer de format renumérote ; « + Révision » suit le dernier indice.

Tests : `test_mise_en_plan` (Ajuster : tronçon retiré, extrémité gardée, coupe tenue sur la ligne, droite prolongée ignorée ; détail rogné au bon croisement ; indices A…Z/AA, 0…, 1…, suite du dernier ; séparateur du cartouche saisi devant le texte de sa case). Vérifié dans l'appli sur « Perçages » (filets M6 en rendu 3D et en ombrage, reflet bleu estompé sans ombre, construction par X puis invisible hors édition, curseur pris par le navigateur). `npm run ci` vert. Non vu à l'écran : surlignage au survol, Ajuster et détail corrigé dans l'appli (navigateur intégré bloqué).

## V0.4.3 - Plan : taraudages dans les vues de détail
Retour utilisateur (« pour les détails, il faut mettre les indications de taraudage aussi »).
- **Vues de détail** : la représentation conventionnelle des filetages (3/4 de cercle fin en bout, fond de filet de côté) était volontairement écartée des détails. Elle est reprise de la vue mère (même base), puis rognée par le cercle du détail comme le reste.

Tests : `test_mep_hachures_cotes` (détail de la vue de dessus : même 3/4 de cercle M8 que la vue mère). `npm run ci` vert.

## V0.4.4 - FAO : une fiche par machine dans PostPro/ ; Plan : FORMAT A3-H, cotes du cartouche toutes visibles
Retours utilisateur (« enlever les 3 .cps Autodesk de GitHub », « un fichier PostPro par machine, modifiable facilement », « FORMAT du cartouche en A3-H / A4-V », « je ne vois pas toutes les cotes dans l'édition du cartouche »).
- **PostPro** : les `.cps` d'Autodesk ne sont plus suivis par Git (`git rm --cached`, `PostPro/*.cps` dans `.gitignore`) — gardés en local, toujours présents dans l'historique des anciens commits. Une fiche par machine : `PostPro/siemens-630.js`, `siemens-1520.js`, `fagor-8065.js`, chacune `faoMachine({…})` (id, nom, dialecte, extension, axes, numérotation, codes d'arrosage, changement d'outil, broche, fin de programme ; modèles `{T}`, `{S}`, `{ZRETR}`, `{NAME}`). `build.js` (et le lint) les insèrent juste après `88-fao-60-postprocesseurs.js`, qui garde les dialectes (en-tête, cycles, 3+2). Le 3+2 suit `axes` (3 = jamais commandé) au lieu du seul Fagor.
- **Cartouche** : le champ FORMAT écrit `A3-H`, `A4-V`… (format manuel : dimensions en mm).
- **Édition du cartouche** : les cotes horizontales/verticales sont tracées au niveau du point coté (rappel pointillé vers la référence) — les séparateurs des deux rangées, à la même abscisse, avaient leurs cotes superposées sur la ligne du haut ; une étiquette qui en recouvre une autre descend jusqu'à une place libre ; bascule « Textes » pour voir aussi les cotes de placement des textes.

Tests : G-code avant / après comparé pour les 3 machines (arrosage, centre outil, sans arrosage, 3+2) : identique ; tests FAO post verts. `test_mise_en_plan` (FORMAT A3-H ; cartouche Standard en édition : 9 cotes X, 24 étiquettes, 0 chevauchement). `npm run ci` vert. Non vu à l'écran (navigateur intégré indisponible).

## V0.4.5 - Plan : import DXF, ordonnées unitaires et cassure ; CAO : coutures masquées, répétition « quantité »
Retours utilisateur (« importer un DXF dans la mise en plan et le coter », « cotes du DXF : natives ou supprimées », « ordonnées : sélection unitaire en rouge, Suppr, cassure avec Ctrl », « pourquoi ce cylindre coupé en 2 ? », « enlever l'arête verticale des cylindres », « 6, c'est l'original + 5 », « l'icône verte ne garde pas son statut »).
- **Import DXF** (PLAN → Vues → DXF) : `src/98-01-import-dxf.js` (`mepDxfParse`, pur) lit LINE, CIRCLE, ARC, LWPOLYLINE / POLYLINE (renflements → arcs), ELLIPSE, SPLINE (NURBS), INSERT (blocs imbriqués, échelle, rotation, miroir), unités `$INSUNITS`, types de trait interrompus → cachés. Nouvelle vue `kind:'dxf'` : géométrie rangée dans le projet, exacte pour l'accrochage, la cotation, les axes, l'esquisse liée ; détail possible ; « Remplacer le DXF… ». Graphisme des cotes jamais dessiné (DIMENSION, blocs `*D…`, calques COT / DIM) ; DIMENSION linéaires, alignées, Ø et R → cotes natives du plan.
- **Ordonnées** : valeur désignée seule en rouge (le groupe en couleur normale), Suppr la retire ; Ctrl + glisser = cassure (rappel coudé, valeur décalée le long de l'axe), Ctrl + clic la retire.
- **Coutures** : la couture des faces de révolution et la jonction de deux morceaux du même cylindre ne sont plus des arêtes (ni tracées, ni sélectionnables).
- **Répétition** : champ « Quantité » original compris (stocké : copies = quantité − 1) ; circulaire sur un tour complet : pas = 360° / quantité (l'ancien pas 360° / copies posait la dernière copie SUR l'original : perçage doublé, paroi scindée) ; anciens projets réparés au chargement (copie superflue retirée, positions gardées).
- **Bouton ⟲ (orbite libre)** : l'état était bien mémorisé mais le bouton se colorait avant d'être dans la page.

Tests : `test_mise_en_plan` (vue DXF : polyligne, cercle, texte ignoré, coin accroché ; cotes du DXF retirées, 80 et Ø10 reprises) ; `test_mep_hachures_cotes` (valeur d'ordonnée seule en rouge, cassure 3 traits) ; `test_conge_sur_conge` réaligné (143 arêtes, 58 tangentes, vives 85 inchangées) ; nouveau `test_repeat_circ_tour` (pas 60° pour 6, secteur 90°, « Perçages » 6 → 5 copies, aucune à 360°). Bouton ⟲ vérifié dans l'appli après rechargement. `npm run ci` vert. Non vus à l'écran : import d'un vrai DXF, ordonnées à la souris.

## V0.4.6 - Vue 3D et esquisse : Ctrl + molette enfoncée = déplacement
Retour utilisateur (« Ctrl + bouton molette enfoncé → déplacement de la 3D comme pour le bouton de droite »).
- **Vue 3D** : un écouteur en capture, avant OrbitControls, règle la molette sur « pan » quand Ctrl (ou Cmd) est enfoncé, sinon la laisse à l'orbite maison ; l'orbite ne démarre pas sur ce geste.
- **Esquisse** : Ctrl + molette enfoncée ouvre le même déplacement que le clic droit (la molette seule reste l'orbite).
- **Test** `test_repeat_circ_tour` rendu indépendant de l'état du fichier d'exemple (document ancien format reconstitué).

Tests : vérifié dans l'appli (geste simulé : Ctrl + molette déplace la cible comme le clic droit, 8,1 contre 9,1 ; molette seule réglée sur l'orbite). `npm run ci` vert.

## V0.4.7 - Esquisse : cotes d'angle fiables ; Ctrl + molette = vrai déplacement
Retours utilisateur (« cotes angulaires : marche pas bien » — Crochet.miniFusion, « test angle : angle de 10° pas respecté », « Ctrl + molette enfoncée = déplacement comme le clic droit »).
- **Lignes disjointes** : le sommet d'une cote d'angle est l'INTERSECTION des deux droites (comme Fusion) — l'ancien pseudo-sommet (milieu des milieux) faisait piloter au solveur un angle dépendant de la position des segments : la cote faisait pivoter les lignes dès sa pose. Valeur posée = secteur réel, sens mémorisé aussi pour les disjointes.
- **Entraxe ou angle** : entraxe seulement entre lignes VRAIMENT parallèles (contrainte ∥ ou colinéaire, toutes deux ─ ou │, écart < 0,5°) ; l'ancienne tolérance de 3° posait un entraxe en mm entre lignes presque parallèles (« 10 » tapé comme un angle). À l'ouverture d'une esquisse, un tel entraxe devient une cote d'angle à la valeur mesurée (rien ne bouge).
- **Ctrl + molette** : OrbitControls inverse le rôle d'un bouton avec Ctrl (PAN + Ctrl = rotation) — la molette est déclarée ROTATE pour ce geste, ce qui donne le déplacement (V0.4.6 tournait au lieu de déplacer).

Tests : nouveau `test_esquisse_angle` (fixtures `crochet.miniFusion`, `test-angle.miniFusion`) : cote disjointe = angle réel sans déplacement ; entraxe « 10 » → angle 7,03° puis 10,000° tenu avec les entraxes 585 / 115 ; jamais d'entraxe entre sécantes. Vérifié dans l'appli : Ctrl + molette = clic droit (déplacement 22,654, rotation 0°). `npm run ci` vert.

## V0.4.8 - Ménage : tests d'esquisse recalés, raccourcis intégrés au build, dépôt allégé
Retours utilisateur (« analyse le projet dans son entièreté », puis « recale les 2 tests, range la racine, intègre shortcuts.js en réglant la touche H, git gc, prune LFS »).
- **Tests d'esquisse** : `test_esquisse_transparence` et `test_esquisse_face_conges` attendaient encore le fondu 0.75 d'avant la V0.4.0 (pièce en transparence 0.2) ; ils lisent maintenant `SK_FACE_ALPHA` et font partie de la suite rapide (CI : 23 suites). Commentaires « fondu 0.75 » corrigés dans `30-marqueur-temps.js` et `50-esquisse-2d-solveur.js`.
- **Raccourcis d'esquisse** : `shortcuts.js`, chargé à part (hors lint et tests), devient `src/99-raccourcis-esquisse.js`. La touche **H** n'y déclenche plus le chanfrein : elle cliquait l'outil chanfrein juste avant que H ne bascule sur le centre de perçage. H = centre de perçage seulement. L'aide intégrée liste les lettres d'outils (L C R B, P T D, F O).
- **Racine** : `_probe_style.html` / `.png` sortis du dépôt ; `_tmp_css_scan.js`, `diff_g_o.txt`, une copie en conflit Dropbox et un `.crswap` supprimés ; `.gitignore` ignore `*.crswap` et les copies en conflit. `banner` inutilisé retiré de `build.js`.
- **Documentation** : `analysis.md` réécrit pour V0.4.8 ; README (54 fichiers source, lettres d'outils) ; `package-lock.json` réaligné (il indiquait 0.3.5).
- **Dépôt** : `git gc`, paquet orphelin du 27 septembre supprimé, `git lfs prune` (15 anciens objets, 48 Mo) : `.git` passe de 318 à 191 Mo.

Tests : les 2 suites recalées vertes ; suite complète 113/115 avant correction, les 2 échecs étant ceux-ci. Vérifié dans l'appli : en esquisse L → ligne, C → cercle, F → congé, O → décalage, H → centre de perçage ; aide à jour ; aucune erreur console. `npm run ci` vert.

## V0.4.9 - Tests navigateur réels (Playwright, Chromium headless)
Demande : vérifier dans un vrai navigateur ce que les tests VM (stubs DOM/THREE) ne voient pas — le noyau OCCT WebAssembly et le rendu.
- **`npm run test:browser`** (`tests/browser/`) : sert le dépôt en http (petit serveur statique sans dépendance, MIME wasm / ESM), attend le noyau OCCT, puis trois parcours cliqués comme un utilisateur dans l'interface moderne :
  1. ouvrir `Exemples/Axe.miniFusion` → solide exact, 55 faces dont les 2 tores du congé, volume de référence 78 916,27 mm³ ;
  2. esquisse (rectangle tracé à la souris) → extrusion 12 mm → prisme exact (6 plans, volume l × h × 12) ;
  3. FAO : surfaçage sur l'Axe → « Régénérer » → G-code réellement téléchargé (G54, T1 / M6, passes G1, M30).
  Toute erreur JS non rattrapée ou boîte de dialogue fait échouer le test ; des pointeurs Git LFS à la place des `.wasm` sont signalés d'emblée.
- **Playwright** en devDependency uniquement (aucune dépendance runtime) ; une fois : `npx playwright install chromium`.
- **CI** : job séparé `browser-test` (checkout LFS, Chromium `--with-deps`, rapport en artefact en cas d'échec) ; `build-test` inchangé.

Tests : `npm run test:browser` 3/3 en local (~17 s). `npm run ci` : 22/23 — `test_repeat_circ_tour` échoue sur un clone propre, indépendamment de cette version : il lit `Exemples/Perçages.miniFusion`, dont seule la copie locale non commitée contient la répétition circulaire.

## V0.5.0 - Géométrie de construction : plans, axes, points, repères ; esquisse dessus
Demande : « implémenter un assemblage » — étape 1 de la feuille de route : la géométrie de construction de la pièce, avec esquisse dessus (les repères serviront au placement des pièces).
- **Modèle** (`src/78-construction-modele.js`) : liste `doc.cgeo`, à part des fonctions 3D (`doc.features` reste « ce qui fait le solide »). Chaque élément est ancré dans le fil par `at` (fonction après laquelle il est évalué ; il se raccroche à la précédente si elle disparaît) et garde son repère résolu `fr`, persisté. 15 méthodes : plan décalé, à un angle, 3 points, médian, normal ; axe sur référence, 2 points, intersection, normal ; point sur référence, coordonnées, intersection ; repère Z/X, sur un plan, 3 points.
- **Références** : origine (plans, axes X/Y/Z, point O), autre élément (et plans ou axes d'un repère), point d'esquisse, et géométrie de la pièce résolue sur le solide qui **précède** l'élément, avec le nommage persistant existant (faces : `occFindFaceAny` ; arêtes : ancre d'esquisse comme les congés exacts ; sommets qui suivent leur arête).
- **Interface** (`src/79-construction-interface.js`) : groupe « Construire » du ruban et `Ctrl+K`, panneau de création / modification (méthode, références désignées dans la vue ou l'arbre, ƒx, inverser, aperçu), dessin 3D (plans à la taille de la pièce, axes, points, repères à taille constante), groupe « 📐 Construction » de l'arbre, axes X/Y/Z de l'origine, menu contextuel, suppression avec avertissement.
- **Esquisse dessus** (`plane:'CG'`) : la base est recopiée de l'élément à chaque rejeu ; l'esquisse et ses fonctions suivent le plan. Annuler / rétablir, sauvegarde, ƒx, marqueur temps couverts. L'empreinte d'un document sans construction est inchangée (pas de rejeu forcé des caches).
- **Sans noyau exact** ou **référence perdue** : position mémorisée, ⚠ et message dans l'arbre.
- **Tests** : la suite complète `node tests/run.cjs` tourne en parallèle (pool de processus, plus longues d'abord, chrono par suite : ~3,5 min au lieu de ~20 en série sur 8 cœurs).

Tests : `test_construction_modele` (15 méthodes au µm, chaînes, ƒx, sauvegarde, annuler, suppression, marqueur ; aussi en suite rapide) et `test_construction_esquisse` (vrai noyau : plan sur la face du dessus → plot à z 55, bloc rehaussé → plan et plot suivent, axe d'un cylindre, sommet qui suit, repli sans noyau). Suite complète 117/117. Nouveau parcours Playwright « plan décalé → esquisse → extrusion → plan déplacé », non exécuté sur ce poste (Playwright non installé) ; le même parcours a été vérifié à la main dans le navigateur (z 20..30 puis 35..45, Ctrl+Z).

## V0.5.1 - Bandeau de timeline façon Fusion 360
Demande : « pour l'arborescence et le fil des opérations, un bandeau horizontal des opérations à la Fusion 360 ? ».
- **`src/41-bandeau-timeline.js`** : bandeau en bas de la vue 3D de l'espace CAO, une icône par étape dans l'ordre du fil — fonctions, esquisses juste avant leur fonction consommatrice, éléments de construction après leur fonction d'ancrage. Survol = nom ; clic = sélection (partagée avec l'arbre) ; double-clic = édition ; ⚠ marqués.
- **Marqueur temps** glissable dans le bandeau, et boutons ⏮ ◀ ▶ ⏭ ; les étapes au-delà sont grisées.
- **Glisser-déposer** d'une fonction pour la réordonner dans son corps, avec les mêmes règles que ▲▼ (blocs de répétition entiers) : `featMove` est découpé en `featMoveRaw` (pur) et `featMoveApply`, le glisser enchaîne les crans sur une copie et ne laisse qu'une étape d'annulation.
- Masqué hors de l'espace CAO et pendant l'édition d'une esquisse ; suit chaque rejeu et chaque changement de sélection (`renderTimeline` en fin de `renderTree`). L'ancien panneau `#timeline` à puces est remplacé.

Tests : nouveau `test_timeline_bandeau` (ordre des étapes, marqueur, glisser). Suite complète 118/118 après fusion dans `main` ; vérifié dans le navigateur (5 thèmes par la session qui l'a développé, puis après fusion avec un plan de construction, une esquisse et une extrusion).

## V0.6.0 - Assemblage : pièces, occurrences, placement par repères
Demande : « implémenter un assemblage » (étapes 2 à 4). Choix : pièces dans le même fichier, placement par repères et manipulateur (pas encore de liaisons ni de solveur), sous-assemblages prévus dans le format.
- **Pièce active** (`src/46-assemblage-modele.js`) : le code travaille sur une pièce globale `doc` (~650 accès) ; elle reste, et devient la pièce active. `asm` porte les pièces (documents complets) et les occurrences (position, fixée, visible, alignement). Changer de pièce ferme les modes SANS `docResetEmpty` (qui supprime `doc.fao`), range annuler / marqueur temps / sélection de la pièce, bascule `doc`, rejoue ; à la première activation, mêmes réparations qu'à l'ouverture d'un fichier. Points de contrôle du noyau préfixés par la pièce.
- **Fichier** : la pièce active reste au premier niveau (un fichier d'une seule pièce est strictement identique, une version antérieure ouvre la pièce active), les autres pièces et les occurrences dans un bloc `asm`. Bundle : trajectoires FAO et imports de toutes les pièces. L'insertion stocke ceux du fichier inséré (`bundleStoreCaches`), sans toucher à `bundleRestore` : y ajouter une attente asynchrone changeait l'ordre avec la restauration des imports STEP (`test_conge_sur_conge` passait de 143 à 155 arêtes) — course préexistante, à examiner.
- **Vue d'assemblage** (`src/47-assemblage-interface.js`) : scène séparée (celle de la pièce n'est jamais touchée), instantanés d'affichage de chaque pièce (géométries clonées en fin de rejeu, refaites en exact quand le noyau est prêt), arbre des occurrences, panneau, ruban réduit au groupe Assemblage. En mode pièce : autres occurrences en fantômes, fil d'Ariane. Insérer un fichier (copie de ses pièces, alerte si déjà inséré), nouvelle pièce, nouvelle occurrence, fixer, renommer, supprimer, Ctrl+Z dédié. FAO / PLAN restent des espaces de pièce.
- **Placement** (`src/48-assemblage-placement.js`) : manipulateur 3D (translation et rotation le long des axes de l'assemblage, pas 1 mm / 5°, Maj = libre, un geste = une annulation), position et rotations ±90° au panneau, **Aligner** un repère de la pièce sur l'origine ou sur un repère d'une autre occurrence (retourner, rotation, décalage), associatif : recalculé à chaque rejeu d'une pièce.
- **Arbre et bandeau de timeline** : les esquisses des instances de répétition (« … (rép 3) ») ne sont plus listées (retour utilisateur).

Tests : `test_assemblage_modele` (fichier d'une pièce inchangé, bascule de pièce qui garde FAO / PLAN / construction / annuler, aller-retour du fichier, alignement avec retournement / rotation / décalage au µm, associativité, cycle, suppression, annuler, rotations du placement ; aussi en suite rapide) ; parcours Playwright « deux pièces, aligner un repère, la pièce suit une modification », rejoué à la main dans Chromium (pied posé en 20 ; 15 ; 20, puis 35 après le socle rehaussé). Suite complète 119/119. Vérifié dans le navigateur : vue d'assemblage, contexte en mode pièce, manipulateur (+12 mm, Ctrl+Z / Ctrl+Y), enregistrement et réouverture, insertion d'`Axe.miniFusion` (55 faces, 78 916,27 mm³), FAO depuis l'assemblage.

## V0.6.1 - Composants imbriqués, façon Fusion 360
Demande : « un miniFusion comme Fusion 360, avec un repère de base et de la géométrie de base, puis des pièces avec leurs repères et leur géométrie propre, et des pièces dans les pièces ». Étape 1 sur 5 (suivent : composants liés à un fichier externe, références entre composants, liaisons, mise en plan d'assemblage). Choix : deux modes par composant (Modéliser / Placer).
- **Tout est composant** (`src/46-assemblage-modele.js`) : le fichier est la racine (une pièce complète), chaque composant porte ses occurrences enfants. Instance éditée = chemin d'occurrences depuis la racine (`asm.path`) ; `doc` reste le composant actif. Repère monde d'une instance (`asmWorld`), parcours (`asmInstances`), cycles de contenance refusés (`asmContains`).
- **Alignements par chemins relatifs** au composant porteur : cible = sa géométrie de base (origine, repères de construction) ou un repère de n'importe quel descendant ; résolus de bas en haut (la disposition interne d'un enfant ne dépend pas de son parent).
- **Fichier** : bloc `asm` v2 (`root`, `path`, `comps` avec leurs occurrences). Un fichier sans composant est inchangé ; un assemblage V0.6.0 (v1) est migré à l'ouverture (racine vide portant les occurrences, alignements convertis) ; une version antérieure ouvre le composant actif. Fichier abîmé : occurrence qui ferait un cycle écartée, composant inaccessible rattaché à la racine.
- **Interface** (`src/47-assemblage-interface.js`, `src/48-assemblage-placement.js`) : modes Modéliser / Placer à tous les niveaux, dessin récursif dans le repère de l'instance éditée (descendants figés, reste en fantômes), fil d'Ariane et hiérarchie complète dans l'arbre, Échap remonte, ruban « Composants » (Placer, Composant, Occurrence, Insérer). Insérer garde la structure du fichier inséré (identifiants renouvelés, alignements internes suivis).

Tests : `test_composants_modele` (trois niveaux, repère monde, alignement sur la géométrie de base et sur un repère deux niveaux plus bas, ordre de bas en haut, associativité, cycles refusés, activation par chemin, aller-retour, fichier abîmé, insertion imbriquée ; aussi en suite rapide), `test_assemblage_modele` adapté (et relecture d'un fichier V0.6.0). Parcours Playwright « composants : racine avec un repère de base, composant aligné qui suit, sous-composant », rejoué à la main dans Chromium (composant posé en 20 ; 15 ; 20 puis 35 après la racine rehaussée ; fil d'Ariane Socle › Composant 1 › Composant 2). Vérifié dans le navigateur : assemblage V0.6.0 enregistré rouvert et migré, Axe inséré dans un composant (trois niveaux), clic sur un petit-enfant = son ancêtre direct sélectionné, enregistrement et réouverture en mode Placer.

## V0.6.2 - Composants depuis les corps, déplacer vers un composant
Demande : idées reprises de SolidCraft (« Create Components from Bodies », « Move Bodies / Sketches to Component ») — convertir une pièce multicorps en assemblage sans la remodéliser.
- **Dépendances** (`src/48-composants-depuis-corps.js`) : tout se cite par identifiant ; `asmIdsIn` parcourt chaque élément (fonction, esquisse, construction) — esquisse d'une fonction, fonction hôte d'une esquisse sur face, plan de construction, sources d'une répétition, corps outils d'une combinaison. L'ancrage d'une construction dans le fil (`at`) n'est pas une dépendance (recalé au transfert). `asmSplitPlan` refuse, avec la raison, quand ce qui part s'appuie sur ce qui reste ou l'inverse ; une esquisse / construction nécessaire est déplacée si plus rien ne la cite, sinon copiée.
- **Transfert** (`asmSplitApply`) : identifiants renouvelés s'ils existent déjà dans la cible (la fonction suit son esquisse), corps renumérotés, fiche du corps (nom, couleur, visibilité), paramètres manquants, construction ancrée au bon endroit. Les couleurs automatiques (rang du corps) sont figées : retirer un corps ne repeint ni lui ni les suivants.
- **Commandes** : ruban « Depuis corps » (corps sélectionné, sinon chacun), clic droit sur un corps (« Créer un composant depuis ce corps », « Déplacer vers un composant… ») ou une esquisse (« Déplacer vers un composant… », vers un composant existant ou neuf). Composant neuf à l'identité : rien ne bouge. Cible placée ailleurs : avertissement (la géométrie garde ses coordonnées).
- **Annulation** : une étape d'assemblage peut emporter des documents (`asmPush(label, docs)`) ; horloge commune `undoTick` (45) : Ctrl+Z / Ctrl+Y en mode Modéliser défont / refont la conversion quand c'est l'opération la plus récente (boutons et raccourcis).

Tests : `test_composants_corps` (modèle : refus croisés, déplacé / copié, combinaison, identifiants et corps renouvelés, paramètres, ancrage ; noyau réel : bloc 32 000 mm³ + colonne 12 566,4 mm³ → composant à la même place, mêmes volumes ; Ctrl+Z / Ctrl+Y par le vrai raccourci ; esquisse libre déplacée, esquisse utilisée refusée, composant neuf). Parcours Playwright « composants depuis les corps : clic droit sur un corps, même place, Ctrl+Z ». Vérifié dans le navigateur : trois corps convertis (couleurs conservées), esquisse libre déplacée vers « Colonne » par le menu, Ctrl+Z / Ctrl+Y au clavier.

## V0.6.3 - Composants liés à un fichier, édités sur place
Étape 2 du plan « composants façon Fusion 360 » (choix : édition sur place, la source est réécrite) + idées SolidCraft (extraire vers un fichier, remplacer par un lien, relier la source, mettre à jour les liens).
- **Modèle** (`src/47-composants-lies.js`) : `comp.link` = {rel (chemin dans le dossier de projets), key (handle en IndexedDB hors du dossier), sig (empreinte du texte de la source à la dernière synchro), map (ids de la source renouvelés dans l'hôte), srcRoot, pend (modifié ici, pas encore écrit)} ; les sous-composants venus du fichier portent `of` (liens imbriqués compris). Un composant ne s'ajoute dans un composant lié que s'il en fait partie ; ceux qu'on y crée en font partie.
- **Charger** (`asmLinkLoad`) : la racine de la source remplace le CONTENU du composant lié (même objet, il peut être actif), ses sous-composants sont mis à jour en gardant leurs identifiants : les alignements de l'hôte suivent. Caches du bundle (trajectoires, imports) restaurés.
- **Vérifier** (`asmLinksCheck`) : ouverture, retour sur l'onglet, bouton 🔄 de l'arbre (geste : autorisation du dossier). Conflit : garder les miennes / prendre la source / rompre. **Écrire** (`asmLinksWrite`, appelé par `mffWrite` avant l'hôte) : enveloppe de la source gardée (bundle : trajectoires, imports), écrasement confirmé si elle a aussi changé.
- **« Modifié ici »** : empreinte du sous-arbre comparée à celle prise APRÈS le rejeu des composants (la première activation normalise un document sans que ce soit une modification) ; `pend` enregistré dans l'hôte, la modification survit à une réouverture.
- **Commandes** : Insérer → Lier / Copier ; clic droit (arbre, panneau) : Extraire vers un fichier, Remplacer par un lien, Relier la source, Rompre le lien, Mettre à jour les liens ; même source liée deux fois → occurrence. Pastilles 🔗 ✎ ⚠.

Tests : `test_composants_lies` (dossier de projets simulé en mémoire : lier, source modifiée → mise à jour et alignement suivi, édition sur place → source réécrite, conflit ×3, hôte rouvert « modifié ici », source introuvable, même source deux fois, assemblage lié avec sous-composant, extraire, Ctrl+S de l'hôte ; aussi en suite rapide). Parcours Playwright avec le stockage privé du navigateur (OPFS : vraies API de fichiers). Vérifié dans le navigateur avec OPFS : Axe lié, modifié sur place (bundle réécrit), source modifiée ailleurs → « Mis à jour depuis le disque ».

## V0.6.4 - Références entre composants
Étape 3 du plan « composants façon Fusion 360 ».
- **Construction « Depuis un autre composant »** (méthode `ext` des plans, axes, points et repères, `src/78-construction-modele.js`) : `el.ext` = {ctx (instance où l'on travaille), path (instance visée), cg (élément de construction) | o (XY, XZ, YZ, X, Y, Z, O), frozen, last} ; valeur = inv(monde(ctx)) · monde(path) · élément (`asmExtFrame`, `src/46-assemblage-modele.js`). Paramètres et inversion habituels (décalages et rotation d'un repère). Esquisse posée dessus, alignement dessus : comme n'importe quel élément.
- **Suivi** (`asmExtSync`) : après un placement ou le rejeu d'un composant, ceux dont une référence externe a bougé sont rejoués (l'actif, ou les autres en arrière-plan avec leur instantané), jusqu'à stabilité ; trois passes au plus, sinon ⚠ « références circulaires ». Figée : garde sa position. Élément visé disparu : position mémorisée, ⚠.
- **Interface** (`src/79-construction-interface.js`) : la méthode n'apparaît que s'il existe une autre instance ; liste des éléments visés (même type + origine), « Figer » dans le panneau de l'élément. Hors périmètre : faces et arêtes d'un autre composant (un composant inactif n'a qu'un maillage d'affichage) — y poser d'abord un plan de construction.

Tests : `test_composants_references` (plan repris avec la position du socle, esquisse dessus, suivi composant actif / inactif, socle modifié, deux instances et contexte, figer / libérer, fichier, élément visé supprimé, circulaire après trois passes ; aussi en suite rapide). Vérifié dans le navigateur avec le noyau exact : plan du dessus du socle repris dans la colonne, esquisse et extrusion dessus ; socle rehaussé (20 → 30) : la colonne inactive suit.

## V0.6.5 - Liaisons mécaniques
Étape 4 du plan « composants façon Fusion 360 » + idées SolidCraft (liaison telle que construite, capturer / rétablir la position, piloter les liaisons).
- **Modèle** (`src/46-assemblage-modele.js`) : une liaison est un alignement qui garde des degrés de liberté — `type` (rigide, pivot, glissière, pivot glissant, plan, rotule), `q` (valeurs), `lim` (limites), `q0` (repos) ; M = T · J(q) · S⁻¹, J = translation puis Rz·Ry·Rx, limites appliquées (`asmJointFrame`). Résolution directe dans l'ordre des dépendances, boucle fermée → ⚠. **Telle que construite** (`asmAsBuilt`) : repères explicites (`rel`, `sfr`) pris à la position actuelle, autour d'un axe de l'occurrence. Un alignement sans type reste rigide (fichiers V0.6.x inchangés).
- **Interface** (`src/48-assemblage-placement.js`) : type au panneau, curseur + valeur + limites par degré de liberté (une étape d'annulation par geste), Capturer la position / Rétablir, ▶ Animer (aller-retour entre les limites, Échap arrête), « Liaison telle que construite… » sur une occurrence libre, panneau du composant : toutes ses liaisons à piloter. **Manipulateur contraint** : seulement les degrés de liberté de la liaison, dans son repère et ses limites. Pastille ⚙ dans l'arbre.

Tests : `test_composants_liaisons` (rigide = l'alignement, pivot 30°, limites, glissière, pivot glissant, plan, rotule, chaîne de deux liaisons, boucle ⚠, telle que construite autour de Z et de X de l'occurrence, fichier, animation aux butées, manipulateur ; aussi en suite rapide). Parcours Playwright « liaisons : pivot tel que construit, piloté au curseur, limites ». Vérifié dans le navigateur : bras sur bâti, pivot tel que construit, curseur à 60°, limite 30°, Ctrl+Z.

## V0.6.6 - Inspection : interférences, propriétés physiques
Idées SolidCraft (interférences, propriétés de masse par composant), dans le plan « composants façon Fusion 360 ».
- **Formes exactes de l'assemblage** (`src/48-composants-inspection.js`) : par composant, copies des solides d'un rejeu frais (`occFinalShape` : les solides affichés peuvent avoir été remplacés par un rejeu), gardées en cache (`c._exact`) tant que l'empreinte du composant ne change pas ; les autres composants sont activés le temps de la copie, puis retour au composant actif. Placées par instance (`gp_Trsf` / `BRepBuilderAPI_Transform`).
- **Propriétés physiques** : `BRepGProp` (volume, centre de gravité) par corps ; masse = volume × masse volumique de la matière du composant (`doc.mat`, acier par défaut, liste de 14 matières) ; total et centre de gravité pondéré, sphère jaune dans la vue.
- **Interférences** : toutes les paires de corps distincts (même pièce comprise), tri par boîtes englobantes puis `BRepAlgoAPI_Common` ; volume commun > 0,001 mm³ montré en rouge.
- **Commande** « Inspecter » (ruban Composants), panneau de résultats (matière par composant, une étape d'annulation), relancer / fermer ; fermé en changeant de composant.

Tests : `test_composants_inspection` (noyau réel : pièce multicorps seule — interférence 1 000 mm³ ; deux composants — 86,4 g d'aluminium + 39,25 g d'acier, centres de gravité, interférence ; relance depuis le cache sans rejeu ; colonne écartée — plus d'interférence ; deux occurrences superposées — 5 000 mm³). Vérifié dans le navigateur : socle et colonne, volume commun en rouge, centre de gravité.

## V0.6.7 - Mise en plan d'assemblage
Étape 5 du plan « composants façon Fusion 360 ».
- **Vue « Assemblage »** (`src/48-composants-plan.js`, `src/98-mise-en-plan.js`) : le PLAN travaille sur des corps (maillage + solide exact) ; une vue `asm` reçoit ceux du composant actif plus un corps par corps de chaque instance placée (`asmPlanBodies`) — solide exact copié et transformé, maillage tiré du solide (repli : l'instantané d'affichage). Les solides des autres composants viennent d'un **rejeu silencieux** (`asmExactQuiet` : document échangé le temps du calcul, sans activation — activer fermerait le PLAN), en cache. HLR exact, coupes, détails : inchangés. La clé de cache de la vue inclut l'empreinte de l'assemblage (placements, composants) : une occurrence qui bouge la recalcule.
- **Nomenclature par composant** (`asmBomRows`) : 1er niveau, tous niveaux, pièces seules ; quantité = nombre d'instances, dimensions (instantané), matière du composant ou saisie au plan.
- **Bulles** (`sh.balloons`) : automatiques sur la première vue d'assemblage, accrochées au centre de la première instance de chaque composant, numéro = ligne de la nomenclature (renumérotées avec elle).
- Correctif (V0.6.5) : changer une limite de liaison sans changer sa valeur n'empile plus d'étape d'annulation (le parcours Playwright des liaisons échouait sur un double « change »).

Tests : `test_composants_plan` (noyau réel : trois corps placés sans activer de composant, volumes, positions, cache ; HLR exact de la vue, recalculée quand une occurrence bouge ; nomenclature 1er niveau / tous niveaux / pièces seules, matière ; bulles numérotées et renumérotées). Vérifié dans le navigateur : vue de face d'un socle et de deux colonnes, nomenclature et bulles sur la planche.

## V0.7.0 - Tests de référence
Fin de la série « composants façon Fusion 360 » (V0.6.1 à V0.6.7) ; première étape de la série V0.7 (idée SolidCraft : pièces de référence aux valeurs connues).
- **12 pièces de référence** (`tests/oracle/cas.cjs`) décrites par une petite recette (esquisses rectangle / cercle / polygone / axe / centres de perçage sur un plan quelconque ; extrusion, découpe, nouveau corps, révolution 360° et 90°, perçage borgne à pointe, lamage, combiner union / intersection) et leurs valeurs **calculées à la main** — formules dans le fichier : volume, surface, centre de gravité (ou sa distance à l'axe), encombrement. Aucune valeur ne vient d'un logiciel de CAO.
- **`test_oracle`** construit chaque recette dans MiniFusion (noyau exact), mesure avec `BRepGProp` (volume, surface, centre de gravité) et `BRepBndLib.AddOptimal` (encombrement exact) ; tolérance 10⁻⁶ (relatif pour volume et surface, mm pour le reste). Écarts mesurés : ≤ 4·10⁻¹⁵. Vérifié qu'une valeur attendue fausse (48 001 au lieu de 48 000 mm³) est refusée.
- **`docs/oracle.md`** : tableau des pièces, résultats, écarts et formules, régénéré par `npm run oracle`.

## V0.7.1 - Esquisse qui ne décroche plus
Reproduit sur l'esquisse du Crochet (`Exemples/Crochet.miniFusion`) : en V0.7.0, un glisser rapide puis le retour laissait l'esquisse non résolue, une ligne retournée (la verticale de 6 mm passée sous l'horizontale) ou des points envolés à des centaines de milliers de mm ; une cote d'angle modifiée restait à ~3° de sa valeur. Idées reprises du solveur de SolidCraft.
- **Glisser par petits pas** (`skDragWalkTo`) : le chemin du curseur depuis la dernière position résolue est découpé en pas d'un quart de la plus petite cote, du plus petit rayon ou de la plus petite ligne touchée (2 px au moins, 24 pas au plus par mouvement de souris), chacun résolu depuis le résultat du précédent. Un pas qui laisse l'esquisse non résolue ou qui la retourne (une ligne, un rayon d'arc ou une cote point-point dont une composante principale change de signe) est divisé par deux ; en deçà d'un huitième de pas, la géométrie s'arrête au bord de ce qu'elle peut atteindre. L'écran ne montre plus d'état non résolu pendant un glisser. Un mouvement de souris normal reste une seule résolution (médiane 8 ms sur le Crochet).
- **Amortissement au moindre déplacement** : le pas de Levenberg-Marquardt est amorti par λ·W (W = 1 par inconnue) et non plus par la diagonale de JᵀJ. Parmi les pas qui réduisent autant le résidu, c'est le plus court en mm : un coin libre ne pivote plus quand on tire le coin voisin (4,9 mm → 0,025 mm). Un point tenu sur une ligne ou un cercle coûte 100 fois moins : il glisse.
- **Résidu d'angle en mm** (angle × plus long rayon du secteur, 1 mm au moins), dans le solveur et l'audit : en radians, il ne pesait presque rien face aux contraintes en mm ×300 (au plus court rayon, un côté écrasé ramenait l'écart en radians et un angle faux de 2,6° passait sous le seuil d'alerte).
- **Itération prolongée** quand la résolution n'a pas convergé (8× le budget, 400 ms au plus, pas pendant un glisser), et un pas refusé est redemandé avec un amortissement plus fort sur le même Jacobien au lieu de le recalculer.
- **Jacobien creux par colonnes groupées** (Curtis–Powell–Reid) : les inconnues qui ne partagent aucune ligne du résidu sont décalées ensemble — même dérivée, 2 × (nombre de groupes) évaluations du résidu au lieu de 2n. Structure relevée sur un Jacobien complet, gardée par esquisse (signature), et revérifiée sur un Jacobien complet avant tout arrêt sans convergence. JᵀJ construit ligne par ligne sur les seules dérivées non nulles ; pendant une résolution, index des entités par id et points fixés calculés une fois. Une esquisse déjà résolue ne calcule plus de Jacobien. Temps mesurés dans le navigateur, Cavité Usinage esquisse 11 (126 inconnues) : 30° 1 198 → 232 ms, 24° 1 609 → 261 ms, 20° refusé 3 026 → 790 ms ; déjà résolue 24 ms (V0.7.0 : ~4,5 s à chaque résolution, sans jamais la résoudre).
- **Échec = retour arrière** (`skSolveOrRevert`) pour les cotes modifiées (étiquette, saisie, champs du panneau) et les contraintes ajoutées : si l'esquisse était résolue avant et ne l'est plus, la modification est annulée, l'esquisse revient exactement à son état précédent et la barre d'état l'explique (« ⛔ Cote impossible (longueur en défaut de 3.33 mm) : esquisse laissée telle quelle. »). Une esquisse déjà en défaut n'est pas bloquée.
- **Harnais** : `test_esquisse_crochet` (39 modifications de cote et 102 glissers aller-retour sur la fixture du Crochet ; 49 échecs en V0.7.0), `test_esquisse_moindre_deplacement`, `test_esquisse_retour_arriere` et `test_esquisse_aleatoire` (12 graines × 40 opérations aléatoires : cotes, contraintes, suppressions, glissers, annulations ; l'esquisse reste saine, un refus laisse les coordonnées intactes, l'aller-retour JSON ne la fait pas bouger — il a trouvé un défaut de la restauration, corrigé).
- **« Impossible de coter un angle comme il faut »** — Cavité Usinage, esquisse 11 (face) : la cote de 20° entre l'épaulement e50 et le flanc e51 est géométriquement impossible (longueur de e51 = 16,5 − 6/tan θ − 8·tan(θ/2) = −1,39 mm ; limite ≈ 21,6°) ; V0.7.0 la laissait fausse de ~19° sans le dire, et n'atteignait pas non plus 22°–24° (120 itérations). Désormais 24° et 30° sont résolus à la longueur calculée à la main, 20° est refusé avec les cotes en défaut (`test_esquisse_angle_cavite`, fixture `cavite_esquisse11.json`). Le message de refus cite jusqu'à 3 éléments en défaut.
- Esquisses d'exemple inchangées, sauf cette esquisse 11, déjà contradictoire dans le fichier et inutilisée.

## V0.7.2 - Points d'accroche d'assemblage
Aligner un composant (et le lier) non plus seulement par ses repères, mais par sa géométrie, comme les points d'accroche de Fusion 360 (nouveau `src/48-assemblage-accroches.js`).
- **Clic sur une face** pendant « Aligner » (la pièce à poser à l'étape 1, la cible à l'étape 2 — composant actif ou autre composant, à toute profondeur) : ses points d'accroche s'affichent (sphères vertes ; jaunes pour ceux des arêtes) et dans le panneau ; un clic en choisit un.
- **Points proposés**, lus sur la forme EXACTE du composant (cache `c._exact`, rejeu silencieux si besoin) : face plane → centre de surface et 8 points cardinaux du rectangle englobant (nord, sud, est, ouest, coins ; vue de l'extérieur, face horizontale : est = +X du composant, sinon nord = vers le haut) ; face cylindrique → début, milieu, fin de l'axe (axe orienté dans le sens positif du composant) ; arêtes de la face → milieu et extrémités d'une arête droite, centre d'un cercle (ses deux demi-arcs reconnus) ou d'un arc. Z = normale sortante de la face ou axe. L'origine de chaque composant reste proposée (triade).
- **Associatif** : la référence (`rel.sn`) garde la signature de la face (type, centre, normale ou axe, rayon), le point visé et le dernier repère calculé. Quand le composant visé est rejoué, la face est retrouvée (même type, même orientation, centre le plus proche), le point recalculé, et l'occurrence alignée suit ; face disparue → ⚠ « point d'accroche introuvable », position mémorisée, puis rétablie si la face revient. Enregistré dans le fichier, relu à l'ouverture.
- **Tests** : `test_composants_accroches` (OCCT réel, 18 contrôles : socle 40×40×20 percé Ø8 et goupille Ø10×30 — centre de surface calculé à la main avec le perçage, points cardinaux, centre du perçage, axe ; goupille posée sur le coin nord-est puis sur le perçage ; socle 60×60 puis 25 de haut : elle suit ; face disparue puis revenue ; enregistrement) et un parcours Playwright à la souris (clic sur le cylindre, point du bas de l'axe, clic sur le dessus du socle, « nord-est », socle remonté à 35 : la goupille suit).

## V0.7.3 - Apparence en mode Placer
Le mode Placer montre les pièces comme le mode Modéliser, avec une apparence propre à chaque occurrence (nouveau `src/48-assemblage-apparence.js`).
- **Arêtes** : l'instantané de chaque composant garde ses arêtes, lues comme l'overlay de la pièce (forme exacte, vives noires, tangentes grises ; repli maillage), capturées à chaque rejeu quel que soit le bouton « Arêtes ». Affichées en mode Placer quand le bouton est actif (le changer redessine la vue), devant les faces (décalage de polygones), avec le voile gris des arêtes arrière quand la pièce est transparente.
- **Apparence par occurrence** (panneau de l'occurrence, section « Apparence (mode Placer) ») : RÉUTILISE les réglages d'un corps — « Intensité » (15–100 %, la pièce s'estompe), « Transparence » (0–90 %, verre : on voit l'intérieur) — appliqués par les mêmes fonctions (`setMatAlpha`, passes de verre `glassDepthMask`) ; arêtes « comme le bouton » / toujours / jamais. La couleur reste celle des corps, la même dans tous les modes. Sans réglage, chaque corps garde ceux de sa fiche (intensité et transparence comprises, désormais capturées). Réglage en direct pendant le glisser, une seule étape d'annulation ; « Appliquer à toutes les occurrences » ; « Par défaut ».
- **Héritage** : l'apparence vaut pour l'occurrence et tout ce qu'elle contient, l'occurrence la plus profonde l'emporte champ par champ. Le mode Modéliser n'en tient pas compte. Enregistrée avec l'assemblage (`occ.look`, relue avec les bornes des corps).
- **Tests** : `test_composants_apparence` (modèle : héritage, arêtes, bornes, fichier, annulation, glisser en une étape, segments) et un parcours Playwright (arêtes affichées, pas de couleur par mode, intensité 50 %, transparence 50 % avec passes de verre et voile, arêtes « Jamais », mode Modéliser inchangé).

## V0.7.4 - Rotation de la vue en mode Placer
En mode Placer, la vue tournait autour d'un point sans rapport avec ce qu'on voit : le pivot d'orbite (`orbitPivot`) prenait la face sélectionnée ou les corps de la pièce ACTIVE (la racine d'un assemblage n'en a souvent aucun), sinon la cible de la caméra, qu'un déplacement de la vue décale.
- **Pivot du mode Placer** (`asmOrbitPivot`), comme en Modéliser (face choisie, sinon les pièces) : le repère de référence cliqué dans l'arbre — origine du composant actif ou un de ses repères de construction (ligne en surbrillance ; clic à nouveau ou Échap pour le quitter) —, sinon l'occurrence sélectionnée (centre de sa boîte), sinon le centre des pièces placées (fantômes exclus). Sélectionner une pièce (arbre ou vue) la reprend comme centre ; changer de composant oublie le repère choisi.
- **Test** : parcours Playwright — pivots (pièces, goupille, origine) et vraie rotation à la souris : la goupille sélectionnée reste au même endroit de l'écran.

## V0.7.5 - Miroir sous la dernière pièce visible, et sous le brut en simulation
Le sol miroir (`refreshMirror`) se pose sous le point le plus bas de ce qui est AFFICHÉ.
- **Mode Modéliser dans un assemblage** : les autres composants affichés autour de la pièce (figés ou en fantôme, groupe `asmCtx`) comptent désormais — un composant plus bas que la pièce active ne traverse plus le miroir ; le sol est recalculé quand cet affichage change (`asmCtxDraw`).
- **Seulement le visible** : un corps (ou un objet) dont lui-même ou un parent est masqué ne retient plus le sol sous lui.
- **FAO, simulation d'usinage** : le brut du simulateur et la matière usinée (`faoVw.stock`, `faoVw.matter`) comptent ; le sol est recalculé à l'ouverture et à la fermeture de la simulation et quand la case « corps pièce » change. Avant, il restait sous la pièce : un brut plus bas que la pièce traversait le miroir (Axe, brut descendu à −40 : sol −28 → −40,02).
- **Fil d’Ariane de l’assemblage** (en tête de l’arbre) : le libellé « modéliser » / « placer » devient deux boutons, « ✏️ Modéliser » et « 🧩 Placer », qui basculent d’un mode à l’autre SANS quitter la pièce : « Placer » depuis une pièce sans sous-composants remonte à l’assemblage qui la contient, elle sélectionnée ; « Modéliser » depuis Placer reprend la pièce sélectionnée. Boutons fins (18 px). Un clic sur un nom du fil d’Ariane remonte à ce composant DANS LE MODE EN COURS : en Modéliser, on sort simplement de l’édition de la pièce (avant : passage en mode Placer).
- **Nom de la racine** : un composant porte le nom de son document — la racine restait « Sans titre » dans un fichier « Test Assemblage » (nom changé à l’ouverture, à « Enregistrer sous » ou dans « Nom du document » sans passer par « Renommer ») ; les occurrences suivent.
- **Mode Modéliser = mêmes attributs visuels que le mode Placer** : les composants affichés autour de la pièce (sous-composants et le reste de l'assemblage) gardent leurs arêtes, l'intensité et la transparence de leurs corps et l'apparence réglée sur leur occurrence (même rendu verre) — au lieu d'être figés à 60 % (descendants) ou en fantôme à 18 % (le reste), sans arêtes. Ils restent non sélectionnables. Le bouton « Arêtes » les redessine aussi. La section du panneau devient « Apparence (assemblage) ».
- **Tests** : deux parcours Playwright (goupille 25 mm sous le socle en mode Modéliser ; brut de l'Axe descendu à −40 en simulation : le brut reste au-dessus du miroir).

## V0.7.6 - Extrusion dynamique
Créer et modifier une extrusion comme dans Fusion 360 ou SolidCraft (nouveau `src/70-extrusion-dynamique.js`).
- **Aperçu immédiat** : « Extrusion » crée tout de suite une VRAIE fonction de 20 mm, rejouée par le noyau exact — l'aperçu est exactement le résultat ; l'esquisse est masquée comme après une extrusion.
- **Flèche à tirer** au centre du profil, le long de la normale de l'esquisse, de taille constante à l'écran : pas de 1 mm (Maj : libre), tirer de l'autre côté du plan inverse le sens ; une seule étape d'annulation par glisser. **Champ « Distance »** flottant à côté de la pointe : on tape la valeur, Entrée.
- **Fenêtre à icônes** (panneau) : profil (« Changer »), opération (➕ Plot · ➖ Poche · ◧ Nouveau corps), direction (↗ Un côté · ↕ Symétrique · ⇄ Inverser), étendue (📏 Distance · 🎯 Jusqu'à la face · ⤴ À travers tout), distance, « ▸ Options » repliables (dépouille), **Annuler / OK**.
- **La même fenêtre pour modifier** : elle s'ouvre dès qu'une extrusion est sélectionnée, avec sa flèche. **OK** valide (et désélectionne) ; **Annuler** (ou Échap) remet le document EXACTEMENT comme à l'ouverture — création : la fonction disparaît ; modification : valeurs d'avant — et retire les étapes d'annulation prises entre-temps. Chaque réglage reste une étape d'annulation.
- Le formulaire `extNew` / `extNewOk` reste pour les scripts et les tests.
- **Transparence : une pièce transparente DANS une pièce opaque ne se voit plus à travers elle** (édition d’un composant, ou deux corps d’une pièce) : la passe « intérieur » du rendu verre (profondeur « plus loin ») passait aussi derrière l’autre pièce. Sa passe de profondeur marque désormais (stencil) les pixels où la pièce est devant, et l’intérieur ne se dessine que là ; à travers une pièce elle-même transparente, l’intérieur reste visible.
- **Répétition linéaire à deux directions (grille)** : case « 2ᵉ direction (grille) » à la création et dans le panneau — 2ᵉ axe (X, Y, Z ou « Face / arête »), quantité (original compris), distance ; la ligne de la 1ʳᵉ direction est répétée le long de la 2ᵉ, une instance par case (200 au plus), nom « Linéaire 2 directions ». Les instances gardent leurs identifiants d’un rejeu à l’autre, comme avant.
- **Directions depuis une arête** : le bouton 🎯, sur la ligne de chaque axe (1ʳᵉ et 2ᵉ direction), prend la direction d’une ARÊTE droite sélectionnée, l’axe d’un cercle ou d’un arc, sinon la normale de la face (la symétrie reste sur une face) ; ⇄, à côté, retourne cette direction (le sens d’une arête est arbitraire).
- **Tests** : `test_repeat_lin2` (OCCT réel : plaque percée, grille 3 × 2 puis 3 × 3, volumes exacts calculés à la main, 2ᵉ direction depuis une arête et depuis l’axe d’un cercle, ⇄ Inverser, relecture, retour à une seule direction).
- **Timeline plus lisible** : chaque étape montre l’icône SVG de la commande du ruban qui l’a créée (esquisse, extrusion, révolution, perçage, congé, chanfrein, répétition, combiner, face, dépouille, coque, import ; plan, axe, point, repère de construction) au lieu d’un caractère ; vert = ajout de matière, rouge avec « − » = enlèvement, couleurs propres aux esquisses, modifications et répétitions ; étapes un peu plus grandes (32 px).
- **Barre d’état dans le bandeau supérieur** : état du noyau, message en cours (tronqué, texte complet en bulle), Régénérer et unité passent dans le bandeau, après la recherche ; plus de barre en bas : la vue 3D descend jusqu’en bas de la fenêtre. Écran étroit (< 1 100 px) : 2ᵉ ligne du bandeau. « enregistré » et la version, déjà dans le bandeau, ne sont plus doublés.
- **Bandeau Esquisse** : Zoom + / Zoom − (molette) et Annuler / Rétablir retirés ; pendant une esquisse, les flèches Annuler / Rétablir du bandeau du haut annulent les TRACÉS (comme Ctrl+Z / Ctrl+Y), puis reviennent au document à la fermeture.
- **Tests** : `test_extrusion_dynamique` (session : création, OK, Annuler en création et en modification, étapes d'annulation) et un parcours Playwright à la souris (aperçu 30 000 mm³, flèche tirée au pas de 1 mm, champ de cote 30 → 45 000 mm³, Annuler, OK).
  - **Simulation** : un outil incliné ne creuse plus de « cheminée » verticale jusqu'au-dessus du brut ; seules les mailles traversées sont enlevées, la hauteur ne baisse que si la coupe débouche (outil ≤ 60° : surplomb enlevé comme avant).
- **Simulation des posages 3+2 : la matière usinée sur les côtés se voit** (nouveau `src/88-fao-75-matiere-volume.js`). La matière est dessinée en Z-map (vue du dessus) : un trou sur la tranche ou une poche sur un flanc étaient calculés mais invisibles (« la matière n'est pas enlevée », la fraise semblait collée à la face d'entrée). Le rendu habituel reste (mises à jour par colonne, finesse) ; les seules colonnes CREUSÉES (voxel mort sous leur dessus) reçoivent un complément voxel par voxel : faces percées à l'entrée de l'outil, parois, fonds et plafonds des cavités — en rendu « réel » (flancs Z-map repliés) comme en « ≈ lisse » (cellules lisses retirées autour des cavités). En 3+2, couches aussi fines que la maille XY (0,4 mm au lieu de ~1,1 mm). Pièce Perçages : grille 275 × 188 × 88, complément de 20 000 triangles reconstruit en ~17 ms, lecture à ~95 images/s. Un outil incliné est taillé avec sa POINTE (profil de foret / foret à centrer, comme à la verticale) : un pointage sur la tranche creusait un cratère au Ø du corps. Posage sans 3+2 : rien ne change. Test : `test_fao_32_fiches` (20 à 24), `test_fao_percage_tranche` (6d, 6e).

## V0.7.7 - Simulation : éclairage depuis l'outil, rendu GPU, maille fine
Palier 1 de la qualité de simulation (« un moyen de gagner en qualité ? » → 2 paliers).
- **Éclairage depuis l'outil** : chaque colonne taillée mémorise la normale de la surface de l'outil à cet endroit — fond plat, arrondi d'arête (tore), cône de pointe de foret, axe de l'outil en 3+2 — et la direction radiale du passage. Le rendu « réel » éclaire le dessus avec cette normale et les parois avec la direction radiale de la colonne basse : les parois des trous et des poches s'éclairent en continu (plus de stries de colonnes), les fonds toriques se lisent, les arêtes restent nettes. Faces orientées dans le sens direct (une face arrière voyait sa normale retournée).
- **Rendu sur la carte graphique** (nouveau `src/88-fao-76-matiere-gpu.js`) : la colonne est une instance (30 sommets fixes, dessin instancié de nx × ny colonnes) ; hauteurs, normales et directions radiales sont des textures flottantes lues dans le vertex shader, qui recalcule la géométrie de la colonne comme avant (parois repliées, colonnes creusées 3+2). Après une taille, seules les textures sont renvoyées. Plus de tableau de 1,5 M de sommets réécrit colonne par colonne. Sans WebGL2 : ancien rendu.
- **Maille deux fois plus fine** quand le rendu GPU est là : 0,2 mm au niveau normal (0,12 mm au niveau haut), budget de colonnes × 4 ; en 3+2, couches Z aussi fines. Pièce Perçages : 550 × 375 colonnes (× 175 couches), 2 M de triangles, ~95 images/s en statique et ~75 en lecture ×20 ; saut à la fin du parcours ≈ 2,5 s (retaille complète à cette finesse).
- **Bascule réel ↔ lisse sans retailler** : la grille taillée, la position de lecture et les colonnes creusées sont conservées, seul le maillage est refait (1,8 s → 0,2 s) ; le programme GPU est compilé une fois ; les cellules lisses autour des cavités 3+2 sont repliées à nouveau.
- **Tests** : `test_simulation_rendu` (normales plate / torique / foret / 3+2, parois éclairées par la direction radiale, repli hors WebGL2, shader) ; suites complète et rapide.

## V0.7.8 - Simulation : une carte de hauteurs par orientation d'outil, lancer de rayons
Palier 2 de la qualité de simulation (« rien ne fonctionne vraiment correctement » en 3+2 → cavités latérales en voxels, marches, complément reconstruit).
- **Une carte par orientation** (nouveau `src/88-fao-77-matiere-cartes.js`) : chaque orientation d'outil du parcours (le Z du posage, puis le Z de chaque opération au repère propre) a sa carte de hauteurs dans son repère (U, V, A). L'opération inclinée y taille exactement comme une opération verticale — même `faoMatterCarveSeg`, même pointe de foret, même arrondi, mêmes normales et directions radiales. La matière est l'intersection des cartes (et de la boîte du brut). Au plus 3 orientations en plus du posage.
- **Rendu par lancer de rayons** : la boîte du brut (faces arrière) porte un shader qui marche le long du rayon (pas adaptatif borné par la marge la plus grande, bissection), teste l'intersection des cartes et écrit la profondeur (`gl_FragDepth`) — l'outil et la scène s'y intersectent normalement. La carte active au point touché donne la normale : celle de l'outil sur un dessus, la direction radiale de la colonne basse sur une paroi (repli : voisines, puis gradient), la face du brut à l'entrée. Plus de voxels, plus de complément, plus de couches fines : la grille du posage reste à 32 couches.
- **Mode « lisse »** : géométrie exacte (texel le plus proche), normales interpolées entre les texels voisins de hauteur proche — surfaces courbes douces, arêtes nettes, sans surface moyennée à part.
- **Mesures (pièce Perçages, 2 cartes : −Y 550 × 175, +X 375 × 175)** : activation en fin de parcours 0,3 s (2,5 s avant), ~120 images/s, bascule réel ↔ lisse ~15 ms, lecture ×20 fluide avec cartes renvoyées au fil des passes.
- Hors WebGL2 : voxels et complément comme avant. Diagnostic d'atelier : `faoRmU.rmDebug.value` 1–8 (carte active, normale, distance, itérations, marges).
- Correctif : au surfaçage, une passe qui recouvre à la même cote laissait la normale inclinée de l'arrondi précédent → la normale la plus plate gagne.
- **Tests** : `test_simulation_cartes` (orientations, repère de carte, étendue, taille dans la carte, rattrapage, limites, shader, repli) ; suites complète et rapide.
- **Correctif (après le tag)** : sur une face latérale, autour d'un trou de la tranche, le pointage semblait creuser un cratère au Ø du foret (« trop grand alors que les 4 premiers sont bons »). La géométrie était juste (cône à Ø1 au niveau de la face) ; la normale venait de la carte « la plus proche » (la carte −Y) au lieu de la carte réellement traversée (la paroi du posage). La carte active est désormais celle violée juste avant l'impact.
- **Correctif (après le tag) — « crevasses » sur les bossages de Cavité Usinage** : un segment de parcours en pente était taillé à la cote de son extrémité la plus basse (ondulations de 20 à 50 µm en finition, visibles en rendu lisse). Les segments en pente sont découpés en pas de hauteur de 0,05 mm (`FAO_CARVE_DZ`), pour la taille verticale comme pour les cartes d'orientation. Test : `test_simulation_rendu` (13).
- **Correctif (après le tag) — aperçu d'une opération 3+2** : la zone de l'opération (repère de l'opération) clippait des segments exprimés dans le repère du posage — toute la coupe était rejetée, seuls les rapides restaient (« pas de spirale verte » sur l'ébauche 3D de l'oblong). Le clippeur convertit désormais les segments dans le repère de l'opération. Test : `test_fao_32_fiches` (25, 26).
- **Aspect de la matière simulée : beige ou aluminium** (« j'usine souvent de l'aluminium ») : sélecteur dans la barre de lecture, à côté de la finesse ; couleur, reflet et brillance appliqués aux cinq rendus (colonnes, tableau de sommets, lisse, cavités, lancer de rayons), changement immédiat, choix mémorisé (`minifusion_faoMatiere`). Test : `test_simulation_rendu` (14 à 17).
- **Lancer de rayons : faces de la boîte du brut légèrement reculées en profondeur** — coplanaires avec le fantôme du brut, elles donnaient des dents de scie à la jonction (conflit entre profondeur rasterisée et profondeur calculée).
- **Fantôme du brut 0,06 mm à l'extérieur de la matière** : coplanaire avec ses faces extérieures, il se disputait la profondeur avec le lancer de rayons (dents de scie et bandes sombres à la jonction, « pas super efficace ») ; le recul en profondeur ne suffisait pas.

## V0.7.9 - Opération Chanfrein, case « brut » de la simulation
- **Opération Chanfrein** (nouveau `src/89-fao-chanfrein.js`) à la place de la Poche dans le ruban et la barre « + » (« la Poche n'a pas l'air utile car l'Ébauche 3D fait aussi bien le travail ; il faudrait la transformer en opération à chanfreiner ») ; les poches des anciens fichiers restent lisibles et calculées. Arêtes : chaîne d'arêtes du HAUT (même saisie que le Contour ; la cote de l'arête est prise sur la sélection). Réglages : largeur (sur le dessus), décalage de pointe (le flanc coupe, pas la pointe), côté (auto d'après la matière : bossage → extérieur, poche ou trou → intérieur), sens. Géométrie : jambe paroi = largeur / tan(demi-angle), pointe à Z arête − jambe − décalage, axe à (rayon de pointe + décalage × tan) de l'arête ; contact haut vérifié contre le Ø de l'outil (⚠ outil trop petit). Parcours : une passe à la cote de pointe avec entrées / sorties tangentes (générateur du Contour profil).
- **Fraise à chanfreiner** : nouveau type d'outil (angle inclus, Ø de pointe) avec profil de pointe (méplat puis cône) pour la simulation ; le foret à pointer (pointe vive) convient aussi. Bouton « Créer une fraise à chanfreiner Ø6 90° » dans la fiche quand l'outil n'a pas de cône.
- **Case « brut »** dans la barre de lecture : masque le fantôme jaune du brut d'origine (mémorisée).
- **Tests** : `test_fao_chanfrein` (ruban, défauts, outil, géométrie 90° / 60°, outil trop petit, foret à pointer, parcours d'un bossage et d'un bord de trou, libellé G-code, simulation d'un chanfrein 45° de 1 mm, fiche, pas de zone) ; parcours Playwright du miroir ajusté au fantôme élargi.
