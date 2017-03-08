const path = require('path');
const exec = require('../tools/exec');
const R = require('ramda');
const packages = require('../tools/get-packages');

module.exports = env => {
  env.log('running step PERFORM PUBLISH');
  const shell = exec(env.log, env.dbg);

  // commit the current state
  shell('git add .')
    // .then(shell(`git commit -m "chore: release ${env.version}"`))

    // add tag for every changed component
    .then(() => packages(path.join(env.appRoot, env.packagePath || './packages')))
    .then(flatPackages => {
      return R.indexBy(R.prop('name'), flatPackages);
    })
    .then(packages => {
      console.log(env);
      return packages;
    })

    // npm publish every changed component
    .catch(e => {
      env.err(e);
      process.exit(1);
    });
};
