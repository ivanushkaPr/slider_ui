/* eslint-disable max-classes-per-file */
import Render from './Render/Render.ts';

export default class View {
  handlers: handlers = {

  }

  render: Render;

  controller;

  collision;

  breakpoints;

  shiftX;

  shiftY;

  constructor() {
    const view = this;
    this.render = new Render(view);
  }

  fetchModelProperty(property: string) {
    const propertyValue = this.controller.getModelProperty(property);
    if (propertyValue !== undefined || propertyValue !== null) {
      return propertyValue;
    }
    throw new Error('no such property was found');
  }

  setModelProperty(obj: {property: string, value: number, index: number}):void {
    this.controller.setModelProperty(obj);
  }

  setElementCss(element: HTMLElement, cssRules: rules): HTMLElement {
    const El = element;
    const Rules = Object.entries(cssRules);

    Rules.forEach((rule) => {
      const [propertyName, propertyValue] = rule;
      El.style[propertyName] = propertyValue;
    });
    return El;
  }

  /*
  checkCoordsAvailability(obj: {percents, rangeSize}) {
    const { percents, rangeSize } = obj;
    const percentToPx = (rangeSize / 100) * percents;
    const runnerPosition = percentToPx;

    let index: number;
    let diff: number = 10000;
    for (let breakpoint = 0; breakpoint < this.breakpoints.length; breakpoint += 1) {
      if (this.breakpoints[breakpoint] === runnerPosition) {
        diff = 0;
        index = breakpoint;
      } else {
        const availablePosition = this.breakpoints[breakpoint];
        const substractionDiff = Math.abs(availablePosition - runnerPosition);
        if (diff > substractionDiff || diff === substractionDiff) {
          diff = substractionDiff;
          index = breakpoint;
        }
      }
    }

    const percent = rangeSize / 100;
    const point = this.breakpoints[index] / percent;
    return point;
  }
  */

  positionToValue(obj: { parent: HTMLElement, runner: HTMLElement, vertical: boolean, }):
    number {
    const { parent, runner, vertical } = obj;

    const WIDTH = parent.offsetWidth - parent.clientLeft * 2 - runner.offsetWidth;
    const HEIGHT = parent.offsetHeight - parent.clientTop * 2 - runner.offsetHeight;
    const RANGE_BORDER_BOX = vertical === false ? WIDTH : HEIGHT;

    const LEFT = parseInt(runner.style.left, 10);
    const TOP = parseInt(runner.style.top, 10);
    const POSITION = vertical === false
      ? LEFT : this.positionFromEnd({ size: HEIGHT, position: TOP });
    const SUM = Math.abs(this.fetchModelProperty('minValue')) + Math.abs(this.fetchModelProperty('maxValue'));
    let VALUE = Math.ceil((SUM / RANGE_BORDER_BOX) * POSITION);

    const minValue = this.fetchModelProperty('minValue');
    VALUE = minValue < 0 ? VALUE += minValue : VALUE;
    return VALUE;
  }

  // Используется для расчета местоположения бегунка при вертикальном положение слайдера.
  positionFromEnd(obj: { size: number, position: number}) {
    const {
      size, position,
    } = obj;
    return ((size - position));
  }

  getTemporaryRunnerRectangle(parent):DOMRect {
    const temporaryRunner = this.render.createRunner();
    parent.appendChild(temporaryRunner);
    const runnerDomRect = temporaryRunner.getBoundingClientRect();
    parent.removeChild(temporaryRunner);
    return runnerDomRect;
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

  updateRunnerPosition(obj: {position: number, index: string}):void {
    this.controller.setRunnerPosition(obj);
  }

  onHandlerDelete(bookmark: string) {
    if (bookmark in this.handlers) {
      const { element, eventName, bindedFunc } = this.handlers[bookmark];
      element.removeEventListener(eventName, bindedFunc);
      delete element.dataset[bookmark];
      delete this.handlers[bookmark];
    }
  }
}

type rules = {
  [property: string]: string | number
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
