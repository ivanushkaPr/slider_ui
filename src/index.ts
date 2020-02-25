
import View from './view/view';
import { Model, uConfiguration } from './model/model';
import Controller from './controller/controller';

import * as $ from 'jquery';
const jQuery = $;


let model = new Model(uConfiguration);
let view = new View();
let controller = new Controller(model, view);
console.log(model.configuration);




/* eslint-disable */
(function( $ ) {
  $.fn.slider = function(options) {
    console.log('its a plugin call')
    console.log(this);
    this.css({backgroundColor: 'red'});

    var settings = $.extend({
      'vertical': 'true'
    }, options);

    console.log(settings);
    return this;
  };
})($);


