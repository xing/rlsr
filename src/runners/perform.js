const path = require('path');
const fs = require('fs');

const R = require('ramda');

const packages = require('../read/getPackages');
const writeCleanedPackageJson = require('../perform/write-cleaned-main-package-json');
const commandsFactory = require('../perform/commands');

module.exports = (env) => {
  env.log('running step PERFORM PUBLISH');

  const previouslyUnreleased =
    env.mainPackage[env.consts.nsp].previouslyUnreleased;
  const additionalReleaseScope =
    env.mainPackage[env.consts.nsp].additionalReleaseScope;
  const hasAdditionalReleaseScope = !!additionalReleaseScope;
  const shouldBeCommitted = R.difference(
    env.mainPackage[env.consts.nsp].shouldBeCommitted,
    previouslyUnreleased
  );

  // should be committed is not as important as previouslyUnreleased
  // so we only proceed, if something really must be released
  // shouldBeCommitted can then run in the next iteration again
  if (previouslyUnreleased) {
    env.log(`Previously unreleased packages: <${previouslyUnreleased.length}>`);
    env.log(`Files that should be committed: <${shouldBeCommitted.length}>`);
    const commands = commandsFactory(env.log, env.dbg);

    commands
      .commitChanges(env, previouslyUnreleased, shouldBeCommitted)
      // fetch packages
      .then(() =>
        packages(path.join(env.appRoot, env.config.packagePath), env.consts.nsp)
      )
      .then((flatPackages) => {
        return R.indexBy(R.prop('name'), flatPackages);
      })
      // filter unreleased
      // for manual manipulation, we filter stuff that doesn't match any real package (#5)
      .then((packages) => {
        return previouslyUnreleased
          .map((packageName) => packages[packageName])
          .filter((p) => !!p);
      })
      // add tag for every changed component
      .then((packages) =>
        Promise.all(
          packages.map((p) => commands.tagPackage(p.name, p.version))
        ).then(() => packages)
      )
      // clean up main package.json
      .then((packages) => writeCleanedPackageJson(env).then(() => packages))
      // commit main package.json
      .then((packages) =>
        commands.commitMain(env.mainPackage.version).then(() => packages)
      )
      .then((packages) =>
        commands.tagMain(env.mainPackage.version).then(() => packages)
      )
      .then((packages) =>
        commands.push(env.config.remote, env.config.branch).then(() => packages)
      )
      // npm publish all packages
      .then((packages) =>
        Promise.all(
          packages.map((p) => {
            return commands
              .publishPackage(
                p.name,
                p.version,
                p[env.consts.nsp].dir,
                env.config.tag
              )
              .then(
                () =>
                  new Promise((resolve, reject) => {
                    if (hasAdditionalReleaseScope) {
                      const dest = p[env.consts.nsp].file;
                      p.name = `${additionalReleaseScope}/${p.name}`;
                      try {
                        fs.writeFileSync(dest, JSON.stringify(p, null, 2));
                        // second publication under a given scope (@myscope/foo-bar)
                        return commands.publishPackage(
                          p.name,
                          p.version,
                          p[env.consts.nsp].dir,
                          env.config.tag
                        );
                      } catch (e) {
                        reject(e);
                      }
                    } else {
                      resolve();
                    }
                  })
              );
          })
        )
      )
      // npm publish every changed component
      .catch((e) => {
        env.err(e);
        process.exit(1);
      });
  } else {
    env.log('no previously unreleased packages. Stopping now ...');
  }
};
