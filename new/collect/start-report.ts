import { bold, yellow } from 'chalk';

import { logger } from '../helpers/logger';
import { Env, Module } from '../types';

const { log, debug } = logger('report');

/**
 * Prints initial status information
 */
export const startReport: Module = (env: Env) => {
  log(`Running in stage ${bold(yellow(env.stage))}`);
  env.verify && log(`verifying status only!`);
  !env.verify && env.dryrun && log(`dryrun only!`);
  log(`project: ${yellow(env.pkg?.name ?? 'unknown')}`);
  debug(`root folder: ${yellow(env.appRoot)}`);
  return env;
};
