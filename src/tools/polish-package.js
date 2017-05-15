const R = require('ramda');

module.exports = (nsp, pkgNames) => pkg => {
  pkg[nsp] = Object.assign({}, pkg[nsp], {
    messages: [],
    relatedMessages: [],
    relations: [],
    determinedIncrementLevel: -1,
    dependencies: pkg.dependencies ? Object.keys(pkg.dependencies).filter(depName => R.contains(depName, pkgNames)) : []
  });
  return pkg;
};
