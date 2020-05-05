/* eslint-disable */
import { Model, configuration } from '../model/model';
import View from '../view/view';


/* eslint-enable */

export default class Controller {
  model: Model

  view: View

  constructor(model: Model, view: View) {
    const controller = this;

    this.model = model;
    this.view = view;

    this.view.controller = controller;
    this.model.controller = controller;

    this.view.createSlider({
      runners: this.getModelProperty('runners'),
      vertical: this.getModelProperty('vertical'),
      id: this.getModelProperty('id'),
    });

    if (this.getModelProperty('panel')) this.renderConfigPanel({ show: this.getModelProperty('panel'), id: this.getModelProperty('id') });
  }

  changeRunnersProperty(obj: {input}):void {
    const { input: INPUT } = obj;
    const VALUE = +INPUT.value;
    const INDEX = +(INPUT.id.slice(-1) - 1);
    const VALUE_IS_VALID = this.validateRunnersProperty({ index: INDEX, value: VALUE });
    if (VALUE_IS_VALID) {
      this.setModelProperty({ property: 'runners', value: VALUE, index: INDEX });
    }
  }

  validateRunnersProperty(obj: {index, value}) {
    const { index, value } = obj;
    const runners = this.getModelProperty('runners');
    const prevRunnerposition = runners[index - 1];
    const nextRunnerPosition = runners[index + 1];
    if (prevRunnerposition > value || nextRunnerPosition < value) {
      return false;
    }
    return true;
  }

  changeCheckboxProperty(obj: {input}) {
    const { input } = obj;
    const { checked } = (input as HTMLInputElement);
    const INPUT_NAME = input.getAttribute('name');
    this.setModelProperty({ property: INPUT_NAME, value: checked });
  }

  changeNumberProperty(obj: {input}) {
    const { input } = obj;

    if (input.id === 'minValue') {
      if (this.getModelProperty('maxValue') > input.value) {
        this.setModelProperty({ property: input.getAttribute('name'), value: Number(input.value) });
      }
    } else if (input.id === 'maxValue') {
      if (this.getModelProperty('minValue') < input.value) {
        this.setModelProperty({ property: input.getAttribute('name'), value: Number(input.value) });
      }
    } else if (input.id === 'steps') {
      if (input.value <= 20) {
        this.setModelProperty({ property: input.getAttribute('name'), value: Number(input.value) });
      }
    } else {
      throw new Error('Unexpected input');
    }
  }

  changeUnitsProperty(obj: {input}) {
    const { input } = obj;
    const INPUT_NAME = input.getAttribute('name');
    const INPUT_VALUE = (input as HTMLInputElement).value;
    this.setModelProperty({ property: INPUT_NAME, value: String(INPUT_VALUE) });
  }

  changeIDProperty(obj: {input}) {
    const { input } = obj;
    const INPUT_VALUE = (input as HTMLInputElement).value;
    const INPUT_NAME = input.getAttribute('name');
    const CURRENT_ID = this.getModelProperty('id');
    const PARENT = document.getElementById(INPUT_VALUE);
    if (INPUT_VALUE !== CURRENT_ID && PARENT) {
      const RANGE = PARENT.querySelector('.slider__range');
      const PANEL = PARENT.querySelector('.panel');
      PARENT.removeChild(RANGE);
      PARENT.removeChild(PANEL);
      this.setModelProperty({ property: INPUT_NAME, value: INPUT_VALUE });
    }
  }


  changePanelVisibility(obj: {input}) {
    const { input } = obj;
    const { checked } = (input as HTMLInputElement);
    const CURRENT_ID = this.getModelProperty('id');
    const PARENT = document.getElementById(CURRENT_ID);
    const PANEL = PARENT.querySelector('.panel') as HTMLElement;
    PANEL.style.display = 'none';
    const INPUT_NAME = input.getAttribute('name');
    this.setModelProperty({ property: INPUT_NAME, value: checked });
  }

  changeFormHandler(e) {
    const targetNode = e.target;
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
      this.rerenderSlider();
    }
  }

  rerenderSlider() {
    if (this.getModelProperty('panel')) {
      this.renderConfigPanel({ show: this.getModelProperty('panel'), id: this.getModelProperty('id') });
    }

    this.view.createSlider({
      runners: this.model.configuration.runners,
      vertical: this.model.configuration.vertical,
      id: this.model.configuration.id,
    });
  }

  changeSliderState(obj: {
    property: configurationPropertyName, value: string | number | boolean, index?: number}):void {
    this.setModelProperty(obj);

    this.view.createSlider({
      runners: this.model.configuration.runners,
      vertical: this.model.configuration.vertical,
      id: this.model.configuration.id,
    });
    this.renderConfigPanel({ show: true, id: this.model.configuration.id });
  }


  createInputTemplate(ruleName) {
    const LABEL = document.createElement('label');
    LABEL.classList.add('panel__label');

    const FIELD_NAME = document.createElement('p');
    FIELD_NAME.classList.add('panel__description');
    FIELD_NAME.innerHTML = `${ruleName}`;

    LABEL.appendChild(FIELD_NAME);

    return LABEL;
  }

  createCustomInput(attributes: {ID: string, type: string, name: string, value: string | number }) {
    const INPUT = document.createElement('input');
    INPUT.classList.add('panel__input');
    INPUT.setAttribute('id', attributes.ID);
    INPUT.setAttribute('type', attributes.type);
    INPUT.setAttribute('name', attributes.name);
    INPUT.setAttribute('value', String(attributes.value));
    return INPUT;
  }

  createFakeCheckbox() {
    const div = document.createElement('div');
    div.classList.add('panel__fakebox');
    return div;
  }

  createForm() {
    const form = document.createElement('form');
    form.setAttribute('name', 'panel');
    form.classList.add('panel');
    form.addEventListener('change', this.changeFormHandler.bind(this));
    return form;
  }

  fillForm(obj: {form:HTMLFormElement,
    settings: [string, string | number | boolean | number[]][]}) {
    const { form, settings } = obj;
    settings.forEach((current) => {
      const RULE_NAME = current[0];
      const RULE_VALUE = current[1];
      const TEMPLATE = this.createInputTemplate(RULE_NAME);

      type inputAttr = {
        ID: string;
        name: string;
        type: string;
        value: string;
      }

      const InputAttr: inputAttr = {
        ID: `${RULE_NAME}`,
        name: `${RULE_NAME}`,
        type: '',
        value: `${String(RULE_VALUE)}`,
      };

      if (typeof RULE_VALUE === 'number') {
        InputAttr.type = 'number';
        const CUSTOM_INPUT = this.createCustomInput(InputAttr);
        TEMPLATE.appendChild(CUSTOM_INPUT);
      } else if (typeof RULE_VALUE === 'boolean') {
        InputAttr.type = 'checkbox';
        const CUSTOM_INPUT = this.createCustomInput(InputAttr);
        if (RULE_VALUE === true) {
          CUSTOM_INPUT.setAttribute('checked', 'true');
        }
        TEMPLATE.appendChild(CUSTOM_INPUT);
        TEMPLATE.appendChild(this.createFakeCheckbox());
      } else if (typeof RULE_VALUE === 'string') {
        InputAttr.type = 'text';
        const CUSTOM_INPUT = this.createCustomInput(InputAttr);
        TEMPLATE.appendChild(CUSTOM_INPUT);
      } else if (Array.isArray(RULE_VALUE)) {
        RULE_VALUE.forEach((position, intance) => {
          InputAttr.ID = `${RULE_NAME}-${intance + 1}`;
          InputAttr.type = 'number';
          InputAttr.value = `${String(position)}`;
          const CUSTOM_INPUT = this.createCustomInput(InputAttr);
          CUSTOM_INPUT.className = 'panel__input panel__input--positions';
          TEMPLATE.appendChild(CUSTOM_INPUT);
        });
      } else {
        throw new Error('Unknown value');
      }
      form.appendChild(TEMPLATE);
    });
    return form;
  }

  renderConfigPanel(obj: {show: boolean, id: string}): void {
    const { show, id } = obj;
    const parentNode = document.getElementById(id);
    const panelNode = parentNode.querySelector('.panel');
    if (panelNode) {
      panelNode.remove();
    }
    if (show) {
      const Configuration = Object.entries(this.model.configuration);
      const form = this.createForm();
      const filledForm = this.fillForm({ form, settings: Configuration });
      document.getElementById(this.model.configuration.id).appendChild(filledForm);
    }
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
}


type configurationPropertyName = 'minValue'|'maxValue'|'currentValue'|'steps'|'runners'|'stepsOn'|'vertical' |'invertRange' |'units' |'id'|'panel';
