import type { Arguments } from 'yargs';

import { composeAsync } from './helpers/compose-async';
import { collect } from './collect';
import { change } from './change';
import { commit } from './commit';
import { Env, Stage } from './types';
import { ifNotDryrun } from './helpers/if-not-dryrun';

export const run = (stage: Stage) => ({
  dryrun,
}: Arguments<{ dryrun: boolean }>) => {
  // env is initially filled with yargs output
  const env: Env = { stage, dryrun, appRoot: process.cwd() };

  // Three phases are
  // collect: gather data and add it to the env
  // change: modify files
  // commit: publish everything (github and npm)
  composeAsync(collect, change, ifNotDryrun(commit))(env);
};
