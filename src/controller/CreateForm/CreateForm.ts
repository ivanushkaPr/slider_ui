import Controller from '../controller';
import PanelChangeHandler from '../PanelChangeHandler/PanelChangeHandler';

export default class CreateForm {
  handler: PanelChangeHandler

  controller: Controller

  constructor(PanelEventHandler: PanelChangeHandler, controller: Controller) {
    this.handler = PanelEventHandler;
    this.controller = controller;
  }

  configPanel(obj: {show: boolean, id: string}): void {
    const { show, id } = obj;
    const parentNode = document.getElementById(id);
    const panelNode = parentNode.querySelector('.panel');
    if (panelNode) {
      panelNode.remove();
    }
    if (show) {
      const Configuration = Object.entries(this.controller.getFullConfiguration());
      const form = this.createForm();
      const filledForm = this.fillForm({ form, settings: Configuration });
      document.getElementById(this.controller.getModelProperty('id')).appendChild(filledForm);
    }
  }

  createForm(): HTMLFormElement {
    const form = document.createElement('form');
    form.setAttribute('name', 'panel');
    form.classList.add('panel');
    form.addEventListener('change', this.handler.changeFormHandler.bind(this.handler));
    return form;
  }

  createInputTemplate(ruleName):HTMLLabelElement {
    const LABEL = document.createElement('label');
    LABEL.classList.add('panel__label');

    const FIELD_NAME = document.createElement('p');
    FIELD_NAME.classList.add('panel__description');
    FIELD_NAME.innerHTML = `${ruleName}`;

    LABEL.appendChild(FIELD_NAME);

    return LABEL;
  }

  fillForm(obj: {form:HTMLFormElement,
    settings: [string, string | number | boolean | number[]][]}):HTMLFormElement {
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

  setAttributesForNumberInput(attributesTemplate: {id: string, name: string, type: string,
    value: string}):HTMLInputElement {
    const attributes = { ...attributesTemplate };
    attributes.type = 'number';
    const CUSTOM_INPUT = this.createCustomInput(attributes);
    return CUSTOM_INPUT;
  }

  setAttributesForCheckboxInput(attributesTemplate: {id: string, name: string, type: string,
    value: string}, isChecked: boolean): HTMLInputElement {
    const attributes = { ...attributesTemplate };
    attributes.type = 'checkbox';
    const CUSTOM_INPUT = this.createCustomInput(attributes);
    if (isChecked === true) {
      CUSTOM_INPUT.setAttribute('checked', 'true');
    }
    return CUSTOM_INPUT;
  }

  setAttributesForTextInput(attributesTemplate: {id: string, name: string, type: string,
    value: string}):HTMLInputElement {
    const attributes = { ...attributesTemplate };
    attributes.type = 'text';
    const CUSTOM_INPUT = this.createCustomInput(attributes);
    return CUSTOM_INPUT;
  }

  setAttributesForRunnersInput(attributesTemplate: {id: string, name: string, type: string,
    value: string}, id:string, position: number):HTMLInputElement {
    const attributes = { ...attributesTemplate };
    attributes.id = id;
    attributes.type = 'number';
    const int = position.toFixed(1);
    attributes.value = `${String(int)}`;

    const CUSTOM_INPUT = this.createCustomInput(attributes);
    CUSTOM_INPUT.className = 'panel__input panel__input--positions';
    return CUSTOM_INPUT;
  }

  createFakeCheckbox():HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add('panel__fakebox');
    return div;
  }

  createCustomInput(attributes: {id: string, type: string, name: string, value: string}):HTMLInputElement {
    const INPUT = document.createElement('input');
    INPUT.classList.add('panel__input');
    Object.keys(attributes).forEach((key) => {
      INPUT.setAttribute(key, attributes[key]);
    });
    return INPUT;
  }
}