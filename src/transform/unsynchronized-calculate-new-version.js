const R = require('ramda');
const semver = require('./semver');
const modifyPackages = require('./modify-packages');

const max = R.apply(Math.max);

module.exports = env => {
  const packages = R.clone(env.packages);
  const nsp = env.consts.nsp;
  const latest = env.consts.rlsrLatest;

  const getNewRange = (newVersion, oldRange) => {
    if (oldRange === latest) {
      return `^${newVersion}`;
    }
    return semver.adjustRange(newVersion, oldRange);
  };

  R.values(packages).forEach(pkg => {
    const addDependencyToPackage = (p, dependency, type) => {
      const addMessages = () => {
        p[nsp].relatedMessages = p[nsp].relatedMessages
          .concat(
            dependency[nsp].messages.map(m =>
              Object.assign({}, m, {
                package: dependency.name,
                version: dependency.version,
                dependencyType: type
              })
            )
          )
          .concat(
            dependency[nsp].relatedMessages.map(m =>
              Object.assign({}, m, { source: dependency.name })
            )
          );
      };

      if (env.config.mode === 'exact') {
        p[type][dependency.name] = latest;
        addMessages();
        p[nsp].relations &&
          p[nsp].relations.forEach(rel =>
            addDependencyToPackage(packages[rel], p, type)
          );
        if (p[nsp].determinedIncrementLevel < 0) {
          p[nsp].determinedIncrementLevel = 0;
        }
      } else {
        const oldRange = p[type][dependency.name];
        const newRange = getNewRange(dependency.version, oldRange);
        p[type][pkg.name] = newRange;
        if (oldRange !== newRange) {
          addMessages();
        }
      }
    };

    pkg[nsp].determinedIncrementLevel = max(
      pkg[nsp].messages.map(m => m.level).concat([-1])
    );

    if (pkg[nsp].determinedIncrementLevel > -1) {
      pkg.version = semver.bump(pkg.version, pkg[nsp].determinedIncrementLevel);
      pkg[nsp].hasBump = true;
      pkg[nsp].relations.forEach(rel =>
        addDependencyToPackage(packages[rel], pkg, 'dependencies')
      );
      pkg[nsp].devRelations.forEach(rel =>
        addDependencyToPackage(packages[rel], pkg, 'devDependencies')
      );
      pkg[nsp].peerRelations.forEach(rel =>
        addDependencyToPackage(packages[rel], pkg, 'peerDependencies')
      );
    }
  });

  return modifyPackages(packages, env);
};
