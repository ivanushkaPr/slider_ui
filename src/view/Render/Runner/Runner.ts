import El from '../Element/Element';

export default class Runner extends El {
  parent;

  constructor(parent) {
    super();
    this.parent = parent;
  }

  onRunnerMouseDownHandler = (event: MouseEvent): boolean => {
    // event.preventDefault();
    const targetElement = event.target as HTMLElement;

    targetElement.style.position = 'absolute';
    targetElement.style.zIndex = '1000';
    this.parent.view.handler.draggable = targetElement;

    this.parent.view.shiftX = event.clientX - targetElement.getBoundingClientRect().left;
    this.parent.view.shiftY = event.clientY - targetElement.getBoundingClientRect().top;
    this.parent.view.onHandlerRegister({
      bookmark: 'runnerMouseMove',
      element: document.body as HTMLElement,
      eventName: 'mousemove',
      cb: this.onRunnerMouseMoveHandler,
      enviroment: this.parent.view.handler,
    });

    this.parent.view.onHandlerRegister({
      bookmark: 'runnerMouseUp',
      element: document.body as HTMLElement,
      eventName: 'mouseup',
      cb: this.parent.view.handler.onRunnerMouseUpHandler,
      enviroment: this.parent.view.handler,
    });


    this.parent.view.onHandlerRegister({
      bookmark: 'runnerDragStart',
      element: event.target as HTMLElement,
      eventName: 'dragstart',
      cb: this.parent.view.handler.onDragStartHandler,
      enviroment: this.parent.view.handler,
    });

    return true;
  }

  onRunnerMouseMoveHandler = (event: MouseEvent): boolean => {
    const { pageX, pageY } = event;

    const vertical = this.parent.view.fetchModelProperty('vertical');

    let params;
    if (!vertical) {
      params = { point: pageX, element: this.parent.view.handler.draggable, vertical };
    } else {
      params = { point: pageY, element: this.parent.view.handler.draggable, vertical };
    }

    this.parent.view.handler.onMoveElementAtPoint(params);
    return true;
  }


  runnerStepHandler(point) {
    let smaller;
    let larger;
    let closestPoint;
    if (this.parent.view.fetchModelProperty('stepsOn')) {
      for (let breakpoint = 0; breakpoint < this.parent.view.breakpoints.length; breakpoint += 1) {
        if (this.parent.view.breakpoints[breakpoint] > point) {
          larger = this.parent.view.breakpoints[breakpoint];
          smaller = this.parent.view.breakpoints[breakpoint - 1];
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

    if(!vertical) {
      nextPosition -= this.parent.view.shiftX;
    } else {
      nextPosition -= this.parent.view.shiftY;
    }
    const siblings = this.parent.view.handler.getSiblingRunners({ runner: targetElement, pair });

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

  RenderSliderRunners(obj: {runners, slider, size, vertical, root}) {
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

  createRunner(): HTMLElement {
    const RUNNER_ELEMENT = document.createElement('div');
    RUNNER_ELEMENT.classList.add('slider__runner');
    return RUNNER_ELEMENT;
  }

  setRunnersDataAttributes(root) {
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

  registerEventHandlers(runners) {
    runners.forEach((runner) => {
      this.parent.view.onHandlerRegister({
        bookmark: 'runnerMouseDown',
        element: runner as HTMLElement,
        eventName: 'mousedown',
        cb: this.onRunnerMouseDownHandler,
        enviroment: this.parent.view.handler,
      });
    });
  }
}