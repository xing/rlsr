// task runner
const R = require('ramda');
const npmlog = require('npmlog');
const log = R.curry(npmlog.log);
const dbg = log('verbose');
const err = log('error');
const inf = log('info');

const NAME = 'rlsr';

const COMMANDS = ['pre', 'perform'];

const run = (cmd, debug = false) => {
  if (debug) {
    npmlog.level = 'verbose';
  }
  if (COMMANDS.indexOf(cmd) === -1) {
    err('rlsr', 'Please run one of the following commands');
    COMMANDS.forEach(c => err(NAME, `* ${c}`));
    process.exit(1);
  }
  const runner = require(`./runners/${cmd}`);

  inf('rlsr')(`command <${cmd}>`);
  runner({
    dbg: dbg(`${NAME} ${cmd}`),
    err: err(`${NAME} ${cmd}`),
    log: inf(`${NAME} ${cmd}`),
    nsp: NAME,
    appRoot: process.cwd()
  });
};

module.exports = run;
