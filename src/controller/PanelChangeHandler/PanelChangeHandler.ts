import Controller from '../controller';

export default class PanelChangeHandler {
  controller: Controller

  constructor(controller: Controller) {
    this.controller = controller;
  }

  changeFormHandler(e: Event):void {
    const targetNode = e.target as HTMLInputElement;
    if (targetNode.nodeName === 'INPUT' && targetNode.classList.contains('panel__input')) {
      const INPUT_TYPE = targetNode.getAttribute('type');
      if (targetNode.classList.contains('panel__input--positions')) {
        this.changeRunnersProperty({ input: targetNode });
      } else if (INPUT_TYPE === 'number') {
        this.changeNumberProperty({ input: targetNode });
      } else if (targetNode.id === 'panel') {
        this.changePanelVisibility({ input: targetNode });
      } else if (INPUT_TYPE === 'checkbox') {
        this.changeCheckboxProperty({ input: targetNode });
      } else if (INPUT_TYPE === 'text' && targetNode.id !== 'id') {
        this.changeUnitsProperty({ input: targetNode });
      } else if (INPUT_TYPE === 'text' && targetNode.id === 'id') {
        this.changeIDProperty({ input: targetNode });
      } else {
        throw new Error('No such input was expected');
      }
      this.controller.update();
    }
  }

  changeRunnersProperty(obj: {input:HTMLInputElement}):void {
    const { input: INPUT } = obj;
    const VALUE = +INPUT.value;
    const id = INPUT.id.slice(-1);
    const INDEX = +(id) - 1;
    const VALUE_IS_VALID = this.validateRunnersProperty({ index: INDEX, value: VALUE });
    if (VALUE_IS_VALID) {
      this.controller.setModelProperty({ property: 'runners', value: VALUE, index: INDEX });
    }
  }

  validateRunnersProperty(obj: {index: number, value: number}):boolean {
    const { index, value } = obj;
    const runners = this.controller.getModelProperty('runners');
    const prevRunnerposition = runners[index - 1];
    const nextRunnerPosition = runners[index + 1];
    const POSITION_INVALID = (prevRunnerposition === undefined && value < 0)
    || (nextRunnerPosition === undefined && value > 100)
    || (prevRunnerposition > value || nextRunnerPosition < value);
    if (POSITION_INVALID) {
      return false;
    }
    return true;
  }

  changeCheckboxProperty(obj: {input:HTMLInputElement}):void {
    const { input } = obj;
    const { checked } = input;
    const INPUT_NAME = input.getAttribute('name');
    this.controller.setModelProperty({ property: INPUT_NAME, value: checked });
  }

  changeNumberProperty(obj: {input:HTMLInputElement}): void {
    const { input } = obj;
    const VALUE = Number(input.value);
    if (input.id === 'minValue') {
      if (this.controller.getModelProperty('maxValue') > input.value) {
        this.controller.setModelProperty({ property: input.getAttribute('name'), value: Number(input.value) });
      }
    } else if (input.id === 'maxValue') {
      if (this.controller.getModelProperty('minValue') < input.value) {
        this.controller.setModelProperty({ property: input.getAttribute('name'), value: Number(input.value) });
      }
    } else if (input.id === 'steps') {
      if (VALUE <= 20) {
        this.controller.setModelProperty({ property: input.getAttribute('name'), value: Number(input.value) });
      }
    } else {
      throw new Error('Unexpected input');
    }
  }

  changeUnitsProperty(obj: {input: HTMLInputElement}):void {
    const { input } = obj;
    const INPUT_NAME = input.getAttribute('name');
    const INPUT_VALUE = (input as HTMLInputElement).value;
    this.controller.setModelProperty({ property: INPUT_NAME, value: String(INPUT_VALUE) });
  }

  changeIDProperty(obj: {input:HTMLInputElement}):void {
    const { input } = obj;
    const INPUT_VALUE = (input as HTMLInputElement).value;
    const INPUT_NAME = input.getAttribute('name');
    const CURRENT_ID = this.controller.getModelProperty('id');
    const PARENT = document.getElementById(INPUT_VALUE);
    if (INPUT_VALUE !== CURRENT_ID && PARENT) {
      const RANGE = PARENT.querySelector('.slider__range');
      const PANEL = PARENT.querySelector('.panel');
      PARENT.removeChild(RANGE);
      PARENT.removeChild(PANEL);
      this.controller.setModelProperty({ property: INPUT_NAME, value: INPUT_VALUE });
    }
  }

  changePanelVisibility(obj: {input:HTMLInputElement}):void {
    const { input } = obj;
    const { checked } = (input as HTMLInputElement);
    const CURRENT_ID = this.controller.getModelProperty('id');
    const PARENT = document.getElementById(CURRENT_ID);
    const PANEL = PARENT.querySelector('.panel') as HTMLElement;
    PANEL.style.display = 'none';
    const INPUT_NAME = input.getAttribute('name');
    this.controller.setModelProperty({ property: INPUT_NAME, value: checked });
  }
}