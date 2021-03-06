// eslint-disable-next-line no-unused-vars
import Controller from '../controller/controller';

import Tooltip from './Elements/Tooltip/Tooltip';

import Runner from './Elements/Runner/Runner';
import Progress from './Elements/Progress/Progress';
import Scale from './Elements/Scale/Scale';
import Range from './Elements/Range/Range';

export default class View {
  handlers: handlers = {

  }

  controller: Controller;

  root;

  range;

  rangeClass;

  runnerClass;

  runnersAr = [];

  runnerWidth;

  runnerHeight;

  tooltipClass;

  progressClass;

  scaleClass;

  resizeHandler: boolean = false;

  isResizing: boolean = false;

  breakpoints: number[];

  shiftX;

  shiftY;

  constructor() {
    const view = this;
    this.rangeClass = new Range(view);
    this.runnerClass = new Runner(view);
    this.tooltipClass = new Tooltip(view);
    this.progressClass = new Progress(view);
    this.scaleClass = new Scale(view);
  }

  fetchModelProperty(property: string): any {
    const propertyValue = this.controller.getModelProperty(property);
    if (propertyValue !== undefined || propertyValue !== null) {
      return propertyValue;
    }
    throw new Error('no such property was found');
  }

  setModelProperty(obj: {property: string, value: number, index: number}):void {
    this.controller.setModelProperty(obj);
  }

  onHandlerRegister(obj :{ bookmark: string; element: HTMLElement;
     eventName: runnerEvents; cb: (event: Event) => boolean; enviroment: any}): boolean {
    const {
      bookmark, element, eventName, cb, enviroment,
    } = obj;
    const bindedFunc = cb.bind(this);

    this.handlers[bookmark] = {
      element,
      eventName,
      bindedFunc,
      enviroment,
      bookmark,
    };
    element.addEventListener(eventName, bindedFunc);
    element.dataset[bookmark] = 'true';
    return true;
  }

  onHandlerDelete(bookmark: string):void {
    if (bookmark in this.handlers) {
      const { element, eventName, bindedFunc } = this.handlers[bookmark];
      element.removeEventListener(eventName, bindedFunc);
      delete element.dataset[bookmark];
      delete this.handlers[bookmark];
    }
  }

  updateRunnerPosition(obj: {position: number, index: string}):void {
    this.controller.setRunnerPosition(obj);
  }

  getSliderSize(obj: {range: HTMLElement, rect: DOMRect, vertical: boolean}):number {
    const { range, rect, vertical } = obj;
    const size = vertical === false ? range.offsetWidth
    - range.clientLeft * 2 - rect.width : range.offsetHeight - range.clientTop * 2 - rect.height;
    return size;
  }

  getRangeSize(sliderProperties: {range, vertical:boolean }):number {
    const { range, vertical } = sliderProperties;

    let elementSize;
    if (!vertical) {
      const borderWidth = range.clientLeft;
      const rangeWidth = range.getBoundingClientRect().width;
      elementSize = Math.ceil(rangeWidth - borderWidth);
    } else {
      const borderWidth = range.clientTop * 2;
      const rangeHeight = range.getBoundingClientRect().height;
      elementSize = Math.ceil(rangeHeight - borderWidth);
    }
    return elementSize;
  }

  calculateBreakpoints(sliderProperties: {range:HTMLElement, vertical: boolean}):void {
    const { range, vertical } = sliderProperties;
    const ELEMENT_SIZE = this.getRangeSize({ range, vertical });
    const steps = this.fetchModelProperty('steps');
    const sizeOfStep = ELEMENT_SIZE / steps;
    const breakpoints: number[] = [];
    const FIRST_POINT = 0;
    breakpoints.push(FIRST_POINT);
    for (let multiplier = 1; multiplier < steps; multiplier += 1) {
      breakpoints.push(Math.ceil(multiplier * sizeOfStep));
    }
    const LAST_POINT = ELEMENT_SIZE;
    breakpoints.push(LAST_POINT);
    this.breakpoints = breakpoints;
  }

  createRunner(): HTMLElement {
    const RUNNER_ELEMENT = this.createElement('div', 'slider__runner');
    return RUNNER_ELEMENT;
  }

  setElementPosition(obj:{
    element: HTMLElement;
    position: number;
    axis: string;
    parent: HTMLElement,
    negative?: number, msg? }):void {
    const {
      element, position, axis, parent,
    } = obj;

    let { negative } = obj;

    if (typeof negative !== 'number') {
      negative = 0;
    }

    if (axis === 'left') {
      const ELEMENT_WIDTH = element.offsetWidth - element.clientLeft * 2;
      const PARENT_WITDTH = parent.offsetWidth - parent.clientLeft * 2 - negative;
      const ONE_HORIZONTAL_PERCENT = PARENT_WITDTH / 100;
      const STYLE_LEFT = ONE_HORIZONTAL_PERCENT * position;
      element.style.left = `${STYLE_LEFT - ELEMENT_WIDTH / 2}px`;
    } else {
      const ELEMENT_HEIGHT = element.offsetHeight - element.clientTop * 2;
      const PARENT_HEIGHT = parent.offsetHeight - parent.clientTop * 2 - negative;
      const ONE_VERTICAL_PERCENT = PARENT_HEIGHT / 100;
      const STYLE_TOP = ONE_VERTICAL_PERCENT * position;
      element.style.top = `${STYLE_TOP - ELEMENT_HEIGHT / 2}px`;
    }
  }

  onWindowResizehandler():void {
    if (!this.isResizing) {
      this.isResizing = true;
      this.createSlider({
        runners: this.fetchModelProperty('runners'),
        vertical: this.fetchModelProperty('vertical'),
        id: this.fetchModelProperty('id'),
      });
    }
  }

  getTemporaryRunnerRectangle(parent):DOMRect {
    const temporaryRunner = this.createRunner();
    parent.appendChild(temporaryRunner);
    const runnerDomRect = temporaryRunner.getBoundingClientRect();
    parent.removeChild(temporaryRunner);
    return runnerDomRect;
  }

  createSlider(obj: { runners: number[], vertical: boolean, id: string }):void {
    if (!this.resizeHandler) {
      const func = this.onWindowResizehandler.bind(this);
      window.addEventListener('resize', func);
      this.resizeHandler = true;
    }
   
    const { runners, vertical, id } = obj;
    const ROOT_NODE = document.getElementById(id);
    this.root = ROOT_NODE;

    const NEW_SLIDER = this.rangeClass.renderNewSlider({ root: ROOT_NODE, id });
    this.range = NEW_SLIDER;

    this.calculateBreakpoints({ range: NEW_SLIDER, vertical });

    const size = this.getSliderSize({
      range: NEW_SLIDER, rect: this.getTemporaryRunnerRectangle(NEW_SLIDER), vertical,
    });

    this.runnerClass.RenderSliderRunners({
      runners, slider: NEW_SLIDER, size, vertical, root: ROOT_NODE,
    });

    this.tooltipClass.renderSliderTooltip({
      position: runners, vertical, slider: NEW_SLIDER, root: ROOT_NODE,
    });

    this.progressClass.renderProgress({
      runners: ROOT_NODE.getElementsByClassName('slider__runner'),
      parent: NEW_SLIDER,
      vertical: this.fetchModelProperty('vertical'),
    });

    if (this.fetchModelProperty('scaleOn')) this.scaleClass.createScales({ parentNode: ROOT_NODE, vertical });

    if (this.isResizing) this.isResizing = false;
    return undefined;
  }

  createElement(nodeName: string, className: string): HTMLElement {
    const element = document.createElement(nodeName);
    element.className = className;
    return element as HTMLElement;
  }

}

type runnerEvents = 'mousedown' | 'mousemove' | 'mouseup' | 'click' | 'dragstart' | 'resize';
type handlerData = {
  element: HTMLElement;
  eventName: runnerEvents;
  bindedFunc: any;
  enviroment: View;
  bookmark: string;
}

type handlers = {
  [string: string]: handlerData;
}
