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

import * as sinon from 'sinon';


const assert = chai.assert;

import {Model, configuration, uConfiguration, incompleteConfiguration} from '../src/model/model';
import Controller from './../src/controller/controller';

import View from './../src/view/view';

import { JSDOM } from 'jsdom';
import { AssertionError, equal } from "assert";
let { window } = new JSDOM('<!doctype html><html><body><div id="#slider"></div></body></html>');

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

describe('view', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="#slider"></div>';
  })
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
      let parent = view.createRange(false);
      parent.style.width = '300px';

      let xOptions = {
        element: runner,
        position: 100,
        axis: 'left',
        parent,
      }

      parent.style.height = '300px';

      let yOptions = {
        element: runner,
        position: 100,
        axis: 'top',
        parent,
      }

      let runnerPositioned: HTMLElement;

      runnerPositioned = view.setPosition(xOptions);
      assert.equal(runnerPositioned.style.left, `${xOptions.position}px`);

      runnerPositioned = view.setPosition(yOptions);
      assert.equal(runnerPositioned.style.top, `${parseInt(parent.style.height, 10) - xOptions.position}px`, 'height assertion doesnt work');
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
    beforeEach(() => {

    });
    it('renders range into dom', () => {
      view.createSlider({runners: [0, 10, 20, 30], vertical: true, id: '#slider'});
      assert.equal(document.body.querySelectorAll('.slider__range').length, 1, 'range element wasnt created');
      assert.equal(document.body.querySelectorAll('.slider__runner').length, 4, 'runner element wasnt created');
      assert.equal(document.body.querySelectorAll('.slider__tooltip').length, 4, 'tooltip element wasnt created');
    // assert.equal(document.body.querySelectorAll('.slider__progress').length, 1, 'progress element wasnt created');
    })
    it('sets data attr pair to each runner', () => {
      const runners = document.querySelectorAll('.slider__runner');
      let number = 1;
      runners.forEach((element, index) => {
        let runner = element as HTMLElement;
        assert.equal(typeof runner.dataset.pair, 'string');
        assert.equal(runner.dataset.pair, String(number));
          if (index % 2 === 1) {
            number += 1;
          }
      })
    })
  })

  describe('setDataAttr', () => {
    let view;
    before(() => {
      view = new View();
    })
    it('sets data attribute pair to runners', () => {
      const runners = [];
      for(let i = 0; i < 4; i = i + 1) {
        runners.push(view.createRunner());
      }
      view.setDataAttr(runners);

      let number = 1;
      runners.forEach((runner, index) => {
        assert.equal(typeof runner.dataset.pair, 'string');
        assert.equal(runner.dataset.pair, String(number));
        if (index % 2 === 1) {
          number += 1;
        }
      })
    })
  })

  describe('setCss', () => {
    let view;
    before(() => {
      view = new View();
    })
    it('its sets css rule of element to passed value', () => {
      let element = view.createRunner();

      view.setCss({element, property: 'width', value: '100px'})
      assert.equal(element.style.width, '100px');
      view.setCss({element, property: 'width', value: '100'})
      console.log(element.style.width, '100px');
    })
  })

  describe('calculate progress size', () => {
    let view;
    before(() => {
      view = new View();
    it('calculates size of progress bar', () => {
      assert.equal(view.calculateProgressSize( {start: 100, end: 300 } ), 200)
    })
  })

  describe('createAndSetProgress', () => {
    let view;
    var sandbox = sinon.createSandbox();
    before(() => {
      view = new View();
    });

    before(function() {
      sandbox.spy(view);
    });

    after(function() {
      sandbox.restore();
    });
    it('calls createSingleRunner, if ammount of runners === 1', () => {
      view.createSlider({runners: [0], vertical: true, id: '#slider'});
      let range = document.querySelector('.slider__range');
      let runners = document.querySelectorAll('.slider__runner');

      view.createAndSetProgress({ runners, range, vartical: false });
      assert.equal(view.createSingleRunner.calledOnce, true);
    })    
    it('calls createEvenRunners, if ammount of runners % 2 === 0', () => {
      view.createSlider({runners: [0, 1], vertical: true, id: '#slider'});
      let range = document.querySelector('.slider__range');
      let runners = document.querySelectorAll('.slider__runner');

      view.createAndSetProgress({ runners, range, vertical: false });
      assert.equal(view.createEvenRunners.calledOnce, true);
    })
    it('calls createOddRunner, if ammount of runners === 1 && runners.length !== 1', () => {
      view.createSlider({runners: [0, 1, 4], vertical: true, id: '#slider'});
      let range = document.querySelector('.slider__range');
      let runners = document.querySelectorAll('.slider__runner');

      view.createAndSetProgress({ runners, range, vertical: false });
      assert.equal(view.createOddRunners.calledOnce, true);
    })    
  
  })

  describe('create single runner', () => {
    let view;
    before(() => {
      view = new View();
    });
    it('renders single runner and sets its width', () => {
      let runner = view.createRunner() as NodeList;
      
      
      

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
});