const R = require('ramda');

const bump = require('./semver').bump;
const modifyPackages = require('./modify-packages');

const determineHighestPackage = (env) => {
  const versions = R.values(env.packages).map((p) => p.version);
  return versions.sort().pop();
};

module.exports = (env) => {
  const highestPackageVersion = determineHighestPackage(env);
  const determinedNewVersion = [
    env.mainPackage.version,
    bump(
      highestPackageVersion,
      env.mainPackage[env.consts.nsp].determinedIncrementLevel
    ),
  ]
    .sort()
    .pop();

  const determinedDependencyRange =
    env.config.mode === 'synchronizedMain'
      ? `^${determinedNewVersion}`
      : determinedNewVersion;

  const packages = R.clone(env.packages);
  R.values(packages).forEach((p) => {
    p.version = determinedNewVersion;
    p[env.consts.nsp].determinedIncrementLevel =
      env.mainPackage[env.consts.nsp].determinedIncrementLevel;
    p[env.consts.nsp].hasBump = true;
    p[env.consts.nsp].dependencies &&
      p[env.consts.nsp].dependencies.forEach(
        (dep) => (p.dependencies[dep] = determinedDependencyRange)
      );
    p[env.consts.nsp].devDependencies &&
      p[env.consts.nsp].devDependencies.forEach(
        (dep) => (p.devDependencies[dep] = determinedDependencyRange)
      );
    p[env.consts.nsp].peerDependencies &&
      p[env.consts.nsp].peerDependencies.forEach(
        (dep) => (p.peerDependencies[dep] = determinedDependencyRange)
      );
  });
  const res = modifyPackages(packages, env);
  res.mainPackage.version = determinedNewVersion;
  return res;
};
