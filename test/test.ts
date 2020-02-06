/* eslint-disable */
declare global {
  namespace NodeJS {
    interface Global {
       document: Document;
       window: Window;
       navigator: Navigator;
    } 
  }
}

import * as mocha from "mocha";

import * as chai from "chai";

const assert = chai.assert;

import {Model, configuration, uConfiguration, incompleteConfiguration} from '../src/model/model';
import Controller from './../src/controller/controller';

import View from './../src/view/view';

import { JSDOM } from 'jsdom';
import { AssertionError } from "assert";
const { window } = new JSDOM('<!doctype html><html><body><div id="#slider"></div></body></html>');

// Save these two objects in the global space so that libraries/tests
// can hook into them, using the above doc definition.

global.document = window.document;
global.window = window;

// Controller tests
describe('Controller constructor', () => {
  let model, view, controller;
  before(() => {
    model = new Model(uConfiguration);
    view = new View();
    controller = new Controller(model, view);
  })
  it('Saves links to model and view instances', () => {
    assert.property(controller, 'model');
    
    assert.property(controller, 'view');
  })
})

// View tests
describe('createElement', () => {
  let view;

  before(() => {
    view = new View();
  })

  it('creates element', () => {
    let element = View.createElement('div', 'someClass');
    assert.equal(element.nodeName, 'DIV');
    assert.isTrue(element.classList.contains('someClass'));
  })
})

describe('renderElement', () => {
  it('renders element into dom', () => {
    View.renderElement(View.createElement('div', 'someClass'), document.body);
    assert.equal(document.querySelectorAll('.someClass').length, 1);
  })
})

describe('setElementCss', () => {
  it('sets styles of element', () => {
    const element = View.createElement('div', 'someClass');
    const styles = {backgroundColor: 'red', marginTop: '10px'};
    let styledEl = View.setElementCss(element, styles);

    for(let property in styles) {
      assert.equal(styledEl.style[property], styles[property]);
    }
  })
})

describe('createRange', () => {
  it('creates range element', () => {
    let range = View.createRange();
    assert.isTrue(range.classList.contains('slider__range'));
  })
  it('creates horizontal range', () => {
    let range = View.createRange(false);
    assert.equal(range.className, 'slider__range slider__range--horizontal')
  })
  it('creates vertical range', () => {
    let range = View.createRange(true);
    assert.equal(range.className, 'slider__range slider__range--vertical')
  })
})

describe('createRunner', () => {
  it('creates runner element', () => {
    let runner = View.createRunner();
    assert.isTrue(runner.classList.contains('slider__runner'));
  })
})

describe('createTooltip', () => {
  it('creates tooltip element', () => {
    let tooltip = View.createTooltip();
    assert.isTrue(tooltip.classList.contains('slider__tooltip'));
  })
})

describe('setPosition', () => {
  it('sets runner position on range', () => {
    let runner = View.createRunner();
    let xOptions = {
      runner,
      runnerPosition: 100,
      axis: 'left',
    }

    let yOptions = {
      runner,
      runnerPosition: 100,
      axis: 'top',
    }

    let runnerPositioned: HTMLElement;

    runnerPositioned = View.setPosition(xOptions);
    assert.equal(runnerPositioned.style.left, `${xOptions.runnerPosition}px`);

    runnerPositioned = View.setPosition(yOptions);
    assert.equal(runnerPositioned.style.top, `${yOptions.runnerPosition}px`);
  })
})

describe('createSlider', () => {
  it('renders range into dom', () => {
    View.createSlider({runners: [0], vertical: false, id: '#slider'});
    assert.equal(document.body.querySelectorAll('.slider__range').length, 1);
  })
})

describe('createAndSetRunnerPosition', () => {
  it('creates and sets runners position', () => {

  })
})

describe('createProgress', () => {
  it('creates progress element', () => {
    let progress = View.createProgress(false);
    assert.equal(progress.className, 'slider__progress slider__progress--horizontal');
  })
})

describe('createRelatedElements', () => {
  it('creates related elements', () => {

  })
})

// Model tests

describe('Model constructor', () => {
  let model;
  
  before(() => {
    model = new Model(uConfiguration);
  })

  it('Checks existence of id property in configuration', () => {
    assert.equal(Model.isConf(uConfiguration), true);
  })
  
  it('Saves configuration file', () => {
    assert.equal(model.configuration, uConfiguration);
  })
  
  it('Saved file have all properties from constructor argument', () => {
    for(let key in uConfiguration) {
      assert.property(model.configuration, key);
    }
  })
})

describe('checkConf', () => {
  let model;
  
  before(() => {
    model = new Model(incompleteConfiguration);
  });
  it('Checks configuration file for missing rules, adding them and assigns it to this.configuration', () => {
    model.checkConf(model.configuration);
    const modifiedRules = model.configuration;
    const basicRules = model.basicConfiguration;

    for(let rule in basicRules) {
      if(rule === 'id') {
        continue;
      }
     assert.propertyVal(modifiedRules, rule, basicRules[rule]);
    }
  })
})


