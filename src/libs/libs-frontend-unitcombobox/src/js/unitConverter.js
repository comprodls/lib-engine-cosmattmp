; //Setup Namspace
window.COSMATT = window.COSMATT || {};

COSMATT.UNITCONVERTER = (function() {

  //loading unitData.json from some external url
  /*  $.ajax({
            dataType: "text",
            url: '../libs-frontend-unitcombobox/src/data/unitData.json',
            async: false,
            success: function(data) {
             
                unitData = $.parseJSON(data);
            },
            error: function(error) {
                console.error("Json is not loaded");
            }
        });
*/



  /*  convertedValue function return converted value based on provided inputs
   * unitType can be: Time or ANGULARACCELERATION or MASS etc  
   * value : input box current value
   * unitFrom : combo box current selected unit name
   * unitTo : combo box changed unit name
   */
  var convertedValue = function(unitType, value, unitFrom, unitTo) {
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
      convertedValue = (unitToConverionFactor / unitFromConverionFactor) * value;
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
        units.push(unitNode[loop].symbol);
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
        unitsObj['name'] = unitNode[loop].symbol;
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
          SIUnitObj.name = unitNode[loop].symbol;
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

  /* conversionFactor function return value of conversion factor for each unit type
   * input vaulue is string of unitType and unitName
   * Example :unitType = 'TIME',  unitName = 'msec'
   * function will return '60000'
   */
  var conversionRatioById = function(unitType, unitFrom, UnitTo) {
    try {
      var prevConversionFactor = 1;
      var newConversionFactor = 1;
      unitNode = unitData.unitType[unitType].unit;
      for (var loop = 0; loop < unitNode.length; loop++) {
        if (unitFrom == "SI" && unitNode[loop].isSI) {
          prevConversionFactor = unitNode[loop].conversionFactor;
        } else if (unitNode[loop].id == unitFrom) {
          prevConversionFactor = unitNode[loop].conversionFactor;
        }

        if (UnitTo == "SI" && unitNode[loop].isSI) {
          newConversionFactor = unitNode[loop].conversionFactor;
        } else if (unitNode[loop].id == UnitTo) {
          newConversionFactor = unitNode[loop].conversionFactor;
        }
      }
      return newConversionFactor / prevConversionFactor;
    } catch (errorMessage) {
      console.log('Error : ' + errorMessage);
    }

  };

  var unitDetails = function(unitType, unit) {
    try {
      var unitNode = [];

      unitNode = unitData.unitType[unitType].unit;
      for (var loop = 0; loop < unitNode.length; loop++) {
        if (unitNode[loop].id == unit) {
          return (unitNode[loop]);
        }
      }
      return null;
    } catch (errorMessage) {
      console.log('Error : ' + errorMessage);
    }
  }


  /* PUBLIC METHODS */
  return {
    // Exposed functions
    getUnits: units,
    getunitsAndIds: unitsAndIds,
    getSIUnit: SIUnit,
    getSIValue: SIValue,
    getUnitConvertedValue: convertedValue,
    getConversionFactor: conversionFactor,
    getConversionRatio: conversionRatio,
    getConversionRatioById: conversionRatioById,
    getUnitDetails: unitDetails

  };

}());