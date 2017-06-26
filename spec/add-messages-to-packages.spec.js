/* eslint-env node, jest */
const R = require('ramda');
const getMessage = require('./fixtures/message-small.fixture');
const getRawEnv = require('./fixtures/env-small.fixture');
const addMessagesToPackages = require('../src/tools/add-messages-to-packages');

const multiMessage = R.assoc('affected', ['one', 'two']);
const irrelevantMessage = R.assoc('affected', ['three']);

const getEnv = getRawEnv({
  one: { rlsr: { messages: [] } },
  two: { rlsr: { messages: [] } }
});

describe('addMessagesToPackages()', () => {
  it('adds a message with a single package relation to the related package', () => {
    const exp = addMessagesToPackages(getEnv([getMessage('foo')]));

    expect(exp.packages.one.rlsr.messages).toHaveLength(1);
    expect(exp.packages.one.rlsr.messages[0].subject).toBe('foo');
    expect(exp.packages.two.rlsr.messages).toHaveLength(0);
  });

  it('adds a message with several package relations to the related package', () => {
    const exp = addMessagesToPackages(
      getEnv([multiMessage(getMessage('bar'))])
    );

    expect(exp.packages.one.rlsr.messages).toHaveLength(1);
    expect(exp.packages.one.rlsr.messages[0].subject).toBe('bar');
    expect(exp.packages.two.rlsr.messages).toHaveLength(1);
    expect(exp.packages.two.rlsr.messages[0].subject).toBe('bar');
  });

  it("doesn't add irrelevant messages", () => {
    const exp = addMessagesToPackages(
      getEnv([irrelevantMessage(getMessage('bar'))])
    );

    expect(exp.packages.one.rlsr.messages).toHaveLength(0);
    expect(exp.packages.two.rlsr.messages).toHaveLength(0);
  });

  it('can cope with several messages', () => {
    const exp = addMessagesToPackages(
      getEnv([getMessage('foo'), multiMessage(getMessage('bar'))])
    );

    expect(exp.packages.one.rlsr.messages).toHaveLength(2);
    expect(exp.packages.one.rlsr.messages[0].subject).toBe('foo');
    expect(exp.packages.one.rlsr.messages[1].subject).toBe('bar');
    expect(exp.packages.two.rlsr.messages).toHaveLength(1);
    expect(exp.packages.two.rlsr.messages[0].subject).toBe('bar');
  });
});
