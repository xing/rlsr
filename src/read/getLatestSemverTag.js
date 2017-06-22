const latestTag = require('git-latest-semver-tag');

module.exports = new Promise((resolve, reject) => {
  latestTag((err, tag) => {
    if (err) {
      reject(err);
    } else {
      resolve(tag);
    }
  });
});
