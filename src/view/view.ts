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

  setModelProperty(obj: {property, value, index}) {
    this.controller.setModelProperty(obj);
    return true;
  }

  calculateBreakpoints(obj: {range, vertical: boolean, rect:DOMRect}) {
    let { range, vertical, rect } = obj;
    const steps = this.fetchModelProperty('steps');
    let size = !vertical ?
      range.getBoundingClientRect().width - range.clientLeft * 2 - rect.width
      : range.getBoundingClientRect().height - range.clientTop * 2 - rect.height;
    size = Math.ceil(size);
    console.log(size, 'размер');
    const stepSize = size / steps;
    const breakpoints: number[] = [];
    breakpoints.push(0);
    for (let i = 1; i < steps; i += 1) {
      breakpoints.push(Math.ceil(i * stepSize));
    }
    breakpoints.push(size);
    this.breakpoints = breakpoints;
    console.log('called')
  }

  createElement(nodeName: string, className: string) {
    const element = document.createElement(nodeName);
    element.classList.add(className);
    return element as HTMLElement;
  }

  renderElement(element: HTMLElement, parentElement: HTMLElement): void {
    parentElement.prepend(element);
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
          position = parent.getBoundingClientRect().left - parent.offsetLeft + window.pageXOffset;
        }
        if (runners.length % 2 === 0 && runner % 2 === 0) {
          start = runners[runner].getBoundingClientRect().right;
          end = runners[runner + 1].getBoundingClientRect().left;
          position = runners[runner].getBoundingClientRect().right - parentOffsetLeft + window.pageXOffset;
        }
        if(runner % 2 === 0) {
          const size = this.calculateProgressSize({ start, end });
          this.setSize({ element: progress, property: 'width', value: `${size - parent.clientLeft}` });
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
          start = runners[runner].getBoundingClientRect().bottom;
          end = runners[runner + 1].getBoundingClientRect().top;

          position = runners[runner].getBoundingClientRect().bottom - parent.offsetTop - parent.clientTop + window.pageYOffset;
          const size = this.calculateProgressSize({ start, end});
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

  checkCoordsAvailability(obj: {position, size}) {
    const { position, size } = obj;

    const absolutePosition = size / 100 * position;
    const runnerPosition = absolutePosition;
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
    const percent = size / 100;
    const point = this.breakpoints[index] / percent;
    return point;
  }

  calculateRunnerPosition(obj: {
    parent: HTMLElement,
    runner: HTMLElement,
    vertical: boolean,}): number {

    let {parent, runner, vertical} = obj;
    const minValue = this.fetchModelProperty('minValue');
    const minValueAbs = Math.abs(this.fetchModelProperty('minValue'));
    const maxValueAbs = Math.abs(this.fetchModelProperty('maxValue'));
    const lineSize = minValueAbs + maxValueAbs;

    const workSpace = vertical === false ? parent.offsetWidth - parent.clientLeft * 2 - runner.offsetWidth : parent.offsetHeight - parent.clientTop * 2 - runner.offsetHeight;
    const runnerPosition = vertical === false ? parseInt(runner.style.left, 10) / (workSpace / 100) : parseInt(runner.style.top, 10) / (workSpace / 100);


    const onePercentWorkSpace = workSpace / 100;
    const currentPosition = onePercentWorkSpace * runnerPosition;

    let currentLineSize = vertical === false ? Math.round((lineSize / workSpace) * currentPosition) : lineSize - Math.round((lineSize / workSpace) * currentPosition);
    currentLineSize = minValue < 0 ? currentLineSize += minValue : currentLineSize;
    

    return currentLineSize;

  }


  setRunnerPosition(obj:{
      element: HTMLElement;
      position: number;
      axis: string;
      parent: HTMLElement,
      negative?: number, }):void
  {

    const {
      element, position, axis, parent,
    } = obj;

    let { negative } = obj;

    if(typeof negative !== 'number') {
      negative = 0;
    }

    if (axis === 'left') {
      const elementWidth = element.offsetWidth - element.clientLeft * 2;
      const parentWidth = parent.offsetWidth - parent.clientLeft * 2 - elementWidth - negative;
      const onePercent = parentWidth / 100;
      const runnerLeft = onePercent * position;
      element.style.left = `${runnerLeft}px`;
    } else {
      const elementHeight = element.offsetHeight - element.clientTop * 2;
      const parentHeight = parent.offsetHeight - parent.clientTop * 2 - elementHeight - negative;
      const onePercent = parentHeight / 100;
      const runnerTop = onePercent * position;
      element.style.top = `${runnerTop}px`;
    }
  }


  createSlider(obj: { runners: number[], vertical: boolean, id: string }) {
    const { runners, vertical, id } = obj;

    const rangeParentNode = document.getElementById(id);
    const prevRange = rangeParentNode.querySelector('.slider__range');
    if (prevRange) {
      prevRange.remove();
    }

    const range = this.createRange();


    this.renderElement(range, document.getElementById(id));
    const temporaryRunner = this.createRunner();
    range.appendChild(temporaryRunner);
    const tempRect = temporaryRunner.getBoundingClientRect();
    range.removeChild(temporaryRunner);
    this.calculateBreakpoints({range, vertical, rect: tempRect});

    const size = vertical === false ? range.offsetWidth - range.clientLeft * 2 - tempRect.width : range.offsetHeight - range.clientTop * 2 - tempRect.height;

    let oddOrEven: boolean;
    runners.forEach((runnerPosition: number, index, array) => {
      const position = this.fetchModelProperty('stepsOn') ? this.checkCoordsAvailability({position: runnerPosition, size}) : runnerPosition;

      const runner = this.createRunner();
      range.appendChild(runner);
      this.setRunnerPosition({
        element: runner,
        position,
        axis: vertical === false ? 'left' : 'top',
        parent: range,
      });

      
      const tooltip = this.createTooltip(position);
      this.setRunnerPosition({
        element: tooltip,
        position,
        axis: vertical === false ? 'left' : 'top',
        parent: range,
        negative: vertical === false ? runner.offsetWidth : runner.offsetHeight,
      });

      const tooltipPosition = this.calculateRunnerPosition({
        parent: range,
        runner,
        vertical,
      });

      tooltip.innerHTML = String(tooltipPosition);
      range.appendChild(tooltip);


    });

    const RenderedRunners = rangeParentNode.querySelectorAll('.slider__runner');
    this.setDataAttr(RenderedRunners);
    const RenderedTooltips = rangeParentNode.querySelectorAll('.slider__tooltip');
    this.setDataAttr(RenderedTooltips);

    RenderedRunners.forEach((runner) => {
      this.onHandlerRegister({
        bookmark: 'runnerMouseDown',
        element: runner as HTMLElement,
        eventName: 'mousedown',
        cb: this.onRunnerMouseDownHandler,
        enviroment: this,
      });
    });

    this.renderProgress({
      runners: rangeParentNode.getElementsByClassName('slider__runner'),
      parent: range,
      vertical: this.fetchModelProperty('vertical')
    });

    this.createScale({parentNode: rangeParentNode, runnerWidth: tempRect.width, vertical});
    return undefined;
  }

  createScale(obj: {parentNode: HTMLElement, runnerWidth: number, vertical: boolean}) {
    const { parentNode, runnerWidth, vertical } = obj;

    // eslint-disable-next-line prefer-destructuring
    const breakpoints = this.breakpoints;

    const slider = parentNode.querySelector('.slider__range');
    if (!vertical) {
      breakpoints.forEach((breakpoint, index, array) => {
        const div = document.createElement('div');
        div.classList.add('slider__scale');
        if (index === 0 || index === array.length - 1) div.classList.add('slider__scale--transparent');
        div.classList.add('slider__scale--horizontal');
        div.style.position = 'absolute';
        div.style.left = `${breakpoint - 1}px`;
        if (index > 0 && index < array.length - 1) slider.appendChild(div);
      });
    }

    if (vertical) {
      breakpoints.forEach((breakpoint, index, array) => {
        const div = document.createElement('div');
        div.classList.add('slider__scale');
        div.classList.add('slider__scale--vertical');
        div.style.position = 'absolute';
        div.style.top = `${breakpoint + 1}px`;

        if (index > 0 && index < array.length - 1) slider.appendChild(div);
      });
    }
  }



  setDataAttr(elements: NodeList): void {
    const collection = elements;
    let pair = 1;

    if ((elements[0] as HTMLElement).classList.contains('slider__runner')) {
      collection.forEach((target, index, array) => {
        const HTMLrunner = target as HTMLElement;
        HTMLrunner.dataset.pair = String(pair);
        HTMLrunner.dataset.number = String(index + 1);
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
    const { pageX, pageY } = event;

    const vertical = this.fetchModelProperty('vertical');

    let params;
    if (!vertical) {
      params = { point: pageX, element: this.draggable, vertical };
    } else {
      params = { point: pageY, element: this.draggable, vertical };
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
        const width = element.getBoundingClientRect().left - parent.getBoundingClientRect().left ;
        progress.style.width = `${width}px`;
      } else if (start === 'true') {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[0].getBoundingClientRect().right;
        const progressEnd = siblings[1].getBoundingClientRect().left;
        const width = (progressEnd - progressStart) > 0 ? progressEnd - progressStart : 0;
        const progressLeft = progressStart - parent.offsetLeft - parent.clientLeft;
        progress.style.width = `${width + parent.clientLeft}px`;
        progress.style.left = `${progressLeft + window.pageXOffset}px`;

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
        const top = element.getBoundingClientRect().bottom - parent.offsetTop - parent.clientTop + window.pageYOffset;
        const height = parent.offsetHeight + parent.offsetTop - parent.clientTop - element.getBoundingClientRect().bottom - window.pageYOffset;
        progress.style.top = `${top}px`;
        progress.style.height = `${height}px`;
      } else if(start === 'true') { 
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[1].getBoundingClientRect().top;
        const progressEnd = siblings[0].getBoundingClientRect().bottom;
        const height = Math.ceil(progressStart - progressEnd + parent.clientTop) > 0
          ? Math.ceil(progressStart - progressEnd + parent.clientTop) : 0;
        progress.style.height = `${height}px`;
        progress.style.top = `${siblings[0].getBoundingClientRect().bottom - parent.offsetTop - parent.clientTop + window.pageYOffset}px`;
      } else {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[1].getBoundingClientRect().top;
        const progressEnd = siblings[0].getBoundingClientRect().bottom;
        const height = Math.ceil(progressStart - progressEnd + parent.clientTop) > 0
          ? Math.ceil(progressStart - progressEnd + parent.clientTop) : 0;
        progress.style.height = `${height - parent.clientTop}px`;
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

  onRunnersCollision(obj: {targetElement: HTMLElement, selector: string, nextPosition: number, vertical: boolean}) {
    const {
      targetElement, selector, nextPosition, vertical,
    } = obj;

    const siblings = targetElement.parentNode.querySelectorAll(selector);

    const answer = {
      coords: 0,
      collision: false,
    };

    if (!vertical) {
      const dataStart = targetElement.dataset.start;

      if (dataStart === 'true') {
        const brother = siblings[1] as HTMLElement;
        const brotherLeftSide = parseInt(brother.style.left, 10);
        if (brotherLeftSide <= nextPosition) {
          targetElement.style.zIndex = '9999';
          answer.coords = brotherLeftSide;
          answer.collision = true;
        } else {
          targetElement.style.zIndex = 'auto';
          answer.coords = nextPosition;
          answer.collision = false;
        }
      }

      if (dataStart === 'false') {
        const brother = siblings[0] as HTMLElement;
        const brotherLeftSide = parseInt(brother.style.left, 10);
        if (brotherLeftSide >= nextPosition) {
          targetElement.style.zIndex = '9999';
          answer.coords = brotherLeftSide;
          answer.collision = true;
        } else {
          targetElement.style.zIndex = 'auto';
          answer.coords = nextPosition;
          answer.collision = false;
        }
      }
    }
    else {
      const dataStart = targetElement.dataset.start;

      if (dataStart === 'true') {
        const brother = siblings[1] as HTMLElement;
        const brotherTopSide = parseInt(brother.style.top, 10);
        if (brotherTopSide <= nextPosition) { 
          targetElement.style.zIndex = '9999';
          answer.coords = brotherTopSide;
          answer.collision = true;
        } else {
          targetElement.style.zIndex = 'auto';
          answer.coords = nextPosition;
          answer.collision = false;
        }
      }

      if (dataStart === 'false') {
        const brother = siblings[0] as HTMLElement;
        const brotherTopSide = parseInt(brother.style.top, 10);
        if (brotherTopSide >= nextPosition) {
          targetElement.style.zIndex = '9999';
          answer.coords = brotherTopSide;
          answer.collision = true;
        } else {
          targetElement.style.zIndex = 'auto';
          answer.coords = nextPosition;
          answer.collision = false;
        }
      }
    }
    return answer;
  }

  MoveNeighborRunner() {
    
  }

  onMoveElementAtPoint(obj: {point: number; element: HTMLElement; vertical: boolean}) {
    const { point, element, vertical } = obj;
    
    const parent = element.parentNode as HTMLElement;

    let positionOfRunner;
    if (!vertical) {
      const parentOffsetLeft = parent.getBoundingClientRect().left;


      const firstPoint = 0;
      const secondPoint = parent.getBoundingClientRect().width - parent.clientLeft * 2 - element.offsetWidth;

      const relativePointPosition = point - parentOffsetLeft - window.pageXOffset;


      const runnerPosition: number = this.fetchModelProperty('stepsOn') === true
        ? this.runnerStepHandler(relativePointPosition) : relativePointPosition;
      const siblingPair = element.dataset.pair;

      const siblingSelector = `.slider__runner[data-pair="${siblingPair}"]`;

      const collisionData = this.onRunnersCollision({
        targetElement: element,
        selector: siblingSelector,
        nextPosition: runnerPosition,
        vertical,
      });
      
      const RunnerPositionValidation = this.onRestrictDrag({
        firstPointPosition: firstPoint,
        secondPointPosition: secondPoint, 
        beforeFirstPoint: firstPoint > collisionData.coords,
        afterSecondPoint: secondPoint < collisionData.coords,
        position: collisionData.coords,
      });

      element.style.left = `${RunnerPositionValidation}px`;


      this.onMoveProgress({
        parent,
        runner: element,
        collision: collisionData.collision,
      });

      const tooltipSibling = parent.querySelector(`.slider__tooltip[data-runner-sibling="${element.dataset.tooltipSibling}"]`) as HTMLElement;
      tooltipSibling.classList.add('slider__tooltip--show');
      tooltipSibling.style.left = `${RunnerPositionValidation}px`;
      tooltipSibling.innerHTML = String(this.calculateRunnerPosition({
        parent,
        runner: element,
        vertical,
      })); 

      // Переписать функцию, чтобы она не устанавливалась повторно.



      const runnerIndex = this.draggable.dataset.number - 1;
      const absolutePosition = RunnerPositionValidation / ((parent.offsetWidth - parent.clientLeft * 2 - this.draggable.offsetWidth) / 100);


      this.setModelProperty({property: 'runners', value: absolutePosition, index: runnerIndex});

      

    } else {
      const parentOffsetTop = parent.getBoundingClientRect().top;


      const firstPoint = 0;
      const secondPoint = parent.getBoundingClientRect().height - parent.clientTop * 2 - element.offsetHeight;

      const relativePointPosition = point - parentOffsetTop - window.pageYOffset;



      const runnerPosition: number = this.fetchModelProperty('stepsOn') === true
        ? this.runnerStepHandler(relativePointPosition) : relativePointPosition;
      const siblingPair = element.dataset.pair;

      const siblingSelector = `.slider__runner[data-pair="${siblingPair}"]`;

      
      const collisionData = this.onRunnersCollision({
        targetElement: element,
        selector: siblingSelector,
        nextPosition: runnerPosition,
        vertical,
      });

      const RunnerPositionValidation = this.onRestrictDrag({
        firstPointPosition: firstPoint,
        secondPointPosition: secondPoint,
        beforeFirstPoint: firstPoint > collisionData.coords,
        afterSecondPoint: secondPoint < collisionData.coords,
        position: collisionData.coords,
      });

      element.style.top = `${RunnerPositionValidation}px`;


      this.onMoveProgress({
        parent,
        runner: element,
        collision: collisionData.collision,
      });

      const tooltipSibling = parent.querySelector(`.slider__tooltip[data-runner-sibling="${element.dataset.tooltipSibling}"]`) as HTMLElement;

      tooltipSibling.classList.add('slider__tooltip--show');
      tooltipSibling.style.top = `${RunnerPositionValidation}px`;
      tooltipSibling.innerHTML = String(this.calculateRunnerPosition({
        parent,
        runner: element,
        vertical,
      }));


      const runnerIndex = this.draggable.dataset.number - 1;
      const absolutePosition = RunnerPositionValidation / ((parent.offsetHeight - parent.clientTop * 2 - this.draggable.offsetHeight) / 100);
      this.setModelProperty({ property: 'runners', value: absolutePosition, index: runnerIndex });

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
    if (larger !== undefined && smaller !== undefined) {
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