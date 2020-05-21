/* eslint-disable*/
import Range from './Range';
import View from '../../view';
import { Model, uConfiguration  } from '../../../Model/Model';
import Controller from '../../../Controller/Controller';

import * as mocha from "mocha";

import * as chai from "chai";

import * as sinon from 'sinon';



const assert = chai.assert;

function rangeClassTest() {

  describe('Range', () => {
    let view, range;
    beforeEach(() => {
      view = new View();
      range = new Range(view);
    })

    describe('Range class', () => {
      it('Creates range Class', () => {
        assert.isObject(range);
      });
    });
  
    describe('Constructor', () => {
      it('Saves link to view in his property', () => {
        assert.equal(range.parent, view);
      })
    })
  
    describe('Create range', () => {
      it('Creates slider range', () => {
        const stub = sinon.stub(view, 'fetchModelProperty').returns(false);
        const sliderRange = range.createRange();
        assert.equal(sliderRange.tagName, 'DIV');
        assert.equal(sliderRange.className, 'slider__range slider__range--horizontal');
      })
    })
  
    describe('Render element', () => {
      it('Prepend element in parent element', () => {
        const stub = sinon.stub(view, 'fetchModelProperty').returns(false);
        range.renderElement(range.createRange(), document.getElementById('#slider'));
        assert.equal(document.body.querySelectorAll('.slider__range').length, 1)
      })
    })
  
    describe('Remove slider', () => {
      it('Removes slider and all his childs from document', () => {
        const stub = sinon.stub(view, 'fetchModelProperty').returns(false);
        range.renderElement(range.createRange(), document.getElementById('#slider'));
        assert.equal(document.body.querySelectorAll('.slider__range').length, 1)
        range.removeSlider(document.getElementById('#slider'));
        assert.equal(document.body.querySelectorAll('.slider__range').length, 0)
      })
    })

    describe('Render new slider', () => {
      it('Renders slider and registering event handlers', () => {
        const args = {
          root: document.getElementById('#slider'),
          id: '#slider'
        }

        console.log(args.root);
        sinon.stub(view, 'fetchModelProperty').returns(false);
        const spy = sinon.spy(range, 'registerEventHandlers');
        range.renderNewSlider(args);
        assert.equal(document.body.querySelectorAll('.slider__range').length, 1);
        assert.equal(spy.called, true);
      })
    })

    describe('Register event handlers', () => {
      it('Registers event handlers on slider range', () => {
        sinon.stub(view, 'onHandlerRegister').returns(true);
        sinon.stub(view, 'fetchModelProperty').returns(false);
        const sliderRange = range.createRange();

        const spy = sinon.spy(range, 'registerEventHandlers');
        range.registerEventHandlers(sliderRange);
        assert.equal(spy.called, true);
      })
    })
  })
}

export default rangeClassTest;