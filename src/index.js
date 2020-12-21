// MIGRATION: done

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
const run = (cmd) => {
  if (COMMANDS.indexOf(cmd) === -1) {
    err(NAME, 'Please run one of the following commands');
    COMMANDS.forEach((c) => err(NAME, `* ${c}`));
    process.exit(1);
  }
  const runner = require(`./runners/${cmd}`);
  const appRoot = process.cwd();
  const pkg = require(path.join(appRoot, 'package.json'));

  if (R.path([NAME, 'verbose'], pkg)) {
    npmlog.level = 'verbose';
  }

  inf('rlsr')(`command <${cmd}>`);

  runner({
    dbg: dbg(`${NAME} ${cmd}`),
    err: err(`${NAME} ${cmd}`),
    log: inf(`${NAME} ${cmd}`),
    appRoot: process.cwd(),
    mainPackage: pkg,
    consts: {
      nsp: NAME,
      rlsrLatest: RLSR_LATEST,
      levels: ['patch', 'minor', 'major'],
    },
    config: Object.assign(
      {
        remote: 'origin',
        branch: 'master',
        packagePath: './packages',
        mode: 'synchronize',
        tag: 'latest',
      },
      pkg[NAME]
    ),
  });
};

module.exports = run;
