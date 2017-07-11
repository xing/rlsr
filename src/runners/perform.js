const path = require('path');
const R = require('ramda');
const packages = require('../read/getPackages');
const writeCleanedPackageJson = require('../perform/write-cleaned-main-package-json');
const commandsFactory = require('../perform/commands');

module.exports = env => {
  env.log('running step PERFORM PUBLISH');

  if (env.previouslyUnreleased) {
    env.log(
      `Previously unreleased packages: <${env.previouslyUnreleased.length}>`
    );
    const commands = commandsFactory(env.log, env.dbg);

    commands
      .commitChanges(env, env.previouslyUnreleased)
      // fetch packages
      .then(() => packages(path.join(env.appRoot, env.packagePath), env.nsp))
      .then(flatPackages => {
        return R.indexBy(R.prop('name'), flatPackages);
      })
      // filter unreleased
      // for manual manipulation, we filter stuff that doesn't match any real package (#5)
      .then(packages => {
        return env.previouslyUnreleased
          .map(packageName => packages[packageName])
          .filter(p => !!p);
      })
      // add tag for every changed component
      .then(packages =>
        Promise.all(
          packages.map(p => commands.tagPackage(p.name, p.version))
        ).then(() => packages)
      )
      // clean up main package.json
      .then(packages => writeCleanedPackageJson(env).then(() => packages))
      // commit main package.json
      .then(packages => commands.commitMain(env.version).then(() => packages))
      .then(packages => commands.tagMain(env.version).then(() => packages))
      .then(packages =>
        commands.push(env.remote, env.branch).then(() => packages)
      )
      // npm publish all packages
      .then(packages =>
        Promise.all(
          packages.map(p =>
            commands.publishPackage(p.name, p.version, p[env.nsp].dir)
          )
        )
      )
      // npm publish every changed component
      .catch(e => {
        env.err(e);
        process.exit(1);
      });
  } else {
    env.log('no previously unreleased packages. Stopping now ...');
  }
};
