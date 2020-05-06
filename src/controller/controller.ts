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
    const POSITION_INVALID = (prevRunnerposition === undefined && value < 0)
    || (nextRunnerPosition === undefined && value > 100)
    || (prevRunnerposition > value || nextRunnerPosition < value);
    if (POSITION_INVALID) {
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

  createInputTemplate(ruleName) {
    const LABEL = document.createElement('label');
    LABEL.classList.add('panel__label');

    const FIELD_NAME = document.createElement('p');
    FIELD_NAME.classList.add('panel__description');
    FIELD_NAME.innerHTML = `${ruleName}`;

    LABEL.appendChild(FIELD_NAME);

    return LABEL;
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

  createCustomInput(attributes: {id: string, type: string, name: string, value: string}) {
    const INPUT = document.createElement('input');
    INPUT.classList.add('panel__input');
    Object.keys(attributes).forEach((key) => {
      INPUT.setAttribute(key, attributes[key]);
    });

    return INPUT;
  }


  setAttributesForNumberInput(attributesTemplate: {id: string, name: string, type: string,
    value: string}) {
    const attributes = { ...attributesTemplate };
    attributes.type = 'number';
    const CUSTOM_INPUT = this.createCustomInput(attributes);
    return CUSTOM_INPUT;
  }

  setAttributesForCheckboxInput(attributesTemplate: {id: string, name: string, type: string, 
    value: string}, isChecked: boolean) {
    const attributes = { ...attributesTemplate };
    attributes.type = 'checkbox';
    const CUSTOM_INPUT = this.createCustomInput(attributes);
    if (isChecked === true) {
      CUSTOM_INPUT.setAttribute('checked', 'true');
    }
    return CUSTOM_INPUT;
  }

  setAttributesForTextInput(attributesTemplate: {id: string, name: string, type: string, 
    value: string}) {
    const attributes = { ...attributesTemplate };
    attributes.type = 'text';
    const CUSTOM_INPUT = this.createCustomInput(attributes);
    return CUSTOM_INPUT;
  }

  setAttributesForRunnersInput(attributesTemplate: {id: string, name: string, type: string,
    value: string}, id:string, position: number) {
    const attributes = { ...attributesTemplate };
    attributes.id = id;
    attributes.type = 'number';
    attributes.value = `${String(position)}`;

    const CUSTOM_INPUT = this.createCustomInput(attributes);
    CUSTOM_INPUT.className = 'panel__input panel__input--positions';
    return CUSTOM_INPUT;
  }

  fillForm(obj: {form:HTMLFormElement,
    settings: [string, string | number | boolean | number[]][]}) {
    const { form, settings } = obj;
    settings.forEach((current) => {
      const RULE_NAME = current[0];
      const RULE_VALUE = current[1];
      const TEMPLATE = this.createInputTemplate(RULE_NAME);

      type inputAttr = {
        id: string;
        name: string;
        type: string;
        value: string;
      }

      const InputAttr: inputAttr = {
        id: `${RULE_NAME}`,
        name: `${RULE_NAME}`,
        type: '',
        value: `${String(RULE_VALUE)}`,
      };

      if (typeof RULE_VALUE === 'number') {
        TEMPLATE.appendChild(this.setAttributesForNumberInput(InputAttr));
      } else if (typeof RULE_VALUE === 'boolean') {
        TEMPLATE.appendChild(this.setAttributesForCheckboxInput(InputAttr, RULE_VALUE));
        TEMPLATE.appendChild(this.createFakeCheckbox());
      } else if (typeof RULE_VALUE === 'string') {
        TEMPLATE.appendChild(this.setAttributesForTextInput(InputAttr));
      } else if (Array.isArray(RULE_VALUE)) {
        RULE_VALUE.forEach((position, instance) => {
          const RUNNER_ID = `${RULE_NAME}-${instance + 1}`;
          TEMPLATE.appendChild(this.setAttributesForRunnersInput(InputAttr, RUNNER_ID, position));
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

class PanelChangeHandler {
  controller:Controller

  constructor(controller) {
    this.controller = controller;
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
      this.controller.rerenderSlider();
    }
  }

  changeRunnersProperty(obj: {input}):void {
    const { input: INPUT } = obj;
    const VALUE = +INPUT.value;
    const INDEX = +(INPUT.id.slice(-1) - 1);
    const VALUE_IS_VALID = this.validateRunnersProperty({ index: INDEX, value: VALUE });
    if (VALUE_IS_VALID) {
      this.controller.setModelProperty({ property: 'runners', value: VALUE, index: INDEX });
    }
  }

  validateRunnersProperty(obj: {index, value}) {
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

  changeCheckboxProperty(obj: {input}) {
    const { input } = obj;
    const { checked } = (input as HTMLInputElement);
    const INPUT_NAME = input.getAttribute('name');
    this.controller.setModelProperty({ property: INPUT_NAME, value: checked });
  }

  changeNumberProperty(obj: {input}) {
    const { input } = obj;

    if (input.id === 'minValue') {
      if (this.controller.getModelProperty('maxValue') > input.value) {
        this.controller.setModelProperty({ property: input.getAttribute('name'), value: Number(input.value) });
      }
    } else if (input.id === 'maxValue') {
      if (this.controller.getModelProperty('minValue') < input.value) {
        this.controller.setModelProperty({ property: input.getAttribute('name'), value: Number(input.value) });
      }
    } else if (input.id === 'steps') {
      if (input.value <= 20) {
        this.controller.setModelProperty({ property: input.getAttribute('name'), value: Number(input.value) });
      }
    } else {
      throw new Error('Unexpected input');
    }
  }

  changeUnitsProperty(obj: {input}) {
    const { input } = obj;
    const INPUT_NAME = input.getAttribute('name');
    const INPUT_VALUE = (input as HTMLInputElement).value;
    this.controller.setModelProperty({ property: INPUT_NAME, value: String(INPUT_VALUE) });
  }

  changeIDProperty(obj: {input}) {
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

  changePanelVisibility(obj: {input}) {
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


type configurationPropertyName = 'minValue'|'maxValue'|'currentValue'|'steps'|'runners'|'stepsOn'|'vertical' |'invertRange' |'units' |'id'|'panel';
