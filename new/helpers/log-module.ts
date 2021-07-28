import { bold } from 'chalk';

import { Module } from '../types';

import { logger } from './logger';

const l = logger('========');

type LogModule = (log: string) => Module;

export const log: LogModule = (log) => (env) => {
  l.log(bold(log));
  return env;
};
