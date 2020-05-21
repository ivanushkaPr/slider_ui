import El from '../Element/Element';

import View from '../../view';

export default class Tooltip extends El {
  parent: View;

  constructor(parent: View) {
    super();
    this.parent = parent;
  }

  createTooltip(): HTMLElement {
    const TOOLTIP_ELEMENT = document.createElement('div');
    TOOLTIP_ELEMENT.classList.add('slider__tooltip');

    const SLIDER_IS_VERTICAL = this.parent.fetchModelProperty('vertical');
    if (!SLIDER_IS_VERTICAL) {
      TOOLTIP_ELEMENT.classList.add('slider__tooltip--horizontal');
    } else {
      TOOLTIP_ELEMENT.classList.add('slider__tooltip--vertical');
    }
    TOOLTIP_ELEMENT.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

 //   TOOLTIP_ELEMENT.innerHTML = String(position);

    return TOOLTIP_ELEMENT;
  }

  renderSliderTooltip(obj: {position, vertical, slider, root}):void {
    const { position, vertical, slider, root } = obj;

    position.forEach((pos, index)=> {
      const tooltip = this.createTooltip();
      this.parent.setElementPosition({
        element: tooltip,
        position: pos,
        axis: vertical === false ? 'left' : 'top',
        parent: slider,
        negative: vertical === false ? this.parent.runnerWidth : this.parent.runnerHeight,
      });
      const runner = this.parent.runnersAr[index];
      const tooltipPosition = this.positionToValue({
        parent: slider,
        runner,
        vertical,
      });

      tooltip.innerHTML = String(tooltipPosition);
      slider.appendChild(tooltip);
    });

    this.setTooltipDataAttributes(root);
  }

  setTooltipDataAttributes(root):void {
    const collection = root.querySelectorAll('.slider__tooltip');
    collection.forEach((target, index) => {
      const HTMLtooltip = target as HTMLElement;
      HTMLtooltip.dataset.runnerSibling = String(index);
    });
  }
}