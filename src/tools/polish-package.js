const R = require('ramda');
const parseVersion = require('./parse-version');

module.exports = (nsp, pkgNames) => pkg => {
  pkg[nsp] = Object.assign({}, pkg[nsp], {
    version: parseVersion(pkg.version),
    messages: [],
    relatedMessages: [],
    relations: [],
    determinedIncrementLevel: -1,
    dependencies: pkg.dependencies ? Object.keys(pkg.dependencies).filter(depName => R.contains(depName, pkgNames)) : []
  });
  return pkg;
};

