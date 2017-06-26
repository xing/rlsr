/* eslint-env node, jest */

const addRelationsToPackages = require('../src/tools/add-relations-to-packages');
const getEnv = require('./fixtures/env-small.fixture');

const packages = {
  one: {
    rlsr: {
      dependencies: [],
      relations: []
    }
  },
  two: {
    rlsr: {
      dependencies: ['three'],
      relations: []
    }
  },
  three: {
    rlsr: {
      dependencies: ['four'],
      relations: []
    }
  },
  four: {
    rlsr: {
      dependencies: [],
      relations: []
    }
  }
};

describe('addRelationsToPackages()', () => {
  it(`converts dependencies into relations`, () => {
    const env = getEnv(packages, []);
    const exp = addRelationsToPackages(env);

    expect(exp.packages.one.rlsr.relations).toEqual([]);
    expect(exp.packages.two.rlsr.relations).toEqual([]);
    expect(exp.packages.three.rlsr.relations).toEqual(['two']);
    expect(exp.packages.four.rlsr.relations).toEqual(['three']);
  });
});
