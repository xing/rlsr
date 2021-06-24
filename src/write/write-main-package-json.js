const fs = require('fs');
const path = require('path');

module.exports = (env) =>
  new Promise((resolve, reject) => {
    const pkgPath = path.join(env.appRoot, 'package.json');
    if (env.mainPackage[env.consts.nsp].determinedIncrementLevel > -1) {
      fs.writeFile(pkgPath, JSON.stringify(env.mainPackage, null, 2), (err) => {
        if (err) {
          reject(err);
        } else {
          env.log(
            `written main json file @ version <${env.mainPackage.version}>`
          );
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
