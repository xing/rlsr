/* eslint-env node, jest */

const polishPackages = require('../src/tools/polish-packages');
const getEnv = require('./fixtures/env-small.fixture');

describe('polishPackages()', () => {
  it('turns packages into an indexed object', () => {
    expect(
      polishPackages(getEnv([{ name: 'a' }, { name: 'b' }], []))
    ).toMatchSnapshot();
  });
});
