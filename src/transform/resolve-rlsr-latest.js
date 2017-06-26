const R = require('ramda');
const modifyPackages = require('./modify-packages');

module.exports = env => {
  const packages = R.clone(env.packages);

  R.values(packages).forEach(pkg => {
    pkg.dependencies &&
      Object.keys(pkg.dependencies).forEach(name => {
        if (
          pkg.dependencies[name] === env.consts.rlsrLatest &&
          env.packageNames.indexOf(name) > -1
        ) {
          const version = packages[name].version;
          const isExact =
            env.config.mode === 'exact' || env.config.mode === 'synchronized';
          pkg.dependencies[name] = isExact ? version : `^${version}`;
        }
      });
  });

  return modifyPackages(packages, env);
};
