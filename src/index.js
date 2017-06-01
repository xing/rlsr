const path = require('path');
const R = require('ramda');
const npmlog = require('npmlog');
const log = R.curry(npmlog.log);
const dbg = log('verbose');
const err = log('error');
const inf = log('info');

const NAME = 'rlsr';
const RLSR_LATEST = 'rlsr-latest';

const COMMANDS = ['pre', 'perform'];

// task runner
const run = cmd => {
  if (COMMANDS.indexOf(cmd) === -1) {
    err('rlsr', 'Please run one of the following commands');
    COMMANDS.forEach(c => err(NAME, `* ${c}`));
    process.exit(1);
  }
  const runner = require(`./runners/${cmd}`);
  const appRoot = process.cwd();
  const pkg = require(path.join(appRoot, 'package.json'));

  if (R.path([NAME, 'verbose'], pkg)) {
    npmlog.level = 'verbose';
  }

  inf('rlsr')(`command <${cmd}>`);
  runner(
    Object.assign(
      {
        remote: 'origin',
        branch: 'master',
        packagePath: './packages',
        exactRelations: false
      },
      pkg[NAME],
      {
        dbg: dbg(`${NAME} ${cmd}`),
        err: err(`${NAME} ${cmd}`),
        log: inf(`${NAME} ${cmd}`),
        nsp: NAME,
        rlsrLatest: RLSR_LATEST,
        version: pkg.version,
        appRoot: process.cwd()
      }
    )
  );
};

module.exports = run;
