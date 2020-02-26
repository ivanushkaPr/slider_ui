import { Runner } from "mocha";
import { endianness } from "os";
import { close } from "inspector";

export default class View {
  handlers: handlers = {

  }

  controller;

  draggable;

  collision;

  breakpoints;

  shiftX;

  shiftY;



  fetchModelProperty(property: string) {
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

  calculateBreakpoints(obj: {size: number, vertical: boolean}) {
    let { size } = obj;
    const steps = this.fetchModelProperty('steps');
    const stepSize = size / steps;
    const breakpoints: number[] = [];
    breakpoints.push(0);
    for(let i = 1; i < steps; i += 1) {
      breakpoints.push(Math.round(i * stepSize));
    }
    breakpoints.push(size);
    this.breakpoints = breakpoints;
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
    const vertical = this.fetchModelProperty('vertical');
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
    const vertical = this.fetchModelProperty('vertical');
    if (!vertical) {
      tooltip.classList.add('slider__tooltip--horizontal');
    } else {
      tooltip.classList.add('slider__tooltip--vertical');
    }
    tooltip.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });
    console.log(position, 'its tooltip position')
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
      const parentOffsetLeft = parent.offsetLeft + parent.clientLeft;
      for (let runner = 0; runner < runners.length; runner += 1) {
        const progress = this.createProgress();
        let start: number;
        let end: number;
        let position: number;
        if (runners.length === 1) {
          start = parent.getBoundingClientRect().left + parent.clientLeft;
          end = runners[runner].getBoundingClientRect().left;
          position = parent.getBoundingClientRect().left - parent.offsetLeft;
        }
        if (runners.length % 2 === 0 && runner % 2 === 0) {
          start = runners[runner].getBoundingClientRect().right;
          end = runners[runner + 1].getBoundingClientRect().left;
          position = runners[runner].getBoundingClientRect().right - parentOffsetLeft;
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
          end = parent.getBoundingClientRect().bottom - parent.clientLeft;
          start = runners[0].getBoundingClientRect().bottom;
          position = parent.getBoundingClientRect().height;

          const size = this.calculateProgressSize({ start, end });

          this.setSize({ element: progress, property: 'height', value: `${size}` });
          this.setPosition({
            element: progress, position: size, axis: 'top', parent,
          });
        }
        if (runners.length % 2 === 0 && runner % 2 === 0) {
          start = runners[runner + 1].getBoundingClientRect().bottom;
          end = runners[runner].getBoundingClientRect().top;
          position = runners[runner + 1].getBoundingClientRect().bottom - parent.offsetTop - parent.clientTop;

          const size = this.calculateProgressSize({ start, end });
          this.setSize({ element: progress, property: 'height', value: `${size}` });
          progress.style.top = `${position}px`;
        }
        if (runner % 2 === 0) {
          progress.dataset.pair = count.toString();
          count += 1;
          parent.appendChild(progress);
        }
      }
    }
  }

  createAndSetProgress(obj: {runners: HTMLCollection; parent: HTMLElement; vertical: boolean}): void {
    const { runners, parent, vertical } = obj;
    this.renderProgress({ runners, parent, vertical });
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
      const pos = this.positionFromEnd({size: parentHeight, position });
 
      targetEl.style[axis] = `${pos}px`;
    } else {
      targetEl.style[axis] = `${position}px`;
    }
    return targetEl;
  }

  // Используется для расчета местоположения бегунка при вертикальном положение слайдера.
  positionFromEnd(obj: { size: number, position: number}) {
    const {
      size, position
    } = obj;

    return ((size - position));
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

  checkCoordsAvailability(position) {
    const runnerPosition = position;

    let index: number;
    let diff: number = 10000;
    
    for (let breakpoint = 0; breakpoint < this.breakpoints.length; breakpoint += 1) {
      if (this.breakpoints[breakpoint] === runnerPosition) {
        diff = 0;
        index = breakpoint;
      } else {
        const availablePosition = this.breakpoints[breakpoint];
        const diffBetween = Math.abs(availablePosition - runnerPosition);
        if (diff > diffBetween || diff === diffBetween) {
          diff = diffBetween;
          index = breakpoint;
        }
      }
    }
    return this.breakpoints[index];
  }

  calculateRunnerPosition(obj: {runnerPosition, parent, start}): number {
    let { runnerPosition, parent, start } = obj;
    const lineSize = Math.abs(this.fetchModelProperty('minValue'))
    + Math.abs(this.fetchModelProperty('maxValue'));

    console.log(runnerPosition, parent.offsetHeight, 'coooorrs');
    let relativePosition;
    if (!this.fetchModelProperty('vertical')) {
      console.log('we are here')
      const width = parent.offsetWidth - parent.clientLeft * 2;
      const step = width / lineSize;
      relativePosition = runnerPosition / step;
    }
    else {
      const height = parent.offsetHeight - parent.clientTop * 2;
      const step = height / lineSize;
      relativePosition = lineSize - runnerPosition / step;
    }

    return relativePosition;

  }

  createSlider(obj: { runners: number[], vertical: boolean, id: string }) {
    const { runners, vertical, id } = obj;
    const range = this.createRange();

    if (vertical) {
      range.style.height = '300px';
    } else {
      range.style.width = '300px';
    }

    this.calculateBreakpoints({size: 300, vertical: false});

    this.renderElement(range, document.getElementById(id));

    let oddOrEven: boolean;
    runners.forEach((runnerPosition: number, index) => {

      let position;
      if (this.fetchModelProperty('stepsOn')) {
        position = this.checkCoordsAvailability(runnerPosition);
      }
      else {
        position = runnerPosition;
      }

      const runner = this.createRunner();

      const runnerWithPos = this.setPosition({
        element: runner,
        position,
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

      const tooltip = this.createTooltip(position);
      const tooltipPositioned = this.setPosition({
        element: tooltip,
        position,
        axis: vertical === false ? 'left' : 'top',
        parent: range,
      });


      // let tooltipHTML = this.calculateRunnerPosition({runnerPosition, parent: range, start: });
     // tooltip.innerHTML = String(tooltipHTML);
      let tooltipPosition;
      if (!this.fetchModelProperty('vertical')) {
        if (runner.dataset.start === 'true') {
          tooltipPosition = Math.floor(this.calculateRunnerPosition({ runnerPosition: position, parent: range, start: false }));
        }
        else {
          tooltipPosition = Math.round(this.calculateRunnerPosition({ runnerPosition: position, parent: range, start: true }));
        }
      }
      else if (this.fetchModelProperty('vertical')) {
        if(runner.dataset.start === 'true') {
          console.log(runner, 'first');
          tooltipPosition = Math.floor(this.calculateRunnerPosition({ runnerPosition: parseInt(runner.style.top, 10), parent: range, start: true }));
          // tooltipPosition = parent.offsetHeight - avaiblePosition - parent.clientTop * 2 - this.draggable.offsetHeight;
        }
        else {
          console.log(runner, 'first')
          tooltipPosition = Math.round(this.calculateRunnerPosition({ runnerPosition: parseInt(runner.style.top, 10), parent: range, start: false }));
         // tooltipPosition = parent.offsetHeight - avaiblePosition - parent.clientTop * 2;

        };
      }

      tooltip.innerHTML = tooltipPosition;
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

    this.createAndSetProgress({
      runners: document.getElementsByClassName('.slider__runner'),
      parent: range,
      vertical: this.fetchModelProperty('vertical')
    });

    RenderedRunners.forEach((runner) => {
      this.onHandlerRegister({
        bookmark: 'runnerMouseDown',
        element: runner as HTMLElement,
        eventName: 'mousedown',
        cb: this.onRunnerMouseDownHandler,
        enviroment: this,
      });
    })

    this.createAndSetProgress({
      runners: document.getElementsByClassName('slider__runner'),
      parent: range,
      vertical: this.fetchModelProperty('vertical')
    });
    return undefined;
  }

  setDataAttr(elements: NodeList): void {
    const collection = elements;
    let pair = 1;

    if ((elements[0] as HTMLElement).classList.contains('slider__runner')) {
      collection.forEach((target, index, array) => {
        const HTMLrunner = target as HTMLElement;
        HTMLrunner.dataset.pair = String(pair);

        if (array.length === 1) {
          HTMLrunner.dataset.startAndEnd = 'true';
        } else if (index % 2 === 0) {
          HTMLrunner.dataset.start = 'true';
        } else {
          HTMLrunner.dataset.start = 'false';
        }


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

  onMoveProgress(obj: {parent: HTMLElement, runner: HTMLElement, collision?: boolean}) {
    const {parent, runner: element, collision} = obj;
    const { start, startAndEnd } = this.draggable.dataset;
    const siblingProgressNumber = element.dataset.pair;
    const progress = parent.querySelector(`.slider__progress[data-pair="${siblingProgressNumber}"]`) as HTMLElement;
    if(collision) {
      progress.style.display = 'none';
    }
    if(!collision) {
      progress.style.display = 'block';
    }

    if (!this.fetchModelProperty('vertical')) {
      if (startAndEnd) {
        const width = element.getBoundingClientRect().left;
        progress.style.width = `${width}px`;
      } else if (start === 'true') {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[0].getBoundingClientRect().right;
        const progressEnd = siblings[1].getBoundingClientRect().left;
        const width = (progressEnd - progressStart) > 0 ? progressEnd - progressStart : 0;
        const progressLeft = progressStart - parent.offsetLeft - parent.clientLeft;
        progress.style.width = `${width}px`;
        progress.style.left = `${progressLeft}px`;
      } else {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[0].getBoundingClientRect().right;
        const progressEnd = siblings[1].getBoundingClientRect().left;
        const width = (progressEnd - progressStart) > 0 ? progressEnd - progressStart : 0;
        progress.style.width = `${width}px`;
      }
    } else if(this.fetchModelProperty('vertical')) {

      if (startAndEnd) {
        const top = element.getBoundingClientRect().bottom - parent.offsetTop - parent.clientTop;
        const height = parent.offsetHeight + parent.offsetTop - parent.clientTop - element.getBoundingClientRect().bottom;
        progress.style.top = `${top}px`;
        progress.style.height = `${height}px`;
      } else if(start === 'true') {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[0].getBoundingClientRect().top;
        const progressEnd = siblings[1].getBoundingClientRect().bottom;
        const height = Math.ceil(progressStart - progressEnd + parent.clientTop) > 0
          ? Math.ceil(progressStart - progressEnd + parent.clientTop) : 0;

        progress.style.height = `${height}px`;
      } else {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[0].getBoundingClientRect().top;
        const progressEnd = siblings[1].getBoundingClientRect().bottom;
        const height = Math.ceil(progressStart - progressEnd + parent.clientTop) > 0
          ? Math.ceil(progressStart - progressEnd + parent.clientTop) : 0;
        const top = siblings[1].getBoundingClientRect().bottom - parent.offsetTop - parent.clientTop * 2;
        progress.style.height = `${height}px`;
        progress.style.top = `${top}px`;
      }
    }
  }

  onRestrictDrag(obj: {firstPointPosition: number; secondPointPosition: number; beforeFirstPoint: boolean; afterSecondPoint: boolean; position: number}): number {
    const { firstPointPosition, secondPointPosition, beforeFirstPoint, afterSecondPoint, position } = obj;
    let point;
    if (beforeFirstPoint) {
      point = firstPointPosition;
    } else if (afterSecondPoint) {
      point = secondPointPosition;

    } else {
      point = position;
    }

    return point;
  }

  onRunnersCollision(obj: {element, siblings, parent, point, avaiblePosition, vertical}) {
    const { element, siblings, parent, point, avaiblePosition, vertical } = obj;

    const answer = {
      coords: 0,
      collision: false,
    };

    if (!vertical) {
      if (element.dataset.start === 'true') {
        if (point + this.shiftX > siblings[1].getBoundingClientRect().right - parent.clientLeft) {

          answer.coords = siblings[1].getBoundingClientRect().left - parent.offsetLeft - parent.clientLeft;
          element.style.zIndex = '9999';
          answer.collision = true;
        } else {
          answer.coords = avaiblePosition;
          answer.collision = false;
        }
      } else if (point - this.shiftX < siblings[0].getBoundingClientRect().left) {
        answer.coords = siblings[0].getBoundingClientRect().left - parent.offsetLeft - parent.clientLeft;
        element.style.zIndex = '9999';
        answer.collision = true;
      } else {
        answer.coords = avaiblePosition;
        answer.collision = false;
      }
    } else if (vertical) {
      if (element.dataset.start === 'true') {
        if (point - this.shiftY < siblings[1].getBoundingClientRect().top - parent.clientTop) {
          answer.coords = siblings[1].getBoundingClientRect().top
          - parent.offsetTop - parent.clientTop;
          element.style.zIndex = '9999';
          answer.collision = true;
        } else {
          answer.coords = avaiblePosition;
          answer.collision = false;
        }
      } else if (point + (element.offsetWidth - this.shiftY) > siblings[0].getBoundingClientRect().bottom) {
        answer.coords = siblings[0].getBoundingClientRect().bottom
        - parent.offsetTop - parent.clientTop - element.offsetWidth;
        element.style.zIndex = '9999';
        answer.collision = true;
      } else {
        answer.coords = avaiblePosition;
        answer.collision = false;
      }
    }

    return answer;
  }

  onMoveElementAtPoint(obj: {point: number; element: HTMLElement; vertical: boolean}) {
    const { point, element, vertical } = obj;
    if (!vertical) {
      const parent = element.parentNode as HTMLElement;
      const border = parent.clientLeft;
      const offset = parent.offsetLeft;
      const rect = parent.getBoundingClientRect();
      const { left, right } = rect;

      const position = point - offset - border - this.shiftX;
      const restrictedCoords = {
        firstPointPosition: left - offset,
        secondPointPosition: right - offset - border * 2 - this.draggable.offsetWidth,
        beforeFirstPoint: position < left - offset,
        afterSecondPoint: position + this.draggable.offsetWidth > right - offset,
        position,
      };


      // Написать объект

      let avaiblePosition = this.onRestrictDrag(restrictedCoords);
      let collision = false;

      const { pair: siblingPairNumber } = element.dataset;
      const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingPairNumber}"]`);


      let collisionData = {
        element,
        siblings,
        parent,
        point,
        avaiblePosition,
        vertical,
      }

      if(siblings.length > 1) {
        const answer = this.onRunnersCollision(collisionData);
        avaiblePosition = answer.coords;
        collision = answer.collision;

        /*
        if(element.dataset.start === 'true') {
          if(point + this.shiftX  > siblings[1].getBoundingClientRect().right - parent.clientLeft) {
            avaiblePosition = siblings[1].getBoundingClientRect().left - parent.offsetLeft - parent.clientLeft;
            element.style.zIndex = '9999';
            collision = true;
          }
        }
        else if (point - this.shiftX < siblings[0].getBoundingClientRect().left) {
          avaiblePosition = siblings[0].getBoundingClientRect().left - parent.offsetLeft - parent.clientLeft;
          element.style.zIndex = '9999';
          collision = true;
        }
        */
      }

     // console.log(this.fetchModelProperty('stepsOn'), this);
      if (this.fetchModelProperty('stepsOn')) {
        avaiblePosition = this.runnerStepHandler(avaiblePosition);
        const len = this.breakpoints.length;
        const lastBreakpoint = this.breakpoints[len - 1];
        if(avaiblePosition === lastBreakpoint) {
          avaiblePosition -= this.draggable.offsetWidth;
        }
      }


      element.style.left = `${avaiblePosition}px`;

      this.onMoveProgress({ parent, runner: element, collision });

      
      let tooltipPosition;
      if (this.draggable.dataset.start === 'true') {
        tooltipPosition = Math.floor(this.calculateRunnerPosition({ runnerPosition: avaiblePosition, parent, start: true }));
      }
      else {
        tooltipPosition = Math.round(this.calculateRunnerPosition({ runnerPosition: avaiblePosition + this.draggable.offsetWidth, parent, start: false }));
      }
      const siblingNumber = element.dataset.tooltipSibling;
      const siblingTooltip = parent.querySelector(`[data-runner-sibling="${siblingNumber}"]`) as HTMLElement;
      siblingTooltip.style.left = `${avaiblePosition}px`;
      siblingTooltip.innerHTML = `${tooltipPosition}`;


    } else {
      const parent = element.parentNode as HTMLElement;
      const border = parent.clientTop;
      const offset = parent.offsetTop;
      const rect = parent.getBoundingClientRect();

      const { top, bottom } = rect;

      const position = point - offset - this.shiftY;

      const restrictedCoords = {
        firstPointPosition: top - offset,
        secondPointPosition: bottom - offset - border * 2 - this.draggable.offsetHeight,
        beforeFirstPoint: position < top - offset,
        afterSecondPoint: position + this.draggable.offsetHeight > bottom - offset,
        position,
      };


      let avaiblePosition = this.onRestrictDrag(restrictedCoords);
      let collision = false;

      const { pair: siblingPairNumber } = element.dataset;
      const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingPairNumber}"]`);

      let collisionData = {
        element,
        siblings,
        parent,
        point,
        avaiblePosition,
        vertical,
      }


      if  (siblings.length > 1) {
        const answer = this.onRunnersCollision(collisionData);
        avaiblePosition = answer.coords;
        collision = answer.collision;

        /*
        if (element.dataset.start === 'true') {
          if (point - this.shiftY  < siblings[1].getBoundingClientRect().top - parent.clientTop) {
            avaiblePosition = siblings[1].getBoundingClientRect().top
            - parent.offsetTop - parent.clientTop;
            element.style.zIndex = '9999';
            collision = true;
          }
        } else if (point + (element.offsetWidth - this.shiftY)> siblings[0].getBoundingClientRect().bottom) {
          avaiblePosition = siblings[0].getBoundingClientRect().bottom
          - parent.offsetTop - parent.clientTop - element.offsetWidth;
          element.style.zIndex = '9999';
          collision = true;
        }
        */
      }

      if (this.fetchModelProperty('stepsOn')) {
        avaiblePosition = this.runnerStepHandler(avaiblePosition);
        const len = this.breakpoints.length;
        const lastBreakpoint = this.breakpoints[len - 1];
        if(avaiblePosition === lastBreakpoint) {
          avaiblePosition -= this.draggable.offsetWidth;
        }
      }

      element.style.top = `${avaiblePosition}px`;

      this.onMoveProgress({ parent, runner: element, collision });

      const { start, startAndEnd } = this.draggable.dataset;
      const siblingProgressNumber = element.dataset.pair;
      const progress = parent.querySelector(`.slider__progress[data-pair="${siblingProgressNumber}"]`) as HTMLElement;

      const siblingNumber = element.dataset.tooltipSibling;
      const siblingTooltip = parent.querySelector(`[data-runner-sibling="${siblingNumber}"]`) as HTMLElement;
      siblingTooltip.style.top = `${avaiblePosition}px`;

      
      let tooltipPosition;


      /*
      if (this.draggable.dataset.start === 'true') {
        tooltipPosition = Math.floor(this.calculateRunnerPosition({ runnerPosition: avaiblePosition, parent, start: true }));
      }
      else {
        tooltipPosition = Math.round(this.calculateRunnerPosition({ runnerPosition: avaiblePosition, parent, start: false }));
      }
      */
      if(this.draggable.dataset.start === 'true') {
        tooltipPosition = Math.floor(this.calculateRunnerPosition({ runnerPosition: avaiblePosition + this.draggable.offsetHeight, parent, start: true }));
        console.log('with start')
        // tooltipPosition = parent.offsetHeight - avaiblePosition - parent.clientTop * 2 - this.draggable.offsetHeight;
      }
      else {
        tooltipPosition = Math.round(this.calculateRunnerPosition({ runnerPosition: avaiblePosition, parent, start: false }));
       // tooltipPosition = parent.offsetHeight - avaiblePosition - parent.clientTop * 2;
      }
      siblingTooltip.innerHTML = `${tooltipPosition}`;
    }
  }

  runnerStepHandler(point) {
    let smaller;
    let larger;
    let closestPoint;

    for (let breakpoint = 0; breakpoint < this.breakpoints.length; breakpoint += 1) {
      if(this.breakpoints[breakpoint] > point) {
        larger = this.breakpoints[breakpoint];
        smaller = this.breakpoints[breakpoint - 1];
        break;
      }
    }

    if (larger === undefined) {
      closestPoint = smaller;
    }
    if (smaller === undefined) {
      closestPoint = larger;
    }
    if(larger !== undefined && smaller !== undefined) {
      const distanceToLeft = point - smaller;
      const distanceToRight = larger - point;
      if(distanceToLeft < distanceToRight) {
        closestPoint = smaller;
      }
      else {
        closestPoint = larger;
      }
    }
    return closestPoint;
  }


  onMoveTooltip() {

  }



  onRunnerMouseUpHandler() {
    const { bookmark: mouseMoveBookmark } = this.handlers.runnerMouseMove;
    this.onHandlerDelete(mouseMoveBookmark);


    const { bookmark: mouseUpBookmark } = this.handlers.runnerMouseUp;
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