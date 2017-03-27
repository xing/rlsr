/* eslint-env node, jest */

const R = require('ramda');
const updateVersionNumber = require('../src/tools/update-version-number');

const packages = {
  one: {
    name: 'one',
    version: '1.2.3',
    dependencies: {},
    rlsr: {
      determinedIncrementLevel: -1,
      messages: [{level: 0}],
      relatedMessages: [],
      relations: ['two', 'three']
    }
  },
  two: {
    name: 'two',
    dependencies: {
      one: '1.0.0'
    },
    rlsr: {
      determinedIncrementLevel: -1,
      messages: [],
      relatedMessages: [],
      relations: []
    }
  },
  three: {
    name: 'three',
    devDependencies: {
      one: '1.0.0'
    },
    rlsr: {
      determinedIncrementLevel: -1,
      messages: [],
      relatedMessages: [],
      relations: []
    }
  },
};

describe('updateVersionNumber()', () => {
  // test message, bump level, expected version
  [
    ['patch', 0, '1.2.4'],
    ['minor', 1, '1.3.0'],
    ['major', 2, '2.0.0']
  ].map(t => it(`bumps the current package with ${t[0]}`, () => {
    const p = R.clone(packages);
    p.one.rlsr.messages[0].level = t[1];

    updateVersionNumber('rlsr', p)(p.one);

    expect(p.one.version).toEqual(t[2]);
  }));

  // test message, messages, expected version
  [
    ['patch / patch', [{level: 0}, {level: 0}], '1.2.4'],
    ['minor / patch', [{level: 1}, {level: 0}], '1.3.0'],
    ['minor / minor', [{level: 1}, {level: 1}], '1.3.0'],
    ['major / patch', [{level: 2}, {level: 0}], '2.0.0'],
    ['major / minor', [{level: 2}, {level: 1}], '2.0.0'],
    ['major / major', [{level: 2}, {level: 2}], '2.0.0']
  ].map(t => it(`accepts combined messages (${t[0]})`, () => {
    const p = R.clone(packages);
    p.one.rlsr.messages = t[1];

    updateVersionNumber('rlsr', p)(p.one);

    expect(p.one.version).toEqual(t[2]);
  }));

  // test message, message level, initial dep range, expected dep range, expected increment level of rel
  [
    ['in Range', 0, '1.2.3 - 1', '1.2.3 - 1', -1],
    ['against fixed range', 0, '1.2.3', '1.2.3 - 1', 0],
    ['against too small caret range', 2, '^1.2.3', '1.2.3 - 2', 0],
    ['against too small hyphen range', 2, '1.2.3 - 1', '1.2.3 - 2', 0],
    ['against rlsr-latest declaration', 2, 'rlsr-latest', '^2.0.0', 0]
  ].map(t => it(`updates related packages (${t[0]})`, () => {
    const p = R.clone(packages);
    p.one.rlsr.messages[0].level = t[1];
    p.two.dependencies.one = t[2];
    p.three.devDependencies.one = t[2];

    updateVersionNumber('rlsr', p)(p.one);

    expect(p.two.dependencies.one).toEqual(t[3]);
    expect(p.three.devDependencies.one).toEqual(t[3]);
    expect(p.two.rlsr.determinedIncrementLevel).toEqual(t[4]);
    expect(p.three.rlsr.determinedIncrementLevel).toEqual(-1);
  }));
});
