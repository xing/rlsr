/* eslint-env node, jest */

const R = require('ramda');
const getEnv = require('./fixtures/env-small.fixture')({
  one: {
    name: 'one',
    version: '1.2.3',
    rlsr: {},
    dependencies: {
      two: '3.2.1'
    }
  },
  two: {
    name: 'two',
    version: '3.4.5',
    rlsr: {}
  }
});

const synchronizedUpdateAllVersions = require('../src/tools/synchronized-update-all-versions');

describe('synchronizedUpdateAllVersions()', () => {
  it('updates vesions with patch level message in synchronized mode', () => {
    let env = getEnv([]);
    env = R.assocPath(['config', 'mode'], 'synchronized', env);
    env = R.assocPath(
      ['mainPackage', 'rlsr', 'determinedIncrementLevel'],
      0,
      env
    );
    const exp = synchronizedUpdateAllVersions(env);

    expect(exp.mainPackage.rlsr.determinedIncrementLevel).toBe(0);
    expect(exp.packages.one.version).toBe('3.4.6');
    expect(exp.packages.one.rlsr.determinedIncrementLevel).toBe(0);
  });

  it('updates vesions with minor level message in synchronized mode', () => {
    let env = getEnv([]);
    env = R.assocPath(['config', 'mode'], 'synchronized', env);
    env = R.assocPath(
      ['mainPackage', 'rlsr', 'determinedIncrementLevel'],
      1,
      env
    );
    const exp = synchronizedUpdateAllVersions(env);

    expect(exp.mainPackage.rlsr.determinedIncrementLevel).toBe(1);
    expect(exp.packages.one.version).toBe('3.5.0');
    expect(exp.packages.one.rlsr.determinedIncrementLevel).toBe(1);
  });

  it('updates vesions with major level message in synchronized mode', () => {
    let env = getEnv([]);
    env = R.assocPath(['config', 'mode'], 'synchronized', env);
    env = R.assocPath(
      ['mainPackage', 'rlsr', 'determinedIncrementLevel'],
      2,
      env
    );
    const exp = synchronizedUpdateAllVersions(env);

    expect(exp.mainPackage.rlsr.determinedIncrementLevel).toBe(2);
    expect(exp.packages.one.version).toBe('4.0.0');
    expect(exp.packages.one.rlsr.determinedIncrementLevel).toBe(2);
  });
});
