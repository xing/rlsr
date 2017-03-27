const semver = require('./semver');

const RLSR_LATEST_DECLARATION = 'rlsr-latest';

const KEY_DEV_DEPENDENCIES = require('./dependency-types').KEY_DEV_DEPENDENCIES;
const dependencyKeys = require('./dependency-types').dependencyKeys;

function getNewRange(newVersion, oldRange) {
  if (oldRange === RLSR_LATEST_DECLARATION) {
    return `^${newVersion}`;
  }

  return semver.adjustRange(newVersion, oldRange);
}

function getDependencyTypes(pkg, name) {
  return dependencyKeys.filter((key) => {
    return pkg[key] && pkg[key][name];
  });
}

module.exports = (nsp, packages) => pkg => {
  const incrementLevelsThroughMessages = pkg[nsp].messages.map(msg => msg.level);

  pkg[nsp].determinedIncrementLevel = Math.max.apply(null, [pkg[nsp].determinedIncrementLevel, ...incrementLevelsThroughMessages]);

  pkg.version = semver.bump(pkg.version, pkg[nsp].determinedIncrementLevel);
  pkg[nsp].relations.forEach(rel => {
    const relatedPackage = packages[rel];
    const dependencyTypes = getDependencyTypes(relatedPackage, pkg.name);
    const isOnlyDev = dependencyTypes.length === 1 && dependencyTypes[0] === KEY_DEV_DEPENDENCIES;

    const hasUpdate = dependencyTypes.reduce((result, key) => {
      const oldRange = relatedPackage[key][pkg.name];
      const newRange = getNewRange(pkg.version, oldRange);

      relatedPackage[key][pkg.name] = newRange;

      return result || oldRange !== newRange;
    }, false);

    if (hasUpdate && !isOnlyDev && relatedPackage[nsp].determinedIncrementLevel === -1) {
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
