'use strict';
var COSMATT = COSMATT || {};
COSMATT.ProfileCalculation = COSMATT.ProfileCalculation || {};
COSMATT.ProfileCalculation.AccelDecelSegment = (function() {

  //Variables required for calculating delta elements;
  var dM1, dM2, dM3,
    dV1, dV2, dV3,
    dS1, dS2, dS3,
    Snorm, skewCorrectionFactor, accFormFactor, accSkewFactor;

  //Variables required to store intermediate values;
  var deltaM, avgVel, finalVelocity, deltaV, deltaBase, deltaRamp;

  //Variables to hold initial data
  var initialTime, initialVelocity, initialPosition;

  var outputData = {};

  var calculateDeltaElements = function() {
    //i.   Calculate dM1, dM2, dM3 separately to obtain DeltaM.
    dM2 = (2 / accFormFactor) - 1;
    dM1 = (1 - dM2) * (1 - accSkewFactor) / 2;
    dM3 = 1 - dM1 - dM2;

    //ii.   Calculate dV1, dV2, dV3 separately to obtain DeltaV.
    dV1 = accFormFactor * dM1 / 2;
    dV2 = accFormFactor * dM2;
    dV3 = accFormFactor * dM3 / 2;

    //iii.  Calculate dS1, dS2, dS3 separately to obtain DeltaS.
    dS1 = (dV1 / 3) * dM1;
    dS2 = ((dV2 + 2 * dV1) / 2) * dM2;
    dS3 = (1 - dV3 / 3) * dM3;

    Snorm = dS1 + dS2 + dS3;

    dS1 = dS1 / Snorm;
    dS2 = dS2 / Snorm;
    dS3 = dS3 / Snorm;

    skewCorrectionFactor = 0.5 / Snorm;

    //console.log('dM1 - ', dM1, 'dM2 - ', dM2, 'dM3 - ', dM3, 'dV1 - ', dV1, 'dV2 - ', dV2, 'dV3 - ', dV3, 'dS1 - ', dS1, 'dS2 - ', dS2, 'dS3 - ', dS3);
  };

  var calculateIntermediateVars = function(inputData) {
    switch (inputData.permutation) {
      case "TIME_DISTANCE":
        deltaM = inputData.time;
        avgVel = inputData.distance / deltaM;
        finalVelocity = initialVelocity + (avgVel - initialVelocity) * 2 * skewCorrectionFactor;
        deltaV = finalVelocity - initialVelocity;
        deltaBase = deltaM * initialVelocity;
        deltaRamp = inputData.distance - deltaBase;
        break;
      case "TIME_VELOCITY":
        // Case 1 - Time (T) – Final Velocity (Vf)
        deltaM = inputData.time;
        deltaV = inputData.velocity - initialVelocity;
        deltaRamp = deltaM * deltaV * Snorm;
        deltaBase = deltaM * initialVelocity;

        //console.log('deltaM - ', deltaM, 'deltaV - ', deltaV, 'deltaRamp', -deltaRamp, 'deltaBase - ', deltaBase);
        break;
      default:
        break;
    }

  };


  var calculateAccelElement = function() {
    if (dM1 > 0) {
      var deltaM1 = deltaM * dM1;

      var deltaS1 = deltaBase * dM1 + deltaRamp * dS1;

      var deltaV1 = deltaV * dV1;


      var ElementStartTime = initialTime;

      var ElementEndTime = ElementStartTime + deltaM1;


      var ElementStartPosition = initialPosition;

      var ElementEndPosition = ElementStartPosition + deltaS1;


      var ElementStartVelocity = initialVelocity;

      var ElementEndVelocity = ElementStartVelocity + deltaV1;


      var avgVel = (ElementEndVelocity + ElementStartVelocity) / 2;


      var Ka = (deltaS1 - (avgVel * deltaM1)) * (-2 / Math.pow(deltaM1, 3));


      var Kb = ((-3 * Ka * Math.pow(deltaM1, 2)) + deltaV1) / (2 * deltaM1);


      var Kc = ElementStartVelocity;


      var Kd = ElementStartPosition;


      var ElementStartAcc = 0;


      var ElementEndAcc = 6 * Ka * (ElementEndTime - ElementStartTime) + 2 * Kb;


      var ElementRmsAccel = Math.abs(ElementEndAcc);


      var ElementRmsVel = Math.sqrt((Math.pow(ElementStartVelocity, 2) + Math.pow(ElementEndVelocity, 2)) / 2);


      var ElementJerk = 6 * Ka;



      //console.log('deltaM1 - ', deltaM1, 'deltaS1 - ', deltaS1, 'deltaV1 - ', deltaV1, 'ElementStartTime - ', ElementStartTime, 'ElementEndTime - ', ElementEndTime, 'ElementStartPosition - ', ElementStartPosition, 'ElementEndPosition - ', ElementEndPosition, 'ElementStartVelocity - ', ElementStartVelocity, 'ElementEndVelocity - ', ElementEndVelocity, 'avgVel - ', avgVel, 'Ka - ', Ka, 'Kb - ', Kb, 'Kc - ', Kc, 'Kd - ', Kd, 'ElementStartAcc - ', ElementStartAcc, 'ElementEndAcc - ', ElementEndAcc, 'ElementRmsAccel - ', ElementRmsAccel, 'ElementRmsVel - ', ElementRmsVel, 'ElementJerk - ', ElementJerk);

      //Save Data to Service
      var AccelElement = {
        'time_initial': ElementStartTime,
        'time_final': ElementEndTime,
        'velocity_initial': ElementStartVelocity,
        'velocity_final': ElementEndVelocity,
        'acceleration_initial': ElementStartAcc,
        'acceleration_final': ElementEndAcc,
        'position_initial': ElementStartPosition,
        'position_final': ElementEndPosition,
        'motion_equation_third_order_coefficient': Ka,
        'motion_equation_second_order_coefficient': Kb,
        'motion_equation_first_order_coefficient': Kc,
        'motion_equation_zero_order_coefficient': Kd,
        'rms_acceleration': ElementRmsAccel,
        'rms_velocity': ElementRmsVel,
        'jerk': ElementJerk
      }


      outputData.ElementsData.push(AccelElement);

      initialTime = ElementEndTime;
      initialPosition = ElementEndPosition;
      initialVelocity = ElementEndVelocity;
    }
  }

  var calculateCruiseElement = function() {
    if (dM2 > 0) {
      var deltaM2 = deltaM * dM2;

      var deltaS2 = deltaBase * dM2 + deltaRamp * dS2;

      var deltaV2 = deltaV * dV2;

      var ElementStartTime = initialTime;
      var ElementEndTime = ElementStartTime + deltaM2;

      var ElementStartPosition = initialPosition;
      var ElementEndPosition = ElementStartPosition + deltaS2;

      var ElementStartVelocity = initialVelocity;
      var ElementEndVelocity = ElementStartVelocity + deltaV2;


      var avgVel = (ElementEndVelocity + ElementStartVelocity) / 2;

      var Ka = 0;

      var Kb = ((-3 * Ka * Math.pow(deltaM2, 2)) + deltaV2) / (2 * deltaM2);

      var Kc = ElementStartVelocity;

      var Kd = ElementStartPosition;

      var ElementStartAcc = 2 * Kb;

      var ElementEndAcc = 6 * Ka * (ElementEndTime - ElementStartTime) + 2 * Kb;

      var ElementRmsAccel = Math.abs(ElementEndAcc);

      var ElementRmsVel = Math.sqrt((Math.pow(ElementStartVelocity, 2) + Math.pow(ElementEndVelocity, 2)) / 2);

      var ElementJerk = 6 * Ka;

      //Save Data to Service
      var CruiseElement = {
        'time_initial': ElementStartTime,
        'time_final': ElementEndTime,
        'velocity_initial': ElementStartVelocity,
        'velocity_final': ElementEndVelocity,
        'acceleration_initial': ElementStartAcc,
        'acceleration_final': ElementEndAcc,
        'position_initial': ElementStartPosition,
        'position_final': ElementEndPosition,
        'motion_equation_third_order_coefficient': Ka,
        'motion_equation_second_order_coefficient': Kb,
        'motion_equation_first_order_coefficient': Kc,
        'motion_equation_zero_order_coefficient': Kd,
        'rms_acceleration': ElementRmsAccel,
        'rms_velocity': ElementRmsVel,
        'jerk': ElementJerk
      }


      //console.log('deltaM2 - ', deltaM2, 'deltaS2 - ', deltaS2, 'deltaV2 - ', deltaV2, 'ElementStartTime - ', ElementStartTime, 'ElementEndTime - ', ElementEndTime, 'ElementStartPosition - ', ElementStartPosition, 'ElementEndPosition - ', ElementEndPosition, 'ElementStartVelocity - ', ElementStartVelocity, 'ElementEndVelocity - ', ElementEndVelocity, 'avgVel - ', avgVel, 'Ka - ', Ka, 'Kb - ', Kb, 'Kc - ', Kc, 'Kd - ', Kd, 'ElementStartAcc - ', ElementStartAcc, 'ElementEndAcc - ', ElementEndAcc, 'ElementRmsAccel - ', ElementRmsAccel, 'ElementRmsVel - ', ElementRmsVel, 'ElementJerk - ', ElementJerk);

      outputData.ElementsData.push(CruiseElement);

      initialTime = ElementEndTime;
      initialPosition = ElementEndPosition;
      initialVelocity = ElementEndVelocity;
    }
  }

  var calculateDecelElement = function() {
    if (dM3 > 0) {
      var deltaM3 = deltaM * dM3;
      var deltaS3 = deltaBase * dM3 + deltaRamp * dS3;
      var deltaV3 = deltaV * dV3;

      var ElementStartTime = initialTime;
      var ElementEndTime = ElementStartTime + deltaM3;

      var ElementStartPosition = initialPosition;
      var ElementEndPosition = ElementStartPosition + deltaS3;

      var ElementStartVelocity = initialVelocity;
      var ElementEndVelocity = ElementStartVelocity + deltaV3;


      var avgVel = (ElementEndVelocity + ElementStartVelocity) / 2;

      var Ka = (deltaS3 - (avgVel * deltaM3)) * (-2 / Math.pow(deltaM3, 3));

      var Kb = ((-3 * Ka * Math.pow(deltaM3, 2)) + deltaV3) / (2 * deltaM3);

      var Kc = ElementStartVelocity;

      var Kd = ElementStartPosition;

      var ElementStartAcc = 2 * Kb;

      var ElementEndAcc = 0;

      var ElementRmsAccel = Math.abs(ElementEndAcc);

      var ElementRmsVel = Math.sqrt((Math.pow(ElementStartVelocity, 2) + Math.pow(ElementEndVelocity, 2)) / 2);

      var ElementJerk = 6 * Ka;

      //Save Data to Service
      var DecelElement = {
        'time_initial': ElementStartTime,
        'time_final': ElementEndTime,
        'velocity_initial': ElementStartVelocity,
        'velocity_final': ElementEndVelocity,
        'acceleration_initial': ElementStartAcc,
        'acceleration_final': ElementEndAcc,
        'position_initial': ElementStartPosition,
        'position_final': ElementEndPosition,
        'motion_equation_third_order_coefficient': Ka,
        'motion_equation_second_order_coefficient': Kb,
        'motion_equation_first_order_coefficient': Kc,
        'motion_equation_zero_order_coefficient': Kd,
        'rms_acceleration': ElementRmsAccel,
        'rms_velocity': ElementRmsVel,
        'jerk': ElementJerk
      };



      //console.log('deltaM3 - ', deltaM3, 'deltaS3 - ', deltaS3, 'deltaV3 - ', deltaV3, 'ElementStartTime - ', ElementStartTime, 'ElementEndTime - ', ElementEndTime, 'ElementStartPosition - ', ElementStartPosition, 'ElementEndPosition - ', ElementEndPosition, 'ElementStartVelocity - ', ElementStartVelocity, 'ElementEndVelocity - ', ElementEndVelocity, 'avgVel - ', avgVel, 'Ka - ', Ka, 'Kb - ', Kb, 'Kc - ', Kc, 'Kd - ', Kd, 'ElementStartAcc - ', ElementStartAcc, 'ElementEndAcc - ', ElementEndAcc, 'ElementRmsAccel - ', ElementRmsAccel, 'ElementRmsVel - ', ElementRmsVel, 'ElementJerk - ', ElementJerk)

      outputData.ElementsData.push(DecelElement);

      //Update Global vars for storing initial values required by  other elements
      initialTime = ElementEndTime;
      initialPosition = ElementEndPosition;
      initialVelocity = ElementEndVelocity;
    }
  }

  var calculateIndividualElements = function() {
    calculateAccelElement();
    calculateCruiseElement();
    calculateDecelElement();
  };

  var updateFinalParams = function() {
    var ElementsData = outputData.ElementsData;
    var ElementsLength = ElementsData.length;
    var distance = ElementsData[ElementsLength - 1].position_final - ElementsData[0].position_initial;

    outputData.SegmentData.distance = distance;
  }


  var calculate = function(inputData, initials) {
    //console.log('-------------------------------------------------- AccelDecelElement --------------------------------------------------')
    outputData = {};

    outputData.ElementsData = [];

    outputData.SegmentData = {};

    accSkewFactor = (inputData.skewPercentage / 100) || 0;

    accFormFactor = (1 / (1 - inputData.jerkPercentage / 200)) || 1;

    initialTime = initials.time || 0;

    initialVelocity = initials.velocity || 0;

    initialPosition = initials.position || 0;

    calculateDeltaElements();

    calculateIntermediateVars(inputData);

    calculateIndividualElements();

    updateFinalParams();

    return outputData;
  };

  return {
    calculate: calculate
  };
})();
'use strict';
var COSMATT = COSMATT || {};
COSMATT.ProfileCalculation = COSMATT.ProfileCalculation || {};
COSMATT.ProfileCalculation.CruiseSegment = (function() {

  //Variables to hold initial data
  var initialTime, initialVelocity, initialPosition;

  var segmentTime, segmentDistance;

  var outputData = {};

  var calculateIntermediateVars = function(inputData) {
    switch (inputData.permutation) {
      case "TIME":
        segmentTime = inputData.time;
        segmentDistance = segmentTime * initialVelocity;

        //console.log('segmentTime - ', segmentTime, 'segmentDistance - ', segmentDistance)
        break;
      default:
        break;
    }

  };

  var calculateElementsData = function() {

    var ElementStartTime = initialTime;
    var ElementEndTime = ElementStartTime + segmentTime;

    var ElementStartPosition = initialPosition;
    var ElementEndPosition = ElementStartPosition + segmentDistance;

    var ElementStartVelocity = initialVelocity;
    var ElementEndVelocity = ElementStartVelocity;

    var Ka = 0;

    var Kb = 0;

    var Kc = ElementStartVelocity;

    var Kd = ElementStartPosition;

    var ElementStartAcc = 0;

    var ElementEndAcc = 0;

    var ElementRmsAccel = Math.abs(ElementEndAcc);

    var ElementRmsVel = Math.sqrt((Math.pow(ElementStartVelocity, 2) + Math.pow(ElementEndVelocity, 2)) / 2);


    //console.log('ElementStartTime - ', ElementStartTime, 'ElementEndTime - ', ElementEndTime, 'ElementStartPosition - ', ElementStartPosition, 'ElementEndPosition - ', ElementEndPosition, 'ElementStartVelocity - ', ElementStartVelocity, 'ElementEndVelocity - ', ElementEndVelocity, 'Ka - ', Ka, 'Kb - ', Kb, 'Kc - ', Kc, 'Kd - ', Kd, 'ElementStartAcc - ', ElementStartAcc, 'ElementEndAcc - ', ElementEndAcc, 'ElementRmsAccel - ', ElementRmsAccel, 'ElementRmsVel - ', ElementRmsVel);

    //Save Data to Service
    var Element = {
      'time_initial': ElementStartTime,
      'time_final': ElementEndTime,
      'velocity_initial': ElementStartVelocity,
      'velocity_final': ElementEndVelocity,
      'acceleration_initial': ElementStartAcc,
      'acceleration_final': ElementEndAcc,
      'position_initial': ElementStartPosition,
      'position_final': ElementEndPosition,
      'motion_equation_third_order_coefficient': Ka,
      'motion_equation_second_order_coefficient': Kb,
      'motion_equation_first_order_coefficient': Kc,
      'motion_equation_zero_order_coefficient': Kd,
      'rms_acceleration': ElementRmsAccel,
      'rms_velocity': ElementRmsVel,
    }


    outputData.ElementsData.push(Element);
  };

  var updateFinalParams = function() {
    var ElementsData = outputData.ElementsData;

    var distance = ElementsData[0].position_final - ElementsData[0].position_initial;

    outputData.SegmentData.distance = distance;
  };


  var calculate = function(inputData, initials) {
    //console.log('-------------------------------------------------- Cruise/Dwell Element --------------------------------------------------')

    outputData = {};

    outputData.ElementsData = [];

    outputData.SegmentData = {};

    initialTime = initials.time || 0;

    initialVelocity = initials.velocity || 0;

    initialPosition = initials.position || 0;

    calculateIntermediateVars(inputData);

    calculateElementsData();

    updateFinalParams();

    return outputData;
  };

  return {
    calculate: calculate
  };
})();
'use strict';
var COSMATT = COSMATT || {};
COSMATT.ProfileCalculation = COSMATT.ProfileCalculation || {};
COSMATT.ProfileCalculation.ProfileIndexModel = (function() {
  var outputData = [];
  var segmentData = {};
  var accelJerk = 0;
  var decelJerk = 0;
  var initialTime, initialVelocity, initialPosition, finalVelocity;
  var movedistance, movedtime, velFormFactor, velSkewFactor, dweltime;
  var averageVel, cruiseVel, accelTime, decelTime, cruiseTime, accelDistance, decelDistance, cruiseDistance, dwelDistance;

  var updateAccelDecelJerkVariables = function(selectedVal) {
    selectedVal = parseInt(selectedVal);
    if (!isNaN(selectedVal)) {
      switch (selectedVal) {
        case 0:
          accelJerk = 0;
          decelJerk = 0;
          break;
        case 1:
          accelJerk = 40;
          decelJerk = 40;
          break;
        case 2:
          accelJerk = 100;
          decelJerk = 100;
          break;
        default:
          break;
      }
    }
  };

  var updateVelocityJerkSkewVars = function(inputData) {
    var velJerkPerc, velSkewperc;
    if (inputData.velocityJerk != undefined) {
      velJerkPerc = inputData.velocityJerk;
    } else {
      velJerkPerc = 50;
    }

    if (inputData.velocitySkew != undefined) {
      velSkewperc = inputData.velocitySkew;
    } else {
      velSkewperc = 0;
    }
    velFormFactor = velJerkPerc / 100 + 1; //1.5 by default
    velSkewFactor = velSkewperc / 100; //0 by default
  };

  var ResolveIntoElements = function() {
    //console.log('-------------------------------------------------- ResolveIntoElements --------------------------------------------------');
    accelDistance = decelDistance = cruiseDistance = dwelDistance = 0;
    averageVel = (movedistance - (initialVelocity * movedtime)) / movedtime;
    cruiseVel = averageVel * velFormFactor;

    if (cruiseVel == 0) {
      console.log('cruise velocity zero');
      //needs to be handleed later
    } else {
      //initial distance 0 if initialVel is zero
      var totalAccelDecelTime = 2 * (cruiseVel * movedtime - (movedistance - (initialVelocity * movedtime))) / cruiseVel;

      //Add effect of skew factor for finding accel and decel time
      accelTime = totalAccelDecelTime * (1 + velSkewFactor) / 2;
      decelTime = totalAccelDecelTime * (1 - velSkewFactor) / 2;

      cruiseTime = movedtime - totalAccelDecelTime;

      //console.log('accelJerk - ', accelJerk, 'decelJerk - ', decelJerk, 'averageVel - ', averageVel, 'velFormFactor - ', velFormFactor, 'cruiseVel - ', cruiseVel, 'totalAccelDecelTime - ', totalAccelDecelTime, 'accelTime - ', accelTime, 'decelTime - ', decelTime, 'cruiseTime - ', cruiseTime);

      if (accelTime > 0) {
        var accelInputdata = {};
        var accelInitialValues = {};

        accelInputdata.permutation = 'TIME_VELOCITY';
        accelInputdata.velocity = cruiseVel + initialVelocity;
        accelInputdata.time = accelTime;
        accelInputdata.jerkPercentage = accelJerk;
        accelInputdata.skewPercentage = 0;

        accelInitialValues.position = initialPosition;
        accelInitialValues.velocity = initialVelocity;
        accelInitialValues.time = initialTime;


        var accelSegment = COSMATT.ProfileCalculation.AccelDecelSegment.calculate(accelInputdata, accelInitialValues);

        accelDistance = accelSegment.SegmentData.distance;

        outputData = outputData.concat(accelSegment.ElementsData);
        segmentData.accel = accelSegment.ElementsData;
      }

      if (cruiseTime > 0) {
        var cruiseInputdata = {};
        var cruiseInitialValues = {};

        cruiseInputdata.permutation = 'TIME';
        cruiseInputdata.velocity = cruiseVel + initialVelocity;
        cruiseInputdata.time = cruiseTime;
        cruiseInputdata.skewPercentage = 0;

        cruiseInitialValues.position = initialPosition + accelDistance;
        cruiseInitialValues.velocity = initialVelocity + cruiseVel;
        cruiseInitialValues.time = initialTime + accelTime;

        var cruiseSegment = COSMATT.ProfileCalculation.CruiseSegment.calculate(cruiseInputdata, cruiseInitialValues);

        cruiseDistance = cruiseSegment.SegmentData.distance;

        outputData = outputData.concat(cruiseSegment.ElementsData);
        segmentData.cruise = cruiseSegment.ElementsData;

      }

      if (decelTime > 0) {
        var decelInputdata = {};
        var decelInitialValues = {};

        decelInputdata.permutation = 'TIME_VELOCITY';
        decelInputdata.velocity = finalVelocity;
        decelInputdata.time = decelTime;
        decelInputdata.jerkPercentage = decelJerk;
        decelInputdata.skewPercentage = 0;

        decelInitialValues.position = initialPosition + accelDistance + cruiseDistance; //how to find acceldistance
        decelInitialValues.velocity = cruiseVel + initialVelocity;
        decelInitialValues.time = initialTime + accelTime + cruiseTime;;

        var decelSegment = COSMATT.ProfileCalculation.AccelDecelSegment.calculate(decelInputdata, decelInitialValues);

        decelDistance = decelSegment.SegmentData.distance;

        outputData = outputData.concat(decelSegment.ElementsData);
        segmentData.decel = decelSegment.ElementsData;

      }

      if (dweltime > 0) {
        var dwelInputdata = {};
        var dwelInitialValues = {};


        dwelInputdata.permutation = 'TIME';
        dwelInputdata.velocity = finalVelocity;
        dwelInputdata.time = dweltime;
        dwelInputdata.skewPercentage = 0;

        dwelInitialValues.position = initialPosition + movedistance;
        dwelInitialValues.velocity = finalVelocity;
        dwelInitialValues.time = initialTime + movedtime;

        var dwelSegment = COSMATT.ProfileCalculation.CruiseSegment.calculate(dwelInputdata, dwelInitialValues);

        dwelDistance = dwelSegment.SegmentData.distance;

        outputData = outputData.concat(dwelSegment.ElementsData);

        segmentData.dwell = dwelSegment.ElementsData;
      }
    }
  }


  var calculate = function(inputData, initials) {

    outputData = [];
    segmentData = [];

    //Assign values to the calculation variables
    movedistance = inputData.movedistance || 0;

    movedtime = inputData.movedtime || 0;

    dweltime = inputData.dweltime || 0;

    updateVelocityJerkSkewVars(inputData)

    updateAccelDecelJerkVariables(inputData.smoothness);

    initialTime = initials.time || 0;

    initialVelocity = initials.velocity || 0;

    initialPosition = initials.position || 0;

    finalVelocity = initialVelocity;

    if (movedistance > 0 && movedtime > 0) {
      ResolveIntoElements();
    } else {
      throw {
        "message": "Time and distance needs to be positive values for Profile calculations"
      };
    }

    return {
      elementsData: outputData,
      segmentData: segmentData
    }
  };

  return {
    calculate: calculate
  };
})();
'use strict';

var COSMATT = COSMATT || {};
COSMATT.MotionProfile = COSMATT.MotionProfile || {};

COSMATT.MotionProfile.configuration = {
  DataFields: {
    moveDistance: "moveDistance",
    moveTime: "moveTime",
    dwellTime: "dwellTime",
    velocityFormFactor: "indexType",
    peakVelocity: "peakVelocity",
    rmsVelocity: "rmsVelocity",
    peakAccelaration: "peakAcc",
    rmsAccelaration: "rmsAcc",
    showAll: true
  },
  Profiles: {
    profile1: "profile1",
    profile2: "profile2",
    profile3: "profile3",
    showAll: true
  },
  GraphMode: {
    individualAxis: 0,
    sameAxis: 1
  },
  Graphs: {
    position: "pos",
    velocity: "vel",
    acceleration: "acc",
    jerk: "jerk",
    showAll: true
  },
  GraphHandles: {
    position: "position",
    peakVelocity: "peakVelocity",
    moveTime: "moveTime",
    dwellTime: "dwellTime",
    showAll: true
  },
  Smoothness: {
    automatic: 0,
    standard: 1,
    maximum: 2
  }
};

(function($) {
  $.fn.motionProfile = function(options) {
    var defaults = {
      activeProfileIndex: 1,
      moveDistance: 20,
      moveTime: 10,
      dwellTime: 2,
      graphMode: COSMATT.MotionProfile.configuration.GraphMode.individualAxis,
      showGraphs: [COSMATT.MotionProfile.configuration.Graphs.velocity],
      showGraphDragHandles: COSMATT.MotionProfile.configuration.GraphHandles.showAll,
      readOnlyInputs: false,
      hideInputs: false,
      showProfiles: COSMATT.MotionProfile.configuration.Profiles.showAll,
      smoothness: COSMATT.MotionProfile.configuration.Smoothness.automatic,
      showCheckAnswerButton: false,
      assessmentMode: false,
      moveDistanceUnit: 0,
      moveTimeUnit: 0,
      dwellTimeUnit: 0,
      peakVelocityUnit: 0,
      rmsVelocityUnit: 0,
      peakAccelarationUnit: 0,
      rmsAccelarationUnit: 0
    };

    if (options.assessmentMode) {
      defaults.moveDistance = "";
      defaults.moveTime = "";
      defaults.dwellTime = "";
      defaults.activeProfileIndex = 3;
    }

    var settings = $.extend(defaults, options);
    var $container = this;
    var $widgetContainer = $('<div class="cosmatt-motionProfile unselectable" unselectable="on"></div>');
    $container.append($widgetContainer);
    $widgetContainer.append('<div id="profileButtons"><button class="btn btn-default profileButton" id="btn1">Profile 1</button><button class="btn btn-default profileButton" id="btn2">Profile 2</button><button class="btn btn-default profileButton" id="btn3">Profile 3</button></div><div id="graphContainer"></div><div id="inputControls"></div>');
    if (options.assessmentMode) {
      $widgetContainer.addClass("assessment-mode");
    }
    var uiValues = {};
    var SIValues = {};
    var initialValues = {};
    var calculatedValues = {};
    var outputData;

    var $inputControls = $widgetContainer.find("#inputControls");
    var minVel, maxVel, dwellStart = 0;
    var AreaUnderCurve = 0;
    var posPlot, velPlot, accPlot, aioPlot, jerkPlot;
    var xmin = settings.xmin !== undefined ? parseFloat(settings.xmin) : 15;
    var posYMax = settings.posYmin !== undefined ? parseFloat(settings.posYmin) : 30;
    var velYMax = settings.velYmin !== undefined ? parseFloat(settings.velYmin) : 8;
    var accYMax = settings.accYmin !== undefined ? parseFloat(settings.accYmin) : 2;
    var jerkYMax = settings.jerkYmin !== undefined ? parseFloat(settings.jerkYmin) : 3;

    var dataSet = { //setting initial values for graph
      "vel": {
        label: "Velocity",
        data: [],
        color: "#f7252a",
        lines: {
          show: true
        },
        hoverable: false,
        clickable: false
      },
      "pos": {
        label: "Position",
        data: [],
        color: "#619beb",
        series: {
          lines: {
            show: false
          }
        },
        hoverable: false,
        clickable: false
      },
      "acc": {
        label: "Acceleration",
        data: [],
        color: "#ff8a65",
        series: {
          lines: {
            show: false
          }
        },
        hoverable: false,
        clickable: false
      },
      "jerk": {
        label: "Jerk",
        data: [],
        color: "#40cc43",
        series: {
          lines: {
            show: false
          }
        },
        hoverable: false,
        clickable: false
      }
    };

    var pointsDataSet = { //setting initial values for graph
      "vel": {
        data: [],
        color: "#ef7c7f",
        lines: {
          show: false
        },
        points: {
          show: true,
          fillColor: '#ef7c7f'
        },
        // highlightColor: 'transparent'
      },
      "pos": {
        data: [],
        color: "#619beb",
        lines: {
          show: false
        },
        points: {
          show: true,
          fillColor: '#619beb'
        },
        // highlightColor: 'transparent'
      },
      "acc": {
        label: "Acceleration",
        data: [],
        color: "#ff8a65"
      },
      "jerk": {
        label: "Jerk",
        data: [],
        color: "#40cc43"
      },
      "dwell": {
        data: [],
        color: "#ef7c7f",
        lines: {
          show: false
        },
        points: {
          show: true,
          fillColor: "#ef7c7f"
        },
        // highlightColor: 'transparent'
      },
      "movetime": {
        data: [],
        color: "#ef7c7f",
        lines: {
          show: false
        },
        points: {
          show: true,
          fillColor: "#ef7c7f"
        },
        // highlightColor: 'transparent'
      }
    };

    var chartOptions = {
      series: {
        lines: {
          show: true
        }
      },
      xaxis: {
        axisLabel: 'Time (sec)',
        position: 'bottom'
      },
      legend: {
        show: true
      },
      grid: {
        hoverable: true,
        clickable: true,
        borderWidth: {
          top: 0,
          bottom: 1,
          right: 0,
          left: 1
        }
      }
    };

    var resetProfileData = function() {
      for (var key in dataSet) {
        if (dataSet.hasOwnProperty(key)) {
          dataSet[key].data = [];
        }
      }
      for (var key in pointsDataSet) {
        if (pointsDataSet.hasOwnProperty(key)) {
          pointsDataSet[key].data = [];
        }
      }
    };

    var getHighestPoint = function(segmentData, axis, leastVal) {
      var keys = Object.keys(segmentData);
      var highestVal = 0;
      for (var keyIndex in keys) {
        if (keys.hasOwnProperty(keyIndex)) {
          var finalVal = 1.2 * segmentData[keys[keyIndex]][0][axis];
          if (highestVal < finalVal) {
            highestVal = finalVal;
          }
        }
      }
      if (highestVal < leastVal) {
        highestVal = leastVal;
      }
      return highestVal;
    };

    var getAioGraphPoints = function() {
      // updating graphs to be displayed
      var aioGraphPointsArr = [];
      if (settings.showGraphs.length > 0) {
        if (settings.showGraphs.indexOf(COSMATT.MotionProfile.configuration.Graphs.position) > -1) {
          aioGraphPointsArr.push(dataSet.pos, pointsDataSet.pos);
        } else {
          aioGraphPointsArr.push([], []);
        }

        if (settings.showGraphs.indexOf(COSMATT.MotionProfile.configuration.Graphs.velocity) > -1) {
          aioGraphPointsArr.push(dataSet.vel, pointsDataSet.vel, pointsDataSet.dwell, pointsDataSet.movetime);
        } else {
          aioGraphPointsArr.push([], [], [], []);
        }

        if (settings.showGraphs.indexOf(COSMATT.MotionProfile.configuration.Graphs.acceleration) > -1) {
          aioGraphPointsArr.push(dataSet.acc);
        } else {
          aioGraphPointsArr.push([]);
        }

        if (settings.showGraphs.indexOf(COSMATT.MotionProfile.configuration.Graphs.jerk) > -1) {
          aioGraphPointsArr.push(dataSet.jerk);
        } else {
          aioGraphPointsArr.push([]);
        }
      }
      return aioGraphPointsArr;
    };

    var updateGraph = function(segmentData) {
      var keys = Object.keys(segmentData);
      var highestTime = getHighestPoint(segmentData, "time_final", xmin);

      if (posPlot) {
        var highestYPtPos = getHighestPoint(segmentData, "position_final", posYMax);
        posPlot.getOptions().yaxes[0].max = highestYPtPos;
        posPlot.getOptions().yaxes[0].min = -1 * highestYPtPos;
        posPlot.getOptions().xaxes[0].max = highestTime;
        posPlot.setupGrid();
        posPlot.setData([dataSet.pos, pointsDataSet.pos]);
        posPlot.draw();
      }

      if (velPlot) {
        var highestYPtVel = getHighestPoint(segmentData, "velocity_final", velYMax);
        velPlot.getOptions().yaxes[0].max = highestYPtVel;
        velPlot.getOptions().yaxes[0].min = -1 * highestYPtVel;
        velPlot.getOptions().xaxes[0].max = highestTime;
        velPlot.setupGrid();
        velPlot.setData([dataSet.vel, pointsDataSet.vel, pointsDataSet.dwell, pointsDataSet.movetime]);
        velPlot.draw();
      }

      if (accPlot) {
        var highestYPtAcc = getHighestPoint(segmentData, "acceleration_final", accYMax);
        accPlot.getOptions().yaxes[0].max = highestYPtAcc;
        accPlot.getOptions().yaxes[0].min = -1 * highestYPtAcc;
        accPlot.getOptions().xaxes[0].max = highestTime;
        accPlot.setupGrid();
        accPlot.setData([dataSet.acc]);
        accPlot.draw();
      }

      if (jerkPlot) {
        var highestYPtJerk = getHighestPoint(segmentData, "jerk", jerkYMax);
        jerkPlot.getOptions().yaxes[0].max = highestYPtJerk;
        jerkPlot.getOptions().yaxes[0].min = -1 * highestYPtJerk;
        jerkPlot.getOptions().xaxes[0].max = highestTime;
        jerkPlot.setupGrid();
        jerkPlot.setData([dataSet.jerk]);
        jerkPlot.draw();
      }

      if (aioPlot) {
        var yaxesArr = aioPlot.getOptions().yaxes;
        var highestYPt;

        for (var i = 0; i < yaxesArr.length; i++) {
          switch (yaxesArr[i].axisLabel) {
            case "Position (rad)":
              highestYPt = getHighestPoint(segmentData, "position_final", posYMax);
              break;
            case "Velocity (rad/sec)":
              highestYPt = getHighestPoint(segmentData, "velocity_final", velYMax);
              break;
            case "Acceleration (rad/sec^2)":
              highestYPt = getHighestPoint(segmentData, "acceleration_final", accYMax);
              break;
            case "Jerk (rad/sec^3)":
              highestYPt = getHighestPoint(segmentData, "jerk", jerkYMax);
              break;
          }
          aioPlot.getOptions().yaxes[i].max = highestYPt;
          aioPlot.getOptions().yaxes[i].min = -1 * highestYPt;
        }

        // //pos plot
        // var highestYPtPos = getHighestPoint(segmentData, "position_final", posYMax);
        // aioPlot.getOptions().yaxes[0].max = highestYPtPos;
        // aioPlot.getOptions().yaxes[0].min = -1 * highestYPtPos;

        // //vel plot
        // var highestYPtVel = getHighestPoint(segmentData, "velocity_final", velYMax);
        // aioPlot.getOptions().yaxes[1].max = highestYPtVel;
        // aioPlot.getOptions().yaxes[1].min = -1 * highestYPtVel;

        // //acc plot
        // var highestYPtAcc = getHighestPoint(segmentData, "acceleration_final", accYMax);
        // aioPlot.getOptions().yaxes[2].max = highestYPtAcc;
        // aioPlot.getOptions().yaxes[2].min = -1 * highestYPtAcc;

        // //jerk plot
        // var highestYPtJerk = getHighestPoint(segmentData, "jerk", jerkYMax);
        // aioPlot.getOptions().yaxes[3].max = highestYPtJerk;
        // aioPlot.getOptions().yaxes[3].min = -1 * highestYPtJerk;

        aioPlot.getOptions().xaxes[0].max = highestTime;
        aioPlot.setupGrid();
        aioPlot.setData(getAioGraphPoints());
        aioPlot.draw();
      }
    };

    var plotGraph = function(segmentData) {
      var posMax = getHighestPoint(segmentData, "position_final", posYMax);
      var velMax = getHighestPoint(segmentData, "velocity_final", velYMax);
      var accMax = getHighestPoint(segmentData, "acceleration_final", accYMax);
      var timeMax = getHighestPoint(segmentData, "time_final", xmin);
      var jerkMax = getHighestPoint(segmentData, "jerk", jerkYMax);
      //append graphs to dom
      var $graphContainer = $widgetContainer.find("#graphContainer");
      if ($graphContainer.children().length === 0) {
        if (settings.graphMode === 0) {
          for (var i = 0; i < settings.showGraphs.length; i++) {
            $graphContainer.append('<div id="' + settings.showGraphs[i] + 'Graph" class="graphArea"></div>');
            // $graphContainer.append('<div id="' + settings.showGraphs[i] + 'Graph" class="graphArea col-xs-12"></div>');
          }
        } else if (settings.graphMode === 1) {
          $graphContainer.append('<div id="aioGraph" class="graphArea"></div>');
        }
      }
      // $graphContainer.find('.graphArea').css("min-width", (100 / $graphContainer.children().length) + "%");
      $graphContainer.find('.graphArea').addClass("col-xs-" + 12 / $graphContainer.children().length + " col-" + 12 / $graphContainer.children().length);

      var $posGraph = $graphContainer.find("#posGraph");
      var $velGraph = $graphContainer.find("#velGraph");
      var $accGraph = $graphContainer.find("#accGraph");
      var $jerkGraph = $graphContainer.find("#jerkGraph");
      var $aioGraph = $graphContainer.find("#aioGraph");

      if ($posGraph.length > 0) {
        posPlot = $.plot($posGraph, [dataSet.pos, pointsDataSet.pos], $.extend(true, {
          yaxis: {
            min: -1 * posMax,
            max: posMax,
            position: "left",
            axisLabel: "Position (rad)"
          },
          xaxis: {
            min: 0,
            max: timeMax
          }
        }, chartOptions));
        addDragDropFunctionalityPostion(posPlot);
      }
      if ($velGraph.length > 0) {
        velPlot = $.plot($velGraph, [dataSet.vel, pointsDataSet.vel, pointsDataSet.dwell, pointsDataSet.movetime], $.extend(true, {
          yaxis: {
            min: -1 * velMax,
            max: velMax,
            position: "left",
            axisLabel: "Velocity (rad/sec)"
          },
          xaxis: {
            min: 0,
            max: timeMax
          }
        }, chartOptions));
        addDragDropFunctionality(velPlot);
      }
      if ($accGraph.length > 0) {
        accPlot = $.plot($accGraph, [dataSet.acc], $.extend(true, {
          yaxis: {
            min: -1 * accMax,
            max: accMax,
            position: "left",
            axisLabel: "Acceleration (rad/sec^2)"
          },
          xaxis: {
            min: 0,
            max: timeMax
          }
        }, chartOptions));
      }

      if ($jerkGraph.length > 0) {
        jerkPlot = $.plot($jerkGraph, [dataSet.jerk], $.extend(true, {
          yaxis: {
            min: -1 * jerkMax,
            max: jerkMax,
            position: "left",
            axisLabel: "Jerk (rad/sec^3)"
          },
          xaxis: {
            min: 0,
            max: timeMax
          }
        }, chartOptions));
        addDragDropFunctionalityPostion(posPlot);
      }

      if ($aioGraph.length > 0) {
        var yaxesOptions = {
          'pos': {
            position: "left",
            axisLabel: "Position (rad)",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            min: -1 * posMax,
            max: posMax
          },
          'vel': {
            position: "left",
            axisLabel: "Velocity (rad/sec)",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            min: -1 * velMax,
            max: velMax
          },
          'acc': {
            position: "left",
            axisLabel: "Acceleration (rad/sec^2)",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            min: -1 * accMax,
            max: accMax
          },
          'jerk': {
            position: "left",
            axisLabel: "Jerk (rad/sec^3)",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            min: -1 * jerkMax,
            max: jerkMax
          }
        }

        var aioOptions = $.extend(true, {
          yaxes: (function() {
            var yaxesArr = [];
            for (var i = 0; i < settings.showGraphs.length; i++) {
              yaxesArr[i] = yaxesOptions[settings.showGraphs[i]];

              dataSet[settings.showGraphs[i]].yaxis = i + 1;
              pointsDataSet[settings.showGraphs[i]].yaxis = i + 1;
            }
            return yaxesArr;
          })(),
          xaxis: {
            min: 0,
            max: timeMax
          }
        }, chartOptions);
        aioOptions.legend = {
          "show": true,
          "backgroundOpacity": 0
        };

        aioPlot = $.plot($aioGraph, getAioGraphPoints(), aioOptions);
        addDragDropFunctionalityAIO(aioPlot);
      }

      if (settings.onGraphPaint) {
        settings.onGraphPaint();
      }
    };

    var plotEmptyGraph = function() { // var posMax = getHighestPoint(segmentData, "position_final", posYMax);
      // var velMax = getHighestPoint(segmentData, "velocity_final", velYMax);
      // var accMax = getHighestPoint(segmentData, "acceleration_final", accYMax);
      // var timeMax = getHighestPoint(segmentData, "time_final", xmin);
      // var jerkMax = getHighestPoint(segmentData, "jerk", jerkYMax);
      //append graphs to dom
      var $graphContainer = $widgetContainer.find("#graphContainer");
      if ($graphContainer.children().length === 0) {
        if (settings.graphMode === 0) {
          for (var i = 0; i < settings.showGraphs.length; i++) {
            $graphContainer.append('<div id="' + settings.showGraphs[i] + 'Graph" class="graphArea"></div>');
            // $graphContainer.append('<div id="' + settings.showGraphs[i] + 'Graph" class="graphArea col-xs-12"></div>');
          }
        } else if (settings.graphMode === 1) {
          $graphContainer.append('<div id="aioGraph" class="graphArea"></div>');
        }
      }
      // $graphContainer.find('.graphArea').css("min-width", (100 / $graphContainer.children().length) + "%");
      $graphContainer.find('.graphArea').addClass("col-xs-" + 12 / $graphContainer.children().length + " col-" + 12 / $graphContainer.children().length);
      var $posGraph = $graphContainer.find("#posGraph");
      var $velGraph = $graphContainer.find("#velGraph");
      var $accGraph = $graphContainer.find("#accGraph");
      var $jerkGraph = $graphContainer.find("#jerkGraph");
      var $aioGraph = $graphContainer.find("#aioGraph");

      if ($posGraph.length > 0) {
        posPlot = $.plot($posGraph, [dataSet.pos, pointsDataSet.pos], $.extend(true, {
          yaxis: {
            // min: -1 * posMax,
            // max: posMax,
            position: "left",
            axisLabel: "Position (rad)"
          },
          xaxis: {
            min: 0,
            // max: timeMax
          }
        }, chartOptions));
        // addDragDropFunctionalityPostion(posPlot);
      }
      if ($velGraph.length > 0) {
        velPlot = $.plot($velGraph, [dataSet.vel, pointsDataSet.vel, pointsDataSet.dwell, pointsDataSet.movetime], $.extend(true, {
          yaxis: {
            // min: -1 * velMax,
            // max: velMax,
            position: "left",
            axisLabel: "Velocity (rad/sec)"
          },
          xaxis: {
            min: 0,
            // max: timeMax
          }
        }, chartOptions));
        // addDragDropFunctionality(velPlot);
      }
      if ($accGraph.length > 0) {
        accPlot = $.plot($accGraph, [dataSet.acc], $.extend(true, {
          yaxis: {
            // min: -1 * accMax,
            // max: accMax,
            position: "left",
            axisLabel: "Acceleration (rad/sec^2)"
          },
          xaxis: {
            min: 0,
            // max: timeMax
          }
        }, chartOptions));
      }

      if ($jerkGraph.length > 0) {
        jerkPlot = $.plot($jerkGraph, [dataSet.jerk], $.extend(true, {
          yaxis: {
            // min: -1 * jerkMax,
            // max: jerkMax,
            position: "left",
            axisLabel: "Jerk (rad/sec^3)"
          },
          xaxis: {
            min: 0,
            // max: timeMax
          }
        }, chartOptions));
        // addDragDropFunctionalityPostion(posPlot);
      }

      if ($aioGraph.length > 0) {
        var yaxesOptions = {
          'pos': {
            position: "left",
            axisLabel: "Position (rad)",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            // min: -1 * posMax,
            // max: posMax
          },
          'vel': {
            position: "left",
            axisLabel: "Velocity (rad/sec)",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            // min: -1 * velMax,
            // max: velMax
          },
          'acc': {
            position: "left",
            axisLabel: "Acceleration (rad/sec^2)",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            // min: -1 * accMax,
            // max: accMax
          },
          'jerk': {
            position: "left",
            axisLabel: "Jerk (rad/sec^3)",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            // min: -1 * jerkMax,
            // max: jerkMax
          }
        }

        var aioOptions = $.extend(true, {
          yaxes: (function() {
            var yaxesArr = [];
            for (var i = 0; i < settings.showGraphs.length; i++) {
              yaxesArr[i] = yaxesOptions[settings.showGraphs[i]];

              dataSet[settings.showGraphs[i]].yaxis = i + 1;
              pointsDataSet[settings.showGraphs[i]].yaxis = i + 1;
            }
            return yaxesArr;
          })(),
          xaxis: {
            min: 0,
            // max: timeMax
          }
        }, chartOptions);
        aioOptions.legend = {
          "show": true,
          "backgroundOpacity": 0
        };

        aioPlot = $.plot($aioGraph, getAioGraphPoints(), aioOptions);
        // addDragDropFunctionalityAIO(aioPlot);
      }

      if (settings.onGraphPaint) {
        settings.onGraphPaint();
      }
    };

    var updateGraphData = function(element, timeSlice) {
      var initialTime = element.time_initial;
      var finalTime = element.time_final;
      var Ka = element.motion_equation_third_order_coefficient;
      var Kb = element.motion_equation_second_order_coefficient;
      var Kc = element.motion_equation_first_order_coefficient;
      var Kd = element.motion_equation_zero_order_coefficient;

      var deltaTime = finalTime - initialTime;
      var stepSize = deltaTime / timeSlice;
      for (var time = 0; time < deltaTime; time = time + stepSize) {
        dataSet.jerk.data.push([time + initialTime, 6 * Ka]);
        dataSet.acc.data.push([time + initialTime, 6 * Ka * time + 2 * Kb]);
        dataSet.vel.data.push([time + initialTime, 3 * Ka * Math.pow(time, 2) + 2 * Kb * time + Kc]);
        dataSet.pos.data.push([time + initialTime, Ka * Math.pow(time, 3) + Kb * Math.pow(time, 2) + Kc * time + Kd]);
      }
    };

    var updatePointsGraphData = function(profileElements) {
      var velPonit, dwellTimePoint, moveTimePoint, posPoint;
      if (profileElements.cruise) {
        var timePoint = (profileElements.cruise[0].time_final + profileElements.cruise[0].time_initial) / 2;
        velPonit = [timePoint, profileElements.cruise[0].velocity_final];
      } else if (profileElements.accel) {
        // velPonit = [profileElements.accel[0].time_final, profileElements.accel[0].velocity_final];
        var maxVelPoint = 0;
        for (var i = 0; i < dataSet.vel.data.length; i++) {
          if (dataSet.vel.data[i][1] > maxVelPoint) {
            maxVelPoint = dataSet.vel.data[i][1];
            velPonit = dataSet.vel.data[i];
          }
        }
      }
      if (profileElements.dwell) {
        dwellTimePoint = [profileElements.dwell[0].time_final, profileElements.dwell[0].velocity_final];
      }

      if (profileElements.decel) {
        moveTimePoint = [profileElements.decel[0].time_final, profileElements.decel[0].velocity_final];
      } else if (profileElements.cruise) {
        moveTimePoint = [profileElements.cruise[0].time_final, profileElements.cruise[0].velocity_final];
        // moveTimePoint = [profileElements.cruise[0].time_final, 0];
      }
      // var mvTime = parseFloat(SIValues.movedtime);
      // if (mvTime) {
      //   for (var i = 0; i < dataSet.vel.data.length; i++) {
      //     if (dataSet.vel.data[i][0] == mvTime) {
      //       moveTimePoint = dataSet.vel.data[i];
      //     }
      //   }
      // }


      //Position Graph 
      var totalTime = parseFloat(SIValues.movedtime + SIValues.dweltime || 0);
      var pos_final = parseFloat(SIValues.movedistance);
      posPoint = [totalTime, pos_final];
      if (settings.showGraphDragHandles) {
        if (settings.showGraphDragHandles.indexOf("position") > -1) {
          pointsDataSet.pos.data.push(posPoint);
        }
        if (settings.showGraphDragHandles.indexOf("peakVelocity") > -1) {
          pointsDataSet.vel.data.push(velPonit);
        }
        if (settings.showGraphDragHandles.indexOf("moveTime") > -1) {
          pointsDataSet.movetime.data.push(moveTimePoint);
        }
        if (settings.showGraphDragHandles.indexOf("dwellTime") > -1) {
          pointsDataSet.dwell.data.push(dwellTimePoint);
        }
      }
    };

    var updateCalculatedFields = function(profileElements) {
      var peakVel, rmsVel, peakAcc, rmsAcc;

      // var t1 = profileElements.accel ? profileElements.accel[0].time_final : 0;
      // var t2 = profileElements.cruise ? profileElements.cruise[0].time_final : 0;
      // var t3 = profileElements.decel ? profileElements.decel[0].time_final : 0;
      var t4 = profileElements.dwell ? profileElements.dwell[0].time_final : 0;

      var t1, t2, t3;
      t1 = t2 = t3 = 0;
      var a1, a2, a3, a4;
      a1 = a2 = a3 = a4 = 0;

      // rectangular
      if (profileElements.cruise && !profileElements.accel && !profileElements.decel) {
        peakVel = profileElements.cruise[0].velocity_final;
        peakAcc = profileElements.cruise[0].acceleration_final;

        peakVel = parseFloat(peakVel);
        peakAcc = parseFloat(peakAcc);

        rmsVel = peakVel;
        rmsAcc = peakAcc;

        a2 = profileElements.cruise[0].rms_acceleration;
        t2 = profileElements.cruise[0].time_final;
      }

      // triangular
      if (!profileElements.cruise && profileElements.accel && profileElements.decel) {
        peakVel = profileElements.accel[0].velocity_final;
        peakAcc = profileElements.accel[0].acceleration_final;

        peakVel = parseFloat(peakVel);
        peakAcc = parseFloat(peakAcc);

        // rmsVel = Math.sqrt(Math.pow(profileElements.accel[0].rms_velocity, 2) + Math.pow(profileElements.decel[0].rms_velocity, 2));
        rmsVel = peakVel / Math.sqrt(3);
        rmsAcc = Math.sqrt(Math.pow(profileElements.accel[0].rms_acceleration, 2) + Math.pow(profileElements.decel[0].rms_acceleration, 2));

        a1 = profileElements.accel[0].rms_acceleration;
        a3 = profileElements.decel[0].rms_acceleration;
        t1 = profileElements.accel[0].time_final;
        t3 = profileElements.decel[0].time_final;
        t2 = t1;
      }

      // trapezoidal
      if (profileElements.cruise && profileElements.accel && profileElements.decel) {
        peakVel = profileElements.cruise[0].velocity_final;
        peakAcc = profileElements.accel[0].acceleration_final;

        peakVel = parseFloat(peakVel);
        peakAcc = parseFloat(peakAcc);

        // var t1 = profileElements.accel ? profileElements.accel[0].time_final : 0;
        // var t2 = profileElements.cruise ? profileElements.cruise[0].time_final : 0;
        // var t3 = profileElements.decel ? profileElements.decel[0].time_final : 0;
        // var t4 = profileElements.dwell ? profileElements.dwell[0].time_final : 0;

        t1 = profileElements.accel[0].time_final;
        t2 = profileElements.cruise[0].time_final;
        t3 = profileElements.decel[0].time_final;

        var T = Math.max(t1, t2, t3, t4);

        rmsVel = peakVel * (Math.sqrt((t2 - t1 + (t3 - t2 + t1) / 3) / T));

        a1 = profileElements.accel[0].rms_acceleration;
        a2 = profileElements.cruise[0].rms_acceleration;
        a3 = profileElements.decel[0].rms_acceleration;


        // var a1 = profileElements.accel[0].rms_acceleration;
        // var a2 = profileElements.cruise[0].rms_acceleration;
        // var a3 = profileElements.decel[0].rms_acceleration;
        // var a4 = 0; // dwell time

        // console.log(a1, a2, a3, a4);

        // rmsVel = Math.sqrt(Math.pow(profileElements.accel[0].rms_velocity, 2) + Math.pow(profileElements.cruise[0].rms_velocity, 2) + Math.pow(profileElements.decel[0].rms_velocity, 2));
        // rmsAcc = Math.sqrt(((Math.pow(a1, 2) * t1) + (Math.pow(a2, 2) * t2) + (Math.pow(a3, 2) * t3) + (Math.pow(a4, 2) * t4)) / (t1 + t2 + t3 + t4));
      }
      var T = Math.max(t1, t2, t3, t4);

      rmsAcc = Math.sqrt(((Math.pow(a1, 2) * t1) + (Math.pow(a2, 2) * (t2 - t1)) + (Math.pow(a3, 2) * (t3 - t2)) + (Math.pow(a4, 2) * (t4 - t3))) / (T));

      calculatedValues.peakVel = parseFloat(peakVel);
      calculatedValues.peakAcc = parseFloat(peakAcc);
      calculatedValues.rmsVel = parseFloat(rmsVel);
      calculatedValues.rmsAcc = parseFloat(rmsAcc);

      updateCalculatedControls();
    };

    $container.find('#profileButtons').on('click', '.profileButton', function(e) {
      e.preventDefault();
      if ($(this).attr('id') != undefined) {
        settings.activeProfileIndex = parseInt($(this).attr('id').slice(3));
        settings.smoothness = $inputControls.find("#smoothnessInputContainer").find(".smoothnessDropDown").find('.smoothnessDDMenu')[0].selectedIndex;
        $container.find('#profileButtons').find(".profileButton.btn-primary").removeClass("btn-primary").addClass("btn-default");
        $(this).addClass("btn-primary").removeClass("btn-default");
        settings.velocityJerk = undefined
        readUIValues();
        calculateAndPaint();
      }
    });

    var resetCalculatedValues = function() {
      calculatedValues.peakVel = '';
      calculatedValues.peakAcc = '';
      calculatedValues.rmsVel = '';
      calculatedValues.rmsAcc = '';
      updateCalculatedControls();
    }

    var readUIValues = function() {
      SIValues.movedistance = uiValues.movedistance = isNaN(parseFloat(settings.moveDistance)) ? settings.moveDistance : parseFloat(settings.moveDistance);
      SIValues.movedtime = uiValues.movedtime = isNaN(parseFloat(settings.moveTime)) ? settings.moveTime : parseFloat(settings.moveTime);
      SIValues.dweltime = uiValues.dweltime = isNaN(parseFloat(settings.dwellTime)) ? settings.dwellTime : parseFloat(settings.dwellTime);
      if (settings.velocityJerk === undefined) {
        updateIndexType();
        SIValues.velocityJerk = uiValues.velocityJerk = isNaN(parseFloat(settings.indexType)) ? settings.indexType : parseFloat(settings.indexType);
      } else {
        SIValues.velocityJerk = uiValues.velocityJerk = isNaN(parseFloat(settings.velocityJerk)) ? settings.velocityJerk : parseFloat(settings.velocityJerk);
      }
      SIValues.smoothness = uiValues.smoothness = isNaN(parseFloat(settings.smoothness)) ? settings.smoothness : parseFloat(settings.smoothness);
    };

    var validateUIValues = function() {
      var bret = true;
      // var errorInputs = [];
      $inputControls.find(".input-entries .form-group").removeClass("has-error");
      if (!(!isNaN(SIValues.movedistance) && SIValues.movedistance > 0)) {
        $inputControls.find("#moveDistanceInputContainer").addClass("has-error");
        bret = false;
      }
      if (!(!isNaN(SIValues.movedistance) && SIValues.movedtime > 0)) {
        $inputControls.find("#moveTimeInputContainer").addClass("has-error");
        bret = false;
      }
      if (!(!isNaN(SIValues.dweltime) && SIValues.dweltime >= 0)) {
        $inputControls.find("#dwellTimeInputContainer").addClass("has-error");
        bret = false;
      }

      if (!(!isNaN(SIValues.velocityJerk) && (SIValues.velocityJerk >= 0 && SIValues.velocityJerk <= 100))) {
        $inputControls.find("#indexTypeInputContainer").addClass("has-error");
        bret = false;
      }
      if (settings.assessmentMode) {
        $inputControls.find(".input-entries .form-group").removeClass("has-error");
      }
      return bret;
    };

    var readinitialValues = function() {
      initialValues.time = 0;
      initialValues.position = 0;
      initialValues.velocity = 0;
    };

    var saveVelMaxMinPoints = function(profileElements) {
      AreaUnderCurve = 0;
      var prevWidth = dataSet.vel.data[0][0];
      for (var i = 1; i < dataSet.vel.data.length; i++) {
        AreaUnderCurve = AreaUnderCurve + ((dataSet.vel.data[i][0] - prevWidth) * dataSet.vel.data[i][1]);
        prevWidth = dataSet.vel.data[i][0];
      }

      minVel = -Infinity;
      var inputData = (JSON.parse(JSON.stringify(SIValues)));
      inputData.velocityJerk = 100;
      inputData.velocityJerk = 0;
      var minVelSegmentData = COSMATT.ProfileCalculation.ProfileIndexModel.calculate(inputData, initialValues).segmentData;
      for (var i = 0; i < Object.keys(minVelSegmentData).length; i++) {
        for (var j = 0; j < minVelSegmentData[Object.keys(minVelSegmentData)[i]].length; j++) {
          if (minVel < minVelSegmentData[Object.keys(minVelSegmentData)[i]][j].velocity_initial) {
            minVel = minVelSegmentData[Object.keys(minVelSegmentData)[i]][j].velocity_initial;
          }
        }
      }
      maxVel = 2 * minVel;
      if (profileElements.dwell) {
        dwellStart = profileElements.dwell[0].time_initial;
      }
    };

    var showTooltip = function(x, y, contents) {
      $('<div id="tooltip">' + contents + '</div>').css({

        top: y + 5,
        left: x + 15,
        // border: '2px solid #000',
        // padding: '2px',
        // size: '10',
        // 'border-radius': '6px 6px 6px 6px',
        // 'background-color': '#fff',
      }).appendTo($widgetContainer).fadeIn(200);
    };

    var addDragDropFunctionality = function(plot) {
      var hoverItem = null;
      var dragItem = null;

      var prevItemIndex = null;

      $container.find("#velGraph").unbind("plothover").bind("plothover", function(event, pos, item) {
        hoverItem = item;
        if (item) {
          var targetOffset = $widgetContainer.offset();
          if (prevItemIndex != item.seriesIndex) {
            switch (item.seriesIndex) {
              case 1:
                showTooltip(item.pageX - targetOffset.left, item.pageY - targetOffset.top, "Drag to change Velocity Jerk");
                prevItemIndex = item.seriesIndex;
                break;
              case 2:
                showTooltip(item.pageX - targetOffset.left, item.pageY - targetOffset.top, "Drag to change Dwell Time");
                prevItemIndex = item.seriesIndex;
                break;
              case 3:
                showTooltip(item.pageX - targetOffset.left, item.pageY - targetOffset.top, "Drag to change Move Time");
                prevItemIndex = item.seriesIndex;
                break;
              default:
                break;
            }
          }
        } else {
          $widgetContainer.find('#tooltip').remove();
          prevItemIndex = null;
        }

        if (dragItem && dragItem.seriesIndex) {
          var data = plot.getData();
          switch (dragItem.seriesIndex) {
            case 1:
              var Vff;
              if (pos.y >= maxVel) {
                Vff = 100;
              } else if (pos.y <= minVel) {
                Vff = 0;
              } else {
                var xpos = parseFloat(SIValues.movedtime) - AreaUnderCurve / pos.y;
                Vff = xpos * pos.y * 100 / AreaUnderCurve;
              }
              // TODO
              uiValues.velocityJerk = parseFloat(Math.ceil(Vff));
              SIValues.velocityJerk = parseFloat(Math.ceil(Vff));
              break;
            case 2:
              var dwt;
              if (pos.x < dwellStart) {
                dwt = 0;
              } else {
                dwt = parseFloat(pos.x - dwellStart);
              }
              // TODO
              uiValues.dweltime = parseFloat(dwt);
              SIValues.dweltime = parseFloat(dwt);
              break;
            case 3:
              var mvtime;
              var dwellTime
              if (pos.x <= 0) {
                mvtime = 1;
              } else {
                mvtime = pos.x;
              }
              // TODO
              uiValues.movedtime = parseFloat(mvtime);
              SIValues.movedtime = parseFloat(mvtime);
              break;
            default:
              break;
          }
          calculateAndPaint(true);
        }
      });

      $container.find("#velGraph").unbind("mousedown").bind("mousedown", function() {
        $widgetContainer.find('#tooltip').remove();
        if (hoverItem) {
          switch (hoverItem.seriesIndex) {
            case 1:
              if ((hoverItem.datapoint[1] >= minVel) && (hoverItem.datapoint[1] <= maxVel)) {
                dragItem = hoverItem;
              }
              break;
            case 2:
              if (hoverItem.datapoint[0] >= dwellStart) {
                dragItem = hoverItem;
              }
              break;
            case 3:
              if (hoverItem.datapoint[0] > 0) {
                dragItem = hoverItem;
              }
              break;
            default:
              break;
          }
        }
      });

      $container.find("#velGraph").unbind("mouseup").bind("mouseup", function() {
        if (dragItem && settings.onGraphDrag) {
          settings.onGraphDrag();
        }
        dragItem = null;
      });

      $container.find("#velGraph").unbind("mouseleave").bind("mouseleave", function() {
        $container.find("#velGraph").mouseup();
      });
    };

    var addDragDropFunctionalityPostion = function(plot) {
      var hoverItem = null;
      var dragItem = null;

      var prevItemIndex = null;

      $container.find("#posGraph").unbind("plothover").bind("plothover", function(event, pos, item) {
        hoverItem = item;
        if (item) {
          var targetOffset = $widgetContainer.offset();
          if (prevItemIndex != item.seriesIndex) {
            switch (item.seriesIndex) {
              case 1:
                showTooltip(item.pageX - targetOffset.left, item.pageY - targetOffset.top, "Drag to change Move Distance");
                prevItemIndex = item.seriesIndex;
                break;
              default:
                break;
            }
          }
        } else {
          $widgetContainer.find('#tooltip').remove();
          prevItemIndex = null;
        }
        if (dragItem && dragItem.seriesIndex) {
          var data = plot.getData();
          switch (dragItem.seriesIndex) {
            case 1:
              var moveDis;
              if (pos.y <= 0) {
                moveDis = 1;
              } else {
                moveDis = parseFloat(pos.y);
              }
              // TODO ui value to be set in dropdown selected unit
              uiValues.movedistance = parseFloat(moveDis);
              SIValues.movedistance = parseFloat(moveDis);
              break;
            default:
              break;
          }
          calculateAndPaint(true);
        }
      });

      $container.find("#posGraph").unbind("mousedown").bind("mousedown", function() {
        $widgetContainer.find('#tooltip').remove();
        if (hoverItem) {
          switch (hoverItem.seriesIndex) {
            case 1:
              if (hoverItem.datapoint[1] > 0) {
                dragItem = hoverItem;
              }
              break;
            default:
              break;
          }
        }
      });

      $container.find("#posGraph").unbind("mouseup").bind("mouseup", function() {
        if (dragItem && settings.onGraphDrag) {
          settings.onGraphDrag();
        }
        dragItem = null;
      });

      $container.find("#posGraph").unbind("mouseleave").bind("mouseleave", function() {
        $container.find("#posGraph").mouseup();
      });
    };

    var addDragDropFunctionalityAIO = function(plot) {
      var hoverItem = null;
      var dragItem = null;
      var prevItemIndex = null;

      $container.find("#aioGraph").unbind("plothover").bind("plothover", function(event, pos, item) {
        hoverItem = item;

        if (item) {
          var targetOffset = $widgetContainer.offset();
          if (prevItemIndex != item.seriesIndex) {
            switch (item.seriesIndex) {
              case 1:
                showTooltip(item.pageX - targetOffset.left, item.pageY - targetOffset.top, "Drag to change Move Distance");
                prevItemIndex = item.seriesIndex;
                break;
              case 3:
                showTooltip(item.pageX - targetOffset.left, item.pageY - targetOffset.top, "Drag to change Velocity Jerk");
                prevItemIndex = item.seriesIndex;
                break;
              case 4:
                showTooltip(item.pageX - targetOffset.left, item.pageY - targetOffset.top, "Drag to change Dwell Time");
                prevItemIndex = item.seriesIndex;
                break;
              case 5:
                showTooltip(item.pageX - targetOffset.left, item.pageY - targetOffset.top, "Drag to change Move Time");
                prevItemIndex = item.seriesIndex;
                break;
              default:
                break;
            }
          }
        } else {
          $widgetContainer.find('#tooltip').remove();
          prevItemIndex = null;
        }

        if (dragItem && dragItem.seriesIndex) {
          var data = plot.getData();
          switch (dragItem.seriesIndex) {
            case 1:
              var moveDis;
              if (pos.y <= 0) {
                moveDis = 1;
              } else {
                moveDis = parseFloat(pos.y);
              }
              // TODO
              uiValues.movedistance = parseFloat(moveDis);
              SIValues.movedistance = parseFloat(moveDis);
              break;
            case 3:
              var Vff;
              var yCordinate = settings.showGraphs.indexOf(COSMATT.MotionProfile.configuration.Graphs.position) > -1 ? pos.y2 : pos.y1;
              if (yCordinate >= maxVel) {
                Vff = 100;
              } else if (yCordinate <= minVel) {
                Vff = 0;
              } else {
                var xpos = parseFloat(SIValues.movedtime) - AreaUnderCurve / yCordinate;
                Vff = xpos * yCordinate * 100 / AreaUnderCurve;
              }
              // TODO
              uiValues.velocityJerk = parseFloat(Math.ceil(Vff));
              SIValues.velocityJerk = parseFloat(Math.ceil(Vff));
              break;
            case 4:
              var dwt;
              if (pos.x < dwellStart) {
                dwt = 0;
              } else {
                dwt = parseFloat(pos.x - dwellStart);
              }
              // TODO
              uiValues.dweltime = parseFloat(dwt);
              SIValues.dweltime = parseFloat(dwt);
              break;
            case 5:
              var mvtime;
              var dwellTime
              if (pos.x <= 0) {
                mvtime = 1;
              } else {
                mvtime = pos.x;
              }
              // TODO
              uiValues.movedtime = parseFloat(mvtime);
              SIValues.movedtime = parseFloat(mvtime);
              break;
            default:
              break;
          }
          calculateAndPaint(true);
        }
      });

      $container.find("#aioGraph").unbind("mousedown").bind("mousedown", function() {
        $widgetContainer.find('#tooltip').remove();
        if (hoverItem) {
          switch (hoverItem.seriesIndex) {
            case 1:
              if (hoverItem.datapoint[1] > 0) {
                dragItem = hoverItem;
              }
              break;
            case 3:
              if ((hoverItem.datapoint[1] >= minVel) && (hoverItem.datapoint[1] <= maxVel)) {
                dragItem = hoverItem;
              }
              break;
            case 4:
              if (hoverItem.datapoint[0] >= dwellStart) {
                dragItem = hoverItem;
              }
              break;
            case 5:
              if (hoverItem.datapoint[0] > 0) {
                dragItem = hoverItem;
              }
              break;
            default:
              break;
          }
        }
      });

      $container.find("#aioGraph").unbind("mouseup").bind("mouseup", function() {
        if (dragItem && settings.onGraphDrag) {
          settings.onGraphDrag();
        }
        dragItem = null;
      });

      $container.find("#aioGraph").unbind("mouseleave").bind("mouseleave", function() {
        $container.find("#aioGraph").mouseup();
      });
    };

    var calculateData = function(dataonly) {
      outputData = COSMATT.ProfileCalculation.ProfileIndexModel.calculate(SIValues, initialValues);
      var profileElements = outputData.elementsData;
      var profileElementsLength = profileElements.length;
      if (profileElementsLength > 0) {
        var timeSlice = 100;
        resetProfileData();
        for (var element = 0; element < profileElementsLength; element++) {
          updateGraphData(profileElements[element], timeSlice);

        }
      }
      updatePointsGraphData(outputData.segmentData);
      updateCalculatedFields(outputData.segmentData);
      saveVelMaxMinPoints(outputData.segmentData);
      if (dataonly) {
        updateGraph(outputData.segmentData);
      } else {
        plotGraph(outputData.segmentData);
      }
    };

    var updateIndexType = function() {
      settings.activeProfileIndex = parseInt(settings.activeProfileIndex);
      switch (settings.activeProfileIndex) {
        case 1:
          settings.indexType = 50;
          break;
        case 2:
          settings.indexType = 100;
          break;
        case 3:
          settings.indexType = 0;
          break;
        default:
          break;
      }
    };

    var inputControlsCallbackFn = function() {
      calculateAndPaint();
    };

    var responseNotifier = function() {
      if (settings.assessmentMode && settings.userResponseNotifier) {
        settings.userResponseNotifier({
          "movedistance": {
            "value": SIValues.movedistance,
            "unit": settings.moveDistanceUnit
          },
          "movedtime": {
            "value": SIValues.movedtime,
            "unit": settings.moveTimeUnit
          },
          "dweltime": {
            "value": SIValues.dweltime,
            "unit": settings.dwellTimeUnit
          },
          "velocityJerk": {
            "value": SIValues.velocityJerk
          }
        });
      }
    }

    var generateInputControls = function() {
      var $inputControls = $widgetContainer.find("#inputControls");
      $inputControls.append('<form class="row form-horizontal"><div class="col-6 col-xs-6 input-entries inputs"><div class="row form-group" id="moveDistanceInputContainer"><label for="moveDistance" class="col-4 col-xs-4 control-label">Move Distance</label><div class="col-8 col-xs-8 comboMoveDistance"></div></div><div class="row form-group" id="moveTimeInputContainer"><label for="moveTime" class="col-4 col-xs-4 control-label">Move Time</label><div class="col-8 col-xs-8 comboMoveTime"></div></div><div class="row form-group" id="dwellTimeInputContainer"><label for="dwellTime" class="col-4 col-xs-4 control-label">Dwell Time</label><div class="col-8 col-xs-8 comboDwellTime"></div></div><div class="row form-group" id="indexTypeInputContainer"><label for="indexType" class="col-4 col-xs-4 control-label">Velocity Jerk</label><div class="col-8 col-xs-8 comboIndexType"></div></div><div class="row form-group" id="smoothnessInputContainer"><label for="smoothness" class="col-4 col-xs-4 control-label">Smoothness</label><div class="col-8 col-xs-8 smoothnessDropDown"></div></div></div><div class="col-6 col-xs-6 inputs"><div class="row form-group" id="peakVelocityInputContainer"><label for="peakVelocity" class="col-4 col-xs-4 control-label">Peak Velocity</label><div class="col-8 col-xs-8 comboPeakVelocity"></div></div><div class="row form-group" id="rmsVelocityInputContainer"><label for="rmsVelocity" class="col-4 col-xs-4 control-label">RMS Velocity</label><div class="col-8 col-xs-8 comboRmsVelocity"></div></div><div class="row form-group" id="peakAccInputContainer"><label for="peakAcc" class="col-4 col-xs-4 control-label">Peak Acceleration</label><div class="col-8 col-xs-8 comboPeakAcc"></div></div><div class="row form-group" id="rmsAccInputContainer"><label for="rmsAcc" class="col-4 col-xs-4 control-label">RMS Acceleration</label><div class="col-8 col-xs-8 comboRmsAcc"></div></div></div></form>');

      $inputControls.find("#moveDistanceInputContainer").find(".comboMoveDistance").unitsComboBox({
        "unitType": "ANGULARDISTANCE",
        "unit": settings.moveDistanceUnit,
        "roundOfNumber": "2",
        "value": settings.moveDistance,
        "comboBoxWidthRatio": {
          "textBox": "55%",
          "comboBox": "45%"
        },
        callBackFn: function() {
          if (this.type != undefined) {
            if (this.type == "dropdown") {
              settings.moveDistanceUnit = parseInt(this.unit.split('_')[1]) - 1;
            } else if (this.type == "textbox") {
              uiValues.movedistance = isNaN(parseFloat(this.value)) ? '' : parseFloat(this.value);
              SIValues.movedistance = this.value === '' ? '' : parseFloat(this.SIValue);
              inputControlsCallbackFn();
            }
            responseNotifier();
          }
        }
      });

      $inputControls.find("#moveTimeInputContainer").find(".comboMoveTime").unitsComboBox({
        "unitType": "TIME",
        "unit": settings.moveTimeUnit,
        "roundOfNumber": "2",
        "value": settings.moveTime,
        "comboBoxWidthRatio": {
          "textBox": "55%",
          "comboBox": "45%"
        },
        callBackFn: function() {
          if (this.type != undefined) {
            if (this.type == "dropdown") {
              settings.moveTimeUnit = parseInt(this.unit.split('_')[1]) - 1;
            } else if (this.type == "textbox") {
              uiValues.movedtime = isNaN(parseFloat(this.value)) ? '' : parseFloat(this.value);
              SIValues.movedtime = this.value === '' ? '' : parseFloat(this.SIValue);
              inputControlsCallbackFn();
            }
            responseNotifier();
          }
        }
      });

      $inputControls.find("#dwellTimeInputContainer").find(".comboDwellTime").unitsComboBox({
        "unitType": "TIME",
        "unit": settings.dwellTimeUnit,
        "roundOfNumber": "2",
        "value": settings.dwellTime,
        "comboBoxWidthRatio": {
          "textBox": "55%",
          "comboBox": "45%"
        },
        callBackFn: function() {
          if (this.type != undefined) {
            if (this.type == "dropdown") {
              settings.dwellTimeUnit = parseInt(this.unit.split('_')[1]) - 1;
            } else if (this.type == "textbox") {
              uiValues.dweltime = isNaN(parseFloat(this.value)) ? '' : parseFloat(this.value);
              SIValues.dweltime = this.value === '' ? '' : parseFloat(this.SIValue);
              inputControlsCallbackFn();
            }
            responseNotifier();
          }
        }
      });

      // updateIndexType();

      $inputControls.find("#indexTypeInputContainer").find(".comboIndexType").unitsComboBox({
        "unitType": "PERCENTAGE",
        "unit": "0",
        "roundOfNumber": "2",
        "value": settings.indexType,
        "comboBoxWidthRatio": {
          "textBox": "55%",
          "comboBox": "45%"
        },
        callBackFn: function() {
          if (this.type != undefined) {
            if (this.type == "textbox") {
              uiValues.velocityJerk = isNaN(parseFloat(this.value)) ? '' : parseFloat(this.value);
              SIValues.velocityJerk = this.value === '' ? '' : parseFloat(this.SIValue);
              inputControlsCallbackFn();
            }
            responseNotifier();
          }
        }
      });
      // smoothness dropdown
      var $smoothnessDD = $inputControls.find("#smoothnessInputContainer").find(".smoothnessDropDown");
      $smoothnessDD.append('<select class="form-control smoothnessDDMenu"><option value=automatic>Automatic<option value=standard>Standard<option value=maximum>Maximum</select>');
      if (settings.smoothness) {
        $smoothnessDD.find('select option').eq(settings.smoothness).attr("selected", true);
      }
      $smoothnessDD.find('select').on('change', function(e) {
        uiValues.smoothness = e.target.selectedIndex;
        SIValues.smoothness = e.target.selectedIndex;
        calculateAndPaint(true);
      });
      // $smoothnessDD.find('.chosen-select').chosen({
      // 	disable_search: true
      // });

      $inputControls.find("#peakVelocityInputContainer").find(".comboPeakVelocity").unitsComboBox({
        "unitType": "ANGULARVELOCITY",
        "unit": settings.peakVelocityUnit,
        "roundOfNumber": "2",
        "value": 0,
        "comboBoxWidthRatio": {
          "textBox": "55%",
          "comboBox": "45%"
        },
        callBackFn: function() {
          if (this.type != undefined && this.type == "dropdown") {
            settings.peakVelocityUnit = parseInt(this.unit.split('_')[1]) - 1;
          }
        }
      });

      $inputControls.find("#rmsVelocityInputContainer").find(".comboRmsVelocity").unitsComboBox({
        "unitType": "ANGULARVELOCITY",
        "unit": settings.rmsVelocityUnit,
        "roundOfNumber": "2",
        "value": 0,
        "comboBoxWidthRatio": {
          "textBox": "55%",
          "comboBox": "45%"
        },
        callBackFn: function() {
          if (this.type != undefined && this.type == "dropdown") {
            settings.rmsVelocityUnit = parseInt(this.unit.split('_')[1]) - 1;
          }
        }
      });

      $inputControls.find("#peakAccInputContainer").find(".comboPeakAcc").unitsComboBox({
        "unitType": "ANGULARACCELERATION",
        "unit": settings.peakAccelarationUnit,
        "roundOfNumber": "2",
        "value": 0,
        "comboBoxWidthRatio": {
          "textBox": "55%",
          "comboBox": "45%"
        },
        callBackFn: function() {
          if (this.type != undefined && this.type == "dropdown") {
            settings.peakAccelarationUnit = parseInt(this.unit.split('_')[1]) - 1;
          }
        }
      });

      $inputControls.find("#rmsAccInputContainer").find(".comboRmsAcc").unitsComboBox({
        "unitType": "ANGULARACCELERATION",
        "unit": settings.rmsAccelarationUnit,
        "roundOfNumber": "2",
        "value": 0,
        "comboBoxWidthRatio": {
          "textBox": "55%",
          "comboBox": "45%"
        },
        callBackFn: function() {
          if (this.type != undefined && this.type == "dropdown") {
            settings.rmsAccelarationUnit = parseInt(this.unit.split('_')[1]) - 1;
          }
        }
      });
    };

    var updateCalculatedControls = function() {
      var control;

      control = $inputControls.find("#moveDistanceInputContainer").find(".comboMoveDistance").data('unitsComboBox');
      SIValues.movedistance ? control.setTextBoxValue(control.getValueInSelectedUnit(SIValues.movedistance)) : control.setTextBoxValue(SIValues.movedistance);

      control = $inputControls.find("#moveTimeInputContainer").find(".comboMoveTime").data('unitsComboBox');
      SIValues.movedtime ? control.setTextBoxValue(control.getValueInSelectedUnit(SIValues.movedtime)) : control.setTextBoxValue(SIValues.movedtime);

      control = $inputControls.find("#dwellTimeInputContainer").find(".comboDwellTime").data('unitsComboBox');
      SIValues.dweltime ? control.setTextBoxValue(control.getValueInSelectedUnit(SIValues.dweltime)) : control.setTextBoxValue(SIValues.dweltime);

      control = $inputControls.find("#indexTypeInputContainer").find(".comboIndexType").data('unitsComboBox');
      SIValues.velocityJerk ? control.setTextBoxValue(control.getValueInSelectedUnit(SIValues.velocityJerk)) : control.setTextBoxValue(SIValues.velocityJerk);

      control = $inputControls.find("#peakVelocityInputContainer").find(".comboPeakVelocity").data('unitsComboBox');
      calculatedValues.peakVel ? control.setTextBoxValue(control.getValueInSelectedUnit(calculatedValues.peakVel)) : control.setTextBoxValue(calculatedValues.peakVel);

      control = $inputControls.find("#rmsVelocityInputContainer").find(".comboRmsVelocity").data('unitsComboBox');
      calculatedValues.rmsVel ? control.setTextBoxValue(control.getValueInSelectedUnit(calculatedValues.rmsVel)) : control.setTextBoxValue(calculatedValues.rmsVel);

      control = $inputControls.find("#peakAccInputContainer").find(".comboPeakAcc").data('unitsComboBox');
      calculatedValues.peakAcc ? control.setTextBoxValue(control.getValueInSelectedUnit(calculatedValues.peakAcc)) : control.setTextBoxValue(calculatedValues.peakAcc);

      control = $inputControls.find("#rmsAccInputContainer").find(".comboRmsAcc").data('unitsComboBox');
      calculatedValues.rmsAcc ? control.setTextBoxValue(control.getValueInSelectedUnit(calculatedValues.rmsAcc)) : control.setTextBoxValue(calculatedValues.rmsAcc);
    };

    var uiHandler = function($domContainer) {
      var $profileButtons = $widgetContainer.find('#profileButtons');
      $profileButtons.find("#btn" + settings.activeProfileIndex).addClass('btn-primary').removeClass('btn-default');

      if (settings.showProfiles) {
        handleProfilesVisibility(settings.showProfiles, $profileButtons);
      }
      if (settings.showGraphDragHandles) {
        handleGraphDragHandles(settings.showGraphDragHandles);
      }
      if (settings.readOnlyInputs) {
        makeInputsReadOnly(settings.readOnlyInputs);
      }
      if (settings.hideInputs) {
        handleInputsVisibility(settings.hideInputs);
      }
    };

    var handleProfilesVisibility = function(showProfiles, $profileButtons) {
      $profileButtons.find("button").hide();
      if (typeof(showProfiles) === "boolean") { //hide all profile buttons
        if (showProfiles === true) {
          $profileButtons.show();
        } else {
          $profileButtons.hide();
        }
      } else if (showProfiles.length > 0) {
        for (var profile in showProfiles) {
          profile = showProfiles[profile];
          $profileButtons.find('#btn' + profile.slice(profile.length - 1)).show();
        }
      }
    };

    var handleGraphDragHandles = function(showGraphDragHandles) {
      if (typeof(showGraphDragHandles) === "boolean") {
        if (showGraphDragHandles === true) {
          settings.showGraphDragHandles = [COSMATT.MotionProfile.configuration.GraphHandles.position, COSMATT.MotionProfile.configuration.GraphHandles.peakVelocity, COSMATT.MotionProfile.configuration.GraphHandles.moveTime, COSMATT.MotionProfile.configuration.GraphHandles.dwellTime];
        } else {
          settings.showGraphDragHandles = [];
        }
      }
    };

    var makeInputsReadOnly = function(readOnlyInputsArr) {
      if (typeof(readOnlyInputsArr) === "boolean") {
        if (readOnlyInputsArr === true) {
          readOnlyInputsArr = [COSMATT.MotionProfile.configuration.DataFields.moveDistance, COSMATT.MotionProfile.configuration.DataFields.moveTime, COSMATT.MotionProfile.configuration.DataFields.dwellTime, COSMATT.MotionProfile.configuration.DataFields.velocityFormFactor, COSMATT.MotionProfile.configuration.DataFields.peakVelocity, COSMATT.MotionProfile.configuration.DataFields.rmsVelocity, COSMATT.MotionProfile.configuration.DataFields.peakAccelaration, COSMATT.MotionProfile.configuration.DataFields.rmsAccelaration];
        } else {
          readOnlyInputsArr = [];
        }
      }
      if (readOnlyInputsArr.length > 0) {
        for (var inputEle in readOnlyInputsArr) {
          if (readOnlyInputsArr.hasOwnProperty(inputEle)) {
            inputEle = readOnlyInputsArr[inputEle];
            $inputControls.find("#" + inputEle + "InputContainer").find(".combo" + inputEle.charAt(0).toUpperCase() + inputEle.slice(1)).data('unitsComboBox').update({
              "enable": {
                "textbox": "false",
                "comboBox": "true"
              }
            });
          }
        }
      }
    };

    var handleInputsVisibility = function(hideInputsArr) {
      if (typeof(hideInputsArr) === "boolean") {
        if (hideInputsArr === true) {
          $inputControls.hide();
        } else {
          $inputControls.show();
        }
      }
      if (hideInputsArr.length > 0) {
        for (var inputEle in hideInputsArr) {
          if (hideInputsArr.hasOwnProperty(inputEle)) {
            inputEle = hideInputsArr[inputEle];
            $inputControls.find("#" + inputEle + "InputContainer").hide();
          }
        }
      }
    };

    var addEditConfigurations = function() {
      var $body = $('body');
      var $editConfigButton = '<div id="editConfigBtnContainer"><button class="btn btn-default editConfigBtn pull-right btn-lg" type="button" href="configWindow.html" data-target="#theModal" data-toggle="modal">Edit Configurations</div>';
      $body.append($editConfigButton);
    };

    var addCheckAnsButton = function() {
      $widgetContainer.append('<div class="text-right text-xs-right"><button type="button" class="btn btn-primary">Check Answer</button></div>');
    }

    generateInputControls();
    uiHandler($widgetContainer);
    if (settings.showEditConfigButton) {
      addEditConfigurations();
    }

    if (settings.showCheckAnswerButton) {
      //addCheckAnsButton();
    }

    readUIValues();
    readinitialValues();

    var calculateAndPaint = function(dataonly, settimeout) {
      if (validateUIValues()) {
        if (settimeout) {
          setTimeout(function(dataonly) {
            calculateData();
          }, 0);
        } else {
          calculateData(dataonly);
        }
      } else {
        resetProfileData();
        resetCalculatedValues();
        setTimeout(function(dataonly) {
          plotEmptyGraph();
        }, 0);
      }
    }

    calculateAndPaint(false, true);

    function updateInputs(params) {
      if (params.movedistance) {
        // TODO parseInt to Parse float then to 2 decimal places
        // uiValues.movedistance = parseFloat(params.movedistance.value);
        SIValues.movedistance = isNaN(parseFloat(params.movedistance.value)) ? "" : parseFloat(params.movedistance.value);
        var $combobox = $inputControls.find("#moveDistanceInputContainer").find(".comboMoveDistance").data('unitsComboBox');
        $combobox.setTextBoxValue(SIValues.movedistance);
        if (params.movedistance.unit) {
          settings.moveDistanceUnit = parseInt(params.movedistance.unit);
          $combobox.setDropBoxItem(settings.moveDistanceUnit);
        }
      }
      if (params.movedtime) {
        // uiValues.movedtime = parseFloat(params.movedtime.value);
        SIValues.movedtime = isNaN(parseFloat(params.movedtime.value)) ? "" : parseFloat(params.movedtime.value);
        var $combobox = $inputControls.find("#moveTimeInputContainer").find(".comboMoveTime").data('unitsComboBox');
        $combobox.setTextBoxValue(SIValues.movedtime);
        if (params.movedtime.unit) {
          settings.moveTimeUnit = parseInt(params.movedtime.unit);
          $combobox.setDropBoxItem(settings.moveTimeUnit);
        }
      }
      if (params.dweltime) {
        // uiValues.dweltime = parseFloat(params.dweltime.value);
        SIValues.dweltime = isNaN(parseFloat(params.dweltime.value)) ? "" : parseFloat(params.dweltime.value);
        var $combobox = $inputControls.find("#dwellTimeInputContainer").find(".comboDwellTime").data('unitsComboBox');
        $combobox.setTextBoxValue(SIValues.dweltime);
        if (params.dweltime.unit) {
          settings.dwellTimeUnit = parseInt(params.dweltime.unit);
          $combobox.setDropBoxItem(settings.dwellTimeUnit);
        }
      }
      if (params.velocityJerk) {
        // uiValues.velocityJerk = parseFloat(params.velocityJerk.value);
        SIValues.velocityJerk = isNaN(parseFloat(params.velocityJerk.value)) ? "" : parseFloat(params.velocityJerk.value);
        var $combobox = $inputControls.find("#indexTypeInputContainer").find(".comboIndexType").data('unitsComboBox');
        $combobox.setTextBoxValue(SIValues.velocityJerk);
      }
      calculateAndPaint();
    }

    function markAnswers(params) {
      var cssClass;
      if (params.movedistance) {
        cssClass = params.movedistance.status ? 'correct' : 'incorrect';
        var $moveDistanceInput = $inputControls.find("#moveDistanceInputContainer").find(".comboMoveDistance");
        $moveDistanceInput.addClass(cssClass);
        $moveDistanceInput.data('unitsComboBox').update({
          "enable": {
            "textbox": "false",
            "comboBox": "true"
          }
        });
      }
      if (params.movedtime) {
        cssClass = params.movedtime.status ? 'correct' : 'incorrect';
        var $moveTimeInput = $inputControls.find("#moveTimeInputContainer").find(".comboMoveTime");
        $moveTimeInput.addClass(cssClass);
        $moveTimeInput.data('unitsComboBox').update({
          "enable": {
            "textbox": "false",
            "comboBox": "true"
          }
        });
      }
      if (params.dweltime) {
        cssClass = params.dweltime.status ? 'correct' : 'incorrect';
        var $dwellTimeInput = $inputControls.find("#dwellTimeInputContainer").find(".comboDwellTime");
        $dwellTimeInput.addClass(cssClass);
        $dwellTimeInput.data('unitsComboBox').update({
          "enable": {
            "textbox": "false",
            "comboBox": "true"
          }
        });
      }
      if (params.velocityJerk) {
        cssClass = params.velocityJerk.status ? 'correct' : 'incorrect';
        var $velocityJerkInput = $inputControls.find("#indexTypeInputContainer").find(".comboIndexType");
        $velocityJerkInput.addClass(cssClass);
        $velocityJerkInput.data('unitsComboBox').update({
          "enable": {
            "textbox": "false",
            "comboBox": "true"
          }
        });
      }
      disableDraggablePoints();
    }

    function disableDraggablePoints() {
      if (posPlot) {
        var posData = posPlot.getData();
        if (posData[1]) posData[1].hoverable = false;
        posPlot.setupGrid();
        posPlot.setData(posData);
        posPlot.draw();
      }

      if (velPlot) {
        var velData = velPlot.getData();
        if (velData[1]) velData[1].hoverable = false;
        if (velData[2]) velData[2].hoverable = false;
        if (velData[3]) velData[3].hoverable = false;
        velPlot.setupGrid();
        velPlot.setData(velData);
        velPlot.draw();
      }
    }

    return {
      ref: this,
      updateInputs: updateInputs,
      markAnswers: markAnswers
    };
  };

}(jQuery));