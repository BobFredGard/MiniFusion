# Noyau OCCT — listing des classes et fonctions exposées

Source : `occt/opencascade.full.js` + `occt/opencascade.wasm.wasm` (opencascade.js 1.1.4, OCCT 7.5), énuméré en chargeant le module dans Node le 2026-10-29.

- 7550 classes / énumérations dans 299 paquets, 62967 méthodes (surcharges fusionnées : `Foo_1`, `Foo_2`… → `Foo`).
- ★ = classe utilisée par l’application (77 classes dans src/).
- « ← X » = hérite de X : les méthodes héritées ne sont pas répétées.
- « n ctor » = nombre de constructeurs surchargés (`new oc.Classe_1(...)`, `_2`…).
- `Handle_X` = pointeur intelligent vers X (get, IsNull, Nullify…), listés en fin de document.

## Utilisées par l’application

BOPAlgo_GlueEnum, BRepAdaptor_Curve, BRepAdaptor_Curve2d, BRepAdaptor_Surface, BRepAlgoAPI_Common, BRepAlgoAPI_Cut, BRepAlgoAPI_Defeaturing, BRepAlgoAPI_Fuse, BRepAlgoAPI_Section, BRepAlgoAPI_Splitter, BRepBndLib, BRepBuilderAPI_Copy, BRepBuilderAPI_GTransform, BRepBuilderAPI_MakeEdge, BRepBuilderAPI_MakeFace, BRepBuilderAPI_MakePolygon, BRepBuilderAPI_MakeWire, BRepBuilderAPI_NurbsConvert, BRepBuilderAPI_Transform, BRepCheck_Analyzer, BRepClass3d_SolidClassifier, BRepFilletAPI_MakeChamfer, BRepFilletAPI_MakeFillet, BRepGProp, BRepGProp_Face, BRepMesh_IncrementalMesh, BRepOffsetAPI_DraftAngle, BRepOffsetAPI_MakePipeShell, BRepOffsetAPI_MakeThickSolid, BRepPrimAPI_MakeBox, BRepPrimAPI_MakeCone, BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakePrism, BRepPrimAPI_MakeRevol, BRepTools, BRep_Builder, BRep_Tool, Bnd_Box, GProp_GProps, GeomAPI_PointsToBSpline, GeomAbs_CurveType, GeomAbs_JoinType, GeomAbs_Shape, GeomAbs_SurfaceType, GeomLProp_SLProps, HLRAppli_ReflectLines, HLRBRep_TypeOfResultingEdge, Handle_Geom_Curve, Handle_Message_ProgressIndicator, IFSelect_ReturnStatus, STEPControl_Reader, STEPControl_StepModelType, STEPControl_Writer, ShapeCustom, ShapeFix_Shape, ShapeUpgrade_UnifySameDomain, TColgp_Array1OfPnt, TopAbs_Orientation, TopAbs_ShapeEnum, TopAbs_State, TopExp_Explorer, TopLoc_Location, TopTools_ListOfShape, TopoDS, TopoDS_Builder, TopoDS_Compound, TopoDS_Face, TopoDS_Shape, gp_Ax1, gp_Ax2, gp_Circ, gp_Dir, gp_GTrsf, gp_Pln, gp_Pnt, gp_Trsf, gp_Vec

## Sommaire

[(sans paquet)](#sans-paquet) (138) · [Adaptor2d](#adaptor2d) (6) · [Adaptor3d](#adaptor3d) (12) · [AdvApp2Var](#advapp2var) (12) · [AdvApprox](#advapprox) (7) · [AIS](#ais) (35) · [APIHeaderSection](#apiheadersection) (2) · [AppBlend](#appblend) (1) · [AppCont](#appcont) (2) · [AppDef](#appdef) (1) · [AppParCurves](#appparcurves) (9) · [Approx](#approx) (15) · [ApproxInt](#approxint) (2) · [AppStd](#appstd) (1) · [AppStdL](#appstdl) (1) · [Aspect](#aspect) (21) · [BinDrivers](#bindrivers) (1) · [BinLDrivers](#binldrivers) (1) · [Bisector](#bisector) (10) · [BiTgte](#bitgte) (6) · [Blend](#blend) (12) · [BlendFunc](#blendfunc) (21) · [Bnd](#bnd) (15) · [BndLib](#bndlib) (3) · [BOPAlgo](#bopalgo) (5) · [BOPDS](#bopds) (3) · [BOPTools](#boptools) (2) · [BRep](#brep) (23) · [BRepAdaptor](#brepadaptor) (9) · [BRepAlgo](#brepalgo) (12) · [BRepAlgoAPI](#brepalgoapi) (10) · [BRepApprox](#brepapprox) (23) · [BRepBlend](#brepblend) (25) · [BRepBuilderAPI](#brepbuilderapi) (28) · [BRepCheck](#brepcheck) (10) · [BRepClass](#brepclass) (7) · [BRepClass3d](#brepclass3d) (7) · [BRepExtrema](#brepextrema) (15) · [BRepFeat](#brepfeat) (14) · [BRepFill](#brepfill) (33) · [BRepFilletAPI](#brepfilletapi) (4) · [BRepGProp](#brepgprop) (10) · [BRepIntCurveSurface](#brepintcurvesurface) (1) · [BRepLib](#breplib) (18) · [BRepLProp](#breplprop) (4) · [BRepMAT2d](#brepmat2d) (3) · [BRepMesh](#brepmesh) (48) · [BRepOffset](#brepoffset) (14) · [BRepOffsetAPI](#brepoffsetapi) (12) · [BRepOffsetSimple](#brepoffsetsimple) (1) · [BRepPrim](#brepprim) (11) · [BRepPrimAPI](#brepprimapi) (12) · [BRepProj](#brepproj) (1) · [BRepSweep](#brepsweep) (9) · [BRepToIGES](#breptoiges) (4) · [BRepToIGESBRep](#breptoigesbrep) (1) · [BRepTools](#breptools) (11) · [BRepTopAdaptor](#breptopadaptor) (4) · [BSplCLib](#bsplclib) (4) · [BSplSLib](#bsplslib) (2) · [BVH](#bvh) (6) · [CDF](#cdf) (14) · [CDM](#cdm) (8) · [ChFi2d](#chfi2d) (6) · [ChFi3d](#chfi3d) (5) · [ChFiDS](#chfids) (22) · [ChFiKPart](#chfikpart) (1) · [Contap](#contap) (17) · [Convert](#convert) (15) · [CPnts](#cpnts) (4) · [CSLib](#cslib) (4) · [DBRep](#dbrep) (3) · [DDF](#ddf) (1) · [Draft](#draft) (5) · [Draw](#draw) (2) · [DsgPrs](#dsgprs) (24) · [Expr](#expr) (60) · [ExprIntrp](#exprintrp) (9) · [Extrema](#extrema) (66) · [FairCurve](#faircurve) (1) · [FEmTool](#femtool) (1) · [FilletSurf](#filletsurf) (3) · [Font](#font) (4) · [GC](#gc) (19) · [GccAna](#gccana) (16) · [GccEnt](#gccent) (5) · [GccInt](#gccint) (8) · [gce](#gce) (25) · [GCE2d](#gce2d) (15) · [GCPnts](#gcpnts) (10) · [Geom](#geom) (40) · [Geom2d](#geom2d) (22) · [Geom2dAdaptor](#geom2dadaptor) (3) · [Geom2dConvert](#geom2dconvert) (4) · [Geom2dEvaluator](#geom2devaluator) (2) · [Geom2dGcc](#geom2dgcc) (3) · [Geom2dLProp](#geom2dlprop) (6) · [Geom2dToIGES](#geom2dtoiges) (4) · [GeomAbs](#geomabs) (9) · [GeomAdaptor](#geomadaptor) (10) · [GeomAPI](#geomapi) (9) · [GeomConvert](#geomconvert) (8) · [GeomEvaluator](#geomevaluator) (6) · [GeomFill](#geomfill) (57) · [GeomInt](#geomint) (24) · [GeomLib](#geomlib) (12) · [GeomLProp](#geomlprop) (4) · [GeomPlate](#geomplate) (11) · [GeomToIGES](#geomtoiges) (5) · [GeomTools](#geomtools) (3) · [GeomToStep](#geomtostep) (32) · [get](#get) (1) · [gp](#gp) (39) · [GProp](#gprop) (10) · [Graphic3d](#graphic3d) (126) · [Hatch](#hatch) (4) · [HatchGen](#hatchgen) (6) · [HeaderSection](#headersection) (4) · [HLRAlgo](#hlralgo) (22) · [HLRAppli](#hlrappli) (1) · [HLRBRep](#hlrbrep) (5) · [HLRTopoBRep](#hlrtopobrep) (7) · [IFGraph](#ifgraph) (11) · [IFSelect](#ifselect) (78) · [IGESAppli](#igesappli) (3) · [IGESBasic](#igesbasic) (1) · [IGESControl](#igescontrol) (7) · [IGESData](#igesdata) (6) · [IGESDefs](#igesdefs) (1) · [IGESDimen](#igesdimen) (2) · [IGESDraw](#igesdraw) (2) · [IGESGeom](#igesgeom) (3) · [IGESGraph](#igesgraph) (3) · [IGESSolid](#igessolid) (4) · [Image](#image) (6) · [IMeshData](#imeshdata) (8) · [IMeshTools](#imeshtools) (9) · [IntAna](#intana) (9) · [IntAna2d](#intana2d) (3) · [IntCurve](#intcurve) (7) · [IntCurvesFace](#intcurvesface) (2) · [IntCurveSurface](#intcurvesurface) (14) · [Interface](#interface) (49) · [Intf](#intf) (9) · [IntImp](#intimp) (1) · [IntPatch](#intpatch) (35) · [IntPolyh](#intpolyh) (10) · [IntRes2d](#intres2d) (8) · [Intrv](#intrv) (3) · [IntStart](#intstart) (1) · [IntSurf](#intsurf) (13) · [IntTools](#inttools) (29) · [IntWalk](#intwalk) (4) · [Law](#law) (10) · [LDOM](#ldom) (19) · [LocalAnalysis](#localanalysis) (3) · [LocOpe](#locope) (20) · [LProp](#lprop) (6) · [LProp3d](#lprop3d) (4) · [MAT](#mat) (12) · [MAT2d](#mat2d) (7) · [math](#math) (46) · [MeshVS](#meshvs) (26) · [Message](#message) (18) · [MoniTool](#monitool) (16) · [NCollection](#ncollection) (2) · [NLPlate](#nlplate) (10) · [OpenGl](#opengl) (8) · [OSD](#osd) (56) · [PCDM](#pcdm) (13) · [Plate](#plate) (14) · [PLib](#plib) (4) · [Plugin](#plugin) (1) · [Poly](#poly) (15) · [ProjLib](#projlib) (15) · [Prs3d](#prs3d) (35) · [PrsMgr](#prsmgr) (6) · [QANCollection](#qancollection) (1) · [Quantity](#quantity) (11) · [Resource](#resource) (5) · [RWGltf](#rwgltf) (13) · [RWHeaderSection](#rwheadersection) (4) · [RWMesh](#rwmesh) (4) · [RWObj](#rwobj) (6) · [RWStepAP203](#rwstepap203) (11) · [RWStepAP214](#rwstepap214) (27) · [RWStepAP242](#rwstepap242) (4) · [RWStepBasic](#rwstepbasic) (117) · [RWStepDimTol](#rwstepdimtol) (49) · [RWStepElement](#rwstepelement) (15) · [RWStepFEA](#rwstepfea) (52) · [RWStepRepr](#rwsteprepr) (65) · [RWStepShape](#rwstepshape) (87) · [RWStepVisual](#rwstepvisual) (75) · [RWStl](#rwstl) (1) · [Select3D](#select3d) (18) · [SelectBasics](#selectbasics) (1) · [SelectMgr](#selectmgr) (27) · [ShapeAlgo](#shapealgo) (2) · [ShapeAnalysis](#shapeanalysis) (17) · [ShapeBuild](#shapebuild) (3) · [ShapeConstruct](#shapeconstruct) (3) · [ShapeCustom](#shapecustom) (11) · [ShapeExtend](#shapeextend) (8) · [ShapeFix](#shapefix) (19) · [ShapePersistent](#shapepersistent) (4) · [ShapeProcess](#shapeprocess) (5) · [ShapeProcessAPI](#shapeprocessapi) (1) · [ShapeUpgrade](#shapeupgrade) (32) · [Standard](#standard) (43) · [StdDrivers](#stddrivers) (1) · [StdFail](#stdfail) (5) · [StdLDrivers](#stdldrivers) (1) · [StdLPersistent](#stdlpersistent) (15) · [StdObject](#stdobject) (2) · [StdObjMgt](#stdobjmgt) (5) · [StdPersistent](#stdpersistent) (7) · [StdPrs](#stdprs) (22) · [StdSelect](#stdselect) (14) · [StdStorage](#stdstorage) (8) · [StepAP203](#stepap203) (31) · [StepAP209](#stepap209) (1) · [StepAP214](#stepap214) (62) · [StepAP242](#stepap242) (6) · [StepBasic](#stepbasic) (156) · [STEPCAFControl](#stepcafcontrol) (6) · [STEPConstruct](#stepconstruct) (10) · [STEPControl](#stepcontrol) (6) · [StepData](#stepdata) (33) · [StepDimTol](#stepdimtol) (69) · [STEPEdit](#stepedit) (2) · [StepElement](#stepelement) (45) · [StepFEA](#stepfea) (72) · [StepGeom](#stepgeom) (103) · [StepRepr](#steprepr) (83) · [StepSelect](#stepselect) (6) · [STEPSelections](#stepselections) (9) · [StepShape](#stepshape) (116) · [StepToTopoDS](#steptotopods) (26) · [StepVisual](#stepvisual) (127) · [StlAPI](#stlapi) (2) · [Storage](#storage) (26) · [Sweep](#sweep) (3) · [TColGeom](#tcolgeom) (4) · [TColGeom2d](#tcolgeom2d) (3) · [TColgp](#tcolgp) (10) · [TCollection](#tcollection) (10) · [TColStd](#tcolstd) (15) · [TDataStd](#tdatastd) (43) · [TDataXtd](#tdataxtd) (15) · [TDF](#tdf) (34) · [TDocStd](#tdocstd) (13) · [TFunction](#tfunction) (10) · [TNaming](#tnaming) (28) · [TObj](#tobj) (20) · [TopAbs](#topabs) (3) · [TopBas](#topbas) (2) · [TopCnx](#topcnx) (1) · [TopExp](#topexp) (1) · [TopLoc](#toploc) (5) · [TopoDS](#topods) (25) · [TopoDSToStep](#topodstostep) (21) · [TopOpeBRep](#topopebrep) (30) · [TopOpeBRepBuild](#topopebrepbuild) (41) · [TopOpeBRepDS](#topopebrepds) (50) · [TopOpeBRepTool](#topopebreptool) (23) · [TopTools](#toptools) (9) · [TopTrans](#toptrans) (2) · [Transfer](#transfer) (34) · [TransferBRep](#transferbrep) (8) · [TShort](#tshort) (1) · [Units](#units) (17) · [UnitsAPI](#unitsapi) (1) · [V3d](#v3d) (24) · [Vrml](#vrml) (52) · [VrmlAPI](#vrmlapi) (2) · [VrmlConverter](#vrmlconverter) (16) · [VrmlData](#vrmldata) (23) · [WNT](#wnt) (2) · [XCAFDimTolObjects](#xcafdimtolobjects) (18) · [XCAFDoc](#xcafdoc) (29) · [XCAFNoteObjects](#xcafnoteobjects) (1) · [XCAFPrs](#xcafprs) (5) · [XCAFView](#xcafview) (2) · [XmlDrivers](#xmldrivers) (2) · [XmlLDrivers](#xmlldrivers) (3) · [XmlMDataStd](#xmlmdatastd) (26) · [XmlMDataXtd](#xmlmdataxtd) (11) · [XmlMDF](#xmlmdf) (4) · [XmlMDocStd](#xmlmdocstd) (1) · [XmlMFunction](#xmlmfunction) (3) · [XmlMNaming](#xmlmnaming) (3) · [XmlMXCAFDoc](#xmlmxcafdoc) (23) · [XmlObjMgt](#xmlobjmgt) (5) · [XmlTObjDrivers](#xmltobjdrivers) (7) · [XmlXCAFDrivers](#xmlxcafdrivers) (2) · [XSAlgo](#xsalgo) (3) · [XSControl](#xscontrol) (13) · [Handle](#handle) (2651)

## (sans paquet)

- **AppParCurves** · *statiques :* Bernstein, BernsteinMatrix, SecondDerivativeBernstein, SplineFunction
- **BRepAlgo** · *statiques :* ConcatenateWire, ConcatenateWireC0, IsTopologicallyValid, IsValid
- **BRepBndLib** ★ · *statiques :* Add, AddClose, AddOBB, AddOptimal
- **BRepBuilderAPI** · *statiques :* Plane, Precision
- **BRepCheck** · *statiques :* Add, PrecCurve, PrecSurface, Print, SelfIntersection
- **BRepClass3d** · *statiques :* OuterShell
- **BRepFill** · *statiques :* Axe, ComputeACR, Face, InsertACR, Shell
- **BRepGProp** ★ · *statiques :* LinearProperties, SurfaceProperties, SurfaceProperties2, VolumeProperties, VolumeProperties2, VolumePropertiesGK, VolumePropertiesGK2
- **BRepLProp** · *statiques :* Continuity
- **BRepLib** · *statiques :* BoundingVertex, BuildCurve3d, BuildCurves3d, BuildPCurveForEdgeOnPlane, CheckSameRange, EncodeRegularity, EnsureNormalConsistency, ExtendFace, FindValidRange, OrientClosedSolid, Plane, Precision, ReverseSortFaces, SameParameter, SameRange, SortFaces, UpdateEdgeTol, UpdateEdgeTolerance, UpdateInnerTolerances, UpdateTolerances
- **BRepOffset** · *statiques :* CollapseSingularities, Surface
- **BRepTools** ★ · *statiques :* AddUVBounds, Clean, CleanGeometry, Compare, DetectClosedness, Dump, EvalAndUpdateTol, IsReallyClosed, Map3DEdges, OuterWire, Read, RemoveUnusedPCurves, Triangulation, UVBounds, Update, UpdateFaceUVPoints, Write
- **BSplSLib** · *statiques :* BuildCache, CacheD0, CacheD1, CacheD2, CoefsD0, CoefsD1, CoefsD2, D0, D1, D2, D3, DN, FunctionMultiply, GetPoles, HomogeneousD0, HomogeneousD1, IncreaseDegree, InsertKnots, Interpolate, IsRational, Iso, MovePoint, NoWeights, PolesCoefficients, RationalDerivative, RemoveKnot, Resolution, Reverse, SetPoles, Unperiodize
- **BindingError** : toString
- **Bisector** · *statiques :* IsConvex
- **BndLib** · *statiques :* Add
- **CDF** · *statiques :* GetLicense, IsAvailable
- **CSLib** · *statiques :* DNNUV, DNNormal, Normal
- **ChFi2d**
- **ChFi3d** · *statiques :* ConcaveSide, NextSide, SameSide
- **Draft** · *statiques :* Angle
- **DsgPrs** · *statiques :* ComputeCurvilinearFacesLengthPresentation, ComputeFacesAnglePresentation, ComputeFilletRadiusPresentation, ComputePlanarFacesLengthPresentation, ComputeRadiusLine, ComputeSymbol, DistanceFromApex
- **ElCLib** · *statiques :* AdjustPeriodic, CircleD1, CircleD2, CircleD3, CircleDN, CircleParameter, CircleValue, D1, D2, D3, DN, EllipseD1, EllipseD2, EllipseD3, EllipseDN, EllipseParameter, EllipseValue, HyperbolaD1, HyperbolaD2, HyperbolaD3, HyperbolaDN, HyperbolaParameter, HyperbolaValue, InPeriod, LineD1, LineDN, LineParameter, LineValue, ParabolaD1, ParabolaD2, ParabolaDN, ParabolaParameter, ParabolaValue, Parameter, To3d, Value
- **ElSLib** · *statiques :* ConeD0, ConeD1, ConeD2, ConeD3, ConeDN, ConeParameters, ConeUIso, ConeVIso, ConeValue, CylinderD0, CylinderD1, CylinderD2, CylinderD3, CylinderDN, CylinderParameters, CylinderUIso, CylinderVIso, CylinderValue, D0, D1, D2, D3, DN, Parameters, PlaneD0, PlaneD1, PlaneDN, PlaneParameters, PlaneUIso, PlaneVIso, PlaneValue, SphereD0, SphereD1, SphereD2, SphereD3, SphereDN, SphereParameters, SphereUIso, SphereVIso, SphereValue, TorusD0, TorusD1, TorusD2, TorusD3, TorusDN, TorusParameters, TorusUIso, TorusVIso, TorusValue, Value
- **Expr** · *statiques :* CopyShare, NbOfFreeVariables, Sign
- **ExprIntrp**
- **GProp** · *statiques :* HOperator
- **GccEnt** · *statiques :* Enclosed, Enclosing, Outside, PositionFromString, PositionToString, Unqualified
- **Geom2dAdaptor** · *statiques :* MakeCurve
- **Geom2dConvert** · *statiques :* C0BSplineToArrayOfC1BSplineCurve, C0BSplineToC1BSplineCurve, ConcatC1, ConcatG1, CurveToBSplineCurve, SplitBSplineCurve
- **GeomAPI** · *statiques :* To2d, To3d
- **GeomAdaptor** · *statiques :* MakeCurve, MakeSurface
- **GeomConvert** · *statiques :* C0BSplineToArrayOfC1BSplineCurve, C0BSplineToC1BSplineCurve, ConcatC1, ConcatG1, CurveToBSplineCurve, SplitBSplineCurve, SplitBSplineSurface, SurfaceToBSplineSurface
- **GeomFill** · *statiques :* GetCircle, GetMinimalWeights, GetShape, GetTolerance, Knots, Mults, Surface
- **GeomInt** · *statiques :* AdjustPeriodic
- **GeomLProp** · *statiques :* Continuity
- **GeomLib** · *statiques :* AdjustExtremity, AxeOfInertia, BuildCurve3d, CancelDenominatorDerivative, DensifyArray1OfReal, EvalMaxDistanceAlongParameter, EvalMaxParametricDistance, ExtendCurveToPoint, ExtendSurfByLength, FuseIntervals, GTransform, Inertia, IsBSplUClosed, IsBSplVClosed, IsBzUClosed, IsBzVClosed, IsClosed, NormEstim, RemovePointsFromArray, SameRange, To3d
- **GeomProjLib** · *statiques :* Curve2d, Project, ProjectOnPlane
- **GeomTools** · *statiques :* Dump, GetReal, GetUndefinedTypeHandler, Read, SetUndefinedTypeHandler, Write
- **HLRAlgo** · *statiques :* AddMinMax, CopyMinMax, DecodeMinMax, EncodeMinMax, EnlargeMinMax, InitMinMax, SizeBox, UpdateMinMax
- **HeaderSection** · *statiques :* Protocol
- **Hermit** · *statiques :* Solution, Solutionbis
- **IFSelect** · *statiques :* RestoreSession, SaveSession
- **IntSurf** · *statiques :* MakeTransition, SetPeriod
- **IntTools** · *statiques :* FindRootStates, GetRadius, Length, Parameter, PrepareArgs, RemoveIdenticalRoots, SortRoots
- **InternalError** : toString
- **Interval** (4 ctor) : IntersectionWithBounded, Length
- **Intf** · *statiques :* Contain, PlaneEquation
- **LDOMBasicString** (6 ctor) : GetInteger, GetString, Type, equals
- **LDOMParser** : GetError, getDocument, parse
- **Law** · *statiques :* MixBnd, MixTgt, Reparametrize, Scale, ScaleCub
- **LocOpe** · *statiques :* Closed, SampleEdges, TgtFaces
- **LocalAnalysis** · *statiques :* Dump
- **Message** · *statiques :* DefaultMessenger, FillTime
- **MyDirectPolynomialRoots** (2 ctor) : InfiniteRoots, IsDone, NbSolutions, Value
- **OSD** · *statiques :* CStringToReal, ControlBreak, MilliSecSleep, RealToCString, SecSleep, SetFloatingSignal, SetSignal, SetThreadLocalSignal, SignalMode, ToCatchFloatingSignals
- **PCDM** · *statiques :* FileDriverType
- **PLib** · *statiques :* Bin, CoefficientsPoles, ConstraintOrder, EvalCubicHermite, EvalLagrange, EvalLength, EvalPoly2Var, EvalPolynomial, GetPoles, HermiteCoefficients, HermiteInterpolate, JacobiParameters, NivConstr, NoDerivativeEvalPolynomial, NoWeights, NoWeights2, RationalDerivative, RationalDerivatives, SetPoles, Trimming, UTrimming, VTrimming
- **PeriodicInterval** (3 ctor) : Complement, FirstIntersection, IsNull, Length, Normalize, SecondIntersection, SetNull, SetValues
- **Plugin** · *statiques :* Load
- **Poly** · *statiques :* Catenate, ComputeNormals, Dump, PointOnTriangle, ReadPolygon2D, ReadPolygon3D, ReadTriangulation, Write
- **Precision** · *statiques :* Angular, Approximation, Confusion, Infinite, Intersection, IsInfinite, IsNegativeInfinite, IsPositiveInfinite, PApproximation, PConfusion, PIntersection, Parametric, SquareConfusion, SquarePConfusion
- **ProjLib** · *statiques :* IsAnaSurf, MakePCurveOfType, Project
- **Prs3d** · *statiques :* AddPrimitivesGroup, GetDeflection, MatchSegment, PrimitivesFromPolylines
- **RWHeaderSection** · *statiques :* Init
- **RWObj** · *statiques :* ReadFile
- **RWStepAP214** · *statiques :* Init
- **RWStl** · *statiques :* ReadAscii, ReadBinary, ReadFile, WriteAscii, WriteBinary
- **STEPConstruct** · *statiques :* FindCDSR, FindEntity, FindShape
- **STEPEdit** · *statiques :* NewModel, NewSelectPlacedItem, NewSelectSDR, NewSelectShapeRepr, Protocol, SignType
- **SelectBasics** · *statiques :* MaxOwnerPriority, MinOwnerPriority
- **ShapeAlgo** · *statiques :* AlgoContainer, Init, SetAlgoContainer
- **ShapeAnalysis** · *statiques :* AdjustByPeriod, AdjustToPeriod, ContourArea, FindBounds, GetFaceUVBounds, IsOuterBound, OuterWire, TotCross2D
- **ShapeBuild** · *statiques :* PlaneXOY
- **ShapeConstruct** · *statiques :* ConvertCurveToBSpline, ConvertSurfaceToBSpline, JoinCurves, JoinPCurves
- **ShapeCustom** ★ · *statiques :* ApplyModifier, BSplineRestriction, ConvertToBSpline, ConvertToRevolution, DirectFaces, ScaleShape, SweptToElementary
- **ShapeExtend** · *statiques :* DecodeStatus, EncodeStatus, Init
- **ShapeFix** · *statiques :* EncodeRegularity, FixVertexPosition, LeastEdgeSize, RemoveSmallEdges, SameParameter
- **ShapePersistent** · *statiques :* BindTypes
- **ShapeProcess** · *statiques :* FindOperator, Perform, RegisterOperator
- **ShapeUpgrade** · *statiques :* C0BSplineToSequenceOfC1BSplineCurve
- **Standard** · *statiques :* Allocate, AllocateAligned, Free, FreeAligned, Purge, Reallocate
- **StdDrivers** · *statiques :* BindTypes, DefineFormat, Factory
- **StdLDrivers** · *statiques :* BindTypes, DefineFormat, Factory
- **StdLPersistent** · *statiques :* BindTypes
- **StdPersistent** · *statiques :* BindTypes
- **StdSelect** · *statiques :* SetDrawerForBRepOwner
- **StdStorage** · *statiques :* Read, Version, Write
- **StepAP214** · *statiques :* Protocol
- **StepData** · *statiques :* AddHeaderProtocol, HeaderProtocol, Init, Protocol
- **StepToGeom** · *statiques :* MakeAxis1Placement, MakeAxis2Placement, MakeAxisPlacement, MakeBSplineCurve, MakeBSplineCurve2d, MakeBSplineSurface, MakeBoundedCurve, MakeBoundedCurve2d, MakeBoundedSurface, MakeCartesianPoint, MakeCartesianPoint2d, MakeCircle, MakeCircle2d, MakeConic, MakeConic2d, MakeConicalSurface, MakeCurve, MakeCurve2d, MakeCylindricalSurface, MakeDirection, MakeDirection2d, MakeElementarySurface, MakeEllipse, MakeEllipse2d, MakeHyperbola, MakeHyperbola2d, MakeLine, MakeLine2d, MakeParabola, MakeParabola2d, MakePlane, MakePolyline, MakePolyline2d, MakeRectangularTrimmedSurface, MakeSphericalSurface, MakeSurface, MakeSurfaceOfLinearExtrusion, MakeSurfaceOfRevolution, MakeSweptSurface, MakeToroidalSurface, MakeTransformation2d, MakeTransformation3d, MakeTrimmedCurve, MakeTrimmedCurve2d, MakeVectorWithMagnitude, MakeVectorWithMagnitude2d
- **StepToTopoDS** · *statiques :* DecodeBuilderError, DecodeEdgeError, DecodeFaceError, DecodeGeometricToolError, DecodePolyLoopError, DecodeShellError, DecodeVertexError, DecodeVertexLoopError
- **StlAPI** · *statiques :* Read, Write
- **Storage** · *statiques :* Version
- **TCollection** · *statiques :* NextPrimeForMap
- **TDF** · *statiques :* AddLinkGUIDToProgID, GUIDFromProgID, LowestID, ProgIDFromGUID, UppestID
- **TDataStd** · *statiques :* IDList
- **TDataXtd** · *statiques :* IDList
- **TDocStd** · *statiques :* IDList
- **TNaming** · *statiques :* ChangeShapes, Displace, FindUniqueContext, FindUniqueContextSet, IDList, MakeShape, OuterShell, OuterWire, Replicate, Substitute, SubstituteSShape, Transform, Update
- **TopAbs** · *statiques :* Complement, Compose, Reverse, ShapeOrientationFromString, ShapeOrientationToString, ShapeTypeFromString, ShapeTypeToString
- **TopExp** · *statiques :* CommonVertex, FirstVertex, LastVertex, MapShapes, MapShapesAndAncestors, MapShapesAndUniqueAncestors, Vertices
- **TopOpeBRep**
- **TopOpeBRepDS** · *statiques :* IsGeometry, IsTopology, KindToShape, SPrint, ShapeToKind
- **TopOpeBRepTool** · *statiques :* CorrectONUVISO, MakeFaces, PurgeClosingEdges, Regularize, RegularizeFace, RegularizeShells, RegularizeWires
- **TopTools** · *statiques :* Dummy, Dump
- **TopoDS** ★ · *statiques :* CompSolid, Compound, Edge, Face, Shell, Solid, Vertex, Wire
- **TopoDSToStep** · *statiques :* AddResult, DecodeBuilderError, DecodeEdgeError, DecodeFaceError, DecodeVertexError, DecodeWireError
- **UnboundTypeError** : toString
- **Units** · *statiques :* Convert, DictionaryOfUnits, Dimensions, FirstQuantity, FromSI, LexiconFile, LexiconFormula, LexiconUnits, NullDimensions, Quantity, ToSI, UnitsFile
- **UnitsAPI** · *statiques :* AnyFromLS, AnyFromSI, AnyToAny, AnyToLS, AnyToSI, Check, CurrentFromAny, CurrentFromLS, CurrentFromSI, CurrentToAny, CurrentToLS, CurrentToSI, CurrentUnit, DimensionAmountOfSubstance, DimensionElectricCurrent, DimensionLength, DimensionLess, DimensionLuminousIntensity, DimensionMass, DimensionPlaneAngle, DimensionSolidAngle, DimensionThermodynamicTemperature, DimensionTime, Dimensions, LSToSI, LocalSystem, Reload, SIToLS, Save, SetCurrentUnit, SetLocalSystem
- **UnitsMethods** · *statiques :* Convert3d, DegreeToRadian, GetCasCadeLengthUnit, GetLengthFactorValue, InitializeFactors, LengthFactor, MirrorPCurve, PlaneAngleFactor, RadianToDegree, Set3dConversion, SetCasCadeLengthUnit, SolidAngleFactor
- **V3d** · *statiques :* ArrowOfRadius, CircleInPlane, GetProjAxis, SwitchViewsinWindow, TypeOfOrientationFromString, TypeOfOrientationToString
- **Vrml**
- **VrmlAPI** · *statiques :* Write
- **XCAFDoc** · *statiques :* AssemblyGUID, ColorByLayerGUID, ColorRefGUID, DatumRefGUID, DatumTolRefGUID, DimTolRefGUID, DimensionRefFirstGUID, DimensionRefSecondGUID, ExternRefGUID, GeomToleranceRefGUID, InvisibleGUID, LayerRefGUID, LockGUID, MaterialRefGUID, NoteRefGUID, SHUORefGUID, ShapeRefGUID, ViewRefAnnotationGUID, ViewRefGDTGUID, ViewRefGUID, ViewRefNoteGUID, ViewRefPlaneGUID, ViewRefShapeGUID
- **XCAFPrs** · *statiques :* CollectStyleSettings, GetViewNameMode, SetViewNameMode
- **XSAlgo** · *statiques :* AlgoContainer, Init, SetAlgoContainer
- **XSControl** · *statiques :* Session, Vars
- **XmlDrivers** · *statiques :* AttributeDrivers, DefineFormat, Factory
- **XmlLDrivers** · *statiques :* AttributeDrivers, CreationDate, DefineFormat, Factory, StorageVersion
- **XmlMDF** · *statiques :* AddDrivers, FromTo
- **XmlMDataStd** · *statiques :* AddDrivers
- **XmlMDataXtd** · *statiques :* AddDrivers, DocumentVersion, SetDocumentVersion
- **XmlMDocStd** · *statiques :* AddDrivers
- **XmlMFunction** · *statiques :* AddDrivers
- **XmlMNaming** · *statiques :* AddDrivers
- **XmlMXCAFDoc** · *statiques :* AddDrivers
- **XmlObjMgt** · *statiques :* FindChildByName, FindChildByRef, FindChildElement, GetExtendedString, GetInteger, GetReal, GetStringValue, GetTagEntryString, IdString, SetExtendedString, SetStringValue, SetTagEntryString
- **XmlTObjDrivers** · *statiques :* AddDrivers, DefineFormat, Factory
- **XmlXCAFDrivers** · *statiques :* DefineFormat, Factory
- **gp** · *statiques :* DX, DX2d, DY, DY2d, DZ, OX, OX2d, OY, OY2d, OZ, Origin, Origin2d, Resolution, XOY, YOZ, ZOX
- **inspect**
- **math** · *statiques :* GaussPoints, GaussPointsMax, GaussWeights, KronrodPointsAndWeights, KronrodPointsMax, OrderedGaussPointsAndWeights
- **setDelayFunction**
- **stackAlloc**
- **stackRestore**
- **stackSave**

## Adaptor2d

- **Adaptor2d_Curve2d** : BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, NbSamples, Parabola, Period, Resolution, Trim, Value
- **Adaptor2d_HCurve2d** ← Standard_Transient : BSpline, Bezier, Circle, Continuity, Curve2d, D0, D1, D2, D3, DN, Degree, DynamicType, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, Parabola, Period, Resolution, Trim, Value · *statiques :* get_type_descriptor, get_type_name
- **Adaptor2d_HLine2d** ← Adaptor2d_HCurve2d (2 ctor) : ChangeCurve2d, Curve2d, DynamicType, Set · *statiques :* get_type_descriptor, get_type_name
- **Adaptor2d_HOffsetCurve** ← Adaptor2d_HCurve2d (2 ctor) : ChangeCurve2d, Curve2d, DynamicType, Set · *statiques :* get_type_descriptor, get_type_name
- **Adaptor2d_Line2d** ← Adaptor2d_Curve2d (2 ctor) : BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, Load, NbIntervals, NbKnots, NbPoles, Parabola, Period, Resolution, Trim, Value
- **Adaptor2d_OffsetCurve** ← Adaptor2d_Curve2d (4 ctor) : BSpline, Bezier, Circle, Continuity, Curve, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, Load, NbIntervals, NbKnots, NbPoles, NbSamples, Offset, Parabola, Period, Resolution, Trim, Value

## Adaptor3d

- **Adaptor3d_Curve** : BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, OffsetCurve, Parabola, Period, Resolution, Trim, Value
- **Adaptor3d_CurveOnSurface** ← Adaptor3d_Curve (3 ctor) : BSpline, Bezier, ChangeCurve, ChangeSurface, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetCurve, GetSurface, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, Load, NbIntervals, NbKnots, NbPoles, Parabola, Period, Resolution, Trim, Value
- **Adaptor3d_HCurve** ← Standard_Transient : BSpline, Bezier, Circle, Continuity, Curve, D0, D1, D2, D3, DN, Degree, DynamicType, Ellipse, FirstParameter, GetCurve, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, OffsetCurve, Parabola, Period, Resolution, Trim, Value · *statiques :* get_type_descriptor, get_type_name
- **Adaptor3d_HCurveOnSurface** ← Adaptor3d_HCurve (2 ctor) : ChangeCurve, Curve, DynamicType, GetCurve, Set · *statiques :* get_type_descriptor, get_type_name
- **Adaptor3d_HIsoCurve** ← Adaptor3d_HCurve (2 ctor) : ChangeCurve, Curve, DynamicType, GetCurve, Set · *statiques :* get_type_descriptor, get_type_name
- **Adaptor3d_HSurface** ← Standard_Transient : AxeOfRevolution, BSpline, BasisCurve, BasisSurface, Bezier, Cone, Cylinder, D0, D1, D2, D3, DN, Direction, DynamicType, FirstUParameter, FirstVParameter, GetType, IsUClosed, IsUPeriodic, IsURational, IsVClosed, IsVPeriodic, IsVRational, LastUParameter, LastVParameter, NbUIntervals, NbUKnots, NbUPoles, NbVIntervals, NbVKnots, NbVPoles, OffsetValue, Plane, Sphere, Surface, Torus, UContinuity, UDegree, UIntervals, UPeriod, UResolution, UTrim, VContinuity, VDegree, VIntervals, VPeriod, VResolution, VTrim, Value · *statiques :* get_type_descriptor, get_type_name
- **Adaptor3d_HSurfaceTool** · *statiques :* AxeOfRevolution, BSpline, BasisCurve, BasisSurface, Bezier, Cone, Cylinder, D0, D1, D2, D3, DN, Direction, FirstUParameter, FirstVParameter, GetType, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, LastUParameter, LastVParameter, NbSamplesU, NbSamplesV, NbUIntervals, NbVIntervals, OffsetValue, Plane, Sphere, Torus, UIntervals, UPeriod, UResolution, UTrim, VIntervals, VPeriod, VResolution, VTrim, Value
- **Adaptor3d_HVertex** ← Standard_Transient (2 ctor) : DynamicType, IsSame, Orientation, Parameter, Resolution, Value · *statiques :* get_type_descriptor, get_type_name
- **Adaptor3d_InterFunc** ← math_FunctionWithDerivative : Derivative, Value, Values
- **Adaptor3d_IsoCurve** ← Adaptor3d_Curve (4 ctor) : BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, Iso, LastParameter, Line, Load, NbIntervals, NbKnots, NbPoles, Parabola, Parameter, Period, Resolution, Surface, Trim, Value
- **Adaptor3d_Surface** : AxeOfRevolution, BSpline, BasisCurve, BasisSurface, Bezier, Cone, Cylinder, D0, D1, D2, D3, DN, Direction, FirstUParameter, FirstVParameter, GetType, IsUClosed, IsUPeriodic, IsURational, IsVClosed, IsVPeriodic, IsVRational, LastUParameter, LastVParameter, NbUIntervals, NbUKnots, NbUPoles, NbVIntervals, NbVKnots, NbVPoles, OffsetValue, Plane, Sphere, Torus, UContinuity, UDegree, UIntervals, UPeriod, UResolution, UTrim, VContinuity, VDegree, VIntervals, VPeriod, VResolution, VTrim, Value
- **Adaptor3d_TopolTool** ← Standard_Transient (2 ctor) : BSplSamplePnts, Classify, ComputeSamplePoints, DomainIsInfinite, DynamicType, Edge, Has3d, Identical, Init, InitVertexIterator, Initialize, IsThePointOn, IsUniformSampling, More, MoreVertex, NbSamples, NbSamplesU, NbSamplesV, Next, NextVertex, Orientation, Pnt, SamplePnts, SamplePoint, Tol3d, UParameters, VParameters, Value, Vertex · *statiques :* get_type_descriptor, get_type_name

## AdvApp2Var

- **AdvApp2Var_ApproxAFunc2Var** (2 ctor) : AverageError, CritError, Dump, HasResult, IsDone, MaxError, NumSubSpaces, Surface, UDegree, UFrontError, VDegree, VFrontError
- **AdvApp2Var_ApproxF2var** · *statiques :* mma1her_, mma2ac1_, mma2ac2_, mma2ac3_, mma2can_, mma2cdi_, mma2ce1_, mma2ds1_, mma2fnc_, mma2fx6_, mma2jmx_, mma2roo_, mmapptt_
- **AdvApp2Var_Context** (2 ctor) : CToler, FToler, FavorIso, IToler, TotalDimension, TotalNumberSSP, UGauss, UJacDeg, UJacMax, ULimit, UOrder, URoots, VGauss, VJacDeg, VJacMax, VLimit, VOrder, VRoots
- **AdvApp2Var_Criterion** : IsSatisfied, MaxValue, Repartition, Type, Value
- **AdvApp2Var_CriterionRepartition** · *statiques :* AdvApp2Var_Incremental, AdvApp2Var_Regular
- **AdvApp2Var_CriterionType** · *statiques :* AdvApp2Var_Absolute, AdvApp2Var_Relative
- **AdvApp2Var_Data** · *statiques :* Getmaovpar, Getmaovpch, Getmdnombr, Getminombr, Getmlgdrtl, Getmmapgs0, Getmmapgs1, Getmmapgs2, Getmmapgss, Getmmcmcnp, Getmmjcobi
- **AdvApp2Var_EvaluatorFunc2Var** : Evaluate
- **AdvApp2Var_MathBase** · *statiques :* mdsptpt_, mmapcmp_, mmaperx_, mmarcin_, mmbulld_, mmcdriv_, mmcglc1_, mmcvctx_, mmcvinv_, mmdrc11_, mmdrvck_, mmeps1_, mmfmca8_, mmfmca9_, mmfmcar_, mmfmcb5_, mmfmtb1_, mmgaus1_, mmhjcan_, mminltt_, mmjacan_, mmjaccv_, mmmpocur_, mmmrslwd_, mmpobas_, mmpocrb_, mmposui_, mmresol_, mmrtptt_, mmsrre2_, mmtrpjj_, mmunivt_, mmveps3_, mmvncol_, mmwprcs_, msc_, mvsheld_, mzsnorm_, pow__di
- **AdvApp2Var_Node** (3 ctor) : Coord, Error, Point, SetCoord, SetError, SetPoint, UOrder, VOrder
- **AdvApp2Var_Patch** (2 ctor) : AddConstraints, AddErrors, AverageErrors, ChangeDomain, ChangeNbCoeff, Coefficients, CritValue, CutSense, Discretise, HasResult, IsApproximated, IsDiscretised, IsoErrors, MakeApprox, MaxErrors, NbCoeffInU, NbCoeffInV, OverwriteApprox, Poles, ResetApprox, SetCritValue, U0, U1, UOrder, V0, V1, VOrder
- **AdvApp2Var_SysBase** : macrai4_, macrar8_, macrdi4_, macrdr8_, mainial_, mcrdelt_, mcrrqst_ · *statiques :* do__fio, do__lio, macinit_, maermsg_, maitbr8_, maovsr8_, mcrfill_, mgenmsg_, mgsomsg_, miraz_, mnfndeb_, msifill_, msrfill_, mswrdbg_, mvriraz_

## AdvApprox

- **AdvApprox_ApproxAFunction** (2 ctor) : AverageError, Degree, Dump, HasResult, IsDone, Knots, MaxError, Multiplicities, NbKnots, NbPoles, NumSubSpaces, Poles, Poles1d, Poles2d · *statiques :* Approximation
- **AdvApprox_Cutting** : Value
- **AdvApprox_DichoCutting** ← AdvApprox_Cutting : Value
- **AdvApprox_EvaluatorFunction** : Evaluate
- **AdvApprox_PrefAndRec** ← AdvApprox_Cutting : Value
- **AdvApprox_PrefCutting** ← AdvApprox_Cutting : Value
- **AdvApprox_SimpleApprox** : AverageError, Coefficients, Degree, DifTab, Dump, FirstConstr, IsDone, LastConstr, MaxError, Perform, SomTab

## AIS

- **AIS_ClearMode** · *statiques :* AIS_CM_All, AIS_CM_Filters, AIS_CM_Interactive, AIS_CM_StandardModes, AIS_CM_TemporaryShapePrs
- **AIS_ConnectStatus** · *statiques :* AIS_CS_Both, AIS_CS_Connection, AIS_CS_None, AIS_CS_Transform
- **AIS_DimensionSelectionMode** · *statiques :* AIS_DSM_All, AIS_DSM_Line, AIS_DSM_Text
- **AIS_DisplayMode** · *statiques :* AIS_Shaded, AIS_WireFrame
- **AIS_DisplaySpecialSymbol** · *statiques :* AIS_DSS_After, AIS_DSS_Before, AIS_DSS_No
- **AIS_DisplayStatus** · *statiques :* AIS_DS_Displayed, AIS_DS_Erased, AIS_DS_None
- **AIS_DragAction** · *statiques :* AIS_DragAction_Abort, AIS_DragAction_Start, AIS_DragAction_Stop, AIS_DragAction_Update
- **AIS_KindOfDimension** · *statiques :* AIS_KOD_AREA, AIS_KOD_CHAMF2D, AIS_KOD_CHAMF3D, AIS_KOD_DIAMETER, AIS_KOD_ELLIPSERADIUS, AIS_KOD_LENGTH, AIS_KOD_MASS, AIS_KOD_NONE, AIS_KOD_OFFSET, AIS_KOD_PLANEANGLE, AIS_KOD_RADIUS, AIS_KOD_SOLIDANGLE, AIS_KOD_TIME, AIS_KOD_VOLUME
- **AIS_KindOfInteractive** · *statiques :* AIS_KOI_Datum, AIS_KOI_Dimension, AIS_KOI_None, AIS_KOI_Object, AIS_KOI_Relation, AIS_KOI_Shape
- **AIS_KindOfRelation** · *statiques :* AIS_KOR_CONCENTRIC, AIS_KOR_EQUALDISTANCE, AIS_KOR_EQUALRADIUS, AIS_KOR_FIX, AIS_KOR_IDENTIC, AIS_KOR_NONE, AIS_KOR_OFFSET, AIS_KOR_PARALLEL, AIS_KOR_PERPENDICULAR, AIS_KOR_SYMMETRIC, AIS_KOR_TANGENT
- **AIS_KindOfSurface** · *statiques :* AIS_KOS_Cone, AIS_KOS_Cylinder, AIS_KOS_Extrusion, AIS_KOS_OtherSurface, AIS_KOS_Plane, AIS_KOS_Revolution, AIS_KOS_Sphere, AIS_KOS_Torus
- **AIS_KindOfUnit** · *statiques :* AIS_TOU_FORCE, AIS_TOU_LENGTH, AIS_TOU_MASS, AIS_TOU_PLANE_ANGLE, AIS_TOU_SOLID_ANGLE, AIS_TOU_SURFACE, AIS_TOU_TIME, AIS_TOU_VOLUME
- **AIS_ListOfInteractive** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **AIS_ManipulatorMode** · *statiques :* AIS_MM_None, AIS_MM_Rotation, AIS_MM_Scaling, AIS_MM_Translation, AIS_MM_TranslationPlane
- **AIS_MouseGesture** · *statiques :* AIS_MouseGesture_NONE, AIS_MouseGesture_Pan, AIS_MouseGesture_RotateOrbit, AIS_MouseGesture_RotateView, AIS_MouseGesture_SelectLasso, AIS_MouseGesture_SelectRectangle, AIS_MouseGesture_Zoom
- **AIS_NListOfEntityOwner** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **AIS_NavigationMode** · *statiques :* AIS_NavigationMode_FirstPersonFlight, AIS_NavigationMode_FirstPersonWalk, AIS_NavigationMode_Orbit
- **AIS_RotationMode** · *statiques :* AIS_RotationMode_BndBoxActive, AIS_RotationMode_BndBoxScene, AIS_RotationMode_CameraAt, AIS_RotationMode_PickCenter, AIS_RotationMode_PickLast
- **AIS_SelectStatus** · *statiques :* AIS_SS_Added, AIS_SS_NotDone, AIS_SS_Removed
- **AIS_SelectionModesConcurrency** · *statiques :* AIS_SelectionModesConcurrency_GlobalOrLocal, AIS_SelectionModesConcurrency_Multiple, AIS_SelectionModesConcurrency_Single
- **AIS_StandardDatum** · *statiques :* AIS_SD_Axis, AIS_SD_Circle, AIS_SD_Line, AIS_SD_None, AIS_SD_Plane, AIS_SD_PlaneTrihedron, AIS_SD_Point, AIS_SD_Trihedron
- **AIS_StatusOfDetection** · *statiques :* AIS_SOD_AllBad, AIS_SOD_Error, AIS_SOD_Nothing, AIS_SOD_OnlyOneDetected, AIS_SOD_OnlyOneGood, AIS_SOD_Selected, AIS_SOD_SeveralGood
- **AIS_StatusOfPick** · *statiques :* AIS_SOP_Error, AIS_SOP_NothingSelected, AIS_SOP_OneSelected, AIS_SOP_Removed, AIS_SOP_SeveralSelected
- **AIS_TrihedronSelectionMode** · *statiques :* AIS_TrihedronSelectionMode_Axes, AIS_TrihedronSelectionMode_EntireObject, AIS_TrihedronSelectionMode_MainPlanes, AIS_TrihedronSelectionMode_Origin
- **AIS_TypeOfAngle** · *statiques :* AIS_TOA_Exterior, AIS_TOA_Interior
- **AIS_TypeOfAngleArrowVisibility** · *statiques :* AIS_TOAV_Both, AIS_TOAV_First, AIS_TOAV_None, AIS_TOAV_Second
- **AIS_TypeOfAttribute** · *statiques :* AIS_TOA_Dimension, AIS_TOA_FaceBoundary, AIS_TOA_FirstAxis, AIS_TOA_Free, AIS_TOA_Hidden, AIS_TOA_Line, AIS_TOA_Plane, AIS_TOA_SecondAxis, AIS_TOA_Section, AIS_TOA_Seen, AIS_TOA_ThirdAxis, AIS_TOA_UIso, AIS_TOA_UnFree, AIS_TOA_VIso, AIS_TOA_Vector, AIS_TOA_Wire
- **AIS_TypeOfAxis** · *statiques :* AIS_TOAX_Unknown, AIS_TOAX_XAxis, AIS_TOAX_YAxis, AIS_TOAX_ZAxis
- **AIS_TypeOfDist** · *statiques :* AIS_TOD_Horizontal, AIS_TOD_Unknown, AIS_TOD_Vertical
- **AIS_TypeOfIso** · *statiques :* AIS_TOI_Both, AIS_TOI_IsoU, AIS_TOI_IsoV
- **AIS_TypeOfPlane** · *statiques :* AIS_TOPL_Unknown, AIS_TOPL_XYPlane, AIS_TOPL_XZPlane, AIS_TOPL_YZPlane
- **AIS_ViewInputBufferType** · *statiques :* AIS_ViewInputBufferType_GL, AIS_ViewInputBufferType_UI
- **AIS_ViewSelectionTool** · *statiques :* AIS_ViewSelectionTool_Picking, AIS_ViewSelectionTool_Polygon, AIS_ViewSelectionTool_RubberBand
- **AIS_WalkRotation** · *statiques :* AIS_WalkRotation_Pitch, AIS_WalkRotation_Roll, AIS_WalkRotation_Yaw
- **AIS_WalkTranslation** · *statiques :* AIS_WalkTranslation_Forward, AIS_WalkTranslation_Side, AIS_WalkTranslation_Up

## APIHeaderSection

- **APIHeaderSection_EditHeader** ← IFSelect_Editor : Apply, DynamicType, Label, Load, Recognize, StringValue · *statiques :* get_type_descriptor, get_type_name
- **APIHeaderSection_MakeHeader** (2 ctor) : AddSchemaIdentifier, Apply, Author, AuthorValue, Authorisation, Description, DescriptionValue, FdValue, FnValue, FsValue, HasFd, HasFn, HasFs, ImplementationLevel, Init, IsDone, Name, NbAuthor, NbDescription, NbOrganization, NbSchemaIdentifiers, NewModel, Organization, OrganizationValue, OriginatingSystem, PreprocessorVersion, SchemaIdentifiers, SchemaIdentifiersValue, SetAuthor, SetAuthorValue, SetAuthorisation, SetDescription, SetDescriptionValue, SetImplementationLevel, SetName, SetOrganization, SetOrganizationValue, SetOriginatingSystem, SetPreprocessorVersion, SetSchemaIdentifiers, SetSchemaIdentifiersValue, SetTimeStamp, TimeStamp

## AppBlend

- **AppBlend_Approx** : Curve2d, Curve2dPoles, Curves2dDegree, Curves2dKnots, Curves2dMults, Curves2dShape, IsDone, NbCurves2d, SurfPoles, SurfShape, SurfUKnots, SurfUMults, SurfVKnots, SurfVMults, SurfWeights, Surface, TolCurveOnSurf, TolReached, UDegree, VDegree

## AppCont

- **AppCont_Function** : D1, FirstParameter, GetNbOf2dPoints, GetNbOf3dPoints, GetNumberOfPoints, LastParameter, PeriodInformation, Value
- **AppCont_LeastSquare** : Error, IsDone, Value

## AppDef

- **AppDef_Array1OfMultiPointConstraint** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## AppParCurves

- **AppParCurves_Array1OfConstraintCouple** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **AppParCurves_Array1OfMultiBSpCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **AppParCurves_Array1OfMultiCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **AppParCurves_Array1OfMultiPoint** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **AppParCurves_Constraint** · *statiques :* AppParCurves_CurvaturePoint, AppParCurves_NoConstraint, AppParCurves_PassPoint, AppParCurves_TangencyPoint
- **AppParCurves_ConstraintCouple** (2 ctor) : Constraint, Index, SetConstraint, SetIndex
- **AppParCurves_MultiBSpCurve** ← AppParCurves_MultiCurve (4 ctor) : D1, D2, Degree, Dump, Knots, Multiplicities, SetKnots, SetMultiplicities, Value
- **AppParCurves_MultiCurve** (3 ctor) : Curve, D1, D2, Degree, Dimension, Dump, NbCurves, NbPoles, Pole, Pole2d, SetNbPoles, SetValue, Transform, Transform2d, Value
- **AppParCurves_MultiPoint** (5 ctor) : Dimension, Dump, NbPoints, NbPoints2d, Point, Point2d, SetPoint, SetPoint2d, Transform, Transform2d

## Approx

- **Approx_Array1OfAdHSurface** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Approx_Array1OfGTrsf2d** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Approx_Curve2d** : Curve, HasResult, IsDone, MaxError2dU, MaxError2dV
- **Approx_Curve3d** : Curve, Dump, HasResult, IsDone, MaxError
- **Approx_CurveOnSurface** : Curve2d, Curve3d, HasResult, IsDone, MaxError2dU, MaxError2dV, MaxError3d
- **Approx_CurvilinearParameter** (3 ctor) : Curve2d1, Curve2d2, Curve3d, Dump, HasResult, IsDone, MaxError2d1, MaxError2d2, MaxError3d
- **Approx_CurvlinFunc** ← Standard_Transient (3 ctor) : DynamicType, EvalCase1, EvalCase2, EvalCase3, FirstParameter, GetLength, GetSParameter, GetUParameter, Intervals, LastParameter, Length, NbIntervals, SetTol, Trim · *statiques :* get_type_descriptor, get_type_name
- **Approx_FitAndDivide** (2 ctor) : Error, IsAllApproximated, IsToleranceReached, NbMultiCurves, Parameters, Perform, SetConstraints, SetDegrees, SetInvOrder, SetMaxSegments, SetTolerances, Value
- **Approx_FitAndDivide2d** (2 ctor) : Error, IsAllApproximated, IsToleranceReached, NbMultiCurves, Parameters, Perform, SetConstraints, SetDegrees, SetInvOrder, SetMaxSegments, SetTolerances, Value
- **Approx_MCurvesToBSpCurve** : Append, ChangeValue, Perform, Reset, Value
- **Approx_ParametrizationType** · *statiques :* Approx_Centripetal, Approx_ChordLength, Approx_IsoParametric
- **Approx_SameParameter** (3 ctor) : Curve2d, IsDone, IsSameParameter, TolReached
- **Approx_Status** · *statiques :* Approx_NoApproximation, Approx_NoPointsAdded, Approx_PointsAdded
- **Approx_SweepApproximation** : Average2dError, AverageErrorOnSurf, Curve2d, Curve2dPoles, Curves2dDegree, Curves2dKnots, Curves2dMults, Curves2dShape, Dump, Eval, IsDone, Max2dError, MaxErrorOnSurf, NbCurves2d, Perform, SurfPoles, SurfShape, SurfUKnots, SurfUMults, SurfVKnots, SurfVMults, SurfWeights, Surface, TolCurveOnSurf, UDegree, VDegree
- **Approx_SweepFunction** ← Standard_Transient : BarycentreOfSurf, D0, D1, D2, DynamicType, GetMinimalWeight, GetTolerance, Intervals, IsRational, Knots, MaximalSection, Mults, Nb2dCurves, NbIntervals, Resolution, SectionShape, SetInterval, SetTolerance · *statiques :* get_type_descriptor, get_type_name

## ApproxInt

- **ApproxInt_KnotTools** · *statiques :* BuildKnots
- **ApproxInt_SvSurfaces** : Compute, Pnt, SeekPoint, Tangency, TangencyOnSurf1, TangencyOnSurf2

## AppStd

- **AppStd_Application** ← TDocStd_Application : DynamicType, ResourcesName · *statiques :* get_type_descriptor, get_type_name

## AppStdL

- **AppStdL_Application** ← TDocStd_Application : DynamicType, ResourcesName · *statiques :* get_type_descriptor, get_type_name

## Aspect

- **Aspect_FillMethod** · *statiques :* Aspect_FM_CENTERED, Aspect_FM_NONE, Aspect_FM_STRETCH, Aspect_FM_TILED
- **Aspect_GradientFillMethod** · *statiques :* Aspect_GFM_CORNER1, Aspect_GFM_CORNER2, Aspect_GFM_CORNER3, Aspect_GFM_CORNER4, Aspect_GFM_DIAG1, Aspect_GFM_DIAG2, Aspect_GFM_HOR, Aspect_GFM_NONE, Aspect_GFM_VER
- **Aspect_GridDrawMode** · *statiques :* Aspect_GDM_Lines, Aspect_GDM_None, Aspect_GDM_Points
- **Aspect_GridType** · *statiques :* Aspect_GT_Circular, Aspect_GT_Rectangular
- **Aspect_HatchStyle** · *statiques :* Aspect_HS_DIAGONAL, Aspect_HS_DIAGONAL_135_WIDE, Aspect_HS_DIAGONAL_45_WIDE, Aspect_HS_GRID, Aspect_HS_GRID_DIAGONAL, Aspect_HS_GRID_DIAGONAL_WIDE, Aspect_HS_GRID_WIDE, Aspect_HS_HORIZONTAL, Aspect_HS_HORIZONTAL_WIDE, Aspect_HS_NB, Aspect_HS_SOLID, Aspect_HS_VERTICAL, Aspect_HS_VERTICAL_WIDE
- **Aspect_InteriorStyle** · *statiques :* Aspect_IS_EMPTY, Aspect_IS_HATCH, Aspect_IS_HIDDENLINE, Aspect_IS_HOLLOW, Aspect_IS_POINT, Aspect_IS_SOLID
- **Aspect_TypeOfColorScaleData** · *statiques :* Aspect_TOCSD_AUTO, Aspect_TOCSD_USER
- **Aspect_TypeOfColorScaleOrientation** · *statiques :* Aspect_TOCSO_CENTER, Aspect_TOCSO_LEFT, Aspect_TOCSO_NONE, Aspect_TOCSO_RIGHT
- **Aspect_TypeOfColorScalePosition** · *statiques :* Aspect_TOCSP_CENTER, Aspect_TOCSP_LEFT, Aspect_TOCSP_NONE, Aspect_TOCSP_RIGHT
- **Aspect_TypeOfDeflection** · *statiques :* Aspect_TOD_ABSOLUTE, Aspect_TOD_RELATIVE
- **Aspect_TypeOfDisplayText** · *statiques :* Aspect_TODT_BLEND, Aspect_TODT_DEKALE, Aspect_TODT_DIMENSION, Aspect_TODT_NORMAL, Aspect_TODT_SHADOW, Aspect_TODT_SUBTITLE
- **Aspect_TypeOfFacingModel** · *statiques :* Aspect_TOFM_BACK_SIDE, Aspect_TOFM_BOTH_SIDE, Aspect_TOFM_FRONT_SIDE
- **Aspect_TypeOfHighlightMethod** · *statiques :* Aspect_TOHM_BOUNDBOX, Aspect_TOHM_COLOR
- **Aspect_TypeOfLine** · *statiques :* Aspect_TOL_DASH, Aspect_TOL_DOT, Aspect_TOL_DOTDASH, Aspect_TOL_EMPTY, Aspect_TOL_SOLID, Aspect_TOL_USERDEFINED
- **Aspect_TypeOfMarker** · *statiques :* Aspect_TOM_BALL, Aspect_TOM_EMPTY, Aspect_TOM_O, Aspect_TOM_O_PLUS, Aspect_TOM_O_POINT, Aspect_TOM_O_STAR, Aspect_TOM_O_X, Aspect_TOM_PLUS, Aspect_TOM_POINT, Aspect_TOM_RING1, Aspect_TOM_RING2, Aspect_TOM_RING3, Aspect_TOM_STAR, Aspect_TOM_USERDEFINED, Aspect_TOM_X
- **Aspect_TypeOfResize** · *statiques :* Aspect_TOR_BOTTOM_AND_LEFT_BORDER, Aspect_TOR_BOTTOM_BORDER, Aspect_TOR_LEFT_AND_TOP_BORDER, Aspect_TOR_LEFT_BORDER, Aspect_TOR_NO_BORDER, Aspect_TOR_RIGHT_AND_BOTTOM_BORDER, Aspect_TOR_RIGHT_BORDER, Aspect_TOR_TOP_AND_RIGHT_BORDER, Aspect_TOR_TOP_BORDER, Aspect_TOR_UNKNOWN
- **Aspect_TypeOfStyleText** · *statiques :* Aspect_TOST_ANNOTATION, Aspect_TOST_NORMAL
- **Aspect_TypeOfTriedronPosition** · *statiques :* Aspect_TOTP_BOTTOM, Aspect_TOTP_CENTER, Aspect_TOTP_LEFT, Aspect_TOTP_LEFT_LOWER, Aspect_TOTP_LEFT_UPPER, Aspect_TOTP_RIGHT, Aspect_TOTP_RIGHT_LOWER, Aspect_TOTP_RIGHT_UPPER, Aspect_TOTP_TOP
- **Aspect_VKeyBasic** · *statiques :* Aspect_VKey, Aspect_VKey_A, Aspect_VKey_Alt, Aspect_VKey_Apostrophe, Aspect_VKey_B, Aspect_VKey_Back, Aspect_VKey_Backslash, Aspect_VKey_Backspace, Aspect_VKey_BracketLeft, Aspect_VKey_BracketRight, Aspect_VKey_BrowserBack, Aspect_VKey_BrowserFavorites, Aspect_VKey_BrowserForward, Aspect_VKey_BrowserHome, Aspect_VKey_BrowserRefresh, Aspect_VKey_BrowserSearch, Aspect_VKey_BrowserStop, Aspect_VKey_C, Aspect_VKey_Comma, Aspect_VKey_Control, Aspect_VKey_D, Aspect_VKey_Delete, Aspect_VKey_Down, Aspect_VKey_E, Aspect_VKey_End, Aspect_VKey_Enter, Aspect_VKey_Equal, Aspect_VKey_Escape, Aspect_VKey_F, Aspect_VKey_F1, Aspect_VKey_F10, Aspect_VKey_F11, Aspect_VKey_F12, Aspect_VKey_F2, Aspect_VKey_F3, Aspect_VKey_F4, Aspect_VKey_F5, Aspect_VKey_F6, Aspect_VKey_F7, Aspect_VKey_F8, Aspect_VKey_F9, Aspect_VKey_G, Aspect_VKey_H, Aspect_VKey_Home, Aspect_VKey_I, Aspect_VKey_J, Aspect_VKey_K, Aspect_VKey_L, Aspect_VKey_Left, Aspect_VKey_M, Aspect_VKey_MediaNextTrack, Aspect_VKey_MediaPlayPause, Aspect_VKey_MediaPreviousTrack, Aspect_VKey_MediaStop, Aspect_VKey_Menu, Aspect_VKey_Meta, Aspect_VKey_Minus, Aspect_VKey_N, Aspect_VKey_NavBackward, Aspect_VKey_NavCrouch, Aspect_VKey_NavForward, Aspect_VKey_NavInteract, Aspect_VKey_NavJump, Aspect_VKey_NavLookDown, Aspect_VKey_NavLookLeft, Aspect_VKey_NavLookRight, Aspect_VKey_NavLookUp, Aspect_VKey_NavRollCCW, Aspect_VKey_NavRollCW, Aspect_VKey_NavSlideDown, Aspect_VKey_NavSlideLeft, Aspect_VKey_NavSlideRight, Aspect_VKey_NavSlideUp, Aspect_VKey_NavSpeedDecrease, Aspect_VKey_NavSpeedIncrease, Aspect_VKey_NavThrustBackward, Aspect_VKey_NavThrustForward, Aspect_VKey_NavThrustStop, Aspect_VKey_Numlock, Aspect_VKey_Numpad0, Aspect_VKey_Numpad1, Aspect_VKey_Numpad2, Aspect_VKey_Numpad3, Aspect_VKey_Numpad4, Aspect_VKey_Numpad5, Aspect_VKey_Numpad6, Aspect_VKey_Numpad7, Aspect_VKey_Numpad8, Aspect_VKey_Numpad9, Aspect_VKey_NumpadAdd, Aspect_VKey_NumpadDivide, Aspect_VKey_NumpadMultiply, Aspect_VKey_NumpadSubtract, Aspect_VKey_O, Aspect_VKey_P, Aspect_VKey_PageDown, Aspect_VKey_PageUp, Aspect_VKey_Period, Aspect_VKey_Plus, Aspect_VKey_Q, Aspect_VKey_R, Aspect_VKey_Right, Aspect_VKey_S, Aspect_VKey_Scroll, Aspect_VKey_Semicolon, Aspect_VKey_Shift, Aspect_VKey_Slash, Aspect_VKey_Space, Aspect_VKey_T, Aspect_VKey_Tab, Aspect_VKey_Tilde, Aspect_VKey_U, Aspect_VKey_UNKNOWN, Aspect_VKey_Up, Aspect_VKey_V, Aspect_VKey_VolumeDown, Aspect_VKey_VolumeMute, Aspect_VKey_VolumeUp, Aspect_VKey_W, Aspect_VKey_X, Aspect_VKey_Y, Aspect_VKey_Z
- **Aspect_WidthOfLine** · *statiques :* Aspect_WOL_MEDIUM, Aspect_WOL_THICK, Aspect_WOL_THIN, Aspect_WOL_USERDEFINED, Aspect_WOL_VERYTHICK
- **Aspect_XAtom** · *statiques :* Aspect_XA_DELETE_WINDOW

## BinDrivers

- **BinDrivers_Marker** · *statiques :* BinDrivers_ENDATTRLIST, BinDrivers_ENDLABEL

## BinLDrivers

- **BinLDrivers_Marker** · *statiques :* BinLDrivers_ENDATTRLIST, BinLDrivers_ENDLABEL

## Bisector

- **Bisector_Bisec** : ChangeValue, Perform, Value
- **Bisector_BisecAna** ← Bisector_Curve : Continuity, Copy, D0, D1, D2, D3, DN, Dump, DynamicType, FirstParameter, Geom2dCurve, Init, IntervalFirst, IntervalLast, IsCN, IsClosed, IsExtendAtEnd, IsExtendAtStart, IsPeriodic, LastParameter, NbIntervals, Parameter, ParameterOfEndPoint, ParameterOfStartPoint, Perform, Reverse, ReversedParameter, SetTrim, Transform · *statiques :* get_type_descriptor, get_type_name
- **Bisector_BisecCC** ← Bisector_Curve (2 ctor) : ChangeGuide, Continuity, Copy, Curve, D0, D1, D2, D3, DN, Dump, DynamicType, FirstParameter, IntervalContinuity, IntervalFirst, IntervalLast, IsCN, IsClosed, IsEmpty, IsExtendAtEnd, IsExtendAtStart, IsPeriodic, LastParameter, LinkBisCurve, LinkCurveBis, NbIntervals, Parameter, Perform, Polygon, Reverse, ReversedParameter, Transform, ValueAndDist, ValueByInt · *statiques :* get_type_descriptor, get_type_name
- **Bisector_BisecPC** ← Bisector_Curve (3 ctor) : Continuity, Copy, D0, D1, D2, D3, DN, Distance, Dump, DynamicType, FirstParameter, IntervalContinuity, IntervalFirst, IntervalLast, IsCN, IsClosed, IsEmpty, IsExtendAtEnd, IsExtendAtStart, IsPeriodic, LastParameter, LinkBisCurve, LinkCurveBis, NbIntervals, Parameter, Perform, Reverse, ReversedParameter, Transform · *statiques :* get_type_descriptor, get_type_name
- **Bisector_Curve** ← Geom2d_Curve : DynamicType, IntervalFirst, IntervalLast, IsExtendAtEnd, IsExtendAtStart, NbIntervals, Parameter · *statiques :* get_type_descriptor, get_type_name
- **Bisector_FunctionH** ← math_FunctionWithDerivative : Derivative, Value, Values
- **Bisector_FunctionInter** ← math_FunctionWithDerivative (2 ctor) : Derivative, Perform, Value, Values
- **Bisector_Inter** ← IntRes2d_Intersection (2 ctor) : Perform
- **Bisector_PointOnBis** (2 ctor) : Distance, Dump, IsInfinite, ParamOnBis, ParamOnC1, ParamOnC2, Point
- **Bisector_PolyBis** : Append, First, Interval, IsEmpty, Last, Length, Transform, Value

## BiTgte

- **BiTgte_Blend** (2 ctor) : CenterLines, Clear, ComputeCenters, ContactType, CurveOnShape1, CurveOnShape2, Face, IndicesOfBranche, Init, IsDone, NbBranches, NbSurfaces, PCurve1OnFillet, PCurve2OnFillet, PCurveOnFace1, PCurveOnFace2, Perform, SetEdge, SetFaces, SetStoppingFace, Shape, SupportShape1, SupportShape2, Surface
- **BiTgte_ContactType** · *statiques :* BiTgte_EdgeEdge, BiTgte_EdgeVertex, BiTgte_FaceEdge, BiTgte_FaceFace, BiTgte_FaceVertex, BiTgte_VertexVertex
- **BiTgte_CurveOnEdge** ← Adaptor3d_Curve (2 ctor) : BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Init, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, Parabola, Period, Resolution, Trim, Value
- **BiTgte_CurveOnVertex** ← Adaptor3d_Curve (2 ctor) : BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Init, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, Parabola, Period, Resolution, Trim, Value
- **BiTgte_HCurveOnEdge** ← Adaptor3d_HCurve (2 ctor) : ChangeCurve, Curve, DynamicType, GetCurve, Set · *statiques :* get_type_descriptor, get_type_name
- **BiTgte_HCurveOnVertex** ← Adaptor3d_HCurve (2 ctor) : ChangeCurve, Curve, DynamicType, GetCurve, Set · *statiques :* get_type_descriptor, get_type_name

## Blend

- **Blend_AppFunction** ← math_FunctionSetWithDerivatives : Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, Knots, Mults, NbEquations, NbIntervals, NbVariables, Parameter, Pnt1, Pnt2, Resolution, Section, Set, Value, Values
- **Blend_CSFunction** ← Blend_AppFunction : Derivatives, GetBounds, GetMinimalDistance, GetShape, GetTolerance, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbVariables, ParameterOnC, Pnt1, Pnt2, Pnt2d, PointOnC, PointOnS, Section, Set, Tangent, Tangent2d, TangentOnC, TangentOnS, Value, Values
- **Blend_CurvPointFuncInv** ← math_FunctionSetWithDerivatives : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, NbVariables, Set, Value, Values
- **Blend_DecrochStatus** · *statiques :* Blend_DecrochBoth, Blend_DecrochRst1, Blend_DecrochRst2, Blend_NoDecroch
- **Blend_FuncInv** ← math_FunctionSetWithDerivatives : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, NbVariables, Set, Value, Values
- **Blend_Function** ← Blend_AppFunction : IsTangencyPoint, NbVariables, Pnt1, Pnt2, PointOnS1, PointOnS2, Section, Tangent, Tangent2dOnS1, Tangent2dOnS2, TangentOnS1, TangentOnS2, TwistOnS1, TwistOnS2
- **Blend_Point** (9 ctor) : IsTangencyPoint, Parameter, ParameterOnC, ParameterOnC1, ParameterOnC2, ParametersOnS, ParametersOnS1, ParametersOnS2, PointOnC, PointOnC1, PointOnC2, PointOnS, PointOnS1, PointOnS2, SetParameter, SetValue, Tangent2d, Tangent2dOnS1, Tangent2dOnS2, TangentOnC, TangentOnC1, TangentOnC2, TangentOnS, TangentOnS1, TangentOnS2
- **Blend_RstRstFunction** ← Blend_AppFunction : Decroch, Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, NbVariables, ParameterOnRst1, ParameterOnRst2, Pnt1, Pnt2, Pnt2dOnRst1, Pnt2dOnRst2, PointOnRst1, PointOnRst2, Section, Set, Tangent2dOnRst1, Tangent2dOnRst2, TangentOnRst1, TangentOnRst2, Value, Values
- **Blend_Status** · *statiques :* Blend_Backward, Blend_OK, Blend_OnRst1, Blend_OnRst12, Blend_OnRst2, Blend_SamePoints, Blend_StepTooLarge, Blend_StepTooSmall
- **Blend_SurfCurvFuncInv** ← math_FunctionSetWithDerivatives : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, NbVariables, Set, Value, Values
- **Blend_SurfPointFuncInv** ← math_FunctionSetWithDerivatives : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, NbVariables, Set, Value, Values
- **Blend_SurfRstFunction** ← Blend_AppFunction : Decroch, Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, NbVariables, ParameterOnRst, Pnt1, Pnt2, Pnt2dOnRst, Pnt2dOnS, PointOnRst, PointOnS, Section, Set, Tangent2dOnRst, Tangent2dOnS, TangentOnRst, TangentOnS, Value, Values

## BlendFunc

- **BlendFunc_CSCircular** ← Blend_CSFunction : Derivatives, GetBounds, GetMinimalWeight, GetSection, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, NbVariables, ParameterOnC, Pnt2d, PointOnC, PointOnS, Resolution, Section, Set, Tangent, Tangent2d, TangentOnC, TangentOnS, Value, Values
- **BlendFunc_CSConstRad** ← Blend_CSFunction : Derivatives, GetBounds, GetMinimalWeight, GetSection, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, ParameterOnC, Pnt2d, PointOnC, PointOnS, Resolution, Section, Set, Tangent, Tangent2d, TangentOnC, TangentOnS, Value, Values
- **BlendFunc_ChAsym** ← Blend_Function : ComputeValues, Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, PointOnS1, PointOnS2, Resolution, Section, Set, Tangent, Tangent2dOnS1, Tangent2dOnS2, TangentOnS1, TangentOnS2, TwistOnS1, TwistOnS2, Value, Values
- **BlendFunc_ChAsymInv** ← Blend_FuncInv : ComputeValues, Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, Set, Value, Values
- **BlendFunc_ChamfInv** ← BlendFunc_GenChamfInv : Derivatives, IsSolution, Set, Value
- **BlendFunc_Chamfer** ← BlendFunc_GenChamfer : Derivatives, GetSectionSize, IsSolution, IsTangencyPoint, PointOnS1, PointOnS2, Set, Tangent, Tangent2dOnS1, Tangent2dOnS2, TangentOnS1, TangentOnS2, Value
- **BlendFunc_ConstRad** ← Blend_Function : AxeRot, Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, PointOnS1, PointOnS2, Resolution, Section, Set, Tangent, Tangent2dOnS1, Tangent2dOnS2, TangentOnS1, TangentOnS2, TwistOnS1, TwistOnS2, Value, Values
- **BlendFunc_ConstRadInv** ← Blend_FuncInv : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, Set, Value, Values
- **BlendFunc_ConstThroat** ← BlendFunc_GenChamfer : Derivatives, GetSectionSize, IsSolution, IsTangencyPoint, PointOnS1, PointOnS2, Set, Tangent, Tangent2dOnS1, Tangent2dOnS2, TangentOnS1, TangentOnS2, Value
- **BlendFunc_ConstThroatInv** ← BlendFunc_GenChamfInv : Derivatives, IsSolution, Set, Value
- **BlendFunc_ConstThroatWithPenetration** ← BlendFunc_ConstThroat : Derivatives, GetSectionSize, IsSolution, Tangent2dOnS1, Tangent2dOnS2, TangentOnS1, TangentOnS2, Value
- **BlendFunc_ConstThroatWithPenetrationInv** ← BlendFunc_ConstThroatInv : Derivatives, IsSolution, Value
- **BlendFunc_Corde** : DerFguide, Derivatives, IsSolution, IsTangencyPoint, NPlan, PointOnGuide, PointOnS, SetDist, SetParam, Tangent2dOnS, TangentOnS, Value
- **BlendFunc_EvolRad** ← Blend_Function : Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, PointOnS1, PointOnS2, Resolution, Section, Set, Tangent, Tangent2dOnS1, Tangent2dOnS2, TangentOnS1, TangentOnS2, TwistOnS1, TwistOnS2, Value, Values
- **BlendFunc_EvolRadInv** ← Blend_FuncInv : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, Set, Value, Values
- **BlendFunc_GenChamfInv** ← Blend_FuncInv : GetBounds, GetTolerance, NbEquations, Set, Values
- **BlendFunc_GenChamfer** ← Blend_Function : GetBounds, GetMinimalDistance, GetMinimalWeight, GetShape, GetTolerance, Intervals, IsRational, Knots, Mults, NbEquations, NbIntervals, Resolution, Section, Set, Values
- **BlendFunc_Ruled** ← Blend_Function : AxeRot, Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSection, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, PointOnS1, PointOnS2, Resolution, Section, Set, Tangent, Tangent2dOnS1, Tangent2dOnS2, TangentOnS1, TangentOnS2, Value, Values
- **BlendFunc_RuledInv** ← Blend_FuncInv : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, Set, Value, Values
- **BlendFunc_SectionShape** · *statiques :* BlendFunc_Linear, BlendFunc_Polynomial, BlendFunc_QuasiAngular, BlendFunc_Rational
- **BlendFunc_Tensor** : ChangeValue, Init, Multiply, Value

## Bnd

- **Bnd_Array1OfBox** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Bnd_Array1OfBox2d** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Bnd_Array1OfSphere** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Bnd_B2d** (2 ctor) : Add, Clear, CornerMax, CornerMin, Enlarge, IsIn, IsOut, IsVoid, Limit, SetCenter, SetHSize, SquareExtent, Transformed
- **Bnd_B2f** (2 ctor) : Add, Clear, CornerMax, CornerMin, Enlarge, IsIn, IsOut, IsVoid, Limit, SetCenter, SetHSize, SquareExtent, Transformed
- **Bnd_B3d** (2 ctor) : Add, Clear, CornerMax, CornerMin, Enlarge, IsIn, IsOut, IsVoid, Limit, SetCenter, SetHSize, SquareExtent, Transformed
- **Bnd_B3f** (2 ctor) : Add, Clear, CornerMax, CornerMin, Enlarge, IsIn, IsOut, IsVoid, Limit, SetCenter, SetHSize, SquareExtent, Transformed
- **Bnd_BoundSortBox** : Add, Compare, Destroy, Dump, Initialize
- **Bnd_BoundSortBox2d** : Add, Compare, Dump, Initialize
- **Bnd_Box** ★ (2 ctor) : Add, CornerMax, CornerMin, Distance, Dump, DumpJson, Enlarge, FinitePart, Get, GetGap, GetXmax, GetXmin, GetYmax, GetYmin, GetZmax, GetZmin, HasFinitePart, IsOpen, IsOpenXmax, IsOpenXmin, IsOpenYmax, IsOpenYmin, IsOpenZmax, IsOpenZmin, IsOut, IsThin, IsVoid, IsWhole, IsXThin, IsYThin, IsZThin, OpenXmax, OpenXmin, OpenYmax, OpenYmin, OpenZmax, OpenZmin, Set, SetGap, SetVoid, SetWhole, SquareExtent, Transformed, Update
- **Bnd_Box2d** : Add, Dump, Enlarge, Get, GetGap, IsOpenXmax, IsOpenXmin, IsOpenYmax, IsOpenYmin, IsOut, IsVoid, IsWhole, OpenXmax, OpenXmin, OpenYmax, OpenYmin, Set, SetGap, SetVoid, SetWhole, SquareExtent, Transformed, Update
- **Bnd_OBB** (3 ctor) : Add, Center, DumpJson, Enlarge, GetVertex, IsAABox, IsCompletelyInside, IsOut, IsVoid, Position, ReBuild, SetAABox, SetCenter, SetVoid, SetXComponent, SetYComponent, SetZComponent, SquareExtent, XDirection, XHSize, YDirection, YHSize, ZDirection, ZHSize
- **Bnd_Range** (2 ctor) : Add, Common, Delta, DumpJson, Enlarge, GetBounds, GetIntermediatePoint, GetMax, GetMin, IsIntersected, IsOut, IsVoid, SetVoid, Shift, Shifted, Split, TrimFrom, TrimTo, Union
- **Bnd_Sphere** (2 ctor) : Add, Center, Distance, Distances, IsOut, IsValid, Project, Radius, SetValid, SquareDistance, SquareDistances, SquareExtent, U, V
- **Bnd_Tools** · *statiques :* Bnd2BVH

## BndLib

- **BndLib_Add2dCurve** · *statiques :* Add, AddOptimal
- **BndLib_Add3dCurve** · *statiques :* Add, AddGenCurv, AddOptimal
- **BndLib_AddSurface** · *statiques :* Add, AddGenSurf, AddOptimal

## BOPAlgo

- **BOPAlgo_CheckStatus** · *statiques :* BOPAlgo_BadType, BOPAlgo_CheckUnknown, BOPAlgo_GeomAbs_C0, BOPAlgo_IncompatibilityOfEdge, BOPAlgo_IncompatibilityOfFace, BOPAlgo_IncompatibilityOfVertex, BOPAlgo_InvalidCurveOnSurface, BOPAlgo_NonRecoverableFace, BOPAlgo_NotValid, BOPAlgo_OperationAborted, BOPAlgo_SelfIntersect, BOPAlgo_TooSmallEdge
- **BOPAlgo_GlueEnum** ★ · *statiques :* BOPAlgo_GlueFull, BOPAlgo_GlueOff, BOPAlgo_GlueShift
- **BOPAlgo_ListOfCheckResult** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BOPAlgo_ListOfEdgeInfo** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BOPAlgo_Operation** · *statiques :* BOPAlgo_COMMON, BOPAlgo_CUT, BOPAlgo_CUT21, BOPAlgo_FUSE, BOPAlgo_SECTION, BOPAlgo_UNKNOWN

## BOPDS

- **BOPDS_ListOfPave** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BOPDS_ListOfPaveBlock** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BOPDS_VectorOfPave** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## BOPTools

- **BOPTools_ListOfConnexityBlock** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BOPTools_ListOfCoupleOfShape** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign

## BRep

- **BRep_Builder** ★ ← TopoDS_Builder : Continuity, Degenerated, MakeEdge, MakeFace, MakeVertex, NaturalRestriction, Range, SameParameter, SameRange, Transfert, UpdateEdge, UpdateFace, UpdateVertex
- **BRep_Curve3D** ← BRep_GCurve : Copy, Curve3D, D0, DynamicType, IsCurve3D · *statiques :* get_type_descriptor, get_type_name
- **BRep_CurveOn2Surfaces** ← BRep_CurveRepresentation : Continuity, Copy, D0, DynamicType, IsRegularity, Location2, Surface, Surface2 · *statiques :* get_type_descriptor, get_type_name
- **BRep_CurveOnClosedSurface** ← BRep_CurveOnSurface : Continuity, Copy, DynamicType, IsCurveOnClosedSurface, IsRegularity, Location2, PCurve2, SetUVPoints2, Surface2, UVPoints2, Update · *statiques :* get_type_descriptor, get_type_name
- **BRep_CurveOnSurface** ← BRep_GCurve : Copy, D0, DynamicType, IsCurveOnSurface, PCurve, SetUVPoints, Surface, UVPoints, Update · *statiques :* get_type_descriptor, get_type_name
- **BRep_CurveRepresentation** ← Standard_Transient : Continuity, Copy, Curve3D, DynamicType, IsCurve3D, IsCurveOnClosedSurface, IsCurveOnSurface, IsPolygon3D, IsPolygonOnClosedSurface, IsPolygonOnClosedTriangulation, IsPolygonOnSurface, IsPolygonOnTriangulation, IsRegularity, Location, Location2, PCurve, PCurve2, Polygon, Polygon2, Polygon3D, PolygonOnTriangulation, PolygonOnTriangulation2, Surface, Surface2, Triangulation · *statiques :* get_type_descriptor, get_type_name
- **BRep_GCurve** ← BRep_CurveRepresentation : D0, DynamicType, First, Last, Range, SetRange, Update · *statiques :* get_type_descriptor, get_type_name
- **BRep_ListOfCurveRepresentation** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BRep_ListOfPointRepresentation** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BRep_PointOnCurve** ← BRep_PointRepresentation : Curve, DynamicType, IsPointOnCurve · *statiques :* get_type_descriptor, get_type_name
- **BRep_PointOnCurveOnSurface** ← BRep_PointsOnSurface : DynamicType, IsPointOnCurveOnSurface, PCurve · *statiques :* get_type_descriptor, get_type_name
- **BRep_PointOnSurface** ← BRep_PointsOnSurface : DynamicType, IsPointOnSurface, Parameter2 · *statiques :* get_type_descriptor, get_type_name
- **BRep_PointRepresentation** ← Standard_Transient : Curve, DynamicType, IsPointOnCurve, IsPointOnCurveOnSurface, IsPointOnSurface, Location, PCurve, Parameter, Parameter2, Surface · *statiques :* get_type_descriptor, get_type_name
- **BRep_PointsOnSurface** ← BRep_PointRepresentation : DynamicType, Surface · *statiques :* get_type_descriptor, get_type_name
- **BRep_Polygon3D** ← BRep_CurveRepresentation : Copy, DynamicType, IsPolygon3D, Polygon3D · *statiques :* get_type_descriptor, get_type_name
- **BRep_PolygonOnClosedSurface** ← BRep_PolygonOnSurface : Copy, DynamicType, IsPolygonOnClosedSurface, Polygon2 · *statiques :* get_type_descriptor, get_type_name
- **BRep_PolygonOnClosedTriangulation** ← BRep_PolygonOnTriangulation : Copy, DynamicType, IsPolygonOnClosedTriangulation, PolygonOnTriangulation2 · *statiques :* get_type_descriptor, get_type_name
- **BRep_PolygonOnSurface** ← BRep_CurveRepresentation : Copy, DynamicType, IsPolygonOnSurface, Polygon, Surface · *statiques :* get_type_descriptor, get_type_name
- **BRep_PolygonOnTriangulation** ← BRep_CurveRepresentation : Copy, DynamicType, IsPolygonOnTriangulation, PolygonOnTriangulation, Triangulation · *statiques :* get_type_descriptor, get_type_name
- **BRep_TEdge** ← TopoDS_TEdge : ChangeCurves, Curves, Degenerated, DynamicType, EmptyCopy, SameParameter, SameRange, Tolerance, UpdateTolerance · *statiques :* get_type_descriptor, get_type_name
- **BRep_TFace** ← TopoDS_TFace : DynamicType, EmptyCopy, Location, NaturalRestriction, Surface, Tolerance, Triangulation · *statiques :* get_type_descriptor, get_type_name
- **BRep_TVertex** ← TopoDS_TVertex : ChangePoints, DynamicType, EmptyCopy, Pnt, Points, Tolerance, UpdateTolerance · *statiques :* get_type_descriptor, get_type_name
- **BRep_Tool** ★ · *statiques :* Continuity, Curve, CurveOnPlane, CurveOnSurface, Degenerated, HasContinuity, IsClosed, IsGeometric, MaxContinuity, MaxTolerance, NaturalRestriction, Parameter, Parameters, Pnt, Polygon3D, PolygonOnSurface, PolygonOnTriangulation, Range, SameParameter, SameRange, SetUVPoints, Surface, Tolerance, Triangulation, UVPoints

## BRepAdaptor

- **BRepAdaptor_Array1OfCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **BRepAdaptor_CompCurve** ← Adaptor3d_Curve (3 ctor) : BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Edge, Ellipse, FirstParameter, GetType, Hyperbola, Initialize, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, Parabola, Period, Resolution, Trim, Value, Wire
- **BRepAdaptor_Curve** ★ ← Adaptor3d_Curve (3 ctor) : BSpline, Bezier, Circle, Continuity, Curve, CurveOnSurface, D0, D1, D2, D3, DN, Degree, Edge, Ellipse, FirstParameter, GetType, Hyperbola, Initialize, Intervals, Is3DCurve, IsClosed, IsCurveOnSurface, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, OffsetCurve, Parabola, Period, Reset, Resolution, Tolerance, Trim, Trsf, Value
- **BRepAdaptor_Curve2d** ★ ← Geom2dAdaptor_Curve (2 ctor) : Edge, Face, Initialize
- **BRepAdaptor_HCompCurve** ← Adaptor3d_HCurve (2 ctor) : ChangeCurve, Curve, DynamicType, GetCurve, Set · *statiques :* get_type_descriptor, get_type_name
- **BRepAdaptor_HCurve** ← Adaptor3d_HCurve (2 ctor) : ChangeCurve, Curve, DynamicType, GetCurve, Set · *statiques :* get_type_descriptor, get_type_name
- **BRepAdaptor_HCurve2d** ← Adaptor2d_HCurve2d (2 ctor) : ChangeCurve2d, Curve2d, DynamicType, Set · *statiques :* get_type_descriptor, get_type_name
- **BRepAdaptor_HSurface** ← Adaptor3d_HSurface (2 ctor) : ChangeSurface, DynamicType, Set, Surface · *statiques :* get_type_descriptor, get_type_name
- **BRepAdaptor_Surface** ★ ← Adaptor3d_Surface (2 ctor) : AxeOfRevolution, BSpline, BasisCurve, BasisSurface, Bezier, ChangeSurface, Cone, Cylinder, D0, D1, D2, D3, DN, Direction, Face, FirstUParameter, FirstVParameter, GetType, Initialize, IsUClosed, IsUPeriodic, IsURational, IsVClosed, IsVPeriodic, IsVRational, LastUParameter, LastVParameter, NbUIntervals, NbUKnots, NbUPoles, NbVIntervals, NbVKnots, NbVPoles, OffsetValue, Plane, Sphere, Surface, Tolerance, Torus, Trsf, UContinuity, UDegree, UIntervals, UPeriod, UResolution, UTrim, VContinuity, VDegree, VIntervals, VPeriod, VResolution, VTrim, Value

## BRepAlgo

- **BRepAlgo_AsDes** ← Standard_Transient : Add, Ascendant, ChangeDescendant, Clear, Descendant, DynamicType, HasAscendant, HasCommonDescendant, HasDescendant, Remove, Replace · *statiques :* get_type_descriptor, get_type_name
- **BRepAlgo_BooleanOperation** ← BRepBuilderAPI_MakeShape : Builder, IsDeleted, Modified, Perform, PerformDS, Shape1, Shape2
- **BRepAlgo_CheckStatus** · *statiques :* BRepAlgo_NOK, BRepAlgo_OK
- **BRepAlgo_Common** ← BRepAlgo_BooleanOperation
- **BRepAlgo_Cut** ← BRepAlgo_BooleanOperation
- **BRepAlgo_FaceRestrictor** : Add, Clear, Current, Init, IsDone, More, Next, Perform
- **BRepAlgo_Fuse** ← BRepAlgo_BooleanOperation
- **BRepAlgo_Image** : Add, Bind, Clear, Compact, Filter, HasImage, Image, ImageFrom, IsImage, LastImage, Remove, Root, Roots, SetRoot
- **BRepAlgo_Loop** : AddConstEdge, AddConstEdges, AddEdge, CutEdge, GetVerticesForSubstitute, Init, NewEdges, NewFaces, NewWires, Perform, VerticesForSubstitute, WiresToFaces
- **BRepAlgo_NormalProjection** (2 ctor) : Add, Ancestor, Build, BuildWire, Compute3d, Couple, Generated, Init, IsDone, IsElementary, Projection, SetDefaultParams, SetLimit, SetMaxDistance, SetParams
- **BRepAlgo_Section** ← BRepAlgo_BooleanOperation (5 ctor) : Approximation, Build, ComputePCurveOn1, ComputePCurveOn2, HasAncestorFaceOn1, HasAncestorFaceOn2, Init1, Init2
- **BRepAlgo_Tool** · *statiques :* Deboucle3D

## BRepAlgoAPI

- **BRepAlgoAPI_Algo** ← BRepBuilderAPI_MakeShape : Shape
- **BRepAlgoAPI_BooleanOperation** ← BRepAlgoAPI_BuilderAlgo (2 ctor) : Build, Operation, SetOperation, SetTools, Shape1, Shape2, Tools
- **BRepAlgoAPI_BuilderAlgo** ← BRepAlgoAPI_Algo (2 ctor) : Arguments, Build, Builder, CheckInverted, DSFiller, Generated, Glue, HasDeleted, HasGenerated, HasHistory, HasModified, History, IsDeleted, Modified, NonDestructive, SectionEdges, SetArguments, SetCheckInverted, SetGlue, SetNonDestructive, SetToFillHistory, SimplifyResult
- **BRepAlgoAPI_Check** (3 ctor)
- **BRepAlgoAPI_Common** ★ ← BRepAlgoAPI_BooleanOperation (4 ctor)
- **BRepAlgoAPI_Cut** ★ ← BRepAlgoAPI_BooleanOperation (4 ctor)
- **BRepAlgoAPI_Defeaturing** ★ ← BRepAlgoAPI_Algo : AddFaceToRemove, AddFacesToRemove, Build, FacesToRemove, Generated, HasDeleted, HasGenerated, HasHistory, HasModified, History, InputShape, IsDeleted, Modified, SetShape, SetToFillHistory
- **BRepAlgoAPI_Fuse** ★ ← BRepAlgoAPI_BooleanOperation (4 ctor)
- **BRepAlgoAPI_Section** ★ ← BRepAlgoAPI_BooleanOperation (8 ctor) : Approximation, Build, ComputePCurveOn1, ComputePCurveOn2, HasAncestorFaceOn1, HasAncestorFaceOn2, Init1, Init2
- **BRepAlgoAPI_Splitter** ★ ← BRepAlgoAPI_BuilderAlgo (2 ctor) : Build, SetTools, Tools

## BRepApprox

- **BRepApprox_ApproxLine** ← Standard_Transient (2 ctor) : DynamicType, NbPnts, Point · *statiques :* get_type_descriptor, get_type_name
- **BRepApprox_BSpGradient_BFGSOfMyBSplGradientOfTheComputeLineOfApprox** ← math_BFGS : IsSolutionReached
- **BRepApprox_BSpParFunctionOfMyBSplGradientOfTheComputeLineOfApprox** ← math_MultipleVarFunctionWithGradient : CurveValue, DerivativeFunctionMatrix, Error, FirstConstraint, FunctionMatrix, Gradient, Index, LastConstraint, MaxError2d, MaxError3d, NbVariables, NewParameters, SetFirstLambda, SetLastLambda, Value, Values
- **BRepApprox_BSpParLeastSquareOfMyBSplGradientOfTheComputeLineOfApprox** (4 ctor) : BSplineValue, BezierValue, DerivativeFunctionMatrix, Distance, Error, ErrorGradient, FirstLambda, FunctionMatrix, IsDone, KIndex, LastLambda, Perform, Points, Poles
- **BRepApprox_Gradient_BFGSOfMyGradientOfTheComputeLineBezierOfApprox** ← math_BFGS : IsSolutionReached
- **BRepApprox_Gradient_BFGSOfMyGradientbisOfTheComputeLineOfApprox** ← math_BFGS : IsSolutionReached
- **BRepApprox_MyBSplGradientOfTheComputeLineOfApprox** (2 ctor) : AverageError, Error, IsDone, MaxError2d, MaxError3d, Value
- **BRepApprox_MyGradientOfTheComputeLineBezierOfApprox** : AverageError, Error, IsDone, MaxError2d, MaxError3d, Value
- **BRepApprox_MyGradientbisOfTheComputeLineOfApprox** : AverageError, Error, IsDone, MaxError2d, MaxError3d, Value
- **BRepApprox_ParFunctionOfMyGradientOfTheComputeLineBezierOfApprox** ← math_MultipleVarFunctionWithGradient : CurveValue, Error, FirstConstraint, Gradient, LastConstraint, MaxError2d, MaxError3d, NbVariables, NewParameters, Value, Values
- **BRepApprox_ParFunctionOfMyGradientbisOfTheComputeLineOfApprox** ← math_MultipleVarFunctionWithGradient : CurveValue, Error, FirstConstraint, Gradient, LastConstraint, MaxError2d, MaxError3d, NbVariables, NewParameters, Value, Values
- **BRepApprox_ParLeastSquareOfMyGradientOfTheComputeLineBezierOfApprox** (4 ctor) : BSplineValue, BezierValue, DerivativeFunctionMatrix, Distance, Error, ErrorGradient, FirstLambda, FunctionMatrix, IsDone, KIndex, LastLambda, Perform, Points, Poles
- **BRepApprox_ParLeastSquareOfMyGradientbisOfTheComputeLineOfApprox** (4 ctor) : BSplineValue, BezierValue, DerivativeFunctionMatrix, Distance, Error, ErrorGradient, FirstLambda, FunctionMatrix, IsDone, KIndex, LastLambda, Perform, Points, Poles
- **BRepApprox_SurfaceTool** · *statiques :* AxeOfRevolution, BSpline, BasisCurve, Bezier, Cone, Cylinder, D0, D1, D2, D3, DN, Direction, FirstUParameter, FirstVParameter, GetType, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, LastUParameter, LastVParameter, NbSamplesU, NbSamplesV, NbUIntervals, NbVIntervals, Plane, Sphere, Torus, UIntervals, UPeriod, UResolution, UTrim, VIntervals, VPeriod, VResolution, VTrim, Value
- **BRepApprox_TheComputeLineBezierOfApprox** (4 ctor) : ChangeValue, Error, Init, IsAllApproximated, IsToleranceReached, NbMultiCurves, Parameters, Parametrization, Perform, SetConstraints, SetDegrees, SetTolerances, SplineValue, Value
- **BRepApprox_TheComputeLineOfApprox** (4 ctor) : ChangeValue, Error, Init, Interpol, IsAllApproximated, IsToleranceReached, Parameters, Perform, SetConstraints, SetContinuity, SetDegrees, SetKnots, SetKnotsAndMultiplicities, SetParameters, SetPeriodic, SetTolerances, Value
- **BRepApprox_TheFunctionOfTheInt2SOfThePrmPrmSvSurfacesOfApprox** ← math_FunctionSetWithDerivatives : AuxillarSurface1, AuxillarSurface2, ComputeParameters, Derivatives, Direction, DirectionOnS1, DirectionOnS2, IsTangent, NbEquations, NbVariables, Point, Root, Value, Values
- **BRepApprox_TheImpPrmSvSurfacesOfApprox** ← ApproxInt_SvSurfaces (2 ctor) : Compute, FillInitialVectorOfSolution, Pnt, SeekPoint, Tangency, TangencyOnSurf1, TangencyOnSurf2
- **BRepApprox_TheInt2SOfThePrmPrmSvSurfacesOfApprox** (2 ctor) : ChangePoint, Direction, DirectionOnS1, DirectionOnS2, Function, IsDone, IsEmpty, IsTangent, Perform, Point
- **BRepApprox_TheMultiLineOfApprox** (3 ctor) : Dump, FirstPoint, LastPoint, MakeMLBetween, MakeMLOneMorePoint, NbP2d, NbP3d, Tangency, Value, WhatStatus
- **BRepApprox_TheMultiLineToolOfApprox** · *statiques :* Curvature, Dump, FirstPoint, LastPoint, MakeMLBetween, MakeMLOneMorePoint, NbP2d, NbP3d, Tangency, Value, WhatStatus
- **BRepApprox_ThePrmPrmSvSurfacesOfApprox** ← ApproxInt_SvSurfaces : Compute, Pnt, SeekPoint, Tangency, TangencyOnSurf1, TangencyOnSurf2
- **BRepApprox_TheZerImpFuncOfTheImpPrmSvSurfacesOfApprox** ← math_FunctionSetWithDerivatives (3 ctor) : Derivatives, Direction2d, Direction3d, ISurface, IsTangent, NbEquations, NbVariables, PSurface, Point, Root, Set, SetImplicitSurface, Tolerance, Value, Values

## BRepBlend

- **BRepBlend_AppFunc** ← BRepBlend_AppFuncRoot : DynamicType, Point, Vec · *statiques :* get_type_descriptor, get_type_name
- **BRepBlend_AppFuncRoot** ← Approx_SweepFunction : BarycentreOfSurf, D0, D1, D2, DynamicType, GetMinimalWeight, GetTolerance, Intervals, IsRational, Knots, MaximalSection, Mults, Nb2dCurves, NbIntervals, Point, Resolution, SectionShape, SetInterval, SetTolerance, Vec · *statiques :* get_type_descriptor, get_type_name
- **BRepBlend_AppFuncRst** ← BRepBlend_AppFuncRoot : DynamicType, Point, Vec · *statiques :* get_type_descriptor, get_type_name
- **BRepBlend_AppFuncRstRst** ← BRepBlend_AppFuncRoot : DynamicType, Point, Vec · *statiques :* get_type_descriptor, get_type_name
- **BRepBlend_AppSurf** ← AppBlend_Approx (2 ctor) : Continuity, CriteriumWeight, Curve2d, Curve2dPoles, Curves2dDegree, Curves2dKnots, Curves2dMults, Curves2dShape, Init, IsDone, NbCurves2d, ParType, Perform, PerformSmoothing, SetContinuity, SetCriteriumWeight, SetParType, SurfPoles, SurfShape, SurfUKnots, SurfUMults, SurfVKnots, SurfVMults, SurfWeights, Surface, TolCurveOnSurf, TolReached, UDegree, VDegree
- **BRepBlend_AppSurface** ← AppBlend_Approx : Curve2d, Curve2dPoles, Curves2dDegree, Curves2dKnots, Curves2dMults, Curves2dShape, Dump, IsDone, Max2dError, MaxErrorOnSurf, NbCurves2d, SurfPoles, SurfShape, SurfUKnots, SurfUMults, SurfVKnots, SurfVMults, SurfWeights, Surface, TolCurveOnSurf, TolReached, UDegree, VDegree
- **BRepBlend_BlendTool** · *statiques :* Bounds, CurveOnSurf, Inters, NbSamplesU, NbSamplesV, Parameter, Project, SingularOnUMax, SingularOnUMin, SingularOnVMax, SingularOnVMin, Tolerance
- **BRepBlend_CSWalking** : Complete, IsDone, Line, Perform
- **BRepBlend_CurvPointRadInv** ← Blend_CurvPointFuncInv : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, Set, Value, Values
- **BRepBlend_Extremity** (4 ctor) : AddArc, HasTangent, IsVertex, NbPointOnRst, Parameter, ParameterOnGuide, Parameters, PointOnRst, SetTangent, SetValue, SetVertex, Tangent, Tolerance, Value, Vertex
- **BRepBlend_HCurve2dTool** · *statiques :* BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, LastParameter, Line, NbIntervals, NbSamples, Parabola, Period, Resolution, Value
- **BRepBlend_HCurveTool** · *statiques :* BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, LastParameter, Line, NbIntervals, NbSamples, Parabola, Period, Resolution, Value
- **BRepBlend_Line** ← Standard_Transient : Append, Clear, DynamicType, EndPointOnFirst, EndPointOnSecond, InsertBefore, NbPoints, Point, Prepend, Remove, Set, SetEndPoints, SetStartPoints, StartPointOnFirst, StartPointOnSecond, TransitionOnS, TransitionOnS1, TransitionOnS2 · *statiques :* get_type_descriptor, get_type_name
- **BRepBlend_PointOnRst** (2 ctor) : Arc, ParameterOnArc, SetArc, TransitionOnArc, TransitionOnLine
- **BRepBlend_RstRstConstRad** ← Blend_RstRstFunction : CenterCircleRst1Rst2, Decroch, Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, NbVariables, ParameterOnRst1, ParameterOnRst2, Pnt2dOnRst1, Pnt2dOnRst2, PointOnRst1, PointOnRst2, Resolution, Section, Set, Tangent2dOnRst1, Tangent2dOnRst2, TangentOnRst1, TangentOnRst2, Value, Values
- **BRepBlend_RstRstEvolRad** ← Blend_RstRstFunction : CenterCircleRst1Rst2, Decroch, Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, NbVariables, ParameterOnRst1, ParameterOnRst2, Pnt2dOnRst1, Pnt2dOnRst2, PointOnRst1, PointOnRst2, Resolution, Section, Set, Tangent2dOnRst1, Tangent2dOnRst2, TangentOnRst1, TangentOnRst2, Value, Values
- **BRepBlend_RstRstLineBuilder** : Complete, Decroch1End, Decroch1Start, Decroch2End, Decroch2Start, IsDone, Line, Perform, PerformFirstSection
- **BRepBlend_SurfCurvConstRadInv** ← Blend_SurfCurvFuncInv : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, Set, Value, Values
- **BRepBlend_SurfCurvEvolRadInv** ← Blend_SurfCurvFuncInv : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, Set, Value, Values
- **BRepBlend_SurfPointConstRadInv** ← Blend_SurfPointFuncInv : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, Set, Value, Values
- **BRepBlend_SurfPointEvolRadInv** ← Blend_SurfPointFuncInv : Derivatives, GetBounds, GetTolerance, IsSolution, NbEquations, Set, Value, Values
- **BRepBlend_SurfRstConstRad** ← Blend_SurfRstFunction : Decroch, Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, NbVariables, ParameterOnRst, Pnt2dOnRst, Pnt2dOnS, PointOnRst, PointOnS, Resolution, Section, Set, Tangent2dOnRst, Tangent2dOnS, TangentOnRst, TangentOnS, Value, Values
- **BRepBlend_SurfRstEvolRad** ← Blend_SurfRstFunction : Decroch, Derivatives, GetBounds, GetMinimalDistance, GetMinimalWeight, GetSectionSize, GetShape, GetTolerance, Intervals, IsRational, IsSolution, IsTangencyPoint, Knots, Mults, NbEquations, NbIntervals, NbVariables, ParameterOnRst, Pnt2dOnRst, Pnt2dOnS, PointOnRst, PointOnS, Resolution, Section, Set, Tangent2dOnRst, Tangent2dOnS, TangentOnRst, TangentOnS, Value, Values
- **BRepBlend_SurfRstLineBuilder** : ArcToRecadre, Complete, DecrochEnd, DecrochStart, IsDone, Line, Perform, PerformFirstSection
- **BRepBlend_Walking** : AddSingularPoint, Check, Check2d, ClassificationOnS1, ClassificationOnS2, Complete, Continu, IsDone, Line, Perform, PerformFirstSection, SetDomainsToRecadre, TwistOnS1, TwistOnS2

## BRepBuilderAPI

- **BRepBuilderAPI_BndBoxTreeSelector**
- **BRepBuilderAPI_Collect** : Add, AddGenerated, AddModif, Filter, Generated, Modification
- **BRepBuilderAPI_Command** : Check, IsDone
- **BRepBuilderAPI_Copy** ★ ← BRepBuilderAPI_ModifyShape (2 ctor) : Perform
- **BRepBuilderAPI_EdgeError** · *statiques :* BRepBuilderAPI_DifferentPointsOnClosedCurve, BRepBuilderAPI_DifferentsPointAndParameter, BRepBuilderAPI_EdgeDone, BRepBuilderAPI_LineThroughIdenticPoints, BRepBuilderAPI_ParameterOutOfRange, BRepBuilderAPI_PointProjectionFailed, BRepBuilderAPI_PointWithInfiniteParameter
- **BRepBuilderAPI_FaceError** · *statiques :* BRepBuilderAPI_CurveProjectionFailed, BRepBuilderAPI_FaceDone, BRepBuilderAPI_NoFace, BRepBuilderAPI_NotPlanar, BRepBuilderAPI_ParametersOutOfRange
- **BRepBuilderAPI_FastSewing** ← Standard_Transient : Add, DynamicType, GetResult, GetStatuses, GetTolerance, Perform, SetTolerance · *statiques :* get_type_descriptor, get_type_name
- **BRepBuilderAPI_FindPlane** (2 ctor) : Found, Init, Plane
- **BRepBuilderAPI_GTransform** ★ ← BRepBuilderAPI_ModifyShape (2 ctor) : Modified, ModifiedShape, Perform
- **BRepBuilderAPI_MakeEdge** ★ ← BRepBuilderAPI_MakeShape (35 ctor) : Edge, Error, Init, IsDone, Vertex1, Vertex2
- **BRepBuilderAPI_MakeEdge2d** ← BRepBuilderAPI_MakeShape (28 ctor) : Edge, Error, Init, IsDone, Vertex1, Vertex2
- **BRepBuilderAPI_MakeFace** ★ ← BRepBuilderAPI_MakeShape (22 ctor) : Add, Error, Face, Init, IsDone
- **BRepBuilderAPI_MakePolygon** ★ ← BRepBuilderAPI_MakeShape (7 ctor) : Add, Added, Close, Edge, FirstVertex, IsDone, LastVertex, Wire
- **BRepBuilderAPI_MakeShape** ← BRepBuilderAPI_Command : Build, Generated, IsDeleted, Modified, Shape
- **BRepBuilderAPI_MakeShell** ← BRepBuilderAPI_MakeShape (3 ctor) : Error, Init, IsDone, Shell
- **BRepBuilderAPI_MakeSolid** ← BRepBuilderAPI_MakeShape (7 ctor) : Add, IsDeleted, IsDone, Solid
- **BRepBuilderAPI_MakeVertex** ← BRepBuilderAPI_MakeShape : Vertex
- **BRepBuilderAPI_MakeWire** ★ ← BRepBuilderAPI_MakeShape (7 ctor) : Add, Edge, Error, IsDone, Vertex, Wire
- **BRepBuilderAPI_ModifyShape** ← BRepBuilderAPI_MakeShape : Modified, ModifiedShape
- **BRepBuilderAPI_NurbsConvert** ★ ← BRepBuilderAPI_ModifyShape (2 ctor) : Modified, ModifiedShape, Perform
- **BRepBuilderAPI_PipeError** · *statiques :* BRepBuilderAPI_ImpossibleContact, BRepBuilderAPI_PipeDone, BRepBuilderAPI_PipeNotDone, BRepBuilderAPI_PlaneNotIntersectGuide
- **BRepBuilderAPI_Sewing** ← Standard_Transient : Add, ContigousEdge, ContigousEdgeCouple, DegeneratedShape, DeletedFace, Dump, DynamicType, FaceMode, FloatingEdgesMode, FreeEdge, GetContext, Init, IsDegenerated, IsModified, IsModifiedSubShape, IsSectionBound, Load, LocalTolerancesMode, MaxTolerance, MinTolerance, Modified, ModifiedSubShape, MultipleEdge, NbContigousEdges, NbDegeneratedShapes, NbDeletedFaces, NbFreeEdges, NbMultipleEdges, NonManifoldMode, Perform, SameParameterMode, SectionToBoundary, SetContext, SetFaceMode, SetFloatingEdgesMode, SetLocalTolerancesMode, SetMaxTolerance, SetMinTolerance, SetNonManifoldMode, SetSameParameterMode, SetTolerance, SewedShape, Tolerance, WhichFace · *statiques :* get_type_descriptor, get_type_name
- **BRepBuilderAPI_ShapeModification** · *statiques :* BRepBuilderAPI_BoundaryModified, BRepBuilderAPI_Deleted, BRepBuilderAPI_Merged, BRepBuilderAPI_Preserved, BRepBuilderAPI_Trimmed
- **BRepBuilderAPI_ShellError** · *statiques :* BRepBuilderAPI_DisconnectedShell, BRepBuilderAPI_EmptyShell, BRepBuilderAPI_ShellDone, BRepBuilderAPI_ShellParametersOutOfRange
- **BRepBuilderAPI_Transform** ★ ← BRepBuilderAPI_ModifyShape (2 ctor) : Modified, ModifiedShape, Perform
- **BRepBuilderAPI_TransitionMode** · *statiques :* BRepBuilderAPI_RightCorner, BRepBuilderAPI_RoundCorner, BRepBuilderAPI_Transformed
- **BRepBuilderAPI_VertexInspector**
- **BRepBuilderAPI_WireError** · *statiques :* BRepBuilderAPI_DisconnectedWire, BRepBuilderAPI_EmptyWire, BRepBuilderAPI_NonManifoldWire, BRepBuilderAPI_WireDone

## BRepCheck

- **BRepCheck_Analyzer** ★ : Init, IsValid, Result
- **BRepCheck_Edge** ← BRepCheck_Result : Blind, CheckPolygonOnTriangulation, DynamicType, GeometricControls, InContext, Minimum, SetStatus, Tolerance · *statiques :* get_type_descriptor, get_type_name
- **BRepCheck_Face** ← BRepCheck_Result : Blind, ClassifyWires, DynamicType, GeometricControls, InContext, IntersectWires, IsUnorientable, Minimum, OrientationOfWires, SetStatus, SetUnorientable · *statiques :* get_type_descriptor, get_type_name
- **BRepCheck_ListOfStatus** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BRepCheck_Result** ← Standard_Transient : Blind, ContextualShape, DynamicType, InContext, Init, InitContextIterator, IsBlind, IsMinimum, Minimum, MoreShapeInContext, NextShapeInContext, SetFailStatus, Status, StatusOnShape · *statiques :* get_type_descriptor, get_type_name
- **BRepCheck_Shell** ← BRepCheck_Result : Blind, Closed, DynamicType, InContext, IsUnorientable, Minimum, NbConnectedSet, Orientation, SetUnorientable · *statiques :* get_type_descriptor, get_type_name
- **BRepCheck_Solid** ← BRepCheck_Result : Blind, DynamicType, InContext, Minimum · *statiques :* get_type_descriptor, get_type_name
- **BRepCheck_Status** · *statiques :* BRepCheck_BadOrientation, BRepCheck_BadOrientationOfSubshape, BRepCheck_CheckFail, BRepCheck_EmptyShell, BRepCheck_EmptyWire, BRepCheck_EnclosedRegion, BRepCheck_FreeEdge, BRepCheck_IntersectingWires, BRepCheck_Invalid3DCurve, BRepCheck_InvalidCurveOnClosedSurface, BRepCheck_InvalidCurveOnSurface, BRepCheck_InvalidDegeneratedFlag, BRepCheck_InvalidImbricationOfShells, BRepCheck_InvalidImbricationOfWires, BRepCheck_InvalidMultiConnexity, BRepCheck_InvalidPointOnCurve, BRepCheck_InvalidPointOnCurveOnSurface, BRepCheck_InvalidPointOnSurface, BRepCheck_InvalidPolygonOnTriangulation, BRepCheck_InvalidRange, BRepCheck_InvalidSameParameterFlag, BRepCheck_InvalidSameRangeFlag, BRepCheck_InvalidToleranceValue, BRepCheck_InvalidWire, BRepCheck_Multiple3DCurve, BRepCheck_No3DCurve, BRepCheck_NoCurveOnSurface, BRepCheck_NoError, BRepCheck_NoSurface, BRepCheck_NotClosed, BRepCheck_NotConnected, BRepCheck_RedundantEdge, BRepCheck_RedundantFace, BRepCheck_RedundantWire, BRepCheck_SelfIntersectingWire, BRepCheck_SubshapeNotInShape, BRepCheck_UnorientableShape
- **BRepCheck_Vertex** ← BRepCheck_Result : Blind, DynamicType, InContext, Minimum, Tolerance · *statiques :* get_type_descriptor, get_type_name
- **BRepCheck_Wire** ← BRepCheck_Result : Blind, Closed, Closed2d, DynamicType, GeometricControls, InContext, Minimum, Orientation, SelfIntersect, SetStatus · *statiques :* get_type_descriptor, get_type_name

## BRepClass

- **BRepClass_Edge** (2 ctor) : Edge, Face
- **BRepClass_FClass2dOfFClassifier** : ClosestIntersection, Compare, Intersector, IsHeadOrEnd, Parameter, Reset, State
- **BRepClass_FClassifier** (2 ctor) : Edge, EdgeParameter, NoWires, Perform, Position, Rejected, State
- **BRepClass_FaceClassifier** ← BRepClass_FClassifier (4 ctor) : Perform
- **BRepClass_FaceExplorer** : CheckPoint, CurrentEdge, InitEdges, InitWires, MoreEdges, MoreWires, NextEdge, NextWire, OtherSegment, Reject, RejectEdge, RejectWire, Segment
- **BRepClass_FacePassiveClassifier** : ClosestIntersection, Compare, Intersector, IsHeadOrEnd, Parameter, Reset, State
- **BRepClass_Intersector**

## BRepClass3d

- **BRepClass3d_BndBoxTreeSelectorLine**
- **BRepClass3d_BndBoxTreeSelectorPoint**
- **BRepClass3d_Intersector3d** : Face, HasAPoint, IsDone, Perform, Pnt, State, Transition, UParameter, VParameter, WParameter
- **BRepClass3d_SClassifier** (2 ctor) : Face, IsOnAFace, Perform, PerformInfinitePoint, Rejected, State
- **BRepClass3d_SolidClassifier** ★ ← BRepClass3d_SClassifier (3 ctor) : Destroy, Load, Perform, PerformInfinitePoint
- **BRepClass3d_SolidExplorer** (2 ctor) : Box, CurrentFace, CurrentShell, Destroy, DumpSegment, GetFaceSegmentIndex, GetMapEV, GetShape, InitFace, InitShape, InitShell, Intersector, MoreFace, MoreShell, NextFace, NextShell, OtherSegment, PointInTheFace, Reject, RejectFace, RejectShell, Segment · *statiques :* FindAPointInTheFace
- **BRepClass3d_SolidPassiveClassifier** : Compare, HasIntersection, Intersector, Parameter, Reset, State

## BRepExtrema

- **BRepExtrema_DistShapeShape** (3 ctor) : Dump, InnerSolution, IsDone, LoadS1, LoadS2, NbSolution, ParOnEdgeS1, ParOnEdgeS2, ParOnFaceS1, ParOnFaceS2, Perform, PointOnShape1, PointOnShape2, SetAlgo, SetDeflection, SetFlag, SupportOnShape1, SupportOnShape2, SupportTypeShape1, SupportTypeShape2, Value
- **BRepExtrema_DistanceSS** (2 ctor) : DistValue, IsDone, Seq1Value, Seq2Value, SetAlgo, SetFlag
- **BRepExtrema_ExtCC** (2 ctor) : Initialize, IsDone, IsParallel, NbExt, ParameterOnE1, ParameterOnE2, Perform, PointOnE1, PointOnE2, SquareDistance, TrimmedSquareDistances
- **BRepExtrema_ExtCF** (2 ctor) : Initialize, IsDone, IsParallel, NbExt, ParameterOnEdge, ParameterOnFace, Perform, PointOnEdge, PointOnFace, SquareDistance
- **BRepExtrema_ExtFF** (2 ctor) : Initialize, IsDone, IsParallel, NbExt, ParameterOnFace1, ParameterOnFace2, Perform, PointOnFace1, PointOnFace2, SquareDistance
- **BRepExtrema_ExtPC** (2 ctor) : Initialize, IsDone, IsMin, NbExt, Parameter, Perform, Point, SquareDistance, TrimmedSquareDistances
- **BRepExtrema_ExtPF** (2 ctor) : Initialize, IsDone, NbExt, Parameter, Perform, Point, SetAlgo, SetFlag, SquareDistance
- **BRepExtrema_OverlapTool** (2 ctor)
- **BRepExtrema_Poly** · *statiques :* Distance
- **BRepExtrema_SelfIntersection** (2 ctor)
- **BRepExtrema_ShapeProximity** (2 ctor) : ElementSet1, ElementSet2, GetSubShape1, GetSubShape2, IsDone, LoadShape1, LoadShape2, OverlapSubShapes1, OverlapSubShapes2, Perform, SetTolerance, Tolerance
- **BRepExtrema_SolutionElem** (4 ctor) : Dist, Edge, EdgeParameter, Face, FaceParameter, Point, SupportKind, Vertex
- **BRepExtrema_SupportType** · *statiques :* BRepExtrema_IsInFace, BRepExtrema_IsOnEdge, BRepExtrema_IsVertex
- **BRepExtrema_TriangleSet** (2 ctor)
- **BRepExtrema_UnCompatibleShape** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name

## BRepFeat

- **BRepFeat_Builder**
- **BRepFeat_Form** ← BRepBuilderAPI_MakeShape : BarycCurve, BasisShapeValid, CurrentStatusError, Curves, FirstShape, Generated, GeneratedShapeValid, GluedFacesValid, IsDeleted, LastShape, Modified, NewEdges, PerfSelectionValid, ShapeFromValid, ShapeUntilValid, SketchFaceValid, TgtEdges
- **BRepFeat_Gluer** ← BRepBuilderAPI_MakeShape (2 ctor) : BasisShape, Bind, Build, GluedShape, Init, IsDeleted, Modified, OpeType
- **BRepFeat_MakeCylindricalHole**
- **BRepFeat_MakeDPrism** ← BRepFeat_Form (2 ctor) : Add, BarycCurve, BossEdges, Curves, Init, LatEdges, Perform, PerformFromEnd, PerformThruAll, PerformUntilEnd, PerformUntilHeight, TopEdges
- **BRepFeat_MakePipe** ← BRepFeat_Form (2 ctor) : Add, BarycCurve, Curves, Init, Perform
- **BRepFeat_MakePrism** ← BRepFeat_Form (2 ctor) : Add, BarycCurve, Curves, Init, Perform, PerformFromEnd, PerformThruAll, PerformUntilEnd, PerformUntilHeight
- **BRepFeat_MakeRevol** ← BRepFeat_Form (2 ctor) : Add, BarycCurve, Curves, Init, Perform, PerformThruAll, PerformUntilAngle
- **BRepFeat_MakeRevolutionForm** ← BRepFeat_RibSlot (2 ctor) : Add, Init, Perform, Propagate
- **BRepFeat_PerfSelection** · *statiques :* BRepFeat_NoSelection, BRepFeat_SelectionFU, BRepFeat_SelectionSh, BRepFeat_SelectionShU, BRepFeat_SelectionU
- **BRepFeat_RibSlot** ← BRepBuilderAPI_MakeShape : CurrentStatusError, FacesForDraft, FirstShape, Generated, IsDeleted, LastShape, Modified, NewEdges, TgtEdges · *statiques :* ChoiceOfFaces, IntPar
- **BRepFeat_SplitShape** ← BRepBuilderAPI_MakeShape (2 ctor) : Add, Build, DirectLeft, Init, IsDeleted, Left, Modified, SetCheckInterior
- **BRepFeat_Status** · *statiques :* BRepFeat_HoleTooLong, BRepFeat_InvalidPlacement, BRepFeat_NoError
- **BRepFeat_StatusError** · *statiques :* BRepFeat_BadDirect, BRepFeat_BadIntersect, BRepFeat_EmptyBaryCurve, BRepFeat_EmptyCutResult, BRepFeat_FalseSide, BRepFeat_IncDirection, BRepFeat_IncParameter, BRepFeat_IncSlidFace, BRepFeat_IncTypes, BRepFeat_IntervalOverlap, BRepFeat_InvFirstShape, BRepFeat_InvOption, BRepFeat_InvShape, BRepFeat_LocOpeInvNotDone, BRepFeat_LocOpeNotDone, BRepFeat_NoExtFace, BRepFeat_NoFaceProf, BRepFeat_NoGluer, BRepFeat_NoIntersectF, BRepFeat_NoIntersectU, BRepFeat_NoParts, BRepFeat_NoProjPt, BRepFeat_NotInitialized, BRepFeat_NotYetImplemented, BRepFeat_NullRealTool, BRepFeat_NullToolF, BRepFeat_NullToolU, BRepFeat_OK

## BRepFill

- **BRepFill_ACRLaw** ← BRepFill_LocationLaw : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_AdvancedEvolved** : IsDone, Perform, SetParallelMode, SetTemporaryDirectory, Shape
- **BRepFill_ApproxSeewing** (2 ctor) : Curve, CurveOnF1, CurveOnF2, IsDone, Perform
- **BRepFill_CompatibleWires** (2 ctor) : Generated, GeneratedShapes, Init, IsDegeneratedFirstSection, IsDegeneratedLastSection, IsDone, Perform, SetPercent, Shape
- **BRepFill_ComputeCLine** (2 ctor) : Error, IsAllApproximated, IsToleranceReached, NbMultiCurves, Parameters, Perform, SetConstraints, SetDegrees, SetInvOrder, SetMaxSegments, SetTolerances, Value
- **BRepFill_CurveConstraint** ← GeomPlate_CurveConstraint (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_Draft** : Generated, IsDone, Perform, SetDraft, SetOptions, Shape, Shell
- **BRepFill_DraftLaw** ← BRepFill_Edge3DLaw : CleanLaw, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_Edge3DLaw** ← BRepFill_LocationLaw : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_EdgeFaceAndOrder** (2 ctor)
- **BRepFill_EdgeOnSurfLaw** ← BRepFill_LocationLaw : DynamicType, HasResult · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_Evolved** (3 ctor) : Bottom, GeneratedShapes, IsDone, JoinType, Perform, Shape, Top
- **BRepFill_FaceAndOrder** (2 ctor)
- **BRepFill_Filling** : Add, Build, Face, G0Error, G1Error, G2Error, Generated, IsDone, LoadInitSurface, SetApproxParam, SetConstrParam, SetResolParam
- **BRepFill_Generator** : AddWire, Generated, GeneratedShapes, Perform, Shell
- **BRepFill_ListOfOffsetWire** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BRepFill_LocationLaw** ← Standard_Transient : Abscissa, CurvilinearBounds, D0, DeleteTransform, DynamicType, Edge, GetStatus, Holes, IsClosed, IsG1, Law, NbHoles, NbLaw, Parameter, PerformVertex, TransformInCompatibleLaw, TransformInG0Law, Vertex, Wire · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_MultiLine** ← AppCont_Function (2 ctor) : Continuity, Curves, D1, FirstParameter, IsParticularCase, LastParameter, Value, Value3dOnF1OnF2, ValueOnF1, ValueOnF2
- **BRepFill_NSections** ← BRepFill_SectionLaw (2 ctor) : ConcatenedLaw, Continuity, D0, DynamicType, IsConstant, IsVertex, Vertex, VertexTol · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_OffsetAncestors** (2 ctor) : Ancestor, HasAncestor, IsDone, Perform
- **BRepFill_OffsetWire** (2 ctor) : GeneratedShapes, Init, IsDone, JoinType, Perform, PerformWithBiLo, Shape, Spine
- **BRepFill_Pipe** (2 ctor) : Edge, ErrorOnSurface, Face, FirstShape, Generated, LastShape, Perform, PipeLine, Profile, Section, Shape, Spine
- **BRepFill_PipeShell** ← Standard_Transient : Add, Build, DeleteProfile, DynamicType, ErrorOnSurface, FirstShape, Generated, GetStatus, IsReady, LastShape, MakeSolid, Profiles, Set, SetDiscrete, SetForceApproxC1, SetLaw, SetMaxDegree, SetMaxSegments, SetTolerance, SetTransition, Shape, Simulate, Spine · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_Section** (2 ctor) : IsLaw, IsPunctual, ModifiedShape, OriginalShape, Set, Vertex, Wire, WithContact, WithCorrection
- **BRepFill_SectionLaw** ← Standard_Transient : ConcatenedLaw, Continuity, CurrentEdge, D0, DynamicType, IndexOfEdge, Init, IsConstant, IsDone, IsUClosed, IsVClosed, IsVertex, Law, NbLaw, Vertex, VertexTol · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_SectionPlacement** (2 ctor) : AbscissaOnPath, Transformation
- **BRepFill_ShapeLaw** ← BRepFill_SectionLaw (3 ctor) : ConcatenedLaw, Continuity, D0, DynamicType, Edge, IsConstant, IsVertex, Vertex, VertexTol · *statiques :* get_type_descriptor, get_type_name
- **BRepFill_Sweep** : Build, ErrorOnSurface, InterFaces, IsDone, Sections, SetAngularControl, SetBounds, SetForceApproxC1, SetTolerance, Shape, SubShape, Tape
- **BRepFill_TransitionStyle** · *statiques :* BRepFill_Modified, BRepFill_Right, BRepFill_Round
- **BRepFill_TrimEdgeTool** (2 ctor) : AddOrConfuse, IntersectWith, IsInside
- **BRepFill_TrimShellCorner** : AddBounds, AddUEdges, AddVEdges, HasSection, IsDone, Modified, Perform
- **BRepFill_TrimSurfaceTool** : IntersectWith, IsOnFace, ProjOn, Project
- **BRepFill_TypeOfContact** · *statiques :* BRepFill_Contact, BRepFill_ContactOnBorder, BRepFill_NoContact

## BRepFilletAPI

- **BRepFilletAPI_LocalOperation** ← BRepBuilderAPI_MakeShape : Abscissa, Add, Closed, ClosedAndTangent, Contour, Edge, FirstVertex, LastVertex, Length, NbContours, NbEdges, NbSurf, RelativeAbscissa, Remove, Reset, ResetContour, Sect, Simulate
- **BRepFilletAPI_MakeChamfer** ★ ← BRepFilletAPI_LocalOperation : Abscissa, Add, AddDA, Build, Builder, Closed, ClosedAndTangent, Contour, Dists, Edge, FirstVertex, Generated, GetDist, GetDistAngle, IsDeleted, IsDistanceAngle, IsSymetric, IsTwoDistances, LastVertex, Length, Modified, NbContours, NbEdges, NbSurf, RelativeAbscissa, Remove, Reset, ResetContour, Sect, SetDist, SetDistAngle, SetDists, SetMode, Simulate
- **BRepFilletAPI_MakeFillet** ★ ← BRepFilletAPI_LocalOperation : Abscissa, Add, BadShape, Build, Builder, Closed, ClosedAndTangent, ComputedSurface, Contour, Edge, FaultyContour, FaultyVertex, FirstVertex, Generated, GetBounds, GetFilletShape, GetLaw, HasResult, IsConstant, IsDeleted, LastVertex, Length, Modified, NbComputedSurfaces, NbContours, NbEdges, NbFaultyContours, NbFaultyVertices, NbSurf, NbSurfaces, NewFaces, Radius, RelativeAbscissa, Remove, Reset, ResetContour, Sect, SetContinuity, SetFilletShape, SetLaw, SetParams, SetRadius, Simulate, StripeStatus
- **BRepFilletAPI_MakeFillet2d** ← BRepBuilderAPI_MakeShape (2 ctor) : AddChamfer, AddFillet, BasisEdge, Build, ChamferEdges, DescendantEdge, FilletEdges, HasDescendant, Init, IsModified, Modified, ModifyChamfer, ModifyFillet, NbChamfer, NbCurves, NbFillet, NewEdges, RemoveChamfer, RemoveFillet, Status

## BRepGProp

- **BRepGProp_Cinert** ← GProp_GProps (2 ctor) : Perform, SetLocation
- **BRepGProp_Domain** (2 ctor) : Init, More, Next, Value
- **BRepGProp_EdgeTool** · *statiques :* D1, FirstParameter, IntegrationOrder, Intervals, LastParameter, NbIntervals, Value
- **BRepGProp_Face** ★ (2 ctor) : Bounds, D12d, FirstParameter, GetFace, GetTKnots, GetUKnots, IntegrationOrder, LIntOrder, LIntSubs, LKnots, LastParameter, Load, NaturalRestriction, Normal, SIntOrder, SUIntSubs, SVIntSubs, UIntegrationOrder, UKnots, VIntegrationOrder, VKnots, Value2d
- **BRepGProp_MeshCinert** ← GProp_GProps : Perform, SetLocation · *statiques :* PreparePolygon
- **BRepGProp_MeshProps** ← GProp_GProps : GetMeshObjType, Perform, SetLocation · *statiques :* CalculateProps
- **BRepGProp_Sinert** ← GProp_GProps (5 ctor) : GetEpsilon, Perform, SetLocation
- **BRepGProp_TFunction** ← math_Function : AbsolutError, ErrorReached, GetStateNumber, Init, SetNbKronrodPoints, SetTolerance, SetValueType, Value
- **BRepGProp_UFunction** ← math_Function : SetVParam, SetValueType, Value
- **BRepGProp_Vinert** ← GProp_GProps (13 ctor) : GetEpsilon, Perform, SetLocation

## BRepIntCurveSurface

- **BRepIntCurveSurface_Inter** : Face, Init, Load, More, Next, Pnt, Point, State, Transition, U, V, W

## BRepLib

- **BRepLib_CheckCurveOnSurface** (2 ctor) : Curve, ErrorStatus, Init, IsDone, MaxDistance, MaxParameter, PCurve, PCurve2, Perform, Range, Surface
- **BRepLib_Command** : Check, IsDone
- **BRepLib_EdgeError** · *statiques :* BRepLib_DifferentPointsOnClosedCurve, BRepLib_DifferentsPointAndParameter, BRepLib_EdgeDone, BRepLib_LineThroughIdenticPoints, BRepLib_ParameterOutOfRange, BRepLib_PointProjectionFailed, BRepLib_PointWithInfiniteParameter
- **BRepLib_FaceError** · *statiques :* BRepLib_CurveProjectionFailed, BRepLib_FaceDone, BRepLib_NoFace, BRepLib_NotPlanar, BRepLib_ParametersOutOfRange
- **BRepLib_FindSurface** (2 ctor) : Existed, Found, Init, Location, Surface, Tolerance, ToleranceReached
- **BRepLib_FuseEdges** : AvoidEdges, Edges, Faces, NbVertices, Perform, ResultEdges, SetConcatBSpl, Shape
- **BRepLib_MakeEdge** ← BRepLib_MakeShape (35 ctor) : Edge, Error, Init, Vertex1, Vertex2
- **BRepLib_MakeEdge2d** ← BRepLib_MakeShape (28 ctor) : Edge, Error, Init, Vertex1, Vertex2
- **BRepLib_MakeFace** ← BRepLib_MakeShape (22 ctor) : Add, Error, Face, Init · *statiques :* IsDegenerated
- **BRepLib_MakePolygon** ← BRepLib_MakeShape (7 ctor) : Add, Added, Close, Edge, FirstVertex, LastVertex, Wire
- **BRepLib_MakeShape** ← BRepLib_Command : Build, DescendantFaces, FaceStatus, FacesFromEdges, HasDescendants, NbSurfaces, NewFaces, Shape
- **BRepLib_MakeShell** ← BRepLib_MakeShape (3 ctor) : Error, Init, Shell
- **BRepLib_MakeSolid** ← BRepLib_MakeShape (7 ctor) : Add, FaceStatus, Solid
- **BRepLib_MakeVertex** ← BRepLib_MakeShape : Vertex
- **BRepLib_MakeWire** ← BRepLib_MakeShape (7 ctor) : Add, Edge, Error, Vertex, Wire
- **BRepLib_ShapeModification** · *statiques :* BRepLib_BoundaryModified, BRepLib_Deleted, BRepLib_Merged, BRepLib_Preserved, BRepLib_Trimmed
- **BRepLib_ShellError** · *statiques :* BRepLib_DisconnectedShell, BRepLib_EmptyShell, BRepLib_ShellDone, BRepLib_ShellParametersOutOfRange
- **BRepLib_WireError** · *statiques :* BRepLib_DisconnectedWire, BRepLib_EmptyWire, BRepLib_NonManifoldWire, BRepLib_WireDone

## BRepLProp

- **BRepLProp_CLProps** (3 ctor) : CentreOfCurvature, Curvature, D1, D2, D3, IsTangentDefined, Normal, SetCurve, SetParameter, Tangent, Value
- **BRepLProp_CurveTool** · *statiques :* Continuity, D1, D2, D3, FirstParameter, LastParameter, Value
- **BRepLProp_SLProps** (3 ctor) : CurvatureDirections, D1U, D1V, D2U, D2V, DUV, GaussianCurvature, IsCurvatureDefined, IsNormalDefined, IsTangentUDefined, IsTangentVDefined, IsUmbilic, MaxCurvature, MeanCurvature, MinCurvature, Normal, SetParameters, SetSurface, TangentU, TangentV, Value
- **BRepLProp_SurfaceTool** · *statiques :* Bounds, Continuity, D1, D2, DN, Value

## BRepMAT2d

- **BRepMAT2d_BisectingLocus** : BasicElt, Compute, GeomBis, GeomElt, Graph, IsDone, NumberOfContours, NumberOfElts, NumberOfSections
- **BRepMAT2d_Explorer** (2 ctor) : Clear, Contour, GetIsClosed, Init, IsModified, ModifiedShape, More, Next, NumberOfContours, NumberOfCurves, Perform, Shape, Value
- **BRepMAT2d_LinkTopoBilo** (2 ctor) : GeneratingShape, Init, More, Next, Perform, Value

## BRepMesh

- **BRepMesh_BaseMeshAlgo** ← IMeshTools_MeshAlgo : DynamicType, Perform · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_BoundaryParamsRangeSplitter** ← BRepMesh_NURBSRangeSplitter : AddPoint
- **BRepMesh_Circle** (2 ctor) : Location, Radius, SetLocation, SetRadius
- **BRepMesh_CircleInspector**
- **BRepMesh_CircleTool** (2 ctor) : Bind, Delete, Init, IsEmpty, MocBind, Select, SetCellSize, SetMinMaxSize · *statiques :* MakeCircle
- **BRepMesh_Classifier** ← Standard_Transient : DynamicType, Perform, RegisterWire · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_ConeRangeSplitter** ← BRepMesh_DefaultRangeSplitter : GenerateSurfaceNodes, GetSplitSteps
- **BRepMesh_ConstrainedBaseMeshAlgo** ← BRepMesh_BaseMeshAlgo : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_Context** ← IMeshTools_Context : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_CurveTessellator** ← IMeshTools_CurveTessellator (2 ctor) : DynamicType, PointsNb, Value · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_CustomBaseMeshAlgo** ← BRepMesh_ConstrainedBaseMeshAlgo : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_CylinderRangeSplitter** ← BRepMesh_DefaultRangeSplitter : GenerateSurfaceNodes, Reset
- **BRepMesh_DataStructureOfDelaun** ← Standard_Transient : AddElement, AddLink, AddNode, Allocator, ClearDeleted, ClearDomain, Data, Dump, DynamicType, ElementNodes, ElementsConnectedTo, ElementsOfDomain, GetElement, GetLink, GetNode, IndexOf, LinksConnectedTo, LinksOfDomain, NbElements, NbLinks, NbNodes, RemoveElement, RemoveLink, RemoveNode, Statistics, SubstituteElement, SubstituteLink, SubstituteNode · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_DefaultRangeSplitter** : AddPoint, AdjustRange, GenerateSurfaceNodes, GetDFace, GetDelta, GetRangeU, GetRangeV, GetSurface, GetToleranceUV, IsValid, Point, Reset, Scale
- **BRepMesh_Deflection** ← Standard_Transient : DynamicType · *statiques :* ComputeAbsoluteDeflection, ComputeDeflection, get_type_descriptor, get_type_name
- **BRepMesh_DegreeOfFreedom** · *statiques :* BRepMesh_Deleted, BRepMesh_Fixed, BRepMesh_Free, BRepMesh_Frontier, BRepMesh_InVolume, BRepMesh_OnCurve, BRepMesh_OnSurface
- **BRepMesh_Delaun** (5 ctor) : AddVertices, Circles, Contains, FreeEdges, Frontier, GetEdge, GetTriangle, GetVertex, Init, InitCirclesTool, InternalEdges, ProcessConstraints, RemoveVertex, Result, UseEdge
- **BRepMesh_DelaunayBaseMeshAlgo** ← BRepMesh_ConstrainedBaseMeshAlgo : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_DiscretFactory** : DefaultName, Discret, ErrorStatus, FunctionName, Names, SetDefault, SetDefaultName, SetFunctionName · *statiques :* Get
- **BRepMesh_DiscretRoot** ← Standard_Transient : DynamicType, IsDone, Perform, SetShape, Shape · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_Edge** ← BRepMesh_OrientedEdge (2 ctor) : IsEqual, IsSameOrientation, Movability, SetMovability
- **BRepMesh_EdgeDiscret** ← IMeshTools_ModelAlgo : DynamicType · *statiques :* CreateEdgeTessellationExtractor, CreateEdgeTessellator, Tessellate2d, Tessellate3d, get_type_descriptor, get_type_name
- **BRepMesh_EdgeTessellationExtractor** ← IMeshTools_CurveTessellator : DynamicType, PointsNb, Value · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_FaceChecker** ← Standard_Transient : DynamicType, GetIntersectingEdges, Perform · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_FaceDiscret** ← IMeshTools_ModelAlgo : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_FactoryError** · *statiques :* BRepMesh_FE_CANNOTCREATEALGO, BRepMesh_FE_FUNCTIONNOTFOUND, BRepMesh_FE_LIBRARYNOTFOUND, BRepMesh_FE_NOERROR
- **BRepMesh_FastDiscret**
- **BRepMesh_GeomTool** (2 ctor) : AddPoint, NbPoints, Value · *statiques :* CellsCount, IntLinLin, IntSegSeg, Normal, SquareDeflectionOfSegment
- **BRepMesh_IncrementalMesh** ★ ← BRepMesh_DiscretRoot (3 ctor) : ChangeParameters, DynamicType, GetStatusFlags, IsModified, Parameters, Perform · *statiques :* Discret, IsParallelDefault, SetParallelDefault, get_type_descriptor, get_type_name
- **BRepMesh_MeshAlgoFactory** ← IMeshTools_MeshAlgoFactory : DynamicType, GetAlgo · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_MeshTool** ← Standard_Transient : AddAndLegalizeTriangle, AddLink, AddTriangle, CleanFrontierLinks, DumpTriangles, DynamicType, EraseFreeLinks, EraseItemsConnectedTo, EraseTriangle, EraseTriangles, GetEdgesByType, GetStructure, Legalize · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_ModelBuilder** ← IMeshTools_ModelBuilder : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_ModelHealer** ← IMeshTools_ModelAlgo : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_ModelPostProcessor** ← IMeshTools_ModelAlgo : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_ModelPreProcessor** ← IMeshTools_ModelAlgo : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_NURBSRangeSplitter** ← BRepMesh_UVParamRangeSplitter : AdjustRange, GenerateSurfaceNodes
- **BRepMesh_OrientedEdge** (2 ctor) : FirstNode, HashCode, IsEqual, LastNode
- **BRepMesh_PairOfIndex** : Append, Clear, Extent, FirstIndex, Index, IsEmpty, LastIndex, Prepend, RemoveIndex, SetIndex
- **BRepMesh_SelectorOfDataStructureOfDelaun** ← Standard_Transient (2 ctor) : AddNeighbours, DynamicType, Elements, FrontierLinks, Initialize, Links, NeighboursByEdgeOf, NeighboursOf, NeighboursOfElement, NeighboursOfLink, NeighboursOfNode, Nodes · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_ShapeTool** ← Standard_Transient : DynamicType · *statiques :* AddInFace, BoxMaxDimension, CheckAndUpdateFlags, MaxFaceTolerance, NullifyEdge, NullifyFace, Range, UVPoints, UpdateEdge, UseLocation, get_type_descriptor, get_type_name
- **BRepMesh_ShapeVisitor** ← IMeshTools_ShapeVisitor : DynamicType, Visit · *statiques :* get_type_descriptor, get_type_name
- **BRepMesh_SphereRangeSplitter** ← BRepMesh_DefaultRangeSplitter : GenerateSurfaceNodes
- **BRepMesh_TorusRangeSplitter** ← BRepMesh_UVParamRangeSplitter : AddPoint, GenerateSurfaceNodes
- **BRepMesh_Triangle** (2 ctor) : Edges, HashCode, Initialize, IsEqual, Movability, SetMovability
- **BRepMesh_UVParamRangeSplitter** ← BRepMesh_DefaultRangeSplitter : GetParametersU, GetParametersV, Reset
- **BRepMesh_Vertex** (3 ctor) : ChangeCoord, Coord, HashCode, Initialize, IsEqual, Location3d, Movability, SetMovability
- **BRepMesh_VertexInspector**
- **BRepMesh_VertexTool** ← Standard_Transient : Add, ChangeVertices, DeleteVertex, DynamicType, Extent, FindIndex, FindKey, GetListOfDelNodes, GetTolerance, IsEmpty, RemoveLast, SetCellSize, SetTolerance, Statistics, Substitute, Vertices · *statiques :* get_type_descriptor, get_type_name

## BRepOffset

- **BRepOffset_Analyse** (2 ctor) : AddFaces, Ancestors, Clear, Edges, Explode, HasAncestor, IsDone, Perform, TangentEdges, Type
- **BRepOffset_Error** · *statiques :* BRepOffset_BadNormalsOnGeometry, BRepOffset_C0Geometry, BRepOffset_NoError, BRepOffset_NotConnectedShell, BRepOffset_NullOffset, BRepOffset_UnknownError
- **BRepOffset_Inter2d** · *statiques :* Compute, ConnexIntByInt, ConnexIntByIntInVert, ExtentEdge, FuseVertices
- **BRepOffset_Inter3d** : AddCommonEdges, AsDes, CompletInt, ConnexIntByArc, ConnexIntByInt, ContextIntByArc, ContextIntByInt, FaceInter, IsDone, NewEdges, SetDone, TouchedFaces
- **BRepOffset_Interval** (2 ctor) : First, Last, Type
- **BRepOffset_ListOfInterval** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **BRepOffset_MakeLoops** : Build, BuildFaces, BuildOnContext
- **BRepOffset_MakeSimpleOffset** (2 ctor) : Generated, GetBuildSolidFlag, GetError, GetErrorMessage, GetOffsetValue, GetResultShape, GetSafeOffset, GetTolerance, Initialize, IsDone, Modified, Perform, SetBuildSolidFlag, SetOffsetValue, SetTolerance
- **BRepOffset_Mode** · *statiques :* BRepOffset_Pipe, BRepOffset_RectoVerso, BRepOffset_Skin
- **BRepOffset_Offset** (6 ctor) : Face, Generated, Init, InitialShape, Status
- **BRepOffset_SimpleOffset** ← BRepTools_Modification : Continuity, DynamicType, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface · *statiques :* get_type_descriptor, get_type_name
- **BRepOffset_Status** · *statiques :* BRepOffset_Degenerated, BRepOffset_Good, BRepOffset_Reversed, BRepOffset_Unknown
- **BRepOffset_Tool** · *statiques :* BuildNeighbour, CheckBounds, CheckPlanesNormals, CorrectOrientation, Deboucle3D, EdgeVertices, EnLargeFace, ExtentFace, FindCommonShapes, Gabarit, Inter2d, Inter3D, InterOrExtent, MapVertexEdges, OriEdgeInFace, OrientSection, PipeInter, TryProject
- **BRepOffset_Type** · *statiques :* BRepOffset_Concave, BRepOffset_Convex, BRepOffset_FreeBoundary, BRepOffset_Other, BRepOffset_Tangent

## BRepOffsetAPI

- **BRepOffsetAPI_DraftAngle** ★ ← BRepBuilderAPI_ModifyShape (2 ctor) : Add, AddDone, Build, Clear, ConnectedFaces, CorrectWires, Generated, Init, Modified, ModifiedFaces, ModifiedShape, ProblematicShape, Remove, Status
- **BRepOffsetAPI_MakeDraft** ← BRepBuilderAPI_MakeShape : Generated, Perform, SetDraft, SetOptions, Shell
- **BRepOffsetAPI_MakeEvolved** ← BRepBuilderAPI_MakeShape (2 ctor) : Bottom, Build, Evolved, GeneratedShapes, Top
- **BRepOffsetAPI_MakeFilling** ← BRepBuilderAPI_MakeShape : Add, Build, G0Error, G1Error, G2Error, Generated, IsDone, LoadInitSurface, SetApproxParam, SetConstrParam, SetResolParam
- **BRepOffsetAPI_MakeOffset** ← BRepBuilderAPI_MakeShape (3 ctor) : AddWire, Build, Generated, Init, Perform
- **BRepOffsetAPI_MakeOffsetShape** ← BRepBuilderAPI_MakeShape (2 ctor) : Build, Generated, GeneratedEdge, GetJoinType, MakeOffset, PerformByJoin, PerformBySimple
- **BRepOffsetAPI_MakePipe** ← BRepPrimAPI_MakeSweep (2 ctor) : Build, ErrorOnSurface, FirstShape, Generated, LastShape, Pipe
- **BRepOffsetAPI_MakePipeShell** ★ ← BRepPrimAPI_MakeSweep : Add, Build, Delete, ErrorOnSurface, FirstShape, Generated, GetStatus, IsReady, LastShape, MakeSolid, Profiles, SetDiscreteMode, SetForceApproxC1, SetLaw, SetMaxDegree, SetMaxSegments, SetMode, SetTolerance, SetTransitionMode, Simulate, Spine
- **BRepOffsetAPI_MakeThickSolid** ★ ← BRepOffsetAPI_MakeOffsetShape (2 ctor) : Build, MakeThickSolidByJoin, MakeThickSolidBySimple, Modified
- **BRepOffsetAPI_MiddlePath** ← BRepBuilderAPI_MakeShape : Build
- **BRepOffsetAPI_NormalProjection** ← BRepBuilderAPI_MakeShape (2 ctor) : Add, Ancestor, Build, BuildWire, Compute3d, Couple, Generated, Init, IsDone, Projection, SetLimit, SetMaxDistance, SetParams
- **BRepOffsetAPI_ThruSections** ← BRepBuilderAPI_MakeShape : AddVertex, AddWire, Build, CheckCompatibility, Continuity, CriteriumWeight, FirstShape, Generated, GeneratedFace, Init, LastShape, MaxDegree, ParType, SetContinuity, SetCriteriumWeight, SetMaxDegree, SetParType, SetSmoothing, UseSmoothing, Wires

## BRepOffsetSimple

- **BRepOffsetSimple_Status** · *statiques :* BRepOffsetSimple_ErrorInvalidNbShells, BRepOffsetSimple_ErrorNonClosedShell, BRepOffsetSimple_ErrorOffsetComputation, BRepOffsetSimple_ErrorWallFaceComputation, BRepOffsetSimple_NullInputShape, BRepOffsetSimple_OK

## BRepPrim

- **BRepPrim_Builder** (2 ctor) : AddEdgeVertex, AddFaceWire, AddShellFace, AddWireEdge, Builder, CompleteEdge, CompleteFace, CompleteShell, CompleteWire, MakeDegeneratedEdge, MakeEdge, MakeFace, MakeShell, MakeVertex, MakeWire, ReverseFace, SetPCurve, SetParameters
- **BRepPrim_Cone** ← BRepPrim_Revolution (7 ctor) : MakeEmptyLateralFace
- **BRepPrim_Cylinder** ← BRepPrim_Revolution (6 ctor) : MakeEmptyLateralFace
- **BRepPrim_Direction** · *statiques :* BRepPrim_XMax, BRepPrim_XMin, BRepPrim_YMax, BRepPrim_YMin, BRepPrim_ZMax, BRepPrim_ZMin
- **BRepPrim_FaceBuilder** (3 ctor) : Edge, Face, Init, Vertex
- **BRepPrim_GWedge** (3 ctor) : Axes, Close, Edge, Face, GetX2Max, GetX2Min, GetXMax, GetXMin, GetYMax, GetYMin, GetZ2Max, GetZ2Min, GetZMax, GetZMin, HasEdge, HasFace, HasVertex, HasWire, IsInfinite, Line, Open, Plane, Point, Shell, Vertex, Wire
- **BRepPrim_OneAxis** : Angle, Axes, AxisBottomVertex, AxisEdge, AxisEndWire, AxisStartWire, AxisTopVertex, BottomEdge, BottomEndVertex, BottomFace, BottomStartVertex, BottomWire, EndBottomEdge, EndEdge, EndFace, EndTopEdge, EndWire, HasBottom, HasSides, HasTop, LateralEndWire, LateralFace, LateralStartWire, LateralWire, MakeEmptyLateralFace, MakeEmptyMeridianEdge, MeridianClosed, MeridianOnAxis, MeridianValue, SetMeridianOffset, SetMeridianPCurve, Shell, StartBottomEdge, StartEdge, StartFace, StartTopEdge, StartWire, TopEdge, TopEndVertex, TopFace, TopStartVertex, TopWire, VMax, VMaxInfinite, VMin, VMinInfinite
- **BRepPrim_Revolution** ← BRepPrim_OneAxis : MakeEmptyLateralFace, MakeEmptyMeridianEdge, MeridianValue, SetMeridianPCurve
- **BRepPrim_Sphere** ← BRepPrim_Revolution (3 ctor) : MakeEmptyLateralFace
- **BRepPrim_Torus** ← BRepPrim_Revolution (3 ctor) : MakeEmptyLateralFace
- **BRepPrim_Wedge** ← BRepPrim_GWedge (3 ctor)

## BRepPrimAPI

- **BRepPrimAPI_MakeBox** ★ ← BRepBuilderAPI_MakeShape (4 ctor) : BackFace, BottomFace, Build, FrontFace, LeftFace, RightFace, Shell, Solid, TopFace, Wedge
- **BRepPrimAPI_MakeCone** ★ ← BRepPrimAPI_MakeOneAxis (4 ctor) : Cone, OneAxis
- **BRepPrimAPI_MakeCylinder** ★ ← BRepPrimAPI_MakeOneAxis (4 ctor) : Cylinder, OneAxis
- **BRepPrimAPI_MakeHalfSpace** ← BRepBuilderAPI_MakeShape (2 ctor) : Solid
- **BRepPrimAPI_MakeOneAxis** ← BRepBuilderAPI_MakeShape : Build, Face, OneAxis, Shell, Solid
- **BRepPrimAPI_MakePrism** ★ ← BRepPrimAPI_MakeSweep (2 ctor) : Build, FirstShape, Generated, IsDeleted, LastShape, Prism
- **BRepPrimAPI_MakeRevol** ★ ← BRepPrimAPI_MakeSweep (2 ctor) : Build, Degenerated, FirstShape, Generated, HasDegenerated, IsDeleted, LastShape, Revol
- **BRepPrimAPI_MakeRevolution** ← BRepPrimAPI_MakeOneAxis (8 ctor) : OneAxis, Revolution
- **BRepPrimAPI_MakeSphere** ← BRepPrimAPI_MakeOneAxis (12 ctor) : OneAxis, Sphere
- **BRepPrimAPI_MakeSweep** ← BRepBuilderAPI_MakeShape : FirstShape, LastShape
- **BRepPrimAPI_MakeTorus** ← BRepPrimAPI_MakeOneAxis (8 ctor) : OneAxis, Torus
- **BRepPrimAPI_MakeWedge** ← BRepBuilderAPI_MakeShape (4 ctor) : Build, Shell, Solid, Wedge

## BRepProj

- **BRepProj_Projection** (2 ctor) : Current, Init, IsDone, More, Next, Shape

## BRepSweep

- **BRepSweep_Builder** : Add, Builder, MakeCompSolid, MakeCompound, MakeShell, MakeSolid, MakeWire
- **BRepSweep_Iterator** : Init, More, Next, Orientation, Value
- **BRepSweep_NumLinearRegularSweep** : Closed, DirectSolid, FirstShape, GDDShapeIsToAdd, GGDShapeIsToAdd, GenIsUsed, HasShape, IsInvariant, IsUsed, LastShape, MakeEmptyDirectingEdge, MakeEmptyFace, MakeEmptyGeneratingEdge, MakeEmptyVertex, SeparatedWires, SetContinuity, SetDirectingPCurve, SetDirectingParameter, SetGeneratingPCurve, SetGeneratingParameter, SetPCurve, SetParameters, Shape, SplitShell
- **BRepSweep_Prism** (2 ctor) : FirstShape, GenIsUsed, IsUsed, LastShape, Shape, Vec
- **BRepSweep_Revol** (2 ctor) : Angle, Axe, FirstShape, IsUsed, LastShape, Shape
- **BRepSweep_Rotation** ← BRepSweep_Trsf : Angle, Axe, DirectSolid, GDDShapeIsToAdd, GGDShapeIsToAdd, HasShape, IsInvariant, MakeEmptyDirectingEdge, MakeEmptyFace, MakeEmptyGeneratingEdge, MakeEmptyVertex, SeparatedWires, SetDirectingPCurve, SetDirectingParameter, SetGeneratingPCurve, SetGeneratingParameter, SetPCurve, SetParameters, SplitShell
- **BRepSweep_Tool** : Index, NbShapes, Orientation, SetOrientation, Shape, Type
- **BRepSweep_Translation** ← BRepSweep_Trsf : DirectSolid, GDDShapeIsToAdd, GGDShapeIsToAdd, HasShape, IsInvariant, MakeEmptyDirectingEdge, MakeEmptyFace, MakeEmptyGeneratingEdge, MakeEmptyVertex, SeparatedWires, SetDirectingPCurve, SetDirectingParameter, SetGeneratingPCurve, SetGeneratingParameter, SetPCurve, SetParameters, Vec
- **BRepSweep_Trsf** ← BRepSweep_NumLinearRegularSweep : GDDShapeIsToAdd, GGDShapeIsToAdd, HasShape, Init, IsInvariant, MakeEmptyDirectingEdge, MakeEmptyFace, MakeEmptyGeneratingEdge, MakeEmptyVertex, Process, SeparatedWires, SetContinuity, SetDirectingPCurve, SetDirectingParameter, SetGeneratingPCurve, SetGeneratingParameter, SetPCurve, SetParameters

## BRepToIGES

- **BRepToIGES_BREntity** : AddFail, AddWarning, GetConvertSurfaceMode, GetModel, GetPCurveMode, GetShapeResult, GetTransferProcess, GetUnit, HasShapeResult, Init, SetModel, SetShapeResult, SetTransferProcess, TransferShape
- **BRepToIGES_BRShell** ← BRepToIGES_BREntity (2 ctor) : TransferFace, TransferShell
- **BRepToIGES_BRSolid** ← BRepToIGES_BREntity (2 ctor) : TransferCompSolid, TransferCompound, TransferSolid
- **BRepToIGES_BRWire** ← BRepToIGES_BREntity (2 ctor) : TransferEdge, TransferVertex, TransferWire

## BRepToIGESBRep

- **BRepToIGESBRep_Entity** ← BRepToIGES_BREntity : AddEdge, AddVertex, Clear, IndexEdge, IndexVertex, TransferCompSolid, TransferCompound, TransferEdge, TransferEdgeList, TransferFace, TransferShape, TransferShell, TransferSolid, TransferVertexList, TransferWire

## BRepTools

- **BRepTools_GTrsfModification** ← BRepTools_Modification : Continuity, DynamicType, GTrsf, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface · *statiques :* get_type_descriptor, get_type_name
- **BRepTools_History** ← Standard_Transient : AddGenerated, AddModified, Clear, Dump, DynamicType, Generated, HasGenerated, HasModified, HasRemoved, IsRemoved, Merge, Modified, Remove, ReplaceGenerated, ReplaceModified · *statiques :* IsSupportedType, get_type_descriptor, get_type_name
- **BRepTools_Modification** ← Standard_Transient : Continuity, DynamicType, NewCurve, NewCurve2d, NewParameter, NewPoint, NewPolygon, NewPolygonOnTriangulation, NewSurface, NewTriangulation · *statiques :* get_type_descriptor, get_type_name
- **BRepTools_Modifier** (3 ctor) : Init, IsDone, IsMutableInput, ModifiedShape, Perform, SetMutableInput
- **BRepTools_NurbsConvertModification** ← BRepTools_Modification : Continuity, DynamicType, GetUpdatedEdges, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface · *statiques :* get_type_descriptor, get_type_name
- **BRepTools_Quilt** : Add, Bind, Copy, IsCopied, Shells
- **BRepTools_ReShape** ← Standard_Transient : Apply, Clear, CopyVertex, DynamicType, History, IsNewShape, IsRecorded, ModeConsiderLocation, Remove, Replace, Status, Value · *statiques :* get_type_descriptor, get_type_name
- **BRepTools_ShapeSet** ← TopTools_ShapeSet (2 ctor) : AddGeometry, AddShapes, Check, Clear, DumpGeometry, DumpPolygon3D, DumpPolygonOnTriangulation, DumpTriangulation, ReadGeometry, ReadPolygon3D, ReadPolygonOnTriangulation, ReadTriangulation, WriteGeometry, WritePolygon3D, WritePolygonOnTriangulation, WriteTriangulation
- **BRepTools_Substitution** : Build, Clear, Copy, IsCopied, Substitute
- **BRepTools_TrsfModification** ← BRepTools_Modification : Continuity, DynamicType, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface, Trsf · *statiques :* get_type_descriptor, get_type_name
- **BRepTools_WireExplorer** (3 ctor) : Clear, Current, CurrentVertex, Init, More, Next, Orientation

## BRepTopAdaptor

- **BRepTopAdaptor_FClass2d** : Copy, Destroy, Perform, PerformInfinitePoint, TestOnRestriction
- **BRepTopAdaptor_HVertex** ← Adaptor3d_HVertex : ChangeVertex, DynamicType, IsSame, Orientation, Parameter, Resolution, Value, Vertex · *statiques :* get_type_descriptor, get_type_name
- **BRepTopAdaptor_Tool** (3 ctor) : Destroy, GetSurface, GetTopolTool, Init, SetTopolTool
- **BRepTopAdaptor_TopolTool** ← Adaptor3d_TopolTool (2 ctor) : Classify, ComputeSamplePoints, Destroy, DomainIsInfinite, DynamicType, Edge, Has3d, Init, InitVertexIterator, Initialize, IsThePointOn, More, MoreVertex, NbSamples, NbSamplesU, NbSamplesV, Next, NextVertex, Orientation, Pnt, SamplePoint, Tol3d, Value, Vertex · *statiques :* get_type_descriptor, get_type_name

## BSplCLib

- **BSplCLib_Cache** ← Standard_Transient (2 ctor) : BuildCache, D0, D1, D2, D3, DynamicType, IsCacheValid · *statiques :* get_type_descriptor, get_type_name
- **BSplCLib_EvaluatorFunction** : Evaluate
- **BSplCLib_KnotDistribution** · *statiques :* BSplCLib_NonUniform, BSplCLib_Uniform
- **BSplCLib_MultDistribution** · *statiques :* BSplCLib_Constant, BSplCLib_NonConstant, BSplCLib_QuasiConstant

## BSplSLib

- **BSplSLib_Cache** ← Standard_Transient : BuildCache, D0, D1, D2, DynamicType, IsCacheValid · *statiques :* get_type_descriptor, get_type_name
- **BSplSLib_EvaluatorFunction** : Evaluate

## BVH

- **BVH_BuildQueue** : Enqueue, Fetch, HasBusyThreads, Size
- **BVH_BuildThread** ← Standard_Transient : DynamicType, Run, Wait · *statiques :* get_type_descriptor, get_type_name
- **BVH_BuilderTransient** ← Standard_Transient : DynamicType, IsParallel, LeafNodeSize, MaxTreeDepth, SetParallel · *statiques :* get_type_descriptor, get_type_name
- **BVH_ObjectTransient** ← Standard_Transient : DynamicType, IsDirty, MarkDirty, Properties, SetProperties · *statiques :* get_type_descriptor, get_type_name
- **BVH_Properties** ← Standard_Transient : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **BVH_TreeBaseTransient** ← Standard_Transient : DynamicType · *statiques :* get_type_descriptor, get_type_name

## CDF

- **CDF_Application** ← CDM_Application : CanClose, CanRetrieve, Close, DefaultFolder, DynamicType, Format, GetRetrieveStatus, Open, Read, ReaderFromFormat, Retrieve, SetDefaultFolder, WriterFromFormat · *statiques :* Load, get_type_descriptor, get_type_name
- **CDF_Directory** ← Standard_Transient : Add, Contains, DynamicType, IsEmpty, Last, Length, Remove · *statiques :* get_type_descriptor, get_type_name
- **CDF_DirectoryIterator** (2 ctor) : Document, MoreDocument, NextDocument
- **CDF_FWOSDriver** ← CDF_MetaDataDriver : BuildFileName, DefaultFolder, DynamicType, Find, FindFolder, HasReadPermission, SetName · *statiques :* get_type_descriptor, get_type_name
- **CDF_MetaDataDriver** ← Standard_Transient : BuildFileName, CreateDependsOn, CreateMetaData, CreateReference, DefaultFolder, DynamicType, Find, FindFolder, HasReadPermission, HasVersion, HasVersionCapability, LastVersion, MetaData, ReferenceIterator, SetName · *statiques :* get_type_descriptor, get_type_name
- **CDF_MetaDataDriverError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **CDF_MetaDataDriverFactory** ← Standard_Transient : Build, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **CDF_Session** ← Standard_Transient : CurrentApplication, Directory, DynamicType, HasCurrentApplication, LoadDriver, MetaDataDriver, SetCurrentApplication, UnsetCurrentApplication · *statiques :* CurrentSession, Exists, get_type_descriptor, get_type_name
- **CDF_Store** : AssociatedStatusText, Comment, Component, CurrentIsConsistent, Description, Folder, HasAPreviousVersion, HasSubComponents, InitComponent, IsConsistent, IsMainDocument, IsModified, IsStored, MetaDataPath, MoreComponent, Name, NextComponent, Path, PreviousVersion, Realize, RecheckName, SetComment, SetCurrent, SetFolder, SetMain, SetName, SetPreviousVersion, StoreStatus, SubComponentStatus
- **CDF_StoreList** ← Standard_Transient : DynamicType, Init, IsConsistent, More, Next, Store, Value · *statiques :* get_type_descriptor, get_type_name
- **CDF_StoreSetNameStatus** · *statiques :* CDF_SSNS_OK, CDF_SSNS_OpenDocument, CDF_SSNS_ReplacingAnExistentDocument
- **CDF_SubComponentStatus** · *statiques :* CDF_SCS_Consistent, CDF_SCS_Modified, CDF_SCS_Stored, CDF_SCS_Unconsistent
- **CDF_TryStoreStatus** · *statiques :* CDF_TS_NoCurrentDocument, CDF_TS_NoDriver, CDF_TS_NoSubComponentDriver, CDF_TS_OK
- **CDF_TypeOfActivation** · *statiques :* CDF_TOA_Modified, CDF_TOA_New, CDF_TOA_Unchanged

## CDM

- **CDM_Application** ← Standard_Transient : BeginOfUpdate, DynamicType, EndOfUpdate, MessageDriver, Name, Resources, Version, Write · *statiques :* get_type_descriptor, get_type_name
- **CDM_CanCloseStatus** · *statiques :* CDM_CCS_ModifiedReferenced, CDM_CCS_NotOpen, CDM_CCS_OK, CDM_CCS_ReferenceRejection, CDM_CCS_UnstoredReferenced
- **CDM_Document** ← Standard_Transient : AddComment, Application, CanClose, CanCloseReference, ChangeStorageFormatVersion, Close, CloseReference, Comment, Comments, CopyReference, CreateReference, DeepReferences, Description, Document, DynamicType, Extensions, FileExtension, FindDescription, FindFileExtension, Folder, FromReferencesNumber, GetAlternativeDocument, HasRequestedFolder, HasRequestedPreviousVersion, IsInSession, IsModified, IsOpened, IsReadOnly, IsStored, IsUpToDate, LoadResources, MetaData, Modifications, Modify, Name, Open, Presentation, Reference, ReferenceCounter, RemoveAllReferences, RemoveReference, RequestedComment, RequestedFolder, RequestedName, RequestedPreviousVersion, SetComment, SetComments, SetIsReadOnly, SetIsUpToDate, SetMetaData, SetModifications, SetReferenceCounter, SetRequestedComment, SetRequestedFolder, SetRequestedName, SetRequestedPreviousVersion, ShallowReferences, StorageFormat, StorageFormatVersion, StorageVersion, ToReferencesNumber, UnModify, UnsetIsReadOnly, UnsetIsStored, UnsetRequestedPreviousVersion, Update, UpdateFromDocuments · *statiques :* FindFromPresentation, FindPresentation, get_type_descriptor, get_type_name
- **CDM_ListOfDocument** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **CDM_ListOfReferences** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **CDM_MetaData** ← Standard_Transient : Document, DynamicType, FileName, Folder, HasVersion, IsReadOnly, IsRetrieved, Name, Path, SetIsReadOnly, UnsetDocument, UnsetIsReadOnly, Version · *statiques :* LookUp, get_type_descriptor, get_type_name
- **CDM_Reference** ← Standard_Transient : DocumentVersion, DynamicType, FromDocument, IsReadOnly, ReferenceIdentifier, ToDocument · *statiques :* get_type_descriptor, get_type_name
- **CDM_ReferenceIterator** : Document, DocumentVersion, More, Next, ReferenceIdentifier

## ChFi2d

- **ChFi2d_AnaFilletAlgo** (3 ctor) : Init, Perform, Result
- **ChFi2d_Builder** (2 ctor) : AddChamfer, AddFillet, BasisEdge, ChamferEdges, DescendantEdge, FilletEdges, HasDescendant, Init, IsModified, ModifyChamfer, ModifyFillet, NbChamfer, NbFillet, RemoveChamfer, RemoveFillet, Result, Status
- **ChFi2d_ChamferAPI** (3 ctor) : Init, Perform, Result
- **ChFi2d_ConstructionError** · *statiques :* ChFi2d_BothEdgesDegenerated, ChFi2d_ComputationError, ChFi2d_ConnexionError, ChFi2d_FirstEdgeDegenerated, ChFi2d_InitialisationError, ChFi2d_IsDone, ChFi2d_LastEdgeDegenerated, ChFi2d_NoFace, ChFi2d_NotAuthorized, ChFi2d_NotPlanar, ChFi2d_ParametersError, ChFi2d_Ready, ChFi2d_TangencyError
- **ChFi2d_FilletAPI** (3 ctor) : Init, NbResults, Perform, Result
- **ChFi2d_FilletAlgo** (3 ctor) : Init, NbResults, Perform, Result

## ChFi3d

- **ChFi3d_Builder** : Abscissa, BadShape, Builder, Closed, ClosedAndTangent, Compute, ComputedSurface, Contains, FaultyContour, FaultyVertex, FirstVertex, Generated, HasResult, IsDone, LastVertex, Length, NbComputedSurfaces, NbElements, NbFaultyContours, NbFaultyVertices, PerformTwoCornerbyInter, RelativeAbscissa, Remove, Reset, SetContinuity, SetParams, Shape, SplitKPart, StripeStatus, Value
- **ChFi3d_ChBuilder** ← ChFi3d_Builder : Add, AddDA, Dists, GetDist, GetDistAngle, IsChamfer, Mode, NbSurf, PerformSurf, ResetContour, Sect, SetDist, SetDistAngle, SetDists, SetMode, SimulSurf, Simulate
- **ChFi3d_FilBuilder** ← ChFi3d_Builder : Add, GetBounds, GetFilletShape, GetLaw, IsConstant, NbSurf, Radius, ResetContour, Sect, SetFilletShape, SetLaw, SetRadius, Simulate, UnSet
- **ChFi3d_FilletShape** · *statiques :* ChFi3d_Polynomial, ChFi3d_QuasiAngular, ChFi3d_Rational
- **ChFi3d_SearchSing** ← math_FunctionWithDerivative : Derivative, Value, Values

## ChFiDS

- **ChFiDS_ChamfMethod** · *statiques :* ChFiDS_DistAngle, ChFiDS_Sym, ChFiDS_TwoDist
- **ChFiDS_ChamfMode** · *statiques :* ChFiDS_ClassicChamfer, ChFiDS_ConstThroatChamfer, ChFiDS_ConstThroatWithPenetrationChamfer
- **ChFiDS_ChamfSpine** ← ChFiDS_Spine (2 ctor) : Dists, DynamicType, GetDist, GetDistAngle, IsChamfer, SetDist, SetDistAngle, SetDists, SetMode · *statiques :* get_type_descriptor, get_type_name
- **ChFiDS_CircSection** : Get, Set
- **ChFiDS_CommonPoint** : Arc, HasVector, IsOnArc, IsVertex, Parameter, ParameterOnArc, Point, Reset, SetArc, SetParameter, SetPoint, SetTolerance, SetVector, SetVertex, Tolerance, TransitionOnArc, Vector, Vertex
- **ChFiDS_ElSpine** ← Adaptor3d_Curve : AddVertexWithTangent, BSpline, Bezier, ChangeNext, ChangePrevious, Circle, Continuity, D0, D1, D2, D3, Ellipse, FirstParameter, FirstPointAndTgt, GetSavedFirstParameter, GetSavedLastParameter, GetType, Hyperbola, Intervals, IsPeriodic, LastParameter, LastPointAndTgt, Line, NbIntervals, NbVertices, Next, Parabola, Period, Previous, Resolution, SaveFirstParameter, SaveLastParameter, SetCurve, SetFirstPointAndTgt, SetLastPointAndTgt, SetOrigin, SetPeriodic, Trim, Value, VertexWithTangent
- **ChFiDS_ErrorStatus** · *statiques :* ChFiDS_Error, ChFiDS_Ok, ChFiDS_StartsolFailure, ChFiDS_TwistedSurface, ChFiDS_WalkingFailure
- **ChFiDS_FaceInterference** : ChangePCurveOnFace, ChangePCurveOnSurf, FirstParameter, LastParameter, LineIndex, PCurveOnFace, PCurveOnSurf, Parameter, SetFirstParameter, SetInterference, SetLastParameter, SetLineIndex, SetParameter, SetTransition, Transition
- **ChFiDS_FilSpine** ← ChFiDS_Spine (2 ctor) : AppendElSpine, ChangeLaw, DynamicType, IsConstant, Law, MaxRadFromSeqAndLaws, Radius, Reset, SetRadius, UnSetRadius · *statiques :* get_type_descriptor, get_type_name
- **ChFiDS_HElSpine** ← Adaptor3d_HCurve (2 ctor) : ChangeCurve, Curve, DynamicType, GetCurve, Set · *statiques :* get_type_descriptor, get_type_name
- **ChFiDS_ListOfHElSpine** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **ChFiDS_ListOfStripe** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **ChFiDS_Map** : Contains, Fill, FindFromIndex, FindFromKey
- **ChFiDS_Regul** : Curve, IsSurface1, IsSurface2, S1, S2, SetCurve, SetS1, SetS2
- **ChFiDS_Regularities** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **ChFiDS_SecArray1** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **ChFiDS_Spine** ← Standard_Transient (2 ctor) : Absc, AppendElSpine, AppendOffsetElSpine, ChangeElSpines, ChangeOffsetElSpines, Circle, CurrentElementarySpine, CurrentIndexOfElementarySpine, D0, D1, D2, DynamicType, Edges, ElSpine, ErrorStatus, FirstParameter, FirstStatus, FirstVertex, GetType, HasFirstTgt, HasLastTgt, Index, IsClosed, IsPeriodic, IsTangencyExtremity, LastParameter, LastStatus, LastVertex, Length, Line, Load, Mode, NbEdges, OffsetEdges, Parameter, Period, PutInFirst, PutInFirstOffset, Reset, Resolution, SetCurrent, SetEdges, SetErrorStatus, SetFirstParameter, SetFirstStatus, SetFirstTgt, SetLastParameter, SetLastStatus, SetLastTgt, SetOffsetEdges, SetReference, SetStatus, SetTangencyExtremity, SplitDone, Status, UnsetReference, Value · *statiques :* get_type_descriptor, get_type_name
- **ChFiDS_State** · *statiques :* ChFiDS_AllSame, ChFiDS_BreakPoint, ChFiDS_Closed, ChFiDS_FreeBoundary, ChFiDS_OnDiff, ChFiDS_OnSame, ChFiDS_Tangent
- **ChFiDS_Stripe** ← Standard_Transient : ChangeFirstCurve, ChangeFirstPCurve, ChangeFirstParameters, ChangeIndexFirstPointOnS1, ChangeIndexFirstPointOnS2, ChangeIndexLastPointOnS1, ChangeIndexLastPointOnS2, ChangeLastCurve, ChangeLastPCurve, ChangeLastParameters, ChangePCurve, ChangeSetOfSurfData, ChangeSpine, Choix, Curve, DynamicType, FirstCurve, FirstPCurve, FirstPCurveOrientation, FirstParameters, InDS, IndexFirstPointOnS1, IndexFirstPointOnS2, IndexLastPointOnS1, IndexLastPointOnS2, IndexPoint, IsInDS, LastCurve, LastPCurve, LastPCurveOrientation, LastParameters, Orientation, OrientationOnFace1, OrientationOnFace2, PCurve, Parameters, Reset, SetCurve, SetIndexPoint, SetOfSurfData, SetOrientation, SetParameters, SetSolidIndex, SolidIndex, Spine · *statiques :* get_type_descriptor, get_type_name
- **ChFiDS_StripeArray1** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **ChFiDS_StripeMap** : Add, Clear, Extent, FindFromIndex, FindFromKey, FindKey
- **ChFiDS_SurfData** ← Standard_Transient : ChangeIndexOfS1, ChangeIndexOfS2, ChangeInterference, ChangeInterferenceOnS1, ChangeInterferenceOnS2, ChangeOrientation, ChangeSurf, ChangeVertex, ChangeVertexFirstOnS1, ChangeVertexFirstOnS2, ChangeVertexLastOnS1, ChangeVertexLastOnS2, Copy, DynamicType, FirstExtensionValue, FirstSpineParam, Get2dPoints, Index, IndexOfC, IndexOfC1, IndexOfC2, IndexOfS1, IndexOfS2, Interference, InterferenceOnS1, InterferenceOnS2, IsOnCurve, IsOnCurve1, IsOnCurve2, LastExtensionValue, LastSpineParam, Orientation, ResetSimul, Set2dPoints, SetIndexOfC1, SetIndexOfC2, SetSimul, Simul, Surf, TwistOnS1, TwistOnS2, Vertex, VertexFirstOnS1, VertexFirstOnS2, VertexLastOnS1, VertexLastOnS2 · *statiques :* get_type_descriptor, get_type_name

## ChFiKPart

- **ChFiKPart_ComputeData** · *statiques :* Compute, ComputeCorner

## Contap

- **Contap_ArcFunction** ← math_FunctionWithDerivative : Derivative, GetStateNumber, LastComputedPoint, NbSamples, Quadric, Set, Surface, Valpoint, Value, Values
- **Contap_ContAna** : Circle, IsDone, Line, NbContours, Perform, TypeContour
- **Contap_Contour** (7 ctor) : Init, IsDone, IsEmpty, Line, NbLines, Perform, SurfaceFunction
- **Contap_HContTool** · *statiques :* Bounds, HasBeenSeen, HasFirstPoint, HasLastPoint, IsAllSolution, IsVertex, NbPoints, NbSamplePoints, NbSamplesOnArc, NbSamplesU, NbSamplesV, NbSegments, Parameter, Project, SamplePoint, Tolerance, Value, Vertex
- **Contap_HCurve2dTool** · *statiques :* BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, LastParameter, Line, NbIntervals, NbSamples, Parabola, Period, Resolution, Value
- **Contap_IType** · *statiques :* Contap_Circle, Contap_Lin, Contap_Restriction, Contap_Walking
- **Contap_Line** : Add, Arc, Circle, Clear, Line, LineOn2S, NbPnts, NbVertex, Point, ResetSeqOfVertex, SetLineOn2S, SetTransitionOnS, SetValue, TransitionOnS, TypeContour, Vertex
- **Contap_Point** (2 ctor) : Arc, IsInternal, IsMultiple, IsOnArc, IsVertex, ParameterOnArc, ParameterOnLine, Parameters, SetArc, SetInternal, SetMultiple, SetParameter, SetValue, SetVertex, TransitionOnArc, TransitionOnLine, Value, Vertex
- **Contap_SurfFunction** ← math_FunctionSetWithDerivatives : Angle, Derivatives, Direction, Direction2d, Direction3d, Eye, FunctionType, IsTangent, NbEquations, NbVariables, PSurface, Point, Root, Set, Surface, Tolerance, Value, Values
- **Contap_SurfProps** · *statiques :* DerivAndNorm, NormAndDn, Normale
- **Contap_TFunction** · *statiques :* Contap_ContourPrs, Contap_ContourStd, Contap_DraftPrs, Contap_DraftStd
- **Contap_TheIWLineOfTheIWalking** ← Standard_Transient : AddIndexPassing, AddPoint, AddStatusFirst, AddStatusFirstLast, AddStatusLast, Cut, DynamicType, FirstPoint, FirstPointIndex, HasFirstPoint, HasLastPoint, IsClosed, IsTangentAtBegining, IsTangentAtEnd, LastPoint, LastPointIndex, Line, NbPassingPoint, NbPoints, PassingPoint, Reverse, SetTangencyAtBegining, SetTangencyAtEnd, SetTangentVector, TangentVector, Value · *statiques :* get_type_descriptor, get_type_name
- **Contap_TheIWalking** : IsDone, NbLines, NbSinglePnts, Perform, SetTolerance, SinglePnt, Value
- **Contap_ThePathPointOfTheSearch** (3 ctor) : Arc, IsNew, Parameter, SetValue, Tolerance, Value, Vertex
- **Contap_TheSearch** : AllArcSolution, IsDone, NbPoints, NbSegments, Perform, Point, Segment
- **Contap_TheSearchInside** (2 ctor) : IsDone, NbPoints, Perform, Value
- **Contap_TheSegmentOfTheSearch** : Curve, FirstPoint, HasFirstPoint, HasLastPoint, LastPoint, SetLimitPoint, SetValue

## Convert

- **Convert_CircleToBSplineCurve** ← Convert_ConicToBSplineCurve (2 ctor)
- **Convert_CompBezierCurves2dToBSplineCurve2d** : AddCurve, Degree, KnotsAndMults, NbKnots, NbPoles, Perform, Poles
- **Convert_CompBezierCurvesToBSplineCurve** : AddCurve, Degree, KnotsAndMults, NbKnots, NbPoles, Perform, Poles
- **Convert_CompPolynomialToPoles** (3 ctor) : Degree, IsDone, Knots, Multiplicities, NbKnots, NbPoles, Poles
- **Convert_ConeToBSplineSurface** ← Convert_ElementarySurfaceToBSplineSurface (2 ctor)
- **Convert_ConicToBSplineCurve** : BuildCosAndSin, Degree, IsPeriodic, Knot, Multiplicity, NbKnots, NbPoles, Pole, Weight
- **Convert_CylinderToBSplineSurface** ← Convert_ElementarySurfaceToBSplineSurface (2 ctor)
- **Convert_ElementarySurfaceToBSplineSurface** : IsUPeriodic, IsVPeriodic, NbUKnots, NbUPoles, NbVKnots, NbVPoles, Pole, UDegree, UKnot, UMultiplicity, VDegree, VKnot, VMultiplicity, Weight
- **Convert_EllipseToBSplineCurve** ← Convert_ConicToBSplineCurve (2 ctor)
- **Convert_GridPolynomialToPoles** (2 ctor) : IsDone, NbUKnots, NbUPoles, NbVKnots, NbVPoles, Perform, Poles, UDegree, UKnots, UMultiplicities, VDegree, VKnots, VMultiplicities
- **Convert_HyperbolaToBSplineCurve** ← Convert_ConicToBSplineCurve
- **Convert_ParabolaToBSplineCurve** ← Convert_ConicToBSplineCurve
- **Convert_ParameterisationType** · *statiques :* Convert_Polynomial, Convert_QuasiAngular, Convert_RationalC1, Convert_TgtThetaOver2
- **Convert_SphereToBSplineSurface** ← Convert_ElementarySurfaceToBSplineSurface (3 ctor)
- **Convert_TorusToBSplineSurface** ← Convert_ElementarySurfaceToBSplineSurface (3 ctor)

## CPnts

- **CPnts_AbscissaPoint** (5 ctor) : AdvPerform, Init, IsDone, Parameter, Perform, SetParameter · *statiques :* Length
- **CPnts_MyGaussFunction** ← math_Function : Init, Value
- **CPnts_MyRootFunction** ← math_FunctionWithDerivative : Derivative, Init, Value, Values
- **CPnts_UniformDeflection** (5 ctor) : Initialize, IsAllDone, More, Next, Point, Value

## CSLib

- **CSLib_Class2d** (2 ctor) : InternalSiDans, InternalSiDansOuOn, SiDans, SiDans_OnMode
- **CSLib_DerivativeStatus** · *statiques :* CSLib_D1IsNull, CSLib_D1uD1vRatioIsNull, CSLib_D1uIsNull, CSLib_D1uIsParallelD1v, CSLib_D1vD1uRatioIsNull, CSLib_D1vIsNull, CSLib_Done
- **CSLib_NormalPolyDef** ← math_FunctionWithDerivative : Derivative, Value, Values
- **CSLib_NormalStatus** · *statiques :* CSLib_D1NIsNull, CSLib_D1NuIsNull, CSLib_D1NuIsParallelD1Nv, CSLib_D1NuNvRatioIsNull, CSLib_D1NvIsNull, CSLib_D1NvNuRatioIsNull, CSLib_Defined, CSLib_InfinityOfSolutions, CSLib_Singular

## DBRep

- **DBRep_ListOfEdge** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **DBRep_ListOfFace** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **DBRep_ListOfHideData** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign

## DDF

- **DDF_TransactionStack** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign

## Draft

- **Draft_EdgeInfo** (2 ctor) : Add, ChangeFirstPC, ChangeGeometry, ChangeSecondPC, FirstFace, FirstPC, Geometry, IsTangent, NewGeometry, RootFace, SecondFace, SecondPC, SetNewGeometry, Tangent, Tolerance
- **Draft_ErrorStatus** · *statiques :* Draft_EdgeRecomputation, Draft_FaceRecomputation, Draft_NoError, Draft_VertexRecomputation
- **Draft_FaceInfo** (2 ctor) : Add, ChangeCurve, ChangeGeometry, Curve, FirstFace, Geometry, NewGeometry, RootFace, SecondFace
- **Draft_Modification** ← BRepTools_Modification : Add, Clear, ConnectedFaces, Continuity, DynamicType, Error, Init, IsDone, ModifiedFaces, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface, Perform, ProblematicShape, Remove · *statiques :* get_type_descriptor, get_type_name
- **Draft_VertexInfo** : Add, ChangeGeometry, ChangeParameter, Edge, Geometry, InitEdgeIterator, MoreEdge, NextEdge, Parameter

## Draw

- **Draw_ColorKind** · *statiques :* Draw_blanc, Draw_bleu, Draw_corail, Draw_cyan, Draw_jaune, Draw_kaki, Draw_magenta, Draw_marron, Draw_or, Draw_orange, Draw_rose, Draw_rouge, Draw_saumon, Draw_vert, Draw_violet
- **Draw_MarkerShape** · *statiques :* Draw_Circle, Draw_CircleZoom, Draw_Losange, Draw_Plus, Draw_Square, Draw_X

## DsgPrs

- **DsgPrs_AnglePresentation** · *statiques :* Add
- **DsgPrs_ArrowSide** · *statiques :* DsgPrs_AS_BOTHAR, DsgPrs_AS_BOTHPT, DsgPrs_AS_FIRSTAR, DsgPrs_AS_FIRSTAR_LASTPT, DsgPrs_AS_FIRSTPT, DsgPrs_AS_FIRSTPT_LASTAR, DsgPrs_AS_LASTAR, DsgPrs_AS_LASTPT, DsgPrs_AS_NONE
- **DsgPrs_Chamf2dPresentation** · *statiques :* Add
- **DsgPrs_ConcentricPresentation** · *statiques :* Add
- **DsgPrs_DatumPrs** ← Prs3d_Root · *statiques :* Add
- **DsgPrs_DiameterPresentation** · *statiques :* Add
- **DsgPrs_EllipseRadiusPresentation** · *statiques :* Add
- **DsgPrs_EqualDistancePresentation** · *statiques :* Add, AddInterval, AddIntervalBetweenTwoArcs
- **DsgPrs_EqualRadiusPresentation** · *statiques :* Add
- **DsgPrs_FilletRadiusPresentation** · *statiques :* Add
- **DsgPrs_FixPresentation** · *statiques :* Add
- **DsgPrs_IdenticPresentation** · *statiques :* Add
- **DsgPrs_LengthPresentation** · *statiques :* Add
- **DsgPrs_MidPointPresentation** · *statiques :* Add
- **DsgPrs_OffsetPresentation** · *statiques :* Add, AddAxes
- **DsgPrs_ParalPresentation** · *statiques :* Add
- **DsgPrs_PerpenPresentation** · *statiques :* Add
- **DsgPrs_ShadedPlanePresentation** · *statiques :* Add
- **DsgPrs_ShapeDirPresentation** · *statiques :* Add
- **DsgPrs_SymbPresentation** · *statiques :* Add
- **DsgPrs_SymmetricPresentation** · *statiques :* Add
- **DsgPrs_TangentPresentation** · *statiques :* Add
- **DsgPrs_XYZAxisPresentation** · *statiques :* Add
- **DsgPrs_XYZPlanePresentation** · *statiques :* Add

## Expr

- **Expr_Absolute** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_ArcCosine** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_ArcSine** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_ArcTangent** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_ArgCosh** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_ArgSinh** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_ArgTanh** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Array1OfGeneralExpression** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Expr_Array1OfNamedUnknown** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Expr_Array1OfSingleRelation** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Expr_BinaryExpression** ← Expr_GeneralExpression : Contains, ContainsUnknowns, DynamicType, FirstOperand, NbSubExpressions, Replace, SecondOperand, SetFirstOperand, SetSecondOperand, Simplified, SubExpression · *statiques :* get_type_descriptor, get_type_name
- **Expr_BinaryFunction** ← Expr_BinaryExpression : Copy, Derivative, DynamicType, Evaluate, Function, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Cosh** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Cosine** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Difference** ← Expr_BinaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, NDerivative, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Different** ← Expr_SingleRelation : Copy, DynamicType, IsSatisfied, Simplified, Simplify, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Division** ← Expr_BinaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Equal** ← Expr_SingleRelation : Copy, DynamicType, IsSatisfied, Simplified, Simplify, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Exponential** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Exponentiate** ← Expr_BinaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_ExprFailure** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Expr_FunctionDerivative** ← Expr_GeneralFunction : Copy, Degree, DerivVariable, Derivative, DynamicType, Evaluate, Expression, Function, GetStringName, IsIdentical, IsLinearOnVariable, NbOfVariables, UpdateExpression, Variable · *statiques :* get_type_descriptor, get_type_name
- **Expr_GeneralExpression** ← Standard_Transient : Contains, ContainsUnknowns, Copy, Derivative, DynamicType, Evaluate, EvaluateNumeric, IsIdentical, IsLinear, IsShareable, NDerivative, NbSubExpressions, Replace, ShallowSimplified, Simplified, String, SubExpression · *statiques :* get_type_descriptor, get_type_name
- **Expr_GeneralFunction** ← Standard_Transient : Copy, Derivative, DynamicType, Evaluate, GetStringName, IsIdentical, IsLinearOnVariable, NbOfVariables, Variable · *statiques :* get_type_descriptor, get_type_name
- **Expr_GeneralRelation** ← Standard_Transient : Contains, Copy, DynamicType, IsLinear, IsSatisfied, NbOfSingleRelations, NbOfSubRelations, Replace, Simplified, Simplify, String, SubRelation · *statiques :* get_type_descriptor, get_type_name
- **Expr_GreaterThan** ← Expr_SingleRelation : Copy, DynamicType, IsSatisfied, Simplified, Simplify, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_GreaterThanOrEqual** ← Expr_SingleRelation : Copy, DynamicType, IsSatisfied, Simplified, Simplify, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_InvalidAssignment** ← Expr_ExprFailure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Expr_InvalidFunction** ← Expr_ExprFailure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Expr_InvalidOperand** ← Expr_ExprFailure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Expr_LessThan** ← Expr_SingleRelation : Copy, DynamicType, IsSatisfied, Simplified, Simplify, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_LessThanOrEqual** ← Expr_SingleRelation : Copy, DynamicType, IsSatisfied, Simplified, Simplify, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_LogOf10** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_LogOfe** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_NamedConstant** ← Expr_NamedExpression : Contains, ContainsUnknowns, Copy, Derivative, DynamicType, Evaluate, GetValue, IsLinear, NDerivative, NbSubExpressions, Replace, ShallowSimplified, Simplified, SubExpression · *statiques :* get_type_descriptor, get_type_name
- **Expr_NamedExpression** ← Expr_GeneralExpression : DynamicType, GetName, IsIdentical, IsShareable, SetName, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_NamedFunction** ← Expr_GeneralFunction : Copy, Derivative, DynamicType, Evaluate, Expression, GetName, GetStringName, IsIdentical, IsLinearOnVariable, NbOfVariables, SetExpression, SetName, Variable · *statiques :* get_type_descriptor, get_type_name
- **Expr_NamedUnknown** ← Expr_NamedExpression : Assign, AssignedExpression, Contains, ContainsUnknowns, Copy, Deassign, Derivative, DynamicType, Evaluate, IsAssigned, IsLinear, NbSubExpressions, Replace, ShallowSimplified, Simplified, SubExpression · *statiques :* get_type_descriptor, get_type_name
- **Expr_NotAssigned** ← Expr_ExprFailure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Expr_NotEvaluable** ← Expr_ExprFailure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Expr_NumericValue** ← Expr_GeneralExpression : Contains, ContainsUnknowns, Copy, Derivative, DynamicType, Evaluate, GetValue, IsIdentical, IsLinear, NDerivative, NbSubExpressions, Replace, SetValue, ShallowSimplified, Simplified, String, SubExpression · *statiques :* get_type_descriptor, get_type_name
- **Expr_PolyExpression** ← Expr_GeneralExpression : Contains, ContainsUnknowns, DynamicType, NbOperands, NbSubExpressions, Operand, Replace, SetOperand, Simplified, SubExpression · *statiques :* get_type_descriptor, get_type_name
- **Expr_PolyFunction** ← Expr_PolyExpression : Copy, Derivative, DynamicType, Evaluate, Function, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Product** ← Expr_PolyExpression (2 ctor) : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_RUIterator** : More, Next, Value
- **Expr_RelationIterator** : More, Next, Value
- **Expr_Sign** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Sine** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_SingleRelation** ← Expr_GeneralRelation : Contains, DynamicType, FirstMember, IsLinear, NbOfSingleRelations, NbOfSubRelations, Replace, SecondMember, SetFirstMember, SetSecondMember, SubRelation · *statiques :* get_type_descriptor, get_type_name
- **Expr_Sinh** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Square** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_SquareRoot** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Sum** ← Expr_PolyExpression (2 ctor) : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, NDerivative, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_SystemRelation** ← Expr_GeneralRelation : Add, Contains, Copy, DynamicType, IsLinear, IsSatisfied, NbOfSingleRelations, NbOfSubRelations, Remove, Replace, Simplified, Simplify, String, SubRelation · *statiques :* get_type_descriptor, get_type_name
- **Expr_Tangent** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_Tanh** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_UnaryExpression** ← Expr_GeneralExpression : Contains, ContainsUnknowns, DynamicType, NbSubExpressions, Operand, Replace, SetOperand, Simplified, SubExpression · *statiques :* get_type_descriptor, get_type_name
- **Expr_UnaryFunction** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, Function, IsIdentical, IsLinear, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_UnaryMinus** ← Expr_UnaryExpression : Copy, Derivative, DynamicType, Evaluate, IsIdentical, IsLinear, NDerivative, ShallowSimplified, String · *statiques :* get_type_descriptor, get_type_name
- **Expr_UnknownIterator** : More, Next, Value

## ExprIntrp

- **ExprIntrp_Analysis** : GetFunction, GetNamed, IsExpStackEmpty, IsRelStackEmpty, Pop, PopFunction, PopName, PopRelation, PopValue, Push, PushFunction, PushName, PushRelation, PushValue, ResetAll, SetMaster, Use
- **ExprIntrp_GenExp** ← ExprIntrp_Generator : DynamicType, Expression, IsDone, Process · *statiques :* Create, get_type_descriptor, get_type_name
- **ExprIntrp_GenFct** ← ExprIntrp_Generator : DynamicType, IsDone, Process · *statiques :* Create, get_type_descriptor, get_type_name
- **ExprIntrp_GenRel** ← ExprIntrp_Generator : DynamicType, IsDone, Process, Relation · *statiques :* Create, get_type_descriptor, get_type_name
- **ExprIntrp_Generator** ← Standard_Transient : DynamicType, GetFunction, GetFunctions, GetNamed, Use · *statiques :* get_type_descriptor, get_type_name
- **ExprIntrp_StackOfGeneralExpression** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **ExprIntrp_StackOfGeneralFunction** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **ExprIntrp_StackOfGeneralRelation** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **ExprIntrp_SyntaxError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name

## Extrema

- **Extrema_Array1OfPOnCurv** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Extrema_Array1OfPOnCurv2d** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Extrema_Array1OfPOnSurf** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Extrema_CCLocFOfLocECC** ← math_FunctionSetWithDerivatives (2 ctor) : CurvePtr, Derivatives, GetStateNumber, NbEquations, NbExt, NbVariables, Points, SearchOfTolerance, SetCurve, SetTolerance, SquareDistance, SubIntervalInitialize, Tolerance, Value, Values
- **Extrema_CCLocFOfLocECC2d** ← math_FunctionSetWithDerivatives (2 ctor) : CurvePtr, Derivatives, GetStateNumber, NbEquations, NbExt, NbVariables, Points, SearchOfTolerance, SetCurve, SetTolerance, SquareDistance, SubIntervalInitialize, Tolerance, Value, Values
- **Extrema_Curve2dTool** · *statiques :* BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, DeflCurvIntervals, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, Parabola, Period, Resolution, Value
- **Extrema_CurveTool** · *statiques :* BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, DeflCurvIntervals, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsPeriodic, IsRational, LastParameter, Line, NbIntervals, NbKnots, NbPoles, Parabola, Period, Resolution, Value
- **Extrema_ECC** (3 ctor) : GetSingleSolutionFlag, IsDone, IsParallel, NbExt, Perform, Points, SetParams, SetSingleSolutionFlag, SetTolerance, SquareDistance
- **Extrema_ECC2d** (3 ctor) : GetSingleSolutionFlag, IsDone, IsParallel, NbExt, Perform, Points, SetParams, SetSingleSolutionFlag, SetTolerance, SquareDistance
- **Extrema_ELPCOfLocateExtPC** (3 ctor) : Initialize, IsDone, IsMin, NbExt, Perform, Point, SquareDistance, TrimmedSquareDistances
- **Extrema_ELPCOfLocateExtPC2d** (3 ctor) : Initialize, IsDone, IsMin, NbExt, Perform, Point, SquareDistance, TrimmedSquareDistances
- **Extrema_EPCOfELPCOfLocateExtPC** (3 ctor) : Initialize, IsDone, IsMin, NbExt, Perform, Point, SquareDistance
- **Extrema_EPCOfELPCOfLocateExtPC2d** (3 ctor) : Initialize, IsDone, IsMin, NbExt, Perform, Point, SquareDistance
- **Extrema_EPCOfExtPC** (3 ctor) : Initialize, IsDone, IsMin, NbExt, Perform, Point, SquareDistance
- **Extrema_EPCOfExtPC2d** (3 ctor) : Initialize, IsDone, IsMin, NbExt, Perform, Point, SquareDistance
- **Extrema_ElementType** · *statiques :* Extrema_Face, Extrema_Node, Extrema_UIsoEdge, Extrema_VIsoEdge
- **Extrema_ExtAlgo** · *statiques :* Extrema_ExtAlgo_Grad, Extrema_ExtAlgo_Tree
- **Extrema_ExtCC** (3 ctor) : GetSingleSolutionFlag, IsDone, IsParallel, NbExt, Perform, Points, SetCurve, SetRange, SetSingleSolutionFlag, SetTolerance, SquareDistance, TrimmedSquareDistances
- **Extrema_ExtCC2d** (3 ctor) : GetSingleSolutionFlag, Initialize, IsDone, IsParallel, NbExt, Perform, Points, SetSingleSolutionFlag, SquareDistance, TrimmedSquareDistances
- **Extrema_ExtCS** (3 ctor) : Initialize, IsDone, IsParallel, NbExt, Perform, Points, SquareDistance
- **Extrema_ExtElC** (7 ctor) : IsDone, IsParallel, NbExt, Points, SquareDistance
- **Extrema_ExtElC2d** (10 ctor) : IsDone, IsParallel, NbExt, Points, SquareDistance
- **Extrema_ExtElCS** (12 ctor) : IsDone, IsParallel, NbExt, Perform, Points, SquareDistance
- **Extrema_ExtElSS** (7 ctor) : IsDone, IsParallel, NbExt, Perform, Points, SquareDistance
- **Extrema_ExtFlag** · *statiques :* Extrema_ExtFlag_MAX, Extrema_ExtFlag_MIN, Extrema_ExtFlag_MINMAX
- **Extrema_ExtPC** (3 ctor) : Initialize, IsDone, IsMin, NbExt, Perform, Point, SquareDistance, TrimmedSquareDistances
- **Extrema_ExtPC2d** (3 ctor) : Initialize, IsDone, IsMin, NbExt, Perform, Point, SquareDistance, TrimmedSquareDistances
- **Extrema_ExtPElC** (6 ctor) : IsDone, IsMin, NbExt, Perform, Point, SquareDistance
- **Extrema_ExtPElC2d** (6 ctor) : IsDone, IsMin, NbExt, Perform, Point, SquareDistance
- **Extrema_ExtPElS** (6 ctor) : IsDone, NbExt, Perform, Point, SquareDistance
- **Extrema_ExtPExtS** ← Standard_Transient (3 ctor) : DynamicType, Initialize, IsDone, NbExt, Perform, Point, SquareDistance · *statiques :* get_type_descriptor, get_type_name
- **Extrema_ExtPRevS** ← Standard_Transient (3 ctor) : DynamicType, Initialize, IsDone, NbExt, Perform, Point, SquareDistance · *statiques :* get_type_descriptor, get_type_name
- **Extrema_ExtPS** (3 ctor) : Initialize, IsDone, NbExt, Perform, Point, SetAlgo, SetFlag, SquareDistance, TrimmedSquareDistances
- **Extrema_ExtSS** (3 ctor) : Initialize, IsDone, IsParallel, NbExt, Perform, Points, SquareDistance
- **Extrema_FuncExtCS** ← math_FunctionSetWithDerivatives (2 ctor) : Derivatives, GetStateNumber, Initialize, NbEquations, NbExt, NbVariables, PointOnCurve, PointOnSurface, SquareDistance, Value, Values
- **Extrema_FuncExtSS** ← math_FunctionSetWithDerivatives (2 ctor) : Derivatives, GetStateNumber, Initialize, NbEquations, NbExt, NbVariables, PointOnS1, PointOnS2, SquareDistance, Value, Values
- **Extrema_FuncPSDist** ← math_MultipleVarFunctionWithGradient : Gradient, NbVariables, Value, Values
- **Extrema_FuncPSNorm** ← math_FunctionSetWithDerivatives (2 ctor) : Derivatives, GetStateNumber, Initialize, NbEquations, NbExt, NbVariables, Point, SetPoint, SquareDistance, Value, Values
- **Extrema_GenExtCS** (3 ctor) : Initialize, IsDone, NbExt, Perform, PointOnCurve, PointOnSurface, SquareDistance
- **Extrema_GenExtPS** (3 ctor) : Initialize, IsDone, NbExt, Perform, Point, SetAlgo, SetFlag, SquareDistance
- **Extrema_GenExtSS** (3 ctor) : Initialize, IsDone, NbExt, Perform, PointOnS1, PointOnS2, SquareDistance
- **Extrema_GenLocateExtCS** (2 ctor) : IsDone, Perform, PointOnCurve, PointOnSurface, SquareDistance
- **Extrema_GenLocateExtPS** : IsDone, Perform, Point, SquareDistance
- **Extrema_GenLocateExtSS** (2 ctor) : IsDone, Perform, PointOnS1, PointOnS2, SquareDistance
- **Extrema_GlobOptFuncCCC0** ← math_MultipleVarFunction (2 ctor) : NbVariables, Value
- **Extrema_GlobOptFuncCCC1** ← math_MultipleVarFunctionWithGradient (2 ctor) : Gradient, NbVariables, Value, Values
- **Extrema_GlobOptFuncCCC2** ← math_MultipleVarFunctionWithHessian (2 ctor) : Gradient, NbVariables, Value, Values
- **Extrema_GlobOptFuncCS** ← math_MultipleVarFunctionWithHessian : Gradient, NbVariables, Value, Values
- **Extrema_LocECC** : IsDone, Point, SquareDistance
- **Extrema_LocECC2d** : IsDone, Point, SquareDistance
- **Extrema_LocEPCOfLocateExtPC** (3 ctor) : Initialize, IsDone, IsMin, Perform, Point, SquareDistance
- **Extrema_LocEPCOfLocateExtPC2d** (3 ctor) : Initialize, IsDone, IsMin, Perform, Point, SquareDistance
- **Extrema_LocateExtCC** : IsDone, Point, SquareDistance
- **Extrema_LocateExtCC2d** : IsDone, Point, SquareDistance
- **Extrema_LocateExtPC** (3 ctor) : Initialize, IsDone, IsMin, Perform, Point, SquareDistance
- **Extrema_LocateExtPC2d** (3 ctor) : Initialize, IsDone, IsMin, Perform, Point, SquareDistance
- **Extrema_PCFOfEPCOfELPCOfLocateExtPC** ← math_FunctionWithDerivative (2 ctor) : Derivative, GetStateNumber, Initialize, IsMin, NbExt, Point, SearchOfTolerance, SetPoint, SquareDistance, SubIntervalInitialize, Value, Values
- **Extrema_PCFOfEPCOfELPCOfLocateExtPC2d** ← math_FunctionWithDerivative (2 ctor) : Derivative, GetStateNumber, Initialize, IsMin, NbExt, Point, SearchOfTolerance, SetPoint, SquareDistance, SubIntervalInitialize, Value, Values
- **Extrema_PCFOfEPCOfExtPC** ← math_FunctionWithDerivative (2 ctor) : Derivative, GetStateNumber, Initialize, IsMin, NbExt, Point, SearchOfTolerance, SetPoint, SquareDistance, SubIntervalInitialize, Value, Values
- **Extrema_PCFOfEPCOfExtPC2d** ← math_FunctionWithDerivative (2 ctor) : Derivative, GetStateNumber, Initialize, IsMin, NbExt, Point, SearchOfTolerance, SetPoint, SquareDistance, SubIntervalInitialize, Value, Values
- **Extrema_PCLocFOfLocEPCOfLocateExtPC** ← math_FunctionWithDerivative (2 ctor) : Derivative, GetStateNumber, Initialize, IsMin, NbExt, Point, SearchOfTolerance, SetPoint, SquareDistance, SubIntervalInitialize, Value, Values
- **Extrema_PCLocFOfLocEPCOfLocateExtPC2d** ← math_FunctionWithDerivative (2 ctor) : Derivative, GetStateNumber, Initialize, IsMin, NbExt, Point, SearchOfTolerance, SetPoint, SquareDistance, SubIntervalInitialize, Value, Values
- **Extrema_POnCurv** (2 ctor) : Parameter, SetValues, Value
- **Extrema_POnCurv2d** (2 ctor) : Parameter, SetValues, Value
- **Extrema_POnSurf** (2 ctor) : Parameter, SetParameters, Value
- **Extrema_POnSurfParams** ← Extrema_POnSurf (2 ctor) : GetElementType, GetIndices, GetSqrDistance, SetElementType, SetIndices, SetSqrDistance

## FairCurve

- **FairCurve_AnalysisCode** · *statiques :* FairCurve_InfiniteSliding, FairCurve_NotConverged, FairCurve_NullHeight, FairCurve_OK

## FEmTool

- **FEmTool_ListOfVectors** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign

## FilletSurf

- **FilletSurf_ErrorTypeStatus** · *statiques :* FilletSurf_EdgeNotG1, FilletSurf_EdgeNotOnShape, FilletSurf_EmptyList, FilletSurf_FacesNotG1, FilletSurf_NotSharpEdge, FilletSurf_PbFilletCompute
- **FilletSurf_StatusDone** · *statiques :* FilletSurf_IsNotOk, FilletSurf_IsOk, FilletSurf_IsPartial
- **FilletSurf_StatusType** · *statiques :* FilletSurf_NoExtremityOnEdge, FilletSurf_OneExtremityOnEdge, FilletSurf_TwoExtremityOnEdge

## Font

- **Font_FontAspect** · *statiques :* Font_FA_Bold, Font_FA_BoldItalic, Font_FA_Italic, Font_FA_Regular, Font_FA_Undefined, Font_FontAspect_Bold, Font_FontAspect_BoldItalic, Font_FontAspect_Italic, Font_FontAspect_Regular, Font_FontAspect_UNDEFINED
- **Font_NListOfSystemFont** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **Font_StrictLevel** · *statiques :* Font_StrictLevel_Aliases, Font_StrictLevel_Any, Font_StrictLevel_Strict
- **Font_UnicodeSubset** · *statiques :* Font_UnicodeSubset_Arabic, Font_UnicodeSubset_CJK, Font_UnicodeSubset_Korean, Font_UnicodeSubset_Western

## GC

- **GC_MakeArcOfCircle** ← GC_Root (5 ctor) : Value
- **GC_MakeArcOfEllipse** ← GC_Root (3 ctor) : Value
- **GC_MakeArcOfHyperbola** ← GC_Root (3 ctor) : Value
- **GC_MakeArcOfParabola** ← GC_Root (3 ctor) : Value
- **GC_MakeCircle** ← GC_Root (8 ctor) : Value
- **GC_MakeConicalSurface** ← GC_Root (4 ctor) : Value
- **GC_MakeCylindricalSurface** ← GC_Root (7 ctor) : Value
- **GC_MakeEllipse** ← GC_Root (3 ctor) : Value
- **GC_MakeHyperbola** ← GC_Root (3 ctor) : Value
- **GC_MakeLine** ← GC_Root (5 ctor) : Value
- **GC_MakeMirror** (6 ctor) : Value
- **GC_MakePlane** ← GC_Root (7 ctor) : Value
- **GC_MakeRotation** (3 ctor) : Value
- **GC_MakeScale** : Value
- **GC_MakeSegment** ← GC_Root (4 ctor) : Value
- **GC_MakeTranslation** (2 ctor) : Value
- **GC_MakeTrimmedCone** ← GC_Root (2 ctor) : Value
- **GC_MakeTrimmedCylinder** ← GC_Root (3 ctor) : Value
- **GC_Root** : IsDone, Status

## GccAna

- **GccAna_Circ2d2TanOn** (12 ctor) : CenterOn3, IsDone, IsTheSame1, IsTheSame2, NbSolutions, Tangency1, Tangency2, ThisSolution, WhichQualifier
- **GccAna_Circ2d2TanRad** (6 ctor) : IsDone, IsTheSame1, IsTheSame2, NbSolutions, Tangency1, Tangency2, ThisSolution, WhichQualifier
- **GccAna_Circ2d3Tan** (10 ctor) : IsDone, IsTheSame1, IsTheSame2, IsTheSame3, NbSolutions, Tangency1, Tangency2, Tangency3, ThisSolution, WhichQualifier
- **GccAna_Circ2dBisec** : IsDone, NbSolutions, ThisSolution
- **GccAna_Circ2dTanCen** (3 ctor) : IsDone, IsTheSame1, NbSolutions, Tangency1, ThisSolution, WhichQualifier
- **GccAna_Circ2dTanOnRad** (6 ctor) : CenterOn3, IsDone, IsTheSame1, NbSolutions, Tangency1, ThisSolution, WhichQualifier
- **GccAna_CircLin2dBisec** : IsDone, NbSolutions, ThisSolution
- **GccAna_CircPnt2dBisec** (2 ctor) : IsDone, NbSolutions, ThisSolution
- **GccAna_Lin2d2Tan** (3 ctor) : IsDone, NbSolutions, Tangency1, Tangency2, ThisSolution, WhichQualifier
- **GccAna_Lin2dBisec** : Intersection1, Intersection2, IsDone, NbSolutions, ThisSolution
- **GccAna_Lin2dTanObl** (2 ctor) : Intersection2, IsDone, NbSolutions, Tangency1, ThisSolution, WhichQualifier
- **GccAna_Lin2dTanPar** (2 ctor) : IsDone, NbSolutions, Tangency1, ThisSolution, WhichQualifier
- **GccAna_Lin2dTanPer** (4 ctor) : Intersection2, IsDone, NbSolutions, Tangency1, ThisSolution, WhichQualifier
- **GccAna_LinPnt2dBisec** : IsDone, ThisSolution
- **GccAna_NoSolution** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **GccAna_Pnt2dBisec** : HasSolution, IsDone, ThisSolution

## GccEnt

- **GccEnt_Array1OfPosition** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **GccEnt_BadQualifier** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **GccEnt_Position** · *statiques :* GccEnt_enclosed, GccEnt_enclosing, GccEnt_noqualifier, GccEnt_outside, GccEnt_unqualified
- **GccEnt_QualifiedCirc** : IsEnclosed, IsEnclosing, IsOutside, IsUnqualified, Qualified, Qualifier
- **GccEnt_QualifiedLin** : IsEnclosed, IsOutside, IsUnqualified, Qualified, Qualifier

## GccInt

- **GccInt_BCirc** ← GccInt_Bisec : ArcType, Circle, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **GccInt_BElips** ← GccInt_Bisec : ArcType, DynamicType, Ellipse · *statiques :* get_type_descriptor, get_type_name
- **GccInt_BHyper** ← GccInt_Bisec : ArcType, DynamicType, Hyperbola · *statiques :* get_type_descriptor, get_type_name
- **GccInt_BLine** ← GccInt_Bisec : ArcType, DynamicType, Line · *statiques :* get_type_descriptor, get_type_name
- **GccInt_BParab** ← GccInt_Bisec : ArcType, DynamicType, Parabola · *statiques :* get_type_descriptor, get_type_name
- **GccInt_BPoint** ← GccInt_Bisec : ArcType, DynamicType, Point · *statiques :* get_type_descriptor, get_type_name
- **GccInt_Bisec** ← Standard_Transient : ArcType, Circle, DynamicType, Ellipse, Hyperbola, Line, Parabola, Point · *statiques :* get_type_descriptor, get_type_name
- **GccInt_IType** · *statiques :* GccInt_Cir, GccInt_Ell, GccInt_Hpr, GccInt_Lin, GccInt_Par, GccInt_Pnt

## gce

- **gce_ErrorType** · *statiques :* gce_BadAngle, gce_BadEquation, gce_ColinearPoints, gce_ConfusedPoints, gce_Done, gce_IntersectionError, gce_InvertAxis, gce_InvertRadius, gce_NegativeRadius, gce_NullAngle, gce_NullAxis, gce_NullFocusLength, gce_NullRadius, gce_NullVector
- **gce_MakeCirc** ← gce_Root (8 ctor) : Operator, Value
- **gce_MakeCirc2d** ← gce_Root (7 ctor) : Operator, Value
- **gce_MakeCone** ← gce_Root (7 ctor) : Operator, Value
- **gce_MakeCylinder** ← gce_Root (6 ctor) : Operator, Value
- **gce_MakeDir** ← gce_Root (4 ctor) : Operator, Value
- **gce_MakeDir2d** ← gce_Root (4 ctor) : Operator, Value
- **gce_MakeElips** ← gce_Root (2 ctor) : Operator, Value
- **gce_MakeElips2d** ← gce_Root (3 ctor) : Operator, Value
- **gce_MakeHypr** ← gce_Root (2 ctor) : Operator, Value
- **gce_MakeHypr2d** ← gce_Root (3 ctor) : Operator, Value
- **gce_MakeLin** ← gce_Root (4 ctor) : Operator, Value
- **gce_MakeLin2d** ← gce_Root (6 ctor) : Operator, Value
- **gce_MakeMirror** (6 ctor) : Operator, Value
- **gce_MakeMirror2d** (4 ctor) : Operator, Value
- **gce_MakeParab** ← gce_Root (2 ctor) : Operator, Value
- **gce_MakeParab2d** ← gce_Root (4 ctor) : Operator, Value
- **gce_MakePln** ← gce_Root (8 ctor) : Operator, Value
- **gce_MakeRotation** (3 ctor) : Operator, Value
- **gce_MakeRotation2d** : Operator, Value
- **gce_MakeScale** : Operator, Value
- **gce_MakeScale2d** : Operator, Value
- **gce_MakeTranslation** (2 ctor) : Operator, Value
- **gce_MakeTranslation2d** (2 ctor) : Operator, Value
- **gce_Root** : IsDone, Status

## GCE2d

- **GCE2d_MakeArcOfCircle** ← GCE2d_Root (5 ctor) : Value
- **GCE2d_MakeArcOfEllipse** ← GCE2d_Root (3 ctor) : Value
- **GCE2d_MakeArcOfHyperbola** ← GCE2d_Root (3 ctor) : Value
- **GCE2d_MakeArcOfParabola** ← GCE2d_Root (3 ctor) : Value
- **GCE2d_MakeCircle** ← GCE2d_Root (8 ctor) : Value
- **GCE2d_MakeEllipse** ← GCE2d_Root (4 ctor) : Value
- **GCE2d_MakeHyperbola** ← GCE2d_Root (4 ctor) : Value
- **GCE2d_MakeLine** ← GCE2d_Root (6 ctor) : Value
- **GCE2d_MakeMirror** (4 ctor) : Value
- **GCE2d_MakeParabola** ← GCE2d_Root (5 ctor) : Value
- **GCE2d_MakeRotation** : Value
- **GCE2d_MakeScale** : Value
- **GCE2d_MakeSegment** ← GCE2d_Root (5 ctor) : Value
- **GCE2d_MakeTranslation** (2 ctor) : Value
- **GCE2d_Root** : IsDone, Status

## GCPnts

- **GCPnts_AbscissaPoint** (9 ctor) : IsDone, Parameter · *statiques :* Length
- **GCPnts_AbscissaType** · *statiques :* GCPnts_AbsComposite, GCPnts_LengthParametrized, GCPnts_Parametrized
- **GCPnts_DeflectionType** · *statiques :* GCPnts_Circular, GCPnts_Curved, GCPnts_DefComposite, GCPnts_Linear
- **GCPnts_DistFunction2dMV** ← math_MultipleVarFunction : NbVariables, Value
- **GCPnts_DistFunctionMV** ← math_MultipleVarFunction : NbVariables, Value
- **GCPnts_QuasiUniformAbscissa** (5 ctor) : Initialize, IsDone, NbPoints, Parameter
- **GCPnts_QuasiUniformDeflection** (5 ctor) : Deflection, Initialize, IsDone, NbPoints, Parameter, Value
- **GCPnts_TangentialDeflection** (5 ctor) : AddPoint, Initialize, NbPoints, Parameter, Value · *statiques :* ArcAngularStep
- **GCPnts_UniformAbscissa** (9 ctor) : Abscissa, Initialize, IsDone, NbPoints, Parameter
- **GCPnts_UniformDeflection** (5 ctor) : Deflection, Initialize, IsDone, NbPoints, Parameter, Value

## Geom

- **Geom_Axis1Placement** ← Geom_AxisPlacement (2 ctor) : Ax1, Copy, DynamicType, Reverse, Reversed, SetDirection, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom_Axis2Placement** ← Geom_AxisPlacement (2 ctor) : Ax2, Copy, DynamicType, SetAx2, SetDirection, SetXDirection, SetYDirection, Transform, XDirection, YDirection · *statiques :* get_type_descriptor, get_type_name
- **Geom_AxisPlacement** ← Geom_Geometry : Angle, Axis, Direction, DynamicType, Location, SetAxis, SetDirection, SetLocation · *statiques :* get_type_descriptor, get_type_name
- **Geom_BSplineCurve** ← Geom_BoundedCurve (2 ctor) : Continuity, Copy, D0, D1, D2, D3, DN, Degree, DynamicType, EndPoint, FirstParameter, FirstUKnotIndex, IncreaseDegree, IncreaseMultiplicity, IncrementMultiplicity, InsertKnot, InsertKnots, IsCN, IsClosed, IsEqual, IsG1, IsPeriodic, IsRational, Knot, KnotDistribution, KnotSequence, Knots, LastParameter, LastUKnotIndex, LocalD0, LocalD1, LocalD2, LocalD3, LocalDN, LocalValue, LocateU, MovePoint, MovePointAndTangent, Multiplicities, Multiplicity, NbKnots, NbPoles, PeriodicNormalization, Pole, Poles, RemoveKnot, Resolution, Reverse, ReversedParameter, Segment, SetKnot, SetKnots, SetNotPeriodic, SetOrigin, SetPeriodic, SetPole, SetWeight, StartPoint, Transform, Weight, Weights · *statiques :* MaxDegree, get_type_descriptor, get_type_name
- **Geom_BSplineSurface** ← Geom_BoundedSurface (2 ctor) : Bounds, CheckAndSegment, Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, ExchangeUV, FirstUKnotIndex, FirstVKnotIndex, IncreaseDegree, IncreaseUMultiplicity, IncreaseVMultiplicity, IncrementUMultiplicity, IncrementVMultiplicity, InsertUKnot, InsertUKnots, InsertVKnot, InsertVKnots, IsCNu, IsCNv, IsUClosed, IsUPeriodic, IsURational, IsVClosed, IsVPeriodic, IsVRational, LastUKnotIndex, LastVKnotIndex, LocalD0, LocalD1, LocalD2, LocalD3, LocalDN, LocalValue, LocateU, LocateV, MovePoint, NbUKnots, NbUPoles, NbVKnots, NbVPoles, PeriodicNormalization, Pole, Poles, RemoveUKnot, RemoveVKnot, Resolution, Segment, SetPole, SetPoleCol, SetPoleRow, SetUKnot, SetUKnots, SetUNotPeriodic, SetUOrigin, SetUPeriodic, SetVKnot, SetVKnots, SetVNotPeriodic, SetVOrigin, SetVPeriodic, SetWeight, SetWeightCol, SetWeightRow, Transform, UDegree, UIso, UKnot, UKnotDistribution, UKnotSequence, UKnots, UMultiplicities, UMultiplicity, UReverse, UReversedParameter, VDegree, VIso, VKnot, VKnotDistribution, VKnotSequence, VKnots, VMultiplicities, VMultiplicity, VReverse, VReversedParameter, Weight, Weights · *statiques :* MaxDegree, get_type_descriptor, get_type_name
- **Geom_BezierCurve** ← Geom_BoundedCurve (2 ctor) : Continuity, Copy, D0, D1, D2, D3, DN, Degree, DynamicType, EndPoint, FirstParameter, Increase, InsertPoleAfter, InsertPoleBefore, IsCN, IsClosed, IsPeriodic, IsRational, LastParameter, NbPoles, Pole, Poles, RemovePole, Resolution, Reverse, ReversedParameter, Segment, SetPole, SetWeight, StartPoint, Transform, Weight, Weights · *statiques :* MaxDegree, get_type_descriptor, get_type_name
- **Geom_BezierSurface** ← Geom_BoundedSurface (2 ctor) : Bounds, Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, ExchangeUV, Increase, InsertPoleColAfter, InsertPoleColBefore, InsertPoleRowAfter, InsertPoleRowBefore, IsCNu, IsCNv, IsUClosed, IsUPeriodic, IsURational, IsVClosed, IsVPeriodic, IsVRational, NbUPoles, NbVPoles, Pole, Poles, RemovePoleCol, RemovePoleRow, Resolution, Segment, SetPole, SetPoleCol, SetPoleRow, SetWeight, SetWeightCol, SetWeightRow, Transform, UDegree, UIso, UReverse, UReversedParameter, VDegree, VIso, VReverse, VReversedParameter, Weight, Weights · *statiques :* MaxDegree, get_type_descriptor, get_type_name
- **Geom_BoundedCurve** ← Geom_Curve : DynamicType, EndPoint, StartPoint · *statiques :* get_type_descriptor, get_type_name
- **Geom_BoundedSurface** ← Geom_Surface : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Geom_CartesianPoint** ← Geom_Point (2 ctor) : Coord, Copy, DynamicType, Pnt, SetCoord, SetPnt, SetX, SetY, SetZ, Transform, X, Y, Z · *statiques :* get_type_descriptor, get_type_name
- **Geom_Circle** ← Geom_Conic (2 ctor) : Circ, Copy, D0, D1, D2, D3, DN, DynamicType, Eccentricity, FirstParameter, IsClosed, IsPeriodic, LastParameter, Radius, ReversedParameter, SetCirc, SetRadius, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom_Conic** ← Geom_Curve : Axis, Continuity, DynamicType, Eccentricity, IsCN, Location, Position, Reverse, ReversedParameter, SetAxis, SetLocation, SetPosition, XAxis, YAxis · *statiques :* get_type_descriptor, get_type_name
- **Geom_ConicalSurface** ← Geom_ElementarySurface (2 ctor) : Apex, Bounds, Coefficients, Cone, Copy, D0, D1, D2, D3, DN, DynamicType, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, ParametricTransformation, RefRadius, SemiAngle, SetCone, SetRadius, SetSemiAngle, Transform, TransformParameters, UIso, UReversedParameter, VIso, VReverse, VReversedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_Curve** ← Geom_Geometry : Continuity, D0, D1, D2, D3, DN, DynamicType, FirstParameter, IsCN, IsClosed, IsPeriodic, LastParameter, ParametricTransformation, Period, Reverse, Reversed, ReversedParameter, TransformedParameter, Value · *statiques :* get_type_descriptor, get_type_name
- **Geom_CylindricalSurface** ← Geom_ElementarySurface (2 ctor) : Bounds, Coefficients, Copy, Cylinder, D0, D1, D2, D3, DN, DynamicType, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, ParametricTransformation, Radius, SetCylinder, SetRadius, Transform, TransformParameters, UIso, UReversedParameter, VIso, VReversedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_Direction** ← Geom_Vector (2 ctor) : Copy, Cross, CrossCross, CrossCrossed, Crossed, Dir, DynamicType, Magnitude, SetCoord, SetDir, SetX, SetY, SetZ, SquareMagnitude, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom_ElementarySurface** ← Geom_Surface : Axis, Continuity, DynamicType, IsCNu, IsCNv, Location, Position, SetAxis, SetLocation, SetPosition, UReverse, UReversedParameter, VReverse, VReversedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_Ellipse** ← Geom_Conic (2 ctor) : Copy, D0, D1, D2, D3, DN, Directrix1, Directrix2, DynamicType, Eccentricity, Elips, FirstParameter, Focal, Focus1, Focus2, IsClosed, IsPeriodic, LastParameter, MajorRadius, MinorRadius, Parameter, ReversedParameter, SetElips, SetMajorRadius, SetMinorRadius, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom_Geometry** ← Standard_Transient : Copy, DynamicType, Mirror, Mirrored, Rotate, Rotated, Scale, Scaled, Transform, Transformed, Translate, Translated · *statiques :* get_type_descriptor, get_type_name
- **Geom_Hyperbola** ← Geom_Conic (2 ctor) : Asymptote1, Asymptote2, ConjugateBranch1, ConjugateBranch2, Copy, D0, D1, D2, D3, DN, Directrix1, Directrix2, DynamicType, Eccentricity, FirstParameter, Focal, Focus1, Focus2, Hypr, IsClosed, IsPeriodic, LastParameter, MajorRadius, MinorRadius, OtherBranch, Parameter, ReversedParameter, SetHypr, SetMajorRadius, SetMinorRadius, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom_Line** ← Geom_Curve (3 ctor) : Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, FirstParameter, IsCN, IsClosed, IsPeriodic, LastParameter, Lin, ParametricTransformation, Position, Reverse, ReversedParameter, SetDirection, SetLin, SetLocation, SetPosition, Transform, TransformedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_OffsetCurve** ← Geom_Curve : BasisCurve, Continuity, Copy, D0, D1, D2, D3, DN, Direction, DynamicType, FirstParameter, GetBasisCurveContinuity, IsCN, IsClosed, IsPeriodic, LastParameter, Offset, ParametricTransformation, Period, Reverse, ReversedParameter, SetBasisCurve, SetDirection, SetOffsetValue, Transform, TransformedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_OffsetSurface** ← Geom_Surface : BasisSurface, Bounds, Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, GetBasisSurfContinuity, IsCNu, IsCNv, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, Offset, OsculatingSurface, ParametricTransformation, SetBasisSurface, SetOffsetValue, Surface, Transform, TransformParameters, UIso, UOsculatingSurface, UPeriod, UReverse, UReversedParameter, VIso, VOsculatingSurface, VPeriod, VReverse, VReversedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_OsculatingSurface** ← Standard_Transient (2 ctor) : BasisSurface, DynamicType, Init, Tolerance, UOscSurf, VOscSurf · *statiques :* get_type_descriptor, get_type_name
- **Geom_Parabola** ← Geom_Conic (3 ctor) : Copy, D0, D1, D2, D3, DN, Directrix, DynamicType, Eccentricity, FirstParameter, Focal, Focus, IsClosed, IsPeriodic, LastParameter, Parab, Parameter, ParametricTransformation, ReversedParameter, SetFocal, SetParab, Transform, TransformedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_Plane** ← Geom_ElementarySurface (4 ctor) : Bounds, Coefficients, Copy, D0, D1, D2, D3, DN, DynamicType, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, ParametricTransformation, Pln, SetPln, Transform, TransformParameters, UIso, UReverse, UReversedParameter, VIso, VReverse, VReversedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_Point** ← Geom_Geometry : Coord, Distance, DynamicType, Pnt, SquareDistance, X, Y, Z · *statiques :* get_type_descriptor, get_type_name
- **Geom_RectangularTrimmedSurface** ← Geom_BoundedSurface (2 ctor) : BasisSurface, Bounds, Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, IsCNu, IsCNv, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, ParametricTransformation, SetTrim, Transform, TransformParameters, UIso, UPeriod, UReverse, UReversedParameter, VIso, VPeriod, VReverse, VReversedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_SphericalSurface** ← Geom_ElementarySurface (2 ctor) : Area, Bounds, Coefficients, Copy, D0, D1, D2, D3, DN, DynamicType, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, Radius, SetRadius, SetSphere, Sphere, Transform, UIso, UReversedParameter, VIso, VReversedParameter, Volume · *statiques :* get_type_descriptor, get_type_name
- **Geom_Surface** ← Geom_Geometry : Bounds, Continuity, D0, D1, D2, D3, DN, DynamicType, IsCNu, IsCNv, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, ParametricTransformation, TransformParameters, UIso, UPeriod, UReverse, UReversed, UReversedParameter, VIso, VPeriod, VReverse, VReversed, VReversedParameter, Value · *statiques :* get_type_descriptor, get_type_name
- **Geom_SurfaceOfLinearExtrusion** ← Geom_SweptSurface : Bounds, Copy, D0, D1, D2, D3, DN, DynamicType, IsCNu, IsCNv, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, ParametricTransformation, SetBasisCurve, SetDirection, Transform, TransformParameters, UIso, UReverse, UReversedParameter, VIso, VReverse, VReversedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_SurfaceOfRevolution** ← Geom_SweptSurface : Axis, Bounds, Copy, D0, D1, D2, D3, DN, DynamicType, IsCNu, IsCNv, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, Location, ParametricTransformation, ReferencePlane, SetAxis, SetBasisCurve, SetDirection, SetLocation, Transform, TransformParameters, UIso, UReverse, UReversedParameter, VIso, VReverse, VReversedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_SweptSurface** ← Geom_Surface : BasisCurve, Continuity, Direction, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Geom_ToroidalSurface** ← Geom_ElementarySurface (2 ctor) : Area, Bounds, Coefficients, Copy, D0, D1, D2, D3, DN, DynamicType, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, MajorRadius, MinorRadius, SetMajorRadius, SetMinorRadius, SetTorus, Torus, Transform, UIso, UReversedParameter, VIso, VReversedParameter, Volume · *statiques :* get_type_descriptor, get_type_name
- **Geom_Transformation** ← Standard_Transient (2 ctor) : Copy, DynamicType, Form, Invert, Inverted, IsNegative, Multiplied, Multiply, Power, Powered, PreMultiply, ScaleFactor, SetMirror, SetRotation, SetScale, SetTransformation, SetTranslation, SetTrsf, Transforms, Trsf, Value · *statiques :* get_type_descriptor, get_type_name
- **Geom_TrimmedCurve** ← Geom_BoundedCurve : BasisCurve, Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, EndPoint, FirstParameter, IsCN, IsClosed, IsPeriodic, LastParameter, ParametricTransformation, Period, Reverse, ReversedParameter, SetTrim, StartPoint, Transform, TransformedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom_UndefinedDerivative** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Geom_UndefinedValue** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Geom_Vector** ← Geom_Geometry : Angle, AngleWithRef, Coord, Cross, CrossCross, CrossCrossed, Crossed, Dot, DotCross, DynamicType, Magnitude, Reverse, Reversed, SquareMagnitude, Vec, X, Y, Z · *statiques :* get_type_descriptor, get_type_name
- **Geom_VectorWithMagnitude** ← Geom_Vector (3 ctor) : Add, Added, Copy, Cross, CrossCross, CrossCrossed, Crossed, Divide, Divided, DynamicType, Magnitude, Multiplied, Multiply, Normalize, Normalized, SetCoord, SetVec, SetX, SetY, SetZ, SquareMagnitude, Subtract, Subtracted, Transform · *statiques :* get_type_descriptor, get_type_name

## Geom2d

- **Geom2d_AxisPlacement** ← Geom2d_Geometry (2 ctor) : Angle, Ax2d, Copy, Direction, DynamicType, Location, Reverse, Reversed, SetAxis, SetDirection, SetLocation, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_BSplineCurve** ← Geom2d_BoundedCurve (2 ctor) : Continuity, Copy, D0, D1, D2, D3, DN, Degree, DynamicType, EndPoint, FirstParameter, FirstUKnotIndex, IncreaseDegree, IncreaseMultiplicity, IncrementMultiplicity, InsertKnot, InsertKnots, InsertPoleAfter, InsertPoleBefore, IsCN, IsClosed, IsG1, IsPeriodic, IsRational, Knot, KnotDistribution, KnotSequence, Knots, LastParameter, LastUKnotIndex, LocalD0, LocalD1, LocalD2, LocalD3, LocalDN, LocalValue, LocateU, MovePoint, MovePointAndTangent, Multiplicities, Multiplicity, NbKnots, NbPoles, PeriodicNormalization, Pole, Poles, RemoveKnot, RemovePole, Resolution, Reverse, ReversedParameter, Segment, SetKnot, SetKnots, SetNotPeriodic, SetOrigin, SetPeriodic, SetPole, SetWeight, StartPoint, Transform, Weight, Weights · *statiques :* MaxDegree, get_type_descriptor, get_type_name
- **Geom2d_BezierCurve** ← Geom2d_BoundedCurve (2 ctor) : Continuity, Copy, D0, D1, D2, D3, DN, Degree, DynamicType, EndPoint, FirstParameter, Increase, InsertPoleAfter, InsertPoleBefore, IsCN, IsClosed, IsPeriodic, IsRational, LastParameter, NbPoles, Pole, Poles, RemovePole, Resolution, Reverse, ReversedParameter, Segment, SetPole, SetWeight, StartPoint, Transform, Weight, Weights · *statiques :* MaxDegree, get_type_descriptor, get_type_name
- **Geom2d_BoundedCurve** ← Geom2d_Curve : DynamicType, EndPoint, StartPoint · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_CartesianPoint** ← Geom2d_Point (2 ctor) : Coord, Copy, DynamicType, Pnt2d, SetCoord, SetPnt2d, SetX, SetY, Transform, X, Y · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Circle** ← Geom2d_Conic (3 ctor) : Circ2d, Copy, D0, D1, D2, D3, DN, DynamicType, Eccentricity, FirstParameter, IsClosed, IsPeriodic, LastParameter, Radius, ReversedParameter, SetCirc2d, SetRadius, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Conic** ← Geom2d_Curve : Continuity, DynamicType, Eccentricity, IsCN, Location, Position, Reverse, ReversedParameter, SetAxis, SetLocation, SetXAxis, SetYAxis, XAxis, YAxis · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Curve** ← Geom2d_Geometry : Continuity, D0, D1, D2, D3, DN, DynamicType, FirstParameter, IsCN, IsClosed, IsPeriodic, LastParameter, ParametricTransformation, Period, Reverse, Reversed, ReversedParameter, TransformedParameter, Value · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Direction** ← Geom2d_Vector (2 ctor) : Copy, Crossed, Dir2d, DynamicType, Magnitude, SetCoord, SetDir2d, SetX, SetY, SquareMagnitude, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Ellipse** ← Geom2d_Conic (3 ctor) : Copy, D0, D1, D2, D3, DN, Directrix1, Directrix2, DynamicType, Eccentricity, Elips2d, FirstParameter, Focal, Focus1, Focus2, IsClosed, IsPeriodic, LastParameter, MajorRadius, MinorRadius, Parameter, ReversedParameter, SetElips2d, SetMajorRadius, SetMinorRadius, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Geometry** ← Standard_Transient : Copy, DynamicType, Mirror, Mirrored, Rotate, Rotated, Scale, Scaled, Transform, Transformed, Translate, Translated · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Hyperbola** ← Geom2d_Conic (3 ctor) : Asymptote1, Asymptote2, ConjugateBranch1, ConjugateBranch2, Copy, D0, D1, D2, D3, DN, Directrix1, Directrix2, DynamicType, Eccentricity, FirstParameter, Focal, Focus1, Focus2, Hypr2d, IsClosed, IsPeriodic, LastParameter, MajorRadius, MinorRadius, OtherBranch, Parameter, ReversedParameter, SetHypr2d, SetMajorRadius, SetMinorRadius, Transform · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Line** ← Geom2d_Curve (3 ctor) : Continuity, Copy, D0, D1, D2, D3, DN, Direction, Distance, DynamicType, FirstParameter, IsCN, IsClosed, IsPeriodic, LastParameter, Lin2d, Location, ParametricTransformation, Position, Reverse, ReversedParameter, SetDirection, SetLin2d, SetLocation, SetPosition, Transform, TransformedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_OffsetCurve** ← Geom2d_Curve : BasisCurve, Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, FirstParameter, GetBasisCurveContinuity, IsCN, IsClosed, IsPeriodic, LastParameter, Offset, ParametricTransformation, Period, Reverse, ReversedParameter, SetBasisCurve, SetOffsetValue, Transform, TransformedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Parabola** ← Geom2d_Conic (4 ctor) : Copy, D0, D1, D2, D3, DN, Directrix, DynamicType, Eccentricity, FirstParameter, Focal, Focus, IsClosed, IsPeriodic, LastParameter, Parab2d, Parameter, ParametricTransformation, ReversedParameter, SetFocal, SetParab2d, Transform, TransformedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Point** ← Geom2d_Geometry : Coord, Distance, DynamicType, Pnt2d, SquareDistance, X, Y · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_Transformation** ← Standard_Transient (2 ctor) : Copy, DynamicType, Form, Invert, Inverted, IsNegative, Multiplied, Multiply, Power, Powered, PreMultiply, ScaleFactor, SetMirror, SetRotation, SetScale, SetTransformation, SetTranslation, SetTrsf2d, Transforms, Trsf2d, Value · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_TrimmedCurve** ← Geom2d_BoundedCurve : BasisCurve, Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, EndPoint, FirstParameter, IsCN, IsClosed, IsPeriodic, LastParameter, ParametricTransformation, Period, Reverse, ReversedParameter, SetTrim, StartPoint, Transform, TransformedParameter · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_UndefinedDerivative** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Geom2d_UndefinedValue** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Geom2d_Vector** ← Geom2d_Geometry : Angle, Coord, Crossed, Dot, DynamicType, Magnitude, Reverse, Reversed, SquareMagnitude, Vec2d, X, Y · *statiques :* get_type_descriptor, get_type_name
- **Geom2d_VectorWithMagnitude** ← Geom2d_Vector (3 ctor) : Add, Added, Copy, Crossed, Divide, Divided, DynamicType, Magnitude, Multiplied, Multiply, Normalize, Normalized, SetCoord, SetVec2d, SetX, SetY, SquareMagnitude, Subtract, Subtracted, Transform · *statiques :* get_type_descriptor, get_type_name

## Geom2dAdaptor

- **Geom2dAdaptor_Curve** ← Adaptor2d_Curve2d (3 ctor) : BSpline, Bezier, Circle, Continuity, Curve, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, Load, NbIntervals, NbKnots, NbPoles, NbSamples, Parabola, Period, Reset, Resolution, Trim, Value
- **Geom2dAdaptor_GHCurve** ← Adaptor2d_HCurve2d (2 ctor) : ChangeCurve2d, Curve2d, DynamicType, Set · *statiques :* get_type_descriptor, get_type_name
- **Geom2dAdaptor_HCurve** ← Geom2dAdaptor_GHCurve (4 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name

## Geom2dConvert

- **Geom2dConvert_ApproxCurve** (2 ctor) : Curve, Dump, HasResult, IsDone, MaxError
- **Geom2dConvert_BSplineCurveKnotSplitting** : NbSplits, SplitValue, Splitting
- **Geom2dConvert_BSplineCurveToBezierCurve** (2 ctor) : Arc, Arcs, Knots, NbArcs
- **Geom2dConvert_CompCurveToBSplineCurve** (2 ctor) : Add, BSplineCurve, Clear

## Geom2dEvaluator

- **Geom2dEvaluator_Curve** ← Standard_Transient : D0, D1, D2, D3, DN, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Geom2dEvaluator_OffsetCurve** ← Geom2dEvaluator_Curve (2 ctor) : D0, D1, D2, D3, DN, DynamicType, SetOffsetValue · *statiques :* get_type_descriptor, get_type_name

## Geom2dGcc

- **Geom2dGcc_Type1** · *statiques :* Geom2dGcc_CiCiCu, Geom2dGcc_CiCuCu, Geom2dGcc_CiLiCu, Geom2dGcc_CuCuCu, Geom2dGcc_LiCuCu, Geom2dGcc_LiLiCu
- **Geom2dGcc_Type2** · *statiques :* Geom2dGcc_CiCuOnCi, Geom2dGcc_CiCuOnCu, Geom2dGcc_CiCuOnLi, Geom2dGcc_CuCuOnCi, Geom2dGcc_CuCuOnCu, Geom2dGcc_CuCuOnLi, Geom2dGcc_CuPtOnCi, Geom2dGcc_CuPtOnCu, Geom2dGcc_CuPtOnLi, Geom2dGcc_LiCuOnCi, Geom2dGcc_LiCuOnCu, Geom2dGcc_LiCuOnLi
- **Geom2dGcc_Type3** · *statiques :* Geom2dGcc_CiCu, Geom2dGcc_CuCu

## Geom2dLProp

- **Geom2dLProp_CLProps2d** (3 ctor) : CentreOfCurvature, Curvature, D1, D2, D3, IsTangentDefined, Normal, SetCurve, SetParameter, Tangent, Value
- **Geom2dLProp_CurAndInf2d** ← LProp_CurAndInf : IsDone, Perform, PerformCurExt, PerformInf
- **Geom2dLProp_Curve2dTool** · *statiques :* Continuity, D1, D2, D3, FirstParameter, LastParameter, Value
- **Geom2dLProp_FuncCurExt** ← math_FunctionWithDerivative : Derivative, IsMinKC, Value, Values
- **Geom2dLProp_FuncCurNul** ← math_FunctionWithDerivative : Derivative, Value, Values
- **Geom2dLProp_NumericCurInf2d** : IsDone, PerformCurExt, PerformInf

## Geom2dToIGES

- **Geom2dToIGES_Geom2dCurve** ← Geom2dToIGES_Geom2dEntity (2 ctor) : Transfer2dCurve
- **Geom2dToIGES_Geom2dEntity** (2 ctor) : GetModel, GetUnit, SetModel, SetUnit
- **Geom2dToIGES_Geom2dPoint** ← Geom2dToIGES_Geom2dEntity (2 ctor) : Transfer2dPoint
- **Geom2dToIGES_Geom2dVector** ← Geom2dToIGES_Geom2dEntity (2 ctor) : Transfer2dVector

## GeomAbs

- **GeomAbs_BSplKnotDistribution** · *statiques :* GeomAbs_NonUniform, GeomAbs_PiecewiseBezier, GeomAbs_QuasiUniform, GeomAbs_Uniform
- **GeomAbs_CurveForm** · *statiques :* GeomAbs_CircularForm, GeomAbs_EllipticForm, GeomAbs_HyperbolicForm, GeomAbs_OtherCurveForm, GeomAbs_ParabolicForm, GeomAbs_PolylineForm
- **GeomAbs_CurveType** ★ · *statiques :* GeomAbs_BSplineCurve, GeomAbs_BezierCurve, GeomAbs_Circle, GeomAbs_Ellipse, GeomAbs_Hyperbola, GeomAbs_Line, GeomAbs_OffsetCurve, GeomAbs_OtherCurve, GeomAbs_Parabola
- **GeomAbs_IsoType** · *statiques :* GeomAbs_IsoU, GeomAbs_IsoV, GeomAbs_NoneIso
- **GeomAbs_JoinType** ★ · *statiques :* GeomAbs_Arc, GeomAbs_Intersection, GeomAbs_Tangent
- **GeomAbs_Shape** ★ · *statiques :* GeomAbs_C0, GeomAbs_C1, GeomAbs_C2, GeomAbs_C3, GeomAbs_CN, GeomAbs_G1, GeomAbs_G2
- **GeomAbs_SurfaceForm** · *statiques :* GeomAbs_ConicalForm, GeomAbs_CylindricalForm, GeomAbs_OtherSurfaceForm, GeomAbs_PlanarForm, GeomAbs_QuadricForm, GeomAbs_RevolutionForm, GeomAbs_RuledForm, GeomAbs_SphericalForm, GeomAbs_ToroidalForm
- **GeomAbs_SurfaceType** ★ · *statiques :* GeomAbs_BSplineSurface, GeomAbs_BezierSurface, GeomAbs_Cone, GeomAbs_Cylinder, GeomAbs_OffsetSurface, GeomAbs_OtherSurface, GeomAbs_Plane, GeomAbs_Sphere, GeomAbs_SurfaceOfExtrusion, GeomAbs_SurfaceOfRevolution, GeomAbs_Torus
- **GeomAbs_UVSense** · *statiques :* GeomAbs_OppositeUV, GeomAbs_SameU, GeomAbs_SameUV, GeomAbs_SameV

## GeomAdaptor

- **GeomAdaptor_Curve** ← Adaptor3d_Curve (3 ctor) : BSpline, Bezier, Circle, Continuity, Curve, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, Load, NbIntervals, NbKnots, NbPoles, OffsetCurve, Parabola, Period, Reset, Resolution, Trim, Value
- **GeomAdaptor_GHCurve** ← Adaptor3d_HCurve (2 ctor) : ChangeCurve, Curve, DynamicType, GetCurve, Set · *statiques :* get_type_descriptor, get_type_name
- **GeomAdaptor_GHSurface** ← Adaptor3d_HSurface (2 ctor) : ChangeSurface, DynamicType, Set, Surface · *statiques :* get_type_descriptor, get_type_name
- **GeomAdaptor_HCurve** ← GeomAdaptor_GHCurve (4 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **GeomAdaptor_HSurface** ← GeomAdaptor_GHSurface (4 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **GeomAdaptor_HSurfaceOfLinearExtrusion** ← Adaptor3d_HSurface (2 ctor) : ChangeSurface, DynamicType, Set, Surface · *statiques :* get_type_descriptor, get_type_name
- **GeomAdaptor_HSurfaceOfRevolution** ← Adaptor3d_HSurface (2 ctor) : ChangeSurface, DynamicType, Set, Surface · *statiques :* get_type_descriptor, get_type_name
- **GeomAdaptor_Surface** ← Adaptor3d_Surface (3 ctor) : AxeOfRevolution, BSpline, BasisCurve, BasisSurface, Bezier, Cone, Cylinder, D0, D1, D2, D3, DN, Direction, FirstUParameter, FirstVParameter, GetType, IsUClosed, IsUPeriodic, IsURational, IsVClosed, IsVPeriodic, IsVRational, LastUParameter, LastVParameter, Load, NbUIntervals, NbUKnots, NbUPoles, NbVIntervals, NbVKnots, NbVPoles, OffsetValue, Plane, Sphere, Surface, Torus, UContinuity, UDegree, UIntervals, UPeriod, UResolution, UTrim, VContinuity, VDegree, VIntervals, VPeriod, VResolution, VTrim, Value
- **GeomAdaptor_SurfaceOfLinearExtrusion** ← GeomAdaptor_Surface (3 ctor) : AxeOfRevolution, BSpline, BasisCurve, Bezier, Cone, Cylinder, Direction, FirstUParameter, FirstVParameter, GetType, IsUClosed, IsUPeriodic, IsURational, IsVClosed, IsVPeriodic, IsVRational, LastUParameter, LastVParameter, Load, NbUIntervals, NbUPoles, NbVIntervals, Plane, Sphere, Torus, UContinuity, UDegree, UIntervals, UPeriod, UResolution, UTrim, VContinuity, VIntervals, VPeriod, VResolution, VTrim
- **GeomAdaptor_SurfaceOfRevolution** ← GeomAdaptor_Surface (3 ctor) : AxeOfRevolution, Axis, BSpline, BasisCurve, Bezier, Cone, Cylinder, FirstUParameter, FirstVParameter, GetType, IsUClosed, IsUPeriodic, IsURational, IsVClosed, IsVPeriodic, IsVRational, LastUParameter, LastVParameter, Load, NbUIntervals, NbVIntervals, NbVKnots, NbVPoles, Plane, Sphere, Torus, UContinuity, UIntervals, UPeriod, UResolution, UTrim, VContinuity, VDegree, VIntervals, VPeriod, VResolution, VTrim

## GeomAPI

- **GeomAPI_ExtremaCurveCurve** (3 ctor) : Distance, Extrema, Init, LowerDistance, LowerDistanceParameters, NbExtrema, NearestPoints, Parameters, Points, TotalLowerDistance, TotalLowerDistanceParameters, TotalNearestPoints
- **GeomAPI_ExtremaCurveSurface** (3 ctor) : Distance, Extrema, Init, LowerDistance, LowerDistanceParameters, NbExtrema, NearestPoints, Parameters, Points
- **GeomAPI_ExtremaSurfaceSurface** (3 ctor) : Distance, Extrema, Init, LowerDistance, LowerDistanceParameters, NbExtrema, NearestPoints, Parameters, Points
- **GeomAPI_IntCS** (2 ctor) : IsDone, NbPoints, NbSegments, Parameters, Perform, Point, Segment
- **GeomAPI_IntSS** (2 ctor) : IsDone, Line, NbLines, Perform
- **GeomAPI_PointsToBSpline** ★ (5 ctor) : Curve, Init, IsDone
- **GeomAPI_PointsToBSplineSurface** (5 ctor) : Init, Interpolate, IsDone, Surface
- **GeomAPI_ProjectPointOnCurve** (3 ctor) : Distance, Extrema, Init, LowerDistance, LowerDistanceParameter, NbPoints, NearestPoint, Parameter, Perform, Point
- **GeomAPI_ProjectPointOnSurf** (5 ctor) : Distance, Extrema, Init, IsDone, LowerDistance, LowerDistanceParameters, NbPoints, NearestPoint, Parameters, Perform, Point, SetExtremaAlgo, SetExtremaFlag

## GeomConvert

- **GeomConvert_ApproxCurve** (2 ctor) : Curve, Dump, HasResult, IsDone, MaxError
- **GeomConvert_ApproxSurface** (2 ctor) : Dump, HasResult, IsDone, MaxError, Surface
- **GeomConvert_BSplineCurveKnotSplitting** : NbSplits, SplitValue, Splitting
- **GeomConvert_BSplineCurveToBezierCurve** (2 ctor) : Arc, Arcs, Knots, NbArcs
- **GeomConvert_BSplineSurfaceKnotSplitting** : NbUSplits, NbVSplits, Splitting, USplitValue, VSplitValue
- **GeomConvert_BSplineSurfaceToBezierSurface** (2 ctor) : NbUPatches, NbVPatches, Patch, Patches, UKnots, VKnots
- **GeomConvert_CompBezierSurfacesToBSplineSurface** (3 ctor) : IsDone, NbUKnots, NbUPoles, NbVKnots, NbVPoles, Poles, UDegree, UKnots, UMultiplicities, VDegree, VKnots, VMultiplicities
- **GeomConvert_CompCurveToBSplineCurve** (2 ctor) : Add, BSplineCurve, Clear

## GeomEvaluator

- **GeomEvaluator_Curve** ← Standard_Transient : D0, D1, D2, D3, DN, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **GeomEvaluator_OffsetCurve** ← GeomEvaluator_Curve (2 ctor) : D0, D1, D2, D3, DN, DynamicType, SetOffsetDirection, SetOffsetValue · *statiques :* get_type_descriptor, get_type_name
- **GeomEvaluator_OffsetSurface** ← GeomEvaluator_Surface (2 ctor) : D0, D1, D2, D3, DN, DynamicType, SetOffsetValue · *statiques :* get_type_descriptor, get_type_name
- **GeomEvaluator_Surface** ← Standard_Transient : D0, D1, D2, D3, DN, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **GeomEvaluator_SurfaceOfExtrusion** ← GeomEvaluator_Surface (2 ctor) : D0, D1, D2, D3, DN, DynamicType, SetDirection · *statiques :* get_type_descriptor, get_type_name
- **GeomEvaluator_SurfaceOfRevolution** ← GeomEvaluator_Surface (2 ctor) : D0, D1, D2, D3, DN, DynamicType, SetAxis, SetDirection, SetLocation · *statiques :* get_type_descriptor, get_type_name

## GeomFill

- **GeomFill_AppSurf** ← AppBlend_Approx (2 ctor) : Continuity, CriteriumWeight, Curve2d, Curve2dPoles, Curves2dDegree, Curves2dKnots, Curves2dMults, Curves2dShape, Init, IsDone, NbCurves2d, ParType, Perform, PerformSmoothing, SetContinuity, SetCriteriumWeight, SetParType, SurfPoles, SurfShape, SurfUKnots, SurfUMults, SurfVKnots, SurfVMults, SurfWeights, Surface, TolCurveOnSurf, TolReached, UDegree, VDegree
- **GeomFill_AppSweep** ← AppBlend_Approx (2 ctor) : Continuity, CriteriumWeight, Curve2d, Curve2dPoles, Curves2dDegree, Curves2dKnots, Curves2dMults, Curves2dShape, Init, IsDone, NbCurves2d, ParType, Perform, PerformSmoothing, SetContinuity, SetCriteriumWeight, SetParType, SurfPoles, SurfShape, SurfUKnots, SurfUMults, SurfVKnots, SurfVMults, SurfWeights, Surface, TolCurveOnSurf, TolReached, UDegree, VDegree
- **GeomFill_ApproxStyle** · *statiques :* GeomFill_Location, GeomFill_Section
- **GeomFill_Array1OfLocationLaw** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **GeomFill_Array1OfSectionLaw** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **GeomFill_BSplineCurves** (4 ctor) : Init, Surface
- **GeomFill_BezierCurves** (4 ctor) : Init, Surface
- **GeomFill_BoundWithSurf** ← GeomFill_Boundary : Bounds, D1, D1Norm, DynamicType, HasNormals, IsDegenerated, Norm, Reparametrize, Value · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_Boundary** ← Standard_Transient : Bounds, D1, D1Norm, DynamicType, HasNormals, IsDegenerated, Norm, Points, Reparametrize, Tol3d, Tolang, Value · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_CircularBlendFunc** ← Approx_SweepFunction : BarycentreOfSurf, D0, D1, D2, DynamicType, GetMinimalWeight, GetTolerance, Intervals, IsRational, Knots, MaximalSection, Mults, Nb2dCurves, NbIntervals, SectionShape, SetInterval, SetTolerance · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_ConstantBiNormal** ← GeomFill_TrihedronLaw : Copy, D0, D1, D2, DynamicType, GetAverageLaw, Intervals, IsConstant, IsOnlyBy3dCurve, NbIntervals, SetCurve · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_ConstrainedFilling** : Boundary, CheckApprox, CheckCoonsAlgPatch, CheckResult, CheckTgteField, Eval, Init, ReBuild, SetDomain, Surface
- **GeomFill_Coons** ← GeomFill_Filling (3 ctor) : Init
- **GeomFill_CoonsAlgPatch** ← Standard_Transient : Bound, Corner, D1U, D1V, DUV, DynamicType, Func, SetFunc, Value · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_CornerState** : Constraint, DoKill, Gap, HasConstraint, IsToKill, NorAng, TgtAng
- **GeomFill_CorrectedFrenet** ← GeomFill_TrihedronLaw (2 ctor) : Copy, D0, D1, D2, DynamicType, EvaluateBestMode, GetAverageLaw, Intervals, IsConstant, IsOnlyBy3dCurve, NbIntervals, SetCurve, SetInterval · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_CurveAndTrihedron** ← GeomFill_LocationLaw : Copy, D0, D1, D2, DynamicType, GetAverageLaw, GetCurve, GetDomain, GetInterval, GetMaximalNorm, Intervals, IsRotation, IsTranslation, NbIntervals, Rotation, SetCurve, SetInterval, SetTrsf · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_Curved** ← GeomFill_Filling (5 ctor) : Init
- **GeomFill_Darboux** ← GeomFill_TrihedronLaw : Copy, D0, D1, D2, DynamicType, GetAverageLaw, Intervals, IsConstant, IsOnlyBy3dCurve, NbIntervals · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_DegeneratedBound** ← GeomFill_Boundary : Bounds, D1, DynamicType, IsDegenerated, Reparametrize, Value · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_DiscreteTrihedron** ← GeomFill_TrihedronLaw : Copy, D0, D1, D2, DynamicType, GetAverageLaw, Init, Intervals, IsConstant, IsOnlyBy3dCurve, NbIntervals, SetCurve · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_DraftTrihedron** ← GeomFill_TrihedronLaw : Copy, D0, D1, D2, DynamicType, GetAverageLaw, Intervals, IsConstant, IsOnlyBy3dCurve, NbIntervals, SetAngle · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_EvolvedSection** ← GeomFill_SectionLaw : BSplineSurface, BarycentreOfSurf, ConstantSection, D0, D1, D2, DynamicType, GetDomain, GetInterval, GetMinimalWeight, GetTolerance, Intervals, IsConstant, IsRational, IsUPeriodic, IsVPeriodic, Knots, MaximalSection, Mults, NbIntervals, SectionShape, SetInterval · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_Filling** : NbUPoles, NbVPoles, Poles, Weights, isRational
- **GeomFill_FillingStyle** · *statiques :* GeomFill_CoonsStyle, GeomFill_CurvedStyle, GeomFill_StretchStyle
- **GeomFill_Fixed** ← GeomFill_TrihedronLaw : Copy, D0, D1, D2, DynamicType, GetAverageLaw, Intervals, IsConstant, NbIntervals · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_Frenet** ← GeomFill_TrihedronLaw : Copy, D0, D1, D2, DynamicType, GetAverageLaw, Init, Intervals, IsConstant, IsOnlyBy3dCurve, NbIntervals, SetCurve · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_FunctionDraft** ← math_FunctionSetWithDerivatives : Deriv2T, Deriv2X, DerivT, DerivTX, Derivatives, NbEquations, NbVariables, Value, Values
- **GeomFill_Generator** ← GeomFill_Profiler : Perform, Surface
- **GeomFill_GuideTrihedronAC** ← GeomFill_TrihedronWithGuide : Copy, D0, D1, D2, DynamicType, GetAverageLaw, Guide, Intervals, IsConstant, IsOnlyBy3dCurve, NbIntervals, Origine, SetCurve, SetInterval · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_GuideTrihedronPlan** ← GeomFill_TrihedronWithGuide : Copy, D0, D1, D2, DynamicType, ErrorStatus, GetAverageLaw, Guide, Intervals, IsConstant, IsOnlyBy3dCurve, NbIntervals, Origine, SetCurve, SetInterval · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_Line** ← Standard_Transient (2 ctor) : DynamicType, NbPoints, Point · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_LocFunction** : D0, D1, D2, DN
- **GeomFill_LocationDraft** ← GeomFill_LocationLaw : Copy, D0, D1, D2, Direction, DynamicType, GetAverageLaw, GetCurve, GetDomain, GetInterval, GetMaximalNorm, HasFirstRestriction, HasLastRestriction, Intervals, IsIntersec, IsRotation, IsTranslation, NbIntervals, Resolution, Rotation, SetAngle, SetCurve, SetInterval, SetStopSurf, SetTrsf, TraceNumber · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_LocationGuide** ← GeomFill_LocationLaw : ComputeAutomaticLaw, Copy, D0, D1, D2, DynamicType, EraseRotation, ErrorStatus, GetAverageLaw, GetCurve, GetDomain, GetInterval, GetMaximalNorm, Guide, HasFirstRestriction, HasLastRestriction, Intervals, IsRotation, IsTranslation, NbIntervals, Resolution, Rotation, Section, Set, SetCurve, SetInterval, SetOrigine, SetTolerance, SetTrsf, TraceNumber · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_LocationLaw** ← Standard_Transient : Copy, D0, D1, D2, DynamicType, ErrorStatus, GetAverageLaw, GetCurve, GetDomain, GetInterval, GetMaximalNorm, HasFirstRestriction, HasLastRestriction, Intervals, IsRotation, IsTranslation, Nb2dCurves, NbIntervals, Resolution, Rotation, SetCurve, SetInterval, SetTolerance, SetTrsf, TraceNumber · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_Pipe** (10 ctor) : ErrorOnSurf, ExchangeUV, GenerateParticularCase, Init, IsDone, Perform, Surface
- **GeomFill_PipeError** · *statiques :* GeomFill_ImpossibleContact, GeomFill_PipeNotOk, GeomFill_PipeOk, GeomFill_PlaneNotIntersectGuide
- **GeomFill_PlanFunc** ← math_FunctionWithDerivative : D2, D2E, DEDT, Derivative, Value, Values
- **GeomFill_PolynomialConvertor** : Init, Initialized, Section
- **GeomFill_Profiler** : AddCurve, Curve, Degree, IsPeriodic, KnotsAndMults, NbKnots, NbPoles, Perform, Poles, Weights
- **GeomFill_QuasiAngularConvertor** : Init, Initialized, Section
- **GeomFill_SectionGenerator** ← GeomFill_Profiler : GetShape, Knots, Mults, Parameter, Section, SetParam
- **GeomFill_SectionLaw** ← Standard_Transient : BSplineSurface, BarycentreOfSurf, CirclSection, ConstantSection, D0, D1, D2, DynamicType, GetDomain, GetInterval, GetMinimalWeight, GetTolerance, Intervals, IsConicalLaw, IsConstant, IsRational, IsUPeriodic, IsVPeriodic, Knots, MaximalSection, Mults, NbIntervals, SectionShape, SetInterval, SetTolerance · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_SectionPlacement** : Angle, Distance, IsDone, ModifiedSection, ParameterOnPath, ParameterOnSection, Perform, Section, SetLocation, Transformation
- **GeomFill_SimpleBound** ← GeomFill_Boundary : Bounds, D1, DynamicType, IsDegenerated, Reparametrize, Value · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_SnglrFunc** ← Adaptor3d_Curve : D0, D1, D2, D3, DN, FirstParameter, GetType, Intervals, IsPeriodic, LastParameter, NbIntervals, Period, Resolution, SetRatio, Value
- **GeomFill_Stretch** ← GeomFill_Filling (3 ctor) : Init
- **GeomFill_Sweep** : Build, ErrorOnRestriction, ErrorOnSurface, ErrorOnTrace, ExchangeUV, IsDone, NumberOfTrace, Restriction, SetDomain, SetForceApproxC1, SetTolerance, Surface, Trace, UReversed, VReversed
- **GeomFill_SweepFunction** ← Approx_SweepFunction : BarycentreOfSurf, D0, D1, D2, DynamicType, GetMinimalWeight, GetTolerance, Intervals, IsRational, Knots, MaximalSection, Mults, Nb2dCurves, NbIntervals, Resolution, SectionShape, SetInterval, SetTolerance · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_Tensor** : ChangeValue, Init, Multiply, Value
- **GeomFill_TgtField** ← Standard_Transient : D1, DynamicType, IsScalable, Scale, Value · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_TgtOnCoons** ← GeomFill_TgtField : D1, DynamicType, Value · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_Trihedron** · *statiques :* GeomFill_IsConstantNormal, GeomFill_IsCorrectedFrenet, GeomFill_IsDarboux, GeomFill_IsDiscreteTrihedron, GeomFill_IsFixed, GeomFill_IsFrenet, GeomFill_IsGuideAC, GeomFill_IsGuideACWithContact, GeomFill_IsGuidePlan, GeomFill_IsGuidePlanWithContact
- **GeomFill_TrihedronLaw** ← Standard_Transient : Copy, D0, D1, D2, DynamicType, ErrorStatus, GetAverageLaw, GetInterval, Intervals, IsConstant, IsOnlyBy3dCurve, NbIntervals, SetCurve, SetInterval · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_TrihedronWithGuide** ← GeomFill_TrihedronLaw : CurrentPointOnGuide, DynamicType, Guide, Origine · *statiques :* get_type_descriptor, get_type_name
- **GeomFill_UniformSection** ← GeomFill_SectionLaw : BSplineSurface, BarycentreOfSurf, ConstantSection, D0, D1, D2, DynamicType, GetDomain, GetInterval, GetMinimalWeight, GetTolerance, Intervals, IsConstant, IsRational, IsUPeriodic, IsVPeriodic, Knots, MaximalSection, Mults, NbIntervals, SectionShape, SetInterval · *statiques :* get_type_descriptor, get_type_name

## GeomInt

- **GeomInt_BSpGradient_BFGSOfMyBSplGradientOfTheComputeLineOfWLApprox** ← math_BFGS : IsSolutionReached
- **GeomInt_BSpParFunctionOfMyBSplGradientOfTheComputeLineOfWLApprox** ← math_MultipleVarFunctionWithGradient : CurveValue, DerivativeFunctionMatrix, Error, FirstConstraint, FunctionMatrix, Gradient, Index, LastConstraint, MaxError2d, MaxError3d, NbVariables, NewParameters, SetFirstLambda, SetLastLambda, Value, Values
- **GeomInt_BSpParLeastSquareOfMyBSplGradientOfTheComputeLineOfWLApprox** (4 ctor) : BSplineValue, BezierValue, DerivativeFunctionMatrix, Distance, Error, ErrorGradient, FirstLambda, FunctionMatrix, IsDone, KIndex, LastLambda, Perform, Points, Poles
- **GeomInt_Gradient_BFGSOfMyGradientOfTheComputeLineBezierOfWLApprox** ← math_BFGS : IsSolutionReached
- **GeomInt_Gradient_BFGSOfMyGradientbisOfTheComputeLineOfWLApprox** ← math_BFGS : IsSolutionReached
- **GeomInt_LineConstructor** : IsDone, Load, NbParts, Part, Perform
- **GeomInt_LineTool** · *statiques :* DecompositionOfWLine, FirstParameter, LastParameter, NbVertex, Vertex
- **GeomInt_MyBSplGradientOfTheComputeLineOfWLApprox** (2 ctor) : AverageError, Error, IsDone, MaxError2d, MaxError3d, Value
- **GeomInt_MyGradientOfTheComputeLineBezierOfWLApprox** : AverageError, Error, IsDone, MaxError2d, MaxError3d, Value
- **GeomInt_MyGradientbisOfTheComputeLineOfWLApprox** : AverageError, Error, IsDone, MaxError2d, MaxError3d, Value
- **GeomInt_ParFunctionOfMyGradientOfTheComputeLineBezierOfWLApprox** ← math_MultipleVarFunctionWithGradient : CurveValue, Error, FirstConstraint, Gradient, LastConstraint, MaxError2d, MaxError3d, NbVariables, NewParameters, Value, Values
- **GeomInt_ParFunctionOfMyGradientbisOfTheComputeLineOfWLApprox** ← math_MultipleVarFunctionWithGradient : CurveValue, Error, FirstConstraint, Gradient, LastConstraint, MaxError2d, MaxError3d, NbVariables, NewParameters, Value, Values
- **GeomInt_ParLeastSquareOfMyGradientOfTheComputeLineBezierOfWLApprox** (4 ctor) : BSplineValue, BezierValue, DerivativeFunctionMatrix, Distance, Error, ErrorGradient, FirstLambda, FunctionMatrix, IsDone, KIndex, LastLambda, Perform, Points, Poles
- **GeomInt_ParLeastSquareOfMyGradientbisOfTheComputeLineOfWLApprox** (4 ctor) : BSplineValue, BezierValue, DerivativeFunctionMatrix, Distance, Error, ErrorGradient, FirstLambda, FunctionMatrix, IsDone, KIndex, LastLambda, Perform, Points, Poles
- **GeomInt_ParameterAndOrientation** (2 ctor) : Orientation1, Orientation2, Parameter, SetOrientation1, SetOrientation2
- **GeomInt_TheComputeLineBezierOfWLApprox** (4 ctor) : ChangeValue, Error, Init, IsAllApproximated, IsToleranceReached, NbMultiCurves, Parameters, Parametrization, Perform, SetConstraints, SetDegrees, SetTolerances, SplineValue, Value
- **GeomInt_TheComputeLineOfWLApprox** (4 ctor) : ChangeValue, Error, Init, Interpol, IsAllApproximated, IsToleranceReached, Parameters, Perform, SetConstraints, SetContinuity, SetDegrees, SetKnots, SetKnotsAndMultiplicities, SetParameters, SetPeriodic, SetTolerances, Value
- **GeomInt_TheFunctionOfTheInt2SOfThePrmPrmSvSurfacesOfWLApprox** ← math_FunctionSetWithDerivatives : AuxillarSurface1, AuxillarSurface2, ComputeParameters, Derivatives, Direction, DirectionOnS1, DirectionOnS2, IsTangent, NbEquations, NbVariables, Point, Root, Value, Values
- **GeomInt_TheImpPrmSvSurfacesOfWLApprox** ← ApproxInt_SvSurfaces (2 ctor) : Compute, FillInitialVectorOfSolution, Pnt, SeekPoint, Tangency, TangencyOnSurf1, TangencyOnSurf2
- **GeomInt_TheInt2SOfThePrmPrmSvSurfacesOfWLApprox** (2 ctor) : ChangePoint, Direction, DirectionOnS1, DirectionOnS2, Function, IsDone, IsEmpty, IsTangent, Perform, Point
- **GeomInt_TheMultiLineOfWLApprox** (3 ctor) : Dump, FirstPoint, LastPoint, MakeMLBetween, MakeMLOneMorePoint, NbP2d, NbP3d, Tangency, Value, WhatStatus
- **GeomInt_TheMultiLineToolOfWLApprox** · *statiques :* Curvature, Dump, FirstPoint, LastPoint, MakeMLBetween, MakeMLOneMorePoint, NbP2d, NbP3d, Tangency, Value, WhatStatus
- **GeomInt_ThePrmPrmSvSurfacesOfWLApprox** ← ApproxInt_SvSurfaces : Compute, Pnt, SeekPoint, Tangency, TangencyOnSurf1, TangencyOnSurf2
- **GeomInt_TheZerImpFuncOfTheImpPrmSvSurfacesOfWLApprox** ← math_FunctionSetWithDerivatives (3 ctor) : Derivatives, Direction2d, Direction3d, ISurface, IsTangent, NbEquations, NbVariables, PSurface, Point, Root, Set, SetImplicitSurface, Tolerance, Value, Values

## GeomLib

- **GeomLib_Array1OfMat** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **GeomLib_Check2dBSplineCurve** : FixTangent, FixedTangent, IsDone, NeedTangentFix
- **GeomLib_CheckBSplineCurve** : FixTangent, FixedTangent, IsDone, NeedTangentFix
- **GeomLib_CheckCurveOnSurface** (2 ctor) : Curve, ErrorStatus, Init, IsDone, MaxDistance, MaxParameter, Perform, Range, Surface
- **GeomLib_DenominatorMultiplier** : Value
- **GeomLib_Interpolate** : Curve, Error, IsDone
- **GeomLib_InterpolationErrors** · *statiques :* GeomLib_DegreeSmallerThan3, GeomLib_InversionProblem, GeomLib_NoError, GeomLib_NotEnoughtPoints
- **GeomLib_IsPlanarSurface** : IsPlanar, Plan
- **GeomLib_LogSample** ← math_FunctionSample : GetParameter
- **GeomLib_MakeCurvefromApprox** : Curve, Curve2d, Curve2dFromTwo1d, IsDone, Nb1DSpaces, Nb2DSpaces, Nb3DSpaces
- **GeomLib_PolyFunc** ← math_FunctionWithDerivative : Derivative, Value, Values
- **GeomLib_Tool** · *statiques :* Parameter, Parameters

## GeomLProp

- **GeomLProp_CLProps** (3 ctor) : CentreOfCurvature, Curvature, D1, D2, D3, IsTangentDefined, Normal, SetCurve, SetParameter, Tangent, Value
- **GeomLProp_CurveTool** · *statiques :* Continuity, D1, D2, D3, FirstParameter, LastParameter, Value
- **GeomLProp_SLProps** ★ (3 ctor) : CurvatureDirections, D1U, D1V, D2U, D2V, DUV, GaussianCurvature, IsCurvatureDefined, IsNormalDefined, IsTangentUDefined, IsTangentVDefined, IsUmbilic, MaxCurvature, MeanCurvature, MinCurvature, Normal, SetParameters, SetSurface, TangentU, TangentV, Value
- **GeomLProp_SurfaceTool** · *statiques :* Bounds, Continuity, D1, D2, DN, Value

## GeomPlate

- **GeomPlate_Aij** (2 ctor)
- **GeomPlate_Array1OfHCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **GeomPlate_Array1OfSequenceOfReal** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **GeomPlate_BuildAveragePlane** (2 ctor) : IsLine, IsPlane, Line, MinMaxBox, Plane · *statiques :* HalfSpace
- **GeomPlate_BuildPlateSurface** (3 ctor) : Add, CurveConstraint, Curves2d, Disc2dContour, Disc3dContour, G0Error, G1Error, G2Error, Init, IsDone, LoadInitSurface, Order, Perform, PointConstraint, Sense, SetNbBounds, SurfInit, Surface
- **GeomPlate_CurveConstraint** ← Standard_Transient (2 ctor) : Curve2dOnSurf, Curve3d, D0, D1, D2, DynamicType, FirstParameter, G0Criterion, G1Criterion, G2Criterion, LPropSurf, LastParameter, Length, NbPoints, Order, ProjectedCurve, SetCurve2dOnSurf, SetG0Criterion, SetG1Criterion, SetG2Criterion, SetNbPoints, SetOrder, SetProjectedCurve · *statiques :* get_type_descriptor, get_type_name
- **GeomPlate_MakeApprox** (2 ctor) : ApproxError, CriterionError, Surface
- **GeomPlate_PlateG0Criterion** ← AdvApp2Var_Criterion : IsSatisfied, Value
- **GeomPlate_PlateG1Criterion** ← AdvApp2Var_Criterion : IsSatisfied, Value
- **GeomPlate_PointConstraint** ← Standard_Transient (2 ctor) : D0, D1, D2, DynamicType, G0Criterion, G1Criterion, G2Criterion, HasPnt2dOnSurf, LPropSurf, Order, Pnt2dOnSurf, SetG0Criterion, SetG1Criterion, SetG2Criterion, SetOrder, SetPnt2dOnSurf · *statiques :* get_type_descriptor, get_type_name
- **GeomPlate_Surface** ← Geom_Surface : Bounds, CallSurfinit, Constraints, Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, IsCNu, IsCNv, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, ParametricTransformation, RealBounds, SetBounds, Transform, TransformParameters, UIso, UPeriod, UReverse, UReversedParameter, VIso, VPeriod, VReverse, VReversedParameter · *statiques :* get_type_descriptor, get_type_name

## GeomToIGES

- **GeomToIGES_GeomCurve** ← GeomToIGES_GeomEntity (2 ctor) : TransferCurve
- **GeomToIGES_GeomEntity** (2 ctor) : GetModel, GetUnit, SetModel, SetUnit
- **GeomToIGES_GeomPoint** ← GeomToIGES_GeomEntity (2 ctor) : TransferPoint
- **GeomToIGES_GeomSurface** ← GeomToIGES_GeomEntity (2 ctor) : GetAnalyticMode, GetBRepMode, Length, SetAnalyticMode, SetBRepMode, TransferConicalSurface, TransferCylindricalSurface, TransferPlaneSurface, TransferSphericalSurface, TransferSurface, TransferToroidalSurface
- **GeomToIGES_GeomVector** ← GeomToIGES_GeomEntity (2 ctor) : TransferVector

## GeomTools

- **GeomTools_Curve2dSet** : Add, Clear, Curve2d, Dump, GetProgress, Index, Read, SetProgress, Write · *statiques :* PrintCurve2d, ReadCurve2d
- **GeomTools_CurveSet** : Add, Clear, Curve, Dump, GetProgress, Index, Read, SetProgress, Write · *statiques :* PrintCurve, ReadCurve
- **GeomTools_SurfaceSet** : Add, Clear, Dump, GetProgress, Index, Read, SetProgress, Surface, Write · *statiques :* PrintSurface, ReadSurface

## GeomToStep

- **GeomToStep_MakeAxis1Placement** ← GeomToStep_Root (4 ctor) : Value
- **GeomToStep_MakeAxis2Placement2d** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakeAxis2Placement3d** ← GeomToStep_Root (5 ctor) : Value
- **GeomToStep_MakeBSplineCurveWithKnots** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakeBSplineCurveWithKnotsAndRationalBSplineCurve** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakeBSplineSurfaceWithKnots** ← GeomToStep_Root : Value
- **GeomToStep_MakeBSplineSurfaceWithKnotsAndRationalBSplineSurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeBoundedCurve** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakeBoundedSurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeCartesianPoint** ← GeomToStep_Root (4 ctor) : Value
- **GeomToStep_MakeCircle** ← GeomToStep_Root (3 ctor) : Value
- **GeomToStep_MakeConic** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakeConicalSurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeCurve** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakeCylindricalSurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeDirection** ← GeomToStep_Root (4 ctor) : Value
- **GeomToStep_MakeElementarySurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeEllipse** ← GeomToStep_Root (3 ctor) : Value
- **GeomToStep_MakeHyperbola** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakeLine** ← GeomToStep_Root (4 ctor) : Value
- **GeomToStep_MakeParabola** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakePlane** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakePolyline** ← GeomToStep_Root (2 ctor) : Value
- **GeomToStep_MakeRectangularTrimmedSurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeSphericalSurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeSurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeSurfaceOfLinearExtrusion** ← GeomToStep_Root : Value
- **GeomToStep_MakeSurfaceOfRevolution** ← GeomToStep_Root : Value
- **GeomToStep_MakeSweptSurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeToroidalSurface** ← GeomToStep_Root : Value
- **GeomToStep_MakeVector** ← GeomToStep_Root (4 ctor) : Value
- **GeomToStep_Root** : IsDone

## get

- **get_first_emval**

## gp

- **gp_Ax1** ★ (2 ctor) : Angle, Direction, IsCoaxial, IsNormal, IsOpposite, IsParallel, Location, Mirror, Mirrored, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetDirection, SetLocation, Transform, Transformed, Translate, Translated
- **gp_Ax2** ★ (3 ctor) : Angle, Axis, Direction, IsCoplanar, Location, Mirror, Mirrored, Rotate, Rotated, Scale, Scaled, SetAxis, SetDirection, SetLocation, SetXDirection, SetYDirection, Transform, Transformed, Translate, Translated, XDirection, YDirection
- **gp_Ax22d** (4 ctor) : Location, Mirror, Mirrored, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetXAxis, SetXDirection, SetYAxis, SetYDirection, Transform, Transformed, Translate, Translated, XAxis, XDirection, YAxis, YDirection
- **gp_Ax2d** (2 ctor) : Angle, Direction, IsCoaxial, IsNormal, IsOpposite, IsParallel, Location, Mirror, Mirrored, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetDirection, SetLocation, Transform, Transformed, Translate, Translated
- **gp_Ax3** (4 ctor) : Angle, Ax2, Axis, Direct, Direction, IsCoplanar, Location, Mirror, Mirrored, Rotate, Rotated, Scale, Scaled, SetAxis, SetDirection, SetLocation, SetXDirection, SetYDirection, Transform, Transformed, Translate, Translated, XDirection, XReverse, YDirection, YReverse, ZReverse
- **gp_Circ** ★ (2 ctor) : Area, Axis, Contains, Distance, Length, Location, Mirror, Mirrored, Position, Radius, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetPosition, SetRadius, SquareDistance, Transform, Transformed, Translate, Translated, XAxis, YAxis
- **gp_Circ2d** (3 ctor) : Area, Axis, Coefficients, Contains, Distance, IsDirect, Length, Location, Mirror, Mirrored, Position, Radius, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetRadius, SetXAxis, SetYAxis, SquareDistance, Transform, Transformed, Translate, Translated, XAxis, YAxis
- **gp_Cone** (2 ctor) : Apex, Axis, Coefficients, Direct, Location, Mirror, Mirrored, Position, RefRadius, Rotate, Rotated, Scale, Scaled, SemiAngle, SetAxis, SetLocation, SetPosition, SetRadius, SetSemiAngle, Transform, Transformed, Translate, Translated, UReverse, VReverse, XAxis, YAxis
- **gp_Cylinder** (2 ctor) : Axis, Coefficients, Direct, Location, Mirror, Mirrored, Position, Radius, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetPosition, SetRadius, Transform, Transformed, Translate, Translated, UReverse, VReverse, XAxis, YAxis
- **gp_Dir** ★ (4 ctor) : Angle, AngleWithRef, Coord, Cross, CrossCross, CrossCrossed, Crossed, Dot, DotCross, IsEqual, IsNormal, IsOpposite, IsParallel, Mirror, Mirrored, Reverse, Reversed, Rotate, Rotated, SetCoord, SetX, SetXYZ, SetY, SetZ, Transform, Transformed, X, XYZ, Y, Z
- **gp_Dir2d** (4 ctor) : Angle, Coord, Crossed, Dot, IsEqual, IsNormal, IsOpposite, IsParallel, Mirror, Mirrored, Reverse, Reversed, Rotate, Rotated, SetCoord, SetX, SetXY, SetY, Transform, Transformed, X, XY, Y
- **gp_Elips** (2 ctor) : Area, Axis, Directrix1, Directrix2, Eccentricity, Focal, Focus1, Focus2, Location, MajorRadius, MinorRadius, Mirror, Mirrored, Parameter, Position, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetMajorRadius, SetMinorRadius, SetPosition, Transform, Transformed, Translate, Translated, XAxis, YAxis
- **gp_Elips2d** (3 ctor) : Area, Axis, Coefficients, Directrix1, Directrix2, Eccentricity, Focal, Focus1, Focus2, IsDirect, Location, MajorRadius, MinorRadius, Mirror, Mirrored, Parameter, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetMajorRadius, SetMinorRadius, SetXAxis, SetYAxis, Transform, Transformed, Translate, Translated, XAxis, YAxis
- **gp_EulerSequence** · *statiques :* gp_EulerAngles, gp_Extrinsic_XYX, gp_Extrinsic_XYZ, gp_Extrinsic_XZX, gp_Extrinsic_XZY, gp_Extrinsic_YXY, gp_Extrinsic_YXZ, gp_Extrinsic_YZX, gp_Extrinsic_YZY, gp_Extrinsic_ZXY, gp_Extrinsic_ZXZ, gp_Extrinsic_ZYX, gp_Extrinsic_ZYZ, gp_Intrinsic_XYX, gp_Intrinsic_XYZ, gp_Intrinsic_XZX, gp_Intrinsic_XZY, gp_Intrinsic_YXY, gp_Intrinsic_YXZ, gp_Intrinsic_YZX, gp_Intrinsic_YZY, gp_Intrinsic_ZXY, gp_Intrinsic_ZXZ, gp_Intrinsic_ZYX, gp_Intrinsic_ZYZ, gp_YawPitchRoll
- **gp_GTrsf** ★ (3 ctor) : Form, Invert, Inverted, IsNegative, IsSingular, Multiplied, Multiply, Power, Powered, PreMultiply, SetAffinity, SetForm, SetTranslationPart, SetTrsf, SetValue, SetVectorialPart, Transforms, TranslationPart, Trsf, Value, VectorialPart
- **gp_GTrsf2d** (3 ctor) : Form, Invert, Inverted, IsNegative, IsSingular, Multiplied, Multiply, Power, Powered, PreMultiply, SetAffinity, SetTranslationPart, SetTrsf2d, SetValue, SetVectorialPart, Transformed, Transforms, TranslationPart, Trsf2d, Value, VectorialPart
- **gp_Hypr** (2 ctor) : Asymptote1, Asymptote2, Axis, ConjugateBranch1, ConjugateBranch2, Directrix1, Directrix2, Eccentricity, Focal, Focus1, Focus2, Location, MajorRadius, MinorRadius, Mirror, Mirrored, OtherBranch, Parameter, Position, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetMajorRadius, SetMinorRadius, SetPosition, Transform, Transformed, Translate, Translated, XAxis, YAxis
- **gp_Hypr2d** (3 ctor) : Asymptote1, Asymptote2, Axis, Coefficients, ConjugateBranch1, ConjugateBranch2, Directrix1, Directrix2, Eccentricity, Focal, Focus1, Focus2, IsDirect, Location, MajorRadius, MinorRadius, Mirror, Mirrored, OtherBranch, Parameter, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetMajorRadius, SetMinorRadius, SetXAxis, SetYAxis, Transform, Transformed, Translate, Translated, XAxis, YAxis
- **gp_Lin** (3 ctor) : Angle, Contains, Direction, Distance, Location, Mirror, Mirrored, Normal, Position, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetDirection, SetLocation, SetPosition, SquareDistance, Transform, Transformed, Translate, Translated
- **gp_Lin2d** (4 ctor) : Angle, Coefficients, Contains, Direction, Distance, Location, Mirror, Mirrored, Normal, Position, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetDirection, SetLocation, SetPosition, SquareDistance, Transform, Transformed, Translate, Translated
- **gp_Mat** (3 ctor) : Add, Added, ChangeValue, Column, Determinant, Diagonal, Divide, Divided, DumpJson, Invert, Inverted, IsSingular, Multiplied, Multiply, Power, Powered, PreMultiply, Row, SetCol, SetCols, SetCross, SetDiagonal, SetDot, SetIdentity, SetRotation, SetRow, SetRows, SetScale, SetValue, Subtract, Subtracted, Transpose, Transposed, Value
- **gp_Mat2d** (2 ctor) : Add, Added, ChangeValue, Column, Determinant, Diagonal, Divide, Divided, Invert, Inverted, IsSingular, Multiplied, Multiply, Power, Powered, PreMultiply, Row, SetCol, SetCols, SetDiagonal, SetIdentity, SetRotation, SetRow, SetRows, SetScale, SetValue, Subtract, Subtracted, Transpose, Transposed, Value
- **gp_Parab** (3 ctor) : Axis, Directrix, Focal, Focus, Location, Mirror, Mirrored, Parameter, Position, Rotate, Rotated, Scale, Scaled, SetAxis, SetFocal, SetLocation, SetPosition, Transform, Transformed, Translate, Translated, XAxis, YAxis
- **gp_Parab2d** (4 ctor) : Axis, Coefficients, Directrix, Focal, Focus, IsDirect, Location, Mirror, MirrorAxis, Mirrored, Parameter, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetAxis, SetFocal, SetLocation, SetMirrorAxis, Transform, Transformed, Translate, Translated
- **gp_Pln** ★ (4 ctor) : Axis, Coefficients, Contains, Direct, Distance, Location, Mirror, Mirrored, Position, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetPosition, SquareDistance, Transform, Transformed, Translate, Translated, UReverse, VReverse, XAxis, YAxis
- **gp_Pnt** ★ (3 ctor) : BaryCenter, ChangeCoord, Coord, Distance, IsEqual, Mirror, Mirrored, Rotate, Rotated, Scale, Scaled, SetCoord, SetX, SetXYZ, SetY, SetZ, SquareDistance, Transform, Transformed, Translate, Translated, X, XYZ, Y, Z
- **gp_Pnt2d** (3 ctor) : ChangeCoord, Coord, Distance, IsEqual, Mirror, Mirrored, Rotate, Rotated, Scale, Scaled, SetCoord, SetX, SetXY, SetY, SquareDistance, Transform, Transformed, Translate, Translated, X, XY, Y
- **gp_Quaternion** (7 ctor) : Add, Added, Dot, GetEulerAngles, GetMatrix, GetRotationAngle, GetVectorAndAngle, Invert, Inverted, IsEqual, Multiplied, Multiply, Negated, Norm, Normalize, Normalized, Reverse, Reversed, Scale, Scaled, Set, SetEulerAngles, SetIdent, SetMatrix, SetRotation, SetVectorAndAngle, SquareNorm, StabilizeLength, Subtract, Subtracted, W, X, Y, Z
- **gp_QuaternionNLerp** (2 ctor) : Init, InitFromUnit, Interpolate · *statiques :* Interpolate
- **gp_QuaternionSLerp** (2 ctor) : Init, InitFromUnit, Interpolate · *statiques :* Interpolate
- **gp_Sphere** (2 ctor) : Area, Coefficients, Direct, Location, Mirror, Mirrored, Position, Radius, Rotate, Rotated, Scale, Scaled, SetLocation, SetPosition, SetRadius, Transform, Transformed, Translate, Translated, UReverse, VReverse, Volume, XAxis, YAxis
- **gp_Torus** (2 ctor) : Area, Axis, Coefficients, Direct, Location, MajorRadius, MinorRadius, Mirror, Mirrored, Position, Rotate, Rotated, Scale, Scaled, SetAxis, SetLocation, SetMajorRadius, SetMinorRadius, SetPosition, Transform, Transformed, Translate, Translated, UReverse, VReverse, Volume, XAxis, YAxis
- **gp_Trsf** ★ (2 ctor) : DumpJson, Form, GetRotation, HVectorialPart, Invert, Inverted, IsNegative, Multiplied, Multiply, Power, Powered, PreMultiply, ScaleFactor, SetDisplacement, SetForm, SetMirror, SetRotation, SetScale, SetScaleFactor, SetTransformation, SetTranslation, SetTranslationPart, SetValues, Transforms, TranslationPart, Value, VectorialPart
- **gp_Trsf2d** (2 ctor) : Form, HVectorialPart, Invert, Inverted, IsNegative, Multiplied, Multiply, Power, Powered, PreMultiply, RotationPart, ScaleFactor, SetMirror, SetRotation, SetScale, SetScaleFactor, SetTransformation, SetTranslation, SetTranslationPart, SetValues, Transforms, TranslationPart, Value, VectorialPart
- **gp_TrsfForm** · *statiques :* gp_Ax1Mirror, gp_Ax2Mirror, gp_CompoundTrsf, gp_Identity, gp_Other, gp_PntMirror, gp_Rotation, gp_Scale, gp_Translation
- **gp_Vec** ★ (5 ctor) : Add, Added, Angle, AngleWithRef, Coord, Cross, CrossCross, CrossCrossed, CrossMagnitude, CrossSquareMagnitude, Crossed, Divide, Divided, Dot, DotCross, IsEqual, IsNormal, IsOpposite, IsParallel, Magnitude, Mirror, Mirrored, Multiplied, Multiply, Normalize, Normalized, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetCoord, SetLinearForm, SetX, SetXYZ, SetY, SetZ, SquareMagnitude, Subtract, Subtracted, Transform, Transformed, X, XYZ, Y, Z
- **gp_Vec2d** (5 ctor) : Add, Added, Angle, Coord, CrossMagnitude, CrossSquareMagnitude, Crossed, Divide, Divided, Dot, GetNormal, IsEqual, IsNormal, IsOpposite, IsParallel, Magnitude, Mirror, Mirrored, Multiplied, Multiply, Normalize, Normalized, Reverse, Reversed, Rotate, Rotated, Scale, Scaled, SetCoord, SetLinearForm, SetX, SetXY, SetY, SquareMagnitude, Subtract, Subtracted, Transform, Transformed, X, XY, Y
- **gp_XY** (2 ctor) : Add, Added, ChangeCoord, Coord, CrossMagnitude, CrossSquareMagnitude, Crossed, Divide, Divided, Dot, IsEqual, Modulus, Multiplied, Multiply, Normalize, Normalized, Reverse, Reversed, SetCoord, SetLinearForm, SetX, SetY, SquareModulus, Subtract, Subtracted, X, Y
- **gp_XYZ** (2 ctor) : Add, Added, ChangeCoord, ChangeData, Coord, Cross, CrossCross, CrossCrossed, CrossMagnitude, CrossSquareMagnitude, Crossed, Divide, Divided, Dot, DotCross, DumpJson, GetData, IsEqual, Modulus, Multiplied, Multiply, Normalize, Normalized, Reverse, Reversed, SetCoord, SetLinearForm, SetX, SetY, SetZ, SquareModulus, Subtract, Subtracted, X, Y, Z

## GProp

- **GProp_CelGProps** ← GProp_GProps (4 ctor) : Perform, SetLocation
- **GProp_EquaType** · *statiques :* GProp_Line, GProp_None, GProp_Plane, GProp_Point, GProp_Space
- **GProp_GProps** ★ (2 ctor) : Add, CentreOfMass, Mass, MatrixOfInertia, MomentOfInertia, PrincipalProperties, RadiusOfGyration, StaticMoments
- **GProp_PEquation** : Box, IsLinear, IsPlanar, IsPoint, IsSpace, Line, Plane, Point
- **GProp_PGProps** ← GProp_GProps (5 ctor) : AddPoint · *statiques :* Barycentre
- **GProp_PrincipalProps** : FirstAxisOfInertia, HasSymmetryAxis, HasSymmetryPoint, Moments, RadiusOfGyration, SecondAxisOfInertia, ThirdAxisOfInertia
- **GProp_SelGProps** ← GProp_GProps (5 ctor) : Perform, SetLocation
- **GProp_UndefinedAxis** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **GProp_ValueType** · *statiques :* GProp_CenterMassX, GProp_CenterMassY, GProp_CenterMassZ, GProp_InertiaXX, GProp_InertiaXY, GProp_InertiaXZ, GProp_InertiaYY, GProp_InertiaYZ, GProp_InertiaZZ, GProp_Mass, GProp_Unknown
- **GProp_VelGProps** ← GProp_GProps (5 ctor) : Perform, SetLocation

## Graphic3d

- **Graphic3d_AlphaMode** · *statiques :* Graphic3d_AlphaMode_Blend, Graphic3d_AlphaMode_BlendAuto, Graphic3d_AlphaMode_Mask, Graphic3d_AlphaMode_Opaque
- **Graphic3d_Array1OfAttribute** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Graphic3d_ArrayOfIndexedMapOfStructure** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Graphic3d_ArrayOfPoints** ← Graphic3d_ArrayOfPrimitives (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ArrayOfPolygons** ← Graphic3d_ArrayOfPrimitives (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ArrayOfPolylines** ← Graphic3d_ArrayOfPrimitives (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ArrayOfPrimitives** ← Standard_Transient : AddBound, AddEdge, AddEdges, AddPolylineEdges, AddQuadEdges, AddQuadTriangleEdges, AddSegmentEdges, AddTriangleEdges, AddTriangleFanEdges, AddTriangleStripEdges, AddVertex, Attributes, Bound, BoundColor, BoundNumber, BoundNumberAllocated, Bounds, DynamicType, Edge, EdgeNumber, EdgeNumberAllocated, HasBoundColors, HasVertexColors, HasVertexNormals, HasVertexTexels, Indices, IsValid, ItemNumber, SetBoundColor, SetVertexColor, SetVertexNormal, SetVertexTexel, SetVertice, StringType, Type, VertexColor, VertexNormal, VertexNumber, VertexNumberAllocated, VertexTexel, Vertice · *statiques :* CreateArray, get_type_descriptor, get_type_name
- **Graphic3d_ArrayOfQuadrangleStrips** ← Graphic3d_ArrayOfPrimitives (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ArrayOfQuadrangles** ← Graphic3d_ArrayOfPrimitives (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ArrayOfSegments** ← Graphic3d_ArrayOfPrimitives (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ArrayOfTriangleFans** ← Graphic3d_ArrayOfPrimitives (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ArrayOfTriangleStrips** ← Graphic3d_ArrayOfPrimitives (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ArrayOfTriangles** ← Graphic3d_ArrayOfPrimitives (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_AspectFillArea3d** ← Graphic3d_Aspects (2 ctor) : DynamicType, Edge · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_AspectLine3d** ← Graphic3d_Aspects (2 ctor) : DynamicType, SetType, SetWidth, Type, Width · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_AspectMarker3d** ← Graphic3d_Aspects (4 ctor) : DynamicType, GetMarkerImage, GetTextureSize, Scale, SetBitMap, SetScale, SetType, Type · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_AspectText3d** ← Graphic3d_Aspects (2 ctor) : Color, ColorRGBA, DisplayType, DynamicType, Font, GetTextAngle, GetTextFontAspect, GetTextZoomable, SetColor, SetDisplayType, SetFont, SetStyle, SetTextAngle, Style · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_Aspects** ← Standard_Transient : AllowBackFace, AlphaCutoff, AlphaMode, BackFace, BackInteriorColor, BackInteriorColorRGBA, BackMaterial, ChangeBackMaterial, ChangeFrontMaterial, Color, ColorRGBA, ColorSubTitle, ColorSubTitleRGBA, Distinguish, DumpJson, DynamicType, EdgeColor, EdgeColorRGBA, EdgeLineType, EdgeWidth, FrontMaterial, HatchStyle, InteriorColor, InteriorColorRGBA, InteriorStyle, IsEqual, IsMarkerSprite, IsTextZoomable, LineType, LineWidth, MarkerImage, MarkerScale, MarkerType, PolygonOffset, PolygonOffsets, SetAlphaMode, SetBackInteriorColor, SetBackMaterial, SetColor, SetColorSubTitle, SetDistinguish, SetDistinguishOff, SetDistinguishOn, SetDrawEdges, SetDrawSilhouette, SetEdgeColor, SetEdgeLineType, SetEdgeOff, SetEdgeOn, SetEdgeWidth, SetFrontMaterial, SetHatchStyle, SetInteriorColor, SetInteriorStyle, SetLineType, SetLineWidth, SetMarkerImage, SetMarkerScale, SetMarkerType, SetPolygonOffset, SetPolygonOffsets, SetShaderProgram, SetShadingModel, SetSkipFirstEdge, SetSuppressBackFaces, SetTextAngle, SetTextDisplayType, SetTextFont, SetTextFontAspect, SetTextStyle, SetTextZoomable, SetTextureMap, SetTextureMapOff, SetTextureMapOn, SetTextureSet, ShaderProgram, ShadingModel, SuppressBackFace, TextAngle, TextDisplayType, TextFont, TextFontAspect, TextStyle, TextureMap, TextureMapState, TextureSet, ToDrawEdges, ToDrawSilhouette, ToMapTexture, ToSkipFirstEdge, ToSuppressBackFaces · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_AttribBuffer**
- **Graphic3d_AxisAspect** : Color, Name, NameColor, NameOffset, SetColor, SetDrawName, SetDrawTickmarks, SetDrawValues, SetName, SetNameColor, SetNameOffset, SetTickmarksLength, SetTickmarksNumber, SetValuesOffset, TickmarksLength, TickmarksNumber, ToDrawName, ToDrawTickmarks, ToDrawValues, ValuesOffset
- **Graphic3d_BSDF** : Normalize · *statiques :* CreateDiffuse, CreateGlass, CreateMetallic, CreateTransparent
- **Graphic3d_BoundBuffer**
- **Graphic3d_Buffer**
- **Graphic3d_BvhCStructureSet**
- **Graphic3d_BvhCStructureSetTrsfPers**
- **Graphic3d_CLight** ← Standard_Transient : Angle, Attenuation, Color, Concentration, ConstAttenuation, Direction, DynamicType, GetId, Headlight, Intensity, IsEnabled, IsHeadlight, LinearAttenuation, Name, PackedColor, PackedDirection, PackedParams, Position, Revision, SetAngle, SetAttenuation, SetColor, SetConcentration, SetDirection, SetEnabled, SetHeadlight, SetIntensity, SetName, SetPosition, SetSmoothAngle, SetSmoothRadius, Smoothness, Type · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_CStructure** ← Standard_Transient : BndBoxClipCheck, BoundingBox, ChangeBoundingBox, Clear, ClipPlanes, Connect, Disconnect, DynamicType, GraphicDriver, GraphicHighlight, GraphicUnhighlight, Groups, HighlightStyle, IsAlwaysRendered, IsCulled, IsVisible, MarkAsNotCulled, NewGroup, OnVisibilityChanged, RemoveGroup, SetBndBoxClipCheck, SetClipPlanes, SetCulled, SetTransformPersistence, SetTransformation, SetZLayer, ShadowLink, TransformPersistence, Transformation, ZLayer, updateLayerTransformation · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_CTexture**
- **Graphic3d_CView** ← Graphic3d_DataStructureManager : Activate, BackfacingModel, Background, BackgroundCubeMap, BackgroundImage, BackgroundImageStyle, BufferDump, Camera, ChangeHiddenObjects, ChangeRenderingParams, ClipPlanes, Compute, ComputedMode, ConsiderZoomPersistenceObjects, ContainsFacet, CopySettings, Deactivate, DiagnosticInformation, DisplayedStructures, DynamicType, FBO, FBOChangeViewport, FBOCreate, FBOGetDimensions, FBORelease, GetGraduatedTrihedron, GradientBackground, GraduatedTrihedronDisplay, GraduatedTrihedronErase, GraduatedTrihedronMinMaxValues, HiddenObjects, Identification, InsertLayerAfter, InsertLayerBefore, Invalidate, InvalidateBVHData, InvalidateZLayerBoundingBox, IsActive, IsComputed, IsDefined, IsInvalidated, IsRemoved, Layer, Layers, Lights, MinMaxValues, NumberOfDisplayedStructures, ReCompute, Redraw, RedrawImmediate, Remove, RemoveZLayer, RenderingParams, Resized, SetBackfacingModel, SetBackground, SetBackgroundCubeMap, SetBackgroundImage, SetBackgroundImageStyle, SetCamera, SetClipPlanes, SetComputedMode, SetFBO, SetGradientBackground, SetImmediateModeDrawToFront, SetLights, SetShadingModel, SetTextureEnv, SetVisualizationType, SetWindow, SetZLayerSettings, ShadingModel, StatisticInformation, StructureManager, TextureEnv, Update, VisualizationType, Window, ZLayerMax · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_Camera** ← Standard_Transient (2 ctor) : Aspect, AxialScale, Center, ConvertProj2View, ConvertView2Proj, ConvertView2World, ConvertWorld2View, Copy, CopyMappingData, CopyOrientationData, Direction, Distance, DynamicType, Eye, FOVy, Frustum, FrustumPoints, GetIODType, IOD, InvalidateOrientation, InvalidateProjection, IsOrthographic, IsStereo, MoveEyeTo, OrientationMatrix, OrientationMatrixF, OrthogonalizeUp, OrthogonalizedUp, Project, ProjectionMatrix, ProjectionMatrixF, ProjectionState, ProjectionStereoLeft, ProjectionStereoLeftF, ProjectionStereoRight, ProjectionStereoRightF, ProjectionType, Scale, SetAspect, SetAxialScale, SetCenter, SetDirection, SetDirectionFromEye, SetDistance, SetEye, SetEyeAndCenter, SetFOVy, SetIOD, SetProjectionType, SetScale, SetTile, SetUp, SetZFocus, SetZRange, Tile, Transform, UnProject, Up, ViewDimensions, WorldViewProjState, WorldViewState, ZFar, ZFitAll, ZFocus, ZFocusType, ZNear · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_CameraTile** : Cropped, IsValid, OffsetLowerLeft
- **Graphic3d_CappingFlags** · *statiques :* Graphic3d_CappingFlags_None, Graphic3d_CappingFlags_ObjectAspect, Graphic3d_CappingFlags_ObjectMaterial, Graphic3d_CappingFlags_ObjectShader, Graphic3d_CappingFlags_ObjectTexture
- **Graphic3d_ClipPlane** ← Standard_Transient (4 ctor) : CappingAspect, CappingColor, CappingCustomHatch, CappingHatch, CappingMaterial, CappingTexture, ChainNextPlane, ChainPreviousPlane, Clone, DynamicType, GetEquation, GetId, IsBoxFullInHalfspace, IsBoxFullOutHalfspace, IsCapping, IsChain, IsHatchOn, IsOn, IsPointOutHalfspace, MCountAspect, MCountEquation, NbChainNextPlanes, ProbeBox, ProbeBoxHalfspace, ProbeBoxMaxPointHalfspace, ProbeBoxTouch, ProbePoint, ProbePointHalfspace, ReversedEquation, SetCapping, SetCappingAspect, SetCappingColor, SetCappingCustomHatch, SetCappingHatch, SetCappingHatchOff, SetCappingHatchOn, SetCappingMaterial, SetCappingTexture, SetChainNextPlane, SetEquation, SetOn, SetUseObjectMaterial, SetUseObjectShader, SetUseObjectTexture, ToPlane, ToUseObjectMaterial, ToUseObjectProperties, ToUseObjectShader, ToUseObjectTexture · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ClipState** · *statiques :* Graphic3d_ClipState_In, Graphic3d_ClipState_On, Graphic3d_ClipState_Out
- **Graphic3d_CubeMapOrder** (3 ctor) : Clear, Get, HasOverflows, HasRepetitions, IsEmpty, IsValid, Permute, Permuted, Set, SetDefault, Swap, Swapped, Validated · *statiques :* Default
- **Graphic3d_CubeMapPacked** (2 ctor)
- **Graphic3d_CubeMapSeparate** (2 ctor)
- **Graphic3d_CubeMapSide** · *statiques :* Graphic3d_CMS_NEG_X, Graphic3d_CMS_NEG_Y, Graphic3d_CMS_NEG_Z, Graphic3d_CMS_POS_X, Graphic3d_CMS_POS_Y, Graphic3d_CMS_POS_Z
- **Graphic3d_CullingTool** : CacheClipPtsProjections, Camera, IsCulled, ProjectionMatrix, SetCullingDistance, SetCullingSize, SetViewVolume, SetViewportSize, ViewportHeight, ViewportWidth, WorldViewMatrix, WorldViewProjState
- **Graphic3d_DataStructureManager** ← Standard_Transient : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_DiagnosticInfo** · *statiques :* Graphic3d_DiagnosticInfo_Basic, Graphic3d_DiagnosticInfo_Complete, Graphic3d_DiagnosticInfo_Device, Graphic3d_DiagnosticInfo_Extensions, Graphic3d_DiagnosticInfo_FrameBuffer, Graphic3d_DiagnosticInfo_Limits, Graphic3d_DiagnosticInfo_Memory, Graphic3d_DiagnosticInfo_NativePlatform, Graphic3d_DiagnosticInfo_Short
- **Graphic3d_FrameStats** ← Standard_Transient : ActiveDataFrame, ChangeCounter, ChangeDataFrames, ChangeTimer, CounterValue, DataFrames, DynamicType, FormatStats, FrameDuration, FrameEnd, FrameRate, FrameRateCpu, FrameStart, HasCulledLayers, HasCulledStructs, IsLongLineFormat, LastDataFrame, LastDataFrameIndex, SetLongLineFormat, SetUpdateInterval, TimerValue, UpdateInterval · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_FrameStatsCounter** · *statiques :* Graphic3d_FrameStatsCounter_EstimatedBytesFbos, Graphic3d_FrameStatsCounter_EstimatedBytesGeom, Graphic3d_FrameStatsCounter_EstimatedBytesTextures, Graphic3d_FrameStatsCounter_NbElemsFillNotCulled, Graphic3d_FrameStatsCounter_NbElemsLineNotCulled, Graphic3d_FrameStatsCounter_NbElemsNotCulled, Graphic3d_FrameStatsCounter_NbElemsPointNotCulled, Graphic3d_FrameStatsCounter_NbElemsTextNotCulled, Graphic3d_FrameStatsCounter_NbGroupsNotCulled, Graphic3d_FrameStatsCounter_NbLayers, Graphic3d_FrameStatsCounter_NbLayersNotCulled, Graphic3d_FrameStatsCounter_NbPointsNotCulled, Graphic3d_FrameStatsCounter_NbStructs, Graphic3d_FrameStatsCounter_NbStructsNotCulled, Graphic3d_FrameStatsCounter_NbTrianglesNotCulled
- **Graphic3d_FrameStatsData** : CounterValue, FillMax, FrameRate, FrameRateCpu, Reset, TimerValue
- **Graphic3d_FrameStatsDataTmp** ← Graphic3d_FrameStatsData : ChangeCounterValue, ChangeFrameRate, ChangeFrameRateCpu, ChangeTimer, ChangeTimerValue, FlushTimers, Reset
- **Graphic3d_FrameStatsTimer** · *statiques :* Graphic3d_FrameStatsTimer_CpuCulling, Graphic3d_FrameStatsTimer_CpuDynamics, Graphic3d_FrameStatsTimer_CpuFrame, Graphic3d_FrameStatsTimer_CpuPicking, Graphic3d_FrameStatsTimer_ElapsedFrame
- **Graphic3d_Fresnel** : FresnelType, Serialize · *statiques :* CreateConductor, CreateConstant, CreateDielectric, CreateSchlick
- **Graphic3d_FresnelModel** · *statiques :* Graphic3d_FM_CONDUCTOR, Graphic3d_FM_CONSTANT, Graphic3d_FM_DIELECTRIC, Graphic3d_FM_SCHLICK
- **Graphic3d_GraduatedTrihedron** : ArrowsLength, AxisAspect, ChangeAxisAspect, ChangeXAxisAspect, ChangeYAxisAspect, ChangeZAxisAspect, GridColor, NamesFont, NamesFontAspect, NamesSize, SetArrowsLength, SetDrawAxes, SetDrawGrid, SetGridColor, SetNamesFont, SetNamesFontAspect, SetNamesSize, SetValuesFont, SetValuesFontAspect, SetValuesSize, ToDrawAxes, ToDrawGrid, ValuesFont, ValuesFontAspect, ValuesSize, XAxisAspect, YAxisAspect, ZAxisAspect
- **Graphic3d_GraphicDriver** ← Standard_Transient : CreateStructure, CreateView, DefaultTextHeight, DynamicType, EnableVBO, GetDisplayConnection, InquireLightLimit, InquireLimit, InquirePlaneLimit, InquireViewLimit, InsertLayerAfter, InsertLayerBefore, MemoryInfo, NewIdentification, RemoveIdentification, RemoveStructure, RemoveView, RemoveZLayer, SetZLayerSettings, TextSize, ViewExists, ZLayerSettings, ZLayers · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_Group** ← Standard_Transient : AddPrimitiveArray, AddText, Aspects, BoundingBox, ChangeBoundingBox, Clear, ContainsFacet, DumpJson, DynamicType, IsClosed, IsDeleted, IsEmpty, Marker, MinMaxValues, Remove, ReplaceAspects, SetClosed, SetFlippingOptions, SetGroupPrimitivesAspect, SetMinMaxValues, SetPrimitivesAspect, SetStencilTestOptions, Structure, SynchronizeAspects, Text · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_GroupAspect** · *statiques :* Graphic3d_ASPECT_FILL_AREA, Graphic3d_ASPECT_LINE, Graphic3d_ASPECT_MARKER, Graphic3d_ASPECT_TEXT
- **Graphic3d_GroupDefinitionError** ← Standard_OutOfRange (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Graphic3d_HatchStyle** ← Standard_Transient (2 ctor) : DynamicType, HatchType, Pattern · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_HorizontalTextAlignment** · *statiques :* Graphic3d_HTA_CENTER, Graphic3d_HTA_LEFT, Graphic3d_HTA_RIGHT
- **Graphic3d_IndexBuffer**
- **Graphic3d_Layer** ← Standard_Transient : Add, Append, ArrayOfStructures, BoundingBox, CullableStructuresBVH, CullableTrsfPersStructuresBVH, DynamicType, FrustumCullingBVHBuilder, InvalidateBVHData, InvalidateBoundingBox, IsCulled, IsImmediate, LayerId, LayerSettings, NbOfTransformPersistenceObjects, NbPriorities, NbStructures, NbStructuresNotCulled, NonCullableStructures, Remove, SetFrustumCullingBVHBuilder, SetLayerSettings, UpdateCulling, considerZoomPersistenceObjects · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_LevelOfTextureAnisotropy** · *statiques :* Graphic3d_LOTA_FAST, Graphic3d_LOTA_MIDDLE, Graphic3d_LOTA_OFF, Graphic3d_LOTA_QUALITY
- **Graphic3d_LightSet** ← Standard_Transient : Add, AmbientColor, Contains, DynamicType, Extent, IsEmpty, KeyEnabledLong, KeyEnabledShort, Lower, NbEnabled, NbEnabledLightsOfType, NbLightsOfType, Remove, Revision, UpdateRevision, Upper, Value · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_MarkerImage** ← Standard_Transient (2 ctor) : DynamicType, GetBitMapArray, GetImage, GetImageAlpha, GetImageAlphaId, GetImageId, GetTextureSize · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_MaterialAspect** (2 ctor) : Alpha, AmbientColor, BSDF, Color, DiffuseColor, EmissiveColor, IncreaseShine, IsDifferent, IsEqual, MaterialName, MaterialType, Name, ReflectionMode, RefractionIndex, RequestedName, Reset, SetAlpha, SetAmbientColor, SetBSDF, SetColor, SetDiffuseColor, SetEmissiveColor, SetMaterialName, SetMaterialType, SetReflectionModeOff, SetRefractionIndex, SetShininess, SetSpecularColor, SetTransparency, Shininess, SpecularColor, StringName, Transparency · *statiques :* MaterialFromName, MaterialName, MaterialType, NumberOfMaterials
- **Graphic3d_MaterialDefinitionError** ← Standard_OutOfRange (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Graphic3d_MediaTexture** ← Graphic3d_Texture2D : DynamicType, Frame, GenerateNewId, GetImage, SetFrame · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_MutableIndexBuffer**
- **Graphic3d_NameOfMaterial** · *statiques :* Graphic3d_NOM_ALUMINIUM, Graphic3d_NOM_BRASS, Graphic3d_NOM_BRONZE, Graphic3d_NOM_CHARCOAL, Graphic3d_NOM_CHROME, Graphic3d_NOM_COPPER, Graphic3d_NOM_DEFAULT, Graphic3d_NOM_DIAMOND, Graphic3d_NOM_GLASS, Graphic3d_NOM_GOLD, Graphic3d_NOM_JADE, Graphic3d_NOM_METALIZED, Graphic3d_NOM_NEON_GNC, Graphic3d_NOM_NEON_PHC, Graphic3d_NOM_OBSIDIAN, Graphic3d_NOM_PEWTER, Graphic3d_NOM_PLASTER, Graphic3d_NOM_PLASTIC, Graphic3d_NOM_SATIN, Graphic3d_NOM_SHINY_PLASTIC, Graphic3d_NOM_SILVER, Graphic3d_NOM_STEEL, Graphic3d_NOM_STONE, Graphic3d_NOM_TRANSPARENT, Graphic3d_NOM_UserDefined, Graphic3d_NOM_WATER
- **Graphic3d_NameOfTexture1D** · *statiques :* Graphic3d_NOT_1D_ELEVATION, Graphic3d_NOT_1D_UNKNOWN
- **Graphic3d_NameOfTexture2D** · *statiques :* Graphic3d_NOT_2D_ALIENSKIN, Graphic3d_NOT_2D_ALUMINUM, Graphic3d_NOT_2D_BLUEWHITE_PAPER, Graphic3d_NOT_2D_BLUE_ROCK, Graphic3d_NOT_2D_BRUSHED, Graphic3d_NOT_2D_BUBBLES, Graphic3d_NOT_2D_BUMP, Graphic3d_NOT_2D_CAST, Graphic3d_NOT_2D_CHESS, Graphic3d_NOT_2D_CHIPBD, Graphic3d_NOT_2D_CLOUDS, Graphic3d_NOT_2D_FLESH, Graphic3d_NOT_2D_FLOOR, Graphic3d_NOT_2D_GALVNISD, Graphic3d_NOT_2D_GRASS, Graphic3d_NOT_2D_KNURL, Graphic3d_NOT_2D_MAPLE, Graphic3d_NOT_2D_MARBLE, Graphic3d_NOT_2D_MATRA, Graphic3d_NOT_2D_MOTTLED, Graphic3d_NOT_2D_RAIN, Graphic3d_NOT_2D_ROCK, Graphic3d_NOT_2D_UNKNOWN
- **Graphic3d_NameOfTextureEnv** · *statiques :* Graphic3d_NOT_ENV_CLOUDS, Graphic3d_NOT_ENV_CV, Graphic3d_NOT_ENV_LINES, Graphic3d_NOT_ENV_MEDIT, Graphic3d_NOT_ENV_PEARL, Graphic3d_NOT_ENV_ROAD, Graphic3d_NOT_ENV_SKY1, Graphic3d_NOT_ENV_SKY2, Graphic3d_NOT_ENV_UNKNOWN
- **Graphic3d_NameOfTexturePlane** · *statiques :* Graphic3d_NOTP_UNKNOWN, Graphic3d_NOTP_XY, Graphic3d_NOTP_YZ, Graphic3d_NOTP_ZX
- **Graphic3d_PresentationAttributes** ← Standard_Transient : BasicFillAreaAspect, Color, ColorRGBA, DisplayMode, DynamicType, Method, SetBasicFillAreaAspect, SetColor, SetDisplayMode, SetMethod, SetTransparency, SetZLayer, Transparency, ZLayer · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_PriorityDefinitionError** ← Standard_OutOfRange (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Graphic3d_RenderTransparentMethod** · *statiques :* Graphic3d_RTM_BLEND_OIT, Graphic3d_RTM_BLEND_UNORDERED
- **Graphic3d_RenderingMode** · *statiques :* Graphic3d_RM_RASTERIZATION, Graphic3d_RM_RAYTRACING
- **Graphic3d_RenderingParams** : ResolutionRatio
- **Graphic3d_SequenceOfHClipPlane** ← Standard_Transient : Append, Clear, DynamicType, First, IsEmpty, Remove, SetOverrideGlobal, Size, ToOverrideGlobal · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ShaderAttribute** ← Standard_Transient : DynamicType, Location, Name · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_ShaderObject** ← Standard_Transient : DynamicType, GetId, IsDone, Path, Source, Type · *statiques :* CreateFromFile, CreateFromSource, get_type_descriptor, get_type_name
- **Graphic3d_ShaderProgram** ← Standard_Transient : AppendToHeader, AttachShader, ClearVariables, DetachShader, DynamicType, GetId, HasAlphaTest, HasDefaultSampler, HasWeightOitOutput, Header, IsDone, NbClipPlanesMax, NbFragmentOutputs, NbLightsMax, PushVariableFloat, PushVariableInt, PushVariableVec2, PushVariableVec2i, PushVariableVec3, PushVariableVec3i, PushVariableVec4, PushVariableVec4i, SetAlphaTest, SetDefaultSampler, SetHeader, SetId, SetNbClipPlanesMax, SetNbFragmentOutputs, SetNbLightsMax, SetVertexAttributes, SetWeightOitOutput, ShaderObjects, Variables, VertexAttributes · *statiques :* ShadersFolder, get_type_descriptor, get_type_name
- **Graphic3d_ShaderVariable** ← Standard_Transient : DynamicType, IsDone, Name, Value · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_StereoMode** · *statiques :* Graphic3d_StereoMode_Anaglyph, Graphic3d_StereoMode_ChessBoard, Graphic3d_StereoMode_ColumnInterlaced, Graphic3d_StereoMode_NB, Graphic3d_StereoMode_OverUnder, Graphic3d_StereoMode_QuadBuffer, Graphic3d_StereoMode_RowInterlaced, Graphic3d_StereoMode_SideBySide, Graphic3d_StereoMode_SoftPageFlip
- **Graphic3d_Structure** ← Standard_Transient : Ancestors, CStructure, CalculateBoundBox, Clear, ClipPlanes, Compute, ComputeVisual, Connect, ContainsFacet, CurrentGroup, Descendants, Disconnect, DisconnectAll, Display, DisplayPriority, DynamicType, Erase, GetZLayer, GraphicClear, GraphicConnect, GraphicDisconnect, GraphicTransform, Groups, HLRValidation, Highlight, HighlightStyle, Identification, IsDeleted, IsDisplayed, IsEmpty, IsHighlighted, IsInfinite, IsMutable, IsTransformed, IsVisible, MinMaxValues, NewGroup, NumberOfGroups, Owner, ReCompute, Remove, RemoveAll, ResetDisplayPriority, SetClipPlanes, SetComputeVisual, SetDisplayPriority, SetHLRValidation, SetInfiniteState, SetIsForHighlight, SetMutable, SetOwner, SetTransformPersistence, SetTransformation, SetVisible, SetVisual, SetZLayer, SetZoomLimit, Transform, TransformPersistence, Transformation, UnHighlight, Visual · *statiques :* AcceptConnection, Network, PrintNetwork, Transforms, get_type_descriptor, get_type_name
- **Graphic3d_StructureDefinitionError** ← Standard_OutOfRange (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Graphic3d_StructureManager** ← Standard_Transient : ChangeDisplayPriority, ChangeZLayer, Clear, Connect, DefinedViews, Disconnect, Display, DisplayedStructures, DynamicType, Erase, GraphicDriver, Highlight, HighlightedStructures, Identification, IsDeviceLost, MaxNumOfViews, ObjectAffinity, ReCompute, RecomputeStructures, RegisterObject, Remove, SetDeviceLost, SetTransform, UnHighlight, UnIdentification, UnregisterObject, Update · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_Text** ← Standard_Transient : DynamicType, HasOwnAnchorPoint, HasPlane, Height, HorizontalAlignment, Orientation, Position, ResetOrientation, SetHeight, SetHorizontalAlignment, SetOrientation, SetOwnAnchorPoint, SetPosition, SetText, SetVerticalAlignment, Text, VerticalAlignment · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_TextPath** · *statiques :* Graphic3d_TP_DOWN, Graphic3d_TP_LEFT, Graphic3d_TP_RIGHT, Graphic3d_TP_UP
- **Graphic3d_Texture1D** ← Graphic3d_TextureMap : DynamicType, Name · *statiques :* NumberOfTextures, TextureName, get_type_descriptor, get_type_name
- **Graphic3d_Texture1Dmanual** ← Graphic3d_Texture1D (3 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_Texture1Dsegment** ← Graphic3d_Texture1D (3 ctor) : DynamicType, Segment, SetSegment · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_Texture2D** ← Graphic3d_TextureMap : DynamicType, HasMipMaps, Name, SetImage, SetMipMaps · *statiques :* NumberOfTextures, TextureName, get_type_descriptor, get_type_name
- **Graphic3d_Texture2Dmanual** ← Graphic3d_Texture2D (3 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_Texture2Dplane** ← Graphic3d_Texture2D (3 ctor) : DynamicType, Plane, PlaneS, PlaneT, Rotation, ScaleS, ScaleT, SetPlane, SetPlaneS, SetPlaneT, SetRotation, SetScaleS, SetScaleT, SetTranslateS, SetTranslateT, TranslateS, TranslateT · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_TextureEnv** ← Graphic3d_TextureRoot (3 ctor) : DynamicType, Name · *statiques :* NumberOfTextures, TextureName, get_type_descriptor, get_type_name
- **Graphic3d_TextureMap** ← Graphic3d_TextureRoot : AnisoFilter, DisableModulate, DisableRepeat, DisableSmooth, DynamicType, EnableModulate, EnableRepeat, EnableSmooth, IsModulate, IsRepeat, IsSmoothed, SetAnisoFilter · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_TextureParams** ← Standard_Transient : AnisoFilter, DynamicType, Filter, GenMode, GenPlaneS, GenPlaneT, IsModulate, IsRepeat, Rotation, SamplerRevision, Scale, SetAnisoFilter, SetFilter, SetGenMode, SetModulate, SetRepeat, SetRotation, SetScale, SetTextureUnit, SetTranslation, TextureUnit, Translation · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_TextureRoot** ← Standard_Transient : DynamicType, GetId, GetImage, GetParams, IsDone, Path, Revision, Type, UpdateRevision · *statiques :* TexturesFolder, get_type_descriptor, get_type_name
- **Graphic3d_TextureSet** ← Standard_Transient (3 ctor) : DynamicType, First, IsEmpty, Lower, SetFirst, SetValue, Size, Upper, Value · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_TextureUnit** · *statiques :* Graphic3d_TextureUnit, Graphic3d_TextureUnit_BaseColor, Graphic3d_TextureUnit_EnvMap
- **Graphic3d_ToneMappingMethod** · *statiques :* Graphic3d_ToneMappingMethod_Disabled, Graphic3d_ToneMappingMethod_Filmic
- **Graphic3d_TransModeFlags** · *statiques :* Graphic3d_TMF_2d, Graphic3d_TMF_None, Graphic3d_TMF_RotatePers, Graphic3d_TMF_TriedronPers, Graphic3d_TMF_ZoomPers, Graphic3d_TMF_ZoomRotatePers
- **Graphic3d_TransformError** ← Standard_OutOfRange (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Graphic3d_TransformPers** ← Standard_Transient (3 ctor) : AnchorPoint, Corner2d, DynamicType, Flags, IsTrihedronOr2d, IsZoomOrRotate, Mode, Offset2d, SetAnchorPoint, SetCorner2d, SetOffset2d, SetPersistence · *statiques :* FromDeprecatedParams, IsTrihedronOr2d, IsZoomOrRotate, get_type_descriptor, get_type_name
- **Graphic3d_TypeOfAnswer** · *statiques :* Graphic3d_TOA_COMPUTE, Graphic3d_TOA_NO, Graphic3d_TOA_YES
- **Graphic3d_TypeOfAttribute** · *statiques :* Graphic3d_TOA_COLOR, Graphic3d_TOA_CUSTOM, Graphic3d_TOA_NORM, Graphic3d_TOA_POS, Graphic3d_TOA_UV
- **Graphic3d_TypeOfBackfacingModel** · *statiques :* Graphic3d_TOBM_AUTOMATIC, Graphic3d_TOBM_DISABLE, Graphic3d_TOBM_FORCE
- **Graphic3d_TypeOfBackground** · *statiques :* Graphic3d_TOB_CUBEMAP, Graphic3d_TOB_GRADIENT, Graphic3d_TOB_NONE, Graphic3d_TOB_TEXTURE
- **Graphic3d_TypeOfComposition** · *statiques :* Graphic3d_TOC_POSTCONCATENATE, Graphic3d_TOC_REPLACE
- **Graphic3d_TypeOfConnection** · *statiques :* Graphic3d_TOC_ANCESTOR, Graphic3d_TOC_DESCENDANT
- **Graphic3d_TypeOfData** · *statiques :* Graphic3d_TOD_FLOAT, Graphic3d_TOD_UINT, Graphic3d_TOD_USHORT, Graphic3d_TOD_VEC2, Graphic3d_TOD_VEC3, Graphic3d_TOD_VEC4, Graphic3d_TOD_VEC4UB
- **Graphic3d_TypeOfLightSource** · *statiques :* Graphic3d_TOLS_AMBIENT, Graphic3d_TOLS_DIRECTIONAL, Graphic3d_TOLS_POSITIONAL, Graphic3d_TOLS_SPOT, V3d_AMBIENT, V3d_DIRECTIONAL, V3d_POSITIONAL, V3d_SPOT
- **Graphic3d_TypeOfLimit** · *statiques :* Graphic3d_TypeOfLimit_HasBlendedOit, Graphic3d_TypeOfLimit_HasBlendedOitMsaa, Graphic3d_TypeOfLimit_HasFlatShading, Graphic3d_TypeOfLimit_HasMeshEdges, Graphic3d_TypeOfLimit_HasRayTracing, Graphic3d_TypeOfLimit_HasRayTracingAdaptiveSampling, Graphic3d_TypeOfLimit_HasRayTracingAdaptiveSamplingAtomic, Graphic3d_TypeOfLimit_HasRayTracingTextures, Graphic3d_TypeOfLimit_IsWorkaroundFBO, Graphic3d_TypeOfLimit_MaxCombinedTextureUnits, Graphic3d_TypeOfLimit_MaxMsaa, Graphic3d_TypeOfLimit_MaxNbClipPlanes, Graphic3d_TypeOfLimit_MaxNbLights, Graphic3d_TypeOfLimit_MaxNbViews, Graphic3d_TypeOfLimit_MaxTextureSize, Graphic3d_TypeOfLimit_MaxViewDumpSizeX, Graphic3d_TypeOfLimit_MaxViewDumpSizeY, Graphic3d_TypeOfLimit_NB
- **Graphic3d_TypeOfMaterial** · *statiques :* Graphic3d_MATERIAL_ASPECT, Graphic3d_MATERIAL_PHYSIC
- **Graphic3d_TypeOfPrimitiveArray** · *statiques :* Graphic3d_TOPA_LINES_ADJACENCY, Graphic3d_TOPA_LINE_STRIP_ADJACENCY, Graphic3d_TOPA_POINTS, Graphic3d_TOPA_POLYGONS, Graphic3d_TOPA_POLYLINES, Graphic3d_TOPA_QUADRANGLES, Graphic3d_TOPA_QUADRANGLESTRIPS, Graphic3d_TOPA_SEGMENTS, Graphic3d_TOPA_TRIANGLEFANS, Graphic3d_TOPA_TRIANGLES, Graphic3d_TOPA_TRIANGLESTRIPS, Graphic3d_TOPA_TRIANGLES_ADJACENCY, Graphic3d_TOPA_TRIANGLE_STRIP_ADJACENCY, Graphic3d_TOPA_UNDEFINED
- **Graphic3d_TypeOfReflection** · *statiques :* Graphic3d_TOR_AMBIENT, Graphic3d_TOR_DIFFUSE, Graphic3d_TOR_EMISSION, Graphic3d_TOR_SPECULAR
- **Graphic3d_TypeOfShaderObject** · *statiques :* Graphic3d_TOS_COMPUTE, Graphic3d_TOS_FRAGMENT, Graphic3d_TOS_GEOMETRY, Graphic3d_TOS_TESS_CONTROL, Graphic3d_TOS_TESS_EVALUATION, Graphic3d_TOS_VERTEX
- **Graphic3d_TypeOfShadingModel** · *statiques :* Graphic3d_TOSM_DEFAULT, Graphic3d_TOSM_FACET, Graphic3d_TOSM_FRAGMENT, Graphic3d_TOSM_NONE, Graphic3d_TOSM_UNLIT, Graphic3d_TOSM_VERTEX, V3d_COLOR, V3d_FLAT, V3d_GOURAUD, V3d_PHONG
- **Graphic3d_TypeOfStructure** · *statiques :* Graphic3d_TOS_ALL, Graphic3d_TOS_COMPUTED, Graphic3d_TOS_SHADING, Graphic3d_TOS_WIREFRAME
- **Graphic3d_TypeOfTexture** · *statiques :* Graphic3d_TOT_1D, Graphic3d_TOT_2D, Graphic3d_TOT_2D_MIPMAP, Graphic3d_TOT_CUBEMAP
- **Graphic3d_TypeOfTextureFilter** · *statiques :* Graphic3d_TOTF_BILINEAR, Graphic3d_TOTF_NEAREST, Graphic3d_TOTF_TRILINEAR
- **Graphic3d_TypeOfTextureMode** · *statiques :* Graphic3d_TOTM_EYE, Graphic3d_TOTM_MANUAL, Graphic3d_TOTM_OBJECT, Graphic3d_TOTM_SPHERE, Graphic3d_TOTM_SPRITE
- **Graphic3d_TypeOfVisualization** · *statiques :* Graphic3d_TOV_SHADING, Graphic3d_TOV_WIREFRAME
- **Graphic3d_ValidatedCubeMapOrder**
- **Graphic3d_Vertex** (4 ctor) : Coord, Distance, SetCoord, X, Y, Z
- **Graphic3d_VerticalTextAlignment** · *statiques :* Graphic3d_VTA_BOTTOM, Graphic3d_VTA_CENTER, Graphic3d_VTA_TOP, Graphic3d_VTA_TOPFIRSTLINE
- **Graphic3d_ViewAffinity** ← Standard_Transient : DynamicType, IsVisible, SetVisible · *statiques :* get_type_descriptor, get_type_name
- **Graphic3d_WorldViewProjState** (2 ctor) : Initialize, IsChanged, IsProjectionChanged, IsValid, IsWorldViewChanged, ProjectionState, Reset, WorldViewState
- **Graphic3d_ZLayerSetting** · *statiques :* Graphic3d_ZLayerDepthClear, Graphic3d_ZLayerDepthOffset, Graphic3d_ZLayerDepthTest, Graphic3d_ZLayerDepthWrite

## Hatch

- **Hatch_Hatcher** : AddLine, AddXLine, AddYLine, Coordinate, End, EndIndex, IsXLine, IsYLine, Line, LineForm, NbIntervals, NbLines, Start, StartIndex, Tolerance, Trim
- **Hatch_Line** (2 ctor) : AddIntersection
- **Hatch_LineForm** · *statiques :* Hatch_ANYLINE, Hatch_XLINE, Hatch_YLINE
- **Hatch_Parameter** (2 ctor)

## HatchGen

- **HatchGen_Domain** (3 ctor) : Dump, FirstPoint, HasFirstPoint, HasSecondPoint, SecondPoint, SetFirstPoint, SetPoints, SetSecondPoint
- **HatchGen_ErrorStatus** · *statiques :* HatchGen_IncoherentParity, HatchGen_IncompatibleStates, HatchGen_NoProblem, HatchGen_TransitionFailure, HatchGen_TrimFailure
- **HatchGen_IntersectionPoint** : Dump, Index, Parameter, Position, SegmentBeginning, SegmentEnd, SetIndex, SetParameter, SetPosition, SetSegmentBeginning, SetSegmentEnd, SetStateAfter, SetStateBefore, StateAfter, StateBefore
- **HatchGen_IntersectionType** · *statiques :* HatchGen_TANGENT, HatchGen_TOUCH, HatchGen_TRUE, HatchGen_UNDETERMINED
- **HatchGen_PointOnElement** ← HatchGen_IntersectionPoint (3 ctor) : Dump, IntersectionType, IsDifferent, IsIdentical, SetIntersectionType
- **HatchGen_PointOnHatching** ← HatchGen_IntersectionPoint (3 ctor) : AddPoint, ClrPoints, Dump, IsEqual, IsGreater, IsLower, NbPoints, Point, RemPoint

## HeaderSection

- **HeaderSection_FileDescription** ← Standard_Transient : Description, DescriptionValue, DynamicType, ImplementationLevel, Init, NbDescription, SetDescription, SetImplementationLevel · *statiques :* get_type_descriptor, get_type_name
- **HeaderSection_FileName** ← Standard_Transient : Author, AuthorValue, Authorisation, DynamicType, Init, Name, NbAuthor, NbOrganization, Organization, OrganizationValue, OriginatingSystem, PreprocessorVersion, SetAuthor, SetAuthorisation, SetName, SetOrganization, SetOriginatingSystem, SetPreprocessorVersion, SetTimeStamp, TimeStamp · *statiques :* get_type_descriptor, get_type_name
- **HeaderSection_FileSchema** ← Standard_Transient : DynamicType, Init, NbSchemaIdentifiers, SchemaIdentifiers, SchemaIdentifiersValue, SetSchemaIdentifiers · *statiques :* get_type_descriptor, get_type_name
- **HeaderSection_Protocol** ← StepData_Protocol : DynamicType, SchemaName, TypeNumber · *statiques :* get_type_descriptor, get_type_name

## HLRAlgo

- **HLRAlgo_Array1OfPHDat** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **HLRAlgo_Array1OfPINod** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **HLRAlgo_Array1OfPISeg** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **HLRAlgo_Array1OfTData** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **HLRAlgo_BiPoint** (7 ctor) : Hidden, Indices, IntLine, OutLine, Points, Rg1Line, RgNLine
- **HLRAlgo_Coincidence** : Set2D, SetState3D, State3D, Value2D
- **HLRAlgo_EdgeIterator** : Hidden, InitHidden, InitVisible, MoreHidden, MoreVisible, NextHidden, NextVisible, Visible
- **HLRAlgo_EdgeStatus** (2 ctor) : AllHidden, AllVisible, Bounds, Hide, HideAll, Initialize, NbVisiblePart, ShowAll, VisiblePart
- **HLRAlgo_EdgesBlock** ← Standard_Transient : Double, DynamicType, Edge, Internal, IsoLine, MinMax, NbEdges, Orientation, OutLine, UpdateMinMax · *statiques :* get_type_descriptor, get_type_name
- **HLRAlgo_Interference** (2 ctor) : Boundary, BoundaryTransition, ChangeBoundary, ChangeIntersection, Intersection, Orientation, Transition
- **HLRAlgo_InterferenceList** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **HLRAlgo_Intersection** (2 ctor) : Index, Level, Orientation, Parameter, SegIndex, State, Tolerance
- **HLRAlgo_ListOfBPoint** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **HLRAlgo_PolyAlgo** ← Standard_Transient : Clear, DynamicType, Hide, Init, InitHide, InitShow, MoreHide, MoreShow, NextHide, NextShow, PolyShell, Show, Update · *statiques :* get_type_descriptor, get_type_name
- **HLRAlgo_PolyData** ← Standard_Transient : DynamicType, FaceIndex, HNodes, HPHDat, HTData, HideByPolyData, Hiding, Indices, Nodes, PHDat, TData, UpdateGlobalMinMax · *statiques :* get_type_descriptor, get_type_name
- **HLRAlgo_PolyHidingData** : Indices, Plane, Set
- **HLRAlgo_PolyInternalData** ← Standard_Transient : AddNode, DecPINod, DecPISeg, DecTData, Dump, DynamicType, IncPINod, IncPISeg, IncTData, IntOutL, NbPINod, NbPISeg, NbTData, PINod, PISeg, Planar, TData, UpdateLinks · *statiques :* get_type_descriptor, get_type_name
- **HLRAlgo_PolyInternalNode** ← Standard_Transient : Data, DynamicType, Indices · *statiques :* get_type_descriptor, get_type_name
- **HLRAlgo_PolyMask** · *statiques :* HLRAlgo_PolyMask_EMskGrALin1, HLRAlgo_PolyMask_EMskGrALin2, HLRAlgo_PolyMask_EMskGrALin3, HLRAlgo_PolyMask_EMskOutLin1, HLRAlgo_PolyMask_EMskOutLin2, HLRAlgo_PolyMask_EMskOutLin3, HLRAlgo_PolyMask_FMskBack, HLRAlgo_PolyMask_FMskFlat, HLRAlgo_PolyMask_FMskFrBack, HLRAlgo_PolyMask_FMskHiding, HLRAlgo_PolyMask_FMskOnOutL, HLRAlgo_PolyMask_FMskOrBack, HLRAlgo_PolyMask_FMskSide
- **HLRAlgo_PolyShellData** ← Standard_Transient : DynamicType, Edges, Hiding, HidingPolyData, Indices, PolyData, UpdateGlobalMinMax, UpdateHiding · *statiques :* get_type_descriptor, get_type_name
- **HLRAlgo_Projector** (5 ctor) : Directions, Focus, FullTransformation, InvertedTransformation, Perspective, Project, Scaled, Set, Shoot, Transform, Transformation
- **HLRAlgo_WiresBlock** ← Standard_Transient : DynamicType, MinMax, NbWires, Set, UpdateMinMax, Wire · *statiques :* get_type_descriptor, get_type_name

## HLRAppli

- **HLRAppli_ReflectLines** ★ : GetCompoundOf3dEdges, GetResult, Perform, SetAxes

## HLRBRep

- **HLRBRep_Array1OfEData** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **HLRBRep_Array1OfFData** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **HLRBRep_ListOfBPnt2D** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **HLRBRep_ListOfBPoint** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **HLRBRep_TypeOfResultingEdge** ★ · *statiques :* HLRBRep_IsoLine, HLRBRep_OutLine, HLRBRep_Rg1Line, HLRBRep_RgNLine, HLRBRep_Sharp, HLRBRep_Undefined

## HLRTopoBRep

- **HLRTopoBRep_DSFiller** · *statiques :* Insert
- **HLRTopoBRep_Data** : AddIntL, AddIntV, AddIsoL, AddOldS, AddOutL, AddOutV, AddSplE, Append, Clean, Clear, Edge, EdgeHasSplE, EdgeSplE, FaceHasIntL, FaceHasIsoL, FaceHasOutL, FaceIntL, FaceIsoL, FaceOutL, InitEdge, InitVertex, InsertBefore, IsIntLFaceEdge, IsIntV, IsIsoLFaceEdge, IsOutLFaceEdge, IsOutV, IsSplEEdgeEdge, MoreEdge, MoreVertex, NewSOldS, NextEdge, NextVertex, Parameter, Vertex
- **HLRTopoBRep_FaceData** : AddIntL, AddIsoL, AddOutL, FaceIntL, FaceIsoL, FaceOutL
- **HLRTopoBRep_FaceIsoLiner** · *statiques :* MakeIsoLine, MakeVertex, Perform
- **HLRTopoBRep_ListOfVData** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **HLRTopoBRep_OutLiner** ← Standard_Transient (3 ctor) : DataStructure, DynamicType, Fill, OriginalShape, OutLinedShape · *statiques :* get_type_descriptor, get_type_name
- **HLRTopoBRep_VData** (2 ctor) : Parameter, Vertex

## IFGraph

- **IFGraph_AllConnected** ← Interface_GraphContent (2 ctor) : Evaluate, GetFromEntity, ResetData
- **IFGraph_AllShared** ← Interface_GraphContent (2 ctor) : Evaluate, GetFromEntity, GetFromIter, ResetData
- **IFGraph_Articulations** ← Interface_GraphContent : Evaluate, GetFromEntity, GetFromIter, ResetData
- **IFGraph_Compare** ← Interface_GraphContent : Common, Evaluate, FirstOnly, GetFromEntity, GetFromIter, KeepCommon, Merge, RemoveSecond, ResetData, SecondOnly
- **IFGraph_ConnectedComponants** ← IFGraph_SubPartsIterator : Evaluate
- **IFGraph_Cumulate** ← Interface_GraphContent : Evaluate, Forgotten, GetFromEntity, GetFromIter, HighestNbTimes, NbTimes, Overlapped, PerCount, ResetData
- **IFGraph_Cycles** ← IFGraph_SubPartsIterator (2 ctor) : Evaluate
- **IFGraph_ExternalSources** ← Interface_GraphContent : Evaluate, GetFromEntity, GetFromIter, IsEmpty, ResetData
- **IFGraph_SCRoots** ← IFGraph_StrongComponants (2 ctor) : Evaluate
- **IFGraph_StrongComponants** ← IFGraph_SubPartsIterator : Evaluate
- **IFGraph_SubPartsIterator** (2 ctor) : AddPart, Entities, EntityPartNum, Evaluate, FirstEntity, GetFromEntity, GetFromIter, GetParts, IsInPart, IsLoaded, IsSingle, Loaded, LoadedGraph, Model, More, NbParts, Next, PartNum, Reset, SetLoad, SetPartNum, Start

## IFSelect

- **IFSelect_Act** ← IFSelect_Activator : Do, DynamicType, Help · *statiques :* AddFSet, AddFunc, SetGroup, get_type_descriptor, get_type_name
- **IFSelect_Activator** ← Standard_Transient : Add, AddSet, Do, DynamicType, File, Group, Help, SetForGroup · *statiques :* Adding, Commands, Mode, Remove, Select, get_type_descriptor, get_type_name
- **IFSelect_AppliedModifiers** ← Standard_Transient : AddModif, AddNum, Count, DynamicType, IsForAll, Item, ItemList, ItemNum · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_BasicDumper** ← IFSelect_SessionDumper : DynamicType, ReadOwn, WriteOwn · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_CheckCounter** ← IFSelect_SignatureList : Analyse, DynamicType, SetSignature, Signature · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_ContextWrite** (2 ctor) : AddCheck, AddFail, AddWarning, AppliedModifiers, CCheck, CheckList, FileModifier, FileName, Graph, IsForAll, IsForNone, Model, More, NbEntities, NbModifiers, Next, Protocol, SetModifier, Start, Value
- **IFSelect_DispGlobal** ← IFSelect_Dispatch : DynamicType, Label, LimitedMax, Packets · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_DispPerCount** ← IFSelect_Dispatch : Count, CountValue, DynamicType, Label, LimitedMax, Packets, SetCount · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_DispPerFiles** ← IFSelect_Dispatch : Count, CountValue, DynamicType, Label, LimitedMax, Packets, SetCount · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_DispPerOne** ← IFSelect_Dispatch : DynamicType, Label, LimitedMax, Packets · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_DispPerSignature** ← IFSelect_Dispatch : DynamicType, Label, LimitedMax, Packets, SetSignCounter, SignCounter, SignName · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_Dispatch** ← Standard_Transient : CanHaveRemainder, DynamicType, FinalSelection, GetEntities, HasRootName, Label, LimitedMax, Packeted, Packets, Remainder, RootName, Selections, SetFinalSelection, SetRootName · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_EditValue** · *statiques :* IFSelect_EditComputed, IFSelect_EditDynamic, IFSelect_EditProtected, IFSelect_EditRead, IFSelect_Editable, IFSelect_Optional
- **IFSelect_Editor** ← Standard_Transient : Apply, DynamicType, EditMode, Form, IsList, Label, ListEditor, ListValue, Load, MaxList, MaxNameLength, Name, NameNumber, NbValues, PrintDefs, PrintNames, Recognize, SetList, SetValue, StringValue, TypedValue, Update, UpdateList · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_Functions** · *statiques :* GiveDispatch, GiveEntity, GiveEntityNumber, GiveList, Init
- **IFSelect_GeneralModifier** ← Standard_Transient : Applies, Dispatch, DynamicType, HasSelection, Label, MayChangeGraph, ResetSelection, Selection, SetDispatch, SetSelection · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_GraphCounter** ← IFSelect_SignCounter : AddWithGraph, Applied, DynamicType, SetApplied · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_ListEditor** ← Standard_Transient (2 ctor) : AddValue, ClearEdit, DynamicType, EditedValues, IsAdded, IsChanged, IsModified, IsTouched, LoadEdited, LoadModel, LoadValues, NbValues, OriginalValues, Remove, SetTouched, SetValue, Value · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_ModelCopier** ← Standard_Transient : AddFile, AddSentFile, AppliedModifiers, BeginSentFiles, ClearAppliedModifiers, ClearFile, ClearResult, CopiedRemaining, Copy, DynamicType, FileModel, FileName, NameFile, NbFiles, Send, SendAll, SendCopied, SendSelected, SentFiles, SetAppliedModifiers, SetRemaining, SetShareOut · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_ModifEditForm** ← IFSelect_Modifier : DynamicType, EditForm, Label, Perform · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_ModifReorder** ← IFSelect_Modifier : DynamicType, Label, Perform · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_Modifier** ← IFSelect_GeneralModifier : DynamicType, Perform · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_PacketList** ← Standard_Transient : Add, AddList, AddPacket, Duplicated, DynamicType, Entities, HighestDuplicationCount, Model, Name, NbDuplicated, NbEntities, NbPackets, SetName · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_ParamEditor** ← IFSelect_Editor : AddConstantText, AddValue, Apply, DynamicType, Label, Load, Recognize, StringValue · *statiques :* StaticEditor, get_type_descriptor, get_type_name
- **IFSelect_PrintCount** · *statiques :* IFSelect_CountByItem, IFSelect_CountSummary, IFSelect_EntitiesByItem, IFSelect_GeneralInfo, IFSelect_ItemsByEntity, IFSelect_ListByItem, IFSelect_Mapping, IFSelect_ResultCount, IFSelect_ShortByItem
- **IFSelect_PrintFail** · *statiques :* IFSelect_FailAndWarn, IFSelect_FailOnly
- **IFSelect_RemainMode** · *statiques :* IFSelect_RemainCompute, IFSelect_RemainDisplay, IFSelect_RemainForget, IFSelect_RemainUndo
- **IFSelect_ReturnStatus** ★ · *statiques :* IFSelect_RetDone, IFSelect_RetError, IFSelect_RetFail, IFSelect_RetStop, IFSelect_RetVoid
- **IFSelect_SelectAnyList** ← IFSelect_SelectDeduct : DynamicType, FillResult, HasLower, HasUpper, KeepInputEntity, Label, ListLabel, Lower, LowerValue, NbItems, RootResult, SetFrom, SetOne, SetRange, SetUntil, Upper, UpperValue · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectAnyType** ← IFSelect_SelectExtract : DynamicType, Sort, TypeForMatch · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectBase** ← IFSelect_Selection : DynamicType, FillIterator · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectCombine** ← IFSelect_Selection : Add, DynamicType, FillIterator, Input, InputRank, NbInputs, Remove · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectControl** ← IFSelect_Selection : DynamicType, FillIterator, HasSecondInput, MainInput, SecondInput, SetMainInput, SetSecondInput · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectDeduct** ← IFSelect_Selection : Alternate, DynamicType, FillIterator, HasAlternate, HasInput, Input, InputResult, SetInput · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectDiff** ← IFSelect_SelectControl : DynamicType, Label, RootResult · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectEntityNumber** ← IFSelect_SelectBase : DynamicType, Label, Number, RootResult, SetNumber · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectErrorEntities** ← IFSelect_SelectExtract : DynamicType, ExtractLabel, Sort · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectExplore** ← IFSelect_SelectDeduct : DynamicType, Explore, ExploreLabel, Label, Level, RootResult · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectExtract** ← IFSelect_SelectDeduct : DynamicType, ExtractLabel, IsDirect, Label, RootResult, SetDirect, Sort, SortInGraph · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectFlag** ← IFSelect_SelectExtract : DynamicType, ExtractLabel, FlagName, RootResult, Sort · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectInList** ← IFSelect_SelectAnyList : DynamicType, FillResult, ListedEntity · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectIncorrectEntities** ← IFSelect_SelectFlag : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectIntersection** ← IFSelect_SelectCombine : DynamicType, Label, RootResult · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectModelEntities** ← IFSelect_SelectBase : CompleteResult, DynamicType, Label, RootResult · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectModelRoots** ← IFSelect_SelectBase : DynamicType, Label, RootResult · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectPointed** ← IFSelect_SelectBase : Add, AddList, Clear, DynamicType, IsSet, Item, Label, NbItems, Rank, Remove, RemoveList, RootResult, SetEntity, SetList, Toggle, ToggleList, Update · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectRange** ← IFSelect_SelectExtract : DynamicType, ExtractLabel, HasLower, HasUpper, Lower, LowerValue, SetFrom, SetOne, SetRange, SetUntil, Sort, Upper, UpperValue · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectRootComps** ← IFSelect_SelectExtract : DynamicType, ExtractLabel, RootResult, Sort · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectRoots** ← IFSelect_SelectExtract : DynamicType, ExtractLabel, RootResult, Sort · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectSent** ← IFSelect_SelectExtract : AtLeast, DynamicType, ExtractLabel, RootResult, SentCount, Sort · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectShared** ← IFSelect_SelectDeduct : DynamicType, Label, RootResult · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectSharing** ← IFSelect_SelectDeduct : DynamicType, Label, RootResult · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectSignature** ← IFSelect_SelectExtract (3 ctor) : Counter, DynamicType, ExtractLabel, IsExact, Signature, SignatureText, Sort, SortInGraph · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectSignedShared** ← IFSelect_SelectExplore : DynamicType, Explore, ExploreLabel, IsExact, Signature, SignatureText · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectSignedSharing** ← IFSelect_SelectExplore : DynamicType, Explore, ExploreLabel, IsExact, Signature, SignatureText · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectSuite** ← IFSelect_SelectDeduct : AddInput, AddNext, AddPrevious, DynamicType, Item, Label, NbItems, RootResult, SetLabel · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectType** ← IFSelect_SelectAnyType (2 ctor) : DynamicType, ExtractLabel, SetType, TypeForMatch · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectUnion** ← IFSelect_SelectCombine : DynamicType, Label, RootResult · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectUnknownEntities** ← IFSelect_SelectExtract : DynamicType, ExtractLabel, Sort · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_Selection** ← Standard_Transient : CompleteResult, DynamicType, FillIterator, Label, RootResult, UniqueResult · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SelectionIterator** (2 ctor) : AddFromIter, AddItem, AddList, More, Next, Value
- **IFSelect_SessionDumper** ← Standard_Transient : DynamicType, Next, ReadOwn, WriteOwn · *statiques :* First, get_type_descriptor, get_type_name
- **IFSelect_SessionFile** (2 ctor) : AddItem, AddLine, ClearLines, Destroy, IsDone, IsText, IsVoid, ItemValue, Line, NbLines, NbParams, NewItem, ParamValue, Read, ReadEnd, ReadFile, ReadLine, ReadOwn, ReadSession, RecognizeFile, RemoveLastLine, SendItem, SendText, SendVoid, SetLastGeneral, SetOwn, SplitLine, TextValue, WorkSession, Write, WriteEnd, WriteFile, WriteLine, WriteOwn, WriteSession
- **IFSelect_SessionPilot** ← IFSelect_Activator : Arg, Clear, Command, CommandLine, CommandPart, Do, DynamicType, Execute, ExecuteAlias, ExecuteCounter, Help, Library, NbCommands, NbWords, Number, Perform, ReadScript, RecordItem, RecordMode, RecordedItem, RemoveWord, Session, SetCommandLine, SetLibrary, SetRecordMode, SetSession, Word · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_ShareOut** ← Standard_Transient : AddDispatch, AddModif, AddModifier, ChangeModifierRank, Clear, ClearResult, DefaultRootName, Dispatch, DispatchRank, DynamicType, Extension, FileName, GeneralModifier, HasRootName, LastRun, ModelModifier, ModifierRank, NbDispatches, NbModifiers, Prefix, RemoveDispatch, RemoveItem, RemoveModifier, RootName, RootNumber, SetDefaultRootName, SetExtension, SetLastRun, SetPrefix, SetRootName · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_ShareOutResult** (4 ctor) : Dispatch, DispatchRank, Evaluate, FileName, Graph, More, NbPackets, Next, NextDispatch, PacketContent, PacketRoot, Packets, PacketsInDispatch, Prepare, Reset, ShareOut
- **IFSelect_SignAncestor** ← IFSelect_SignType : DynamicType, Matches · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SignCategory** ← IFSelect_Signature : DynamicType, Value · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SignCounter** ← IFSelect_SignatureList (2 ctor) : AddEntity, AddFromSelection, AddList, AddModel, AddSign, AddWithGraph, ComputeSelected, ComputedSign, DynamicType, SelMode, Selection, SetMap, SetSelMode, SetSelection, Sign, Signature · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SignMultiple** ← IFSelect_Signature : Add, DynamicType, Matches, Value · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SignType** ← IFSelect_Signature : DynamicType, Value · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_SignValidity** ← IFSelect_Signature : DynamicType, Value · *statiques :* CVal, get_type_descriptor, get_type_name
- **IFSelect_Signature** ← Interface_SignType : AddCase, CaseList, DynamicType, IsIntCase, Label, Matches, Name, SetIntCase · *statiques :* IntValue, MatchValue, get_type_descriptor, get_type_name
- **IFSelect_SignatureList** ← Standard_Transient : Add, Clear, DynamicType, Entities, HasEntities, Init, LastValue, List, ModeSignOnly, Name, NbNulls, NbTimes, PrintCount, PrintList, PrintSum, SetList, SetName · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_TransformStandard** ← IFSelect_Transformer : AddModifier, ApplyModifiers, Copy, CopyOption, DynamicType, Label, Modifier, ModifierRank, NbModifiers, OnTheSpot, Perform, RemoveModifier, Selection, SetCopyOption, SetSelection, StandardCopy, Updated · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_Transformer** ← Standard_Transient : ChangeProtocol, DynamicType, Label, Perform, Updated · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_WorkLibrary** ← Standard_Transient : CopyModel, DumpEntity, DumpHelp, DumpLevels, DynamicType, ReadFile, SetDumpHelp, SetDumpLevels, WriteFile · *statiques :* get_type_descriptor, get_type_name
- **IFSelect_WorkSession** ← Standard_Transient : AddItem, AddNamedItem, AppliedDispatches, BeginSentFiles, CategoryName, CategoryNumber, ChangeModifierRank, CheckOne, ClearData, ClearFile, ClearFinalModifiers, ClearItems, ClearShareOut, CombineAdd, CombineRemove, ComputeCheck, ComputeCounter, ComputeCounterFromList, ComputeGraph, DefaultFileRoot, Dispatch, DispatchRank, DumpEntity, DumpModel, DumpSelection, DumpShare, DynamicType, EntityLabel, EntityName, ErrorHandle, EvalSelection, EvalSplit, EvaluateComplete, EvaluateDispatch, EvaluateFile, EvaluateSelection, FileExtension, FileModel, FileName, FilePrefix, FileRoot, FinalModifierIdents, GeneralModifier, GetModeStat, GiveFileComplete, GiveFileRoot, GiveList, GiveListCombined, GiveListFromList, GiveSelection, Graph, HGraph, HasModel, HasName, IntParam, IntValue, IsLoaded, IsReversedSelectExtract, Item, ItemIdent, ItemIdents, ItemLabel, ItemNames, ItemNamesForLabel, ItemSelection, LastRunCheckList, ListEntities, ListFinalModifiers, ListItems, LoadedFile, MaxIdent, MaxSendingCount, Model, ModelCheckList, ModelCopier, ModelModifier, ModifierRank, Name, NameIdent, NamedItem, NbFiles, NbFinalModifiers, NbSources, NbStartingEntities, NewIntParam, NewParamFromStatic, NewSelectPointed, NewTextParam, NewTransformStandard, NextIdentForLabel, NumberFromLabel, PrintCheckList, PrintEntityStatus, PrintSignatureList, Protocol, QueryCheckList, QueryCheckStatus, QueryParent, ReadFile, RemoveItem, RemoveName, RemoveNamedItem, ResetAppliedModifier, ResetItemSelection, RunModifier, RunModifierSelected, RunTransformer, Selection, SelectionResult, SelectionResultFromList, SendAll, SendSelected, SendSplit, SentFiles, SentList, SetActive, SetAppliedModifier, SetControl, SetDefaultFileRoot, SetErrorHandle, SetFileExtension, SetFilePrefix, SetFileRoot, SetInputSelection, SetIntValue, SetItemSelection, SetLibrary, SetLoadedFile, SetModeStat, SetModel, SetModelContent, SetModelCopier, SetParams, SetProtocol, SetRemaining, SetSelectPointed, SetShareOut, SetSignType, SetTextValue, ShareOut, Shareds, Sharings, SignCounter, SignType, SignValue, Signature, Source, Sources, StartingEntity, StartingNumber, TextParam, TextValue, ToggleSelectExtract, TraceDumpEntity, TraceDumpModel, TraceStatics, Transformer, UsesAppliedModifier, ValidityName, WorkLibrary, WriteFile · *statiques :* get_type_descriptor, get_type_name

## IGESAppli

- **IGESAppli_Array1OfFiniteElement** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESAppli_Array1OfFlow** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESAppli_Array1OfNode** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## IGESBasic

- **IGESBasic_Array1OfLineFontEntity** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## IGESControl

- **IGESControl_ActorWrite** ← Transfer_ActorOfFinderProcess : DynamicType, Recognize, Transfer · *statiques :* get_type_descriptor, get_type_name
- **IGESControl_AlgoContainer**
- **IGESControl_Controller** ← XSControl_Controller : ActorRead, Customise, DynamicType, NewModel, TransferWriteShape · *statiques :* Init, get_type_descriptor, get_type_name
- **IGESControl_IGESBoundary** (2 ctor)
- **IGESControl_Reader** ← XSControl_Reader (2 ctor) : GetReadVisible, IGESModel, NbRootsForTransfer, PrintTransferInfo, SetReadVisible
- **IGESControl_ToolContainer**
- **IGESControl_Writer** (3 ctor) : AddEntity, AddGeom, AddShape, ComputeModel, Model, SetTransferProcess, TransferProcess, Write

## IGESData

- **IGESData_Array1OfDirPart** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESData_Array1OfIGESEntity** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESData_DefList** · *statiques :* IGESData_DefNone, IGESData_DefOne, IGESData_DefSeveral, IGESData_ErrorOne, IGESData_ErrorSeveral
- **IGESData_DefType** · *statiques :* IGESData_DefAny, IGESData_DefReference, IGESData_DefValue, IGESData_DefVoid, IGESData_ErrorRef, IGESData_ErrorVal
- **IGESData_ReadStage** · *statiques :* IGESData_ReadAssocs, IGESData_ReadDir, IGESData_ReadEnd, IGESData_ReadOwn, IGESData_ReadProps
- **IGESData_Status** · *statiques :* IGESData_EntityError, IGESData_EntityOK, IGESData_ReferenceError, IGESData_TypeError

## IGESDefs

- **IGESDefs_Array1OfTabularData** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## IGESDimen

- **IGESDimen_Array1OfGeneralNote** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESDimen_Array1OfLeaderArrow** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## IGESDraw

- **IGESDraw_Array1OfConnectPoint** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESDraw_Array1OfViewKindEntity** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## IGESGeom

- **IGESGeom_Array1OfBoundary** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESGeom_Array1OfCurveOnSurface** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESGeom_Array1OfTransformationMatrix** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## IGESGraph

- **IGESGraph_Array1OfColor** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESGraph_Array1OfTextDisplayTemplate** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESGraph_Array1OfTextFontDef** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## IGESSolid

- **IGESSolid_Array1OfFace** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESSolid_Array1OfLoop** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESSolid_Array1OfShell** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IGESSolid_Array1OfVertexList** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## Image

- **Image_AlienPixMap** ← Image_PixMap : AdjustGamma, Clear, DynamicType, InitCopy, InitTrash, Load, Save · *statiques :* IsTopDownDefault, get_type_descriptor, get_type_name
- **Image_Diff** ← Standard_Transient : ColorTolerance, Compare, DynamicType, Init, IsBorderFilterOn, SaveDiffImage, SetBorderFilterOn, SetColorTolerance · *statiques :* get_type_descriptor, get_type_name
- **Image_Format** · *statiques :* Image_Format_Alpha, Image_Format_AlphaF, Image_Format_BGR, Image_Format_BGR32, Image_Format_BGRA, Image_Format_BGRAF, Image_Format_BGRF, Image_Format_Gray, Image_Format_GrayF, Image_Format_RGB, Image_Format_RGB32, Image_Format_RGBA, Image_Format_RGBAF, Image_Format_RGBF, Image_Format_UNKNOWN
- **Image_PixMap** ← Standard_Transient : ChangeData, ChangeRawValue, ChangeRow, Clear, Data, DynamicType, Format, Height, InitCopy, InitTrash, InitWrapper, InitZero, IsEmpty, IsTopDown, MaxRowAligmentBytes, PixelColor, Ratio, RawValue, Row, RowExtraBytes, SetFormat, SetPixelColor, SetTopDown, SizeBytes, SizePixelBytes, SizeRowBytes, SizeX, SizeY, TopDownInc, Width · *statiques :* IsBigEndianHost, SizePixelBytes, SwapRgbaBgra, ToBlackWhite, get_type_descriptor, get_type_name
- **Image_PixMapData**
- **Image_Texture** ← Standard_Transient (3 ctor) : DataBuffer, DynamicType, FileLength, FileOffset, FilePath, ProbeImageFileFormat, ReadImage, TextureId, WriteImage · *statiques :* HashCode, IsEqual, get_type_descriptor, get_type_name

## IMeshData

- **IMeshData_Curve** ← IMeshData_ParametersList : AddPoint, DynamicType, GetPoint, InsertPoint, RemovePoint · *statiques :* get_type_descriptor, get_type_name
- **IMeshData_Model** ← IMeshData_Shape : AddEdge, AddFace, DynamicType, EdgesNb, FacesNb, GetEdge, GetFace, GetMaxSize · *statiques :* get_type_descriptor, get_type_name
- **IMeshData_PCurve** ← IMeshData_ParametersList : AddPoint, DynamicType, GetFace, GetIndex, GetOrientation, GetPoint, InsertPoint, IsForward, IsInternal, RemovePoint · *statiques :* get_type_descriptor, get_type_name
- **IMeshData_ParametersList** ← Standard_Transient : Clear, DynamicType, GetParameter, ParametersNb · *statiques :* get_type_descriptor, get_type_name
- **IMeshData_Shape** ← Standard_Transient : DynamicType, GetShape, SetShape · *statiques :* get_type_descriptor, get_type_name
- **IMeshData_Status** · *statiques :* IMeshData_Failure, IMeshData_NoError, IMeshData_OpenWire, IMeshData_Outdated, IMeshData_ReMesh, IMeshData_Reused, IMeshData_SelfIntersectingWire, IMeshData_TooFewPoints, IMeshData_UnorientedWire
- **IMeshData_StatusOwner** : GetStatusMask, IsEqual, IsSet, SetStatus, UnsetStatus
- **IMeshData_TessellatedShape** ← IMeshData_Shape : DynamicType, GetDeflection, SetDeflection · *statiques :* get_type_descriptor, get_type_name

## IMeshTools

- **IMeshTools_Context** ← IMeshData_Shape : BuildModel, ChangeParameters, Clean, DiscretizeEdges, DiscretizeFaces, DynamicType, GetEdgeDiscret, GetFaceDiscret, GetModel, GetModelBuilder, GetModelHealer, GetParameters, GetPostProcessor, GetPreProcessor, HealModel, PostProcessModel, PreProcessModel, SetEdgeDiscret, SetFaceDiscret, SetModelBuilder, SetModelHealer, SetPostProcessor, SetPreProcessor · *statiques :* get_type_descriptor, get_type_name
- **IMeshTools_CurveTessellator** ← Standard_Transient : DynamicType, PointsNb, Value · *statiques :* get_type_descriptor, get_type_name
- **IMeshTools_MeshAlgo** ← Standard_Transient : DynamicType, Perform · *statiques :* get_type_descriptor, get_type_name
- **IMeshTools_MeshAlgoFactory** ← Standard_Transient : DynamicType, GetAlgo · *statiques :* get_type_descriptor, get_type_name
- **IMeshTools_MeshBuilder** ← Message_Algorithm (2 ctor) : DynamicType, GetContext, Perform, SetContext · *statiques :* get_type_descriptor, get_type_name
- **IMeshTools_ModelAlgo** ← Standard_Transient : DynamicType, Perform · *statiques :* get_type_descriptor, get_type_name
- **IMeshTools_ModelBuilder** ← Message_Algorithm : DynamicType, Perform · *statiques :* get_type_descriptor, get_type_name
- **IMeshTools_ShapeExplorer** ← IMeshData_Shape : Accept, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **IMeshTools_ShapeVisitor** ← Standard_Transient : DynamicType, Visit · *statiques :* get_type_descriptor, get_type_name

## IntAna

- **IntAna_Curve** : D1u, Domain, FindParameter, IsConstant, IsFirstOpen, IsLastOpen, IsOpen, SetConeQuadValues, SetCylinderQuadValues, SetDomain, SetIsFirstOpen, SetIsLastOpen, Value
- **IntAna_Int3Pln** (2 ctor) : IsDone, IsEmpty, Perform, Value
- **IntAna_IntConicQuad** (11 ctor) : IsDone, IsInQuadric, IsParallel, NbPoints, ParamOnConic, Perform, Point
- **IntAna_IntLinTorus** (2 ctor) : IsDone, NbPoints, ParamOnLine, ParamOnTorus, Perform, Value
- **IntAna_IntQuadQuad** (3 ctor) : Curve, HasNextCurve, HasPreviousCurve, IdenticalElements, IsDone, NbCurve, NbPnt, NextCurve, Parameters, Perform, Point, PreviousCurve
- **IntAna_ListOfCurve** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **IntAna_QuadQuadGeo** (16 ctor) : Circle, Ellipse, HasCommonGen, Hyperbola, IsDone, Line, NbSolutions, PChar, Parabola, Perform, Point, TypeInter
- **IntAna_Quadric** (5 ctor) : Coefficients, NewCoefficients, SetQuadric, SpecialPoints
- **IntAna_ResultType** · *statiques :* IntAna_Circle, IntAna_Ellipse, IntAna_Empty, IntAna_Hyperbola, IntAna_Line, IntAna_NoGeometricSolution, IntAna_Parabola, IntAna_Point, IntAna_PointAndCircle, IntAna_Same

## IntAna2d

- **IntAna2d_AnaIntersection** (9 ctor) : IdenticalElements, IsDone, IsEmpty, NbPoints, ParallelElements, Perform, Point
- **IntAna2d_Conic** (5 ctor) : Coefficients, Grad, NewCoefficients, ValAndGrad, Value
- **IntAna2d_IntPoint** (3 ctor) : ParamOnFirst, ParamOnSecond, SecondIsImplicit, SetValue, Value

## IntCurve

- **IntCurve_IConicTool** (7 ctor) : D1, D2, Distance, FindParameter, GradDistance, Value
- **IntCurve_IntConicConic** ← IntRes2d_Intersection (16 ctor) : Perform
- **IntCurve_IntImpConicParConic** ← IntRes2d_Intersection (2 ctor) : And_Domaine_Objet1_Intersections, FindU, FindV, Perform
- **IntCurve_MyImpParToolOfIntImpConicParConic** ← math_FunctionWithDerivative : Derivative, Value, Values
- **IntCurve_PConic** (6 ctor) : Accuracy, Axis2, EpsX, Param1, Param2, SetAccuracy, SetEpsX, TypeCurve
- **IntCurve_PConicTool** · *statiques :* D1, D2, EpsX, NbSamples, Value
- **IntCurve_ProjectOnPConicTool** · *statiques :* FindParameter

## IntCurvesFace

- **IntCurvesFace_Intersector** : Bounding, ClassifyUVPoint, Destroy, Face, GetUseBoundToler, IsDone, IsParallel, NbPnt, Perform, Pnt, SetUseBoundToler, State, SurfaceType, Transition, UParameter, VParameter, WParameter
- **IntCurvesFace_ShapeIntersector** : Destroy, Face, IsDone, Load, NbPnt, Perform, PerformNearest, Pnt, SortResult, State, Transition, UParameter, VParameter, WParameter

## IntCurveSurface

- **IntCurveSurface_HInter** ← IntCurveSurface_Intersection : Perform
- **IntCurveSurface_Intersection** : Dump, IsDone, IsParallel, NbPoints, NbSegments, Point, Segment
- **IntCurveSurface_IntersectionPoint** (2 ctor) : Dump, Pnt, SetValues, Transition, U, V, Values, W
- **IntCurveSurface_IntersectionSegment** (2 ctor) : Dump, FirstPoint, SecondPoint, SetValues, Values
- **IntCurveSurface_TheCSFunctionOfHInter** ← math_FunctionSetWithDerivatives : AuxillarCurve, AuxillarSurface, Derivatives, NbEquations, NbVariables, Point, Root, Value, Values
- **IntCurveSurface_TheExactHInter** (2 ctor) : Function, IsDone, IsEmpty, ParameterOnCurve, ParameterOnSurface, Perform, Point
- **IntCurveSurface_TheHCurveTool** · *statiques :* BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, LastParameter, Line, NbIntervals, NbSamples, Parabola, Period, Resolution, SamplePars, Value
- **IntCurveSurface_TheInterferenceOfHInter** ← Intf_Interference (7 ctor) : Interference, Perform
- **IntCurveSurface_ThePolygonOfHInter** (3 ctor) : ApproxParamOnCurve, BeginOfSeg, Bounding, Closed, DeflectionOverEstimation, Dump, EndOfSeg, InfParameter, NbSegments, SetDeflectionOverEstimation, SupParameter
- **IntCurveSurface_ThePolygonToolOfHInter** · *statiques :* BeginOfSeg, Bounding, Closed, DeflectionOverEstimation, Dump, EndOfSeg, NbSegments
- **IntCurveSurface_ThePolyhedronToolOfHInter** · *statiques :* Bounding, ComponentsBounding, DeflectionOverEstimation, Dump, GetBorderDeflection, IsOnBound, NbTriangles, Point, TriConnex, Triangle
- **IntCurveSurface_TheQuadCurvExactHInter** : Intervals, IsDone, NbIntervals, NbRoots, Root
- **IntCurveSurface_TheQuadCurvFuncOfTheQuadCurvExactHInter** ← math_FunctionWithDerivative : Derivative, Value, Values
- **IntCurveSurface_TransitionOnCurve** · *statiques :* IntCurveSurface_In, IntCurveSurface_Out, IntCurveSurface_Tangent

## Interface

- **Interface_Array1OfFileParameter** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Interface_Array1OfHAsciiString** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Interface_BitMap** (3 ctor) : AddFlag, AddSomeFlags, CFalse, CTrue, Clear, FlagName, FlagNumber, Init, Initialize, Internals, Length, NbFlags, RemoveFlag, Reservate, SetFalse, SetFlagName, SetLength, SetTrue, SetValue, Value
- **Interface_Category** (3 ctor) : CatNum, ClearNums, Compute, Num, SetProtocol · *statiques :* AddCategory, Init, Name, NbCategories, Number
- **Interface_Check** ← Standard_Transient (2 ctor) : AddFail, AddWarning, CFail, CInfoMsg, CWarning, Clear, ClearFails, ClearInfoMsgs, ClearWarnings, Complies, DynamicType, Entity, Fail, Fails, GetAsWarning, GetEntity, GetMessages, HasEntity, HasFailed, HasWarnings, InfoMsg, InfoMsgs, Mend, NbFails, NbInfoMsgs, NbWarnings, Print, Remove, SendFail, SendMsg, SendWarning, SetEntity, Status, Trace, Warning, Warnings · *statiques :* get_type_descriptor, get_type_name
- **Interface_CheckFailure** ← Interface_InterfaceError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Interface_CheckIterator** (2 ctor) : Add, CCheck, Check, Checkeds, Clear, Complies, Destroy, Extract, IsEmpty, Merge, Model, More, Name, Next, Number, Print, Remove, SetModel, SetName, Start, Status, Value
- **Interface_CheckStatus** · *statiques :* Interface_CheckAny, Interface_CheckFail, Interface_CheckMessage, Interface_CheckNoFail, Interface_CheckOK, Interface_CheckWarning
- **Interface_CheckTool** (4 ctor) : AnalyseCheckList, Check, CheckList, CheckSuccess, CompleteCheckList, FillCheck, Print, UnknownEntities, VerifyCheckList, WarningCheckList
- **Interface_CopyControl** ← Standard_Transient : Bind, Clear, DynamicType, Search · *statiques :* get_type_descriptor, get_type_name
- **Interface_CopyMap** ← Interface_CopyControl : Bind, Clear, DynamicType, Model, Search · *statiques :* get_type_descriptor, get_type_name
- **Interface_CopyTool** (3 ctor) : Bind, Clear, ClearLastFlags, CompleteResult, Control, Copy, FillModel, LastCopiedAfter, Model, RenewImpliedRefs, RootResult, Search, SetControl, TransferEntity, Transferred
- **Interface_DataState** · *statiques :* Interface_DataFail, Interface_DataWarning, Interface_LoadFail, Interface_LoadWarning, Interface_StateOK, Interface_StateUnknown, Interface_StateUnloaded
- **Interface_EntityCluster** ← Standard_Transient (4 ctor) : Append, DynamicType, FillIterator, NbEntities, Remove, SetValue, Value · *statiques :* get_type_descriptor, get_type_name
- **Interface_EntityIterator** (2 ctor) : AddItem, AddList, Content, Destroy, GetOneItem, More, NbEntities, NbTyped, Next, SelectType, Start, Typed, Value
- **Interface_EntityList** : Add, Append, Clear, FillIterator, IsEmpty, NbEntities, NbTypedEntities, Remove, SetValue, TypedEntity, Value
- **Interface_FileParameter** : CValue, Clear, Destroy, EntityNumber, Init, ParamType, SetEntityNumber
- **Interface_FileReaderTool** : AnalyseRecord, BeginRead, Clear, Data, EndRead, ErrorHandle, LoadModel, LoadedEntity, Messenger, Model, NewModel, Protocol, Recognize, RecognizeByLib, SetData, SetEntities, SetErrorHandle, SetMessenger, SetModel, SetTraceLevel, TraceLevel, UnknownEntity
- **Interface_FloatWriter** : FormatForRange, MainFormat, Options, SetDefaults, SetFormat, SetFormatForRange, SetZeroSuppress, Write · *statiques :* Convert
- **Interface_GTool** ← Standard_Transient (2 ctor) : ClearEntities, DynamicType, Lib, Protocol, Reservate, Select, SetProtocol, SetSignType, SignName, SignType, SignValue · *statiques :* get_type_descriptor, get_type_name
- **Interface_GeneralLib** (2 ctor) : AddProtocol, Clear, Module, More, Next, Protocol, Select, SetComplete, Start · *statiques :* SetGlobal
- **Interface_GlobalNodeOfGeneralLib** ← Standard_Transient : Add, DynamicType, Module, Next, Protocol · *statiques :* get_type_descriptor, get_type_name
- **Interface_GlobalNodeOfReaderLib** ← Standard_Transient : Add, DynamicType, Module, Next, Protocol · *statiques :* get_type_descriptor, get_type_name
- **Interface_GraphContent** ← Interface_EntityIterator (4 ctor) : Begin, Evaluate, GetFromGraph, Result
- **Interface_IntList** (3 ctor) : Add, AdjustSize, Clear, Initialize, Internals, IsRedefined, Length, List, NbEntities, Number, Remove, Reservate, SetNbEntities, SetNumber, SetRedefined, Value
- **Interface_IntVal** ← Standard_Transient : CValue, DynamicType, Value · *statiques :* get_type_descriptor, get_type_name
- **Interface_InterfaceError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Interface_InterfaceMismatch** ← Interface_InterfaceError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Interface_InterfaceModel** ← Standard_Transient : AddEntity, AddReportEntity, AddWithRefs, CategoryNumber, ChangeOrder, Check, Clear, ClearEntities, ClearHeader, ClearLabels, ClearReportEntity, Contains, Destroy, DispatchStatus, DumpHeader, DynamicType, Entities, EntityState, FillIterator, FillSemanticChecks, GTool, GetFromAnother, GetFromTransfer, GlobalCheck, HasSemanticChecks, IsErrorEntity, IsRedefinedContent, IsReportEntity, IsUnknownEntity, NbEntities, NbTypes, NewEmptyModel, NextNumberForLabel, Number, Print, PrintLabel, PrintToLog, Protocol, Redefineds, ReplaceEntity, ReportEntity, Reports, Reservate, ReverseOrders, SetCategoryNumber, SetGTool, SetGlobalCheck, SetProtocol, SetReportEntity, StringLabel, Type, TypeName, Value, VerifyCheck · *statiques :* ClassName, HasTemplate, ListTemplates, SetTemplate, Template, get_type_descriptor, get_type_name
- **Interface_LineBuffer** : Add, CanGet, Clear, Content, FreezeInitial, Length, Move, Moved, SetInitial, SetKeep, SetMax
- **Interface_MSG** (6 ctor) : Destroy, Value · *statiques :* Blanks, CDate, Intervalled, IsKey, NDate, Print, PrintTrace, Read, Record, SetMode, SetTrace, TDate, Translated, Write
- **Interface_MapAsciiStringHasher** · *statiques :* HashCode, IsEqual
- **Interface_NodeOfGeneralLib** ← Standard_Transient : AddNode, DynamicType, Module, Next, Protocol · *statiques :* get_type_descriptor, get_type_name
- **Interface_NodeOfReaderLib** ← Standard_Transient : AddNode, DynamicType, Module, Next, Protocol · *statiques :* get_type_descriptor, get_type_name
- **Interface_ParamList** ← Standard_Transient : ChangeValue, Clear, DynamicType, Length, Lower, SetValue, Upper, Value · *statiques :* get_type_descriptor, get_type_name
- **Interface_ParamSet** ← Standard_Transient : Append, ChangeParam, Destroy, DynamicType, NbParams, Param, Params, SetParam · *statiques :* get_type_descriptor, get_type_name
- **Interface_ParamType** · *statiques :* Interface_ParamBinary, Interface_ParamEnum, Interface_ParamHexa, Interface_ParamIdent, Interface_ParamInteger, Interface_ParamLogical, Interface_ParamMisc, Interface_ParamReal, Interface_ParamSub, Interface_ParamText, Interface_ParamVoid
- **Interface_Protocol** ← Standard_Transient : CaseNumber, DynamicType, GlobalCheck, IsDynamicType, IsSuitableModel, IsUnknownEntity, NbResources, NbTypes, NewModel, Resource, Type, TypeNumber, UnknownEntity · *statiques :* Active, ClearActive, SetActive, get_type_descriptor, get_type_name
- **Interface_ReaderLib** (2 ctor) : AddProtocol, Clear, Module, More, Next, Protocol, Select, SetComplete, Start · *statiques :* SetGlobal
- **Interface_ReaderModule** ← Standard_Transient : CaseNum, DynamicType, NewRead, Read · *statiques :* get_type_descriptor, get_type_name
- **Interface_ReportEntity** ← Standard_Transient (2 ctor) : CCheck, Check, Concerned, Content, DynamicType, HasContent, HasNewContent, IsError, IsUnknown, SetContent · *statiques :* get_type_descriptor, get_type_name
- **Interface_STAT** (2 ctor) : AddPhase, AddStep, Description, Internals, Phase, Start, Step · *statiques :* End, NextCycle, NextItem, NextPhase, NextStep, Percent, SetPhase, StartCount, Where
- **Interface_ShareFlags** (5 ctor) : IsShared, Model, NbRoots, Root, RootEntities
- **Interface_ShareTool** (6 ctor) : All, Graph, IsShared, Model, NbTypedSharings, Print, RootEntities, Shareds, Sharings, TypedSharing
- **Interface_SignLabel** ← MoniTool_SignText : DynamicType, Name, Text · *statiques :* get_type_descriptor, get_type_name
- **Interface_SignType** ← MoniTool_SignText : DynamicType, Text, Value · *statiques :* ClassName, get_type_descriptor, get_type_name
- **Interface_Static** ← Interface_TypedValue (2 ctor) : DynamicType, Family, PrintStatic, SetUptodate, SetWild, UpdatedStatus, Wild · *statiques :* CDef, CVal, IDef, IVal, Init, IsPresent, IsSet, IsUpdated, Items, RVal, SetCVal, SetIVal, SetRVal, Standards, Static, Update, get_type_descriptor, get_type_name
- **Interface_TypedValue** ← MoniTool_TypedValue : DynamicType, Type · *statiques :* ParamTypeToValueType, ValueTypeToParamType, get_type_descriptor, get_type_name
- **Interface_UndefinedContent** ← Standard_Transient : AddEntity, AddLiteral, DynamicType, EntityList, GetFromAnother, IsParamEntity, NbLiterals, NbParams, ParamData, ParamEntity, ParamType, ParamValue, RemoveParam, Reservate, SetEntity, SetLiteral · *statiques :* get_type_descriptor, get_type_name

## Intf

- **Intf_Array1OfLin** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Intf_Interference** : Contains, Dump, GetTolerance, Insert, LineValue, NbSectionLines, NbSectionPoints, NbTangentZones, PntValue, ZoneValue
- **Intf_InterferencePolygon2d** ← Intf_Interference (3 ctor) : Perform, Pnt2dValue
- **Intf_PIType** · *statiques :* Intf_EDGE, Intf_EXTERNAL, Intf_FACE, Intf_VERTEX
- **Intf_Polygon2d** : Bounding, Closed, DeflectionOverEstimation, NbSegments, Segment
- **Intf_SectionLine** (2 ctor) : Append, Close, Contains, Dump, GetPoint, IsClosed, IsEnd, IsEqual, NumberOfPoints, Prepend, Reverse
- **Intf_SectionPoint** (3 ctor) : Dump, Incidence, InfoFirst, InfoSecond, IsEqual, IsOnSameEdge, Merge, ParamOnFirst, ParamOnSecond, Pnt, TypeOnFirst, TypeOnSecond
- **Intf_TangentZone** (2 ctor) : Append, Contains, Dump, GetPoint, HasCommonRange, InfoFirst, InfoSecond, Insert, InsertAfter, InsertBefore, IsEqual, NumberOfPoints, ParamOnFirst, ParamOnSecond, PolygonInsert, RangeContains
- **Intf_Tool** : BeginParam, EndParam, Hypr2dBox, HyprBox, Lin2dBox, LinBox, NbSegments, Parab2dBox, ParabBox

## IntImp

- **IntImp_ConstIsoparametric** · *statiques :* IntImp_UIsoparametricOnCaro1, IntImp_UIsoparametricOnCaro2, IntImp_VIsoparametricOnCaro1, IntImp_VIsoparametricOnCaro2

## IntPatch

- **IntPatch_ALine** ← IntPatch_Line (3 ctor) : AddVertex, ChangeVertex, ComputeVertexParameters, Curve, D1, DynamicType, FindParameter, FirstParameter, FirstPoint, HasFirstPoint, HasLastPoint, LastParameter, LastPoint, NbVertex, Replace, SetFirstPoint, SetLastPoint, Value, Vertex · *statiques :* get_type_descriptor, get_type_name
- **IntPatch_ALineToWLine** : MakeWLine, SetTol3D, SetTolOpenDomain, SetTolTransition, Tol3D, TolOpenDomain, TolTransition
- **IntPatch_ArcFunction** ← math_FunctionWithDerivative : Arc, Derivative, GetStateNumber, LastComputedPoint, NbSamples, Quadric, Set, SetQuadric, Surface, Valpoint, Value, Values
- **IntPatch_CSFunction** ← math_FunctionSetWithDerivatives : AuxillarCurve, AuxillarSurface, Derivatives, NbEquations, NbVariables, Point, Root, Value, Values
- **IntPatch_CurvIntSurf** (2 ctor) : Function, IsDone, IsEmpty, ParameterOnCurve, ParameterOnSurface, Perform, Point
- **IntPatch_GLine** ← IntPatch_Line (15 ctor) : AddVertex, Circle, ComputeVertexParameters, DynamicType, Ellipse, FirstPoint, HasFirstPoint, HasLastPoint, Hyperbola, LastPoint, Line, NbVertex, Parabola, Replace, SetFirstPoint, SetLastPoint, Vertex · *statiques :* get_type_descriptor, get_type_name
- **IntPatch_HCurve2dTool** · *statiques :* BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Ellipse, FirstParameter, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, LastParameter, Line, NbIntervals, NbSamples, Parabola, Period, Resolution, Value
- **IntPatch_HInterTool** : NbSamplePoints, SamplePoint · *statiques :* Bounds, HasBeenSeen, HasFirstPoint, HasLastPoint, IsAllSolution, IsVertex, NbPoints, NbSamplesOnArc, NbSamplesU, NbSamplesV, NbSegments, Parameter, Project, SingularOnUMax, SingularOnUMin, SingularOnVMax, SingularOnVMin, Tolerance, Value, Vertex
- **IntPatch_IType** · *statiques :* IntPatch_Analytic, IntPatch_Circle, IntPatch_Ellipse, IntPatch_Hyperbola, IntPatch_Lin, IntPatch_Parabola, IntPatch_Restriction, IntPatch_Walking
- **IntPatch_ImpImpIntersection** (2 ctor) : GetStatus, IsDone, IsEmpty, Line, NbLines, NbPnts, OppositeFaces, Perform, Point, TangentFaces
- **IntPatch_ImpPrmIntersection** (2 ctor) : IsDone, IsEmpty, Line, NbLines, NbPnts, Perform, Point, SetStartPoint
- **IntPatch_InterferencePolyhedron** ← Intf_Interference (3 ctor) : Perform
- **IntPatch_Intersection** (3 ctor) : Dump, IsDone, IsEmpty, Line, NbLines, NbPnts, OppositeFaces, Perform, Point, SequenceOfLine, SetTolerances, TangentFaces
- **IntPatch_Line** ← Standard_Transient : ArcType, DynamicType, IsTangent, IsUIsoOnS1, IsUIsoOnS2, IsVIsoOnS1, IsVIsoOnS2, SetValue, SituationS1, SituationS2, TransitionOnS1, TransitionOnS2 · *statiques :* get_type_descriptor, get_type_name
- **IntPatch_LineConstructor** : Line, NbLines, Perform
- **IntPatch_Point** : ArcOnS1, ArcOnS2, Dump, IsMultiple, IsOnDomS1, IsOnDomS2, IsTangencyPoint, IsVertexOnS1, IsVertexOnS2, ParameterOnArc1, ParameterOnArc2, ParameterOnLine, Parameters, ParametersOnS1, ParametersOnS2, PntOn2S, ReverseTransition, SetArc, SetMultiple, SetParameter, SetParameters, SetTolerance, SetValue, SetVertex, Tolerance, TransitionLineArc1, TransitionLineArc2, TransitionOnS1, TransitionOnS2, Value, VertexOnS1, VertexOnS2
- **IntPatch_PointLine** ← IntPatch_Line : AddVertex, ChangeVertex, ClearVertexes, Curve, DynamicType, IsOutBox, IsOutSurf1Box, IsOutSurf2Box, NbPnts, NbVertex, Point, RemoveVertex, Vertex · *statiques :* CurvatureRadiusOfIntersLine, get_type_descriptor, get_type_name
- **IntPatch_PolyArc** ← IntPatch_Polygo : Closed, NbPoints, Parameter, Point, SetOffset
- **IntPatch_PolyLine** ← IntPatch_Polygo (2 ctor) : NbPoints, Point, ResetError, SetRLine, SetWLine
- **IntPatch_Polygo** ← Intf_Polygon2d : DeflectionOverEstimation, Dump, Error, NbPoints, NbSegments, Point, Segment
- **IntPatch_PolyhedronTool** · *statiques :* Bounding, ComponentsBounding, DeflectionOverEstimation, NbTriangles, Point, TriConnex, Triangle
- **IntPatch_PrmPrmIntersection** : CodeReject, DansGrille, GrilleInteger, IntegerGrille, IsDone, IsEmpty, Line, NbLines, NbPointsGrille, NewLine, Perform, PointDepart, Remplit, RemplitLin, RemplitTri
- **IntPatch_PrmPrmIntersection_T3Bits** : Add, And, Destroy, Raz, ResetAnd, Val
- **IntPatch_RstInt** · *statiques :* PutVertexOnLine
- **IntPatch_SpecPntType** · *statiques :* IntPatch_SPntNone, IntPatch_SPntPole, IntPatch_SPntPoleSeamU, IntPatch_SPntSeamU, IntPatch_SPntSeamUV, IntPatch_SPntSeamV
- **IntPatch_SpecialPoints** · *statiques :* AddCrossUVIsoPoint, AddPointOnUorVIso, AddSingularPole, AdjustPointAndVertex, ContinueAfterSpecialPoint
- **IntPatch_TheIWLineOfTheIWalking** ← Standard_Transient : AddIndexPassing, AddPoint, AddStatusFirst, AddStatusFirstLast, AddStatusLast, Cut, DynamicType, FirstPoint, FirstPointIndex, HasFirstPoint, HasLastPoint, IsClosed, IsTangentAtBegining, IsTangentAtEnd, LastPoint, LastPointIndex, Line, NbPassingPoint, NbPoints, PassingPoint, Reverse, SetTangencyAtBegining, SetTangencyAtEnd, SetTangentVector, TangentVector, Value · *statiques :* get_type_descriptor, get_type_name
- **IntPatch_TheIWalking** : IsDone, NbLines, NbSinglePnts, Perform, SetTolerance, SinglePnt, Value
- **IntPatch_ThePathPointOfTheSOnBounds** (3 ctor) : Arc, IsNew, Parameter, SetValue, Tolerance, Value, Vertex
- **IntPatch_TheSOnBounds** : AllArcSolution, IsDone, NbPoints, NbSegments, Perform, Point, Segment
- **IntPatch_TheSearchInside** (2 ctor) : IsDone, NbPoints, Perform, Value
- **IntPatch_TheSegmentOfTheSOnBounds** : Curve, FirstPoint, HasFirstPoint, HasLastPoint, LastPoint, SetLimitPoint, SetValue
- **IntPatch_TheSurfFunction** ← math_FunctionSetWithDerivatives (3 ctor) : Derivatives, Direction2d, Direction3d, ISurface, IsTangent, NbEquations, NbVariables, PSurface, Point, Root, Set, SetImplicitSurface, Tolerance, Value, Values
- **IntPatch_WLine** ← IntPatch_PointLine (3 ctor) : AddVertex, ChangeVertex, ClearVertexes, ComputeVertexParameters, Curve, Dump, DynamicType, EnablePurging, FirstPoint, GetArcOnS1, GetArcOnS2, GetCreatingWay, HasArcOnS1, HasArcOnS2, HasFirstPoint, HasLastPoint, InsertVertexBefore, IsOutBox, IsOutSurf1Box, IsOutSurf2Box, IsPurgingAllowed, LastPoint, NbPnts, NbVertex, Point, RemoveVertex, Replace, SetArcOnS1, SetArcOnS2, SetCreatingWayInfo, SetFirstPoint, SetLastPoint, SetPeriod, SetPoint, U1Period, U2Period, V1Period, V2Period, Vertex · *statiques :* get_type_descriptor, get_type_name
- **IntPatch_WLineTool** · *statiques :* ComputePurgedWLine, ExtendTwoWLines, JoinWLines

## IntPolyh

- **IntPolyh_Couple** (2 ctor) : Angle, Dump, FirstValue, HashCode, IsAnalyzed, IsEqual, SecondValue, SetAnalyzed, SetAngle, SetCoupleValue
- **IntPolyh_CoupleMapHasher** · *statiques :* HashCode, IsEqual
- **IntPolyh_Edge** (2 ctor) : Dump, FirstPoint, FirstTriangle, SecondPoint, SecondTriangle, SetFirstPoint, SetFirstTriangle, SetSecondPoint, SetSecondTriangle
- **IntPolyh_Intersection** (3 ctor) : GetLinePoint, GetTangentZonePoint, IsDone, NbPointsInLine, NbPointsInTangentZone, NbSectionLines, NbTangentZones
- **IntPolyh_ListOfCouples** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **IntPolyh_Point** (2 ctor) : Add, Cross, Degenerated, Divide, Dot, Dump, Equal, Middle, Multiplication, PartOfCommon, Set, SetDegenerated, SetPartOfCommon, SetU, SetV, SetX, SetY, SetZ, SquareDistance, SquareModulus, Sub, U, V, X, Y, Z
- **IntPolyh_SectionLine** (2 ctor) : ChangeValue, Copy, Destroy, Dump, GetN, IncrementNbStartPoints, Init, NbStartPoints, Prepend, Value
- **IntPolyh_StartPoint** (2 ctor) : ChainList, CheckSameSP, Dump, E1, E2, GetAngle, GetEdgePoints, Lambda1, Lambda2, SetAngle, SetChainList, SetCoupleValue, SetEdge1, SetEdge2, SetLambda1, SetLambda2, SetUV1, SetUV2, SetXYZ, T1, T2, U1, U2, V1, V2, X, Y, Z
- **IntPolyh_Tools** · *statiques :* ComputeDeflection, FillArrayOfPointNormal, IsEnlargePossible, MakeSampling
- **IntPolyh_Triangle** (2 ctor) : BoundingBox, ComputeDeflection, Deflection, Dump, FirstEdge, FirstEdgeOrientation, FirstPoint, GetEdgeNumber, GetEdgeOrientation, GetNextTriangle, HasIntersection, IsDegenerated, IsIntersectionPossible, LinkEdges2Triangle, MiddleRefinement, MultipleMiddleRefinement, SecondEdge, SecondEdgeOrientation, SecondPoint, SetDeflection, SetDegenerated, SetEdge, SetEdgeAndOrientation, SetEdgeOrientation, SetFirstEdge, SetFirstPoint, SetIntersection, SetIntersectionPossible, SetSecondEdge, SetSecondPoint, SetThirdEdge, SetThirdPoint, ThirdEdge, ThirdEdgeOrientation, ThirdPoint

## IntRes2d

- **IntRes2d_Domain** (3 ctor) : EquivalentParameters, FirstParameter, FirstPoint, FirstTolerance, HasFirstPoint, HasLastPoint, IsClosed, LastParameter, LastPoint, LastTolerance, SetEquivalentParameters, SetValues
- **IntRes2d_Intersection** : IsDone, IsEmpty, NbPoints, NbSegments, Point, Segment, SetReversedParameters
- **IntRes2d_IntersectionPoint** (2 ctor) : ParamOnFirst, ParamOnSecond, SetValues, TransitionOfFirst, TransitionOfSecond, Value
- **IntRes2d_IntersectionSegment** (4 ctor) : FirstPoint, HasFirstPoint, HasLastPoint, IsOpposite, LastPoint
- **IntRes2d_Position** · *statiques :* IntRes2d_End, IntRes2d_Head, IntRes2d_Middle
- **IntRes2d_Situation** · *statiques :* IntRes2d_Inside, IntRes2d_Outside, IntRes2d_Unknown
- **IntRes2d_Transition** (4 ctor) : IsOpposite, IsTangent, PositionOnCurve, SetPosition, SetValue, Situation, TransitionType
- **IntRes2d_TypeTrans** · *statiques :* IntRes2d_In, IntRes2d_Out, IntRes2d_Touch, IntRes2d_Undecided

## Intrv

- **Intrv_Interval** (3 ctor) : Bounds, CutAtEnd, CutAtStart, End, FuseAtEnd, FuseAtStart, IsAfter, IsBefore, IsEnclosing, IsInside, IsJustAfter, IsJustBefore, IsJustEnclosingAtEnd, IsJustEnclosingAtStart, IsJustOverlappingAtEnd, IsJustOverlappingAtStart, IsOverlappingAtEnd, IsOverlappingAtStart, IsProbablyEmpty, IsSimilar, Position, SetEnd, SetStart, Start, TolEnd, TolStart
- **Intrv_Intervals** (3 ctor) : Intersect, NbIntervals, Subtract, Unite, Value, XUnite
- **Intrv_Position** · *statiques :* Intrv_After, Intrv_Before, Intrv_Enclosing, Intrv_Inside, Intrv_JustAfter, Intrv_JustBefore, Intrv_JustEnclosingAtEnd, Intrv_JustEnclosingAtStart, Intrv_JustOverlappingAtEnd, Intrv_JustOverlappingAtStart, Intrv_OverlappingAtEnd, Intrv_OverlappingAtStart, Intrv_Similar

## IntStart

- **IntStart_SITopolTool** ← Standard_Transient : Classify, DynamicType · *statiques :* get_type_descriptor, get_type_name

## IntSurf

- **IntSurf_Couple** (2 ctor) : First, Second
- **IntSurf_InteriorPoint** (2 ctor) : Direction, Direction2d, Parameters, SetValue, UParameter, VParameter, Value
- **IntSurf_InteriorPointTool** · *statiques :* Direction2d, Direction3d, Value2d, Value3d
- **IntSurf_LineOn2S** ← Standard_Transient : Add, Clear, DynamicType, InsertBefore, IsOutBox, IsOutSurf1Box, IsOutSurf2Box, NbPoints, RemovePoint, Reverse, SetUV, Split, Value · *statiques :* get_type_descriptor, get_type_name
- **IntSurf_ListOfPntOn2S** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **IntSurf_PathPoint** (2 ctor) : AddUV, Direction2d, Direction3d, IsPassingPnt, IsTangent, Multiplicity, Parameters, SetDirections, SetPassing, SetTangency, SetValue, Value, Value2d
- **IntSurf_PathPointTool** · *statiques :* Direction2d, Direction3d, IsPassingPnt, IsTangent, Multiplicity, Parameters, Value2d, Value3d
- **IntSurf_PntOn2S** : IsSame, Parameters, ParametersOnS1, ParametersOnS2, ParametersOnSurface, SetValue, Value, ValueOnSurface
- **IntSurf_Quadric** (6 ctor) : Cone, Cylinder, D1, DN, Distance, Gradient, Normale, Parameters, Plane, SetValue, Sphere, Torus, TypeQuadric, ValAndGrad, Value
- **IntSurf_QuadricTool** · *statiques :* Gradient, Tolerance, Value, ValueAndGradient
- **IntSurf_Situation** · *statiques :* IntSurf_Inside, IntSurf_Outside, IntSurf_Unknown
- **IntSurf_Transition** (3 ctor) : IsOpposite, IsTangent, SetValue, Situation, TransitionType
- **IntSurf_TypeTrans** · *statiques :* IntSurf_In, IntSurf_Out, IntSurf_Touch, IntSurf_Undecided

## IntTools

- **IntTools_Array1OfRange** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IntTools_Array1OfRoots** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **IntTools_BaseRangeSample** (2 ctor) : GetDepth, SetDepth
- **IntTools_BeanFaceIntersector** (4 ctor) : Context, Init, IsDone, Perform, Result, SetBeanParameters, SetContext, SetSurfaceParameters
- **IntTools_CArray1OfInteger** (2 ctor) : Append, ChangeValue, Destroy, Init, IsEqual, Length, Resize, SetValue, Value
- **IntTools_CArray1OfReal** (2 ctor) : Append, ChangeValue, Destroy, Init, IsEqual, Length, Resize, SetValue, Value
- **IntTools_CommonPrt** (2 ctor) : AllNullFlag, AppendRange2, Assign, BoundingPoints, ChangeRanges2, Copy, Edge1, Edge2, Range1, Ranges2, SetAllNullFlag, SetBoundingPoints, SetEdge1, SetEdge2, SetRange1, SetType, SetVertexParameter1, SetVertexParameter2, Type, VertexParameter1, VertexParameter2
- **IntTools_Curve** (2 ctor) : Bounds, Curve, D0, FirstCurve2d, HasBounds, SecondCurve2d, SetCurve, SetCurves, SetFirstCurve2d, SetSecondCurve2d, SetTangentialTolerance, SetTolerance, TangentialTolerance, Tolerance, Type
- **IntTools_CurveRangeLocalizeData** : AddBox, AddOutRange, FindBox, GetMinRange, GetNbSample, IsRangeOut, ListRangeOut
- **IntTools_CurveRangeSample** ← IntTools_BaseRangeSample (2 ctor) : GetRange, GetRangeIndex, GetRangeIndexDeeper, IsEqual, SetRangeIndex
- **IntTools_CurveRangeSampleMapHasher** · *statiques :* HashCode, IsEqual
- **IntTools_EdgeEdge** (3 ctor) : CommonParts, FuzzyValue, IsCoincidenceCheckedQuickly, IsDone, Perform, SetEdge1, SetEdge2, SetFuzzyValue, SetRange1, SetRange2, UseQuickCoincidenceCheck
- **IntTools_EdgeFace** : CommonParts, Context, Edge, ErrorStatus, Face, FuzzyValue, IsCoincidenceCheckedQuickly, IsDone, Perform, Range, SetContext, SetEdge, SetFace, SetFuzzyValue, SetRange, UseQuickCoincidenceCheck
- **IntTools_FClass2d** (2 ctor) : Destroy, Init, IsHole, Perform, PerformInfinitePoint, TestOnRestriction
- **IntTools_FaceFace** : Context, Face1, Face2, FuzzyValue, IsDone, Lines, Perform, Points, PrepareLines3D, SetContext, SetFuzzyValue, SetList, SetParameters, TangentFaces
- **IntTools_ListOfBox** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **IntTools_ListOfCurveRangeSample** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **IntTools_ListOfSurfaceRangeSample** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **IntTools_MarkedRangeSet** (3 ctor) : Flag, GetIndex, GetIndices, InsertRange, Length, Range, SetBoundaries, SetFlag, SetRanges
- **IntTools_PntOn2Faces** (2 ctor) : IsValid, P1, P2, SetP1, SetP2, SetValid
- **IntTools_Range** (2 ctor) : First, Last, Range, SetFirst, SetLast
- **IntTools_Root** (2 ctor) : Interval, IsValid, LayerHeight, Root, SetInterval, SetLayerHeight, SetRoot, SetStateAfter, SetStateBefore, SetType, StateAfter, StateBefore, Type
- **IntTools_ShrunkRange** : BndBox, Context, Edge, IsDone, IsSplittable, Length, Perform, SetContext, SetData, SetShrunkRange, ShrunkRange
- **IntTools_SurfaceRangeLocalizeData** (3 ctor) : AddBox, AddOutRange, Assign, ClearGrid, FindBox, GetGridDeflection, GetGridPoint, GetMinRangeU, GetMinRangeV, GetNBUPointsInFrame, GetNBVPointsInFrame, GetNbSampleU, GetNbSampleV, GetPointInFrame, GetRangeUGrid, GetRangeVGrid, GetUParam, GetUParamInFrame, GetVParam, GetVParamInFrame, IsRangeOut, ListRangeOut, RemoveRangeOutAll, SetFrame, SetGridDeflection, SetGridPoint, SetRangeUGrid, SetRangeVGrid, SetUParam, SetVParam
- **IntTools_SurfaceRangeSample** (4 ctor) : Assign, GetDepthU, GetDepthV, GetDepths, GetIndexU, GetIndexV, GetIndexes, GetRangeIndexUDeeper, GetRangeIndexVDeeper, GetRangeU, GetRangeV, GetRanges, GetSampleRangeU, GetSampleRangeV, IsEqual, SetDepthU, SetDepthV, SetIndexU, SetIndexV, SetIndexes, SetRanges, SetSampleRangeU, SetSampleRangeV
- **IntTools_SurfaceRangeSampleMapHasher** · *statiques :* HashCode, IsEqual
- **IntTools_Tools** · *statiques :* CheckCurve, ClassifyPointByFace, ComputeIntRange, ComputeTolerance, ComputeVV, CurveTolerance, HasInternalEdge, IntermediatePoint, IsClosed, IsDirsCoinside, IsInRange, IsMiddlePointsEqual, IsOnPave, IsOnPave1, IsVertex, MakeFaceFromWireAndFace, RejectLines, SegPln, SplitCurve, VertexParameter, VertexParameters
- **IntTools_TopolTool** ← Adaptor3d_TopolTool (2 ctor) : ComputeSamplePoints, DynamicType, Initialize, NbSamples, NbSamplesU, NbSamplesV, SamplePnts, SamplePoint · *statiques :* get_type_descriptor, get_type_name
- **IntTools_WLineTool** · *statiques :* DecompositionOfWLine, NotUseSurfacesForApprox

## IntWalk

- **IntWalk_PWalking** (2 ctor) : AddAPoint, IsClosed, IsDone, Line, MaxStep, NbPoints, Perform, PerformFirstPoint, PutToBoundary, RemoveAPoint, RepartirOuDiviser, SeekAdditionalPoints, TangentAtFirst, TangentAtLast, TangentAtLine, TestArret, TestDeflection, Value
- **IntWalk_StatusDeflection** · *statiques :* IntWalk_ArretSurPoint, IntWalk_ArretSurPointPrecedent, IntWalk_OK, IntWalk_PasTropGrand, IntWalk_PointConfondu, IntWalk_StepTooSmall
- **IntWalk_TheFunctionOfTheInt2S** ← math_FunctionSetWithDerivatives : AuxillarSurface1, AuxillarSurface2, ComputeParameters, Derivatives, Direction, DirectionOnS1, DirectionOnS2, IsTangent, NbEquations, NbVariables, Point, Root, Value, Values
- **IntWalk_TheInt2S** (2 ctor) : ChangePoint, Direction, DirectionOnS1, DirectionOnS2, Function, IsDone, IsEmpty, IsTangent, Perform, Point

## Law

- **Law_BSpFunc** ← Law_Function (2 ctor) : Bounds, Continuity, Curve, D1, D2, DynamicType, Intervals, NbIntervals, SetCurve, Trim, Value · *statiques :* get_type_descriptor, get_type_name
- **Law_BSpline** ← Standard_Transient (2 ctor) : Continuity, Copy, D0, D1, D2, D3, DN, Degree, DynamicType, EndPoint, FirstParameter, FirstUKnotIndex, IncreaseDegree, IncreaseMultiplicity, IncrementMultiplicity, InsertKnot, InsertKnots, IsCN, IsClosed, IsPeriodic, IsRational, Knot, KnotDistribution, KnotSequence, Knots, LastParameter, LastUKnotIndex, LocalD0, LocalD1, LocalD2, LocalD3, LocalDN, LocalValue, LocateU, MovePointAndTangent, Multiplicities, Multiplicity, NbKnots, NbPoles, PeriodicNormalization, Pole, Poles, RemoveKnot, Resolution, Reverse, ReversedParameter, Segment, SetKnot, SetKnots, SetNotPeriodic, SetOrigin, SetPeriodic, SetPole, SetWeight, StartPoint, Value, Weight, Weights · *statiques :* MaxDegree, get_type_descriptor, get_type_name
- **Law_BSplineKnotSplitting** : NbSplits, SplitValue, Splitting
- **Law_Composite** ← Law_Function (2 ctor) : Bounds, ChangeElementaryLaw, ChangeLaws, Continuity, D1, D2, DynamicType, Intervals, IsPeriodic, NbIntervals, SetPeriodic, Trim, Value · *statiques :* get_type_descriptor, get_type_name
- **Law_Constant** ← Law_Function : Bounds, Continuity, D1, D2, DynamicType, Intervals, NbIntervals, Set, Trim, Value · *statiques :* get_type_descriptor, get_type_name
- **Law_Function** ← Standard_Transient : Bounds, Continuity, D1, D2, DynamicType, Intervals, NbIntervals, Trim, Value · *statiques :* get_type_descriptor, get_type_name
- **Law_Interpol** ← Law_BSpFunc : DynamicType, Set, SetInRelative · *statiques :* get_type_descriptor, get_type_name
- **Law_Laws** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **Law_Linear** ← Law_Function : Bounds, Continuity, D1, D2, DynamicType, Intervals, NbIntervals, Set, Trim, Value · *statiques :* get_type_descriptor, get_type_name
- **Law_S** ← Law_BSpFunc : DynamicType, Set · *statiques :* get_type_descriptor, get_type_name

## LDOM

- **LDOM_Attr** (2 ctor)
- **LDOM_BasicAttribute** ← LDOM_BasicNode : GetName, GetValue, SetValue
- **LDOM_BasicElement** ← LDOM_BasicNode : GetAttribute, GetFirstChild, GetLastChild, GetTagName · *statiques :* Create
- **LDOM_BasicNode** : GetSibling, getNodeType, isNull
- **LDOM_BasicText** ← LDOM_BasicNode : GetData, SetData
- **LDOM_CDATASection** (2 ctor)
- **LDOM_CharReference** · *statiques :* Decode, Encode
- **LDOM_CharacterData** (2 ctor)
- **LDOM_Comment** (2 ctor)
- **LDOM_Document** (2 ctor) : createCDATASection, createComment, createElement, createTextNode, getDocumentElement, getElementsByTagName, isNull · *statiques :* createDocument
- **LDOM_DocumentType**
- **LDOM_Element** (2 ctor)
- **LDOM_LDOMImplementation** · *statiques :* createDocument
- **LDOM_NodeList** (2 ctor) : getLength, item
- **LDOM_OSStream**
- **LDOM_SBuffer**
- **LDOM_Text** (2 ctor)
- **LDOM_XmlReader** : CreateElement, GetElement, ReadRecord · *statiques :* getInteger
- **LDOM_XmlWriter** : SetIndentation, Write

## LocalAnalysis

- **LocalAnalysis_CurveContinuity** : C0Value, C1Angle, C1Ratio, C2Angle, C2Ratio, ContinuityStatus, G1Angle, G2Angle, G2CurvatureVariation, IsC0, IsC1, IsC2, IsDone, IsG1, IsG2, StatusError
- **LocalAnalysis_StatusErrorType** · *statiques :* LocalAnalysis_CurvatureNotDefined, LocalAnalysis_NormalNotDefined, LocalAnalysis_NullFirstDerivative, LocalAnalysis_NullSecondDerivative, LocalAnalysis_TangentNotDefined
- **LocalAnalysis_SurfaceContinuity** (3 ctor) : C0Value, C1UAngle, C1URatio, C1VAngle, C1VRatio, C2UAngle, C2URatio, C2VAngle, C2VRatio, ComputeAnalysis, ContinuityStatus, G1Angle, G2CurvatureGap, IsC0, IsC1, IsC2, IsDone, IsG1, IsG2, StatusError

## LocOpe

- **LocOpe_BuildShape** (2 ctor) : Perform, Shape
- **LocOpe_BuildWires** (2 ctor) : IsDone, Perform, Result
- **LocOpe_CSIntersector** (2 ctor) : Destroy, Init, IsDone, LocalizeAfter, LocalizeBefore, NbPoints, Perform, Point
- **LocOpe_CurveShapeIntersector** (3 ctor) : Init, IsDone, LocalizeAfter, LocalizeBefore, NbPoints, Point
- **LocOpe_DPrism** (2 ctor) : BarycCurve, Curves, FirstShape, IsDone, LastShape, Profile, Shape, Shapes, Spine
- **LocOpe_FindEdges** (2 ctor) : EdgeFrom, EdgeTo, InitIterator, More, Next, Set
- **LocOpe_FindEdgesInFace** (2 ctor) : Edge, Init, More, Next, Set
- **LocOpe_GeneratedShape** ← Standard_Transient : DynamicType, Generated, GeneratingEdges, OrientedFaces · *statiques :* get_type_descriptor, get_type_name
- **LocOpe_Generator** (2 ctor) : DescendantFace, Init, IsDone, Perform, ResultingShape, Shape
- **LocOpe_GluedShape** ← LocOpe_GeneratedShape (2 ctor) : DynamicType, Generated, GeneratingEdges, GlueOnFace, Init, OrientedFaces · *statiques :* get_type_descriptor, get_type_name
- **LocOpe_Gluer** (2 ctor) : BasisShape, Bind, DescendantFaces, Edges, GluedShape, Init, IsDone, OpeType, Perform, ResultingShape, TgtEdges
- **LocOpe_LinearForm** (3 ctor) : FirstShape, LastShape, Perform, Shape, Shapes
- **LocOpe_Operation** · *statiques :* LocOpe_CUT, LocOpe_FUSE, LocOpe_INVALID
- **LocOpe_Pipe** : BarycCurve, Curves, FirstShape, LastShape, Profile, Shape, Shapes, Spine
- **LocOpe_PntFace** (2 ctor) : ChangeOrientation, Face, Orientation, Parameter, Pnt, UParameter, VParameter
- **LocOpe_Prism** (3 ctor) : BarycCurve, Curves, FirstShape, LastShape, Perform, Shape, Shapes
- **LocOpe_SplitDrafts** (2 ctor) : Init, IsDone, OriginalShape, Perform, Shape, ShapesFromShape
- **LocOpe_SplitShape** (2 ctor) : Add, CanSplit, DescendantShapes, Init, LeftOf, Shape
- **LocOpe_Spliter** (2 ctor) : DescendantShapes, DirectLeft, Init, IsDone, Left, Perform, ResultingShape, Shape
- **LocOpe_WiresOnShape** ← Standard_Transient : Add, Bind, BindAll, DynamicType, Edge, Init, InitEdgeIterator, IsDone, IsFaceWithSection, MoreEdge, NextEdge, OnEdge, OnFace, OnVertex, SetCheckInterior · *statiques :* get_type_descriptor, get_type_name

## LProp

- **LProp_AnalyticCurInf** : Perform
- **LProp_BadContinuity** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **LProp_CIType** · *statiques :* LProp_Inflection, LProp_MaxCur, LProp_MinCur
- **LProp_CurAndInf** : AddExtCur, AddInflection, Clear, IsEmpty, NbPoints, Parameter, Type
- **LProp_NotDefined** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **LProp_Status** · *statiques :* LProp_Computed, LProp_Defined, LProp_Undecided, LProp_Undefined

## LProp3d

- **LProp3d_CLProps** (3 ctor) : CentreOfCurvature, Curvature, D1, D2, D3, IsTangentDefined, Normal, SetCurve, SetParameter, Tangent, Value
- **LProp3d_CurveTool** · *statiques :* Continuity, D1, D2, D3, FirstParameter, LastParameter, Value
- **LProp3d_SLProps** (3 ctor) : CurvatureDirections, D1U, D1V, D2U, D2V, DUV, GaussianCurvature, IsCurvatureDefined, IsNormalDefined, IsTangentUDefined, IsTangentVDefined, IsUmbilic, MaxCurvature, MeanCurvature, MinCurvature, Normal, SetParameters, SetSurface, TangentU, TangentV, Value
- **LProp3d_SurfaceTool** · *statiques :* Bounds, Continuity, D1, D2, DN, Value

## MAT

- **MAT_Arc** ← Standard_Transient : DynamicType, FirstElement, FirstNode, GeomIndex, HasNeighbour, Index, Neighbour, SecondElement, SecondNode, SetFirstArc, SetFirstElement, SetFirstNode, SetGeomIndex, SetIndex, SetNeighbour, SetSecondArc, SetSecondElement, SetSecondNode, TheOtherNode · *statiques :* get_type_descriptor, get_type_name
- **MAT_BasicElt** ← Standard_Transient : DynamicType, EndArc, GeomIndex, Index, SetEndArc, SetGeomIndex, SetIndex, SetStartArc, StartArc · *statiques :* get_type_descriptor, get_type_name
- **MAT_Bisector** ← Standard_Transient : AddBisector, BisectorNumber, DistIssuePoint, Dump, DynamicType, EndPoint, FirstBisector, FirstEdge, FirstParameter, FirstVector, IndexNumber, IssuePoint, LastBisector, List, SecondEdge, SecondParameter, SecondVector, Sense · *statiques :* get_type_descriptor, get_type_name
- **MAT_Edge** ← Standard_Transient : Distance, Dump, DynamicType, EdgeNumber, FirstBisector, IntersectionPoint, SecondBisector · *statiques :* get_type_descriptor, get_type_name
- **MAT_Graph** ← Standard_Transient : Arc, BasicElt, ChangeBasicElt, ChangeBasicElts, CompactArcs, CompactNodes, DynamicType, FusionOfBasicElts, Node, NumberOfArcs, NumberOfBasicElts, NumberOfInfiniteNodes, NumberOfNodes, Perform · *statiques :* get_type_descriptor, get_type_name
- **MAT_ListOfBisector** ← Standard_Transient : BackAdd, Brackets, Current, Dump, DynamicType, First, FirstItem, FrontAdd, Index, Init, IsEmpty, Last, LastItem, LinkAfter, LinkBefore, Loop, More, Next, NextItem, Number, Permute, Previous, PreviousItem, Unlink · *statiques :* get_type_descriptor, get_type_name
- **MAT_ListOfEdge** ← Standard_Transient : BackAdd, Brackets, Current, Dump, DynamicType, First, FirstItem, FrontAdd, Index, Init, IsEmpty, Last, LastItem, LinkAfter, LinkBefore, Loop, More, Next, NextItem, Number, Permute, Previous, PreviousItem, Unlink · *statiques :* get_type_descriptor, get_type_name
- **MAT_Node** ← Standard_Transient : Distance, DynamicType, GeomIndex, Index, Infinite, LinkedArcs, NearElts, OnBasicElt, PendingNode, SetIndex, SetLinkedArc · *statiques :* get_type_descriptor, get_type_name
- **MAT_Side** · *statiques :* MAT_Left, MAT_Right
- **MAT_TListNodeOfListOfBisector** ← Standard_Transient (2 ctor) : Dummy, DynamicType, GetItem, Next, Previous, SetItem · *statiques :* get_type_descriptor, get_type_name
- **MAT_TListNodeOfListOfEdge** ← Standard_Transient (2 ctor) : Dummy, DynamicType, GetItem, Next, Previous, SetItem · *statiques :* get_type_descriptor, get_type_name
- **MAT_Zone** ← Standard_Transient (2 ctor) : ArcOnFrontier, DynamicType, Limited, NoEmptyZone, NumberOfArcs, Perform · *statiques :* get_type_descriptor, get_type_name

## MAT2d

- **MAT2d_BiInt** : FirstIndex, IsEqual, SecondIndex
- **MAT2d_Circuit** ← Standard_Transient : Connexion, ConnexionOn, DynamicType, LineLength, NumberOfItems, Perform, RefToEqui, Value · *statiques :* get_type_descriptor, get_type_name
- **MAT2d_Connexion** ← Standard_Transient (2 ctor) : Distance, Dump, DynamicType, IndexFirstLine, IndexItemOnFirst, IndexItemOnSecond, IndexSecondLine, IsAfter, ParameterOnFirst, ParameterOnSecond, PointOnFirst, PointOnSecond, Reverse · *statiques :* get_type_descriptor, get_type_name
- **MAT2d_MapBiIntHasher** · *statiques :* HashCode, IsEqual
- **MAT2d_Mat2d** : Bisector, CreateMat, CreateMatOpen, Init, IsDone, More, Next, NumberOfBisectors, SemiInfinite
- **MAT2d_MiniPath** : ConnexionsFrom, Father, IsConnexionsFrom, IsRoot, Path, Perform, RunOnConnexions
- **MAT2d_Tool2d** : BisecFusion, ChangeGeomBis, Circuit, CreateBisector, Distance, Dump, FirstPoint, GeomBis, GeomElt, GeomPnt, GeomVec, InitItems, IntersectBisector, NumberOfItems, Sense, SetJoinType, Tangent, TangentAfter, TangentBefore, ToleranceOfConfusion, TrimBisector

## math

- **math_Array1OfValueAndWeight** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **math_BFGS** : Dump, Gradient, IsDone, IsSolutionReached, Location, Minimum, NbIterations, Perform, SetBoundary
- **math_BissecNewton** : Derivative, Dump, IsDone, IsSolutionReached, Perform, Root, Value
- **math_BracketMinimum** (4 ctor) : Dump, FunctionValues, IsDone, Perform, SetFA, SetFB, SetLimits, Values
- **math_BracketedRoot** : Dump, IsDone, NbIterations, Root, Value
- **math_BrentMinimum** (2 ctor) : Dump, IsDone, IsSolutionReached, Location, Minimum, NbIterations, Perform
- **math_BullardGenerator** : NextInt, NextReal, SetSeed
- **math_ComputeGaussPointsAndWeights** : IsDone, Points, Weights
- **math_ComputeKronrodPointsAndWeights** : IsDone, Points, Weights
- **math_Crout** : Determinant, Dump, Inverse, Invert, IsDone, Solve
- **math_DirectPolynomialRoots** (4 ctor) : Dump, InfiniteRoots, IsDone, NbSolutions, Value
- **math_DoubleTab** (3 ctor) : Copy, Free, Init, SetLowerCol, SetLowerRow, Value
- **math_EigenValuesSearcher** : Dimension, EigenValue, EigenVector, IsDone
- **math_FRPR** : Dump, Gradient, IsDone, IsSolutionReached, Location, Minimum, NbIterations, Perform
- **math_Function** : GetStateNumber, Value
- **math_FunctionAllRoots** : Dump, GetInterval, GetIntervalState, GetPoint, GetPointState, IsDone, NbIntervals, NbPoints
- **math_FunctionRoot** (2 ctor) : Derivative, Dump, IsDone, NbIterations, Root, Value
- **math_FunctionRoots** : Dump, IsAllNull, IsDone, NbSolutions, StateNumber, Value
- **math_FunctionSample** : Bounds, GetParameter, NbPoints
- **math_FunctionSet** : GetStateNumber, NbEquations, NbVariables, Value
- **math_FunctionSetRoot** (2 ctor) : Derivative, Dump, FunctionSetErrors, IsDivergent, IsDone, IsSolutionReached, NbIterations, Perform, Root, SetTolerance, StateNumber
- **math_FunctionSetWithDerivatives** ← math_FunctionSet : Derivatives, NbEquations, NbVariables, Value, Values
- **math_FunctionWithDerivative** ← math_Function : Derivative, Value, Values
- **math_Gauss** : Determinant, Dump, Invert, IsDone, Solve
- **math_GaussLeastSquare** : Dump, IsDone, Solve
- **math_GaussMultipleIntegration** : Dump, IsDone, Value
- **math_GaussSetIntegration** : Dump, IsDone, Value
- **math_GaussSingleIntegration** (3 ctor) : Dump, IsDone, Value
- **math_GlobOptMin** : GetContinuity, GetF, GetFunctionalMinimalValue, GetLipConstState, GetTol, NbExtrema, Perform, Points, SetContinuity, SetFunctionalMinimalValue, SetGlobalParams, SetLipConstState, SetLocalParams, SetTol, isDone
- **math_Jacobi** : Dump, IsDone, Value, Values, Vector, Vectors
- **math_KronrodSingleIntegration** (3 ctor) : AbsolutError, ErrorReached, IsDone, NbIterReached, OrderReached, Perform, Value · *statiques :* GKRule
- **math_MultipleVarFunction** : GetStateNumber, NbVariables, Value
- **math_MultipleVarFunctionWithGradient** ← math_MultipleVarFunction : Gradient, NbVariables, Value, Values
- **math_MultipleVarFunctionWithHessian** ← math_MultipleVarFunctionWithGradient : Gradient, NbVariables, Value, Values
- **math_NewtonFunctionRoot** (3 ctor) : Derivative, Dump, IsDone, NbIterations, Perform, Root, Value
- **math_NotSquare** ← Standard_DimensionError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **math_PSO** : Perform
- **math_PSOParticlesPool** : GetBestParticle, GetParticle, GetWorstParticle
- **math_Powell** : Dump, IsDone, IsSolutionReached, Location, Minimum, NbIterations, Perform
- **math_SVD** : Dump, IsDone, PseudoInverse, Solve
- **math_SingularMatrix** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **math_Status** · *statiques :* math_DirectionSearchError, math_FunctionError, math_NotBracketed, math_OK, math_TooManyIterations
- **math_TrigonometricEquationFunction** ← math_FunctionWithDerivative : Derivative, Value, Values
- **math_TrigonometricFunctionRoots** (3 ctor) : Dump, InfiniteRoots, IsDone, NbSolutions, Value
- **math_Uzawa** (2 ctor) : Duale, Dump, Error, InitialError, InverseCont, IsDone, NbIterations, Value
- **math_ValueAndWeight** (2 ctor) : Value, Weight

## MeshVS

- **MeshVS_Array1OfSequenceOfInteger** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **MeshVS_Buffer**
- **MeshVS_CommonSensitiveEntity** ← Select3D_SensitiveSet : BoundingBox, Box, Center, CenterOfGeometry, DynamicType, GetConnected, NbSubElements, Size, Swap · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_DataSource** ← Standard_Transient : DynamicType, Get3DGeom, GetAddr, GetAllElements, GetAllGroups, GetAllNodes, GetBoundingBox, GetDetectedEntities, GetGeom, GetGeomType, GetGroup, GetGroupAddr, GetNodeNormal, GetNodesByElement, GetNormal, GetNormalsByElement, IsAdvancedSelectionEnabled · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_DataSource3D** ← MeshVS_DataSource : DynamicType, GetPrismTopology, GetPyramidTopology · *statiques :* CreatePrismTopology, CreatePyramidTopology, get_type_descriptor, get_type_name
- **MeshVS_DeformedDataSource** ← MeshVS_DataSource : DynamicType, Get3DGeom, GetAddr, GetAllElements, GetAllNodes, GetGeom, GetGeomType, GetMagnify, GetNodesByElement, GetNonDeformedDataSource, GetVector, GetVectors, SetMagnify, SetNonDeformedDataSource, SetVector, SetVectors · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_Drawer** ← Standard_Transient : Assign, DynamicType, GetAsciiString, GetBoolean, GetColor, GetDouble, GetInteger, GetMaterial, RemoveAsciiString, RemoveBoolean, RemoveColor, RemoveDouble, RemoveInteger, RemoveMaterial, SetAsciiString, SetBoolean, SetColor, SetDouble, SetInteger, SetMaterial · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_DrawerAttribute** · *statiques :* MeshVS_DA_BackInteriorColor, MeshVS_DA_BackMaterial, MeshVS_DA_BeamColor, MeshVS_DA_BeamType, MeshVS_DA_BeamWidth, MeshVS_DA_ColorReflection, MeshVS_DA_ComputeSelectionTime, MeshVS_DA_ComputeTime, MeshVS_DA_DisplayNodes, MeshVS_DA_EdgeColor, MeshVS_DA_EdgeType, MeshVS_DA_EdgeWidth, MeshVS_DA_FrontMaterial, MeshVS_DA_HatchStyle, MeshVS_DA_InteriorColor, MeshVS_DA_InteriorStyle, MeshVS_DA_IsAllowOverlapped, MeshVS_DA_MarkerColor, MeshVS_DA_MarkerScale, MeshVS_DA_MarkerType, MeshVS_DA_MaxFaceNodes, MeshVS_DA_Reflection, MeshVS_DA_SelectableAuto, MeshVS_DA_ShowEdges, MeshVS_DA_ShrinkCoeff, MeshVS_DA_SmoothShading, MeshVS_DA_SupressBackFaces, MeshVS_DA_TextColor, MeshVS_DA_TextDisplayType, MeshVS_DA_TextExpansionFactor, MeshVS_DA_TextFont, MeshVS_DA_TextFontAspect, MeshVS_DA_TextHeight, MeshVS_DA_TextSpace, MeshVS_DA_TextStyle, MeshVS_DA_TextTexFont, MeshVS_DA_User, MeshVS_DA_VectorArrowPart, MeshVS_DA_VectorColor, MeshVS_DA_VectorMaxLength
- **MeshVS_DummySensitiveEntity** ← Select3D_SensitiveEntity : BVH, BoundingBox, CenterOfGeometry, Clear, DynamicType, HasInitLocation, InvInitLocation, Matches, NbSubElements · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_ElementalColorPrsBuilder** ← MeshVS_PrsBuilder : Build, DynamicType, GetColor1, GetColor2, GetColors1, GetColors2, HasColors1, HasColors2, SetColor1, SetColor2, SetColors1, SetColors2 · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_Mesh**
- **MeshVS_MeshEntityOwner** ← SelectMgr_EntityOwner : Clear, DynamicType, HilightWithColor, ID, IsGroup, IsHilighted, Owner, Type, Unhilight · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_MeshOwner** ← SelectMgr_EntityOwner : AddSelectedEntities, ClearSelectedEntities, DynamicType, GetDataSource, GetDetectedElements, GetDetectedNodes, GetSelectedElements, GetSelectedNodes, HilightWithColor, IsForcedHilight, SetDetectedEntities, Unhilight · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_MeshPrsBuilder** ← MeshVS_PrsBuilder : Build, BuildElements, BuildHilightPrs, BuildNodes, DynamicType · *statiques :* AddVolumePrs, HowManyPrimitives, get_type_descriptor, get_type_name
- **MeshVS_MeshSelectionMethod** · *statiques :* MeshVS_MSM_BOX, MeshVS_MSM_NODES, MeshVS_MSM_PRECISE
- **MeshVS_NodalColorPrsBuilder** ← MeshVS_PrsBuilder : AddVolumePrs, Build, DynamicType, GetColor, GetColorMap, GetColors, GetInvalidColor, GetTextureCoord, GetTextureCoords, HasColors, IsUseTexture, SetColor, SetColorMap, SetColors, SetInvalidColor, SetTextureCoord, SetTextureCoords, UseTexture · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_PolyhedronVerts** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **MeshVS_PrsBuilder** ← Standard_Transient : Build, CustomBuild, CustomSensitiveEntity, DynamicType, GetDataSource, GetDrawer, GetFlags, GetId, GetPresentationManager, GetPriority, IsExcludingOn, SetDataSource, SetDrawer, SetExcluding, SetPresentationManager, TestFlags · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_SensitiveFace** ← Select3D_SensitiveFace : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_SensitiveMesh** ← Select3D_SensitiveEntity : BoundingBox, CenterOfGeometry, DynamicType, GetConnected, GetMode, Matches, NbSubElements · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_SensitivePolyhedron** ← Select3D_SensitiveEntity : BoundingBox, CenterOfGeometry, DynamicType, GetConnected, Matches, NbSubElements · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_SensitiveQuad** ← Select3D_SensitiveEntity (2 ctor) : BoundingBox, CenterOfGeometry, DynamicType, GetConnected, Matches, NbSubElements · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_SensitiveSegment** ← Select3D_SensitiveSegment : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_TextPrsBuilder** ← MeshVS_PrsBuilder : Build, DynamicType, GetText, GetTexts, HasTexts, SetText, SetTexts · *statiques :* get_type_descriptor, get_type_name
- **MeshVS_Tool** · *statiques :* CreateAspectFillArea3d, CreateAspectLine3d, CreateAspectMarker3d, CreateAspectText3d, GetAverageNormal, GetNormal
- **MeshVS_VectorPrsBuilder** ← MeshVS_PrsBuilder : Build, DrawVector, DynamicType, GetMinMaxVectorValue, GetVector, GetVectors, HasVectors, SetSimplePrsMode, SetSimplePrsParams, SetVector, SetVectors · *statiques :* calculateArrow, get_type_descriptor, get_type_name

## Message

- **Message_Alert** ← Standard_Transient : DynamicType, GetMessageKey, Merge, SupportsMerge · *statiques :* get_type_descriptor, get_type_name
- **Message_Algorithm** ← Standard_Transient : AddStatus, ChangeStatus, ClearStatus, DynamicType, GetMessageNumbers, GetMessageStrings, GetMessenger, GetStatus, SendMessages, SendStatusMessages, SetMessenger, SetStatus · *statiques :* PrepareReport, get_type_descriptor, get_type_name
- **Message_ArrayOfMsg** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Message_ExecStatus** (2 ctor) : Add, And, Clear, ClearAllAlarm, ClearAllDone, ClearAllFail, ClearAllWarn, IsAlarm, IsDone, IsFail, IsSet, IsWarn, Set, SetAllAlarm, SetAllDone, SetAllFail, SetAllWarn · *statiques :* LocalStatusIndex, StatusByIndex, StatusIndex, TypeOfStatus
- **Message_Gravity** · *statiques :* Message_Alarm, Message_Fail, Message_Info, Message_Trace, Message_Warning
- **Message_ListOfAlert** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **Message_ListOfMsg** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **Message_Messenger** ← Standard_Transient (2 ctor) : AddPrinter, ChangePrinters, DynamicType, Printers, RemovePrinter, RemovePrinters, Send · *statiques :* get_type_descriptor, get_type_name
- **Message_Msg** (4 ctor) : Arg, Get, IsEdited, Original, Set, Value
- **Message_MsgFile** · *statiques :* AddMsg, HasMsg, Load, LoadFile, LoadFromEnv, LoadFromString, Msg
- **Message_Printer** ← Standard_Transient : DynamicType, GetTraceLevel, Send, SetTraceLevel · *statiques :* get_type_descriptor, get_type_name
- **Message_PrinterOStream** ← Message_Printer (2 ctor) : Close, DynamicType, GetUseUtf8, Send, SetUseUtf8 · *statiques :* get_type_descriptor, get_type_name
- **Message_ProgressIndicator** ← Standard_Transient : DynamicType, EndScope, GetNbScopes, GetPosition, GetScale, GetScope, GetValue, Increment, NewScope, NextScope, Reset, SetInfinite, SetName, SetRange, SetScale, SetStep, SetValue, Show, UserBreak · *statiques :* get_type_descriptor, get_type_name
- **Message_ProgressScale** : BaseToLocal, GetFirst, GetInfinite, GetLast, GetMax, GetMin, GetName, GetStep, LocalToBase, SetInfinite, SetMax, SetMin, SetName, SetRange, SetScale, SetSpan, SetStep
- **Message_ProgressSentry** (2 ctor) : More, Next, Relieve, Show
- **Message_Report** ← Standard_Transient : AddAlert, Clear, Dump, DynamicType, GetAlerts, HasAlert, Merge, SendMessages · *statiques :* get_type_descriptor, get_type_name
- **Message_Status** · *statiques :* Message_Alarm1, Message_Alarm10, Message_Alarm11, Message_Alarm12, Message_Alarm13, Message_Alarm14, Message_Alarm15, Message_Alarm16, Message_Alarm17, Message_Alarm18, Message_Alarm19, Message_Alarm2, Message_Alarm20, Message_Alarm21, Message_Alarm22, Message_Alarm23, Message_Alarm24, Message_Alarm25, Message_Alarm26, Message_Alarm27, Message_Alarm28, Message_Alarm29, Message_Alarm3, Message_Alarm30, Message_Alarm31, Message_Alarm32, Message_Alarm4, Message_Alarm5, Message_Alarm6, Message_Alarm7, Message_Alarm8, Message_Alarm9, Message_Done1, Message_Done10, Message_Done11, Message_Done12, Message_Done13, Message_Done14, Message_Done15, Message_Done16, Message_Done17, Message_Done18, Message_Done19, Message_Done2, Message_Done20, Message_Done21, Message_Done22, Message_Done23, Message_Done24, Message_Done25, Message_Done26, Message_Done27, Message_Done28, Message_Done29, Message_Done3, Message_Done30, Message_Done31, Message_Done32, Message_Done4, Message_Done5, Message_Done6, Message_Done7, Message_Done8, Message_Done9, Message_Fail1, Message_Fail10, Message_Fail11, Message_Fail12, Message_Fail13, Message_Fail14, Message_Fail15, Message_Fail16, Message_Fail17, Message_Fail18, Message_Fail19, Message_Fail2, Message_Fail20, Message_Fail21, Message_Fail22, Message_Fail23, Message_Fail24, Message_Fail25, Message_Fail26, Message_Fail27, Message_Fail28, Message_Fail29, Message_Fail3, Message_Fail30, Message_Fail31, Message_Fail32, Message_Fail4, Message_Fail5, Message_Fail6, Message_Fail7, Message_Fail8, Message_Fail9, Message_None, Message_Warn1, Message_Warn10, Message_Warn11, Message_Warn12, Message_Warn13, Message_Warn14, Message_Warn15, Message_Warn16, Message_Warn17, Message_Warn18, Message_Warn19, Message_Warn2, Message_Warn20, Message_Warn21, Message_Warn22, Message_Warn23, Message_Warn24, Message_Warn25, Message_Warn26, Message_Warn27, Message_Warn28, Message_Warn29, Message_Warn3, Message_Warn30, Message_Warn31, Message_Warn32, Message_Warn4, Message_Warn5, Message_Warn6, Message_Warn7, Message_Warn8, Message_Warn9
- **Message_StatusType** · *statiques :* Message_ALARM, Message_DONE, Message_FAIL, Message_WARN

## MoniTool

- **MoniTool_AttrList** (2 ctor) : AttrList, Attribute, AttributeType, GetAttribute, GetAttributes, GetIntegerAttribute, GetRealAttribute, GetStringAttribute, IntegerAttribute, RealAttribute, RemoveAttribute, SameAttributes, SetAttribute, SetIntegerAttribute, SetRealAttribute, SetStringAttribute, StringAttribute
- **MoniTool_CaseData** ← Standard_Transient : AddAny, AddCPU, AddData, AddEntity, AddGeom, AddInteger, AddRaised, AddReal, AddReals, AddShape, AddText, AddXY, AddXYZ, CaseId, Data, DynamicType, GetCPU, GetData, Integer, IsCheck, IsFail, IsWarning, Kind, LargeCPU, Msg, Name, NameNum, NbData, Real, Reals, RemoveData, ResetCheck, SetCaseId, SetChange, SetFail, SetName, SetReplace, SetWarning, Shape, Text, XY, XYZ · *statiques :* DefCheck, DefMsg, SetDefFail, SetDefMsg, SetDefWarning, get_type_descriptor, get_type_name
- **MoniTool_DataInfo** · *statiques :* Type, TypeName
- **MoniTool_ElemHasher** · *statiques :* HashCode, IsEqual
- **MoniTool_Element** ← Standard_Transient : ChangeAttr, DynamicType, Equates, GetHashCode, ListAttr, ValueType, ValueTypeName · *statiques :* get_type_descriptor, get_type_name
- **MoniTool_IntVal** ← Standard_Transient : CValue, DynamicType, Value · *statiques :* get_type_descriptor, get_type_name
- **MoniTool_MTHasher** · *statiques :* HashCode, IsEqual
- **MoniTool_RealVal** ← Standard_Transient : CValue, DynamicType, Value · *statiques :* get_type_descriptor, get_type_name
- **MoniTool_SignShape** ← MoniTool_SignText : DynamicType, Name, Text · *statiques :* get_type_descriptor, get_type_name
- **MoniTool_SignText** ← Standard_Transient : DynamicType, Name, Text, TextAlone · *statiques :* get_type_descriptor, get_type_name
- **MoniTool_Stat** (2 ctor) : Add, AddEnd, AddSub, Close, Level, Open, OpenMore, Percent · *statiques :* Current
- **MoniTool_Timer** ← Standard_Transient : Amend, CPU, Count, Dump, DynamicType, IsRunning, Reset, Start, Stop, Timer · *statiques :* ClearTimers, ComputeAmendments, Dictionary, DumpTimers, GetAmendments, Start, Stop, Timer, get_type_descriptor, get_type_name
- **MoniTool_TimerSentry** (2 ctor) : Stop, Timer
- **MoniTool_TransientElem** ← MoniTool_Element : DynamicType, Equates, Value, ValueType, ValueTypeName · *statiques :* get_type_descriptor, get_type_name
- **MoniTool_TypedValue** ← Standard_Transient (2 ctor) : AddDef, AddEnum, AddEnumValue, CStringValue, ClearValue, Definition, DynamicType, EnumCase, EnumDef, EnumVal, GetObjectValue, HStringValue, HasInterpret, IntegerLimit, IntegerValue, Internals, Interpret, IsSetValue, Label, MaxLength, Name, ObjectType, ObjectTypeName, ObjectValue, Print, PrintValue, RealLimit, RealValue, Satisfies, SatisfiesName, SetCStringValue, SetDefinition, SetHStringValue, SetIntegerLimit, SetIntegerValue, SetInterpret, SetLabel, SetMaxLength, SetObjectType, SetObjectValue, SetRealLimit, SetRealValue, SetSatisfies, SetUnitDef, StartEnum, UnitDef, ValueType · *statiques :* AddLib, FromLib, Lib, LibList, StaticValue, get_type_descriptor, get_type_name
- **MoniTool_ValueType** · *statiques :* MoniTool_ValueBinary, MoniTool_ValueEnum, MoniTool_ValueHexa, MoniTool_ValueIdent, MoniTool_ValueInteger, MoniTool_ValueLogical, MoniTool_ValueMisc, MoniTool_ValueReal, MoniTool_ValueSub, MoniTool_ValueText, MoniTool_ValueVoid

## NCollection

- **NCollection_BaseList** : Allocator, Extent, IsEmpty
- **NCollection_CellFilter_Action** · *statiques :* CellFilter_Keep, CellFilter_Purge

## NLPlate

- **NLPlate_HGPPConstraint** ← Standard_Transient : ActiveOrder, DynamicType, G0Criterion, G0Target, G1Criterion, G1Target, G2Criterion, G2Target, G3Criterion, G3Target, IncrementalLoadAllowed, IsG0, Orientation, SetActiveOrder, SetG0Criterion, SetG1Criterion, SetG2Criterion, SetG3Criterion, SetIncrementalLoadAllowed, SetOrientation, SetUV, SetUVFreeSliding, UV, UVFreeSliding · *statiques :* get_type_descriptor, get_type_name
- **NLPlate_HPG0Constraint** ← NLPlate_HGPPConstraint : ActiveOrder, DynamicType, G0Target, IncrementalLoadAllowed, IsG0, SetIncrementalLoadAllowed, SetUVFreeSliding, UVFreeSliding · *statiques :* get_type_descriptor, get_type_name
- **NLPlate_HPG0G1Constraint** ← NLPlate_HPG0Constraint : ActiveOrder, DynamicType, G1Target, Orientation, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **NLPlate_HPG0G2Constraint** ← NLPlate_HPG0G1Constraint : ActiveOrder, DynamicType, G2Target · *statiques :* get_type_descriptor, get_type_name
- **NLPlate_HPG0G3Constraint** ← NLPlate_HPG0G2Constraint : ActiveOrder, DynamicType, G3Target · *statiques :* get_type_descriptor, get_type_name
- **NLPlate_HPG1Constraint** ← NLPlate_HGPPConstraint : ActiveOrder, DynamicType, G1Target, IncrementalLoadAllowed, IsG0, Orientation, SetIncrementalLoadAllowed, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **NLPlate_HPG2Constraint** ← NLPlate_HPG1Constraint : ActiveOrder, DynamicType, G2Target · *statiques :* get_type_descriptor, get_type_name
- **NLPlate_HPG3Constraint** ← NLPlate_HPG2Constraint : ActiveOrder, DynamicType, G3Target · *statiques :* get_type_descriptor, get_type_name
- **NLPlate_NLPlate** : ConstraintsSliding, Continuity, Evaluate, EvaluateDerivative, IncrementalSolve, Init, IsDone, Load, MaxActiveConstraintOrder, Solve, Solve2, destroy
- **NLPlate_StackOfPlate** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign

## OpenGl

- **OpenGl_FeatureFlag** · *statiques :* OpenGl_FeatureInCore, OpenGl_FeatureInExtensions, OpenGl_FeatureNotAvailable
- **OpenGl_LayerFilter** · *statiques :* OpenGl_LF_All, OpenGl_LF_Bottom, OpenGl_LF_RayTracable, OpenGl_LF_Upper
- **OpenGl_MaterialFlag** · *statiques :* OpenGl_MaterialFlag_Back, OpenGl_MaterialFlag_Front
- **OpenGl_ProgramOptions** · *statiques :* OpenGl_PO_AlphaTest, OpenGl_PO_ClipChains, OpenGl_PO_ClipPlanes1, OpenGl_PO_ClipPlanes2, OpenGl_PO_ClipPlanesN, OpenGl_PO_HasTextures, OpenGl_PO_IsPoint, OpenGl_PO_MeshEdges, OpenGl_PO_NB, OpenGl_PO_NeedsGeomShader, OpenGl_PO_PointSimple, OpenGl_PO_PointSprite, OpenGl_PO_PointSpriteA, OpenGl_PO_StippleLine, OpenGl_PO_TextureEnv, OpenGl_PO_TextureRGB, OpenGl_PO_VertColor, OpenGl_PO_WriteOit
- **OpenGl_RenderFilter** · *statiques :* OpenGl_RenderFilter_Empty, OpenGl_RenderFilter_FillModeOnly, OpenGl_RenderFilter_NonRaytraceableOnly, OpenGl_RenderFilter_OpaqueOnly, OpenGl_RenderFilter_TransparentOnly
- **OpenGl_ShaderProgramDumpLevel** · *statiques :* OpenGl_ShaderProgramDumpLevel_Full, OpenGl_ShaderProgramDumpLevel_Off, OpenGl_ShaderProgramDumpLevel_Short
- **OpenGl_StateVariable** · *statiques :* OpenGl_OCCT_ALPHA_CUTOFF, OpenGl_OCCT_BACK_MATERIAL, OpenGl_OCCT_COLOR, OpenGl_OCCT_DISTINGUISH_MODE, OpenGl_OCCT_FRONT_MATERIAL, OpenGl_OCCT_LINE_FEATHER, OpenGl_OCCT_LINE_STIPPLE_FACTOR, OpenGl_OCCT_LINE_STIPPLE_PATTERN, OpenGl_OCCT_LINE_WIDTH, OpenGl_OCCT_NUMBER_OF_STATE_VARIABLES, OpenGl_OCCT_OIT_DEPTH_FACTOR, OpenGl_OCCT_OIT_OUTPUT, OpenGl_OCCT_ORTHO_SCALE, OpenGl_OCCT_POINT_SIZE, OpenGl_OCCT_QUAD_MODE_STATE, OpenGl_OCCT_SILHOUETTE_THICKNESS, OpenGl_OCCT_TEXTURE_ENABLE, OpenGl_OCCT_TEXTURE_TRSF2D, OpenGl_OCCT_VIEWPORT, OpenGl_OCCT_WIREFRAME_COLOR, OpenGl_OCC_CLIP_PLANE_CHAINS, OpenGl_OCC_CLIP_PLANE_COUNT, OpenGl_OCC_CLIP_PLANE_EQUATIONS, OpenGl_OCC_LIGHT_AMBIENT, OpenGl_OCC_LIGHT_SOURCE_COUNT, OpenGl_OCC_LIGHT_SOURCE_PARAMS, OpenGl_OCC_LIGHT_SOURCE_TYPES, OpenGl_OCC_MODEL_WORLD_MATRIX, OpenGl_OCC_MODEL_WORLD_MATRIX_INVERSE, OpenGl_OCC_MODEL_WORLD_MATRIX_INVERSE_TRANSPOSE, OpenGl_OCC_MODEL_WORLD_MATRIX_TRANSPOSE, OpenGl_OCC_PROJECTION_MATRIX, OpenGl_OCC_PROJECTION_MATRIX_INVERSE, OpenGl_OCC_PROJECTION_MATRIX_INVERSE_TRANSPOSE, OpenGl_OCC_PROJECTION_MATRIX_TRANSPOSE, OpenGl_OCC_WORLD_VIEW_MATRIX, OpenGl_OCC_WORLD_VIEW_MATRIX_INVERSE, OpenGl_OCC_WORLD_VIEW_MATRIX_INVERSE_TRANSPOSE, OpenGl_OCC_WORLD_VIEW_MATRIX_TRANSPOSE
- **OpenGl_UniformStateType** · *statiques :* OpenGL_OIT_STATE, OpenGl_CLIP_PLANES_STATE, OpenGl_LIGHT_SOURCES_STATE, OpenGl_MATERIAL_STATE, OpenGl_MODEL_WORLD_STATE, OpenGl_PROJECTION_STATE, OpenGl_SURF_DETAIL_STATE, OpenGl_UniformStateType_NB, OpenGl_WORLD_VIEW_STATE

## OSD

- **OSD_Chronometer** : IsStarted, Reset, Restart, Show, Start, Stop, SystemTimeCPU, UserTimeCPU · *statiques :* GetProcessCPU, GetThreadCPU
- **OSD_Directory** (2 ctor)
- **OSD_DirectoryIterator** (2 ctor) : Destroy, Error, Failed, Initialize, More, Next, Perror, Reset, Values
- **OSD_Disk** (3 ctor) : DiskFree, DiskSize, Error, Failed, Name, Perror, Reset, SetName
- **OSD_Environment** (3 ctor) : Build, Error, Failed, Name, Perror, Remove, Reset, SetName, SetValue, Value
- **OSD_Error** : Error, Failed, Perror, Reset, SetValue
- **OSD_Exception** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_ACCESS_VIOLATION** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_ARRAY_BOUNDS_EXCEEDED** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_CTRL_BREAK** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_FLT_DENORMAL_OPERAND** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_FLT_DIVIDE_BY_ZERO** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_FLT_INEXACT_RESULT** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_FLT_INVALID_OPERATION** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_FLT_OVERFLOW** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_FLT_STACK_CHECK** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_FLT_UNDERFLOW** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_ILLEGAL_INSTRUCTION** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_INT_DIVIDE_BY_ZERO** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_INT_OVERFLOW** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_INVALID_DISPOSITION** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_IN_PAGE_ERROR** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_NONCONTINUABLE_EXCEPTION** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_PRIV_INSTRUCTION** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_STACK_OVERFLOW** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_Exception_STATUS_NO_MEMORY** ← OSD_Exception (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_FileIterator** (2 ctor) : Destroy, Error, Failed, Initialize, More, Next, Perror, Reset, Values
- **OSD_FromWhere** · *statiques :* OSD_FromBeginning, OSD_FromEnd, OSD_FromHere
- **OSD_Host** : AvailableMemory, Error, Failed, HostName, InternetAddress, MachineType, Perror, Reset, SystemId, SystemVersion
- **OSD_KindFile** · *statiques :* OSD_DIRECTORY, OSD_FILE, OSD_LINK, OSD_SOCKET, OSD_UNKNOWN
- **OSD_LoadMode** · *statiques :* OSD_RTLD_LAZY, OSD_RTLD_NOW
- **OSD_LockType** · *statiques :* OSD_ExclusiveLock, OSD_NoLock, OSD_ReadLock, OSD_WriteLock
- **OSD_MAllocHook** · *statiques :* GetCallback, GetCollectBySize, GetLogFileHandler, SetCallback
- **OSD_MemInfo** : Clear, ToString, Update, Value, ValueMiB, ValuePreciseMiB · *statiques :* PrintInfo
- **OSD_OEMType** · *statiques :* OSD_AIX, OSD_DEC, OSD_HP, OSD_IBM, OSD_LIN, OSD_MAC, OSD_NEC, OSD_PC, OSD_SGI, OSD_SUN, OSD_Unavailable, OSD_VAX
- **OSD_OSDError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_OpenMode** · *statiques :* OSD_ReadOnly, OSD_ReadWrite, OSD_WriteOnly
- **OSD_PerfMeter** (2 ctor) : Flush, Init, Start, Stop, Tick
- **OSD_Process** : CurrentDirectory, Error, Failed, IsSuperUser, Perror, ProcessId, Reset, SetCurrentDirectory, SystemDate, TerminalType, UserName · *statiques :* ExecutableFolder, ExecutablePath
- **OSD_Protection** (2 ctor) : Add, Group, SetGroup, SetSystem, SetUser, SetValues, SetWorld, Sub, System, User, Values, World
- **OSD_SIGBUS** ← OSD_Signal (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_SIGHUP** ← OSD_Signal (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_SIGILL** ← OSD_Signal (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_SIGINT** ← OSD_Signal (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_SIGKILL** ← OSD_Signal (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_SIGQUIT** ← OSD_Signal (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_SIGSEGV** ← OSD_Signal (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_SIGSYS** ← OSD_Signal (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_SharedLibrary** (2 ctor) : Destroy, DlClose, DlError, DlOpen, DlSymb, Name, SetName
- **OSD_Signal** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **OSD_SignalMode** · *statiques :* OSD_SignalMode_AsIs, OSD_SignalMode_Set, OSD_SignalMode_SetUnhandled, OSD_SignalMode_Unset
- **OSD_SingleProtection** · *statiques :* OSD_D, OSD_None, OSD_R, OSD_RD, OSD_RW, OSD_RWD, OSD_RWX, OSD_RWXD, OSD_RX, OSD_RXD, OSD_W, OSD_WD, OSD_WX, OSD_WXD, OSD_X, OSD_XD
- **OSD_SysType** · *statiques :* OSD_Aix, OSD_Default, OSD_LinuxREDHAT, OSD_MacOs, OSD_OS2, OSD_OSF, OSD_Taligent, OSD_UnixBSD, OSD_UnixSystemV, OSD_Unknown, OSD_VMS, OSD_WindowsNT
- **OSD_Thread** (3 ctor) : Assign, Detach, GetId, Run, SetFunction, SetPriority, Wait · *statiques :* Current
- **OSD_Timer** ← OSD_Chronometer : ElapsedTime, Reset, Restart, Show, Start, Stop
- **OSD_WhoAmI** · *statiques :* OSD_WChronometer, OSD_WDirectory, OSD_WDirectoryIterator, OSD_WDisk, OSD_WEnvironment, OSD_WEnvironmentIterator, OSD_WFile, OSD_WFileIterator, OSD_WFileNode, OSD_WHost, OSD_WPackage, OSD_WPath, OSD_WProcess, OSD_WProtection, OSD_WTimer

## PCDM

- **PCDM_DOMHeaderParser** ← LDOMParser : GetElement, SetEndElementName, SetStartElementName, endElement, startElement
- **PCDM_Document** ← Standard_Persistent : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **PCDM_DriverError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **PCDM_ReadWriter** ← Standard_Transient (1 ctor) : DynamicType, ReadDocumentVersion, ReadExtensions, ReadReferenceCounter, ReadReferences, Version, WriteExtensions, WriteReferenceCounter, WriteReferences, WriteVersion · *statiques :* FileFormat, Open, Reader, WriteFileFormat, Writer, get_type_descriptor, get_type_name
- **PCDM_Reader** ← Standard_Transient : CreateDocument, DynamicType, GetStatus, Read · *statiques :* get_type_descriptor, get_type_name
- **PCDM_ReaderStatus** · *statiques :* PCDM_RS_AlreadyRetrieved, PCDM_RS_AlreadyRetrievedAndModified, PCDM_RS_DriverFailure, PCDM_RS_ExtensionFailure, PCDM_RS_FormatFailure, PCDM_RS_MakeFailure, PCDM_RS_NoDocument, PCDM_RS_NoDriver, PCDM_RS_NoModel, PCDM_RS_NoSchema, PCDM_RS_NoVersion, PCDM_RS_OK, PCDM_RS_OpenError, PCDM_RS_PermissionDenied, PCDM_RS_ReaderException, PCDM_RS_TypeFailure, PCDM_RS_TypeNotFoundInSchema, PCDM_RS_UnknownDocument, PCDM_RS_UnknownFileDriver, PCDM_RS_UnrecognizedFileFormat, PCDM_RS_WrongResource, PCDM_RS_WrongStreamMode
- **PCDM_Reference** (2 ctor) : DocumentVersion, FileName, ReferenceIdentifier
- **PCDM_ReferenceIterator** ← Standard_Transient : DynamicType, Init, LoadReferences · *statiques :* get_type_descriptor, get_type_name
- **PCDM_RetrievalDriver** ← PCDM_Reader : DynamicType, GetFormat, SetFormat · *statiques :* DocumentVersion, ReferenceCounter, get_type_descriptor, get_type_name
- **PCDM_StorageDriver** ← PCDM_Writer : DynamicType, GetFormat, GetStoreStatus, IsError, Make, SetFormat, SetIsError, SetStoreStatus, Write · *statiques :* get_type_descriptor, get_type_name
- **PCDM_StoreStatus** · *statiques :* PCDM_SS_Doc_IsNull, PCDM_SS_DriverFailure, PCDM_SS_Failure, PCDM_SS_Info_Section_Error, PCDM_SS_No_Obj, PCDM_SS_OK, PCDM_SS_WriteFailure
- **PCDM_TypeOfFileDriver** · *statiques :* PCDM_TOFD_CmpFile, PCDM_TOFD_File, PCDM_TOFD_Unknown, PCDM_TOFD_XmlFile
- **PCDM_Writer** ← Standard_Transient : DynamicType, Write · *statiques :* get_type_descriptor, get_type_name

## Plate

- **Plate_Array1OfPinpointConstraint** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Plate_D1** (2 ctor) : DU, DV
- **Plate_D2** (2 ctor)
- **Plate_D3** (2 ctor)
- **Plate_FreeGtoCConstraint** (3 ctor) : GetPPC, LSC, nb_LSC, nb_PPC
- **Plate_GlobalTranslationConstraint** : LXYZC
- **Plate_GtoCConstraint** (7 ctor) : D1SurfInit, GetPPC, nb_PPC
- **Plate_LineConstraint** : LSC
- **Plate_LinearScalarConstraint** (5 ctor) : Coeff, GetPPC, SetCoeff, SetPPC
- **Plate_LinearXYZConstraint** (4 ctor) : Coeff, GetPPC, SetCoeff, SetPPC
- **Plate_PinpointConstraint** (2 ctor) : Idu, Idv, Pnt2d, Value
- **Plate_PlaneConstraint** : LSC
- **Plate_Plate** (2 ctor) : CoefPol, Continuity, Copy, Evaluate, EvaluateDerivative, Init, IsDone, Load, SetPolynomialPartOnly, SolveTI, UVBox, UVConstraints, destroy
- **Plate_SampledCurveConstraint** : LXYZC

## PLib

- **PLib_Base** ← Standard_Transient : D0, D1, D2, D3, DynamicType, ReduceDegree, ToCoefficients, WorkDegree · *statiques :* get_type_descriptor, get_type_name
- **PLib_DoubleJacobiPolynomial** (2 ctor) : AverageError, MaxError, MaxErrorU, MaxErrorV, ReduceDegree, TabMaxU, TabMaxV, U, V, WDoubleJacobiToCoefficients
- **PLib_HermitJacobi** ← PLib_Base : AverageError, D0, D1, D2, D3, DynamicType, MaxError, NivConstr, ReduceDegree, ToCoefficients, WorkDegree · *statiques :* get_type_descriptor, get_type_name
- **PLib_JacobiPolynomial** ← PLib_Base : AverageError, D0, D1, D2, D3, DynamicType, MaxError, MaxValue, NivConstr, Points, ReduceDegree, ToCoefficients, Weights, WorkDegree · *statiques :* get_type_descriptor, get_type_name

## Plugin

- **Plugin_Failure** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name

## Poly

- **Poly_Array1OfTriangle** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Poly_CoherentLink** (3 ctor) : GetAttribute, IsEmpty, Node, Nullify, OppositeNode, SetAttribute
- **Poly_CoherentNode** ← gp_XYZ (2 ctor) : AddTriangle, Clear, Dump, GetIndex, GetNormal, GetU, GetV, HasNormal, IsFreeNode, RemoveTriangle, SetIndex, SetNormal, SetUV, TriangleIterator
- **Poly_CoherentTriangle** (2 ctor) : FindConnection, GetConnectedNode, GetConnectedTri, GetLink, IsEmpty, NConnections, Node, RemoveConnection, SetConnection
- **Poly_CoherentTriangulation** ← Standard_Transient (2 ctor) : AddLink, AddTriangle, Allocator, ChangeNode, ClearLinks, Clone, ComputeLinks, Deflection, Dump, DynamicType, FindTriangle, GetFreeNodes, GetTriangulation, MaxNode, MaxTriangle, NLinks, NNodes, NTriangles, Node, RemoveDegenerated, RemoveLink, RemoveTriangle, ReplaceNodes, SetDeflection, SetNode, Triangle · *statiques :* get_type_descriptor, get_type_name
- **Poly_Connect** (2 ctor) : Initialize, Load, More, Next, Nodes, Triangle, Triangles, Triangulation, Value
- **Poly_ListOfTriangulation** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **Poly_MakeLoops** : AddLink, FindLink, GetHangingLinks, GetLoop, GetNbHanging, GetNbLoops, Perform, ReplaceLink, Reset, SetLinkOrientation
- **Poly_MakeLoops2D** ← Poly_MakeLoops
- **Poly_MakeLoops3D** ← Poly_MakeLoops
- **Poly_Polygon2D** ← Standard_Transient : Deflection, DynamicType, NbNodes, Nodes · *statiques :* get_type_descriptor, get_type_name
- **Poly_Polygon3D** ← Standard_Transient (2 ctor) : ChangeParameters, Copy, Deflection, DynamicType, HasParameters, NbNodes, Nodes, Parameters · *statiques :* get_type_descriptor, get_type_name
- **Poly_PolygonOnTriangulation** ← Standard_Transient (2 ctor) : Copy, Deflection, DynamicType, HasParameters, NbNodes, Nodes, Parameters · *statiques :* get_type_descriptor, get_type_name
- **Poly_Triangle** (2 ctor) : ChangeValue, Get, Set, Value
- **Poly_Triangulation** ← Standard_Transient (4 ctor) : ChangeNode, ChangeNodes, ChangeNormals, ChangeTriangle, ChangeTriangles, ChangeUVNode, ChangeUVNodes, Copy, Deflection, DynamicType, HasNormals, HasUVNodes, NbNodes, NbTriangles, Node, Nodes, Normal, Normals, RemoveUVNodes, SetNormal, SetNormals, Triangle, Triangles, UVNode, UVNodes · *statiques :* get_type_descriptor, get_type_name

## ProjLib

- **ProjLib_CompProjectedCurve** ← Adaptor2d_Curve2d (3 ctor) : Bounds, D0, D1, D2, DN, FirstParameter, GetCurve, GetSequence, GetSurface, GetTolerance, GetType, Init, Intervals, IsSinglePnt, IsUIso, IsVIso, LastParameter, Load, MaxDistance, NbCurves, NbIntervals, Trim, Value
- **ProjLib_ComputeApprox** (2 ctor) : BSpline, Bezier, Perform, SetBndPnt, SetDegree, SetMaxSegments, SetTolerance, Tolerance
- **ProjLib_ComputeApproxOnPolarSurface** (4 ctor) : BSpline, BuildInitialCurve2d, Curve2d, IsDone, Perform, ProjectUsingInitialCurve2d, SetBndPnt, SetDegree, SetMaxDist, SetMaxSegments, SetTolerance, Tolerance
- **ProjLib_Cone** ← ProjLib_Projector (4 ctor) : Init, Project
- **ProjLib_Cylinder** ← ProjLib_Projector (5 ctor) : Init, Project
- **ProjLib_HCompProjectedCurve** ← Adaptor2d_HCurve2d (2 ctor) : ChangeCurve2d, Curve2d, DynamicType, Set · *statiques :* get_type_descriptor, get_type_name
- **ProjLib_HProjectedCurve** ← Adaptor2d_HCurve2d (2 ctor) : ChangeCurve2d, Curve2d, DynamicType, Set · *statiques :* get_type_descriptor, get_type_name
- **ProjLib_Plane** ← ProjLib_Projector (7 ctor) : Init, Project
- **ProjLib_PrjFunc** ← math_FunctionSetWithDerivatives : Derivatives, NbEquations, NbVariables, Solution, Value, Values
- **ProjLib_PrjResolve** : IsDone, Perform, Solution
- **ProjLib_ProjectOnPlane** ← Adaptor3d_Curve (3 ctor) : BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetCurve, GetDirection, GetPlane, GetResult, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, Load, NbIntervals, NbKnots, NbPoles, Parabola, Period, Resolution, Trim, Value
- **ProjLib_ProjectedCurve** ← Adaptor2d_Curve2d (4 ctor) : BSpline, Bezier, Circle, Continuity, D0, D1, D2, D3, DN, Degree, Ellipse, FirstParameter, GetCurve, GetSurface, GetTolerance, GetType, Hyperbola, Intervals, IsClosed, IsPeriodic, IsRational, LastParameter, Line, Load, NbIntervals, NbKnots, NbPoles, Parabola, Perform, Period, Resolution, SetBndPnt, SetDegree, SetMaxDist, SetMaxSegments, Trim, Value
- **ProjLib_Projector** : BSpline, Bezier, Circle, Done, Ellipse, GetType, Hyperbola, IsDone, IsPeriodic, Line, Parabola, Project, SetBSpline, SetBezier, SetPeriodic, SetType, UFrame, VFrame
- **ProjLib_Sphere** ← ProjLib_Projector (3 ctor) : Init, Project, SetInBounds
- **ProjLib_Torus** ← ProjLib_Projector (3 ctor) : Init, Project

## Prs3d

- **Prs3d_Arrow** ← Prs3d_Root · *statiques :* Draw, DrawSegments, DrawShaded
- **Prs3d_ArrowAspect** ← Prs3d_BasicAspect (3 ctor) : Angle, Aspect, DumpJson, DynamicType, Length, SetAngle, SetAspect, SetColor, SetLength · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_BasicAspect** ← Standard_Transient : DumpJson, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_DatumAspect** ← Prs3d_BasicAspect : ArrowAspect, ArrowPartForAxis, Attribute, AxisLength, DatumAxes, DrawDatumPart, DrawFirstAndSecondAxis, DrawThirdAxis, DumpJson, DynamicType, FirstAxisAspect, FirstAxisLength, LineAspect, PointAspect, SecondAxisAspect, SecondAxisLength, SetArrowAspect, SetAttribute, SetAxisLength, SetDrawArrows, SetDrawDatumAxes, SetDrawFirstAndSecondAxis, SetDrawLabels, SetDrawThirdAxis, SetPointAspect, SetTextAspect, SetToDrawLabels, ShadingAspect, TextAspect, ThirdAxisAspect, ThirdAxisLength, ToDrawArrows, ToDrawLabels · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_DatumAttribute** · *statiques :* Prs3d_DA_XAxisLength, Prs3d_DA_YAxisLength, Prs3d_DA_ZAxisLength, Prs3d_DP_ShadingConeLengthPercent, Prs3d_DP_ShadingConeRadiusPercent, Prs3d_DP_ShadingNumberOfFacettes, Prs3d_DP_ShadingOriginRadiusPercent, Prs3d_DP_ShadingTubeRadiusPercent
- **Prs3d_DatumAxes** · *statiques :* Prs3d_DA_XAxis, Prs3d_DA_XYAxis, Prs3d_DA_XYZAxis, Prs3d_DA_XZAxis, Prs3d_DA_YAxis, Prs3d_DA_YZAxis, Prs3d_DA_ZAxis
- **Prs3d_DatumMode** · *statiques :* Prs3d_DM_Shaded, Prs3d_DM_WireFrame
- **Prs3d_DatumParts** · *statiques :* Prs3d_DP_None, Prs3d_DP_Origin, Prs3d_DP_XArrow, Prs3d_DP_XAxis, Prs3d_DP_XOYAxis, Prs3d_DP_XOZAxis, Prs3d_DP_YArrow, Prs3d_DP_YAxis, Prs3d_DP_YOZAxis, Prs3d_DP_ZArrow, Prs3d_DP_ZAxis
- **Prs3d_DimensionArrowOrientation** · *statiques :* Prs3d_DAO_External, Prs3d_DAO_Fit, Prs3d_DAO_Internal
- **Prs3d_DimensionAspect** ← Prs3d_BasicAspect : ArrowAspect, ArrowOrientation, ArrowTailSize, DumpJson, DynamicType, ExtensionSize, IsArrows3d, IsText3d, IsTextShaded, IsUnitsDisplayed, LineAspect, MakeArrows3d, MakeText3d, MakeTextShaded, MakeUnitsDisplayed, SetArrowAspect, SetArrowOrientation, SetArrowTailSize, SetCommonColor, SetExtensionSize, SetLineAspect, SetTextAspect, SetTextHorizontalPosition, SetTextVerticalPosition, SetValueStringFormat, TextAspect, TextHorizontalPosition, TextVerticalPosition, ValueStringFormat · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_DimensionTextHorizontalPosition** · *statiques :* Prs3d_DTHP_Center, Prs3d_DTHP_Fit, Prs3d_DTHP_Left, Prs3d_DTHP_Right
- **Prs3d_DimensionTextVerticalPosition** · *statiques :* Prs3d_DTVP_Above, Prs3d_DTVP_Below, Prs3d_DTVP_Center
- **Prs3d_DimensionUnits** (2 ctor) : GetAngleUnits, GetLengthUnits, SetAngleUnits, SetLengthUnits
- **Prs3d_Drawer** ← Graphic3d_PresentationAttributes : ArrowAspect, ClearLocalAttributes, DatumAspect, DeviationAngle, DeviationCoefficient, DimAngleDisplayUnits, DimAngleModelUnits, DimLengthDisplayUnits, DimLengthModelUnits, DimensionAspect, DisableDrawHiddenLine, Discretisation, DrawHiddenLine, DumpJson, DynamicType, EnableDrawHiddenLine, FaceBoundaryAspect, FaceBoundaryDraw, FaceBoundaryUpperContinuity, FreeBoundaryAspect, FreeBoundaryDraw, HLRAngle, HLRDeviationCoefficient, HasLink, HasOwnArrowAspect, HasOwnDatumAspect, HasOwnDeviationAngle, HasOwnDeviationCoefficient, HasOwnDimAngleDisplayUnits, HasOwnDimAngleModelUnits, HasOwnDimLengthDisplayUnits, HasOwnDimLengthModelUnits, HasOwnDimensionAspect, HasOwnDiscretisation, HasOwnDrawHiddenLine, HasOwnFaceBoundaryAspect, HasOwnFaceBoundaryDraw, HasOwnFaceBoundaryUpperContinuity, HasOwnFreeBoundaryAspect, HasOwnFreeBoundaryDraw, HasOwnHLRDeviationAngle, HasOwnHLRDeviationCoefficient, HasOwnHiddenLineAspect, HasOwnIsAutoTriangulation, HasOwnIsoOnPlane, HasOwnIsoOnTriangulation, HasOwnLineArrowDraw, HasOwnLineAspect, HasOwnMaximalChordialDeviation, HasOwnMaximalParameterValue, HasOwnPlaneAspect, HasOwnPointAspect, HasOwnSectionAspect, HasOwnSeenLineAspect, HasOwnShadingAspect, HasOwnTextAspect, HasOwnTypeOfDeflection, HasOwnTypeOfHLR, HasOwnUIsoAspect, HasOwnUnFreeBoundaryAspect, HasOwnUnFreeBoundaryDraw, HasOwnVIsoAspect, HasOwnVectorAspect, HasOwnVertexDrawMode, HasOwnWireAspect, HasOwnWireDraw, HiddenLineAspect, IsAutoTriangulation, IsoOnPlane, IsoOnTriangulation, LineArrowDraw, LineAspect, Link, MaximalChordialDeviation, MaximalParameterValue, PlaneAspect, PointAspect, PreviousDeviationAngle, PreviousDeviationCoefficient, PreviousHLRDeviationAngle, PreviousHLRDeviationCoefficient, SectionAspect, SeenLineAspect, SetArrowAspect, SetAutoTriangulation, SetDatumAspect, SetDeviationAngle, SetDeviationCoefficient, SetDimAngleDisplayUnits, SetDimAngleModelUnits, SetDimLengthDisplayUnits, SetDimLengthModelUnits, SetDimensionAspect, SetDiscretisation, SetFaceBoundaryAspect, SetFaceBoundaryDraw, SetFaceBoundaryUpperContinuity, SetFreeBoundaryAspect, SetFreeBoundaryDraw, SetHLRAngle, SetHLRDeviationCoefficient, SetHiddenLineAspect, SetIsoOnPlane, SetIsoOnTriangulation, SetLineArrowDraw, SetLineAspect, SetLink, SetMaximalChordialDeviation, SetMaximalParameterValue, SetOwnDatumAspects, SetOwnLineAspects, SetPlaneAspect, SetPointAspect, SetSectionAspect, SetSeenLineAspect, SetShaderProgram, SetShadingAspect, SetShadingModel, SetTextAspect, SetTypeOfDeflection, SetTypeOfHLR, SetUIsoAspect, SetUnFreeBoundaryAspect, SetUnFreeBoundaryDraw, SetVIsoAspect, SetVectorAspect, SetVertexDrawMode, SetWireAspect, SetWireDraw, SetupOwnFaceBoundaryAspect, SetupOwnPointAspect, SetupOwnShadingAspect, ShadingAspect, TextAspect, TypeOfDeflection, TypeOfHLR, UIsoAspect, UnFreeBoundaryAspect, UnFreeBoundaryDraw, UnsetFaceBoundaryUpperContinuity, UpdatePreviousDeviationAngle, UpdatePreviousDeviationCoefficient, VIsoAspect, VectorAspect, VertexDrawMode, WireAspect, WireDraw · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_InvalidAngle** ← Standard_RangeError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Prs3d_IsoAspect** ← Prs3d_LineAspect : DynamicType, Number, SetNumber · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_LineAspect** ← Prs3d_BasicAspect (2 ctor) : Aspect, DumpJson, DynamicType, SetAspect, SetColor, SetTypeOfLine, SetWidth · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_NListOfSequenceOfPnt** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **Prs3d_PlaneAspect** ← Prs3d_BasicAspect : ArrowAspect, ArrowsAngle, ArrowsLength, ArrowsSize, DisplayCenterArrow, DisplayEdges, DisplayEdgesArrows, DisplayIso, DumpJson, DynamicType, EdgesAspect, IsoAspect, IsoDistance, PlaneXLength, PlaneYLength, SetArrowsAngle, SetArrowsLength, SetArrowsSize, SetDisplayCenterArrow, SetDisplayEdges, SetDisplayEdgesArrows, SetDisplayIso, SetIsoDistance, SetPlaneLength · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_PointAspect** ← Prs3d_BasicAspect (3 ctor) : Aspect, DumpJson, DynamicType, GetTexture, GetTextureSize, SetAspect, SetColor, SetScale, SetTypeOfMarker · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_PresentationShadow** ← Graphic3d_Structure : CalculateBoundBox, DynamicType, ParentAffinity, ParentId · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_Projector** ← Standard_Transient (2 ctor) : DynamicType, Projector · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_Root** · *statiques :* CurrentGroup, NewGroup
- **Prs3d_ShadingAspect** ← Prs3d_BasicAspect (2 ctor) : Aspect, Color, DumpJson, DynamicType, Material, SetAspect, SetColor, SetMaterial, SetTransparency, Transparency · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_ShapeTool** : CurrentTriangulation, CurveBound, FaceBound, FacesOfEdge, GetCurve, GetFace, GetVertex, HasCurve, HasSurface, InitCurve, InitFace, InitVertex, IsPlanarFace, MoreCurve, MoreFace, MoreVertex, Neighbours, NextCurve, NextFace, NextVertex, Polygon3D, PolygonOnTriangulation · *statiques :* IsPlanarFace
- **Prs3d_Text** ← Prs3d_Root · *statiques :* Draw
- **Prs3d_TextAspect** ← Prs3d_BasicAspect (2 ctor) : Angle, Aspect, DumpJson, DynamicType, Height, HorizontalJustification, Orientation, SetAngle, SetAspect, SetColor, SetFont, SetHeight, SetHorizontalJustification, SetOrientation, SetVerticalJustification, VerticalJustification · *statiques :* get_type_descriptor, get_type_name
- **Prs3d_ToolCylinder**
- **Prs3d_ToolDisk**
- **Prs3d_ToolSector**
- **Prs3d_ToolSphere**
- **Prs3d_TypeOfHLR** · *statiques :* Prs3d_TOH_Algo, Prs3d_TOH_NotSet, Prs3d_TOH_PolyAlgo
- **Prs3d_TypeOfHighlight** · *statiques :* Prs3d_TypeOfHighlight_Dynamic, Prs3d_TypeOfHighlight_LocalDynamic, Prs3d_TypeOfHighlight_LocalSelected, Prs3d_TypeOfHighlight_NB, Prs3d_TypeOfHighlight_None, Prs3d_TypeOfHighlight_Selected, Prs3d_TypeOfHighlight_SubIntensity
- **Prs3d_TypeOfLinePicking** · *statiques :* Prs3d_TOLP_Point, Prs3d_TOLP_Segment
- **Prs3d_VertexDrawMode** · *statiques :* Prs3d_VDM_All, Prs3d_VDM_Inherited, Prs3d_VDM_Isolated

## PrsMgr

- **PrsMgr_ListOfPresentableObjects** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **PrsMgr_ListOfPresentations** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **PrsMgr_PresentableObject** ← Standard_Transient : AcceptDisplayMode, AddChild, AddChildWithCurrentTransformation, AddClipPlane, Attributes, BoundingBox, Children, ClipPlanes, Color, CombinedParentTransformation, CurrentFacingModel, DefaultDisplayMode, DisplayMode, DumpJson, DynamicHilightAttributes, DynamicType, GetTransformPersistenceMode, GetTransformPersistencePoint, HasColor, HasDisplayMode, HasHilightMode, HasMaterial, HasOwnPresentations, HasPolygonOffsets, HasTransformation, HasWidth, HilightAttributes, HilightMode, InversedTransformation, IsInfinite, IsMutable, IsTransparent, LocalTransformation, LocalTransformationGeom, Material, Parent, PolygonOffsets, Presentations, RemoveChild, RemoveChildWithRestoreTransformation, RemoveClipPlane, ResetTransformation, SetAttributes, SetClipPlanes, SetColor, SetCurrentFacingModel, SetDisplayMode, SetDynamicHilightAttributes, SetHilightAttributes, SetHilightMode, SetInfiniteState, SetIsoOnTriangulation, SetLocalTransformation, SetMaterial, SetMutable, SetPolygonOffsets, SetPropagateVisualState, SetToUpdate, SetTransformPersistence, SetTransparency, SetTypeOfPresentation, SetWidth, SetZLayer, SynchronizeAspects, ToBeUpdated, ToPropagateVisualState, TransformPersistence, Transformation, TransformationGeom, Transparency, TypeOfPresentation3d, UnsetAttributes, UnsetColor, UnsetDisplayMode, UnsetHilightAttributes, UnsetHilightMode, UnsetMaterial, UnsetTransparency, UnsetWidth, UpdateTransformation, Width, ZLayer · *statiques :* get_type_descriptor, get_type_name
- **PrsMgr_Presentation** ← Graphic3d_Structure : Clear, Compute, Display, DynamicType, Erase, Highlight, IsDisplayed, Mode, MustBeUpdated, Presentation, PresentationManager, SetUpdateStatus, Unhighlight · *statiques :* get_type_descriptor, get_type_name
- **PrsMgr_PresentationManager** ← Standard_Transient : AddToImmediateList, BeginImmediateDraw, Clear, ClearImmediateDraw, Color, Connect, Display, DisplayPriority, DynamicType, EndImmediateDraw, Erase, GetZLayer, HasPresentation, IsDisplayed, IsHighlighted, IsImmediateModeOn, Presentation, RedrawImmediate, SetDisplayPriority, SetVisibility, SetZLayer, StructureManager, Transform, Unhighlight, Update, UpdateHighlightTrsf · *statiques :* get_type_descriptor, get_type_name
- **PrsMgr_TypeOfPresentation3d** · *statiques :* PrsMgr_TOP_AllView, PrsMgr_TOP_ProjectorDependant

## QANCollection

- **QANCollection_ListOfPnt** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign

## Quantity

- **Quantity_Array1OfColor** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Quantity_Color** (4 ctor) : Blue, ChangeContrast, ChangeIntensity, Delta, Distance, DumpJson, Green, Hue, IsDifferent, IsEqual, Light, Name, Red, Saturation, SetValues, SquareDistance, Values · *statiques :* Argb2color, Color2argb, ColorFromHex, ColorFromName, ColorToHex, Epsilon, HlsRgb, Name, RgbHls, SetEpsilon, StringName, Test
- **Quantity_ColorDefinitionError** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Quantity_ColorRGBA** (5 ctor) : Alpha, ChangeRGB, DumpJson, GetRGB, IsDifferent, IsEqual, SetAlpha, SetRGB, SetValues · *statiques :* ColorFromHex, ColorFromName, ColorToHex
- **Quantity_Date** (2 ctor) : Add, Day, Difference, Hour, IsEarlier, IsEqual, IsLater, MicroSecond, MilliSecond, Minute, Month, Second, SetValues, Subtract, Values, Year · *statiques :* IsLeap, IsValid
- **Quantity_DateDefinitionError** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Quantity_NameOfColor** · *statiques :* Quantity_NOC_ALICEBLUE, Quantity_NOC_ANTIQUEWHITE, Quantity_NOC_ANTIQUEWHITE1, Quantity_NOC_ANTIQUEWHITE2, Quantity_NOC_ANTIQUEWHITE3, Quantity_NOC_ANTIQUEWHITE4, Quantity_NOC_AQUAMARINE1, Quantity_NOC_AQUAMARINE2, Quantity_NOC_AQUAMARINE4, Quantity_NOC_AZURE, Quantity_NOC_AZURE2, Quantity_NOC_AZURE3, Quantity_NOC_AZURE4, Quantity_NOC_BEET, Quantity_NOC_BEIGE, Quantity_NOC_BISQUE, Quantity_NOC_BISQUE2, Quantity_NOC_BISQUE3, Quantity_NOC_BISQUE4, Quantity_NOC_BLACK, Quantity_NOC_BLANCHEDALMOND, Quantity_NOC_BLUE1, Quantity_NOC_BLUE2, Quantity_NOC_BLUE3, Quantity_NOC_BLUE4, Quantity_NOC_BLUEVIOLET, Quantity_NOC_BROWN, Quantity_NOC_BROWN1, Quantity_NOC_BROWN2, Quantity_NOC_BROWN3, Quantity_NOC_BROWN4, Quantity_NOC_BURLYWOOD, Quantity_NOC_BURLYWOOD1, Quantity_NOC_BURLYWOOD2, Quantity_NOC_BURLYWOOD3, Quantity_NOC_BURLYWOOD4, Quantity_NOC_CADETBLUE, Quantity_NOC_CADETBLUE1, Quantity_NOC_CADETBLUE2, Quantity_NOC_CADETBLUE3, Quantity_NOC_CADETBLUE4, Quantity_NOC_CHARTREUSE, Quantity_NOC_CHARTREUSE1, Quantity_NOC_CHARTREUSE2, Quantity_NOC_CHARTREUSE3, Quantity_NOC_CHARTREUSE4, Quantity_NOC_CHOCOLATE, Quantity_NOC_CHOCOLATE1, Quantity_NOC_CHOCOLATE2, Quantity_NOC_CHOCOLATE3, Quantity_NOC_CHOCOLATE4, Quantity_NOC_CORAL, Quantity_NOC_CORAL1, Quantity_NOC_CORAL2, Quantity_NOC_CORAL3, Quantity_NOC_CORAL4, Quantity_NOC_CORNFLOWERBLUE, Quantity_NOC_CORNSILK1, Quantity_NOC_CORNSILK2, Quantity_NOC_CORNSILK3, Quantity_NOC_CORNSILK4, Quantity_NOC_CYAN1, Quantity_NOC_CYAN2, Quantity_NOC_CYAN3, Quantity_NOC_CYAN4, Quantity_NOC_DARKGOLDENROD, Quantity_NOC_DARKGOLDENROD1, Quantity_NOC_DARKGOLDENROD2, Quantity_NOC_DARKGOLDENROD3, Quantity_NOC_DARKGOLDENROD4, Quantity_NOC_DARKGREEN, Quantity_NOC_DARKKHAKI, Quantity_NOC_DARKOLIVEGREEN, Quantity_NOC_DARKOLIVEGREEN1, Quantity_NOC_DARKOLIVEGREEN2, Quantity_NOC_DARKOLIVEGREEN3, Quantity_NOC_DARKOLIVEGREEN4, Quantity_NOC_DARKORANGE, Quantity_NOC_DARKORANGE1, Quantity_NOC_DARKORANGE2, Quantity_NOC_DARKORANGE3, Quantity_NOC_DARKORANGE4, Quantity_NOC_DARKORCHID, Quantity_NOC_DARKORCHID1, Quantity_NOC_DARKORCHID2, Quantity_NOC_DARKORCHID3, Quantity_NOC_DARKORCHID4, Quantity_NOC_DARKSALMON, Quantity_NOC_DARKSEAGREEN, Quantity_NOC_DARKSEAGREEN1, Quantity_NOC_DARKSEAGREEN2, Quantity_NOC_DARKSEAGREEN3, Quantity_NOC_DARKSEAGREEN4, Quantity_NOC_DARKSLATEBLUE, Quantity_NOC_DARKSLATEGRAY, Quantity_NOC_DARKSLATEGRAY1, Quantity_NOC_DARKSLATEGRAY2, Quantity_NOC_DARKSLATEGRAY3, Quantity_NOC_DARKSLATEGRAY4, Quantity_NOC_DARKTURQUOISE, Quantity_NOC_DARKVIOLET, Quantity_NOC_DEEPPINK, Quantity_NOC_DEEPPINK2, Quantity_NOC_DEEPPINK3, Quantity_NOC_DEEPPINK4, Quantity_NOC_DEEPSKYBLUE1, Quantity_NOC_DEEPSKYBLUE2, Quantity_NOC_DEEPSKYBLUE3, Quantity_NOC_DEEPSKYBLUE4, Quantity_NOC_DODGERBLUE1, Quantity_NOC_DODGERBLUE2, Quantity_NOC_DODGERBLUE3, Quantity_NOC_DODGERBLUE4, Quantity_NOC_FIREBRICK, Quantity_NOC_FIREBRICK1, Quantity_NOC_FIREBRICK2, Quantity_NOC_FIREBRICK3, Quantity_NOC_FIREBRICK4, Quantity_NOC_FLORALWHITE, Quantity_NOC_FORESTGREEN, Quantity_NOC_GAINSBORO, Quantity_NOC_GHOSTWHITE, Quantity_NOC_GOLD, Quantity_NOC_GOLD1, Quantity_NOC_GOLD2, Quantity_NOC_GOLD3, Quantity_NOC_GOLD4, Quantity_NOC_GOLDENROD, Quantity_NOC_GOLDENROD1, Quantity_NOC_GOLDENROD2, Quantity_NOC_GOLDENROD3, Quantity_NOC_GOLDENROD4, Quantity_NOC_GRAY, Quantity_NOC_GRAY0, Quantity_NOC_GRAY1, Quantity_NOC_GRAY10, Quantity_NOC_GRAY11, Quantity_NOC_GRAY12, Quantity_NOC_GRAY13, Quantity_NOC_GRAY14, Quantity_NOC_GRAY15, Quantity_NOC_GRAY16, Quantity_NOC_GRAY17, Quantity_NOC_GRAY18, Quantity_NOC_GRAY19, Quantity_NOC_GRAY2, Quantity_NOC_GRAY20, Quantity_NOC_GRAY21, Quantity_NOC_GRAY22, Quantity_NOC_GRAY23, Quantity_NOC_GRAY24, Quantity_NOC_GRAY25, Quantity_NOC_GRAY26, Quantity_NOC_GRAY27, Quantity_NOC_GRAY28, Quantity_NOC_GRAY29, Quantity_NOC_GRAY3, Quantity_NOC_GRAY30, Quantity_NOC_GRAY31, Quantity_NOC_GRAY32, Quantity_NOC_GRAY33, Quantity_NOC_GRAY34, Quantity_NOC_GRAY35, Quantity_NOC_GRAY36, Quantity_NOC_GRAY37, Quantity_NOC_GRAY38, Quantity_NOC_GRAY39, Quantity_NOC_GRAY4, Quantity_NOC_GRAY40, Quantity_NOC_GRAY41, Quantity_NOC_GRAY42, Quantity_NOC_GRAY43, Quantity_NOC_GRAY44, Quantity_NOC_GRAY45, Quantity_NOC_GRAY46, Quantity_NOC_GRAY47, Quantity_NOC_GRAY48, Quantity_NOC_GRAY49, Quantity_NOC_GRAY5, Quantity_NOC_GRAY50, Quantity_NOC_GRAY51, Quantity_NOC_GRAY52, Quantity_NOC_GRAY53, Quantity_NOC_GRAY54, Quantity_NOC_GRAY55, Quantity_NOC_GRAY56, Quantity_NOC_GRAY57, Quantity_NOC_GRAY58, Quantity_NOC_GRAY59, Quantity_NOC_GRAY6, Quantity_NOC_GRAY60, Quantity_NOC_GRAY61, Quantity_NOC_GRAY62, Quantity_NOC_GRAY63, Quantity_NOC_GRAY64, Quantity_NOC_GRAY65, Quantity_NOC_GRAY66, Quantity_NOC_GRAY67, Quantity_NOC_GRAY68, Quantity_NOC_GRAY69, Quantity_NOC_GRAY7, Quantity_NOC_GRAY70, Quantity_NOC_GRAY71, Quantity_NOC_GRAY72, Quantity_NOC_GRAY73, Quantity_NOC_GRAY74, Quantity_NOC_GRAY75, Quantity_NOC_GRAY76, Quantity_NOC_GRAY77, Quantity_NOC_GRAY78, Quantity_NOC_GRAY79, Quantity_NOC_GRAY8, Quantity_NOC_GRAY80, Quantity_NOC_GRAY81, Quantity_NOC_GRAY82, Quantity_NOC_GRAY83, Quantity_NOC_GRAY85, Quantity_NOC_GRAY86, Quantity_NOC_GRAY87, Quantity_NOC_GRAY88, Quantity_NOC_GRAY89, Quantity_NOC_GRAY9, Quantity_NOC_GRAY90, Quantity_NOC_GRAY91, Quantity_NOC_GRAY92, Quantity_NOC_GRAY93, Quantity_NOC_GRAY94, Quantity_NOC_GRAY95, Quantity_NOC_GRAY97, Quantity_NOC_GRAY98, Quantity_NOC_GRAY99, Quantity_NOC_GREEN, Quantity_NOC_GREEN1, Quantity_NOC_GREEN2, Quantity_NOC_GREEN3, Quantity_NOC_GREEN4, Quantity_NOC_GREENYELLOW, Quantity_NOC_HONEYDEW, Quantity_NOC_HONEYDEW2, Quantity_NOC_HONEYDEW3, Quantity_NOC_HONEYDEW4, Quantity_NOC_HOTPINK, Quantity_NOC_HOTPINK1, Quantity_NOC_HOTPINK2, Quantity_NOC_HOTPINK3, Quantity_NOC_HOTPINK4, Quantity_NOC_INDIANRED, Quantity_NOC_INDIANRED1, Quantity_NOC_INDIANRED2, Quantity_NOC_INDIANRED3, Quantity_NOC_INDIANRED4, Quantity_NOC_IVORY, Quantity_NOC_IVORY2, Quantity_NOC_IVORY3, Quantity_NOC_IVORY4, Quantity_NOC_KHAKI, Quantity_NOC_KHAKI1, Quantity_NOC_KHAKI2, Quantity_NOC_KHAKI3, Quantity_NOC_KHAKI4, Quantity_NOC_LAVENDER, Quantity_NOC_LAVENDERBLUSH1, Quantity_NOC_LAVENDERBLUSH2, Quantity_NOC_LAVENDERBLUSH3, Quantity_NOC_LAVENDERBLUSH4, Quantity_NOC_LAWNGREEN, Quantity_NOC_LEMONCHIFFON1, Quantity_NOC_LEMONCHIFFON2, Quantity_NOC_LEMONCHIFFON3, Quantity_NOC_LEMONCHIFFON4, Quantity_NOC_LIGHTBLUE, Quantity_NOC_LIGHTBLUE1, Quantity_NOC_LIGHTBLUE2, Quantity_NOC_LIGHTBLUE3, Quantity_NOC_LIGHTBLUE4, Quantity_NOC_LIGHTCORAL, Quantity_NOC_LIGHTCYAN1, Quantity_NOC_LIGHTCYAN2, Quantity_NOC_LIGHTCYAN3, Quantity_NOC_LIGHTCYAN4, Quantity_NOC_LIGHTGOLDENROD, Quantity_NOC_LIGHTGOLDENROD1, Quantity_NOC_LIGHTGOLDENROD2, Quantity_NOC_LIGHTGOLDENROD3, Quantity_NOC_LIGHTGOLDENROD4, Quantity_NOC_LIGHTGOLDENRODYELLOW, Quantity_NOC_LIGHTGRAY, Quantity_NOC_LIGHTPINK, Quantity_NOC_LIGHTPINK1, Quantity_NOC_LIGHTPINK2, Quantity_NOC_LIGHTPINK3, Quantity_NOC_LIGHTPINK4, Quantity_NOC_LIGHTSALMON1, Quantity_NOC_LIGHTSALMON2, Quantity_NOC_LIGHTSALMON3, Quantity_NOC_LIGHTSALMON4, Quantity_NOC_LIGHTSEAGREEN, Quantity_NOC_LIGHTSKYBLUE, Quantity_NOC_LIGHTSKYBLUE1, Quantity_NOC_LIGHTSKYBLUE2, Quantity_NOC_LIGHTSKYBLUE3, Quantity_NOC_LIGHTSKYBLUE4, Quantity_NOC_LIGHTSLATEBLUE, Quantity_NOC_LIGHTSLATEGRAY, Quantity_NOC_LIGHTSTEELBLUE, Quantity_NOC_LIGHTSTEELBLUE1, Quantity_NOC_LIGHTSTEELBLUE2, Quantity_NOC_LIGHTSTEELBLUE3, Quantity_NOC_LIGHTSTEELBLUE4, Quantity_NOC_LIGHTYELLOW, Quantity_NOC_LIGHTYELLOW2, Quantity_NOC_LIGHTYELLOW3, Quantity_NOC_LIGHTYELLOW4, Quantity_NOC_LIMEGREEN, Quantity_NOC_LINEN, Quantity_NOC_MAGENTA1, Quantity_NOC_MAGENTA2, Quantity_NOC_MAGENTA3, Quantity_NOC_MAGENTA4, Quantity_NOC_MAROON, Quantity_NOC_MAROON1, Quantity_NOC_MAROON2, Quantity_NOC_MAROON3, Quantity_NOC_MAROON4, Quantity_NOC_MATRABLUE, Quantity_NOC_MATRAGRAY, Quantity_NOC_MEDIUMAQUAMARINE, Quantity_NOC_MEDIUMORCHID, Quantity_NOC_MEDIUMORCHID1, Quantity_NOC_MEDIUMORCHID2, Quantity_NOC_MEDIUMORCHID3, Quantity_NOC_MEDIUMORCHID4, Quantity_NOC_MEDIUMPURPLE, Quantity_NOC_MEDIUMPURPLE1, Quantity_NOC_MEDIUMPURPLE2, Quantity_NOC_MEDIUMPURPLE3, Quantity_NOC_MEDIUMPURPLE4, Quantity_NOC_MEDIUMSEAGREEN, Quantity_NOC_MEDIUMSLATEBLUE, Quantity_NOC_MEDIUMSPRINGGREEN, Quantity_NOC_MEDIUMTURQUOISE, Quantity_NOC_MEDIUMVIOLETRED, Quantity_NOC_MIDNIGHTBLUE, Quantity_NOC_MINTCREAM, Quantity_NOC_MISTYROSE, Quantity_NOC_MISTYROSE2, Quantity_NOC_MISTYROSE3, Quantity_NOC_MISTYROSE4, Quantity_NOC_MOCCASIN, Quantity_NOC_NAVAJOWHITE1, Quantity_NOC_NAVAJOWHITE2, Quantity_NOC_NAVAJOWHITE3, Quantity_NOC_NAVAJOWHITE4, Quantity_NOC_NAVYBLUE, Quantity_NOC_OLDLACE, Quantity_NOC_OLIVEDRAB, Quantity_NOC_OLIVEDRAB1, Quantity_NOC_OLIVEDRAB2, Quantity_NOC_OLIVEDRAB3, Quantity_NOC_OLIVEDRAB4, Quantity_NOC_ORANGE, Quantity_NOC_ORANGE1, Quantity_NOC_ORANGE2, Quantity_NOC_ORANGE3, Quantity_NOC_ORANGE4, Quantity_NOC_ORANGERED, Quantity_NOC_ORANGERED1, Quantity_NOC_ORANGERED2, Quantity_NOC_ORANGERED3, Quantity_NOC_ORANGERED4, Quantity_NOC_ORCHID, Quantity_NOC_ORCHID1, Quantity_NOC_ORCHID2, Quantity_NOC_ORCHID3, Quantity_NOC_ORCHID4, Quantity_NOC_PALEGOLDENROD, Quantity_NOC_PALEGREEN, Quantity_NOC_PALEGREEN1, Quantity_NOC_PALEGREEN2, Quantity_NOC_PALEGREEN3, Quantity_NOC_PALEGREEN4, Quantity_NOC_PALETURQUOISE, Quantity_NOC_PALETURQUOISE1, Quantity_NOC_PALETURQUOISE2, Quantity_NOC_PALETURQUOISE3, Quantity_NOC_PALETURQUOISE4, Quantity_NOC_PALEVIOLETRED, Quantity_NOC_PALEVIOLETRED1, Quantity_NOC_PALEVIOLETRED2, Quantity_NOC_PALEVIOLETRED3, Quantity_NOC_PALEVIOLETRED4, Quantity_NOC_PAPAYAWHIP, Quantity_NOC_PEACHPUFF, Quantity_NOC_PEACHPUFF2, Quantity_NOC_PEACHPUFF3, Quantity_NOC_PEACHPUFF4, Quantity_NOC_PERU, Quantity_NOC_PINK, Quantity_NOC_PINK1, Quantity_NOC_PINK2, Quantity_NOC_PINK3, Quantity_NOC_PINK4, Quantity_NOC_PLUM, Quantity_NOC_PLUM1, Quantity_NOC_PLUM2, Quantity_NOC_PLUM3, Quantity_NOC_PLUM4, Quantity_NOC_POWDERBLUE, Quantity_NOC_PURPLE, Quantity_NOC_PURPLE1, Quantity_NOC_PURPLE2, Quantity_NOC_PURPLE3, Quantity_NOC_PURPLE4, Quantity_NOC_RED, Quantity_NOC_RED1, Quantity_NOC_RED2, Quantity_NOC_RED3, Quantity_NOC_RED4, Quantity_NOC_ROSYBROWN, Quantity_NOC_ROSYBROWN1, Quantity_NOC_ROSYBROWN2, Quantity_NOC_ROSYBROWN3, Quantity_NOC_ROSYBROWN4, Quantity_NOC_ROYALBLUE, Quantity_NOC_ROYALBLUE1, Quantity_NOC_ROYALBLUE2, Quantity_NOC_ROYALBLUE3, Quantity_NOC_ROYALBLUE4, Quantity_NOC_SADDLEBROWN, Quantity_NOC_SALMON, Quantity_NOC_SALMON1, Quantity_NOC_SALMON2, Quantity_NOC_SALMON3, Quantity_NOC_SALMON4, Quantity_NOC_SANDYBROWN, Quantity_NOC_SEAGREEN, Quantity_NOC_SEAGREEN1, Quantity_NOC_SEAGREEN2, Quantity_NOC_SEAGREEN3, Quantity_NOC_SEAGREEN4, Quantity_NOC_SEASHELL, Quantity_NOC_SEASHELL2, Quantity_NOC_SEASHELL3, Quantity_NOC_SEASHELL4, Quantity_NOC_SIENNA, Quantity_NOC_SIENNA1, Quantity_NOC_SIENNA2, Quantity_NOC_SIENNA3, Quantity_NOC_SIENNA4, Quantity_NOC_SKYBLUE, Quantity_NOC_SKYBLUE1, Quantity_NOC_SKYBLUE2, Quantity_NOC_SKYBLUE3, Quantity_NOC_SKYBLUE4, Quantity_NOC_SLATEBLUE, Quantity_NOC_SLATEBLUE1, Quantity_NOC_SLATEBLUE2, Quantity_NOC_SLATEBLUE3, Quantity_NOC_SLATEBLUE4, Quantity_NOC_SLATEGRAY, Quantity_NOC_SLATEGRAY1, Quantity_NOC_SLATEGRAY2, Quantity_NOC_SLATEGRAY3, Quantity_NOC_SLATEGRAY4, Quantity_NOC_SNOW, Quantity_NOC_SNOW2, Quantity_NOC_SNOW3, Quantity_NOC_SNOW4, Quantity_NOC_SPRINGGREEN, Quantity_NOC_SPRINGGREEN2, Quantity_NOC_SPRINGGREEN3, Quantity_NOC_SPRINGGREEN4, Quantity_NOC_STEELBLUE, Quantity_NOC_STEELBLUE1, Quantity_NOC_STEELBLUE2, Quantity_NOC_STEELBLUE3, Quantity_NOC_STEELBLUE4, Quantity_NOC_TAN, Quantity_NOC_TAN1, Quantity_NOC_TAN2, Quantity_NOC_TAN3, Quantity_NOC_TAN4, Quantity_NOC_TEAL, Quantity_NOC_THISTLE, Quantity_NOC_THISTLE1, Quantity_NOC_THISTLE2, Quantity_NOC_THISTLE3, Quantity_NOC_THISTLE4, Quantity_NOC_TOMATO, Quantity_NOC_TOMATO1, Quantity_NOC_TOMATO2, Quantity_NOC_TOMATO3, Quantity_NOC_TOMATO4, Quantity_NOC_TURQUOISE, Quantity_NOC_TURQUOISE1, Quantity_NOC_TURQUOISE2, Quantity_NOC_TURQUOISE3, Quantity_NOC_TURQUOISE4, Quantity_NOC_VIOLET, Quantity_NOC_VIOLETRED, Quantity_NOC_VIOLETRED1, Quantity_NOC_VIOLETRED2, Quantity_NOC_VIOLETRED3, Quantity_NOC_VIOLETRED4, Quantity_NOC_WHEAT, Quantity_NOC_WHEAT1, Quantity_NOC_WHEAT2, Quantity_NOC_WHEAT3, Quantity_NOC_WHEAT4, Quantity_NOC_WHITE, Quantity_NOC_WHITESMOKE, Quantity_NOC_YELLOW, Quantity_NOC_YELLOW1, Quantity_NOC_YELLOW2, Quantity_NOC_YELLOW3, Quantity_NOC_YELLOW4, Quantity_NOC_YELLOWGREEN
- **Quantity_Period** (2 ctor) : Add, IsEqual, IsLonger, IsShorter, SetValues, Subtract, Values · *statiques :* IsValid
- **Quantity_PeriodDefinitionError** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Quantity_PhysicalQuantity** · *statiques :* Quantity_ABSORBEDDOSE, Quantity_ACCELERATION, Quantity_ACOUSTICINTENSITY, Quantity_ACTIVITY, Quantity_ADMITTANCE, Quantity_AMOUNTOFSUBSTANCE, Quantity_ANGULARVELOCITY, Quantity_AREA, Quantity_CAPACITANCE, Quantity_COEFFICIENTOFEXPANSION, Quantity_CONCENTRATION, Quantity_CONDUCTIVITY, Quantity_CONSUMPTION, Quantity_DENSITY, Quantity_DOSEEQUIVALENT, Quantity_ELECTRICCAPACITANCE, Quantity_ELECTRICCHARGE, Quantity_ELECTRICCURRENT, Quantity_ELECTRICFIELDSTRENGTH, Quantity_ELECTRICPOTENTIAL, Quantity_ENERGY, Quantity_ENTHALPY, Quantity_ENTROPY, Quantity_FORCE, Quantity_FREQUENCY, Quantity_ILLUMINANCE, Quantity_IMPEDANCE, Quantity_INDUCTANCE, Quantity_KINEMATICVISCOSITY, Quantity_KINETICMOMENT, Quantity_LENGTH, Quantity_LUMINANCE, Quantity_LUMINOUSEFFICACITY, Quantity_LUMINOUSEXPOSITION, Quantity_LUMINOUSFLUX, Quantity_LUMINOUSINTENSITY, Quantity_MAGNETICFIELDSTRENGTH, Quantity_MAGNETICFLUX, Quantity_MAGNETICFLUXDENSITY, Quantity_MASS, Quantity_MASSFLOW, Quantity_MOLARCONCENTRATION, Quantity_MOLARITY, Quantity_MOLARMASS, Quantity_MOLARVOLUME, Quantity_MOMENTOFAFORCE, Quantity_MOMENTOFINERTIA, Quantity_MOMENTUM, Quantity_PLANEANGLE, Quantity_POWER, Quantity_PRESSURE, Quantity_RELUCTANCE, Quantity_RESISTANCE, Quantity_RESISTIVITY, Quantity_SOLIDANGLE, Quantity_SOUNDINTENSITY, Quantity_SPECIFICHEATCAPACITY, Quantity_SPEED, Quantity_SURFACETENSION, Quantity_TEMPERATURE, Quantity_THERMALCONDUCTIVITY, Quantity_TORQUE, Quantity_VELOCITY, Quantity_VISCOSITY, Quantity_VOLUME, Quantity_VOLUMEFLOW, Quantity_WEIGHT, Quantity_WORK
- **Quantity_TypeOfColor** · *statiques :* Quantity_TOC_HLS, Quantity_TOC_RGB

## Resource

- **Resource_FormatType** · *statiques :* Resource_ANSI, Resource_EUC, Resource_FormatType_ANSI, Resource_FormatType_EUC, Resource_FormatType_GB, Resource_FormatType_SJIS, Resource_FormatType_SystemLocale, Resource_FormatType_UTF8, Resource_GB, Resource_SJIS
- **Resource_LexicalCompare** : IsLower
- **Resource_Manager** ← Standard_Transient (2 ctor) : DynamicType, ExtValue, Find, Integer, Real, Save, SetResource, Value · *statiques :* GetResourcePath, get_type_descriptor, get_type_name
- **Resource_NoSuchResource** ← Standard_NoSuchObject (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Resource_Unicode** · *statiques :* ConvertANSIToUnicode, ConvertBig5ToUnicode, ConvertEUCToUnicode, ConvertFormatToUnicode, ConvertGBKToUnicode, ConvertGBToUnicode, ConvertSJISToUnicode, ConvertUnicodeToANSI, ConvertUnicodeToEUC, ConvertUnicodeToFormat, ConvertUnicodeToGB, ConvertUnicodeToSJIS, GetFormat, ReadFormat, SetFormat

## RWGltf

- **RWGltf_CafReader** ← RWMesh_CafReader : DynamicType, SetMeshNameAsFallback, SetParallel, SetSkipEmptyNodes, ToParallel, ToSkipEmptyNodes, ToUseMeshNameAsFallback · *statiques :* get_type_descriptor, get_type_name
- **RWGltf_GltfAccessorCompType** · *statiques :* RWGltf_GltfAccessorCompType_Float32, RWGltf_GltfAccessorCompType_Int16, RWGltf_GltfAccessorCompType_Int8, RWGltf_GltfAccessorCompType_UInt16, RWGltf_GltfAccessorCompType_UInt32, RWGltf_GltfAccessorCompType_UInt8, RWGltf_GltfAccessorCompType_UNKNOWN
- **RWGltf_GltfAccessorLayout** · *statiques :* RWGltf_GltfAccessorLayout_Mat2, RWGltf_GltfAccessorLayout_Mat3, RWGltf_GltfAccessorLayout_Mat4, RWGltf_GltfAccessorLayout_Scalar, RWGltf_GltfAccessorLayout_UNKNOWN, RWGltf_GltfAccessorLayout_Vec2, RWGltf_GltfAccessorLayout_Vec3, RWGltf_GltfAccessorLayout_Vec4
- **RWGltf_GltfArrayType** · *statiques :* RWGltf_GltfArrayType_Color, RWGltf_GltfArrayType_Indices, RWGltf_GltfArrayType_Joint, RWGltf_GltfArrayType_Normal, RWGltf_GltfArrayType_Position, RWGltf_GltfArrayType_TCoord0, RWGltf_GltfArrayType_TCoord1, RWGltf_GltfArrayType_UNKNOWN, RWGltf_GltfArrayType_Weight
- **RWGltf_GltfBufferViewTarget** · *statiques :* RWGltf_GltfBufferViewTarget_ARRAY_BUFFER, RWGltf_GltfBufferViewTarget_ELEMENT_ARRAY_BUFFER, RWGltf_GltfBufferViewTarget_UNKNOWN
- **RWGltf_GltfLatePrimitiveArray** ← Poly_Triangulation : AddPrimArrayData, BaseColor, BoundingBox, Data, DynamicType, HasStyle, Id, MaterialCommon, MaterialPbr, Name, PrimitiveMode, SetBoundingBox, SetMaterialCommon, SetMaterialPbr, SetName, SetPrimitiveMode · *statiques :* get_type_descriptor, get_type_name
- **RWGltf_GltfPrimArrayData** (2 ctor)
- **RWGltf_GltfPrimitiveMode** · *statiques :* RWGltf_GltfPrimitiveMode_LineLoop, RWGltf_GltfPrimitiveMode_LineStrip, RWGltf_GltfPrimitiveMode_Lines, RWGltf_GltfPrimitiveMode_Points, RWGltf_GltfPrimitiveMode_TriangleFan, RWGltf_GltfPrimitiveMode_TriangleStrip, RWGltf_GltfPrimitiveMode_Triangles, RWGltf_GltfPrimitiveMode_UNKNOWN
- **RWGltf_GltfRootElement** · *statiques :* RWGltf_GltfRootElement_Accessors, RWGltf_GltfRootElement_Animations, RWGltf_GltfRootElement_Asset, RWGltf_GltfRootElement_BufferViews, RWGltf_GltfRootElement_Buffers, RWGltf_GltfRootElement_ExtensionsRequired, RWGltf_GltfRootElement_ExtensionsUsed, RWGltf_GltfRootElement_Images, RWGltf_GltfRootElement_Materials, RWGltf_GltfRootElement_Meshes, RWGltf_GltfRootElement_NB, RWGltf_GltfRootElement_NB_MANDATORY, RWGltf_GltfRootElement_Nodes, RWGltf_GltfRootElement_Programs, RWGltf_GltfRootElement_Samplers, RWGltf_GltfRootElement_Scene, RWGltf_GltfRootElement_Scenes, RWGltf_GltfRootElement_Shaders, RWGltf_GltfRootElement_Skins, RWGltf_GltfRootElement_Techniques, RWGltf_GltfRootElement_Textures
- **RWGltf_MaterialCommon** ← Standard_Transient
- **RWGltf_MaterialMetallicRoughness** ← Standard_Transient
- **RWGltf_PrimitiveArrayReader** ← Standard_Transient : CoordinateSystemConverter, DynamicType, ErrorPrefix, Load, SetCoordinateSystemConverter, SetErrorPrefix · *statiques :* get_type_descriptor, get_type_name
- **RWGltf_TriangulationReader** ← RWGltf_PrimitiveArrayReader : DynamicType · *statiques :* get_type_descriptor, get_type_name

## RWHeaderSection

- **RWHeaderSection_RWFileDescription** : ReadStep, WriteStep
- **RWHeaderSection_RWFileName** : ReadStep, WriteStep
- **RWHeaderSection_RWFileSchema** : ReadStep, WriteStep
- **RWHeaderSection_ReadWriteModule** ← StepData_ReadWriteModule : CaseStep, DynamicType, IsComplex, ReadStep, StepType, WriteStep · *statiques :* get_type_descriptor, get_type_name

## RWMesh

- **RWMesh_CafReader** ← Standard_Transient : CoordinateSystemConverter, Document, DynamicType, ExternalFiles, ExtraStatus, FileCoordinateSystem, FileLengthUnit, HasFileCoordinateSystem, HasSystemCoordinateSystem, MemoryLimitMiB, Metadata, Perform, ProbeHeader, RootPrefix, SetCoordinateSystemConverter, SetDocument, SetFileCoordinateSystem, SetFileLengthUnit, SetFillIncompleteDocument, SetMemoryLimitMiB, SetRootPrefix, SetSystemCoordinateSystem, SetSystemLengthUnit, SingleShape, SystemCoordinateSystem, SystemLengthUnit, ToFillIncompleteDocument · *statiques :* get_type_descriptor, get_type_name
- **RWMesh_CafReaderStatusEx** · *statiques :* RWMesh_CafReaderStatusEx_NONE, RWMesh_CafReaderStatusEx_Partial
- **RWMesh_CoordinateSystem** · *statiques :* RWMesh_CoordinateSystem_Blender, RWMesh_CoordinateSystem_Undefined, RWMesh_CoordinateSystem_Yup, RWMesh_CoordinateSystem_Zup, RWMesh_CoordinateSystem_glTF, RWMesh_CoordinateSystem_negZfwd_posYup, RWMesh_CoordinateSystem_posYfwd_posZup
- **RWMesh_CoordinateSystemConverter** : HasInputCoordinateSystem, HasOutputCoordinateSystem, Init, InputCoordinateSystem, InputLengthUnit, IsEmpty, OutputCoordinateSystem, OutputLengthUnit, SetInputCoordinateSystem, SetInputLengthUnit, SetOutputCoordinateSystem, SetOutputLengthUnit, TransformNormal, TransformPosition, TransformTransformation · *statiques :* StandardCoordinateSystem

## RWObj

- **RWObj_CafReader** ← RWMesh_CafReader : DynamicType, IsSinglePrecision, SetSinglePrecision · *statiques :* get_type_descriptor, get_type_name
- **RWObj_IShapeReceiver** : BindNamedShape
- **RWObj_MtlReader** : Read
- **RWObj_Reader** ← Standard_Transient : DynamicType, ExternalFiles, FileComments, IsSinglePrecision, MemoryLimit, NbProbeElems, NbProbeNodes, Probe, Read, SetMemoryLimit, SetSinglePrecision, SetTransformation, Transformation · *statiques :* get_type_descriptor, get_type_name
- **RWObj_SubMeshReason** · *statiques :* RWObj_SubMeshReason_NewGroup, RWObj_SubMeshReason_NewMaterial, RWObj_SubMeshReason_NewObject, RWObj_SubMeshReason_NewSmoothGroup
- **RWObj_TriangulationReader** ← RWObj_Reader : DynamicType, GetTriangulation, ResultShape, SetCreateShapes, SetShapeReceiver · *statiques :* get_type_descriptor, get_type_name

## RWStepAP203

- **RWStepAP203_RWCcDesignApproval** : ReadStep, Share, WriteStep
- **RWStepAP203_RWCcDesignCertification** : ReadStep, Share, WriteStep
- **RWStepAP203_RWCcDesignContract** : ReadStep, Share, WriteStep
- **RWStepAP203_RWCcDesignDateAndTimeAssignment** : ReadStep, Share, WriteStep
- **RWStepAP203_RWCcDesignPersonAndOrganizationAssignment** : ReadStep, Share, WriteStep
- **RWStepAP203_RWCcDesignSecurityClassification** : ReadStep, Share, WriteStep
- **RWStepAP203_RWCcDesignSpecificationReference** : ReadStep, Share, WriteStep
- **RWStepAP203_RWChange** : ReadStep, Share, WriteStep
- **RWStepAP203_RWChangeRequest** : ReadStep, Share, WriteStep
- **RWStepAP203_RWStartRequest** : ReadStep, Share, WriteStep
- **RWStepAP203_RWStartWork** : ReadStep, Share, WriteStep

## RWStepAP214

- **RWStepAP214_RWAppliedApprovalAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAppliedDateAndTimeAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAppliedDateAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAppliedDocumentReference** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAppliedExternalIdentificationAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAppliedGroupAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAppliedOrganizationAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAppliedPersonAndOrganizationAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAppliedPresentedItem** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAppliedSecurityClassificationAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignActualDateAndTimeAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignActualDateAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignApprovalAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignDateAndPersonAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignDocumentReference** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignGroupAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignNominalDateAndTimeAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignNominalDateAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignOrganizationAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignPersonAndOrganizationAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignPresentedItem** : ReadStep, Share, WriteStep
- **RWStepAP214_RWAutoDesignSecurityClassificationAssignment** : ReadStep, Share, WriteStep
- **RWStepAP214_RWClass** : ReadStep, Share, WriteStep
- **RWStepAP214_RWExternallyDefinedClass** : ReadStep, Share, WriteStep
- **RWStepAP214_RWExternallyDefinedGeneralProperty** : ReadStep, Share, WriteStep
- **RWStepAP214_RWRepItemGroup** : ReadStep, Share, WriteStep
- **RWStepAP214_ReadWriteModule** ← StepData_ReadWriteModule : CaseStep, ComplexType, DynamicType, IsComplex, ReadStep, StepType, WriteStep · *statiques :* get_type_descriptor, get_type_name

## RWStepAP242

- **RWStepAP242_RWDraughtingModelItemAssociation** : ReadStep, Share, WriteStep
- **RWStepAP242_RWGeometricItemSpecificUsage** : ReadStep, Share, WriteStep
- **RWStepAP242_RWIdAttribute** : ReadStep, Share, WriteStep
- **RWStepAP242_RWItemIdentifiedRepresentationUsage** : ReadStep, Share, WriteStep

## RWStepBasic

- **RWStepBasic_RWAction** : ReadStep, Share, WriteStep
- **RWStepBasic_RWActionAssignment** : ReadStep, Share, WriteStep
- **RWStepBasic_RWActionMethod** : ReadStep, Share, WriteStep
- **RWStepBasic_RWActionRequestAssignment** : ReadStep, Share, WriteStep
- **RWStepBasic_RWActionRequestSolution** : ReadStep, Share, WriteStep
- **RWStepBasic_RWAddress** : ReadStep, WriteStep
- **RWStepBasic_RWApplicationContext** : ReadStep, WriteStep
- **RWStepBasic_RWApplicationContextElement** : ReadStep, Share, WriteStep
- **RWStepBasic_RWApplicationProtocolDefinition** : ReadStep, Share, WriteStep
- **RWStepBasic_RWApproval** : ReadStep, Share, WriteStep
- **RWStepBasic_RWApprovalDateTime** : ReadStep, Share, WriteStep
- **RWStepBasic_RWApprovalPersonOrganization** : ReadStep, Share, WriteStep
- **RWStepBasic_RWApprovalRelationship** : ReadStep, Share, WriteStep
- **RWStepBasic_RWApprovalRole** : ReadStep, WriteStep
- **RWStepBasic_RWApprovalStatus** : ReadStep, WriteStep
- **RWStepBasic_RWCalendarDate** : ReadStep, WriteStep
- **RWStepBasic_RWCertification** : ReadStep, Share, WriteStep
- **RWStepBasic_RWCertificationAssignment** : ReadStep, Share, WriteStep
- **RWStepBasic_RWCertificationType** : ReadStep, Share, WriteStep
- **RWStepBasic_RWCharacterizedObject** : ReadStep, Share, WriteStep
- **RWStepBasic_RWContract** : ReadStep, Share, WriteStep
- **RWStepBasic_RWContractAssignment** : ReadStep, Share, WriteStep
- **RWStepBasic_RWContractType** : ReadStep, Share, WriteStep
- **RWStepBasic_RWConversionBasedUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWConversionBasedUnitAndAreaUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWConversionBasedUnitAndLengthUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWConversionBasedUnitAndMassUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWConversionBasedUnitAndPlaneAngleUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWConversionBasedUnitAndRatioUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWConversionBasedUnitAndSolidAngleUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWConversionBasedUnitAndTimeUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWConversionBasedUnitAndVolumeUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWCoordinatedUniversalTimeOffset** : ReadStep, WriteStep
- **RWStepBasic_RWDate** : ReadStep, WriteStep
- **RWStepBasic_RWDateAndTime** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDateRole** : ReadStep, WriteStep
- **RWStepBasic_RWDateTimeRole** : ReadStep, WriteStep
- **RWStepBasic_RWDerivedUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDerivedUnitElement** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDimensionalExponents** : ReadStep, WriteStep
- **RWStepBasic_RWDocument** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDocumentFile** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDocumentProductAssociation** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDocumentProductEquivalence** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDocumentRelationship** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDocumentRepresentationType** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDocumentType** : ReadStep, Share, WriteStep
- **RWStepBasic_RWDocumentUsageConstraint** : ReadStep, Share, WriteStep
- **RWStepBasic_RWEffectivity** : ReadStep, Share, WriteStep
- **RWStepBasic_RWEffectivityAssignment** : ReadStep, Share, WriteStep
- **RWStepBasic_RWEulerAngles** : ReadStep, Share, WriteStep
- **RWStepBasic_RWExternalIdentificationAssignment** : ReadStep, Share, WriteStep
- **RWStepBasic_RWExternalSource** : ReadStep, Share, WriteStep
- **RWStepBasic_RWExternallyDefinedItem** : ReadStep, Share, WriteStep
- **RWStepBasic_RWGeneralProperty** : ReadStep, Share, WriteStep
- **RWStepBasic_RWGroup** : ReadStep, Share, WriteStep
- **RWStepBasic_RWGroupAssignment** : ReadStep, Share, WriteStep
- **RWStepBasic_RWGroupRelationship** : ReadStep, Share, WriteStep
- **RWStepBasic_RWIdentificationAssignment** : ReadStep, Share, WriteStep
- **RWStepBasic_RWIdentificationRole** : ReadStep, Share, WriteStep
- **RWStepBasic_RWLengthMeasureWithUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWLengthUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWLocalTime** : ReadStep, Share, WriteStep
- **RWStepBasic_RWMassMeasureWithUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWMassUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWMeasureWithUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWMechanicalContext** : ReadStep, Share, WriteStep
- **RWStepBasic_RWNameAssignment** : ReadStep, Share, WriteStep
- **RWStepBasic_RWNamedUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWObjectRole** : ReadStep, Share, WriteStep
- **RWStepBasic_RWOrdinalDate** : ReadStep, WriteStep
- **RWStepBasic_RWOrganization** : ReadStep, WriteStep
- **RWStepBasic_RWOrganizationRole** : ReadStep, WriteStep
- **RWStepBasic_RWOrganizationalAddress** : ReadStep, Share, WriteStep
- **RWStepBasic_RWPerson** : ReadStep, WriteStep
- **RWStepBasic_RWPersonAndOrganization** : ReadStep, Share, WriteStep
- **RWStepBasic_RWPersonAndOrganizationRole** : ReadStep, WriteStep
- **RWStepBasic_RWPersonalAddress** : ReadStep, Share, WriteStep
- **RWStepBasic_RWPlaneAngleMeasureWithUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWPlaneAngleUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProduct** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductCategory** : ReadStep, WriteStep
- **RWStepBasic_RWProductCategoryRelationship** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductConceptContext** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductContext** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinition** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinitionContext** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinitionEffectivity** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinitionFormation** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinitionFormationRelationship** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinitionFormationWithSpecifiedSource** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinitionReference** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinitionReferenceWithLocalRepresentation** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinitionRelationship** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductDefinitionWithAssociatedDocuments** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductRelatedProductCategory** : ReadStep, Share, WriteStep
- **RWStepBasic_RWProductType** : ReadStep, Share, WriteStep
- **RWStepBasic_RWRatioMeasureWithUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWRoleAssociation** : ReadStep, Share, WriteStep
- **RWStepBasic_RWSecurityClassification** : ReadStep, Share, WriteStep
- **RWStepBasic_RWSecurityClassificationLevel** : ReadStep, WriteStep
- **RWStepBasic_RWSiUnit** : DecodeName, DecodePrefix, EncodeName, EncodePrefix, ReadStep, WriteStep
- **RWStepBasic_RWSiUnitAndAreaUnit** : ReadStep, WriteStep
- **RWStepBasic_RWSiUnitAndLengthUnit** : ReadStep, WriteStep
- **RWStepBasic_RWSiUnitAndMassUnit** : ReadStep, WriteStep
- **RWStepBasic_RWSiUnitAndPlaneAngleUnit** : ReadStep, WriteStep
- **RWStepBasic_RWSiUnitAndRatioUnit** : ReadStep, WriteStep
- **RWStepBasic_RWSiUnitAndSolidAngleUnit** : ReadStep, WriteStep
- **RWStepBasic_RWSiUnitAndThermodynamicTemperatureUnit** : ReadStep, WriteStep
- **RWStepBasic_RWSiUnitAndTimeUnit** : ReadStep, WriteStep
- **RWStepBasic_RWSiUnitAndVolumeUnit** : ReadStep, WriteStep
- **RWStepBasic_RWSolidAngleMeasureWithUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWSolidAngleUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWThermodynamicTemperatureUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWUncertaintyMeasureWithUnit** : ReadStep, Share, WriteStep
- **RWStepBasic_RWVersionedActionRequest** : ReadStep, Share, WriteStep
- **RWStepBasic_RWWeekOfYearAndDayDate** : ReadStep, WriteStep

## RWStepDimTol

- **RWStepDimTol_RWAngularityTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWCircularRunoutTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWCoaxialityTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWCommonDatum** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWConcentricityTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWCylindricityTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWDatum** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWDatumFeature** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWDatumReference** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWDatumReferenceCompartment** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWDatumReferenceElement** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWDatumReferenceModifierWithValue** : ReadStep, WriteStep
- **RWStepDimTol_RWDatumSystem** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWDatumTarget** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWFlatnessTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeneralDatumReference** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeoTolAndGeoTolWthDatRef** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeoTolAndGeoTolWthDatRefAndGeoTolWthMaxTol** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeoTolAndGeoTolWthDatRefAndGeoTolWthMod** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeoTolAndGeoTolWthDatRefAndModGeoTolAndPosTol** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeoTolAndGeoTolWthDatRefAndUneqDisGeoTol** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeoTolAndGeoTolWthMaxTol** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeoTolAndGeoTolWthMod** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeometricTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeometricToleranceRelationship** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeometricToleranceWithDatumReference** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeometricToleranceWithDefinedAreaUnit** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeometricToleranceWithDefinedUnit** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeometricToleranceWithMaximumTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWGeometricToleranceWithModifiers** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWLineProfileTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWModifiedGeometricTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWNonUniformZoneDefinition** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWParallelismTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWPerpendicularityTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWPlacedDatumTargetFeature** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWPositionTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWProjectedZoneDefinition** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWRoundnessTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWRunoutZoneDefinition** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWRunoutZoneOrientation** : ReadStep, WriteStep
- **RWStepDimTol_RWStraightnessTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWSurfaceProfileTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWSymmetryTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWToleranceZone** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWToleranceZoneDefinition** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWToleranceZoneForm** : ReadStep, WriteStep
- **RWStepDimTol_RWTotalRunoutTolerance** : ReadStep, Share, WriteStep
- **RWStepDimTol_RWUnequallyDisposedGeometricTolerance** : ReadStep, Share, WriteStep

## RWStepElement

- **RWStepElement_RWAnalysisItemWithinRepresentation** : ReadStep, Share, WriteStep
- **RWStepElement_RWCurve3dElementDescriptor** : ReadStep, Share, WriteStep
- **RWStepElement_RWCurveElementEndReleasePacket** : ReadStep, Share, WriteStep
- **RWStepElement_RWCurveElementSectionDefinition** : ReadStep, Share, WriteStep
- **RWStepElement_RWCurveElementSectionDerivedDefinitions** : ReadStep, Share, WriteStep
- **RWStepElement_RWElementDescriptor** : ReadStep, Share, WriteStep
- **RWStepElement_RWElementMaterial** : ReadStep, Share, WriteStep
- **RWStepElement_RWSurface3dElementDescriptor** : ReadStep, Share, WriteStep
- **RWStepElement_RWSurfaceElementProperty** : ReadStep, Share, WriteStep
- **RWStepElement_RWSurfaceSection** : ReadStep, Share, WriteStep
- **RWStepElement_RWSurfaceSectionField** : ReadStep, Share, WriteStep
- **RWStepElement_RWSurfaceSectionFieldConstant** : ReadStep, Share, WriteStep
- **RWStepElement_RWSurfaceSectionFieldVarying** : ReadStep, Share, WriteStep
- **RWStepElement_RWUniformSurfaceSection** : ReadStep, Share, WriteStep
- **RWStepElement_RWVolume3dElementDescriptor** : ReadStep, Share, WriteStep

## RWStepFEA

- **RWStepFEA_RWAlignedCurve3dElementCoordinateSystem** : ReadStep, Share, WriteStep
- **RWStepFEA_RWAlignedSurface3dElementCoordinateSystem** : ReadStep, Share, WriteStep
- **RWStepFEA_RWArbitraryVolume3dElementCoordinateSystem** : ReadStep, Share, WriteStep
- **RWStepFEA_RWConstantSurface3dElementCoordinateSystem** : ReadStep, Share, WriteStep
- **RWStepFEA_RWCurve3dElementProperty** : ReadStep, Share, WriteStep
- **RWStepFEA_RWCurve3dElementRepresentation** : ReadStep, Share, WriteStep
- **RWStepFEA_RWCurveElementEndOffset** : ReadStep, Share, WriteStep
- **RWStepFEA_RWCurveElementEndRelease** : ReadStep, Share, WriteStep
- **RWStepFEA_RWCurveElementInterval** : ReadStep, Share, WriteStep
- **RWStepFEA_RWCurveElementIntervalConstant** : ReadStep, Share, WriteStep
- **RWStepFEA_RWCurveElementIntervalLinearlyVarying** : ReadStep, Share, WriteStep
- **RWStepFEA_RWCurveElementLocation** : ReadStep, Share, WriteStep
- **RWStepFEA_RWDummyNode** : ReadStep, Share, WriteStep
- **RWStepFEA_RWElementGeometricRelationship** : ReadStep, Share, WriteStep
- **RWStepFEA_RWElementGroup** : ReadStep, Share, WriteStep
- **RWStepFEA_RWElementRepresentation** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaAreaDensity** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaAxis2Placement3d** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaCurveSectionGeometricRelationship** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaGroup** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaLinearElasticity** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaMassDensity** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaMaterialPropertyRepresentation** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaMaterialPropertyRepresentationItem** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaModel** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaModel3d** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaModelDefinition** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaMoistureAbsorption** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaParametricPoint** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaRepresentationItem** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaSecantCoefficientOfLinearThermalExpansion** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaShellBendingStiffness** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaShellMembraneBendingCouplingStiffness** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaShellMembraneStiffness** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaShellShearStiffness** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaSurfaceSectionGeometricRelationship** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFeaTangentialCoefficientOfLinearThermalExpansion** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFreedomAndCoefficient** : ReadStep, Share, WriteStep
- **RWStepFEA_RWFreedomsList** : ReadStep, Share, WriteStep
- **RWStepFEA_RWGeometricNode** : ReadStep, Share, WriteStep
- **RWStepFEA_RWNode** : ReadStep, Share, WriteStep
- **RWStepFEA_RWNodeDefinition** : ReadStep, Share, WriteStep
- **RWStepFEA_RWNodeGroup** : ReadStep, Share, WriteStep
- **RWStepFEA_RWNodeRepresentation** : ReadStep, Share, WriteStep
- **RWStepFEA_RWNodeSet** : ReadStep, Share, WriteStep
- **RWStepFEA_RWNodeWithSolutionCoordinateSystem** : ReadStep, Share, WriteStep
- **RWStepFEA_RWNodeWithVector** : ReadStep, Share, WriteStep
- **RWStepFEA_RWParametricCurve3dElementCoordinateDirection** : ReadStep, Share, WriteStep
- **RWStepFEA_RWParametricCurve3dElementCoordinateSystem** : ReadStep, Share, WriteStep
- **RWStepFEA_RWParametricSurface3dElementCoordinateSystem** : ReadStep, Share, WriteStep
- **RWStepFEA_RWSurface3dElementRepresentation** : ReadStep, Share, WriteStep
- **RWStepFEA_RWVolume3dElementRepresentation** : ReadStep, Share, WriteStep

## RWStepRepr

- **RWStepRepr_RWAllAroundShapeAspect** : ReadStep, Share, WriteStep
- **RWStepRepr_RWApex** : ReadStep, Share, WriteStep
- **RWStepRepr_RWAssemblyComponentUsage** : ReadStep, Share, WriteStep
- **RWStepRepr_RWAssemblyComponentUsageSubstitute** : ReadStep, Share, WriteStep
- **RWStepRepr_RWBetweenShapeAspect** : ReadStep, Share, WriteStep
- **RWStepRepr_RWCentreOfSymmetry** : ReadStep, Share, WriteStep
- **RWStepRepr_RWCharacterizedRepresentation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWCompGroupShAspAndCompShAspAndDatumFeatAndShAsp** : ReadStep, Share, WriteStep
- **RWStepRepr_RWCompShAspAndDatumFeatAndShAsp** : ReadStep, Share, WriteStep
- **RWStepRepr_RWCompositeGroupShapeAspect** : ReadStep, Share, WriteStep
- **RWStepRepr_RWCompositeShapeAspect** : ReadStep, Share, WriteStep
- **RWStepRepr_RWCompoundRepresentationItem** : ReadStep, Share, WriteStep
- **RWStepRepr_RWConfigurationDesign** : ReadStep, Share, WriteStep
- **RWStepRepr_RWConfigurationEffectivity** : ReadStep, Share, WriteStep
- **RWStepRepr_RWConfigurationItem** : ReadStep, Share, WriteStep
- **RWStepRepr_RWConstructiveGeometryRepresentation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWConstructiveGeometryRepresentationRelationship** : ReadStep, Share, WriteStep
- **RWStepRepr_RWContinuosShapeAspect** : ReadStep, Share, WriteStep
- **RWStepRepr_RWDataEnvironment** : ReadStep, Share, WriteStep
- **RWStepRepr_RWDefinitionalRepresentation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWDerivedShapeAspect** : ReadStep, Share, WriteStep
- **RWStepRepr_RWDescriptiveRepresentationItem** : ReadStep, WriteStep
- **RWStepRepr_RWExtension** : ReadStep, Share, WriteStep
- **RWStepRepr_RWFeatureForDatumTargetRelationship** : ReadStep, Share, WriteStep
- **RWStepRepr_RWFunctionallyDefinedTransformation** : ReadStep, WriteStep
- **RWStepRepr_RWGeometricAlignment** : ReadStep, Share, WriteStep
- **RWStepRepr_RWGlobalUncertaintyAssignedContext** : ReadStep, Share, WriteStep
- **RWStepRepr_RWGlobalUnitAssignedContext** : ReadStep, Share, WriteStep
- **RWStepRepr_RWIntegerRepresentationItem** : ReadStep, WriteStep
- **RWStepRepr_RWItemDefinedTransformation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWMakeFromUsageOption** : ReadStep, Share, WriteStep
- **RWStepRepr_RWMappedItem** : ReadStep, Share, WriteStep
- **RWStepRepr_RWMaterialDesignation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWMaterialProperty** : ReadStep, Share, WriteStep
- **RWStepRepr_RWMaterialPropertyRepresentation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWMeasureRepresentationItem** : ReadStep, Share, WriteStep
- **RWStepRepr_RWParallelOffset** : ReadStep, Share, WriteStep
- **RWStepRepr_RWParametricRepresentationContext** : ReadStep, WriteStep
- **RWStepRepr_RWPerpendicularTo** : ReadStep, Share, WriteStep
- **RWStepRepr_RWProductConcept** : ReadStep, Share, WriteStep
- **RWStepRepr_RWProductDefinitionShape** : ReadStep, Share, WriteStep
- **RWStepRepr_RWPropertyDefinition** : ReadStep, Share, WriteStep
- **RWStepRepr_RWPropertyDefinitionRelationship** : ReadStep, Share, WriteStep
- **RWStepRepr_RWPropertyDefinitionRepresentation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWQuantifiedAssemblyComponentUsage** : ReadStep, Share, WriteStep
- **RWStepRepr_RWReprItemAndLengthMeasureWithUnit** : ReadStep, WriteStep
- **RWStepRepr_RWReprItemAndLengthMeasureWithUnitAndQRI** : ReadStep, WriteStep
- **RWStepRepr_RWReprItemAndPlaneAngleMeasureWithUnit** : ReadStep, WriteStep
- **RWStepRepr_RWReprItemAndPlaneAngleMeasureWithUnitAndQRI** : ReadStep, WriteStep
- **RWStepRepr_RWRepresentation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWRepresentationContext** : ReadStep, WriteStep
- **RWStepRepr_RWRepresentationItem** : ReadStep, WriteStep
- **RWStepRepr_RWRepresentationMap** : ReadStep, Share, WriteStep
- **RWStepRepr_RWRepresentationRelationship** : ReadStep, Share, WriteStep
- **RWStepRepr_RWRepresentationRelationshipWithTransformation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWShapeAspect** : ReadStep, Share, WriteStep
- **RWStepRepr_RWShapeAspectDerivingRelationship** : ReadStep, Share, WriteStep
- **RWStepRepr_RWShapeAspectRelationship** : ReadStep, Share, WriteStep
- **RWStepRepr_RWShapeAspectTransition** : ReadStep, Share, WriteStep
- **RWStepRepr_RWShapeRepresentationRelationshipWithTransformation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWSpecifiedHigherUsageOccurrence** : ReadStep, Share, WriteStep
- **RWStepRepr_RWStructuralResponseProperty** : ReadStep, Share, WriteStep
- **RWStepRepr_RWStructuralResponsePropertyDefinitionRepresentation** : ReadStep, Share, WriteStep
- **RWStepRepr_RWTangent** : ReadStep, Share, WriteStep
- **RWStepRepr_RWValueRepresentationItem** : ReadStep, WriteStep

## RWStepShape

- **RWStepShape_RWAdvancedBrepShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWAdvancedFace** : ReadStep, Share, WriteStep
- **RWStepShape_RWAngularLocation** : ReadStep, Share, WriteStep
- **RWStepShape_RWAngularSize** : ReadStep, Share, WriteStep
- **RWStepShape_RWBlock** : ReadStep, Share, WriteStep
- **RWStepShape_RWBooleanResult** : ReadStep, Share, WriteStep
- **RWStepShape_RWBoxDomain** : ReadStep, Share, WriteStep
- **RWStepShape_RWBoxedHalfSpace** : ReadStep, Share, WriteStep
- **RWStepShape_RWClosedShell** : ReadStep, Share, WriteStep
- **RWStepShape_RWCompoundShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWConnectedEdgeSet** : ReadStep, Share, WriteStep
- **RWStepShape_RWConnectedFaceSet** : ReadStep, Share, WriteStep
- **RWStepShape_RWConnectedFaceShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWConnectedFaceSubSet** : ReadStep, Share, WriteStep
- **RWStepShape_RWContextDependentShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWCsgShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWCsgSolid** : ReadStep, Share, WriteStep
- **RWStepShape_RWDefinitionalRepresentationAndShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWDimensionalCharacteristicRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWDimensionalLocation** : ReadStep, Share, WriteStep
- **RWStepShape_RWDimensionalLocationWithPath** : ReadStep, Share, WriteStep
- **RWStepShape_RWDimensionalSize** : ReadStep, Share, WriteStep
- **RWStepShape_RWDimensionalSizeWithPath** : ReadStep, Share, WriteStep
- **RWStepShape_RWEdge** : ReadStep, Share, WriteStep
- **RWStepShape_RWEdgeBasedWireframeModel** : ReadStep, Share, WriteStep
- **RWStepShape_RWEdgeBasedWireframeShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWExtrudedAreaSolid** : ReadStep, Share, WriteStep
- **RWStepShape_RWExtrudedFaceSolid** : ReadStep, Share, WriteStep
- **RWStepShape_RWFace** : ReadStep, Share, WriteStep
- **RWStepShape_RWFaceBasedSurfaceModel** : ReadStep, Share, WriteStep
- **RWStepShape_RWFaceOuterBound** : ReadStep, Share, WriteStep
- **RWStepShape_RWFaceSurface** : ReadStep, Share, WriteStep
- **RWStepShape_RWFacetedBrep** : ReadStep, Share, WriteStep
- **RWStepShape_RWFacetedBrepAndBrepWithVoids** : ReadStep, Share, WriteStep
- **RWStepShape_RWFacetedBrepShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWGeometricCurveSet** : ReadStep, Share, WriteStep
- **RWStepShape_RWGeometricSet** : ReadStep, Share, WriteStep
- **RWStepShape_RWGeometricallyBoundedSurfaceShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWGeometricallyBoundedWireframeShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWHalfSpaceSolid** : ReadStep, Share, WriteStep
- **RWStepShape_RWLimitsAndFits** : ReadStep, WriteStep
- **RWStepShape_RWLoop** : ReadStep, WriteStep
- **RWStepShape_RWLoopAndPath** : ReadStep, Share, WriteStep
- **RWStepShape_RWManifoldSolidBrep** : ReadStep, Share, WriteStep
- **RWStepShape_RWManifoldSurfaceShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWMeasureQualification** : ReadStep, Share, WriteStep
- **RWStepShape_RWMeasureRepresentationItemAndQualifiedRepresentationItem** : ReadStep, Share, WriteStep
- **RWStepShape_RWNonManifoldSurfaceShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWOpenShell** : ReadStep, Share, WriteStep
- **RWStepShape_RWOrientedClosedShell** : ReadStep, Share, WriteStep
- **RWStepShape_RWOrientedEdge** : ReadStep, Share, WriteStep
- **RWStepShape_RWOrientedFace** : ReadStep, Share, WriteStep
- **RWStepShape_RWOrientedOpenShell** : ReadStep, Share, WriteStep
- **RWStepShape_RWOrientedPath** : ReadStep, Share, WriteStep
- **RWStepShape_RWPath** : ReadStep, Share, WriteStep
- **RWStepShape_RWPlusMinusTolerance** : ReadStep, Share, WriteStep
- **RWStepShape_RWPointRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWPolyLoop** : ReadStep, Share, WriteStep
- **RWStepShape_RWPrecisionQualifier** : ReadStep, WriteStep
- **RWStepShape_RWQualifiedRepresentationItem** : ReadStep, Share, WriteStep
- **RWStepShape_RWRevolvedAreaSolid** : ReadStep, Share, WriteStep
- **RWStepShape_RWRevolvedFaceSolid** : ReadStep, Share, WriteStep
- **RWStepShape_RWRightAngularWedge** : ReadStep, Share, WriteStep
- **RWStepShape_RWRightCircularCone** : ReadStep, Share, WriteStep
- **RWStepShape_RWRightCircularCylinder** : ReadStep, Share, WriteStep
- **RWStepShape_RWSeamEdge** : ReadStep, Share, WriteStep
- **RWStepShape_RWShapeDefinitionRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWShapeDimensionRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWShapeRepresentationWithParameters** : ReadStep, Share, WriteStep
- **RWStepShape_RWShellBasedSurfaceModel** : ReadStep, Share, WriteStep
- **RWStepShape_RWSolidModel** : ReadStep, WriteStep
- **RWStepShape_RWSolidReplica** : ReadStep, Share, WriteStep
- **RWStepShape_RWSphere** : ReadStep, Share, WriteStep
- **RWStepShape_RWSubedge** : ReadStep, Share, WriteStep
- **RWStepShape_RWSubface** : ReadStep, Share, WriteStep
- **RWStepShape_RWSweptAreaSolid** : ReadStep, Share, WriteStep
- **RWStepShape_RWSweptFaceSolid** : ReadStep, Share, WriteStep
- **RWStepShape_RWToleranceValue** : ReadStep, Share, WriteStep
- **RWStepShape_RWTopologicalRepresentationItem** : ReadStep, WriteStep
- **RWStepShape_RWTorus** : ReadStep, Share, WriteStep
- **RWStepShape_RWTransitionalShapeRepresentation** : ReadStep, Share, WriteStep
- **RWStepShape_RWTypeQualifier** : ReadStep, WriteStep
- **RWStepShape_RWValueFormatTypeQualifier** : ReadStep, WriteStep
- **RWStepShape_RWVertex** : ReadStep, WriteStep
- **RWStepShape_RWVertexLoop** : ReadStep, Share, WriteStep
- **RWStepShape_RWVertexPoint** : ReadStep, Share, WriteStep

## RWStepVisual

- **RWStepVisual_RWAnnotationCurveOccurrence** : ReadStep, Share, WriteStep
- **RWStepVisual_RWAnnotationCurveOccurrenceAndAnnotationOccurrenceAndGeomReprItemAndReprItemAndStyledItem** : ReadStep, Share, WriteStep
- **RWStepVisual_RWAnnotationFillArea** : ReadStep, Share, WriteStep
- **RWStepVisual_RWAnnotationFillAreaOccurrence** : ReadStep, Share, WriteStep
- **RWStepVisual_RWAnnotationOccurrence** : ReadStep, Share, WriteStep
- **RWStepVisual_RWAnnotationPlane** : ReadStep, Share, WriteStep
- **RWStepVisual_RWAreaInSet** : ReadStep, Share, WriteStep
- **RWStepVisual_RWBackgroundColour** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCameraImage** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCameraModel** : ReadStep, WriteStep
- **RWStepVisual_RWCameraModelD2** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCameraModelD3** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCameraModelD3MultiClipping** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCameraModelD3MultiClippingIntersection** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCameraModelD3MultiClippingUnion** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCameraUsage** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCharacterizedObjectAndCharacterizedRepresentationAndDraughtingModelAndRepresentation** : ReadStep, Share, WriteStep
- **RWStepVisual_RWColour** : ReadStep, WriteStep
- **RWStepVisual_RWColourRgb** : ReadStep, WriteStep
- **RWStepVisual_RWColourSpecification** : ReadStep, WriteStep
- **RWStepVisual_RWCompositeText** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCompositeTextWithExtent** : ReadStep, Share, WriteStep
- **RWStepVisual_RWContextDependentInvisibility** : ReadStep, Share, WriteStep
- **RWStepVisual_RWContextDependentOverRidingStyledItem** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCoordinatesList** : ReadStep, WriteStep
- **RWStepVisual_RWCurveStyle** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCurveStyleFont** : ReadStep, Share, WriteStep
- **RWStepVisual_RWCurveStyleFontPattern** : ReadStep, WriteStep
- **RWStepVisual_RWDraughtingCallout** : ReadStep, Share, WriteStep
- **RWStepVisual_RWDraughtingModel** : ReadStep, Share, WriteStep
- **RWStepVisual_RWDraughtingPreDefinedColour** : ReadStep, WriteStep
- **RWStepVisual_RWDraughtingPreDefinedCurveFont** : ReadStep, WriteStep
- **RWStepVisual_RWExternallyDefinedCurveFont** : ReadStep, Share, WriteStep
- **RWStepVisual_RWFillAreaStyle** : ReadStep, Share, WriteStep
- **RWStepVisual_RWFillAreaStyleColour** : ReadStep, Share, WriteStep
- **RWStepVisual_RWInvisibility** : ReadStep, Share, WriteStep
- **RWStepVisual_RWMechanicalDesignGeometricPresentationArea** : ReadStep, Share, WriteStep
- **RWStepVisual_RWMechanicalDesignGeometricPresentationRepresentation** : ReadStep, Share, WriteStep
- **RWStepVisual_RWOverRidingStyledItem** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPlanarBox** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPlanarExtent** : ReadStep, WriteStep
- **RWStepVisual_RWPointStyle** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPreDefinedColour** : ReadStep, WriteStep
- **RWStepVisual_RWPreDefinedCurveFont** : ReadStep, WriteStep
- **RWStepVisual_RWPreDefinedItem** : ReadStep, WriteStep
- **RWStepVisual_RWPresentationArea** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPresentationLayerAssignment** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPresentationLayerUsage** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPresentationRepresentation** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPresentationSet** : ReadStep, WriteStep
- **RWStepVisual_RWPresentationSize** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPresentationStyleAssignment** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPresentationStyleByContext** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPresentationView** : ReadStep, Share, WriteStep
- **RWStepVisual_RWPresentedItemRepresentation** : ReadStep, Share, WriteStep
- **RWStepVisual_RWStyledItem** : ReadStep, Share, WriteStep
- **RWStepVisual_RWSurfaceSideStyle** : ReadStep, Share, WriteStep
- **RWStepVisual_RWSurfaceStyleBoundary** : ReadStep, Share, WriteStep
- **RWStepVisual_RWSurfaceStyleControlGrid** : ReadStep, Share, WriteStep
- **RWStepVisual_RWSurfaceStyleFillArea** : ReadStep, Share, WriteStep
- **RWStepVisual_RWSurfaceStyleParameterLine** : ReadStep, Share, WriteStep
- **RWStepVisual_RWSurfaceStyleSegmentationCurve** : ReadStep, Share, WriteStep
- **RWStepVisual_RWSurfaceStyleSilhouette** : ReadStep, Share, WriteStep
- **RWStepVisual_RWSurfaceStyleUsage** : ReadStep, Share, WriteStep
- **RWStepVisual_RWTemplate** : ReadStep, Share, WriteStep
- **RWStepVisual_RWTemplateInstance** : ReadStep, Share, WriteStep
- **RWStepVisual_RWTessellatedAnnotationOccurrence** : ReadStep, Share, WriteStep
- **RWStepVisual_RWTessellatedCurveSet** : ReadStep, Share, WriteStep
- **RWStepVisual_RWTessellatedGeometricSet** : ReadStep, Share, WriteStep
- **RWStepVisual_RWTessellatedItem** : ReadStep, WriteStep
- **RWStepVisual_RWTextLiteral** : ReadStep, Share, WriteStep
- **RWStepVisual_RWTextStyle** : ReadStep, Share, WriteStep
- **RWStepVisual_RWTextStyleForDefinedFont** : ReadStep, Share, WriteStep
- **RWStepVisual_RWTextStyleWithBoxCharacteristics** : ReadStep, Share, WriteStep
- **RWStepVisual_RWViewVolume** : ReadStep, Share, WriteStep

## RWStl

- **RWStl_Reader** ← Standard_Transient : AddNode, AddTriangle, DynamicType, IsAscii, Read, ReadAscii, ReadBinary · *statiques :* get_type_descriptor, get_type_name

## Select3D

- **Select3D_BVHIndexBuffer**
- **Select3D_InteriorSensitivePointSet** ← Select3D_SensitiveSet : BoundingBox, Box, Center, CenterOfGeometry, DynamicType, GetPoints, NbSubElements, Size, Swap · *statiques :* get_type_descriptor, get_type_name
- **Select3D_PointData** : Pnt, Pnt3d, SetPnt, Size
- **Select3D_SensitiveBox** ← Select3D_SensitiveEntity (2 ctor) : BoundingBox, Box, CenterOfGeometry, DynamicType, GetConnected, Matches, NbSubElements · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitiveCircle** ← Select3D_SensitivePoly (4 ctor) : ArrayBounds, BVH, CenterOfGeometry, DynamicType, GetConnected, GetPoint3d, Matches · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitiveCurve** ← Select3D_SensitivePoly (3 ctor) : DynamicType, GetConnected · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitiveEntity** ← Standard_Transient : BVH, BoundingBox, CenterOfGeometry, Clear, DynamicType, GetConnected, HasInitLocation, InvInitLocation, Matches, NbSubElements, OwnerId, SensitivityFactor, Set, SetSensitivityFactor · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitiveFace** ← Select3D_SensitiveEntity (2 ctor) : BVH, BoundingBox, CenterOfGeometry, DynamicType, GetConnected, GetPoints, Matches, NbSubElements · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitiveGroup** ← Select3D_SensitiveSet (2 ctor) : Add, BoundingBox, Box, Center, CenterOfGeometry, Clear, DynamicType, Entities, GetConnected, IsIn, LastDetectedEntity, LastDetectedEntityIndex, Matches, MustMatchAll, NbSubElements, Remove, Set, SetCheckOverlapAll, SetMatchType, Size, SubEntity, Swap, ToCheckOverlapAll · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitivePoint** ← Select3D_SensitiveEntity : BoundingBox, CenterOfGeometry, DynamicType, GetConnected, Matches, NbSubElements, Point · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitivePoly** ← Select3D_SensitiveSet (3 ctor) : BoundingBox, Box, Center, CenterOfGeometry, DynamicType, NbSubElements, Points3D, Size, Swap · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitivePrimitiveArray** ← Select3D_SensitiveSet : BVH, BoundingBox, Box, Center, CenterOfGeometry, DynamicType, GetConnected, HasInitLocation, InitPoints, InitTriangulation, InvInitLocation, LastDetectedEdgeNode1, LastDetectedEdgeNode2, LastDetectedElement, LastDetectedElementMap, LastDetectedNode, LastDetectedNodeMap, Matches, NbSubElements, PatchDistance, PatchSizeMax, Set, SetDetectEdges, SetDetectElementMap, SetDetectElements, SetDetectNodeMap, SetDetectNodes, SetMinMax, SetPatchDistance, SetPatchSizeMax, Size, Swap, ToDetectEdges, ToDetectElementMap, ToDetectElements, ToDetectNodeMap, ToDetectNodes · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitiveSegment** ← Select3D_SensitiveEntity : BoundingBox, CenterOfGeometry, DynamicType, EndPoint, GetConnected, Matches, NbSubElements, SetEndPoint, SetStartPoint, StartPoint · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitiveSet** ← Select3D_SensitiveEntity : BVH, BoundingBox, Box, Center, CenterOfGeometry, Clear, DynamicType, GetLeafNodeSize, MarkDirty, Matches, SetBuilder, Size, Swap · *statiques :* DefaultBVHBuilder, SetDefaultBVHBuilder, get_type_descriptor, get_type_name
- **Select3D_SensitiveTriangle** ← Select3D_SensitiveEntity : BoundingBox, Center3D, CenterOfGeometry, DynamicType, GetConnected, Matches, NbSubElements, Points3D · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitiveTriangulation** ← Select3D_SensitiveSet (2 ctor) : BoundingBox, Box, Center, CenterOfGeometry, DynamicType, GetConnected, GetInitLocation, HasInitLocation, InvInitLocation, NbSubElements, Size, Swap, Triangulation · *statiques :* get_type_descriptor, get_type_name
- **Select3D_SensitiveWire** ← Select3D_SensitiveSet : Add, BoundingBox, Box, Center, CenterOfGeometry, DynamicType, GetConnected, GetEdges, GetLastDetected, NbSubElements, Set, Size, Swap · *statiques :* get_type_descriptor, get_type_name
- **Select3D_TypeOfSensitivity** · *statiques :* Select3D_TOS_BOUNDARY, Select3D_TOS_INTERIOR

## SelectBasics

- **SelectBasics_SelectingVolumeManager** : DetectedPoint, DistToGeometryCenter, GetActiveSelectionType, GetFarPickedPnt, GetMousePosition, GetNearPickedPnt, GetPlanes, IsOverlapAllowed, Overlaps

## SelectMgr

- **SelectMgr_AndFilter** ← SelectMgr_CompositionFilter : DynamicType, IsOk · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_BaseFrustum** ← Standard_Transient : Build, Camera, DetectedPoint, DistToGeometryCenter, DumpJson, DynamicType, GetPlanes, Overlaps, ProjectionMatrix, ScaleAndTransform, SetBuilder, SetCamera, SetPixelTolerance, SetViewport, SetWindowSize, WindowSize, WorldViewMatrix, WorldViewProjState · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_CompositionFilter** ← SelectMgr_Filter : ActsOn, Add, Clear, DynamicType, IsEmpty, IsIn, Remove, StoredFilters · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_EntityOwner** ← Standard_Transient (3 ctor) : Clear, ComesFromDecomposition, DumpJson, DynamicType, HandleMouseClick, HasLocation, HasSelectable, HilightWithColor, IsAutoHilight, IsForcedHilight, IsHilighted, IsSameSelectable, IsSelected, Location, Priority, Selectable, Set, SetComesFromDecomposition, SetLocation, SetPriority, SetSelectable, SetSelected, SetZLayer, State, Unhilight, UpdateHighlightTrsf · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_Filter** ← Standard_Transient : ActsOn, DynamicType, IsOk · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_FrustumBuilder** ← Standard_Transient : DynamicType, InvalidateViewport, ProjectPntOnViewPlane, ProjectionMatrix, SetProjectionMatrix, SetViewport, SetWindowSize, SetWorldViewMatrix, SetWorldViewProjState, SignedPlanePntDist, WindowSize, WorldViewMatrix, WorldViewProjState · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_ListOfFilter** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **SelectMgr_OrFilter** ← SelectMgr_CompositionFilter : DynamicType, IsOk, SetDisabledObjects · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_PickingStrategy** · *statiques :* SelectMgr_PickingStrategy_FirstAcceptable, SelectMgr_PickingStrategy_OnlyTopmost
- **SelectMgr_RectangularFrustum**
- **SelectMgr_SelectableObject** ← PrsMgr_PresentableObject : AcceptShapeDecomposition, AddSelection, BndBoxOfSelected, ClearDynamicHighlight, ClearSelected, ClearSelections, ComputeSelection, CurrentSelection, DumpJson, DynamicType, ErasePresentations, GetAssemblyOwner, GetHilightPresentation, GetSelectPresentation, GlobalSelOwner, GlobalSelectionMode, HasSelection, HilightOwnerWithColor, HilightSelected, Init, IsAutoHilight, More, Next, RecomputePrimitives, ResetTransformation, Selection, Selections, SetAssemblyOwner, SetAutoHilight, SetZLayer, UpdateSelection, UpdateTransformation, UpdateTransformations · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_SelectableObjectSet** : Append, BVH, ChangeSubset, Contains, GetObjectById, IsEmpty, MarkDirty, Remove, UpdateBVH
- **SelectMgr_SelectingVolumeManager** ← SelectBasics_SelectingVolumeManager : ActiveVolume, AllowOverlapDetection, BuildSelectingVolume, Camera, DetectedPoint, DistToGeometryCenter, GetActiveSelectionType, GetFarPickedPnt, GetMousePosition, GetNearPickedPnt, GetPlanes, GetVertices, IsOverlapAllowed, ObjectClipping, Overlaps, ProjectionMatrix, ScaleAndTransform, SetActiveSelectionType, SetCamera, SetPixelTolerance, SetViewClipRanges, SetViewClipping, SetViewport, SetWindowSize, ViewClipRanges, ViewClipping, WindowSize, WorldViewMatrix, WorldViewProjState
- **SelectMgr_Selection** ← Standard_Transient : Add, BVHUpdateStatus, ChangeEntities, Clear, Destroy, DynamicType, Entities, GetSelectionState, Init, IsEmpty, Mode, More, Next, Sensitive, Sensitivity, SetSelectionState, SetSensitivity, UpdateBVHStatus, UpdateStatus · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_SelectionManager** ← Standard_Transient : Activate, ClearSelectionStructures, Contains, Deactivate, DynamicType, IsActivated, Load, RecomputeSelection, Remove, RestoreSelectionStructures, Selector, SetSelectionSensitivity, SetUpdateMode, Update, UpdateSelection · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_SensitiveEntity** ← Standard_Transient : BaseSensitive, Clear, DynamicType, IsActiveForSelection, ResetSelectionActiveStatus, SetActiveForSelection · *statiques :* get_type_descriptor, get_type_name
- **SelectMgr_SensitiveEntitySet**
- **SelectMgr_SortCriterion** : IsGreater, IsLower
- **SelectMgr_StateOfSelection** · *statiques :* SelectMgr_SOS_Activated, SelectMgr_SOS_Any, SelectMgr_SOS_Deactivated, SelectMgr_SOS_Unknown
- **SelectMgr_ToleranceMap** : Add, CustomTolerance, Decrement, IsCustomTolSet, ResetDefaults, SetCustomTolerance, Tolerance
- **SelectMgr_TriangFrustums** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **SelectMgr_TriangularFrustum**
- **SelectMgr_TriangularFrustumSet** ← SelectMgr_BaseFrustum : Build, GetPlanes, Overlaps, ScaleAndTransform
- **SelectMgr_TypeOfBVHUpdate** · *statiques :* SelectMgr_TBU_Add, SelectMgr_TBU_Invalidate, SelectMgr_TBU_None, SelectMgr_TBU_Remove, SelectMgr_TBU_Renew
- **SelectMgr_TypeOfUpdate** · *statiques :* SelectMgr_TOU_Full, SelectMgr_TOU_None, SelectMgr_TOU_Partial
- **SelectMgr_ViewClipRange** : AddClipSubRange, AddClippingPlanes, ChangeUnclipRange, DumpJson, GetNearestDepth, IsClipped, SetVoid
- **SelectMgr_ViewerSelector** ← Standard_Transient : ActiveOwners, AddSelectableObject, AddSelectionToObject, AllowOverlapDetection, Clear, ClearPicked, Contains, DetectedEntity, DumpJson, DynamicType, EntitySetBuilder, GetManager, Init, InitDetected, IsActive, IsInside, Modes, More, MoreDetected, MoveSelectableObject, NbPicked, Next, NextDetected, OnePicked, Picked, PickedData, PickedEntity, PickedPoint, RebuildObjectsTree, RebuildSensitivesTree, RemoveSelectableObject, RemoveSelectionOfObject, ResetSelectionActivationStatus, Sensitivity, SetEntitySetBuilder, SetPickClosest, SortResult, Status · *statiques :* get_type_descriptor, get_type_name

## ShapeAlgo

- **ShapeAlgo_AlgoContainer** ← Standard_Transient : ApproxBSplineCurve, C0BSplineToSequenceOfC1BSplineCurve, C0ShapeToC1Shape, ConnectNextWire, ConvertCurveToBSpline, ConvertSurfaceToBSpline, ConvertToPeriodic, DynamicType, GetFaceUVBounds, HomoWires, OuterWire, SetToolContainer, ToolContainer · *statiques :* get_type_descriptor, get_type_name
- **ShapeAlgo_ToolContainer** ← Standard_Transient : DynamicType, EdgeProjAux, FixShape · *statiques :* get_type_descriptor, get_type_name

## ShapeAnalysis

- **ShapeAnalysis_BoxBndTreeSelector**
- **ShapeAnalysis_CheckSmallFace** : CheckPin, CheckPinEdges, CheckPinFace, CheckSingleStrip, CheckSplittingVertices, CheckSpotFace, CheckStripEdges, CheckStripFace, CheckTwisted, FindStripEdges, IsSpotFace, IsStripSupport, SetTolerance, Status, StatusPin, StatusPinEdges, StatusPinFace, StatusSplitVert, StatusSpot, StatusStrip, StatusTwisted, Tolerance
- **ShapeAnalysis_Curve** : FillBndBox, NextProject, Project, ProjectAct, SelectForwardSeam, ValidateRange · *statiques :* GetSamplePoints, IsClosed, IsPeriodic, IsPlanar
- **ShapeAnalysis_Edge** : BoundUV, CheckCurve3dWithPCurve, CheckOverlapping, CheckPCurveRange, CheckSameParameter, CheckVertexTolerance, CheckVerticesWithCurve3d, CheckVerticesWithPCurve, Curve3d, FirstVertex, GetEndTangent2d, HasCurve3d, HasPCurve, IsClosed3d, IsSeam, LastVertex, PCurve, Status · *statiques :* ComputeDeviation
- **ShapeAnalysis_FreeBoundData** ← Standard_Transient (2 ctor) : AddNotch, Area, Clear, DynamicType, FreeBound, NbNotches, Notch, NotchWidth, Notches, Perimeter, Ratio, SetArea, SetFreeBound, SetPerimeter, SetRatio, SetWidth, Width · *statiques :* get_type_descriptor, get_type_name
- **ShapeAnalysis_FreeBounds** (3 ctor) : GetClosedWires, GetOpenWires · *statiques :* ConnectEdgesToWires, ConnectWiresToWires, DispatchWires, SplitWires
- **ShapeAnalysis_FreeBoundsProperties** (3 ctor) : CheckContours, CheckNotches, ClosedFreeBound, ClosedFreeBounds, DispatchBounds, FillProperties, Init, IsLoaded, NbClosedFreeBounds, NbFreeBounds, NbOpenFreeBounds, OpenFreeBound, OpenFreeBounds, Perform, Shape, Tolerance
- **ShapeAnalysis_Geom** · *statiques :* NearestPlane, PositionTrsf
- **ShapeAnalysis_ShapeContents** : BigSplineSec, Clear, ClearFlags, IndirectSec, ModifyBigSplineMode, ModifyIndirectMode, ModifyOffestSurfaceMode, ModifyOffsetCurveMode, ModifyTrimmed2dMode, ModifyTrimmed3dMode, NbBSplibeSurf, NbBezierSurf, NbBigSplines, NbC0Curves, NbC0Surfaces, NbEdges, NbFaceWithSevWires, NbFaces, NbFreeEdges, NbFreeFaces, NbFreeWires, NbIndirectSurf, NbNoPCurve, NbOffsetCurves, NbOffsetSurf, NbSharedEdges, NbSharedFaces, NbSharedFreeEdges, NbSharedFreeWires, NbSharedShells, NbSharedSolids, NbSharedVertices, NbSharedWires, NbShells, NbSolids, NbSolidsWithVoids, NbTrimSurf, NbTrimmedCurve2d, NbTrimmedCurve3d, NbVertices, NbWireWithSevSeams, NbWireWitnSeam, NbWires, OffsetCurveSec, OffsetSurfaceSec, Perform, Trimmed2dSec, Trimmed3dSec
- **ShapeAnalysis_ShapeTolerance** : AddTolerance, GlobalTolerance, InTolerance, InitTolerance, OverTolerance, Tolerance
- **ShapeAnalysis_Shell** : BadEdges, CheckOrientedShells, Clear, FreeEdges, HasBadEdges, HasConnectedEdges, HasFreeEdges, IsLoaded, LoadShells, Loaded, NbLoaded
- **ShapeAnalysis_Surface** ← Standard_Transient : Adaptor3d, Bounds, ComputeBoundIsos, DegeneratedValues, DynamicType, Gap, GetBoxUF, GetBoxUL, GetBoxVF, GetBoxVL, HasSingularities, Init, IsDegenerated, IsUClosed, IsVClosed, NbSingularities, NextValueOfUV, ProjectDegenerated, SetDomain, Singularity, Surface, TrueAdaptor3d, UCloseVal, UIso, UVFromIso, VCloseVal, VIso, Value, ValueOfUV · *statiques :* get_type_descriptor, get_type_name
- **ShapeAnalysis_TransferParameters** ← Standard_Transient (2 ctor) : DynamicType, Init, IsSameRange, Perform, SetMaxTolerance, TransferRange · *statiques :* get_type_descriptor, get_type_name
- **ShapeAnalysis_TransferParametersProj** ← ShapeAnalysis_TransferParameters (2 ctor) : DynamicType, ForceProjection, Init, IsSameRange, Perform, TransferRange · *statiques :* CopyNMVertex, get_type_descriptor, get_type_name
- **ShapeAnalysis_Wire** ← Standard_Transient (3 ctor) : CheckClosed, CheckConnected, CheckCurveGap, CheckCurveGaps, CheckDegenerated, CheckEdgeCurves, CheckGap2d, CheckGap3d, CheckGaps2d, CheckGaps3d, CheckIntersectingEdges, CheckLacking, CheckLoop, CheckNotchedEdges, CheckOrder, CheckOuterBound, CheckSeam, CheckSelfIntersectingEdge, CheckSelfIntersection, CheckShapeConnect, CheckSmall, CheckSmallArea, CheckTail, ClearStatuses, DynamicType, Face, Init, IsLoaded, IsReady, LastCheckStatus, Load, MaxDistance2d, MaxDistance3d, MinDistance2d, MinDistance3d, NbEdges, Perform, Precision, SetFace, SetPrecision, SetSurface, StatusClosed, StatusConnected, StatusCurveGaps, StatusDegenerated, StatusEdgeCurves, StatusGaps2d, StatusGaps3d, StatusLacking, StatusLoop, StatusOrder, StatusSelfIntersection, StatusSmall, Surface, WireData · *statiques :* get_type_descriptor, get_type_name
- **ShapeAnalysis_WireOrder** (2 ctor) : Add, Chain, Clear, Couple, Gap, IsDone, KeepLoopsMode, NbChains, NbCouples, NbEdges, Ordered, Perform, SetChains, SetCouples, SetMode, Status, Tolerance, XY, XYZ
- **ShapeAnalysis_WireVertex** : Analyze, Data, Init, IsDone, Load, NbEdges, NextCriter, NextStatus, Position, Precision, SetClose, SetDisjoined, SetEnd, SetInters, SetPrecision, SetSameCoords, SetSameVertex, SetStart, Status, UFollowing, UPrevious, WireData

## ShapeBuild

- **ShapeBuild_Edge** : BuildCurve3d, Copy, CopyPCurves, CopyRanges, CopyReplaceVertices, MakeEdge, ReassignPCurve, RemoveCurve3d, RemovePCurve, ReplacePCurve, SetRange3d, TransformPCurve
- **ShapeBuild_ReShape** ← BRepTools_ReShape : Apply, DynamicType, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeBuild_Vertex** : CombineVertex

## ShapeConstruct

- **ShapeConstruct_Curve** : AdjustCurve, AdjustCurve2d, AdjustCurveSegment, ConvertToBSpline · *statiques :* FixKnots
- **ShapeConstruct_MakeTriangulation** ← BRepBuilderAPI_MakeShape (2 ctor) : Build, IsDone
- **ShapeConstruct_ProjectCurveOnSurface** ← Standard_Transient : AdjustOverDegenMode, BuildCurveMode, DynamicType, Init, Perform, PerformByProjLib, SetPrecision, SetSurface, Status · *statiques :* get_type_descriptor, get_type_name

## ShapeCustom

- **ShapeCustom_BSplineRestriction** ← ShapeCustom_Modification (3 ctor) : Continuity, ConvertCurve, ConvertCurve2d, ConvertSurface, Curve2dError, Curve3dError, DynamicType, GetRestrictionParameters, MaxErrors, ModifyApproxCurve2dFlag, ModifyApproxCurve3dFlag, ModifyApproxSurfaceFlag, NbOfSpan, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface, SetContinuity2d, SetContinuity3d, SetConvRational, SetMaxDegree, SetMaxNbSegments, SetPriority, SetRestrictionParameters, SetTol2d, SetTol3d, SurfaceError · *statiques :* get_type_descriptor, get_type_name
- **ShapeCustom_ConvertToBSpline** ← ShapeCustom_Modification : Continuity, DynamicType, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface, SetExtrusionMode, SetOffsetMode, SetPlaneMode, SetRevolutionMode · *statiques :* get_type_descriptor, get_type_name
- **ShapeCustom_ConvertToRevolution** ← ShapeCustom_Modification : Continuity, DynamicType, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface · *statiques :* get_type_descriptor, get_type_name
- **ShapeCustom_Curve** (2 ctor) : ConvertToPeriodic, Init
- **ShapeCustom_Curve2d** · *statiques :* ConvertToLine2d, IsLinear, SimplifyBSpline2d
- **ShapeCustom_DirectModification** ← ShapeCustom_Modification : Continuity, DynamicType, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface · *statiques :* get_type_descriptor, get_type_name
- **ShapeCustom_Modification** ← BRepTools_Modification : DynamicType, MsgRegistrator, SendMsg, SetMsgRegistrator · *statiques :* get_type_descriptor, get_type_name
- **ShapeCustom_RestrictionParameters** ← Standard_Transient : ConvertBezierSurf, ConvertConicalSurf, ConvertCurve2d, ConvertCurve3d, ConvertCylindricalSurf, ConvertExtrusionSurf, ConvertOffsetCurv2d, ConvertOffsetCurv3d, ConvertOffsetSurf, ConvertPlane, ConvertRevolutionSurf, ConvertSphericalSurf, ConvertToroidalSurf, DynamicType, GMaxDegree, GMaxSeg, SegmentSurfaceMode · *statiques :* get_type_descriptor, get_type_name
- **ShapeCustom_Surface** (2 ctor) : ConvertToAnalytical, ConvertToPeriodic, Gap, Init
- **ShapeCustom_SweptToElementary** ← ShapeCustom_Modification : Continuity, DynamicType, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface · *statiques :* get_type_descriptor, get_type_name
- **ShapeCustom_TrsfModification** ← BRepTools_TrsfModification : DynamicType, NewCurve, NewCurve2d, NewParameter, NewPoint, NewSurface · *statiques :* get_type_descriptor, get_type_name

## ShapeExtend

- **ShapeExtend_BasicMsgRegistrator** ← Standard_Transient : DynamicType, Send · *statiques :* get_type_descriptor, get_type_name
- **ShapeExtend_ComplexCurve** ← Geom_Curve : CheckConnectivity, Continuity, Curve, D0, D1, D2, D3, DN, DynamicType, FirstParameter, GetScaleFactor, IsCN, IsClosed, IsPeriodic, LastParameter, LocalToGlobal, LocateParameter, NbCurves, ReversedParameter, Transform · *statiques :* get_type_descriptor, get_type_name
- **ShapeExtend_CompositeSurface** ← Geom_Surface (3 ctor) : Bounds, CheckConnectivity, ComputeJointValues, Continuity, Copy, D0, D1, D2, D3, DN, DynamicType, GlobalToLocal, GlobalToLocalTransformation, Init, IsCNu, IsCNv, IsUClosed, IsUPeriodic, IsVClosed, IsVPeriodic, LocalToGlobal, LocateUParameter, LocateUVPoint, LocateVParameter, NbUPatches, NbVPatches, Patch, Patches, SetUFirstValue, SetUJointValues, SetVFirstValue, SetVJointValues, Transform, UGlobalToLocal, UIso, UJointValue, UJointValues, ULocalToGlobal, UReverse, UReversedParameter, VGlobalToLocal, VIso, VJointValue, VJointValues, VLocalToGlobal, VReverse, VReversedParameter, Value · *statiques :* get_type_descriptor, get_type_name
- **ShapeExtend_Explorer** : CompoundFromSeq, DispatchList, ListFromSeq, SeqFromCompound, SeqFromList, ShapeType, SortedCompound
- **ShapeExtend_MsgRegistrator** ← ShapeExtend_BasicMsgRegistrator : DynamicType, MapShape, MapTransient, Send · *statiques :* get_type_descriptor, get_type_name
- **ShapeExtend_Parametrisation** · *statiques :* ShapeExtend_Natural, ShapeExtend_Uniform, ShapeExtend_Unitary
- **ShapeExtend_Status** · *statiques :* ShapeExtend_DONE, ShapeExtend_DONE1, ShapeExtend_DONE2, ShapeExtend_DONE3, ShapeExtend_DONE4, ShapeExtend_DONE5, ShapeExtend_DONE6, ShapeExtend_DONE7, ShapeExtend_DONE8, ShapeExtend_FAIL, ShapeExtend_FAIL1, ShapeExtend_FAIL2, ShapeExtend_FAIL3, ShapeExtend_FAIL4, ShapeExtend_FAIL5, ShapeExtend_FAIL6, ShapeExtend_FAIL7, ShapeExtend_FAIL8, ShapeExtend_OK
- **ShapeExtend_WireData** ← Standard_Transient (2 ctor) : Add, AddOriented, Clear, ComputeSeams, DynamicType, Edge, Index, Init, IsSeam, ManifoldMode, NbEdges, NbNonManifoldEdges, NonmanifoldEdge, NonmanifoldEdges, Remove, Reverse, Set, SetDegeneratedLast, SetLast, Wire, WireAPIMake · *statiques :* get_type_descriptor, get_type_name

## ShapeFix

- **ShapeFix_ComposeShell** ← ShapeFix_Root : ClosedMode, DispatchWires, DynamicType, GetTransferParamTool, Init, Perform, Result, SetTransferParamTool, SplitEdges, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_EdgeConnect** : Add, Build, Clear
- **ShapeFix_EdgeProjAux** ← Standard_Transient (2 ctor) : Compute, DynamicType, FirstParam, Init, IsFirstDone, IsIso, IsLastDone, LastParam · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_Face** ← ShapeFix_Root (2 ctor) : Add, AutoCorrectPrecisionMode, ClearModes, DynamicType, Face, FixAddNaturalBound, FixAddNaturalBoundMode, FixIntersectingWires, FixIntersectingWiresMode, FixLoopWire, FixLoopWiresMode, FixMissingSeam, FixMissingSeamMode, FixOrientation, FixOrientationMode, FixPeriodicDegenerated, FixPeriodicDegeneratedMode, FixSmallAreaWire, FixSmallAreaWireMode, FixSplitFace, FixSplitFaceMode, FixWireMode, FixWireTool, FixWiresTwoCoincEdges, Init, Perform, RemoveSmallAreaFaceMode, Result, SetMaxTolerance, SetMinTolerance, SetMsgRegistrator, SetPrecision, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_FaceConnect** : Add, Build, Clear
- **ShapeFix_FixSmallFace** ← ShapeFix_Root : ComputeSharedEdgeForStripFace, DynamicType, FixFace, FixPinFace, FixShape, FixSplitFace, FixSpotFace, FixStripFace, Init, Perform, RemoveFacesInCaseOfSpot, RemoveFacesInCaseOfStrip, ReplaceInCaseOfStrip, ReplaceVerticesInCaseOfSpot, Shape, SplitOneFace · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_FixSmallSolid** ← ShapeFix_Root : DynamicType, Merge, Remove, SetFixMode, SetVolumeThreshold, SetWidthFactorThreshold · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_FreeBounds** (3 ctor) : GetClosedWires, GetOpenWires, GetShape
- **ShapeFix_IntersectionTool** : Context, CutEdge, FixIntersectingWires, FixSelfIntersectWire, SplitEdge
- **ShapeFix_Root** ← Standard_Transient : Context, DynamicType, LimitTolerance, MaxTolerance, MinTolerance, MsgRegistrator, Precision, SendFail, SendMsg, SendWarning, Set, SetContext, SetMaxTolerance, SetMinTolerance, SetMsgRegistrator, SetPrecision · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_Shape** ★ ← ShapeFix_Root (2 ctor) : DynamicType, FixEdgeTool, FixFaceTool, FixFreeFaceMode, FixFreeShellMode, FixFreeWireMode, FixSameParameterMode, FixShellTool, FixSolidMode, FixSolidTool, FixVertexPositionMode, FixVertexTolMode, FixWireTool, Init, Perform, SetMaxTolerance, SetMinTolerance, SetMsgRegistrator, SetPrecision, Shape, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_ShapeTolerance** : LimitTolerance, SetTolerance
- **ShapeFix_Shell** ← ShapeFix_Root (2 ctor) : DynamicType, ErrorFaces, FixFaceMode, FixFaceOrientation, FixFaceTool, FixOrientationMode, Init, NbShells, Perform, SetMaxTolerance, SetMinTolerance, SetMsgRegistrator, SetNonManifoldFlag, SetPrecision, Shape, Shell, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_Solid** ← ShapeFix_Root (2 ctor) : CreateOpenSolidMode, DynamicType, FixShellMode, FixShellOrientationMode, FixShellTool, Init, Perform, SetMaxTolerance, SetMinTolerance, SetMsgRegistrator, SetPrecision, Shape, Solid, SolidFromShell, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_SplitCommonVertex** ← ShapeFix_Root : DynamicType, Init, Perform, Shape · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_SplitTool** : CutEdge, SplitEdge
- **ShapeFix_Wire** ← ShapeFix_Root (2 ctor) : Analyzer, ClearModes, ClearStatuses, ClosedWireMode, DynamicType, Face, FixAddCurve3dMode, FixAddPCurveMode, FixClosed, FixConnected, FixConnectedMode, FixDegenerated, FixDegeneratedMode, FixEdgeCurves, FixEdgeCurvesMode, FixEdgeTool, FixGap2d, FixGap3d, FixGaps2d, FixGaps2dMode, FixGaps3d, FixGaps3dMode, FixGapsByRangesMode, FixIntersectingEdgesMode, FixLacking, FixLackingMode, FixNonAdjacentIntersectingEdgesMode, FixNotchedEdges, FixNotchedEdgesMode, FixRemoveCurve3dMode, FixRemovePCurveMode, FixReorder, FixReorderMode, FixReversed2dMode, FixSameParameterMode, FixSeam, FixSeamMode, FixSelfIntersectingEdgeMode, FixSelfIntersection, FixSelfIntersectionMode, FixShifted, FixShiftedMode, FixSmall, FixSmallMode, FixTailMode, FixTails, FixVertexToleranceMode, Init, IsLoaded, IsReady, LastFixStatus, Load, ModifyGeometryMode, ModifyRemoveLoopMode, ModifyTopologyMode, NbEdges, Perform, PreferencePCurveMode, SetFace, SetMaxTailAngle, SetMaxTailWidth, SetPrecision, SetSurface, StatusClosed, StatusConnected, StatusDegenerated, StatusEdgeCurves, StatusFixTails, StatusGaps2d, StatusGaps3d, StatusLacking, StatusNotches, StatusRemovedSegment, StatusReorder, StatusSelfIntersection, StatusSmall, Wire, WireAPIMake, WireData · *statiques :* get_type_descriptor, get_type_name
- **ShapeFix_WireVertex** : Analyzer, Fix, FixSame, Init, Wire, WireData
- **ShapeFix_Wireframe** ← ShapeFix_Root (2 ctor) : CheckSmallEdges, ClearStatuses, DynamicType, FixSmallEdges, FixWireGaps, LimitAngle, Load, MergeSmallEdges, ModeDropSmallEdges, SetLimitAngle, Shape, StatusSmallEdges, StatusWireGaps · *statiques :* get_type_descriptor, get_type_name

## ShapePersistent

- **ShapePersistent_HArray1**
- **ShapePersistent_HArray2**
- **ShapePersistent_HSequence**
- **ShapePersistent_TriangleMode** · *statiques :* ShapePersistent_WithTriangle, ShapePersistent_WithoutTriangle

## ShapeProcess

- **ShapeProcess_Context** ← Standard_Transient (2 ctor) : BooleanVal, DynamicType, GetBoolean, GetInteger, GetReal, GetString, Init, IntegerVal, IsParamSet, LoadResourceManager, Messenger, Progress, RealVal, ResourceManager, SetMessenger, SetProgress, SetScope, SetTraceLevel, StringVal, TraceLevel, UnSetScope · *statiques :* get_type_descriptor, get_type_name
- **ShapeProcess_OperLibrary** · *statiques :* ApplyModifier, Init
- **ShapeProcess_Operator** ← Standard_Transient : DynamicType, Perform · *statiques :* get_type_descriptor, get_type_name
- **ShapeProcess_ShapeContext** ← ShapeProcess_Context (2 ctor) : AddMessage, ContinuityVal, DynamicType, GetContinuity, GetDetalisation, Init, IsNonManifold, Map, Messages, PrintStatistics, RecordModification, Result, SetDetalisation, SetNonManifold, SetResult, Shape · *statiques :* get_type_descriptor, get_type_name
- **ShapeProcess_UOperator** ← ShapeProcess_Operator : DynamicType, Perform · *statiques :* get_type_descriptor, get_type_name

## ShapeProcessAPI

- **ShapeProcessAPI_ApplySequence** : ClearMap, Context, Map, PrepareShape, PrintPreparationResult

## ShapeUpgrade

- **ShapeUpgrade_ClosedEdgeDivide** ← ShapeUpgrade_EdgeDivide : Compute, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_ClosedFaceDivide** ← ShapeUpgrade_FaceDivide (2 ctor) : DynamicType, GetNbSplitPoints, SetNbSplitPoints, SplitSurface · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_ConvertCurve2dToBezier** ← ShapeUpgrade_SplitCurve2d : Build, Compute, DynamicType, SplitParams · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_ConvertCurve3dToBezier** ← ShapeUpgrade_SplitCurve3d : Build, Compute, DynamicType, GetCircleMode, GetConicMode, GetLineMode, SetCircleMode, SetConicMode, SetLineMode, SplitParams · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_ConvertSurfaceToBezierBasis** ← ShapeUpgrade_SplitSurface : Build, Compute, DynamicType, GetBSplineMode, GetExtrusionMode, GetPlaneMode, GetRevolutionMode, Segments, SetBSplineMode, SetExtrusionMode, SetPlaneMode, SetRevolutionMode · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_EdgeDivide** ← ShapeUpgrade_Tool : Clear, Compute, DynamicType, GetSplitCurve2dTool, GetSplitCurve3dTool, HasCurve2d, HasCurve3d, Knots2d, Knots3d, SetFace, SetSplitCurve2dTool, SetSplitCurve3dTool · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_FaceDivide** ← ShapeUpgrade_Tool (2 ctor) : DynamicType, GetSplitSurfaceTool, GetWireDivideTool, Init, Perform, Result, SetSplitSurfaceTool, SetSurfaceSegmentMode, SetWireDivideTool, SplitCurves, SplitSurface, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_FaceDivideArea** ← ShapeUpgrade_FaceDivide (2 ctor) : DynamicType, MaxArea, Perform · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_FixSmallBezierCurves** ← ShapeUpgrade_FixSmallCurves : Approx, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_FixSmallCurves** ← ShapeUpgrade_Tool : Approx, DynamicType, Init, SetSplitCurve2dTool, SetSplitCurve3dTool, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_RemoveInternalWires** ← ShapeUpgrade_Tool (2 ctor) : DynamicType, GetResult, Init, MinArea, Perform, RemoveFaceMode, RemovedFaces, RemovedWires, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_RemoveLocations** ← Standard_Transient : DynamicType, GetResult, ModifiedShape, Remove, RemoveLevel, SetRemoveLevel · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_ShapeConvertToBezier** ← ShapeUpgrade_ShapeDivide (2 ctor) : Get2dConversion, Get3dCircleConversion, Get3dConicConversion, Get3dConversion, Get3dLineConversion, GetBSplineMode, GetExtrusionMode, GetPlaneMode, GetRevolutionMode, GetSurfaceConversion, Perform, Set2dConversion, Set3dCircleConversion, Set3dConicConversion, Set3dConversion, Set3dLineConversion, SetBSplineMode, SetExtrusionMode, SetPlaneMode, SetRevolutionMode, SetSurfaceConversion
- **ShapeUpgrade_ShapeDivide** (2 ctor) : GetContext, Init, MsgRegistrator, Perform, Result, SendMsg, SetContext, SetEdgeMode, SetMaxTolerance, SetMinTolerance, SetMsgRegistrator, SetPrecision, SetSplitFaceTool, SetSurfaceSegmentMode, Status
- **ShapeUpgrade_ShapeDivideAngle** ← ShapeUpgrade_ShapeDivide (2 ctor) : InitTool, MaxAngle, SetMaxAngle
- **ShapeUpgrade_ShapeDivideArea** ← ShapeUpgrade_ShapeDivide (2 ctor) : MaxArea
- **ShapeUpgrade_ShapeDivideClosed** ← ShapeUpgrade_ShapeDivide : SetNbSplitPoints
- **ShapeUpgrade_ShapeDivideClosedEdges** ← ShapeUpgrade_ShapeDivide : SetNbSplitPoints
- **ShapeUpgrade_ShapeDivideContinuity** ← ShapeUpgrade_ShapeDivide (2 ctor) : SetBoundaryCriterion, SetPCurveCriterion, SetSurfaceCriterion, SetTolerance, SetTolerance2d
- **ShapeUpgrade_ShellSewing** : ApplySewing
- **ShapeUpgrade_SplitCurve** ← Standard_Transient : Build, Compute, DynamicType, Init, Perform, SetSplitValues, SplitValues, Status · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_SplitCurve2d** ← ShapeUpgrade_SplitCurve : Build, DynamicType, GetCurves, Init · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_SplitCurve2dContinuity** ← ShapeUpgrade_SplitCurve2d : Compute, DynamicType, SetCriterion, SetTolerance · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_SplitCurve3d** ← ShapeUpgrade_SplitCurve : Build, DynamicType, GetCurves, Init · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_SplitCurve3dContinuity** ← ShapeUpgrade_SplitCurve3d : Compute, DynamicType, GetCurve, SetCriterion, SetTolerance · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_SplitSurface** ← Standard_Transient : Build, Compute, DynamicType, Init, Perform, ResSurfaces, SetUSplitValues, SetVSplitValues, Status, USplitValues, VSplitValues · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_SplitSurfaceAngle** ← ShapeUpgrade_SplitSurface : Compute, DynamicType, MaxAngle, SetMaxAngle · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_SplitSurfaceArea** ← ShapeUpgrade_SplitSurface : Compute, DynamicType, NbParts · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_SplitSurfaceContinuity** ← ShapeUpgrade_SplitSurface : Compute, DynamicType, SetCriterion, SetTolerance · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_Tool** ← Standard_Transient : Context, DynamicType, LimitTolerance, MaxTolerance, MinTolerance, Precision, Set, SetContext, SetMaxTolerance, SetMinTolerance, SetPrecision · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_UnifySameDomain** ★ ← Standard_Transient (2 ctor) : AllowInternalEdges, Build, DynamicType, History, Initialize, KeepShape, KeepShapes, SetAngularTolerance, SetLinearTolerance, SetSafeInputMode, Shape · *statiques :* get_type_descriptor, get_type_name
- **ShapeUpgrade_WireDivide** ← ShapeUpgrade_Tool : DynamicType, GetEdgeDivideTool, GetFixSmallCurveTool, GetTransferParamTool, Init, Load, Perform, SetEdgeDivideTool, SetEdgeMode, SetFace, SetFixSmallCurveTool, SetSplitCurve2dTool, SetSplitCurve3dTool, SetSurface, SetTransferParamTool, Status, Wire · *statiques :* get_type_descriptor, get_type_name

## Standard

- **Standard_AbortiveTransaction** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_ArrayStreamBuffer**
- **Standard_CLocaleSentry** · *statiques :* GetCLocale
- **Standard_Condition** : Check, CheckReset, Reset, Set, Wait
- **Standard_ConstructionError** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_DimensionError** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_DimensionMismatch** ← Standard_DimensionError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_DivideByZero** ← Standard_NumericError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_DomainError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_Dump** · *statiques :* AddValuesSeparator, DumpCharacterValues, DumpFieldToName, DumpKeyToClass, DumpRealValues, FormatJson, GetPointerInfo, GetPointerPrefix, Text
- **Standard_DumpSentry**
- **Standard_Failure** ← Standard_Transient (3 ctor) : DynamicType, GetMessageString, Jump, Print, Reraise, SetMessageString · *statiques :* Caught, NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_GUID** (6 ctor) : Assign, Hash, IsNotSame, IsSame, ShallowDump, ToCString, ToExtString, ToUUID · *statiques :* CheckGUIDFormat, HashCode, IsEqual
- **Standard_HandlerStatus** · *statiques :* Standard_HandlerJumped, Standard_HandlerProcessed, Standard_HandlerVoid
- **Standard_ImmutableObject** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_LicenseError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_LicenseNotFound** ← Standard_LicenseError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_MMgrOpt** ← Standard_MMgrRoot : Allocate, Free, Purge, Reallocate · *statiques :* SetCallBackFunction
- **Standard_MMgrRaw** ← Standard_MMgrRoot : Allocate, Free, Reallocate
- **Standard_MMgrRoot** : Allocate, Free, Purge, Reallocate
- **Standard_MMgrTBBalloc** ← Standard_MMgrRoot : Allocate, Free, Reallocate
- **Standard_MultiplyDefined** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_Mutex**
- **Standard_NegativeValue** ← Standard_RangeError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_NoMoreObject** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_NoSuchObject** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_NotImplemented** ← Standard_ProgramError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_NullObject** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_NullValue** ← Standard_RangeError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_NumericError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_OutOfMemory** ← Standard_ProgramError : DynamicType, GetMessageString, SetMessageString · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_OutOfRange** ← Standard_RangeError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_Overflow** ← Standard_NumericError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_Persistent** ← Standard_Transient : DynamicType, TypeNum · *statiques :* get_type_descriptor, get_type_name
- **Standard_ProgramError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_RangeError** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_ReadBuffer** : Init, IsDone
- **Standard_ReadLineBuffer** : Clear
- **Standard_TooManyUsers** ← Standard_LicenseError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_Transient** (2 ctor) : DecrementRefCounter, Delete, DynamicType, GetRefCount, IncrementRefCounter, IsInstance, IsKind, This · *statiques :* get_type_descriptor, get_type_name
- **Standard_Type** ← Standard_Transient : DynamicType, Name, Parent, Print, Size, SubType, SystemName · *statiques :* Register, get_type_descriptor, get_type_name
- **Standard_TypeMismatch** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Standard_Underflow** ← Standard_NumericError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name

## StdDrivers

- **StdDrivers_DocumentRetrievalDriver** ← StdLDrivers_DocumentRetrievalDriver : DynamicType · *statiques :* get_type_descriptor, get_type_name

## StdFail

- **StdFail_InfiniteSolutions** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **StdFail_NotDone** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **StdFail_Undefined** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **StdFail_UndefinedDerivative** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **StdFail_UndefinedValue** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name

## StdLDrivers

- **StdLDrivers_DocumentRetrievalDriver** ← PCDM_RetrievalDriver : CreateDocument, DynamicType, Read · *statiques :* get_type_descriptor, get_type_name

## StdLPersistent

- **StdLPersistent_Collection**
- **StdLPersistent_Data** ← StdObjMgt_Persistent : Import, PChildren, PName, Read, Write
- **StdLPersistent_Dependency**
- **StdLPersistent_Document** ← StdObjMgt_Persistent : ImportDocument, PChildren, PName, Read, Write
- **StdLPersistent_Function**
- **StdLPersistent_HArray1**
- **StdLPersistent_HArray2**
- **StdLPersistent_HString**
- **StdLPersistent_NamedData**
- **StdLPersistent_Real**
- **StdLPersistent_TreeNode**
- **StdLPersistent_Value**
- **StdLPersistent_Variable**
- **StdLPersistent_Void**
- **StdLPersistent_XLink**

## StdObject

- **StdObject_Location** : Import, PChildren · *statiques :* Translate
- **StdObject_Shape** : Import, PChildren

## StdObjMgt

- **StdObjMgt_MapOfInstantiators**
- **StdObjMgt_Persistent** ← Standard_Transient : AsciiString, CreateAttribute, ExtString, GetAttribute, ImportAttribute, ImportDocument, Label, PChildren, PName, Read, RefNum, TypeNum, Write
- **StdObjMgt_ReadData** : PersistentObject, ReadPersistentObject, ReadReference
- **StdObjMgt_SharedObject**
- **StdObjMgt_WriteData** : WritePersistentObject

## StdPersistent

- **StdPersistent_DataXtd**
- **StdPersistent_DataXtd_Constraint**
- **StdPersistent_DataXtd_PatternStd**
- **StdPersistent_HArray1**
- **StdPersistent_Naming**
- **StdPersistent_PPrsStd**
- **StdPersistent_TopoDS**

## StdPrs

- **StdPrs_BndBox** ← Prs3d_Root · *statiques :* Add, FillSegments, fillSegments
- **StdPrs_Curve** ← Prs3d_Root · *statiques :* Add, Match
- **StdPrs_DeflectionCurve** ← Prs3d_Root · *statiques :* Add, Match
- **StdPrs_HLRPolyShape** ← Prs3d_Root · *statiques :* Add
- **StdPrs_HLRShape** ← Prs3d_Root · *statiques :* Add
- **StdPrs_HLRToolShape** : Hidden, InitHidden, InitVisible, MoreHidden, MoreVisible, NbEdges, NextHidden, NextVisible, Visible
- **StdPrs_Isolines** ← Prs3d_Root · *statiques :* Add, AddOnSurface, AddOnTriangulation, UVIsoParameters
- **StdPrs_Plane** ← Prs3d_Root · *statiques :* Add, Match
- **StdPrs_PoleCurve** ← Prs3d_Root · *statiques :* Add, Match, Pick
- **StdPrs_ShadedShape** ← Prs3d_Root · *statiques :* Add, AddWireframeForFacesWithoutTriangles, AddWireframeForFreeElements, ExploreSolids, FillFaceBoundaries, FillTriangles
- **StdPrs_ShadedSurface** ← Prs3d_Root · *statiques :* Add
- **StdPrs_ToolPoint** · *statiques :* Coord
- **StdPrs_ToolRFace** (2 ctor) : Init, IsInvalidGeometry, IsOriented, More, Next, Orientation, Value
- **StdPrs_ToolTriangulatedShape** · *statiques :* ClearOnOwnDeflectionChange, ComputeNormals, IsClosed, IsTessellated, IsTriangulated, Normal, Tessellate
- **StdPrs_ToolVertex** · *statiques :* Coord
- **StdPrs_Volume** · *statiques :* StdPrs_Volume_Autodetection, StdPrs_Volume_Closed, StdPrs_Volume_Opened
- **StdPrs_WFDeflectionRestrictedFace** ← Prs3d_Root · *statiques :* Add, AddUIso, AddVIso, Match, MatchUIso, MatchVIso
- **StdPrs_WFDeflectionSurface** ← Prs3d_Root · *statiques :* Add
- **StdPrs_WFPoleSurface** ← Prs3d_Root · *statiques :* Add
- **StdPrs_WFRestrictedFace** ← Prs3d_Root · *statiques :* Add, AddUIso, AddVIso, Match, MatchUIso, MatchVIso
- **StdPrs_WFShape** ← Prs3d_Root · *statiques :* Add, AddAllEdges, AddEdgesOnTriangulation, AddVertexes
- **StdPrs_WFSurface** ← Prs3d_Root · *statiques :* Add

## StdSelect

- **StdSelect_BRepOwner** ← SelectMgr_EntityOwner (3 ctor) : Clear, DynamicType, HasHilightMode, HasShape, HilightMode, HilightWithColor, IsHilighted, ResetHilightMode, SetHilightMode, SetLocation, Shape, Unhilight, UpdateHighlightTrsf · *statiques :* get_type_descriptor, get_type_name
- **StdSelect_BRepSelectionTool** · *statiques :* ComputeSensitive, GetEdgeSensitive, GetSensitiveForFace, GetStandardPriority, Load, PreBuildBVH
- **StdSelect_DisplayMode** · *statiques :* StdSelect_DM_HLR, StdSelect_DM_Shading, StdSelect_DM_Wireframe
- **StdSelect_EdgeFilter** ← SelectMgr_Filter : ActsOn, DynamicType, IsOk, SetType, Type · *statiques :* get_type_descriptor, get_type_name
- **StdSelect_FaceFilter** ← SelectMgr_Filter : ActsOn, DynamicType, IsOk, SetType, Type · *statiques :* get_type_descriptor, get_type_name
- **StdSelect_Prs** ← Graphic3d_Structure : DynamicType, Manager · *statiques :* get_type_descriptor, get_type_name
- **StdSelect_SensitivityMode** · *statiques :* StdSelect_SM_VIEW, StdSelect_SM_WINDOW
- **StdSelect_Shape** ← PrsMgr_PresentableObject : Compute, DynamicType, Shape · *statiques :* get_type_descriptor, get_type_name
- **StdSelect_ShapeTypeFilter** ← SelectMgr_Filter : ActsOn, DynamicType, IsOk, Type · *statiques :* get_type_descriptor, get_type_name
- **StdSelect_TypeOfEdge** · *statiques :* StdSelect_AnyEdge, StdSelect_Circle, StdSelect_Line
- **StdSelect_TypeOfFace** · *statiques :* StdSelect_AnyFace, StdSelect_Cone, StdSelect_Cylinder, StdSelect_Plane, StdSelect_Revol, StdSelect_Sphere, StdSelect_Torus
- **StdSelect_TypeOfResult** · *statiques :* StdSelect_TOR_MULTIPLE, StdSelect_TOR_SIMPLE
- **StdSelect_TypeOfSelectionImage** · *statiques :* StdSelect_TypeOfSelectionImage_ColoredDetectedObject, StdSelect_TypeOfSelectionImage_ColoredEntity, StdSelect_TypeOfSelectionImage_ColoredOwner, StdSelect_TypeOfSelectionImage_ColoredSelectionMode, StdSelect_TypeOfSelectionImage_NormalizedDepth, StdSelect_TypeOfSelectionImage_NormalizedDepthInverted, StdSelect_TypeOfSelectionImage_UnnormalizedDepth
- **StdSelect_ViewerSelector3d** ← SelectMgr_ViewerSelector : ClearSensitive, DisplaySensitive, DynamicType, Pick, PixelTolerance, SetPixelTolerance, ToPixMap · *statiques :* get_type_descriptor, get_type_name

## StdStorage

- **StdStorage_Bucket** (2 ctor) : Clear
- **StdStorage_BucketIterator** : Init, More, Next, Reset, Value
- **StdStorage_BucketOfPersistent** : Append, Clear, Length, Value
- **StdStorage_Data** ← Standard_Transient : Clear, HeaderData, RootData, TypeData
- **StdStorage_HeaderData** ← Standard_Transient : AddToComments, AddToUserInfo, ApplicationName, ApplicationVersion, ClearErrorStatus, Comments, CreationDate, DataType, DynamicType, ErrorStatus, ErrorStatusExtension, NumberOfObjects, Read, SchemaVersion, SetApplicationName, SetApplicationVersion, SetCreationDate, SetDataType, SetNumberOfObjects, SetSchemaName, SetSchemaVersion, SetStorageVersion, StorageVersion, UserInfo, Write · *statiques :* get_type_descriptor, get_type_name
- **StdStorage_Root** ← Standard_Transient (2 ctor) : DynamicType, Name, Object, Reference, SetName, SetObject, SetType, Type · *statiques :* get_type_descriptor, get_type_name
- **StdStorage_RootData** ← Standard_Transient : AddRoot, Clear, ClearErrorStatus, DynamicType, ErrorStatus, ErrorStatusExtension, Find, IsRoot, NumberOfRoots, Read, RemoveRoot, Roots, Write · *statiques :* get_type_descriptor, get_type_name
- **StdStorage_TypeData** ← Standard_Transient : AddType, Clear, ClearErrorStatus, DynamicType, ErrorStatus, ErrorStatusExtension, Instantiator, IsType, NumberOfTypes, Read, Type, Types, Write · *statiques :* get_type_descriptor, get_type_name

## StepAP203

- **StepAP203_ApprovedItem** ← StepData_SelectType : CaseNum, Certification, Change, ChangeRequest, ConfigurationEffectivity, ConfigurationItem, Contract, ProductDefinition, ProductDefinitionFormation, SecurityClassification, StartRequest, StartWork
- **StepAP203_Array1OfApprovedItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_Array1OfCertifiedItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_Array1OfChangeRequestItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_Array1OfClassifiedItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_Array1OfContractedItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_Array1OfDateTimeItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_Array1OfPersonOrganizationItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_Array1OfSpecifiedItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_Array1OfStartRequestItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_Array1OfWorkItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP203_CcDesignApproval** ← StepBasic_ApprovalAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_CcDesignCertification** ← StepBasic_CertificationAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_CcDesignContract** ← StepBasic_ContractAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_CcDesignDateAndTimeAssignment** ← StepBasic_DateAndTimeAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_CcDesignPersonAndOrganizationAssignment** ← StepBasic_PersonAndOrganizationAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_CcDesignSecurityClassification** ← StepBasic_SecurityClassificationAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_CcDesignSpecificationReference** ← StepBasic_DocumentReference : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_CertifiedItem** ← StepData_SelectType : CaseNum, SuppliedPartRelationship
- **StepAP203_Change** ← StepBasic_ActionAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_ChangeRequest** ← StepBasic_ActionRequestAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_ChangeRequestItem** ← StepData_SelectType : CaseNum, ProductDefinitionFormation
- **StepAP203_ClassifiedItem** ← StepData_SelectType : AssemblyComponentUsage, CaseNum, ProductDefinitionFormation
- **StepAP203_ContractedItem** ← StepData_SelectType : CaseNum, ProductDefinitionFormation
- **StepAP203_DateTimeItem** ← StepData_SelectType : ApprovalPersonOrganization, CaseNum, Certification, Change, ChangeRequest, Contract, ProductDefinition, SecurityClassification, StartRequest, StartWork
- **StepAP203_PersonOrganizationItem** ← StepData_SelectType : CaseNum, Change, ChangeRequest, ConfigurationItem, Contract, Product, ProductDefinition, ProductDefinitionFormation, SecurityClassification, StartRequest, StartWork
- **StepAP203_SpecifiedItem** ← StepData_SelectType : CaseNum, ProductDefinition, ShapeAspect
- **StepAP203_StartRequest** ← StepBasic_ActionRequestAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_StartRequestItem** ← StepData_SelectType : CaseNum, ProductDefinitionFormation
- **StepAP203_StartWork** ← StepBasic_ActionAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP203_WorkItem** ← StepData_SelectType : CaseNum, ProductDefinitionFormation

## StepAP209

- **StepAP209_Construct** ← STEPConstruct_Tool (2 ctor) : CreateAP203Structure, CreateAdding203Entities, CreateAddingEntities, CreateAnalysStructure, CreateFeaStructure, FeaModel, GetCurElemSection, GetElemGeomRelat, GetElementMaterial, GetElements1D, GetElements2D, GetElements3D, GetFeaAxis2Placement3d, GetShReprForElem, IdealShape, Init, IsAnalys, IsDesing, NominShape, ReplaceCcDesingToApplied

## StepAP214

- **StepAP214_AppliedApprovalAssignment** ← StepBasic_ApprovalAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AppliedDateAndTimeAssignment** ← StepBasic_DateAndTimeAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AppliedDateAssignment** ← StepBasic_DateAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AppliedDocumentReference** ← StepBasic_DocumentReference : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AppliedExternalIdentificationAssignment** ← StepBasic_ExternalIdentificationAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AppliedGroupAssignment** ← StepBasic_GroupAssignment : DynamicType, Init, Items, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AppliedOrganizationAssignment** ← StepBasic_OrganizationAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AppliedPersonAndOrganizationAssignment** ← StepBasic_PersonAndOrganizationAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AppliedPresentedItem** ← StepVisual_PresentedItem : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AppliedSecurityClassificationAssignment** ← StepBasic_SecurityClassificationAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_ApprovalItem** ← StepData_SelectType : AssemblyComponentUsageSubstitute, CaseNum, ConfigurationItem, Date, Document, DocumentFile, Effectivity, Group, GroupRelationship, MaterialDesignation, MechanicalDesignGeometricPresentationRepresentation, PresentationArea, Product, ProductDefinition, ProductDefinitionFormation, ProductDefinitionFormationRelationship, ProductDefinitionRelationship, PropertyDefinition, Representation, SecurityClassification, ShapeAspectRelationship, ShapeRepresentation
- **StepAP214_Array1OfApprovalItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfAutoDesignDateAndPersonItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfAutoDesignDateAndTimeItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfAutoDesignDatedItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfAutoDesignGeneralOrgItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfAutoDesignGroupedItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfAutoDesignPresentedItemSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfAutoDesignReferencingItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfDateAndTimeItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfDateItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfDocumentReferenceItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfExternalIdentificationItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfGroupItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfOrganizationItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfPersonAndOrganizationItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfPresentedItemSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_Array1OfSecurityClassificationItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepAP214_AutoDesignActualDateAndTimeAssignment** ← StepBasic_DateAndTimeAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignActualDateAssignment** ← StepBasic_DateAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignApprovalAssignment** ← StepBasic_ApprovalAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignDateAndPersonAssignment** ← StepBasic_PersonAndOrganizationAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignDateAndPersonItem** ← StepData_SelectType : AutoDesignDocumentReference, AutoDesignOrganizationAssignment, CaseNum, ExternallyDefinedRepresentation, Product, ProductDefinition, ProductDefinitionFormation, ProductDefinitionRelationship, ProductDefinitionWithAssociatedDocuments, Representation
- **StepAP214_AutoDesignDateAndTimeItem** ← StepData_SelectType : ApprovalPersonOrganization, AutoDesignDateAndPersonAssignment, CaseNum, ProductDefinitionEffectivity
- **StepAP214_AutoDesignDatedItem** ← StepData_SelectType : ApprovalPersonOrganization, AutoDesignDateAndPersonAssignment, CaseNum, ProductDefinitionEffectivity
- **StepAP214_AutoDesignDocumentReference** ← StepBasic_DocumentReference : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignGeneralOrgItem** ← StepData_SelectType : AutoDesignDocumentReference, CaseNum, ExternallyDefinedRepresentation, Product, ProductDefinition, ProductDefinitionFormation, ProductDefinitionRelationship, ProductDefinitionWithAssociatedDocuments, Representation
- **StepAP214_AutoDesignGroupAssignment** ← StepBasic_GroupAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignGroupedItem** ← StepData_SelectType : AdvancedBrepShapeRepresentation, CaseNum, CsgShapeRepresentation, FacetedBrepShapeRepresentation, GeometricallyBoundedSurfaceShapeRepresentation, GeometricallyBoundedWireframeShapeRepresentation, ManifoldSurfaceShapeRepresentation, Representation, RepresentationItem, ShapeAspect, ShapeRepresentation, TemplateInstance
- **StepAP214_AutoDesignNominalDateAndTimeAssignment** ← StepBasic_DateAndTimeAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignNominalDateAssignment** ← StepBasic_DateAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignOrganizationAssignment** ← StepBasic_OrganizationAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignOrganizationItem** ← StepAP214_AutoDesignGeneralOrgItem : CaseNum, Document, PhysicallyModeledProductDefinition
- **StepAP214_AutoDesignPersonAndOrganizationAssignment** ← StepBasic_PersonAndOrganizationAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignPresentedItem** ← StepVisual_PresentedItem : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_AutoDesignPresentedItemSelect** ← StepData_SelectType : CaseNum, DocumentRelationship, ProductDefinition, ProductDefinitionRelationship, ProductDefinitionShape, RepresentationRelationship, ShapeAspect
- **StepAP214_AutoDesignReferencingItem** ← StepData_SelectType : Approval, CaseNum, DocumentRelationship, ExternallyDefinedRepresentation, MappedItem, MaterialDesignation, PresentationArea, PresentationView, ProductCategory, ProductDefinition, ProductDefinitionRelationship, PropertyDefinition, Representation, RepresentationRelationship, ShapeAspect
- **StepAP214_AutoDesignSecurityClassificationAssignment** ← StepBasic_SecurityClassificationAssignment : DynamicType, Init, Items, ItemsValue, NbItems, SetItems · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_Class** ← StepBasic_Group : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_DateAndTimeItem** ← StepAP214_ApprovalItem : AppliedOrganizationAssignment, AppliedPersonAndOrganizationAssignment, ApprovalPersonOrganization, CaseNum
- **StepAP214_DateItem** ← StepAP214_ApprovalItem : AppliedOrganizationAssignment, AppliedPersonAndOrganizationAssignment, AppliedSecurityClassificationAssignment, ApprovalPersonOrganization, CaseNum
- **StepAP214_DocumentReferenceItem** ← StepData_SelectType : AppliedExternalIdentificationAssignment, Approval, AssemblyComponentUsage, CaseNum, CharacterizedObject, DescriptiveRepresentationItem, DimensionalSize, ExternallyDefinedItem, Group, GroupRelationship, MaterialDesignation, MeasureRepresentationItem, ProductCategory, ProductDefinition, ProductDefinitionContext, ProductDefinitionRelationship, PropertyDefinition, Representation, RepresentationItem, ShapeAspect, ShapeAspectRelationship
- **StepAP214_ExternalIdentificationItem** ← StepData_SelectType : AppliedOrganizationAssignment, AppliedPersonAndOrganizationAssignment, Approval, ApprovalStatus, CaseNum, DateAndTimeAssignment, DateAssignment, DocumentFile, ExternalSource, ExternallyDefinedClass, ExternallyDefinedGeneralProperty, OrganizationalAddress, ProductDefinition, SecurityClassification, TrimmedCurve, VersionedActionRequest
- **StepAP214_ExternallyDefinedClass** ← StepAP214_Class : DynamicType, ExternallyDefinedItem, Init, SetExternallyDefinedItem · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_ExternallyDefinedGeneralProperty** ← StepBasic_GeneralProperty : DynamicType, ExternallyDefinedItem, Init, SetExternallyDefinedItem · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_GroupItem** ← StepData_SelectType : CaseNum, GeometricRepresentationItem, GroupRelationship, MappedItem, ProductDefinition, ProductDefinitionFormation, PropertyDefinitionRepresentation, Representation, RepresentationItem, RepresentationRelationshipWithTransformation, ShapeAspect, ShapeAspectRelationship, ShapeRepresentationRelationship, StyledItem, TopologicalRepresentationItem
- **StepAP214_OrganizationItem** ← StepAP214_ApprovalItem : AppliedOrganizationAssignment, AppliedSecurityClassificationAssignment, Approval, CaseNum
- **StepAP214_PersonAndOrganizationItem** ← StepAP214_ApprovalItem : AppliedOrganizationAssignment, AppliedSecurityClassificationAssignment, Approval, CaseNum
- **StepAP214_PresentedItemSelect** ← StepData_SelectType : CaseNum, ProductDefinition, ProductDefinitionRelationship
- **StepAP214_Protocol** ← StepData_Protocol : DynamicType, NbResources, Resource, SchemaName, TypeNumber · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_RepItemGroup** ← StepBasic_Group : DynamicType, Init, RepresentationItem, SetRepresentationItem · *statiques :* get_type_descriptor, get_type_name
- **StepAP214_SecurityClassificationItem** ← StepAP214_ApprovalItem : Action, AssemblyComponentUsage, CaseNum, ConfigurationDesign, ConfigurationEffectivity, DraughtingModel, GeneralProperty, MakeFromUsageOption, ProductConcept, ProductDefinitionUsage, VersionedActionRequest

## StepAP242

- **StepAP242_DraughtingModelItemAssociation** ← StepAP242_ItemIdentifiedRepresentationUsage : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepAP242_GeometricItemSpecificUsage** ← StepAP242_ItemIdentifiedRepresentationUsage : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepAP242_IdAttribute** ← Standard_Transient : AttributeValue, DynamicType, IdentifiedItem, Init, SetAttributeValue, SetIdentifiedItem · *statiques :* get_type_descriptor, get_type_name
- **StepAP242_IdAttributeSelect** ← StepData_SelectType : Action, Address, ApplicationContext, CaseNum, DimensionalSize, GeometricTolerance, Group, ProductCategory, PropertyDefinition, Representation, ShapeAspect, ShapeAspectRelationship
- **StepAP242_ItemIdentifiedRepresentationUsage** ← Standard_Transient : Definition, Description, DynamicType, IdentifiedItem, IdentifiedItemValue, Init, Name, NbIdentifiedItem, SetDefinition, SetDescription, SetIdentifiedItem, SetIdentifiedItemValue, SetName, SetUsedRepresentation, UsedRepresentation · *statiques :* get_type_descriptor, get_type_name
- **StepAP242_ItemIdentifiedRepresentationUsageDefinition** ← StepData_SelectType : AppliedApprovalAssignment, AppliedDateAndTimeAssignment, AppliedDateAssignment, AppliedDocumentReference, AppliedExternalIdentificationAssignment, AppliedGroupAssignment, AppliedOrganizationAssignment, AppliedPersonAndOrganizationAssignment, AppliedSecurityClassificationAssignment, CaseNum, DimensionalSize, GeneralProperty, GeometricTolerance, ProductDefinitionRelationship, PropertyDefinition, PropertyDefinitionRelationship, ShapeAspect, ShapeAspectRelationship

## StepBasic

- **StepBasic_Action** ← Standard_Transient : ChosenMethod, Description, DynamicType, HasDescription, Init, Name, SetChosenMethod, SetDescription, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ActionAssignment** ← Standard_Transient : AssignedAction, DynamicType, Init, SetAssignedAction · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ActionMethod** ← Standard_Transient : Consequence, Description, DynamicType, HasDescription, Init, Name, Purpose, SetConsequence, SetDescription, SetName, SetPurpose · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ActionRequestAssignment** ← Standard_Transient : AssignedActionRequest, DynamicType, Init, SetAssignedActionRequest · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ActionRequestSolution** ← Standard_Transient : DynamicType, Init, Method, Request, SetMethod, SetRequest · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Address** ← Standard_Transient : Country, DynamicType, ElectronicMailAddress, FacsimileNumber, HasCountry, HasElectronicMailAddress, HasFacsimileNumber, HasInternalLocation, HasPostalBox, HasPostalCode, HasRegion, HasStreet, HasStreetNumber, HasTelephoneNumber, HasTelexNumber, HasTown, Init, InternalLocation, PostalBox, PostalCode, Region, SetCountry, SetElectronicMailAddress, SetFacsimileNumber, SetInternalLocation, SetPostalBox, SetPostalCode, SetRegion, SetStreet, SetStreetNumber, SetTelephoneNumber, SetTelexNumber, SetTown, Street, StreetNumber, TelephoneNumber, TelexNumber, Town, UnSetCountry, UnSetElectronicMailAddress, UnSetFacsimileNumber, UnSetInternalLocation, UnSetPostalBox, UnSetPostalCode, UnSetRegion, UnSetStreet, UnSetStreetNumber, UnSetTelephoneNumber, UnSetTelexNumber, UnSetTown · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_AheadOrBehind** · *statiques :* StepBasic_aobAhead, StepBasic_aobBehind, StepBasic_aobExact
- **StepBasic_ApplicationContext** ← Standard_Transient : Application, DynamicType, Init, SetApplication · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ApplicationContextElement** ← Standard_Transient : DynamicType, FrameOfReference, Init, Name, SetFrameOfReference, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ApplicationProtocolDefinition** ← Standard_Transient : Application, ApplicationInterpretedModelSchemaName, ApplicationProtocolYear, DynamicType, Init, SetApplication, SetApplicationInterpretedModelSchemaName, SetApplicationProtocolYear, SetStatus, Status · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Approval** ← Standard_Transient : DynamicType, Init, Level, SetLevel, SetStatus, Status · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ApprovalAssignment** ← Standard_Transient : AssignedApproval, DynamicType, Init, SetAssignedApproval · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ApprovalDateTime** ← Standard_Transient : DateTime, DatedApproval, DynamicType, Init, SetDateTime, SetDatedApproval · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ApprovalPersonOrganization** ← Standard_Transient : AuthorizedApproval, DynamicType, Init, PersonOrganization, Role, SetAuthorizedApproval, SetPersonOrganization, SetRole · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ApprovalRelationship** ← Standard_Transient : Description, DynamicType, Init, Name, RelatedApproval, RelatingApproval, SetDescription, SetName, SetRelatedApproval, SetRelatingApproval · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ApprovalRole** ← Standard_Transient : DynamicType, Init, Role, SetRole · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ApprovalStatus** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_AreaUnit** ← StepBasic_NamedUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Array1OfApproval** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_Array1OfDerivedUnitElement** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_Array1OfDocument** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_Array1OfNamedUnit** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_Array1OfOrganization** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_Array1OfPerson** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_Array1OfProduct** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_Array1OfProductContext** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_Array1OfProductDefinition** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_Array1OfUncertaintyMeasureWithUnit** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepBasic_CalendarDate** ← StepBasic_Date : DayComponent, DynamicType, Init, MonthComponent, SetDayComponent, SetMonthComponent · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Certification** ← Standard_Transient : DynamicType, Init, Kind, Name, Purpose, SetKind, SetName, SetPurpose · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_CertificationAssignment** ← Standard_Transient : AssignedCertification, DynamicType, Init, SetAssignedCertification · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_CertificationType** ← Standard_Transient : Description, DynamicType, Init, SetDescription · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_CharacterizedObject** ← Standard_Transient : Description, DynamicType, HasDescription, Init, Name, SetDescription, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Contract** ← Standard_Transient : DynamicType, Init, Kind, Name, Purpose, SetKind, SetName, SetPurpose · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ContractAssignment** ← Standard_Transient : AssignedContract, DynamicType, Init, SetAssignedContract · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ContractType** ← Standard_Transient : Description, DynamicType, Init, SetDescription · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ConversionBasedUnit** ← StepBasic_NamedUnit : ConversionFactor, DynamicType, Init, Name, SetConversionFactor, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ConversionBasedUnitAndAreaUnit** ← StepBasic_ConversionBasedUnit : AreaUnit, DynamicType, SetAreaUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ConversionBasedUnitAndLengthUnit** ← StepBasic_ConversionBasedUnit : DynamicType, Init, LengthUnit, SetLengthUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ConversionBasedUnitAndMassUnit** ← StepBasic_ConversionBasedUnit : DynamicType, Init, MassUnit, SetMassUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ConversionBasedUnitAndPlaneAngleUnit** ← StepBasic_ConversionBasedUnit : DynamicType, Init, PlaneAngleUnit, SetPlaneAngleUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ConversionBasedUnitAndRatioUnit** ← StepBasic_ConversionBasedUnit : DynamicType, Init, RatioUnit, SetRatioUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ConversionBasedUnitAndSolidAngleUnit** ← StepBasic_ConversionBasedUnit : DynamicType, Init, SetSolidAngleUnit, SolidAngleUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ConversionBasedUnitAndTimeUnit** ← StepBasic_ConversionBasedUnit : DynamicType, Init, SetTimeUnit, TimeUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ConversionBasedUnitAndVolumeUnit** ← StepBasic_ConversionBasedUnit : DynamicType, SetVolumeUnit, VolumeUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_CoordinatedUniversalTimeOffset** ← Standard_Transient : DynamicType, HasMinuteOffset, HourOffset, Init, MinuteOffset, Sense, SetHourOffset, SetMinuteOffset, SetSense, UnSetMinuteOffset · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Date** ← Standard_Transient : DynamicType, Init, SetYearComponent, YearComponent · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DateAndTime** ← Standard_Transient : DateComponent, DynamicType, Init, SetDateComponent, SetTimeComponent, TimeComponent · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DateAndTimeAssignment** ← Standard_Transient : AssignedDateAndTime, DynamicType, Init, Role, SetAssignedDateAndTime, SetRole · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DateAssignment** ← Standard_Transient : AssignedDate, DynamicType, Init, Role, SetAssignedDate, SetRole · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DateRole** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DateTimeRole** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DateTimeSelect** ← StepData_SelectType : CaseNum, Date, DateAndTime, LocalTime
- **StepBasic_DerivedUnit** ← Standard_Transient : DynamicType, Elements, ElementsValue, Init, NbElements, SetElements · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DerivedUnitElement** ← Standard_Transient : DynamicType, Exponent, Init, SetExponent, SetUnit, Unit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DesignContext** ← StepBasic_ProductDefinitionContext : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DigitalDocument** ← StepBasic_Document : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DimensionalExponents** ← Standard_Transient : AmountOfSubstanceExponent, DynamicType, ElectricCurrentExponent, Init, LengthExponent, LuminousIntensityExponent, MassExponent, SetAmountOfSubstanceExponent, SetElectricCurrentExponent, SetLengthExponent, SetLuminousIntensityExponent, SetMassExponent, SetThermodynamicTemperatureExponent, SetTimeExponent, ThermodynamicTemperatureExponent, TimeExponent · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Document** ← Standard_Transient : Description, DynamicType, HasDescription, Id, Init, Kind, Name, SetDescription, SetId, SetKind, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DocumentFile** ← StepBasic_Document : CharacterizedObject, DynamicType, Init, SetCharacterizedObject · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DocumentProductAssociation** ← Standard_Transient : Description, DynamicType, HasDescription, Init, Name, RelatedProduct, RelatingDocument, SetDescription, SetName, SetRelatedProduct, SetRelatingDocument · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DocumentProductEquivalence** ← StepBasic_DocumentProductAssociation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DocumentReference** ← Standard_Transient : AssignedDocument, DynamicType, Init0, SetAssignedDocument, SetSource, Source · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DocumentRelationship** ← Standard_Transient : Description, DynamicType, Init, Name, RelatedDocument, RelatingDocument, SetDescription, SetName, SetRelatedDocument, SetRelatingDocument · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DocumentRepresentationType** ← Standard_Transient : DynamicType, Init, Name, RepresentedDocument, SetName, SetRepresentedDocument · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DocumentType** ← Standard_Transient : DynamicType, Init, ProductDataType, SetProductDataType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_DocumentUsageConstraint** ← Standard_Transient : DynamicType, Init, SetSource, SetSubjectElement, SetSubjectElementValue, Source, SubjectElement, SubjectElementValue · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Effectivity** ← Standard_Transient : DynamicType, Id, Init, SetId · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_EffectivityAssignment** ← Standard_Transient : AssignedEffectivity, DynamicType, Init, SetAssignedEffectivity · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_EulerAngles** ← Standard_Transient : Angles, DynamicType, Init, SetAngles · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ExternalIdentificationAssignment** ← StepBasic_IdentificationAssignment : DynamicType, Init, SetSource, Source · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ExternalSource** ← Standard_Transient : DynamicType, Init, SetSourceId, SourceId · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ExternallyDefinedItem** ← Standard_Transient : DynamicType, Init, ItemId, SetItemId, SetSource, Source · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_GeneralProperty** ← Standard_Transient : Description, DynamicType, HasDescription, Id, Init, Name, SetDescription, SetId, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Group** ← Standard_Transient : Description, DynamicType, HasDescription, Init, Name, SetDescription, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_GroupAssignment** ← Standard_Transient : AssignedGroup, DynamicType, Init, SetAssignedGroup · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_GroupRelationship** ← Standard_Transient : Description, DynamicType, HasDescription, Init, Name, RelatedGroup, RelatingGroup, SetDescription, SetName, SetRelatedGroup, SetRelatingGroup · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_IdentificationAssignment** ← Standard_Transient : AssignedId, DynamicType, Init, Role, SetAssignedId, SetRole · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_IdentificationRole** ← Standard_Transient : Description, DynamicType, HasDescription, Init, Name, SetDescription, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_LengthMeasureWithUnit** ← StepBasic_MeasureWithUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_LengthUnit** ← StepBasic_NamedUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_LocalTime** ← Standard_Transient : DynamicType, HasMinuteComponent, HasSecondComponent, HourComponent, Init, MinuteComponent, SecondComponent, SetHourComponent, SetMinuteComponent, SetSecondComponent, SetZone, UnSetMinuteComponent, UnSetSecondComponent, Zone · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_MassMeasureWithUnit** ← StepBasic_MeasureWithUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_MassUnit** ← StepBasic_NamedUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_MeasureValueMember** ← StepData_SelectReal : DynamicType, HasName, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_MeasureWithUnit** ← Standard_Transient : DynamicType, Init, SetUnitComponent, SetValueComponent, SetValueComponentMember, UnitComponent, ValueComponent, ValueComponentMember · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_MechanicalContext** ← StepBasic_ProductContext : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_NameAssignment** ← Standard_Transient : AssignedName, DynamicType, Init, SetAssignedName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_NamedUnit** ← Standard_Transient : Dimensions, DynamicType, Init, SetDimensions · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ObjectRole** ← Standard_Transient : Description, DynamicType, HasDescription, Init, Name, SetDescription, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_OrdinalDate** ← StepBasic_Date : DayComponent, DynamicType, Init, SetDayComponent · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Organization** ← Standard_Transient : Description, DynamicType, HasId, Id, Init, Name, SetDescription, SetId, SetName, UnSetId · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_OrganizationAssignment** ← Standard_Transient : AssignedOrganization, DynamicType, Init, Role, SetAssignedOrganization, SetRole · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_OrganizationRole** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_OrganizationalAddress** ← StepBasic_Address : Description, DynamicType, Init, NbOrganizations, Organizations, OrganizationsValue, SetDescription, SetOrganizations · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Person** ← Standard_Transient : DynamicType, FirstName, HasFirstName, HasLastName, HasMiddleNames, HasPrefixTitles, HasSuffixTitles, Id, Init, LastName, MiddleNames, MiddleNamesValue, NbMiddleNames, NbPrefixTitles, NbSuffixTitles, PrefixTitles, PrefixTitlesValue, SetFirstName, SetId, SetLastName, SetMiddleNames, SetPrefixTitles, SetSuffixTitles, SuffixTitles, SuffixTitlesValue, UnSetFirstName, UnSetLastName, UnSetMiddleNames, UnSetPrefixTitles, UnSetSuffixTitles · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_PersonAndOrganization** ← Standard_Transient : DynamicType, Init, SetTheOrganization, SetThePerson, TheOrganization, ThePerson · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_PersonAndOrganizationAssignment** ← Standard_Transient : AssignedPersonAndOrganization, DynamicType, Init, Role, SetAssignedPersonAndOrganization, SetRole · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_PersonAndOrganizationRole** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_PersonOrganizationSelect** ← StepData_SelectType : CaseNum, Organization, Person, PersonAndOrganization
- **StepBasic_PersonalAddress** ← StepBasic_Address : Description, DynamicType, Init, NbPeople, People, PeopleValue, SetDescription, SetPeople · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_PhysicallyModeledProductDefinition** ← StepBasic_ProductDefinition : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_PlaneAngleMeasureWithUnit** ← StepBasic_MeasureWithUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_PlaneAngleUnit** ← StepBasic_NamedUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Product** ← Standard_Transient : Description, DynamicType, FrameOfReference, FrameOfReferenceValue, Id, Init, Name, NbFrameOfReference, SetDescription, SetFrameOfReference, SetId, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductCategory** ← Standard_Transient : Description, DynamicType, HasDescription, Init, Name, SetDescription, SetName, UnSetDescription · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductCategoryRelationship** ← Standard_Transient : Category, Description, DynamicType, HasDescription, Init, Name, SetCategory, SetDescription, SetName, SetSubCategory, SubCategory · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductConceptContext** ← StepBasic_ApplicationContextElement : DynamicType, Init, MarketSegmentType, SetMarketSegmentType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductContext** ← StepBasic_ApplicationContextElement : DisciplineType, DynamicType, Init, SetDisciplineType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinition** ← Standard_Transient : Description, DynamicType, Formation, FrameOfReference, Id, Init, SetDescription, SetFormation, SetFrameOfReference, SetId · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinitionContext** ← StepBasic_ApplicationContextElement : DynamicType, Init, LifeCycleStage, SetLifeCycleStage · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinitionEffectivity** ← StepBasic_Effectivity : DynamicType, Init, SetUsage, Usage · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinitionFormation** ← Standard_Transient : Description, DynamicType, Id, Init, OfProduct, SetDescription, SetId, SetOfProduct · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinitionFormationRelationship** ← Standard_Transient : Description, DynamicType, Id, Init, Name, RelatedProductDefinitionFormation, RelatingProductDefinitionFormation, SetDescription, SetId, SetName, SetRelatedProductDefinitionFormation, SetRelatingProductDefinitionFormation · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinitionFormationWithSpecifiedSource** ← StepBasic_ProductDefinitionFormation : DynamicType, Init, MakeOrBuy, SetMakeOrBuy · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinitionOrReference** ← StepData_SelectType : CaseNum, ProductDefinition, ProductDefinitionReference, ProductDefinitionReferenceWithLocalRepresentation
- **StepBasic_ProductDefinitionReference** ← Standard_Transient : DynamicType, HasIdOwningOrganizationName, IdOwningOrganizationName, Init, ProductDefinitionFormationId, ProductDefinitionId, ProductId, SetIdOwningOrganizationName, SetProductDefinitionFormationId, SetProductDefinitionId, SetProductId, SetSource, Source · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinitionReferenceWithLocalRepresentation** ← StepBasic_ProductDefinition : DynamicType, Init, SetSource, Source · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinitionRelationship** ← Standard_Transient : Description, DynamicType, HasDescription, Id, Init, Name, RelatedProductDefinition, RelatedProductDefinitionAP242, RelatingProductDefinition, RelatingProductDefinitionAP242, SetDescription, SetId, SetName, SetRelatedProductDefinition, SetRelatingProductDefinition · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductDefinitionWithAssociatedDocuments** ← StepBasic_ProductDefinition : DocIds, DocIdsValue, DynamicType, Init, NbDocIds, SetDocIds, SetDocIdsValue · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductOrFormationOrDefinition** ← StepData_SelectType : CaseNum, Product, ProductDefinition, ProductDefinitionFormation
- **StepBasic_ProductRelatedProductCategory** ← StepBasic_ProductCategory : DynamicType, Init, NbProducts, Products, ProductsValue, SetProducts · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_ProductType** ← StepBasic_ProductRelatedProductCategory : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_RatioMeasureWithUnit** ← StepBasic_MeasureWithUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_RatioUnit** ← StepBasic_NamedUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_RoleAssociation** ← Standard_Transient : DynamicType, Init, ItemWithRole, Role, SetItemWithRole, SetRole · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_RoleSelect** ← StepData_SelectType : ActionAssignment, ActionRequestAssignment, ApprovalAssignment, ApprovalDateTime, CaseNum, CertificationAssignment, ContractAssignment, DocumentReference, EffectivityAssignment, GroupAssignment, NameAssignment, SecurityClassificationAssignment
- **StepBasic_SecurityClassification** ← Standard_Transient : DynamicType, Init, Name, Purpose, SecurityLevel, SetName, SetPurpose, SetSecurityLevel · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SecurityClassificationAssignment** ← Standard_Transient : AssignedSecurityClassification, DynamicType, Init, SetAssignedSecurityClassification · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SecurityClassificationLevel** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiPrefix** · *statiques :* StepBasic_spAtto, StepBasic_spCenti, StepBasic_spDeca, StepBasic_spDeci, StepBasic_spExa, StepBasic_spFemto, StepBasic_spGiga, StepBasic_spHecto, StepBasic_spKilo, StepBasic_spMega, StepBasic_spMicro, StepBasic_spMilli, StepBasic_spNano, StepBasic_spPeta, StepBasic_spPico, StepBasic_spTera
- **StepBasic_SiUnit** ← StepBasic_NamedUnit : Dimensions, DynamicType, HasPrefix, Init, Name, Prefix, SetDimensions, SetName, SetPrefix, UnSetPrefix · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitAndAreaUnit** ← StepBasic_SiUnit : AreaUnit, DynamicType, SetAreaUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitAndLengthUnit** ← StepBasic_SiUnit : DynamicType, LengthUnit, SetLengthUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitAndMassUnit** ← StepBasic_SiUnit : DynamicType, MassUnit, SetMassUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitAndPlaneAngleUnit** ← StepBasic_SiUnit : DynamicType, PlaneAngleUnit, SetPlaneAngleUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitAndRatioUnit** ← StepBasic_SiUnit : DynamicType, RatioUnit, SetRatioUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitAndSolidAngleUnit** ← StepBasic_SiUnit : DynamicType, SetSolidAngleUnit, SolidAngleUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitAndThermodynamicTemperatureUnit** ← StepBasic_SiUnit : DynamicType, SetThermodynamicTemperatureUnit, ThermodynamicTemperatureUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitAndTimeUnit** ← StepBasic_SiUnit : DynamicType, SetTimeUnit, TimeUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitAndVolumeUnit** ← StepBasic_SiUnit : DynamicType, SetVolumeUnit, VolumeUnit · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SiUnitName** · *statiques :* StepBasic_sunAmpere, StepBasic_sunBecquerel, StepBasic_sunCandela, StepBasic_sunCoulomb, StepBasic_sunDegreeCelsius, StepBasic_sunFarad, StepBasic_sunGram, StepBasic_sunGray, StepBasic_sunHenry, StepBasic_sunHertz, StepBasic_sunJoule, StepBasic_sunKelvin, StepBasic_sunLumen, StepBasic_sunLux, StepBasic_sunMetre, StepBasic_sunMole, StepBasic_sunNewton, StepBasic_sunOhm, StepBasic_sunPascal, StepBasic_sunRadian, StepBasic_sunSecond, StepBasic_sunSiemens, StepBasic_sunSievert, StepBasic_sunSteradian, StepBasic_sunTesla, StepBasic_sunVolt, StepBasic_sunWatt, StepBasic_sunWeber
- **StepBasic_SizeMember** ← StepData_SelectReal : DynamicType, HasName, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SizeSelect** ← StepData_SelectType : CaseMem, CaseNum, NewMember, RealValue, SetRealValue
- **StepBasic_SolidAngleMeasureWithUnit** ← StepBasic_MeasureWithUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_SolidAngleUnit** ← StepBasic_NamedUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Source** · *statiques :* StepBasic_sBought, StepBasic_sMade, StepBasic_sNotKnown
- **StepBasic_SourceItem** ← StepData_SelectType : CaseNum, Identifier, NewMember
- **StepBasic_ThermodynamicTemperatureUnit** ← StepBasic_NamedUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_TimeMeasureWithUnit** ← StepBasic_MeasureWithUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_TimeUnit** ← StepBasic_NamedUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_UncertaintyMeasureWithUnit** ← StepBasic_MeasureWithUnit : Description, DynamicType, Init, Name, SetDescription, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_Unit** ← StepData_SelectType : CaseNum, DerivedUnit, NamedUnit
- **StepBasic_VersionedActionRequest** ← Standard_Transient : Description, DynamicType, HasDescription, Id, Init, Purpose, SetDescription, SetId, SetPurpose, SetVersion, Version · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_VolumeUnit** ← StepBasic_NamedUnit : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepBasic_WeekOfYearAndDayDate** ← StepBasic_Date : DayComponent, DynamicType, HasDayComponent, Init, SetDayComponent, SetWeekComponent, UnSetDayComponent, WeekComponent · *statiques :* get_type_descriptor, get_type_name

## STEPCAFControl

- **STEPCAFControl_ActorWrite** ← STEPControl_ActorWrite : ClearMap, DynamicType, IsAssembly, RegisterAssembly, SetStdMode · *statiques :* get_type_descriptor, get_type_name
- **STEPCAFControl_Controller** ← STEPControl_Controller : DynamicType · *statiques :* Init, get_type_descriptor, get_type_name
- **STEPCAFControl_ExternFile** ← Standard_Transient : DynamicType, GetLabel, GetLoadStatus, GetName, GetTransferStatus, GetWS, GetWriteStatus, SetLabel, SetLoadStatus, SetName, SetTransferStatus, SetWS, SetWriteStatus · *statiques :* get_type_descriptor, get_type_name
- **STEPCAFControl_GDTProperty** · *statiques :* GetDatumRefModifiers, GetDatumTargetName, GetDatumTargetType, GetDimClassOfTolerance, GetDimModifierName, GetDimModifiers, GetDimQualifierName, GetDimQualifierType, GetDimType, GetDimTypeName, GetGeomTolerance, GetGeomToleranceModifier, GetGeomToleranceType, GetLimitsAndFits, GetTessellation, GetTolValueType, IsDimensionalLocation, IsDimensionalSize
- **STEPCAFControl_Reader** (2 ctor) : ChangeReader, ExternFile, ExternFiles, GetColorMode, GetGDTMode, GetLayerMode, GetMatMode, GetNameMode, GetPropsMode, GetSHUOMode, GetViewMode, Init, NbRootsForTransfer, Perform, ReadFile, Reader, SetColorMode, SetGDTMode, SetLayerMode, SetMatMode, SetNameMode, SetPropsMode, SetSHUOMode, SetSourceCodePage, SetViewMode, SourceCodePage, Transfer, TransferOneRoot · *statiques :* FindInstance
- **STEPCAFControl_Writer** (2 ctor) : ChangeWriter, ExternFile, ExternFiles, GetColorMode, GetDimTolMode, GetLayerMode, GetMaterialMode, GetNameMode, GetPropsMode, GetSHUOMode, Init, Perform, SetColorMode, SetDimTolMode, SetLayerMode, SetMaterialMode, SetNameMode, SetPropsMode, SetSHUOMode, Transfer, Write, Writer

## STEPConstruct

- **STEPConstruct_AP203Context** : Clear, DefaultApproval, DefaultDateAndTime, DefaultPersonAndOrganization, DefaultSecurityClassificationLevel, GetApproval, GetApprovalDateTime, GetApprover, GetClassificationDate, GetClassificationOfficer, GetCreationDate, GetCreator, GetDesignOwner, GetDesignSupplier, GetProductCategoryRelationship, GetSecurity, Init, InitApprovalRequisites, InitAssembly, InitRoles, InitSecurityRequisites, RoleApprover, RoleClassificationDate, RoleClassificationOfficer, RoleCreationDate, RoleCreator, RoleDesignOwner, RoleDesignSupplier, SetDefaultApproval, SetDefaultDateAndTime, SetDefaultPersonAndOrganization, SetDefaultSecurityClassificationLevel
- **STEPConstruct_Assembly** : GetNAUO, Init, ItemLocation, ItemValue, MakeRelationship · *statiques :* CheckSRRReversesNAUO
- **STEPConstruct_ContextTool** (2 ctor) : AP203Context, AddAPD, GetACname, GetACschemaName, GetACstatus, GetACyear, GetAPD, GetDefaultAxis, GetProductName, GetRootsForAssemblyLink, GetRootsForPart, Index, IsAP203, IsAP214, IsAP242, Level, NextIndex, NextLevel, PrevIndex, PrevLevel, SetACname, SetACschemaName, SetACstatus, SetACyear, SetIndex, SetLevel, SetModel
- **STEPConstruct_ExternRefs** ← STEPConstruct_Tool (2 ctor) : AddExternRef, Clear, FileName, Format, GetAP214APD, Init, LoadExternRefs, NbExternRefs, ProdDef, SetAP214APD, WriteExternRefs, checkAP214Shared
- **STEPConstruct_Part** : AC, ACapplication, IsDone, MakeSDR, PC, PCdisciplineType, PCname, PD, PDC, PDCname, PDCstage, PDF, PDFdescription, PDFid, PDS, PDSdescription, PDSname, PDdescription, PRPC, PRPCdescription, PRPCname, Pdescription, Pid, Pname, Product, ReadSDR, SDRValue, SRValue, SetACapplication, SetPCdisciplineType, SetPCname, SetPDCname, SetPDCstage, SetPDFdescription, SetPDFid, SetPDSdescription, SetPDSname, SetPDdescription, SetPRPCdescription, SetPRPCname, SetPdescription, SetPid, SetPname
- **STEPConstruct_PointHasher** · *statiques :* HashCode, IsEqual
- **STEPConstruct_Styles** ← STEPConstruct_Tool (2 ctor) : AddStyle, ClearStyles, CreateMDGPR, CreateNAUOSRD, FindContext, GetColorPSA, GetColors, Init, LoadInvisStyles, LoadStyles, MakeColorPSA, NbStyles, Style · *statiques :* DecodeColor, EncodeColor
- **STEPConstruct_Tool** (2 ctor) : FinderProcess, Graph, Model, TransientProcess, WS
- **STEPConstruct_UnitContext** : AreaDone, AreaFactor, ComputeFactors, ComputeTolerance, HasUncertainty, Init, IsDone, LengthDone, LengthFactor, PlaneAngleDone, PlaneAngleFactor, SolidAngleDone, SolidAngleFactor, StatusMessage, Uncertainty, Value, VolumeDone, VolumeFactor · *statiques :* ConvertSiPrefix
- **STEPConstruct_ValidationProps** ← STEPConstruct_Tool (2 ctor) : AddArea, AddCentroid, AddProp, AddVolume, FindTarget, GetPropNAUO, GetPropPD, GetPropPnt, GetPropReal, GetPropShape, Init, LoadProps, SetAssemblyShape

## STEPControl

- **STEPControl_ActorRead** ← Transfer_ActorOfTransientProcess : ComputeSRRWT, ComputeTransformation, DynamicType, PrepareUnits, Recognize, ResetUnits, Transfer, TransferShape · *statiques :* get_type_descriptor, get_type_name
- **STEPControl_ActorWrite** ← Transfer_ActorOfFinderProcess : DynamicType, GroupMode, IsAssembly, Mode, Recognize, SetGroupMode, SetMode, SetTolerance, Transfer, TransferCompound, TransferShape, TransferSubShape · *statiques :* get_type_descriptor, get_type_name
- **STEPControl_Controller** ← XSControl_Controller : Customise, DynamicType, NewModel, TransferWriteShape · *statiques :* Init, get_type_descriptor, get_type_name
- **STEPControl_Reader** ★ ← XSControl_Reader (2 ctor) : FileUnits, NbRootsForTransfer, StepModel, TransferRoot
- **STEPControl_StepModelType** ★ · *statiques :* STEPControl_AsIs, STEPControl_BrepWithVoids, STEPControl_FacetedBrep, STEPControl_FacetedBrepAndBrepWithVoids, STEPControl_GeometricCurveSet, STEPControl_Hybrid, STEPControl_ManifoldSolidBrep, STEPControl_ShellBasedSurfaceModel
- **STEPControl_Writer** ★ (2 ctor) : Model, PrintStatsTransfer, SetTolerance, SetWS, Transfer, UnsetTolerance, WS, Write

## StepData

- **StepData_Array1OfField** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepData_Described** ← Standard_Transient : As, CField, Check, Description, DynamicType, Field, HasField, IsComplex, Matches, Shared · *statiques :* get_type_descriptor, get_type_name
- **StepData_ECDescr** ← StepData_EDescr : Add, DynamicType, IsComplex, Matches, Member, NbMembers, NewEntity, TypeList · *statiques :* get_type_descriptor, get_type_name
- **StepData_EDescr** ← Standard_Transient : DynamicType, IsComplex, Matches, NewEntity · *statiques :* get_type_descriptor, get_type_name
- **StepData_ESDescr** ← StepData_EDescr : Base, DynamicType, Field, IsComplex, IsSub, Matches, Name, NamedField, NbFields, NewEntity, Rank, SetBase, SetField, SetNbFields, SetSuper, StepType, Super, TypeName · *statiques :* get_type_descriptor, get_type_name
- **StepData_EnumTool** : AddDefinition, IsSet, MaxValue, NullValue, Optional, Text, Value
- **StepData_Field** (2 ctor) : Arity, Boolean, Clear, ClearItem, CopyFrom, Entity, Enum, EnumText, Int, Integer, IsSet, ItemKind, Kind, Length, Logical, Lower, Real, Set, SetBoolean, SetDerived, SetEntity, SetEnum, SetInt, SetInteger, SetList, SetList2, SetLogical, SetReal, SetSelectMember, SetString, String, Transient
- **StepData_FieldList** : CField, Field, FillShared, NbFields
- **StepData_FieldList1** ← StepData_FieldList : CField, Field, NbFields
- **StepData_FieldListD** ← StepData_FieldList : CField, Field, NbFields, SetNb
- **StepData_FieldListN** ← StepData_FieldList : CField, Field, NbFields
- **StepData_FileProtocol** ← StepData_Protocol : Add, DynamicType, GlobalCheck, NbResources, Resource, SchemaName, TypeNumber · *statiques :* get_type_descriptor, get_type_name
- **StepData_FileRecognizer** ← Standard_Transient : Add, DynamicType, Evaluate, Result · *statiques :* get_type_descriptor, get_type_name
- **StepData_GlobalNodeOfWriterLib** ← Standard_Transient : Add, DynamicType, Module, Next, Protocol · *statiques :* get_type_descriptor, get_type_name
- **StepData_Logical** · *statiques :* StepData_LFalse, StepData_LTrue, StepData_LUnknown
- **StepData_NodeOfWriterLib** ← Standard_Transient : AddNode, DynamicType, Module, Next, Protocol · *statiques :* get_type_descriptor, get_type_name
- **StepData_PDescr** ← Standard_Transient : AddArity, AddEnumDef, AddMember, Arity, Check, DescrName, DynamicType, EnumMax, EnumText, EnumValue, FieldName, FieldRank, IsBoolean, IsDerived, IsDescr, IsEntity, IsEnum, IsField, IsInteger, IsLogical, IsOptional, IsReal, IsSelect, IsString, IsType, Member, Name, SetArity, SetBoolean, SetDerived, SetDescr, SetEnum, SetField, SetFrom, SetInteger, SetLogical, SetMemberName, SetName, SetOptional, SetReal, SetSelect, SetString, SetType, Simple, Type · *statiques :* get_type_descriptor, get_type_name
- **StepData_Plex** ← StepData_Described : Add, As, CField, Check, DynamicType, ECDescr, Field, HasField, IsComplex, Matches, Member, NbMembers, Shared, TypeList · *statiques :* get_type_descriptor, get_type_name
- **StepData_Protocol** ← Interface_Protocol : AddBasicDescr, AddDescr, AddPDescr, BasicDescr, CaseNumber, Descr, DescrNumber, DynamicType, ECDescr, ESDescr, HasDescr, IsSuitableModel, IsUnknownEntity, NbResources, NewModel, PDescr, Resource, SchemaName, TypeNumber, UnknownEntity · *statiques :* get_type_descriptor, get_type_name
- **StepData_ReadWriteModule** ← Interface_ReaderModule : CaseNum, CaseStep, ComplexType, DynamicType, IsComplex, Read, ReadStep, ShortType, StepType, WriteStep · *statiques :* get_type_descriptor, get_type_name
- **StepData_SelectArrReal** ← StepData_SelectNamed : ArrReal, DynamicType, Kind, SetArrReal · *statiques :* get_type_descriptor, get_type_name
- **StepData_SelectInt** ← StepData_SelectMember : DynamicType, Int, Kind, SetInt, SetKind · *statiques :* get_type_descriptor, get_type_name
- **StepData_SelectMember** ← Standard_Transient : Boolean, DynamicType, Enum, EnumText, HasName, Int, Integer, Kind, Logical, Matches, Name, ParamType, Real, SetBoolean, SetEnum, SetEnumText, SetInt, SetInteger, SetKind, SetLogical, SetName, SetReal, SetString, String · *statiques :* get_type_descriptor, get_type_name
- **StepData_SelectNamed** ← StepData_SelectMember : CField, DynamicType, Field, HasName, Int, Kind, Name, Real, SetInt, SetKind, SetName, SetReal, SetString, String · *statiques :* get_type_descriptor, get_type_name
- **StepData_SelectReal** ← StepData_SelectMember : DynamicType, Kind, Real, SetReal · *statiques :* get_type_descriptor, get_type_name
- **StepData_SelectType** : Boolean, CaseMem, CaseMember, CaseNum, CaseNumber, Description, Int, Integer, IsNull, Logical, Matches, Member, NewMember, Nullify, Real, SelectName, SetBoolean, SetInt, SetInteger, SetLogical, SetReal, SetValue, Type, Value
- **StepData_Simple** ← StepData_Described : As, CField, CFieldNum, CFields, Check, DynamicType, ESDescr, Field, FieldNum, Fields, HasField, IsComplex, Matches, NbFields, Shared, StepType · *statiques :* get_type_descriptor, get_type_name
- **StepData_StepDumper** : Dump, StepWriter
- **StepData_StepModel** ← Interface_InterfaceModel : AddHeaderEntity, ClearHeader, ClearLabels, DumpHeader, DynamicType, Entity, GetFromAnother, HasHeaderEntity, Header, HeaderEntity, IdentLabel, NewEmptyModel, PrintLabel, SetIdentLabel, StringLabel, VerifyCheck · *statiques :* get_type_descriptor, get_type_name
- **StepData_StepReaderData**
- **StepData_StepReaderTool** ← Interface_FileReaderTool : AnalyseRecord, BeginRead, EndRead, Prepare, PrepareHeader, Recognize
- **StepData_StepWriter** : AddParam, CheckList, CloseSub, Comment, EndComplex, EndEntity, EndFile, EndSec, FloatWriter, Indent, IsInScope, JoinLast, LabelMode, Line, NbLines, NewLine, OpenSub, OpenTypedSub, Print, Send, SendArrReal, SendBoolean, SendComment, SendData, SendDerived, SendEndscope, SendEntity, SendEnum, SendField, SendHeader, SendIdent, SendList, SendLogical, SendModel, SendScope, SendSelect, SendString, SendUndef, SetScope, StartComplex, StartEntity, TypeMode
- **StepData_WriterLib** (2 ctor) : AddProtocol, Clear, Module, More, Next, Protocol, Select, SetComplete, Start · *statiques :* SetGlobal

## StepDimTol

- **StepDimTol_AngularityTolerance** ← StepDimTol_GeometricToleranceWithDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_AreaUnitType** · *statiques :* StepDimTol_Circular, StepDimTol_Rectangular, StepDimTol_Square
- **StepDimTol_Array1OfDatumReference** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepDimTol_Array1OfDatumReferenceCompartment** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepDimTol_Array1OfDatumReferenceElement** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepDimTol_Array1OfDatumReferenceModifier** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepDimTol_Array1OfDatumSystemOrReference** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepDimTol_Array1OfGeometricToleranceModifier** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepDimTol_Array1OfToleranceZoneTarget** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepDimTol_CircularRunoutTolerance** ← StepDimTol_GeometricToleranceWithDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_CoaxialityTolerance** ← StepDimTol_GeometricToleranceWithDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_CommonDatum** ← StepRepr_CompositeShapeAspect : Datum, DynamicType, Init, SetDatum · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_ConcentricityTolerance** ← StepDimTol_GeometricToleranceWithDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_CylindricityTolerance** ← StepDimTol_GeometricTolerance : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_Datum** ← StepRepr_ShapeAspect : DynamicType, Identification, Init, SetIdentification · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_DatumFeature** ← StepRepr_ShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_DatumOrCommonDatum** ← StepData_SelectType : CaseNum, CommonDatumList, Datum
- **StepDimTol_DatumReference** ← Standard_Transient : DynamicType, Init, Precedence, ReferencedDatum, SetPrecedence, SetReferencedDatum · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_DatumReferenceCompartment** ← StepDimTol_GeneralDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_DatumReferenceElement** ← StepDimTol_GeneralDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_DatumReferenceModifier** ← StepData_SelectType : CaseNum, DatumReferenceModifierWithValue, SimpleDatumReferenceModifierMember
- **StepDimTol_DatumReferenceModifierType** · *statiques :* StepDimTol_CircularOrCylindrical, StepDimTol_Distance, StepDimTol_Projected, StepDimTol_Spherical
- **StepDimTol_DatumReferenceModifierWithValue** ← Standard_Transient : DynamicType, Init, ModifierType, ModifierValue, SetModifierType, SetModifierValue · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_DatumSystem** ← StepRepr_ShapeAspect : Constituents, ConstituentsValue, DynamicType, Init, NbConstituents, SetConstituents · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_DatumSystemOrReference** ← StepData_SelectType : CaseNum, DatumReference, DatumSystem
- **StepDimTol_DatumTarget** ← StepRepr_ShapeAspect : DynamicType, Init, SetTargetId, TargetId · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_FlatnessTolerance** ← StepDimTol_GeometricTolerance : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeneralDatumReference** ← StepRepr_ShapeAspect : Base, DynamicType, HasModifiers, Init, Modifiers, ModifiersValue, NbModifiers, SetBase, SetModifiers · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeoTolAndGeoTolWthDatRef** ← StepDimTol_GeometricTolerance : DynamicType, GetGeometricToleranceWithDatumReference, GetToleranceType, Init, SetGeometricToleranceType, SetGeometricToleranceWithDatumReference · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeoTolAndGeoTolWthDatRefAndGeoTolWthMaxTol** ← StepDimTol_GeoTolAndGeoTolWthDatRefAndGeoTolWthMod : DynamicType, GetMaxTolerance, Init, SetMaxTolerance · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeoTolAndGeoTolWthDatRefAndGeoTolWthMod** ← StepDimTol_GeometricTolerance : DynamicType, GetGeometricToleranceWithDatumReference, GetGeometricToleranceWithModifiers, GetToleranceType, Init, SetGeometricToleranceType, SetGeometricToleranceWithDatumReference, SetGeometricToleranceWithModifiers · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeoTolAndGeoTolWthDatRefAndModGeoTolAndPosTol** ← StepDimTol_GeometricTolerance : DynamicType, GetGeometricToleranceWithDatumReference, GetModifiedGeometricTolerance, GetPositionTolerance, Init, SetGeometricToleranceWithDatumReference, SetModifiedGeometricTolerance, SetPositionTolerance · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeoTolAndGeoTolWthDatRefAndUneqDisGeoTol** ← StepDimTol_GeoTolAndGeoTolWthDatRef : DynamicType, GetUnequallyDisposedGeometricTolerance, Init, SetUnequallyDisposedGeometricTolerance · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeoTolAndGeoTolWthMaxTol** ← StepDimTol_GeoTolAndGeoTolWthMod : DynamicType, GetMaxTolerance, Init, SetMaxTolerance · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeoTolAndGeoTolWthMod** ← StepDimTol_GeometricTolerance : DynamicType, GetGeometricToleranceWithModifiers, GetToleranceType, Init, SetGeometricToleranceType, SetGeometricToleranceWithModifiers · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeometricTolerance** ← Standard_Transient : Description, DynamicType, Init, Magnitude, Name, SetDescription, SetMagnitude, SetName, SetTolerancedShapeAspect, TolerancedShapeAspect · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeometricToleranceModifier** · *statiques :* StepDimTol_GTMAnyCrossSection, StepDimTol_GTMCommonZone, StepDimTol_GTMEachRadialElement, StepDimTol_GTMFreeState, StepDimTol_GTMLeastMaterialRequirement, StepDimTol_GTMLineElement, StepDimTol_GTMMajorDiameter, StepDimTol_GTMMaximumMaterialRequirement, StepDimTol_GTMMinorDiameter, StepDimTol_GTMNotConvex, StepDimTol_GTMPitchDiameter, StepDimTol_GTMReciprocityRequirement, StepDimTol_GTMSeparateRequirement, StepDimTol_GTMStatisticalTolerance, StepDimTol_GTMTangentPlane
- **StepDimTol_GeometricToleranceRelationship** ← Standard_Transient : Description, DynamicType, Init, Name, RelatedGeometricTolerance, RelatingGeometricTolerance, SetDescription, SetName, SetRelatedGeometricTolerance, SetRelatingGeometricTolerance · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeometricToleranceTarget** ← StepData_SelectType : CaseNum, DimensionalLocation, DimensionalSize, ProductDefinitionShape, ShapeAspect
- **StepDimTol_GeometricToleranceType** · *statiques :* StepDimTol_GTTAngularityTolerance, StepDimTol_GTTCircularRunoutTolerance, StepDimTol_GTTCoaxialityTolerance, StepDimTol_GTTConcentricityTolerance, StepDimTol_GTTCylindricityTolerance, StepDimTol_GTTFlatnessTolerance, StepDimTol_GTTLineProfileTolerance, StepDimTol_GTTParallelismTolerance, StepDimTol_GTTPerpendicularityTolerance, StepDimTol_GTTPositionTolerance, StepDimTol_GTTRoundnessTolerance, StepDimTol_GTTStraightnessTolerance, StepDimTol_GTTSurfaceProfileTolerance, StepDimTol_GTTSymmetryTolerance, StepDimTol_GTTTotalRunoutTolerance
- **StepDimTol_GeometricToleranceWithDatumReference** ← StepDimTol_GeometricTolerance : DatumSystem, DatumSystemAP242, DynamicType, Init, SetDatumSystem · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeometricToleranceWithDefinedAreaUnit** ← StepDimTol_GeometricToleranceWithDefinedUnit : AreaType, DynamicType, HasSecondUnitSize, Init, SecondUnitSize, SetAreaType, SetSecondUnitSize · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeometricToleranceWithDefinedUnit** ← StepDimTol_GeometricTolerance : DynamicType, Init, SetUnitSize, UnitSize · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeometricToleranceWithMaximumTolerance** ← StepDimTol_GeometricToleranceWithModifiers : DynamicType, Init, MaximumUpperTolerance, SetMaximumUpperTolerance · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_GeometricToleranceWithModifiers** ← StepDimTol_GeometricTolerance : DynamicType, Init, ModifierValue, Modifiers, NbModifiers, SetModifierValue, SetModifiers · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_LimitCondition** · *statiques :* StepDimTol_LeastMaterialCondition, StepDimTol_MaximumMaterialCondition, StepDimTol_RegardlessOfFeatureSize
- **StepDimTol_LineProfileTolerance** ← StepDimTol_GeometricTolerance : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_ModifiedGeometricTolerance** ← StepDimTol_GeometricTolerance : DynamicType, Init, Modifier, SetModifier · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_NonUniformZoneDefinition** ← StepDimTol_ToleranceZoneDefinition : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_ParallelismTolerance** ← StepDimTol_GeometricToleranceWithDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_PerpendicularityTolerance** ← StepDimTol_GeometricToleranceWithDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_PlacedDatumTargetFeature** ← StepDimTol_DatumTarget : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_PositionTolerance** ← StepDimTol_GeometricTolerance : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_ProjectedZoneDefinition** ← StepDimTol_ToleranceZoneDefinition : DynamicType, Init, ProjectionEnd, ProjectionLength, SetProjectionEnd, SetProjectionLength · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_RoundnessTolerance** ← StepDimTol_GeometricTolerance : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_RunoutZoneDefinition** ← StepDimTol_ToleranceZoneDefinition : DynamicType, Init, Orientation, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_RunoutZoneOrientation** ← Standard_Transient : Angle, DynamicType, Init, SetAngle · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_ShapeToleranceSelect** ← StepData_SelectType : CaseNum, GeometricTolerance, PlusMinusTolerance
- **StepDimTol_SimpleDatumReferenceModifier** · *statiques :* StepDimTol_SDRMAnyCrossSection, StepDimTol_SDRMAnyLongitudinalSection, StepDimTol_SDRMBasic, StepDimTol_SDRMContactingFeature, StepDimTol_SDRMDegreeOfFreedomConstraintU, StepDimTol_SDRMDegreeOfFreedomConstraintV, StepDimTol_SDRMDegreeOfFreedomConstraintW, StepDimTol_SDRMDegreeOfFreedomConstraintX, StepDimTol_SDRMDegreeOfFreedomConstraintY, StepDimTol_SDRMDegreeOfFreedomConstraintZ, StepDimTol_SDRMDistanceVariable, StepDimTol_SDRMFreeState, StepDimTol_SDRMLeastMaterialRequirement, StepDimTol_SDRMLine, StepDimTol_SDRMMajorDiameter, StepDimTol_SDRMMaximumMaterialRequirement, StepDimTol_SDRMMinorDiameter, StepDimTol_SDRMOrientation, StepDimTol_SDRMPitchDiameter, StepDimTol_SDRMPlane, StepDimTol_SDRMPoint, StepDimTol_SDRMTranslation
- **StepDimTol_SimpleDatumReferenceModifierMember** ← StepData_SelectInt : DynamicType, EnumText, HasName, Kind, Name, SetEnumText, SetName, SetValue, Value · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_StraightnessTolerance** ← StepDimTol_GeometricTolerance : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_SurfaceProfileTolerance** ← StepDimTol_GeometricTolerance : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_SymmetryTolerance** ← StepDimTol_GeometricToleranceWithDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_ToleranceZone** ← StepRepr_ShapeAspect : DefiningTolerance, DefiningToleranceValue, DynamicType, Form, Init, NbDefiningTolerances, SetDefiningTolerance, SetDefiningToleranceValue, SetForm · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_ToleranceZoneDefinition** ← Standard_Transient : Boundaries, BoundariesValue, DynamicType, Init, NbBoundaries, SetBoundaries, SetBoundariesValue, SetZone, Zone · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_ToleranceZoneForm** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_ToleranceZoneTarget** ← StepData_SelectType : CaseNum, DimensionalLocation, DimensionalSize, GeneralDatumReference, GeometricTolerance
- **StepDimTol_TotalRunoutTolerance** ← StepDimTol_GeometricToleranceWithDatumReference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepDimTol_UnequallyDisposedGeometricTolerance** ← StepDimTol_GeometricTolerance : Displacement, DynamicType, Init, SetDisplacement · *statiques :* get_type_descriptor, get_type_name

## STEPEdit

- **STEPEdit_EditContext** ← IFSelect_Editor : Apply, DynamicType, Label, Load, Recognize, StringValue · *statiques :* get_type_descriptor, get_type_name
- **STEPEdit_EditSDR** ← IFSelect_Editor : Apply, DynamicType, Label, Load, Recognize, StringValue · *statiques :* get_type_descriptor, get_type_name

## StepElement

- **StepElement_AnalysisItemWithinRepresentation** ← Standard_Transient : Description, DynamicType, Init, Item, Name, Rep, SetDescription, SetItem, SetName, SetRep · *statiques :* get_type_descriptor, get_type_name
- **StepElement_Array1OfCurveElementEndReleasePacket** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepElement_Array1OfCurveElementSectionDefinition** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepElement_Array1OfHSequenceOfCurveElementPurposeMember** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepElement_Array1OfHSequenceOfSurfaceElementPurposeMember** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepElement_Array1OfMeasureOrUnspecifiedValue** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepElement_Array1OfSurfaceSection** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepElement_Array1OfVolumeElementPurpose** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepElement_Array1OfVolumeElementPurposeMember** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepElement_Curve3dElementDescriptor** ← StepElement_ElementDescriptor : DynamicType, Init, Purpose, SetPurpose · *statiques :* get_type_descriptor, get_type_name
- **StepElement_CurveEdge** · *statiques :* StepElement_ElementEdge
- **StepElement_CurveElementEndReleasePacket** ← Standard_Transient : DynamicType, Init, ReleaseFreedom, ReleaseStiffness, SetReleaseFreedom, SetReleaseStiffness · *statiques :* get_type_descriptor, get_type_name
- **StepElement_CurveElementFreedom** ← StepData_SelectType : ApplicationDefinedDegreeOfFreedom, CaseMem, CaseNum, EnumeratedCurveElementFreedom, NewMember, SetApplicationDefinedDegreeOfFreedom, SetEnumeratedCurveElementFreedom
- **StepElement_CurveElementFreedomMember** ← StepData_SelectNamed : DynamicType, HasName, Matches, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepElement_CurveElementPurpose** ← StepData_SelectType : ApplicationDefinedElementPurpose, CaseMem, CaseNum, EnumeratedCurveElementPurpose, NewMember, SetApplicationDefinedElementPurpose, SetEnumeratedCurveElementPurpose
- **StepElement_CurveElementPurposeMember** ← StepData_SelectNamed : DynamicType, HasName, Matches, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepElement_CurveElementSectionDefinition** ← Standard_Transient : Description, DynamicType, Init, SectionAngle, SetDescription, SetSectionAngle · *statiques :* get_type_descriptor, get_type_name
- **StepElement_CurveElementSectionDerivedDefinitions** ← StepElement_CurveElementSectionDefinition : CrossSectionalArea, DynamicType, Init, LocationOfCentroid, LocationOfNonStructuralMass, LocationOfShearCentre, NonStructuralMass, PolarMoment, SecondMomentOfArea, SetCrossSectionalArea, SetLocationOfCentroid, SetLocationOfNonStructuralMass, SetLocationOfShearCentre, SetNonStructuralMass, SetPolarMoment, SetSecondMomentOfArea, SetShearArea, SetTorsionalConstant, SetWarpingConstant, ShearArea, TorsionalConstant, WarpingConstant · *statiques :* get_type_descriptor, get_type_name
- **StepElement_Element2dShape** · *statiques :* StepElement_Quadrilateral, StepElement_Triangle
- **StepElement_ElementAspect** ← StepData_SelectType : CaseMem, CaseNum, CurveEdge, ElementVolume, NewMember, SetCurveEdge, SetElementVolume, SetSurface2dEdge, SetSurface2dFace, SetSurface3dEdge, SetSurface3dFace, SetVolume2dEdge, SetVolume2dFace, SetVolume3dEdge, SetVolume3dFace, Surface2dEdge, Surface2dFace, Surface3dEdge, Surface3dFace, Volume2dEdge, Volume2dFace, Volume3dEdge, Volume3dFace
- **StepElement_ElementAspectMember** ← StepData_SelectNamed : DynamicType, HasName, Matches, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepElement_ElementDescriptor** ← Standard_Transient : Description, DynamicType, Init, SetDescription, SetTopologyOrder, TopologyOrder · *statiques :* get_type_descriptor, get_type_name
- **StepElement_ElementMaterial** ← Standard_Transient : Description, DynamicType, Init, MaterialId, Properties, SetDescription, SetMaterialId, SetProperties · *statiques :* get_type_descriptor, get_type_name
- **StepElement_ElementOrder** · *statiques :* StepElement_Cubic, StepElement_Linear, StepElement_Quadratic
- **StepElement_ElementVolume** · *statiques :* StepElement_Volume
- **StepElement_EnumeratedCurveElementFreedom** · *statiques :* StepElement_None, StepElement_Warp, StepElement_XRotation, StepElement_XTranslation, StepElement_YRotation, StepElement_YTranslation, StepElement_ZRotation, StepElement_ZTranslation
- **StepElement_EnumeratedCurveElementPurpose** · *statiques :* StepElement_Axial, StepElement_Torsion, StepElement_Warping, StepElement_XYShear, StepElement_XZShear, StepElement_YYBending, StepElement_ZZBending
- **StepElement_EnumeratedSurfaceElementPurpose** · *statiques :* StepElement_BendingDirect, StepElement_BendingTorsion, StepElement_MembraneDirect, StepElement_MembraneShear, StepElement_NormalToPlaneShear
- **StepElement_EnumeratedVolumeElementPurpose** · *statiques :* StepElement_StressDisplacement
- **StepElement_MeasureOrUnspecifiedValue** ← StepData_SelectType : CaseMem, CaseNum, ContextDependentMeasure, NewMember, SetContextDependentMeasure, SetUnspecifiedValue, UnspecifiedValue
- **StepElement_MeasureOrUnspecifiedValueMember** ← StepData_SelectNamed : DynamicType, HasName, Matches, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepElement_Surface3dElementDescriptor** ← StepElement_ElementDescriptor : DynamicType, Init, Purpose, SetPurpose, SetShape, Shape · *statiques :* get_type_descriptor, get_type_name
- **StepElement_SurfaceElementProperty** ← Standard_Transient : Description, DynamicType, Init, PropertyId, Section, SetDescription, SetPropertyId, SetSection · *statiques :* get_type_descriptor, get_type_name
- **StepElement_SurfaceElementPurpose** ← StepData_SelectType : ApplicationDefinedElementPurpose, CaseMem, CaseNum, EnumeratedSurfaceElementPurpose, NewMember, SetApplicationDefinedElementPurpose, SetEnumeratedSurfaceElementPurpose
- **StepElement_SurfaceElementPurposeMember** ← StepData_SelectNamed : DynamicType, HasName, Matches, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepElement_SurfaceSection** ← Standard_Transient : DynamicType, Init, NonStructuralMass, NonStructuralMassOffset, Offset, SetNonStructuralMass, SetNonStructuralMassOffset, SetOffset · *statiques :* get_type_descriptor, get_type_name
- **StepElement_SurfaceSectionField** ← Standard_Transient : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepElement_SurfaceSectionFieldConstant** ← StepElement_SurfaceSectionField : Definition, DynamicType, Init, SetDefinition · *statiques :* get_type_descriptor, get_type_name
- **StepElement_SurfaceSectionFieldVarying** ← StepElement_SurfaceSectionField : AdditionalNodeValues, Definitions, DynamicType, Init, SetAdditionalNodeValues, SetDefinitions · *statiques :* get_type_descriptor, get_type_name
- **StepElement_UniformSurfaceSection** ← StepElement_SurfaceSection : BendingThickness, DynamicType, Init, SetBendingThickness, SetShearThickness, SetThickness, ShearThickness, Thickness · *statiques :* get_type_descriptor, get_type_name
- **StepElement_UnspecifiedValue** · *statiques :* StepElement_Unspecified
- **StepElement_Volume3dElementDescriptor** ← StepElement_ElementDescriptor : DynamicType, Init, Purpose, SetPurpose, SetShape, Shape · *statiques :* get_type_descriptor, get_type_name
- **StepElement_Volume3dElementShape** · *statiques :* StepElement_Hexahedron, StepElement_Pyramid, StepElement_Tetrahedron, StepElement_Wedge
- **StepElement_VolumeElementPurpose** ← StepData_SelectType : ApplicationDefinedElementPurpose, CaseMem, CaseNum, EnumeratedVolumeElementPurpose, NewMember, SetApplicationDefinedElementPurpose, SetEnumeratedVolumeElementPurpose
- **StepElement_VolumeElementPurposeMember** ← StepData_SelectNamed : DynamicType, HasName, Matches, Name, SetName · *statiques :* get_type_descriptor, get_type_name

## StepFEA

- **StepFEA_AlignedCurve3dElementCoordinateSystem** ← StepFEA_FeaRepresentationItem : CoordinateSystem, DynamicType, Init, SetCoordinateSystem · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_AlignedSurface3dElementCoordinateSystem** ← StepFEA_FeaRepresentationItem : CoordinateSystem, DynamicType, Init, SetCoordinateSystem · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_ArbitraryVolume3dElementCoordinateSystem** ← StepFEA_FeaRepresentationItem : CoordinateSystem, DynamicType, Init, SetCoordinateSystem · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_Array1OfCurveElementEndOffset** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepFEA_Array1OfCurveElementEndRelease** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepFEA_Array1OfCurveElementInterval** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepFEA_Array1OfDegreeOfFreedom** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepFEA_Array1OfElementRepresentation** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepFEA_Array1OfNodeRepresentation** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepFEA_ConstantSurface3dElementCoordinateSystem** ← StepFEA_FeaRepresentationItem : Angle, Axis, DynamicType, Init, SetAngle, SetAxis · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_CoordinateSystemType** · *statiques :* StepFEA_Cartesian, StepFEA_Cylindrical, StepFEA_Spherical
- **StepFEA_Curve3dElementProperty** ← Standard_Transient : Description, DynamicType, EndOffsets, EndReleases, Init, IntervalDefinitions, PropertyId, SetDescription, SetEndOffsets, SetEndReleases, SetIntervalDefinitions, SetPropertyId · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_Curve3dElementRepresentation** ← StepFEA_ElementRepresentation : DynamicType, ElementDescriptor, Init, Material, ModelRef, Property, SetElementDescriptor, SetMaterial, SetModelRef, SetProperty · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_CurveEdge** · *statiques :* StepFEA_ElementEdge
- **StepFEA_CurveElementEndCoordinateSystem** ← StepData_SelectType : AlignedCurve3dElementCoordinateSystem, CaseNum, FeaAxis2Placement3d, ParametricCurve3dElementCoordinateSystem
- **StepFEA_CurveElementEndOffset** ← Standard_Transient : CoordinateSystem, DynamicType, Init, OffsetVector, SetCoordinateSystem, SetOffsetVector · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_CurveElementEndRelease** ← Standard_Transient : CoordinateSystem, DynamicType, Init, Releases, SetCoordinateSystem, SetReleases · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_CurveElementInterval** ← Standard_Transient : DynamicType, EuAngles, FinishPosition, Init, SetEuAngles, SetFinishPosition · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_CurveElementIntervalConstant** ← StepFEA_CurveElementInterval : DynamicType, Init, Section, SetSection · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_CurveElementIntervalLinearlyVarying** ← StepFEA_CurveElementInterval : DynamicType, Init, Sections, SetSections · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_CurveElementLocation** ← Standard_Transient : Coordinate, DynamicType, Init, SetCoordinate · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_DegreeOfFreedom** ← StepData_SelectType : ApplicationDefinedDegreeOfFreedom, CaseMem, CaseNum, EnumeratedDegreeOfFreedom, NewMember, SetApplicationDefinedDegreeOfFreedom, SetEnumeratedDegreeOfFreedom
- **StepFEA_DegreeOfFreedomMember** ← StepData_SelectNamed : DynamicType, HasName, Matches, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_DummyNode** ← StepFEA_NodeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_ElementGeometricRelationship** ← Standard_Transient : Aspect, DynamicType, ElementRef, Init, Item, SetAspect, SetElementRef, SetItem · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_ElementGroup** ← StepFEA_FeaGroup : DynamicType, Elements, Init, SetElements · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_ElementOrElementGroup** ← StepData_SelectType : CaseNum, ElementGroup, ElementRepresentation
- **StepFEA_ElementRepresentation** ← StepRepr_Representation : DynamicType, Init, NodeList, SetNodeList · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_ElementVolume** · *statiques :* StepFEA_Volume
- **StepFEA_EnumeratedDegreeOfFreedom** · *statiques :* StepFEA_Warp, StepFEA_XRotation, StepFEA_XTranslation, StepFEA_YRotation, StepFEA_YTranslation, StepFEA_ZRotation, StepFEA_ZTranslation
- **StepFEA_FeaAreaDensity** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstant, Init, SetFeaConstant · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaAxis2Placement3d** ← StepGeom_Axis2Placement3d : Description, DynamicType, Init, SetDescription, SetSystemType, SystemType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaCurveSectionGeometricRelationship** ← Standard_Transient : DynamicType, Init, Item, SectionRef, SetItem, SetSectionRef · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaGroup** ← StepBasic_Group : DynamicType, Init, ModelRef, SetModelRef · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaLinearElasticity** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstants, Init, SetFeaConstants · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaMassDensity** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstant, Init, SetFeaConstant · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaMaterialPropertyRepresentation** ← StepRepr_MaterialPropertyRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaMaterialPropertyRepresentationItem** ← StepRepr_RepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaModel** ← StepRepr_Representation : AnalysisType, CreatingSoftware, Description, DynamicType, Init, IntendedAnalysisCode, SetAnalysisType, SetCreatingSoftware, SetDescription, SetIntendedAnalysisCode · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaModel3d** ← StepFEA_FeaModel : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaModelDefinition** ← StepRepr_ShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaMoistureAbsorption** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstants, Init, SetFeaConstants · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaParametricPoint** ← StepGeom_Point : Coordinates, DynamicType, Init, SetCoordinates · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaRepresentationItem** ← StepRepr_RepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaSecantCoefficientOfLinearThermalExpansion** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstants, Init, ReferenceTemperature, SetFeaConstants, SetReferenceTemperature · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaShellBendingStiffness** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstants, Init, SetFeaConstants · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaShellMembraneBendingCouplingStiffness** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstants, Init, SetFeaConstants · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaShellMembraneStiffness** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstants, Init, SetFeaConstants · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaShellShearStiffness** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstants, Init, SetFeaConstants · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaSurfaceSectionGeometricRelationship** ← Standard_Transient : DynamicType, Init, Item, SectionRef, SetItem, SetSectionRef · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FeaTangentialCoefficientOfLinearThermalExpansion** ← StepFEA_FeaMaterialPropertyRepresentationItem : DynamicType, FeaConstants, Init, SetFeaConstants · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FreedomAndCoefficient** ← Standard_Transient : A, DynamicType, Freedom, Init, SetA, SetFreedom · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_FreedomsList** ← Standard_Transient : DynamicType, Freedoms, Init, SetFreedoms · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_GeometricNode** ← StepFEA_NodeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_Node** ← StepFEA_NodeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_NodeDefinition** ← StepRepr_ShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_NodeGroup** ← StepFEA_FeaGroup : DynamicType, Init, Nodes, SetNodes · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_NodeRepresentation** ← StepRepr_Representation : DynamicType, Init, ModelRef, SetModelRef · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_NodeSet** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, Nodes, SetNodes · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_NodeWithSolutionCoordinateSystem** ← StepFEA_Node : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_NodeWithVector** ← StepFEA_Node : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_ParametricCurve3dElementCoordinateDirection** ← StepFEA_FeaRepresentationItem : DynamicType, Init, Orientation, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_ParametricCurve3dElementCoordinateSystem** ← StepFEA_FeaRepresentationItem : Direction, DynamicType, Init, SetDirection · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_ParametricSurface3dElementCoordinateSystem** ← StepFEA_FeaRepresentationItem : Angle, Axis, DynamicType, Init, SetAngle, SetAxis · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_Surface3dElementRepresentation** ← StepFEA_ElementRepresentation : DynamicType, ElementDescriptor, Init, Material, ModelRef, Property, SetElementDescriptor, SetMaterial, SetModelRef, SetProperty · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_SymmetricTensor22d** ← StepData_SelectType : AnisotropicSymmetricTensor22d, CaseNum
- **StepFEA_SymmetricTensor23d** ← StepData_SelectType : AnisotropicSymmetricTensor23d, CaseMem, CaseNum, IsotropicSymmetricTensor23d, NewMember, OrthotropicSymmetricTensor23d, SetAnisotropicSymmetricTensor23d, SetIsotropicSymmetricTensor23d, SetOrthotropicSymmetricTensor23d
- **StepFEA_SymmetricTensor23dMember** ← StepData_SelectArrReal : DynamicType, HasName, Matches, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_SymmetricTensor42d** ← StepData_SelectType : AnisotropicSymmetricTensor42d, CaseNum
- **StepFEA_SymmetricTensor43dMember** ← StepData_SelectArrReal : DynamicType, HasName, Matches, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepFEA_UnspecifiedValue** · *statiques :* StepFEA_Unspecified
- **StepFEA_Volume3dElementRepresentation** ← StepFEA_ElementRepresentation : DynamicType, ElementDescriptor, Init, Material, ModelRef, SetElementDescriptor, SetMaterial, SetModelRef · *statiques :* get_type_descriptor, get_type_name

## StepGeom

- **StepGeom_Array1OfBoundaryCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepGeom_Array1OfCartesianPoint** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepGeom_Array1OfCompositeCurveSegment** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepGeom_Array1OfCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepGeom_Array1OfPcurveOrSurface** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepGeom_Array1OfSurfaceBoundary** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepGeom_Array1OfTrimmingSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepGeom_Axis1Placement** ← StepGeom_Placement : Axis, DynamicType, HasAxis, Init, SetAxis, UnSetAxis · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Axis2Placement** ← StepData_SelectType : Axis2Placement2d, Axis2Placement3d, CaseNum
- **StepGeom_Axis2Placement2d** ← StepGeom_Placement : DynamicType, HasRefDirection, Init, RefDirection, SetRefDirection, UnSetRefDirection · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Axis2Placement3d** ← StepGeom_Placement : Axis, DynamicType, HasAxis, HasRefDirection, Init, RefDirection, SetAxis, SetRefDirection, UnSetAxis, UnSetRefDirection · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BSplineCurve** ← StepGeom_BoundedCurve : ClosedCurve, ControlPointsList, ControlPointsListValue, CurveForm, Degree, DynamicType, Init, NbControlPointsList, SelfIntersect, SetClosedCurve, SetControlPointsList, SetCurveForm, SetDegree, SetSelfIntersect · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BSplineCurveForm** · *statiques :* StepGeom_bscfCircularArc, StepGeom_bscfEllipticArc, StepGeom_bscfHyperbolicArc, StepGeom_bscfParabolicArc, StepGeom_bscfPolylineForm, StepGeom_bscfUnspecified
- **StepGeom_BSplineCurveWithKnots** ← StepGeom_BSplineCurve : DynamicType, Init, KnotMultiplicities, KnotMultiplicitiesValue, KnotSpec, Knots, KnotsValue, NbKnotMultiplicities, NbKnots, SetKnotMultiplicities, SetKnotSpec, SetKnots · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BSplineCurveWithKnotsAndRationalBSplineCurve** ← StepGeom_BSplineCurve : BSplineCurveWithKnots, DynamicType, Init, KnotMultiplicities, KnotMultiplicitiesValue, KnotSpec, Knots, KnotsValue, NbKnotMultiplicities, NbKnots, NbWeightsData, RationalBSplineCurve, SetBSplineCurveWithKnots, SetKnotMultiplicities, SetKnotSpec, SetKnots, SetRationalBSplineCurve, SetWeightsData, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BSplineSurface** ← StepGeom_BoundedSurface : ControlPointsList, ControlPointsListValue, DynamicType, Init, NbControlPointsListI, NbControlPointsListJ, SelfIntersect, SetControlPointsList, SetSelfIntersect, SetSurfaceForm, SetUClosed, SetUDegree, SetVClosed, SetVDegree, SurfaceForm, UClosed, UDegree, VClosed, VDegree · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BSplineSurfaceForm** · *statiques :* StepGeom_bssfConicalSurf, StepGeom_bssfCylindricalSurf, StepGeom_bssfGeneralisedCone, StepGeom_bssfPlaneSurf, StepGeom_bssfQuadricSurf, StepGeom_bssfRuledSurf, StepGeom_bssfSphericalSurf, StepGeom_bssfSurfOfLinearExtrusion, StepGeom_bssfSurfOfRevolution, StepGeom_bssfToroidalSurf, StepGeom_bssfUnspecified
- **StepGeom_BSplineSurfaceWithKnots** ← StepGeom_BSplineSurface : DynamicType, Init, KnotSpec, NbUKnots, NbUMultiplicities, NbVKnots, NbVMultiplicities, SetKnotSpec, SetUKnots, SetUMultiplicities, SetVKnots, SetVMultiplicities, UKnots, UKnotsValue, UMultiplicities, UMultiplicitiesValue, VKnots, VKnotsValue, VMultiplicities, VMultiplicitiesValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BSplineSurfaceWithKnotsAndRationalBSplineSurface** ← StepGeom_BSplineSurface : BSplineSurfaceWithKnots, DynamicType, Init, KnotSpec, NbUKnots, NbUMultiplicities, NbVKnots, NbVMultiplicities, NbWeightsDataI, NbWeightsDataJ, RationalBSplineSurface, SetBSplineSurfaceWithKnots, SetKnotSpec, SetRationalBSplineSurface, SetUKnots, SetUMultiplicities, SetVKnots, SetVMultiplicities, SetWeightsData, UKnots, UKnotsValue, UMultiplicities, UMultiplicitiesValue, VKnots, VKnotsValue, VMultiplicities, VMultiplicitiesValue, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BezierCurve** ← StepGeom_BSplineCurve : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BezierCurveAndRationalBSplineCurve** ← StepGeom_BSplineCurve : BezierCurve, DynamicType, Init, NbWeightsData, RationalBSplineCurve, SetBezierCurve, SetRationalBSplineCurve, SetWeightsData, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BezierSurface** ← StepGeom_BSplineSurface : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BezierSurfaceAndRationalBSplineSurface** ← StepGeom_BSplineSurface : BezierSurface, DynamicType, Init, NbWeightsDataI, NbWeightsDataJ, RationalBSplineSurface, SetBezierSurface, SetRationalBSplineSurface, SetWeightsData, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BoundaryCurve** ← StepGeom_CompositeCurveOnSurface : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BoundedCurve** ← StepGeom_Curve : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_BoundedSurface** ← StepGeom_Surface : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CartesianPoint** ← StepGeom_Point : Coordinates, CoordinatesValue, DynamicType, Init, Init2D, Init3D, NbCoordinates, SetCoordinates · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CartesianTransformationOperator** ← StepGeom_GeometricRepresentationItem : Axis1, Axis2, DynamicType, HasAxis1, HasAxis2, HasScale, Init, LocalOrigin, Scale, SetAxis1, SetAxis2, SetLocalOrigin, SetScale, UnSetAxis1, UnSetAxis2, UnSetScale · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CartesianTransformationOperator2d** ← StepGeom_CartesianTransformationOperator : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CartesianTransformationOperator3d** ← StepGeom_CartesianTransformationOperator : Axis3, DynamicType, HasAxis3, Init, SetAxis3, UnSetAxis3 · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Circle** ← StepGeom_Conic : DynamicType, Init, Radius, SetRadius · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CompositeCurve** ← StepGeom_BoundedCurve : DynamicType, Init, NbSegments, Segments, SegmentsValue, SelfIntersect, SetSegments, SetSelfIntersect · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CompositeCurveOnSurface** ← StepGeom_CompositeCurve : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CompositeCurveSegment** ← Standard_Transient : DynamicType, Init, ParentCurve, SameSense, SetParentCurve, SetSameSense, SetTransition, Transition · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Conic** ← StepGeom_Curve : DynamicType, Init, Position, SetPosition · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_ConicalSurface** ← StepGeom_ElementarySurface : DynamicType, Init, Radius, SemiAngle, SetRadius, SetSemiAngle · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Curve** ← StepGeom_GeometricRepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CurveBoundedSurface** ← StepGeom_BoundedSurface : BasisSurface, Boundaries, DynamicType, ImplicitOuter, Init, SetBasisSurface, SetBoundaries, SetImplicitOuter · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CurveOnSurface** ← StepData_SelectType : CaseNum, CompositeCurveOnSurface, Pcurve, SurfaceCurve
- **StepGeom_CurveReplica** ← StepGeom_Curve : DynamicType, Init, ParentCurve, SetParentCurve, SetTransformation, Transformation · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_CylindricalSurface** ← StepGeom_ElementarySurface : DynamicType, Init, Radius, SetRadius · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_DegeneratePcurve** ← StepGeom_Point : BasisSurface, DynamicType, Init, ReferenceToCurve, SetBasisSurface, SetReferenceToCurve · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_DegenerateToroidalSurface** ← StepGeom_ToroidalSurface : DynamicType, Init, SelectOuter, SetSelectOuter · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Direction** ← StepGeom_GeometricRepresentationItem : DirectionRatios, DirectionRatiosValue, DynamicType, Init, NbDirectionRatios, SetDirectionRatios · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_ElementarySurface** ← StepGeom_Surface : DynamicType, Init, Position, SetPosition · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Ellipse** ← StepGeom_Conic : DynamicType, Init, SemiAxis1, SemiAxis2, SetSemiAxis1, SetSemiAxis2 · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_EvaluatedDegeneratePcurve** ← StepGeom_DegeneratePcurve : DynamicType, EquivalentPoint, Init, SetEquivalentPoint · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_GeomRepContextAndGlobUnitAssCtxAndGlobUncertaintyAssCtx** ← StepRepr_RepresentationContext : CoordinateSpaceDimension, DynamicType, GeometricRepresentationContext, GlobalUncertaintyAssignedContext, GlobalUnitAssignedContext, Init, NbUncertainty, NbUnits, SetCoordinateSpaceDimension, SetGeometricRepresentationContext, SetGlobalUncertaintyAssignedContext, SetGlobalUnitAssignedContext, SetUncertainty, SetUnits, Uncertainty, UncertaintyValue, Units, UnitsValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_GeometricRepresentationContext** ← StepRepr_RepresentationContext : CoordinateSpaceDimension, DynamicType, Init, SetCoordinateSpaceDimension · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_GeometricRepresentationContextAndGlobalUnitAssignedContext** ← StepRepr_RepresentationContext : CoordinateSpaceDimension, DynamicType, GeometricRepresentationContext, GlobalUnitAssignedContext, Init, NbUnits, SetCoordinateSpaceDimension, SetGeometricRepresentationContext, SetGlobalUnitAssignedContext, SetUnits, Units, UnitsValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_GeometricRepresentationContextAndParametricRepresentationContext** ← StepRepr_RepresentationContext : CoordinateSpaceDimension, DynamicType, GeometricRepresentationContext, Init, ParametricRepresentationContext, SetCoordinateSpaceDimension, SetGeometricRepresentationContext, SetParametricRepresentationContext · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_GeometricRepresentationItem** ← StepRepr_RepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Hyperbola** ← StepGeom_Conic : DynamicType, Init, SemiAxis, SemiImagAxis, SetSemiAxis, SetSemiImagAxis · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_IntersectionCurve** ← StepGeom_SurfaceCurve : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_KnotType** · *statiques :* StepGeom_ktPiecewiseBezierKnots, StepGeom_ktQuasiUniformKnots, StepGeom_ktUniformKnots, StepGeom_ktUnspecified
- **StepGeom_Line** ← StepGeom_Curve : Dir, DynamicType, Init, Pnt, SetDir, SetPnt · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_OffsetCurve3d** ← StepGeom_Curve : BasisCurve, Distance, DynamicType, Init, RefDirection, SelfIntersect, SetBasisCurve, SetDistance, SetRefDirection, SetSelfIntersect · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_OffsetSurface** ← StepGeom_Surface : BasisSurface, Distance, DynamicType, Init, SelfIntersect, SetBasisSurface, SetDistance, SetSelfIntersect · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_OrientedSurface** ← StepGeom_Surface : DynamicType, Init, Orientation, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_OuterBoundaryCurve** ← StepGeom_BoundaryCurve : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Parabola** ← StepGeom_Conic : DynamicType, FocalDist, Init, SetFocalDist · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Pcurve** ← StepGeom_Curve : BasisSurface, DynamicType, Init, ReferenceToCurve, SetBasisSurface, SetReferenceToCurve · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_PcurveOrSurface** ← StepData_SelectType : CaseNum, Pcurve, Surface
- **StepGeom_Placement** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, Location, SetLocation · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Plane** ← StepGeom_ElementarySurface : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Point** ← StepGeom_GeometricRepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_PointOnCurve** ← StepGeom_Point : BasisCurve, DynamicType, Init, PointParameter, SetBasisCurve, SetPointParameter · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_PointOnSurface** ← StepGeom_Point : BasisSurface, DynamicType, Init, PointParameterU, PointParameterV, SetBasisSurface, SetPointParameterU, SetPointParameterV · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_PointReplica** ← StepGeom_Point : DynamicType, Init, ParentPt, SetParentPt, SetTransformation, Transformation · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Polyline** ← StepGeom_BoundedCurve : DynamicType, Init, NbPoints, Points, PointsValue, SetPoints · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_PreferredSurfaceCurveRepresentation** · *statiques :* StepGeom_pscrCurve3d, StepGeom_pscrPcurveS1, StepGeom_pscrPcurveS2
- **StepGeom_QuasiUniformCurve** ← StepGeom_BSplineCurve : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_QuasiUniformCurveAndRationalBSplineCurve** ← StepGeom_BSplineCurve : DynamicType, Init, NbWeightsData, QuasiUniformCurve, RationalBSplineCurve, SetQuasiUniformCurve, SetRationalBSplineCurve, SetWeightsData, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_QuasiUniformSurface** ← StepGeom_BSplineSurface : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_QuasiUniformSurfaceAndRationalBSplineSurface** ← StepGeom_BSplineSurface : DynamicType, Init, NbWeightsDataI, NbWeightsDataJ, QuasiUniformSurface, RationalBSplineSurface, SetQuasiUniformSurface, SetRationalBSplineSurface, SetWeightsData, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_RationalBSplineCurve** ← StepGeom_BSplineCurve : DynamicType, Init, NbWeightsData, SetWeightsData, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_RationalBSplineSurface** ← StepGeom_BSplineSurface : DynamicType, Init, NbWeightsDataI, NbWeightsDataJ, SetWeightsData, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_RectangularCompositeSurface** ← StepGeom_BoundedSurface : DynamicType, Init, NbSegmentsI, NbSegmentsJ, Segments, SegmentsValue, SetSegments · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_RectangularTrimmedSurface** ← StepGeom_BoundedSurface : BasisSurface, DynamicType, Init, SetBasisSurface, SetU1, SetU2, SetUsense, SetV1, SetV2, SetVsense, U1, U2, Usense, V1, V2, Vsense · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_ReparametrisedCompositeCurveSegment** ← StepGeom_CompositeCurveSegment : DynamicType, Init, ParamLength, SetParamLength · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_SeamCurve** ← StepGeom_SurfaceCurve : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_SphericalSurface** ← StepGeom_ElementarySurface : DynamicType, Init, Radius, SetRadius · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Surface** ← StepGeom_GeometricRepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_SurfaceBoundary** ← StepData_SelectType : BoundaryCurve, CaseNum, DegeneratePcurve
- **StepGeom_SurfaceCurve** ← StepGeom_Curve : AssociatedGeometry, AssociatedGeometryValue, Curve3d, DynamicType, Init, MasterRepresentation, NbAssociatedGeometry, SetAssociatedGeometry, SetCurve3d, SetMasterRepresentation · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_SurfaceCurveAndBoundedCurve** ← StepGeom_SurfaceCurve : BoundedCurve, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_SurfaceOfLinearExtrusion** ← StepGeom_SweptSurface : DynamicType, ExtrusionAxis, Init, SetExtrusionAxis · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_SurfaceOfRevolution** ← StepGeom_SweptSurface : AxisPosition, DynamicType, Init, SetAxisPosition · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_SurfacePatch** ← Standard_Transient : DynamicType, Init, ParentSurface, SetParentSurface, SetUSense, SetUTransition, SetVSense, SetVTransition, USense, UTransition, VSense, VTransition · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_SurfaceReplica** ← StepGeom_Surface : DynamicType, Init, ParentSurface, SetParentSurface, SetTransformation, Transformation · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_SweptSurface** ← StepGeom_Surface : DynamicType, Init, SetSweptCurve, SweptCurve · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_ToroidalSurface** ← StepGeom_ElementarySurface : DynamicType, Init, MajorRadius, MinorRadius, SetMajorRadius, SetMinorRadius · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_TransitionCode** · *statiques :* StepGeom_tcContSameGradient, StepGeom_tcContSameGradientSameCurvature, StepGeom_tcContinuous, StepGeom_tcDiscontinuous
- **StepGeom_TrimmedCurve** ← StepGeom_BoundedCurve : BasisCurve, DynamicType, Init, MasterRepresentation, NbTrim1, NbTrim2, SenseAgreement, SetBasisCurve, SetMasterRepresentation, SetSenseAgreement, SetTrim1, SetTrim2, Trim1, Trim1Value, Trim2, Trim2Value · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_TrimmingMember** ← StepData_SelectReal : DynamicType, HasName, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_TrimmingPreference** · *statiques :* StepGeom_tpCartesian, StepGeom_tpParameter, StepGeom_tpUnspecified
- **StepGeom_TrimmingSelect** ← StepData_SelectType : CartesianPoint, CaseMem, CaseNum, NewMember, ParameterValue, SetParameterValue
- **StepGeom_UniformCurve** ← StepGeom_BSplineCurve : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_UniformCurveAndRationalBSplineCurve** ← StepGeom_BSplineCurve : DynamicType, Init, NbWeightsData, RationalBSplineCurve, SetRationalBSplineCurve, SetUniformCurve, SetWeightsData, UniformCurve, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_UniformSurface** ← StepGeom_BSplineSurface : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_UniformSurfaceAndRationalBSplineSurface** ← StepGeom_BSplineSurface : DynamicType, Init, NbWeightsDataI, NbWeightsDataJ, RationalBSplineSurface, SetRationalBSplineSurface, SetUniformSurface, SetWeightsData, UniformSurface, WeightsData, WeightsDataValue · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_Vector** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, Magnitude, Orientation, SetMagnitude, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **StepGeom_VectorOrDirection** ← StepData_SelectType : CaseNum, Direction, Vector

## StepRepr

- **StepRepr_AllAroundShapeAspect** ← StepRepr_ContinuosShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_Apex** ← StepRepr_DerivedShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_Array1OfMaterialPropertyRepresentation** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepRepr_Array1OfPropertyDefinitionRepresentation** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepRepr_Array1OfRepresentationItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepRepr_Array1OfShapeAspect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepRepr_AssemblyComponentUsage** ← StepRepr_ProductDefinitionUsage : DynamicType, HasReferenceDesignator, Init, ReferenceDesignator, SetReferenceDesignator · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_AssemblyComponentUsageSubstitute** ← Standard_Transient : Base, Definition, DynamicType, Init, Name, SetBase, SetDefinition, SetName, SetSubstitute, Substitute · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_BetweenShapeAspect** ← StepRepr_ContinuosShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_CentreOfSymmetry** ← StepRepr_DerivedShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_CharacterizedDefinition** ← StepData_SelectType : CaseNum, CharacterizedObject, DocumentFile, ProductDefinition, ProductDefinitionRelationship, ProductDefinitionShape, ShapeAspect, ShapeAspectRelationship
- **StepRepr_CharacterizedRepresentation** ← StepRepr_Representation : Description, DynamicType, Init, SetDescription · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_CompGroupShAspAndCompShAspAndDatumFeatAndShAsp** ← StepRepr_CompShAspAndDatumFeatAndShAsp : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_CompShAspAndDatumFeatAndShAsp** ← StepRepr_ShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_CompositeGroupShapeAspect** ← StepRepr_CompositeShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_CompositeShapeAspect** ← StepRepr_ShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_CompoundRepresentationItem** ← StepRepr_RepresentationItem : DynamicType, Init, ItemElement, ItemElementValue, NbItemElement, SetItemElement, SetItemElementValue · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ConfigurationDesign** ← Standard_Transient : Configuration, Design, DynamicType, Init, SetConfiguration, SetDesign · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ConfigurationDesignItem** ← StepData_SelectType : CaseNum, ProductDefinition, ProductDefinitionFormation
- **StepRepr_ConfigurationEffectivity** ← StepBasic_ProductDefinitionEffectivity : Configuration, DynamicType, SetConfiguration · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ConfigurationItem** ← Standard_Transient : Description, DynamicType, HasDescription, HasPurpose, Id, Init, ItemConcept, Name, Purpose, SetDescription, SetId, SetItemConcept, SetName, SetPurpose · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ConstructiveGeometryRepresentation** ← StepRepr_Representation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ConstructiveGeometryRepresentationRelationship** ← StepRepr_RepresentationRelationship : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ContinuosShapeAspect** ← StepRepr_CompositeShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_DataEnvironment** ← Standard_Transient : Description, DynamicType, Elements, Init, Name, SetDescription, SetElements, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_DefinitionalRepresentation** ← StepRepr_Representation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_DerivedShapeAspect** ← StepRepr_ShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_DescriptiveRepresentationItem** ← StepRepr_RepresentationItem : Description, DynamicType, Init, SetDescription · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_Extension** ← StepRepr_DerivedShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ExternallyDefinedRepresentation** ← StepRepr_Representation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_FeatureForDatumTargetRelationship** ← StepRepr_ShapeAspectRelationship : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_FunctionallyDefinedTransformation** ← Standard_Transient : Description, DynamicType, Init, Name, SetDescription, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_GeometricAlignment** ← StepRepr_DerivedShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_GlobalUncertaintyAssignedContext** ← StepRepr_RepresentationContext : DynamicType, Init, NbUncertainty, SetUncertainty, Uncertainty, UncertaintyValue · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_GlobalUnitAssignedContext** ← StepRepr_RepresentationContext : DynamicType, Init, NbUnits, SetUnits, Units, UnitsValue · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_IntegerRepresentationItem** ← StepRepr_RepresentationItem : DynamicType, Init, SetValue, Value · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ItemDefinedTransformation** ← Standard_Transient : Description, DynamicType, Init, Name, SetDescription, SetName, SetTransformItem1, SetTransformItem2, TransformItem1, TransformItem2 · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_MakeFromUsageOption** ← StepRepr_ProductDefinitionUsage : DynamicType, Init, Quantity, Ranking, RankingRationale, SetQuantity, SetRanking, SetRankingRationale · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_MappedItem** ← StepRepr_RepresentationItem : DynamicType, Init, MappingSource, MappingTarget, SetMappingSource, SetMappingTarget · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_MaterialDesignation** ← Standard_Transient : DynamicType, Init, Name, OfDefinition, SetName, SetOfDefinition · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_MaterialProperty** ← StepRepr_PropertyDefinition : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_MaterialPropertyRepresentation** ← StepRepr_PropertyDefinitionRepresentation : DependentEnvironment, DynamicType, Init, SetDependentEnvironment · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_MeasureRepresentationItem** ← StepRepr_RepresentationItem : DynamicType, Init, Measure, SetMeasure · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_NextAssemblyUsageOccurrence** ← StepRepr_AssemblyComponentUsage : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ParallelOffset** ← StepRepr_DerivedShapeAspect : DynamicType, Init, Offset, SetOffset · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ParametricRepresentationContext** ← StepRepr_RepresentationContext : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_PerpendicularTo** ← StepRepr_DerivedShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ProductConcept** ← Standard_Transient : Description, DynamicType, HasDescription, Id, Init, MarketContext, Name, SetDescription, SetId, SetMarketContext, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ProductDefinitionShape** ← StepRepr_PropertyDefinition : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ProductDefinitionUsage** ← StepBasic_ProductDefinitionRelationship : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_PromissoryUsageOccurrence** ← StepRepr_AssemblyComponentUsage : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_PropertyDefinition** ← Standard_Transient : Definition, Description, DynamicType, HasDescription, Init, Name, SetDefinition, SetDescription, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_PropertyDefinitionRelationship** ← Standard_Transient : Description, DynamicType, Init, Name, RelatedPropertyDefinition, RelatingPropertyDefinition, SetDescription, SetName, SetRelatedPropertyDefinition, SetRelatingPropertyDefinition · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_PropertyDefinitionRepresentation** ← Standard_Transient : Definition, DynamicType, Init, SetDefinition, SetUsedRepresentation, UsedRepresentation · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_QuantifiedAssemblyComponentUsage** ← StepRepr_AssemblyComponentUsage : DynamicType, Quantity, SetQuantity · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ReprItemAndLengthMeasureWithUnit** ← StepRepr_ReprItemAndMeasureWithUnit : DynamicType, GetLengthMeasureWithUnit, SetLengthMeasureWithUnit · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ReprItemAndLengthMeasureWithUnitAndQRI** ← StepRepr_ReprItemAndMeasureWithUnitAndQRI : DynamicType, GetLengthMeasureWithUnit, SetLengthMeasureWithUnit · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ReprItemAndMeasureWithUnit** ← StepRepr_RepresentationItem : DynamicType, GetMeasureRepresentationItem, GetMeasureWithUnit, GetRepresentationItem, Init, SetMeasureWithUnit · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ReprItemAndMeasureWithUnitAndQRI** ← StepRepr_ReprItemAndMeasureWithUnit : DynamicType, GetQualifiedRepresentationItem, Init, SetQualifiedRepresentationItem · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ReprItemAndPlaneAngleMeasureWithUnit** ← StepRepr_ReprItemAndMeasureWithUnit : DynamicType, GetPlaneAngleMeasureWithUnit, SetPlaneAngleMeasureWithUnit · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ReprItemAndPlaneAngleMeasureWithUnitAndQRI** ← StepRepr_ReprItemAndMeasureWithUnitAndQRI : DynamicType, GetPlaneAngleMeasureWithUnit, SetPlaneAngleMeasureWithUnit · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_Representation** ← Standard_Transient : ContextOfItems, DynamicType, Init, Items, ItemsValue, Name, NbItems, SetContextOfItems, SetItems, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_RepresentationContext** ← Standard_Transient : ContextIdentifier, ContextType, DynamicType, Init, SetContextIdentifier, SetContextType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_RepresentationItem** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_RepresentationMap** ← Standard_Transient : DynamicType, Init, MappedRepresentation, MappingOrigin, SetMappedRepresentation, SetMappingOrigin · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_RepresentationRelationship** ← Standard_Transient : Description, DynamicType, Init, Name, Rep1, Rep2, SetDescription, SetName, SetRep1, SetRep2 · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_RepresentationRelationshipWithTransformation** ← StepRepr_ShapeRepresentationRelationship : DynamicType, Init, SetTransformationOperator, TransformationOperator · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_RepresentedDefinition** ← StepData_SelectType : CaseNum, GeneralProperty, PropertyDefinition, PropertyDefinitionRelationship, ShapeAspect, ShapeAspectRelationship
- **StepRepr_ShapeAspect** ← Standard_Transient : Description, DynamicType, Init, Name, OfShape, ProductDefinitional, SetDescription, SetName, SetOfShape, SetProductDefinitional · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ShapeAspectDerivingRelationship** ← StepRepr_ShapeAspectRelationship : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ShapeAspectRelationship** ← Standard_Transient : Description, DynamicType, HasDescription, Init, Name, RelatedShapeAspect, RelatingShapeAspect, SetDescription, SetName, SetRelatedShapeAspect, SetRelatingShapeAspect · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ShapeAspectTransition** ← StepRepr_ShapeAspectRelationship : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ShapeDefinition** ← StepData_SelectType : CaseNum, ProductDefinitionShape, ShapeAspect, ShapeAspectRelationship
- **StepRepr_ShapeRepresentationRelationship** ← StepRepr_RepresentationRelationship : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ShapeRepresentationRelationshipWithTransformation** ← StepRepr_RepresentationRelationshipWithTransformation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_SpecifiedHigherUsageOccurrence** ← StepRepr_AssemblyComponentUsage : DynamicType, NextUsage, SetNextUsage, SetUpperUsage, UpperUsage · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_StructuralResponseProperty** ← StepRepr_PropertyDefinition : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_StructuralResponsePropertyDefinitionRepresentation** ← StepRepr_PropertyDefinitionRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_SuppliedPartRelationship** ← StepBasic_ProductDefinitionRelationship : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_Tangent** ← StepRepr_DerivedShapeAspect : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_Transformation** ← StepData_SelectType : CaseNum, FunctionallyDefinedTransformation, ItemDefinedTransformation
- **StepRepr_ValueRange** ← StepRepr_CompoundRepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepRepr_ValueRepresentationItem** ← StepRepr_RepresentationItem : DynamicType, Init, SetValueComponentMember, ValueComponentMember · *statiques :* get_type_descriptor, get_type_name

## StepSelect

- **StepSelect_Activator** ← IFSelect_Activator : Do, DynamicType, Help · *statiques :* get_type_descriptor, get_type_name
- **StepSelect_FileModifier** ← IFSelect_GeneralModifier : DynamicType, Perform · *statiques :* get_type_descriptor, get_type_name
- **StepSelect_FloatFormat** ← StepSelect_FileModifier : DynamicType, Format, Label, Perform, SetDefault, SetFormat, SetFormatForRange, SetZeroSuppress · *statiques :* get_type_descriptor, get_type_name
- **StepSelect_ModelModifier** ← IFSelect_Modifier : DynamicType, Perform, PerformProtocol, Performing · *statiques :* get_type_descriptor, get_type_name
- **StepSelect_StepType** ← IFSelect_Signature : DynamicType, SetProtocol, Value · *statiques :* get_type_descriptor, get_type_name
- **StepSelect_WorkLibrary** ← IFSelect_WorkLibrary : CopyModel, DumpEntity, DynamicType, ReadFile, SetDumpLabel, WriteFile · *statiques :* get_type_descriptor, get_type_name

## STEPSelections

- **STEPSelections_AssemblyComponent** ← Standard_Transient (2 ctor) : DynamicType, GetList, GetSDR, SetList, SetSDR · *statiques :* get_type_descriptor, get_type_name
- **STEPSelections_AssemblyExplorer** : Dump, FillListWithGraph, FindItemWithNAUO, FindSDRWithProduct, Init, NbAssemblies, Root
- **STEPSelections_AssemblyLink** ← Standard_Transient (2 ctor) : DynamicType, GetComponent, GetItem, GetNAUO, SetComponent, SetItem, SetNAUO · *statiques :* get_type_descriptor, get_type_name
- **STEPSelections_SelectAssembly** ← IFSelect_SelectExplore : DynamicType, Explore, ExploreLabel · *statiques :* get_type_descriptor, get_type_name
- **STEPSelections_SelectDerived** ← StepSelect_StepType : DynamicType, Matches · *statiques :* get_type_descriptor, get_type_name
- **STEPSelections_SelectFaces** ← IFSelect_SelectExplore : DynamicType, Explore, ExploreLabel · *statiques :* get_type_descriptor, get_type_name
- **STEPSelections_SelectForTransfer** ← XSControl_SelectForTransfer (2 ctor) : DynamicType, RootResult · *statiques :* get_type_descriptor, get_type_name
- **STEPSelections_SelectGSCurves** ← IFSelect_SelectExplore : DynamicType, Explore, ExploreLabel · *statiques :* get_type_descriptor, get_type_name
- **STEPSelections_SelectInstances** ← IFSelect_SelectExplore : DynamicType, Explore, ExploreLabel, RootResult · *statiques :* get_type_descriptor, get_type_name

## StepShape

- **StepShape_AdvancedBrepShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_AdvancedFace** ← StepShape_FaceSurface : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_AngleRelator** · *statiques :* StepShape_Equal, StepShape_Large, StepShape_Small
- **StepShape_AngularLocation** ← StepShape_DimensionalLocation : AngleSelection, DynamicType, Init, SetAngleSelection · *statiques :* get_type_descriptor, get_type_name
- **StepShape_AngularSize** ← StepShape_DimensionalSize : AngleSelection, DynamicType, Init, SetAngleSelection · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Array1OfConnectedEdgeSet** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfConnectedFaceSet** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfEdge** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfFace** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfFaceBound** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfGeometricSetSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfOrientedClosedShell** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfOrientedEdge** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfShapeDimensionRepresentationItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfShell** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Array1OfValueQualifier** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepShape_Block** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, Position, SetPosition, SetX, SetY, SetZ, X, Y, Z · *statiques :* get_type_descriptor, get_type_name
- **StepShape_BooleanOperand** : BooleanResult, CsgPrimitive, HalfSpaceSolid, SetBooleanResult, SetCsgPrimitive, SetHalfSpaceSolid, SetSolidModel, SetTypeOfContent, SolidModel, TypeOfContent
- **StepShape_BooleanOperator** · *statiques :* StepShape_boDifference, StepShape_boIntersection, StepShape_boUnion
- **StepShape_BooleanResult** ← StepGeom_GeometricRepresentationItem : DynamicType, FirstOperand, Init, Operator, SecondOperand, SetFirstOperand, SetOperator, SetSecondOperand · *statiques :* get_type_descriptor, get_type_name
- **StepShape_BoxDomain** ← Standard_Transient : Corner, DynamicType, Init, SetCorner, SetXlength, SetYlength, SetZlength, Xlength, Ylength, Zlength · *statiques :* get_type_descriptor, get_type_name
- **StepShape_BoxedHalfSpace** ← StepShape_HalfSpaceSolid : DynamicType, Enclosure, Init, SetEnclosure · *statiques :* get_type_descriptor, get_type_name
- **StepShape_BrepWithVoids** ← StepShape_ManifoldSolidBrep : DynamicType, Init, NbVoids, SetVoids, Voids, VoidsValue · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ClosedShell** ← StepShape_ConnectedFaceSet : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_CompoundShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ConnectedEdgeSet** ← StepShape_TopologicalRepresentationItem : CesEdges, DynamicType, Init, SetCesEdges · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ConnectedFaceSet** ← StepShape_TopologicalRepresentationItem : CfsFaces, CfsFacesValue, DynamicType, Init, NbCfsFaces, SetCfsFaces · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ConnectedFaceShapeRepresentation** ← StepRepr_Representation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ConnectedFaceSubSet** ← StepShape_ConnectedFaceSet : DynamicType, ParentFaceSet, SetParentFaceSet · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ContextDependentShapeRepresentation** ← Standard_Transient : DynamicType, Init, RepresentationRelation, RepresentedProductRelation, SetRepresentationRelation, SetRepresentedProductRelation · *statiques :* get_type_descriptor, get_type_name
- **StepShape_CsgPrimitive** ← StepData_SelectType : Block, CaseNum, RightAngularWedge, RightCircularCone, RightCircularCylinder, Sphere, Torus
- **StepShape_CsgSelect** : BooleanResult, CsgPrimitive, SetBooleanResult, SetCsgPrimitive, SetTypeOfContent, TypeOfContent
- **StepShape_CsgShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_CsgSolid** ← StepShape_SolidModel : DynamicType, Init, SetTreeRootExpression, TreeRootExpression · *statiques :* get_type_descriptor, get_type_name
- **StepShape_DefinitionalRepresentationAndShapeRepresentation** ← StepRepr_DefinitionalRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_DimensionalCharacteristic** ← StepData_SelectType : CaseNum, DimensionalLocation, DimensionalSize
- **StepShape_DimensionalCharacteristicRepresentation** ← Standard_Transient : Dimension, DynamicType, Init, Representation, SetDimension, SetRepresentation · *statiques :* get_type_descriptor, get_type_name
- **StepShape_DimensionalLocation** ← StepRepr_ShapeAspectRelationship : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_DimensionalLocationWithPath** ← StepShape_DimensionalLocation : DynamicType, Init, Path, SetPath · *statiques :* get_type_descriptor, get_type_name
- **StepShape_DimensionalSize** ← Standard_Transient : AppliesTo, DynamicType, Init, Name, SetAppliesTo, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepShape_DimensionalSizeWithPath** ← StepShape_DimensionalSize : DynamicType, Init, Path, SetPath · *statiques :* get_type_descriptor, get_type_name
- **StepShape_DirectedDimensionalLocation** ← StepShape_DimensionalLocation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Edge** ← StepShape_TopologicalRepresentationItem : DynamicType, EdgeEnd, EdgeStart, Init, SetEdgeEnd, SetEdgeStart · *statiques :* get_type_descriptor, get_type_name
- **StepShape_EdgeBasedWireframeModel** ← StepGeom_GeometricRepresentationItem : DynamicType, EbwmBoundary, Init, SetEbwmBoundary · *statiques :* get_type_descriptor, get_type_name
- **StepShape_EdgeBasedWireframeShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_EdgeCurve** ← StepShape_Edge : DynamicType, EdgeGeometry, SameSense, SetEdgeGeometry, SetSameSense · *statiques :* get_type_descriptor, get_type_name
- **StepShape_EdgeLoop** ← StepShape_Loop : DynamicType, EdgeList, EdgeListValue, Init, NbEdgeList, SetEdgeList · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ExtrudedAreaSolid** ← StepShape_SweptAreaSolid : Depth, DynamicType, ExtrudedDirection, Init, SetDepth, SetExtrudedDirection · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ExtrudedFaceSolid** ← StepShape_SweptFaceSolid : Depth, DynamicType, ExtrudedDirection, Init, SetDepth, SetExtrudedDirection · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Face** ← StepShape_TopologicalRepresentationItem : Bounds, BoundsValue, DynamicType, Init, NbBounds, SetBounds · *statiques :* get_type_descriptor, get_type_name
- **StepShape_FaceBasedSurfaceModel** ← StepGeom_GeometricRepresentationItem : DynamicType, FbsmFaces, Init, SetFbsmFaces · *statiques :* get_type_descriptor, get_type_name
- **StepShape_FaceBound** ← StepShape_TopologicalRepresentationItem : Bound, DynamicType, Init, Orientation, SetBound, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **StepShape_FaceOuterBound** ← StepShape_FaceBound : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_FaceSurface** ← StepShape_Face : DynamicType, FaceGeometry, SameSense, SetFaceGeometry, SetSameSense · *statiques :* get_type_descriptor, get_type_name
- **StepShape_FacetedBrep** ← StepShape_ManifoldSolidBrep : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_FacetedBrepAndBrepWithVoids** ← StepShape_ManifoldSolidBrep : BrepWithVoids, DynamicType, FacetedBrep, Init, NbVoids, SetBrepWithVoids, SetFacetedBrep, SetVoids, Voids, VoidsValue · *statiques :* get_type_descriptor, get_type_name
- **StepShape_FacetedBrepShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_GeometricCurveSet** ← StepShape_GeometricSet : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_GeometricSet** ← StepGeom_GeometricRepresentationItem : DynamicType, Elements, ElementsValue, Init, NbElements, SetElements · *statiques :* get_type_descriptor, get_type_name
- **StepShape_GeometricSetSelect** ← StepData_SelectType : CaseNum, Curve, Point, Surface
- **StepShape_GeometricallyBoundedSurfaceShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_GeometricallyBoundedWireframeShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_HalfSpaceSolid** ← StepGeom_GeometricRepresentationItem : AgreementFlag, BaseSurface, DynamicType, Init, SetAgreementFlag, SetBaseSurface · *statiques :* get_type_descriptor, get_type_name
- **StepShape_LimitsAndFits** ← Standard_Transient : DynamicType, FormVariance, Grade, Init, SetFormVariance, SetGrade, SetSource, SetZoneVariance, Source, ZoneVariance · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Loop** ← StepShape_TopologicalRepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_LoopAndPath** ← StepShape_TopologicalRepresentationItem : DynamicType, EdgeList, EdgeListValue, Init, Loop, NbEdgeList, Path, SetEdgeList, SetLoop, SetPath · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ManifoldSolidBrep** ← StepShape_SolidModel : DynamicType, Init, Outer, SetOuter · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ManifoldSurfaceShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_MeasureQualification** ← Standard_Transient : Description, DynamicType, Init, Name, NbQualifiers, QualifiedMeasure, Qualifiers, QualifiersValue, SetDescription, SetName, SetQualifiedMeasure, SetQualifiers, SetQualifiersValue · *statiques :* get_type_descriptor, get_type_name
- **StepShape_MeasureRepresentationItemAndQualifiedRepresentationItem** ← StepRepr_RepresentationItem : DynamicType, Init, Measure, NbQualifiers, Qualifiers, QualifiersValue, SetMeasure, SetQualifiers, SetQualifiersValue · *statiques :* get_type_descriptor, get_type_name
- **StepShape_NonManifoldSurfaceShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_OpenShell** ← StepShape_ConnectedFaceSet : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_OrientedClosedShell** ← StepShape_ClosedShell : CfsFaces, CfsFacesValue, ClosedShellElement, DynamicType, Init, NbCfsFaces, Orientation, SetCfsFaces, SetClosedShellElement, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **StepShape_OrientedEdge** ← StepShape_Edge : DynamicType, EdgeElement, EdgeEnd, EdgeStart, Orientation, SetEdgeElement, SetEdgeEnd, SetEdgeStart, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **StepShape_OrientedFace** ← StepShape_Face : Bounds, BoundsValue, DynamicType, FaceElement, NbBounds, Orientation, SetBounds, SetFaceElement, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **StepShape_OrientedOpenShell** ← StepShape_OpenShell : CfsFaces, CfsFacesValue, DynamicType, NbCfsFaces, OpenShellElement, Orientation, SetCfsFaces, SetOpenShellElement, SetOrientation · *statiques :* get_type_descriptor, get_type_name
- **StepShape_OrientedPath** ← StepShape_Path : DynamicType, EdgeList, EdgeListValue, Init, NbEdgeList, Orientation, PathElement, SetEdgeList, SetOrientation, SetPathElement · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Path** ← StepShape_TopologicalRepresentationItem : DynamicType, EdgeList, EdgeListValue, Init, NbEdgeList, SetEdgeList · *statiques :* get_type_descriptor, get_type_name
- **StepShape_PlusMinusTolerance** ← Standard_Transient : DynamicType, Init, Range, SetRange, SetTolerancedDimension, TolerancedDimension · *statiques :* get_type_descriptor, get_type_name
- **StepShape_PointRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_PolyLoop** ← StepShape_Loop : DynamicType, Init, NbPolygon, Polygon, PolygonValue, SetPolygon · *statiques :* get_type_descriptor, get_type_name
- **StepShape_PrecisionQualifier** ← Standard_Transient : DynamicType, Init, PrecisionValue, SetPrecisionValue · *statiques :* get_type_descriptor, get_type_name
- **StepShape_QualifiedRepresentationItem** ← StepRepr_RepresentationItem : DynamicType, Init, NbQualifiers, Qualifiers, QualifiersValue, SetQualifiers, SetQualifiersValue · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ReversibleTopologyItem** ← StepData_SelectType : CaseNum, ClosedShell, Edge, Face, FaceBound, OpenShell, Path
- **StepShape_RevolvedAreaSolid** ← StepShape_SweptAreaSolid : Angle, Axis, DynamicType, Init, SetAngle, SetAxis · *statiques :* get_type_descriptor, get_type_name
- **StepShape_RevolvedFaceSolid** ← StepShape_SweptFaceSolid : Angle, Axis, DynamicType, Init, SetAngle, SetAxis · *statiques :* get_type_descriptor, get_type_name
- **StepShape_RightAngularWedge** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, Ltx, Position, SetLtx, SetPosition, SetX, SetY, SetZ, X, Y, Z · *statiques :* get_type_descriptor, get_type_name
- **StepShape_RightCircularCone** ← StepGeom_GeometricRepresentationItem : DynamicType, Height, Init, Position, Radius, SemiAngle, SetHeight, SetPosition, SetRadius, SetSemiAngle · *statiques :* get_type_descriptor, get_type_name
- **StepShape_RightCircularCylinder** ← StepGeom_GeometricRepresentationItem : DynamicType, Height, Init, Position, Radius, SetHeight, SetPosition, SetRadius · *statiques :* get_type_descriptor, get_type_name
- **StepShape_SeamEdge** ← StepShape_OrientedEdge : DynamicType, PcurveReference, SetPcurveReference · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ShapeDefinitionRepresentation** ← StepRepr_PropertyDefinitionRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ShapeDimensionRepresentation** ← StepShape_ShapeRepresentation : DynamicType, Init, ItemsAP242, SetItemsAP242 · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ShapeDimensionRepresentationItem** ← StepData_SelectType : CaseNum, CompoundRepresentationItem, DescriptiveRepresentationItem, MeasureRepresentationItem, Placement
- **StepShape_ShapeRepresentation** ← StepRepr_Representation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ShapeRepresentationWithParameters** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Shell** ← StepData_SelectType : CaseNum, ClosedShell, OpenShell
- **StepShape_ShellBasedSurfaceModel** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, NbSbsmBoundary, SbsmBoundary, SbsmBoundaryValue, SetSbsmBoundary · *statiques :* get_type_descriptor, get_type_name
- **StepShape_SolidModel** ← StepGeom_GeometricRepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_SolidReplica** ← StepShape_SolidModel : DynamicType, Init, ParentSolid, SetParentSolid, SetTransformation, Transformation · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Sphere** ← StepGeom_GeometricRepresentationItem : Centre, DynamicType, Init, Radius, SetCentre, SetRadius · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Subedge** ← StepShape_Edge : DynamicType, ParentEdge, SetParentEdge · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Subface** ← StepShape_Face : DynamicType, ParentFace, SetParentFace · *statiques :* get_type_descriptor, get_type_name
- **StepShape_SurfaceModel** ← StepData_SelectType : CaseNum, ShellBasedSurfaceModel
- **StepShape_SweptAreaSolid** ← StepShape_SolidModel : DynamicType, Init, SetSweptArea, SweptArea · *statiques :* get_type_descriptor, get_type_name
- **StepShape_SweptFaceSolid** ← StepShape_SolidModel : DynamicType, Init, SetSweptFace, SweptFace · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ToleranceMethodDefinition** ← StepData_SelectType : CaseNum, LimitsAndFits, ToleranceValue
- **StepShape_ToleranceValue** ← Standard_Transient : DynamicType, Init, LowerBound, SetLowerBound, SetUpperBound, UpperBound · *statiques :* get_type_descriptor, get_type_name
- **StepShape_TopologicalRepresentationItem** ← StepRepr_RepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_Torus** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, MajorRadius, MinorRadius, Position, SetMajorRadius, SetMinorRadius, SetPosition · *statiques :* get_type_descriptor, get_type_name
- **StepShape_TransitionalShapeRepresentation** ← StepShape_ShapeRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_TypeQualifier** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ValueFormatTypeQualifier** ← Standard_Transient : DynamicType, FormatType, Init, SetFormatType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_ValueQualifier** ← StepData_SelectType : CaseNum, PrecisionQualifier, TypeQualifier, ValueFormatTypeQualifier
- **StepShape_Vertex** ← StepShape_TopologicalRepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepShape_VertexLoop** ← StepShape_Loop : DynamicType, Init, LoopVertex, SetLoopVertex · *statiques :* get_type_descriptor, get_type_name
- **StepShape_VertexPoint** ← StepShape_Vertex : DynamicType, Init, SetVertexGeometry, VertexGeometry · *statiques :* get_type_descriptor, get_type_name

## StepToTopoDS

- **StepToTopoDS_BuilderError** · *statiques :* StepToTopoDS_BuilderDone, StepToTopoDS_BuilderOther
- **StepToTopoDS_CartesianPointHasher** · *statiques :* HashCode, IsEqual
- **StepToTopoDS_GeometricTool** · *statiques :* IsLikeSeam, IsSeamCurve, PCurve, UpdateParam3d
- **StepToTopoDS_GeometricToolError** · *statiques :* StepToTopoDS_GeometricToolDone, StepToTopoDS_GeometricToolHasNoPCurve, StepToTopoDS_GeometricToolIsDegenerated, StepToTopoDS_GeometricToolNoProjectiOnCurve, StepToTopoDS_GeometricToolOther, StepToTopoDS_GeometricToolWrong3dParameters
- **StepToTopoDS_MakeTransformed** ← StepToTopoDS_Root : Compute, Transform, Transformation, TranslateMappedItem
- **StepToTopoDS_NMTool** (2 ctor) : Bind, CleanUp, Find, Init, IsActive, IsBound, IsIDEASCase, IsPureNMShell, IsSuspectedAsClosing, RegisterNMEdge, SetActive, SetIDEASCase
- **StepToTopoDS_PointPair**
- **StepToTopoDS_PointPairHasher** · *statiques :* HashCode, IsEqual
- **StepToTopoDS_Root** : IsDone, MaxTol, Precision, SetMaxTol, SetPrecision
- **StepToTopoDS_Tool** (2 ctor) : AddContinuity, Bind, BindEdge, BindVertex, C0Cur2, C0Cur3, C0Surf, C1Cur2, C1Cur3, C1Surf, C2Cur2, C2Cur3, C2Surf, ClearEdgeMap, ClearVertexMap, ComputePCurve, Find, FindEdge, FindVertex, Init, IsBound, IsEdgeBound, IsVertexBound, TransientProcess
- **StepToTopoDS_TranslateCompositeCurve** ← StepToTopoDS_Root (3 ctor) : Init, IsInfiniteSegment, Value
- **StepToTopoDS_TranslateCurveBoundedSurface** ← StepToTopoDS_Root (2 ctor) : Init, Value
- **StepToTopoDS_TranslateEdge** ← StepToTopoDS_Root (2 ctor) : Error, Init, MakeFromCurve3D, MakePCurve, Value
- **StepToTopoDS_TranslateEdgeError** · *statiques :* StepToTopoDS_TranslateEdgeDone, StepToTopoDS_TranslateEdgeOther
- **StepToTopoDS_TranslateEdgeLoop** ← StepToTopoDS_Root (2 ctor) : Error, Init, Value
- **StepToTopoDS_TranslateEdgeLoopError** · *statiques :* StepToTopoDS_TranslateEdgeLoopDone, StepToTopoDS_TranslateEdgeLoopOther
- **StepToTopoDS_TranslateFace** ← StepToTopoDS_Root (2 ctor) : Error, Init, Value
- **StepToTopoDS_TranslateFaceError** · *statiques :* StepToTopoDS_TranslateFaceDone, StepToTopoDS_TranslateFaceOther
- **StepToTopoDS_TranslatePolyLoop** ← StepToTopoDS_Root (2 ctor) : Error, Init, Value
- **StepToTopoDS_TranslatePolyLoopError** · *statiques :* StepToTopoDS_TranslatePolyLoopDone, StepToTopoDS_TranslatePolyLoopOther
- **StepToTopoDS_TranslateShell** ← StepToTopoDS_Root (2 ctor) : Error, Init, Value
- **StepToTopoDS_TranslateShellError** · *statiques :* StepToTopoDS_TranslateShellDone, StepToTopoDS_TranslateShellOther
- **StepToTopoDS_TranslateVertex** ← StepToTopoDS_Root (2 ctor) : Error, Init, Value
- **StepToTopoDS_TranslateVertexError** · *statiques :* StepToTopoDS_TranslateVertexDone, StepToTopoDS_TranslateVertexOther
- **StepToTopoDS_TranslateVertexLoop** ← StepToTopoDS_Root (2 ctor) : Error, Init, Value
- **StepToTopoDS_TranslateVertexLoopError** · *statiques :* StepToTopoDS_TranslateVertexLoopDone, StepToTopoDS_TranslateVertexLoopOther

## StepVisual

- **StepVisual_AnnotationCurveOccurrence** ← StepVisual_AnnotationOccurrence : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_AnnotationCurveOccurrenceAndAnnotationOccurrenceAndGeomReprItemAndReprItemAndStyledItem** ← StepVisual_AnnotationCurveOccurrence : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_AnnotationFillArea** ← StepShape_GeometricCurveSet : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_AnnotationFillAreaOccurrence** ← StepVisual_AnnotationOccurrence : DynamicType, FillStyleTarget, Init, SetFillStyleTarget · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_AnnotationOccurrence** ← StepVisual_StyledItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_AnnotationPlane** ← StepVisual_AnnotationOccurrence : DynamicType, Elements, ElementsValue, Init, NbElements, SetElements, SetElementsValue · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_AnnotationPlaneElement** ← StepData_SelectType : CaseNum, DraughtingCallout, StyledItem
- **StepVisual_AnnotationText** ← StepRepr_MappedItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_AnnotationTextOccurrence** ← StepVisual_AnnotationOccurrence : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_AreaInSet** ← Standard_Transient : Area, DynamicType, InSet, Init, SetArea, SetInSet · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_AreaOrView** ← StepData_SelectType : CaseNum, PresentationArea, PresentationView
- **StepVisual_Array1OfAnnotationPlaneElement** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfBoxCharacteristicSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfCameraModelD3MultiClippingInterectionSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfCameraModelD3MultiClippingUnionSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfCurveStyleFontPattern** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfDirectionCountSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfDraughtingCalloutElement** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfFillStyleSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfInvisibleItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfLayeredItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfPresentationStyleAssignment** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfPresentationStyleSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfStyleContextSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfSurfaceStyleElementSelect** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfTessellatedItem** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_Array1OfTextOrCharacter** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **StepVisual_BackgroundColour** ← StepVisual_Colour : DynamicType, Init, Presentation, SetPresentation · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_BoxCharacteristicSelect** : RealValue, SetRealValue, SetTypeOfContent, TypeOfContent
- **StepVisual_CameraImage** ← StepRepr_MappedItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CameraImage2dWithScale** ← StepVisual_CameraImage : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CameraImage3dWithScale** ← StepVisual_CameraImage : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CameraModel** ← StepGeom_GeometricRepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CameraModelD2** ← StepVisual_CameraModel : DynamicType, Init, SetViewWindow, SetViewWindowClipping, ViewWindow, ViewWindowClipping · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CameraModelD3** ← StepVisual_CameraModel : DynamicType, Init, PerspectiveOfVolume, SetPerspectiveOfVolume, SetViewReferenceSystem, ViewReferenceSystem · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CameraModelD3MultiClipping** ← StepVisual_CameraModelD3 : DynamicType, SetShapeClipping, ShapeClipping · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CameraModelD3MultiClippingInterectionSelect** ← StepData_SelectType : CameraModelD3MultiClippingUnion, CaseNum, Plane
- **StepVisual_CameraModelD3MultiClippingIntersection** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, SetShapeClipping, ShapeClipping · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CameraModelD3MultiClippingUnion** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, SetShapeClipping, ShapeClipping · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CameraModelD3MultiClippingUnionSelect** ← StepData_SelectType : CameraModelD3MultiClippingIntersection, CaseNum, Plane
- **StepVisual_CameraUsage** ← StepRepr_RepresentationMap : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CentralOrParallel** · *statiques :* StepVisual_copCentral, StepVisual_copParallel
- **StepVisual_CharacterizedObjectAndCharacterizedRepresentationAndDraughtingModelAndRepresentation** ← StepVisual_DraughtingModel : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_Colour** ← Standard_Transient : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_ColourRgb** ← StepVisual_ColourSpecification : Blue, DynamicType, Green, Init, Red, SetBlue, SetGreen, SetRed · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_ColourSpecification** ← StepVisual_Colour : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CompositeText** ← StepGeom_GeometricRepresentationItem : CollectedText, CollectedTextValue, DynamicType, Init, NbCollectedText, SetCollectedText · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CompositeTextWithExtent** ← StepVisual_CompositeText : DynamicType, Extent, SetExtent · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_ContextDependentInvisibility** ← StepVisual_Invisibility : DynamicType, Init, PresentationContext, SetPresentationContext · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_ContextDependentOverRidingStyledItem** ← StepVisual_OverRidingStyledItem : DynamicType, Init, NbStyleContext, SetStyleContext, StyleContext, StyleContextValue · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CoordinatesList** ← StepVisual_TessellatedItem : DynamicType, Init, Points · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CurveStyle** ← Standard_Transient : CurveColour, CurveFont, CurveWidth, DynamicType, Init, Name, SetCurveColour, SetCurveFont, SetCurveWidth, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CurveStyleFont** ← Standard_Transient : DynamicType, Init, Name, NbPatternList, PatternList, PatternListValue, SetName, SetPatternList · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CurveStyleFontPattern** ← Standard_Transient : DynamicType, Init, InvisibleSegmentLength, SetInvisibleSegmentLength, SetVisibleSegmentLength, VisibleSegmentLength · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_CurveStyleFontSelect** ← StepData_SelectType : CaseNum, CurveStyleFont, ExternallyDefinedCurveFont, PreDefinedCurveFont
- **StepVisual_DirectionCountSelect** : SetTypeOfContent, SetUDirectionCount, SetVDirectionCount, TypeOfContent, UDirectionCount, VDirectionCount
- **StepVisual_DraughtingAnnotationOccurrence** ← StepVisual_AnnotationOccurrence : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_DraughtingCallout** ← StepGeom_GeometricRepresentationItem : Contents, ContentsValue, DynamicType, Init, NbContents, SetContents, SetContentsValue · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_DraughtingCalloutElement** ← StepData_SelectType : AnnotationCurveOccurrence, AnnotationFillAreaOccurrence, AnnotationTextOccurrence, CaseNum, TessellatedAnnotationOccurrence
- **StepVisual_DraughtingModel** ← StepRepr_Representation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_DraughtingPreDefinedColour** ← StepVisual_PreDefinedColour : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_DraughtingPreDefinedCurveFont** ← StepVisual_PreDefinedCurveFont : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_ExternallyDefinedCurveFont** ← StepBasic_ExternallyDefinedItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_ExternallyDefinedTextFont** ← StepBasic_ExternallyDefinedItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_FillAreaStyle** ← Standard_Transient : DynamicType, FillStyles, FillStylesValue, Init, Name, NbFillStyles, SetFillStyles, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_FillAreaStyleColour** ← Standard_Transient : DynamicType, FillColour, Init, Name, SetFillColour, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_FillStyleSelect** ← StepData_SelectType : CaseNum, FillAreaStyleColour
- **StepVisual_FontSelect** ← StepData_SelectType : CaseNum, ExternallyDefinedTextFont, PreDefinedTextFont
- **StepVisual_Invisibility** ← Standard_Transient : DynamicType, Init, InvisibleItems, InvisibleItemsValue, NbInvisibleItems, SetInvisibleItems · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_InvisibilityContext** ← StepData_SelectType : CaseNum, DraughtingModel, PresentationRepresentation, PresentationSet
- **StepVisual_InvisibleItem** ← StepData_SelectType : CaseNum, PresentationLayerAssignment, PresentationRepresentation, StyledItem
- **StepVisual_LayeredItem** ← StepData_SelectType : CaseNum, PresentationRepresentation, RepresentationItem
- **StepVisual_MarkerMember** ← StepData_SelectInt : DynamicType, EnumText, HasName, Name, SetEnumText, SetName, SetValue, Value · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_MarkerSelect** ← StepData_SelectType : CaseMem, CaseNum, MarkerMember, NewMember
- **StepVisual_MarkerType** · *statiques :* StepVisual_mtAsterisk, StepVisual_mtDot, StepVisual_mtPlus, StepVisual_mtRing, StepVisual_mtSquare, StepVisual_mtTriangle, StepVisual_mtX
- **StepVisual_MechanicalDesignGeometricPresentationArea** ← StepVisual_PresentationArea : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_MechanicalDesignGeometricPresentationRepresentation** ← StepVisual_PresentationRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_NullStyle** · *statiques :* StepVisual_Null
- **StepVisual_NullStyleMember** ← StepData_SelectInt : DynamicType, EnumText, HasName, Kind, Name, SetEnumText, SetName, SetValue, Value · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_OverRidingStyledItem** ← StepVisual_StyledItem : DynamicType, Init, OverRiddenStyle, SetOverRiddenStyle · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PlanarBox** ← StepVisual_PlanarExtent : DynamicType, Init, Placement, SetPlacement · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PlanarExtent** ← StepGeom_GeometricRepresentationItem : DynamicType, Init, SetSizeInX, SetSizeInY, SizeInX, SizeInY · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PointStyle** ← Standard_Transient : DynamicType, Init, Marker, MarkerColour, MarkerSize, Name, SetMarker, SetMarkerColour, SetMarkerSize, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PreDefinedColour** ← StepVisual_Colour : DynamicType, GetPreDefinedItem, SetPreDefinedItem · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PreDefinedCurveFont** ← StepVisual_PreDefinedItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PreDefinedItem** ← Standard_Transient : DynamicType, Init, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PreDefinedTextFont** ← StepVisual_PreDefinedItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentationArea** ← StepVisual_PresentationRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentationLayerAssignment** ← Standard_Transient : AssignedItems, AssignedItemsValue, Description, DynamicType, Init, Name, NbAssignedItems, SetAssignedItems, SetDescription, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentationLayerUsage** ← Standard_Transient : Assignment, DynamicType, Init, Presentation, SetAssignment, SetPresentation · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentationRepresentation** ← StepRepr_Representation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentationRepresentationSelect** ← StepData_SelectType : CaseNum, PresentationRepresentation, PresentationSet
- **StepVisual_PresentationSet** ← Standard_Transient : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentationSize** ← Standard_Transient : DynamicType, Init, SetSize, SetUnit, Size, Unit · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentationSizeAssignmentSelect** ← StepData_SelectType : AreaInSet, CaseNum, PresentationArea, PresentationView
- **StepVisual_PresentationStyleAssignment** ← Standard_Transient : DynamicType, Init, NbStyles, SetStyles, Styles, StylesValue · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentationStyleByContext** ← StepVisual_PresentationStyleAssignment : DynamicType, Init, SetStyleContext, StyleContext · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentationStyleSelect** ← StepData_SelectType : CaseNum, CurveStyle, NullStyle, PointStyle, SurfaceStyleUsage
- **StepVisual_PresentationView** ← StepVisual_PresentationRepresentation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentedItem** ← Standard_Transient : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_PresentedItemRepresentation** ← Standard_Transient : DynamicType, Init, Item, Presentation, SetItem, SetPresentation · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_StyleContextSelect** ← StepData_SelectType : CaseNum, PresentationSet, Representation, RepresentationItem
- **StepVisual_StyledItem** ← StepRepr_RepresentationItem : DynamicType, Init, Item, ItemAP242, NbStyles, SetItem, SetStyles, Styles, StylesValue · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_StyledItemTarget** ← StepData_SelectType : CaseNum, GeometricRepresentationItem, MappedItem, Representation, TopologicalRepresentationItem
- **StepVisual_SurfaceSide** · *statiques :* StepVisual_ssBoth, StepVisual_ssNegative, StepVisual_ssPositive
- **StepVisual_SurfaceSideStyle** ← Standard_Transient : DynamicType, Init, Name, NbStyles, SetName, SetStyles, Styles, StylesValue · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_SurfaceStyleBoundary** ← Standard_Transient : DynamicType, Init, SetStyleOfBoundary, StyleOfBoundary · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_SurfaceStyleControlGrid** ← Standard_Transient : DynamicType, Init, SetStyleOfControlGrid, StyleOfControlGrid · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_SurfaceStyleElementSelect** ← StepData_SelectType : CaseNum, SurfaceStyleBoundary, SurfaceStyleFillArea, SurfaceStyleParameterLine
- **StepVisual_SurfaceStyleFillArea** ← Standard_Transient : DynamicType, FillArea, Init, SetFillArea · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_SurfaceStyleParameterLine** ← Standard_Transient : DirectionCounts, DirectionCountsValue, DynamicType, Init, NbDirectionCounts, SetDirectionCounts, SetStyleOfParameterLines, StyleOfParameterLines · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_SurfaceStyleSegmentationCurve** ← Standard_Transient : DynamicType, Init, SetStyleOfSegmentationCurve, StyleOfSegmentationCurve · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_SurfaceStyleSilhouette** ← Standard_Transient : DynamicType, Init, SetStyleOfSilhouette, StyleOfSilhouette · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_SurfaceStyleUsage** ← Standard_Transient : DynamicType, Init, SetSide, SetStyle, Side, Style · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_Template** ← StepRepr_Representation : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_TemplateInstance** ← StepRepr_MappedItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_TessellatedAnnotationOccurrence** ← StepVisual_StyledItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_TessellatedCurveSet** ← StepVisual_TessellatedItem : CoordList, Curves, DynamicType, Init · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_TessellatedGeometricSet** ← StepVisual_TessellatedItem : DynamicType, Init, Items · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_TessellatedItem** ← StepGeom_GeometricRepresentationItem : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_TextLiteral** ← StepGeom_GeometricRepresentationItem : Alignment, DynamicType, Font, Init, Literal, Path, Placement, SetAlignment, SetFont, SetLiteral, SetPath, SetPlacement · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_TextOrCharacter** ← StepData_SelectType : AnnotationText, CaseNum, CompositeText, TextLiteral
- **StepVisual_TextPath** · *statiques :* StepVisual_tpDown, StepVisual_tpLeft, StepVisual_tpRight, StepVisual_tpUp
- **StepVisual_TextStyle** ← Standard_Transient : CharacterAppearance, DynamicType, Init, Name, SetCharacterAppearance, SetName · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_TextStyleForDefinedFont** ← Standard_Transient : DynamicType, Init, SetTextColour, TextColour · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_TextStyleWithBoxCharacteristics** ← StepVisual_TextStyle : Characteristics, CharacteristicsValue, DynamicType, Init, NbCharacteristics, SetCharacteristics · *statiques :* get_type_descriptor, get_type_name
- **StepVisual_ViewVolume** ← Standard_Transient : BackPlaneClipping, BackPlaneDistance, DynamicType, FrontPlaneClipping, FrontPlaneDistance, Init, ProjectionPoint, ProjectionType, SetBackPlaneClipping, SetBackPlaneDistance, SetFrontPlaneClipping, SetFrontPlaneDistance, SetProjectionPoint, SetProjectionType, SetViewPlaneDistance, SetViewVolumeSidesClipping, SetViewWindow, ViewPlaneDistance, ViewVolumeSidesClipping, ViewWindow · *statiques :* get_type_descriptor, get_type_name

## StlAPI

- **StlAPI_Reader** : Read
- **StlAPI_Writer** : ASCIIMode, Write

## Storage

- **Storage_ArrayOfCallBack** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Storage_ArrayOfSchema** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Storage_Bucket** (2 ctor) : Clear
- **Storage_BucketIterator** : Init, More, Next, Reset, Value
- **Storage_BucketOfPersistent** : Append, Clear, Length, Value
- **Storage_CallBack** ← Standard_Transient : Add, DynamicType, New, Read, Write · *statiques :* get_type_descriptor, get_type_name
- **Storage_Data** ← Standard_Transient : AddRoot, AddToComments, AddToUserInfo, ApplicationName, ApplicationVersion, Clear, ClearErrorStatus, Comments, CreationDate, DataType, DynamicType, ErrorStatus, ErrorStatusExtension, Find, HeaderData, InternalData, IsRoot, IsType, NumberOfObjects, NumberOfRoots, NumberOfTypes, RemoveRoot, RootData, Roots, SchemaName, SchemaVersion, SetApplicationName, SetApplicationVersion, SetDataType, StorageVersion, TypeData, Types, UserInfo · *statiques :* get_type_descriptor, get_type_name
- **Storage_DefaultCallBack** ← Storage_CallBack : Add, DynamicType, New, Read, Write · *statiques :* get_type_descriptor, get_type_name
- **Storage_Error** · *statiques :* Storage_VSAlreadyOpen, Storage_VSCloseError, Storage_VSExtCharParityError, Storage_VSFormatError, Storage_VSInternalError, Storage_VSModeError, Storage_VSNotOpen, Storage_VSOk, Storage_VSOpenError, Storage_VSSectionNotFound, Storage_VSTypeMismatch, Storage_VSUnknownType, Storage_VSWriteError, Storage_VSWrongFileDriver
- **Storage_HeaderData** ← Standard_Transient : AddToComments, AddToUserInfo, ApplicationName, ApplicationVersion, ClearErrorStatus, Comments, CreationDate, DataType, DynamicType, ErrorStatus, ErrorStatusExtension, NumberOfObjects, Read, SchemaName, SchemaVersion, SetApplicationName, SetApplicationVersion, SetCreationDate, SetDataType, SetNumberOfObjects, SetSchemaName, SetSchemaVersion, SetStorageVersion, StorageVersion, UserInfo · *statiques :* get_type_descriptor, get_type_name
- **Storage_InternalData** ← Standard_Transient : Clear, DynamicType, ReadArray · *statiques :* get_type_descriptor, get_type_name
- **Storage_OpenMode** · *statiques :* Storage_VSNone, Storage_VSRead, Storage_VSReadWrite, Storage_VSWrite
- **Storage_PArray** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **Storage_Root** ← Standard_Transient (3 ctor) : DynamicType, Name, Object, Reference, SetName, SetObject, SetReference, SetType, Type · *statiques :* get_type_descriptor, get_type_name
- **Storage_RootData** ← Standard_Transient : AddRoot, ClearErrorStatus, DynamicType, ErrorStatus, ErrorStatusExtension, Find, IsRoot, NumberOfRoots, Read, RemoveRoot, Roots, UpdateRoot · *statiques :* get_type_descriptor, get_type_name
- **Storage_Schema** ← Standard_Transient : AddPersistent, AddReadUnknownTypeCallBack, ClearCallBackList, DefaultCallBack, DontUseDefaultCallBack, DynamicType, InstalledCallBackList, IsUsingDefaultCallBack, Name, PersistentToAdd, RemoveReadUnknownTypeCallBack, ResetDefaultCallBack, SetDefaultCallBack, SetName, SetVersion, UseDefaultCallBack, Version, Write, WritePersistentObjectHeader, WritePersistentReference · *statiques :* CheckTypeMigration, ICreationDate, get_type_descriptor, get_type_name
- **Storage_SolveMode** · *statiques :* Storage_AddSolve, Storage_ReadSolve, Storage_WriteSolve
- **Storage_StreamExtCharParityError** ← Storage_StreamReadError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Storage_StreamFormatError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Storage_StreamModeError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Storage_StreamReadError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Storage_StreamTypeMismatchError** ← Storage_StreamReadError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Storage_StreamUnknownTypeError** ← Storage_StreamReadError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Storage_StreamWriteError** ← Standard_Failure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Storage_TypeData** ← Standard_Transient : AddType, Clear, ClearErrorStatus, DynamicType, ErrorStatus, ErrorStatusExtension, IsType, NumberOfTypes, Read, Type, Types · *statiques :* get_type_descriptor, get_type_name
- **Storage_TypedCallBack** ← Standard_Transient (2 ctor) : CallBack, DynamicType, Index, SetCallBack, SetIndex, SetType, Type · *statiques :* get_type_descriptor, get_type_name

## Sweep

- **Sweep_NumShape** (2 ctor) : BegInfinite, Closed, EndInfinite, Index, Init, Orientation, Type
- **Sweep_NumShapeIterator** : Init, More, Next, Orientation, Value
- **Sweep_NumShapeTool** : FirstVertex, HasFirstVertex, HasLastVertex, Index, LastVertex, NbShapes, Orientation, Shape, Type

## TColGeom

- **TColGeom_Array1OfBSplineCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColGeom_Array1OfBezierCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColGeom_Array1OfCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColGeom_Array1OfSurface** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## TColGeom2d

- **TColGeom2d_Array1OfBSplineCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColGeom2d_Array1OfBezierCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColGeom2d_Array1OfCurve** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## TColgp

- **TColgp_Array1OfCirc2d** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColgp_Array1OfDir** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColgp_Array1OfDir2d** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColgp_Array1OfLin2d** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColgp_Array1OfPnt** ★ (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColgp_Array1OfPnt2d** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColgp_Array1OfVec** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColgp_Array1OfVec2d** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColgp_Array1OfXY** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColgp_Array1OfXYZ** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## TCollection

- **TCollection_AsciiString** (14 ctor) : AssignCat, Capitalize, Cat, Center, ChangeAll, Clear, Copy, EndsWith, FirstLocationInSet, FirstLocationNotInSet, Insert, InsertAfter, InsertBefore, IntegerValue, IsAscii, IsDifferent, IsEmpty, IsEqual, IsGreater, IsIntegerValue, IsLess, IsRealValue, LeftAdjust, LeftJustify, Length, Location, LowerCase, Prepend, Print, Read, RealValue, Remove, RemoveAll, RightAdjust, RightJustify, Search, SearchFromEnd, SetValue, Split, StartsWith, SubString, Swap, ToCString, Token, Trunc, UpperCase, UsefullLength, Value · *statiques :* HashCode, IsEqual, IsSameString
- **TCollection_BaseSequence** : Exchange, IsEmpty, Length, Reverse
- **TCollection_BasicMap** : Extent, IsEmpty, NbBuckets, Statistics
- **TCollection_BasicMapIterator** : More, Next, Reset
- **TCollection_ExtendedString** (12 ctor) : AssignCat, Cat, ChangeAll, Clear, Copy, EndsWith, Insert, IsAscii, IsDifferent, IsEmpty, IsEqual, IsGreater, IsLess, Length, LengthOfCString, Print, Remove, RemoveAll, Search, SearchFromEnd, SetValue, Split, StartsWith, Swap, ToExtString, ToUTF8CString, Token, Trunc, Value · *statiques :* HashCode, IsEqual
- **TCollection_HAsciiString** ← Standard_Transient (9 ctor) : AssignCat, Capitalize, Cat, Center, ChangeAll, Clear, DynamicType, FirstLocationInSet, FirstLocationNotInSet, Insert, InsertAfter, InsertBefore, IntegerValue, IsAscii, IsDifferent, IsEmpty, IsGreater, IsIntegerValue, IsLess, IsRealValue, IsSameState, IsSameString, LeftAdjust, LeftJustify, Length, Location, LowerCase, Prepend, Print, RealValue, Remove, RemoveAll, RightAdjust, RightJustify, Search, SearchFromEnd, SetValue, Split, String, SubString, ToCString, Token, Trunc, UpperCase, UsefullLength, Value · *statiques :* get_type_descriptor, get_type_name
- **TCollection_HExtendedString** ← Standard_Transient (8 ctor) : AssignCat, Cat, ChangeAll, Clear, DynamicType, Insert, IsAscii, IsEmpty, IsGreater, IsLess, IsSameState, Length, Print, Remove, RemoveAll, Search, SearchFromEnd, SetValue, Split, String, ToExtString, Token, Trunc, Value · *statiques :* get_type_descriptor, get_type_name
- **TCollection_MapNode** ← Standard_Transient : DynamicType, Next · *statiques :* get_type_descriptor, get_type_name
- **TCollection_SeqNode** ← Standard_Transient : DynamicType, Next, Previous · *statiques :* get_type_descriptor, get_type_name
- **TCollection_Side** · *statiques :* TCollection_Left, TCollection_Right

## TColStd

- **TColStd_Array1OfAsciiString** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColStd_Array1OfBoolean** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColStd_Array1OfByte** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColStd_Array1OfCharacter** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColStd_Array1OfExtendedString** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColStd_Array1OfInteger** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColStd_Array1OfListOfInteger** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColStd_Array1OfReal** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColStd_Array1OfTransient** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TColStd_HPackedMapOfInteger** ← Standard_Transient (2 ctor) : ChangeMap, DynamicType, Map · *statiques :* get_type_descriptor, get_type_name
- **TColStd_ListOfAsciiString** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TColStd_ListOfInteger** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TColStd_ListOfReal** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TColStd_ListOfTransient** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TColStd_PackedMapOfInteger** (2 ctor) : Add, Assign, Clear, Contains, Differ, Difference, Extent, GetMaximalMapped, GetMinimalMapped, HasIntersection, Intersect, Intersection, IsEmpty, IsEqual, IsSubset, NbBuckets, ReSize, Remove, Statistics, Subtract, Subtraction, Union, Unite

## TDataStd

- **TDataStd_AsciiString** ← TDF_Attribute : DynamicType, Get, ID, IsEmpty, NewEmpty, Paste, Restore, Set, SetID · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_BooleanArray** ← TDF_Attribute : DynamicType, ID, Init, InternalArray, Length, Lower, NewEmpty, Paste, Restore, SetID, SetInternalArray, SetValue, Upper, Value · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_BooleanList** ← TDF_Attribute : Append, Clear, DynamicType, Extent, First, ID, InsertAfter, InsertBefore, IsEmpty, Last, List, NewEmpty, Paste, Prepend, Remove, Restore, SetID · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_ByteArray** ← TDF_Attribute : ChangeArray, DeltaOnModification, DynamicType, GetDelta, ID, Init, InternalArray, Length, Lower, NewEmpty, Paste, Restore, SetDelta, SetID, SetValue, Upper, Value · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_ChildNodeIterator** (2 ctor) : Initialize, More, Next, NextBrother, Value
- **TDataStd_Comment** ← TDF_Attribute : AfterRetrieval, DynamicType, Get, ID, NewEmpty, Paste, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_Current** ← TDF_Attribute : DynamicType, GetLabel, ID, NewEmpty, Paste, Restore, SetLabel · *statiques :* Get, GetID, Has, Set, get_type_descriptor, get_type_name
- **TDataStd_DeltaOnModificationOfByteArray** ← TDF_DeltaOnModification : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_DeltaOnModificationOfExtStringArray** ← TDF_DeltaOnModification : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_DeltaOnModificationOfIntArray** ← TDF_DeltaOnModification : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_DeltaOnModificationOfIntPackedMap** ← TDF_DeltaOnModification : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_DeltaOnModificationOfRealArray** ← TDF_DeltaOnModification : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_Directory** ← TDF_Attribute : DynamicType, ID, NewEmpty, Paste, References, Restore · *statiques :* AddDirectory, Find, GetID, MakeObjectLabel, New, get_type_descriptor, get_type_name
- **TDataStd_Expression** ← TDF_Attribute : DynamicType, GetExpression, GetVariables, ID, Name, NewEmpty, Paste, Restore, SetExpression · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_ExtStringArray** ← TDF_Attribute : Array, ChangeArray, DeltaOnModification, DynamicType, GetDelta, ID, Init, Length, Lower, NewEmpty, Paste, Restore, SetDelta, SetID, SetValue, Upper, Value · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_ExtStringList** ← TDF_Attribute : Append, Clear, DynamicType, Extent, First, ID, InsertAfter, InsertBefore, IsEmpty, Last, List, NewEmpty, Paste, Prepend, Remove, Restore, SetID · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_HDataMapOfStringByte** ← Standard_Transient (2 ctor) : ChangeMap, DynamicType, Map · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_HDataMapOfStringHArray1OfInteger** ← Standard_Transient (2 ctor) : ChangeMap, DynamicType, Map · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_HDataMapOfStringHArray1OfReal** ← Standard_Transient (2 ctor) : ChangeMap, DynamicType, Map · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_HDataMapOfStringInteger** ← Standard_Transient (2 ctor) : ChangeMap, DynamicType, Map · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_HDataMapOfStringReal** ← Standard_Transient (2 ctor) : ChangeMap, DynamicType, Map · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_HDataMapOfStringString** ← Standard_Transient (2 ctor) : ChangeMap, DynamicType, Map · *statiques :* get_type_descriptor, get_type_name
- **TDataStd_IntPackedMap** ← TDF_Attribute : Add, ChangeMap, Clear, Contains, DeltaOnModification, DynamicType, Extent, GetDelta, GetHMap, GetMap, ID, IsEmpty, NewEmpty, Paste, Remove, Restore, SetDelta · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_Integer** ← TDF_Attribute : DynamicType, Get, ID, IsCaptured, NewEmpty, Paste, Restore, Set, SetID · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_IntegerArray** ← TDF_Attribute : Array, ChangeArray, DeltaOnModification, DynamicType, GetDelta, ID, Init, Length, Lower, NewEmpty, Paste, Restore, SetDelta, SetID, SetValue, Upper, Value · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_IntegerList** ← TDF_Attribute : Append, Clear, DynamicType, Extent, First, ID, InsertAfter, InsertAfterByIndex, InsertBefore, InsertBeforeByIndex, IsEmpty, Last, List, NewEmpty, Paste, Prepend, Remove, RemoveByIndex, Restore, SetID · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_LabelArray1** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TDataStd_ListOfByte** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TDataStd_ListOfExtendedString** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TDataStd_Name** ← TDF_Attribute : DynamicType, Get, ID, NewEmpty, Paste, Restore, Set, SetID · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_NamedData** ← TDF_Attribute : ChangeArraysOfIntegers, ChangeArraysOfReals, ChangeBytes, ChangeIntegers, ChangeReals, ChangeStrings, DynamicType, GetArrayOfIntegers, GetArrayOfReals, GetArraysOfIntegersContainer, GetArraysOfRealsContainer, GetByte, GetBytesContainer, GetInteger, GetIntegersContainer, GetReal, GetRealsContainer, GetString, GetStringsContainer, HasArrayOfIntegers, HasArrayOfReals, HasArraysOfIntegers, HasArraysOfReals, HasByte, HasBytes, HasInteger, HasIntegers, HasReal, HasReals, HasString, HasStrings, ID, NewEmpty, Paste, Restore, SetArrayOfIntegers, SetArrayOfReals, SetByte, SetInteger, SetReal, SetString · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_NoteBook** ← TDF_Attribute : Append, DynamicType, ID, NewEmpty, Paste, Restore · *statiques :* Find, GetID, New, get_type_descriptor, get_type_name
- **TDataStd_Real** ← TDF_Attribute : DynamicType, Get, GetDimension, ID, IsCaptured, NewEmpty, Paste, Restore, Set, SetDimension, SetID · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_RealArray** ← TDF_Attribute : Array, ChangeArray, DeltaOnModification, DynamicType, GetDelta, ID, Init, Length, Lower, NewEmpty, Paste, Restore, SetDelta, SetID, SetValue, Upper, Value · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_RealEnum** · *statiques :* TDataStd_ANGULAR, TDataStd_LENGTH, TDataStd_SCALAR
- **TDataStd_RealList** ← TDF_Attribute : Append, Clear, DynamicType, Extent, First, ID, InsertAfter, InsertAfterByIndex, InsertBefore, InsertBeforeByIndex, IsEmpty, Last, List, NewEmpty, Paste, Prepend, Remove, RemoveByIndex, Restore, SetID · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_ReferenceArray** ← TDF_Attribute : DynamicType, ID, Init, InternalArray, Length, Lower, NewEmpty, Paste, References, Restore, SetID, SetInternalArray, SetValue, Upper, Value · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_ReferenceList** ← TDF_Attribute : Append, Clear, DynamicType, Extent, First, ID, InsertAfter, InsertBefore, IsEmpty, Last, List, NewEmpty, Paste, Prepend, References, Remove, Restore, SetID · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_Relation** ← TDF_Attribute : DynamicType, GetRelation, GetVariables, ID, Name, NewEmpty, Paste, Restore, SetRelation · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_Tick** ← TDF_Attribute : DynamicType, ID, NewEmpty, Paste, Restore · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataStd_TreeNode** ← TDF_Attribute : AfterAddition, AfterResume, AfterUndo, Append, BeforeForget, BeforeUndo, Depth, DynamicType, Father, FindLast, First, HasFather, HasFirst, HasLast, HasNext, HasPrevious, ID, InsertAfter, InsertBefore, IsAscendant, IsChild, IsDescendant, IsFather, IsRoot, Last, NbChildren, NewEmpty, Next, Paste, Prepend, Previous, References, Remove, Restore, Root, SetFather, SetFirst, SetLast, SetNext, SetPrevious, SetTreeID · *statiques :* Find, GetDefaultTreeID, Set, get_type_descriptor, get_type_name
- **TDataStd_UAttribute** ← TDF_Attribute : DynamicType, ID, NewEmpty, Paste, References, Restore, SetID · *statiques :* Set, get_type_descriptor, get_type_name
- **TDataStd_Variable** ← TDF_Attribute : Assign, Constant, Desassign, DynamicType, Expression, Get, ID, IsAssigned, IsCaptured, IsConstant, IsValued, Name, NewEmpty, Paste, Real, References, Restore, Set, Unit · *statiques :* GetID, Set, get_type_descriptor, get_type_name

## TDataXtd

- **TDataXtd_Array1OfTrsf** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TDataXtd_Axis** ← TDF_Attribute : DynamicType, ID, NewEmpty, Paste, Restore · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataXtd_Constraint** ← TDF_Attribute : ClearGeometries, DynamicType, GetGeometry, GetPlane, GetType, GetValue, ID, Inverted, IsDimension, IsPlanar, NbGeometries, NewEmpty, Paste, References, Restore, Reversed, Set, SetGeometry, SetPlane, SetType, SetValue, Verified · *statiques :* CollectChildConstraints, GetID, Set, get_type_descriptor, get_type_name
- **TDataXtd_ConstraintEnum** · *statiques :* TDataXtd_ALIGN_AXES, TDataXtd_ALIGN_FACES, TDataXtd_ANGLE, TDataXtd_AXES_ANGLE, TDataXtd_AXIS, TDataXtd_COINCIDENT, TDataXtd_CONCENTRIC, TDataXtd_DIAMETER, TDataXtd_DISTANCE, TDataXtd_EQUAL_DISTANCE, TDataXtd_EQUAL_RADIUS, TDataXtd_FACES_ANGLE, TDataXtd_FIX, TDataXtd_FROM, TDataXtd_MAJOR_RADIUS, TDataXtd_MATE, TDataXtd_MIDPOINT, TDataXtd_MINOR_RADIUS, TDataXtd_OFFSET, TDataXtd_PARALLEL, TDataXtd_PERPENDICULAR, TDataXtd_RADIUS, TDataXtd_RIGID, TDataXtd_ROUND, TDataXtd_SYMMETRY, TDataXtd_TANGENT
- **TDataXtd_Geometry** ← TDF_Attribute : DynamicType, GetType, ID, NewEmpty, Paste, Restore, SetType · *statiques :* Axis, Circle, Cylinder, Ellipse, GetID, Line, Plane, Point, Set, Type, get_type_descriptor, get_type_name
- **TDataXtd_GeometryEnum** · *statiques :* TDataXtd_ANY_GEOM, TDataXtd_CIRCLE, TDataXtd_CYLINDER, TDataXtd_ELLIPSE, TDataXtd_LINE, TDataXtd_PLANE, TDataXtd_POINT, TDataXtd_SPLINE
- **TDataXtd_Pattern** ← TDF_Attribute : ComputeTrsfs, DynamicType, ID, NbTrsfs, PatternID · *statiques :* GetID, get_type_descriptor, get_type_name
- **TDataXtd_PatternStd** ← TDataXtd_Pattern : Axis1, Axis1Reversed, Axis2, Axis2Reversed, ComputeTrsfs, DynamicType, Mirror, NbInstances1, NbInstances2, NbTrsfs, NewEmpty, Paste, PatternID, References, Restore, Signature, Value1, Value2 · *statiques :* GetPatternID, Set, get_type_descriptor, get_type_name
- **TDataXtd_Placement** ← TDF_Attribute : DynamicType, ID, NewEmpty, Paste, Restore · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataXtd_Plane** ← TDF_Attribute : DynamicType, ID, NewEmpty, Paste, Restore · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataXtd_Point** ← TDF_Attribute : DynamicType, ID, NewEmpty, Paste, Restore · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDataXtd_Position** ← TDF_Attribute : DynamicType, GetPosition, ID, NewEmpty, Paste, Restore, SetPosition · *statiques :* Get, GetID, Set, get_type_descriptor, get_type_name
- **TDataXtd_Presentation** ← TDF_Attribute : AddSelectionMode, BackupCopy, Color, DynamicType, GetDriverGUID, GetNbSelectionModes, HasOwnColor, HasOwnMaterial, HasOwnMode, HasOwnSelectionMode, HasOwnTransparency, HasOwnWidth, ID, IsDisplayed, MaterialIndex, Mode, NewEmpty, Paste, Restore, SelectionMode, SetColor, SetDisplayed, SetDriverGUID, SetMaterialIndex, SetMode, SetSelectionMode, SetTransparency, SetWidth, Transparency, UnsetColor, UnsetMaterial, UnsetMode, UnsetSelectionMode, UnsetTransparency, UnsetWidth, Width · *statiques :* GetID, Set, Unset, get_type_descriptor, get_type_name
- **TDataXtd_Shape** ← TDF_Attribute : DynamicType, ID, NewEmpty, Paste, References, Restore · *statiques :* Find, Get, GetID, New, Set, get_type_descriptor, get_type_name
- **TDataXtd_Triangulation** ← TDF_Attribute : Deflection, DynamicType, Get, HasNormals, HasUVNodes, ID, NbNodes, NbTriangles, NewEmpty, Node, Normal, Paste, RemoveUVNodes, Restore, Set, SetNode, SetNormal, SetNormals, SetTriangle, SetUVNode, Triangle, UVNode · *statiques :* GetID, Set, get_type_descriptor, get_type_name

## TDF

- **TDF_Attribute** ← Standard_Transient : AddAttribute, AfterAddition, AfterResume, AfterRetrieval, AfterUndo, Backup, BackupCopy, BeforeCommitTransaction, BeforeForget, BeforeRemoval, BeforeUndo, DeltaOnAddition, DeltaOnForget, DeltaOnModification, DeltaOnRemoval, DeltaOnResume, DynamicType, ExtendedDump, FindAttribute, Forget, ForgetAllAttributes, ForgetAttribute, ID, IsAttribute, IsBackuped, IsForgotten, IsNew, IsValid, Label, NewEmpty, Paste, References, Restore, SetID, Transaction, UntilTransaction · *statiques :* get_type_descriptor, get_type_name
- **TDF_AttributeArray1** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TDF_AttributeDelta** ← Standard_Transient : Apply, Attribute, DynamicType, ID, Label · *statiques :* get_type_descriptor, get_type_name
- **TDF_AttributeDeltaList** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TDF_AttributeIterator** (3 ctor) : Initialize, More, Next, PtrValue, Value
- **TDF_AttributeList** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TDF_ChildIDIterator** (2 ctor) : Initialize, More, Next, NextBrother, Value
- **TDF_ChildIterator** (2 ctor) : Initialize, More, Next, NextBrother, Value
- **TDF_ClosureMode** : Descendants, References
- **TDF_ClosureTool** · *statiques :* Closure
- **TDF_ComparisonTool** · *statiques :* Compare, Cut, IsSelfContained, SourceUnbound, TargetUnbound
- **TDF_CopyLabel** (2 ctor) : IsDone, Load, Perform, RelocationTable, UseFilter · *statiques :* ExternalReferences
- **TDF_CopyTool** · *statiques :* Copy
- **TDF_Data** ← Standard_Transient : AllowModification, Destroy, DynamicType, IsApplicable, IsModificationAllowed, LabelNodeAllocator, NotUndoMode, Root, Time, Transaction, Undo · *statiques :* get_type_descriptor, get_type_name
- **TDF_DataSet** ← Standard_Transient : AddAttribute, AddLabel, AddRoot, Attributes, Clear, ContainsAttribute, ContainsLabel, DynamicType, IsEmpty, Labels, Roots · *statiques :* get_type_descriptor, get_type_name
- **TDF_DefaultDeltaOnModification** ← TDF_DeltaOnModification : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDF_DefaultDeltaOnRemoval** ← TDF_DeltaOnRemoval : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDF_Delta** ← Standard_Transient : AttributeDeltas, BeginTime, Dump, DynamicType, EndTime, IsApplicable, IsEmpty, Labels, Name, SetName · *statiques :* get_type_descriptor, get_type_name
- **TDF_DeltaList** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TDF_DeltaOnAddition** ← TDF_AttributeDelta : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDF_DeltaOnForget** ← TDF_AttributeDelta : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDF_DeltaOnModification** ← TDF_AttributeDelta : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDF_DeltaOnRemoval** ← TDF_AttributeDelta : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDF_DeltaOnResume** ← TDF_AttributeDelta : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDF_IDFilter** : Copy, Dump, IDList, Ignore, IgnoreAll, IsIgnored, IsKept, Keep
- **TDF_IDList** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TDF_Label** : AddAttribute, AttributesModified, Data, Depth, EntryDump, ExtendedDump, Father, FindAttribute, FindChild, ForgetAllAttributes, ForgetAttribute, HasAttribute, HasChild, HasGreaterNode, HasLowerNode, Imported, IsAttribute, IsDescendant, IsDifferent, IsEqual, IsImported, IsNull, IsRoot, MayBeModified, NbAttributes, NbChildren, NewChild, Nullify, ResumeAttribute, Root, Tag, Transaction
- **TDF_LabelList** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TDF_LabelMapHasher** · *statiques :* HashCode, IsEqual
- **TDF_Reference** ← TDF_Attribute : DynamicType, Get, ID, NewEmpty, Paste, References, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDF_RelocationTable** ← Standard_Transient : AfterRelocate, AttributeTable, Clear, DynamicType, HasRelocation, HasTransientRelocation, LabelTable, SelfRelocate, SetRelocation, SetTransientRelocation, TargetAttributeMap, TargetLabelMap, TransientTable · *statiques :* get_type_descriptor, get_type_name
- **TDF_TagSource** ← TDF_Attribute : DynamicType, Get, ID, NewChild, NewEmpty, NewTag, Paste, Restore, Set · *statiques :* GetID, NewChild, Set, get_type_descriptor, get_type_name
- **TDF_Tool** · *statiques :* CountLabels, DeductLabels, DeepDump, Entry, ExtendedDeepDump, IsSelfContained, Label, NbAttributes, NbLabels, OutReferences, OutReferers, RelocateLabel, TagList
- **TDF_Transaction** (2 ctor) : Abort, Commit, Data, Initialize, IsOpen, Name, Open, Transaction

## TDocStd

- **TDocStd_Application** ← CDF_Application : Close, DefineFormat, DynamicType, GetDocument, InitDocument, IsDriverLoaded, IsInSession, MessageDriver, NbDocuments, NewDocument, OnAbortTransaction, OnCommitTransaction, OnOpenTransaction, Open, ReadingFormats, Resources, ResourcesName, Save, SaveAs, WritingFormats · *statiques :* get_type_descriptor, get_type_name
- **TDocStd_ApplicationDelta** ← Standard_Transient : Dump, DynamicType, GetDocuments, GetName, SetName · *statiques :* get_type_descriptor, get_type_name
- **TDocStd_CompoundDelta** ← TDF_Delta : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TDocStd_Context** : ModifiedReferences, SetModifiedReferences
- **TDocStd_Document** ← CDM_Document : AbortCommand, BeforeClose, ChangeStorageFormat, ClearRedos, ClearUndos, CommitCommand, DynamicType, EmptyLabelsSavingMode, GetAvailableRedos, GetAvailableUndos, GetData, GetModified, GetName, GetPath, GetRedos, GetSavedTime, GetUndoLimit, GetUndos, HasOpenCommand, InitDeltaCompaction, IsChanged, IsEmpty, IsNestedTransactionMode, IsSaved, IsValid, Main, ModificationMode, NewCommand, OpenCommand, PerformDeltaCompaction, PurgeModified, Recompute, Redo, RemoveFirstUndo, SetData, SetEmptyLabelsSavingMode, SetModificationMode, SetModified, SetNestedTransactionMode, SetSaved, SetSavedTime, SetUndoLimit, StorageFormat, Undo, Update, UpdateReferences · *statiques :* Get, get_type_descriptor, get_type_name
- **TDocStd_Modified** ← TDF_Attribute : AddLabel, Clear, DynamicType, Get, ID, IsEmpty, NewEmpty, Paste, RemoveLabel, Restore · *statiques :* Add, Clear, Contains, Get, GetID, IsEmpty, Remove, get_type_descriptor, get_type_name
- **TDocStd_MultiTransactionManager** ← Standard_Transient : AbortCommand, AddDocument, ClearRedos, ClearUndos, CommitCommand, Documents, DumpTransaction, DynamicType, GetAvailableRedos, GetAvailableUndos, GetUndoLimit, HasOpenCommand, IsNestedTransactionMode, ModificationMode, OpenCommand, Redo, RemoveDocument, RemoveLastUndo, SetModificationMode, SetNestedTransactionMode, SetUndoLimit, Undo · *statiques :* get_type_descriptor, get_type_name
- **TDocStd_Owner** ← TDF_Attribute : DynamicType, GetDocument, ID, NewEmpty, Paste, Restore, SetDocument · *statiques :* GetDocument, GetID, SetDocument, get_type_descriptor, get_type_name
- **TDocStd_PathParser** : Extension, Length, Name, Parse, Path, Trek
- **TDocStd_XLink** ← TDF_Attribute : AfterAddition, AfterUndo, BackupCopy, BeforeRemoval, BeforeUndo, DocumentEntry, DynamicType, ID, LabelEntry, NewEmpty, Paste, Restore, Update · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TDocStd_XLinkIterator** (2 ctor) : Initialize, More, Next, Value
- **TDocStd_XLinkRoot** ← TDF_Attribute : BackupCopy, DynamicType, ID, NewEmpty, Paste, Restore · *statiques :* GetID, Insert, Remove, Set, get_type_descriptor, get_type_name
- **TDocStd_XLinkTool** : Copy, CopyWithLink, DataSet, IsDone, RelocationTable, UpdateLink

## TFunction

- **TFunction_Array1OfDataMapOfGUIDDriver** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TFunction_Driver** ← Standard_Transient : Arguments, DynamicType, Execute, Init, Label, MustExecute, Results, Validate · *statiques :* get_type_descriptor, get_type_name
- **TFunction_DriverTable** ← Standard_Transient : AddDriver, Clear, DynamicType, FindDriver, HasDriver, RemoveDriver · *statiques :* Get, get_type_descriptor, get_type_name
- **TFunction_ExecutionStatus** · *statiques :* TFunction_ES_Executing, TFunction_ES_Failed, TFunction_ES_NotExecuted, TFunction_ES_Succeeded, TFunction_ES_WrongDefinition
- **TFunction_Function** ← TDF_Attribute : DynamicType, Failed, GetDriverGUID, GetFailure, ID, NewEmpty, Paste, References, Restore, SetDriverGUID, SetFailure · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TFunction_GraphNode** ← TDF_Attribute : AddNext, AddPrevious, DynamicType, GetNext, GetPrevious, GetStatus, ID, NewEmpty, Paste, References, RemoveAllNext, RemoveAllPrevious, RemoveNext, RemovePrevious, Restore, SetStatus · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TFunction_IFunction** (2 ctor) : Arguments, GetAllFunctions, GetDriver, GetGraphNode, GetLogbook, GetNext, GetPrevious, GetStatus, Init, Label, Results, SetStatus, UpdateDependencies · *statiques :* DeleteFunction, NewFunction, UpdateDependencies
- **TFunction_Iterator** (2 ctor) : Current, GetMaxNbThreads, GetStatus, GetUsageOfExecutionStatus, Init, More, Next, SetStatus, SetUsageOfExecutionStatus
- **TFunction_Logbook** ← TDF_Attribute : Clear, Done, GetImpacted, GetTouched, GetValid, ID, IsDone, IsEmpty, IsModified, NewEmpty, Paste, Restore, SetImpacted, SetTouched, SetValid · *statiques :* GetID, Set
- **TFunction_Scope** ← TDF_Attribute : AddFunction, ChangeFunctions, DynamicType, GetFreeID, GetFunction, GetFunctions, GetLogbook, HasFunction, ID, NewEmpty, Paste, RemoveAllFunctions, RemoveFunction, Restore, SetFreeID · *statiques :* GetID, Set, get_type_descriptor, get_type_name

## TNaming

- **TNaming_Builder** : Delete, Generated, Modify, NamedShape, Select
- **TNaming_CopyShape** · *statiques :* CopyTool, Translate
- **TNaming_DeltaOnModification** ← TDF_DeltaOnModification : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TNaming_DeltaOnRemoval** ← TDF_DeltaOnRemoval : Apply, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TNaming_Evolution** · *statiques :* TNaming_DELETE, TNaming_GENERATED, TNaming_MODIFY, TNaming_PRIMITIVE, TNaming_REPLACE, TNaming_SELECTED
- **TNaming_Identifier** (2 ctor) : AncestorIdentification, ArgIsFeature, Feature, FeatureArg, GeneratedIdentification, Identification, InitArgs, IsDone, IsFeature, MoreArgs, NamedShapeOfGeneration, NextArg, PrimitiveIdentification, ShapeArg, ShapeContext, Type
- **TNaming_Iterator** (3 ctor) : Evolution, IsModification, More, NewShape, Next, OldShape
- **TNaming_IteratorOnShapesSet** (2 ctor) : Init, More, Next, Value
- **TNaming_ListOfIndexedDataMapOfShapeListOfShape** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TNaming_ListOfMapOfShape** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TNaming_ListOfNamedShape** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TNaming_Localizer** : Ancestors, Backward, FindFeaturesInAncestors, FindNeighbourg, GoBack, Init, SubShapes · *statiques :* FindGenerator, FindShapeContext, IsNew
- **TNaming_Name** : Append, Arguments, ContextLabel, Index, Orientation, Paste, Shape, ShapeType, Solve, StopNamedShape, Type
- **TNaming_NameType** · *statiques :* TNaming_CONSTSHAPE, TNaming_FILTERBYNEIGHBOURGS, TNaming_GENERATION, TNaming_IDENTITY, TNaming_INTERSECTION, TNaming_MODIFUNTIL, TNaming_ORIENTATION, TNaming_SHELLIN, TNaming_SUBSTRACTION, TNaming_UNION, TNaming_UNKNOWN, TNaming_WIREIN
- **TNaming_NamedShape** ← TDF_Attribute : AfterUndo, BackupCopy, BeforeRemoval, BeforeUndo, Clear, DeltaOnModification, DeltaOnRemoval, DynamicType, Evolution, Get, ID, IsEmpty, NewEmpty, Paste, References, Restore, SetVersion, Version · *statiques :* GetID, get_type_descriptor, get_type_name
- **TNaming_Naming** ← TDF_Attribute : ChangeName, DynamicType, ExtendedDump, GetName, ID, IsDefined, NewEmpty, Paste, References, Regenerate, Restore, Solve · *statiques :* GetID, Insert, Name, get_type_descriptor, get_type_name
- **TNaming_NamingTool** · *statiques :* BuildDescendants, CurrentShape, CurrentShapeFromShape
- **TNaming_NewShapeIterator** (4 ctor) : IsModification, Label, More, NamedShape, Next, Shape
- **TNaming_OldShapeIterator** (4 ctor) : IsModification, Label, More, NamedShape, Next, Shape
- **TNaming_RefShape** (2 ctor) : FirstUse, Label, NamedShape, Shape
- **TNaming_SameShapeIterator** : Label, More, Next
- **TNaming_Scope** (3 ctor) : ChangeValid, ClearValid, CurrentShape, GetValid, IsValid, Unvalid, UnvalidChildren, Valid, ValidChildren, WithValid
- **TNaming_Selector** : Arguments, NamedShape, Select, Solve · *statiques :* IsIdentified
- **TNaming_ShapesSet** (2 ctor) : Add, ChangeMap, Clear, Contains, Filter, IsEmpty, Map, NbShapes, Remove
- **TNaming_Tool** · *statiques :* Collect, CurrentNamedShape, CurrentShape, FindShape, GeneratedShape, GetShape, HasLabel, InitialShape, Label, NamedShape, OriginalShape, ValidUntil
- **TNaming_TranslateTool** ← Standard_Transient : Add, DynamicType, MakeCompSolid, MakeCompound, MakeEdge, MakeFace, MakeShell, MakeSolid, MakeVertex, MakeWire, UpdateEdge, UpdateFace, UpdateShape, UpdateVertex · *statiques :* get_type_descriptor, get_type_name
- **TNaming_Translator** : Add, Copied, DumpMap, IsDone, Perform
- **TNaming_UsedShapes** ← TDF_Attribute : AfterUndo, BackupCopy, BeforeRemoval, DeltaOnAddition, DeltaOnRemoval, Destroy, DynamicType, ID, Map, NewEmpty, Paste, References, Restore · *statiques :* GetID, get_type_descriptor, get_type_name

## TObj

- **TObj_Application** ← TDocStd_Application : CreateNewDocument, DynamicType, ErrorMessage, IsVerbose, LoadDocument, Messenger, ResourcesName, SaveDocument, SetVerbose · *statiques :* GetInstance, get_type_descriptor, get_type_name
- **TObj_Assistant** · *statiques :* BindModel, BindType, ClearModelMap, ClearTypeMap, FindModel, FindType, FindTypeIndex, GetAppVersion, GetCurrentModel, SetCurrentModel, UnSetCurrentModel
- **TObj_CheckModel** ← Message_Algorithm : DynamicType, GetModel, IsToFix, Perform, SetToFix · *statiques :* get_type_descriptor, get_type_name
- **TObj_HiddenPartition** ← TObj_Partition : DynamicType, GetTypeFlags · *statiques :* get_type_descriptor, get_type_name
- **TObj_LabelIterator** ← TObj_ObjectIterator : DynamicType, LabelValue, More, Next, Value · *statiques :* get_type_descriptor, get_type_name
- **TObj_Model** ← Standard_Transient : AbortCommand, Close, CloseDocument, CommitCommand, CopyReferences, DynamicType, FindObject, GetApplication, GetChecker, GetChildren, GetDictionary, GetDocument, GetFile, GetFormat, GetFormatVersion, GetGUID, GetLabel, GetMainPartition, GetModelName, GetObjects, GetRoot, HasOpenCommand, IsModified, IsRegisteredName, Load, Messenger, NewEmpty, OpenCommand, Paste, RegisterName, Save, SaveAs, SetLabel, SetMessenger, SetModified, UnRegisterName, Update · *statiques :* GetDocumentModel, SetNewName, get_type_descriptor, get_type_name
- **TObj_ModelIterator** ← TObj_ObjectIterator : DynamicType, More, Next, Value · *statiques :* get_type_descriptor, get_type_name
- **TObj_Object** ← Standard_Transient : AddBackReference, AfterRetrieval, BeforeForgetReference, BeforeStoring, CanDetach, CanRemoveReference, ClearBackReferences, ClearFlags, Clone, CopyChildren, CopyReferences, Detach, DynamicType, GetBackReferences, GetBadReference, GetChildLabel, GetChildren, GetDataLabel, GetDictionary, GetFatherObject, GetFlags, GetLabel, GetModel, GetName, GetNameForClone, GetOrder, GetReferenceLabel, GetReferences, GetTypeFlags, HasBackReferences, HasReference, IsAlive, RelocateReferences, RemoveAllReferences, RemoveBackReference, RemoveBackReferences, RemoveReference, ReplaceReference, SetFlags, SetName, SetOrder, TestFlags, getChildLabel · *statiques :* Detach, GetObj, get_type_descriptor, get_type_name
- **TObj_ObjectIterator** ← Standard_Transient : DynamicType, More, Next, Value · *statiques :* get_type_descriptor, get_type_name
- **TObj_OcafObjectIterator** ← TObj_LabelIterator : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TObj_Partition** ← TObj_Object : AfterRetrieval, DynamicType, GetLastIndex, GetNamePrefix, GetNewName, NewLabel, SetLastIndex, SetName, SetNamePrefix, Update · *statiques :* Create, GetPartition, get_type_descriptor, get_type_name
- **TObj_Persistence** · *statiques :* CreateNewObject, DumpTypes
- **TObj_ReferenceIterator** ← TObj_LabelIterator : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TObj_SequenceIterator** ← TObj_ObjectIterator : DynamicType, More, Next, Value · *statiques :* get_type_descriptor, get_type_name
- **TObj_TIntSparseArray** ← TDF_Attribute : AfterUndo, BackupCopy, BeforeCommitTransaction, Clear, ClearDelta, DeltaOnModification, DynamicType, GetIterator, HasValue, ID, NewEmpty, Paste, Restore, SetDoBackup, SetValue, Size, UnsetValue, Value · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TObj_TModel** ← TDF_Attribute : DynamicType, ID, Model, NewEmpty, Paste, Restore, Set · *statiques :* GetID, get_type_descriptor, get_type_name
- **TObj_TNameContainer** ← TDF_Attribute : Clear, DynamicType, Get, ID, IsRegistered, NewEmpty, Paste, RecordName, RemoveName, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TObj_TObject** ← TDF_Attribute : AfterUndo, BeforeForget, DynamicType, Get, ID, NewEmpty, Paste, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TObj_TReference** ← TDF_Attribute : AfterResume, AfterRetrieval, AfterUndo, BeforeForget, BeforeUndo, DynamicType, Get, GetLabel, GetMasterLabel, ID, NewEmpty, Paste, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **TObj_TXYZ** ← TDF_Attribute : DynamicType, Get, ID, NewEmpty, Paste, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name

## TopAbs

- **TopAbs_Orientation** ★ · *statiques :* TopAbs_EXTERNAL, TopAbs_FORWARD, TopAbs_INTERNAL, TopAbs_REVERSED
- **TopAbs_ShapeEnum** ★ · *statiques :* TopAbs_COMPOUND, TopAbs_COMPSOLID, TopAbs_EDGE, TopAbs_FACE, TopAbs_SHAPE, TopAbs_SHELL, TopAbs_SOLID, TopAbs_VERTEX, TopAbs_WIRE
- **TopAbs_State** ★ · *statiques :* TopAbs_IN, TopAbs_ON, TopAbs_OUT, TopAbs_UNKNOWN

## TopBas

- **TopBas_ListOfTestInterference** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopBas_TestInterference** (2 ctor) : Boundary, BoundaryTransition, ChangeBoundary, ChangeIntersection, Intersection, Orientation, Transition

## TopCnx

- **TopCnx_EdgeFaceTransition** : AddInterference, BoundaryTransition, Reset, Transition

## TopExp

- **TopExp_Explorer** ★ (2 ctor) : Clear, Current, Depth, Destroy, Init, More, Next, ReInit, Value

## TopLoc

- **TopLoc_Datum3D** ← Standard_Transient (2 ctor) : DumpJson, DynamicType, ShallowDump, Transformation · *statiques :* get_type_descriptor, get_type_name
- **TopLoc_ItemLocation** : DumpJson
- **TopLoc_Location** ★ (3 ctor) : Divided, DumpJson, FirstDatum, FirstPower, HashCode, Identity, Inverted, IsDifferent, IsEqual, IsIdentity, Multiplied, NextLocation, Powered, Predivided, ShallowDump, Transformation
- **TopLoc_SListNodeOfItemLocation** ← Standard_Transient : DynamicType, Tail, Value · *statiques :* get_type_descriptor, get_type_name
- **TopLoc_SListOfItemLocation** (4 ctor) : Assign, Clear, Construct, IsEmpty, More, Next, Tail, ToTail, Value

## TopoDS

- **TopoDS_AlertWithShape** ← Message_Alert : DynamicType, GetShape, Merge, SetShape, SupportsMerge · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_Builder** ★ : Add, MakeCompSolid, MakeCompound, MakeShell, MakeSolid, MakeWire, Remove
- **TopoDS_CompSolid** ← TopoDS_Shape
- **TopoDS_Compound** ★ ← TopoDS_Shape
- **TopoDS_Edge** ← TopoDS_Shape
- **TopoDS_Face** ★ ← TopoDS_Shape
- **TopoDS_FrozenShape** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **TopoDS_HShape** ← Standard_Transient (2 ctor) : ChangeShape, DynamicType, Shape · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_Iterator** (2 ctor) : Initialize, More, Next, Value
- **TopoDS_LockedShape** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **TopoDS_Shape** ★ : Checked, Closed, Complement, Complemented, Compose, Composed, Convex, DumpJson, EmptyCopied, EmptyCopy, Free, HashCode, Infinite, IsEqual, IsNotEqual, IsNull, IsPartner, IsSame, Located, Location, Locked, Modified, Move, Moved, NbChildren, Nullify, Orientable, Orientation, Oriented, Reverse, Reversed, ShapeType, TShape
- **TopoDS_Shell** ← TopoDS_Shape
- **TopoDS_Solid** ← TopoDS_Shape
- **TopoDS_TCompSolid** ← TopoDS_TShape : DynamicType, EmptyCopy, ShapeType · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_TCompound** ← TopoDS_TShape : DynamicType, EmptyCopy, ShapeType · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_TEdge** ← TopoDS_TShape : DynamicType, ShapeType · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_TFace** ← TopoDS_TShape : DynamicType, EmptyCopy, ShapeType · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_TShape** ← Standard_Transient : Checked, Closed, Convex, DumpJson, DynamicType, EmptyCopy, Free, Infinite, Locked, Modified, NbChildren, Orientable, ShapeType · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_TShell** ← TopoDS_TShape : DynamicType, EmptyCopy, ShapeType · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_TSolid** ← TopoDS_TShape : DynamicType, EmptyCopy, ShapeType · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_TVertex** ← TopoDS_TShape : DynamicType, ShapeType · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_TWire** ← TopoDS_TShape : DynamicType, EmptyCopy, ShapeType · *statiques :* get_type_descriptor, get_type_name
- **TopoDS_UnCompatibleShapes** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **TopoDS_Vertex** ← TopoDS_Shape
- **TopoDS_Wire** ← TopoDS_Shape

## TopoDSToStep

- **TopoDSToStep_Builder** ← TopoDSToStep_Root (2 ctor) : Error, Init, Value
- **TopoDSToStep_BuilderError** · *statiques :* TopoDSToStep_BuilderDone, TopoDSToStep_BuilderOther, TopoDSToStep_NoFaceMapped
- **TopoDSToStep_FacetedError** · *statiques :* TopoDSToStep_FacetedDone, TopoDSToStep_PCurveNotLinear, TopoDSToStep_SurfaceNotPlane
- **TopoDSToStep_FacetedTool** · *statiques :* CheckTopoDSShape
- **TopoDSToStep_MakeBrepWithVoids** ← TopoDSToStep_Root : Value
- **TopoDSToStep_MakeEdgeError** · *statiques :* TopoDSToStep_EdgeDone, TopoDSToStep_EdgeOther, TopoDSToStep_NonManifoldEdge
- **TopoDSToStep_MakeFaceError** · *statiques :* TopoDSToStep_FaceDone, TopoDSToStep_FaceOther, TopoDSToStep_InfiniteFace, TopoDSToStep_NoWireMapped, TopoDSToStep_NonManifoldFace
- **TopoDSToStep_MakeFacetedBrep** ← TopoDSToStep_Root (2 ctor) : Value
- **TopoDSToStep_MakeFacetedBrepAndBrepWithVoids** ← TopoDSToStep_Root : Value
- **TopoDSToStep_MakeGeometricCurveSet** ← TopoDSToStep_Root : Value
- **TopoDSToStep_MakeManifoldSolidBrep** ← TopoDSToStep_Root (2 ctor) : Value
- **TopoDSToStep_MakeShellBasedSurfaceModel** ← TopoDSToStep_Root (3 ctor) : Value
- **TopoDSToStep_MakeStepEdge** ← TopoDSToStep_Root (2 ctor) : Error, Init, Value
- **TopoDSToStep_MakeStepFace** ← TopoDSToStep_Root (2 ctor) : Error, Init, Value
- **TopoDSToStep_MakeStepVertex** ← TopoDSToStep_Root (2 ctor) : Error, Init, Value
- **TopoDSToStep_MakeStepWire** ← TopoDSToStep_Root (2 ctor) : Error, Init, Value
- **TopoDSToStep_MakeVertexError** · *statiques :* TopoDSToStep_VertexDone, TopoDSToStep_VertexOther
- **TopoDSToStep_MakeWireError** · *statiques :* TopoDSToStep_NonManifoldWire, TopoDSToStep_WireDone, TopoDSToStep_WireOther
- **TopoDSToStep_Root** : IsDone, Tolerance
- **TopoDSToStep_Tool** (2 ctor) : Bind, CurrentEdge, CurrentFace, CurrentShell, CurrentVertex, CurrentWire, Faceted, Find, Init, IsBound, Lowest3DTolerance, Map, PCurveMode, SetCurrentEdge, SetCurrentFace, SetCurrentShell, SetCurrentVertex, SetCurrentWire, SetSurfaceReversed, SurfaceReversed
- **TopoDSToStep_WireframeBuilder** ← TopoDSToStep_Root (2 ctor) : Error, GetTrimmedCurveFromEdge, GetTrimmedCurveFromFace, GetTrimmedCurveFromShape, Init, Value

## TopOpeBRep

- **TopOpeBRep_Array1OfLineInter** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TopOpeBRep_Array1OfVPointInter** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TopOpeBRep_Bipoint** (2 ctor) : I1, I2
- **TopOpeBRep_DSFiller** : ChangeEdgesFiller, ChangeFaceEdgeFiller, ChangeFacesFiller, ChangeShapeIntersector, ChangeShapeIntersector2d, Checker, Complete, CompleteDS, CompleteDS2d, Filter, GapFiller, Insert, Insert1d, Insert2d, InsertIntersection, InsertIntersection2d, IsContext1d, IsMadeOf1d, PShapeClassifier, Reducer, RemoveUnsharedGeometry
- **TopOpeBRep_EdgesFiller** : Face, Insert
- **TopOpeBRep_EdgesIntersector** : Curve, Dimension, Dump, Edge, Face, FacesSameOriented, ForceTolerances, HasSegment, InitPoint, IsEmpty, MorePoint, NbPoints, NbSegments, NextPoint, Perform, Point, Points, ReduceSegment, SameDomain, SetFaces, Status1, Surface, SurfacesSameOriented, ToleranceMax, Tolerances
- **TopOpeBRep_FFDumper** ← Standard_Transient : DumpDSP, DumpLine, DumpVP, DynamicType, ExploreIndex, Init, PFacesFillerDummy · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRep_FFTransitionTool** · *statiques :* ProcessEdgeONTransition, ProcessEdgeTransition, ProcessFaceTransition, ProcessLineTransition
- **TopOpeBRep_FaceEdgeFiller** : Insert
- **TopOpeBRep_FaceEdgeIntersector** : ForceTolerance, Index, InitPoint, IsEmpty, IsVertex, MorePoint, NbPoints, NextPoint, Parameter, Perform, Shape, State, Tolerance, Transition, UVPoint, Value
- **TopOpeBRep_FacesFiller** : AddShapesLine, ChangeDataStructure, ChangeFacesIntersector, ChangePointClassifier, CheckLine, Face, FaceFaceTransition, FillLine, FillLineVPonR, GetESL, GetFFGeometry, GetGeometry, GetTraceIndex, HDataStructure, Insert, LoadLine, MakeGeometry, PDataStructureDummy, PFacesIntersectorDummy, PLineInterDummy, PShapeClassifier, ProcessLine, ProcessRLine, ProcessSectionEdges, ProcessVPInotonR, ProcessVPIonR, ProcessVPR, ProcessVPnotonR, ProcessVPonR, ProcessVPonclosingR, ProcessVPondgE, ResetDSC, SetPShapeClassifier, SetTraceIndex, StoreCurveInterference, VP_Position, VP_PositionOnL, VP_PositionOnR · *statiques :* EqualpPonR, IsVPtransLok, LSameDomainERL, Lminmax, TransvpOK, VPParamOnER
- **TopOpeBRep_FacesIntersector** : ChangeLine, CurrentLine, CurrentLineIndex, Face, ForceTolerances, GetTolerances, InitLine, IsDone, IsEmpty, IsRestriction, Lines, MoreLine, NbLines, NextLine, Perform, PrepareLines, Restrictions, SameDomain, SurfacesSameOriented
- **TopOpeBRep_GeomTool** · *statiques :* MakeBSpline1fromWALKING2d, MakeBSpline1fromWALKING3d, MakeCurve, MakeCurves
- **TopOpeBRep_Hctxee2d** ← Standard_Transient : Curve, Domain, DynamicType, Edge, SetEdges · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRep_Hctxff2d** ← Standard_Transient : DynamicType, Face, FaceSameOrientedWithRef, FacesSameOriented, GetMaxTolerance, GetTolerances, HSurface, SetFaces, SetHSurfaces, SetTolerances, SurfacesSameOriented · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRep_LineInter** : Arc, ArcIsEdge, Bounds, ChangeVPoint, ComputeFaceFaceTransition, Curve, DumpBipoint, DumpType, DumpVPoint, FaceFaceTransition, GetTraceIndex, HasFirstPoint, HasLastPoint, HasVInternal, HasVPonR, INL, Index, IsPeriodic, IsVClosed, LineG, LineR, LineW, NbVPoint, NbWPoint, OK, Period, SetFaces, SetHasVPonR, SetINL, SetIsVClosed, SetLine, SetOK, SetTraceIndex, SetVPBounds, SituationS1, SituationS2, TransitionOnS1, TransitionOnS2, TypeLineCurve, VPBounds, VPoint, WPoint
- **TopOpeBRep_ListOfBipoint** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopOpeBRep_P2Dstatus** · *statiques :* TopOpeBRep_P2DINT, TopOpeBRep_P2DNEW, TopOpeBRep_P2DSGF, TopOpeBRep_P2DSGL, TopOpeBRep_P2DUNK
- **TopOpeBRep_Point2d** : ChangeTransition, Dump, EdgesConfig, HasPint, Hctxee2d, Hctxff2d, Index, IsPointOfSegment, IsVertex, Keep, Parameter, Pint, SegmentAncestors, SetEdgesConfig, SetHctxee2d, SetHctxff2d, SetIndex, SetIsPointOfSegment, SetIsVertex, SetKeep, SetParameter, SetPint, SetSegmentAncestors, SetStatus, SetTolerance, SetTransition, SetValue, SetValue2d, SetVertex, Status, Tolerance, Transition, Value, Value2d, Vertex
- **TopOpeBRep_PointClassifier** : Classify, Init, Load, State
- **TopOpeBRep_PointGeomTool** · *statiques :* IsEqual, MakePoint
- **TopOpeBRep_ShapeIntersector** : ChangeEdgesIntersector, ChangeFaceEdgeIntersector, ChangeFacesIntersector, CurrentGeomShape, DumpCurrent, GetTolerances, Index, InitIntersection, MoreIntersection, NextIntersection, RejectedFaces, Shape
- **TopOpeBRep_ShapeIntersector2d** : ChangeEdgesIntersector, CurrentGeomShape, DumpCurrent, Index, InitIntersection, MoreIntersection, NextIntersection, Shape
- **TopOpeBRep_ShapeScanner** : AddBoxesMakeCOB, BoxSort, ChangeBoxSort, Clear, Current, Index, Init, More, Next
- **TopOpeBRep_TypeLineCurve** · *statiques :* TopOpeBRep_ANALYTIC, TopOpeBRep_CIRCLE, TopOpeBRep_ELLIPSE, TopOpeBRep_HYPERBOLA, TopOpeBRep_LINE, TopOpeBRep_OTHERTYPE, TopOpeBRep_PARABOLA, TopOpeBRep_RESTRICTION, TopOpeBRep_WALKING
- **TopOpeBRep_VPointInter** : ArcOnS1, ArcOnS2, ChangeKeep, Edge, EdgeON, EdgeONParameter, EdgeParameter, EqualpP, GetShapes, Index, IsInternal, IsMultiple, IsOnDomS1, IsOnDomS2, IsVertex, IsVertexOnS1, IsVertexOnS2, Keep, PThePointOfIntersectionDummy, ParameterOnArc1, ParameterOnArc2, ParameterOnLine, ParametersOnS1, ParametersOnS2, ParonE, SetPoint, SetShapes, ShapeIndex, State, SurfaceParameters, Tolerance, TransitionLineArc1, TransitionLineArc2, TransitionOnS1, TransitionOnS2, UpdateKeep, Value, Vertex, VertexOnS1, VertexOnS2
- **TopOpeBRep_VPointInterClassifier** : Edge, EdgeParameter, VPointPosition
- **TopOpeBRep_VPointInterIterator** (2 ctor) : ChangeCurrentVP, CurrentVP, CurrentVPIndex, Init, More, Next, PLineInterDummy
- **TopOpeBRep_WPointInter** : PPntOn2SDummy, Parameters, ParametersOnS1, ParametersOnS2, Set, Value, ValueOnS1, ValueOnS2
- **TopOpeBRep_WPointInterIterator** (2 ctor) : CurrentWP, Init, More, Next, PLineInterDummy

## TopOpeBRepBuild

- **TopOpeBRepBuild_Area1dBuilder** ← TopOpeBRepBuild_AreaBuilder (2 ctor) : ADD_LISTOFLoop_TO_LISTOFLoop, ADD_Loop_TO_LISTOFLoop, InitAreaBuilder, REM_Loop_FROM_LISTOFLoop · *statiques :* DumpList
- **TopOpeBRepBuild_Area2dBuilder** ← TopOpeBRepBuild_AreaBuilder (2 ctor) : InitAreaBuilder
- **TopOpeBRepBuild_Area3dBuilder** ← TopOpeBRepBuild_AreaBuilder (2 ctor) : InitAreaBuilder
- **TopOpeBRepBuild_AreaBuilder** (2 ctor) : ADD_LISTOFLoop_TO_LISTOFLoop, ADD_Loop_TO_LISTOFLoop, InitArea, InitAreaBuilder, InitLoop, Loop, MoreArea, MoreLoop, NextArea, NextLoop, REM_Loop_FROM_LISTOFLoop
- **TopOpeBRepBuild_BlockBuilder** (2 ctor) : AddElement, BlockIterator, CurrentBlockIsRegular, Element, ElementIsValid, InitBlock, MakeBlock, MoreBlock, NextBlock, SetValid
- **TopOpeBRepBuild_BlockIterator** (2 ctor) : Extent, Initialize, More, Next, Value
- **TopOpeBRepBuild_BuilderON** (2 ctor) : GFillONCheckI, GFillONParts2dWES2, GFillONPartsWES1, GFillONPartsWES2, Perform, Perform2d
- **TopOpeBRepBuild_CompositeClassifier** ← TopOpeBRepBuild_LoopClassifier : Compare, CompareElement, CompareElementToShape, CompareShapes, ResetElement, ResetShape, State
- **TopOpeBRepBuild_CorrectFace2d** (2 ctor) : CorrectedFace, ErrorStatus, Face, IsDone, MapOfTrans2dInfo, Perform, SetMapOfTrans2dInfo · *statiques :* CheckList, GetP2dFL
- **TopOpeBRepBuild_EdgeBuilder** ← TopOpeBRepBuild_Area1dBuilder (2 ctor) : InitEdge, InitEdgeBuilder, InitVertex, MoreEdge, MoreVertex, NextEdge, NextVertex, Parameter, Vertex
- **TopOpeBRepBuild_FaceAreaBuilder** ← TopOpeBRepBuild_Area2dBuilder (2 ctor) : InitFaceAreaBuilder
- **TopOpeBRepBuild_FaceBuilder** (2 ctor) : AddEdgeWire, CorrectGclosedWire, DetectPseudoInternalEdge, DetectUnclosedWire, Edge, EdgeConnexity, Face, FindNextValidElement, InitEdge, InitFace, InitFaceBuilder, InitWire, IsOldWire, MoreEdge, MoreFace, MoreWire, NextEdge, NextFace, NextWire, OldWire
- **TopOpeBRepBuild_FuseFace** (2 ctor) : ClearEdge, ClearVertex, Init, IsDone, IsModified, LExternEdge, LExternVertex, LFuseFace, LInternEdge, LInternVertex, LModifEdge, LModifVertex, PerformEdge, PerformFace
- **TopOpeBRepBuild_GIter** (2 ctor) : Current, Dump, Init, More, Next
- **TopOpeBRepBuild_GTool** · *statiques :* Dump, GComDiff, GComSame, GComUnsh, GCutDiff, GCutSame, GCutUnsh, GFusDiff, GFusSame, GFusUnsh
- **TopOpeBRepBuild_GTopo** (2 ctor) : ChangeConfig, ChangeType, ChangeValue, Config1, Config2, CopyPermuted, Dump, DumpType, DumpVal, GIndex, GState, Index, IsToReverse1, IsToReverse2, Reset, Reverse, Set, SetReverse, StatesON, Type, Value · *statiques :* DumpSSB
- **TopOpeBRepBuild_HBuilder** ← Standard_Transient : BuildTool, ChangeBuildTool, ChangeBuilder, ChangeNewEdges, Clear, CurrentSection, DataStructure, DynamicType, EdgeCurveAncestors, EdgeSectionAncestors, GetDSCurveFromSectEdge, GetDSEdgeFromSectEdge, GetDSFaceFromDSCurve, GetDSFaceFromDSEdge, GetDSPointFromNewVertex, InitExtendedSectionDS, InitSection, IsKPart, IsMerged, IsSplit, MergeKPart, MergeShapes, MergeSolid, MergeSolids, Merged, MoreSection, NewEdges, NewFaces, NewVertex, NextSection, Perform, Section, Splits · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepBuild_ListOfListOfLoop** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopOpeBRepBuild_ListOfLoop** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopOpeBRepBuild_ListOfPave** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopOpeBRepBuild_ListOfShapeListOfShape** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopOpeBRepBuild_Loop** ← Standard_Transient (2 ctor) : BlockIterator, Dump, DynamicType, IsShape, Shape · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepBuild_LoopClassifier** : Compare
- **TopOpeBRepBuild_LoopEnum** · *statiques :* TopOpeBRepBuild_ANYLOOP, TopOpeBRepBuild_BLOCK, TopOpeBRepBuild_BOUNDARY
- **TopOpeBRepBuild_LoopSet** : ChangeListOfLoop, InitLoop, Loop, MoreLoop, NextLoop
- **TopOpeBRepBuild_Pave** ← TopOpeBRepBuild_Loop : ChangeVertex, Dump, DynamicType, HasSameDomain, InterferenceType, IsShape, Parameter, SameDomain, Shape, Vertex · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepBuild_PaveClassifier** ← TopOpeBRepBuild_LoopClassifier : ClosedVertices, Compare, SetFirstParameter · *statiques :* AdjustCase
- **TopOpeBRepBuild_PaveSet** ← TopOpeBRepBuild_LoopSet : Append, ClosedVertices, Edge, EqualParameters, HasEqualParameters, InitLoop, Loop, MoreLoop, NextLoop, RemovePV · *statiques :* SortPave
- **TopOpeBRepBuild_ShapeListOfShape** (3 ctor) : ChangeList, ChangeShape, List, Shape
- **TopOpeBRepBuild_ShapeSet** : AddElement, AddShape, AddStartElement, ChangeStartShapes, CheckShape, DEBName, DEBNumber, DumpBB, DumpCheck, DumpName, DumpSS, FindNeighbours, InitNeighbours, InitShapes, InitStartElements, MakeNeighboursList, MaxNumberSubShape, MoreNeighbours, MoreShapes, MoreStartElements, Neighbour, NextNeighbour, NextShape, NextStartElement, SName, SNameori, Shape, StartElement, StartElements
- **TopOpeBRepBuild_ShellFaceClassifier** ← TopOpeBRepBuild_CompositeClassifier : Clear, CompareElement, CompareElementToShape, CompareShapes, ResetElement, ResetShape, State
- **TopOpeBRepBuild_ShellFaceSet** ← TopOpeBRepBuild_ShapeSet (2 ctor) : AddElement, AddShape, AddStartElement, DumpSS, SName, SNameori, Solid
- **TopOpeBRepBuild_ShellToSolid** : AddShell, Init, MakeSolids
- **TopOpeBRepBuild_SolidAreaBuilder** ← TopOpeBRepBuild_Area3dBuilder (2 ctor) : InitSolidAreaBuilder
- **TopOpeBRepBuild_SolidBuilder** (2 ctor) : Face, InitFace, InitShell, InitSolid, InitSolidBuilder, IsOldShell, MoreFace, MoreShell, MoreSolid, NextFace, NextShell, NextSolid, OldShell
- **TopOpeBRepBuild_Tools** · *statiques :* CheckFaceClosed2d, CorrectCurveOnSurface, CorrectFace2d, CorrectPointOnCurve, CorrectTolerances, FindState, FindState1, FindState2, FindStateThroughVertex, GetAdjacentFace, GetNormalInNearestPoint, GetNormalToFaceOnEdge, GetTangentToEdge, GetTangentToEdgeEdge, IsDegEdgesTheSame, NormalizeFace, PropagateState, PropagateStateForWires, SpreadStateToChild, UpdateEdgeOnFace, UpdateEdgeOnPeriodicalFace, UpdatePCurves
- **TopOpeBRepBuild_Tools2d** · *statiques :* DumpMapOfShapeVertexInfo, MakeMapOfShapeVertexInfo, Path
- **TopOpeBRepBuild_VertexInfo** : AddIn, AddOut, AppendPassed, ChangeEdgesOut, CurrentOut, Dump, EdgesIn, EdgesOut, FoundOut, ListPassed, NbCases, Prepare, RemovePassed, SetCurrentIn, SetSmart, SetVertex, Smart, Vertex
- **TopOpeBRepBuild_WireEdgeClassifier** ← TopOpeBRepBuild_CompositeClassifier : Compare, CompareElement, CompareElementToShape, CompareShapes, LoopToShape, ResetElement, ResetShape, State
- **TopOpeBRepBuild_WireEdgeSet** ← TopOpeBRepBuild_ShapeSet : AddElement, AddShape, AddStartElement, DumpSS, Face, FindNeighbours, InitNeighbours, MakeNeighboursList, SName, SNameori · *statiques :* IsUVISO
- **TopOpeBRepBuild_WireToFace** : AddWire, Init, MakeFaces

## TopOpeBRepDS

- **TopOpeBRepDS_Array1OfDataMapOfIntegerListOfInterference** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TopOpeBRepDS_Association** ← Standard_Transient : AreAssociated, Associate, Associated, DynamicType, HasAssociation · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_BuildTool** (3 ctor) : AddEdgeVertex, AddFaceWire, AddShellFace, AddSolidShell, AddWireEdge, ApproxCurves, Approximation, ChangeGeomTool, Closed, ComputePCurves, CopyEdge, CopyFace, Curve3D, GetGeomTool, GetOrientedEdgeVertices, MakeEdge, MakeFace, MakeShell, MakeSolid, MakeVertex, MakeWire, Orientation, OverWrite, PCurve, Parameter, PutPCurves, Range, RecomputeCurves, Translate, UpdateEdge, UpdateEdgeCurveTol, UpdateSurface
- **TopOpeBRepDS_Check** ← Standard_Transient (2 ctor) : ChangeHDS, CheckDS, CheckShapes, ChkIntg, ChkIntgInterf, ChkIntgSamDom, DynamicType, HDS, OneVertexOnPnt · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_CheckStatus** · *statiques :* TopOpeBRepDS_NOK, TopOpeBRepDS_OK
- **TopOpeBRepDS_Config** · *statiques :* TopOpeBRepDS_DIFFORIENTED, TopOpeBRepDS_SAMEORIENTED, TopOpeBRepDS_UNSHGEOMETRY
- **TopOpeBRepDS_Curve** (2 ctor) : ChangeCurve, ChangeDSIndex, ChangeIsWalk, ChangeKeep, ChangeMother, ChangeShape1, ChangeShape2, Curve, Curve1, Curve2, DSIndex, DefineCurve, GetSCI, GetSCI1, GetSCI2, GetShapes, IsWalk, Keep, Mother, Range, SetRange, SetSCI, SetShapes, Shape1, Shape2, Tolerance
- **TopOpeBRepDS_CurveData** ← TopOpeBRepDS_GeometryData (2 ctor)
- **TopOpeBRepDS_CurveExplorer** (2 ctor) : Curve, Index, Init, IsCurve, IsCurveKeep, More, NbCurve, Next
- **TopOpeBRepDS_CurveIterator** ← TopOpeBRepDS_InterferenceIterator : Current, MatchInterference, Orientation, PCurve
- **TopOpeBRepDS_CurvePointInterference** ← TopOpeBRepDS_Interference : DynamicType, Parameter · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_DataStructure** : AddCurve, AddPoint, AddPointSS, AddSectionEdge, AddShape, AddShapeInterference, AddShapeSameDomain, AddSurface, AncestorRank, ChangeCurve, ChangeCurveInterferences, ChangeKeepCurve, ChangeKeepPoint, ChangeKeepShape, ChangeKeepSurface, ChangeMapOfRejectedShapesObj, ChangeMapOfRejectedShapesTool, ChangeMapOfShapeWithState, ChangeMapOfShapeWithStateObj, ChangeMapOfShapeWithStateTool, ChangeNbCurves, ChangePoint, ChangePointInterferences, ChangeShapeInterferences, ChangeShapeSameDomain, ChangeShapes, ChangeSurface, ChangeSurfaceInterferences, Curve, CurveInterferences, FillShapesSameDomain, GetShapeWithState, HasGeometry, HasNewSurface, HasShape, Init, InitSectionEdges, IsSectionEdge, Isfafa, KeepCurve, KeepPoint, KeepShape, KeepSurface, NbCurves, NbPoints, NbSectionEdges, NbShapes, NbSurfaces, NewSurface, Point, PointInterferences, RemoveCurve, RemovePoint, RemoveShapeInterference, RemoveShapeSameDomain, RemoveSurface, SameDomainInd, SameDomainOri, SameDomainRef, SectionEdge, SetNewSurface, Shape, ShapeInterferences, ShapeSameDomain, Surface, SurfaceInterferences, UnfillShapesSameDomain
- **TopOpeBRepDS_Dumper** : SDumpRefOri, SPrintShape, SPrintShapeRefOri
- **TopOpeBRepDS_EIR** : ProcessEdgeInterferences
- **TopOpeBRepDS_Edge3dInterferenceTool** : Add, Init, InitPointVertex, Transition
- **TopOpeBRepDS_EdgeInterferenceTool** : Add, Init, Transition
- **TopOpeBRepDS_EdgeVertexInterference** ← TopOpeBRepDS_ShapeShapeInterference (2 ctor) : DynamicType, Parameter · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_Explorer** (2 ctor) : Current, Edge, Face, Index, Init, More, Next, Type, Vertex
- **TopOpeBRepDS_FIR** : ProcessFaceInterferences
- **TopOpeBRepDS_FaceEdgeInterference** ← TopOpeBRepDS_ShapeShapeInterference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_FaceInterferenceTool** : Add, GetEdgePntPar, Init, IsEdgePntParDef, SetEdgePntPar, Transition
- **TopOpeBRepDS_Filter** : ProcessCurveInterferences, ProcessEdgeInterferences, ProcessFaceInterferences, ProcessInterferences
- **TopOpeBRepDS_GapFiller** : AddPointsOnConnexShape, AddPointsOnShape, BuildNewGeometries, CheckConnexity, FilterByEdge, FilterByFace, FilterByIncidentDistance, FindAssociatedPoints, IsOnEdge, IsOnFace, Perform, ReBuildGeom
- **TopOpeBRepDS_GapTool** ← Standard_Transient (2 ctor) : ChangeSameInterferences, Curve, DynamicType, EdgeSupport, FacesSupport, Init, Interferences, ParameterOnEdge, SameInterferences, SetParameterOnEdge, SetPoint · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_GeometryData** (2 ctor) : AddInterference, Assign, ChangeInterferences, Interferences
- **TopOpeBRepDS_HDataStructure** ← Standard_Transient : AddAncestors, ChangeCurve, ChangeDS, ChkIntg, ClearStoreInterferences, Curve, CurvePoints, DS, DynamicType, EdgePoints, EdgesSameParameter, FaceCurves, GetGeometry, HasGeometry, HasSameDomain, HasShape, MakeCurve, MinMaxOnParameter, NbCurves, NbGeometry, NbPoints, NbShapes, NbSurfaces, NbTopology, Point, RemoveCurve, SameDomain, SameDomainOrientation, SameDomainReference, ScanInterfList, Shape, SolidSurfaces, SortOnParameter, StoreInterference, StoreInterferences, Surface, SurfaceCurves · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_Interference** ← Standard_Transient (3 ctor) : ChangeTransition, DynamicType, GKGSKS, Geometry, GeometryType, HasSameGeometry, HasSameSupport, SetGeometry, Support, SupportType, Transition · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_InterferenceIterator** (2 ctor) : ChangeIterator, Geometry, GeometryKind, Init, Match, MatchInterference, More, Next, Support, SupportKind, Value
- **TopOpeBRepDS_InterferenceTool** · *statiques :* DuplicateCurvePointInterference, MakeCurveInterference, MakeEdgeInterference, MakeEdgeVertexInterference, MakeFaceCurveInterference, MakeFaceEdgeInterference, MakeSolidSurfaceInterference, Parameter
- **TopOpeBRepDS_Kind** · *statiques :* TopOpeBRepDS_COMPOUND, TopOpeBRepDS_COMPSOLID, TopOpeBRepDS_CURVE, TopOpeBRepDS_EDGE, TopOpeBRepDS_FACE, TopOpeBRepDS_POINT, TopOpeBRepDS_SHELL, TopOpeBRepDS_SOLID, TopOpeBRepDS_SURFACE, TopOpeBRepDS_UNKNOWN, TopOpeBRepDS_VERTEX, TopOpeBRepDS_WIRE
- **TopOpeBRepDS_ListOfInterference** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopOpeBRepDS_ListOfShapeOn1State** : ChangeListOnState, Clear, IsSplit, ListOnState, Split
- **TopOpeBRepDS_Marker** ← Standard_Transient : Allocate, DynamicType, GetI, Reset, Set · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_Point** (3 ctor) : ChangeKeep, ChangePoint, IsEqual, Keep, Point, Tolerance
- **TopOpeBRepDS_PointData** ← TopOpeBRepDS_GeometryData (3 ctor) : GetShapes, SetShapes
- **TopOpeBRepDS_PointExplorer** (2 ctor) : Index, Init, IsPoint, IsPointKeep, More, NbPoint, Next, Point
- **TopOpeBRepDS_PointIterator** ← TopOpeBRepDS_InterferenceIterator : Current, DiffOriented, IsPoint, IsVertex, MatchInterference, Orientation, Parameter, SameOriented, Support
- **TopOpeBRepDS_Reducer** : ProcessEdgeInterferences, ProcessFaceInterferences
- **TopOpeBRepDS_ShapeData** : ChangeInterferences, ChangeKeep, Interferences, Keep
- **TopOpeBRepDS_ShapeShapeInterference** ← TopOpeBRepDS_Interference : Config, DynamicType, GBound, SetGBound · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_ShapeWithState** : AddPart, AddParts, IsSplitted, Part, SetIsSplitted, SetState, State
- **TopOpeBRepDS_SolidSurfaceInterference** ← TopOpeBRepDS_Interference : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_Surface** (3 ctor) : Assign, ChangeKeep, Keep, Surface, Tolerance
- **TopOpeBRepDS_SurfaceCurveInterference** ← TopOpeBRepDS_Interference (3 ctor) : DynamicType, PCurve · *statiques :* get_type_descriptor, get_type_name
- **TopOpeBRepDS_SurfaceData** ← TopOpeBRepDS_GeometryData (2 ctor)
- **TopOpeBRepDS_SurfaceExplorer** (2 ctor) : Index, Init, IsSurface, IsSurfaceKeep, More, NbSurface, Next, Surface
- **TopOpeBRepDS_SurfaceIterator** ← TopOpeBRepDS_InterferenceIterator : Current, Orientation
- **TopOpeBRepDS_TKI** : Add, ChangeInterferences, ChangeValue, Clear, DumpTKIIterator, FillOnGeometry, FillOnSupport, HasInterferences, Init, Interferences, IsBound, More, Next, Value
- **TopOpeBRepDS_TOOL** · *statiques :* EShareG, GetConfig, GetEsd, ShareG, ShareSplitON
- **TopOpeBRepDS_Transition** (3 ctor) : After, Before, Complement, Index, IndexAfter, IndexBefore, IsUnknown, ONAfter, ONBefore, Orientation, Set, ShapeAfter, ShapeBefore, StateAfter, StateBefore

## TopOpeBRepTool

- **TopOpeBRepTool_AncestorsTool** · *statiques :* MakeAncestors
- **TopOpeBRepTool_BoxSort** (2 ctor) : AddBoxes, AddBoxesMakeCOB, Box, Clear, Compare, HAB, HABShape, HBoxTool, MakeCOB, MakeHAB, SetHBoxTool, TouchedShape · *statiques :* MakeHABCOB
- **TopOpeBRepTool_C2DF** (2 ctor) : Face, IsFace, IsPC, PC, SetFace, SetPC
- **TopOpeBRepTool_CLASSI** : Add2d, ClassiBnd2d, Classilist, Classip2d, GetBox2d, Getface, HasInit2d, Init2d
- **TopOpeBRepTool_CORRISO** (2 ctor) : AddNewConnexity, Connexity, EdgeOUTofBoundsUV, EdgeWithFaultyUV, EdgesOUTofBoundsUV, EdgesWithFaultyUV, Eds, Fref, GASref, GetnewS, Init, PurgeFyClosingE, Refclosed, RemoveOldConnexity, S, SetConnexity, SetUVRep, Tol, TrslUV, UVClosed, UVRep
- **TopOpeBRepTool_CurveTool** (3 ctor) : ChangeGeomTool, GetGeomTool, MakeCurves, SetGeomTool · *statiques :* IsProjectable, MakeBSpline1fromPnt, MakeBSpline1fromPnt2d, MakePCurveOnFace
- **TopOpeBRepTool_FuseEdges** : AvoidEdges, Edges, Faces, NbVertices, Perform, ResultEdges, Shape
- **TopOpeBRepTool_GeomTool** : CompC3D, CompPC1, CompPC2, Define, DefineCurves, DefinePCurves1, DefinePCurves2, GetTolerances, NbPntMax, SetNbPntMax, SetTolerances, TypeC3D
- **TopOpeBRepTool_HBoxTool** ← Standard_Transient : AddBox, AddBoxes, Box, ChangeIMS, Clear, DynamicType, Extent, HasBox, IMS, Index, Shape · *statiques :* ComputeBox, ComputeBoxOnVertices, DumpB, get_type_descriptor, get_type_name
- **TopOpeBRepTool_ListOfC2DF** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopOpeBRepTool_OutCurveType** · *statiques :* TopOpeBRepTool_APPROX, TopOpeBRepTool_BSPLINE1, TopOpeBRepTool_INTERPOL
- **TopOpeBRepTool_PurgeInternalEdges** : Faces, IsDone, NbEdges, Perform, Shape
- **TopOpeBRepTool_REGUS** : GetFsplits, GetOshNsh, Init, InitBlock, MapS, NearestF, NextinBlock, REGU, S, SetFsplits, SetOshNsh, SplitFaces · *statiques :* SplitF, WireToFace
- **TopOpeBRepTool_REGUW** : AddNewConnexity, Connexity, Fref, GetEsplits, GetOwNw, GetSplits, HasInit, Init, InitBlock, MapS, NearestE, NextinBlock, REGU, RemoveOldConnexity, S, SetEsplits, SetOwNw, SplitEds, UpdateMultiple
- **TopOpeBRepTool_ShapeClassifier** (2 ctor) : ChangeSolidClassifier, ClearAll, ClearCurrent, P2D, P3D, SameDomain, SetReference, State, StateP2DReference, StateP3DReference, StateShapeReference, StateShapeShape
- **TopOpeBRepTool_ShapeExplorer** ← TopExp_Explorer (2 ctor) : Index, Init, Next
- **TopOpeBRepTool_ShapeTool** · *statiques :* AdjustOnPeriodic, BASISCURVE, BASISSURFACE, Closed, CurvesSameOriented, EdgeData, EdgesSameOriented, FacesSameOriented, PeriodizeParameter, Pnt, Resolution3d, Resolution3dU, Resolution3dV, ShapesSameOriented, SurfacesSameOriented, Tolerance, UVBOUNDS
- **TopOpeBRepTool_SolidClassifier** : Classify, Clear, LoadShell, LoadSolid, State
- **TopOpeBRepTool_TOOL** · *statiques :* ClosedE, ClosedS, CurvE, CurvF, EdgeONFace, Getduv, Getstp3dF, IsClosingE, IsQuad, IsonCLO, Matter, MatterKPtg, MkShell, NgApp, NggeomF, Nt, OnBoundary, OriinSor, OriinSorclosed, ParE, ParE2d, ParISO, Remove, SplitE, Tg2d, Tg2dApp, TgINSIDE, TggeomE, TolP, TolUV, TrslUV, TrslUVModifE, UVF, UVISO, Vertex, Vertices, WireToFace, XX, minDUV, outUVbounds, stuvF, tryNgApp, tryOriEinF, tryTg2dApp, uvApp
- **TopOpeBRepTool_connexity** (2 ctor) : AddItem, AllItems, ChangeItem, IsFaulty, IsInternal, IsMultiple, Item, Key, RemoveItem, SetKey
- **TopOpeBRepTool_face** : Ffinite, Finite, Init, IsDone, RealF, W
- **TopOpeBRepTool_makeTransition** : Getfactor, HasRest, Initialize, IsT2d, MkT2donE, MkT3dproj, MkT3onE, MkTonE, SetRest, Setfactor
- **TopOpeBRepTool_mkTondgE** : GetAllRest, Initialize, IsT2d, MkTonE, SetRest, SetclE

## TopTools

- **TopTools_Array1OfListOfShape** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TopTools_Array1OfShape** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end
- **TopTools_ListOfListOfShape** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopTools_ListOfShape** ★ (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **TopTools_LocationSet** : Add, Clear, Dump, GetProgress, Index, Location, Read, SetProgress, Write
- **TopTools_MutexForShapeProvider** : CreateMutexForShape, CreateMutexesForSubShapes, GetMutex, RemoveAllMutexes
- **TopTools_OrientedShapeMapHasher** · *statiques :* HashCode, IsEqual
- **TopTools_ShapeMapHasher** · *statiques :* HashCode, IsEqual
- **TopTools_ShapeSet** : Add, AddGeometry, AddShapes, ChangeLocations, Check, Clear, Dump, DumpExtent, DumpGeometry, FormatNb, GetProgress, Index, Locations, NbShapes, Read, ReadGeometry, SetFormatNb, SetProgress, Shape, Write, WriteGeometry

## TopTrans

- **TopTrans_CurveTransition** : Compare, Reset, StateAfter, StateBefore
- **TopTrans_SurfaceTransition** : Compare, Reset, StateAfter, StateBefore · *statiques :* GetAfter, GetBefore

## Transfer

- **Transfer_ActorDispatch** ← Transfer_ActorOfTransientProcess (3 ctor) : AddActor, DynamicType, Transfer, TransferDispatch · *statiques :* get_type_descriptor, get_type_name
- **Transfer_ActorOfFinderProcess** ← Transfer_ActorOfProcessForFinder : DynamicType, ModeTrans, Transfer, TransferTransient, Transferring · *statiques :* get_type_descriptor, get_type_name
- **Transfer_ActorOfProcessForFinder** ← Standard_Transient : DynamicType, IsLast, Next, NullResult, Recognize, SetLast, SetNext, Transferring, TransientResult · *statiques :* get_type_descriptor, get_type_name
- **Transfer_ActorOfProcessForTransient** ← Standard_Transient : DynamicType, IsLast, Next, NullResult, Recognize, SetLast, SetNext, Transferring, TransientResult · *statiques :* get_type_descriptor, get_type_name
- **Transfer_ActorOfTransientProcess** ← Transfer_ActorOfProcessForTransient : DynamicType, Transfer, TransferTransient, Transferring · *statiques :* get_type_descriptor, get_type_name
- **Transfer_Binder** ← Standard_Transient : AddFail, AddResult, AddWarning, CCheck, Check, DynamicType, HasResult, IsMultiple, Merge, NextResult, ResultType, ResultTypeName, SetAlreadyUsed, SetStatusExec, Status, StatusExec · *statiques :* get_type_descriptor, get_type_name
- **Transfer_BinderOfTransientInteger** ← Transfer_SimpleBinderOfTransient : DynamicType, Integer, SetInteger · *statiques :* get_type_descriptor, get_type_name
- **Transfer_DataInfo** · *statiques :* Type, TypeName
- **Transfer_DispatchControl** ← Interface_CopyControl : Bind, Clear, DynamicType, Search, StartingModel, TransientProcess · *statiques :* get_type_descriptor, get_type_name
- **Transfer_FindHasher** · *statiques :* HashCode, IsEqual
- **Transfer_Finder** ← Standard_Transient : AttrList, Attribute, AttributeType, DynamicType, Equates, GetAttribute, GetAttributes, GetHashCode, GetIntegerAttribute, GetRealAttribute, GetStringAttribute, IntegerAttribute, RealAttribute, RemoveAttribute, SameAttributes, SetAttribute, SetIntegerAttribute, SetRealAttribute, SetStringAttribute, StringAttribute, ValueType, ValueTypeName · *statiques :* get_type_descriptor, get_type_name
- **Transfer_FinderProcess** ← Transfer_ProcessForFinder : DynamicType, Model, NextMappedWithAttribute, PrintStats, PrintTrace, SetModel, TransientMapper · *statiques :* get_type_descriptor, get_type_name
- **Transfer_IteratorOfProcessForFinder** ← Transfer_TransferIterator : Add, Filter, HasStarting, Starting
- **Transfer_IteratorOfProcessForTransient** ← Transfer_TransferIterator : Add, Filter, HasStarting, Starting
- **Transfer_MapContainer** ← Standard_Transient : DynamicType, GetMapObjects, SetMapObjects · *statiques :* get_type_descriptor, get_type_name
- **Transfer_MultipleBinder** ← Transfer_Binder : AddResult, DynamicType, IsMultiple, MultipleResult, NbResults, ResultType, ResultTypeName, ResultValue, SetMultipleResult · *statiques :* get_type_descriptor, get_type_name
- **Transfer_ProcessForFinder** ← Standard_Transient (2 ctor) : AbnormalResult, Actor, AddError, AddFail, AddMultiple, AddWarning, Bind, BindMultiple, BindTransient, Check, CheckList, CheckListOne, CheckNum, Clean, Clear, CompleteResult, DynamicType, ErrorHandle, Find, FindElseBind, FindTransient, FindTypedTransient, GetProgress, GetTypedTransient, IsAlreadyUsed, IsBound, IsCheckListEmpty, IsLooping, MapIndex, MapItem, Mapped, Mend, Messenger, NbMapped, NbRoots, NestingLevel, PrintTrace, Rebind, Recognize, RemoveResult, ResetNestingLevel, Resize, ResultOne, Root, RootIndex, RootItem, RootResult, SendFail, SendMsg, SendWarning, SetActor, SetErrorHandle, SetMessenger, SetProgress, SetRoot, SetRootManagement, SetTraceLevel, StartTrace, TraceLevel, Transfer, Transferring, Unbind · *statiques :* get_type_descriptor, get_type_name
- **Transfer_ProcessForTransient** ← Standard_Transient (2 ctor) : AbnormalResult, Actor, AddError, AddFail, AddMultiple, AddWarning, Bind, BindMultiple, BindTransient, Check, CheckList, CheckListOne, CheckNum, Clean, Clear, CompleteResult, DynamicType, ErrorHandle, Find, FindElseBind, FindTransient, FindTypedTransient, GetProgress, GetTypedTransient, IsAlreadyUsed, IsBound, IsCheckListEmpty, IsLooping, MapIndex, MapItem, Mapped, Mend, Messenger, NbMapped, NbRoots, NestingLevel, PrintTrace, Rebind, Recognize, RemoveResult, ResetNestingLevel, Resize, ResultOne, Root, RootIndex, RootItem, RootResult, SendFail, SendMsg, SendWarning, SetActor, SetErrorHandle, SetMessenger, SetProgress, SetRoot, SetRootManagement, SetTraceLevel, StartTrace, TraceLevel, Transfer, Transferring, Unbind · *statiques :* get_type_descriptor, get_type_name
- **Transfer_ResultFromModel** ← Standard_Transient : CheckList, CheckStatus, CheckedList, ComputeCheckStatus, DynamicType, FileName, Fill, FillBack, HasResult, MainLabel, MainNumber, MainResult, Model, ResultFromKey, Results, SetFileName, SetMainResult, SetModel, Strip, TransferredList · *statiques :* get_type_descriptor, get_type_name
- **Transfer_ResultFromTransient** ← Standard_Transient : AddSubResult, Binder, Check, CheckStatus, ClearSubs, DynamicType, Fill, FillBack, FillMap, HasResult, NbSubResults, ResultFromKey, SetBinder, SetStart, Start, Strip, SubResult · *statiques :* get_type_descriptor, get_type_name
- **Transfer_SimpleBinderOfTransient** ← Transfer_Binder : DynamicType, Result, ResultType, ResultTypeName, SetResult · *statiques :* GetTypedResult, get_type_descriptor, get_type_name
- **Transfer_StatusExec** · *statiques :* Transfer_StatusDone, Transfer_StatusError, Transfer_StatusInitial, Transfer_StatusLoop, Transfer_StatusRun
- **Transfer_StatusResult** · *statiques :* Transfer_StatusDefined, Transfer_StatusUsed, Transfer_StatusVoid
- **Transfer_TransferDeadLoop** ← Transfer_TransferFailure (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Transfer_TransferDispatch** ← Interface_CopyTool (3 ctor) : Copy, TransientProcess
- **Transfer_TransferFailure** ← Interface_InterfaceError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Transfer_TransferInput** : Entities, FillModel
- **Transfer_TransferIterator** : AddItem, Check, HasFails, HasResult, HasTransientResult, HasUniqueResult, HasWarnings, More, Next, Number, ResultType, SelectBinder, SelectItem, SelectResult, SelectUnique, Start, Status, TransientResult, Value
- **Transfer_TransferOutput** (2 ctor) : ListForStatus, Model, ModelForStatus, Transfer, TransferRoots, TransientProcess
- **Transfer_TransientListBinder** ← Transfer_Binder (2 ctor) : AddResult, DynamicType, IsMultiple, NbTransients, Result, ResultType, ResultTypeName, SetResult, Transient · *statiques :* get_type_descriptor, get_type_name
- **Transfer_TransientMapper** ← Transfer_Finder : DynamicType, Equates, Value, ValueType, ValueTypeName · *statiques :* get_type_descriptor, get_type_name
- **Transfer_TransientProcess** ← Transfer_ProcessForTransient : CheckNum, Context, DynamicType, GetContext, Graph, HGraph, HasGraph, IsDataFail, IsDataLoaded, Model, PrintStats, PrintTrace, RootsForTransfer, SetContext, SetGraph, SetModel, TypedSharings · *statiques :* get_type_descriptor, get_type_name
- **Transfer_UndefMode** · *statiques :* Transfer_UndefContent, Transfer_UndefFailure, Transfer_UndefIgnore, Transfer_UndefUser
- **Transfer_VoidBinder** ← Transfer_Binder : DynamicType, ResultType, ResultTypeName · *statiques :* get_type_descriptor, get_type_name

## TransferBRep

- **TransferBRep_BinderOfShape** ← Transfer_Binder (2 ctor) : CResult, DynamicType, Result, ResultType, ResultTypeName, SetResult · *statiques :* get_type_descriptor, get_type_name
- **TransferBRep_OrientedShapeMapper** ← Transfer_Finder : DynamicType, Equates, Value, ValueType, ValueTypeName · *statiques :* get_type_descriptor, get_type_name
- **TransferBRep_Reader** : Actor, BeginTransfer, CheckListModel, CheckListResult, CheckStatusModel, CheckStatusResult, Clear, EndTransfer, FileNotFound, FileStatus, IsDone, ModeNewTransfer, Model, NbShapes, NbTransients, OneShape, PrepareTransfer, Protocol, SetActor, SetFileStatus, SetModel, SetProtocol, Shape, ShapeResult, Shapes, SyntaxError, Transfer, TransferList, TransferRoots, Transient, TransientProcess, Transients
- **TransferBRep_ShapeBinder** ← TransferBRep_BinderOfShape (2 ctor) : CompSolid, Compound, DynamicType, Edge, Face, ShapeType, Shell, Solid, Vertex, Wire · *statiques :* get_type_descriptor, get_type_name
- **TransferBRep_ShapeInfo** · *statiques :* Type, TypeName
- **TransferBRep_ShapeListBinder** ← Transfer_Binder (2 ctor) : AddResult, CompSolid, Compound, DynamicType, Edge, Face, IsMultiple, NbShapes, Result, ResultType, ResultTypeName, SetResult, Shape, ShapeType, Shell, Solid, Vertex, Wire · *statiques :* get_type_descriptor, get_type_name
- **TransferBRep_ShapeMapper** ← Transfer_Finder : DynamicType, Equates, Value, ValueType, ValueTypeName · *statiques :* get_type_descriptor, get_type_name
- **TransferBRep_TransferResultInfo** ← Standard_Transient : Clear, DynamicType, NoResult, NoResultFail, NoResultWarning, NoResultWarningFail, Result, ResultFail, ResultWarning, ResultWarningFail · *statiques :* get_type_descriptor, get_type_name

## TShort

- **TShort_Array1OfShortReal** (4 ctor) : Assign, ChangeFirst, ChangeLast, ChangeValue, First, Init, IsAllocated, IsDeletable, IsEmpty, Last, Length, Lower, Move, Resize, SetValue, Size, Upper, Value, begin, cbegin, cend, end

## Units

- **Units_Dimensions** ← Standard_Transient : AmountOfSubstance, Divide, Dump, DynamicType, ElectricCurrent, IsEqual, IsNotEqual, Length, LuminousIntensity, Mass, Multiply, PlaneAngle, Power, Quantity, SolidAngle, ThermodynamicTemperature, Time · *statiques :* AAmountOfSubstance, AElectricCurrent, ALength, ALess, ALuminousIntensity, AMass, APlaneAngle, ASolidAngle, AThermodynamicTemperature, ATime, get_type_descriptor, get_type_name
- **Units_Explorer** (5 ctor) : Init, IsActive, MoreQuantity, MoreUnit, NextQuantity, NextUnit, Quantity, Unit
- **Units_Lexicon** ← Standard_Transient : AddToken, Creates, Dump, DynamicType, Sequence · *statiques :* get_type_descriptor, get_type_name
- **Units_MathSentence** ← Units_Sentence
- **Units_Measurement** (3 ctor) : Add, Convert, Divide, Dump, Fractional, HasToken, Integer, Measurement, Multiply, Power, Subtract, Token
- **Units_NoSuchType** ← Standard_NoSuchObject (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Units_NoSuchUnit** ← Standard_NoSuchObject (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **Units_Quantity** ← Standard_Transient : Dimensions, Dump, DynamicType, IsEqual, Name, Sequence · *statiques :* get_type_descriptor, get_type_name
- **Units_Sentence** : Dump, Evaluate, IsDone, Sequence, SetConstants
- **Units_ShiftedToken** ← Units_Token : Creates, Divided, Dump, DynamicType, Move, Multiplied · *statiques :* get_type_descriptor, get_type_name
- **Units_ShiftedUnit** ← Units_Unit (3 ctor) : Dump, DynamicType, Move, Token · *statiques :* get_type_descriptor, get_type_name
- **Units_Token** ← Standard_Transient (6 ctor) : Add, Creates, Dimensions, Divide, Divided, Dump, DynamicType, IsEqual, IsGreater, IsGreaterOrEqual, IsLessOrEqual, IsNotEqual, Length, Mean, Multiplied, Multiply, Power, Subtract, Update, Value, Word · *statiques :* get_type_descriptor, get_type_name
- **Units_Unit** ← Standard_Transient (3 ctor) : Dump, DynamicType, IsEqual, Name, Quantity, Symbol, SymbolsSequence, Token, Value · *statiques :* get_type_descriptor, get_type_name
- **Units_UnitSentence** ← Units_Sentence (2 ctor) : Analyse, SetUnits
- **Units_UnitsDictionary** ← Standard_Transient : ActiveUnit, Creates, Dump, DynamicType, Sequence · *statiques :* get_type_descriptor, get_type_name
- **Units_UnitsLexicon** ← Units_Lexicon : Creates, Dump, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **Units_UnitsSystem** ← Standard_Transient (2 ctor) : Activate, Activates, ActiveUnit, ActiveUnitsSequence, ConvertSIValueToUserSystem, ConvertUserSystemValueToSI, ConvertValueToUserSystem, Dump, DynamicType, IsEmpty, QuantitiesSequence, Remove, Specify · *statiques :* get_type_descriptor, get_type_name

## UnitsAPI

- **UnitsAPI_SystemUnits** · *statiques :* UnitsAPI_DEFAULT, UnitsAPI_MDTV, UnitsAPI_SI

## V3d

- **V3d_AmbientLight** ← Graphic3d_CLight (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **V3d_BadValue** ← Standard_OutOfRange (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **V3d_CircularGrid**
- **V3d_DirectionalLight** ← V3d_PositionLight (4 ctor) : DynamicType, SetDirection · *statiques :* get_type_descriptor, get_type_name
- **V3d_ListOfLight** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **V3d_ListOfView** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **V3d_Plane** ← Standard_Transient : ClipPlane, Display, DynamicType, Erase, IsDisplayed, Plane, SetPlane · *statiques :* get_type_descriptor, get_type_name
- **V3d_PositionLight** ← Graphic3d_CLight : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **V3d_PositionalLight** ← V3d_PositionLight (2 ctor) : DynamicType · *statiques :* get_type_descriptor, get_type_name
- **V3d_RectangularGrid**
- **V3d_SpotLight** ← V3d_PositionLight (4 ctor) : DynamicType, SetDirection · *statiques :* get_type_descriptor, get_type_name
- **V3d_StereoDumpOptions** · *statiques :* V3d_SDO_BLENDED, V3d_SDO_LEFT_EYE, V3d_SDO_MONO, V3d_SDO_RIGHT_EYE
- **V3d_Trihedron** ← Standard_Transient : Display, DynamicType, Erase, SetArrowDiameter, SetArrowsColor, SetLabelsColor, SetNbFacets, SetPosition, SetScale, SetSizeRatio, SetWireframe · *statiques :* get_type_descriptor, get_type_name
- **V3d_TypeOfAxe** · *statiques :* V3d_X, V3d_Y, V3d_Z
- **V3d_TypeOfBackfacingModel** · *statiques :* V3d_TOBM_ALWAYS_DISPLAYED, V3d_TOBM_AUTOMATIC, V3d_TOBM_NEVER_DISPLAYED
- **V3d_TypeOfOrientation** · *statiques :* V3d_TypeOfOrientation_Yup_AxoLeft, V3d_TypeOfOrientation_Yup_AxoRight, V3d_TypeOfOrientation_Yup_Back, V3d_TypeOfOrientation_Yup_Bottom, V3d_TypeOfOrientation_Yup_Front, V3d_TypeOfOrientation_Yup_Left, V3d_TypeOfOrientation_Yup_Right, V3d_TypeOfOrientation_Yup_Top, V3d_TypeOfOrientation_Zup_AxoLeft, V3d_TypeOfOrientation_Zup_AxoRight, V3d_TypeOfOrientation_Zup_Back, V3d_TypeOfOrientation_Zup_Bottom, V3d_TypeOfOrientation_Zup_Front, V3d_TypeOfOrientation_Zup_Left, V3d_TypeOfOrientation_Zup_Right, V3d_TypeOfOrientation_Zup_Top, V3d_Xneg, V3d_XnegYneg, V3d_XnegYnegZneg, V3d_XnegYnegZpos, V3d_XnegYpos, V3d_XnegYposZneg, V3d_XnegYposZpos, V3d_XnegZneg, V3d_XnegZpos, V3d_Xpos, V3d_XposYneg, V3d_XposYnegZneg, V3d_XposYnegZpos, V3d_XposYpos, V3d_XposYposZneg, V3d_XposYposZpos, V3d_XposZneg, V3d_XposZpos, V3d_Yneg, V3d_YnegZneg, V3d_YnegZpos, V3d_Ypos, V3d_YposZneg, V3d_YposZpos, V3d_Zneg, V3d_Zpos
- **V3d_TypeOfPickCamera** · *statiques :* V3d_ExtRADIUSCAMERA, V3d_IntRADIUSCAMERA, V3d_NOTHINGCAMERA, V3d_POSITIONCAMERA, V3d_RADIUSTEXTCAMERA, V3d_SPACECAMERA
- **V3d_TypeOfPickLight** · *statiques :* V3d_ExtRADIUSLIGHT, V3d_IntRADIUSLIGHT, V3d_NOTHING, V3d_POSITIONLIGHT, V3d_RADIUSTEXTLIGHT, V3d_SPACELIGHT
- **V3d_TypeOfRepresentation** · *statiques :* V3d_COMPLETE, V3d_PARTIAL, V3d_SAMELAST, V3d_SIMPLE
- **V3d_TypeOfView** · *statiques :* V3d_ORTHOGRAPHIC, V3d_PERSPECTIVE
- **V3d_TypeOfVisualization** · *statiques :* V3d_WIREFRAME, V3d_ZBUFFER
- **V3d_UnMapped** ← Standard_DomainError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **V3d_View** ← Standard_Transient (2 ctor) : ActiveLight, ActiveLightIterator, AddClipPlane, At, AutoZFit, AutoZFitMode, AutoZFitScaleFactor, AxialScale, BackFacingModel, BackgroundColor, Camera, ChangeRenderingParams, ClipPlanes, ComputedMode, Convert, ConvertToGrid, ConvertWithProj, DefaultCamera, Depth, DepthFitAll, DiagnosticInformation, DoMapping, Dump, DynamicType, Eye, FitAll, FitMinMax, FocalReferencePoint, Focale, GetGraduatedTrihedron, GradientBackground, GradientBackgroundColors, GraduatedTrihedronDisplay, GraduatedTrihedronErase, GravityPoint, IfMoreLights, IfWindow, InitActiveLights, Invalidate, InvalidateImmediate, IsActiveLight, IsCullingEnabled, IsEmpty, IsInvalidated, IsInvalidatedImmediate, LightLimit, MoreActiveLights, Move, MustBeResized, NextActiveLights, Pan, Panning, Place, PlaneLimit, Proj, ProjReferenceAxe, Project, Redraw, RedrawImmediate, Remove, RemoveClipPlane, RenderingParams, Reset, ResetViewMapping, ResetViewOrientation, Rotate, Rotation, Scale, SetAt, SetAutoZFitMode, SetAxialScale, SetAxis, SetBackFacingModel, SetBackgroundColor, SetBackgroundCubeMap, SetBackgroundImage, SetBgGradientColors, SetBgGradientStyle, SetBgImageStyle, SetCamera, SetCenter, SetClipPlanes, SetComputedMode, SetDepth, SetEye, SetFocale, SetFront, SetFrustumCulling, SetGrid, SetGridActivity, SetImmediateUpdate, SetLightOff, SetLightOn, SetMagnify, SetProj, SetScale, SetShadingModel, SetSize, SetTextureEnv, SetTwist, SetUp, SetViewMappingDefault, SetViewOrientationDefault, SetVisualization, SetWindow, SetZSize, SetZoom, ShadingModel, Size, StartRotation, StartZoomAtPoint, StatisticInformation, TextureEnv, ToPixMap, Translate, TriedronDisplay, TriedronErase, Turn, Twist, Type, Up, Update, UpdateLights, View, Viewer, Visualization, Window, WindowFit, WindowFitAll, ZBufferTriedronSetup, ZFitAll, ZSize, Zoom, ZoomAtPoint · *statiques :* get_type_descriptor, get_type_name
- **V3d_Viewer** ← Standard_Transient (2 ctor) : ActivateGrid, ActiveLight, ActiveLightIterator, ActiveView, ActiveViewIterator, AddLight, AddZLayer, CircularGridGraphicValues, CircularGridValues, ComputedMode, CreateView, DeactivateGrid, DefaultBackgroundColor, DefaultBgGradientColors, DefaultComputedMode, DefaultRenderingParams, DefaultShadingModel, DefaultTypeOfView, DefaultViewProj, DefaultViewSize, DefaultVisualization, DefinedLight, DefinedLightIterator, DefinedView, DefinedViewIterator, DelLight, DisplayPrivilegedPlane, Driver, DynamicType, Erase, GetAllZLayers, GetGradientBackground, Grid, GridDrawMode, GridEcho, GridType, HideGridEcho, IfMoreViews, InitActiveLights, InitActiveViews, InitDefinedLights, InitDefinedViews, InsertLayerAfter, InsertLayerBefore, Invalidate, IsActive, IsGlobalLight, LastActiveView, MoreActiveLights, MoreActiveViews, MoreDefinedLights, MoreDefinedViews, NextActiveLights, NextActiveViews, NextDefinedLights, NextDefinedViews, PrivilegedPlane, RectangularGridGraphicValues, RectangularGridValues, Redraw, RedrawImmediate, Remove, RemoveZLayer, SetCircularGridGraphicValues, SetCircularGridValues, SetComputedMode, SetDefaultBackgroundColor, SetDefaultBgGradientColors, SetDefaultComputedMode, SetDefaultLights, SetDefaultRenderingParams, SetDefaultShadingModel, SetDefaultTypeOfView, SetDefaultViewProj, SetDefaultViewSize, SetDefaultVisualization, SetGridEcho, SetLightOff, SetLightOn, SetPrivilegedPlane, SetRectangularGridGraphicValues, SetRectangularGridValues, SetViewOff, SetViewOn, SetZLayerSettings, ShowGridEcho, StructureManager, UnHighlight, Update, UpdateLights, ZLayerSettings · *statiques :* get_type_descriptor, get_type_name

## Vrml

- **Vrml_AsciiText** ← Standard_Transient (2 ctor) : DynamicType, Justification, SetJustification, SetSpacing, SetString, SetWidth, Spacing, String, Width · *statiques :* get_type_descriptor, get_type_name
- **Vrml_AsciiTextJustification** · *statiques :* Vrml_CENTER, Vrml_LEFT, Vrml_RIGHT
- **Vrml_Cone** : BottomRadius, Height, Parts, SetBottomRadius, SetHeight, SetParts
- **Vrml_ConeParts** · *statiques :* Vrml_ConeALL, Vrml_ConeBOTTOM, Vrml_ConeSIDES
- **Vrml_Coordinate3** ← Standard_Transient (2 ctor) : DynamicType, Point, SetPoint · *statiques :* get_type_descriptor, get_type_name
- **Vrml_Cube** : Depth, Height, SetDepth, SetHeight, SetWidth, Width
- **Vrml_Cylinder** : Height, Parts, Radius, SetHeight, SetParts, SetRadius
- **Vrml_CylinderParts** · *statiques :* Vrml_CylinderALL, Vrml_CylinderBOTTOM, Vrml_CylinderSIDES, Vrml_CylinderTOP
- **Vrml_DirectionalLight** (2 ctor) : Color, Direction, Intensity, OnOff, SetColor, SetDirection, SetIntensity, SetOnOff
- **Vrml_FaceType** · *statiques :* Vrml_CONVEX, Vrml_UNKNOWN_FACE_TYPE
- **Vrml_FontStyle** : Family, SetFamily, SetSize, SetStyle, Size, Style
- **Vrml_FontStyleFamily** · *statiques :* Vrml_SANS, Vrml_SERIF, Vrml_TYPEWRITER
- **Vrml_FontStyleStyle** · *statiques :* Vrml_BOLD, Vrml_ITALIC, Vrml_NONE
- **Vrml_Group**
- **Vrml_IndexedFaceSet** ← Standard_Transient (2 ctor) : CoordIndex, DynamicType, MaterialIndex, NormalIndex, SetCoordIndex, SetMaterialIndex, SetNormalIndex, SetTextureCoordIndex, TextureCoordIndex · *statiques :* get_type_descriptor, get_type_name
- **Vrml_IndexedLineSet** ← Standard_Transient (2 ctor) : CoordIndex, DynamicType, MaterialIndex, NormalIndex, SetCoordIndex, SetMaterialIndex, SetNormalIndex, SetTextureCoordIndex, TextureCoordIndex · *statiques :* get_type_descriptor, get_type_name
- **Vrml_Info** : SetString, String
- **Vrml_Instancing**
- **Vrml_LOD** ← Standard_Transient (2 ctor) : Center, DynamicType, Range, SetCenter, SetRange · *statiques :* get_type_descriptor, get_type_name
- **Vrml_Material** ← Standard_Transient (2 ctor) : AmbientColor, DiffuseColor, DynamicType, EmissiveColor, SetAmbientColor, SetDiffuseColor, SetEmissiveColor, SetShininess, SetSpecularColor, SetTransparency, Shininess, SpecularColor, Transparency · *statiques :* get_type_descriptor, get_type_name
- **Vrml_MaterialBinding** (2 ctor) : SetValue, Value
- **Vrml_MaterialBindingAndNormalBinding** · *statiques :* Vrml_DEFAULT, Vrml_OVERALL, Vrml_PER_FACE, Vrml_PER_FACE_INDEXED, Vrml_PER_PART, Vrml_PER_PART_INDEXED, Vrml_PER_VERTEX, Vrml_PER_VERTEX_INDEXED
- **Vrml_MatrixTransform** (2 ctor) : Matrix, SetMatrix
- **Vrml_Normal** ← Standard_Transient (2 ctor) : DynamicType, SetVector, Vector · *statiques :* get_type_descriptor, get_type_name
- **Vrml_NormalBinding** (2 ctor) : SetValue, Value
- **Vrml_OrthographicCamera** (2 ctor) : FocalDistance, Height, Orientation, Position, SetFocalDistance, SetHeight, SetOrientation, SetPosition
- **Vrml_PerspectiveCamera** (2 ctor) : Angle, FocalDistance, Orientation, Position, SetAngle, SetFocalDistance, SetOrientation, SetPosition
- **Vrml_PointLight** (2 ctor) : Color, Intensity, Location, OnOff, SetColor, SetIntensity, SetLocation, SetOnOff
- **Vrml_PointSet** : NumPoints, SetNumPoints, SetStartIndex, StartIndex
- **Vrml_Rotation** (2 ctor) : Rotation, SetRotation
- **Vrml_SFImage** ← Standard_Transient (2 ctor) : Array, ArrayFlag, DynamicType, Height, Number, SetArray, SetHeight, SetNumber, SetWidth, Width · *statiques :* get_type_descriptor, get_type_name
- **Vrml_SFImageNumber** · *statiques :* Vrml_FOUR, Vrml_NULL, Vrml_ONE, Vrml_THREE, Vrml_TWO
- **Vrml_SFRotation** (2 ctor) : Angle, RotationX, RotationY, RotationZ, SetAngle, SetRotationX, SetRotationY, SetRotationZ
- **Vrml_Scale** (2 ctor) : ScaleFactor, SetScaleFactor
- **Vrml_Separator** (2 ctor) : RenderCulling, SetRenderCulling
- **Vrml_SeparatorRenderCulling** · *statiques :* Vrml_AUTO, Vrml_OFF, Vrml_ON
- **Vrml_ShapeHints** : Angle, FaceType, SetAngle, SetFaceType, SetShapeType, SetVertexOrdering, ShapeType, VertexOrdering
- **Vrml_ShapeType** · *statiques :* Vrml_SOLID, Vrml_UNKNOWN_SHAPE_TYPE
- **Vrml_Sphere** : Radius, SetRadius
- **Vrml_SpotLight** (2 ctor) : Color, CutOffAngle, Direction, DropOffRate, Intensity, Location, OnOff, SetColor, SetCutOffAngle, SetDirection, SetDropOffRate, SetIntensity, SetLocation, SetOnOff
- **Vrml_Switch** : SetWhichChild, WhichChild
- **Vrml_Texture2** (2 ctor) : Filename, Image, SetFilename, SetImage, SetWrapS, SetWrapT, WrapS, WrapT
- **Vrml_Texture2Transform** (2 ctor) : Center, Rotation, ScaleFactor, SetCenter, SetRotation, SetScaleFactor, SetTranslation, Translation
- **Vrml_Texture2Wrap** · *statiques :* Vrml_CLAMP, Vrml_REPEAT
- **Vrml_TextureCoordinate2** ← Standard_Transient (2 ctor) : DynamicType, Point, SetPoint · *statiques :* get_type_descriptor, get_type_name
- **Vrml_Transform** (2 ctor) : Center, Rotation, ScaleFactor, ScaleOrientation, SetCenter, SetRotation, SetScaleFactor, SetScaleOrientation, SetTranslation, Translation
- **Vrml_TransformSeparator**
- **Vrml_Translation** (2 ctor) : SetTranslation, Translation
- **Vrml_VertexOrdering** · *statiques :* Vrml_CLOCKWISE, Vrml_COUNTERCLOCKWISE, Vrml_UNKNOWN_ORDERING
- **Vrml_WWWAnchor** : Description, Map, Name, SetDescription, SetMap, SetName
- **Vrml_WWWAnchorMap** · *statiques :* Vrml_MAP_NONE, Vrml_POINT
- **Vrml_WWWInline** (2 ctor) : BboxCenter, BboxSize, Name, SetBboxCenter, SetBboxSize, SetName

## VrmlAPI

- **VrmlAPI_RepresentationOfShape** · *statiques :* VrmlAPI_BothRepresentation, VrmlAPI_ShadedRepresentation, VrmlAPI_WireFrameRepresentation
- **VrmlAPI_Writer** : Drawer, GetFreeBoundsMaterial, GetFrontMaterial, GetLineMaterial, GetPointsMaterial, GetRepresentation, GetUisoMaterial, GetUnfreeBoundsMaterial, GetVisoMaterial, GetWireMaterial, ResetToDefaults, SetAmbientColorToMaterial, SetDeflection, SetDiffuseColorToMaterial, SetEmissiveColorToMaterial, SetRepresentation, SetShininessToMaterial, SetSpecularColorToMaterial, SetTransparencyToMaterial, Write, WriteDoc

## VrmlConverter

- **VrmlConverter_Curve** · *statiques :* Add
- **VrmlConverter_DeflectionCurve** · *statiques :* Add
- **VrmlConverter_Drawer** ← Standard_Transient : DeviationCoefficient, DisableDrawHiddenLine, Discretisation, DrawHiddenLine, DynamicType, EnableDrawHiddenLine, FreeBoundaryAspect, FreeBoundaryDraw, HiddenLineAspect, IsoOnPlane, LineAspect, MaximalChordialDeviation, MaximalParameterValue, PointAspect, SeenLineAspect, SetDeviationCoefficient, SetDiscretisation, SetFreeBoundaryAspect, SetFreeBoundaryDraw, SetHiddenLineAspect, SetIsoOnPlane, SetLineAspect, SetMaximalChordialDeviation, SetMaximalParameterValue, SetPointAspect, SetSeenLineAspect, SetShadingAspect, SetTypeOfDeflection, SetUIsoAspect, SetUnFreeBoundaryAspect, SetUnFreeBoundaryDraw, SetVIsoAspect, SetWireAspect, SetWireDraw, ShadingAspect, TypeOfDeflection, UIsoAspect, UnFreeBoundaryAspect, UnFreeBoundaryDraw, VIsoAspect, WireAspect, WireDraw · *statiques :* get_type_descriptor, get_type_name
- **VrmlConverter_HLRShape** · *statiques :* Add
- **VrmlConverter_IsoAspect** ← VrmlConverter_LineAspect (2 ctor) : DynamicType, Number, SetNumber · *statiques :* get_type_descriptor, get_type_name
- **VrmlConverter_LineAspect** ← Standard_Transient (2 ctor) : DynamicType, HasMaterial, Material, SetHasMaterial, SetMaterial · *statiques :* get_type_descriptor, get_type_name
- **VrmlConverter_PointAspect** ← Standard_Transient (2 ctor) : DynamicType, HasMaterial, Material, SetHasMaterial, SetMaterial · *statiques :* get_type_descriptor, get_type_name
- **VrmlConverter_Projector** ← Standard_Transient : Add, Camera, DynamicType, Light, Projector, SetCamera, SetLight · *statiques :* get_type_descriptor, get_type_name
- **VrmlConverter_ShadedShape** · *statiques :* Add, ComputeNormal
- **VrmlConverter_ShadingAspect** ← Standard_Transient : DynamicType, FrontMaterial, HasMaterial, HasNormals, SetFrontMaterial, SetHasMaterial, SetHasNormals, SetShapeHints, ShapeHints · *statiques :* get_type_descriptor, get_type_name
- **VrmlConverter_TypeOfCamera** · *statiques :* VrmlConverter_NoCamera, VrmlConverter_OrthographicCamera, VrmlConverter_PerspectiveCamera
- **VrmlConverter_TypeOfLight** · *statiques :* VrmlConverter_DirectionLight, VrmlConverter_NoLight, VrmlConverter_PointLight, VrmlConverter_SpotLight
- **VrmlConverter_WFDeflectionRestrictedFace** · *statiques :* Add, AddUIso, AddVIso
- **VrmlConverter_WFDeflectionShape** · *statiques :* Add
- **VrmlConverter_WFRestrictedFace** · *statiques :* Add, AddUIso, AddVIso
- **VrmlConverter_WFShape** · *statiques :* Add

## VrmlData

- **VrmlData_Appearance** (2 ctor)
- **VrmlData_ArrayVec3d**
- **VrmlData_Box** (2 ctor)
- **VrmlData_Color** (2 ctor)
- **VrmlData_Cone** (2 ctor)
- **VrmlData_Coordinate** (2 ctor)
- **VrmlData_Cylinder** (2 ctor)
- **VrmlData_ErrorStatus** · *statiques :* VrmlData_BooleanInputError, VrmlData_CannotOpenFile, VrmlData_EmptyData, VrmlData_EndOfFile, VrmlData_GeneralError, VrmlData_IrrelevantNumber, VrmlData_NodeNameUnknown, VrmlData_NonPositiveSize, VrmlData_NonSupportedFeature, VrmlData_NotImplemented, VrmlData_NotVrmlFile, VrmlData_NumericInputError, VrmlData_OutputStreamUndefined, VrmlData_ReadUnknownNode, VrmlData_StatusOK, VrmlData_StringInputError, VrmlData_UnrecoverableError, VrmlData_VrmlFormatError
- **VrmlData_Faceted**
- **VrmlData_Geometry**
- **VrmlData_Group** (2 ctor)
- **VrmlData_ImageTexture** (2 ctor)
- **VrmlData_ListOfNode** (3 ctor) : Append, Assign, Clear, First, Last, Prepend, RemoveFirst, Reverse, Size, begin, cbegin, cend, end, operator_assign
- **VrmlData_Material** (2 ctor)
- **VrmlData_Normal** (2 ctor)
- **VrmlData_ShapeConvert** : AddShape, Convert, ConvertDocument
- **VrmlData_ShapeNode** (2 ctor)
- **VrmlData_Sphere** (2 ctor)
- **VrmlData_Texture**
- **VrmlData_TextureCoordinate** (2 ctor)
- **VrmlData_TextureTransform**
- **VrmlData_UnknownNode** (2 ctor)
- **VrmlData_WorldInfo** (2 ctor)

## WNT

- **WNT_ClassDefinitionError** ← Standard_ConstructionError (2 ctor) : DynamicType · *statiques :* NewInstance, Raise, get_type_descriptor, get_type_name
- **WNT_OrientationType** · *statiques :* WNT_OT_LANDSCAPE, WNT_OT_PORTRAIT

## XCAFDimTolObjects

- **XCAFDimTolObjects_DatumModifWithValue** · *statiques :* XCAFDimTolObjects_DatumModifWithValue_CircularOrCylindrical, XCAFDimTolObjects_DatumModifWithValue_Distance, XCAFDimTolObjects_DatumModifWithValue_None, XCAFDimTolObjects_DatumModifWithValue_Projected, XCAFDimTolObjects_DatumModifWithValue_Spherical
- **XCAFDimTolObjects_DatumObject** ← Standard_Transient (2 ctor) : AddModifier, DynamicType, GetDatumTarget, GetDatumTargetAxis, GetDatumTargetLength, GetDatumTargetNumber, GetDatumTargetType, GetDatumTargetWidth, GetModifierWithValue, GetModifiers, GetName, GetPlane, GetPoint, GetPointTextAttach, GetPosition, GetPresentation, GetPresentationName, GetSemanticName, HasDatumTargetParams, HasPlane, HasPoint, HasPointText, IsDatumTarget, SetDatumTarget, SetDatumTargetAxis, SetDatumTargetLength, SetDatumTargetNumber, SetDatumTargetType, SetDatumTargetWidth, SetModifierWithValue, SetModifiers, SetName, SetPlane, SetPoint, SetPointTextAttach, SetPosition, SetPresentation, SetSemanticName · *statiques :* get_type_descriptor, get_type_name
- **XCAFDimTolObjects_DatumSingleModif** · *statiques :* XCAFDimTolObjects_DatumSingleModif_AnyCrossSection, XCAFDimTolObjects_DatumSingleModif_Any_LongitudinalSection, XCAFDimTolObjects_DatumSingleModif_Basic, XCAFDimTolObjects_DatumSingleModif_ContactingFeature, XCAFDimTolObjects_DatumSingleModif_DegreeOfFreedomConstraintU, XCAFDimTolObjects_DatumSingleModif_DegreeOfFreedomConstraintV, XCAFDimTolObjects_DatumSingleModif_DegreeOfFreedomConstraintW, XCAFDimTolObjects_DatumSingleModif_DegreeOfFreedomConstraintX, XCAFDimTolObjects_DatumSingleModif_DegreeOfFreedomConstraintY, XCAFDimTolObjects_DatumSingleModif_DegreeOfFreedomConstraintZ, XCAFDimTolObjects_DatumSingleModif_DistanceVariable, XCAFDimTolObjects_DatumSingleModif_FreeState, XCAFDimTolObjects_DatumSingleModif_LeastMaterialRequirement, XCAFDimTolObjects_DatumSingleModif_Line, XCAFDimTolObjects_DatumSingleModif_MajorDiameter, XCAFDimTolObjects_DatumSingleModif_MaximumMaterialRequirement, XCAFDimTolObjects_DatumSingleModif_MinorDiameter, XCAFDimTolObjects_DatumSingleModif_Orientation, XCAFDimTolObjects_DatumSingleModif_PitchDiameter, XCAFDimTolObjects_DatumSingleModif_Plane, XCAFDimTolObjects_DatumSingleModif_Point, XCAFDimTolObjects_DatumSingleModif_Translation
- **XCAFDimTolObjects_DatumTargetType** · *statiques :* XCAFDimTolObjects_DatumTargetType_Area, XCAFDimTolObjects_DatumTargetType_Circle, XCAFDimTolObjects_DatumTargetType_Line, XCAFDimTolObjects_DatumTargetType_Point, XCAFDimTolObjects_DatumTargetType_Rectangle
- **XCAFDimTolObjects_DimensionFormVariance** · *statiques :* XCAFDimTolObjects_DimensionFormVariance_A, XCAFDimTolObjects_DimensionFormVariance_B, XCAFDimTolObjects_DimensionFormVariance_C, XCAFDimTolObjects_DimensionFormVariance_CD, XCAFDimTolObjects_DimensionFormVariance_D, XCAFDimTolObjects_DimensionFormVariance_E, XCAFDimTolObjects_DimensionFormVariance_EF, XCAFDimTolObjects_DimensionFormVariance_F, XCAFDimTolObjects_DimensionFormVariance_FG, XCAFDimTolObjects_DimensionFormVariance_G, XCAFDimTolObjects_DimensionFormVariance_H, XCAFDimTolObjects_DimensionFormVariance_J, XCAFDimTolObjects_DimensionFormVariance_JS, XCAFDimTolObjects_DimensionFormVariance_K, XCAFDimTolObjects_DimensionFormVariance_M, XCAFDimTolObjects_DimensionFormVariance_N, XCAFDimTolObjects_DimensionFormVariance_None, XCAFDimTolObjects_DimensionFormVariance_P, XCAFDimTolObjects_DimensionFormVariance_R, XCAFDimTolObjects_DimensionFormVariance_S, XCAFDimTolObjects_DimensionFormVariance_T, XCAFDimTolObjects_DimensionFormVariance_U, XCAFDimTolObjects_DimensionFormVariance_V, XCAFDimTolObjects_DimensionFormVariance_X, XCAFDimTolObjects_DimensionFormVariance_Y, XCAFDimTolObjects_DimensionFormVariance_Z, XCAFDimTolObjects_DimensionFormVariance_ZA, XCAFDimTolObjects_DimensionFormVariance_ZB, XCAFDimTolObjects_DimensionFormVariance_ZC
- **XCAFDimTolObjects_DimensionGrade** · *statiques :* XCAFDimTolObjects_DimensionGrade_IT0, XCAFDimTolObjects_DimensionGrade_IT01, XCAFDimTolObjects_DimensionGrade_IT1, XCAFDimTolObjects_DimensionGrade_IT10, XCAFDimTolObjects_DimensionGrade_IT11, XCAFDimTolObjects_DimensionGrade_IT12, XCAFDimTolObjects_DimensionGrade_IT13, XCAFDimTolObjects_DimensionGrade_IT14, XCAFDimTolObjects_DimensionGrade_IT15, XCAFDimTolObjects_DimensionGrade_IT16, XCAFDimTolObjects_DimensionGrade_IT17, XCAFDimTolObjects_DimensionGrade_IT18, XCAFDimTolObjects_DimensionGrade_IT2, XCAFDimTolObjects_DimensionGrade_IT3, XCAFDimTolObjects_DimensionGrade_IT4, XCAFDimTolObjects_DimensionGrade_IT5, XCAFDimTolObjects_DimensionGrade_IT6, XCAFDimTolObjects_DimensionGrade_IT7, XCAFDimTolObjects_DimensionGrade_IT8, XCAFDimTolObjects_DimensionGrade_IT9
- **XCAFDimTolObjects_DimensionModif** · *statiques :* XCAFDimTolObjects_DimensionModif_AnyCrossSection, XCAFDimTolObjects_DimensionModif_AnyRestrictedPortionOfFeature, XCAFDimTolObjects_DimensionModif_AreaDiameter, XCAFDimTolObjects_DimensionModif_AverageSize, XCAFDimTolObjects_DimensionModif_Between, XCAFDimTolObjects_DimensionModif_CircumferenceDiameter, XCAFDimTolObjects_DimensionModif_CommonTolerance, XCAFDimTolObjects_DimensionModif_ContinuousFeature, XCAFDimTolObjects_DimensionModif_ControlledRadius, XCAFDimTolObjects_DimensionModif_FreeStateCondition, XCAFDimTolObjects_DimensionModif_LeastSquaresAssociationCriterion, XCAFDimTolObjects_DimensionModif_LocalSizeDefinedBySphere, XCAFDimTolObjects_DimensionModif_MaximumInscribedAssociation, XCAFDimTolObjects_DimensionModif_MaximumSize, XCAFDimTolObjects_DimensionModif_MedianSize, XCAFDimTolObjects_DimensionModif_MidRangeSize, XCAFDimTolObjects_DimensionModif_MinimumCircumscribedAssociation, XCAFDimTolObjects_DimensionModif_MinimumSize, XCAFDimTolObjects_DimensionModif_RangeOfSizes, XCAFDimTolObjects_DimensionModif_SpecificFixedCrossSection, XCAFDimTolObjects_DimensionModif_Square, XCAFDimTolObjects_DimensionModif_StatisticalTolerance, XCAFDimTolObjects_DimensionModif_TwoPointSize, XCAFDimTolObjects_DimensionModif_VolumeDiameter
- **XCAFDimTolObjects_DimensionObject** ← Standard_Transient (2 ctor) : AddDescription, AddModifier, DynamicType, GetClassOfTolerance, GetDescription, GetDescriptionName, GetDirection, GetLowerBound, GetLowerTolValue, GetModifiers, GetNbOfDecimalPlaces, GetPath, GetPlane, GetPoint, GetPoint2, GetPointTextAttach, GetPresentation, GetPresentationName, GetQualifier, GetSemanticName, GetType, GetUpperBound, GetUpperTolValue, GetValue, GetValues, HasDescriptions, HasPlane, HasPoint, HasPoint2, HasQualifier, HasTextPoint, IsDimWithClassOfTolerance, IsDimWithPlusMinusTolerance, IsDimWithRange, NbDescriptions, RemoveDescription, SetClassOfTolerance, SetDirection, SetLowerBound, SetLowerTolValue, SetModifiers, SetNbOfDecimalPlaces, SetPath, SetPlane, SetPoint, SetPoint2, SetPointTextAttach, SetPresentation, SetQualifier, SetSemanticName, SetType, SetUpperBound, SetUpperTolValue, SetValue, SetValues · *statiques :* get_type_descriptor, get_type_name
- **XCAFDimTolObjects_DimensionQualifier** · *statiques :* XCAFDimTolObjects_DimensionQualifier_Avg, XCAFDimTolObjects_DimensionQualifier_Max, XCAFDimTolObjects_DimensionQualifier_Min, XCAFDimTolObjects_DimensionQualifier_None
- **XCAFDimTolObjects_DimensionType** · *statiques :* XCAFDimTolObjects_DimensionType_CommonLabel, XCAFDimTolObjects_DimensionType_DimensionPresentation, XCAFDimTolObjects_DimensionType_Location_Angular, XCAFDimTolObjects_DimensionType_Location_CurvedDistance, XCAFDimTolObjects_DimensionType_Location_LinearDistance, XCAFDimTolObjects_DimensionType_Location_LinearDistance_FromCenterToInner, XCAFDimTolObjects_DimensionType_Location_LinearDistance_FromCenterToOuter, XCAFDimTolObjects_DimensionType_Location_LinearDistance_FromInnerToCenter, XCAFDimTolObjects_DimensionType_Location_LinearDistance_FromInnerToInner, XCAFDimTolObjects_DimensionType_Location_LinearDistance_FromInnerToOuter, XCAFDimTolObjects_DimensionType_Location_LinearDistance_FromOuterToCenter, XCAFDimTolObjects_DimensionType_Location_LinearDistance_FromOuterToInner, XCAFDimTolObjects_DimensionType_Location_LinearDistance_FromOuterToOuter, XCAFDimTolObjects_DimensionType_Location_None, XCAFDimTolObjects_DimensionType_Location_Oriented, XCAFDimTolObjects_DimensionType_Location_WithPath, XCAFDimTolObjects_DimensionType_Size_Angular, XCAFDimTolObjects_DimensionType_Size_CurveLength, XCAFDimTolObjects_DimensionType_Size_Diameter, XCAFDimTolObjects_DimensionType_Size_Radius, XCAFDimTolObjects_DimensionType_Size_SphericalDiameter, XCAFDimTolObjects_DimensionType_Size_SphericalRadius, XCAFDimTolObjects_DimensionType_Size_Thickness, XCAFDimTolObjects_DimensionType_Size_ToroidalHighMajorDiameter, XCAFDimTolObjects_DimensionType_Size_ToroidalHighMajorRadius, XCAFDimTolObjects_DimensionType_Size_ToroidalLowMajorDiameter, XCAFDimTolObjects_DimensionType_Size_ToroidalLowMajorRadius, XCAFDimTolObjects_DimensionType_Size_ToroidalMajorDiameter, XCAFDimTolObjects_DimensionType_Size_ToroidalMajorRadius, XCAFDimTolObjects_DimensionType_Size_ToroidalMinorDiameter, XCAFDimTolObjects_DimensionType_Size_ToroidalMinorRadius, XCAFDimTolObjects_DimensionType_Size_WithPath
- **XCAFDimTolObjects_GeomToleranceMatReqModif** · *statiques :* XCAFDimTolObjects_GeomToleranceMatReqModif_L, XCAFDimTolObjects_GeomToleranceMatReqModif_M, XCAFDimTolObjects_GeomToleranceMatReqModif_None
- **XCAFDimTolObjects_GeomToleranceModif** · *statiques :* XCAFDimTolObjects_GeomToleranceModif_All_Around, XCAFDimTolObjects_GeomToleranceModif_All_Over, XCAFDimTolObjects_GeomToleranceModif_Any_Cross_Section, XCAFDimTolObjects_GeomToleranceModif_Common_Zone, XCAFDimTolObjects_GeomToleranceModif_Each_Radial_Element, XCAFDimTolObjects_GeomToleranceModif_Free_State, XCAFDimTolObjects_GeomToleranceModif_Least_Material_Requirement, XCAFDimTolObjects_GeomToleranceModif_Line_Element, XCAFDimTolObjects_GeomToleranceModif_Major_Diameter, XCAFDimTolObjects_GeomToleranceModif_Maximum_Material_Requirement, XCAFDimTolObjects_GeomToleranceModif_Minor_Diameter, XCAFDimTolObjects_GeomToleranceModif_Not_Convex, XCAFDimTolObjects_GeomToleranceModif_Pitch_Diameter, XCAFDimTolObjects_GeomToleranceModif_Reciprocity_Requirement, XCAFDimTolObjects_GeomToleranceModif_Separate_Requirement, XCAFDimTolObjects_GeomToleranceModif_Statistical_Tolerance, XCAFDimTolObjects_GeomToleranceModif_Tangent_Plane
- **XCAFDimTolObjects_GeomToleranceObject** ← Standard_Transient (2 ctor) : AddModifier, DynamicType, GetAffectedPlane, GetAffectedPlaneType, GetAxis, GetMaterialRequirementModifier, GetMaxValueModifier, GetModifiers, GetPlane, GetPoint, GetPointTextAttach, GetPresentation, GetPresentationName, GetSemanticName, GetType, GetTypeOfValue, GetValue, GetValueOfZoneModifier, GetZoneModifier, HasAffectedPlane, HasAxis, HasPlane, HasPoint, HasPointText, SetAffectedPlane, SetAffectedPlaneType, SetAxis, SetMaterialRequirementModifier, SetMaxValueModifier, SetModifiers, SetPlane, SetPoint, SetPointTextAttach, SetPresentation, SetSemanticName, SetType, SetTypeOfValue, SetValue, SetValueOfZoneModifier, SetZoneModifier · *statiques :* get_type_descriptor, get_type_name
- **XCAFDimTolObjects_GeomToleranceType** · *statiques :* XCAFDimTolObjects_GeomToleranceType_Angularity, XCAFDimTolObjects_GeomToleranceType_CircularRunout, XCAFDimTolObjects_GeomToleranceType_CircularityOrRoundness, XCAFDimTolObjects_GeomToleranceType_Coaxiality, XCAFDimTolObjects_GeomToleranceType_Concentricity, XCAFDimTolObjects_GeomToleranceType_Cylindricity, XCAFDimTolObjects_GeomToleranceType_Flatness, XCAFDimTolObjects_GeomToleranceType_None, XCAFDimTolObjects_GeomToleranceType_Parallelism, XCAFDimTolObjects_GeomToleranceType_Perpendicularity, XCAFDimTolObjects_GeomToleranceType_Position, XCAFDimTolObjects_GeomToleranceType_ProfileOfLine, XCAFDimTolObjects_GeomToleranceType_ProfileOfSurface, XCAFDimTolObjects_GeomToleranceType_Straightness, XCAFDimTolObjects_GeomToleranceType_Symmetry, XCAFDimTolObjects_GeomToleranceType_TotalRunout
- **XCAFDimTolObjects_GeomToleranceTypeValue** · *statiques :* XCAFDimTolObjects_GeomToleranceTypeValue_Diameter, XCAFDimTolObjects_GeomToleranceTypeValue_None, XCAFDimTolObjects_GeomToleranceTypeValue_SphericalDiameter
- **XCAFDimTolObjects_GeomToleranceZoneModif** · *statiques :* XCAFDimTolObjects_GeomToleranceZoneModif_NonUniform, XCAFDimTolObjects_GeomToleranceZoneModif_None, XCAFDimTolObjects_GeomToleranceZoneModif_Projected, XCAFDimTolObjects_GeomToleranceZoneModif_Runout
- **XCAFDimTolObjects_ToleranceZoneAffectedPlane** · *statiques :* XCAFDimTolObjects_ToleranceZoneAffectedPlane_Intersection, XCAFDimTolObjects_ToleranceZoneAffectedPlane_None, XCAFDimTolObjects_ToleranceZoneAffectedPlane_Orientation
- **XCAFDimTolObjects_Tool** : GetDimensions, GetGeomTolerances, GetRefDatum, GetRefDimensions, GetRefGeomTolerances

## XCAFDoc

- **XCAFDoc_Area** ← TDF_Attribute : DynamicType, Get, ID, NewEmpty, Paste, Restore, Set · *statiques :* Get, GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_AssemblyItemId** (3 ctor) : GetPath, Init, IsChild, IsDirectChild, IsEqual, IsNull, Nullify, ToString
- **XCAFDoc_AssemblyItemRef** ← TDF_Attribute : ClearExtraRef, DynamicType, GetGUID, GetItem, GetSubshapeIndex, HasExtraRef, ID, IsGUID, IsOrphan, IsSubshapeIndex, NewEmpty, Paste, Restore, SetGUID, SetItem, SetSubshapeIndex · *statiques :* Get, GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_Centroid** ← TDF_Attribute : DynamicType, Get, ID, NewEmpty, Paste, Restore, Set · *statiques :* Get, GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_ClippingPlaneTool** ← TDF_Attribute : AddClippingPlane, BaseLabel, DynamicType, GetCapping, GetClippingPlane, GetClippingPlanes, ID, IsClippingPlane, NewEmpty, Paste, RemoveClippingPlane, Restore, SetCapping, UpdateClippingPlane · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_Color** ← TDF_Attribute : DynamicType, GetAlpha, GetColor, GetColorRGBA, GetNOC, GetRGB, ID, NewEmpty, Paste, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_ColorTool** ← TDF_Attribute : AddColor, BaseLabel, DynamicType, FindColor, GetColor, GetColors, GetInstanceColor, ID, IsColor, IsColorByLayer, IsInstanceVisible, IsSet, IsVisible, NewEmpty, Paste, RemoveColor, Restore, ReverseChainsOfTreeNodes, SetColor, SetColorByLayer, SetInstanceColor, SetVisibility, ShapeTool, UnSetColor · *statiques :* GetColor, GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_ColorType** · *statiques :* XCAFDoc_ColorCurv, XCAFDoc_ColorGen, XCAFDoc_ColorSurf
- **XCAFDoc_Datum** ← TDF_Attribute : DynamicType, GetDescription, GetIdentification, GetName, GetObject, ID, NewEmpty, Paste, Restore, Set, SetObject · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_DimTol** ← TDF_Attribute : DynamicType, GetDescription, GetKind, GetName, GetVal, ID, NewEmpty, Paste, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_DimTolTool** ← TDF_Attribute : AddDatum, AddDimTol, AddDimension, AddGeomTolerance, BaseLabel, DynamicType, FindDatum, FindDimTol, GetDatum, GetDatumLabels, GetDatumOfTolerLabels, GetDatumWithObjectOfTolerLabels, GetDimTol, GetDimTolLabels, GetDimensionLabels, GetGDTPresentations, GetGeomToleranceLabels, GetRefDatumLabel, GetRefDimensionLabels, GetRefGeomToleranceLabels, GetRefShapeLabel, GetTolerOfDatumLabels, ID, IsDatum, IsDimTol, IsDimension, IsGeomTolerance, IsLocked, Lock, NewEmpty, Paste, Restore, SetDatum, SetDatumToGeomTol, SetDimTol, SetDimension, SetGDTPresentations, SetGeomTolerance, ShapeTool, Unlock · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_Dimension** ← TDF_Attribute : DynamicType, GetObject, ID, NewEmpty, Paste, Restore, SetObject · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_DocumentTool** ← TDF_Attribute : DynamicType, ID, Init, NewEmpty, Paste, Restore · *statiques :* ClippingPlaneTool, ClippingPlanesLabel, ColorTool, ColorsLabel, DGTsLabel, DimTolTool, DocLabel, GetID, IsXCAFDocument, LayerTool, LayersLabel, MaterialTool, MaterialsLabel, NotesLabel, NotesTool, Set, ShapeTool, ShapesLabel, ViewTool, ViewsLabel, get_type_descriptor, get_type_name
- **XCAFDoc_Editor** · *statiques :* Expand
- **XCAFDoc_GraphNode** ← TDF_Attribute : BeforeForget, ChildIndex, DynamicType, FatherIndex, GetChild, GetFather, ID, IsChild, IsFather, NbChildren, NbFathers, NewEmpty, Paste, References, Restore, SetChild, SetFather, SetGraphID, UnSetChild, UnSetFather · *statiques :* Find, GetDefaultGraphID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_LayerTool** ← TDF_Attribute : AddLayer, BaseLabel, DynamicType, FindLayer, GetLayer, GetLayerLabels, GetLayers, GetShapesOfLayer, ID, IsLayer, IsSet, IsVisible, NewEmpty, Paste, RemoveLayer, Restore, SetLayer, SetVisibility, ShapeTool, UnSetLayers, UnSetOneLayer · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_Location** ← TDF_Attribute : DynamicType, Get, ID, NewEmpty, Paste, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_Material** ← TDF_Attribute : DynamicType, GetDensName, GetDensValType, GetDensity, GetDescription, GetName, ID, NewEmpty, Paste, Restore, Set · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_MaterialTool** ← TDF_Attribute : AddMaterial, BaseLabel, DynamicType, GetMaterial, GetMaterialLabels, ID, IsMaterial, NewEmpty, Paste, Restore, SetMaterial, ShapeTool · *statiques :* GetDensityForShape, GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_Note** ← TDF_Attribute : DynamicType, GetObject, IsOrphan, Paste, Restore, Set, SetObject, TimeStamp, UserName · *statiques :* Get, IsMine, get_type_descriptor, get_type_name
- **XCAFDoc_NoteBalloon** ← XCAFDoc_NoteComment : DynamicType, ID, NewEmpty · *statiques :* Get, GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_NoteBinData** ← XCAFDoc_Note : Data, DynamicType, ID, MIMEtype, NewEmpty, Paste, Restore, Set, Size, Title · *statiques :* Get, GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_NoteComment** ← XCAFDoc_Note : Comment, DynamicType, ID, NewEmpty, Paste, Restore, Set · *statiques :* Get, GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_NotesTool** ← TDF_Attribute : AddNote, AddNoteToAttr, AddNoteToSubshape, CreateBalloon, CreateBinData, CreateComment, DeleteAllNotes, DeleteNote, DeleteNotes, DeleteOrphanNotes, DynamicType, FindAnnotatedItem, FindAnnotatedItemAttr, FindAnnotatedItemSubshape, GetAnnotatedItems, GetAnnotatedItemsLabel, GetAttrNotes, GetNotes, GetNotesLabel, GetOrphanNotes, GetSubshapeNotes, ID, IsAnnotatedItem, NbAnnotatedItems, NbNotes, NbOrphanNotes, NewEmpty, Paste, RemoveAllAttrNotes, RemoveAllNotes, RemoveAllSubshapeNotes, RemoveAttrNote, RemoveNote, RemoveSubshapeNote, Restore · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_ShapeMapTool** ← TDF_Attribute : DynamicType, GetMap, ID, IsSubShape, NewEmpty, Paste, Restore, SetShape · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_ShapeTool** ← TDF_Attribute : AddComponent, AddShape, AddSubShape, BaseLabel, ComputeShapes, ComputeSimpleShapes, DynamicType, Expand, FindComponent, FindMainShape, FindMainShapeUsingMap, FindShape, FindSubShape, GetAllSHUOInstances, GetFreeShapes, GetNamedProperties, GetSHUOInstance, GetShapes, ID, Init, IsSubShape, IsTopLevel, NewEmpty, NewShape, Paste, RemoveComponent, RemoveSHUO, RemoveShape, Restore, Search, SearchUsingMap, SetExternRefs, SetInstanceSHUO, SetSHUO, SetShape, UpdateAssemblies · *statiques :* AutoNaming, DumpShape, FindSHUO, GetAllComponentSHUO, GetComponents, GetExternRefs, GetID, GetLocation, GetReferredShape, GetSHUO, GetSHUONextUsage, GetSHUOUpperUsage, GetShape, GetSubShapes, GetUsers, IsAssembly, IsComponent, IsCompound, IsExternRef, IsFree, IsReference, IsShape, IsSimpleShape, IsSubShape, NbComponents, Set, SetAutoNaming, get_type_descriptor, get_type_name
- **XCAFDoc_View** ← TDF_Attribute : DynamicType, GetObject, ID, NewEmpty, Paste, Restore, SetObject · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_ViewTool** ← TDF_Attribute : AddView, BaseLabel, DynamicType, GetRefAnnotationLabel, GetRefClippingPlaneLabel, GetRefGDTLabel, GetRefNoteLabel, GetRefShapeLabel, GetViewLabels, GetViewLabelsForAnnotation, GetViewLabelsForClippingPlane, GetViewLabelsForGDT, GetViewLabelsForNote, GetViewLabelsForShape, ID, IsLocked, IsView, Lock, NewEmpty, Paste, RemoveView, Restore, SetClippingPlanes, SetView, Unlock · *statiques :* GetID, Set, get_type_descriptor, get_type_name
- **XCAFDoc_Volume** ← TDF_Attribute : DynamicType, Get, ID, NewEmpty, Paste, Restore, Set · *statiques :* Get, GetID, Set, get_type_descriptor, get_type_name

## XCAFNoteObjects

- **XCAFNoteObjects_NoteObject** ← Standard_Transient (2 ctor) : DynamicType, GetPlane, GetPoint, GetPointText, GetPresentation, HasPlane, HasPoint, HasPointText, Reset, SetPlane, SetPoint, SetPointText, SetPresentation · *statiques :* get_type_descriptor, get_type_name

## XCAFPrs

- **XCAFPrs_AISObject**
- **XCAFPrs_DocumentExplorer** (3 ctor) : ChangeCurrent, Current, CurrentDepth, Init, More, Next · *statiques :* DefineChildId, FindLabelFromPathId, FindShapeFromPathId
- **XCAFPrs_DocumentIdIterator** : More, Next, Value
- **XCAFPrs_Driver**
- **XCAFPrs_Style** : DumpJson, GetColorCurv, GetColorSurf, GetColorSurfRGBA, IsEqual, IsSetColorCurv, IsSetColorSurf, IsVisible, SetColorCurv, SetColorSurf, SetVisibility, UnSetColorCurv, UnSetColorSurf · *statiques :* HashCode, IsEqual

## XCAFView

- **XCAFView_Object** ← Standard_Transient (2 ctor) : BackPlaneDistance, ClippingExpression, CreateGDTPoints, DynamicType, FrontPlaneDistance, GDTPoint, HasBackPlaneClipping, HasFrontPlaneClipping, HasGDTPoints, HasViewVolumeSidesClipping, Name, NbGDTPoints, ProjectionPoint, SetBackPlaneDistance, SetClippingExpression, SetFrontPlaneDistance, SetGDTPoint, SetName, SetProjectionPoint, SetType, SetUpDirection, SetViewDirection, SetViewVolumeSidesClipping, SetWindowHorizontalSize, SetWindowVerticalSize, SetZoomFactor, Type, UnsetBackPlaneClipping, UnsetFrontPlaneClipping, UpDirection, ViewDirection, WindowHorizontalSize, WindowVerticalSize, ZoomFactor · *statiques :* get_type_descriptor, get_type_name
- **XCAFView_ProjectionType** · *statiques :* XCAFView_ProjectionType_Central, XCAFView_ProjectionType_NoCamera, XCAFView_ProjectionType_Parallel

## XmlDrivers

- **XmlDrivers_DocumentRetrievalDriver** ← XmlLDrivers_DocumentRetrievalDriver : AttributeDrivers, DynamicType, ReadShapeSection, ShapeSetCleaning · *statiques :* get_type_descriptor, get_type_name
- **XmlDrivers_DocumentStorageDriver** ← XmlLDrivers_DocumentStorageDriver : AttributeDrivers, DynamicType, WriteShapeSection · *statiques :* get_type_descriptor, get_type_name

## XmlLDrivers

- **XmlLDrivers_DocumentRetrievalDriver** ← PCDM_RetrievalDriver : AttributeDrivers, CreateDocument, DynamicType, Read · *statiques :* get_type_descriptor, get_type_name
- **XmlLDrivers_DocumentStorageDriver** ← PCDM_StorageDriver : AttributeDrivers, DynamicType, Write · *statiques :* get_type_descriptor, get_type_name
- **XmlLDrivers_NamespaceDef** (2 ctor) : Prefix, URI

## XmlMDataStd

- **XmlMDataStd_AsciiStringDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_BooleanArrayDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_BooleanListDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_ByteArrayDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_CommentDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_DirectoryDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_ExpressionDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_ExtStringArrayDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_ExtStringListDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_IntPackedMapDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_IntegerArrayDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_IntegerDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_IntegerListDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_NameDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_NamedDataDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_NoteBookDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_RealArrayDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_RealDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_RealListDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_ReferenceArrayDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_ReferenceListDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_RelationDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_TickDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_TreeNodeDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_UAttributeDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataStd_VariableDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name

## XmlMDataXtd

- **XmlMDataXtd_AxisDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_ConstraintDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_GeometryDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_PatternStdDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_PlacementDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_PlaneDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_PointDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_PositionDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_PresentationDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_ShapeDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDataXtd_TriangulationDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name

## XmlMDF

- **XmlMDF_ADriver** ← Standard_Transient : DynamicType, NewEmpty, Paste, SourceType, TypeName, VersionNumber · *statiques :* get_type_descriptor, get_type_name
- **XmlMDF_ADriverTable** ← Standard_Transient : AddDriver, DynamicType, GetDriver, GetDrivers · *statiques :* get_type_descriptor, get_type_name
- **XmlMDF_ReferenceDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMDF_TagSourceDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name

## XmlMDocStd

- **XmlMDocStd_XLinkDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name

## XmlMFunction

- **XmlMFunction_FunctionDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMFunction_GraphNodeDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMFunction_ScopeDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name

## XmlMNaming

- **XmlMNaming_NamedShapeDriver** ← XmlMDF_ADriver : Clear, DynamicType, GetShapesLocations, NewEmpty, Paste, ReadShapeSection, WriteShapeSection · *statiques :* get_type_descriptor, get_type_name
- **XmlMNaming_NamingDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMNaming_Shape1** (2 ctor) : Element, LocId, Orientation, SetShape, SetVertex, TShapeId

## XmlMXCAFDoc

- **XmlMXCAFDoc_AreaDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_AssemblyItemRefDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_CentroidDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_ClippingPlaneToolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_ColorDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_ColorToolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_DatumDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_DimTolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_DimTolToolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_DocumentToolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_GraphNodeDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_LayerToolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_LocationDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste, SetSharedLocations, Translate · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_MaterialDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_MaterialToolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_NoteBalloonDriver** ← XmlMXCAFDoc_NoteCommentDriver : DynamicType, NewEmpty · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_NoteBinDataDriver** ← XmlMXCAFDoc_NoteDriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_NoteCommentDriver** ← XmlMXCAFDoc_NoteDriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_NoteDriver** ← XmlMDF_ADriver : DynamicType, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_NotesToolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_ShapeToolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_ViewToolDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlMXCAFDoc_VolumeDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name

## XmlObjMgt

- **XmlObjMgt_Array1** (2 ctor) : CreateArrayElement, Element, Length, Lower, SetValue, Upper, Value
- **XmlObjMgt_GP** · *statiques :* Translate
- **XmlObjMgt_Persistent** (3 ctor) : CreateElement, Element, Id, SetId
- **XmlObjMgt_RRelocationTable**
- **XmlObjMgt_SRelocationTable**

## XmlTObjDrivers

- **XmlTObjDrivers_DocumentRetrievalDriver** ← XmlLDrivers_DocumentRetrievalDriver : AttributeDrivers, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **XmlTObjDrivers_DocumentStorageDriver** ← XmlLDrivers_DocumentStorageDriver : AttributeDrivers, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **XmlTObjDrivers_IntSparseArrayDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlTObjDrivers_ModelDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlTObjDrivers_ObjectDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlTObjDrivers_ReferenceDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name
- **XmlTObjDrivers_XYZDriver** ← XmlMDF_ADriver : DynamicType, NewEmpty, Paste · *statiques :* get_type_descriptor, get_type_name

## XmlXCAFDrivers

- **XmlXCAFDrivers_DocumentRetrievalDriver** ← XmlDrivers_DocumentRetrievalDriver : AttributeDrivers, DynamicType · *statiques :* get_type_descriptor, get_type_name
- **XmlXCAFDrivers_DocumentStorageDriver** ← XmlDrivers_DocumentStorageDriver : AttributeDrivers, DynamicType · *statiques :* get_type_descriptor, get_type_name

## XSAlgo

- **XSAlgo_AlgoContainer** ← Standard_Transient : CheckPCurve, DynamicType, MergeTransferInfo, PrepareForTransfer, ProcessShape, SetToolContainer, ToolContainer · *statiques :* get_type_descriptor, get_type_name
- **XSAlgo_Caller** · *statiques :* XSAlgo_DEFAULT, XSAlgo_IGES, XSAlgo_STEP
- **XSAlgo_ToolContainer** ← Standard_Transient : DynamicType · *statiques :* get_type_descriptor, get_type_name

## XSControl

- **XSControl_ConnectedShapes** ← IFSelect_SelectExplore (2 ctor) : DynamicType, Explore, ExploreLabel, SetReader · *statiques :* AdjacentEntities, get_type_descriptor, get_type_name
- **XSControl_Controller** ← Standard_Transient : ActorRead, ActorWrite, AdaptorSession, AddSessionItem, AutoRecord, Customise, DynamicType, IsModeWrite, ModeWriteBounds, ModeWriteHelp, Name, NewModel, Protocol, RecognizeWriteShape, RecognizeWriteTransient, Record, SessionItem, SetModeWrite, SetModeWriteHelp, SetNames, TransferWriteShape, TransferWriteTransient, WorkLibrary · *statiques :* Recorded, get_type_descriptor, get_type_name
- **XSControl_FuncShape** · *statiques :* FileAndVar, Init, MoreShapes
- **XSControl_Functions** · *statiques :* Init
- **XSControl_Reader** (3 ctor) : ClearShapes, GetStatsTransfer, GiveList, Model, NbRootsForTransfer, NbShapes, OneShape, PrintCheckLoad, PrintCheckTransfer, PrintStatsTransfer, ReadFile, RootForTransfer, SetNorm, SetWS, Shape, TransferEntity, TransferList, TransferOne, TransferOneRoot, TransferRoots, WS
- **XSControl_SelectForTransfer** ← IFSelect_SelectExtract (2 ctor) : Actor, DynamicType, ExtractLabel, Reader, SetActor, SetReader, Sort · *statiques :* get_type_descriptor, get_type_name
- **XSControl_SignTransferStatus** ← IFSelect_Signature (2 ctor) : DynamicType, Map, Reader, SetMap, SetReader, Value · *statiques :* get_type_descriptor, get_type_name
- **XSControl_TransferReader** ← Standard_Transient : Actor, BeginTransfer, CheckList, CheckedList, Clear, ClearResult, Context, DynamicType, EntitiesFromShapeList, EntityFromResult, EntityFromShapeResult, FileName, FinalEntityLabel, FinalEntityNumber, FinalResult, GetContext, HasChecks, HasResult, IsMarked, IsRecorded, IsSkipped, LastCheckList, LastTransferList, Model, PrintStats, Recognize, RecordResult, RecordedList, ResultFromNumber, SetActor, SetContext, SetController, SetFileName, SetGraph, SetModel, SetTransientProcess, ShapeResult, ShapeResultList, Skip, TransferClear, TransferList, TransferOne, TransferRoots, TransientProcess, TransientResult · *statiques :* PrintStatsOnList, PrintStatsProcess, get_type_descriptor, get_type_name
- **XSControl_TransferWriter** ← Standard_Transient : CheckList, Clear, Controller, DynamicType, FinderProcess, PrintStats, RecognizeShape, RecognizeTransient, ResultCheckList, SetController, SetFinderProcess, SetTransferMode, TransferMode, TransferWriteShape, TransferWriteTransient · *statiques :* get_type_descriptor, get_type_name
- **XSControl_Utils** : AppendCStr, AppendEStr, AppendShape, AppendTra, ArrToSeq, AsciiToExtended, BinderShape, CStrValue, CompoundFromSeq, DateString, DateValues, EStrValue, ExtendedToAscii, IsAscii, IsKind, NewSeqCStr, NewSeqEStr, NewSeqShape, NewSeqTra, SeqIntValue, SeqLength, SeqToArr, ShapeBinder, ShapeType, ShapeValue, SortedCompound, ToAString, ToCString, ToEString, ToHString, ToXString, TraValue, TraceLine, TraceLines, TypeName
- **XSControl_Vars** ← Standard_Transient : DynamicType, Get, GetCurve, GetCurve2d, GetGeom, GetPoint, GetPoint2d, GetShape, GetSurface, Set, SetPoint, SetPoint2d, SetShape · *statiques :* get_type_descriptor, get_type_name
- **XSControl_WorkSession** ← IFSelect_WorkSession : ClearContext, ClearData, Context, DynamicType, InitTransferReader, MapReader, NewModel, NormAdaptor, PrintTransferStatus, Result, SelectNorm, SelectedNorm, SetAllContext, SetController, SetMapReader, SetMapWriter, SetTransferReader, SetVars, TransferReadOne, TransferReadRoots, TransferReader, TransferWriteCheckList, TransferWriteShape, TransferWriter, Vars · *statiques :* get_type_descriptor, get_type_name
- **XSControl_Writer** (3 ctor) : Model, PrintStatsTransfer, SetNorm, SetWS, TransferShape, WS, WriteFile

## Handle

AIS_AngleDimension, AIS_Animation, AIS_AnimationCamera, AIS_AnimationObject, AIS_AttributeFilter, AIS_Axis, AIS_BadEdgeFilter, AIS_C0RegularityFilter, AIS_Chamf2dDimension, AIS_Chamf3dDimension, AIS_Circle, AIS_ColorScale, AIS_ColoredDrawer, AIS_ColoredShape, AIS_ConcentricRelation, AIS_ConnectedInteractive, AIS_DiameterDimension, AIS_Dimension, AIS_DimensionOwner, AIS_EllipseRadiusDimension, AIS_EqualDistanceRelation, AIS_EqualRadiusRelation, AIS_ExclusionFilter, AIS_FixRelation, AIS_GlobalStatus, AIS_IdenticRelation, AIS_InteractiveContext, AIS_InteractiveObject, AIS_LengthDimension, AIS_Line, AIS_Manipulator, AIS_ManipulatorObjectSequence, AIS_ManipulatorOwner, AIS_MaxRadiusDimension, AIS_MidPointRelation, AIS_MinRadiusDimension, AIS_MultipleConnectedInteractive, AIS_OffsetDimension, AIS_ParallelRelation, AIS_PerpendicularRelation, AIS_Plane, AIS_PlaneTrihedron, AIS_Point, AIS_PointCloud, AIS_RadiusDimension, AIS_Relation, AIS_RubberBand, AIS_Selection, AIS_Shape, AIS_SignatureFilter, AIS_SymmetricRelation, AIS_TangentRelation, AIS_TextLabel, AIS_TexturedShape, AIS_Triangulation, AIS_Trihedron, AIS_TrihedronOwner, AIS_TypeFilter, APIHeaderSection_EditHeader, Adaptor2d_HCurve2d, Adaptor2d_HLine2d, Adaptor2d_HOffsetCurve, Adaptor3d_HCurve, Adaptor3d_HCurveOnSurface, Adaptor3d_HIsoCurve, Adaptor3d_HSurface, Adaptor3d_HVertex, Adaptor3d_TopolTool, AppDef_HArray1OfMultiPointConstraint, AppDef_LinearCriteria, AppDef_SmoothCriterion, AppParCurves_HArray1OfConstraintCouple, AppParCurves_HArray1OfMultiBSpCurve, AppParCurves_HArray1OfMultiCurve, AppParCurves_HArray1OfMultiPoint, AppStdL_Application, AppStd_Application, Approx_CurvlinFunc, Approx_HArray1OfAdHSurface, Approx_HArray1OfGTrsf2d, Approx_SweepFunction, Aspect_AspectFillAreaDefinitionError, Aspect_AspectLineDefinitionError, Aspect_AspectMarkerDefinitionError, Aspect_CircularGrid, Aspect_DisplayConnection, Aspect_DisplayConnectionDefinitionError, Aspect_GraphicDeviceDefinitionError, Aspect_Grid, Aspect_IdentDefinitionError, Aspect_NeutralWindow, Aspect_RectangularGrid, Aspect_Window, Aspect_WindowDefinitionError, Aspect_WindowError, BOPDS_CommonBlock, BOPDS_PaveBlock, BOPTest_DrawableShape, BRepAdaptor_HArray1OfCurve, BRepAdaptor_HCompCurve, BRepAdaptor_HCurve, BRepAdaptor_HCurve2d, BRepAdaptor_HSurface, BRepAlgo_AsDes, BRepApprox_ApproxLine, BRepBlend_AppFunc, BRepBlend_AppFuncRoot, BRepBlend_AppFuncRst, BRepBlend_AppFuncRstRst, BRepBlend_Line, BRepBuilderAPI_FastSewing, BRepBuilderAPI_Sewing, BRepCheck_Edge, BRepCheck_Face, BRepCheck_Result, BRepCheck_Shell, BRepCheck_Solid, BRepCheck_Vertex, BRepCheck_Wire, BRepExtrema_TriangleSet, BRepExtrema_UnCompatibleShape, BRepFill_ACRLaw, BRepFill_CurveConstraint, BRepFill_DraftLaw, BRepFill_Edge3DLaw, BRepFill_EdgeOnSurfLaw, BRepFill_LocationLaw, BRepFill_NSections, BRepFill_PipeShell, BRepFill_SectionLaw, BRepFill_ShapeLaw, BRepMesh_DiscretRoot, BRepOffset_SimpleOffset, BRepTest_DrawableHistory, BRepTools_GTrsfModification, BRepTools_History, BRepTools_Modification, BRepTools_NurbsConvertModification, BRepTools_ReShape, BRepTools_TrsfModification, BRepTopAdaptor_HVertex, BRepTopAdaptor_TopolTool, BRep_Curve3D, BRep_CurveOn2Surfaces, BRep_CurveOnClosedSurface, BRep_CurveOnSurface, BRep_CurveRepresentation, BRep_GCurve, BRep_PointOnCurve, BRep_PointOnCurveOnSurface, BRep_PointOnSurface, BRep_PointRepresentation, BRep_PointsOnSurface, BRep_Polygon3D, BRep_PolygonOnClosedSurface, BRep_PolygonOnClosedTriangulation, BRep_PolygonOnSurface, BRep_PolygonOnTriangulation, BRep_TEdge, BRep_TFace, BRep_TVertex, BSplCLib_Cache, BSplSLib_Cache, BVH_BuildThread, BiTgte_HCurveOnEdge, BiTgte_HCurveOnVertex, BinDrivers_DocumentRetrievalDriver, BinDrivers_DocumentStorageDriver, BinLDrivers_DocumentRetrievalDriver, BinLDrivers_DocumentStorageDriver, BinMDF_ADriver, BinMDF_ADriverTable, BinMDF_ReferenceDriver, BinMDF_TagSourceDriver, BinMDataStd_AsciiStringDriver, BinMDataStd_BooleanArrayDriver, BinMDataStd_BooleanListDriver, BinMDataStd_ByteArrayDriver, BinMDataStd_CommentDriver, BinMDataStd_DirectoryDriver, BinMDataStd_ExpressionDriver, BinMDataStd_ExtStringArrayDriver, BinMDataStd_ExtStringListDriver, BinMDataStd_IntPackedMapDriver, BinMDataStd_IntegerArrayDriver, BinMDataStd_IntegerDriver, BinMDataStd_IntegerListDriver, BinMDataStd_NameDriver, BinMDataStd_NamedDataDriver, BinMDataStd_NoteBookDriver, BinMDataStd_RealArrayDriver, BinMDataStd_RealDriver, BinMDataStd_RealListDriver, BinMDataStd_ReferenceArrayDriver, BinMDataStd_ReferenceListDriver, BinMDataStd_RelationDriver, BinMDataStd_TickDriver, BinMDataStd_TreeNodeDriver, BinMDataStd_UAttributeDriver, BinMDataStd_VariableDriver, BinMDataXtd_AxisDriver, BinMDataXtd_ConstraintDriver, BinMDataXtd_GeometryDriver, BinMDataXtd_PatternStdDriver, BinMDataXtd_PlacementDriver, BinMDataXtd_PlaneDriver, BinMDataXtd_PointDriver, BinMDataXtd_PositionDriver, BinMDataXtd_PresentationDriver, BinMDataXtd_ShapeDriver, BinMDataXtd_TriangulationDriver, BinMDocStd_XLinkDriver, BinMFunction_FunctionDriver, BinMFunction_GraphNodeDriver, BinMFunction_ScopeDriver, BinMNaming_NamedShapeDriver, BinMNaming_NamingDriver, BinMXCAFDoc_AreaDriver, BinMXCAFDoc_AssemblyItemRefDriver, BinMXCAFDoc_CentroidDriver, BinMXCAFDoc_ClippingPlaneToolDriver, BinMXCAFDoc_ColorDriver, BinMXCAFDoc_ColorToolDriver, BinMXCAFDoc_DatumDriver, BinMXCAFDoc_DimTolDriver, BinMXCAFDoc_DimTolToolDriver, BinMXCAFDoc_DimensionDriver, BinMXCAFDoc_DocumentToolDriver, BinMXCAFDoc_GeomToleranceDriver, BinMXCAFDoc_GraphNodeDriver, BinMXCAFDoc_LayerToolDriver, BinMXCAFDoc_LocationDriver, BinMXCAFDoc_MaterialDriver, BinMXCAFDoc_MaterialToolDriver, BinMXCAFDoc_NoteBalloonDriver, BinMXCAFDoc_NoteBinDataDriver, BinMXCAFDoc_NoteCommentDriver, BinMXCAFDoc_NoteDriver, BinMXCAFDoc_NotesToolDriver, BinMXCAFDoc_ShapeToolDriver, BinMXCAFDoc_ViewDriver, BinMXCAFDoc_ViewToolDriver, BinMXCAFDoc_VolumeDriver, BinTObjDrivers_DocumentRetrievalDriver, BinTObjDrivers_DocumentStorageDriver, BinTObjDrivers_IntSparseArrayDriver, BinTObjDrivers_ModelDriver, BinTObjDrivers_ObjectDriver, BinTObjDrivers_ReferenceDriver, BinTObjDrivers_XYZDriver, BinXCAFDrivers_DocumentRetrievalDriver, BinXCAFDrivers_DocumentStorageDriver, Bisector_BisecAna, Bisector_BisecCC, Bisector_BisecPC, Bisector_Curve, Bnd_HArray1OfBox, Bnd_HArray1OfBox2d, Bnd_HArray1OfSphere, CDF_Application, CDF_Directory, CDF_FWOSDriver, CDF_MetaDataDriver, CDF_MetaDataDriverError, CDF_MetaDataDriverFactory, CDF_Session, CDF_StoreList, CDM_Application, CDM_Document, CDM_MetaData, CDM_Reference, ChFiDS_ChamfSpine, ChFiDS_FilSpine, ChFiDS_HData, ChFiDS_HElSpine, ChFiDS_SecHArray1, ChFiDS_Spine, ChFiDS_Stripe, ChFiDS_SurfData, Cocoa_Window, Contap_TheHSequenceOfPoint, Contap_TheIWLineOfTheIWalking, D3DHost_FrameBuffer, D3DHost_GraphicDriver, DBRep_DrawableShape, DBRep_Edge, DBRep_Face, DDF_Browser, DDF_Data, DDF_Transaction, DDataStd_DrawDriver, DDataStd_DrawPresentation, DDataStd_TreeBrowser, DDocStd_DrawDocument, DNaming_BooleanOperationDriver, DNaming_BoxDriver, DNaming_CylinderDriver, DNaming_FilletDriver, DNaming_Line3DDriver, DNaming_PointDriver, DNaming_PrismDriver, DNaming_RevolutionDriver, DNaming_SelectionDriver, DNaming_SphereDriver, DNaming_TransformationDriver, Draft_Modification, DrawDim_Angle, DrawDim_Dimension, DrawDim_Distance, DrawDim_PlanarAngle, DrawDim_PlanarDiameter, DrawDim_PlanarDimension, DrawDim_PlanarDistance, DrawDim_PlanarRadius, DrawDim_Radius, DrawFairCurve_Batten, DrawFairCurve_MinimalVariation, DrawTrSurf_BSplineCurve, DrawTrSurf_BSplineCurve2d, DrawTrSurf_BSplineSurface, DrawTrSurf_BezierCurve, DrawTrSurf_BezierCurve2d, DrawTrSurf_BezierSurface, DrawTrSurf_Curve, DrawTrSurf_Curve2d, DrawTrSurf_Drawable, DrawTrSurf_Point, DrawTrSurf_Polygon2D, DrawTrSurf_Polygon3D, DrawTrSurf_Surface, DrawTrSurf_Triangulation, DrawTrSurf_Triangulation2D, Draw_Axis2D, Draw_Axis3D, Draw_Box, Draw_Chronometer, Draw_Circle2D, Draw_Circle3D, Draw_Drawable2D, Draw_Drawable3D, Draw_Failure, Draw_Grid, Draw_Marker2D, Draw_Marker3D, Draw_Number, Draw_Printer, Draw_ProgressIndicator, Draw_Segment2D, Draw_Segment3D, Draw_Text2D, Draw_Text3D, ExprIntrp_GenExp, ExprIntrp_GenFct, ExprIntrp_GenRel, ExprIntrp_Generator, ExprIntrp_SyntaxError, Expr_Absolute, Expr_ArcCosine, Expr_ArcSine, Expr_ArcTangent, Expr_ArgCosh, Expr_ArgSinh, Expr_ArgTanh, Expr_BinaryExpression, Expr_BinaryFunction, Expr_Cosh, Expr_Cosine, Expr_Difference, Expr_Different, Expr_Division, Expr_Equal, Expr_Exponential, Expr_Exponentiate, Expr_ExprFailure, Expr_FunctionDerivative, Expr_GeneralExpression, Expr_GeneralFunction, Expr_GeneralRelation, Expr_GreaterThan, Expr_GreaterThanOrEqual, Expr_InvalidAssignment, Expr_InvalidFunction, Expr_InvalidOperand, Expr_LessThan, Expr_LessThanOrEqual, Expr_LogOf10, Expr_LogOfe, Expr_NamedConstant, Expr_NamedExpression, Expr_NamedFunction, Expr_NamedUnknown, Expr_NotAssigned, Expr_NotEvaluable, Expr_NumericValue, Expr_PolyExpression, Expr_PolyFunction, Expr_Product, Expr_Sign, Expr_Sine, Expr_SingleRelation, Expr_Sinh, Expr_Square, Expr_SquareRoot, Expr_Sum, Expr_SystemRelation, Expr_Tangent, Expr_Tanh, Expr_UnaryExpression, Expr_UnaryFunction, Expr_UnaryMinus, Extrema_ExtPExtS, Extrema_ExtPRevS, Extrema_HArray1OfPOnCurv, Extrema_HArray1OfPOnCurv2d, Extrema_HArray1OfPOnSurf, Extrema_HArray2OfPOnCurv, Extrema_HArray2OfPOnCurv2d, Extrema_HArray2OfPOnSurf, Extrema_HArray2OfPOnSurfParams, FEmTool_Curve, FEmTool_ElementaryCriterion, FEmTool_HAssemblyTable, FEmTool_LinearFlexion, FEmTool_LinearJerk, FEmTool_LinearTension, FEmTool_ProfileMatrix, FEmTool_SparseMatrix, Font_FTFont, Font_FTLibrary, Font_FontMgr, Font_SystemFont, GProp_UndefinedAxis, GccAna_NoSolution, GccEnt_BadQualifier, GccInt_BCirc, GccInt_BElips, GccInt_BHyper, GccInt_BLine, GccInt_BParab, GccInt_BPoint, GccInt_Bisec, Geom2dAdaptor_GHCurve, Geom2dAdaptor_HCurve, Geom2dEvaluator_Curve, Geom2dEvaluator_OffsetCurve, Geom2dGcc_IsParallel, Geom2d_AxisPlacement, Geom2d_BSplineCurve, Geom2d_BezierCurve, Geom2d_BoundedCurve, Geom2d_CartesianPoint, Geom2d_Circle, Geom2d_Conic, Geom2d_Curve, Geom2d_Direction, Geom2d_Ellipse, Geom2d_Geometry, Geom2d_Hyperbola, Geom2d_Line, Geom2d_OffsetCurve, Geom2d_Parabola, Geom2d_Point, Geom2d_Transformation, Geom2d_TrimmedCurve, Geom2d_UndefinedDerivative, Geom2d_UndefinedValue, Geom2d_Vector, Geom2d_VectorWithMagnitude, GeomAdaptor_GHCurve, GeomAdaptor_GHSurface, GeomAdaptor_HCurve, GeomAdaptor_HSurface, GeomAdaptor_HSurfaceOfLinearExtrusion, GeomAdaptor_HSurfaceOfRevolution, GeomEvaluator_Curve, GeomEvaluator_OffsetCurve, GeomEvaluator_OffsetSurface, GeomEvaluator_Surface, GeomEvaluator_SurfaceOfExtrusion, GeomEvaluator_SurfaceOfRevolution, GeomFill_BoundWithSurf, GeomFill_Boundary, GeomFill_CircularBlendFunc, GeomFill_ConstantBiNormal, GeomFill_CoonsAlgPatch, GeomFill_CorrectedFrenet, GeomFill_CurveAndTrihedron, GeomFill_Darboux, GeomFill_DegeneratedBound, GeomFill_DiscreteTrihedron, GeomFill_DraftTrihedron, GeomFill_EvolvedSection, GeomFill_Fixed, GeomFill_Frenet, GeomFill_GuideTrihedronAC, GeomFill_GuideTrihedronPlan, GeomFill_HArray1OfLocationLaw, GeomFill_HArray1OfSectionLaw, GeomFill_HSequenceOfAx2, GeomFill_Line, GeomFill_LocationDraft, GeomFill_LocationGuide, GeomFill_LocationLaw, GeomFill_NSections, GeomFill_SectionLaw, GeomFill_SimpleBound, GeomFill_SweepFunction, GeomFill_TgtField, GeomFill_TgtOnCoons, GeomFill_TrihedronLaw, GeomFill_TrihedronWithGuide, GeomFill_UniformSection, GeomPlate_CurveConstraint, GeomPlate_HArray1OfHCurve, GeomPlate_HArray1OfSequenceOfReal, GeomPlate_HSequenceOfCurveConstraint, GeomPlate_HSequenceOfPointConstraint, GeomPlate_PointConstraint, GeomPlate_Surface, GeomTools_UndefinedTypeHandler, Geom_Axis1Placement, Geom_Axis2Placement, Geom_AxisPlacement, Geom_BSplineCurve, Geom_BSplineSurface, Geom_BezierCurve, Geom_BezierSurface, Geom_BoundedCurve, Geom_BoundedSurface, Geom_CartesianPoint, Geom_Circle, Geom_Conic, Geom_ConicalSurface, Geom_Curve, Geom_CylindricalSurface, Geom_Direction, Geom_ElementarySurface, Geom_Ellipse, Geom_Geometry, Geom_HSequenceOfBSplineSurface, Geom_Hyperbola, Geom_Line, Geom_OffsetCurve, Geom_OffsetSurface, Geom_OsculatingSurface, Geom_Parabola, Geom_Plane, Geom_Point, Geom_RectangularTrimmedSurface, Geom_SphericalSurface, Geom_Surface, Geom_SurfaceOfLinearExtrusion, Geom_SurfaceOfRevolution, Geom_SweptSurface, Geom_ToroidalSurface, Geom_Transformation, Geom_TrimmedCurve, Geom_UndefinedDerivative, Geom_UndefinedValue, Geom_Vector, Geom_VectorWithMagnitude, GeometryTest_DrawableQualifiedCurve2d, Graphic3d_ArrayOfPoints, Graphic3d_ArrayOfPolygons, Graphic3d_ArrayOfPolylines, Graphic3d_ArrayOfPrimitives, Graphic3d_ArrayOfQuadrangleStrips, Graphic3d_ArrayOfQuadrangles, Graphic3d_ArrayOfSegments, Graphic3d_ArrayOfTriangleFans, Graphic3d_ArrayOfTriangleStrips, Graphic3d_ArrayOfTriangles, Graphic3d_AspectFillArea3d, Graphic3d_AspectLine3d, Graphic3d_AspectMarker3d, Graphic3d_AspectText3d, Graphic3d_Aspects, Graphic3d_BoundBuffer, Graphic3d_Buffer, Graphic3d_CLight, Graphic3d_CStructure, Graphic3d_CView, Graphic3d_Camera, Graphic3d_ClipPlane, Graphic3d_CubeMap, Graphic3d_CubeMapPacked, Graphic3d_CubeMapSeparate, Graphic3d_DataStructureManager, Graphic3d_GraphicDriver, Graphic3d_Group, Graphic3d_GroupDefinitionError, Graphic3d_HatchStyle, Graphic3d_IndexBuffer, Graphic3d_LightSet, Graphic3d_MarkerImage, Graphic3d_MaterialDefinitionError, Graphic3d_PresentationAttributes, Graphic3d_PriorityDefinitionError, Graphic3d_SequenceOfHClipPlane, Graphic3d_ShaderAttribute, Graphic3d_ShaderObject, Graphic3d_ShaderProgram, Graphic3d_ShaderVariable, Graphic3d_Structure, Graphic3d_StructureDefinitionError, Graphic3d_StructureManager, Graphic3d_Text, Graphic3d_Texture1D, Graphic3d_Texture1Dmanual, Graphic3d_Texture1Dsegment, Graphic3d_Texture2D, Graphic3d_Texture2Dmanual, Graphic3d_Texture2Dplane, Graphic3d_TextureEnv, Graphic3d_TextureMap, Graphic3d_TextureParams, Graphic3d_TextureRoot, Graphic3d_TransformError, Graphic3d_TransformPers, Graphic3d_ViewAffinity, HLRAlgo_EdgesBlock, HLRAlgo_HArray1OfPHDat, HLRAlgo_HArray1OfPINod, HLRAlgo_HArray1OfPISeg, HLRAlgo_HArray1OfTData, HLRAlgo_PolyAlgo, HLRAlgo_PolyData, HLRAlgo_PolyInternalData, HLRAlgo_PolyInternalNode, HLRAlgo_PolyShellData, HLRAlgo_WiresBlock, HLRBRep_Algo, HLRBRep_AreaLimit, HLRBRep_Data, HLRBRep_InternalAlgo, HLRBRep_PolyAlgo, HLRTest_DrawableEdgeTool, HLRTest_DrawablePolyEdgeTool, HLRTest_OutLiner, HLRTest_Projector, HLRTest_ShapeData, HLRTopoBRep_OutLiner, HeaderSection_FileDescription, HeaderSection_FileName, HeaderSection_FileSchema, HeaderSection_Protocol, IFSelect_Act, IFSelect_Activator, IFSelect_AppliedModifiers, IFSelect_BasicDumper, IFSelect_CheckCounter, IFSelect_DispGlobal, IFSelect_DispPerCount, IFSelect_DispPerFiles, IFSelect_DispPerOne, IFSelect_DispPerSignature, IFSelect_Dispatch, IFSelect_EditForm, IFSelect_Editor, IFSelect_GeneralModifier, IFSelect_GraphCounter, IFSelect_HSeqOfSelection, IFSelect_IntParam, IFSelect_ListEditor, IFSelect_ModelCopier, IFSelect_ModifEditForm, IFSelect_ModifReorder, IFSelect_Modifier, IFSelect_PacketList, IFSelect_ParamEditor, IFSelect_SelectAnyList, IFSelect_SelectAnyType, IFSelect_SelectBase, IFSelect_SelectCombine, IFSelect_SelectControl, IFSelect_SelectDeduct, IFSelect_SelectDiff, IFSelect_SelectEntityNumber, IFSelect_SelectErrorEntities, IFSelect_SelectExplore, IFSelect_SelectExtract, IFSelect_SelectFlag, IFSelect_SelectInList, IFSelect_SelectIncorrectEntities, IFSelect_SelectIntersection, IFSelect_SelectModelEntities, IFSelect_SelectModelRoots, IFSelect_SelectPointed, IFSelect_SelectRange, IFSelect_SelectRootComps, IFSelect_SelectRoots, IFSelect_SelectSent, IFSelect_SelectShared, IFSelect_SelectSharing, IFSelect_SelectSignature, IFSelect_SelectSignedShared, IFSelect_SelectSignedSharing, IFSelect_SelectSuite, IFSelect_SelectType, IFSelect_SelectUnion, IFSelect_SelectUnknownEntities, IFSelect_Selection, IFSelect_SessionDumper, IFSelect_SessionPilot, IFSelect_ShareOut, IFSelect_SignAncestor, IFSelect_SignCategory, IFSelect_SignCounter, IFSelect_SignMultiple, IFSelect_SignType, IFSelect_SignValidity, IFSelect_Signature, IFSelect_SignatureList, IFSelect_TransformStandard, IFSelect_Transformer, IFSelect_WorkLibrary, IFSelect_WorkSession, IGESAppli_DrilledHole, IGESAppli_ElementResults, IGESAppli_FiniteElement, IGESAppli_Flow, IGESAppli_FlowLineSpec, IGESAppli_GeneralModule, IGESAppli_HArray1OfFiniteElement, IGESAppli_HArray1OfFlow, IGESAppli_HArray1OfNode, IGESAppli_LevelFunction, IGESAppli_LevelToPWBLayerMap, IGESAppli_LineWidening, IGESAppli_NodalConstraint, IGESAppli_NodalDisplAndRot, IGESAppli_NodalResults, IGESAppli_Node, IGESAppli_PWBArtworkStackup, IGESAppli_PWBDrilledHole, IGESAppli_PartNumber, IGESAppli_PinNumber, IGESAppli_PipingFlow, IGESAppli_Protocol, IGESAppli_ReadWriteModule, IGESAppli_ReferenceDesignator, IGESAppli_RegionRestriction, IGESAppli_SpecificModule, IGESBasic_AssocGroupType, IGESBasic_ExternalRefFile, IGESBasic_ExternalRefFileIndex, IGESBasic_ExternalRefFileName, IGESBasic_ExternalRefLibName, IGESBasic_ExternalRefName, IGESBasic_ExternalReferenceFile, IGESBasic_GeneralModule, IGESBasic_Group, IGESBasic_GroupWithoutBackP, IGESBasic_HArray1OfHArray1OfIGESEntity, IGESBasic_HArray1OfHArray1OfInteger, IGESBasic_HArray1OfHArray1OfReal, IGESBasic_HArray1OfHArray1OfXY, IGESBasic_HArray1OfHArray1OfXYZ, IGESBasic_HArray1OfLineFontEntity, IGESBasic_HArray2OfHArray1OfReal, IGESBasic_Hierarchy, IGESBasic_Name, IGESBasic_OrderedGroup, IGESBasic_OrderedGroupWithoutBackP, IGESBasic_Protocol, IGESBasic_ReadWriteModule, IGESBasic_SingleParent, IGESBasic_SingularSubfigure, IGESBasic_SpecificModule, IGESBasic_SubfigureDef, IGESControl_ActorWrite, IGESControl_AlgoContainer, IGESControl_Controller, IGESControl_IGESBoundary, IGESControl_ToolContainer, IGESData_ColorEntity, IGESData_DefaultGeneral, IGESData_DefaultSpecific, IGESData_FileProtocol, IGESData_FileRecognizer, IGESData_FreeFormatEntity, IGESData_GeneralModule, IGESData_GlobalNodeOfSpecificLib, IGESData_GlobalNodeOfWriterLib, IGESData_HArray1OfIGESEntity, IGESData_IGESEntity, IGESData_IGESModel, IGESData_IGESReaderData, IGESData_LabelDisplayEntity, IGESData_LevelListEntity, IGESData_LineFontEntity, IGESData_NameEntity, IGESData_NodeOfSpecificLib, IGESData_NodeOfWriterLib, IGESData_Protocol, IGESData_ReadWriteModule, IGESData_SingleParentEntity, IGESData_SpecificModule, IGESData_ToolLocation, IGESData_TransfEntity, IGESData_UndefinedEntity, IGESData_ViewKindEntity, IGESDefs_AssociativityDef, IGESDefs_AttributeDef, IGESDefs_AttributeTable, IGESDefs_GeneralModule, IGESDefs_GenericData, IGESDefs_HArray1OfHArray1OfTextDisplayTemplate, IGESDefs_HArray1OfTabularData, IGESDefs_MacroDef, IGESDefs_Protocol, IGESDefs_ReadWriteModule, IGESDefs_SpecificModule, IGESDefs_TabularData, IGESDefs_UnitsData, IGESDimen_AngularDimension, IGESDimen_BasicDimension, IGESDimen_CenterLine, IGESDimen_CurveDimension, IGESDimen_DiameterDimension, IGESDimen_DimensionDisplayData, IGESDimen_DimensionTolerance, IGESDimen_DimensionUnits, IGESDimen_DimensionedGeometry, IGESDimen_FlagNote, IGESDimen_GeneralLabel, IGESDimen_GeneralModule, IGESDimen_GeneralNote, IGESDimen_GeneralSymbol, IGESDimen_HArray1OfGeneralNote, IGESDimen_HArray1OfLeaderArrow, IGESDimen_LeaderArrow, IGESDimen_LinearDimension, IGESDimen_NewDimensionedGeometry, IGESDimen_NewGeneralNote, IGESDimen_OrdinateDimension, IGESDimen_PointDimension, IGESDimen_Protocol, IGESDimen_RadiusDimension, IGESDimen_ReadWriteModule, IGESDimen_Section, IGESDimen_SectionedArea, IGESDimen_SpecificModule, IGESDimen_WitnessLine, IGESDraw_CircArraySubfigure, IGESDraw_ConnectPoint, IGESDraw_Drawing, IGESDraw_DrawingWithRotation, IGESDraw_GeneralModule, IGESDraw_HArray1OfConnectPoint, IGESDraw_HArray1OfViewKindEntity, IGESDraw_LabelDisplay, IGESDraw_NetworkSubfigure, IGESDraw_NetworkSubfigureDef, IGESDraw_PerspectiveView, IGESDraw_Planar, IGESDraw_Protocol, IGESDraw_ReadWriteModule, IGESDraw_RectArraySubfigure, IGESDraw_SegmentedViewsVisible, IGESDraw_SpecificModule, IGESDraw_View, IGESDraw_ViewsVisible, IGESDraw_ViewsVisibleWithAttr, IGESGeom_BSplineCurve, IGESGeom_BSplineSurface, IGESGeom_Boundary, IGESGeom_BoundedSurface, IGESGeom_CircularArc, IGESGeom_CompositeCurve, IGESGeom_ConicArc, IGESGeom_CopiousData, IGESGeom_CurveOnSurface, IGESGeom_Direction, IGESGeom_Flash, IGESGeom_GeneralModule, IGESGeom_HArray1OfBoundary, IGESGeom_HArray1OfCurveOnSurface, IGESGeom_HArray1OfTransformationMatrix, IGESGeom_Line, IGESGeom_OffsetCurve, IGESGeom_OffsetSurface, IGESGeom_Plane, IGESGeom_Point, IGESGeom_Protocol, IGESGeom_ReadWriteModule, IGESGeom_RuledSurface, IGESGeom_SpecificModule, IGESGeom_SplineCurve, IGESGeom_SplineSurface, IGESGeom_SurfaceOfRevolution, IGESGeom_TabulatedCylinder, IGESGeom_TransformationMatrix, IGESGeom_TrimmedSurface, IGESGraph_Color, IGESGraph_DefinitionLevel, IGESGraph_DrawingSize, IGESGraph_DrawingUnits, IGESGraph_GeneralModule, IGESGraph_HArray1OfColor, IGESGraph_HArray1OfTextDisplayTemplate, IGESGraph_HArray1OfTextFontDef, IGESGraph_HighLight, IGESGraph_IntercharacterSpacing, IGESGraph_LineFontDefPattern, IGESGraph_LineFontDefTemplate, IGESGraph_LineFontPredefined, IGESGraph_NominalSize, IGESGraph_Pick, IGESGraph_Protocol, IGESGraph_ReadWriteModule, IGESGraph_SpecificModule, IGESGraph_TextDisplayTemplate, IGESGraph_TextFontDef, IGESGraph_UniformRectGrid, IGESSelect_Activator, IGESSelect_AddFileComment, IGESSelect_AddGroup, IGESSelect_AutoCorrect, IGESSelect_ChangeLevelList, IGESSelect_ChangeLevelNumber, IGESSelect_ComputeStatus, IGESSelect_CounterOfLevelNumber, IGESSelect_DispPerDrawing, IGESSelect_DispPerSingleView, IGESSelect_Dumper, IGESSelect_EditDirPart, IGESSelect_EditHeader, IGESSelect_FileModifier, IGESSelect_FloatFormat, IGESSelect_IGESName, IGESSelect_IGESTypeForm, IGESSelect_ModelModifier, IGESSelect_RebuildDrawings, IGESSelect_RebuildGroups, IGESSelect_RemoveCurves, IGESSelect_SelectBasicGeom, IGESSelect_SelectBypassGroup, IGESSelect_SelectBypassSubfigure, IGESSelect_SelectDrawingFrom, IGESSelect_SelectFaces, IGESSelect_SelectFromDrawing, IGESSelect_SelectFromSingleView, IGESSelect_SelectLevelNumber, IGESSelect_SelectName, IGESSelect_SelectPCurves, IGESSelect_SelectSingleViewFrom, IGESSelect_SelectSubordinate, IGESSelect_SelectVisibleStatus, IGESSelect_SetGlobalParameter, IGESSelect_SetLabel, IGESSelect_SetVersion5, IGESSelect_SignColor, IGESSelect_SignLevelNumber, IGESSelect_SignStatus, IGESSelect_SplineToBSpline, IGESSelect_UpdateCreationDate, IGESSelect_UpdateFileName, IGESSelect_UpdateLastChange, IGESSelect_ViewSorter, IGESSelect_WorkLibrary, IGESSolid_Block, IGESSolid_BooleanTree, IGESSolid_ConeFrustum, IGESSolid_ConicalSurface, IGESSolid_Cylinder, IGESSolid_CylindricalSurface, IGESSolid_EdgeList, IGESSolid_Ellipsoid, IGESSolid_Face, IGESSolid_GeneralModule, IGESSolid_HArray1OfFace, IGESSolid_HArray1OfLoop, IGESSolid_HArray1OfShell, IGESSolid_HArray1OfVertexList, IGESSolid_Loop, IGESSolid_ManifoldSolid, IGESSolid_PlaneSurface, IGESSolid_Protocol, IGESSolid_ReadWriteModule, IGESSolid_RightAngularWedge, IGESSolid_SelectedComponent, IGESSolid_Shell, IGESSolid_SolidAssembly, IGESSolid_SolidInstance, IGESSolid_SolidOfLinearExtrusion, IGESSolid_SolidOfRevolution, IGESSolid_SpecificModule, IGESSolid_Sphere, IGESSolid_SphericalSurface, IGESSolid_ToroidalSurface, IGESSolid_Torus, IGESSolid_VertexList, IGESToBRep_Actor, IGESToBRep_AlgoContainer, IGESToBRep_IGESBoundary, IGESToBRep_ToolContainer, IVtkOCC_ViewerSelector, IVtk_IView, IVtk_Interface, Image_AlienPixMap, Image_Diff, Image_PixMap, Image_PixMapData, Image_VideoRecorder, IntPatch_ALine, IntPatch_GLine, IntPatch_Line, IntPatch_PointLine, IntPatch_RLine, IntPatch_TheIWLineOfTheIWalking, IntPatch_WLine, IntStart_SITopolTool, IntSurf_LineOn2S, IntTools_Context, IntTools_TopolTool, Interface_Check, Interface_CheckFailure, Interface_CopyControl, Interface_CopyMap, Interface_EntityCluster, Interface_FileReaderData, Interface_GTool, Interface_GeneralModule, Interface_GlobalNodeOfGeneralLib, Interface_GlobalNodeOfReaderLib, Interface_HArray1OfHAsciiString, Interface_HGraph, Interface_HSequenceOfCheck, Interface_IntVal, Interface_InterfaceError, Interface_InterfaceMismatch, Interface_InterfaceModel, Interface_NodeOfGeneralLib, Interface_NodeOfReaderLib, Interface_ParamList, Interface_ParamSet, Interface_Protocol, Interface_ReaderModule, Interface_ReportEntity, Interface_SignLabel, Interface_SignType, Interface_Static, Interface_TypedValue, Interface_UndefinedContent, LDOM_MemManager, LProp_BadContinuity, LProp_NotDefined, Law_BSpFunc, Law_BSpline, Law_Composite, Law_Constant, Law_Function, Law_Interpol, Law_Linear, Law_S, LocOpe_GeneratedShape, LocOpe_GluedShape, LocOpe_WiresOnShape, MAT2d_Circuit, MAT2d_Connexion, MAT_Arc, MAT_BasicElt, MAT_Bisector, MAT_Edge, MAT_Graph, MAT_ListOfBisector, MAT_ListOfEdge, MAT_Node, MAT_TListNodeOfListOfBisector, MAT_TListNodeOfListOfEdge, MAT_Zone, Media_Timer, MeshVS_CommonSensitiveEntity, MeshVS_DataSource, MeshVS_DataSource3D, MeshVS_DeformedDataSource, MeshVS_Drawer, MeshVS_DummySensitiveEntity, MeshVS_ElementalColorPrsBuilder, MeshVS_HArray1OfSequenceOfInteger, MeshVS_Mesh, MeshVS_MeshEntityOwner, MeshVS_MeshOwner, MeshVS_MeshPrsBuilder, MeshVS_NodalColorPrsBuilder, MeshVS_PrsBuilder, MeshVS_SensitiveFace, MeshVS_SensitiveMesh, MeshVS_SensitivePolyhedron, MeshVS_SensitiveQuad, MeshVS_SensitiveSegment, MeshVS_TextPrsBuilder, MeshVS_VectorPrsBuilder, Message_Alert, Message_Algorithm, Message_Messenger, Message_Printer, Message_PrinterOStream, Message_ProgressIndicator, Message_Report, MoniTool_CaseData, MoniTool_Element, MoniTool_HSequenceOfElement, MoniTool_IntVal, MoniTool_RealVal, MoniTool_SignShape, MoniTool_SignText, MoniTool_Timer, MoniTool_TransientElem, MoniTool_TypedValue, NCollection_AccAllocator, NCollection_AlignedAllocator, NCollection_BaseAllocator, NCollection_Buffer, NCollection_HeapAllocator, NCollection_IncAllocator, NCollection_WinHeapAllocator, NLPlate_HGPPConstraint, NLPlate_HPG0Constraint, NLPlate_HPG0G1Constraint, NLPlate_HPG0G2Constraint, NLPlate_HPG0G3Constraint, NLPlate_HPG1Constraint, NLPlate_HPG2Constraint, NLPlate_HPG3Constraint, OSD_Exception, OSD_Exception_ACCESS_VIOLATION, OSD_Exception_ARRAY_BOUNDS_EXCEEDED, OSD_Exception_CTRL_BREAK, OSD_Exception_FLT_DENORMAL_OPERAND, OSD_Exception_FLT_DIVIDE_BY_ZERO, OSD_Exception_FLT_INEXACT_RESULT, OSD_Exception_FLT_INVALID_OPERATION, OSD_Exception_FLT_OVERFLOW, OSD_Exception_FLT_STACK_CHECK, OSD_Exception_FLT_UNDERFLOW, OSD_Exception_ILLEGAL_INSTRUCTION, OSD_Exception_INT_DIVIDE_BY_ZERO, OSD_Exception_INT_OVERFLOW, OSD_Exception_INVALID_DISPOSITION, OSD_Exception_IN_PAGE_ERROR, OSD_Exception_NONCONTINUABLE_EXCEPTION, OSD_Exception_PRIV_INSTRUCTION, OSD_Exception_STACK_OVERFLOW, OSD_Exception_STATUS_NO_MEMORY, OSD_OSDError, OSD_SIGBUS, OSD_SIGHUP, OSD_SIGILL, OSD_SIGINT, OSD_SIGKILL, OSD_SIGQUIT, OSD_SIGSEGV, OSD_SIGSYS, OSD_Signal, OpenGl_CappingPlaneResource, OpenGl_Caps, OpenGl_Context, OpenGl_Font, OpenGl_FrameBuffer, OpenGl_FrameStats, OpenGl_GraphicDriver, OpenGl_Group, OpenGl_IndexBuffer, OpenGl_LineAttributes, OpenGl_PointSprite, OpenGl_Resource, OpenGl_Sampler, OpenGl_ShaderManager, OpenGl_ShaderObject, OpenGl_ShaderProgram, OpenGl_Structure, OpenGl_StructureShadow, OpenGl_Texture, OpenGl_TextureBufferArb, OpenGl_VertexBuffer, OpenGl_VertexBufferCompat, OpenGl_Window, OpenGl_Workspace, PCDM_Document, PCDM_DriverError, PCDM_ReadWriter, PCDM_ReferenceIterator, PCDM_RetrievalDriver, PCDM_StorageDriver, PCDM_Writer, PLib_Base, PLib_HermitJacobi, PLib_JacobiPolynomial, Plate_HArray1OfPinpointConstraint, Plugin_Failure, Poly_CoherentTriangulation, Poly_HArray1OfTriangle, Poly_Polygon2D, Poly_Polygon3D, Poly_PolygonOnTriangulation, Poly_Triangulation, ProjLib_HCompProjectedCurve, ProjLib_HProjectedCurve, ProjLib_HSequenceOfHSequenceOfPnt, Prs3d_ArrowAspect, Prs3d_BasicAspect, Prs3d_DatumAspect, Prs3d_DimensionAspect, Prs3d_Drawer, Prs3d_InvalidAngle, Prs3d_IsoAspect, Prs3d_LineAspect, Prs3d_PlaneAspect, Prs3d_PointAspect, Prs3d_PresentationShadow, Prs3d_Projector, Prs3d_ShadingAspect, Prs3d_TextAspect, PrsMgr_PresentableObject, PrsMgr_Presentation, PrsMgr_PresentationManager, QABugs_PresentableObject, Quantity_ColorDefinitionError, Quantity_DateDefinitionError, Quantity_HArray1OfColor, Quantity_PeriodDefinitionError, RWHeaderSection_GeneralModule, RWHeaderSection_ReadWriteModule, RWStepAP214_GeneralModule, RWStepAP214_ReadWriteModule, Resource_Manager, Resource_NoSuchResource, STEPCAFControl_ActorWrite, STEPCAFControl_Controller, STEPCAFControl_ExternFile, STEPControl_ActorRead, STEPControl_ActorWrite, STEPControl_Controller, STEPEdit_EditContext, STEPEdit_EditSDR, STEPSelections_AssemblyComponent, STEPSelections_AssemblyLink, STEPSelections_HSequenceOfAssemblyLink, STEPSelections_SelectAssembly, STEPSelections_SelectDerived, STEPSelections_SelectFaces, STEPSelections_SelectForTransfer, STEPSelections_SelectGSCurves, STEPSelections_SelectInstances, Select3D_BVHIndexBuffer, Select3D_InteriorSensitivePointSet, Select3D_SensitiveBox, Select3D_SensitiveCircle, Select3D_SensitiveCurve, Select3D_SensitiveEntity, Select3D_SensitiveFace, Select3D_SensitiveGroup, Select3D_SensitivePoint, Select3D_SensitivePoly, Select3D_SensitivePrimitiveArray, Select3D_SensitiveSegment, Select3D_SensitiveSet, Select3D_SensitiveTriangle, Select3D_SensitiveTriangulation, Select3D_SensitiveWire, SelectMgr_AndFilter, SelectMgr_CompositionFilter, SelectMgr_EntityOwner, SelectMgr_Filter, SelectMgr_FrustumBuilder, SelectMgr_OrFilter, SelectMgr_SelectableObject, SelectMgr_Selection, SelectMgr_SelectionManager, SelectMgr_SensitiveEntity, SelectMgr_ViewerSelector, ShapeAlgo_AlgoContainer, ShapeAlgo_ToolContainer, ShapeAnalysis_FreeBoundData, ShapeAnalysis_HSequenceOfFreeBounds, ShapeAnalysis_Surface, ShapeAnalysis_TransferParameters, ShapeAnalysis_TransferParametersProj, ShapeAnalysis_Wire, ShapeBuild_ReShape, ShapeConstruct_ProjectCurveOnSurface, ShapeCustom_BSplineRestriction, ShapeCustom_ConvertToBSpline, ShapeCustom_ConvertToRevolution, ShapeCustom_DirectModification, ShapeCustom_Modification, ShapeCustom_RestrictionParameters, ShapeCustom_SweptToElementary, ShapeCustom_TrsfModification, ShapeExtend_BasicMsgRegistrator, ShapeExtend_ComplexCurve, ShapeExtend_CompositeSurface, ShapeExtend_MsgRegistrator, ShapeExtend_WireData, ShapeFix_ComposeShell, ShapeFix_Edge, ShapeFix_EdgeProjAux, ShapeFix_Face, ShapeFix_FixSmallFace, ShapeFix_FixSmallSolid, ShapeFix_Root, ShapeFix_Shape, ShapeFix_Shell, ShapeFix_Solid, ShapeFix_SplitCommonVertex, ShapeFix_Wire, ShapeFix_Wireframe, ShapeProcess_Context, ShapeProcess_Operator, ShapeProcess_ShapeContext, ShapeProcess_UOperator, ShapeUpgrade_ClosedEdgeDivide, ShapeUpgrade_ClosedFaceDivide, ShapeUpgrade_ConvertCurve2dToBezier, ShapeUpgrade_ConvertCurve3dToBezier, ShapeUpgrade_ConvertSurfaceToBezierBasis, ShapeUpgrade_EdgeDivide, ShapeUpgrade_FaceDivide, ShapeUpgrade_FaceDivideArea, ShapeUpgrade_FixSmallBezierCurves, ShapeUpgrade_FixSmallCurves, ShapeUpgrade_RemoveInternalWires, ShapeUpgrade_RemoveLocations, ShapeUpgrade_SplitCurve, ShapeUpgrade_SplitCurve2d, ShapeUpgrade_SplitCurve2dContinuity, ShapeUpgrade_SplitCurve3d, ShapeUpgrade_SplitCurve3dContinuity, ShapeUpgrade_SplitSurface, ShapeUpgrade_SplitSurfaceAngle, ShapeUpgrade_SplitSurfaceArea, ShapeUpgrade_SplitSurfaceContinuity, ShapeUpgrade_Tool, ShapeUpgrade_UnifySameDomain, ShapeUpgrade_WireDivide, Standard_AbortiveTransaction, Standard_ConstructionError, Standard_DimensionError, Standard_DimensionMismatch, Standard_DivideByZero, Standard_DomainError, Standard_Failure, Standard_ImmutableObject, Standard_LicenseError, Standard_LicenseNotFound, Standard_MultiplyDefined, Standard_NegativeValue, Standard_NoMoreObject, Standard_NoSuchObject, Standard_NotImplemented, Standard_NullObject, Standard_NullValue, Standard_NumericError, Standard_OutOfMemory, Standard_OutOfRange, Standard_Overflow, Standard_ProgramError, Standard_RangeError, Standard_TooManyUsers, Standard_Transient, Standard_Type, Standard_TypeMismatch, Standard_Underflow, StdFail_InfiniteSolutions, StdFail_NotDone, StdFail_Undefined, StdFail_UndefinedDerivative, StdFail_UndefinedValue, StdLPersistent_HArray1OfPersistent, StdLPersistent_HArray2OfPersistent, StdPersistent_HArray1OfShape1, StdSelect_BRepOwner, StdSelect_EdgeFilter, StdSelect_FaceFilter, StdSelect_Prs, StdSelect_Shape, StdSelect_ShapeTypeFilter, StdSelect_ViewerSelector3d, StdStorage_HSequenceOfRoots, StdStorage_HeaderData, StdStorage_Root, StdStorage_RootData, StdStorage_TypeData, StepAP203_CcDesignApproval, StepAP203_CcDesignCertification, StepAP203_CcDesignContract, StepAP203_CcDesignDateAndTimeAssignment, StepAP203_CcDesignPersonAndOrganizationAssignment, StepAP203_CcDesignSecurityClassification, StepAP203_CcDesignSpecificationReference, StepAP203_Change, StepAP203_ChangeRequest, StepAP203_HArray1OfApprovedItem, StepAP203_HArray1OfCertifiedItem, StepAP203_HArray1OfChangeRequestItem, StepAP203_HArray1OfClassifiedItem, StepAP203_HArray1OfContractedItem, StepAP203_HArray1OfDateTimeItem, StepAP203_HArray1OfPersonOrganizationItem, StepAP203_HArray1OfSpecifiedItem, StepAP203_HArray1OfStartRequestItem, StepAP203_HArray1OfWorkItem, StepAP203_StartRequest, StepAP203_StartWork, StepAP214_AppliedApprovalAssignment, StepAP214_AppliedDateAndTimeAssignment, StepAP214_AppliedDateAssignment, StepAP214_AppliedDocumentReference, StepAP214_AppliedExternalIdentificationAssignment, StepAP214_AppliedGroupAssignment, StepAP214_AppliedOrganizationAssignment, StepAP214_AppliedPersonAndOrganizationAssignment, StepAP214_AppliedPresentedItem, StepAP214_AppliedSecurityClassificationAssignment, StepAP214_AutoDesignActualDateAndTimeAssignment, StepAP214_AutoDesignActualDateAssignment, StepAP214_AutoDesignApprovalAssignment, StepAP214_AutoDesignDateAndPersonAssignment, StepAP214_AutoDesignDocumentReference, StepAP214_AutoDesignGroupAssignment, StepAP214_AutoDesignNominalDateAndTimeAssignment, StepAP214_AutoDesignNominalDateAssignment, StepAP214_AutoDesignOrganizationAssignment, StepAP214_AutoDesignPersonAndOrganizationAssignment, StepAP214_AutoDesignPresentedItem, StepAP214_AutoDesignSecurityClassificationAssignment, StepAP214_Class, StepAP214_ExternallyDefinedClass, StepAP214_ExternallyDefinedGeneralProperty, StepAP214_HArray1OfApprovalItem, StepAP214_HArray1OfAutoDesignDateAndPersonItem, StepAP214_HArray1OfAutoDesignDateAndTimeItem, StepAP214_HArray1OfAutoDesignDatedItem, StepAP214_HArray1OfAutoDesignGeneralOrgItem, StepAP214_HArray1OfAutoDesignGroupedItem, StepAP214_HArray1OfAutoDesignPresentedItemSelect, StepAP214_HArray1OfAutoDesignReferencingItem, StepAP214_HArray1OfDateAndTimeItem, StepAP214_HArray1OfDateItem, StepAP214_HArray1OfDocumentReferenceItem, StepAP214_HArray1OfExternalIdentificationItem, StepAP214_HArray1OfGroupItem, StepAP214_HArray1OfOrganizationItem, StepAP214_HArray1OfPersonAndOrganizationItem, StepAP214_HArray1OfPresentedItemSelect, StepAP214_HArray1OfSecurityClassificationItem, StepAP214_Protocol, StepAP214_RepItemGroup, StepAP242_DraughtingModelItemAssociation, StepAP242_GeometricItemSpecificUsage, StepAP242_IdAttribute, StepAP242_ItemIdentifiedRepresentationUsage, StepBasic_Action, StepBasic_ActionAssignment, StepBasic_ActionMethod, StepBasic_ActionRequestAssignment, StepBasic_ActionRequestSolution, StepBasic_Address, StepBasic_ApplicationContext, StepBasic_ApplicationContextElement, StepBasic_ApplicationProtocolDefinition, StepBasic_Approval, StepBasic_ApprovalAssignment, StepBasic_ApprovalDateTime, StepBasic_ApprovalPersonOrganization, StepBasic_ApprovalRelationship, StepBasic_ApprovalRole, StepBasic_ApprovalStatus, StepBasic_AreaUnit, StepBasic_CalendarDate, StepBasic_Certification, StepBasic_CertificationAssignment, StepBasic_CertificationType, StepBasic_CharacterizedObject, StepBasic_Contract, StepBasic_ContractAssignment, StepBasic_ContractType, StepBasic_ConversionBasedUnit, StepBasic_ConversionBasedUnitAndAreaUnit, StepBasic_ConversionBasedUnitAndLengthUnit, StepBasic_ConversionBasedUnitAndMassUnit, StepBasic_ConversionBasedUnitAndPlaneAngleUnit, StepBasic_ConversionBasedUnitAndRatioUnit, StepBasic_ConversionBasedUnitAndSolidAngleUnit, StepBasic_ConversionBasedUnitAndTimeUnit, StepBasic_ConversionBasedUnitAndVolumeUnit, StepBasic_CoordinatedUniversalTimeOffset, StepBasic_Date, StepBasic_DateAndTime, StepBasic_DateAndTimeAssignment, StepBasic_DateAssignment, StepBasic_DateRole, StepBasic_DateTimeRole, StepBasic_DerivedUnit, StepBasic_DerivedUnitElement, StepBasic_DesignContext, StepBasic_DigitalDocument, StepBasic_DimensionalExponents, StepBasic_Document, StepBasic_DocumentFile, StepBasic_DocumentProductAssociation, StepBasic_DocumentProductEquivalence, StepBasic_DocumentReference, StepBasic_DocumentRelationship, StepBasic_DocumentRepresentationType, StepBasic_DocumentType, StepBasic_DocumentUsageConstraint, StepBasic_Effectivity, StepBasic_EffectivityAssignment, StepBasic_EulerAngles, StepBasic_ExternalIdentificationAssignment, StepBasic_ExternalSource, StepBasic_ExternallyDefinedItem, StepBasic_GeneralProperty, StepBasic_Group, StepBasic_GroupAssignment, StepBasic_GroupRelationship, StepBasic_HArray1OfApproval, StepBasic_HArray1OfDerivedUnitElement, StepBasic_HArray1OfDocument, StepBasic_HArray1OfNamedUnit, StepBasic_HArray1OfOrganization, StepBasic_HArray1OfPerson, StepBasic_HArray1OfProduct, StepBasic_HArray1OfProductContext, StepBasic_HArray1OfProductDefinition, StepBasic_HArray1OfUncertaintyMeasureWithUnit, StepBasic_IdentificationAssignment, StepBasic_IdentificationRole, StepBasic_LengthMeasureWithUnit, StepBasic_LengthUnit, StepBasic_LocalTime, StepBasic_MassMeasureWithUnit, StepBasic_MassUnit, StepBasic_MeasureValueMember, StepBasic_MeasureWithUnit, StepBasic_MechanicalContext, StepBasic_NameAssignment, StepBasic_NamedUnit, StepBasic_ObjectRole, StepBasic_OrdinalDate, StepBasic_Organization, StepBasic_OrganizationAssignment, StepBasic_OrganizationRole, StepBasic_OrganizationalAddress, StepBasic_Person, StepBasic_PersonAndOrganization, StepBasic_PersonAndOrganizationAssignment, StepBasic_PersonAndOrganizationRole, StepBasic_PersonalAddress, StepBasic_PhysicallyModeledProductDefinition, StepBasic_PlaneAngleMeasureWithUnit, StepBasic_PlaneAngleUnit, StepBasic_Product, StepBasic_ProductCategory, StepBasic_ProductCategoryRelationship, StepBasic_ProductConceptContext, StepBasic_ProductContext, StepBasic_ProductDefinition, StepBasic_ProductDefinitionContext, StepBasic_ProductDefinitionEffectivity, StepBasic_ProductDefinitionFormation, StepBasic_ProductDefinitionFormationRelationship, StepBasic_ProductDefinitionFormationWithSpecifiedSource, StepBasic_ProductDefinitionReference, StepBasic_ProductDefinitionReferenceWithLocalRepresentation, StepBasic_ProductDefinitionRelationship, StepBasic_ProductDefinitionWithAssociatedDocuments, StepBasic_ProductRelatedProductCategory, StepBasic_ProductType, StepBasic_RatioMeasureWithUnit, StepBasic_RatioUnit, StepBasic_RoleAssociation, StepBasic_SecurityClassification, StepBasic_SecurityClassificationAssignment, StepBasic_SecurityClassificationLevel, StepBasic_SiUnit, StepBasic_SiUnitAndAreaUnit, StepBasic_SiUnitAndLengthUnit, StepBasic_SiUnitAndMassUnit, StepBasic_SiUnitAndPlaneAngleUnit, StepBasic_SiUnitAndRatioUnit, StepBasic_SiUnitAndSolidAngleUnit, StepBasic_SiUnitAndThermodynamicTemperatureUnit, StepBasic_SiUnitAndTimeUnit, StepBasic_SiUnitAndVolumeUnit, StepBasic_SizeMember, StepBasic_SolidAngleMeasureWithUnit, StepBasic_SolidAngleUnit, StepBasic_ThermodynamicTemperatureUnit, StepBasic_TimeMeasureWithUnit, StepBasic_TimeUnit, StepBasic_UncertaintyMeasureWithUnit, StepBasic_VersionedActionRequest, StepBasic_VolumeUnit, StepBasic_WeekOfYearAndDayDate, StepData_DefaultGeneral, StepData_Described, StepData_ECDescr, StepData_EDescr, StepData_ESDescr, StepData_FileProtocol, StepData_FileRecognizer, StepData_FreeFormEntity, StepData_GeneralModule, StepData_GlobalNodeOfWriterLib, StepData_HArray1OfField, StepData_NodeOfWriterLib, StepData_PDescr, StepData_Plex, StepData_Protocol, StepData_ReadWriteModule, StepData_SelectArrReal, StepData_SelectInt, StepData_SelectMember, StepData_SelectNamed, StepData_SelectReal, StepData_Simple, StepData_StepModel, StepData_StepReaderData, StepData_UndefinedEntity, StepDimTol_AngularityTolerance, StepDimTol_CircularRunoutTolerance, StepDimTol_CoaxialityTolerance, StepDimTol_CommonDatum, StepDimTol_ConcentricityTolerance, StepDimTol_CylindricityTolerance, StepDimTol_Datum, StepDimTol_DatumFeature, StepDimTol_DatumReference, StepDimTol_DatumReferenceCompartment, StepDimTol_DatumReferenceElement, StepDimTol_DatumReferenceModifierWithValue, StepDimTol_DatumSystem, StepDimTol_DatumTarget, StepDimTol_FlatnessTolerance, StepDimTol_GeneralDatumReference, StepDimTol_GeoTolAndGeoTolWthDatRef, StepDimTol_GeoTolAndGeoTolWthDatRefAndGeoTolWthMaxTol, StepDimTol_GeoTolAndGeoTolWthDatRefAndGeoTolWthMod, StepDimTol_GeoTolAndGeoTolWthDatRefAndModGeoTolAndPosTol, StepDimTol_GeoTolAndGeoTolWthDatRefAndUneqDisGeoTol, StepDimTol_GeoTolAndGeoTolWthMaxTol, StepDimTol_GeoTolAndGeoTolWthMod, StepDimTol_GeometricTolerance, StepDimTol_GeometricToleranceRelationship, StepDimTol_GeometricToleranceWithDatumReference, StepDimTol_GeometricToleranceWithDefinedAreaUnit, StepDimTol_GeometricToleranceWithDefinedUnit, StepDimTol_GeometricToleranceWithMaximumTolerance, StepDimTol_GeometricToleranceWithModifiers, StepDimTol_HArray1OfDatumReference, StepDimTol_HArray1OfDatumReferenceCompartment, StepDimTol_HArray1OfDatumReferenceElement, StepDimTol_HArray1OfDatumReferenceModifier, StepDimTol_HArray1OfDatumSystemOrReference, StepDimTol_HArray1OfGeometricToleranceModifier, StepDimTol_HArray1OfToleranceZoneTarget, StepDimTol_LineProfileTolerance, StepDimTol_ModifiedGeometricTolerance, StepDimTol_NonUniformZoneDefinition, StepDimTol_ParallelismTolerance, StepDimTol_PerpendicularityTolerance, StepDimTol_PlacedDatumTargetFeature, StepDimTol_PositionTolerance, StepDimTol_ProjectedZoneDefinition, StepDimTol_RoundnessTolerance, StepDimTol_RunoutZoneDefinition, StepDimTol_RunoutZoneOrientation, StepDimTol_SimpleDatumReferenceModifierMember, StepDimTol_StraightnessTolerance, StepDimTol_SurfaceProfileTolerance, StepDimTol_SymmetryTolerance, StepDimTol_ToleranceZone, StepDimTol_ToleranceZoneDefinition, StepDimTol_ToleranceZoneForm, StepDimTol_TotalRunoutTolerance, StepDimTol_UnequallyDisposedGeometricTolerance, StepElement_AnalysisItemWithinRepresentation, StepElement_Curve3dElementDescriptor, StepElement_CurveElementEndReleasePacket, StepElement_CurveElementFreedomMember, StepElement_CurveElementPurposeMember, StepElement_CurveElementSectionDefinition, StepElement_CurveElementSectionDerivedDefinitions, StepElement_ElementAspectMember, StepElement_ElementDescriptor, StepElement_ElementMaterial, StepElement_HArray1OfCurveElementEndReleasePacket, StepElement_HArray1OfCurveElementSectionDefinition, StepElement_HArray1OfHSequenceOfCurveElementPurposeMember, StepElement_HArray1OfHSequenceOfSurfaceElementPurposeMember, StepElement_HArray1OfMeasureOrUnspecifiedValue, StepElement_HArray1OfSurfaceSection, StepElement_HArray1OfVolumeElementPurpose, StepElement_HArray1OfVolumeElementPurposeMember, StepElement_HArray2OfCurveElementPurposeMember, StepElement_HArray2OfSurfaceElementPurpose, StepElement_HArray2OfSurfaceElementPurposeMember, StepElement_HSequenceOfCurveElementPurposeMember, StepElement_HSequenceOfCurveElementSectionDefinition, StepElement_HSequenceOfElementMaterial, StepElement_HSequenceOfSurfaceElementPurposeMember, StepElement_MeasureOrUnspecifiedValueMember, StepElement_Surface3dElementDescriptor, StepElement_SurfaceElementProperty, StepElement_SurfaceElementPurposeMember, StepElement_SurfaceSection, StepElement_SurfaceSectionField, StepElement_SurfaceSectionFieldConstant, StepElement_SurfaceSectionFieldVarying, StepElement_UniformSurfaceSection, StepElement_Volume3dElementDescriptor, StepElement_VolumeElementPurposeMember, StepFEA_AlignedCurve3dElementCoordinateSystem, StepFEA_AlignedSurface3dElementCoordinateSystem, StepFEA_ArbitraryVolume3dElementCoordinateSystem, StepFEA_ConstantSurface3dElementCoordinateSystem, StepFEA_Curve3dElementProperty, StepFEA_Curve3dElementRepresentation, StepFEA_CurveElementEndOffset, StepFEA_CurveElementEndRelease, StepFEA_CurveElementInterval, StepFEA_CurveElementIntervalConstant, StepFEA_CurveElementIntervalLinearlyVarying, StepFEA_CurveElementLocation, StepFEA_DegreeOfFreedomMember, StepFEA_DummyNode, StepFEA_ElementGeometricRelationship, StepFEA_ElementGroup, StepFEA_ElementRepresentation, StepFEA_FeaAreaDensity, StepFEA_FeaAxis2Placement3d, StepFEA_FeaCurveSectionGeometricRelationship, StepFEA_FeaGroup, StepFEA_FeaLinearElasticity, StepFEA_FeaMassDensity, StepFEA_FeaMaterialPropertyRepresentation, StepFEA_FeaMaterialPropertyRepresentationItem, StepFEA_FeaModel, StepFEA_FeaModel3d, StepFEA_FeaModelDefinition, StepFEA_FeaMoistureAbsorption, StepFEA_FeaParametricPoint, StepFEA_FeaRepresentationItem, StepFEA_FeaSecantCoefficientOfLinearThermalExpansion, StepFEA_FeaShellBendingStiffness, StepFEA_FeaShellMembraneBendingCouplingStiffness, StepFEA_FeaShellMembraneStiffness, StepFEA_FeaShellShearStiffness, StepFEA_FeaSurfaceSectionGeometricRelationship, StepFEA_FeaTangentialCoefficientOfLinearThermalExpansion, StepFEA_FreedomAndCoefficient, StepFEA_FreedomsList, StepFEA_GeometricNode, StepFEA_HArray1OfCurveElementEndOffset, StepFEA_HArray1OfCurveElementEndRelease, StepFEA_HArray1OfCurveElementInterval, StepFEA_HArray1OfDegreeOfFreedom, StepFEA_HArray1OfElementRepresentation, StepFEA_HArray1OfNodeRepresentation, StepFEA_HSequenceOfCurve3dElementProperty, StepFEA_HSequenceOfElementGeometricRelationship, StepFEA_HSequenceOfElementRepresentation, StepFEA_HSequenceOfNodeRepresentation, StepFEA_Node, StepFEA_NodeDefinition, StepFEA_NodeGroup, StepFEA_NodeRepresentation, StepFEA_NodeSet, StepFEA_NodeWithSolutionCoordinateSystem, StepFEA_NodeWithVector, StepFEA_ParametricCurve3dElementCoordinateDirection, StepFEA_ParametricCurve3dElementCoordinateSystem, StepFEA_ParametricSurface3dElementCoordinateSystem, StepFEA_Surface3dElementRepresentation, StepFEA_SymmetricTensor23dMember, StepFEA_SymmetricTensor43dMember, StepFEA_Volume3dElementRepresentation, StepGeom_Axis1Placement, StepGeom_Axis2Placement2d, StepGeom_Axis2Placement3d, StepGeom_BSplineCurve, StepGeom_BSplineCurveWithKnots, StepGeom_BSplineCurveWithKnotsAndRationalBSplineCurve, StepGeom_BSplineSurface, StepGeom_BSplineSurfaceWithKnots, StepGeom_BSplineSurfaceWithKnotsAndRationalBSplineSurface, StepGeom_BezierCurve, StepGeom_BezierCurveAndRationalBSplineCurve, StepGeom_BezierSurface, StepGeom_BezierSurfaceAndRationalBSplineSurface, StepGeom_BoundaryCurve, StepGeom_BoundedCurve, StepGeom_BoundedSurface, StepGeom_CartesianPoint, StepGeom_CartesianTransformationOperator, StepGeom_CartesianTransformationOperator2d, StepGeom_CartesianTransformationOperator3d, StepGeom_Circle, StepGeom_CompositeCurve, StepGeom_CompositeCurveOnSurface, StepGeom_CompositeCurveSegment, StepGeom_Conic, StepGeom_ConicalSurface, StepGeom_Curve, StepGeom_CurveBoundedSurface, StepGeom_CurveReplica, StepGeom_CylindricalSurface, StepGeom_DegeneratePcurve, StepGeom_DegenerateToroidalSurface, StepGeom_Direction, StepGeom_ElementarySurface, StepGeom_Ellipse, StepGeom_EvaluatedDegeneratePcurve, StepGeom_GeomRepContextAndGlobUnitAssCtxAndGlobUncertaintyAssCtx, StepGeom_GeometricRepresentationContext, StepGeom_GeometricRepresentationContextAndGlobalUnitAssignedContext, StepGeom_GeometricRepresentationContextAndParametricRepresentationContext, StepGeom_GeometricRepresentationItem, StepGeom_HArray1OfBoundaryCurve, StepGeom_HArray1OfCartesianPoint, StepGeom_HArray1OfCompositeCurveSegment, StepGeom_HArray1OfCurve, StepGeom_HArray1OfPcurveOrSurface, StepGeom_HArray1OfSurfaceBoundary, StepGeom_HArray1OfTrimmingSelect, StepGeom_HArray2OfCartesianPoint, StepGeom_HArray2OfSurfacePatch, StepGeom_Hyperbola, StepGeom_IntersectionCurve, StepGeom_Line, StepGeom_OffsetCurve3d, StepGeom_OffsetSurface, StepGeom_OrientedSurface, StepGeom_OuterBoundaryCurve, StepGeom_Parabola, StepGeom_Pcurve, StepGeom_Placement, StepGeom_Plane, StepGeom_Point, StepGeom_PointOnCurve, StepGeom_PointOnSurface, StepGeom_PointReplica, StepGeom_Polyline, StepGeom_QuasiUniformCurve, StepGeom_QuasiUniformCurveAndRationalBSplineCurve, StepGeom_QuasiUniformSurface, StepGeom_QuasiUniformSurfaceAndRationalBSplineSurface, StepGeom_RationalBSplineCurve, StepGeom_RationalBSplineSurface, StepGeom_RectangularCompositeSurface, StepGeom_RectangularTrimmedSurface, StepGeom_ReparametrisedCompositeCurveSegment, StepGeom_SeamCurve, StepGeom_SphericalSurface, StepGeom_Surface, StepGeom_SurfaceCurve, StepGeom_SurfaceCurveAndBoundedCurve, StepGeom_SurfaceOfLinearExtrusion, StepGeom_SurfaceOfRevolution, StepGeom_SurfacePatch, StepGeom_SurfaceReplica, StepGeom_SweptSurface, StepGeom_ToroidalSurface, StepGeom_TrimmedCurve, StepGeom_TrimmingMember, StepGeom_UniformCurve, StepGeom_UniformCurveAndRationalBSplineCurve, StepGeom_UniformSurface, StepGeom_UniformSurfaceAndRationalBSplineSurface, StepGeom_Vector, StepRepr_AllAroundShapeAspect, StepRepr_Apex, StepRepr_AssemblyComponentUsage, StepRepr_AssemblyComponentUsageSubstitute, StepRepr_BetweenShapeAspect, StepRepr_CentreOfSymmetry, StepRepr_CharacterizedRepresentation, StepRepr_CompGroupShAspAndCompShAspAndDatumFeatAndShAsp, StepRepr_CompShAspAndDatumFeatAndShAsp, StepRepr_CompositeGroupShapeAspect, StepRepr_CompositeShapeAspect, StepRepr_CompoundRepresentationItem, StepRepr_ConfigurationDesign, StepRepr_ConfigurationEffectivity, StepRepr_ConfigurationItem, StepRepr_ConstructiveGeometryRepresentation, StepRepr_ConstructiveGeometryRepresentationRelationship, StepRepr_ContinuosShapeAspect, StepRepr_DataEnvironment, StepRepr_DefinitionalRepresentation, StepRepr_DerivedShapeAspect, StepRepr_DescriptiveRepresentationItem, StepRepr_Extension, StepRepr_ExternallyDefinedRepresentation, StepRepr_FeatureForDatumTargetRelationship, StepRepr_FunctionallyDefinedTransformation, StepRepr_GeometricAlignment, StepRepr_GlobalUncertaintyAssignedContext, StepRepr_GlobalUnitAssignedContext, StepRepr_HArray1OfMaterialPropertyRepresentation, StepRepr_HArray1OfPropertyDefinitionRepresentation, StepRepr_HArray1OfRepresentationItem, StepRepr_HArray1OfShapeAspect, StepRepr_HSequenceOfMaterialPropertyRepresentation, StepRepr_HSequenceOfRepresentationItem, StepRepr_IntegerRepresentationItem, StepRepr_ItemDefinedTransformation, StepRepr_MakeFromUsageOption, StepRepr_MappedItem, StepRepr_MaterialDesignation, StepRepr_MaterialProperty, StepRepr_MaterialPropertyRepresentation, StepRepr_MeasureRepresentationItem, StepRepr_NextAssemblyUsageOccurrence, StepRepr_ParallelOffset, StepRepr_ParametricRepresentationContext, StepRepr_PerpendicularTo, StepRepr_ProductConcept, StepRepr_ProductDefinitionShape, StepRepr_ProductDefinitionUsage, StepRepr_PromissoryUsageOccurrence, StepRepr_PropertyDefinition, StepRepr_PropertyDefinitionRelationship, StepRepr_PropertyDefinitionRepresentation, StepRepr_QuantifiedAssemblyComponentUsage, StepRepr_ReprItemAndLengthMeasureWithUnit, StepRepr_ReprItemAndLengthMeasureWithUnitAndQRI, StepRepr_ReprItemAndMeasureWithUnit, StepRepr_ReprItemAndMeasureWithUnitAndQRI, StepRepr_ReprItemAndPlaneAngleMeasureWithUnit, StepRepr_ReprItemAndPlaneAngleMeasureWithUnitAndQRI, StepRepr_Representation, StepRepr_RepresentationContext, StepRepr_RepresentationItem, StepRepr_RepresentationMap, StepRepr_RepresentationRelationship, StepRepr_RepresentationRelationshipWithTransformation, StepRepr_ShapeAspect, StepRepr_ShapeAspectDerivingRelationship, StepRepr_ShapeAspectRelationship, StepRepr_ShapeAspectTransition, StepRepr_ShapeRepresentationRelationship, StepRepr_ShapeRepresentationRelationshipWithTransformation, StepRepr_SpecifiedHigherUsageOccurrence, StepRepr_StructuralResponseProperty, StepRepr_StructuralResponsePropertyDefinitionRepresentation, StepRepr_SuppliedPartRelationship, StepRepr_Tangent, StepRepr_ValueRange, StepRepr_ValueRepresentationItem, StepSelect_Activator, StepSelect_FileModifier, StepSelect_FloatFormat, StepSelect_ModelModifier, StepSelect_StepType, StepSelect_WorkLibrary, StepShape_AdvancedBrepShapeRepresentation, StepShape_AdvancedFace, StepShape_AngularLocation, StepShape_AngularSize, StepShape_Block, StepShape_BooleanResult, StepShape_BoxDomain, StepShape_BoxedHalfSpace, StepShape_BrepWithVoids, StepShape_ClosedShell, StepShape_CompoundShapeRepresentation, StepShape_ConnectedEdgeSet, StepShape_ConnectedFaceSet, StepShape_ConnectedFaceShapeRepresentation, StepShape_ConnectedFaceSubSet, StepShape_ContextDependentShapeRepresentation, StepShape_CsgShapeRepresentation, StepShape_CsgSolid, StepShape_DefinitionalRepresentationAndShapeRepresentation, StepShape_DimensionalCharacteristicRepresentation, StepShape_DimensionalLocation, StepShape_DimensionalLocationWithPath, StepShape_DimensionalSize, StepShape_DimensionalSizeWithPath, StepShape_DirectedDimensionalLocation, StepShape_Edge, StepShape_EdgeBasedWireframeModel, StepShape_EdgeBasedWireframeShapeRepresentation, StepShape_EdgeCurve, StepShape_EdgeLoop, StepShape_ExtrudedAreaSolid, StepShape_ExtrudedFaceSolid, StepShape_Face, StepShape_FaceBasedSurfaceModel, StepShape_FaceBound, StepShape_FaceOuterBound, StepShape_FaceSurface, StepShape_FacetedBrep, StepShape_FacetedBrepAndBrepWithVoids, StepShape_FacetedBrepShapeRepresentation, StepShape_GeometricCurveSet, StepShape_GeometricSet, StepShape_GeometricallyBoundedSurfaceShapeRepresentation, StepShape_GeometricallyBoundedWireframeShapeRepresentation, StepShape_HArray1OfConnectedEdgeSet, StepShape_HArray1OfConnectedFaceSet, StepShape_HArray1OfEdge, StepShape_HArray1OfFace, StepShape_HArray1OfFaceBound, StepShape_HArray1OfGeometricSetSelect, StepShape_HArray1OfOrientedClosedShell, StepShape_HArray1OfOrientedEdge, StepShape_HArray1OfShapeDimensionRepresentationItem, StepShape_HArray1OfShell, StepShape_HArray1OfValueQualifier, StepShape_HalfSpaceSolid, StepShape_LimitsAndFits, StepShape_Loop, StepShape_LoopAndPath, StepShape_ManifoldSolidBrep, StepShape_ManifoldSurfaceShapeRepresentation, StepShape_MeasureQualification, StepShape_MeasureRepresentationItemAndQualifiedRepresentationItem, StepShape_NonManifoldSurfaceShapeRepresentation, StepShape_OpenShell, StepShape_OrientedClosedShell, StepShape_OrientedEdge, StepShape_OrientedFace, StepShape_OrientedOpenShell, StepShape_OrientedPath, StepShape_Path, StepShape_PlusMinusTolerance, StepShape_PointRepresentation, StepShape_PolyLoop, StepShape_PrecisionQualifier, StepShape_QualifiedRepresentationItem, StepShape_RevolvedAreaSolid, StepShape_RevolvedFaceSolid, StepShape_RightAngularWedge, StepShape_RightCircularCone, StepShape_RightCircularCylinder, StepShape_SeamEdge, StepShape_ShapeDefinitionRepresentation, StepShape_ShapeDimensionRepresentation, StepShape_ShapeRepresentation, StepShape_ShapeRepresentationWithParameters, StepShape_ShellBasedSurfaceModel, StepShape_SolidModel, StepShape_SolidReplica, StepShape_Sphere, StepShape_Subedge, StepShape_Subface, StepShape_SweptAreaSolid, StepShape_SweptFaceSolid, StepShape_ToleranceValue, StepShape_TopologicalRepresentationItem, StepShape_Torus, StepShape_TransitionalShapeRepresentation, StepShape_TypeQualifier, StepShape_ValueFormatTypeQualifier, StepShape_Vertex, StepShape_VertexLoop, StepShape_VertexPoint, StepVisual_AnnotationCurveOccurrence, StepVisual_AnnotationCurveOccurrenceAndAnnotationOccurrenceAndGeomReprItemAndReprItemAndStyledItem, StepVisual_AnnotationFillArea, StepVisual_AnnotationFillAreaOccurrence, StepVisual_AnnotationOccurrence, StepVisual_AnnotationPlane, StepVisual_AnnotationText, StepVisual_AnnotationTextOccurrence, StepVisual_AreaInSet, StepVisual_BackgroundColour, StepVisual_CameraImage, StepVisual_CameraImage2dWithScale, StepVisual_CameraImage3dWithScale, StepVisual_CameraModel, StepVisual_CameraModelD2, StepVisual_CameraModelD3, StepVisual_CameraModelD3MultiClipping, StepVisual_CameraModelD3MultiClippingIntersection, StepVisual_CameraModelD3MultiClippingUnion, StepVisual_CameraUsage, StepVisual_CharacterizedObjectAndCharacterizedRepresentationAndDraughtingModelAndRepresentation, StepVisual_Colour, StepVisual_ColourRgb, StepVisual_ColourSpecification, StepVisual_CompositeText, StepVisual_CompositeTextWithExtent, StepVisual_ContextDependentInvisibility, StepVisual_ContextDependentOverRidingStyledItem, StepVisual_CoordinatesList, StepVisual_CurveStyle, StepVisual_CurveStyleFont, StepVisual_CurveStyleFontPattern, StepVisual_DraughtingAnnotationOccurrence, StepVisual_DraughtingCallout, StepVisual_DraughtingModel, StepVisual_DraughtingPreDefinedColour, StepVisual_DraughtingPreDefinedCurveFont, StepVisual_ExternallyDefinedCurveFont, StepVisual_ExternallyDefinedTextFont, StepVisual_FillAreaStyle, StepVisual_FillAreaStyleColour, StepVisual_HArray1OfAnnotationPlaneElement, StepVisual_HArray1OfBoxCharacteristicSelect, StepVisual_HArray1OfCameraModelD3MultiClippingInterectionSelect, StepVisual_HArray1OfCameraModelD3MultiClippingUnionSelect, StepVisual_HArray1OfCurveStyleFontPattern, StepVisual_HArray1OfDirectionCountSelect, StepVisual_HArray1OfDraughtingCalloutElement, StepVisual_HArray1OfFillStyleSelect, StepVisual_HArray1OfInvisibleItem, StepVisual_HArray1OfLayeredItem, StepVisual_HArray1OfPresentationStyleAssignment, StepVisual_HArray1OfPresentationStyleSelect, StepVisual_HArray1OfStyleContextSelect, StepVisual_HArray1OfSurfaceStyleElementSelect, StepVisual_HArray1OfTextOrCharacter, StepVisual_Invisibility, StepVisual_MarkerMember, StepVisual_MechanicalDesignGeometricPresentationArea, StepVisual_MechanicalDesignGeometricPresentationRepresentation, StepVisual_NullStyleMember, StepVisual_OverRidingStyledItem, StepVisual_PlanarBox, StepVisual_PlanarExtent, StepVisual_PointStyle, StepVisual_PreDefinedColour, StepVisual_PreDefinedCurveFont, StepVisual_PreDefinedItem, StepVisual_PreDefinedTextFont, StepVisual_PresentationArea, StepVisual_PresentationLayerAssignment, StepVisual_PresentationLayerUsage, StepVisual_PresentationRepresentation, StepVisual_PresentationSet, StepVisual_PresentationSize, StepVisual_PresentationStyleAssignment, StepVisual_PresentationStyleByContext, StepVisual_PresentationView, StepVisual_PresentedItem, StepVisual_PresentedItemRepresentation, StepVisual_StyledItem, StepVisual_SurfaceSideStyle, StepVisual_SurfaceStyleBoundary, StepVisual_SurfaceStyleControlGrid, StepVisual_SurfaceStyleFillArea, StepVisual_SurfaceStyleParameterLine, StepVisual_SurfaceStyleSegmentationCurve, StepVisual_SurfaceStyleSilhouette, StepVisual_SurfaceStyleUsage, StepVisual_Template, StepVisual_TemplateInstance, StepVisual_TessellatedAnnotationOccurrence, StepVisual_TessellatedCurveSet, StepVisual_TessellatedGeometricSet, StepVisual_TessellatedItem, StepVisual_TextLiteral, StepVisual_TextStyle, StepVisual_TextStyleForDefinedFont, StepVisual_TextStyleWithBoxCharacteristics, StepVisual_ViewVolume, Storage_CallBack, Storage_Data, Storage_DefaultCallBack, Storage_HArrayOfCallBack, Storage_HArrayOfSchema, Storage_HPArray, Storage_HSeqOfRoot, Storage_HeaderData, Storage_InternalData, Storage_Root, Storage_RootData, Storage_Schema, Storage_StreamExtCharParityError, Storage_StreamFormatError, Storage_StreamModeError, Storage_StreamReadError, Storage_StreamTypeMismatchError, Storage_StreamUnknownTypeError, Storage_StreamWriteError, Storage_TypeData, Storage_TypedCallBack, TColGeom2d_HArray1OfBSplineCurve, TColGeom2d_HArray1OfBezierCurve, TColGeom2d_HArray1OfCurve, TColGeom2d_HSequenceOfBoundedCurve, TColGeom2d_HSequenceOfCurve, TColGeom_HArray1OfBSplineCurve, TColGeom_HArray1OfBezierCurve, TColGeom_HArray1OfCurve, TColGeom_HArray1OfSurface, TColGeom_HArray2OfSurface, TColGeom_HSequenceOfBoundedCurve, TColGeom_HSequenceOfCurve, TColQuantity_HArray1OfLength, TColQuantity_HArray2OfLength, TColStd_HArray1OfAsciiString, TColStd_HArray1OfBoolean, TColStd_HArray1OfByte, TColStd_HArray1OfCharacter, TColStd_HArray1OfExtendedString, TColStd_HArray1OfInteger, TColStd_HArray1OfListOfInteger, TColStd_HArray1OfReal, TColStd_HArray1OfTransient, TColStd_HArray2OfBoolean, TColStd_HArray2OfCharacter, TColStd_HArray2OfInteger, TColStd_HArray2OfReal, TColStd_HArray2OfTransient, TColStd_HPackedMapOfInteger, TColStd_HSequenceOfAsciiString, TColStd_HSequenceOfExtendedString, TColStd_HSequenceOfHAsciiString, TColStd_HSequenceOfHExtendedString, TColStd_HSequenceOfInteger, TColStd_HSequenceOfReal, TColStd_HSequenceOfTransient, TColgp_HArray1OfCirc2d, TColgp_HArray1OfDir, TColgp_HArray1OfDir2d, TColgp_HArray1OfLin2d, TColgp_HArray1OfPnt, TColgp_HArray1OfPnt2d, TColgp_HArray1OfVec, TColgp_HArray1OfVec2d, TColgp_HArray1OfXY, TColgp_HArray1OfXYZ, TColgp_HArray2OfCirc2d, TColgp_HArray2OfDir, TColgp_HArray2OfDir2d, TColgp_HArray2OfLin2d, TColgp_HArray2OfPnt, TColgp_HArray2OfPnt2d, TColgp_HArray2OfVec, TColgp_HArray2OfVec2d, TColgp_HArray2OfXY, TColgp_HArray2OfXYZ, TColgp_HSequenceOfDir, TColgp_HSequenceOfDir2d, TColgp_HSequenceOfPnt, TColgp_HSequenceOfPnt2d, TColgp_HSequenceOfVec, TColgp_HSequenceOfVec2d, TColgp_HSequenceOfXY, TColgp_HSequenceOfXYZ, TCollection_HAsciiString, TCollection_HExtendedString, TCollection_MapNode, TCollection_SeqNode, TDF_Attribute, TDF_AttributeDelta, TDF_Data, TDF_DataSet, TDF_DefaultDeltaOnModification, TDF_DefaultDeltaOnRemoval, TDF_Delta, TDF_DeltaOnAddition, TDF_DeltaOnForget, TDF_DeltaOnModification, TDF_DeltaOnRemoval, TDF_DeltaOnResume, TDF_HAttributeArray1, TDF_Reference, TDF_RelocationTable, TDF_TagSource, TDataStd_AsciiString, TDataStd_BooleanArray, TDataStd_BooleanList, TDataStd_ByteArray, TDataStd_Comment, TDataStd_Current, TDataStd_DeltaOnModificationOfByteArray, TDataStd_DeltaOnModificationOfExtStringArray, TDataStd_DeltaOnModificationOfIntArray, TDataStd_DeltaOnModificationOfIntPackedMap, TDataStd_DeltaOnModificationOfRealArray, TDataStd_Directory, TDataStd_Expression, TDataStd_ExtStringArray, TDataStd_ExtStringList, TDataStd_HDataMapOfStringByte, TDataStd_HDataMapOfStringHArray1OfInteger, TDataStd_HDataMapOfStringHArray1OfReal, TDataStd_HDataMapOfStringInteger, TDataStd_HDataMapOfStringReal, TDataStd_HDataMapOfStringString, TDataStd_HLabelArray1, TDataStd_IntPackedMap, TDataStd_Integer, TDataStd_IntegerArray, TDataStd_IntegerList, TDataStd_Name, TDataStd_NamedData, TDataStd_NoteBook, TDataStd_Real, TDataStd_RealArray, TDataStd_RealList, TDataStd_ReferenceArray, TDataStd_ReferenceList, TDataStd_Relation, TDataStd_Tick, TDataStd_TreeNode, TDataStd_UAttribute, TDataStd_Variable, TDataXtd_Axis, TDataXtd_Constraint, TDataXtd_Geometry, TDataXtd_HArray1OfTrsf, TDataXtd_Pattern, TDataXtd_PatternStd, TDataXtd_Placement, TDataXtd_Plane, TDataXtd_Point, TDataXtd_Position, TDataXtd_Presentation, TDataXtd_Shape, TDataXtd_Triangulation, TDocStd_Application, TDocStd_ApplicationDelta, TDocStd_CompoundDelta, TDocStd_Document, TDocStd_Modified, TDocStd_MultiTransactionManager, TDocStd_Owner, TDocStd_XLink, TDocStd_XLinkRoot, TFunction_Driver, TFunction_DriverTable, TFunction_Function, TFunction_GraphNode, TFunction_HArray1OfDataMapOfGUIDDriver, TFunction_Logbook, TFunction_Scope, TNaming_DeltaOnModification, TNaming_DeltaOnRemoval, TNaming_NamedShape, TNaming_Naming, TNaming_TranslateTool, TNaming_UsedShapes, TObj_Application, TObj_CheckModel, TObj_HSequenceOfObject, TObj_HiddenPartition, TObj_LabelIterator, TObj_Model, TObj_ModelIterator, TObj_Object, TObj_ObjectIterator, TObj_OcafObjectIterator, TObj_Partition, TObj_ReferenceIterator, TObj_SequenceIterator, TObj_TIntSparseArray, TObj_TModel, TObj_TNameContainer, TObj_TObject, TObj_TReference, TObj_TXYZ, TPrsStd_AISPresentation, TPrsStd_AISViewer, TPrsStd_AxisDriver, TPrsStd_ConstraintDriver, TPrsStd_Driver, TPrsStd_DriverTable, TPrsStd_GeometryDriver, TPrsStd_NamedShapeDriver, TPrsStd_PlaneDriver, TPrsStd_PointDriver, TShort_HArray1OfShortReal, TShort_HArray2OfShortReal, TShort_HSequenceOfShortReal, TopLoc_Datum3D, TopLoc_SListNodeOfItemLocation, TopOpeBRepBuild_HBuilder, TopOpeBRepBuild_Loop, TopOpeBRepBuild_Pave, TopOpeBRepDS_Association, TopOpeBRepDS_Check, TopOpeBRepDS_CurvePointInterference, TopOpeBRepDS_EdgeVertexInterference, TopOpeBRepDS_FaceEdgeInterference, TopOpeBRepDS_GapTool, TopOpeBRepDS_HArray1OfDataMapOfIntegerListOfInterference, TopOpeBRepDS_HDataStructure, TopOpeBRepDS_Interference, TopOpeBRepDS_Marker, TopOpeBRepDS_ShapeShapeInterference, TopOpeBRepDS_SolidSurfaceInterference, TopOpeBRepDS_SurfaceCurveInterference, TopOpeBRepTool_HBoxTool, TopOpeBRep_FFDumper, TopOpeBRep_HArray1OfLineInter, TopOpeBRep_HArray1OfVPointInter, TopOpeBRep_Hctxee2d, TopOpeBRep_Hctxff2d, TopTools_HArray1OfListOfShape, TopTools_HArray1OfShape, TopTools_HArray2OfShape, TopTools_HSequenceOfShape, TopoDS_FrozenShape, TopoDS_HShape, TopoDS_LockedShape, TopoDS_TCompSolid, TopoDS_TCompound, TopoDS_TEdge, TopoDS_TFace, TopoDS_TShape, TopoDS_TShell, TopoDS_TSolid, TopoDS_TVertex, TopoDS_TWire, TopoDS_UnCompatibleShapes, TransferBRep_BinderOfShape, TransferBRep_HSequenceOfTransferResultInfo, TransferBRep_OrientedShapeMapper, TransferBRep_ShapeBinder, TransferBRep_ShapeListBinder, TransferBRep_ShapeMapper, TransferBRep_TransferResultInfo, Transfer_ActorDispatch, Transfer_ActorOfFinderProcess, Transfer_ActorOfProcessForFinder, Transfer_ActorOfProcessForTransient, Transfer_ActorOfTransientProcess, Transfer_Binder, Transfer_BinderOfTransientInteger, Transfer_DispatchControl, Transfer_Finder, Transfer_FinderProcess, Transfer_HSequenceOfBinder, Transfer_HSequenceOfFinder, Transfer_MapContainer, Transfer_MultipleBinder, Transfer_ProcessForFinder, Transfer_ProcessForTransient, Transfer_ResultFromModel, Transfer_ResultFromTransient, Transfer_SimpleBinderOfTransient, Transfer_TransferDeadLoop, Transfer_TransferFailure, Transfer_TransientListBinder, Transfer_TransientMapper, Transfer_TransientProcess, Transfer_VoidBinder, Units_Dimensions, Units_Lexicon, Units_NoSuchType, Units_NoSuchUnit, Units_QuantitiesSequence, Units_Quantity, Units_ShiftedToken, Units_ShiftedUnit, Units_Token, Units_TokensSequence, Units_Unit, Units_UnitsDictionary, Units_UnitsLexicon, Units_UnitsSequence, Units_UnitsSystem, V3d_AmbientLight, V3d_BadValue, V3d_CircularGrid, V3d_DirectionalLight, V3d_Plane, V3d_PositionLight, V3d_PositionalLight, V3d_RectangularGrid, V3d_SpotLight, V3d_Trihedron, V3d_UnMapped, V3d_View, V3d_Viewer, ViewerTest_EventManager, VrmlConverter_Drawer, VrmlConverter_IsoAspect, VrmlConverter_LineAspect, VrmlConverter_PointAspect, VrmlConverter_Projector, VrmlConverter_ShadingAspect, VrmlData_Appearance, VrmlData_ArrayVec3d, VrmlData_Box, VrmlData_Color, VrmlData_Cone, VrmlData_Coordinate, VrmlData_Cylinder, VrmlData_Faceted, VrmlData_Geometry, VrmlData_Group, VrmlData_ImageTexture, VrmlData_IndexedFaceSet, VrmlData_IndexedLineSet, VrmlData_Material, VrmlData_Node, VrmlData_Normal, VrmlData_ShapeNode, VrmlData_Sphere, VrmlData_Texture, VrmlData_TextureCoordinate, VrmlData_TextureTransform, VrmlData_UnknownNode, VrmlData_WorldInfo, Vrml_AsciiText, Vrml_Coordinate3, Vrml_IndexedFaceSet, Vrml_IndexedLineSet, Vrml_LOD, Vrml_Material, Vrml_Normal, Vrml_SFImage, Vrml_TextureCoordinate2, WNT_ClassDefinitionError, XCAFApp_Application, XCAFDimTolObjects_DatumObject, XCAFDimTolObjects_DimensionObject, XCAFDimTolObjects_GeomToleranceObject, XCAFDoc_Area, XCAFDoc_AssemblyItemRef, XCAFDoc_Centroid, XCAFDoc_ClippingPlaneTool, XCAFDoc_Color, XCAFDoc_ColorTool, XCAFDoc_Datum, XCAFDoc_DimTol, XCAFDoc_DimTolTool, XCAFDoc_Dimension, XCAFDoc_DocumentTool, XCAFDoc_GeomTolerance, XCAFDoc_GraphNode, XCAFDoc_LayerTool, XCAFDoc_Location, XCAFDoc_Material, XCAFDoc_MaterialTool, XCAFDoc_Note, XCAFDoc_NoteBalloon, XCAFDoc_NoteBinData, XCAFDoc_NoteComment, XCAFDoc_NotesTool, XCAFDoc_ShapeMapTool, XCAFDoc_ShapeTool, XCAFDoc_View, XCAFDoc_ViewTool, XCAFDoc_Volume, XCAFNoteObjects_NoteObject, XCAFPrs_AISObject, XCAFPrs_Driver, XCAFView_Object, XSAlgo_AlgoContainer, XSAlgo_ToolContainer, XSControl_ConnectedShapes, XSControl_Controller, XSControl_SelectForTransfer, XSControl_SignTransferStatus, XSControl_TransferReader, XSControl_TransferWriter, XSControl_Vars, XSControl_WorkSession, XSDRAWSTLVRML_DataSource, XSDRAWSTLVRML_DataSource3D, XSDRAWSTLVRML_DrawableMesh, XSDRAW_Vars, XmlDrivers_DocumentRetrievalDriver, XmlDrivers_DocumentStorageDriver, XmlLDrivers_DocumentRetrievalDriver, XmlLDrivers_DocumentStorageDriver, XmlMDF_ADriver, XmlMDF_ADriverTable, XmlMDF_ReferenceDriver, XmlMDF_TagSourceDriver, XmlMDataStd_AsciiStringDriver, XmlMDataStd_BooleanArrayDriver, XmlMDataStd_BooleanListDriver, XmlMDataStd_ByteArrayDriver, XmlMDataStd_CommentDriver, XmlMDataStd_DirectoryDriver, XmlMDataStd_ExpressionDriver, XmlMDataStd_ExtStringArrayDriver, XmlMDataStd_ExtStringListDriver, XmlMDataStd_IntPackedMapDriver, XmlMDataStd_IntegerArrayDriver, XmlMDataStd_IntegerDriver, XmlMDataStd_IntegerListDriver, XmlMDataStd_NameDriver, XmlMDataStd_NamedDataDriver, XmlMDataStd_NoteBookDriver, XmlMDataStd_RealArrayDriver, XmlMDataStd_RealDriver, XmlMDataStd_RealListDriver, XmlMDataStd_ReferenceArrayDriver, XmlMDataStd_ReferenceListDriver, XmlMDataStd_RelationDriver, XmlMDataStd_TickDriver, XmlMDataStd_TreeNodeDriver, XmlMDataStd_UAttributeDriver, XmlMDataStd_VariableDriver, XmlMDataXtd_AxisDriver, XmlMDataXtd_ConstraintDriver, XmlMDataXtd_GeometryDriver, XmlMDataXtd_PatternStdDriver, XmlMDataXtd_PlacementDriver, XmlMDataXtd_PlaneDriver, XmlMDataXtd_PointDriver, XmlMDataXtd_PositionDriver, XmlMDataXtd_PresentationDriver, XmlMDataXtd_ShapeDriver, XmlMDataXtd_TriangulationDriver, XmlMDocStd_XLinkDriver, XmlMFunction_FunctionDriver, XmlMFunction_GraphNodeDriver, XmlMFunction_ScopeDriver, XmlMNaming_NamedShapeDriver, XmlMNaming_NamingDriver, XmlMXCAFDoc_AreaDriver, XmlMXCAFDoc_AssemblyItemRefDriver, XmlMXCAFDoc_CentroidDriver, XmlMXCAFDoc_ClippingPlaneToolDriver, XmlMXCAFDoc_ColorDriver, XmlMXCAFDoc_ColorToolDriver, XmlMXCAFDoc_DatumDriver, XmlMXCAFDoc_DimTolDriver, XmlMXCAFDoc_DimTolToolDriver, XmlMXCAFDoc_DocumentToolDriver, XmlMXCAFDoc_GraphNodeDriver, XmlMXCAFDoc_LayerToolDriver, XmlMXCAFDoc_LocationDriver, XmlMXCAFDoc_MaterialDriver, XmlMXCAFDoc_MaterialToolDriver, XmlMXCAFDoc_NoteBalloonDriver, XmlMXCAFDoc_NoteBinDataDriver, XmlMXCAFDoc_NoteCommentDriver, XmlMXCAFDoc_NoteDriver, XmlMXCAFDoc_NotesToolDriver, XmlMXCAFDoc_ShapeToolDriver, XmlMXCAFDoc_ViewToolDriver, XmlMXCAFDoc_VolumeDriver, XmlTObjDrivers_DocumentRetrievalDriver, XmlTObjDrivers_DocumentStorageDriver, XmlTObjDrivers_IntSparseArrayDriver, XmlTObjDrivers_ModelDriver, XmlTObjDrivers_ObjectDriver, XmlTObjDrivers_ReferenceDriver, XmlTObjDrivers_XYZDriver, XmlXCAFDrivers_DocumentRetrievalDriver, XmlXCAFDrivers_DocumentStorageDriver, Xw_Window, gp_VectorWithNullMagnitude, math_NotSquare, math_SingularMatrix

