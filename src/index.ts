
import * as $ from 'jquery';
const jQuery = $;



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



$(document.body).click(function() {
  $(this).slider().css({border: '100px solid black'});
})

