const R = require('ramda');
const bump = require('./bump');

module.exports = (nsp, packages) => pkg => {
  const incrementLevelThroughRelation = pkg[nsp].relatedMessages.length > 0 ? 0 : -1;
  const incrementLevelsThroughMessages = pkg[nsp].messages.map(msg => msg.level);

  pkg[nsp].determinedIncrementLevel = R.last([incrementLevelThroughRelation, ...incrementLevelsThroughMessages].sort());

  pkg.version = bump(pkg.version, pkg[nsp].determinedIncrementLevel);
  pkg[nsp].relations.forEach(rel => {
    const relatedPackage = packages[rel];
    relatedPackage.dependencies[pkg.name] = pkg.version;
  });
};
