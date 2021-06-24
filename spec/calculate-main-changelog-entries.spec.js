/* eslint-env node, jest */
const R = require('ramda');

const calculateMainChangelogEntries = require('../src/transform/calculate-main-changelog-entries');

const getEnv = require('./fixtures/env-small.fixture');
const getMessage = require('./fixtures/message-small.fixture');

describe('calculateMainChangelogEntries()', () => {
  const envProto = getEnv(
    {
      one: {
        name: 'one',
        version: '1.2.3',
        rlsr: {
          hasBump: true,
          determinedIncrementLevel: 0,
          messages: [getMessage('foo')],
          relatedMessages: [],
        },
      },
    },
    []
  );
  envProto.mainPackage = {
    version: '2.3.4',
  };

  it('adds a fresh changelog if nothing was available before', () => {
    Date.now = jest.fn(() => 0);
    const env = R.clone(envProto);
    const exp = calculateMainChangelogEntries(env);
    const changelog = exp.changelog;
    R.values(changelog);

    expect(changelog).toMatchSnapshot();
  });

  it('adds an entry to an existing changelog', () => {
    Date.now = jest.fn(() => 0);
    const env = R.clone(envProto);
    env.changelog = { '1.2.3': 'foo' };
    const exp = calculateMainChangelogEntries(env);
    const changelog = exp.changelog;
    R.values(changelog);

    expect(changelog).toMatchSnapshot();

    // Check if the order is correct
    expect(Object.keys(changelog)).toEqual(['2.3.4', '1.2.3']);
  });
});
