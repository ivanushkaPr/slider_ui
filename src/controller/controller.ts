/* eslint-disable */
import { Model } from '../model/model';
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
      const configuration = Object.entries(this.model.configuration);
      const form = document.createElement('form');
      form.setAttribute('name', 'panel');

      configuration.forEach((current, index, array) => {
        const inputName = configuration[index][0];
        const inputValue = configuration[index][1];

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
          input.setAttribute('id', `${inputName}`);
          input.setAttribute('type', 'checkbox');
          // eslint-disable-next-line no-unused-expressions
          (inputValue === true ? input.setAttribute('checked', 'true') : false);
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