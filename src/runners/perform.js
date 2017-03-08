const exec = require('../tools/exec');
const packages = require('../tools/get-packages');

module.exports = env => {
  env.log('running step PERFORM PUBLISH');
  const shell = exec(env.log, env.dbg);

  // commit the current state
  shell('git add .', env.log, env.dbg)
    .then(shell(`git commit -m "chore: release ${env.version}"`, env.log, env.dbg))

    // add tag for every changed component
    .then(packages(path.join(env.appRoot, env.packagePath || './packages'))
    .then(packages => {
      console.log(packages);
      return packages;
    })

    // npm publish every changed component
    .catch(e => {
      env.err(e);
      process.exit(1);
    });
};
