'use strict';
window.COSMATT = window.COSMATT || {};
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
      velJerkPerc = (inputData.velocityJerk-1) * 100;
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