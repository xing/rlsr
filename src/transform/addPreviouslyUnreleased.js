const R = require('ramda');

module.exports = env => {
  const nsp = env.consts.nsp;
  env.mainPackage[nsp].previouslyUnreleased = R.values(env.packages)
    .filter(iteratedPackage => {
      const logMessage = iteratedPackage[nsp].hasBump
        ? env.consts.levels[iteratedPackage[nsp].determinedIncrementLevel] +
          ' bump to ' +
          iteratedPackage.version
        : '-';
      env.log(`${iteratedPackage.name}: ${logMessage}`);

      return iteratedPackage[nsp].hasBump;
    })
    .map(iteratedPackage => iteratedPackage.name);
  env.mainPackage[nsp].shouldBeCommitted = R.values(env.packages)
    .filter(iteratedPackage => iteratedPackage[nsp].shouldBeCommitted)
    .map(iteratedPackage => iteratedPackage.name);

  return env;
};
