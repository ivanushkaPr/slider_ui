/* eslint-disable */
import { Model, configuration } from '../model/model';
import View from '../view/view';
import PanelChangeHandler from './PanelChangeHandler/PanelChangeHandler';
import CreateForm from './CreateForm/CreateForm';
/* eslint-enable */

export default class Controller {
  model: Model

  view: View

  handler: PanelChangeHandler = new PanelChangeHandler(this);

  render: CreateForm;

  constructor(model: Model, view: View) {
    const controller = this;

    this.model = model;
    this.view = view;
    this.view.controller = controller;
    this.model.controller = controller;

    this.render = new CreateForm(this.handler, this);

    this.view.createSlider({
      runners: this.getModelProperty('runners'),
      vertical: this.getModelProperty('vertical'),
      id: this.getModelProperty('id'),
    });

    if (this.getModelProperty('panel')) this.render.configPanel({ show: this.getModelProperty('panel'), id: this.getModelProperty('id') });
  }

  removePanel():void {
    const isHided = !this.getModelProperty('panel');
    if (isHided) {
      const id = this.getModelProperty('id');
      const parentNode = document.getElementById(id);
      parentNode.querySelector('.panel').remove();
    }
  }

  update(): void {
    if (this.getModelProperty('panel')) {
      this.render.configPanel({ show: this.getModelProperty('panel'), id: this.getModelProperty('id') });
    }
    this.view.createSlider({
      runners: this.model.configuration.runners,
      vertical: this.model.configuration.vertical,
      id: this.model.configuration.id,
    });
  }

  setModelProperty(obj: {
    property: string; value: string | number | boolean; index?: number}): boolean {
    this.model.changeConfState(obj);
    return true;
  }

  getModelProperty(property) {
    const tProp = this.model.getConfState(property);
    return tProp;
  }

  setRunnerPosition(obj: {position: number, index: string}) {
    const { position, index } = obj;
    const root = document.getElementById(this.getModelProperty('id'));
    const input = root.querySelector(`#runners-${index}`) as HTMLInputElement;
    const range = root.querySelector('.slider__range') as HTMLElement;
  //  const runner = range.querySelector('.slider__runner') as HTMLElement;
    const BORDER_WIDTH = !this.getModelProperty('vertical') ? range.clientLeft : range.clientTop;

    const size = !this.getModelProperty('vertical') ? range.offsetWidth : range.offsetHeight;
    const sizeBorderBox = size - BORDER_WIDTH * 2;

    const abs = (position + 5) / (sizeBorderBox / 100);
    if (typeof position === 'number') {
      // eslint-disable-next-line no-self-compare
      if (abs === abs) {
        input.value = String(abs.toFixed(1));
      }
    }
  }

  getFullConfiguration():configuration {
    const CONFIGURATION_COPY = { ...this.model.configuration };
    return CONFIGURATION_COPY;
  }
}

type configurationPropertyName = 'minValue'|'maxValue'|'currentValue'|'steps'|'runners'|'stepsOn'|'vertical' |'invertRange' |'units' |'id'|'panel';
