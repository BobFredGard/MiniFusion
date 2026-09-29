# Journal des modifications

Une entrée par version : **cause, correctif, test**. Source de vérité de l'historique.
Ces entrées vivaient en commentaire dans `fusion_mvp.html` (577 lignes, 50 Ko) : un
poids inutile dans un livrable généré, et un doublon de ce que Git conserve déjà. Elles
sont sorties le 2026-09-30j.

Code dans `src/` · livrable `fusion_mvp.html` (généré par `build.js`) · architecture et
garde-fous en tête de `src/00-entete-et-outils.js`.

**83 versions**, de `2026-09-28b` à `2026-09-31o` — la plus récente en bas,
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

