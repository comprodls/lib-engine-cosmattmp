'use strict';

window.COSMATT = window.COSMATT || {};
COSMATT.MotionProfile = COSMATT.MotionProfile || {};

COSMATT.MotionProfile.getDefaults = function(type){
   return {
    activeProfileIndex: 1,
    moveDistance: 125.664,
    moveTime: 10,
    dwellTime: 2,
    graphMode: COSMATT.MotionProfile.ENUMS.GraphMode.individualAxis,
    showGraphs: [COSMATT.MotionProfile.ENUMS.Graphs.velocity],
    showGraphDragHandles: COSMATT.MotionProfile.ENUMS.GraphHandles.showAll,
    readOnlyInputs: false,
    hideInputs: false,
    showProfiles: COSMATT.MotionProfile.ENUMS.Profiles.showAll,
    smoothness: COSMATT.MotionProfile.ENUMS.Smoothness.automatic,
    showCheckAnswerButton: false,
    assessmentMode: false,
    moveTimeUnit: "second",
    dwellTimeUnit: "second",
    velocityFactorUnit: "percentage",
    numberFormatterOptions: {
      "significantDigits": 3,
      "maxPositiveExponent": 6,
      "minNegativeExponent": -4
    },
    notifyIOData: ""
  };
}

COSMATT.MotionProfile.getRotaryDefaults =  function(){
  return {
      linearOrRotary: COSMATT.MotionProfile.ENUMS.LinearOrRotary.Rotary,
      graphUnits: {
        "Velocity": "revolutionsperminute",
        "Position": "revolution",
        "Acceleration": "radianpersecondsquare",
        "Jerk": "radianpersecondcube"
      },
      UnitData: {
        "Velocity": "ANGULARVELOCITY",
        "Position": "ANGULARDISTANCE",
        "Acceleration": "ANGULARACCELERATION",
        "Jerk": "ANGULARJERK"
      },
      moveDistanceUnit: "radian",
      peakVelocityUnit: "radianpersecond",
      rmsVelocityUnit: "radianpersecond",
      peakAccelarationUnit: "radianpersecondsquare",
      rmsAccelarationUnit: "radianpersecondsquare",
      moveDistanceDefaultUnit: "revolution",
      peakVelocityDefaultUnit: "revolutionsperminute",
      rmsVelocityDefaultUnit: "revolutionsperminute"
    };
 } 

  COSMATT.MotionProfile.getlinearDefaults = function(){
    return {
      linearOrRotary: COSMATT.MotionProfile.ENUMS.LinearOrRotary.Linear,
      graphUnits: {
        "Velocity": "meterpersecond",
        "Position": "meter",
        "Acceleration": "meterpersecondsquare",
        "Jerk": "meterpersecondcube"
      },
      UnitData: {
        "Velocity": "VELOCITY",
        "Position": "LINEARDISTANCE",
        "Acceleration": "ACCELERATION",
        "Jerk": "JERK"
      },
      moveDistanceUnit: "meter",
      peakVelocityUnit: "meterpersecond",
      rmsVelocityUnit: "meterpersecond",
      peakAccelarationUnit: "meterpersecondsquare",
      rmsAccelarationUnit: "meterpersecondsquare",
      moveDistanceDefaultUnit: "meter",
      peakVelocityDefaultUnit: "meterpersecond",
      rmsVelocityDefaultUnit: "meterpersecond"
    };
  }

