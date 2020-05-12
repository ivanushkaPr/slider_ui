import View from '../view.ts';

export default class Handler {
  view: View;

  draggable;

  constructor(view: View) {
    this.view = view;
  }

  onElementClickHandler = (event: MouseEvent):boolean => {
    let range;
    if (!this.draggable) {
      this.draggable = this.view.render.range.querySelector('.slider__runner');
    }
    if (document.elementFromPoint(event.pageX + this.draggable.offsetWidth / 2,
      event.pageY + this.draggable.offsetHeight / 2).classList.contains('slider__runner') === false) {
      if (this.view.controller.getModelProperty('stepsOn')) {
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

      this.view.setModelProperty({
        property: 'runners',
        value: this.calculateRunnerPosition({
          parent: this.view.render.range,
          position: click,
          vertical: this.view.fetchModelProperty('vertical'),
        }),
        index: this.draggable.dataset.number - 1,
      });

      this.view.updateRunnerPosition({
        position: click,
        index: this.draggable.dataset.number,
      });

      return true;
    }

    return false;
  }

  registerEventHandlers(runners) {
    runners.forEach((runner) => {
      this.view.onHandlerRegister({
        bookmark: 'runnerMouseDown',
        element: runner as HTMLElement,
        eventName: 'mousedown',
        cb: this.onRunnerMouseDownHandler,
        enviroment: this,
      });
    });
  }

  onRunnerMouseDownHandler = (event: MouseEvent): boolean => {
    // event.preventDefault();
    const targetElement = event.target as HTMLElement;

    targetElement.style.position = 'absolute';
    targetElement.style.zIndex = '1000';
    this.draggable = targetElement;

    this.view.shiftX = event.clientX - targetElement.getBoundingClientRect().left;
    this.view.shiftY = event.clientY - targetElement.getBoundingClientRect().top;


    this.view.onHandlerRegister({
      bookmark: 'runnerMouseMove',
      element: document.body as HTMLElement,
      eventName: 'mousemove',
      cb: this.onRunnerMouseMoveHandler,
      enviroment: this,
    });

    this.view.onHandlerRegister({
      bookmark: 'runnerMouseUp',
      element: document.body as HTMLElement,
      eventName: 'mouseup',
      cb: this.onRunnerMouseUpHandler,
      enviroment: this,
    });


    this.view.onHandlerRegister({
      bookmark: 'runnerDragStart',
      element: event.target as HTMLElement,
      eventName: 'dragstart',
      cb: this.onDragStartHandler,
      enviroment: this,
    });

    return true;
  }


  onRunnerMouseMoveHandler = (event: MouseEvent): boolean => {
    const { pageX, pageY } = event;

    const vertical = this.view.fetchModelProperty('vertical');

    let params;
    if (!vertical) {
      params = { point: pageX, element: this.draggable, vertical };
    } else {
      params = { point: pageY, element: this.draggable, vertical };
    }

    this.onMoveElementAtPoint(params);
    return true;
  }

  onMoveElementAtPoint = (obj: {point: number; element: HTMLElement; vertical: boolean}) => {
    const { point, element, vertical } = obj;
    const parent = element.parentNode as HTMLElement;
    const { firstPoint, secondPoint, relativePointPosition } = this.getSliderControlPoints({
      vertical, parent, point, element,
    });

    const runnerPosition = this.runnerStepHandler(relativePointPosition);


    const collisionData = this.onRunnersCollision({
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

    this.moveRunner({ element, vertical, position: RunnerPositionValidation });

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

  onRunnersCollision(obj: {
    targetElement: HTMLElement,
    pair: string,
    nextPosition: number,
    vertical: boolean
  }) {
    const {
      targetElement, pair, nextPosition, vertical,
    } = obj;
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

  onMoveProgress = (obj: {parent: HTMLElement, runner: HTMLElement, collision?: boolean}) => {
    const { parent, runner: element, collision } = obj;
    const { start, startAndEnd } = this.draggable.dataset;
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

  onRunnerMouseUpHandler = () => {
    if (this.view.fetchModelProperty('tooltips') === true) this.onTooltipHide(this.draggable);

    const { bookmark: mouseMoveBookmark } = this.view.handlers.runnerMouseMove;
    this.view.onHandlerDelete(mouseMoveBookmark);
    const { bookmark: mouseUpBookmark } = this.view.handlers.runnerMouseUp;
    this.view.onHandlerDelete(mouseUpBookmark);
    const { bookmark: dragStartBookmark } = this.view.handlers.runnerDragStart;
    this.view.onHandlerDelete(dragStartBookmark);
    return true;
  }

  onTooltipHide = (runner) => {
    const parent = runner.offsetParent;
    const tooltipSibling = parent.querySelector(`.slider__tooltip[data-runner-sibling="${runner.dataset.tooltipSibling}"]`) as HTMLElement;
    tooltipSibling.classList.remove('slider__tooltip--show');
  }

  onDragStartHandler = () => false

  onScaleResizeHandler() {
    const id = this.view.fetchModelProperty('id');
    const parentNode = document.getElementById(id);
    parentNode.querySelector('slider__ruler').remove();
    this.view.render.createScales({ parentNode, vertical: this.view.fetchModelProperty('vertical') });
    return true;
  }
}
