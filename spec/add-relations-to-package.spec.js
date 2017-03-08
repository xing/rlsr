/* eslint-env node, jest */
const R = require('ramda');
const addRelation = require('../src/tools/add-relations-to-package');

const packages = {
  one: {rlsr: {
    dependencies: [],
    relations: []
  }},
  two: {rlsr: {
    dependencies: ['three'],
    relations: []
  }},
  three: {rlsr: {
    dependencies: ['four'],
    relations: []
  }},
  four: {rlsr: {
    dependencies: [],
    relations: ['three']
  }}
};

describe('addRelationsToPackages()', () => {
  it(`does nothing if no dependencies are there`, () => {
    const p = R.clone(packages);
    addRelation('rlsr', p)(p.one);
    expect(p.one.rlsr.relations.length).toEqual(0);
    expect(p.two.rlsr.relations.length).toEqual(0);
    expect(p.three.rlsr.relations.length).toEqual(0);
    expect(p.four.rlsr.relations.length).toEqual(1);
  });

  it(`converts dependencies into relations`, () => {
    const p = R.clone(packages);
    addRelation('rlsr', p)(p.two);
    expect(p.one.rlsr.relations.length).toEqual(0);
    expect(p.two.rlsr.relations.length).toEqual(0);
    expect(p.three.rlsr.relations.length).toEqual(1);
    expect(p.four.rlsr.relations.length).toEqual(1);
  });

  it(`adds relations even if there are already some`, () => {
    const p = R.clone(packages);
    p.one.rlsr.dependencies.push('four');
    addRelation('rlsr', p)(p.one);
    expect(p.one.rlsr.relations.length).toEqual(0);
    expect(p.two.rlsr.relations.length).toEqual(0);
    expect(p.three.rlsr.relations.length).toEqual(0);
    expect(p.four.rlsr.relations.length).toEqual(2);
  });
});

module.exports = (nsp, pkgs) => pkg => {
  pkg[nsp].dependencies.forEach(dep => pkgs[dep][nsp].relations.push(pkg.name));
  return pkg;
};
