
import View from '../../view';

export default class Progress {
  parent: View;

  constructor(parent: View) {
    this.parent = parent;
  }

  calculateProgressSize(obj: { progressStartPosition: number, progressEndPosition: number}):
  number {
    const { progressStartPosition, progressEndPosition } = obj;
    return progressEndPosition - progressStartPosition;
  }

  getProgressSize(obj: { vertical: string, parent: HTMLElement,
    firstRunner: Element, secondRunner?: Element
   }) {
    const {
      vertical, parent, firstRunner, secondRunner,
    } = obj;
   type styles = {
     position: number;
     size: number,
   };

   const progressGeometry: styles = {
     position: undefined,
     size: undefined,
   };

   const parentOffsetLeft = parent.offsetLeft + parent.clientLeft;
   if (!vertical) {
     if (secondRunner === undefined) {
       progressGeometry.position = parent.getBoundingClientRect().left
         - parent.offsetLeft + window.pageXOffset;
       const PROGRESS_START_POSITION = parent.getBoundingClientRect().left;
       const PROGESS_END_POSITION = firstRunner.getBoundingClientRect().left;

       progressGeometry.size = this.calculateProgressSize({
         progressStartPosition: PROGRESS_START_POSITION,
         progressEndPosition: PROGESS_END_POSITION,
       });
     } else {
       progressGeometry.position = firstRunner.getBoundingClientRect().right
             - parentOffsetLeft + window.pageXOffset;
       const PROGRESS_START_POSITION = firstRunner.getBoundingClientRect().right;
       const PROGRESS_END_POSITION = secondRunner.getBoundingClientRect().left
        + parent.clientLeft * 2;

       progressGeometry.size = this.calculateProgressSize({
         progressStartPosition: PROGRESS_START_POSITION,
         progressEndPosition: PROGRESS_END_POSITION,
       });
     }
   } else if (vertical) {
     if (secondRunner === undefined) {
       progressGeometry.position = parent.getBoundingClientRect().height
       - (parent.getBoundingClientRect().height + window.pageYOffset
       - firstRunner.getBoundingClientRect().bottom + parent.offsetTop + parent.clientTop);
       const PROGRESS_START_POSITION = firstRunner.getBoundingClientRect().bottom;
       const PROGRESS_END_POSITION = parent.getBoundingClientRect().bottom;

       progressGeometry.size = this.calculateProgressSize({
         progressStartPosition: PROGRESS_START_POSITION,
         progressEndPosition: PROGRESS_END_POSITION,
       });
     } else {
       progressGeometry.position = firstRunner.getBoundingClientRect().bottom - parent.offsetTop
       - parent.clientTop + window.pageYOffset;
       const PROGRESS_START_POSITION = firstRunner.getBoundingClientRect().bottom;
       const PROGRESS_END_POSITION = secondRunner.getBoundingClientRect().top
        + parent.clientTop * 2;

       progressGeometry.size = this.calculateProgressSize({
         progressStartPosition: PROGRESS_START_POSITION,
         progressEndPosition: PROGRESS_END_POSITION,
       });
     }
   }
   return progressGeometry;
  }

  renderProgress(obj: {runners: HTMLCollection; parent: HTMLElement; vertical: boolean}): void {
    const { runners, parent, vertical } = obj;
    let count = 1;
    for (let runner = 0; runner < runners.length; runner += 1) {
      if (runners.length === 1) {
        this.renderSingleProgressBar({
          vertical, parent, runners, pair: count,
        });
      } else if (runners.length % 2 === 0 && runner % 2 === 0) {
        this.renderMultipleProgressBars({
          vertical, parent, runners, index: runner, pair: count,
        });
        count += 1;
      } else if (runners.length % 2 !== 0) {
        throw new Error('Ammount of runners must be odd!');
      }
    }
  }

  renderSingleProgressBar(obj: {
    vertical,
    parent: HTMLElement,
    runners: HTMLCollection,
    pair: number
  }):void {
    const {
      vertical, parent, runners, pair,
    } = obj;
    const progress = this.createProgress();
    if (!vertical) {
      const {
        position, size,
      } = this.getProgressSize({ vertical, parent, firstRunner: runners[0] });
      this.setSize({ element: progress, property: 'width', value: `${size - parent.clientLeft}` });
      this.setPosition({
        element: progress, position, axis: 'left',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    } else {
      const {
        position,
        size,
      } = this.getProgressSize({ vertical, parent, firstRunner: runners[0] });
      this.setSize({ element: progress, property: 'height', value: `${size - parent.clientTop}` });
      this.setPosition({
        element: progress, position, axis: 'top',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    }
  }

  renderMultipleProgressBars(obj: {
    vertical,
    parent: HTMLElement,
    runners: HTMLCollection,
    index:number,
    pair: number,
  }):void {
    const {
      vertical,
      parent,
      runners,
      index,
      pair,
    } = obj;

    const progress = this.createProgress();

    if (!vertical) {
      const {
        position,
        size,
      } = this.getProgressSize({
        vertical,
        parent,
        firstRunner: runners[index],
        secondRunner: runners[index + 1],
      });
      this.setSize({ element: progress, property: 'width', value: `${size - parent.clientLeft}` });
      this.setPosition({
        element: progress, position, axis: 'left',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    } else {
      const { position, size } = this.getProgressSize({
        vertical,
        parent,
        firstRunner: runners[index],
        secondRunner: runners[index + 1],
      });

      this.setSize({ element: progress, property: 'height', value: `${size - parent.clientTop}` });
      this.setPosition({
        element: progress, position, axis: 'top',
      });
      progress.dataset.pair = pair.toString();
      parent.appendChild(progress);
    }
  }

  setSize(obj: {element: HTMLElement; property: string; value: string}):void {
    const { element, property, value } = obj;
    element.style[property] = `${Math.round(parseFloat(value))}px`;
    return undefined;
  }

  setPosition(obj: { element: HTMLElement; position: number; axis: string}):
  HTMLElement {
    const {
      element, position, axis,
    } = obj;
    const targetEl = element;
    targetEl.style[axis] = `${position}px`;
    return targetEl;
  }

  createProgress(): HTMLElement {
    const PROGRESS_ELEMENT = document.createElement('div');
    PROGRESS_ELEMENT.classList.add('slider__progress');
    const SLIDER_IS_VERTICAL = this.parent.fetchModelProperty('vertical');
    if (SLIDER_IS_VERTICAL) {
      PROGRESS_ELEMENT.classList.add('slider__progress--vertical');
    } else {
      PROGRESS_ELEMENT.classList.add('slider__progress--horizontal');
    }

    return PROGRESS_ELEMENT;
  }
}