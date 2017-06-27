/* eslint-env node, jest */
const R = require('ramda');
const transform = require('../../src/transform');
const getEnv = require('../fixtures/env-large.fixture');
const getMessage = require('../fixtures/message-large.fixture');

const applyMinorLevel = R.assoc('type', 'feat');
const applyOtherScope = R.assoc('scope', 'three');
const applyMultiScope = R.assoc('body', 'affects: two, three');
const applyMajorLevel = R.assoc('footer', 'BREAKING CHANGE: text ');

describe('large test: synchronized mode', () => {
  Date.now = jest.fn(() => 0);

  it('applies patch message', () => {
    // make the date function returd deterministic values

    const env = getEnv([getMessage('foo')]);
    const exp = transform(env);

    expect(exp).toMatchSnapshot();
  });

  it('applies minor message', () => {
    const env = getEnv([applyMinorLevel(getMessage('bar'))]);
    const exp = transform(env);

    expect(exp).toMatchSnapshot();
  });

  it('applies major message', () => {
    const env = getEnv([applyMajorLevel(getMessage('baz'))]);
    const exp = transform(env);

    expect(exp).toMatchSnapshot();
  });

  it('applies several messages', () => {
    const env = getEnv([
      applyMinorLevel(getMessage('taz')),
      getMessage('raz'),
      applyOtherScope(getMessage('roo'))
    ]);

    const exp = transform(env);

    expect(exp).toMatchSnapshot();
  });

  it('applies messages with multiple affected packages', () => {
    const env = getEnv([
      applyMinorLevel(getMessage('waz')),
      applyMultiScope(getMessage('tar'))
    ]);
    const exp = transform(env);

    expect(exp).toMatchSnapshot();
  });
});
