const fs = require('fs');
const R = require('ramda');
const path = require('path');

module.exports = (env) => new Promise((resolve, reject) => {
  const pkgPath = path.join(env.appRoot, 'package.json');
  const mainPkg = require(pkgPath);

  delete mainPkg[env.nsp].previouslyUnreleased;
  if (R.isEmpty(mainPkg[env.nsp])) {
    delete mainPkg[env.nsp];
  }

  fs.writeFile(pkgPath, JSON.stringify(mainPkg, null, 2), (err) => {
    if (err) {
      reject();
    } else {
      env.log(`written main json file @ version <${mainPkg.version}>`);
      resolve();
    }
  });
});
