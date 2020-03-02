/* eslint-disable */
import { Model, configuration } from '../model/model';
import View from '../view/view';
import { disconnect } from 'cluster';

/* eslint-enable */

export default class Controller {
  model: Model

  view: View


  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;
    this.view.controller = this;
    this.model.controller = this;
    let initProps = {
      runners: this.getModelProperty('runners'),
      vertical: this.getModelProperty('vertical'),
      id: this.getModelProperty('id'),
    }
    this.view.createSlider(initProps);
    this.renderConfigPanel({show: true, id: this.getModelProperty('id')});
  }

  renderConfigPanel(obj: {show: boolean, id: string}): void {
    let {show, id} = obj;
    if (show) {
      const configurationUpdated = Object.entries(this.model.configuration);
      const form = document.createElement('form');
      form.setAttribute('name', 'panel');

      form.addEventListener('change', (e) => {
        console.log(this,' this in form');
        const parentform = e.currentTarget as HTMLElement;
        const targetNode = e.target as HTMLElement;
        if (targetNode.nodeName === 'INPUT' && targetNode.classList.contains('panel__input')) {
          const currentNode = targetNode.parentNode as HTMLElement;
          const inputs = currentNode.getElementsByClassName('panel__input');

          if (inputs.length === 1) {
            const type = inputs[0].getAttribute('type');
            const name = inputs[0].getAttribute('name');
            // eslint-disable-next-line prefer-destructuring
            const value = (inputs[0] as HTMLInputElement).value;

            if (type === 'num') {
              this.model.configuration[name] = Number(value);
            } else if (type === 'checkbox') {
              if((inputs[0]as HTMLInputElement).checked) {
                this.model.configuration[name] = true;
              } else {
                this.model.configuration[name] = false;
              }
            } else {
              this.model.configuration[name] = String(value);
            }
          } else {
            const numberInputs = Array.from(inputs);
            const runnersPosition: number[] = [];
            const name = inputs[0].getAttribute('name');

            numberInputs.forEach((current, index)=> {
              const position = (current as HTMLInputElement).value;
              runnersPosition.push(Number(position));
            });
            this.model.configuration[name] = runnersPosition;
          }

          this.view.createSlider({runners: this.model.configuration.runners, vertical: this.model.configuration.vertical, id: this.model.configuration.id});
        }
      });

      configurationUpdated.forEach((current, index, array) => {
        const inputName = configurationUpdated[index][0];
        const inputValue = configurationUpdated[index][1];

        const label = document.createElement('label');
        label.classList.add('panel__label');
        label.setAttribute('id', `${inputName}`);

        const inputDescription = document.createElement('p');
        inputDescription.classList.add('panel__description');
        inputDescription.innerHTML = `${inputName}`;
        label.appendChild(inputDescription);

        const input = document.createElement('input');
        input.classList.add('panel__input');

        if (typeof inputValue === 'number') {

          input.setAttribute('id', `${inputName}`);
          input.setAttribute('type', 'num');
          input.setAttribute('name', `${inputName}`);
          input.setAttribute('value', `${inputValue}`);
          label.appendChild(input);

        } else if (typeof inputValue === 'boolean') {

          if (inputValue === true) {
            console.log(inputValue)
            input.setAttribute('checked', 'true');
          }
          input.setAttribute('id', `${inputName}`);
          input.setAttribute('type', 'checkbox');
          input.setAttribute('name', `${inputName}`);
          input.setAttribute('value', `${inputValue}`);
          label.appendChild(input);

        } else if (typeof inputValue === 'string') {

          input.setAttribute('id', `${inputName}`);
          input.setAttribute('type', 'text');
          input.setAttribute('name', `${inputName}`);
          input.setAttribute('value', `${inputValue}`);
          label.appendChild(input);

        } else {
          // Если это массив значений для бегунков
          inputValue.forEach((runnerValue, index) => {

            const inputCopy = document.createElement('input');
            inputCopy.classList.add('panel__input');
            inputCopy.setAttribute('id', `${inputName}-${index + 1}`);
            inputCopy.setAttribute('name', `${inputName}`);
            inputCopy.setAttribute('value', `${runnerValue}`);
            label.appendChild(inputCopy);
          });

        }
        form.appendChild(label);
      });
      document.body.appendChild(form);
    }
  }



  setModelProperty(property, value) {
    this.model.changeConfState(property, value);
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