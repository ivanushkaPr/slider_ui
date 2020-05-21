/* eslint-disable */
/* eslint-disable no-unused-vars */

import Tooltip from './Tooltip';
import View from '../../view';
import { Model, uConfiguration  } from '../../../Model/Model';
import Controller from '../../../Controller/Controller';

import * as mocha from "mocha";

import * as chai from "chai";

import * as sinon from 'sinon';

const assert = chai.assert;




function tooltipClassTests() {
  describe('Range', () => {
    let view, tooltip;
    beforeEach(() => {
      view = new View();
      tooltip = new Tooltip(view);
    })

    describe('Create Tooltip', () => {
      it('Creates tooltip', () => {
        const stub = sinon.stub(view, 'fetchModelProperty').returns(false);
        const tooltipElement = tooltip.createTooltip();
        assert.equal(tooltipElement.tagName, 'DIV');
        assert.equal(tooltipElement.className, 'slider__tooltip slider__tooltip--horizontal');
      })
    })

    describe('Set tooltip data attributes', () => {
      it('Sets tooltip data attributes', () => {
        const root = document.getElementById('#slider');
        sinon.stub(view, 'fetchModelProperty').returns(false);

        let count = 0;
        while (count < 4) {
          root.appendChild(tooltip.createTooltip());
          count++;
        }

        tooltip.setTooltipDataAttributes(root);
        let tooltips = document.body.querySelectorAll('.slider__tooltip');

        tooltips.forEach((tooltip, index) => {
          const dataset = (tooltip as HTMLElement).dataset.runnerSibling;
          assert.equal(dataset, String(index));
        })
      })
    })

    describe('Render slider tooltip', () => {
      it('Renders slider tooltips into parent node', () => {
        const args = {
          position: [0, 10, 20, 30],
          vertical: false,
          slider: document.getElementById('#slider'),
          root: document.getElementById('#slider'),
        };

        sinon.stub(view, 'fetchModelProperty').returns(false);
        sinon.stub(view, 'setElementPosition').returns(false);
        sinon.stub(tooltip, 'positionToValue').returns(false);
        view.runnersAr = [0, 10, 20, 30];

        tooltip.renderSliderTooltip(args);
        assert.equal(document.querySelectorAll('.slider__tooltip').length, 4)
      })
    })

    describe('', () => {
      it('', () => {
        
      })
    })

    describe('', () => {
      it('', () => {
        
      })
    })

  });
};


export default tooltipClassTests;