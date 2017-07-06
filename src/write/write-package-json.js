const fs = require('fs');

module.exports = env => pkg =>
  new Promise((resolve, reject) => {
    const dest = pkg[env.consts.nsp].file;
    delete pkg[env.consts.nsp].file;
    delete pkg[env.consts.nsp];

    fs.writeFile(dest, JSON.stringify(pkg, null, 2), err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
