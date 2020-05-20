export class Model {
  configuration: configuration;

  basicConfiguration: configuration = {
    minValue: 0,
    maxValue: 100,
    steps: 0,
    id: undefined,
    runners: [0],
    stepsOn: false,
    vertical: false,
    scaleOn: true,
    panel: false,
    tooltips: true,
    stepSize: 0,
  }

  controller;

  constructor(configuration: configuration) {
    if (Model.isConf(configuration)) {
      this.configuration = configuration;
      this.checkConf(this.configuration);
    }
  }

  changeConfState(obj: {property: string; value: string | number | boolean; index?: number})
  :boolean {
    const { property, value, index } = obj;
    if (typeof index === 'number') {
      this.configuration[property][index] = value;
    } else {
      this.configuration[property] = value;
    }
    return true;
  }

  getConfState(property) {
    const targetProp = this.configuration[property];
    return targetProp;
  }

  static isConf(configuration: configuration): boolean | Error {
    if (typeof configuration === 'object' && configuration.id) {
      return true;
    }
    throw new Error('Property id is mandatory');
  }

  checkConf(configuration: configuration): void {
    const userRules = configuration;

    const basicRules = Object.entries(this.basicConfiguration);

    for (let rule = 0; rule < basicRules.length; rule += 1) {
      const ruleName = basicRules[rule][0];
      const ruleValue = basicRules[rule][1];

      if (!userRules[ruleName]) {
        userRules[ruleName] = ruleValue;
      }
    }
    this.configuration = userRules;
    return undefined;
  }

  sendUpdate() {

  }

  getUpdate() {

  }
}

export type configuration = {
  minValue?: number,
  maxValue?: number,
  currentValue?: number,
  steps?: number,
  runners?: number[],
  stepsOn?: boolean,
  vertical?: boolean
  scaleOn?: boolean,
  id: string | undefined
  panel?: boolean,
  tooltips?: boolean,
  stepSize?: number
};

export const uConfiguration = {
  minValue: -1000,
  maxValue: 1000,
  steps: 10,
  id: '#slider',
  runners: [0, 100],
  stepsOn: false,
  adjustSteps: true,
  vertical: true,
  scaleOn: true,
  panel: true,
  tooltips: true,
  stepSize: 100,
};

export const incompleteConfiguration = {
  id: '#slider',
};

export interface color {
  color: string
}
