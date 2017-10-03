'use strict';
window.COSMATT = window.COSMATT || {};
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