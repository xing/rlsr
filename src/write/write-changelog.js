const path = require('path');
const fs = require('fs');
const R = require('ramda');

const getMessageString = msg => {
  const content = [msg.body, msg.footer]
    .filter(item => !!item)
    .map(item => '\n' + item)
    .join('')
    .replace(/\n/g, '\n> ');
  const ret = `→ **${msg.subject}**${content}
`;
  return ret;
};

const getRelatedMessageString = msg => {
  if (msg.source) {
    return `→ indirect dependency from *${msg.source}* → ${msg.type} in *${msg.affected.join(
      ', '
    )}*: **${msg.subject}**
`;
  } else if (msg.synchronizedSource) {
    return `→ synchronized dependency from *${msg.synchronizedSource.join(
      ', '
    )}* → ${msg.type}: **${msg.subject}**
`;
  } else if (msg.package) {
    return `→ ${msg.type} in ${msg.package}@${msg.version}: **${msg.subject}**
`;
  } else {
    return `→ ${msg.type}: **${msg.subject}**
`;
  }
};

const getSection = (title, items) => {
  if (items.length > 0) {
    return `
### ${title}

${items.join('\n')}`;
  } else {
    return '';
  }
};

module.exports = env => pkg =>
  new Promise((resolve, reject) => {
    const nsp = env.consts.nsp;
    if (
      pkg[nsp].determinedIncrementLevel > -1 &&
      pkg[nsp].messages.length + pkg[nsp].relatedMessages.length > 0
    ) {
      const breakingChanges = pkg[nsp].messages
        .filter(m => m.level === 2)
        .map(getMessageString);
      const nonBreakingChanges = pkg[nsp].messages.filter(m => m.level !== 2);
      const feat = nonBreakingChanges
        .filter(m => m.type === 'feat')
        .map(getMessageString);
      const fix = nonBreakingChanges
        .filter(m => m.type === 'fix')
        .map(getMessageString);
      const perf = nonBreakingChanges
        .filter(m => m.type === 'perf')
        .map(getMessageString);
      const refactor = nonBreakingChanges
        .filter(m => m.type === 'refactor')
        .map(getMessageString);
      const revert = nonBreakingChanges
        .filter(m => m.type === 'revert')
        .map(getMessageString);
      const dep = pkg[nsp].relatedMessages.map(getRelatedMessageString);

      const content = `# Changelog ${pkg.name}

## Version ${pkg.version}
${getSection('🚀  BREAKING CHANGES', breakingChanges)}${getSection(
  '🆕  New Features',
  feat
)}${getSection('🐞 Bug Fixes', fix)}${getSection(
  '🏃 Performance Improvements',
  perf
)}${getSection('🔨 Refactorings', refactor)}${getSection(
  '🔙 Reverted Changes',
  revert
)}${getSection('🔄  Dependency Updates', dep)}

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
          fs.readFile(
            changelogFile,
            { encodig: 'utf-8' },
            (err, oldContent) => {
              if (err) {
                reject(err);
              } else {
                // removing the headline
                const tail = R.drop(2, oldContent.toString().split('\n')).join(
                  '\n'
                );
                fs.writeFile(changelogFile, content + tail, err => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              }
            }
          );
        }
      });
    } else {
      resolve();
    }
  });
