'use strict';

window.COSMATT = window.COSMATT || {};
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
  },
  UnitData: {
    "Velocity": "ANGULARVELOCITY",
    "Position": "ANGULARDISTANCE",
    "Acceleration": "ANGULARACCELERATION",
    "Jerk": "ANGULARJERK"
  }
};

(function ($) {
  $.fn.motionProfile = function (options) {
    var defaults = {
      activeProfileIndex: 1,
      moveDistance: 125.664,
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
      moveDistanceUnit: "radian",
      moveTimeUnit: "second",
      dwellTimeUnit: "second",
      peakVelocityUnit: "radianpersecond",
      rmsVelocityUnit: "radianpersecond",
      peakAccelarationUnit: "radianpersecondsquare",
      rmsAccelarationUnit: "radianpersecondsquare",
      velocityFactorUnit: "percentage",
      graphUnits: {
        "Velocity": "radianpersecond",
        "Position": "radian",
        "Acceleration": "radianpersecondsquare",
        "Jerk": "radianpersecondcube"
      },
      moveDistanceUnitDefaultSelected: "revolution",
      numberFormatterOptions: {
        "significantDigits": 3,
        "maxPositiveExponent": 6,
        "minNegativeExponent": -4
      }
    };

    if (options.assessmentMode) {
      defaults.moveDistance = "";
      defaults.moveTime = "";
      defaults.dwellTime = "";
      defaults.activeProfileIndex = 3;
    }

    var settings = $.extend(defaults, options);
    var numberFormatter = new Cosmatt.NumberFormatter(settings.numberFormatterOptions);
    var tickFormatter = function (value, axis) {
      if(value.toString().trim() === '') {
        return value;
      }
      return numberFormatter.format(value);
    }
    settings.graphModeVal = settings.graphMode;
    var $container = this;
    var $widgetContainer = $('<div class="cosmatt-motionProfile unselectable" unselectable="on"></div>');
    $container.append($widgetContainer);
    $widgetContainer.append('<div id="profileButtons"><button class="btn btn-default profileButton" id="btn1">Profile 1</button><button class="btn btn-default profileButton" id="btn2">Profile 2</button><button class="btn btn-default profileButton" id="btn3">Profile 3</button></div><div id="graphContainer" class=""></div><div id="inputControls"></div>');
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
        graphtype: "Velocity",
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
        graphtype: "Position",
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
        graphtype: "Acceleration",
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
        graphtype: "Jerk",
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
        graphtype: "Velocity",
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
        graphtype: "Position",
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
        graphtype: "Velocity",
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
        graphtype: "Velocity",
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
        position: 'bottom',
        tickFormatter: tickFormatter
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

    var resetProfileData = function () {
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

    var getHighestPoint = function (segmentData, axis, leastVal) {
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

    var getAioGraphPoints = function () {
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

    var updateGraph = function (segmentData) {
      var keys = Object.keys(segmentData);
      var highestTime = getHighestPoint(segmentData, "time_final", xmin);

      if (posPlot) {
        var highestYPtPos = getHighestPoint(segmentData, "position_final", posYMax);

        var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Position"], 'SI', settings.graphUnits["Position"]);
        if (conversionFactor && conversionFactor != 1) highestYPtPos *= conversionFactor;

        posPlot.getOptions().yaxes[0].max = highestYPtPos;
        posPlot.getOptions().yaxes[0].min = -1 * highestYPtPos;
        posPlot.getOptions().xaxes[0].max = highestTime;
        posPlot.setupGrid();
        posPlot.setData([dataSet.pos, pointsDataSet.pos]);
        posPlot.draw();
      }

      if (velPlot) {
        var highestYPtVel = getHighestPoint(segmentData, "velocity_final", velYMax);

        var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Velocity"], 'SI', settings.graphUnits["Velocity"]);
        if (conversionFactor && conversionFactor != 1) highestYPtVel *= conversionFactor;

        velPlot.getOptions().yaxes[0].max = highestYPtVel;
        velPlot.getOptions().yaxes[0].min = -1 * highestYPtVel;
        velPlot.getOptions().xaxes[0].max = highestTime;
        velPlot.setupGrid();
        velPlot.setData([dataSet.vel, pointsDataSet.vel, pointsDataSet.dwell, pointsDataSet.movetime]);
        velPlot.draw();
      }

      if (accPlot) {
        var highestYPtAcc = getHighestPoint(segmentData, "acceleration_final", accYMax);

        var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Acceleration"], 'SI', settings.graphUnits["Acceleration"]);
        if (conversionFactor && conversionFactor != 1) highestYPtAcc *= conversionFactor;

        accPlot.getOptions().yaxes[0].max = highestYPtAcc;
        accPlot.getOptions().yaxes[0].min = -1 * highestYPtAcc;
        accPlot.getOptions().xaxes[0].max = highestTime;
        accPlot.setupGrid();
        accPlot.setData([dataSet.acc]);
        accPlot.draw();
      }

      if (jerkPlot) {
        var highestYPtJerk = getHighestPoint(segmentData, "jerk", jerkYMax);

        var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Jerk"], 'SI', settings.graphUnits["Jerk"]);
        if (conversionFactor && conversionFactor != 1) highestYPtJerk *= conversionFactor;

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
            case "Position (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Position"], settings.graphUnits["Position"]).symbol + ")":
              highestYPt = getHighestPoint(segmentData, "position_final", posYMax);

              var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Position"], 'SI', settings.graphUnits["Position"]);
              if (conversionFactor && conversionFactor != 1) highestYPt *= conversionFactor;

              break;

            case "Velocity (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Velocity"], settings.graphUnits["Velocity"]).symbol + ")":
              highestYPt = getHighestPoint(segmentData, "velocity_final", velYMax);

              var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Velocity"], 'SI', settings.graphUnits["Velocity"]);
              if (conversionFactor && conversionFactor != 1) highestYPt *= conversionFactor;

              break;

            case "Acceleration (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Acceleration"], settings.graphUnits["Acceleration"]).symbol + ")":
              highestYPt = getHighestPoint(segmentData, "acceleration_final", accYMax);

              var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Acceleration"], 'SI', settings.graphUnits["Acceleration"]);
              if (conversionFactor && conversionFactor != 1) highestYPt *= conversionFactor;

              break;

            case "Jerk (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Jerk"], settings.graphUnits["Jerk"]).symbol + ")":
              highestYPt = getHighestPoint(segmentData, "jerk", jerkYMax);

              var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Jerk"], 'SI', settings.graphUnits["Jerk"]);
              if (conversionFactor && conversionFactor != 1) highestYPt *= conversionFactor;

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

    var plotGraph = function (segmentData) {
      //append graphs to dom

      attachResizeToPlots(segmentData);
    };

    var attachResizeToPlots = function (segmentData) {
      var $graphContainer = $widgetContainer.find("#graphContainer");
      var triggerResize = true;
      var resetPlots = function () {
        if (posPlot) posPlot = posPlot.destroy();
        if (velPlot) velPlot = velPlot.destroy();
        if (accPlot) accPlot = accPlot.destroy();
        if (jerkPlot) jerkPlot = jerkPlot.destroy();
        if (aioPlot) aioPlot = aioPlot.destroy();
        $graphContainer.find('.graphArea').remove();
        if (segmentData) {
          plottingGraph($graphContainer, segmentData);
          triggerResize = false;
        } else {
          plotEmptyGraph();
          triggerResize = false;
        }
      }

      var timer;
      $graphContainer.resize(function (e) {
        var ele = $(e.target);
        if (ele[0].id === "graphContainer") {
          if (ele.width() < 777 && settings.showGraphs.length > 1 && settings.graphModeVal === 0 && settings.graphMode === 0) {
            settings.graphMode = 1;
            resetPlots();
          } else if (ele.width() > 777 && settings.showGraphs.length > 1 && settings.graphModeVal === 0 && settings.graphMode === 1) {
            settings.graphMode = 0;
            resetPlots();
          } else if (triggerResize) {
            triggerResize = false;
            if (segmentData) {
              plottingGraph($graphContainer, segmentData);
            } else {
              plotEmptyGraph();
            }
          }
        } else if (ele.hasClass('graphArea')) {
          ele.height(ele.width());
        }

        // this is done to support auto resizing in test-runner engine COSMATTMP
        if (settings.autoResizer && !timer) {
          timer = setTimeout(function () {
            settings.autoResizer();
            timer = undefined;
          }, 500);
        }
      });
      $graphContainer.trigger("resize");
    }

    var plottingGraph = function ($graphContainer, segmentData) {
      var posMax = getHighestPoint(segmentData, "position_final", posYMax);
      var velMax = getHighestPoint(segmentData, "velocity_final", velYMax);
      var accMax = getHighestPoint(segmentData, "acceleration_final", accYMax);
      var timeMax = getHighestPoint(segmentData, "time_final", xmin);
      var jerkMax = getHighestPoint(segmentData, "jerk", jerkYMax);
      var triggerResize = true;

      var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Position"], 'SI', settings.graphUnits["Position"]);
      if (conversionFactor && conversionFactor != 1) posMax *= conversionFactor;

      conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Velocity"], 'SI', settings.graphUnits["Velocity"]);
      if (conversionFactor && conversionFactor != 1) velMax *= conversionFactor;

      conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Acceleration"], 'SI', settings.graphUnits["Acceleration"]);
      if (conversionFactor && conversionFactor != 1) accMax *= conversionFactor;

      conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Jerk"], 'SI', settings.graphUnits["Jerk"]);
      if (conversionFactor && conversionFactor != 1) jerkMax *= conversionFactor;

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
      // $graphContainer.find('.graphArea').addClass("col-xs-" + 12 / $graphContainer.children().length + " col-" + 12 / $graphContainer.children().length);
      var $graphArea = $graphContainer.find('.graphArea');
      for (var i = 0; i < $graphArea.length; i++) {
        if (i === 0 || i === $graphArea.length - 1) {
          $($graphArea[i]).css('width', "calc(" + 100 / $graphContainer.children().length + "% - 20px)");
        } else {
          $($graphArea[i]).css('width', "calc(" + 100 / $graphContainer.children().length + "% - 30px)");
        }
      }
      $graphArea.css("height", $graphArea.eq(0).width());

      if (settings.graphMode === 1 && settings.graphModeVal === 0) {
        $graphArea.css("max-height", "300px");
      } else if (settings.graphMode === 0 && settings.graphModeVal === 0) {
        $graphArea.css("max-height", "400px");
      }

      var $posGraph = $graphContainer.find("#posGraph");
      var $velGraph = $graphContainer.find("#velGraph");
      var $accGraph = $graphContainer.find("#accGraph");
      var $jerkGraph = $graphContainer.find("#jerkGraph");
      var $aioGraph = $graphContainer.find("#aioGraph");

      var dataSetKeys = Object.keys(dataSet);
      var pointsDataSetKeys = Object.keys(pointsDataSet);
      for (var i = 0; i < dataSetKeys.length; i++) {
        delete dataSet[dataSetKeys[i]].yaxis;
      }
      for (var i = 0; i < pointsDataSetKeys.length; i++) {
        delete pointsDataSet[pointsDataSetKeys[i]].yaxis;
      }

      if ($posGraph.length > 0) {
        var posPlotOptions = $.extend(true, {
          yaxis: {
            min: -1 * posMax,
            max: posMax,
            position: "left",
            axisLabel: "Position (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Position"], settings.graphUnits["Position"]).symbol + ")",
            tickFormatter: tickFormatter
          },
          xaxis: {
            min: 0,
            max: timeMax,
            tickFormatter: tickFormatter
          }
        }, chartOptions);
        // console.log(posPlotOptions);
        posPlot = $.plot($posGraph, [dataSet.pos, pointsDataSet.pos], posPlotOptions);
        addDragDropFunctionalityPostion(posPlot);
      }
      if ($velGraph.length > 0) {

        var velPlotOptions = $.extend(true, {
          yaxis: {
            min: -1 * velMax,
            max: velMax,
            position: "left",
            axisLabel: "Velocity (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Velocity"], settings.graphUnits["Velocity"]).symbol + ")",
            tickFormatter: tickFormatter
          },
          xaxis: {
            min: 0,
            max: timeMax,
            tickFormatter: tickFormatter
          }
        }, chartOptions);
        // console.log(velPlotOptions);
        velPlot = $.plot($velGraph, [dataSet.vel, pointsDataSet.vel, pointsDataSet.dwell, pointsDataSet.movetime], velPlotOptions);
        addDragDropFunctionality(velPlot);
      }
      if ($accGraph.length > 0) {

        var accPlotOptions = $.extend(true, {
          yaxis: {
            min: -1 * accMax,
            max: accMax,
            position: "left",
            axisLabel: "Acceleration (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Acceleration"], settings.graphUnits["Acceleration"]).symbol + ")",
            tickFormatter: tickFormatter
          },
          xaxis: {
            min: 0,
            max: timeMax,
            tickFormatter: tickFormatter
          }
        }, chartOptions);
        // console.log(accPlotOptions);
        accPlot = $.plot($accGraph, [dataSet.acc], accPlotOptions);
      }

      if ($jerkGraph.length > 0) {
        var jerkPlotOptions = $.extend(true, {
          yaxis: {
            min: -1 * jerkMax,
            max: jerkMax,
            position: "left",
            axisLabel: "Jerk (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Jerk"], settings.graphUnits["Jerk"]).symbol + ")",
            tickFormatter: tickFormatter
          },
          xaxis: {
            min: 0,
            max: timeMax,
            tickFormatter: tickFormatter
          }
        }, chartOptions);
        // console.log(jerkPlotOptions);
        jerkPlot = $.plot($jerkGraph, [dataSet.jerk], jerkPlotOptions);
        addDragDropFunctionalityPostion(posPlot);
      }

      if ($aioGraph.length > 0) {
        var yaxesOptions = {
          'pos': {
            position: "left",
            axisLabel: "Position (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Position"], settings.graphUnits["Position"]).symbol + ")",
            // axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            min: -1 * posMax,
            max: posMax
          },
          'vel': {
            position: "left",
            axisLabel: "Velocity (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Velocity"], settings.graphUnits["Velocity"]).symbol + ")",
            // axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            min: -1 * velMax,
            max: velMax
          },
          'acc': {
            position: "left",
            axisLabel: "Acceleration (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Acceleration"], settings.graphUnits["Acceleration"]).symbol + ")",
            // axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            min: -1 * accMax,
            max: accMax
          },
          'jerk': {
            position: "left",
            axisLabel: "Jerk (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Jerk"], settings.graphUnits["Jerk"]).symbol + ")",
            // axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            min: -1 * jerkMax,
            max: jerkMax
          }
        }

        var aioOptions = $.extend(true, {
          yaxes: (function () {
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
            max: timeMax,
            tickFormatter: tickFormatter
          }
        }, chartOptions);
        aioOptions.legend = {
          "show": true,
          "backgroundOpacity": 0
        };
        // console.log(aioOptions);
        aioPlot = $.plot($aioGraph, getAioGraphPoints(), aioOptions);
        addDragDropFunctionalityAIO(aioPlot);
      }

      if (settings.onGraphPaint) {
        settings.onGraphPaint();
      }
    };

    var plotEmptyGraph = function () {
      // var posMax = getHighestPoint(segmentData, "position_final", posYMax);
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
      // $graphContainer.find('.graphArea').addClass("col-xs-" + 12 / $graphContainer.children().length + " col-" + 12 / $graphContainer.children().length);


      var $graphArea = $graphContainer.find('.graphArea');
      for (var i = 0; i < $graphArea.length; i++) {
        if (i === 0 || i === $graphArea.length - 1) {
          $($graphArea[i]).css('width', "calc(" + 100 / $graphContainer.children().length + "% - 20px)");
        } else {
          $($graphArea[i]).css('width', "calc(" + 100 / $graphContainer.children().length + "% - 30px)");
        }
      }
      $graphArea.css("height", $graphArea.eq(0).width());

      if (settings.graphMode === 1 && settings.graphModeVal === 0) {
        $graphArea.css("max-height", "300px");
      } else if (settings.graphMode === 0 && settings.graphModeVal === 0) {
        $graphArea.css("max-height", "400px");
      }

      var dataSetKeys = Object.keys(dataSet);
      var pointsDataSetKeys = Object.keys(pointsDataSet);
      for (var i = 0; i < dataSetKeys.length; i++) {
        delete dataSet[dataSetKeys[i]].yaxis;
      }
      for (var i = 0; i < pointsDataSetKeys.length; i++) {
        delete pointsDataSet[pointsDataSetKeys[i]].yaxis;
      }

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
            axisLabel: "Position (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Position"], settings.graphUnits["Position"]).symbol + ")"
          },
          xaxis: {
            min: 0,
            tickFormatter: tickFormatter
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
            axisLabel: "Velocity (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Velocity"], settings.graphUnits["Velocity"]).symbol + ")"
          },
          xaxis: {
            min: 0,
            tickFormatter: tickFormatter
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
            axisLabel: "Acceleration (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Acceleration"], settings.graphUnits["Acceleration"]).symbol + ")"
          },
          xaxis: {
            min: 0,
            tickFormatter: tickFormatter
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
            axisLabel: "Jerk (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Jerk"], settings.graphUnits["Jerk"]).symbol + ")"
          },
          xaxis: {
            min: 0,
            tickFormatter: tickFormatter
            // max: timeMax
          }
        }, chartOptions));
        // addDragDropFunctionalityPostion(posPlot);
      }

      if ($aioGraph.length > 0) {
        var yaxesOptions = {
          'pos': {
            position: "left",
            axisLabel: "Position (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Position"], settings.graphUnits["Position"]).symbol + ")",
            // axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            // min: -1 * posMax,
            // max: posMax
          },
          'vel': {
            position: "left",
            axisLabel: "Velocity (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Velocity"], settings.graphUnits["Velocity"]).symbol + ")",
            // axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            // min: -1 * velMax,
            // max: velMax
          },
          'acc': {
            position: "left",
            axisLabel: "Acceleration (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Acceleration"], settings.graphUnits["Acceleration"]).symbol + ")",
            // axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            // min: -1 * accMax,
            // max: accMax
          },
          'jerk': {
            position: "left",
            axisLabel: "Jerk (" + COSMATT.UNITCONVERTER.getUnitDetails(COSMATT.MotionProfile.configuration.UnitData["Jerk"], settings.graphUnits["Jerk"]).symbol + ")",
            // axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            // min: -1 * jerkMax,
            // max: jerkMax
          }
        }

        var aioOptions = $.extend(true, {
          yaxes: (function () {
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
            tickFormatter: tickFormatter
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

    var updateGraphData = function (element, timeSlice) {
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

    var updatePointsGraphData = function (profileElements) {
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
          pointsDataSet.vel.data.push(JSON.parse(JSON.stringify(velPonit)));
        }
        if (settings.showGraphDragHandles.indexOf("moveTime") > -1) {
          pointsDataSet.movetime.data.push(moveTimePoint);
        }
        if (settings.showGraphDragHandles.indexOf("dwellTime") > -1) {
          pointsDataSet.dwell.data.push(dwellTimePoint);
        }
      }
    };

    var updateCalculatedFields = function (profileElements) {
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

        // // console.log(a1, a2, a3, a4);

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

    $container.find('#profileButtons').on('click', '.profileButton', function (e) {
      e.preventDefault();
      var btnId = $(this).attr('id');
      if (btnId != undefined && settings.activeProfileIndex != parseInt(btnId.slice(3))) {
        settings.activeProfileIndex = parseInt(btnId.slice(3));
        settings.smoothness = $inputControls.find("#smoothnessInputContainer").find(".smoothnessDropDown").find('.smoothnessDDMenu')[0].selectedIndex;
        $container.find('#profileButtons').find(".profileButton.btn-primary").removeClass("btn-primary").addClass("btn-default");
        $(this).addClass("btn-primary").removeClass("btn-default");
        settings.velocityJerk = undefined;
        readUIValues();
        calculateAndPaint();
      }
    });

    var resetCalculatedValues = function () {
      calculatedValues.peakVel = '';
      calculatedValues.peakAcc = '';
      calculatedValues.rmsVel = '';
      calculatedValues.rmsAcc = '';
      updateCalculatedControls();
    }

    var readUIValues = function () {
      if (SIValues.movedistance == undefined) {
        SIValues.movedistance = uiValues.movedistance = isNaN(parseFloat(settings.moveDistance)) ? settings.moveDistance : parseFloat(settings.moveDistance);
      }

      if (SIValues.movedtime == undefined) {
        SIValues.movedtime = uiValues.movedtime = isNaN(parseFloat(settings.moveTime)) ? settings.moveTime : parseFloat(settings.moveTime);
      }

      if (SIValues.dweltime == undefined) {
        SIValues.dweltime = uiValues.dweltime = isNaN(parseFloat(settings.dwellTime)) ? settings.dwellTime : parseFloat(settings.dwellTime);
      }

      if (settings.velocityJerk === undefined) {
        updateIndexType();
        SIValues.velocityJerk = uiValues.velocityJerk = isNaN(parseFloat(settings.indexType)) ? settings.indexType : parseFloat(settings.indexType);
      } else {
        SIValues.velocityJerk = uiValues.velocityJerk = isNaN(parseFloat(settings.velocityJerk)) ? settings.velocityJerk : parseFloat(settings.velocityJerk);
      }

      if (SIValues.smoothness == undefined) {
        SIValues.smoothness = uiValues.smoothness = isNaN(parseFloat(settings.smoothness)) ? settings.smoothness : parseFloat(settings.smoothness);
      }
    };

    var validateUIValues = function () {
      var bret = true;
      // var errorInputs = [];
      $inputControls.find(".input-entries .form-group").removeClass("has-error");
      if (!(!isNaN(SIValues.movedistance) && SIValues.movedistance > 0)) {
        $inputControls.find("#moveDistanceInputContainer").addClass("has-error");
        bret = false;
      }
      if (!(!isNaN(SIValues.movedtime) && SIValues.movedtime > 0)) {
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

    var readinitialValues = function () {
      initialValues.time = 0;
      initialValues.position = 0;
      initialValues.velocity = 0;
    };

    var saveVelMaxMinPoints = function (profileElements) {
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

      var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Velocity"], 'SI', settings.graphUnits["Velocity"]);
      if (conversionFactor && conversionFactor != 1) minVel = parseFloat(minVel) * conversionFactor;
      maxVel = 2 * minVel;
      if (profileElements.dwell) {
        dwellStart = profileElements.dwell[0].time_initial;
      }
    };

    var showTooltip = function (x, y, contents) {
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

    var addDragDropFunctionality = function (plot) {
      var hoverItem = null;
      var dragItem = null;

      var prevItemIndex = null;

      $container.find("#velGraph").unbind("plothover").bind("plothover", function (event, pos, item) {
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
              // TODOuiValues.velocityJerk = parseFloat(Math.ceil(Vff));
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

      $container.find("#velGraph").unbind("mousedown").bind("mousedown", function () {
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

      $container.find("#velGraph").unbind("mouseup").bind("mouseup", function () {
        if (dragItem && settings.onGraphDrag) {
          settings.onGraphDrag();
        }
        if (dragItem && settings.assessmentMode) {
          responseNotifier();
        }
        dragItem = null;
      });

      $container.find("#velGraph").unbind("mouseleave").bind("mouseleave", function () {
        $container.find("#velGraph").mouseup();
      });
    };

    var addDragDropFunctionalityPostion = function (plot) {
      var hoverItem = null;
      var dragItem = null;

      var prevItemIndex = null;

      $container.find("#posGraph").unbind("plothover").bind("plothover", function (event, pos, item) {
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
              // get moveDis value in SI
              var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Position"], settings.graphUnits["Position"], 'SI');
              if (conversionFactor && conversionFactor != 1) moveDis = parseFloat(moveDis) * conversionFactor;
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

      $container.find("#posGraph").unbind("mousedown").bind("mousedown", function () {
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

      $container.find("#posGraph").unbind("mouseup").bind("mouseup", function () {
        if (dragItem && settings.onGraphDrag) {
          settings.onGraphDrag();
        }
        if (dragItem && settings.assessmentMode) {
          responseNotifier();
        }
        dragItem = null;
      });

      $container.find("#posGraph").unbind("mouseleave").bind("mouseleave", function () {
        $container.find("#posGraph").mouseup();
      });
    };

    var addDragDropFunctionalityAIO = function (plot) {
      var hoverItem = null;
      var dragItem = null;
      var prevItemIndex = null;

      $container.find("#aioGraph").unbind("plothover").bind("plothover", function (event, pos, item) {
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
              // get moveDis value in SI
              var conversionFactor = COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData["Position"], settings.graphUnits["Position"], 'SI');
              if (conversionFactor && conversionFactor != 1) moveDis = parseFloat(moveDis) * conversionFactor;
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

      $container.find("#aioGraph").unbind("mousedown").bind("mousedown", function () {
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

      $container.find("#aioGraph").unbind("mouseup").bind("mouseup", function () {
        if (dragItem && settings.onGraphDrag) {
          settings.onGraphDrag();
        }
        if (dragItem && settings.assessmentMode) {
          responseNotifier();
        }
        dragItem = null;
      });

      $container.find("#aioGraph").unbind("mouseleave").bind("mouseleave", function () {
        $container.find("#aioGraph").mouseup();
      });
    };

    var updateYaxisLabelCSS = function () {
      /* This is fix for https://compro.atlassian.net/browse/COSMATT-258
      This is a chrome specific issue which occurs when rotating text by 90 degrees.
      The text will become blurry/clear depending on whether the width is odd/even.
      What appears to be happening here is the layer is being composited to a half-pixel location
      which is then being rendered to create the appearance of being "between" two pixels.
      So width of yaxis label is converted to nearest next even number.
      */
      // console.log("updateYaxisLabelCSS....")
      if (posPlot) {
        var $ylabel = $container.find("#posGraph .yaxisLabel");
        var width = Math.ceil($ylabel.width() > $ylabel.height() ? $ylabel.width() : $ylabel.height());
        // if (width % 2 != 0) width++;
        // $ylabel.width(width);
        if (width % 2 != 0) {
          width++;
          $ylabel.width(width);
        }
        $ylabel.css('top', '-3%');
      }
      if (velPlot) {
        var $ylabel = $container.find("#velGraph .yaxisLabel");
        var width = Math.ceil($ylabel.width() > $ylabel.height() ? $ylabel.width() : $ylabel.height());
        // if (width % 2 != 0) width++;
        // $ylabel.width(width);
        if (width % 2 != 0) {
          width++;
          $ylabel.width(width);
        }
        $ylabel.css('top', '-3%');
      }
      if (accPlot) {
        var $ylabel = $container.find("#accGraph .yaxisLabel");
        var width = Math.ceil($ylabel.width() > $ylabel.height() ? $ylabel.width() : $ylabel.height());
        if (width % 2 != 0) {
          width++;
          $ylabel.width(width);
        }
        $ylabel.css('top', '-3%');
      }
      if (jerkPlot) {
        var $ylabel = $container.find("#jerkGraph .yaxisLabel");
        var width = Math.ceil($ylabel.width() > $ylabel.height() ? $ylabel.width() : $ylabel.height());
        // if (width % 2 != 0) width++;
        // $ylabel.width(width);
        if (width % 2 != 0) {
          width++;
          $ylabel.width(width);
        }
        $ylabel.css('top', '-3%');
      }
      if (aioPlot) {
        var $ylabels = $container.find("#aioGraph .axisLabels");
        for (var i = 0; i < $ylabels.length; i++) {
          var $ylabel = $($ylabels[i]);
          if (!$ylabel.hasClass('xaxisLabel')) {
            var width = Math.ceil($ylabel.width() > $ylabel.height() ? $ylabel.width() : $ylabel.height());
            // if (width % 2 != 0) width++;
            // $ylabel.width(width);
            if (width % 2 != 0) {
              width++;
              $ylabel.width(width);
            }
            $ylabel.css('top', '-3%');
          }
        }
      }
    };

    var calculateData = function (dataonly) {
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

      // update graph points to selected unit
      // console.log(outputData)
      // console.log(dataSet)
      // console.log(pointsDataSet)

      convertDataToGraphDisplayUnits(dataSet);
      convertDataToGraphDisplayUnits(pointsDataSet);

      saveVelMaxMinPoints(outputData.segmentData);


      if (dataonly) {
        updateGraph(outputData.segmentData);
      } else {
        plotGraph(outputData.segmentData);
      }
    };

    var convertDataToGraphDisplayUnits = function (obj) {
      var toUnits = settings.graphUnits;
      var datakeys = Object.keys(obj);
      for (var i = 0; i < datakeys.length; i++) {
        var conversionFactor = COSMATT.MotionProfile.configuration.UnitData[obj[datakeys[i]].graphtype] ? COSMATT.UNITCONVERTER.getConversionRatioById(COSMATT.MotionProfile.configuration.UnitData[obj[datakeys[i]].graphtype], 'SI', toUnits[obj[datakeys[i]].graphtype]) : undefined;
        if (conversionFactor && conversionFactor != 1) {
          for (var j = 0; j < obj[datakeys[i]].data.length; j++) {
            obj[datakeys[i]].data[j][1] *= conversionFactor;
          }
        }
      }
    };

    var updateIndexType = function () {
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

    var inputControlsCallbackFn = function () {
      calculateAndPaint();
    };

    var responseNotifier = function () {
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

    var generateInputControls = function () {
      var $inputControls = $widgetContainer.find("#inputControls");
      $inputControls.append('<form class="form-horizontal"> <div class="input-entries inputs"> <div class="form-group input-container" id="moveDistanceInputContainer"> <label for="moveDistance" class="control-label">Move Distance</label> <div class="combo-container comboMoveDistance"></div></div><div class="form-group input-container" id="moveTimeInputContainer"> <label for="moveTime" class="control-label">Move Time</label> <div class="combo-container comboMoveTime"></div></div><div class="form-group input-container" id="dwellTimeInputContainer"> <label for="dwellTime" class="control-label">Dwell Time</label> <div class="combo-container comboDwellTime"></div></div><div class="form-group input-container" id="indexTypeInputContainer"> <label for="indexType" class="control-label">Velocity Factor</label> <div class="combo-container comboIndexType"></div></div><div class="form-group input-container" id="smoothnessInputContainer"> <label for="smoothness" class="control-label">Smoothness</label> <div class="combo-container smoothnessDropDown"></div></div></div><div class="output-entries inputs"> <div class="form-group input-container" id="peakVelocityInputContainer"> <label for="peakVelocity" class="control-label">Peak Velocity</label> <div class="combo-container comboPeakVelocity"></div></div><div class="form-group input-container" id="rmsVelocityInputContainer"> <label for="rmsVelocity" class="control-label">RMS Velocity</label> <div class="combo-container comboRmsVelocity"></div></div><div class="form-group input-container" id="peakAccInputContainer"> <label for="peakAcc" class="control-label">Peak Acceleration</label> <div class="combo-container comboPeakAcc"></div></div><div class="form-group input-container" id="rmsAccInputContainer"> <label for="rmsAcc" class="control-label">RMS Acceleration</label> <div class="combo-container comboRmsAcc"></div></div></div></form>');

      $inputControls.find("#moveDistanceInputContainer").find(".comboMoveDistance").unitsComboBox({
        "unitType": "ANGULARDISTANCE",
        "unit": settings.moveDistanceUnit,
        "roundOfNumber": "2",
        "value": settings.moveDistance,
        "comboBoxWidthRatio": {
          "textBox": "30%",
          "comboBox": "32%"
        },
        numberFormatterOptions: settings.numberFormatterOptions,
        callBackFn: function () {
          if (this.type != undefined) {
            if (this.type == "dropdown") {
              settings.moveDistanceUnit = this.unit;
            } else if (this.type == "textbox") {
              uiValues.movedistance = isNaN(parseFloat(this.value)) ? '' : parseFloat(this.value);
              SIValues.movedistance = isNaN(parseFloat(this.value)) || isNaN(this.SIValue) ? '' : parseFloat(this.SIValue);
              inputControlsCallbackFn();
            }
            responseNotifier();
          }
        }
      });

      var $combobox = $inputControls.find("#moveDistanceInputContainer").find(".comboMoveDistance").data('unitsComboBox');
      $combobox.setDropBoxItem(settings.moveDistanceUnitDefaultSelected);

      $inputControls.find("#moveTimeInputContainer").find(".comboMoveTime").unitsComboBox({
        "unitType": "TIME",
        "unit": settings.moveTimeUnit,
        "roundOfNumber": "2",
        "value": settings.moveTime,
        "comboBoxWidthRatio": {
          "textBox": "30%",
          "comboBox": "32%"
        },
        numberFormatterOptions: settings.numberFormatterOptions,
        callBackFn: function () {
          if (this.type != undefined) {
            if (this.type == "dropdown") {
              settings.moveTimeUnit = this.unit;
            } else if (this.type == "textbox") {
              uiValues.movedtime = isNaN(parseFloat(this.value)) ? '' : parseFloat(this.value);
              SIValues.movedtime = isNaN(parseFloat(this.value)) || isNaN(this.SIValue) ? '' : parseFloat(this.SIValue);
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
          "textBox": "30%",
          "comboBox": "32%"
        },
        numberFormatterOptions: settings.numberFormatterOptions,
        callBackFn: function () {
          if (this.type != undefined) {
            if (this.type == "dropdown") {
              settings.dwellTimeUnit = this.unit;
            } else if (this.type == "textbox") {
              uiValues.dweltime = isNaN(parseFloat(this.value)) ? '' : parseFloat(this.value);
              SIValues.dweltime = isNaN(parseFloat(this.value)) || isNaN(this.SIValue) ? '' : parseFloat(this.SIValue);
              inputControlsCallbackFn();
            }
            responseNotifier();
          }
        }
      });

      // updateIndexType();

      $inputControls.find("#indexTypeInputContainer").find(".comboIndexType").unitsComboBox({
        "unitType": "PERCENTAGE",
        "unit": settings.velocityFactorUnit,
        "roundOfNumber": "2",
        "value": settings.indexType,
        "comboBoxWidthRatio": {
          "textBox": "30%",
          "comboBox": "32%"
        },
        numberFormatterOptions: settings.numberFormatterOptions,
        callBackFn: function () {
          if (this.type != undefined) {
            if (this.type == "textbox") {
              uiValues.velocityJerk = isNaN(parseFloat(this.value)) ? '' : parseFloat(this.value);
              SIValues.velocityJerk = isNaN(parseFloat(this.value)) || isNaN(this.SIValue) ? 0 : parseFloat(this.SIValue);
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
      $smoothnessDD.find('select').on('change', function (e) {
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
          "textBox": "30%",
          "comboBox": "32%"
        },
        numberFormatterOptions: settings.numberFormatterOptions,
        callBackFn: function () {
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
          "textBox": "30%",
          "comboBox": "32%"
        },
        numberFormatterOptions: settings.numberFormatterOptions,
        callBackFn: function () {
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
          "textBox": "30%",
          "comboBox": "32%"
        },
        numberFormatterOptions: settings.numberFormatterOptions,
        callBackFn: function () {
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
          "textBox": "30%",
          "comboBox": "32%"
        },
        numberFormatterOptions: settings.numberFormatterOptions,
        callBackFn: function () {
          if (this.type != undefined && this.type == "dropdown") {
            settings.rmsAccelarationUnit = parseInt(this.unit.split('_')[1]) - 1;
          }
        }
      });

      $inputControls.resize(function (e) {
        var ele = $(e.target);
        if (ele.width() < 839) {
          $widgetContainer.addClass("lowerResolution");
          $inputControls.find('.input-entries').css("width", "55%");
          $inputControls.find('.output-entries').css("width", "45%");

          var $comboBox = $inputControls.find('.input-container .combo-container .cosmatt-unitComboBox');
          $comboBox.find('.unitTextBox').css("max-width", "100px");
          $comboBox.find('.unitComboBox').css("max-width", "100px");

        } else if (ele.width() >= 839) {
          $widgetContainer.removeClass("lowerResolution");
          $inputControls.find('.input-entries').css("width", "50%");
          $inputControls.find('.output-entries').css("width", "50%");

          var $comboBox = $inputControls.find('.input-container .combo-container .cosmatt-unitComboBox');
          $comboBox.find('.unitTextBox').css("max-width", "100px");
          $comboBox.find('.unitComboBox').css("max-width", "100px");
        }


        if (ele.width() < 1239 && ele.width() > 839) {
          $widgetContainer.addClass("resizeon1240");

        } else if (ele.width() >= 1239) {
          $widgetContainer.removeClass("resizeon1240");
        }
      });

      if ($inputControls.width() < 1239) {
        $inputControls.trigger("resize");
      }

    };

    var updateCalculatedControls = function () {
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

    var uiHandler = function ($domContainer) {
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

    var handleProfilesVisibility = function (showProfiles, $profileButtons) {
      $profileButtons.find("button").hide();
      if (typeof (showProfiles) === "boolean") { //hide all profile buttons
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

    var handleGraphDragHandles = function (showGraphDragHandles) {
      if (typeof (showGraphDragHandles) === "boolean") {
        if (showGraphDragHandles === true) {
          settings.showGraphDragHandles = [COSMATT.MotionProfile.configuration.GraphHandles.position, COSMATT.MotionProfile.configuration.GraphHandles.peakVelocity, COSMATT.MotionProfile.configuration.GraphHandles.moveTime, COSMATT.MotionProfile.configuration.GraphHandles.dwellTime];
        } else {
          settings.showGraphDragHandles = [];
        }
      }
    };

    var makeInputsReadOnly = function (readOnlyInputsArr) {
      if (typeof (readOnlyInputsArr) === "boolean") {
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

    var handleInputsVisibility = function (hideInputsArr) {
      if (typeof (hideInputsArr) === "boolean") {
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

    var addEditConfigurations = function () {
      var $body = $('body');
      var $editConfigButton = '<div id="editConfigBtnContainer"><button class="btn btn-default editConfigBtn pull-right btn-lg" type="button" href="configWindow.html" data-target="#theModal" data-toggle="modal">Edit Configurations</div>';
      $body.append($editConfigButton);
    };

    var addCheckAnsButton = function () {
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

    var calculateAndPaint = function (dataonly, settimeout) {
      if (validateUIValues()) {
        if (settimeout) {
          setTimeout(function (dataonly) {
            calculateData();
          }, 0);
        } else {
          calculateData(dataonly);
        }
      } else {
        resetProfileData();
        resetCalculatedValues();
        setTimeout(function (dataonly) {
          plotEmptyGraph();
          attachResizeToPlots(false);
        }, 0);
      }
      updateYaxisLabelCSS();
      $container.on('resize', function () {
        updateYaxisLabelCSS();
      });
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
          settings.moveDistanceUnit = params.movedistance.unit;
          $combobox.setDropBoxItem(settings.moveDistanceUnit);
        }
      }
      if (params.movedtime) {
        // uiValues.movedtime = parseFloat(params.movedtime.value);
        SIValues.movedtime = isNaN(parseFloat(params.movedtime.value)) ? "" : parseFloat(params.movedtime.value);
        var $combobox = $inputControls.find("#moveTimeInputContainer").find(".comboMoveTime").data('unitsComboBox');
        $combobox.setTextBoxValue(SIValues.movedtime);
        if (params.movedtime.unit) {
          settings.moveTimeUnit = params.movedtime.unit;
          $combobox.setDropBoxItem(settings.moveTimeUnit);
        }
      }
      if (params.dweltime) {
        // uiValues.dweltime = parseFloat(params.dweltime.value);
        SIValues.dweltime = isNaN(parseFloat(params.dweltime.value)) ? "" : parseFloat(params.dweltime.value);
        var $combobox = $inputControls.find("#dwellTimeInputContainer").find(".comboDwellTime").data('unitsComboBox');
        $combobox.setTextBoxValue(SIValues.dweltime);
        if (params.dweltime.unit) {
          settings.dwellTimeUnit = params.dweltime.unit;
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
            "comboBox": "false"
          }
        });

        cssClass = params.movedistance.status ? 'fa-check correct' : 'fa-times incorrect';
        var convertedValueInRev = COSMATT.UNITCONVERTER.getUnitConvertedValue("ANGULARDISTANCE", params.movedistance.correctAnswer, COSMATT.UNITCONVERTER.getSIUnit("ANGULARDISTANCE").id, "revolution");
        var correctAns = params.movedistance.status ? '' : '(' + Math.round(convertedValueInRev) + ' rev' + ')';
        $moveDistanceInput.find('.cosmatt-unitComboBox').append('<span class="response-status"><span class="fa ' + cssClass + '"></span><span class="correct-answer">' + correctAns + '</span></span>');
      }
      if (params.movedtime) {
        cssClass = params.movedtime.status ? 'correct' : 'incorrect';
        var $moveTimeInput = $inputControls.find("#moveTimeInputContainer").find(".comboMoveTime");
        $moveTimeInput.addClass(cssClass);
        $moveTimeInput.data('unitsComboBox').update({
          "enable": {
            "textbox": "false",
            "comboBox": "false"
          }
        });

        cssClass = params.movedtime.status ? 'fa-check correct' : 'fa-times incorrect';
        var correctAns = params.movedtime.status ? '' : '(' + params.movedtime.correctAnswer + ' sec' + ')';
        $moveTimeInput.find('.cosmatt-unitComboBox').append('<span class="response-status"><span class="fa ' + cssClass + '"></span><span class="correct-answer">' + correctAns + '</span></span>');
      }
      if (params.dweltime) {
        cssClass = params.dweltime.status ? 'correct' : 'incorrect';
        var $dwellTimeInput = $inputControls.find("#dwellTimeInputContainer").find(".comboDwellTime");
        $dwellTimeInput.addClass(cssClass);
        $dwellTimeInput.data('unitsComboBox').update({
          "enable": {
            "textbox": "false",
            "comboBox": "false"
          }
        });

        cssClass = params.dweltime.status ? 'fa-check correct' : 'fa-times incorrect';
        var correctAns = params.dweltime.status ? '' : '(' + params.dweltime.correctAnswer + ' sec' + ')';
        $dwellTimeInput.find('.cosmatt-unitComboBox').append('<span class="response-status"><span class="fa ' + cssClass + '"></span><span class="correct-answer">' + correctAns + '</span></span>');
      }
      if (params.velocityJerk) {
        cssClass = params.velocityJerk.status ? 'correct' : 'incorrect';
        var $velocityJerkInput = $inputControls.find("#indexTypeInputContainer").find(".comboIndexType");
        $velocityJerkInput.addClass(cssClass);
        $velocityJerkInput.data('unitsComboBox').update({
          "enable": {
            "textbox": "false",
            "comboBox": "false"
          }
        });

        cssClass = params.velocityJerk.status ? 'fa-check correct' : 'fa-times incorrect';
        var correctAns = params.velocityJerk.status ? '' : '(' + params.velocityJerk.correctAnswer + ' %' + ')';
        $velocityJerkInput.find('.cosmatt-unitComboBox').append('<span class="response-status"><span class="fa ' + cssClass + '"></span><span class="correct-answer">' + correctAns + '</span></span>');
      }

      $widgetContainer.find(".response-status").unbind("mouseenter").bind("mouseenter", function (e) {
        var element = $(this)[0];
        var targetOffset = $widgetContainer.offset();
        if (element.offsetWidth < element.scrollWidth) {
          showTooltip(e.pageX - targetOffset.left, e.pageY - targetOffset.top, element.innerText);
        }
      });

      $widgetContainer.find(".response-status").unbind("mouseleave").bind("mouseleave", function (e) {
        $widgetContainer.find('#tooltip').remove();
      });


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
      updateYaxisLabelCSS();
    }

    function getProfileValues() {
      return {
        activeProfileIndex: settings.activeProfileIndex,
        moveDistance: SIValues.movedistance,
        moveTime: SIValues.movedtime,
        dwellTime: SIValues.dweltime,
        smoothness: SIValues.smoothness
      }
    }

    return {
      ref: this,
      updateInputs: updateInputs,
      markAnswers: markAnswers,
      getProfileValues: getProfileValues
    };
  };

}(jQuery));