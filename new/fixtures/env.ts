import { resolve } from 'path';
import { defaultConfig } from '../collect/config';

import { Env } from '../types';

export const basicEnv: Env = {
  stage: 'beta',
  dryrun: true,
  verify: false,
  force: false,
  appRoot: resolve(__dirname, '../../'),
};

export const envWithConfig: Env = {
  ...basicEnv,
  config: defaultConfig,
};
