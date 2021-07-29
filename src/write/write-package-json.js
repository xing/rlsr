const fs = require('fs');

const R = require('ramda');

module.exports = (env) => (pkg) =>
  new Promise((resolve, reject) => {
    const dest = pkg[env.consts.nsp].file;

    const p = R.clone(pkg);

    delete p[env.consts.nsp];

    fs.writeFile(dest, JSON.stringify(p, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
