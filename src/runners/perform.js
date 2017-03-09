const path = require('path');
const exec = require('../tools/exec');
const R = require('ramda');
const packages = require('../tools/get-packages');
const writeCleanedPackageJson = require('../tools/write-cleaned-main-package-json');

module.exports = env => {
  env.log('running step PERFORM PUBLISH');

  if (env.previouslyUnreleased) {
    const shell = exec(env.log, env.dbg);

    env.log(`Previously unreleased packages: <${env.previouslyUnreleased.length}>`);

    shell(`git add . && git commit -m "chore: release ${env.version}"`)

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
      )))

      // clean up main package.json
      .then(writeCleanedPackageJson(env))

      // commit main package.json
      .then(() => shell(`git add . && git commit -m "chore: update main package ${env.version}"`))
      .then(() => shell(`git tag -a -m 'chore: tagged main package @ ${env.version}' ${env.version}`))
      .then(() => shell(`git push --follow-tags`))

      // npm publish every changed component
      .catch(e => {
        env.err(e);
        process.exit(1);
      });
  } else {
    env.log('no previously unreleased packages. Stopping now ...');
  }
};
