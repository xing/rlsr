const semver = require('./semver');

module.exports = (nsp, packages) => pkg => {
  if (pkg[nsp].relatedMessages.length > 0 && !pkg[nsp].hasBump) {
    pkg.version = semver.bump(pkg.version, 0);
    pkg[nsp].determinedIncrementLevel = 0;
  }
};
