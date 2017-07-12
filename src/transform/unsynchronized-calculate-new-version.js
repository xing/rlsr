const R = require('ramda');
const semver = require('./semver');
const modifyPackages = require('./modify-packages');

const max = R.apply(Math.max);

module.exports = env => {
  const packages = R.clone(env.packages);
  const nsp = env.consts.nsp;
  const latest = env.consts.rlsrLatest;

  const getNewRange = (newVersion, oldRange) => {
    if (env.config.mode === 'exact') {
      return newVersion;
    }
    if (oldRange === latest) {
      return `^${newVersion}`;
    }
    return semver.adjustRange(newVersion, oldRange);
  };

  R.values(packages).forEach(iteratedPackage => {
    iteratedPackage[nsp].determinedIncrementLevel = max(
      iteratedPackage[nsp].messages.map(m => m.level).concat([-1])
    );

    if (iteratedPackage[nsp].determinedIncrementLevel > -1) {
      iteratedPackage.version = semver.bump(
        iteratedPackage.version,
        iteratedPackage[nsp].determinedIncrementLevel
      );
      iteratedPackage[nsp].hasBump = true;
    }
  });

  const addDependencyToPackage = (updatedPackage, dependentPackage, type) => {
    const oldRange = updatedPackage[type][dependentPackage.name];
    const newRange = getNewRange(
      dependentPackage.version,
      updatedPackage[type][dependentPackage.name]
    );

    if (newRange !== oldRange) {
      updatedPackage[type][dependentPackage.name] = newRange;

      updatedPackage[nsp].relatedMessages = updatedPackage[nsp].relatedMessages
        .concat(
          dependentPackage[nsp].messages.map(m =>
            Object.assign({}, m, {
              package: dependentPackage.name,
              version: dependentPackage.version,
              dependencyType: type
            })
          )
        )
        .concat(
          dependentPackage[nsp].relatedMessages.map(m =>
            Object.assign({}, m, { source: dependentPackage.name })
          )
        );
      if (!updatedPackage[nsp].hasBump) {
        updatedPackage[nsp].determinedIncrementLevel = 0;
        updatedPackage[nsp].hasBump = true;
        updatedPackage.version = semver.bump(updatedPackage.version, 0);
      }
      updatedPackage[nsp].relations.forEach(rel =>
        addDependencyToPackage(packages[rel], updatedPackage, 'dependencies')
      );
      updatedPackage[nsp].devRelations.forEach(rel =>
        addDependencyToPackage(packages[rel], updatedPackage, 'devDependencies')
      );
      updatedPackage[nsp].peerRelations.forEach(rel =>
        addDependencyToPackage(
          packages[rel],
          updatedPackage,
          'peerDependencies'
        )
      );
    }
    // out of range - bump relation und add dependency erneut aufrufen fuer alle relations
  };

  R.values(packages).forEach(iteratedPackage => {
    if (iteratedPackage[nsp].hasBump) {
      iteratedPackage[nsp].relations.forEach(rel =>
        addDependencyToPackage(packages[rel], iteratedPackage, 'dependencies')
      );
      iteratedPackage[nsp].devRelations.forEach(rel =>
        addDependencyToPackage(
          packages[rel],
          iteratedPackage,
          'devDependencies'
        )
      );
      iteratedPackage[nsp].peerRelations.forEach(rel =>
        addDependencyToPackage(
          packages[rel],
          iteratedPackage,
          'peerDependencies'
        )
      );
    }
  });

  // make entries in related messages unique
  R.values(packages).forEach(iteratedPackage => {
    const relatedMessages = {};
    iteratedPackage[nsp].relatedMessages.forEach(msg => {
      const key = msg.type + msg.subject + msg.affected.join();
      relatedMessages[key] = msg;
    });
    iteratedPackage[nsp].relatedMessages = R.values(relatedMessages);
  });

  return modifyPackages(packages, env);
};
