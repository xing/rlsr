/* eslint-env node, jest */

const R = require('ramda');
const assignMessages = require('../src/tools/assign-related-messages-to-package');

const packages = {
  one: {rlsr: {
    messages: [],
    relatedMessages: [],
    relations: ['two']
  }},
  two: {rlsr: {
    messages: [],
    relatedMessages: [],
    relations: []
  }},
  three: {rlsr: {
    messages: [],
    relatedMessages: [],
    relations: []
  }},
  four: {rlsr: {
    messages: [],
    relatedMessages: [],
    relations: []
  }}
};

describe('assignRelatedMessagesToPackage', () => {
  it('does nothing when there is no message', () => {
    const p = R.clone(packages);
    assignMessages('rlsr', p)(p.one);
    expect(p.one.rlsr.relatedMessages.length).toEqual(0);
    expect(p.two.rlsr.relatedMessages.length).toEqual(0);
    expect(p.three.rlsr.relatedMessages.length).toEqual(0);
    expect(p.four.rlsr.relatedMessages.length).toEqual(0);
  });
});
