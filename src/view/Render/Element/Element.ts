import Render from '../Render';

export default class Element {
  parent: Render;

  draggable;


  getRunnerSize(obj: {runner: HTMLElement, vertical}):number {
    const {runner, vertical} = obj;
    let size;
    if (!vertical) {
      size = runner.offsetWidth;
    } else {
      size = runner.offsetHeight;
    }
    return size;
  }

  getRangeSize(obj : {parent, runner, vertical}) {
    const { parent, runner, vertical } = obj;
    return this.getRangePaddingBox({ parent, vertical }) - this.getRunnerSize({ runner, vertical });
  }

  getRangePaddingBox(obj: {parent, vertical}) {
    const { parent, vertical } = obj;
    let paddingBox;
    if (!vertical) {
      paddingBox = parent.offsetWidth - parent.clientLeft * 2;
    } else {
      paddingBox = parent.offsetHeight - parent.clientTop * 2;
    }
    return paddingBox;
  }

  getRunnerPosition(obj: {runner, vertical}) {
    const { runner, vertical } = obj;
    let position;
    if (!vertical) {
      position = parseInt(runner.style.left, 10);
    } else {
      position = parseInt(runner.style.top, 10);
    }
    return position;
  }

  pxToValue(obj: {boxSize, position}) {
    const { boxSize, position } = obj;
    const sum = Math.abs(this.parent.view.fetchModelProperty('minValue')) + Math.abs(this.parent.view.fetchModelProperty('maxValue'));
    return Math.ceil((sum / boxSize) * position);
  }

  minValueIsNegativeNumber(value) {
    const minValue = this.parent.view.fetchModelProperty('minValue');
    const VALUE = minValue < 0 ? value + minValue : value;
    return VALUE;
  }


  positionToValue(obj: { parent: HTMLElement, runner: HTMLElement, vertical: boolean, }):
    number {
    const { parent, runner, vertical } = obj;
    const RANGE_BORDER_BOX = this.getRangeSize({ parent, runner, vertical });
    const POSITION = this.getRunnerPosition({ runner, vertical });
    let VALUE = this.pxToValue({boxSize: RANGE_BORDER_BOX, position: POSITION});
    VALUE = this.minValueIsNegativeNumber(VALUE);
    return VALUE;
  }

  positionFromEnd(obj: { size: number, position: number}):number {
    const {
      size, position,
    } = obj;
    return ((size - position));
  }


  relativeRunnerPositionToPercents(obj: {parent, position, vertical }):number {
    const { parent, position: positionRelativeTolider, vertical } = obj;
    let sliderSize;
    let onePercentOfSliderSize;
    let positionInPercents;
    if (!vertical) {
      sliderSize = parent.offsetWidth - parent.clientLeft * 2 - this.draggable.offsetWidth;
      onePercentOfSliderSize = sliderSize / 100;
      positionInPercents = positionRelativeTolider / onePercentOfSliderSize;
    } else {
      sliderSize = parent.offsetHeight - parent.clientTop * 2 - this.draggable.offsetHeight;
      onePercentOfSliderSize = sliderSize / 100;
      positionInPercents = positionRelativeTolider / onePercentOfSliderSize;
    }
    // max position is [99.99999999999%];
    console.log( positionInPercents, 'asbs');
    return positionInPercents;
  }

  getSiblingProgress(obj: {parent: HTMLElement, pair: string, vertical}) {
    const { parent, pair, vertical } = obj;
    const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${pair}"]`);
    let coords = { progressStart: undefined, progressEnd: undefined };
    if (!vertical) {
      coords = {
        progressStart: siblings[0].getBoundingClientRect().right,
        progressEnd: siblings[1].getBoundingClientRect().left,
      };
    } else {
      coords = {
        progressStart: siblings[1].getBoundingClientRect().top,
        progressEnd: siblings[0].getBoundingClientRect().bottom,
      };
    }
    return coords;
  }

  getProgressSize(obj: {progressStart, progressEnd, vertical: boolean, parent?}) {
    const {progressStart, progressEnd, vertical, parent } = obj;
    let size;
    if (!vertical) {
      size = (progressEnd - progressStart) > 0 ? progressEnd - progressStart : 0;
    } else {
      size = Math.ceil(progressStart - progressEnd) > 0 ? Math.ceil(progressStart - progressEnd) : 0;
    }
    return size;
  }

  getProgressPosition(obj: {progressStart, parent, vertical}) {
    const { progressStart, parent, vertical} = obj;
    let position;
    if (!vertical) {
      position = progressStart - parent.offsetLeft - parent.clientLeft + window.pageXOffset;
    } else {
      position = progressStart - parent.offsetTop - parent.clientTop + window.pageYOffset;
    }
    return position;
  }
  
  onMoveProgress = (obj: {parent: HTMLElement, runner: HTMLElement, collision?: boolean, msg?: string}):void => {
    const { parent, runner: element, collision, msg } = obj;
    const { start, startAndEnd } = element.dataset;
    const siblingProgressNumber = element.dataset.pair;
    const progress = parent.querySelector(`.slider__progress[data-pair="${siblingProgressNumber}"]`) as HTMLElement;
    const vertical = this.parent.view.fetchModelProperty('vertical');
    if (collision) {
      progress.style.display = 'none';
    }
    if (!collision) {
      progress.style.display = 'block';
    }
    if (!vertical) {
      if (startAndEnd) {
        progress.style.width = `${element.getBoundingClientRect().left - parent.getBoundingClientRect().left}px`;
      } else if (start === 'true') {
        const { progressStart, progressEnd } = this.getSiblingProgress({ parent, pair: element.dataset.pair, vertical });
        progress.style.width = `${this.getProgressSize({ progressStart, progressEnd, vertical })}px`;
        progress.style.left = `${this.getProgressPosition({ progressStart, parent, vertical })}px`;
      } else {
        const { progressStart, progressEnd } = this.getSiblingProgress({ parent, pair: element.dataset.pair, vertical });
        progress.style.width = `${this.getProgressSize({ progressStart, progressEnd, vertical })}px`;
      }
    } else if (vertical) {
      if (startAndEnd) {
        progress.style.top = `${element.getBoundingClientRect().bottom
          - parent.offsetTop - parent.clientTop + window.pageYOffset}px`;
        progress.style.height = `${parent.offsetHeight + parent.offsetTop
          - parent.clientTop - element.getBoundingClientRect().bottom - window.pageYOffset}px`;
      } else if (start === 'true') {
        const { progressStart, progressEnd } = this.getSiblingProgress({ parent, pair: element.dataset.pair, vertical });
        progress.style.height = `${this.getProgressSize({ progressStart, progressEnd, vertical })}px`;
        progress.style.top = `${this.getProgressPosition({ progressStart: progressEnd, parent, vertical })}px`;
      } else {
        const { progressStart, progressEnd } = this.getSiblingProgress({ parent, pair: element.dataset.pair, vertical });
        const height = this.getProgressSize({ progressStart, progressEnd, vertical });
        progress.style.height = `${height}px`;
      }
    }
  }

}