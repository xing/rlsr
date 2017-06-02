/* eslint-env node, jest */

const R = require('ramda');
const updateRelatedVersionNumber = require('../src/tools/update-related-version-number');

const packages = {
  one: {
    name: 'one',
    version: '1.2.3',
    dependencies: {},
    rlsr: {
      hasBump: true,
      determinedIncrementLevel: 1,
      messages: [{ level: 0 }],
      relatedMessages: [],
      relations: ['two']
    }
  },
  two: {
    name: 'two',
    version: '1.2.3',
    dependencies: {
      one: '1.0.0'
    },
    rlsr: {
      determinedIncrementLevel: -1,
      messages: [],
      relatedMessages: [{ level: 2 }],
      relations: []
    }
  },
  three: {
    name: 'three',
    version: '1.2.3',
    dependencies: {
      one: '1.0.0'
    },
    rlsr: {
      determinedIncrementLevel: -1,
      messages: [],
      relatedMessages: [],
      relations: []
    }
  }
};

describe('updateRelatedVersionNumber()', () => {
  // test message, selected package, new version
  [
    ["doesn't patch if it has already been bumped", 'one', '1.2.3'],
    ['patches if messages are available', 'two', '1.2.4'],
    ["doesn't patch if it has no messages", 'three', '1.2.3']
  ].map(t =>
    it(`${t[0]}`, () => {
      const p = R.clone(packages);

      updateRelatedVersionNumber({ nsp: 'rlsr' }, p)(p[t[1]]);

      expect(p[t[1]].version).toEqual(t[2]);
    })
  );
});
