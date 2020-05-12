/* eslint-disable max-classes-per-file */
import { rejects, throws } from "assert";
import { Z_ASCII } from "zlib";

class Render {
  view: View;

  constructor(view) {
    this.view = view;
  }


  renderElement(element: HTMLElement, parentElement: HTMLElement): void {
    parentElement.prepend(element);
    return undefined;
  }

  renderNewSlider(obj: {root: HTMLElement, id: string}):HTMLElement {
    const { root, id} = obj;
    this.removeSlider(root);
    const NEW_SLIDER = this.view.createRange();
    this.renderElement(NEW_SLIDER, document.getElementById(id));
    return NEW_SLIDER;
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
    const steps = this.view.fetchModelProperty('steps');
    const sizeOfStep = ELEMENT_SIZE / steps;
    const breakpoints: number[] = [];
    const FIRST_POINT = 0;
    breakpoints.push(FIRST_POINT);
    for (let multiplier = 1; multiplier < steps; multiplier += 1) {
      breakpoints.push(Math.ceil(multiplier * sizeOfStep));
    }
    const LAST_POINT = ELEMENT_SIZE;
    breakpoints.push(LAST_POINT);
    this.view.breakpoints = breakpoints;
  }

  RenderSliderRunners(obj: {runners, slider, size, vertical}) {
    const { runners, slider, size, vertical } = obj;
    runners.forEach((runnerPosition: number, index, array) => {
      // const position = this.fetchModelProperty('stepsOn') && this.fetchModelProperty('adjustSteps') ? this.checkCoordsAvailability({ percents: runnerPosition, rangeSize: size }) : runnerPosition;
      const position = runnerPosition;
      this.view.setModelProperty({
        property: 'runners',
        value: Math.round(position),
        index,
      });

      const runner = this.createRunner();
      slider.appendChild(runner);
      this.setElementPosition({
        element: runner,
        position,
        axis: vertical === false ? 'left' : 'top',
        parent: slider,
      });

      const tooltip = this.createTooltip(position);
      this.setElementPosition({
        element: tooltip,
        position,
        axis: vertical === false ? 'left' : 'top',
        parent: slider,
        negative: vertical === false ? runner.offsetWidth : runner.offsetHeight,
      });

      const tooltipPosition = this.view.positionToValue({
        parent: slider,
        runner,
        vertical,
      });

      tooltip.innerHTML = String(tooltipPosition);
      slider.appendChild(tooltip);
    });
  }

  createTooltip(position): HTMLElement {
    const TOOLTIP_ELEMENT = this.view.createElement('div', 'slider__tooltip');
    const SLIDER_IS_VERTICAL = this.view.fetchModelProperty('vertical');
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

  createRunner(): HTMLElement {
    const RUNNER_ELEMENT = this.view.createElement('div', 'slider__runner');
    return RUNNER_ELEMENT;
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

  setSliderElementsDataAttributes(root) {
    const RenderedRunners = root.querySelectorAll('.slider__runner');
    this.setRunnersDataAttributes(RenderedRunners);
    const RenderedTooltips = root.querySelectorAll('.slider__tooltip');
    this.setTooltipDataAttributes(RenderedTooltips);
    return RenderedRunners;
  }

  setRunnersDataAttributes(elements: NodeList) {
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
  }

  setTooltipDataAttributes(elements: NodeList) {
    const collection = elements;

    collection.forEach((target, index) => {
      const HTMLtooltip = target as HTMLElement;
      HTMLtooltip.dataset.runnerSibling = String(index);
    });
  }

  //progress

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

  renderSingleProgressBar(obj: {vertical, parent: HTMLElement, runners: HTMLCollection, pair: number}) {
    const {
      vertical, parent, runners, pair,
    } = obj;
    const progress = this.createProgress();
    if (!vertical) {
      const { position, size } = this.getProgressSize({ vertical, parent, firstRunner: runners[0] });
      this.view.setSize({ element: progress, property: 'width', value: `${size - parent.clientLeft}` });
      this.view.setPosition({
        element: progress, position, axis: 'left',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    } else {
      const { position, size } = this.getProgressSize({ vertical, parent, firstRunner: runners[0] });
      this.view.setSize({ element: progress, property: 'height', value: `${size - parent.clientTop}` });
      this.view.setPosition({
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

      this.view.setSize({ element: progress, property: 'width', value: `${size - parent.clientLeft}` });
      this.view.setPosition({
        element: progress, position, axis: 'left',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    } else {
      const { position, size } = this.getProgressSize({ vertical, parent, firstRunner: runners[index], secondRunner: runners[index + 1] });
      this.view.setSize({ element: progress, property: 'height', value: `${size - parent.clientTop}` });
      this.view.setPosition({
        element: progress, position, axis: 'top',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    }
  }

  createProgress(): HTMLElement {
    const PROGRESS_ELEMENT = this.view.createElement('div', 'slider__progress');
    const SLIDER_IS_VERTICAL = this.view.fetchModelProperty('vertical');
    if (SLIDER_IS_VERTICAL) {
      PROGRESS_ELEMENT.classList.add('slider__progress--vertical');
    } else {
      PROGRESS_ELEMENT.classList.add('slider__progress--horizontal');
    }

    return PROGRESS_ELEMENT;
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
        const PROGRESS_END_POSITION = secondRunner.getBoundingClientRect().left + parent.clientLeft * 2;
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
        const PROGRESS_END_POSITION = secondRunner.getBoundingClientRect().top + parent.clientTop * 2;
        progressGeometry.size = this.calculateProgressSize({
          progressStartPosition: PROGRESS_START_POSITION,
          progressEndPosition: PROGRESS_END_POSITION,
        });
      }
    }
    return progressGeometry;
  }

  calculateProgressSize(obj: { progressStartPosition: number, progressEndPosition: number}):
  number {
    const { progressStartPosition, progressEndPosition } = obj;
    return progressEndPosition - progressStartPosition;
  }

  // Scales

  createScales(obj: {parentNode: HTMLElement, vertical: boolean}) {
    const { parentNode, vertical } = obj;
    const breakpoints = [...this.view.breakpoints];
    const slider = parentNode.querySelector('.slider__range');
    const ruler = document.createElement('div');
    const classNames = vertical === false ? 'slider__ruler slider__ruler--margin-top' : 'slider__ruler slider__ruler--margin-left';
    ruler.className = `${classNames}`;


    slider.appendChild(ruler);
    const mods = vertical === false ? 'slider__scale--horizontal' : 'slider__scale--vertical';
    breakpoints.forEach((breakpoint: number, index, array) => {

      const scale: HTMLDivElement = this.createScale({ mods });
      this.setScalePosition({scale, vertical, breakpoint });
      if (index === 0) {
        const classes = vertical === false ? 'scale__value scale__value--start-horizontal' : 'scale__value scale__value--start-vertical';
        const textNode = this.view.createElement('p', classes);
        const value = document.createTextNode(this.view.fetchModelProperty('minValue'));
        textNode.appendChild(value);
        ruler.appendChild(textNode);
      } else if (index === array.length - 1) {
        const classes = vertical === false ? 'scale__value scale__value--end-horizontal' : 'scale__value scale__value--end-vertical';
        const textNode = this.view.createElement('p', classes);
        const value = document.createTextNode(this.view.fetchModelProperty('maxValue'));
        textNode.appendChild(value);
        ruler.appendChild(textNode);
      }
      this.view.onHandlerRegister({
        bookmark: 'elementClick',
        element: scale as HTMLElement,
        eventName: 'click',
        cb: this.view.onElementClickHandler,
        enviroment: this,
      });
      this.createMediumScale({ start: array[index], end: array[index + 1], parent: ruler, vertical, index, array });
      ruler.appendChild(scale);
    });
  }

  setScalePosition(obj: {scale:HTMLDivElement, vertical: boolean, breakpoint: number}) {
    const { scale, vertical, breakpoint } = obj;
    scale.style.position = 'absolute';
    const leftOrTop = vertical === false ? 'left' : 'top';
    scale.style[leftOrTop] = `${breakpoint}px`;
  }

  createScale(obj: {mods}) {
    const { mods } = obj;

    const div = document.createElement('div');
    div.className = `slider__scale ${mods}`;
    return div;
  }

  createMediumScale(obj: {start, end, parent, vertical, index, array}) {
    const {
      start, end, parent, vertical, index, array,
    } = obj;
    const step = start + ((end - start) / 2);

    const mods = vertical === false ? 'slider__scale--horizontal slider__scale--horizontal-md'
      : 'slider__scale--vertical slider__scale--vertical-md';
    if (index < this.view.breakpoints.length - 1) {
      const smallScale = this.createScale({ mods });
      this.setScalePosition({scale: smallScale, vertical, breakpoint: step});
      parent.appendChild(smallScale);
      this.createSmallScales({start, end: step, parent, vertical, index, array });
      this.createSmallScales({start: step, end, parent, vertical, index, array });
    }
  }

  createSmallScales(obj: {start:number, end: number, parent, vertical, index, array}) {
    const {start, end, parent, vertical, index} = obj;
    const mods = vertical === false ? 'slider__scale--horizontal slider__scale--horizontal-sm'
      : 'slider__scale--vertical slider__scale--vertical-sm';

    const step = (end - start) / 4;
    for (let i = 0; i <= 3; i += 1) {
      if (index < this.view.breakpoints.length - 1) {
        const smallScale = this.createScale({ mods });
        this.setScalePosition({scale: smallScale, vertical, breakpoint: step * i + start});
        parent.appendChild(smallScale);
      }
    }
  }

  createSlider(obj: { runners: number[], vertical: boolean, id: string }) {
    const { runners, vertical, id } = obj;
    document.body.addEventListener('resize', this.view.onScaleResizeHandler);


    const ROOT_NODE = document.getElementById(id);
    const NEW_SLIDER = this.renderNewSlider({root: ROOT_NODE, id });
    if (this.view.controller.getModelProperty('stepsOn') === false) {
      this.view.onHandlerRegister({
        bookmark: 'elementClick',
        element: NEW_SLIDER as HTMLElement,
        eventName: 'click',
        cb: this.view.onElementClickHandler,
        enviroment: this,
      });
    }

    this.calculateBreakpoints({ range: NEW_SLIDER, vertical });

    const size = this.getSliderSize({ range: NEW_SLIDER, rect: this.view.getTemporaryRunnerRectangle(NEW_SLIDER), vertical });
    this.RenderSliderRunners({
      runners, slider: NEW_SLIDER, size, vertical,
    });

    const RenderedRunners = this.setSliderElementsDataAttributes(ROOT_NODE);
    this.view.registerEventHandlers(RenderedRunners);

    this.renderProgress({
      runners: ROOT_NODE.getElementsByClassName('slider__runner'),
      parent: NEW_SLIDER,
      vertical: this.view.fetchModelProperty('vertical'),
    });

    if (this.view.fetchModelProperty('scaleOn')) this.createScales({ parentNode: ROOT_NODE, vertical });
    return undefined;
  }
}


export default class View {
  handlers: handlers = {

  }

  render: Render;

  controller;

  draggable;

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

  createElement(nodeName: string, className: string): HTMLElement {
    const element = document.createElement(nodeName);
    element.className = className;
    return element as HTMLElement;
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


  // Устанавливает ширину или высоту элемента
  setSize(obj: {element: HTMLElement; property: string; value: string}): void {
    const { element, property, value } = obj;
    element.style[property] = `${Math.round(parseFloat(value))}px`;
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
    let VALUE = Math.ceil((SUM / RANGE_BORDER_BOX) * POSITION);

    const minValue = this.fetchModelProperty('minValue');
    VALUE = minValue < 0 ? VALUE += minValue : VALUE;

    return VALUE;
  }

  getTemporaryRunnerRectangle(parent):DOMRect {
    const temporaryRunner = this.render.createRunner();
    parent.appendChild(temporaryRunner);
    const runnerDomRect = temporaryRunner.getBoundingClientRect();
    parent.removeChild(temporaryRunner);
    return runnerDomRect;
  }



  registerEventHandlers(runners) {
    runners.forEach((runner) => {
      this.onHandlerRegister({
        bookmark: 'runnerMouseDown',
        element: runner as HTMLElement,
        eventName: 'mousedown',
        cb: this.onRunnerMouseDownHandler,
        enviroment: this,
      });
    });
  }

  createHorizontalScales(parentNode):void {
    const breakpoints = [...this.breakpoints];
    const slider = parentNode.querySelector('.slider__range');

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

  createVerticalScales(parentNode) {
    const breakpoints = [...this.breakpoints];
    const slider = parentNode.querySelector('.slider__range');

    breakpoints.forEach((breakpoint, index, array) => {
      const div = document.createElement('div');
      div.classList.add('slider__scale');
      if (index === 0 || index === array.length - 1) div.classList.add('slider__scale--transparent');
      div.classList.add('slider__scale--vertical');
      div.style.position = 'absolute';
      div.style.top = `${breakpoint + 1}px`;

      if (index > 0 && index < array.length - 1) slider.appendChild(div);
    });
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

  onScaleResizeHandler() {
    console.log('resize')
    const id = this.fetchModelProperty('id');
    const parentNode = document.getElementById(id);
    parentNode.querySelector('slider__ruler').remove();
    this.render.createScales({parentNode, vertical: this.fetchModelProperty('vertical')});
    return true;
  }

  onElementClickHandler(event: MouseEvent):boolean {
    let range;
    if (document.elementFromPoint(event.pageX + this.draggable.offsetWidth / 2, 
      event.pageY + this.draggable.offsetHeight / 2).classList.contains('slider__runner') === false) {
      if (this.controller.getModelProperty('stepsOn')) {
        const scale = (event.currentTarget) as HTMLElement;
        range = scale.parentNode.parentNode as HTMLElement;
      } else {
        range = (event.currentTarget as HTMLElement);
      }

      const runners = range.querySelectorAll('.slider__runner');
      const runnerWidth = (runners[0] as HTMLElement).offsetWidth;
      let click = event.pageX - range.offsetLeft - range.clientLeft;

      let prevDiff = 10000;
      let index;
      runners.forEach((runner, i) => {
        const pos = parseInt((runner as HTMLElement).style.left, 10);
        const diff = Math.abs(click - pos);
        if (diff < prevDiff) {
          prevDiff = diff;
          index = i;
        }
      });

      const runner = runners[index] as HTMLElement;
      if (runner.dataset.start === 'false') {
        click -= runnerWidth;
      }
      runner.style.left = `${click}px`;
      this.draggable = runner;
      this.onMoveProgress({parent: range, runner, collision: false});
      return true;
    }
    return false;
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
    if (collision) {
      progress.style.display = 'none';
    }
    if (!collision) {
      progress.style.display = 'block';
    }

    if (!this.fetchModelProperty('vertical')) {
      if (startAndEnd) {
        const width = element.getBoundingClientRect().left - parent.getBoundingClientRect().left;
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
        progress.style.width = `${width + parent.clientLeft}px`;
      }
    } else if(this.fetchModelProperty('vertical')) {
      if (startAndEnd) {
        const top = element.getBoundingClientRect().bottom - parent.offsetTop - parent.clientTop + window.pageYOffset;
        const height = parent.offsetHeight + parent.offsetTop - parent.clientTop - element.getBoundingClientRect().bottom - window.pageYOffset;
        progress.style.top = `${top}px`;
        progress.style.height = `${height}px`;
      } else if (start === 'true') { 
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[1].getBoundingClientRect().top;
        const progressEnd = siblings[0].getBoundingClientRect().bottom;
        const height = Math.ceil(progressStart - progressEnd + parent.clientTop) > 0
          ? Math.ceil(progressStart - progressEnd + parent.clientTop) : 0;
        progress.style.height = `${height - parent.clientTop}px`;
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

  getSiblingRunners(obj: {runner: HTMLElement, pair: string}): NodeList {
    const {runner, pair} = obj;
    const selector = `.slider__runner[data-pair="${pair}"]`;
    const siblings = runner.parentNode.querySelectorAll(selector);
    return siblings;
  }

  onRunnersCollision(obj: {targetElement: HTMLElement, pair: string, nextPosition: number, vertical: boolean}) {
    const {
      targetElement, pair, nextPosition, vertical,
    } = obj;
    const siblings = this.getSiblingRunners({runner: targetElement, pair});

    const answer = {
      coords: 0,
      collision: false,
    };

    if (!vertical) {
      const dataStart = targetElement.dataset.start;
      if (!dataStart) {
        answer.coords = nextPosition;
        answer.collision = false;
      }

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

      if (!dataStart) {
        answer.coords = nextPosition;
        answer.collision = false;
      }
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

  moveTooltipSibling(obj: {parent, runner, position, axis:string, vertical}) {
    const { parent, runner, position, axis, vertical } = obj;
    const tooltipSibling = parent.querySelector(`.slider__tooltip[data-runner-sibling="${runner.dataset.tooltipSibling}"]`) as HTMLElement;
    if (this.fetchModelProperty('tooltips') === true) {
      tooltipSibling.classList.add('slider__tooltip--show');
    }
    tooltipSibling.style[axis] = `${position}px`;
    tooltipSibling.innerHTML = String(this.positionToValue({
      parent,
      runner,
      vertical,
    }));
  }


  calculateRunnerPosition(obj: {parent, position, vertical }) {
    const {parent, position, vertical } = obj;
    let absolutePosition;
    if (!vertical) {
      absolutePosition = position
      / ((parent.offsetWidth - parent.clientLeft * 2 - this.draggable.offsetWidth)
      / 100);
    } else {
      absolutePosition = position
      / ((parent.offsetHeight - parent.clientTop * 2 - this.draggable.offsetHeight)
      / 100);
    }
    return absolutePosition;
  }

  getSliderControlPoints(obj: {vertical, parent, point, element}) {
    const {
      vertical, parent, point, element,
    } = obj;

    type controlPoints = {
      firstPoint: number,
      secondPoint: number,
      relativePointPosition: number
    }

    const CONTROL_POINTS: controlPoints = {
      firstPoint: 0,
      secondPoint: undefined,
      relativePointPosition: undefined,
    };

    if (!vertical) {
      CONTROL_POINTS.secondPoint = parent.getBoundingClientRect().width
      - parent.clientLeft * 2 - element.offsetWidth;
      CONTROL_POINTS.relativePointPosition = point
      - parent.getBoundingClientRect().left - window.pageXOffset;
    } else {
      CONTROL_POINTS.secondPoint = parent.getBoundingClientRect().height
      - parent.clientTop * 2 - element.offsetHeight;
      CONTROL_POINTS.relativePointPosition = point
      - parent.getBoundingClientRect().top - window.pageYOffset;
    }
    return CONTROL_POINTS;
  }

  moveRunner(obj: {element, vertical, position}) {
    const { element, vertical, position } = obj;
    if (!vertical) {
      element.style.left = `${position}px`;
    } else {
      element.style.top = `${position}px`;
    }
  }

  updateRunnerPosition(obj: {position: number, index: string}):void {
    this.controller.setRunnerPosition(obj);
  }

  onMoveElementAtPoint(obj: {point: number; element: HTMLElement; vertical: boolean}) {
    const { point, element, vertical } = obj;
    const parent = element.parentNode as HTMLElement;

    const { firstPoint, secondPoint, relativePointPosition } = this.getSliderControlPoints({
      vertical, parent, point, element,
    });

    const runnerPosition = this.runnerStepHandler(relativePointPosition);


    const collisionData = this.onRunnersCollision({
      targetElement: element,
      pair: element.dataset.pair,
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

    this.moveRunner({ element, vertical, position: RunnerPositionValidation });

    this.onMoveProgress({
      parent,
      runner: element,
      collision: collisionData.collision,
    });

    this.moveTooltipSibling({
      parent, runner: element, position: RunnerPositionValidation, axis: !vertical ? 'left' : 'top', vertical,
    });

    this.setModelProperty({
      property: 'runners',
      value: this.calculateRunnerPosition({
        parent,
        position: RunnerPositionValidation,
        vertical,
      }),
      index: this.draggable.dataset.number - 1,
    });

    this.updateRunnerPosition({
      position: RunnerPositionValidation,
      index: this.draggable.dataset.number,
    });

  }

  onTooltipHide = (runner) => {
    const parent = runner.offsetParent;
    const tooltipSibling = parent.querySelector(`.slider__tooltip[data-runner-sibling="${runner.dataset.tooltipSibling}"]`) as HTMLElement;
    tooltipSibling.classList.remove('slider__tooltip--show');
  }

  runnerStepHandler(point) {
    let smaller;
    let larger;
    let closestPoint;
    if (this.fetchModelProperty('stepsOn')) {
      for (let breakpoint = 0; breakpoint < this.breakpoints.length; breakpoint += 1) {
        if (this.breakpoints[breakpoint] > point) {
          larger = this.breakpoints[breakpoint];
          smaller = this.breakpoints[breakpoint - 1];
          break;
        }
      }
      if (larger === undefined) {
        closestPoint = smaller;
      } else if (smaller === undefined) {
        closestPoint = larger;
      } else if (larger !== undefined && smaller !== undefined) {
        const distanceToLeft = point - smaller;
        const distanceToRight = larger - point;
        if (distanceToLeft < distanceToRight) {
          closestPoint = smaller;
        } else {
          closestPoint = larger;
        }
      }
    } else {
      closestPoint = point;
    }
    return closestPoint;
  }

  onRunnerMouseUpHandler() {
    if (this.fetchModelProperty('tooltips') === true) this.onTooltipHide(this.draggable);

    const { bookmark: mouseMoveBookmark } = this.handlers.runnerMouseMove;
    this.onHandlerDelete(mouseMoveBookmark);
    const { bookmark: mouseUpBookmark } = this.handlers.runnerMouseUp;
    this.onHandlerDelete(mouseUpBookmark);
    const { bookmark: dragStartBookmark } = this.handlers.runnerDragStart;
    this.onHandlerDelete(dragStartBookmark);
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