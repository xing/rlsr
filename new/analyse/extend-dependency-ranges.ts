import type { Module } from '../types';

import { clone } from 'ramda';

import { logger } from '../helpers/logger';

const { log } = logger('[analyse] extend dependency ranges');

// Matches pinned versions
const PINNED_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export const extendDependencyRanges: Module = (env) => {
  const packagesClone = clone(env.packages);

  log('Analysing packages');
  let extendCounter = 0;
  Object.values(packagesClone!).forEach((packageValue) => {
    // extend dependencies ranges
    let changed = false;
    const extendedDependencies: string[] = [];
    packageValue.dependsOn.forEach((dependency) => {
      if (PINNED_VERSION_PATTERN.test(dependency.range)) {
        extendCounter++;
        changed = true;
        dependency.range = `~${dependency.range}`;
        extendedDependencies.push(dependency.name);
      }
    });

    if (changed) {
      // flag increment level
      packageValue.determinedIncrementLevel = 0;
      // add patch message to dependency
      packageValue.relatedMessages.push({
        date: new Date().toISOString(),
        text: `affected dependencies: ${extendedDependencies.join(', ')}`,
        level: 'patch',
      });
    }
  });

  log(`extend ${extendCounter} dependencies`);

  return { ...env, packages: packagesClone };
};
