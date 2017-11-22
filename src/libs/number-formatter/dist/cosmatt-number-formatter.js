var Cosmatt =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_SIGNIFICANT_DIGITS = 3;
var DEFAULT_MAX_POSITIVE_EXPONENT = 6;
var DEFAULT_MIN_NEGATIVE_EXPONENT = -4;
var NumberFormatter = /** @class */ (function () {
    function NumberFormatter(settings) {
        this.superscripts = {
            "0": "⁰",
            "1": "¹",
            "2": "²",
            "3": "³",
            "4": "⁴",
            "5": "⁵",
            "6": "⁶",
            "7": "⁷",
            "8": "⁸",
            "9": "⁹",
            "-": "⁻"
        };
        this.options = {};
        if (!settings) {
            settings = {};
        }
        this.options["significantDigits"] = settings.significantDigits || DEFAULT_SIGNIFICANT_DIGITS;
        this.options["maxPositiveExponent"] = settings.maxPositiveExponent || DEFAULT_MAX_POSITIVE_EXPONENT;
        this.options["minNegativeExponent"] = settings.minNegativeExponent || DEFAULT_MIN_NEGATIVE_EXPONENT;
    }
    NumberFormatter.prototype.format = function (originalInput, isEditable) {
        if (isEditable === void 0) { isEditable = false; }
        // convert to number as input can be a number string
        var input = parseFloat(originalInput);
        if (Number.isNaN(input) || input === 0) {
            return originalInput;
        }
        // Rule #1: if absolute value of number is greater than 10^p
        if (Math.abs(input) >= Math.pow(10, this.options.maxPositiveExponent)) {
            var exponent_1 = input.toExponential(this.options.significantDigits - 1);
            return this.toSuperscript(exponent_1);
        }
        // Rule #3: if absolute value of number is  between  10^p and 10^s and value is displayed in editable field, then on blur
        if (isEditable && Math.abs(input) < Math.pow(10, this.options.maxPositiveExponent) && Math.abs(input) >= Math.pow(10, this.options.significantDigits)) {
            return Math.round(input).toString();
        }
        // Rule #3: if absolute value of number is  between  10^p and 10^n
        if ((Math.abs(input) > Math.pow(10, this.options.minNegativeExponent))) {
            input = input.toPrecision(this.options.significantDigits);
            return parseFloat(input).toString();
        }
        // Rule #4: if absolute value of number is  less than 10^n
        var exponent = input.toExponential(this.options.significantDigits - 1);
        return this.toSuperscript(exponent);
    };
    NumberFormatter.prototype.toSuperscript = function (exponent) {
        var parts;
        if (exponent.includes("e+")) {
            parts = exponent.split("e+");
        }
        else if (exponent.includes("e-")) {
            parts = exponent.split("e");
        }
        else {
            return exponent;
        }
        var superExponent = "";
        for (var _i = 0, _a = parts[1]; _i < _a.length; _i++) {
            var char = _a[_i];
            superExponent += this.superscripts[char];
        }
        parts[1] = superExponent;
        return parts.join("x10");
    };
    return NumberFormatter;
}());
exports.NumberFormatter = NumberFormatter;


/***/ })
/******/ ]);