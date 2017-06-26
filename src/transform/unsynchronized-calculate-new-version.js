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

      if (env.config.mode === 'exact') {
        p.dependencies[dependency.name] = latest;
        addMessages();
        p[nsp].relations &&
          p[nsp].relations.forEach(rel =>
            addDependencyToPackage(packages[rel], p)
          );
        if (p[nsp].determinedIncrementLevel < 0) {
          p[nsp].determinedIncrementLevel = 0;
        }
      } else {
        const oldRange = p.dependencies[dependency.name];
        const newRange = getNewRange(dependency.version, oldRange);
        p.dependencies[pkg.name] = newRange;
        if (oldRange !== newRange) {
          addMessages();
        }
      }
    };

    pkg[env.consts.nsp].determinedIncrementLevel = max(
      pkg[env.consts.nsp].messages.map(m => m.level).concat([-1])
    );

    if (pkg[env.consts.nsp].determinedIncrementLevel > -1) {
      pkg.version = semver.bump(
        pkg.version,
        pkg[env.consts.nsp].determinedIncrementLevel
      );
      pkg[env.consts.nsp].hasBump = true;
      pkg[env.consts.nsp].relations.forEach(rel =>
        addDependencyToPackage(packages[rel], pkg)
      );
    }
  });

  return modifyPackages(packages, env);
};
