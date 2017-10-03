'use strict';
window.COSMATT = window.COSMATT || {};
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