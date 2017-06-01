const semver = require('./semver');

module.exports = (env, packages) => pkg => {
  const nsp = env.nsp;
  const RLSR_LATEST_DECLARATION = env.rlsrLatest;
  const exactRelations = env.exactRelations;
  const getNewRange = (newVersion, oldRange) => {
    if (oldRange === RLSR_LATEST_DECLARATION) {
      return `^${newVersion}`;
    }
    return semver.adjustRange(newVersion, oldRange);
  };

  const addDependencyToPackage = (p, dependency) => {
    const addMessages = () => {
      p[nsp].relatedMessages = p[nsp].relatedMessages
        .concat(
          dependency[nsp].messages.map(m =>
            Object.assign({}, m, {
              package: dependency.name,
              version: dependency.version
            })
          )
        )
        .concat(
          dependency[nsp].relatedMessages.map(m =>
            Object.assign({}, m, { source: dependency.name })
          )
        );
    };

    if (exactRelations) {
      p.dependencies[dependency.name] = RLSR_LATEST_DECLARATION;
      p[nsp].relations &&
        p[nsp].relations.forEach(rel =>
          addDependencyToPackage(packages[rel], p)
        );
      if (p[nsp].determinedIncrementLevel === -1) {
        p[nsp].determinedIncrementLevel = 0;
      }
      addMessages();
    } else {
      const oldRange = p.dependencies[dependency.name];
      const newRange = getNewRange(dependency.version, oldRange);
      p.dependencies[pkg.name] = newRange;
      if (oldRange !== newRange) {
        addMessages();
      }
    }

    console.log('updateVersionNumber', p.name, p[nsp].relatedMessages);
  };

  const incrementLevelsThroughMessages = pkg[nsp].messages.map(
    msg => msg.level
  );

  pkg[nsp].determinedIncrementLevel = Math.max.apply(null, [
    pkg[nsp].determinedIncrementLevel,
    ...incrementLevelsThroughMessages
  ]);

  if (pkg[nsp].determinedIncrementLevel > -1) {
    pkg.version = semver.bump(pkg.version, pkg[nsp].determinedIncrementLevel);
    pkg[nsp].hasBump = true;
    pkg[nsp].relations.forEach(rel =>
      addDependencyToPackage(packages[rel], pkg)
    );
  }
};
