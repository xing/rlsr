const exec = require('../tools/exec');

module.exports = env => {
  env.log('running step PERFORM PUBLISH');

  // commit the current state
  exec(`git commit -m "chore: release ${env.version}"`);

  // add tag for every changed component

  // npm publish every changed component
};
