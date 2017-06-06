const path = require('path');
const fs = require('fs');
const R = require('ramda');

const LEVELS = ['patch', 'minor', 'major'];

module.exports = (env, newMainVersion, packages) => {
  if (newMainVersion) {
    const newSection = {};
    newSection[newMainVersion] = {};
    newSection[newMainVersion].date = new Date().toString();
    newSection[newMainVersion].changes = R.values(packages)
      .filter(p => p[env.nsp].determinedIncrementLevel > -1)
      .map(p => ({
        name: p.name,
        version: p.version,
        level: LEVELS[p[env.nsp].determinedIncrementLevel],
        messages: p[env.nsp].messages
          .map(m => ({
            type: m.type,
            subject: m.subject,
            additional: m.body || m.footer
              ? `${m.body || ''}\n${m.footer}}`
              : null
          }))
          .concat(
            p[env.nsp].relatedMessages.map(m => ({
              type: 'dependency update',
              source: m.source,
              subject: m.type + ': ' + m.subject,
              additional: m.body || m.footer
                ? `${m.body || ''}\n${m.footer}}`
                : null
            }))
          )
      }));

    // save to file
    const changelogFile = path.join(env.appRoot, 'changelog.json');
    return new Promise((resolve, reject) => {
      fs.stat(changelogFile, (err, stats) => {
        if (err) {
          // file does not exist
          fs.writeFile(
            changelogFile,
            JSON.stringify(newSection, null, 2),
            err => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        } else {
          // file does exist
          fs.readFile(
            changelogFile,
            { encodig: 'utf-8' },
            (err, oldContent) => {
              if (err) {
                reject(err);
              } else {
                const content = Object.assign(
                  {},
                  newSection,
                  JSON.parse(oldContent)
                );
                fs.writeFile(
                  changelogFile,
                  JSON.stringify(content, null, 2),
                  err => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve();
                    }
                  }
                );
              }
            }
          );
        }
      });
    });
  }
};
