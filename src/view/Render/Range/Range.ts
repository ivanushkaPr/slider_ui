export default class Range {
  range;

  constructor(range) {
    this.range = range;
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
    const IS_VERTICAL = this.range.view.fetchModelProperty('vertical');
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
}