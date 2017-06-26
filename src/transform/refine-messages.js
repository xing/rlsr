const R = require('ramda');

/*
TYPICAL MESSAGE FORMAT

feat(scope): short desc

affects: rlsr-1-1-1, rlsr-1-1, rlsr-1-2, rlsr-1, rlsr-2, rlsr-3

Longer description
several lines

BREAKING CHANGE:
brechende änderungen

ISSUES CLOSED: #45

* * *

OUTPUT FORMAT

{
  type: 'feat',
  scope: 'sscope',
  subject: 'short desc',
  merge: null,
  header: 'feat(sscope): short desc',
  body: 'affects: rlsr-1-1-1, rlsr-1-1, rlsr-1-2, rlsr-1, rlsr-2, rlsr-3\n\nLonger description\nseveral lines',
  footer: 'BREAKING CHANGE:\nbrechende änderungen\n\nISSUES CLOSED: #45',
  notes: {...},
  references: [],
  mentions: [],
  revert: null,
  level: 2
}
*/

const BREAKING_REGEXP = /BREAKING/i;
const AFFECTED_REGEXP = /affects:/i;
const PATCH_TYPES = ['fix', 'refactor', 'perf', 'revert'];
const MINOR_TYPES = ['feat'];

const isRelevant = msg =>
  R.contains(msg.type, R.concat(PATCH_TYPES, MINOR_TYPES));

const addLevel = msg =>
  Object.assign({}, msg, { level: R.contains(msg.type, MINOR_TYPES) ? 1 : 0 });

const addBreaking = msg =>
  Object.assign({}, msg, {
    level: (msg.subject + msg.body + msg.footer).match(BREAKING_REGEXP)
      ? 2
      : msg.level
  });

const parseMessageBody = s => {
  const lines = s.split('\n');
  let matchedLine;
  const body = lines
    .filter(line => {
      if (line.match(AFFECTED_REGEXP)) {
        matchedLine = line;
        return false;
      } else {
        return true;
      }
    })
    .join('\n');

  return {
    body,
    affected:
      matchedLine &&
        matchedLine.replace('affects:', '').split(',').map(s => s.trim())
  };
};

const parseMessage = (m, packageNames) => {
  const message = Object.assign(
    R.pick(['type', 'scope', 'subject', 'level'], m),
    parseMessageBody(
      m.body || m.footer
        ? `${m.body ? m.body + '\n\n' : ''}${m.footer || ''}`
        : ''
    )
  );
  if (!message.affected) {
    message.affected = [message.scope];
  }
  message.affected = R.intersection(message.affected, packageNames);
  return message;
};

module.exports = env => {
  env.log(`Analyzed commit messages: ${env.messages.length}`);

  const messages = env.messages
    .filter(isRelevant)
    .map(addLevel)
    .map(addBreaking)
    .map(m => parseMessage(m, env.packageNames));

  env.log(`Relevant commit messages: ${messages.length}`);
  return Object.assign({}, env, {
    messages
  });
};
