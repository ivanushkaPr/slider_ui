import { Runner } from "mocha";


export default class View {
  handlers = {};

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

  createRange(vertical: boolean = false): HTMLElement {
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

  createTooltip(): HTMLElement {
    const tooltip = this.createElement('div', 'slider__tooltip');
    return tooltip;
  }

  createProgress(vertical: boolean): HTMLElement {
    const progress = this.createElement('div', 'slider__progress');
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
        const progress = this.createProgress(vertical);
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
        const progress = this.createProgress(vertical);
        let start: number;
        let end: number;
        let position: number;
        if (runners.length === 1) {
          end = parent.getBoundingClientRect().bottom;
          start = runners[0].getBoundingClientRect().bottom;
          position = parent.getBoundingClientRect().top;
        }
        if(runners.length % 2 === 0 && runner % 2 === 0) {
          start = runners[runner + 1].getBoundingClientRect().bottom;
          end = runners[runner].getBoundingClientRect().top;
          position = parent.getBoundingClientRect().height
            - runners[runner].getBoundingClientRect().top;
        }
        if(runner % 2 === 0) {
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

  createAndSetElementPosition(obj: {position: number; vertical: boolean; callback: string, parent: HTMLElement}): boolean {
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
    const range = this.createRange(vertical);
    if (vertical) {
      range.style.height = '300px';
    } else {
      range.style.width = '300px';
    }

    this.renderElement(range, document.getElementById(id));

    runners.forEach((runnerPosition: number, index) => {

      this.createAndSetElementPosition({
        position: runnerPosition,
        vertical,
        callback: 'createRunner',
        parent: range,
      });

      this.createAndSetElementPosition({
        position: runnerPosition,
        vertical,
        callback: 'createTooltip',
        parent: range,
      });
    });

    const RenderedRunners = document.querySelectorAll('.slider__runner');
    this.setDataAttr(RenderedRunners);
  }

  setDataAttr(elements: NodeList): void {
    const collection = elements;
    let pair = 1;
    collection.forEach((target, index) => {
      const HTMLrunner = target as HTMLElement;
      HTMLrunner.dataset.pair = String(pair);
      if (index % 2 === 1) {
        pair += 1;
      }
    });
  }

  onHandlerRegister(obj :{ bookmark: string ; element: HTMLElement;
     eventName: runnerEvents; cb: (event: Event) => boolean; enviroment: View}): boolean {
    const {bookmark, element, eventName, cb, enviroment } = obj;

    const functionBind = cb.bind(this);
    this.handlers[bookmark] = {
      element,
      eventName,
      functionBind,
      enviroment,
    };
    return true;
  }

  onHandlerDelete(bookmark: string): boolean | Error {
    if (bookmark in this.handlers) {
      delete this.handlers[bookmark];
      return true;
    }
    throw new Error('No such event handler was found');
  }


  onRunnerMouseDownHandler(event: Event | any): boolean {
    const targetElement = event.target as HTMLElement;

    targetElement.style.position = 'absolute';
    targetElement.style.zIndex = '1000';



    return true;
  }

  onRunnerMouseMoveHandler() {

  }

  onRunnerMouseUpHandler() {

  }

  onDragStartHandler() {

  }

  onTooltipMoveHandler() {

  }
}

type rules = {
  [property: string]: string | number
}

type runnerEvents = 'mousedown' | 'mousemove' | 'mouseup' | 'click' | 'dragstart';
