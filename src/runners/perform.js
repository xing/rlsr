const path = require('path');
const exec = require('../tools/exec');
const R = require('ramda');
const packages = require('../tools/get-packages');
const writeCleanedPackageJson = require('../tools/write-cleaned-main-package-json');

module.exports = env => {
  env.log('running step PERFORM PUBLISH');
  const shell = exec(env.log, env.dbg);

  // commit the current state
  shell('git add .')
    .then(shell(`git commit -m "chore: release ${env.version}"`))

    // fetch packages
    .then(() => packages(path.join(env.appRoot, env.packagePath || './packages'), env.nsp))

    .then(flatPackages => {
      return R.indexBy(R.prop('name'), flatPackages);
    })

    // filter unreleased
    .then(packages => {
      return env.previouslyUnreleased.map(packageName => packages[packageName]);
    })

    // add tag for every changed component
    .then(packages => Promise.all(packages.map(
      p => shell(`git tag -a -m 'chore: tagged ${p.name}@${p.version}' ${p.name}@${p.version}`)
    )).then(() => packages))

    // npm publish all packages
    .then(packages => Promise.all(packages.map(
      p => shell(`npm publish ${p[env.nsp].dir}`)

    // clean up main package.json
    )).then(writeCleanedPackageJson(env)))

    // npm publish every changed component
    .catch(e => {
      env.err(e);
      process.exit(1);
    });
};
