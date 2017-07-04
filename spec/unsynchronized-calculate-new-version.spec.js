/* eslint-env node, jest */

const R = require('ramda');
const unsynchronizedCalculateNewVersion = require('../src/transform/unsynchronized-calculate-new-version');
const getEnv = require('./fixtures/env-small.fixture');
const getMessage = require('./fixtures/message-small.fixture');

describe('unsynchronizedCalculateNewVersion()', () => {
  const baseEnv = getEnv(
    {
      one: {
        version: '1.2.3',
        name: 'one',
        rlsr: {
          messages: [getMessage('foo')],
          relatedMessages: [],
          relations: [],
          devRelations: [],
          peerRelations: []
        }
      },
      two: {
        version: '2.3.4',
        name: 'two',
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        rlsr: { messages: [], relatedMessages: [], relations: [] }
      }
    },
    []
  );

  it('updates a package version by one single message', () => {
    const env = R.clone(baseEnv);

    env.config = {
      mode: 'synchronized'
    };

    const exp = unsynchronizedCalculateNewVersion(env);

    expect(exp.packages.one.rlsr.determinedIncrementLevel).toBe(2);
    expect(exp.packages.one.rlsr.hasBump).toBeTruthy();
    expect(exp.packages.one.version).toBe('2.0.0');
  });

  it('updates a package version with two message', () => {
    const env = R.clone(baseEnv);
    const message = R.assoc('level', 0, getMessage('bar'));
    env.packages.one.rlsr.messages.push(message);
    env.config = {
      mode: 'synchronized'
    };

    const exp = unsynchronizedCalculateNewVersion(env);

    expect(exp.packages.one.rlsr.determinedIncrementLevel).toBe(2);
    expect(exp.packages.one.rlsr.hasBump).toBeTruthy();
    expect(exp.packages.one.version).toBe('2.0.0');
  });

  it('spreads the message to the relations in range mode', () => {
    const env = R.clone(baseEnv);

    env.config = {
      mode: 'range'
    };
    env.packages.one.rlsr.relations.push('two');
    env.packages.one.rlsr.devRelations.push('two');
    env.packages.one.rlsr.peerRelations.push('two');
    env.packages.two.dependencies.one = '1.2.3';
    env.packages.two.devDependencies.one = '1.2.3';
    env.packages.two.peerDependencies.one = '1.2.3';

    const exp = unsynchronizedCalculateNewVersion(env);

    expect(exp.packages.one.rlsr.determinedIncrementLevel).toBe(2);
    expect(exp.packages.one.version).toBe('2.0.0');
    expect(exp.packages.two.dependencies.one).toBe('1.2.3 - 2');
    expect(exp.packages.two.devDependencies.one).toBe('1.2.3 - 2');
    expect(exp.packages.two.peerDependencies.one).toBe('1.2.3 - 2');
    expect(exp.packages.two.rlsr.relatedMessages).toHaveLength(3);
  });

  it('doesnt spread the message in range mode if the range is sufficient', () => {
    const env = R.clone(baseEnv);

    env.config = {
      mode: 'range'
    };
    env.packages.one.rlsr.relations.push('two');
    env.packages.two.dependencies.one = '1.2.3 - 2';

    const exp = unsynchronizedCalculateNewVersion(env);

    expect(exp.packages.two.dependencies.one).toBe('1.2.3 - 2');
    expect(exp.packages.two.rlsr.relatedMessages).toHaveLength(0);
  });

  it('spreads the message to the relations in exact mode', () => {
    const env = R.clone(baseEnv);

    env.config = {
      mode: 'exact'
    };
    env.packages.one.rlsr.relations.push('two');
    env.packages.two.dependencies.one = '1.2.3';

    const exp = unsynchronizedCalculateNewVersion(env);

    expect(exp.packages.one.rlsr.determinedIncrementLevel).toBe(2);
    expect(exp.packages.one.version).toBe('2.0.0');
    expect(exp.packages.two.dependencies.one).toBe('rlsr-latest');
    expect(exp.packages.two.rlsr.relatedMessages).toHaveLength(1);
  });
});
