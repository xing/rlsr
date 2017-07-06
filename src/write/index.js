const writePackage = require('./write-package-json');
const writeChangelog = require('./write-changelog');
const writeMainPackage = require('./write-main-package-json');
const writeMainChangelog = require('./write-central-changelog');

module.exports = env =>
  Promise.all([
    ...env.packages.map(writePackage(env)),
    ...env.packages.map(writeChangelog(env)),
    writeMainPackage(env),
    writeMainChangelog(env)
  ]).then(() => {
    env.log('step PRE PUBLISH finished');
  });
