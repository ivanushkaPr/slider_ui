
import View from './view/view';
import { Model, uConfiguration } from './model/model';
import Controller from './controller/controller';

import * as $ from 'jquery';
import { throws } from 'assert';
const jQuery = $;




class Slider {
  ModelConstructor = Model;

  ViewConstructor = View;

  ControllerConstructor = Controller;

  model;

  view;

  controller;

  constructor(configuration) {
    this.model = new this.ModelConstructor(configuration);
    this.view = new this.ViewConstructor();
    this.controller = new this.ControllerConstructor(this.model, this.view);
  }
}

/*
const slider = new Slider(uConfiguration);
*/

/*
let model = new Model(uConfiguration);
let view = new View();
let controller = new Controller(model, view);
*/


/* eslint-disable */
(function( $ ) {
  $.fn.slider = function(options) {
    return new Slider(options);
  };
})($);

const secondConfig = {
  minValue: -100,
  maxValue: 1000,
  currentValue: 0,
  steps: 10,
  runners: [0, 50],
  stepsOn: false,
  vertical: false,
  invertRange: true,
  units: 'px',
  id: '#slider2',
};
let sliderApi;

$(document).ready(function() {
  console.log(uConfiguration)
  const slider = $().slider(uConfiguration);
  sliderApi = slider;
//  const slider2 = $().slider(secondConfig);
})


