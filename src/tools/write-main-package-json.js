const fs = require('fs');
const path = require('path');
const R = require('ramda');
const semver = require('./semver');

module.exports = (packages, env) => new Promise((resolve, reject) => {
  const requiredBump = R.last(R.flatten(packages.map(p => p[env.nsp].messages)).map(msg => msg.level).sort());

  if (requiredBump > -1) {
    const pkgPath = path.join(env.appRoot, 'package.json');
    const mainPkg = require(pkgPath);

    const previouslyUnreleased = R.uniq(R.pathOr([], [env.nsp, 'previouslyUnreleased'], mainPkg)
      .concat(packages.filter(p => p[env.nsp].determinedIncrementLevel > -1).map(p => p.name)));

    mainPkg.version = semver.bump(mainPkg.version, requiredBump);
    mainPkg[env.nsp] = Object.assign({}, mainPkg[env.nsp], { previouslyUnreleased });

    fs.writeFile(pkgPath, JSON.stringify(mainPkg, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        env.log(`written main json file @ version <${mainPkg.version}>`);
        resolve();
      }
    });
  } else {
    resolve();
  }
});
