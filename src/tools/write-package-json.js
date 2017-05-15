const fs = require('fs');

module.exports = nsp => pkg => new Promise((resolve, reject) => {
  const dest = pkg[nsp].file;
  delete pkg[nsp].file;
  delete pkg[nsp];
  fs.writeFile(dest, JSON.stringify(pkg, null, 2), (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});
