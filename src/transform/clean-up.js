const R = require('ramda');

module.exports = env => {
  const res = R.clone(env);
  res.messages = [];
  Object.keys(res.packages).forEach(
    key => (res.packages[key] = R.omit([env.consts.nsp], res.packages[key]))
  );

  return res;
};
