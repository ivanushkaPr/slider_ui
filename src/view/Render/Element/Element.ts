export default class Element {
  parent;
  
  draggable;

  calculateRunnerPosition(obj: {parent, position, vertical }) {
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
  
  onMoveProgress = (obj: {parent: HTMLElement, runner: HTMLElement, collision?: boolean, msg?: string}) => {
    const { parent, runner: element, collision, msg } = obj;
    const { start, startAndEnd } = element.dataset;
    const siblingProgressNumber = element.dataset.pair;
    const progress = parent.querySelector(`.slider__progress[data-pair="${siblingProgressNumber}"]`) as HTMLElement;
    if (collision) {
      progress.style.display = 'none';
    }
    if (!collision) {
      progress.style.display = 'block';
    }
    if (!this.parent.view.fetchModelProperty('vertical')) {

      if (startAndEnd) {
        const width = element.getBoundingClientRect().left - parent.getBoundingClientRect().left;
        progress.style.width = `${width}px`;
      } else if (start === 'true') {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[0].getBoundingClientRect().right;
        const progressEnd = siblings[1].getBoundingClientRect().left;
        const width = (progressEnd - progressStart) > 0 ? progressEnd - progressStart : 0;
        const progressLeft = progressStart - parent.offsetLeft - parent.clientLeft;
        progress.style.width = `${width}px`;
        progress.style.left = `${progressLeft + window.pageXOffset}px`;
      } else {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[0].getBoundingClientRect().right;
        const progressEnd = siblings[1].getBoundingClientRect().left;
        const width = (progressEnd - progressStart) > 0 ? progressEnd - progressStart : 0;
        progress.style.width = `${width}px`;
      }

    } else if (this.parent.view.fetchModelProperty('vertical')) {

      if (startAndEnd) {
        const top = element.getBoundingClientRect().bottom
        - parent.offsetTop - parent.clientTop + window.pageYOffset;
        const height = parent.offsetHeight + parent.offsetTop
        - parent.clientTop - element.getBoundingClientRect().bottom - window.pageYOffset;
        progress.style.top = `${top}px`;
        progress.style.height = `${height}px`;
      } else if (start === 'true') {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[1].getBoundingClientRect().top;
        const progressEnd = siblings[0].getBoundingClientRect().bottom;
        const height = Math.ceil(progressStart - progressEnd + parent.clientTop) > 0
          ? Math.ceil(progressStart - progressEnd + parent.clientTop) : 0;
        progress.style.height = `${height - parent.clientTop}px`;
        progress.style.top = `${siblings[0].getBoundingClientRect().bottom - parent.offsetTop - parent.clientTop + window.pageYOffset}px`;
      } else {
        const siblingRunnerNumber = element.dataset.pair;
        const siblings = parent.querySelectorAll(`.slider__runner[data-pair="${siblingRunnerNumber}"]`);
        const progressStart = siblings[1].getBoundingClientRect().top;
        const progressEnd = siblings[0].getBoundingClientRect().bottom;
        const height = Math.ceil(progressStart - progressEnd + parent.clientTop) > 0
          ? Math.ceil(progressStart - progressEnd + parent.clientTop) : 0;
        progress.style.height = `${height - parent.clientTop}px`;
      }
    }
  }

}