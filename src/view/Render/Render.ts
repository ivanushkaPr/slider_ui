/* eslint-disable max-classes-per-file */
// eslint-disable-next-line import/extensions
import View from '../view';

class Range {
  parent;

  constructor(parent) {
    this.parent = parent;
  }

  renderNewSlider(obj: {root: HTMLElement, id: string}):HTMLElement {
    const { root, id } = obj;
    this.removeSlider(root);
    const NEW_SLIDER = this.createRange();
    this.renderElement(NEW_SLIDER, document.getElementById(id));
    return NEW_SLIDER;
  }

  removeSlider(root: HTMLElement):void {
    const OLD_SLIDER = root.querySelector('.slider__range');
    if (OLD_SLIDER) {
      OLD_SLIDER.remove();
    }
  }

  createRange(): HTMLElement {
    const IS_VERTICAL = this.parent.view.fetchModelProperty('vertical');
    const RANGE_ELEMENT = document.createElement('div');
    RANGE_ELEMENT.classList.add('slider__range');
    if (IS_VERTICAL) {
      RANGE_ELEMENT.classList.add('slider__range--vertical');
    } else {
      RANGE_ELEMENT.classList.add('slider__range--horizontal');
    }
    return RANGE_ELEMENT;
  }

  renderElement(element: HTMLElement, parentElement: HTMLElement): void {
    parentElement.prepend(element);
    return undefined;
  }

  onElementClickHandler() {

  }
}

class Tooltip {
  parent;

  constructor(parent) {
    this.parent = parent;
  }

  createTooltip(): HTMLElement {
    const TOOLTIP_ELEMENT = document.createElement('div');
    TOOLTIP_ELEMENT.classList.add('slider__tooltip');

    const SLIDER_IS_VERTICAL = this.parent.view.fetchModelProperty('vertical');
    if (!SLIDER_IS_VERTICAL) {
      TOOLTIP_ELEMENT.classList.add('slider__tooltip--horizontal');
    } else {
      TOOLTIP_ELEMENT.classList.add('slider__tooltip--vertical');
    }
    TOOLTIP_ELEMENT.addEventListener('dragstart', (e) => {
      return false;
    });

 //   TOOLTIP_ELEMENT.innerHTML = String(position);

    return TOOLTIP_ELEMENT;
  }

  renderSliderTooltip(obj: {position, vertical, slider}) {
    const { position, vertical, slider } = obj;

    position.forEach((pos, index)=> {
      const tooltip = this.createTooltip();
      this.parent.setElementPosition({
        element: tooltip,
        pos,
        axis: vertical === false ? 'left' : 'top',
        parent: slider,
        negative: vertical === false ? this.parent.runnerWidth : this.parent.runnerHeight,
      });
      const runner = this.parent.runnersAr[index];
      const tooltipPosition = this.parent.view.positionToValue({
        parent: slider,
        runner,
        vertical,
      });

      tooltip.innerHTML = String(tooltipPosition);
      slider.appendChild(tooltip);
    });
  }

  setTooltipDataAttributes(root) {
    const collection = root.querySelectorAll('.slider__tooltip');

    collection.forEach((target, index) => {
      const HTMLtooltip = target as HTMLElement;
      HTMLtooltip.dataset.runnerSibling = String(index);
    });
  }
}

class Runner {
  parent;

  constructor(parent) {
    this.parent = parent;
  }

  RenderSliderRunners(obj: {runners, slider, size, vertical}) {
    const {
      runners, slider, vertical,
    } = obj;
    runners.forEach((runnerPosition: number, index) => {


      // const position = this.fetchModelProperty('stepsOn')
      // && this.fetchModelProperty('adjustSteps') ?
      // this.checkCoordsAvailability({ percents: runnerPosition, rangeSize: size }
      // : runnerPosition;
      
      const position = runnerPosition;
     
     /*
      this.view.setModelProperty({
        property: 'runners',
        value: Math.round(position),
        index,
      });
      */

      const runner = this.createRunner();
      slider.appendChild(runner);

     // this.parent.runnerWidth = runner.offsetWidth;
     // this.parent.runnerHeight = runner.offsetHeight;

      this.parent.runnersAr.push(runner);
      this.parent.setElementPosition({
        element: runner,
        position,
        axis: vertical === false ? 'left' : 'top',
        parent: slider,
      });


     // this.parent.tooltipClass.renderSliderTooltip({ position, vertical, slider, runner });
    });
  }

  createRunner(): HTMLElement {
    const RUNNER_ELEMENT = document.createElement('div');
    RUNNER_ELEMENT.classList.add('slider__runner');
    return RUNNER_ELEMENT;
  }

  setRunnersDataAttributes(root) {
    const elements = root.querySelectorAll('.slider__runner');
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
    return elements;
  }
}


class Progress {
  parent;

  constructor(parent) {
    this.parent = parent;
  }

  calculateProgressSize(obj: { progressStartPosition: number, progressEndPosition: number}):
  number {
    const { progressStartPosition, progressEndPosition } = obj;
    return progressEndPosition - progressStartPosition;
  }

  getProgressSize(obj: { vertical: string, parent: HTMLElement,
    firstRunner: Element, secondRunner?: Element
   }) {
   const {
     vertical, parent, firstRunner, secondRunner,
   } = obj;
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
       const PROGRESS_START_POSITION = parent.getBoundingClientRect().left;
       const PROGESS_END_POSITION = firstRunner.getBoundingClientRect().left;
       progressGeometry.size = this.calculateProgressSize({
         progressStartPosition: PROGRESS_START_POSITION,
         progressEndPosition: PROGESS_END_POSITION,
       });
     } else {
       progressGeometry.position = firstRunner.getBoundingClientRect().right
             - parentOffsetLeft + window.pageXOffset;
       const PROGRESS_START_POSITION = firstRunner.getBoundingClientRect().right;
       const PROGRESS_END_POSITION = secondRunner.getBoundingClientRect().left
        + parent.clientLeft * 2;
       progressGeometry.size = this.calculateProgressSize({
         progressStartPosition: PROGRESS_START_POSITION,
         progressEndPosition: PROGRESS_END_POSITION,
       });
     }
   } else if (vertical) {
     if (secondRunner === undefined) {
       progressGeometry.position = parent.getBoundingClientRect().height
       - (parent.getBoundingClientRect().height
       - firstRunner.getBoundingClientRect().bottom + parent.offsetTop + parent.clientTop);
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
       const PROGRESS_END_POSITION = secondRunner.getBoundingClientRect().top
        + parent.clientTop * 2;
       progressGeometry.size = this.calculateProgressSize({
         progressStartPosition: PROGRESS_START_POSITION,
         progressEndPosition: PROGRESS_END_POSITION,
       });
     }
   }
   return progressGeometry;
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

  renderSingleProgressBar(obj: {
    vertical,
    parent: HTMLElement,
    runners: HTMLCollection,
    pair: number
  }) {
    const {
      vertical, parent, runners, pair,
    } = obj;
    const progress = this.createProgress();
    if (!vertical) {
      const {
        position, size,
      } = this.getProgressSize({ vertical, parent, firstRunner: runners[0] });
      this.setSize({ element: progress, property: 'width', value: `${size - parent.clientLeft}` });
      this.setPosition({
        element: progress, position, axis: 'left',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    } else {
      const {
        position,
        size,
      } = this.getProgressSize({ vertical, parent, firstRunner: runners[0] });
      this.setSize({ element: progress, property: 'height', value: `${size - parent.clientTop}` });
      this.setPosition({
        element: progress, position, axis: 'top',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    }
  }

  renderMultipleProgressBars(obj: {
    vertical,
    parent: HTMLElement,
    runners: HTMLCollection,
    index:number,
    pair: number,
  }) {
    const {
      vertical,
      parent,
      runners,
      index,
      pair,
    } = obj;

    const progress = this.createProgress();

    if (!vertical) {
      const {
        position,
        size,
      } = this.getProgressSize({
        vertical,
        parent,
        firstRunner: runners[index],
        secondRunner: runners[index + 1],
      });
      this.setSize({ element: progress, property: 'width', value: `${size - parent.clientLeft}` });
      this.setPosition({
        element: progress, position, axis: 'left',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    } else {
      const { position, size } = this.getProgressSize({
        vertical,
        parent,
        firstRunner: runners[index],
        secondRunner: runners[index + 1],
      });

      this.setSize({ element: progress, property: 'height', value: `${size - parent.clientTop}` });
      this.setPosition({
        element: progress, position, axis: 'top',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    }
  }

  setSize(obj: {element: HTMLElement; property: string; value: string}): void {
    const { element, property, value } = obj;
    element.style[property] = `${Math.round(parseFloat(value))}px`;
    return undefined;
  }

  setPosition(obj: { element: HTMLElement; position: number; axis: string;}):
  HTMLElement {
    const {
      element, position, axis,
    } = obj;
    const targetEl = element;
    targetEl.style[axis] = `${position}px`;
    return targetEl;
  }

  createProgress(): HTMLElement {
    const PROGRESS_ELEMENT = document.createElement('div');
    PROGRESS_ELEMENT.classList.add('slider__progress');
    const SLIDER_IS_VERTICAL = this.parent.view.fetchModelProperty('vertical');
    if (SLIDER_IS_VERTICAL) {
      PROGRESS_ELEMENT.classList.add('slider__progress--vertical');
    } else {
      PROGRESS_ELEMENT.classList.add('slider__progress--horizontal');
    }

    return PROGRESS_ELEMENT;
  }

}

export default class Render {
  view: View;

  root;

  range;

  rangeClass;
  
  runnerClass;

  runnersAr = [];

  runnerWidth;

  runnerHeight;

  tooltipClass;

  progressClass;

  constructor(view) {
    const that = this;
    this.view = view;
    this.rangeClass = new Range(that);
    this.runnerClass = new Runner(that);
    this.tooltipClass = new Tooltip(that);
    this.progressClass = new Progress(that);
  }

  getSliderSize(obj: {range: HTMLElement, rect: DOMRect, vertical: boolean}) {
    const { range, rect, vertical } = obj;
    const size = vertical === false ? range.offsetWidth
    - range.clientLeft * 2 - rect.width : range.offsetHeight - range.clientTop * 2 - rect.height;
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

  createTooltip(position): HTMLElement {
    const TOOLTIP_ELEMENT = this.createElement('div', 'slider__tooltip');
    const SLIDER_IS_VERTICAL = this.view.fetchModelProperty('vertical');
    if (!SLIDER_IS_VERTICAL) {
      TOOLTIP_ELEMENT.classList.add('slider__tooltip--horizontal');
    } else {
      TOOLTIP_ELEMENT.classList.add('slider__tooltip--vertical');
    }
    TOOLTIP_ELEMENT.addEventListener('dragstart', (e) => {
      return false;
    });

    TOOLTIP_ELEMENT.innerHTML = String(position);
    return TOOLTIP_ELEMENT;
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
      this.setScalePosition({ scale, vertical, breakpoint });
      if (index === 0) {
        const classes = vertical === false ? 'scale__value scale__value--start-horizontal' : 'scale__value scale__value--start-vertical';
        const textNode = this.createElement('p', classes);
        const value = document.createTextNode(this.view.fetchModelProperty('minValue'));
        textNode.appendChild(value);
        ruler.appendChild(textNode);
      } else if (index === array.length - 1) {
        const classes = vertical === false ? 'scale__value scale__value--end-horizontal' : 'scale__value scale__value--end-vertical';
        const textNode = this.createElement('p', classes);
        const value = document.createTextNode(this.view.fetchModelProperty('maxValue'));
        textNode.appendChild(value);
        ruler.appendChild(textNode);
      }
      this.view.onHandlerRegister({
        bookmark: 'elementMouseDown',
        element: scale as HTMLElement,
        eventName: 'mousedown',
        cb: this.view.handler.onElementClickHandler,
        enviroment: this,
      });
      this.createMediumScale({
        start: array[index], end: array[index + 1], parent: ruler, vertical, index, array,
      });
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
      this.setScalePosition({ scale: smallScale, vertical, breakpoint: step });
      parent.appendChild(smallScale);
      this.createSmallScales({
        start, end: step, parent, vertical, index, array,
      });
      this.createSmallScales({
        start: step, end, parent, vertical, index, array,
      });
    }
  }

  createSmallScales(obj: {start:number, end: number, parent, vertical, index, array}) {
    const {
      start, end, parent, vertical, index,
    } = obj;
    const mods = vertical === false ? 'slider__scale--horizontal slider__scale--horizontal-sm'
      : 'slider__scale--vertical slider__scale--vertical-sm';

    const step = (end - start) / 4;
    for (let i = 0; i <= 3; i += 1) {
      if (index < this.view.breakpoints.length - 1) {
        const smallScale = this.createScale({ mods });
        this.setScalePosition({ scale: smallScale, vertical, breakpoint: step * i + start });
        parent.appendChild(smallScale);
      }
    }
  }

  

  createSlider(obj: { runners: number[], vertical: boolean, id: string }) {
    const { runners, vertical, id } = obj;
    //document.body.addEventListener('resize', this.view.handler.onScaleResizeHandler);


    const ROOT_NODE = document.getElementById(id);
    this.root = ROOT_NODE;

    const NEW_SLIDER = this.rangeClass.renderNewSlider({ root: ROOT_NODE, id });
    this.range = NEW_SLIDER;
    if (this.view.controller.getModelProperty('stepsOn') === false) {
      this.view.onHandlerRegister({
        bookmark: 'elementMouseDown',
        element: NEW_SLIDER as HTMLElement,
        eventName: 'mousedown',
        cb: this.view.handler.onElementClickHandler,
        enviroment: this,
      });
    }

    this.calculateBreakpoints({ range: NEW_SLIDER, vertical });

    const size = this.getSliderSize({
      range: NEW_SLIDER, rect: this.view.getTemporaryRunnerRectangle(NEW_SLIDER), vertical,
    });

    this.runnerClass.RenderSliderRunners({
      runners, slider: NEW_SLIDER, size, vertical,
    });

    this.tooltipClass.renderSliderTooltip({ position: runners, vertical, slider: NEW_SLIDER});

    const RenderedRunners = this.runnerClass.setRunnersDataAttributes(ROOT_NODE);
    const RenderedTooltips = this.tooltipClass.setTooltipDataAttributes(ROOT_NODE);

    this.view.handler.registerEventHandlers(RenderedRunners);

    this.progressClass.renderProgress({
      runners: ROOT_NODE.getElementsByClassName('slider__runner'),
      parent: NEW_SLIDER,
      vertical: this.view.fetchModelProperty('vertical'),
    });

    if (this.view.fetchModelProperty('scaleOn')) this.createScales({ parentNode: ROOT_NODE, vertical });
    return undefined;
  }

  createElement(nodeName: string, className: string): HTMLElement {
    const element = document.createElement(nodeName);
    element.className = className;
    return element as HTMLElement;
  }
}
