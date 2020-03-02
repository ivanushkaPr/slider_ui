"use strict";
exports.__esModule = true;
var $ = require("jquery");

console.log('hello')
$.fn.slider = function (msg) {
    console.log(this);
};

$(document).ready(function(){
    $("body").click(function(){
        $(this).css({'backgroundColor': 'red'});
  });