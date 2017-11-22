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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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
    function NumberFormatter(options) {
        this.options = options;
        options.significantDigits = options.significantDigits || DEFAULT_SIGNIFICANT_DIGITS;
        options.maxPositiveExponent = options.maxPositiveExponent || DEFAULT_MAX_POSITIVE_EXPONENT;
        options.minNegativeExponent = options.minNegativeExponent || DEFAULT_MIN_NEGATIVE_EXPONENT;
    }
    NumberFormatter.prototype.format = function (input) {
        // convert to number as input can be a number string
        input = parseFloat(input);
        if (Number.isNaN(input)) {
            throw new Error("not a number exception!");
        }
        if (Number.isInteger(input)) {
            // Rule #1: if number is integer and its absolute value is greater than 10^p
            if (Math.abs(input) >= Math.pow(10, this.options.maxPositiveExponent)) {
                return input.toExponential(this.options.significantDigits - 1);
            }
            // Rule #2: if number is integer and its absolute value is less than 10^p
            return input.toString();
        }
        // Rule #3: if number is float and its absolute value greater is than 10^p
        if (Math.abs(input) >= Math.pow(10, this.options.maxPositiveExponent)) {
            return input.toPrecision(this.options.significantDigits);
        }
        // Rule #4: if number is float and its absolute value is between 1 and 10^p
        if (Math.abs(input) > 1) {
            return input.toFixed(this.options.significantDigits);
        }
        // Rule #5: if absolute value of number is  between 10^n and 1
        if (Math.abs(input) < 1 && Math.abs(input) >= Math.pow(10, this.options.minNegativeExponent)) {
            var r = Math.abs(this.options.minNegativeExponent) + this.options.significantDigits - 1;
            return input.toFixed(r);
        }
        //Rule #6: if absolute value of number is  less than 10^n
        return input.toExponential(this.options.significantDigits - 1);
    };
    return NumberFormatter;
}());
exports.NumberFormatter = NumberFormatter;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var NumberFormatter_1 = __webpack_require__(0);
(function ($) {
    $.fn.numberFormatter = function (options) {
        var numberFormatter = new NumberFormatter_1.NumberFormatter(options);
        if (this.is('input') || this.is('textarea')) {
            this.val(numberFormatter.format(this.val()));
        }
        else {
            this.text(numberFormatter.format(this.text()));
        }
        return this;
    };
})(jQuery);


/***/ })
/******/ ]);