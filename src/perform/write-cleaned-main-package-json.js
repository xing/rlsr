const fs = require('fs');

const path = require('path');

const R = require('ramda');

module.exports = (env) =>
  new Promise((resolve, reject) => {
    const pkgPath = path.join(env.appRoot, 'package.json');
    const mainPkg = require(pkgPath);

    delete mainPkg[env.consts.nsp].previouslyUnreleased;
    delete mainPkg[env.consts.nsp].determinedIncrementLevel;
    if (R.isEmpty(mainPkg[env.consts.nsp])) {
      delete mainPkg[env.consts.nsp];
    }

    fs.writeFile(pkgPath, JSON.stringify(mainPkg, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        env.log(`written main json file @ version <${mainPkg.version}>`);
        resolve();
      }
    });
  });
