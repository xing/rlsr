import { resolve } from 'path';

import { defaultConfig } from '../collect/config';

import { Env } from '../types';

export const basicEnv: Env = {
  stage: 'beta',
  config: {
    impact: 'dryrun',
    debug: false,
    remote: 'foo',
    branch: 'foo',
    changelogPath: 'foo',
    metadataPath: 'foo',
    registry: 'foo',
    mode: 'independent',
    tag: 'foo',
    productionBranch: 'foo',
    betaBranch: 'foo',
    mainBranch: 'foo',
    betaTag: 'foo',
    plugins: [],
  },
  dryrun: true,
  verify: false,
  force: false,
  appRoot: resolve(__dirname, '../../'),
};

export const envWithConfig: Env = {
  ...basicEnv,
  config: defaultConfig,
  currentHash: 'hash',
};
