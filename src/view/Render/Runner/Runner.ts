import El from '../Element/Element';
import Render from '../Render.ts';
export default class Runner extends El {
  parent: Render;

  draggable;

  constructor(parent:Render) {
    super();
    this.parent = parent;
  }

  onRunnerMouseDownHandler = (event: MouseEvent): boolean => {
    // event.preventDefault();
    const targetElement = event.target as HTMLElement;

    targetElement.style.position = 'absolute';
    targetElement.style.zIndex = '1000';
    this.draggable = targetElement;

    this.parent.shiftX = event.clientX - targetElement.getBoundingClientRect().left;
    this.parent.shiftY = event.clientY - targetElement.getBoundingClientRect().top;
    this.parent.view.onHandlerRegister({
      bookmark: 'runnerMouseMove',
      element: document.body as HTMLElement,
      eventName: 'mousemove',
      cb: this.onRunnerMouseMoveHandler,
      enviroment: this,
    });

    this.parent.view.onHandlerRegister({
      bookmark: 'runnerMouseUp',
      element: document.body as HTMLElement,
      eventName: 'mouseup',
      cb: this.onRunnerMouseUpHandler,
      enviroment: this,
    });


    this.parent.view.onHandlerRegister({
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

    const vertical = this.parent.view.fetchModelProperty('vertical');

    let params;
    if (!vertical) {
      params = { point: pageX, element: this.draggable, vertical };
    } else {
      params = { point: pageY, element: this.draggable, vertical };
    }

    this.onMoveElementAtPoint(params);
    return true;
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



  runnerStepHandler(point):number {
    let smaller;
    let larger;
    let closestPoint;
    if (this.parent.view.fetchModelProperty('stepsOn')) {
      for (let breakpoint = 0; breakpoint < this.parent.breakpoints.length; breakpoint += 1) {
        if (this.parent.breakpoints[breakpoint] > point) {
          larger = this.parent.breakpoints[breakpoint];
          smaller = this.parent.breakpoints[breakpoint - 1];
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
      targetElement, pair, vertical,
    } = obj;

    let { nextPosition } = obj;

    if (!vertical) {
      nextPosition -= this.parent.shiftX;
    } else {
      nextPosition -= this.parent.shiftY;
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

  moveRunner(obj: {element, vertical, position}):void {
    const { element, vertical, position } = obj;
    if (!vertical) {
      element.style.left = `${position}px`;
    } else {
      element.style.top = `${position}px`;
    }
  }

  preventSiblingRunnerCollision(obj: {runner, parent, vertical, pos }):boolean {
    const { runner, parent, vertical, pos } = obj;
    const { pair, number, start } = runner.dataset;
    if (!vertical) {
      if (start === 'true') {
        const selector = `.slider__runner[data-number="${Number(number) - 1}"]`;
        const prevRunner = this.parent.range.querySelector(selector);
        if (prevRunner && pos <= prevRunner.offsetLeft + prevRunner.offsetWidth - prevRunner.clientLeft * 2) {
          runner.style.left = `${prevRunner.offsetLeft + 10}px`;
          return false;
        }
      } else {
        const selector = `.slider__runner[data-number="${Number(number) + 1}"]`;
        const nextRunner = this.parent.range.querySelector(selector);
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

  moveTooltipSibling(obj: {parent, runner, position, axis:string, vertical}):void {
    const {
      parent, runner, position, axis, vertical,
    } = obj;
    const tooltipSibling = parent.querySelector(`.slider__tooltip[data-runner-sibling="${runner.dataset.tooltipSibling}"]`) as HTMLElement;
    if (this.parent.view.fetchModelProperty('tooltips') === true) {
      tooltipSibling.classList.add('slider__tooltip--show');
    }
    tooltipSibling.style[axis] = `${position}px`;
    tooltipSibling.innerHTML = String(this.positionToValue({
      parent,
      runner,
      vertical,
    }));
  }



  onMoveElementAtPoint = (obj: {point: number; element: HTMLElement; vertical: boolean}):void => {
    const { point, element, vertical } = obj;
    const parent = element.parentNode as HTMLElement;
    const { firstPoint, secondPoint, relativePointPosition } = this.getSliderControlPoints({
      vertical, parent, point, element,
    });

    const { shiftX, shiftY } = this.parent;


    const runnerPosition = this.runnerStepHandler(relativePointPosition);
    console.log(runnerPosition, relativePointPosition);

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

    this.moveRunner({ element, vertical, position: RunnerPositionValidation});

    this.preventSiblingRunnerCollision({runner: element, parent, vertical, pos: RunnerPositionValidation });

    this.onMoveProgress({
      parent,
      runner: element,
      collision: collisionData.collision,
    });

    this.moveTooltipSibling({
      parent, runner: element, position: RunnerPositionValidation, axis: !vertical ? 'left' : 'top', vertical,
    });

    this.parent.view.setModelProperty({
      property: 'runners',
      value: Math.round(this.relativeRunnerPositionToPercents({
        parent,
        position: RunnerPositionValidation,
        vertical,
      })),
      index: this.draggable.dataset.number - 1,
    });

    this.parent.view.updateRunnerPosition({
      position: RunnerPositionValidation,
      index: this.draggable.dataset.number,
    });
  }

  onRunnerMouseUpHandler = ():boolean => {
    if (this.parent.view.fetchModelProperty('tooltips') === true) this.onTooltipHide(this.draggable);

    const { bookmark: mouseMoveBookmark } = this.parent.view.handlers.runnerMouseMove;
    this.parent.view.onHandlerDelete(mouseMoveBookmark);
    const { bookmark: mouseUpBookmark } = this.parent.view.handlers.runnerMouseUp;
    this.parent.view.onHandlerDelete(mouseUpBookmark);
    const { bookmark: dragStartBookmark } = this.parent.view.handlers.runnerDragStart;
    this.parent.view.onHandlerDelete(dragStartBookmark);
    this.draggable = null;
    return true;
  }

  onTooltipHide = (runner): void => {
    const parent = runner.offsetParent;
    const tooltipSibling = parent.querySelector(`.slider__tooltip[data-runner-sibling="${runner.dataset.tooltipSibling}"]`) as HTMLElement;
    tooltipSibling.classList.remove('slider__tooltip--show');
  }

  onDragStartHandler = (e):boolean => e.preventDefault();

  RenderSliderRunners(obj: {runners, slider, size, vertical, root}):void {
    const {
      runners, slider, vertical, root,
    } = obj;
    runners.forEach((runnerPosition: number) => {
      const position = runnerPosition;
      const runner = this.createRunner();
      slider.appendChild(runner);
      this.parent.runnersAr.push(runner);
      this.parent.setElementPosition({
        element: runner,
        position,
        axis: vertical === false ? 'left' : 'top',
        parent: slider,
      });
    });
    const runnersDOM = this.setRunnersDataAttributes(root);
    this.registerEventHandlers(runnersDOM);
  }

  createRunner():HTMLElement {
    const RUNNER_ELEMENT = document.createElement('div');
    RUNNER_ELEMENT.classList.add('slider__runner');
    return RUNNER_ELEMENT;
  }

  setRunnersDataAttributes(root):HTMLCollection {
    const elements = root.querySelectorAll('.slider__runner');
    const collection = elements;
    let pair = 1;

    if ((elements[0] as HTMLElement).classList.contains('slider__runner')) {
      collection.forEach((target, index, array) => {
        const HTMLrunner = target as HTMLElement;
        HTMLrunner.dataset.pair = String(pair);
        HTMLrunner.dataset.number = String(index + 1);
        if (array.length === 1) {
          HTMLrunner.dataset.startAndEnd = 'true';
        } else if (index % 2 === 0) {
          HTMLrunner.dataset.start = 'true';
        } else {
          HTMLrunner.dataset.start = 'false';
        }
        if (index % 2 === 1) {
          pair += 1;
        }

        HTMLrunner.dataset.tooltipSibling = String(index);
      });
    }
    return elements;
  }

  registerEventHandlers(runners):void {
    runners.forEach((runner) => {
      this.parent.view.onHandlerRegister({
        bookmark: 'runnerMouseDown',
        element: runner as HTMLElement,
        eventName: 'mousedown',
        cb: this.onRunnerMouseDownHandler,
        enviroment: this.parent,
      });
    });
  }
}