const semver = require('./semver');

module.exports = (nsp, packages) => pkg => {
  const incrementLevelsThroughMessages = pkg[nsp].messages.map(msg => msg.level);

  pkg[nsp].determinedIncrementLevel = Math.max.apply(null, [pkg[nsp].determinedIncrementLevel, ...incrementLevelsThroughMessages]);

  pkg.version = semver.bump(pkg.version, pkg[nsp].determinedIncrementLevel);
  pkg[nsp].relations.forEach(rel => {
    const relatedPackage = packages[rel];
    const oldRange = relatedPackage.dependencies[pkg.name];
    const newRange = semver.adjustRange(pkg.version, oldRange);
    relatedPackage.dependencies[pkg.name] = newRange;
    if (oldRange !== newRange && relatedPackage[nsp].determinedIncrementLevel === -1) {
      relatedPackage[nsp].determinedIncrementLevel = 0;
      relatedPackage[nsp].relatedMessages = relatedPackage[nsp].relatedMessages.concat(
        pkg[nsp].messages.map(m => Object.assign(
          {},
          m,
          {package: pkg.name, version: pkg.version}
        ))
      );
    }
  });
};
