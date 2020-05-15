import El from '../Element/Element';

export default class Scale extends El {
  parent;

  constructor(parent) {
    super();
    this.parent = parent;
  }

  onElementClickHandler = (event: MouseEvent) => {
    
    let range;
    if (!this.draggable) {
      this.draggable = this.parent.range.querySelector('.slider__runner');
      if (document.elementFromPoint(event.pageX,
        event.pageY).classList.contains('slider__scale')) {

        const scale = (event.target) as HTMLElement;
        range = scale.parentNode.parentNode as HTMLElement;

        const runners = range.querySelectorAll('.slider__runner');
        let runnerSize;
        let click;
        if (!this.parent.view.fetchModelProperty('vertical')) {
          runnerSize = (runners[0] as HTMLElement).offsetWidth;
          click = event.pageX - range.offsetLeft - range.clientLeft;
        } else {
          // Vertical scenario
          runnerSize = (runners[0] as HTMLElement).offsetWidth;
          click = event.pageY - range.offsetTop - range.clientTop;
        }

        let prevDiff = 10000;
        let index;
        runners.forEach((runner, i) => {
          let pos;
          if (!this.parent.view.fetchModelProperty('vertical')) {
            pos = parseInt((runner as HTMLElement).style.left, 10);
          } else {
            pos = parseInt((runner as HTMLElement).style.top, 10);
          }


          const diff = Math.abs(click - pos);
          if (diff < prevDiff) {
            prevDiff = diff;
            index = i;
          }
        });

        const runner = runners[index] as HTMLElement;
        click -= runnerSize / 2;

        if (!this.parent.view.fetchModelProperty('vertical')) {
          runner.style.left = `${click}px`;
        } else {
          runner.style.top = `${click}px`;
        }
        this.draggable = runner;
        this.onMoveProgress({ parent: range, runner, collision: false });

        this.parent.view.setModelProperty({
          property: 'runners',
          value: this.calculateRunnerPosition({
            parent: this.parent.range,
            position: click,
            vertical: this.parent.view.fetchModelProperty('vertical'),
          }),
          index: this.draggable.dataset.number - 1,
        });

        this.parent.view.updateRunnerPosition({
          position: click,
          index: this.draggable.dataset.number,
        });
        this.draggable = undefined;
        return true;
      }
      this.draggable = undefined;
      return false;
    }
  }

  createScales(obj: {parentNode: HTMLElement, vertical: boolean}) {
    const { parentNode, vertical } = obj;
    const breakpoints = [...this.parent.view.breakpoints];
    const slider = parentNode.querySelector('.slider__range');
    const ruler = document.createElement('div');
    const classNames = vertical === false ? 'slider__ruler slider__ruler--margin-top' : 'slider__ruler slider__ruler--margin-left';
    ruler.className = `${classNames}`;


    slider.appendChild(ruler);
    const mods = vertical === false ? 'slider__scale--horizontal' : 'slider__scale--vertical';
    breakpoints.forEach((breakpoint: number, index, array) => {
      const scale: HTMLDivElement = this.createScale({ mods });
      this.setScalePosition({ scale, vertical, breakpoint });
      if (index === 0) {
        const classes = vertical === false ? 'scale__value scale__value--start-horizontal' : 'scale__value scale__value--start-vertical';
        const textNode = this.parent.createElement('p', classes);
        const value = document.createTextNode(this.parent.view.fetchModelProperty('minValue'));
        textNode.appendChild(value);
        ruler.appendChild(textNode);
      } else if (index === array.length - 1) {
        const classes = vertical === false ? 'scale__value scale__value--end-horizontal' : 'scale__value scale__value--end-vertical';
        const textNode = this.parent.createElement('p', classes);
        const value = document.createTextNode(this.parent.view.fetchModelProperty('maxValue'));
        textNode.appendChild(value);
        ruler.appendChild(textNode);
      }
      this.parent.view.onHandlerRegister({
        bookmark: 'elementMouseDown',
        element: scale as HTMLElement,
        eventName: 'mousedown',
        cb: this.onElementClickHandler,
        enviroment: this,
      });
      this.createMediumScale({
        start: array[index], end: array[index + 1], parent: ruler, vertical, index, array,
      });
      ruler.appendChild(scale);
    });
  }

  createScale(obj: {mods}) {
    const { mods } = obj;

    const div = document.createElement('div');
    div.className = `slider__scale ${mods}`;
    return div;
  }

  setScalePosition(obj: {scale:HTMLDivElement, vertical: boolean, breakpoint: number}) {
    const { scale, vertical, breakpoint } = obj;
    scale.style.position = 'absolute';
    const leftOrTop = vertical === false ? 'left' : 'top';
    scale.style[leftOrTop] = `${breakpoint}px`;
  }

  createMediumScale(obj: {start, end, parent, vertical, index, array}) {
    const {
      start, end, parent, vertical, index, array,
    } = obj;
    const step = start + ((end - start) / 2);

    const mods = vertical === false ? 'slider__scale--horizontal slider__scale--horizontal-md'
      : 'slider__scale--vertical slider__scale--vertical-md';
    if (index < this.parent.view.breakpoints.length - 1) {
      const smallScale = this.createScale({ mods });
      this.setScalePosition({ scale: smallScale, vertical, breakpoint: step });
      parent.appendChild(smallScale);
      this.createSmallScales({
        start, end: step, parent, vertical, index, array,
      });
      this.createSmallScales({
        start: step, end, parent, vertical, index, array,
      });
    }
  }

  createSmallScales(obj: {start:number, end: number, parent, vertical, index, array}) {
    const {
      start, end, parent, vertical, index,
    } = obj;
    const mods = vertical === false ? 'slider__scale--horizontal slider__scale--horizontal-sm'
      : 'slider__scale--vertical slider__scale--vertical-sm';

    const step = (end - start) / 4;
    for (let i = 0; i <= 3; i += 1) {
      if (index < this.parent.view.breakpoints.length - 1) {
        const smallScale = this.createScale({ mods });
        this.setScalePosition({ scale: smallScale, vertical, breakpoint: step * i + start });
        parent.appendChild(smallScale);
      }
    }
  }

  onScaleResizeHandler() {
    /*
    const id = this.view.fetchModelProperty('id');
    const parentNode = document.getElementById(id);
    parentNode.querySelector('slider__ruler').remove();
    this.view.render.createScales({ parentNode, vertical: this.view.fetchModelProperty('vertical') });
    return true;
  */
  }
}
