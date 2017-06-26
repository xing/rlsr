const R = require('ramda');

const env = {
  dbg: () => {},
  log: () => {},
  appRoot: '/',
  mainPackage: {
    version: '1.2.3',
    rlsr: {}
  },
  consts: {
    nsp: 'rlsr',
    rlsrLatest: 'rlsr-latest',
    levels: ['patch', 'minor', 'major']
  },
  messages: [],
  packages: {},
  changelog: {}
};

module.exports = R.curry((packages, messages) =>
  R.clone(Object.assign(R.clone(env), { messages, packages }))
);
