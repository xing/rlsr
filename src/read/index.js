const R = require('ramda');
const path = require('path');
const getLatestSemverTag = require('./getLatestSemverTag');
const getParsedCommitMessages = require('./getParsedCommitMessages');
const getPackages = require('./getPackages');

const indexedPackages = R.indexBy(R.prop('name'));

module.exports = env => {
  env.log('running step PRE PUBLISH');
  env.log(`mode ${env.exactRelations ? 'EXACT' : 'RANGE'}`);

  return getLatestSemverTag
    .then(tag => {
      env.log(`last semver tag <${tag}>`);
      return Promise.all([
        getParsedCommitMessages(tag),
        getPackages(path.join(env.appRoot, env.config.packagePath), env.nsp)
      ]);
    })
    .then(([messages, p]) => {
      env.log(`<${p.length}> packages`);
      return Object.assign({}, env, { messages, packages: indexedPackages(p) });
    });
};
