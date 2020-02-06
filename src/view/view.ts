export default class View {
  static createElement(nodeName: string, className: string) {
    const element = document.createElement(nodeName);
    element.classList.add(className);
    return element as HTMLElement;
  }

  static renderElement(element: HTMLElement, parentElement: HTMLElement): void {
    parentElement.appendChild(element);
    return undefined;
  }

  static setElementCss(element: HTMLElement, cssRules: rules): HTMLElement {
    const El = element;
    const Rules = Object.entries(cssRules);

    Rules.forEach((rule) => {
      const [prop, value] = rule;
      El.style[prop] = value;
    });
    return El;
  }

  static createRange(vertical: boolean = false): HTMLElement {
    const range = View.createElement('div', 'slider__range');
    if (vertical) {
      range.classList.add('slider__range--vertical');
    }
    else {
      range.classList.add('slider__range--horizontal');
    }
    return range;
  }

  static createRunner(): HTMLElement {
    const runner = View.createElement('div', 'slider__runner');
    return runner;
  }

  static createTooltip(): HTMLElement {
    const tooltip = View.createElement('div', 'slider__tooltip');
    return tooltip;
  }

  static createProgress(vertical: boolean) {
    const progress = View.createElement('div', 'slider__progress');
    if (vertical) {
      progress.classList.add('slider__progress--vertical');
      return progress;
    }
    progress.classList.add('slider__progress--horizontal');
    return progress;
  }

  static setPosition({ runner, runnerPosition, axis }:{ runner: HTMLElement; runnerPosition: number; axis: string; }): HTMLElement {
    const targetRunner = runner;
    targetRunner.style[axis] = `${runnerPosition}px`;
    return targetRunner;
  }

  static createAndSetRunnerPosition(obj: { runnerPosition: number, vertical: boolean}) {
    let runner = View.createRunner();

    const { runnerPosition, vertical } = obj;
    runner = View.setPosition({ runner, runnerPosition, axis: vertical === false ? 'left' : 'top' });
    return runner;
  }

  static createAndSetTooltipPosition(obj: { tooltipPosition: number, vertical: boolean}) {
    let runner = View.createTooltip();

    const { tooltipPosition, vertical } = obj;
    runner = View.setPosition({ runner, runnerPosition: tooltipPosition, axis: vertical === false ? 'left' : 'top' });
    return runner;
  }

  static createAndSetProgressPosition() {

  }


  static createSlider(obj: { runners: number[], vertical: boolean, id: string }) {
    const { runners, vertical, id } = obj;
    const range = View.createRange(vertical);
    if (vertical) {
      range.style.height = '300px';
    } else {
      range.style.width = '300px';
    }

    View.renderElement(range, document.getElementById(id));


    /*
    runners.forEach((runnerPosition: number, index) => {

      const runner = View.createAndSetRunnerPosition({runnerPosition, vertical});
      range.appendChild(runner);

      const tooltip = View.createAndSetTooltipPosition({tooltipPosition: runnerPosition, vertical});
      range.appendChild(tooltip);

      if (index % 2 === 0) {
        let progress = View.createProgress(vertical);
        progress = View.setPosition({ runner: progress, runnerPosition, axis: vertical === false ? 'left' : 'top' });
        range.appendChild(progress);
      }
    });
  
    */
  }

}

type rules = {
  [property: string]: string | number
}
