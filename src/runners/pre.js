// MIGRATION: current

const read = require('../read');
const transform = require('../transform');
const write = require('../write');

module.exports = (env) =>
  // MIGRATION: current sub task read
  read(env)
    .then(transform)
    .then(write)
    .then((res) => {
      env.log('step PREPUBLISH finished successfully');
    })
    .catch(env.err);
