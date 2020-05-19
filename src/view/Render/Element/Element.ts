import Render from '../Render';

export default class Element {
  parent: Render;

  draggable;

  positionToValue(obj: { parent: HTMLElement, runner: HTMLElement, vertical: boolean, }):
    number {
    const { parent, runner, vertical } = obj;

    const WIDTH = parent.offsetWidth - parent.clientLeft * 2 - runner.offsetWidth;
    const HEIGHT = parent.offsetHeight - parent.clientTop * 2 - runner.offsetHeight;
    const RANGE_BORDER_BOX = vertical === false ? WIDTH : HEIGHT;

    const LEFT = parseInt(runner.style.left, 10);
    const TOP = parseInt(runner.style.top, 10);
    const POSITION = vertical === false
      ? LEFT : this.positionFromEnd({ size: HEIGHT, position: TOP });
    const SUM = Math.abs(this.parent.view.fetchModelProperty('minValue')) + Math.abs(this.parent.view.fetchModelProperty('maxValue'));
    let VALUE = Math.ceil((SUM / RANGE_BORDER_BOX) * POSITION);

    const minValue = this.parent.view.fetchModelProperty('minValue');
    VALUE = minValue < 0 ? VALUE += minValue : VALUE;
    return VALUE;
  }

  positionFromEnd(obj: { size: number, position: number}):number {
    const {
      size, position,
    } = obj;
    return ((size - position));
  }


  calculateRunnerPosition(obj: {parent, position, vertical }):number {
    const { parent, position, vertical } = obj;
    let absolutePosition;
    if (!vertical) {
      absolutePosition = position
      / ((parent.offsetWidth - parent.clientLeft * 2 - this.draggable.offsetWidth)
      / 100);
    } else {
      absolutePosition = position
      / ((parent.offsetHeight - parent.clientTop * 2 - this.draggable.offsetHeight)
      / 100);
    }
    return absolutePosition;
  }

  xxxOnmoveProgress() {
    
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
        const width = element.getBoundingClientRect().left - parent.getBoundingClientRect().left;
        progress.style.width = `${width}px`;
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
        const top = element.getBoundingClientRect().bottom
        - parent.offsetTop - parent.clientTop + window.pageYOffset;
        const height = parent.offsetHeight + parent.offsetTop
        - parent.clientTop - element.getBoundingClientRect().bottom - window.pageYOffset;
        progress.style.top = `${top}px`;
        progress.style.height = `${height}px`;
      } else if (start === 'true') {
        const { progressStart, progressEnd } = this.getSiblingProgress({ parent, pair: element.dataset.pair, vertical });
        const height = this.getProgressSize({ progressStart, progressEnd, vertical });
        progress.style.height = `${height}px`;
        progress.style.top = `${this.getProgressPosition({ progressStart: progressEnd, parent, vertical })}px`;
      } else {
        const { progressStart, progressEnd } = this.getSiblingProgress({ parent, pair: element.dataset.pair, vertical });
        const height = this.getProgressSize({ progressStart, progressEnd, vertical });
        progress.style.height = `${height}px`;
      }
    }
  }

}