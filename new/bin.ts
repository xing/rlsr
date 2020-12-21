import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { run } from './index';

const opt = (y: yargs.Argv<{}>) => y.option('dryrun', { alias: 'd' });

yargs(hideBin(process.argv))
  .command(['canary', 'c'], 'releases a canary version', opt, run('canary'))
  .command(['beta', 'b'], 'releases a beta version', opt, run('beta'))
  .command(
    ['production', '$0'],
    'releases a production version',
    opt,
    run('production')
  )
  .help().argv;
