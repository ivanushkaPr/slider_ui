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
}

type rules = {
  [property: string]: string | number
}
