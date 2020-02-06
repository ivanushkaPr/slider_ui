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
  }
}