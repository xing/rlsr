const path = require('path');
const fs = require('fs');
const R = require('ramda');

const getMessageString = msg => {
  let content = [msg.body, msg.footer]
    .filter(item => !!item)
    .map(item => '\n' + item)
    .join('')
    .replace(/\n/g, '\n> ');
  let ret = `**${msg.subject}**${content}
`;
  return ret;
};

const getRelatedMessageString = msg => `${msg.type} in *${msg.package}*: **${msg.subject}**
`;

const getSection = (title, items) => {
  if (items.length > 0) {
    return `
#### ${title}

${items.join('\n')}`;
  } else {
    return '';
  }
};

module.exports = nsp => pkg => new Promise((resolve, reject) => {
  if ((pkg[nsp].messages.length + pkg[nsp].relatedMessages.length) > 0) {
    const breakingChanges = pkg[nsp].messages.filter(m => m.level === 2).map(m => getMessageString(m));
    const nonBreakingChanges = pkg[nsp].messages.filter(m => m.level !== 2);
    const feat = nonBreakingChanges.filter(m => m.type === 'feat').map(m => getMessageString(m));
    const fix = nonBreakingChanges.filter(m => m.type === 'fix').map(m => getMessageString(m));
    const perf = nonBreakingChanges.filter(m => m.type === 'perf').map(m => getMessageString(m));
    const refactor = nonBreakingChanges.filter(m => m.type === 'refactor').map(m => getMessageString(m));
    const revert = nonBreakingChanges.filter(m => m.type === 'revert').map(m => getMessageString(m));
    const dep = pkg[nsp].relatedMessages.map(m => getRelatedMessageString(m));

    const content = `# Changelog ${pkg.name}

## Version ${pkg.version}

${getSection(
  'BREAKING CHANGES', breakingChanges
)}${getSection(
  'New Features', feat
)}${getSection(
  'Bug Fixes', fix
)}${getSection(
  'Performance Improvements', perf
)}${getSection(
  'Refactorings', refactor
)}${getSection(
  'Reverted Changes', revert
)}${getSection(
  'Dependency Updates', dep
)}

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
