const R = require('ramda');

module.exports = (env) => {
  const res = R.clone(env);
  res.messages = [];
  return res;
};
