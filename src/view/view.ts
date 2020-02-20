import { Runner } from "mocha";

export default class View {
  handlers: handlers = {

  }

  controller;

  draggable;

  shiftX;

  shiftY;



  fetchModelProperty(property) {
    const propState = this.controller.getModelProperty(property);
    if (propState !== undefined || propState !== null) {
      return this.controller.getModelProperty(property);
    }
    throw new Error('no such property was found');
  }

  setModelProperty(property, value) {
    this.controller.setModelProperty(property, value);
    return true;
  }

  createElement(nodeName: string, className: string) {
    const element = document.createElement(nodeName);
    element.classList.add(className);
    return element as HTMLElement;
  }

  renderElement(element: HTMLElement, parentElement: HTMLElement): void {
    parentElement.appendChild(element);
    return undefined;
  }

  setElementCss(element: HTMLElement, cssRules: rules): HTMLElement {
    const El = element;
    const Rules = Object.entries(cssRules);

    Rules.forEach((rule) => {
      const [prop, value] = rule;
      El.style[prop] = value;
    });
    return El;
  }

  createRange(): HTMLElement {
    const vertical = this. fetchModelProperty('vertical');
    const range = this.createElement('div', 'slider__range');
    if (vertical) {
      range.classList.add('slider__range--vertical');
    }
    else {
      range.classList.add('slider__range--horizontal');
    }
    return range;
  }

  createRunner(): HTMLElement {
    const runner = this.createElement('div', 'slider__runner');
    return runner;
  }

  createTooltip(position): HTMLElement {
    const tooltip = this.createElement('div', 'slider__tooltip');
    const vertical =this.fetchModelProperty('vertical');
    if (!vertical) {
      tooltip.classList.add('slider__tooltip--horizontal');
    } else {
      tooltip.classList.add('slider__tooltip--vertical');
    }
    tooltip.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    tooltip.innerHTML = String(position);
    return tooltip;
  }

  createProgress(): HTMLElement {
    const progress = this.createElement('div', 'slider__progress');
    const vertical = this.fetchModelProperty('vertical');
    if (vertical) {
      progress.classList.add('slider__progress--vertical');
      return progress;
    }
    progress.classList.add('slider__progress--horizontal');
    return progress;
  }

  calculateProgressSize(obj: {start: number, end: number}): number {
    const { start, end } = obj;
    return end - start;
  }

  setProgressPosition(obj: {}) {

  }

  renderProgress(obj: {runners: HTMLCollection; parent: HTMLElement; vertical: boolean}): void {
    const {runners, parent, vertical} = obj;
    if (!vertical) {
      let count = 1;
      for (let runner = 0; runner < runners.length; runner += 1) {
        const progress = this.createProgress();
        let start: number;
        let end: number;
        let position: number;
        if (runners.length === 1) {
          start = parent.getBoundingClientRect().left;
          end = runners[runner].getBoundingClientRect().left;
          position = parent.getBoundingClientRect().left;
        }
        if (runners.length % 2 === 0 && runner % 2 === 0) {
          start = runners[runner].getBoundingClientRect().right;
          end = runners[runner + 1].getBoundingClientRect().left;
          position = runners[runner].getBoundingClientRect().right;
        }
        if(runner % 2 === 0) {
          const size = this.calculateProgressSize({ start, end });
          this.setSize({ element: progress, property: 'width', value: `${size}` });
          this.setPosition({
            element: progress, position, axis: 'left', parent,
          });
          progress.dataset.pair = count.toString();
          count += 1;
          parent.appendChild(progress);
        }
      }
    }
    else {
      let count = 1;
      for (let runner = 0; runner < runners.length; runner += 1) {
        const progress = this.createProgress();
        let start: number;
        let end: number;
        let position: number;
        if (runners.length === 1) {
          end = parent.getBoundingClientRect().bottom;
          start = runners[0].getBoundingClientRect().bottom;
          position = parent.getBoundingClientRect().top;
        }
        if (runners.length % 2 === 0 && runner % 2 === 0) {
          start = runners[runner + 1].getBoundingClientRect().bottom;
          end = runners[runner].getBoundingClientRect().top;
          position = parent.getBoundingClientRect().height
            - runners[runner].getBoundingClientRect().top;
        }
        if (runner % 2 === 0) {
          const size = this.calculateProgressSize({ start, end });
          this.setSize({ element: progress, property: 'height', value: `${size}` });
          this.setPosition({
            element: progress, position, axis: 'top', parent,
          });
          progress.dataset.pair = count.toString();
          count += 1;
          parent.appendChild(progress);
        }
      }
    }
  }


  createAndSetProgress(obj: {runners: HTMLCollection; parent: HTMLElement; vertical: boolean}): void {
    const { runners, parent, vertical } = obj;

    const axis = vertical === true ? 'height' : 'width';
    if(runners.length === 1) {
      this.renderProgress({ runners, parent, vertical });
    }
  }


  // Устанавливает ширину или высоту элемента
  setSize(obj: {element: HTMLElement; property: string; value: string}): void {
    const { element, property, value } = obj;
    element.style[property] = `${parseInt(value, 10)}px`;
    return undefined;
  }

  // Устанавливает местпооложение бегунка на диапазоне
  setPosition(obj: { element: HTMLElement; position: number; axis: string; parent: HTMLElement }): HTMLElement {
    const {
      element, position, axis, parent,
    } = obj;

    const targetEl = element;
    if (axis === 'top') {
      const parentHeight = parseInt(parent.style.height, 10);
      const pos = this.positionFromEnd({ size: parentHeight, position });
      targetEl.style[axis] = `${pos}px`;
    } else {
      targetEl.style[axis] = `${position}px`;
    }
    return targetEl;
  }

  // Используется для расчета местоположения бегунка при вертикальном положение слайдера.
  positionFromEnd(obj: {size: number, position: number}) {
    const {
      size, position,
    } = obj;
    return (size - position);
  }

  createAndSetElementPosition(obj: {position: number; vertical: boolean; callback: string, parent: HTMLElement }): boolean {
    const {
      position, vertical, callback, parent,
    } = obj;

    const elem = this.setPosition({
      element: this[callback](),
      position,
      axis: vertical === false ? 'left' : 'top',
      parent,
    });
    this.renderElement(elem, parent);
    return true;
  }

  createSlider(obj: { runners: number[], vertical: boolean, id: string }) {
    const { runners, vertical, id } = obj;
    const range = this.createRange();
    if (vertical) {
      range.style.height = '300px';
    } else {
      range.style.width = '300px';
    }

    this.renderElement(range, document.getElementById(id));

    runners.forEach((runnerPosition: number, index) => {

      const runner = this.createRunner();
      const runnerWithPos = this.setPosition({
        element: runner,
        position: runnerPosition,
        axis: vertical === false ? 'left' : 'top',
        parent: range,
      });

      range.appendChild(runnerWithPos);

      /*
      this.createAndSetElementPosition({
        position: runnerPosition,
        vertical,
        callback: 'createRunner',
        parent: range,
      });
      */

      const tooltip = this.createTooltip(runnerPosition);
      const tooltipPositioned = this.setPosition({
        element: tooltip,
        position: runnerPosition,
        axis: vertical === false ? 'left' : 'top',
        parent: range,
      });
      range.appendChild(tooltipPositioned);

      /*
      this.createAndSetElementPosition({
        position: runnerPosition,
        vertical,
        callback: 'createTooltip',
        parent: range,
      });
      */
    });

    const RenderedRunners = document.querySelectorAll('.slider__runner');
    this.setDataAttr(RenderedRunners);
    const RenderedTooltips = document.querySelectorAll('.slider__tooltip');
    this.setDataAttr(RenderedTooltips);

    RenderedRunners.forEach((runner) => {
      this.onHandlerRegister({
        bookmark: `runnerMouseDown`,
        element: runner as HTMLElement,
        eventName: 'mousedown',
        cb: this.onRunnerMouseDownHandler,
        enviroment: this,
      });
    })
    return undefined;
  }

  setDataAttr(elements: NodeList): void {
    const collection = elements;
    let pair = 1;

    if ((elements[0] as HTMLElement).classList.contains('slider__runner')) {
      console.log('slider__runner')
      collection.forEach((target, index) => {
        const HTMLrunner = target as HTMLElement;
        HTMLrunner.dataset.pair = String(pair);
        if (index % 2 === 1) {
          pair += 1;
        }
        HTMLrunner.dataset.tooltipSibling = String(index);
      });
    }
    else if ((elements[0] as HTMLElement).classList.contains('slider__tooltip')) {
      collection.forEach((target, index) => {
        const HTMLtooltip = target as HTMLElement;
        HTMLtooltip.dataset.runnerSibling = String(index);
      });
    }
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


  onRunnerMouseDownHandler(event: MouseEvent): boolean {
    event.preventDefault();
    const targetElement = event.target as HTMLElement;

    targetElement.style.position = 'absolute';
    targetElement.style.zIndex = '1000';
    this.draggable = targetElement;

    this.shiftX = event.clientX - targetElement.getBoundingClientRect().left;
    this.shiftY = event.clientY - targetElement.getBoundingClientRect().top;

    

    this.onHandlerRegister({
      bookmark: 'runnerMouseMove',
      element: document.body as HTMLElement,
      eventName: 'mousemove',
      cb: this.onRunnerMouseMoveHandler,
      enviroment: this,
    });
    

    this.onHandlerRegister({
      bookmark: 'runnerMouseUp',
      element: document.body as HTMLElement,
      eventName: 'mouseup',
      cb: this.onRunnerMouseUpHandler,
      enviroment: this,
    });


    this.onHandlerRegister({
      bookmark: 'runnerDragStart',
      element: event.target as HTMLElement,
      eventName: 'dragstart',
      cb: this.onDragStartHandler,
      enviroment: this,
    });

    return true;
  }

  onRunnerMouseMoveHandler(event: MouseEvent): boolean {
    const { clientX, clientY } = event;
    const vertical = this.fetchModelProperty('vertical'); 
    let params;
    if (!vertical) {
      params = { point: clientX, element: this.draggable, vertical };
    } else {
      params = { point: clientY, element: this.draggable, vertical };
    }

    this.onMoveElementAtPoint(params);
    return true;
  }

  onRestrictDrag(parent) {
   
  }

  onMoveElementAtPoint(obj: {point: number; element: HTMLElement; vertical: boolean}) {
    const { point, element, vertical } = obj;
    if (!vertical) {
      const parent = element.parentNode as HTMLElement;
      const border = parent.clientLeft;
      const rect = parent.getBoundingClientRect();
      const { left, right } = rect;

      const offset = parent.offsetLeft;

      let position = point - offset - this.shiftX;
      if (position < left - offset) {
        position = left - offset;
      }
      if(position + this.draggable.offsetWidth > right - offset) {
        position = right - offset - border * 2 - this.draggable.offsetWidth;
      }
      element.style.left = `${position}px`;

      const siblingNumber = element.dataset.tooltipSibling;
      const siblingTooltip = parent.querySelector(`[data-runner-sibling="${siblingNumber}"]`) as HTMLElement;
      siblingTooltip.style.left = `${position}px`;

      this.onRestrictDrag(parent);

      
    } else {
      const parent = element.parentNode as HTMLElement;
      const offset = parent.offsetTop;
      const position = `${point - offset}px`;
      element.style.top = position;

      const siblingNumber = element.dataset.tooltipSibling;
      const siblingTooltip = parent.querySelector(`[data-runner-sibling="${siblingNumber}"]`) as HTMLElement;
      siblingTooltip.style.top = position;

    }
  }



  onRunnerMouseUpHandler() {
    const { bookmark: mouseMoveBookmark } = this.handlers.runnerMouseMove;
    this.onHandlerDelete(mouseMoveBookmark);


    const { bookmark: mouseUpBookmark } = this.handlers.runnerMouseUp;
    console.log(this.handlers.runnerMouseUp, 'runnerMouseUp');
    this.onHandlerDelete(mouseUpBookmark);
    

    const { bookmark: dragStartBookmark } = this.handlers.runnerDragStart;
    this.onHandlerDelete(dragStartBookmark);

    return true;
  }

  onHandlerDelete(bookmark: string) {
    if(bookmark in this.handlers) {
      const { element, eventName, bindedFunc } = this.handlers[bookmark];
      element.removeEventListener(eventName, bindedFunc);
      delete element.dataset[bookmark];
      delete this.handlers[bookmark];
    }
  }

  onDragStartHandler() {
    return false;
  }

 

  onTooltipCopyHandler() {
    return false;
  }
}

type rules = {
  [property: string]: string | number
}

type runnerEvents = 'mousedown' | 'mousemove' | 'mouseup' | 'click' | 'dragstart';
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