const path = require('path');
const fs = require('fs');

module.exports = (env) =>
  new Promise((resolve, reject) => {
    const changelogFile = path.join(env.appRoot, 'changelog.json');
    fs.stat(changelogFile, (err, stats) => {
      if (err) {
        // file does not exist
        fs.writeFile(
          changelogFile,
          JSON.stringify(env.changelog, null, 2),
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      } else {
        // file does exist
        fs.readFile(changelogFile, { encodig: 'utf-8' }, (err, oldContent) => {
          if (err) {
            reject(err);
          } else {
            const content = Object.assign(
              {},
              env.changelog,
              JSON.parse(oldContent)
            );
            fs.writeFile(
              changelogFile,
              JSON.stringify(content, null, 2),
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          }
        });
      }
    });
  });
