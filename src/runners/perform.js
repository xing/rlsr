const exec = require('../tools/exec');

module.exports = env => {
  env.log('running step PERFORM PUBLISH');

  // commit the current state
  exec('git add .', env.log, env.dbg)
    .then(exec(`git commit -m "chore: release ${env.version}"`, env.log, env.dbg))

    // add tag for every changed component
    // npm publish every changed component
    .catch(e => {
      env.err(e);
      process.exit(1);
    });
};
