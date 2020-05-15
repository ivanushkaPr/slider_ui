

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


import { JSDOM } from 'jsdom';
import { AssertionError, equal } from "assert";
import { isRegExp } from "util";
let { window } = new JSDOM('<!doctype html><html><body><div id="#slider"></div></body></html>');

// Save these two objects in the global space so that libraries/tests
// can hook into them, using the above doc definition.

global.document = window.document;
global.window = window;





/*

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
    let view, model, controller;
    before(() => {
      model = new Model(uConfiguration);
      view = new View();
      controller = new Controller(model, view);
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

  describe('setSize', () => {
    let view;
    before(() => {
      view = new View();
    })
    it('its sets css rule of element to passed value', () => {
      let element = view.createRunner();

      view.setSize({element, property: 'width', value: '100px'})
      assert.equal(element.style.width, '100px');
      view.setSize({element, property: 'width', value: '100'})
      console.log(element.style.width, '100px');
    })
  })

  describe('calculate progress size', () => {
    let view;
    before(() => {
      view = new View();
    });
    it('calculates size of progress bar', () => {
      assert.equal(view.calculateProgressSize( {start: 100, end: 300 } ), 200)
    })
  });

  describe('render progress', () => {
    let view;
    before(() => {
      view = new View();
    });
    afterEach(() => {
      document.body.outerHTML = '<div id="slider"> </div>';
    })
    it('renders progress for one runner', () => {
      view.createSlider({runners: [0], vertical: false, id: '#slider'});
      let range = document.querySelector('.slider__range');
      let runners = document.querySelectorAll('.slider__runner');

      range.getBoundingClientRect = (): any => {
        return {width: 300, height: 50, left: 0, right: 300, top: 0, bottom: 50, }
      };
      
      runners[0].getBoundingClientRect = ():any => {
        return {width: 25, height: 25, left: 25, right: 25, top: 0, bottom: 25, }
      }


      view.renderProgress({runners, parent: range, vertical: false});

      assert.equal(document.body.querySelectorAll('.slider__progress').length, 1);
      let progress = document.querySelector('.slider__progress') as HTMLElement;

      assert.equal(progress.style.left, '0px');
      assert.equal(progress.style.width, '25px');
      assert.equal(progress.dataset.pair, '1');
    })

    it('renders vertical progress for single runner', () => {
      view.createSlider({runners: [100], vertical: true, id: '#slider'});
      let range = document.querySelector('.slider__range');
      let runners = document.querySelectorAll('.slider__runner');

      range.getBoundingClientRect = (): any => {
        return {width: 50, height: 300, left: 0, right: 300, top: 0, bottom: 300, }
      };

      runners[0].getBoundingClientRect = ():any => {
        return {width: 25, height: 25, left: 0, right: 25, top: 200, bottom: 225, }
      }


      view.renderProgress({runners, parent: range, vertical: true});
      assert.equal(document.querySelectorAll('.slider__progress').length, 1);

      let progress: HTMLElement = document.querySelector('.slider__progress') as HTMLElement;
      assert.equal(progress.style.height, '75px');
      assert.equal(progress.style.top, '300px');
      assert.equal(progress.dataset.pair, '1');
    })

    it('renders progress for two runners', () => {
      view.createSlider({runners: [0, 50], vertical: false, id: '#slider'});
      let range = document.querySelector('.slider__range');
      let runners = document.querySelectorAll('.slider__runner');

      range.getBoundingClientRect = (): any => {
        return {width: 300, height: 50, left: 0, right: 300, top: 0, bottom: 50, }
      };
      
      for(let i = 0; i < 2; i++) {
        runners[i].getBoundingClientRect = ():any => {
          return {width: 25, height: 25, left: i * 50, right: 25 + i * 50, top: 0, bottom: 25, }
        }
      }

      view.renderProgress({runners, parent: range, vertical: false});
      
      let progress = document.querySelectorAll('.slider__progress');
      assert.equal(progress.length, 1);
      let firstProgress = progress[0] as HTMLElement;
      
      assert.equal(firstProgress.style.left, '25px');
      assert.equal(firstProgress.style.width, '25px')
      assert.equal(firstProgress.dataset.pair, '1');
    })

    it('renders progress for even runners', () => {
      view.createSlider({runners: [0, 50, 100, 150], vertical: false, id: '#slider'});
      let range = document.querySelector('.slider__range');
      let runners = document.querySelectorAll('.slider__runner');

      range.getBoundingClientRect = (): any => {
        return {width: 300, height: 50, left: 0, right: 300, top: 0, bottom: 50, }
      };
      
      for(let i = 0; i < 4; i++) {
        runners[i].getBoundingClientRect = ():any => {
          return {width: 25, height: 25, left: i * 50, right: 25 + i * 50, top: 0, bottom: 25, }
        }
      }

      view.renderProgress({runners, parent: range, vertical: false});
      
      let progress = document.querySelectorAll('.slider__progress');
      assert.equal(progress.length, 2);
      let firstProgress = progress[0] as HTMLElement;
      let secondProgress = progress[1] as HTMLElement;
      
      assert.equal(firstProgress.style.left, '25px');
      assert.equal(firstProgress.style.width, '25px')
      assert.equal(firstProgress.dataset.pair, '1');
      
      assert.equal(secondProgress.style.left, '125px');
      assert.equal(secondProgress.style.width, '25px');
      assert.equal(secondProgress.dataset.pair, '2');
    })

    it('renders vertical progress for even runners', () => {
      view.createSlider({runners: [0, 50, 100, 150], vertical: true, id: '#slider'});
      let range = document.querySelector('.slider__range');
      let runners = document.querySelectorAll('.slider__runner');

      range.getBoundingClientRect = (): any => {
        return {width: 50, height: 300, left: 0, right:50, top: 0, bottom: 300, }
      };
      
      for(let i = 0; i < 4; i++) {
        let fromEnd = view.positionFromEnd({size: 300, position: i * 50});
        runners[i].getBoundingClientRect = ():any => {
          return {width: 25, height: 25, left: 0, right: 25, top: fromEnd - 25, bottom: fromEnd, }
        }
      }

      view.renderProgress({runners, parent: range, vertical: true});
      
      let progress = document.querySelectorAll('.slider__progress');
      assert.equal(progress.length, 2);
      let firstProgress = progress[0] as HTMLElement;
      let secondProgress = progress[1] as HTMLElement;
      

      assert.equal(firstProgress.style.height, '25px');
      assert.equal(secondProgress.style.height, '25px');
      
      assert.equal(firstProgress.style.top, '275px');
      assert.equal(secondProgress.style.top, '175px');

      assert.equal(firstProgress.dataset.pair, '1');
      assert.equal(secondProgress.dataset.pair, '2');
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
    it('calls renderProgress, if ammount of runners === 1', () => {
      view.createSlider({runners: [0], vertical: true, id: '#slider'});
      let range = document.querySelector('.slider__range');
      let runners = document.querySelectorAll('.slider__runner');

      range.getBoundingClientRect = (): any => {
        return {width: 300, height: 50, left: 0, right: 300, top: 0, bottom: 50, }
      };
      
      runners[0].getBoundingClientRect = ():any => {
        return {width: 25, height: 25, left: 25, right: 25, top: 0, bottom: 25, }
      }

      view.createAndSetProgress({ runners, parent: range, vertical: false });
      assert.equal(view.renderProgress.calledOnce, true, 'Error in create single runner');
      
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

  describe('onHandlerRegister', () => {
    let view;
    before(() => {
      view = new View();
    })
    it(`registering event handlers and saves their copies in handlers 
    property and binds this`, () => {


      let eventHandler = function(event: Event): boolean {
        return true;
      }

      let handlerTarget = document.getElementById('#slider');
      console.log(document.body.outerHTML, handlerTarget)
      let eventType = 'mouseDown';

    
      view.onHandlerRegister({
        bookmark: 'bookmark',
        element: handlerTarget,
        eventName: eventType,
        cb: eventHandler,
        enviroment: view
      });

      console.log(handlerTarget, 'element at onhandlerregister')
      assert.isObject(view.handlers);
      assert.property(view.handlers, 'bookmark');
      assert.hasAllKeys(view.handlers.bookmark, ['element', 'eventName', 'bindedFunc', 'enviroment', 'bookmark']);
      assert.equal(view.handlers.bookmark.enviroment, view);
      assert.equal(handlerTarget.dataset['bookmark'], 'true');
    })
  })

  describe('onHandlerDelete', () => {
    let view;
    before(() => {
      view = new View();
    })
    it('deletes handler from element', () => {
      let eventHandler = function(event: Event): boolean {
        return true;
      }

      let handlerTarget = document.getElementById('#slider');
      console.log(document.body.outerHTML, handlerTarget)
      let eventType = 'mouseDown';

      view.onHandlerRegister({
        bookmark: 'bookmark',
        element: handlerTarget,
        eventName: eventType,
        cb: eventHandler,
        enviroment: view
      });

      view.onHandlerDelete('bookmark');
      assert.isUndefined(view.handlers.bookmark);
    })
  })

  describe('onMouseDownHandler', () => {
    let view;
    let testHTMLElement;
    before(() => {
      view = new View();
      testHTMLElement = document.createElement('div');
      testHTMLElement.className = 'test-element';
    })
    it('Preparing element for transfer and installs event handlers', () => {
  
      document.body.appendChild(testHTMLElement);

      let event: any = {
        target: document.body.querySelector('.test-element')
      } as unknown;


      view.onRunnerMouseDownHandler(event);

      assert.equal(event.target.style.position, 'absolute');
      assert.equal(event.target.style.zIndex, '1000');
    })

    it(`sets onRunnerMouseMoveHandler, 
    onRunnerMouseUpHandler and onDragStartHandler on event.targert`, () => {
      document.body.appendChild(testHTMLElement);
      let event: any = {
        target: document.body.querySelector('.test-element')
      };

      let mouseDownObj = {
        bookmark: 'test-mousedown',
        element: document.body.querySelector('.test-element'),
        eventName: 'mousedown',
        cb: view.onRunnerMouseDownHandler,
        enviroment: view,
      }

     // view.onHandlerRegister({mouseDownObj});
      view.onRunnerMouseDownHandler.call(view, event);

      assert.property(view.handlers, 'runnerMouseMove');
      assert.deepEqual(view.handlers.runnerMouseMove.enviroment, view);
      assert.property(view.handlers, 'runnerMouseUp');
      assert.deepEqual(view.handlers.runnerMouseUp.enviroment, view);
      assert.property(view.handlers, 'runnerDragStart');
      assert.deepEqual(view.handlers.runnerDragStart.enviroment, view);
    })
  })

  describe('onRunnerMouseMoveHandler', () => {
    
    let view;
    let testHTMLElement;
    before(() => {
      view = new View();
      testHTMLElement = document.createElement('div');
      testHTMLElement.className = 'test-element';
    })

    let sandbox = sinon.createSandbox();
    beforeEach(function() {
      sandbox.spy(view);
  });

    afterEach(function() {
      sandbox.restore();
    });

    it('calls onMoveElementAtPoint', () => {
      document.body.appendChild(testHTMLElement);
      const domElement = document.querySelector('.test-element');

      let eventMock = {
        target: domElement as HTMLElement,
        clientX: 10,
        clientY: 10,
      } as unknown;
      console.log('before onRunnerMouseMoveHandler' )
      view.onRunnerMouseMoveHandler.call(view, eventMock);
      console.log('after onRunnerMouseMoveHandler' )
     
      assert.equal(view.onMoveElementAtPoint.callCount, 1);
      
    })
  })

  describe('onMoveElementAtPoint', () => {
    let view;
    let testHTMLElement;
    before(() => {
      view = new View();
      testHTMLElement = document.createElement('div');
      testHTMLElement.className = 'test-element';
    })
    it('moves target element to point x or y',() => {
      document.body.appendChild(testHTMLElement);
      const domElement = document.querySelector('.test-element') as HTMLElement;
      let point = [];
      for(let i = 0; i < 300; i = i + 1) {
        point.push(i);
      }

      for(let i = 0; i < 300; i = i + 1) {
        console.log(point[i]);
        view.onMoveElementAtPoint({point: point[i], element: domElement, vertical: false})
        assert.equal(domElement.style.width, i + 'px');
        view. onMoveElementAtPoint({point: point[i], element: domElement, vertical: true})
        assert.equal(domElement.style.height, i + 'px');
      }
    })
  })

  describe('onRunnerMouseUpHandler', () => {
    let view;
    let testHTMLElement;
    before(() => {
      view = new View();
      testHTMLElement = document.createElement('div');
      testHTMLElement.className = 'test-element';
    })
    //////////////////////////////
    it('removes onRunnerMouseMoveHandler and onRunnerMouseUpHandler from event.target', 
    () => {
      
      document.body.appendChild(testHTMLElement);

      let event: any = {
        target: document.body.querySelector('.test-element')
      } as unknown;


      view.onRunnerMouseDownHandler(event);
      assert.property(view.handlers, 'runnerMouseMove', 'first');
      assert.property(view.handlers, 'runnerMouseUp', 'second');
      assert.property(view.handlers, 'runnerDragStart', 'last');
      
      view.onRunnerMouseUpHandler(event);

      assert.isUndefined(view.handlers.runnerMouseMove, 'runnerMouseMove');
      assert.isUndefined(view.handlers.runnerMouseUp, 'runnerMouseUp');
      assert.isUndefined(view.handlers.runnerDragStart, 'runnerDragStart');

      assert.isUndefined(event.target.dataset.runnerMouseMove);
      assert.isUndefined(event.target.dataset.runnerMouseUp);
      assert.isUndefined(event.target.dataset.runnerDragStart);
    })
  })

  describe('onTooltipMoveHandler', () => {
    it('', () => {

    })
  })

  describe('calculate breakpoints', () => {
    let view, controller, model;
    let conf = {steps: 10, id: '#slider'}
    before(() => {
      model = new Model(conf);
      view = new View();
      controller = new Controller(model, view);

    })
    it('calculates breakpoints on range element', () => {
      view.calculateBreakpoints({size: 300});
      let breakpoints = [];
      for(var i = 0; i < 11; i += 1) {
        breakpoints.push(i * 30);
      }
      assert.deepEqual(view.breakpoints, breakpoints);
    })
  })

  describe('checkCoordsAvailability', () => {
    let view, controller, model;
    before(() => {
      model = new Model(uConfiguration);
      view = new View();
      controller = new Controller(model, view);
    })
    it('moves runner to the available coordinates', () => {
      view.calculateBreakpoints({size: 300, vertical: false, stepsOn: true});

      const breakpoints = view.breakpoints;

      const runners = model.configuration.runners;

      for(var i = 0; i < runners.length; i += 1) {
        const point = view.checkCoordsAvailability(runners[i]);
        console.log(this.breakpoints, )
        assert.equal(breakpoints.includes(point), true);
      }
    })
  })

  describe('stepsOnHandler', () => {
    it('moves runner then step is on', () => {
      
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

describe('fetchModelProperty', () => {
  let sandbox, model, view, controller;
  before(() => {
    sandbox = sinon.createSandbox();

    model = new Model(uConfiguration);
    view = new View();
    controller = new Controller(model, view);
    sandbox.spy(controller);
  })

  after(()=> {
    sandbox.restore();
    model = undefined;
    view = undefined;
    controller = undefined;
  })

  it('returns model property', () => {
    let minValue = view.fetchModelProperty('minValue');

    let modelConfigEntries = Object.entries(model.configuration);
    let basicConfigEntries = Object.entries(uConfiguration);

    for(let i = 0; i < modelConfigEntries.length; i++) {
      if(!(basicConfigEntries[i][0] in modelConfigEntries[i])) {
        continue;
      }
      assert.equal(modelConfigEntries[i][1], basicConfigEntries[i][1])
    }
  })
})


describe('setModelProperty', () => {
  let sandbox, model, view, controller;
  before(() => {
    sandbox = sinon.createSandbox();

    model = new Model(uConfiguration);
    view = new View();
    controller = new Controller(model, view);
    sandbox.spy(controller);
  })

  after(()=> {
    sandbox.restore();
    model = undefined;
    view = undefined;
    controller = undefined;
  })

  it('calls controller method setModelProperty', () => {
    view.setModelProperty('minValue', 50);
    assert.equal(model.configuration['minValue'], 50);
  })
})

// Controller tests
describe('Controller constructor', () => {
  let sandbox, model, modelSpy, view, viewSpy, controller, controllerSpy;
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

describe('setModelProperty', () => {
  let sandbox, model, modelSpy, view, viewSpy, controller, controllerSpy;
  before(() => {
    sandbox = sinon.createSandbox();

    model = new Model(uConfiguration);
    view = new View();
    controller = new Controller(model, view);

    sandbox.spy(controller);
  })

  after(()=> {
    sandbox.restore();
    model = undefined;
    view = undefined;
    controller = undefined;
  })

  it('can change configurations properties in model', () => {
    controller.setModelProperty('vertical', true);
    assert.equal(controller.model.configuration.vertical, true);
  })
})

describe('getModelProperty', () => {
  let sandbox, model, view, controller;
  before(() => {
    sandbox = sinon.createSandbox();

    model = new Model(uConfiguration);
    view = new View();
    controller = new Controller(model, view);

    sandbox.spy(controller);
  })

  after(()=> {
    sandbox.restore();
    model = undefined;
    view = undefined;
    controller = undefined;
  })

  it('can get any configuration property from model', () => {
    let verticalState = controller.getModelProperty('minValue');
    assert.equal(verticalState, 50);
  })
})

describe('getViewProperty', () => {

})

*/