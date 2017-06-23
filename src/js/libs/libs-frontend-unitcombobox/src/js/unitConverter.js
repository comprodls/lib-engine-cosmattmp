; //Setup Namspace
var COSMATT = COSMATT || {};

COSMATT.UNITCONVERTER = (function() {
  /*  var unitData = "";
        //loading unitData.json from some external url
        $.ajax({
            dataType: "text",
            url: dataJsonPath,
            async: false,
            success: function(data) {
                unitData = $.parseJSON(data);
            },
            error: function(error) {
                console.error("Json is not loaded");
            }
        });*/

  var unitData = {
    "unitType": {

      "LINEARDISTANCE": {
        "unit": [{
          "name": "m",
          "conversionFactor": 0.0254,
          "isSI": true,
          "id": "LINEARDISTANCE_1"
        }, {
          "name": "cm",
          "conversionFactor": 2.54,
          "id": "LINEARDISTANCE_2"
        }, {
          "name": "mm",
          "conversionFactor": 25.4,
          "id": "LINEARDISTANCE_3"
        }, {
          "name": "in",
          "conversionFactor": 1,
          "id": "LINEARDISTANCE_4"
        }, {
          "name": "ft",
          "conversionFactor": 0.0833333333333333,
          "id": "LINEARDISTANCE_5"
        }, {
          "name": "Km",
          "conversionFactor": 0.0000254,
          "id": "LINEARDISTANCE_6"
        }]
      },
      "ANGULARDISTANCE": {
        "unit": [{
          "name": "rad",
          "conversionFactor": 6.28318530717958,
          "isSI": true,
          "id": "ANGULARDISTANCE_1"
        }, {
          "name": "deg",
          "conversionFactor": 360,
          "id": "ANGULARDISTANCE_2"
        }, {
          "name": "rev",
          "conversionFactor": 1,
          "id": "ANGULARDISTANCE_3"
        }, {
          "name": "min",
          "conversionFactor": 21600,
          "id": "ANGULARDISTANCE_4"
        }]
      },
      "VELOCITY": {
        "unit": [{
          "name": "m/sec",
          "conversionFactor": 0.0254,
          "isSI": true,
          "id": "VELOCITY_1"
        }, {
          "name": "cm/sec",
          "conversionFactor": 2.54,
          "id": "VELOCITY_2"
        }, {
          "name": "mm/sec",
          "conversionFactor": 25.4,
          "id": "VELOCITY_3"
        }, {
          "name": "in/sec",
          "conversionFactor": 1,
          "id": "VELOCITY_4"
        }, {
          "name": "ft/sec",
          "conversionFactor": 0.0833333333333333,
          "id": "VELOCITY_5"
        }, {
          "name": "ft/min",
          "conversionFactor": 5,
          "id": "VELOCITY_6"
        }]
      },
      "ANGULARVELOCITY": {
        "unit": [{
          "name": "rad/sec",
          "conversionFactor": 1,
          "isSI": true,
          "id": "ANGULARVELOCITY_1"
        }, {
          "name": "deg/sec",
          "conversionFactor": 57.2957795130823,
          "id": "ANGULARVELOCITY_2"
        }, {
          "name": "rev/sec",
          "conversionFactor": 0.159154943091895,
          "id": "ANGULARVELOCITY_3"
        }, {
          "name": "rpm",
          "conversionFactor": 9.54929658551372,
          "id": "ANGULARVELOCITY_4"
        }]
      },
      "ACCELERATION": {
        "unit": [{
          "name": "m/sec&sup2;",
          "conversionFactor": 0.0254,
          "isSI": true,
          "id": "ACCELERATION_1"
        }, {
          "name": "cm/sec&sup2;",
          "conversionFactor": 2.54,
          "id": "ACCELERATION_2"
        }, {
          "name": "mm/sec&sup2;",
          "conversionFactor": 25.4,
          "id": "ACCELERATION_3"
        }, {
          "name": "in/sec&sup2;",
          "conversionFactor": 1,
          "id": "ACCELERATION_4"
        }, {
          "name": "ft/sec&sup2;",
          "conversionFactor": 0.0833333333333333,
          "id": "ACCELERATION_5"
        }, {
          "name": "g",
          "conversionFactor": 0.00259007914966232,
          "id": "ACCELERATION_6"
        }]
      },
      "ANGULARACCELERATION": {
        "unit": [{
          "name": "rad/sec&sup2;",
          "conversionFactor": 1,
          "isSI": true,
          "id": "ANGULARACCELERATION_1"
        }, {
          "name": "deg/sec&sup2;",
          "conversionFactor": 57.2957795130823,
          "id": "ANGULARACCELERATION_2"
        }, {
          "name": "rev/sec&sup2;",
          "conversionFactor": 0.159154943091895,
          "id": "ANGULARACCELERATION_3"
        }, {
          "name": "rpm/sec",
          "conversionFactor": 9.54929658551372,
          "id": "ANGULARACCELERATION_4"
        }]
      },
      "TIME": {
        "unit": [{
          "name": "sec",
          "conversionFactor": 60,
          "isSI": true,
          "id": "TIME_1"
        }, {
          "name": "min",
          "conversionFactor": 1,
          "id": "TIME_2"
        }, {
          "name": "msec",
          "conversionFactor": 60000,
          "id": "TIME_3"
        }]
      },
      "MASS": {
        "unit": [{
          "name": "kg",
          "conversionFactor": 0.0283495199999999,
          "isSI": true,
          "id": "MASS_1"
        }, {
          "name": "gm",
          "conversionFactor": 28.3495199999999,
          "id": "MASS_2"
        }, {
          "name": "oz",
          "conversionFactor": 1,
          "id": "MASS_3"
        }, {
          "name": "lb",
          "conversionFactor": 0.0625,
          "id": "MASS_4"
        }]
      },
      "FORCE": {
        "unit": [{
          "name": "N",
          "conversionFactor": 4.4482216153,
          "isSI": true,
          "id": "FORCE_1"
        }, {
          "name": "kgf",
          "conversionFactor": 0.45359237,
          "id": "FORCE_2"
        }, {
          "name": "lbf",
          "conversionFactor": 1,
          "id": "FORCE_3"
        }, {
          "name": "dyne",
          "conversionFactor": 444822.161526051,
          "id": "FORCE_4"
        }]
      },
      "TORQUE": {
        "unit": [{
          "name": "N-m",
          "conversionFactor": 0.007061552,
          "isSI": true,
          "id": "TORQUE_1"
        }, {
          "name": "oz-in",
          "conversionFactor": 1,
          "id": "TORQUE_2"
        }, {
          "name": "lb-in",
          "conversionFactor": 0.0625,
          "id": "TORQUE_3"
        }, {
          "name": "lb-ft",
          "conversionFactor": 0.00520833333333333,
          "id": "TORQUE_4"
        }]
      },
      "INERTIA": {
        "unit": [{
          "name": "kg-m&sup2;",
          "conversionFactor": 0.0000182997852,
          "isSI": true,
          "id": "INERTIA_1"
        }, {
          "name": "kg-cm&sup2;",
          "conversionFactor": 0.182997852,
          "id": "INERTIA_2"
        }, {
          "name": "Nm-s&sup2;",
          "conversionFactor": 0.0000182997852,
          "id": "INERTIA_3"
        }, {
          "name": "oz-in-s&sup2;",
          "conversionFactor": 0.00259008,
          "id": "INERTIA_4"
        }, {
          "name": "lb-in-s&sup2;",
          "conversionFactor": 0.00016188,
          "id": "INERTIA_5"
        }, {
          "name": "lb-ft-s&sup2;",
          "conversionFactor": 0.00001349,
          "id": "INERTIA_6"
        }, {
          "name": "oz-in&sup2;",
          "conversionFactor": 1,
          "id": "INERTIA_7"
        }, {
          "name": "lb-in&sup2;",
          "conversionFactor": 0.0625,
          "id": "INERTIA_8"
        }, {
          "name": "lb-ft&sup2;",
          "conversionFactor": 0.000434028,
          "id": "INERTIA_9"
        }, {
          "name": "gm-mm&sup2;",
          "conversionFactor": 18299.7852,
          "id": "INERTIA_10"
        }, {
          "name": "Kg-mm&sup2;",
          "conversionFactor": 18.2997852,
          "id": "INERTIA_11"
        }]
      },
      "POWER": {
        "unit": [{
          "name": "watts",
          "conversionFactor": 746,
          "isSI": true,
          "id": "POWER_1"
        }, {
          "name": "HP",
          "conversionFactor": 1,
          "id": "POWER_2"
        }, {
          "name": "kW",
          "conversionFactor": 0.746,
          "id": "POWER_3"
        }]
      },
      "TEMPERATURE": {
        "unit": [{
          "name": "ºC",
          "conversionFactor": 1,
          "isSI": true,
          "id": "TEMPERATURE_1"
        }, {
          "name": "ºF",
          "conversionFactor": 1,
          "id": "TEMPERATURE_2"
        }]
      },
      "TORQUECONSTANT": {
        "unit": [{
          "name": "Nm/A",
          "conversionFactor": 1,
          "isSI": true,
          "id": "TORQUECONSTANT_1"
        }, {
          "name": "kg-m/A",
          "conversionFactor": 0.101971621296887,
          "id": "TORQUECONSTANT_2"
        }, {
          "name": "kg-cm/A",
          "conversionFactor": 10.1971621296887,
          "id": "TORQUECONSTANT_3"
        }, {
          "name": "gm-cm/A",
          "conversionFactor": 10197.1621296887,
          "id": "TORQUECONSTANT_4"
        }, {
          "name": "oz-in/A",
          "conversionFactor": 141.61193228,
          "id": "TORQUECONSTANT_5"
        }, {
          "name": "lb-in/A",
          "conversionFactor": 8.85074577,
          "id": "TORQUECONSTANT_6"
        }, {
          "name": "lb-ft/A",
          "conversionFactor": 0.73756215,
          "id": "TORQUECONSTANT_7"
        }]
      },
      "DAMPINGCONSTANT": {
        "unit": [{
          "name": "Nm/krpm",
          "conversionFactor": 1,
          "id": "DAMPINGCONSTANT_1"
        }, {
          "name": "kg-m/krpm",
          "conversionFactor": 0.101971621296887,
          "id": "DAMPINGCONSTANT_2"
        }, {
          "name": "kg-cm/krpm",
          "conversionFactor": 10.1971621296887,
          "id": "DAMPINGCONSTANT_3"
        }, {
          "name": "gm-cm/krpm",
          "conversionFactor": 10197.1621296887,
          "id": "DAMPINGCONSTANT_4"
        }, {
          "name": "oz-in/krpm",
          "conversionFactor": 141.61193228,
          "id": "DAMPINGCONSTANT_5"
        }, {
          "name": "lb-in/krpm",
          "conversionFactor": 8.85074577,
          "id": "DAMPINGCONSTANT_6"
        }, {
          "name": "lb-ft/krpm",
          "conversionFactor": 0.73756215,
          "id": "DAMPINGCONSTANT_7"
        }, {
          "name": "Nm/rad/sec",
          "conversionFactor": 0.00954929658551372,
          "isSI": true,
          "id": "DAMPINGCONSTANT_8"
        }]
      },
      "THERMALRESISTANCE": {
        "unit": [{
          "name": "ºC/Watt",
          "conversionFactor": 1,
          "isSI": true,
          "id": "THERMALRESISTANCE_1"
        }]
      },
      "RESISTANCE": {
        "unit": [{
          "name": "Ohms",
          "conversionFactor": 1,
          "isSI": true,
          "id": "THERMALRESISTANCE_2"
        }]
      },
      "INDUCTANCE": {
        "unit": [{
          "name": "H",
          "conversionFactor": 1,
          "isSI": true,
          "id": "INDUCTANCE_1"
        }]
      },
      "CURRENT": {
        "unit": [{
          "name": "A(0-pk)",
          "conversionFactor": 1,
          "isSI": true,
          "id": "CURRENT_1"
        }, {
          "name": "A(RMS)",
          "conversionFactor": 0.707106781186547,
          "id": "CURRENT_2"
        }]
      },
      "TEMPERATURECOFFICIENT": {
        "unit": [{
          "name": "/ºC",
          "conversionFactor": 1,
          "isSI": true,
          "id": "TEMPERATURECOFFICIENT_1"
        }, {
          "name": "%/ºC",
          "conversionFactor": 100,
          "id": "TEMPERATURECOFFICIENT_2"
        }]
      },
      "CAPACITANCE": {
        "unit": [{
          "name": "F",
          "conversionFactor": 1,
          "isSI": true,
          "id": "CAPACITANCE_1"
        }, {
          "name": "µF",
          "conversionFactor": 1000000,
          "id": "CAPACITANCE_2"
        }]
      },
      "VOLTAGE": {
        "unit": [{
          "name": "Volts",
          "conversionFactor": 1,
          "isSI": true,
          "id": "VOLTAGE_1"
        }]
      },
      "DENSITY": {
        "unit": [{
          "name": "Kg/m&sup3",
          "conversionFactor": 27679.9047,
          "isSI": true,
          "id": "DENSITY_1"
        }, {
          "name": "Kg/cm&sup3",
          "conversionFactor": 0.0276799047,
          "id": "DENSITY_2"
        }, {
          "name": "gm/m&sup3",
          "conversionFactor": 27679904.7,
          "id": "DENSITY_3"
        }, {
          "name": "lb/in&sup3",
          "conversionFactor": 1,
          "id": "DENSITY_4"
        }, {
          "name": "lb/ft&sup3",
          "conversionFactor": 1728,
          "id": "DENSITY_5"
        }, {
          "name": "gm/cm&sup3",
          "conversionFactor": 27.6799047,
          "id": "DENSITY_6"
        }]
      },
      "ROLLOFF": {
        "unit": [{
          "name": "Nm/(rad/sec)&sup2",
          "conversionFactor": 1,
          "isSI": true,
          "id": "ROLLOFF_1"
        }]
      },
      "MAGNETTEMPCOFFICIENT": {
        "unit": []
      },
      "LEAD": {
        "unit": [{
          "name": "mm/rev",
          "conversionFactor": 1,
          "isSI": true,
          "id": "LEAD_1"
        }, {
          "name": "in/rev",
          "conversionFactor": 0.03937007874016,
          "id": "LEAD_2"
        }]
      },
      "INCLINATION": {
        "unit": [{
          "name": "rad",
          "conversionFactor": 0.0174532925199433,
          "isSI": true,
          "id": "INCLINATION_1"
        }, {
          "name": "deg",
          "conversionFactor": 1,
          "id": "INCLINATION_2"
        }]
      },
      "DIAMETER": {
        "unit": [{
          "name": "mm",
          "conversionFactor": 25.4,
          "id": "DIAMETER_1"
        }, {
          "name": "cm",
          "conversionFactor": 2.54,
          "id": "DIAMETER_2"
        }, {
          "name": "m",
          "conversionFactor": 0.0254,
          "isSI": true,
          "id": "DIAMETER_3"
        }, {
          "name": "in",
          "conversionFactor": 1,
          "id": "DIAMETER_4"
        }, {
          "name": "ft",
          "conversionFactor": 0.0833333333333333,
          "id": "DIAMETER_5"
        }]
      },
      "FORCECONSTANT": {
        "unit": [{
          "name": "N/A",
          "conversionFactor": 1,
          "isSI": true,
          "id": "FORCECONSTANT_1"
        }, {
          "name": "kg/A",
          "conversionFactor": 0.101971621296887,
          "id": "FORCECONSTANT_2"
        }, {
          "name": "gm/A",
          "conversionFactor": 101.971621296887,
          "id": "FORCECONSTANT_3"
        }, {
          "name": "oz/A",
          "conversionFactor": 3.59694,
          "id": "FORCECONSTANT_4"
        }, {
          "name": "lb/A",
          "conversionFactor": 0.224809,
          "id": "FORCECONSTANT_5"
        }]
      },
      "ENERGY": {
        "unit": [{
          "name": "J",
          "conversionFactor": 1,
          "isSI": true,
          "id": "ENERGY_1"
        }]
      },
      "LIFE": {
        "unit": [{
          "name": "Year",
          "conversionFactor": 1,
          "isSI": true,
          "id": "LIFE_1"
        }, {
          "name": "Days",
          "conversionFactor": 365,
          "id": "LIFE_2"
        }, {
          "name": "Weeks",
          "conversionFactor": 52.1428571428571,
          "id": "LIFE_3"
        }]
      },
      "ALTITUDE": {
        "unit": [{
          "name": "m",
          "conversionFactor": 0.0254,
          "isSI": true,
          "id": "ALTITUDE_1"
        }, {
          "name": "cm",
          "conversionFactor": 2.54,
          "id": "ALTITUDE_2"
        }, {
          "name": "mm",
          "conversionFactor": 25.4,
          "id": "ALTITUDE_3"
        }, {
          "name": "in",
          "conversionFactor": 1,
          "id": "ALTITUDE_4"
        }, {
          "name": "ft",
          "conversionFactor": 0.0833333333333333,
          "id": "ALTITUDE_5"
        }, {
          "name": "Km",
          "conversionFactor": 0.0000254,
          "id": "ALTITUDE_6"
        }]
      },
      "LINEARDAMPING": {
        "unit": [{
          "name": "N/m/s",
          "conversionFactor": 175.126818058489,
          "isSI": true,
          "id": "LINEARDAMPING_1"
        }, {
          "name": "kgf/m/s",
          "conversionFactor": 17.8579653543307,
          "id": "LINEARDAMPING_2"
        }, {
          "name": "lbf/in/s",
          "conversionFactor": 1,
          "id": "LINEARDAMPING_3"
        }]
      },
      "CURRENCY": {
        "unit": [{
          "name": "$(USD)",
          "conversionFactor": 1,
          "isSI": true,
          "id": "CURRENCY_1"
        }, {
          "name": "EUR",
          "conversionFactor": 0.703,
          "id": "CURRENCY_2"
        }, {
          "name": "GBP",
          "conversionFactor": 0.491,
          "id": "CURRENCY_3"
        }]
      },
      "JERK": {
        "unit": [{
          "name": "m/sec&sup3",
          "conversionFactor": 0.0254,
          "isSI": true,
          "id": "JERK_1"
        }, {
          "name": "cm/sec&sup3",
          "conversionFactor": 2.54,
          "id": "JERK_2"
        }, {
          "name": "mm/sec&sup3",
          "conversionFactor": 25.4,
          "id": "JERK_3"
        }, {
          "name": "in/sec&sup3",
          "conversionFactor": 1,
          "id": "JERK_4"
        }, {
          "name": "ft/sec&sup3",
          "conversionFactor": 0.0833333333333333,
          "id": "JERK_5"
        }]
      },
      "VOLUME": {
        "unit": [{
          "name": "m&sup3",
          "conversionFactor": 0.000016387064,
          "isSI": true,
          "id": "VOLUMEt_1"
        }, {
          "name": "cm&sup3",
          "conversionFactor": 16.387064,
          "id": "VOLUMEt_2"
        }, {
          "name": "mm&sup3",
          "conversionFactor": 16387.064,
          "id": "VOLUMEt_3"
        }, {
          "name": "in&sup3",
          "conversionFactor": 1,
          "id": "VOLUMEt_4"
        }, {
          "name": "ft&sup3",
          "conversionFactor": 0.000578704,
          "id": "VOLUMEt_5"
        }]
      },
      "AREA": {
        "unit": [{
          "name": "m&sup2",
          "conversionFactor": 0.000645159999999949,
          "isSI": true,
          "id": "AREA_1"
        }, {
          "name": "cm&sup2",
          "conversionFactor": 6.4516,
          "id": "AREA_2"
        }, {
          "name": "mm&sup2",
          "conversionFactor": 645.16,
          "id": "AREA_3"
        }, {
          "name": "in&sup2",
          "conversionFactor": 1,
          "id": "AREA_4"
        }, {
          "name": "ft&sup2",
          "conversionFactor": 0.00694444444444438,
          "id": "AREA_5"
        }]
      },
      "ANGULARJERK": {
        "unit": [{
          "name": "rad/sec&sup3",
          "conversionFactor": 1,
          "isSI": true,
          "id": "ANGULARJERK_1"
        }, {
          "name": "deg/sec&sup3",
          "conversionFactor": 57.2957795130823,
          "id": "ANGULARJERK_2"
        }, {
          "name": "rev/sec&sup3",
          "conversionFactor": 0.159154943091895,
          "id": "ANGULARJERK_3"
        }, {
          "name": "rpm/sec&sup2",
          "conversionFactor": 9.54929658551372,
          "id": "ANGULARJERK_4"
        }]
      },
      "MOMENT": {
        "unit": [{
          "name": "N-m",
          "conversionFactor": 0.007061552,
          "isSI": true,
          "id": "MOMENT_1"
        }, {
          "name": "oz-in",
          "conversionFactor": 1,
          "id": "MOMENT_2"
        }, {
          "name": "lb-in",
          "conversionFactor": 0.0625,
          "id": "MOMENT_3"
        }, {
          "name": "lb-ft",
          "conversionFactor": 0.00520833333333333,
          "id": "MOMENT_4"
        }]
      },
      "BANDWIDTH": {
        "unit": [{
          "name": "1/sec",
          "conversionFactor": 1,
          "isSI": true,
          "id": "BANDWIDTH_1"
        }]
      },
      "INTEGRAL": {
        "unit": [{
          "name": "1/ms-s",
          "conversionFactor": 1,
          "isSI": true,
          "id": "INTEGRAL_1"
        }]
      },
      "STIFFNESSROTARY": {
        "unit": [{
          "name": "Nm/deg",
          "conversionFactor": 1,
          "isSI": true,
          "id": "STIFFNESSROTARY_1"
        }]
      },
      "BACKLASH": {
        "unit": [{
          "name": "arc min",
          "conversionFactor": 1,
          "isSI": true,
          "id": "BACKLASH_1"
        }]
      },
      "FREQUENCY": {
        "unit": [{
          "name": "Hz",
          "conversionFactor": 1,
          "isSI": true,
          "id": "FREQUENCY_1"
        }]
      },
      "PRESSURE": {
        "unit": [{
          "name": "GPa",
          "conversionFactor": 1,
          "isSI": true,
          "id": "PRESSURE_1"
        }]
      },
      "THERMALMASS": {
        "unit": [{
          "name": "J/ºC",
          "conversionFactor": 1,
          "isSI": true,
          "id": "THERMALMASS_1"
        }]
      },
      "STIFFNESSLINEAR": {
        "unit": [{
          "name": "N/mm",
          "conversionFactor": 1,
          "isSI": true,
          "id": "STIFFNESSLINEAR_1"
        }]
      },
      "PERCENTAGE": {
        "unit": [{
          "name": "%",
          "conversionFactor": 1,
          "isSI": true,
          "id": "PERCENTAGE_1"
        }]
      }
    }

  }


  /*  convertedValue function return converted value based on provided inputs
   * unitType can be: Time or ANGULARACCELERATION or MASS etc  
   * amount : input box current value
   * unitFrom : combo box current selected unit name
   * unitTo : combo box changed unit name
   */
  var convertedValue = function(unitType, amount, unitFrom, unitTo) {
    try {
      var convertedValue = "";
      var unitFromConverionFactor = "";
      var unitToConverionFactor = "";
      unitNode = unitData.unitType[unitType].unit;
      for (var loop = 0; loop < unitNode.length; loop++) {
        if (unitNode[loop].id == unitFrom) {
          unitFromConverionFactor = (unitNode[loop].conversionFactor);
        }
        if (unitNode[loop].id == unitTo) {
          unitToConverionFactor = (unitNode[loop].conversionFactor);
        }
      }
      convertedValue = (unitToConverionFactor / unitFromConverionFactor) * amount;
      return (convertedValue);
    } catch (errorMessage) {

      console.log('Error : ' + errorMessage);

    }

  };

  /*  units function return array of units.
   * input vaulue is string of unitType 
   * unitType can be: Time or ANGULARACCELERATION or MASS etc  
   */
  var units = function(unitType) {
    try {
      var units = [];
      var unitNode = [];
      unitNode = unitData.unitType[unitType].unit;
      for (var loop = 0; loop < unitNode.length; loop++) {
        units.push(unitNode[loop].name);
      }
      return units;
    } catch (errorMessage) {

      console.log('Error : ' + errorMessage);

    }


  };
  var unitsAndIds = function(unitType) {

    try {
      var units = [];
      var unitNode = [];
      unitNode = unitData.unitType[unitType].unit;
      for (var loop = 0; loop < unitNode.length; loop++) {
        var unitsObj = {};
        unitsObj['name'] = unitNode[loop].name;
        unitsObj['id'] = unitNode[loop].id;
        units.push(unitsObj);
      }

      return units;
    } catch (errorMessage) {

      console.log('Error : ' + errorMessage);

    }


  };
  /*  SIUnit function return unitType SI unit name
   * input vaulue is string of unitType 
   * Example :unitType = 'TIME' 
   * function will return 'sec'
   */
  var SIUnit = function(unitType) {
    try {
      var SIUnitObj = {};
      unitNode = unitData.unitType[unitType].unit;
      for (var loop = 0; loop < unitNode.length; loop++) {
        if (unitNode[loop].isSI != undefined && unitNode[loop].isSI == true) {
          SIUnitObj.name = unitNode[loop].name;
          SIUnitObj.id = unitNode[loop].id;
        }
      }
      return SIUnitObj;
    } catch (errorMessage) {

      console.log('Error : ' + errorMessage);

    }

  };

  var SIValue = function(unitType, selectedUnit, value) {
    try {
      var SIUnitIndex;
      unitNode = unitData.unitType[unitType].unit;
      for (var loop = 0; loop < unitNode.length; loop++) {
        if (unitNode[loop].isSI != undefined && unitNode[loop].isSI == true) {
          SIUnitIndex = loop;
          break;
        }
      }
      if (SIUnitIndex === selectedUnit) {
        return value;
      }
      return (value * conversionRatio(unitType, selectedUnit, SIUnitIndex));
    } catch (errorMessage) {

      console.log('Error : ' + errorMessage);

    }

  };
  /* conversionFactor function return value of conversion factor for each unit type
   * input vaulue is string of unitType and unitName
   * Example :unitType = 'TIME',  unitName = 'msec'
   * function will return '60000'
   */
  var conversionFactor = function(unitType, unitName) {
    try {
      var conversionFactor = '';
      unitNode = unitData.unitType[unitType].unit;

      for (var loop = 0; loop < unitNode.length; loop++) {
        if (unitNode[loop].id == unitName) {
          conversionFactor = unitNode[loop].conversionFactor;
        }


      }
      return conversionFactor;
    } catch (errorMessage) {

      console.log('Error : ' + errorMessage);

    }

  };

  /* conversionFactor function return value of conversion factor for each unit type
   * input vaulue is string of unitType and unitName
   * Example :unitType = 'TIME',  unitName = 'msec'
   * function will return '60000'
   */
  var conversionRatio = function(unitType, prevIndex, newIndex) {
    try {
      var prevConversionFactor = 1;
      var newConversionFactor = 1;
      unitNode = unitData.unitType[unitType].unit;

      for (var loop = 0; loop < unitNode.length; loop++) {
        if (loop == prevIndex) {
          prevConversionFactor = unitNode[loop].conversionFactor;
        }
        if (loop == newIndex) {
          newConversionFactor = unitNode[loop].conversionFactor;
        }
      }
      return newConversionFactor / prevConversionFactor;
    } catch (errorMessage) {
      console.log('Error : ' + errorMessage);
    }

  };


  /* PUBLIC METHODS */
  return {
    // Exposed functions
    getUnits: units,
    getunitsAndIds: unitsAndIds,
    getSIUnit: SIUnit,
    getSIValue: SIValue,
    getUnitConvertedValue: convertedValue,
    getConversionFactor: conversionFactor,
    getConversionRatio: conversionRatio

  };

}());