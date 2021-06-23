const R = require('ramda');
const semver = require('./semver');
const modifyPackages = require('./modify-packages');

module.exports = (env) => {
  const packages = R.clone(env.packages);
  R.values(packages).forEach((pkg) => {
    if (
      pkg[env.consts.nsp].relatedMessages.length > 0 &&
      !pkg[env.consts.nsp].hasBump
    ) {
      pkg.version = semver.bump(pkg.version, 0);
      pkg[env.consts.nsp].hasBump = true;
      pkg[env.consts.nsp].determinedIncrementLevel = 0;
    }
  });

  return modifyPackages(packages, env);
};
