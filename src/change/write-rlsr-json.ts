import { join } from 'path';
import type { Module } from '../types';
import { logger } from '../helpers/logger';
import { writeFile } from '../helpers/write-file';

const { error, log } = logger('[change] write main changelog');

export const writeRlsrJson: Module = (env) => {
  if (!env.newStatus) {
    const errorMessage = 'the data for rlsr.json seems not to be calculated';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('writing status information to rlsr.json');

  const statusFile = join(env.appRoot, 'rlsr.json');
  writeFile(statusFile, env.newStatus);

  return env;
};
