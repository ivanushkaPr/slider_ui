/* eslint-disable max-classes-per-file */
// eslint-disable-next-line import/extensions
import View from '../view';
import Tooltip from './Tooltip/Tooltip';
import Runner from './Runner/Runner';
import Progress from './Progress/Progress';
import Scale from './Scale/Scale';
import Range from './Range/Range';


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

  scaleClass;

  constructor(view) {
    const that = this;
    this.view = view;
    this.rangeClass = new Range(that);
    this.runnerClass = new Runner(that);
    this.tooltipClass = new Tooltip(that);
    this.progressClass = new Progress(that);
    this.scaleClass = new Scale(that);
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

  createSlider(obj: { runners: number[], vertical: boolean, id: string }) {
    const { runners, vertical, id } = obj;
    //document.body.addEventListener('resize', this.view.handler.onScaleResizeHandler);

    const ROOT_NODE = document.getElementById(id);
    this.root = ROOT_NODE;

    const NEW_SLIDER = this.rangeClass.renderNewSlider({ root: ROOT_NODE, id });
    this.range = NEW_SLIDER;

    this.calculateBreakpoints({ range: NEW_SLIDER, vertical });

    const size = this.getSliderSize({
      range: NEW_SLIDER, rect: this.view.getTemporaryRunnerRectangle(NEW_SLIDER), vertical,
    });

    this.runnerClass.RenderSliderRunners({
      runners, slider: NEW_SLIDER, size, vertical, root: ROOT_NODE,
    });

    this.tooltipClass.renderSliderTooltip({ position: runners, vertical, slider: NEW_SLIDER, root: ROOT_NODE });

    this.progressClass.renderProgress({
      runners: ROOT_NODE.getElementsByClassName('slider__runner'),
      parent: NEW_SLIDER,
      vertical: this.view.fetchModelProperty('vertical'),
    });

    if (this.view.fetchModelProperty('scaleOn')) this.scaleClass.createScales({ parentNode: ROOT_NODE, vertical });
    return undefined;
  }

  createElement(nodeName: string, className: string): HTMLElement {
    const element = document.createElement(nodeName);
    element.className = className;
    return element as HTMLElement;
  }
}