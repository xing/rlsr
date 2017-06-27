/* eslint-env node, jest */

const polishPackages = require('../src/transform/polish-packages');
const getEnv = require('./fixtures/env-small.fixture');

describe('polishPackages()', () => {
  it('enriches packages with base data', () => {
    expect(
      polishPackages(getEnv({ a: { name: 'a' }, b: { name: 'b' } }, []))
    ).toMatchSnapshot();
  });
});
