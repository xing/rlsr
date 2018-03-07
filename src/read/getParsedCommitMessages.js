const commits = require('git-raw-commits');
const parser = require('conventional-commits-parser');
const R = require('ramda');

const BREAKING_REGEXP = /BREAKING/;
const PATCH_TYPES = ['fix', 'refactor', 'perf', 'revert'];
const MINOR_TYPES = ['feat'];

const isRelevant = msg =>
  R.contains(msg.type, R.concat(PATCH_TYPES, MINOR_TYPES));
const addLevel = msg =>
  Object.assign({}, msg, { level: R.contains(msg.type, MINOR_TYPES) ? 1 : 0 });
const addBreaking = msg => {
  return Object.assign({}, msg, {
    level: (msg.subject + msg.body + msg.footer).match(BREAKING_REGEXP)
      ? 2
      : msg.level
  });
};

const scopeToName = map => msg => {
  if (map[msg.scope]) {
    return Object.assign({}, msg, {
      scope: map[msg.scope]
    });
  }

  return msg;
};

module.exports = (tag, scopeToNameMap) =>
  new Promise((resolve, reject) => {
    const commitMessages = [];

    commits({ from: tag })
      .pipe(parser())
      .on('data', chunk => {
        commitMessages.push(chunk);
      })
      .on('error', err => reject(err))
      .on('end', () => {
        resolve(
          commitMessages
            .filter(isRelevant)
            .map(scopeToName(scopeToNameMap))
            .map(addLevel)
            .map(addBreaking)
        );
      });
  });
