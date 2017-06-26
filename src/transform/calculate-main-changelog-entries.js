const R = require('ramda');

module.exports = env => {
  const newChangelogEntry = {};
  newChangelogEntry.date = new Date(Date.now()).toString();

  newChangelogEntry.changes = R.values(env.packages)
    .filter(p => p.rlsr.hasBump)
    .reduce((entry, p) => {
      const messages = p[env.consts.nsp].messages
        .map(m => ({
          type: m.type,
          affected: m.affected,
          subject: m.subject,
          body: m.body
        }))
        .concat(
          p[env.consts.nsp].relatedMessages.map(m => ({
            type: 'dependency update',
            affected: m.affected,
            source: m.source,
            subject: m.type + ': ' + m.subject,
            body: m.body
          }))
        );
      return Object.assign({}, entry, {
        [p.name]: {
          version: p.version,
          determinedIncrementLevel:
            env.consts.levels[p[env.consts.nsp].determinedIncrementLevel],
          messages
        }
      });
    }, {});
  env.changelog = Object.assign(
    { [env.mainPackage.version]: newChangelogEntry },
    env.changelog
  );

  return env;
};
