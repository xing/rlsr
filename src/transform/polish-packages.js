const R = require('ramda');

const modifyPackages = require('./modify-packages');

/**
 * Some fields are created initially to avoid later
 * undefined checks
 *
 * Relevant dependencies (all the internal ones) are
 * calculated and also added as a fields
 */
module.exports = env => {
  console.log(env);
  const p = R.clone(env.packages);
  const packageNames = Object.keys(p);
  const nsp = env.consts.nsp;

  packageNames.forEach(key => {
    const pData = {
      messages: [],
      relatedMessages: [],
      relations: [],
      devRelations: [],
      peerRelations: [],
      determinedIncrementLevel: -1,
      dependencies: p[key].dependencies
        ? Object.keys(p[key].dependencies).filter(depName =>
            R.contains(depName, packageNames)
          )
        : [],
      devDependencies: p[key].devDependencies
        ? Object.keys(p[key].devDependencies).filter(depName =>
            R.contains(depName, packageNames)
          )
        : [],
      peerDependencies: p[key].peerDependencies
        ? Object.keys(p[key].peerDependencies).filter(depName =>
            R.contains(depName, packageNames)
          )
        : []
    };
    p[key][nsp] = pData;
  });

  return modifyPackages(p, env);
};
