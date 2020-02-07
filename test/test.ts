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
    let element = view.createElement('div', 'someClass');
    assert.equal(element.nodeName, 'DIV');
    assert.isTrue(element.classList.contains('someClass'));
  })
})

describe('renderElement', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('renders element into dom', () => {
    view.renderElement(view.createElement('div', 'someClass'), document.body);
    assert.equal(document.querySelectorAll('.someClass').length, 1);
  })
})

describe('setElementCss', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('sets styles of element', () => {
    const element = view.createElement('div', 'someClass');
    const styles = {backgroundColor: 'red', marginTop: '10px'};
    let styledEl = view.setElementCss(element, styles);

    for(let property in styles) {
      assert.equal(styledEl.style[property], styles[property]);
    }
  })
})

describe('createRange', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('creates range element', () => {
    let range = view.createRange();
    assert.isTrue(range.classList.contains('slider__range'));
  })
  it('creates horizontal range', () => {
    let range = view.createRange(false);
    assert.equal(range.className, 'slider__range slider__range--horizontal')
  })
  it('creates vertical range', () => {
    let range = view.createRange(true);
    assert.equal(range.className, 'slider__range slider__range--vertical')
  })
})

describe('createRunner', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('creates runner element', () => {
    let runner = view.createRunner();
    assert.isTrue(runner.classList.contains('slider__runner'));
  })
})

describe('createTooltip', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('creates tooltip element', () => {
    let tooltip = view.createTooltip();
    assert.isTrue(tooltip.classList.contains('slider__tooltip'));
  })
})

describe('setPosition', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('sets runner position on range', () => {
    let runner = view.createRunner();
    let xOptions = {
      element: runner,
      position: 100,
      axis: 'left',
    }

    let yOptions = {
      element: runner,
      position: 100,
      axis: 'top',
    }

    let runnerPositioned: HTMLElement;

    runnerPositioned = view.setPosition(xOptions);
    assert.equal(runnerPositioned.style.left, `${xOptions.position}px`);

    runnerPositioned = view.setPosition(yOptions);
    assert.equal(runnerPositioned.style.top, `${yOptions.position}px`);
  })
})

describe('createAndSetElementPosition', () => {
  let view;
  let range;
  before(() => {
    view = new View();
    range = view.createRange()
  })
  it('creates element and sets its position', () => {
    let cb = view.createRunner;

    let element = view.createAndSetElementPosition({ position: 100, vertical: true, callback: 'createTooltip', parent: range});
    console.log(element.outerHTML);
  })
})

describe('positionFromEnd', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('return position of runner for vertical slider', () => {
    assert.equal(view.positionFromEnd({size: 300, position: 60}), 240);
  })
})

describe('createSlider', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('renders range into dom', () => {
    view.createSlider({runners: [0], vertical: true, id: '#slider'});
    assert.equal(document.body.querySelectorAll('.slider__range').length, 1);
  })
})

describe('createAndSetRunnerPosition', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('creates and sets runners position', () => {
    let runner = view.createAndSetRunnerPosition({runnerPosition: 100, vertical: false});
    assert.equal(runner.style.left, '100px');
  })
})

describe('createProgress', () => {
  let view;
  before(() => {
    view = new View();
  })
  it('creates progress element', () => {
    let progress = view.createProgress(false);
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


