# Journal des modifications

Une entrée par version : **cause, correctif, test**. Source de vérité de l'historique.
Ces entrées vivaient en commentaire dans `fusion_mvp.html` (577 lignes, 50 Ko) : un
poids inutile dans un livrable généré, et un doublon de ce que Git conserve déjà. Elles
sont sorties le 2026-09-30j.

Code dans `src/` · livrable `fusion_mvp.html` (généré par `build.js`) · architecture et
garde-fous en tête de `src/00-entete-et-outils.js`.

**51 versions**, de `2026-09-28b` à `2026-09-30i` — la plus récente en bas,
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
