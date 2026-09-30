/**
  Copyright (C) 2012-2017 by Autodesk, Inc.
  All rights reserved.

  Siemens SINUMERIK 840D post processor configuration.

  $Revision: 41645 22af0e94889f7e5ba049699ec40c6cd9bdb6c3e2 $
  $Date: 2017-10-17 18:20:54 $
  
  FORKID {75AF44EA-0A42-4803-8DE7-43BF08B352B3}
*/

description = "1520 - SIEMENS 840D";
vendor = "Siemens";
vendorUrl = "http://www.siemens.com";
legal = "Copyright (C) 2012-2017 by Autodesk, Inc.";
certificationLevel = 2;
minimumRevision = 24000;

longDescription = "Generic post for Siemens 840D. Note that the post will use D1 always for the tool length compensation as this is how most users work.";

extension = "mpf";
setCodePage("ascii");

capabilities = CAPABILITY_MILLING;
tolerance = spatial(0.002, MM);

minimumChordLength = spatial(0.01, MM);
minimumCircularRadius = spatial(0.01, MM);
maximumCircularRadius = spatial(1000, MM);
minimumCircularSweep = toRad(0.01);
var useArcTurn = true;
maximumCircularSweep = toRad(useArcTurn ? (999 * 360) : 90); // max revolutions
allowHelicalMoves = false;
allowedCircularPlanes = undefined; // allow any circular motion



// user-defined properties
properties = {
  writeMachine: true, // write machine
  writeTools: true, // writes the tools
  preloadTool: true, // preloads next tool on tool change if any
  showSequenceNumbers: false, // show sequence numbers
  sequenceNumberStart: 10, // first sequence number
  sequenceNumberIncrement: 1, // increment for sequence numbers
  optionalStop: true, // optional stop
  useShortestDirection: true, // specifies that shortest angular direction should be used
  useParametricFeed: false, // specifies that feed should be output using Q values
  showNotes: false, // specifies that operation notes should be output.
  useCIP: true, // enable to use the CIP command
  useCycle832: false, // enable to use CYCLE832
  toolAsName: false // specifies if the tool should be called with a number or with the tool description
};

// user-defined property definitions
propertyDefinitions = {
  writeMachine: {title:"Write machine", description:"Output the machine settings in the header of the code.", group:0, type:"boolean"},
  writeTools: {title:"Write tool list", description:"Output a tool list in the header of the code.", group:0, type:"boolean"},
  preloadTool: {title:"Preload tool", description:"Preloads the next tool at a tool change (if any).", type:"boolean"},
  showSequenceNumbers: {title:"Use sequence numbers", description:"Use sequence numbers for each block of outputted code.", group:1, type:"boolean"},
  sequenceNumberStart: {title:"Start sequence number", description:"The number at which to start the sequence numbers.", group:1, type:"integer"},
  sequenceNumberIncrement: {title:"Sequence number increment", description:"The amount by which the sequence number is incremented by in each block.", group:1, type:"integer"},
  optionalStop: {title:"Optional stop", description:"Outputs optional stop code during when necessary in the code.", type:"boolean"},
  useShortestDirection: {title:"Use shortest direction", description:"Specifies that the shortest angular direction should be used.", type:"boolean"},
  useParametricFeed:  {title:"Parametric feed", description:"Specifies the feed value that should be output using a Q value.", type:"boolean"},
  showNotes: {title:"Show notes", description:"Writes operation notes as comments in the outputted code.", type:"boolean"},
  useCIP: {title:"Use CIP", description:"Enable to use the CIP command.", type:"boolean"},
  useCycle832: {title:"Use CYCLE832", description:"Enable to use CYCLE832.", type:"boolean"},
  toolAsName: {title:"Tool as name", description:"If enabled, the tool will be called with the tool description rather than the tool number.", type:"boolean"}
};

var gFormat = createFormat({prefix:"G", decimals:0});
var mFormat = createFormat({prefix:"M", decimals:0});
var hFormat = createFormat({prefix:"H", decimals:0});
var dFormat = createFormat({prefix:"D", decimals:0});
var nFormat = createFormat({prefix:"N", decimals:0});


var xyzFormat = createFormat({decimals:(unit == MM ? 3 : 4)});
var abcFormat = createFormat({decimals:3, scale:DEG});
var abcDirectFormat = createFormat({decimals:3, scale:DEG, prefix:"=DC(", suffix:")"});
var abc3Format = createFormat({decimals:6});
var feedFormat = createFormat({decimals:(unit == MM ? 1 : 2)});
var toolFormat = createFormat({decimals:0});
var toolProbeFormat = createFormat({decimals:0, zeropad:true, width:3});
var rpmFormat = createFormat({decimals:0});
var secFormat = createFormat({decimals:3});
var taperFormat = createFormat({decimals:1, scale:DEG});
var arFormat = createFormat({decimals:3, scale:DEG});

var xOutput = createVariable({prefix:"X"}, xyzFormat);
var yOutput = createVariable({prefix:"Y"}, xyzFormat);
var zOutput = createVariable({prefix:"Z"}, xyzFormat);
var a3Output = createVariable({prefix:"A3=", force:false}, abc3Format);
var b3Output = createVariable({prefix:"B3=", force:false}, abc3Format);
var c3Output = createVariable({prefix:"C3=", force:false}, abc3Format);
var aOutput = createVariable({prefix:"A"}, abcFormat);
var bOutput = createVariable({prefix:"B"}, abcFormat);
var cOutput = createVariable({prefix:"C"}, abcFormat);
var feedOutput = createVariable({prefix:"F"}, feedFormat);
var sOutput = createVariable({prefix:"S"}, rpmFormat);
var dOutput = createVariable({}, dFormat);

// circular output
var iOutput = createReferenceVariable({prefix:"I", force:true}, xyzFormat);
var jOutput = createReferenceVariable({prefix:"J", force:true}, xyzFormat);
var kOutput = createReferenceVariable({prefix:"K", force:true}, xyzFormat);

var gMotionModal = createModal({force:true}, gFormat); // modal group 1 // G0-G3, ...
var gPlaneModal = createModal({onchange:function () {gMotionModal.reset();}}, gFormat); // modal group 2 // G17-19
var gAbsIncModal = createModal({}, gFormat); // modal group 3 // G90-91
var gFeedModeModal = createModal({}, gFormat); // modal group 5 // G94-95
var gUnitModal = createModal({}, gFormat); // modal group 6 // G70-71

// fixed settings
var firstFeedParameter = 1;

var WARNING_WORK_OFFSET = 0;
var WARNING_LENGTH_OFFSET = 1;
var WARNING_DIAMETER_OFFSET = 2;

// collected state
var sequenceNumber;
var currentWorkOffset;
var forceSpindleSpeed = true;
var activeMovements; // do not use by default
var currentFeedId;



/**
  Writes the specified block.
*/
function writeBlock() {
  if (properties.showSequenceNumbers) {
    writeWords2("N" + sequenceNumber, arguments);
    sequenceNumber += properties.sequenceNumberIncrement;
  } else {
    writeWords(arguments);
  }
}

function formatComment(text) {
  return "; " + String(text);
}

/**
  Output a comment.
*/
function writeComment(text) {
  if (properties.showSequenceNumbers) {
    writeWords2("N" + sequenceNumber, formatComment(text));
    sequenceNumber += properties.sequenceNumberIncrement;
  } else {
    writeWords(formatComment(text));
  }
}

function onOpen() {

  if (true) {
    //var aAxis = createAxis({coordinate:0, table:true, axis:[1, 0, 0], range:[-120.0001, 120.0001], preference:-1});
    var bAxis = createAxis({coordinate:1, table:true, axis:[0, 1, 0], range:[-90.0001, 90.0001], preference:1});
    var cAxis = createAxis({coordinate:2, table:true, axis:[0, 0, 1], range:[0, 360], preference:1, cyclic:true});
    machineConfiguration = new MachineConfiguration(bAxis, cAxis);

    setMachineConfiguration(machineConfiguration);
    optimizeMachineAngles2(1);
  }

  if (properties.useShortestDirection) {
    // abcFormat and abcDirectFormat must be compatible except for =DC()
    if (machineConfiguration.isMachineCoordinate(0)) {
      if (machineConfiguration.getAxisByCoordinate(0).isCyclic() || isSameDirection(machineConfiguration.getAxisByCoordinate(0).getAxis(), machineConfiguration.getSpindleAxis())) {
        aOutput = createVariable({prefix:"A"}, abcDirectFormat);
      }
    }
    if (machineConfiguration.isMachineCoordinate(1)) {
      if (machineConfiguration.getAxisByCoordinate(1).isCyclic() || isSameDirection(machineConfiguration.getAxisByCoordinate(1).getAxis(), machineConfiguration.getSpindleAxis())) {
        bOutput = createVariable({prefix:"B"}, abcDirectFormat);
      }
    }
    if (machineConfiguration.isMachineCoordinate(2)) {
      if (machineConfiguration.getAxisByCoordinate(2).isCyclic() || isSameDirection(machineConfiguration.getAxisByCoordinate(2).getAxis(), machineConfiguration.getSpindleAxis())) {
        cOutput = createVariable({prefix:"C"}, abcDirectFormat);
      }
    }
  }

  if (!machineConfiguration.isMachineCoordinate(0)) {
    aOutput.disable();
  }
  if (!machineConfiguration.isMachineCoordinate(1)) {
    bOutput.disable();
  }
  if (!machineConfiguration.isMachineCoordinate(2)) {
    cOutput.disable();
  }

  sequenceNumber = properties.sequenceNumberStart;
  // if (!((programName.length >= 2) && (isAlpha(programName[0]) || (programName[0] == "_")) && isAlpha(programName[1]))) {
  //   error(localize("Program name must begin with 2 letters."));
  // }
  writeln("; %_N_" + translateText(String(programName).toUpperCase(), " ", "_") + "_MPF");
  
  if (programComment) {
    writeComment(programComment);
  }

  // dump machine configuration
  var vendor = machineConfiguration.getVendor();
  var model = machineConfiguration.getModel();
  var description = machineConfiguration.getDescription();

  if (properties.writeMachine && (vendor || model || description)) {
    writeComment(localize("Machine"));
    if (vendor) {
      writeComment("  " + localize("vendor") + ": " + vendor);
    }
    if (model) {
      writeComment("  " + localize("model") + ": " + model);
    }
    if (description) {
      writeComment("  " + localize("description") + ": "  + description);
    }
  }

  // dump tool information
  if (properties.writeTools) {
    var zRanges = {};
    if (is3D()) {
      var numberOfSections = getNumberOfSections();
      for (var i = 0; i < numberOfSections; ++i) {
        var section = getSection(i);
        var zRange = section.getGlobalZRange();
        var tool = section.getTool();
        if (zRanges[tool.number]) {
          zRanges[tool.number].expandToRange(zRange);
        } else {
          zRanges[tool.number] = zRange;
        }
      }
    }

    var tools = getToolTable();
    if (tools.getNumberOfTools() > 0) {
      for (var i = 0; i < tools.getNumberOfTools(); ++i) {
        var tool = tools.getTool(i);
        var comment = "T" + (properties.toolAsName ? "="  + "\"" + (tool.description.toUpperCase()) + "\"" : toolFormat.format(tool.number)) + " " +
          "D=" + xyzFormat.format(tool.diameter) + " " +
          localize("CR") + "=" + xyzFormat.format(tool.cornerRadius);
        if ((tool.taperAngle > 0) && (tool.taperAngle < Math.PI)) {
          comment += " " + localize("TAPER") + "=" + taperFormat.format(tool.taperAngle) + localize("deg");
        }
        if (zRanges[tool.number]) {
          comment += " - " + localize("ZMIN") + "=" + xyzFormat.format(zRanges[tool.number].getMinimum());
        }
        comment += " - " + getToolTypeName(tool.type);
        writeComment(comment);
      }
    }
  }

  if (true) { // stock - workpiece
    var workpiece = getWorkpiece();
    var delta = Vector.diff(workpiece.upper, workpiece.lower);
    if (delta.isNonZero()) {
      writeBlock(
        "WORKPIECE" + "(" + "," + "\"" + "C" + "\""  + ",," + "\"" + "BOX" + "\""  + "," + "112" + "," + xyzFormat.format(workpiece.upper.z) + "," + xyzFormat.format(workpiece.lower.z) + "," + "80" +
        "," + xyzFormat.format(workpiece.upper.x) + "," + xyzFormat.format(workpiece.upper.y) + "," + xyzFormat.format(workpiece.lower.x) + "," + xyzFormat.format(workpiece.lower.y) + ")"
      );
    }
  }

  if ((getNumberOfSections() > 0) && (getSection(0).workOffset == 0)) {
    for (var i = 0; i < getNumberOfSections(); ++i) {
      if (getSection(i).workOffset > 0) {
        error(localize("Using multiple work offsets is not possible if the initial work offset is 0."));
        return;
      }
    }
  }

  // absolute coordinates and feed per min
  writeBlock(gAbsIncModal.format(90), gFeedModeModal.format(94));

  switch (unit) {
  case IN:
    writeBlock(gUnitModal.format(70)); // lengths
    //writeBlock(gFormat.format(700)); // feeds
    break;
  case MM:
    writeBlock(gUnitModal.format(71)); // lengths
    //writeBlock(gFormat.format(710)); // feeds
    break;
  }

  writeBlock(gFormat.format(64)); // continuous-path mode
  writeBlock(gPlaneModal.format(17));
}

function onComment(message) {
  writeComment(message);
}

/** Force output of X, Y, and Z. */
function forceXYZ() {
  xOutput.reset();
  yOutput.reset();
  zOutput.reset();
}

/** Force output of A, B, and C. */
function forceABC() {
  aOutput.reset();
  bOutput.reset();
  cOutput.reset();
}

function forceFeed() {
  currentFeedId = undefined;
  feedOutput.reset();
}

/** Force output of X, Y, Z, A, B, C, and F on next output. */
function forceAny() {
  forceXYZ();
  forceABC();
  forceFeed();
}

function setWCS() {
  var workOffset = currentSection.workOffset;
  if (workOffset == 0) {
    warningOnce(localize("Work offset has not been specified. Using G54 as WCS."), WARNING_WORK_OFFSET);
    workOffset = 1;
  }
  if (workOffset > 0) {
    if (workOffset > 4) {
      var code = 500 + workOffset - 4 + 4;
      if (code > 599) {
        error(localize("Work offset out of range."));
        return;
      }
      if (workOffset != currentWorkOffset) {
        writeBlock(gFormat.format(code));
        currentWorkOffset = workOffset;
      }
    } else {
      if (workOffset != currentWorkOffset) {
        writeBlock(gFormat.format(53 + workOffset)); // G54->G59
        currentWorkOffset = workOffset;
      }
    }
  }
}

function isProbeOperation() {
  return (hasParameter("operation-strategy") && getParameter("operation-strategy") == "probe");
}

function onParameter(name, value) {
}

function FeedContext(id, description, feed) {
  this.id = id;
  this.description = description;
  this.feed = feed;
}

function getFeed(f) {
  if (activeMovements) {
    var feedContext = activeMovements[movement];
    if (feedContext != undefined) {
      if (!feedFormat.areDifferent(feedContext.feed, f)) {
        if (feedContext.id == currentFeedId) {
          return ""; // nothing has changed
        }
        forceFeed();
        currentFeedId = feedContext.id;
        return "F=R" + (firstFeedParameter + feedContext.id);
      }
    }
    currentFeedId = undefined; // force Q feed next time
  }
  return feedOutput.format(f); // use feed value
}

function initializeActiveFeeds() {
  activeMovements = new Array();
  var movements = currentSection.getMovements();
  
  var id = 0;
  var activeFeeds = new Array();
  if (hasParameter("operation:tool_feedCutting")) {
    if (movements & ((1 << MOVEMENT_CUTTING) | (1 << MOVEMENT_LINK_TRANSITION) | (1 << MOVEMENT_EXTENDED))) {
      var feedContext = new FeedContext(id, localize("Cutting"), getParameter("operation:tool_feedCutting"));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_CUTTING] = feedContext;
      activeMovements[MOVEMENT_LINK_TRANSITION] = feedContext;
      activeMovements[MOVEMENT_EXTENDED] = feedContext;
    }
    ++id;
    if (movements & (1 << MOVEMENT_PREDRILL)) {
      feedContext = new FeedContext(id, localize("Predrilling"), getParameter("operation:tool_feedCutting"));
      activeMovements[MOVEMENT_PREDRILL] = feedContext;
      activeFeeds.push(feedContext);
    }
    ++id;
  }
  
  if (hasParameter("operation:finishFeedrate")) {
    if (movements & (1 << MOVEMENT_FINISH_CUTTING)) {
      var feedContext = new FeedContext(id, localize("Finish"), getParameter("operation:finishFeedrate"));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_FINISH_CUTTING] = feedContext;
    }
    ++id;
  } else if (hasParameter("operation:tool_feedCutting")) {
    if (movements & (1 << MOVEMENT_FINISH_CUTTING)) {
      var feedContext = new FeedContext(id, localize("Finish"), getParameter("operation:tool_feedCutting"));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_FINISH_CUTTING] = feedContext;
    }
    ++id;
  }
  
  if (hasParameter("operation:tool_feedEntry")) {
    if (movements & (1 << MOVEMENT_LEAD_IN)) {
      var feedContext = new FeedContext(id, localize("Entry"), getParameter("operation:tool_feedEntry"));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_LEAD_IN] = feedContext;
    }
    ++id;
  }

  if (hasParameter("operation:tool_feedExit")) {
    if (movements & (1 << MOVEMENT_LEAD_OUT)) {
      var feedContext = new FeedContext(id, localize("Exit"), getParameter("operation:tool_feedExit"));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_LEAD_OUT] = feedContext;
    }
    ++id;
  }

  if (hasParameter("operation:noEngagementFeedrate")) {
    if (movements & (1 << MOVEMENT_LINK_DIRECT)) {
      var feedContext = new FeedContext(id, localize("Direct"), getParameter("operation:noEngagementFeedrate"));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_LINK_DIRECT] = feedContext;
    }
    ++id;
  } else if (hasParameter("operation:tool_feedCutting") &&
             hasParameter("operation:tool_feedEntry") &&
             hasParameter("operation:tool_feedExit")) {
    if (movements & (1 << MOVEMENT_LINK_DIRECT)) {
      var feedContext = new FeedContext(id, localize("Direct"), Math.max(getParameter("operation:tool_feedCutting"), getParameter("operation:tool_feedEntry"), getParameter("operation:tool_feedExit")));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_LINK_DIRECT] = feedContext;
    }
    ++id;
  }
  
  if (hasParameter("operation:reducedFeedrate")) {
    if (movements & (1 << MOVEMENT_REDUCED)) {
      var feedContext = new FeedContext(id, localize("Reduced"), getParameter("operation:reducedFeedrate"));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_REDUCED] = feedContext;
    }
    ++id;
  }

  if (hasParameter("operation:tool_feedRamp")) {
    if (movements & ((1 << MOVEMENT_RAMP) | (1 << MOVEMENT_RAMP_HELIX) | (1 << MOVEMENT_RAMP_PROFILE) | (1 << MOVEMENT_RAMP_ZIG_ZAG))) {
      var feedContext = new FeedContext(id, localize("Ramping"), getParameter("operation:tool_feedRamp"));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_RAMP] = feedContext;
      activeMovements[MOVEMENT_RAMP_HELIX] = feedContext;
      activeMovements[MOVEMENT_RAMP_PROFILE] = feedContext;
      activeMovements[MOVEMENT_RAMP_ZIG_ZAG] = feedContext;
    }
    ++id;
  }
  if (hasParameter("operation:tool_feedPlunge")) {
    if (movements & (1 << MOVEMENT_PLUNGE)) {
      var feedContext = new FeedContext(id, localize("Plunge"), getParameter("operation:tool_feedPlunge"));
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_PLUNGE] = feedContext;
    }
    ++id;
  }
  if (true) { // high feed
    if (movements & (1 << MOVEMENT_HIGH_FEED)) {
      var feedContext = new FeedContext(id, localize("High Feed"), this.highFeedrate);
      activeFeeds.push(feedContext);
      activeMovements[MOVEMENT_HIGH_FEED] = feedContext;
    }
    ++id;
  }
  
  for (var i = 0; i < activeFeeds.length; ++i) {
    var feedContext = activeFeeds[i];
    writeBlock("R" + (firstFeedParameter + feedContext.id) + "=" + feedFormat.format(feedContext.feed), formatComment(feedContext.description));
  }
}

var currentWorkPlaneABC = undefined;
var currentWorkPlaneABCTurned = false;

function forceWorkPlane() {
  currentWorkPlaneABC = undefined;
}

function setWorkPlane(abc, turn) {
  writeBlock(gMotionModal.format(0), "SUPA", "Z600", "D0"); // retract
  writeBlock("X-430");//retract to X-430
  writeBlock("D1");
  
  if (is3D() && !machineConfiguration.isMultiAxisConfiguration()) {
    return; // ignore
  }

  if (!((currentWorkPlaneABC == undefined) ||
        abcFormat.areDifferent(abc.x, currentWorkPlaneABC.x) ||
        abcFormat.areDifferent(abc.y, currentWorkPlaneABC.y) ||
        abcFormat.areDifferent(abc.z, currentWorkPlaneABC.z) ||
        (!currentWorkPlaneABCTurned && turn))) {
    return; // no change
  }
  currentWorkPlaneABC = abc;
  currentWorkPlaneABCTurned = turn;

  if (turn) {
    onCommand(COMMAND_UNLOCK_MULTI_AXIS);
  }
  // var abc = currentSection.getInitialToolAxisABC(); Pour test Cycle800
  var FR = 1; // 0 = without moving to safety plane, 1 = move to safety plane only in Z, 2 = move to safety plane Z,X,Y
  var TC = "TABLE";
  var ST = 0;
  var MODE = 27;
  var X0 = 0;
  var Y0 = 0;
  var Z0 = 0;
  var A = abc.x;
  var B = abc.y;
  var C = abc.z;
  var X1 = 0;
  var Y1 = 0;
  var Z1 = 0;
  var DIR = turn ? 1 : 0; // direction
      
  writeBlock(
    "CYCLE800(" +
    FR + "," +
    "\"" + TC + "\"," +
    ST + "," +
    MODE + "," +
    xyzFormat.format(X0) + "," +
    xyzFormat.format(Y0) + "," +
    xyzFormat.format(Z0) + "," +
    abcFormat.format(C) + "," +
    abcFormat.format(B) + "," +
    abcFormat.format(A) + "," +
    xyzFormat.format(X1) + "," +
    xyzFormat.format(Y1) + "," +
    xyzFormat.format(Z1) + "," +
    DIR + "," +	"," + "1" + ")"
  );
  forceABC();
  forceXYZ();
  
  if (turn) {
    //if (!currentSection.isMultiAxis()) {
      onCommand(COMMAND_LOCK_MULTI_AXIS);
    //}
  }
}

var closestABC = false; // choose closest machine angles
var currentMachineABC;

function getWorkPlaneMachineABC(workPlane) {
  var W = workPlane; // map to global frame

  var abc = machineConfiguration.getABC(W);
  if (closestABC) {
    if (currentMachineABC) {
      abc = machineConfiguration.remapToABC(abc, currentMachineABC);
    } else {
      abc = machineConfiguration.getPreferredABC(abc);
    }
  } else {
    abc = machineConfiguration.getPreferredABC(abc);
  }
  
  try {
    abc = machineConfiguration.remapABC(abc);
    currentMachineABC = abc;
  } catch (e) {
    error(
      localize("Machine angles not supported") + ":"
      + conditional(machineConfiguration.isMachineCoordinate(0), " A" + abcFormat.format(abc.x))
      + conditional(machineConfiguration.isMachineCoordinate(1), " B" + abcFormat.format(abc.y))
      + conditional(machineConfiguration.isMachineCoordinate(2), " C" + abcFormat.format(abc.z))
    );
  }
  
  var direction = machineConfiguration.getDirection(abc);
  if (!isSameDirection(direction, W.forward)) {
    error(localize("Orientation not supported."));
  }
  
  if (!machineConfiguration.isABCSupported(abc)) {
    error(
      localize("Work plane is not supported") + ":"
      + conditional(machineConfiguration.isMachineCoordinate(0), " A" + abcFormat.format(abc.x))
      + conditional(machineConfiguration.isMachineCoordinate(1), " B" + abcFormat.format(abc.y))
      + conditional(machineConfiguration.isMachineCoordinate(2), " C" + abcFormat.format(abc.z))
    );
  }

  var tcp = false;
  if (tcp) {
    setRotation(W); // TCP mode
  } else {
    var O = machineConfiguration.getOrientation(abc);
    var R = machineConfiguration.getRemainingOrientation(abc, W);
    setRotation(R);
  }
  
  return abc;
}

function onSection() {
  if (properties.toolAsName && !tool.description) {
    if (hasParameter("operation-comment")) {
      error(localize("Tool description is empty in operation " + "\"" + (getParameter("operation-comment").toUpperCase()) + "\""));
    } else {
      error(localize("Tool description is empty."));
    }
    return;
  }
  var insertToolCall = isFirstSection() ||
    currentSection.getForceToolChange && currentSection.getForceToolChange() ||
    (tool.number != getPreviousSection().getTool().number) ||
    conditional(properties.toolAsName, tool.description != getPreviousSection().getTool().description);

  var retracted = false; // specifies that the tool has been retracted to the safe plane
  var newWorkOffset = isFirstSection() ||
    (getPreviousSection().workOffset != currentSection.workOffset); // work offset changes
  var newWorkPlane = isFirstSection() ||
    !isSameDirection(getPreviousSection().getGlobalFinalToolAxis(), currentSection.getGlobalInitialToolAxis());
  if (insertToolCall || newWorkOffset || newWorkPlane) {
    
    // retract to safe plane
    retracted = true;
    //writeBlock(gMotionModal.format(0), "SUPA", "Z" + machineConfiguration.getRetractPlane(), "D0"); // retract
    writeBlock(gMotionModal.format(0), "SUPA", "Z600", "D0"); // retract
	//writeBlock(gMotionModal.format(5));
	//writeBlock("X-430");//retract to X-430
	zOutput.reset();
    
    if (newWorkPlane) {
      setWorkPlane(new Vector(0, 0, 0), false); // reset working plane
    }
  }

  writeln("");
    
  if (hasParameter("operation-comment")) {
    var comment = getParameter("operation-comment");
    if (comment) {
      writeComment(comment);
    }
  }
  
  if (properties.showNotes && hasParameter("notes")) {
    var notes = getParameter("notes");
    if (notes) {
      var lines = String(notes).split("\n");
      var r1 = new RegExp("^[\\s]+", "g");
      var r2 = new RegExp("[\\s]+$", "g");
      for (line in lines) {
        var comment = lines[line].replace(r1, "").replace(r2, "");
        if (comment) {
          writeComment(comment);
        }
      }
    }
  }
  
  if (insertToolCall) {
    forceWorkPlane();
    
    retracted = true;
    onCommand(COMMAND_COOLANT_OFF);
  
    if (!isFirstSection() && properties.optionalStop) {
      onCommand(COMMAND_OPTIONAL_STOP);
    }

    if (tool.number > 99999999) {
      warning(localize("Tool number exceeds maximum value."));
    }

    var lengthOffset = 1; // optional, use tool.lengthOffset instead
    if (lengthOffset > 99) {
      error(localize("Length offset out of range."));
      return;
    }
    writeBlock("T" + (properties.toolAsName ? "="  + "\"" + (tool.description.toUpperCase()) + "\"" : toolFormat.format(tool.number)), dFormat.format(lengthOffset));
    writeBlock(mFormat.format(6));
    if (tool.comment) {
      writeComment(tool.comment);
    }
    var showToolZMin = false;
    if (showToolZMin) {
      if (is3D()) {
        var numberOfSections = getNumberOfSections();
        var zRange = currentSection.getGlobalZRange();
        var number = tool.number;
        for (var i = currentSection.getId() + 1; i < numberOfSections; ++i) {
          var section = getSection(i);
          if (section.getTool().number != number) {
            break;
          }
          zRange.expandToRange(section.getGlobalZRange());
        }
        writeComment(localize("ZMIN") + "=" + zRange.getMinimum());
      }
    }

    if (properties.preloadTool) {
      var nextTool = (properties.toolAsName ? getNextToolDescription(tool.description) : getNextTool(tool.number));
      if (nextTool) {
        writeBlock("T" + (properties.toolAsName ? "="  + "\"" + (nextTool.description.toUpperCase()) + "\"" : toolFormat.format(nextTool.number)));
      } else {
        // preload first tool
        var section = getSection(0);
        var firstToolNumber = section.getTool().number;
        var firstToolDescription = section.getTool().description;
        if (properties.toolAsName) {
          if (tool.description != firstToolDescription) {
            writeBlock("T=" + "\"" + (firstToolDescription.toUpperCase()) + "\"");
          }
        } else {
          if (tool.number != firstToolNumber) {
            writeBlock("T" + toolFormat.format(firstToolNumber));
          }
        }
      }
    }
  }

  if (properties.useCycle832) {
    if (hasParameter("operation-strategy") && (getParameter("operation-strategy") == "drill")) {
      writeBlock("CYCLE832()");
    } else if (hasParameter("operation:tolerance")) {
      var tolerance = Math.max(getParameter("operation:tolerance"), 0);
      if (tolerance > 0) {
        var workMode = 1;
        var stockToLeaveThreshold = toUnit(0.1, MM);
        if ((hasParameter("operation:stockToLeave") && (xyzFormat.getResultingValue(getParameter("operation:stockToLeave")) < stockToLeaveThreshold)) ||
            (hasParameter("operation:verticalStockToLeave") && (xyzFormat.getResultingValue(getParameter("operation:verticalStockToLeave")) < stockToLeaveThreshold))) {
          workMode = 1;
        } else {
          workMode = 2;
        }
        writeBlock("CYCLE832(" + xyzFormat.format(tolerance) + ", 11200" + workMode + ")");
      } else {
        writeBlock("CYCLE832()");
      }
    } else {
      writeBlock("CYCLE832()");
    }
  }
  
  if ((insertToolCall ||
       forceSpindleSpeed ||
       isFirstSection() ||
       (rpmFormat.areDifferent(tool.spindleRPM, sOutput.getCurrent())) ||
       (tool.clockwise != getPreviousSection().getTool().clockwise)) &&
      !isProbeOperation()) {
    forceSpindleSpeed = false;
    
    if (tool.spindleRPM < 1) {
      error(localize("Spindle speed out of range."));
      return;
    }
    if (tool.spindleRPM > 99999) {
      warning(localize("Spindle speed exceeds maximum value."));
    }
    writeBlock(
      sOutput.format(tool.spindleRPM), mFormat.format(tool.clockwise ? 3 : 4)
    );
  }

  // wcs
  if (insertToolCall) { // force work offset when changing tool
    currentWorkOffset = undefined;
  }
  setWCS();

  forceXYZ();

  if (!is3D() || machineConfiguration.isMultiAxisConfiguration()) { // use 5-axis indexing for multi-axis mode
    // set working plane after datum shift
	var abc = new Vector(0, 0, 0);
    cancelTransformation();
    if (!currentSection.isMultiAxis()) {
      abc = currentSection.workPlane.getTransposed().eulerZYX_R;
      abc = new Vector(-abc.x, -abc.y, -abc.z);
    }
    setWorkPlane(abc, true); // turn
  } else { // pure 3D
    var remaining = currentSection.workPlane;
    if (!isSameDirection(remaining.forward, new Vector(0, 0, 1))) {
      error(localize("Tool orientation is not supported."));
      return;
    }
    setRotation(remaining);
  }

  forceAny();

  if (!currentSection.isMultiAxis()) {
    onCommand(COMMAND_LOCK_MULTI_AXIS);
  }

  if (retracted && !insertToolCall) {
    var lengthOffset = 1; // optional, use tool.lengthOffset instead
    if (lengthOffset > 99) {
      error(localize("Length offset out of range."));
      return;
    }
    writeBlock(dFormat.format(lengthOffset));
  }

  if (currentSection.isMultiAxis()) {
    forceWorkPlane();
    cancelTransformation();
    
    // turn machine
    if (currentSection.isOptimizedForMachine()) {
		var abc = currentSection.getInitialToolAxisABC();
		//var abc = currentSection.getInitialToolAxisABC(); Pour test Cycle800
		var FR = 1; // 0 = without moving to safety plane, 1 = move to safety plane only in Z, 2 = move to safety plane Z,X,Y
		var TC = "TABLE";
		var ST = 0;
		var MODE = 27;
		var X0 = 0;
		var Y0 = 0;
		var Z0 = 0;
		var A = abc.x;
		var B = abc.y;
		var C = abc.z;
		var X1 = 0;
		var Y1 = 0;
		var Z1 = 0;
		//var DIR = turn ? 1 : 0; // direction
		DIR = 1;
      
		writeBlock(
			"CYCLE800(" +
			FR + "," +
			"\"" + TC + "\"," +
			ST + "," +
			MODE + "," +
			xyzFormat.format(X0) + "," +
			xyzFormat.format(Y0) + "," +
			xyzFormat.format(Z0) + "," +
			abcFormat.format(C) + "," +
			abcFormat.format(B) + "," +
			abcFormat.format(A) + "," +
			xyzFormat.format(X1) + "," +
			xyzFormat.format(Y1) + "," +
			xyzFormat.format(Z1) + "," +
			DIR + "," +	"," + "1" + ")"
		);
		forceABC();
		forceXYZ();
  
	  // writeBlock(gAbsIncModal.format(90), gMotionModal.format(0), aOutput.format(abc.x), bOutput.format(abc.y), cOutput.format(abc.z));
    }

    // writeBlock("TRAORI");
	// writeBlock("ORICON ");
    var initialPosition = getFramePosition(currentSection.getInitialPosition());

    if (currentSection.isOptimizedForMachine()) {
      writeBlock(
        gAbsIncModal.format(90),
        gMotionModal.format(0),
        xOutput.format(initialPosition.x),
        yOutput.format(initialPosition.y),
        zOutput.format(initialPosition.z)
      );
    } else {
      var d = currentSection.getGlobalInitialToolAxis();
      writeBlock(
        gAbsIncModal.format(90),
        gMotionModal.format(0),
        xOutput.format(initialPosition.x),
        yOutput.format(initialPosition.y),
        zOutput.format(initialPosition.z),
        a3Output.format(d.x),
        b3Output.format(d.y),
        c3Output.format(d.z)
      );
    }
  } else {

    var initialPosition = getFramePosition(currentSection.getInitialPosition());
    if (!retracted) {
      if (getCurrentPosition().z < initialPosition.z) {
        writeBlock(gMotionModal.format(0), zOutput.format(initialPosition.z));
      }
    }
    
    if (insertToolCall) {
      if (tool.lengthOffset != 0) {
        warningOnce(localize("Length offset is not supported."), WARNING_LENGTH_OFFSET);
      }

      if (!machineConfiguration.isHeadConfiguration()) {
        writeBlock(
          gAbsIncModal.format(90),
          gMotionModal.format(0), xOutput.format(initialPosition.x), yOutput.format(initialPosition.y)
        );
        var z = zOutput.format(initialPosition.z);
        if (z) {
          writeBlock(gMotionModal.format(0), z);
        }
      } else {
        writeBlock(
          gAbsIncModal.format(90),
          gMotionModal.format(0),
          xOutput.format(initialPosition.x),
          yOutput.format(initialPosition.y),
          zOutput.format(initialPosition.z)
        );
      }
    } else {
      writeBlock(
        gAbsIncModal.format(90),
        gMotionModal.format(0),
        xOutput.format(initialPosition.x),
        yOutput.format(initialPosition.y)
      );
    }
  }

  // set coolant after we have positioned at Z
  if (insertToolCall) {
    forceCoolant();
  }
  setCoolant(tool.coolant);

  if (properties.useParametricFeed &&
      hasParameter("operation-strategy") &&
      (getParameter("operation-strategy") != "drill") && // legacy
      !(currentSection.hasAnyCycle && currentSection.hasAnyCycle())) {
    if (!insertToolCall &&
        activeMovements &&
        (getCurrentSectionId() > 0) &&
        ((getPreviousSection().getPatternId() == currentSection.getPatternId()) && (currentSection.getPatternId() != 0))) {
      // use the current feeds
    } else {
      initializeActiveFeeds();
    }
  } else {
    activeMovements = undefined;
  }
  
  if (insertToolCall) {
    gPlaneModal.reset();
  }
}

function getNextToolDescription(description) {
  var currentSectionId = getCurrentSectionId();
  if (currentSectionId < 0) {
    return null;
  }
  for (var i = currentSectionId + 1; i < getNumberOfSections(); ++i) {
    var section = getSection(i);
    var sectionTool = section.getTool();
    if (description != sectionTool.description) {
      return sectionTool; // found next tool
    }
  }
  return null; // not found
}

function onDwell(seconds) {
  if (seconds > 0) {
    writeBlock(gFormat.format(4), "F" + secFormat.format(seconds));
  }
}

function onSpindleSpeed(spindleSpeed) {
  writeBlock(sOutput.format(spindleSpeed));
}

var expandCurrentCycle = false;

function onCycle() {
  writeBlock(gPlaneModal.format(17));
  
  expandCurrentCycle = false;

  if ((cycleType != "tapping") &&
      (cycleType != "right-tapping") &&
      (cycleType != "left-tapping") &&
      (cycleType != "tapping-with-chip-breaking")) {
    writeBlock(feedOutput.format(cycle.feedrate));
  }

  var RTP = cycle.clearance; // return plane (absolute)
  var RFP = cycle.stock; // reference plane (absolute)
  var SDIS = cycle.retract - cycle.stock; // safety distance
  var DP = cycle.bottom; // depth (absolute)
  // var DPR = RFP - cycle.bottom; // depth (relative to reference plane)
  var DTB = cycle.dwell;
  var SDIR = tool.clockwise ? 3 : 4; // direction of rotation: M3:3 and M4:4

  switch (cycleType) {
  case "drilling":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    writeBlock(
      "MCALL CYCLE81(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ + ")"
    );
    break;
  case "counter-boring":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    writeBlock(
      "MCALL CYCLE82(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ +
      ", " + conditional(DTB > 0, secFormat.format(DTB)) + ")"
    );
    break;
  case "chip-breaking":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    // add support for accumulated depth
    var FDEP = cycle.stock - cycle.incrementalDepth;
    var FDPR = cycle.incrementalDepth; // relative to reference plane (unsigned)
    var DAM = 0; // degression (unsigned)
    var DTS = 0; // dwell time at start
    var FRF = 1; // feedrate factor (unsigned)
    var VARI = 0; // chip breaking
    var _AXN = 3; // tool axis
    var _MDEP = cycle.incrementalDepth; // minimum drilling depth
    var _VRT = 0; // retraction distance
    var _DTD = (cycle.dwell != undefined) ? cycle.dwell : 0;
    var _DIS1 = 0; // limit distance

    writeBlock(
      "MCALL CYCLE83(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ +
      ", " + xyzFormat.format(FDEP) +
      ", " /*+ xyzFormat.format(FDPR)*/ +
      ", " + xyzFormat.format(DAM) +
      ", " + /*conditional(DTB > 0, secFormat.format(DTB))*/ // only dwell at bottom
      ", " + conditional(DTS > 0, secFormat.format(DTS)) +
      ", " + xyzFormat.format(FRF) +
      ", " + xyzFormat.format(VARI) +
      ", " + /*_AXN +*/
      ", " + xyzFormat.format(_MDEP) +
      ", " + xyzFormat.format(_VRT) +
      ", " + secFormat.format(_DTD) +
      ", 0" + /*xyzFormat.format(_DIS1) +*/
      ")"
    );
    break;
  case "deep-drilling":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    var FDEP = cycle.stock - cycle.incrementalDepth;
    var FDPR = cycle.incrementalDepth; // relative to reference plane (unsigned)
    var DAM = 0; // degression (unsigned)
    var DTS = 0; // dwell time at start
    var FRF = 1; // feedrate factor (unsigned)
    var VARI = 1; // full retract
    var _MDEP = cycle.incrementalDepth; // minimum drilling depth
    var _VRT = 0; // retraction distance
    var _DTD = (cycle.dwell != undefined) ? cycle.dwell : 0;
    var _DIS1 = 0; // limit distance

    writeBlock(
      "MCALL CYCLE83(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ +
      ", " + xyzFormat.format(FDEP) +
      ", " /*+ xyzFormat.format(FDPR)*/ +
      ", " + xyzFormat.format(DAM) +
      ", " + /*conditional(DTB > 0, secFormat.format(DTB)) +*/ // only dwell at bottom
      ", " + conditional(DTS > 0, secFormat.format(DTS)) +
      ", " + xyzFormat.format(FRF) +
      ", " + xyzFormat.format(VARI) +
      ", " + /*_AXN +*/
      ", " + xyzFormat.format(_MDEP) +
      ", " + xyzFormat.format(_VRT) +
      ", " + secFormat.format(_DTD) +
      ", 0" + /*xyzFormat.format(_DIS1) +*/
      ")"
    );
    break;
  case "tapping":
  case "left-tapping":
  case "right-tapping":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    var SDAC = SDIR; // direction of rotation after end of cycle
    var MPIT = 0; // thread pitch as thread size
    var PIT = ((tool.type == TOOL_TAP_LEFT_HAND) ? -1 : 1) * tool.threadPitch; // thread pitch
    var POSS = 0; // spindle position for oriented spindle stop in cycle (in degrees)
    var SST = tool.spindleRPM; // speed for tapping
    var SST1 = tool.spindleRPM; // speed for return
    writeBlock(
      "MCALL CYCLE84(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ +
      ", " + conditional(DTB > 0, secFormat.format(DTB)) +
      ", " + xyzFormat.format(SDAC) +
      ", " + xyzFormat.format(MPIT) +
      ", " + xyzFormat.format(PIT) +
      ", " + xyzFormat.format(POSS) +
      ", " + xyzFormat.format(SST) +
      ", " + xyzFormat.format(SST1) + ")"
    );
    break;
  case "tapping-with-chip-breaking":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    var SDAC = SDIR; // direction of rotation after end of cycle
    var MPIT = 0; // thread pitch as thread size
    var PIT = ((tool.type == TOOL_TAP_LEFT_HAND) ? -1 : 1) * tool.threadPitch; // thread pitch
    var POSS = 0; // spindle position for oriented spindle stop in cycle (in degrees)
    var SST = tool.spindleRPM; // speed for tapping
    var SST1 = tool.spindleRPM; // speed for return
    var _AXN = 0; // tool axis
    var _PTAB = 0; // must be 0
    var _TECHNO = 0; // technology settings
    var _VARI = 1; // machining type: 0 = tapping full depth, 1 = tapping partial retract, 2 = tapping full retract
    var _DAM = cycle.incrementalDepth; // incremental depth
    var _VRT = cycle.chipBreakDistance; // retract distance for chip breaking
    writeBlock(
      "MCALL CYCLE84(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ +
      ", " + secFormat.format(DTB) +
      ", " + xyzFormat.format(SDAC) +
      ", " /*+ xyzFormat.format(MPIT)*/ +
      ", " + xyzFormat.format(PIT) +
      ", " + xyzFormat.format(POSS) +
      ", " + xyzFormat.format(SST) +
      ", " + xyzFormat.format(SST1) +
      ", " + xyzFormat.format(_AXN) +
      ", " + xyzFormat.format(_PTAB) +
      ", " + xyzFormat.format(_TECHNO) +
      ", " + xyzFormat.format(_VARI) +
      ", " + xyzFormat.format(_DAM) +
      ", " + xyzFormat.format(_VRT) + ")"
    );
    break;
  case "reaming":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    var FFR = cycle.feedrate;
    var RFF = cycle.retractFeedrate;
    writeBlock(
      "MCALL CYCLE85(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ +
      ", " + conditional(DTB > 0, secFormat.format(DTB)) +
      ", " + xyzFormat.format(FFR) +
      ", " + xyzFormat.format(RFF) + ")"
    );
    break;
  case "stop-boring":
    if (cycle.dwell > 0) {
      expandCurrentCycle = true;
    } else {
      if (RTP > getCurrentPosition().z) {
        writeBlock(gMotionModal.format(0), zOutput.format(RTP));
      }
      writeBlock(
        "MCALL CYCLE87(" + xyzFormat.format(RTP) +
        ", " + xyzFormat.format(RFP) +
        ", " + xyzFormat.format(SDIS) +
        ", " + xyzFormat.format(DP) +
        ", " /*+ xyzFormat.format(DPR)*/ +
        ", " + SDIR + ")"
      );
    }
    break;
  case "fine-boring":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    var RPA = 0; // return path in abscissa of the active plane (enter incrementally with)
    var RPO = 0; // return path in the ordinate of the active plane (enter incrementally sign)
    var RPAP = 0; // return plane in the applicate (enter incrementally with sign)
    var POSS = 0; // spindle position for oriented spindle stop in cycle (in degrees)
    writeBlock(
      "MCALL CYCLE86(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ +
      ", " + conditional(DTB > 0, secFormat.format(DTB)) +
      ", " + SDIR +
      ", " + xyzFormat.format(RPA) +
      ", " + xyzFormat.format(RPO) +
      ", " + xyzFormat.format(RPAP) +
      ", " + xyzFormat.format(POSS) + ")"
    );
    break;
  case "back-boring":
    expandCurrentCycle = true;
    break;
  case "manual-boring":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    writeBlock(
      "MCALL CYCLE88(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ +
      ", " + conditional(DTB > 0, secFormat.format(DTB)) +
      ", " + SDIR + ")"
    );
    break;
  case "boring":
    if (RTP > getCurrentPosition().z) {
      writeBlock(gMotionModal.format(0), zOutput.format(RTP));
    }
    // retract feed is ignored
    writeBlock(
      "MCALL CYCLE89(" + xyzFormat.format(RTP) +
      ", " + xyzFormat.format(RFP) +
      ", " + xyzFormat.format(SDIS) +
      ", " + xyzFormat.format(DP) +
      ", " /*+ xyzFormat.format(DPR)*/ +
      ", " + conditional(DTB > 0, secFormat.format(DTB)) + ")"
    );
    break;
  default:
    expandCurrentCycle = true;
  }
  if (!expandCurrentCycle) {
    xOutput.reset();
    yOutput.reset();
  }
}

function approach(value) {
  validate((value == "positive") || (value == "negative"), "Invalid approach.");
  return (value == "positive") ? 1 : -1;
}

function onCyclePoint(x, y, z) {
  if (isProbeOperation()) {
    currentWorkOffset = undefined;

/* probing cycle
    _MVAR  (CYCLE977)
      101 = Datum shift determine in hole with datum shift correction
      102 = "" circular boss ""
      103 = "" channel ""
      104 = "" wall ""
      105 = "" rectangle inside ""
      106 = "" rectangle outside ""
      ---
      1101 = Datum shift determine in hole with guardian zone with datum shift correction
      1102 = "" circular boss ""
      1103 = "" channel ""
      1104 = "" wall ""
      1105 = "" rectangle inside ""
*/

    var _MVAR = "_MVAR="; // CYCLE TYPE
    var _MA = "_MA="; // number of the axis, X=1, Y=2, Z=3

    if (tool.number >= 100) {
      error(localize("Tool number is out of range for probing. Tool number must be below 100."));
      return;
    }
    var _PRNUM = "_PRNUM=" + toolProbeFormat.format(tool.number); // Probingtyp, Probingnumber. 3 digits. 1st = (0=Multiprobe, 1=Monoprobe), 2nd/3rd = 2digit Probing-Tool-Number
    var _KNUM = "_KNUM=" + xyzFormat.format(9999); // automatically input in active workOffset. e.g. _KNUM=1 (G54)
    var _VMS = "_VMS=" + xyzFormat.format(0); // Feed of probing. 0=150mm/min, >1=300m/min
    var _TSA = "_TSA=" + xyzFormat.format(1); // tolerance (trust area)
    var _NMSP = "_NMSP=" + xyzFormat.format(1); // number of measurements at same spot
    var _ID = "_ID=" + xyzFormat.format(-Math.abs(cycle.clearance - (z - cycle.depth))); // incremental depth infeed in Z, direction over sign (only by circular boss, wall resp. rectangle and by hole/channel/circular boss/wall with guard zone)
    // var _SZA = "_SZA=" + (cycle.width1 != undefined ? xyzFormat.format(cycle.width1 - 4 * (cycle.probeClearance)) : ""); // increment depth  // diameter or width of guard zone (inside hole/channel, outside circular boss/wall), length of guard zone in X (only by rectangle)
    // var _SZO = "_SZO=" + (cycle.width1 != undefined ? xyzFormat.format(cycle.width1 - 4 * (cycle.probeClearance)) : ""); // increment depth  // diameter or width of guard zone (inside hole/channel, outside circular boss/wall), length of guard zone in Y (only by rectangle)
    var _SETV0 = "_SETV[0]=" + (cycle.width1 != undefined ? xyzFormat.format(cycle.width1) : ""); // nominal value in X
    var _SETV1 = "_SETV[1]=" + (cycle.width2 != undefined ? xyzFormat.format(cycle.width2) : ""); // nominal value in Y

    // _FA is always in mm
    var _FA = "_FA=" + // measuring range (distance to surface), total measuring range=2*_FA in mm
      xyzFormat.format(((unit == MM) ? 1 : 25.4) * ((cycle.probeClearance !== undefined) ? cycle.probeClearance : cycle.probeOvertravel));

    switch (cycleType) {
    case "probing-x":
    case "probing-y":
      var _SETVAL = "_SETVAL=" + xyzFormat.format((cycleType == "probing-x" ? x : y) + approach(cycle.approach1) * (cycle.probeClearance + tool.diameter/2));
      _MVAR += xyzFormat.format(100);
      _MA += xyzFormat.format(cycleType == "probing-x" ? 1 : 2);
      writeBlock(gMotionModal.format(1), zOutput.format(z - cycle.depth));
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETVAL, _MA, _KNUM);
      writeBlock("CYCLE978");
      break;
    case "probing-z":
      // _FA1 is always in mm
      var _FA1 = ((unit == MM) ? 1 : 25.4) * cycle.probeClearance;
      var _SETVAL = "_SETVAL=" + xyzFormat.format(z - cycle.depth);
      _MVAR += xyzFormat.format(100);
      _MA += xyzFormat.format(3);
      writeBlock(gMotionModal.format(1), zOutput.format(z - cycle.depth + _FA1/2));
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETVAL, _MA, _KNUM);
      writeBlock("CYCLE978");
      break;
    case "probing-x-channel":
    case "probing-x-channel-with-island":
      var _SETVAL = "_SETVAL=" + (cycle.width1 != undefined ? xyzFormat.format(cycle.width1) : ""); // nominal value (only by hole/circular boss/channel/wall)
      _MVAR += xyzFormat.format(cycleType == "probing-x-channel" ? 103 : 1003);
      _MA += xyzFormat.format(1);
      writeBlock(conditional(cycleType == "probing-x-channel", gMotionModal.format(1) + " " + zOutput.format(z - cycle.depth)));
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETVAL, _MA, (conditional(cycleType == "probing-x-channel-with-island", _ID /*+ " " + _SZA*/)), _KNUM);
      writeBlock("CYCLE977");
      break;
    case "probing-y-channel":
    case "probing-y-channel-with-island":
      var _SETVAL = "_SETVAL=" + (cycle.width1 != undefined ? xyzFormat.format(cycle.width1) : ""); // nominal value (only by hole/circular boss/channel/wall)
      _MVAR += xyzFormat.format(cycleType == "probing-y-channel" ? 103 : 1003);
      _MA += xyzFormat.format(2);
      writeBlock(conditional(cycleType == "probing-y-channel", gMotionModal.format(1) + " " + zOutput.format(z - cycle.depth)));
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETVAL, _MA, (conditional(cycleType == "probing-y-channel-with-island", _ID /*+ " " + _SZA*/)), _KNUM);
      writeBlock("CYCLE977");
      break;
/* not supported currently, need min. 3 points to call this cycle (same as heindenhain)
    case "probing-xy-inner-corner":
      _MVAR += xyzFormat.format(105);
      writeBlock("CYCLE961");
      break;
    case "probing-xy-outer-corner":
      var _SETVAL = "_SETVAL=" + (cycle.width1 != undefined ? xyzFormat.format(cycle.width1) : ""); // nominal value (only by hole/circular boss/channel/wall)
      _MVAR += xyzFormat.format(106);
      _ID = xyzFormat.format(0);
      writeBlock(_PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETVAL, _MA, _ID, _KNUM);
      writeBlock("CYCLE961");
      break;
*/
    case "probing-x-wall":
    case "probing-y-wall":
      var _SETVAL = "_SETVAL=" + (cycle.width1 != undefined ? xyzFormat.format(cycle.width1) : ""); // nominal value (only by hole/circular boss/channel/wall)
      _MVAR += xyzFormat.format(104);
      _MA += xyzFormat.format(cycleType == "probing-x-wall" ? 1 : 2);
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETVAL, _MA, _ID, _KNUM);
      writeBlock("CYCLE977");
      break;
    case "probing-xy-circular-hole":
    case "probing-xy-circular-hole-with-island":
      var _SETVAL = "_SETVAL=" + (cycle.width1 != undefined ? xyzFormat.format(cycle.width1) : ""); // nominal value (only by hole/circular boss/channel/wall)
      _MVAR += xyzFormat.format(cycleType == "probing-xy-circular-hole" ? 101 : 1001);
      writeBlock(conditional(cycleType == "probing-xy-circular-hole", gMotionModal.format(1) + " " + zOutput.format(z - cycle.depth)));
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETVAL, (conditional(cycleType == "probing-xy-circular-hole-with-island", _ID /*+ " " + _SZA*/)), _KNUM);
      writeBlock("CYCLE977");
      break;
    case "probing-xy-circular-boss":
      var _SETVAL = "_SETVAL=" + (cycle.width1 != undefined ? xyzFormat.format(cycle.width1) : ""); // nominal value (only by hole/circular boss/channel/wall)
      _MVAR += xyzFormat.format(102);
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETVAL, _ID, _KNUM);
      writeBlock("CYCLE977");
      break;
    case "probing-xy-rectangular-hole":
    case "probing-xy-rectangular-boss":
      _MVAR += xyzFormat.format(cycleType == "probing-xy-rectangular-hole" ? 105 : 106);
      writeBlock(conditional(cycleType == "probing-xy-rectangular-hole", gMotionModal.format(1) + " " + zOutput.format(z - cycle.depth)));
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETV0, _SETV1, (conditional(cycleType == "probing-xy-rectangular-boss", _ID)), _KNUM);
      writeBlock("CYCLE977");
      break;
    case "probing-xy-rectangular-hole-with-island":
      _MVAR += xyzFormat.format(1105);
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETV0, _SETV1, /*_SZA, _SZO,*/ _ID, _KNUM); // in the simulation you dont need _SZA and _SZO
      writeBlock("CYCLE977");
      break;
    case "probing-x-plane-angle":
    case "probing-y-plane-angle":
      _MVAR += xyzFormat.format(105);
      _TSA = "_TSA=" + xyzFormat.format(0.1); // angle tolerance (in the simulation he move to the second point with this angle)
      _RA = "_RA=" + xyzFormat.format(0); // correction of angle, 0 dont rotate the table
      _MA += xyzFormat.format(cycleType == "probing-x-plane-angle" ? 201 : 102);
      _ID = "_ID=" + cycle.probeSpacing; // distance between point
      _STA1 = "_STA1=" + xyzFormat.format(0); // angle of the plane
      var _SETVAL = "_SETVAL=" + xyzFormat.format((cycleType == "probing-x-plane-angle" ? x : y) + approach(cycle.approach1) * (cycle.probeClearance + tool.diameter/2));
      writeBlock(gMotionModal.format(1), cycleType == "probing-x-plane-angle" ? yOutput.format(y - cycle.probeSpacing/2) : xOutput.format(x - cycle.probeSpacing/2));
      writeBlock(gMotionModal.format(1), zOutput.format(z - cycle.depth));
      writeBlock(_TSA, _PRNUM, _VMS, _NMSP, _FA);
      writeBlock(_MVAR, _SETVAL, _MA, _ID, _RA, _STA1, _KNUM);
      writeBlock("CYCLE998");
      break;
    default:
      cycleNotSupported();
    }
    return;
  }

  if (!expandCurrentCycle) {
    var _x = xOutput.format(x);
    var _y = yOutput.format(y);
    /*zOutput.format(z)*/
    if (_x || _y) {
      writeBlock(_x, _y);
    }
  } else {
    expandCyclePoint(x, y, z);
  }
}

function onCycleEnd() {
  if (!expandCurrentCycle) {
    writeBlock("MCALL"); // end modal cycle
  }
  setWCS();

  zOutput.reset();
}

var pendingRadiusCompensation = -1;

function onRadiusCompensation() {
  pendingRadiusCompensation = radiusCompensation;
}

function onRapid(_x, _y, _z) {
  var x = xOutput.format(_x);
  var y = yOutput.format(_y);
  var z = zOutput.format(_z);
  if (x || y || z) {
    if (pendingRadiusCompensation >= 0) {
      error(localize("Radius compensation mode cannot be changed at rapid traversal."));
      return;
    }
    writeBlock(gMotionModal.format(0), x, y, z);
    forceFeed();
  }
}

function onLinear(_x, _y, _z, feed) {
  var x = xOutput.format(_x);
  var y = yOutput.format(_y);
  var z = zOutput.format(_z);
  var f = getFeed(feed);
  if (x || y || z) {
    if (pendingRadiusCompensation >= 0) {
      pendingRadiusCompensation = -1;

      if (tool.diameterOffset != 0) {
        warningOnce(localize("Diameter offset is not supported."), WARNING_DIAMETER_OFFSET);
      }

      writeBlock(gPlaneModal.format(17));
      switch (radiusCompensation) {
      case RADIUS_COMPENSATION_LEFT:
        writeBlock(gMotionModal.format(1), gFormat.format(41), x, y, z, f);
        break;
      case RADIUS_COMPENSATION_RIGHT:
        writeBlock(gMotionModal.format(1), gFormat.format(42), x, y, z, f);
        break;
      default:
        writeBlock(gMotionModal.format(1), gFormat.format(40), x, y, z, f);
      }
    } else {
      writeBlock(gMotionModal.format(1), x, y, z, f);
    }
  } else if (f) {
    if (getNextRecord().isMotion()) { // try not to output feed without motion
      forceFeed(); // force feed on next line
    } else {
      writeBlock(gMotionModal.format(1), f);
    }
  }
}

function onRapid5D(_x, _y, _z, _a, _b, _c) {
  if (pendingRadiusCompensation >= 0) {
    error(localize("Radius compensation mode cannot be changed at rapid traversal."));
    return;
  }
  if (currentSection.isOptimizedForMachine()) {
    var x = xOutput.format(_x);
    var y = yOutput.format(_y);
    var z = zOutput.format(_z);
    var a = aOutput.format(_a);
    var b = bOutput.format(_b);
    var c = cOutput.format(_c);
    writeBlock(gMotionModal.format(0), x, y, z, a, b, c);
  } else {
    forceXYZ(); // required
    var x = xOutput.format(_x);
    var y = yOutput.format(_y);
    var z = zOutput.format(_z);
    var a3 = a3Output.format(_a);
    var b3 = b3Output.format(_b);
    var c3 = c3Output.format(_c);
    writeBlock(gMotionModal.format(0), x, y, z, a3, b3, c3);
  }
  forceFeed();
}

function onLinear5D(_x, _y, _z, _a, _b, _c, feed) {
  if (pendingRadiusCompensation >= 0) {
    error(localize("Radius compensation cannot be activated/deactivated for 5-axis move."));
    return;
  }

  if (currentSection.isOptimizedForMachine()) {
    var x = xOutput.format(_x);
    var y = yOutput.format(_y);
    var z = zOutput.format(_z);
    var a = aOutput.format(_a);
    var b = bOutput.format(_b);
    var c = cOutput.format(_c);
    var f = getFeed(feed);
    if (x || y || z || a || b || c) {
      writeBlock(gMotionModal.format(1), x, y, z, a, b, c, f);
    } else if (f) {
      if (getNextRecord().isMotion()) { // try not to output feed without motion
        forceFeed(); // force feed on next line
      } else {
        writeBlock(gMotionModal.format(1), f);
      }
    }
  } else {
    forceXYZ(); // required
    var x = xOutput.format(_x);
    var y = yOutput.format(_y);
    var z = zOutput.format(_z);
    var a3 = a3Output.format(_a);
    var b3 = b3Output.format(_b);
    var c3 = c3Output.format(_c);
    var f = getFeed(feed);
    if (x || y || z || a || b || c) {
      writeBlock(gMotionModal.format(1), x, y, z, a3, b3, c3, f);
    } else if (f) {
      if (getNextRecord().isMotion()) { // try not to output feed without motion
        forceFeed();// force feed on next line
      } else {
        writeBlock(gMotionModal.format(1), f);
      }
    }
  }
}

function onCircular(clockwise, cx, cy, cz, x, y, z, feed) {
  writeBlock(gPlaneModal.format(17));
  
  var start = getCurrentPosition();
  var turns = useArcTurn ? Math.floor(Math.abs(getCircularSweep())/(2 * Math.PI)) : 0; // full turns

  if (isFullCircle()) {
    if (isHelical()) {
      linearize(tolerance);
      return;
    }
    if (turns > 1) {
      error(localize("Multiple turns are not supported."));
      return;
    }
    // G90/G91 are dont care when we do not used XYZ
    switch (getCircularPlane()) {
    case PLANE_XY:
      if (radiusCompensation != RADIUS_COMPENSATION_OFF) {
        if ((gPlaneModal.getCurrent() !== null) && (gPlaneModal.getCurrent() != 17)) {
          error(localize("Plane cannot be changed when radius compensation is active."));
          return;
        }
      }
      writeBlock(gMotionModal.format(clockwise ? 2 : 3), iOutput.format(cx - start.x, 0), jOutput.format(cy - start.y, 0), getFeed(feed));
      break;
    case PLANE_ZX:
      if (radiusCompensation != RADIUS_COMPENSATION_OFF) {
        if ((gPlaneModal.getCurrent() !== null) && (gPlaneModal.getCurrent() != 18)) {
          error(localize("Plane cannot be changed when radius compensation is active."));
          return;
        }
      }
      writeBlock(gMotionModal.format(clockwise ? 2 : 3), iOutput.format(cx - start.x, 0), kOutput.format(cz - start.z, 0), getFeed(feed));
      break;
    case PLANE_YZ:
      if (radiusCompensation != RADIUS_COMPENSATION_OFF) {
        if ((gPlaneModal.getCurrent() !== null) && (gPlaneModal.getCurrent() != 19)) {
          error(localize("Plane cannot be changed when radius compensation is active."));
          return;
        }
      }
      writeBlock(gMotionModal.format(clockwise ? 2 : 3), jOutput.format(cy - start.y, 0), kOutput.format(cz - start.z, 0), getFeed(feed));
      break;
    default:
      linearize(tolerance);
    }
  } else if (useArcTurn) { // IJK mode
    if (isHelical()) {
      forceXYZ();
    }
    switch (getCircularPlane()) {
    case PLANE_XY:
      if (radiusCompensation != RADIUS_COMPENSATION_OFF) {
        if ((gPlaneModal.getCurrent() !== null) && (gPlaneModal.getCurrent() != 17)) {
          error(localize("Plane cannot be changed when radius compensation is active."));
          return;
        }
      }
      // arFormat.format(Math.abs(getCircularSweep()));
      if (turns > 0) {
        writeBlock(gAbsIncModal.format(90), gMotionModal.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), zOutput.format(z), iOutput.format(cx - start.x, 0), jOutput.format(cy - start.y, 0), getFeed(feed), "TURN=" + turns);
      } else {
        writeBlock(gAbsIncModal.format(90), gMotionModal.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), zOutput.format(z), iOutput.format(cx - start.x, 0), jOutput.format(cy - start.y, 0), getFeed(feed));
      }
      break;
    case PLANE_ZX:
      if (radiusCompensation != RADIUS_COMPENSATION_OFF) {
        if ((gPlaneModal.getCurrent() !== null) && (gPlaneModal.getCurrent() != 18)) {
          error(localize("Plane cannot be changed when radius compensation is active."));
          return;
        }
      }
      if (turns > 0) {
        writeBlock(gAbsIncModal.format(90), gMotionModal.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), zOutput.format(z), iOutput.format(cx - start.x, 0), kOutput.format(cz - start.z, 0), getFeed(feed), "TURN=" + turns);
      } else {
        writeBlock(gAbsIncModal.format(90), gMotionModal.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), zOutput.format(z), iOutput.format(cx - start.x, 0), kOutput.format(cz - start.z, 0), getFeed(feed));
      }
      break;
    case PLANE_YZ:
      if (radiusCompensation != RADIUS_COMPENSATION_OFF) {
        if ((gPlaneModal.getCurrent() !== null) && (gPlaneModal.getCurrent() != 19)) {
          error(localize("Plane cannot be changed when radius compensation is active."));
          return;
        }
      }
      if (turns > 0) {
        writeBlock(gAbsIncModal.format(90), gMotionModal.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), zOutput.format(z), jOutput.format(cy - start.y, 0), kOutput.format(cz - start.z, 0), getFeed(feed), "TURN=" + turns);
      } else {
        writeBlock(gAbsIncModal.format(90), gMotionModal.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), zOutput.format(z), jOutput.format(cy - start.y, 0), kOutput.format(cz - start.z, 0), getFeed(feed));
      }
      break;
    default:
      if (turns > 1) {
        error(localize("Multiple turns are not supported."));
        return;
      }
      if (properties.useCIP) { // allow CIP
        var ip = getPositionU(0.5);
        writeBlock(
          gAbsIncModal.format(90), "CIP",
          xOutput.format(x),
          yOutput.format(y),
          zOutput.format(z),
          "I1=" + xyzFormat.format(ip.x),
          "J1=" + xyzFormat.format(ip.y),
          "K1=" + xyzFormat.format(ip.z),
          getFeed(feed)
        );
        gMotionModal.reset();
        gPlaneModal.reset();
      } else {
        linearize(tolerance);
      }
    }
  } else { // use radius mode
    if (isHelical()) {
      linearize(tolerance);
      return;
    }
    var r = getCircularRadius();
    if (toDeg(getCircularSweep()) > (180 + 1e-9)) {
      r = -r; // allow up to <360 deg arcs
    }
    forceXYZ();
    switch (getCircularPlane()) {
    case PLANE_XY:
      writeBlock(gMotionModal.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), "CR=" + xyzFormat.format(r), getFeed(feed));
      break;
    case PLANE_ZX:
      writeBlock(gMotionModal.format(clockwise ? 2 : 3), xOutput.format(x), zOutput.format(z), "CR=" + xyzFormat.format(r), getFeed(feed));
      break;
    case PLANE_YZ:
      writeBlock(gMotionModal.format(clockwise ? 2 : 3), yOutput.format(y), zOutput.format(z), "CR=" + xyzFormat.format(r), getFeed(feed));
      break;
    default:
      linearize(tolerance);
    }
  }
}

var currentCoolantMode = undefined;

function forceCoolant() {
  currentCoolantMode = undefined;
}

function setCoolant(coolant) {
  if (coolant == currentCoolantMode) {
    return; // coolant is already active
  }
  
  var m;
  switch (coolant) {
  case COOLANT_OFF:
    m = 29;
    break;
  case COOLANT_FLOOD:
    m = 7;
    break;
  case COOLANT_THROUGH_TOOL:
    m = 8;
    break;
  case COOLANT_AIR:
    m = 85;
    break;
  default:
    onUnsupportedCoolant(coolant);
    m = 7;
  }
  
  if (m) {
    writeBlock(mFormat.format(m));
    currentCoolantMode = coolant;
	writeln("");
  }
}

var mapCommand = {
  COMMAND_STOP:0,
  COMMAND_OPTIONAL_STOP:1,
  COMMAND_END:30,
  COMMAND_SPINDLE_CLOCKWISE:3,
  COMMAND_SPINDLE_COUNTERCLOCKWISE:4,
  COMMAND_STOP_SPINDLE:5,
  COMMAND_ORIENTATE_SPINDLE:19,
  COMMAND_LOAD_TOOL:6
};

function onCommand(command) {
  switch (command) {
  case COMMAND_STOP:
    writeBlock(mFormat.format(0));
    forceSpindleSpeed = true;
    return;
  case COMMAND_COOLANT_OFF:
    setCoolant(COOLANT_OFF);
    return;
  case COMMAND_COOLANT_ON:
    setCoolant(COOLANT_FLOOD);
    setCoolant(COOLANT_THROUGH_TOOL);
    setCoolant(COOLANT_AIR);
    return;
  case COMMAND_START_SPINDLE:
    onCommand(tool.clockwise ? COMMAND_SPINDLE_CLOCKWISE : COMMAND_SPINDLE_COUNTERCLOCKWISE);
    return;
  case COMMAND_LOCK_MULTI_AXIS:
    return;
  case COMMAND_UNLOCK_MULTI_AXIS:
    return;
  case COMMAND_START_CHIP_TRANSPORT:
    return;
  case COMMAND_STOP_CHIP_TRANSPORT:
    return;
  case COMMAND_BREAK_CONTROL:
    return;
  case COMMAND_TOOL_MEASURE:
    return;
  }
  
  var stringId = getCommandStringId(command);
  var mcode = mapCommand[stringId];
  if (mcode != undefined) {
    writeBlock(mFormat.format(mcode));
  } else {
    onUnsupportedCommand(command);
  }
}

function onSectionEnd() {
  if (currentSection.isMultiAxis()) {
    writeBlock("TRAFOOF");
  }

  writeBlock(gPlaneModal.format(17));
  forceAny();
}

function onClose() {
  writeln("");

  //writeBlock(gMotionModal.format(0), "SUPA", "Z" + machineConfiguration.getRetractPlane(), "D0"); // retract
  writeBlock(gMotionModal.format(0), "SUPA", "Z600", "D0"); // retract
  writeBlock("D1"); // retract
  writeBlock("ANNUL"); // retract
  //writeBlock(gMotionModal.format(0), "SUPA", "Z600", "D0"); // retract
  writeBlock("X-430"); // retract

  setWorkPlane(new Vector(0, 0, 0), true); // reset working plane

  var homeX;
  if (machineConfiguration.hasHomePositionX()) {
    homeX = "X" + xyzFormat.format(machineConfiguration.getHomePositionX());
  }
  var homeY;
  if (machineConfiguration.hasHomePositionY()) {
    homeY = "Y" + xyzFormat.format(machineConfiguration.getHomePositionY());
  }
  if (homeX || homeY) {
    writeBlock(
      gMotionModal.format(0), "SUPA", homeX, homeY
    );
  }

  onImpliedCommand(COMMAND_END);
  onImpliedCommand(COMMAND_STOP_SPINDLE);
  writeBlock(mFormat.format(30)); // stop program, spindle stop, coolant off
}
