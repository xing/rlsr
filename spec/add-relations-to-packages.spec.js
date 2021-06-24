/* eslint-env node, jest */

const addRelationsToPackages = require('../src/transform/add-relations-to-packages');
const getEnv = require('./fixtures/env-small.fixture');

const packages = {
  one: {
    rlsr: {
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
      relations: [],
    },
  },
  two: {
    rlsr: {
      dependencies: ['three'],
      devDependencies: [],
      peerDependencies: [],
      relations: [],
    },
  },
  three: {
    rlsr: {
      dependencies: ['four'],
      devDependencies: [],
      peerDependencies: [],
      relations: [],
    },
  },
  four: {
    rlsr: {
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
      relations: [],
    },
  },
};

describe('addRelationsToPackages()', () => {
  it('converts dependencies into relations', () => {
    const env = getEnv(packages, []);
    const exp = addRelationsToPackages(env);

    expect(exp.packages.one.rlsr.relations).toEqual([]);
    expect(exp.packages.two.rlsr.relations).toEqual([]);
    expect(exp.packages.three.rlsr.relations).toEqual(['two']);
    expect(exp.packages.four.rlsr.relations).toEqual(['three']);
  });
});
