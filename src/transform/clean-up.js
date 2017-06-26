const R = require('ramda');

module.exports = env => {
  const res = R.clone(env);
  res.messages = [];
  res.packages = R.values(res.packages).map(pkg =>
    R.omit([env.consts.nsp], pkg)
  );

  return res;
};
