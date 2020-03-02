
import View from './view/view';
import { Model, uConfiguration } from './model/model';
import Controller from './controller/controller';

import * as $ from 'jquery';
const jQuery = $;


let model = new Model(uConfiguration);
let view = new View();
let controller = new Controller(model, view);



/* eslint-disable */
(function( $ ) {
  $.fn.slider = function(options) {
    

  };
})($);


$(document).ready(function() {

  $(document).slider('111')
})

