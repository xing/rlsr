/* eslint-env node, jest */

const bump = require('../src/tools/bump');

describe('bump', () => {
  it('bumps patch versions', () => {
    expect(bump('1.2.3', 0)).toEqual('1.2.4');
  });
});
