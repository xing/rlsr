const path = require('path');
const fs = require('fs');
const R = require('ramda');

const levels = ['patch', 'minor', '**BREAKING**'];

const getMessageString = msg => `${levels[msg.level]} ${msg.type}: ${msg.subject}`;
const getRelatedMessageString = msg => `Dependency update of *${msg.package}* (${msg.type}): ${msg.subject}`;

module.exports = nsp => pkg => new Promise((resolve, reject) => {
  if ((pkg[nsp].messages.length + pkg[nsp].relatedMessages.length) > 0) {
    const messages = pkg[nsp].messages.map(getMessageString)
      .concat(pkg[nsp].relatedMessages.map(getRelatedMessageString));

    const content = `# Changelog ${pkg.name}

## Version ${pkg.version}

${messages.join('\n')}

`;

    const changelogFile = path.resolve(pkg[nsp].dir, 'changelog.md');
    fs.stat(changelogFile, (err, stats) => {
      if (err) {
        // file does not exist
        fs.writeFile(changelogFile, content, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        // file does exist
        fs.readFile(changelogFile, {encodig: 'utf-8'}, (err, oldContent) => {
          if (err) {
            reject(err);
          } else {
            // removing the headline
            const tail = R.drop(2, oldContent.toString().split('\n')).join('\n');
            fs.writeFile(changelogFile, content + tail, err => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          }
        });
      }
    });
  } else {
    resolve();
  }
});
