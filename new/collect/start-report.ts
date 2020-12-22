import { bold, yellow } from 'chalk';
import { logger } from '../helpers/logger';
import { Module } from '../types';

const l = logger('report');

/**
 * Prints initial status information
 */
export const startReport: Module = (env) => {
  l.log(`Running in stage ${bold(yellow(env.stage))}`);
  env.verify && l.log(`verifying status only!`);
  !env.verify && env.dryrun && l.log(`dryrun only!`);
  l.log(`project: ${yellow(env.pkg?.name ?? 'unknown')}`);
  l.debug(`root folder: ${yellow(env.appRoot)}`);
  return env;
};
