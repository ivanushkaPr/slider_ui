export class Model {
  configuration: configuration;

  basicConfiguration: configuration = {
    minValue: 0,
    maxValue: 100,
    currentValue: 0,
    steps: 0,
    runners: [0],
    stepsOn: false,
    vertical: false,
    invertRange: false,
    units: '',
    id: undefined,
  }

  controller;

  constructor(configuration: configuration) {
    if (Model.isConf(configuration)) {
      this.configuration = configuration;
      this.checkConf(this.configuration);
    }
  }

  changeConfState(property, value) {
    this.configuration[property] = value;
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
  invertRange?: boolean
  units?: string
  id: string | undefined
};

export const uConfiguration = {
  minValue: 0,
  maxValue: 100,
  currentValue: 0,
  steps: 0,
  runners: [50, 100, 200, 250],
  stepsOn: false,
  vertical: true,
  invertRange: false,
  units: '',
  id: '#slider',
};

export const incompleteConfiguration = {

  id: '#slider',
};
