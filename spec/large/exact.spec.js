/* eslint-env node, jest */
const R = require('ramda');
const transform = require('../../src/transform');
const getEnv = require('../fixtures/env-large.fixture');
const getMessage = require('../fixtures/message-large.fixture');
const diff = require('recursive-diff').getDiff;

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
    env.config.mode = 'exact';

    const exp = transform(env);

    expect(exp.packages.one.dependencies.four).toBe('4.5.7');
    expect(exp.packages.one.version).toBe('1.2.4');
    expect(exp.packages.three.dependencies.four).toBe('4.5.7');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('3.4.6');
    expect(exp.packages.two.version).toBe('2.3.5');

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies minor message', () => {
    const env = getEnv([applyMainScope(applyMinorLevel(getMessage('bar')))]);
    env.config.mode = 'exact';
    const exp = transform(env);

    expect(exp.packages.one.dependencies.four).toBe('4.6.0');
    expect(exp.packages.one.version).toBe('1.2.4');
    expect(exp.packages.three.dependencies.four).toBe('4.6.0');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('3.4.6');
    expect(exp.packages.two.version).toBe('2.3.5');

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies major message', () => {
    const env = getEnv([applyMainScope(applyMajorLevel(getMessage('baz')))]);
    env.config.mode = 'exact';
    const exp = transform(env);

    expect(exp.packages.one.dependencies.four).toBe('5.0.0');
    expect(exp.packages.one.version).toBe('1.2.4');
    expect(exp.packages.three.dependencies.four).toBe('5.0.0');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('3.4.6');
    expect(exp.packages.two.version).toBe('2.3.5');

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies several messages', () => {
    const env = getEnv([
      applyMinorLevel(applyMainScope(getMessage('taz'))), // four 4.6.0
      getMessage('raz'), // one 1.2.4
      applyOtherScope(getMessage('roo')), // three 3.4.6
    ]);
    env.config.mode = 'exact';

    const exp = transform(env);

    expect(exp.packages.one.dependencies.four).toBe('4.6.0');
    expect(exp.packages.one.version).toBe('1.2.4');
    expect(exp.packages.three.dependencies.four).toBe('4.6.0');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('3.4.6');
    expect(exp.packages.two.version).toBe('2.3.5');

    expect(diff(env, exp)).toMatchSnapshot();
  });

  it('applies messages with multiple affected packages', () => {
    const env = getEnv([
      applyMinorLevel(getMessage('waz')), // one 1.3.0
      applyMultiScope(getMessage('tar')), // two 2.3.5 three 3.4.6
    ]);
    env.config.mode = 'exact';

    const exp = transform(env);

    expect(exp.packages.one.version).toBe('1.3.0');
    expect(exp.packages.three.version).toBe('3.4.6');
    expect(exp.packages.two.dependencies.three).toBe('3.4.6');
    expect(exp.packages.two.version).toBe('2.3.5');

    expect(diff(env, exp)).toMatchSnapshot();
  });
});
