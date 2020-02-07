export default class View {
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

  createProgress(vertical: boolean) {
    const progress = this.createElement('div', 'slider__progress');
    if (vertical) {
      progress.classList.add('slider__progress--vertical');
      return progress;
    }
    progress.classList.add('slider__progress--horizontal');
    return progress;
  }

  setPosition(obj: { element: HTMLElement; position: number; axis: string; }): HTMLElement {
    const { element, position, axis } = obj;
    const targetEl = element;
    targetEl.style[axis] = `${position}px`;
    return targetEl;
  }

  createAndSetRunnerPosition(obj: { runnerPosition: number, vertical: boolean}) {
    let runner = this.createRunner();

    const { runnerPosition, vertical } = obj;
    runner = this.setPosition({ element: runner, position: runnerPosition, axis: vertical === false ? 'left' : 'top' });
    return runner;
  }

  createAndSetTooltipPosition(obj: { tooltipPosition: number, vertical: boolean}) {
    let runner = this.createTooltip();

    const { tooltipPosition, vertical } = obj;
    runner = this.setPosition({ element: runner, position: tooltipPosition, axis: vertical === false ? 'left' : 'top' });
    return runner;
  }

  createAndSetProgressPosition() {

  }

  positionFromEnd(obj: {size: number, position: number}) {
    const {
      size, position,
    } = obj;
    return size - position;
  }

  createAndSetElementPosition(obj: {position: number; vertical: boolean; callback: string, parent: HTMLElement}): boolean {
    const {
      position, vertical, callback, parent,
    } = obj;
    const elem = this.setPosition({ element: this[callback](), position, axis: vertical === false ? 'left' : 'top' });
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
    let numHeight;
    if (vertical) {
      const sliderParent = document.getElementById(id);
      const rangeInstance = sliderParent.querySelector('.slider__range') as HTMLElement;
      const { height } = rangeInstance.style;
      numHeight = parseInt(height, 10);
    }

    runners.forEach((runnerPosition: number, index) => {
      this.createAndSetElementPosition({ position: runnerPosition, vertical, callback: 'createRunner', parent: range });
      this.createAndSetElementPosition({ position: runnerPosition, vertical, callback: 'createTooltip', parent: range });
      if (index % 2 === 0) {
        this.createAndSetElementPosition({ position: runnerPosition, vertical, callback: 'createProgress', parent: range });
      }
    });
  }
}

type rules = {
  [property: string]: string | number
}
