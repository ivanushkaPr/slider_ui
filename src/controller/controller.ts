/* eslint-disable */
import { Model, configuration } from '../model/model';
import View from '../view/view';
import { disconnect } from 'cluster';
import { format } from 'url';
import { FORMERR } from 'dns';

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

  changeMinValue() {

  }

  changeForm(e) {
    console.log(document.getElementById('#slider2'), 'в самом начале');
    const parentForm = e.currentTarget as HTMLElement;
    const targetNode = e.target as HTMLElement;
    if (targetNode.nodeName === 'INPUT' && targetNode.classList.contains('panel__input')) {
      const currentNode = targetNode.parentNode as HTMLElement;
      const inputs = currentNode.getElementsByClassName('panel__input');
      const input = inputs[0];

      if (input.classList.contains('panel__input--positions')) {
        const numberInputs = Array.from(inputs);
        const runnersPosition: number[] = [];
        const name = inputs[0].getAttribute('name');

        numberInputs.forEach((current, index)=> {
          const position = (current as HTMLInputElement).value;
          runnersPosition.push(Number(position));
        });
        this.model.configuration[name] = runnersPosition;
      } else {
        const INPUT = inputs[0];
        const TYPE = INPUT.getAttribute('type');
        const NAME = INPUT.getAttribute('name');
        // eslint-disable-next-line prefer-destructuring
        const VALUE = (inputs[0] as HTMLInputElement).value;
        if (TYPE === 'number') {
          this.setModelProperty({ property: NAME, value: Number(VALUE) });
        } else if(INPUT.id === 'panel') {
          const { checked } = (inputs[0]as HTMLInputElement);
          this.setModelProperty({ property: NAME, value: checked });
          const CURRENT_ID = this.getModelProperty('id');
          const PARENT = document.getElementById(CURRENT_ID);
          const PANEL = PARENT.querySelector('.panel') as HTMLElement;
          PANEL.style.display = 'none';
        }
        else if (TYPE === 'checkbox') {
          const { checked } = (inputs[0]as HTMLInputElement);
          this.setModelProperty({ property: NAME, value: checked });
        } else if (TYPE === 'text' && INPUT.id !== 'id') {
          this.setModelProperty({ property: NAME, value: String(VALUE) });
        } else if (TYPE === 'text' && INPUT.id === 'id') {
          const CURRENT_ID = this.getModelProperty('id');
          if (VALUE !== CURRENT_ID) {
            const PARENT = document.getElementById(CURRENT_ID);
            const RANGE = PARENT.querySelector('.slider__range');
            const PANEL = PARENT.querySelector('.panel');
            PARENT.removeChild(RANGE);
            PARENT.removeChild(PANEL);
            this.setModelProperty({ property: NAME, value: VALUE });
          }
        }
      }
      if(this.getModelProperty('panel')) {
        this.renderConfigPanel({show: this.getModelProperty('panel'), id: this.getModelProperty('id')});
      }


      this.view.createSlider({
        runners: this.model.configuration.runners,
        vertical: this.model.configuration.vertical,
        id: this.model.configuration.id,
      });

      
    }
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
    form.addEventListener('change', this.changeForm.bind(this));
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

  changePanelProperty(obj: {property: string, value: string |number | boolean; index?: number}) {
    let { property, value, index } = obj;
    const id = this.getModelProperty('id');
    const parent = document.getElementById(id);
    const panel = parent.querySelector('.panel');

    const vertical = this.getModelProperty('vertical');
    if (index >= 0 && typeof index === 'number') {
      if (!vertical) {
        const targetInput = panel.querySelector(`#runners-${index + 1}`) as HTMLInputElement;
        targetInput.value = String(Math.round(Number(value)));
      } else {
        const runnersLength = this.getModelProperty('runners').length;
        const targetInput = panel.querySelector(`#runners-${runnersLength - index}`) as HTMLInputElement;
        targetInput.value = String(100 - Math.round(Number(value)));
      }
    }
  }

  setModelProperty(obj: {property: string; value: string | number | boolean; index?: number}): boolean {
    this.model.changeConfState(obj);
    return true;
  }

  getModelProperty(property) {
    const tProp = this.model.getConfState(property);
    return tProp;
  }

  setViewProperty(property, value) {
    
  }

  getViewProperty() {

  }
}


type configurationPropertyName = 'minValue'|'maxValue'|'currentValue'|'steps'|'runners'|'stepsOn'|'vertical' |'invertRange' |'units' |'id'|'panel';
