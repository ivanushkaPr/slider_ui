
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

  api;

  constructor(configuration) {
    this.model = new this.ModelConstructor(configuration);
    this.view = new this.ViewConstructor();
    this.controller = new this.ControllerConstructor(this.model, this.view);
  }

  private changeState(obj: {
    property: string; value: string | number | boolean; index?: number}) {
    this.controller.setModelProperty(obj);
    this.controller.removePanel();
    this.controller.update();
  }

  minVal(value: number):void {
    this.changeState({ property: 'minValue', value });
  }

  maxVal(value: number) {
    this.changeState({ property: 'maxValue', value });
  }

  stepsOn(ammount: boolean) {
    this.changeState({ property: 'stepsOn', value: ammount });
  }

  units(unit: string) {
    this.changeState({ property: 'units', value: unit });
  }

  runners(obj: {position: number, index: number}):void {
    const { position } = obj;
    let { index } = obj;
    index -= 1;
    this.changeState({ property: 'runners', value: position, index });
  }

  vertical(isVertical: boolean) {
    this.changeState({ property: 'vertical', value: isVertical });
  }

  scaleOn(isRendered: boolean) {
    this.changeState({ property: 'scaleOn', value: isRendered });
  }

  panel(isRendered: boolean) {
    this.changeState({ property: 'panel', value: isRendered });
  }

  tooltips(show: boolean) {
    this.changeState({ property: 'tooltips', value: show });
  }

  id(id: string) {
    this.changeState({ property: 'id', value: id });
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
    console.log(this);
    return new Slider(options);
  };
})($);

const secondConfig = {
  minValue: 0,
  maxValue: 200000,
  currentValue: 0,
  steps: 10,
  runners: [0, 100],
  stepsOn: false,
  vertical: true,
  scaleOn: true,
  stepSize: 20000,
  units: 'px',
  id: '#slider2',
  panel: true,
};
let sliderApi;

$(document).ready(function() {
  const slider = $('div').slider(uConfiguration);

  const slider2 = $().slider(secondConfig);
})
