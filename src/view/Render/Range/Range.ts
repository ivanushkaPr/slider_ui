import El from '../Element/Element';
import Render from '../Render';

export default class Range extends El {
  parent: Render;

  draggable;

  constructor(parent: Render) {
    super();
    this.parent = parent;
  }

  onElementClickHandler = (event: MouseEvent):boolean => {
    /*
    let range;
    if (!this.draggable) {
      this.draggable = this.parent.range.querySelector('.slider__runner');

      if (document.elementFromPoint(event.pageX,
        event.pageY).classList.contains('slider__runner') === false) {
        range = (event.currentTarget as HTMLElement);
        const runners = range.querySelectorAll('.slider__runner');
        
        let runnerSize;
        let click;
        if (!this.parent.view.fetchModelProperty('vertical')) {
          runnerSize = (runners[0] as HTMLElement).offsetWidth;
          click = event.pageX - range.offsetLeft - range.clientLeft;
        } else {
          // Vertical scenario
          runnerSize = (runners[0] as HTMLElement).offsetWidth;
          click = event.pageY - range.offsetTop - range.clientTop;
        }


        let prevDiff = 10000;
        let index;
        runners.forEach((runner, i) => {

          let pos;
          if (!this.parent.view.fetchModelProperty('vertical')) {
            pos = parseInt((runner as HTMLElement).style.left, 10);
          } else {
            pos = parseInt((runner as HTMLElement).style.top, 10);
          }

          const diff = Math.abs(click - pos);
          if (diff < prevDiff) {
            prevDiff = diff;
            index = i;
          }
        });

        const runner = runners[index] as HTMLElement;
         // click -= runnerSize / 2;
        if (runner.dataset.start === 'false') {
          console.log('end');
          click -= runnerSize;
        } else {
          
        }

        if(!this.parent.view.fetchModelProperty('vertical')) {
          runner.style.left = `${click}px`;
        } else {
          runner.style.top = `${click}px`;
        }
        
        this.draggable = runner;
        this.onMoveProgress({ parent: range, runner, collision: false });

        this.parent.view.setModelProperty({
          property: 'runners',
          value: this.relativeRunnerPositionToPercents({
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
      this.draggable = undefined;
      return false;
    }
    */
   return false;
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

  createRange():HTMLElement {
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
      eventName: 'click',
      cb: this.onElementClickHandler,
      enviroment: this,
    });
  }
}
