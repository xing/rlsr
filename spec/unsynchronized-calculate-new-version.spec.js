/* eslint-env node, jest */

const unsynchronizedCalculateNewVersion = require('../src/tools/unsynchronized-calculate-new-version');
const getEnv = require('./fixtures/env-small.fixture');

describe('synchronizedAddRelatedMessages()', () => {
  it('sets related messages if a package is not directly linked to the message', () => {
    const env = getEnv(
      {
        one: { name: 'one', rlsr: { relatedMessages: [] } },
        two: { name: 'two', rlsr: { relatedMessages: [] } }
      },
      [getMessage('foo')]
    );
    env.packageNames = ['one', 'two'];
    env.config = {
      mode: 'synchronized'
    };

    const exp = unsynchronizedCalculateNewVersion(env);

    expect(exp.packages.one.rlsr.relatedMessages).toHaveLength(0);
    expect(exp.packages.two.rlsr.relatedMessages).toHaveLength(1);
    expect(exp.packages.two.rlsr.relatedMessages[0].subject).toBe('fix: foo');
  });
});
