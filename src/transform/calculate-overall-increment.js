const R = require('ramda');
const bump = require('./semver').bump;
const max = R.apply(Math.max);

module.exports = env => {
  let increment = max(
    env.messages.filter(m => m.affected.length > 0).map(m => m.level)
  );
  if (increment === -Infinity) {
    increment = -1;
  }
  env.dbg(`detected overall increment level: ${env.consts.levels[increment]}`);
  const versionBefore = env.mainPackage.version;
  env = R.assocPath(
    ['mainPackage', env.consts.nsp, 'determinedIncrementLevel'],
    increment,
    env
  );
  env = R.assocPath(
    ['mainPackage', 'version'],
    bump(env.mainPackage.version, increment),
    env
  );
  env.log(
    `Bumping main package from <${versionBefore}> to <${env.mainPackage
      .version}>`
  );

  return env;
};
