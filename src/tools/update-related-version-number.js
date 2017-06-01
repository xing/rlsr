const semver = require('./semver');

module.exports = (env, packages) => pkg => {
  if (pkg[env.nsp].relatedMessages.length > 0 && !pkg[env.nsp].hasBump) {
    pkg.version = semver.bump(pkg.version, 0);
    pkg[env.nsp].determinedIncrementLevel = 0;
  }
};
