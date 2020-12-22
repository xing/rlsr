import { resolve } from 'path';

import { Env } from '../types';

export const basicEnv: Env = {
  stage: 'beta',
  dryrun: true,
  verify: false,
  force: false,
  appRoot: resolve(__dirname, '../../'),
};
