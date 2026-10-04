# Journal des modifications

Une entrée par version : **cause, correctif, test**. Source de vérité de l'historique.
Ces entrées vivaient en commentaire dans `fusion_mvp.html` (577 lignes, 50 Ko) : un
poids inutile dans un livrable généré, et un doublon de ce que Git conserve déjà. Elles
sont sorties le 2026-09-30j.

Code dans `src/` · livrable `fusion_mvp.html` (généré par `build.js`) · architecture et
garde-fous en tête de `src/00-entete-et-outils.js`.

**165 versions**, de `2026-09-28b` à `2026-10-04-006` — la plus récente en bas,
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
