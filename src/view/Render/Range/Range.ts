import El from '../Element/Element';

export default class Range extends El {
  parent;

  draggable;

  constructor(parent) {
    super();
    this.parent = parent;
  }

  onElementClickHandler = (event: MouseEvent):boolean => {
    let range;
    if (!this.draggable) {
      this.draggable = this.parent.range.querySelector('.slider__runner');
      if (document.elementFromPoint(event.pageX + this.draggable.offsetWidth / 2,
        event.pageY + this.draggable.offsetHeight / 2).classList.contains('slider__runner') === false) {
        if (this.parent.view.controller.getModelProperty('stepsOn')) {
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
        this.onMoveProgress({ parent: range, runner, collision: false });

        this.parent.view.setModelProperty({
          property: 'runners',
          value: this.calculateRunnerPosition({
            parent: this.parent.range,
            position: click,
            vertical: this.parent.view.fetchModelProperty('vertical'),
          }),
          index: this.draggable.dataset.number - 1,
        });

        this.parent.view.updateRunnerPosition({
          position: click,
          index: this.draggable.dataset.number,
        });
        this.draggable = undefined;
        return true;
      }
      return false;
    }
  }

  renderNewSlider(obj: {root: HTMLElement, id: string}):HTMLElement {
    const { root, id } = obj;
    this.removeSlider(root);
    const NEW_SLIDER = this.createRange();
    if (this.parent.view.controller.getModelProperty('stepsOn') === false) this.registerEventHandlers(NEW_SLIDER);
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

  registerEventHandlers(slider) {
    this.parent.view.onHandlerRegister({
      bookmark: 'elementMouseDown',
      element: slider as HTMLElement,
      eventName: 'mousedown',
      cb: this.onElementClickHandler,
      enviroment: this,
    });
  }
}
