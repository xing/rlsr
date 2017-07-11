const modifyPackages = require('./modify-packages');

module.exports = env => {
  const packages = Object.assign({}, env.packages);
  env.messages.forEach(message => {
    message.affected.forEach(affectedPackage => {
      if (packages[affectedPackage]) {
        env.dbg(
          `message "${message.subject}" (level ${message.level}) added to package <${affectedPackage}>`
        );
        packages[affectedPackage][env.consts.nsp].messages.push(message);
      }
    });
  });
  return modifyPackages(packages, env);
};
