const glob = require('glob');
const path = require('path');

module.exports = (rootDir, nsp) => new Promise((resolve, reject) => {
  glob(`${rootDir}/*/package.json`, {realpath: true}, (err, files) => {
    if (err) {
      reject(err);
    } else {
      resolve(files);
    }
  });
}).then(files => files.map(file => {
  const pkg = require(file);
  const dir = path.dirname(file);
  pkg[nsp] = Object.assign({}, pkg[nsp], { file, dir });
  return pkg;
}));
