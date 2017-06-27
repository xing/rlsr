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
      dependencies: p.dependencies
        ? Object.keys(p.dependencies).filter(depName =>
          R.contains(depName, packageNames)
        )
        : [],
      devDependencies: p.devDependencies
        ? Object.keys(p.devDependencies).filter(depName =>
          R.contains(depName, packageNames)
        )
        : [],
      peerDependencies: p.peerDependencies
        ? Object.keys(p.peerDependencies).filter(depName =>
          R.contains(depName, packageNames)
        )
        : []
    };
    p[key][nsp] = pData;
  });

  return modifyPackages(p, env);
};
