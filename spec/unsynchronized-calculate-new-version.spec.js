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
          relations: []
        }
      },
      two: {
        version: '2.3.4',
        name: 'two',
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

  // it('spreads the message to the relations in sync mode', () => {
  //   const env = R.clone(baseEnv);

  //   env.config = {
  //     mode: 'synchronized'
  //   };
  //   env.packages.one.rlsr.relations.push('two');
  //   env.packages.two.dependencies.one = '1.2.3';

  //   const exp = unsynchronizedCalculateNewVersion(env);

  //   expect(exp.packages.one.rlsr.determinedIncrementLevel).toBe(2);
  //   expect(exp.packages.one.version).toBe('2.0.0');
  // });
});
