import View from '../view.ts';

export default class Handler {
  view: View;

  draggable;

  constructor(view: View) {
    this.view = view;
  }

  onMoveElementAtPoint = (obj: {point: number; element: HTMLElement; vertical: boolean}) => {
    const { point, element, vertical } = obj;
    const parent = element.parentNode as HTMLElement;
    const { firstPoint, secondPoint, relativePointPosition } = this.getSliderControlPoints({
      vertical, parent, point, element,
    });

    const { shiftX, shiftY } = this.view;


    const runnerPosition = this.view.render.runnerClass.runnerStepHandler(relativePointPosition);


    const collisionData = this.view.render.runnerClass.onRunnersCollision({
      targetElement: element,
      pair: element.dataset.pair,
      nextPosition: runnerPosition,
      vertical,
    });

    const RunnerPositionValidation = this.onRestrictDrag({
      firstPointPosition: firstPoint,
      secondPointPosition: secondPoint,
      beforeFirstPoint: firstPoint > collisionData.coords,
      afterSecondPoint: secondPoint < collisionData.coords,
      position: collisionData.coords,
    });

    this.moveRunner({ element, vertical, position: RunnerPositionValidation});

    this.preventSiblingRunnerCollision({runner: element, parent, vertical, pos: RunnerPositionValidation});
    this.onMoveProgress({
      parent,
      runner: element,
      collision: collisionData.collision,
    });

    this.moveTooltipSibling({
      parent, runner: element, position: RunnerPositionValidation, axis: !vertical ? 'left' : 'top', vertical,
    });

    this.view.setModelProperty({
      property: 'runners',
      value: Math.round(this.calculateRunnerPosition({
        parent,
        position: RunnerPositionValidation,
        vertical,
      })),
      index: this.draggable.dataset.number - 1,
    });

    this.view.updateRunnerPosition({
      position: RunnerPositionValidation,
      index: this.draggable.dataset.number,
    });
  }

  getSliderControlPoints(obj: {vertical, parent, point, element}) {
    const {
      vertical, parent, point, element,
    } = obj;

    type controlPoints = {
      firstPoint: number,
      secondPoint: number,
      relativePointPosition: number
    }

    const CONTROL_POINTS: controlPoints = {
      firstPoint: 0,
      secondPoint: undefined,
      relativePointPosition: undefined,
    };

    if (!vertical) {
      CONTROL_POINTS.secondPoint = parent.getBoundingClientRect().width
      - parent.clientLeft * 2 - element.offsetWidth;
      CONTROL_POINTS.relativePointPosition = point
      - parent.getBoundingClientRect().left - window.pageXOffset;
    } else {
      CONTROL_POINTS.secondPoint = parent.getBoundingClientRect().height
      - parent.clientTop * 2 - element.offsetHeight;
      CONTROL_POINTS.relativePointPosition = point
      - parent.getBoundingClientRect().top - window.pageYOffset;
    }
    return CONTROL_POINTS;
  }

  preventSiblingRunnerCollision(obj: {runner, parent, vertical, pos,}) {
    const { runner, parent, vertical, pos } = obj;
    console.log(pos);
    const {pair, number, start } = runner.dataset;
    if (!vertical) {
      if (start === 'true') {
        const selector = `.slider__runner[data-number="${Number(number) - 1}"]`;
        const prevRunner = this.view.render.range.querySelector(selector);
        if (prevRunner && pos <= prevRunner.offsetLeft + prevRunner.offsetWidth - prevRunner.clientLeft * 2) {
          runner.style.left = `${prevRunner.offsetLeft + 10}px`;
          return false;
        }
      } else {
        const selector = `.slider__runner[data-number="${Number(number) + 1}"]`;
        const nextRunner = this.view.render.range.querySelector(selector);
        if (nextRunner && pos >= nextRunner.offsetLeft - nextRunner.offsetWidth - nextRunner.clientLeft * 2) {
          runner.style.left = `${nextRunner.offsetLeft - 10}px`;
          return false;
        }
      }
    } else {
      if(start === 'true') {

      } else {

      }
    }
    return true;
  }

  /*
  runnerStepHandler(point) {
    let smaller;
    let larger;
    let closestPoint;
    if (this.view.fetchModelProperty('stepsOn')) {
      for (let breakpoint = 0; breakpoint < this.view.breakpoints.length; breakpoint += 1) {
        if (this.view.breakpoints[breakpoint] > point) {
          larger = this.view.breakpoints[breakpoint];
          smaller = this.view.breakpoints[breakpoint - 1];
          break;
        }
      }
      if (larger === undefined) {
        closestPoint = smaller;
      } else if (smaller === undefined) {
        closestPoint = larger;
      } else if (larger !== undefined && smaller !== undefined) {
        const distanceToLeft = point - smaller;
        const distanceToRight = larger - point;
        if (distanceToLeft < distanceToRight) {
          closestPoint = smaller;
        } else {
          closestPoint = larger;
        }
      }
    } else {
      closestPoint = point;
    }
    return closestPoint;
  }
  */
/*
  onRunnersCollision(obj: {
    targetElement: HTMLElement,
    pair: string,
    nextPosition: number,
    vertical: boolean
  }) {
    const {
      targetElement, pair, vertical,
    } = obj;

    let { nextPosition } = obj;

    if(!vertical) {
      nextPosition -= this.view.shiftX;
    } else {
      nextPosition -= this.view.shiftY;
    }
    const siblings = this.getSiblingRunners({ runner: targetElement, pair });

    const answer = {
      coords: 0,
      collision: false,
    };

    if (!vertical) {
      const dataStart = targetElement.dataset.start;
      if (!dataStart) {
        answer.coords = nextPosition;
        answer.collision = false;
      }

      if (dataStart === 'true') {
        const brother = siblings[1] as HTMLElement;
        const brotherLeftSide = parseInt(brother.style.left, 10);
        if (brotherLeftSide <= nextPosition) {
          targetElement.style.zIndex = '9999';
          answer.coords = brotherLeftSide;
          answer.collision = true;
        } else {
          targetElement.style.zIndex = 'auto';
          answer.coords = nextPosition;
          answer.collision = false;
        }
      }

      if (dataStart === 'false') {
        const brother = siblings[0] as HTMLElement;
        const brotherLeftSide = parseInt(brother.style.left, 10);
        if (brotherLeftSide >= nextPosition) {
          targetElement.style.zIndex = '9999';
          answer.coords = brotherLeftSide;
          answer.collision = true;
        } else {
          targetElement.style.zIndex = 'auto';
          answer.coords = nextPosition;
          answer.collision = false;
        }
      }
    } else {
      const dataStart = targetElement.dataset.start;

      if (!dataStart) {
        answer.coords = nextPosition;
        answer.collision = false;
      }
      if (dataStart === 'true') {
        const brother = siblings[1] as HTMLElement;
        const brotherTopSide = parseInt(brother.style.top, 10);
        if (brotherTopSide <= nextPosition) {
          targetElement.style.zIndex = '9999';
          answer.coords = brotherTopSide;
          answer.collision = true;
        } else {
          targetElement.style.zIndex = 'auto';
          answer.coords = nextPosition;
          answer.collision = false;
        }
      }

      if (dataStart === 'false') {
        const brother = siblings[0] as HTMLElement;
        const brotherTopSide = parseInt(brother.style.top, 10);
        if (brotherTopSide >= nextPosition) {
          targetElement.style.zIndex = '9999';
          answer.coords = brotherTopSide;
          answer.collision = true;
        } else {
          targetElement.style.zIndex = 'auto';
          answer.coords = nextPosition;
          answer.collision = false;
        }
      }
    }
    return answer;
  }

  */
  getSiblingRunners(obj: {runner: HTMLElement, pair: string}): NodeList {
    const { runner, pair } = obj;
    const selector = `.slider__runner[data-pair="${pair}"]`;
    const siblings = runner.parentNode.querySelectorAll(selector);
    return siblings;
  }

  onRestrictDrag(obj: {
    firstPointPosition: number;
    secondPointPosition: number;
    beforeFirstPoint: boolean;
    afterSecondPoint: boolean;
    position: number
  }): number {
    const {
      firstPointPosition, secondPointPosition, beforeFirstPoint, afterSecondPoint, position,
    } = obj;
    let point;
    if (beforeFirstPoint) {
      point = firstPointPosition;
    } else if (afterSecondPoint) {
      point = secondPointPosition;
    } else {
      point = position;
    }
    return point;
  }

  moveRunner(obj: {element, vertical, position}) {
    const { element, vertical, position } = obj;
    if (!vertical) {
      element.style.left = `${position}px`;
    } else {
      element.style.top = `${position}px`;
    }
  }

  getStartAndEndPoint(sibling) {
    
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
    if (!this.view.fetchModelProperty('vertical')) {

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

    } else if (this.view.fetchModelProperty('vertical')) {

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

  moveTooltipSibling(obj: {parent, runner, position, axis:string, vertical}) {
    const {
      parent, runner, position, axis, vertical,
    } = obj;
    const tooltipSibling = parent.querySelector(`.slider__tooltip[data-runner-sibling="${runner.dataset.tooltipSibling}"]`) as HTMLElement;
    if (this.view.fetchModelProperty('tooltips') === true) {
      tooltipSibling.classList.add('slider__tooltip--show');
    }
    tooltipSibling.style[axis] = `${position}px`;
    tooltipSibling.innerHTML = String(this.view.positionToValue({
      parent,
      runner,
      vertical,
    }));
  }

  onRunnerMouseUpHandler = () => {
    if (this.view.fetchModelProperty('tooltips') === true) this.onTooltipHide(this.draggable);

    const { bookmark: mouseMoveBookmark } = this.view.handlers.runnerMouseMove;
    this.view.onHandlerDelete(mouseMoveBookmark);
    const { bookmark: mouseUpBookmark } = this.view.handlers.runnerMouseUp;
    this.view.onHandlerDelete(mouseUpBookmark);
    const { bookmark: dragStartBookmark } = this.view.handlers.runnerDragStart;
    this.view.onHandlerDelete(dragStartBookmark);
    this.draggable = null;
    return true;
  }

  onTooltipHide = (runner) => {
    const parent = runner.offsetParent;
    const tooltipSibling = parent.querySelector(`.slider__tooltip[data-runner-sibling="${runner.dataset.tooltipSibling}"]`) as HTMLElement;
    tooltipSibling.classList.remove('slider__tooltip--show');
  }

  onDragStartHandler = (e) => e.preventDefault();

  onScaleResizeHandler() {
    /*
    const id = this.view.fetchModelProperty('id');
    const parentNode = document.getElementById(id);
    parentNode.querySelector('slider__ruler').remove();
    this.view.render.createScales({ parentNode, vertical: this.view.fetchModelProperty('vertical') });
    return true;
  */
  }

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
}