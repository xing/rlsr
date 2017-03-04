/* eslint-env node, jest */

const bump = require('../src/tools/bump');
const TYPES = ['patch', 'minor', 'major'];

describe('bump', () => {
  [[-1, '1.2.3'], [0, '1.2.4'], [1, '1.3.0'], [2, '2.0.0']].forEach(data => it(`bumps ${TYPES[data[0]] || 'illegal'} versions (1.2.3 => ${data[1]})`, () => {
    expect(bump('1.2.3', data[0])).toEqual(data[1]);
  }));
});
