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
    env.config.mode = 'range';

    const exp = transform(env);

    expect(exp.packages.one.dependencies.four).toBe('^4.5.0'); // not changed
    expect(exp.packages.one.version).toBe('1.2.3');
    expect(exp.packages.three.dependencies.four).toBe('^4');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('2.3.4 - 3'); // also in range
    expect(exp.packages.two.version).toBe('2.3.4');

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies minor message', () => {
    const env = getEnv([applyMainScope(applyMinorLevel(getMessage('bar')))]);
    env.config.mode = 'range';
    const exp = transform(env);

    expect(exp.packages.one.dependencies.four).toBe('^4.5.0'); // not changed
    expect(exp.packages.one.version).toBe('1.2.3');
    expect(exp.packages.three.dependencies.four).toBe('^4');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('2.3.4 - 3'); // also in range
    expect(exp.packages.two.version).toBe('2.3.4');

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies major message', () => {
    const env = getEnv([applyMainScope(applyMajorLevel(getMessage('baz')))]);
    env.config.mode = 'range';
    const exp = transform(env);

    expect(exp.packages.one.dependencies.four).toBe('^5'); // changed
    expect(exp.packages.one.version).toBe('1.2.4');
    expect(exp.packages.three.dependencies.four).toBe('^5');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('2.3.4 - 3'); // in range
    expect(exp.packages.two.version).toBe('2.3.4');

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies several messages', () => {
    const env = getEnv([
      applyMinorLevel(applyMainScope(getMessage('taz'))), // four 4.6.0
      getMessage('raz'), // one 1.2.4
      applyOtherScope(getMessage('roo')), // three 3.4.6
    ]);
    env.config.mode = 'range';

    const exp = transform(env);

    expect(exp.packages.one.dependencies.four).toBe('^4.5.0'); // in range
    expect(exp.packages.one.version).toBe('1.2.4');
    expect(exp.packages.three.dependencies.four).toBe('^4');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('2.3.4 - 3'); // in range
    expect(exp.packages.two.version).toBe('2.3.4');

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies messages with multiple affected packages', () => {
    const env = getEnv([
      applyMinorLevel(getMessage('waz')), // one 1.3.0
      applyMultiScope(getMessage('tar')), // two 2.3.5 three 3.4.6
    ]);
    env.config.mode = 'range';

    const exp = transform(env);

    expect(exp.packages.one.version).toBe('1.3.0');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('2.3.4 - 3');
    expect(exp.packages.two.version).toBe('2.3.5');

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies minor then major', () => {
    const env = getEnv([applyMinorLevel(getMessage('raz'))]); // one 1.3.0
    env.config.mode = 'range';

    const exp1 = transform(env);
    expect(diff(env, exp1)).toMatchSnapshot();

    exp1.messages = [applyOtherScope(applyMajorLevel(getMessage('rar')))]; // three 4.0.0

    const exp2 = transform(exp1);
    expect(diff(exp1, exp2)).toMatchSnapshot();
  });

  it('applies major then minor', () => {
    const env = getEnv([applyMajorLevel(getMessage('raz'))]);
    env.config.mode = 'range';

    const exp1 = transform(env);
    expect(diff(env, exp1)).toMatchSnapshot();

    exp1.messages = [applyOtherScope(applyMinorLevel(getMessage('rar')))];

    const exp2 = transform(exp1);
    expect(diff(exp1, exp2)).toMatchSnapshot();
  });
});
