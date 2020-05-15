export default class Tooltip {
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

  renderSliderTooltip(obj: {position, vertical, slider, root}) {
    const { position, vertical, slider, root } = obj;

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

    this.setTooltipDataAttributes(root);
  }

  setTooltipDataAttributes(root) {
    const collection = root.querySelectorAll('.slider__tooltip');

    collection.forEach((target, index) => {
      const HTMLtooltip = target as HTMLElement;
      HTMLtooltip.dataset.runnerSibling = String(index);
    });
  }
}