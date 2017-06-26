const R = require('ramda');

module.exports = R.curry((packages, env) =>
  Object.assign({}, env, { packages })
);
