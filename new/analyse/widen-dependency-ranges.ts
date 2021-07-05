import type { Module } from '../types';

import { clone } from 'lodash';

import { logger } from '../helpers/logger';

const { log } = logger('[analyse] wide dependnecy ranges');

// Matches either "^", "~" or "*" at the beginning of the string
const LOOSE_RANGE_PATTERN = /^[~^*]/;

export const widenDependencyRanges: Module = (env) => {
  const packagesClone = clone(env.packages);

  log('Analysing packages');
  let widenCounter = 0;
  Object.values(packagesClone!).forEach((packageValue) => {
    // Widen dependencies ranges
    packageValue.dependsOn.forEach((dependency) => {
      // except they're already widened
      if (LOOSE_RANGE_PATTERN.test(dependency.range)) {
        return;
      }
      widenCounter++;
      dependency.range = `^${dependency.range}`;
    });
  });

  log(`Widen ${widenCounter} dependencies`);

  return { ...env, packages: packagesClone };
};
