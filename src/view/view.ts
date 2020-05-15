/* eslint-disable max-classes-per-file */
import Render from './Render/Render.ts';

export default class View {
  handlers: handlers = {

  }

  render: Render;

  controller;
  
  breakpoints;
  // collision;
  
  // shiftX;

  // shiftY;

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

  onHandlerDelete(bookmark: string) {
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
