const R = require('ramda');
const fs = require('fs');

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
