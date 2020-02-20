
import View from './view/view';
import * as $ from 'jquery';
const jQuery = $;


let view = new View();
view.createSlider({ runners: [0, 50], vertical: false, id: '#slider'});
console.log(view);


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


