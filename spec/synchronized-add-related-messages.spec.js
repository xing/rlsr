/* eslint-env node, jest */

const synchronizedAddRelatedMessages = require('../src/tools/synchronized-add-related-messages');
const getEnv = require('./fixtures/env-small.fixture');
const getMessage = require('./fixtures/message-small.fixture');

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

    const exp = synchronizedAddRelatedMessages(env);

    expect(exp.packages.one.rlsr.relatedMessages).toHaveLength(0);
    expect(exp.packages.two.rlsr.relatedMessages).toHaveLength(1);
    expect(exp.packages.two.rlsr.relatedMessages[0].subject).toBe('fix: foo');
  });
});
