import type { Arguments } from 'yargs';

import { composeAsync } from './helpers/compose-async';
import { collect } from './collect';
import { change } from './change';
import { commit } from './commit';
import { Env, Stage } from './types';
import { whenNotDryrun } from './helpers/when';
import { log } from './helpers/log-module';

import { version } from '../package.json';

export const run = (stage: Stage) => ({
  dryrun,
  verify,
}: Arguments<{ dryrun: boolean; verify: boolean }>) => {
  // env is initially filled with yargs output
  const env: Env = {
    stage,
    //verify overrides dryrun - so adding `-v` is enough
    dryrun: dryrun || verify,
    verify,
    appRoot: process.cwd(),
  };

  // Three phases are
  // collect: gather data and add it to the env
  // change: modify files
  // commit: publish everything (github and npm)
  composeAsync(
    log('👋 Welcome to RLSR ...'),
    log(`Script version ${version}`),
    collect,
    change,
    whenNotDryrun(commit)
  )(env);
};
