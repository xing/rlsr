const modifyPackages = require('./modify-packages');

module.exports = (env) => {
  const nsp = env.consts.nsp;
  const packages = env.packages;
  Object.keys(packages).forEach((packageName) => {
    packages[packageName][nsp].dependencies.forEach((dep) =>
      packages[dep][nsp].relations.push(packageName)
    );
    packages[packageName][nsp].devDependencies.forEach((dep) =>
      packages[dep][nsp].devRelations.push(packageName)
    );
    packages[packageName][nsp].peerDependencies.forEach((dep) =>
      packages[dep][nsp].peerRelations.push(packageName)
    );
  });
  return modifyPackages(packages, env);
};
