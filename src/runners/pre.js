const R = require('ramda');
const path = require('path');
const latestTag = require('../tools/get-latest-semver-tag');
const messages = require('../tools/get-parsed-commit-messages');
const packages = require('../tools/get-packages');
const polish = require('../tools/polish-package');
const addRelations = require('../tools/add-relations-to-package');
const updateRelatedVersionNumber = require('../tools/update-related-version-number');
const updateVersionNumber = require('../tools/update-version-number');
const writeChangelog = require('../tools/write-changelog');
const cleanPackage = require('../tools/clean-package');
const writePackageJson = require('../tools/write-package-json');
const writeMainPackageJson = require('../tools/write-main-package-json');

module.exports = env => {
  env.log('running step PRE PUBLISH');

  // retrieve last semver tag
  latestTag
    // gather all the data
    .then(tag => {
      env.log(`last semver tag <${tag}>`);
      return Promise.all([messages(tag), packages(path.join(env.appRoot, env.packagePath), env.nsp)]);
    })
    // assign messages to packages
    .then(([msgs, pkgs]) => {
      env.log(`<${pkgs.length}> packages`);

      const flatPackages = pkgs.map(polish(env.nsp, pkgs.map(pkg => pkg.name)));
      const indexedPackages = R.indexBy(R.prop('name'), flatPackages);
      msgs.forEach(msg => {
        env.dbg(`[${msg.level}] ${msg.type}(${msg.scope}): ${msg.subject}`);
        const relatedPackage = indexedPackages[msg.scope];
        if (relatedPackage) {
          relatedPackage[env.nsp].messages.push({
            type: msg.type,
            package: relatedPackage.name,
            level: msg.level,
            subject: msg.subject,
            mentions: msg.mentions,
            notes: msg.notes,
            body: msg.body,
            footer: msg.footer
          });
        }
      });
      env.log(`<${msgs.length}> relevant commits`);
      return indexedPackages;
    })
    // determine related packages
    .then(packages => {
      R.values(packages).forEach(addRelations(env.nsp, packages));
      return packages;
    })
    // update version numbers
    .then(packages => {
      R.values(packages).forEach(updateVersionNumber(env.nsp, packages));
      R.values(packages).forEach(updateRelatedVersionNumber(env.nsp, packages));
      return packages;
    })
    // write main package.json
    .then(packages => {
      return writeMainPackageJson(R.values(packages), env)
        .then(() => packages);
    })
    // write changelogs
    .then(packages => {
      return Promise
        .all(R.values(packages).map(writeChangelog(env.nsp)))
        .then(() => packages);
    })
    // write package.jsons
    .then(packages => {
      R.values(packages)
        .map(pkg => {
          const bumps = ['patch bump to ', 'minor bump to ', 'MAJOR bump to '];
          env.log(`${pkg.name}: ${pkg[env.nsp].determinedIncrementLevel === -1 ? '-' : bumps[pkg[env.nsp].determinedIncrementLevel] + pkg.version}`);
          return pkg;
        })
        .map(cleanPackage(env.nsp))
        .forEach(writePackageJson(env.nsp));
    })
    .catch(e => {
      env.err(e);
      process.exit(1);
    });
};
