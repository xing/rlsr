const R = require('ramda');
const modifyPackages = require('./modify-packages');
// adds related messages if the message does not directly apply

module.exports = env => {
  const packages = R.clone(env.packages);
  env.messages.forEach(message => {
    if (message.affected.length > 0) {
      const indirectlyRelatedPackages = R.without(
        message.affected,
        Object.keys(env.packages)
      );
      const transferredMessage = Object.assign({}, message, {
        type: 'dependency update',
        subject: `${message.type}: ${message.subject}`,
        source: message.affected
      });
      indirectlyRelatedPackages.forEach(
        packageName =>
          (env.config.mode === 'synchronized' ||
            (env.config.mode === 'synchronizedMain' && message.level === 2)) &&
          packages[packageName][env.consts.nsp].relatedMessages.push(
            transferredMessage
          )
      );
    }
  });

  return modifyPackages(packages, env);
};
