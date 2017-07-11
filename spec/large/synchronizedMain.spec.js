/* eslint-env node, jest */
const R = require('ramda');
const diff = require('recursive-diff').getDiff;
const transform = require('../../src/transform');
const getEnv = require('../fixtures/env-large.fixture');
const getMessage = require('../fixtures/message-large.fixture');

const applyMainScope = R.assoc('scope', 'four');
const applyMinorLevel = R.assoc('type', 'feat');
const applyOtherScope = R.assoc('scope', 'three');
const applyMultiScope = R.assoc('body', 'affects: two, three');
const applyMajorLevel = R.assoc('footer', 'BREAKING CHANGE: text ');

describe('large test: exact mode', () => {
  Date.now = jest.fn(() => 0);

  it('applies patch message', () => {
    // make the date function returd deterministic values

    const env = getEnv([applyMainScope(getMessage('foo'))]);
    env.config.mode = 'synchronizedMain';

    const exp = transform(env);

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies minor message', () => {
    const env = getEnv([applyMainScope(applyMinorLevel(getMessage('bar')))]);
    env.config.mode = 'synchronizedMain';
    const exp = transform(env);

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies major message and bumps all', () => {
    const env = getEnv([applyMainScope(applyMajorLevel(getMessage('baz')))]);
    env.config.mode = 'synchronizedMain';
    const exp = transform(env);

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies several messages with one breaking change', () => {
    const env = getEnv([
      applyMajorLevel(applyMainScope(getMessage('taz'))),
      getMessage('raz'),
      applyOtherScope(getMessage('roo'))
    ]);
    env.config.mode = 'synchronizedMain';

    const exp = transform(env);

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies messages with multiple affected packages', () => {
    const env = getEnv([
      applyMinorLevel(getMessage('waz')),
      applyMultiScope(getMessage('tar'))
    ]);
    env.config.mode = 'synchronizedMain';

    const exp = transform(env);

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies minor then major', () => {
    const env = getEnv([applyMinorLevel(getMessage('raz'))]);
    env.config.mode = 'synchronizedMain';

    const exp1 = transform(env);
    expect(diff(env, exp1)).toMatchSnapshot();

    exp1.messages = [applyOtherScope(applyMinorLevel(getMessage('rar')))];
    exp1.packages = R.values(exp1.packages);

    const exp2 = transform(exp1);
    expect(diff(exp1, exp2)).toMatchSnapshot();
  });

  it('applies major then minor', () => {
    const env = getEnv([applyMajorLevel(getMessage('raz'))]);
    env.config.mode = 'synchronizedMain';

    const exp1 = transform(env);
    expect(diff(env, exp1)).toMatchSnapshot();

    exp1.messages = [applyOtherScope(applyMinorLevel(getMessage('rar')))];
    exp1.packages = R.values(exp1.packages);

    const exp2 = transform(exp1);

    expect(diff(exp1, exp2)).toMatchSnapshot();
  });
});
