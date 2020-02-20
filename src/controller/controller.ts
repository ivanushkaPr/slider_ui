/* eslint-disable */
import { Model } from '../model/model';
import View from '../view/view';

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