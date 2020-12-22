import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { run } from './index';

const opt = (y: yargs.Argv<{}>) =>
  y
    .option('dryrun', {
      alias: 'd',
      description:
        'runs the release script without persisting to github and npm. Will be ignored, when -v is set',
    })
    .option('verify', {
      alias: 'v',
      description:
        'only analyses the changes in the current state and outputs potential results',
    });

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
