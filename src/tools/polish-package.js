const R = require('ramda');

const dependencyKeys = require('./dependency-types').dependencyKeys;

function gatherDependencies(pkg, keys) {
  return dependencyKeys.reduce((result, key) => {
    return result.concat(pkg[key] ? Object.keys(pkg[key]) : []);
  }, []);
}

module.exports = (nsp, pkgNames) => pkg => {
  pkg[nsp] = Object.assign({}, pkg[nsp], {
    messages: [],
    relatedMessages: [],
    relations: [],
    determinedIncrementLevel: -1,
    dependencies: gatherDependencies(pkg).filter(depName => R.contains(depName, pkgNames))
  });
  return pkg;
};

