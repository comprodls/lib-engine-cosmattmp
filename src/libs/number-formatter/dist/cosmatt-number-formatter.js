var Cosmatt=function(t){function i(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,i),r.l=!0,r.exports}var e={};return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,i){return Object.prototype.hasOwnProperty.call(t,i)},i.p="",i(i.s=0)}([function(t,i,e){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var n=3,r=6,o=-4,s=function(){function t(t){this.superscripts={0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹","-":"⁻"},this.options={},t||(t={}),this.options.significantDigits=t.significantDigits||n,this.options.maxPositiveExponent=t.maxPositiveExponent||r,this.options.minNegativeExponent=t.minNegativeExponent||o}return t.prototype.format=function(t){var i=parseFloat(t);if(Number.isNaN(i))return t;if(Number.isInteger(i)){if(Math.abs(i)>=Math.pow(10,this.options.maxPositiveExponent)){var e=i.toExponential(this.options.significantDigits-1);return this.toSuperscript(e)}return i.toString()}if(Math.abs(i)>=Math.pow(10,this.options.maxPositiveExponent)){var n=i.toPrecision(this.options.significantDigits);return this.toSuperscript(n)}if(Math.abs(i)>1)return this.removeTrailingZeroesAfterDecimal(i.toFixed(this.options.significantDigits));if(Math.abs(i)<1&&Math.abs(i)>=Math.pow(10,this.options.minNegativeExponent)){var r=Math.abs(this.options.minNegativeExponent)+this.options.significantDigits-1;return this.removeTrailingZeroesAfterDecimal(i.toFixed(r))}var o=i.toExponential(this.options.significantDigits-1);return this.toSuperscript(o)},t.prototype.toSuperscript=function(t){var i;if(t.includes("e+"))i=t.split("e+");else{if(!t.includes("e-"))return t;i=t.split("e")}for(var e="",n=0,r=i[1];n<r.length;n++){var o=r[n];e+=this.superscripts[o]}return i[1]=e,i.join("x10")},t.prototype.removeTrailingZeroesAfterDecimal=function(t){return parseFloat(t).toString()},t}();i.NumberFormatter=s}]);