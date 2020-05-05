export class Model {
  configuration: configuration;

  basicConfiguration: configuration = {
    minValue: 0,
    maxValue: 100,
    steps: 0,
    units: '',
    runners: [0],
    stepsOn: false,
    vertical: false,
    panel: false,
    id: undefined,

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
  minValue?: number
  maxValue?: number
  currentValue?: number
  steps?: number
  runners?: number[]
  stepsOn?: boolean
  vertical?: boolean
  units?: string
  id: string | undefined
  panel?: boolean
};

export const uConfiguration = {
  minValue: -100,
  maxValue: 100,
  steps: 10,
  units: 'px',
  runners: [0, 30, 40, 60],
  stepsOn: false,
  vertical: false,
  panel: true,
  id: '#slider',
};

export const incompleteConfiguration = {
  id: '#slider',
};

export interface color {
  color: string
}
