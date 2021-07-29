const R = require('ramda');

const writePackage = require('./write-package-json');
const writeChangelog = require('./write-changelog');
const writeMainPackage = require('./write-main-package-json');
const writeMainChangelog = require('./write-central-changelog');

module.exports = (env) =>
  Promise.all([
    ...R.values(env.packages).map(writePackage(env)),
    ...R.values(env.packages).map(writeChangelog(env)),
    writeMainPackage(env),
    writeMainChangelog(env),
  ]).then((res) => {
    env.log(`processed ${res.length} entities`);
  });
