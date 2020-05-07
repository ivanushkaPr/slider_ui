import { rejects } from "assert";

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
    const propertyValue = this.controller.getModelProperty(property);
    if (propertyValue !== undefined || propertyValue !== null) {
      return propertyValue;
    }
    throw new Error('no such property was found');
  }

  setModelProperty(obj: {property: string, value: number, index: number}) {
    this.controller.setModelProperty(obj);
    return true;
  }


  getRangeSize(sliderProperties: {range, vertical:boolean }) {
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

  calculateBreakpoints(sliderProperties: {range:HTMLElement, vertical: boolean}) {
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

  createElement(nodeName: string, className: string): HTMLElement {
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
      const [propertyName, propertyValue] = rule;
      El.style[propertyName] = propertyValue;
    });
    return El;
  }

  createRange(): HTMLElement {
    const IS_VERTICAL = this.fetchModelProperty('vertical');
    const RANGE_ELEMENT = this.createElement('div', 'slider__range');
    if (IS_VERTICAL) {
      RANGE_ELEMENT.classList.add('slider__range--vertical');
    } else {
      RANGE_ELEMENT.classList.add('slider__range--horizontal');
    }
    return RANGE_ELEMENT;
  }

  createRunner(): HTMLElement {
    const RUNNER_ELEMENT = this.createElement('div', 'slider__runner');
    return RUNNER_ELEMENT;
  }

  createTooltip(position): HTMLElement {
    const TOOLTIP_ELEMENT = this.createElement('div', 'slider__tooltip');
    const SLIDER_IS_VERTICAL = this.fetchModelProperty('vertical');
    if (!SLIDER_IS_VERTICAL) {
      TOOLTIP_ELEMENT.classList.add('slider__tooltip--horizontal');
    } else {
      TOOLTIP_ELEMENT.classList.add('slider__tooltip--vertical');
    }
    TOOLTIP_ELEMENT.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });
    TOOLTIP_ELEMENT.innerHTML = String(position);
    return TOOLTIP_ELEMENT;
  }

  createProgress(): HTMLElement {
    const PROGRESS_ELEMENT = this.createElement('div', 'slider__progress');
    const SLIDER_IS_VERTICAL = this.fetchModelProperty('vertical');
    if (SLIDER_IS_VERTICAL) {
      PROGRESS_ELEMENT.classList.add('slider__progress--vertical');
    } else {
      PROGRESS_ELEMENT.classList.add('slider__progress--horizontal');
    }

    return PROGRESS_ELEMENT;
  }

  calculateProgressSize(obj: { progressStartPosition: number, progressEndPosition: number}):
  number {
    const { progressStartPosition, progressEndPosition } = obj;
    return progressEndPosition - progressStartPosition;
  }


  getProgressSize(obj: { vertical: string, parent: HTMLElement, firstRunner: Element, secondRunner?: Element }) {
    const { vertical, parent, firstRunner, secondRunner } = obj;
    type styles = {
      position: number;
      size: number,
    };

    const progressGeometry: styles = {
      position: undefined,
      size: undefined,
    };

    const parentOffsetLeft = parent.offsetLeft + parent.clientLeft;
    if (!vertical) {
      if (secondRunner === undefined) {
        progressGeometry.position = parent.getBoundingClientRect().left
          - parent.offsetLeft + window.pageXOffset;
        const PROGRESS_START_POSITION = parent.getBoundingClientRect().left + parent.clientLeft;
        const PROGESS_END_POSITION = firstRunner.getBoundingClientRect().left;
        progressGeometry.size = this.calculateProgressSize({
          progressStartPosition: PROGRESS_START_POSITION,
          progressEndPosition: PROGESS_END_POSITION,
        });
      } else {
        progressGeometry.position = firstRunner.getBoundingClientRect().right
              - parentOffsetLeft + window.pageXOffset;
        const PROGRESS_START_POSITION = firstRunner.getBoundingClientRect().right;
        const PROGRESS_END_POSITION = secondRunner.getBoundingClientRect().left + parent.clientLeft;
        progressGeometry.size = this.calculateProgressSize({
          progressStartPosition: PROGRESS_START_POSITION,
          progressEndPosition: PROGRESS_END_POSITION,
        });
      }
    } else if (vertical) {
      if (secondRunner === undefined) {
        progressGeometry.position = parent.getBoundingClientRect().height - (parent.getBoundingClientRect().height - firstRunner.getBoundingClientRect().bottom + parent.offsetTop + parent.clientTop);
        const PROGRESS_START_POSITION = firstRunner.getBoundingClientRect().bottom;
        const PROGRESS_END_POSITION = parent.getBoundingClientRect().bottom;
        progressGeometry.size = this.calculateProgressSize({
          progressStartPosition: PROGRESS_START_POSITION,
          progressEndPosition: PROGRESS_END_POSITION,
        });

      } else {
        progressGeometry.position = firstRunner.getBoundingClientRect().bottom - parent.offsetTop
        - parent.clientTop + window.pageYOffset;
        const PROGRESS_START_POSITION = firstRunner.getBoundingClientRect().bottom;
        const PROGRESS_END_POSITION = secondRunner.getBoundingClientRect().top;
        progressGeometry.size = this.calculateProgressSize({
          progressStartPosition: PROGRESS_START_POSITION,
          progressEndPosition: PROGRESS_END_POSITION,
        });
      }
    }
    return progressGeometry;
  }

  setProgessStyles(obj: { element:HTMLElement, property: string, value: string, position: number, axis: string, parent: HTMLElement}):void {
    const {
      element, property, value, position, axis, parent,
    } = obj;
    

    this.setSize({ element, property, value });

    this.setPosition({
      element, position, axis,
    });
    // element.dataset.pair = pair.toString();
    parent.appendChild(element);
    return undefined;
  }

  renderSingleProgressBar(obj: {vertical, parent: HTMLElement, runners: HTMLCollection, pair: number}) {
    const {
      vertical, parent, runners, pair,
    } = obj;
    const progress = this.createProgress();
    if (!vertical) {
      const { position, size } = this.getProgressSize({ vertical, parent, firstRunner: runners[0] });
      this.setSize({ element: progress, property: 'width', value: `${size - parent.clientLeft}` });
      this.setPosition({
        element: progress, position, axis: 'left',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    } else {
      const { position, size } = this.getProgressSize({ vertical, parent, firstRunner: runners[0] });
      this.setSize({ element: progress, property: 'height', value: `${size - parent.clientTop}` });
      this.setPosition({
        element: progress, position, axis: 'top',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    }
  }

  renderMultipleProgressBars(obj: {vertical, parent: HTMLElement, runners: HTMLCollection, index:number, pair: number,}) {
    const {vertical, parent, runners, index, pair } = obj;
    const progress = this.createProgress();
    if (!vertical) {
      const { position, size } = this.getProgressSize({ vertical, parent, firstRunner: runners[index], secondRunner: runners[index + 1] });
      this.setSize({ element: progress, property: 'width', value: `${size - parent.clientLeft}` });
      this.setPosition({
        element: progress, position, axis: 'left',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    } else {
      const { position, size } = this.getProgressSize({ vertical, parent, firstRunner: runners[index], secondRunner: runners[index + 1] });
      this.setSize({ element: progress, property: 'height', value: `${size - parent.clientTop}` });
      this.setPosition({
        element: progress, position, axis: 'top',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    }
  }

  renderProgress(obj: {runners: HTMLCollection; parent: HTMLElement; vertical: boolean}): void {
    const { runners, parent, vertical } = obj;
    if (!vertical) {
      let count = 1;
      for (let runner = 0; runner < runners.length; runner += 1) {
        if (runners.length === 1) {
          this.renderSingleProgressBar({
            vertical, parent, runners, pair: count,
          });
        }
        if (runners.length % 2 === 0 && runner % 2 === 0) {
          this.renderMultipleProgressBars({
            vertical, parent, runners, index: runner, pair: count,
          });
          count += 1;
        }
      }
    } else {
      let count = 1;
      for (let runner = 0; runner < runners.length; runner += 1) {
        if (runners.length === 1) {
          this.renderSingleProgressBar({
            vertical, parent, runners, pair: count,
          });
        }
        if (runners.length % 2 === 0 && runner % 2 === 0) {
          this.renderMultipleProgressBars({
            vertical, parent, runners, index: runner, pair: count,
          });
          count += 1;
        }
      }
    }
  }

  // Устанавливает ширину или высоту элемента
  setSize(obj: {element: HTMLElement; property: string; value: string}): void {
    const { element, property, value } = obj;
    element.style[property] = `${parseInt(value, 10)}px`;
    return undefined;
  }

  // Устанавливает местпооложение бегунка на диапазоне
  setPosition(obj: { element: HTMLElement; position: number; axis: string;}):
  HTMLElement {
    const {
      element, position, axis,
    } = obj;
    const targetEl = element;
    targetEl.style[axis] = `${position}px`;
    return targetEl;
  }

  // Используется для расчета местоположения бегунка при вертикальном положение слайдера.
  positionFromEnd(obj: { size: number, position: number}) {
    const {
      size, position,
    } = obj;
    return ((size - position));
  }

  checkCoordsAvailability(obj: {percents, rangeSize}) {
    const { percents, rangeSize } = obj;
    // console.log(position, size, size/100 * position)
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

  positionToValue(obj: { parent: HTMLElement, runner: HTMLElement, vertical: boolean, }):
    number {
    const { parent, runner, vertical } = obj;

    const WIDTH = parent.offsetWidth - parent.clientLeft * 2 - runner.offsetWidth;
    const HEIGHT = parent.offsetHeight - parent.clientTop * 2 - runner.offsetHeight;
    const RANGE_BORDER_BOX = vertical === false ? WIDTH : HEIGHT;

    const LEFT = parseInt(runner.style.left, 10);
    const TOP = parseInt(runner.style.top, 10);
    const POSITION = vertical === false ? LEFT : TOP;

    const SUM = Math.abs(this.fetchModelProperty('minValue')) + Math.abs(this.fetchModelProperty('maxValue'));
    let VALUE = Math.round((SUM / RANGE_BORDER_BOX) * POSITION);

    const minValue = this.fetchModelProperty('minValue');
    VALUE = minValue < 0 ? VALUE += minValue : VALUE;

    return VALUE;
  }


  setElementPosition(obj:{
      element: HTMLElement;
      position: number;
      axis: string;
      parent: HTMLElement,
      negative?: number, }):void {
    const {
      element, position, axis, parent,
    } = obj;

    let { negative } = obj;

    if (typeof negative !== 'number') {
      negative = 0;
    }

    if (axis === 'left') {
      const ELEMENT_WIDTH = element.offsetWidth - element.clientLeft * 2;
      const PARENT_WITDTH = parent.offsetWidth - parent.clientLeft * 2 - ELEMENT_WIDTH - negative;
      const ONE_HORIZONTAL_PERCENT = PARENT_WITDTH / 100;
      const STYLE_LEFT = ONE_HORIZONTAL_PERCENT * position;
      element.style.left = `${STYLE_LEFT}px`;
    } else {
      const ELEMENT_HEIGHT = element.offsetHeight - element.clientTop * 2;
      const PARENT_HEIGHT = parent.offsetHeight - parent.clientTop * 2 - ELEMENT_HEIGHT - negative;
      const ONE_VERTICAL_PERCENT = PARENT_HEIGHT / 100;
      const STYLE_TOP = ONE_VERTICAL_PERCENT * position;
      element.style.top = `${STYLE_TOP}px`;
    }
  }

  removeSlider(root: HTMLElement):void {
    const OLD_SLIDER = root.querySelector('.slider__range')
    if (OLD_SLIDER) {
      OLD_SLIDER.remove();
    }
  }

  getSliderSize(obj: {range: HTMLElement, rect: DOMRect, vertical: boolean}) {
    const { range, rect, vertical } = obj;
    const size = vertical === false ? range.offsetWidth - range.clientLeft * 2 - rect.width : range.offsetHeight - range.clientTop * 2 - rect.height;
    return size;
  }

  getTemporaryRunnerRectangle(parent):DOMRect {
    const temporaryRunner = this.createRunner();
    parent.appendChild(temporaryRunner);
    const runnerDomRect = temporaryRunner.getBoundingClientRect();
    parent.removeChild(temporaryRunner);
    return runnerDomRect;
  }


  renderNewSlider(obj: {root: HTMLElement, id: string}):HTMLElement {
    const { root, id} = obj;
    this.removeSlider(root);
    const NEW_SLIDER = this.createRange();
    this.renderElement(NEW_SLIDER, document.getElementById(id));
    return NEW_SLIDER;
  }

  createSlider(obj: { runners: number[], vertical: boolean, id: string }) {
    const { runners, vertical, id } = obj;
    const ROOT_NODE = document.getElementById(id);
    const NEW_SLIDER = this.renderNewSlider({root: ROOT_NODE, id });
    this.calculateBreakpoints({ range: NEW_SLIDER, vertical });

    const size = this.getSliderSize({ range: NEW_SLIDER, rect: this.getTemporaryRunnerRectangle(NEW_SLIDER), vertical });
 
    runners.forEach((runnerPosition: number, index, array) => {
      const position = this.fetchModelProperty('stepsOn') ? this.checkCoordsAvailability({ percents: runnerPosition, rangeSize: size }) : runnerPosition;

      const runner = this.createRunner();
      NEW_SLIDER.appendChild(runner);
      this.setElementPosition({
        element: runner,
        position,
        axis: vertical === false ? 'left' : 'top',
        parent: NEW_SLIDER,
      });

      const tooltip = this.createTooltip(position);
      this.setElementPosition({
        element: tooltip,
        position,
        axis: vertical === false ? 'left' : 'top',
        parent: NEW_SLIDER,
        negative: vertical === false ? runner.offsetWidth : runner.offsetHeight,
      });

      const tooltipPosition = this.positionToValue({
        parent: NEW_SLIDER,
        runner,
        vertical,
      });

      tooltip.innerHTML = String(tooltipPosition);
      NEW_SLIDER.appendChild(tooltip);


    });

    const RenderedRunners = ROOT_NODE.querySelectorAll('.slider__runner');
    this.setDataAttr(RenderedRunners);
    const RenderedTooltips = ROOT_NODE.querySelectorAll('.slider__tooltip');
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
      runners: ROOT_NODE.getElementsByClassName('slider__runner'),
      parent: NEW_SLIDER,
      vertical: this.fetchModelProperty('vertical'),
    });

    const RUNNER_WIDTH = (document.querySelector('.slider__runner') as HTMLElement).offsetWidth;
    this.createScale({parentNode: ROOT_NODE, runnerWidth: RUNNER_WIDTH, vertical});
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
      tooltipSibling.innerHTML = String(this.positionToValue({
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
      tooltipSibling.innerHTML = String(this.positionToValue({
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