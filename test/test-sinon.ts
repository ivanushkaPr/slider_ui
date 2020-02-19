/* eslint-disable */
declare global {
  namespace NodeJS {
    interface Global {
       document: Document;
       window: Window;
       navigator: Navigator;
    } 
  }
}

import * as mocha from "mocha";

import * as chai from "chai";

import * as sinon from 'sinon';


const assert = chai.assert;

import {Model, configuration, uConfiguration, incompleteConfiguration} from '../src/model/model';
import Controller from './../src/controller/controller';

import View from './../src/view/view';

import { JSDOM } from 'jsdom';
import { AssertionError, equal } from "assert";
import { isRegExp } from "util";
let { window } = new JSDOM('<!doctype html><html><body><div id="#slider"></div></body></html>');

// Save these two objects in the global space so that libraries/tests
// can hook into them, using the above doc definition.

global.document = window.document;
global.window = window;


describe('sinon spy', () => {
  it('spies on function', () => {
    

    function hello() {
      return;
    }


    hello.called = undefined;
    let spy = sinon.spy(why, 'foo');

    console.log(hello.called());

    

    
  })
})