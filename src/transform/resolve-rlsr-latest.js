const R = require('ramda');
const modifyPackages = require('./modify-packages');

module.exports = env => {
  const packages = R.clone(env.packages);

  R.values(packages).forEach(pkg => {
    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(
      type =>
        pkg[type] &&
        Object.keys(pkg[type]).forEach(name => {
          if (
            pkg[type][name] === env.consts.rlsrLatest &&
            Object.keys(env.packages).indexOf(name) > -1
          ) {
            const version = packages[name].version;
            const isExact =
              env.config.mode === 'exact' || env.config.mode === 'synchronized';
            pkg[type][name] = isExact ? version : `^${version}`;
          }
        })
    );
  });

  return modifyPackages(packages, env);
};
