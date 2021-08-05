import { clone } from 'ramda';

import type { Module, RelatedPackageTypes } from '../types';

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
    const extendedDependencies: {
      name: string;
      originalRange: string;
      newRange: string;
      type: RelatedPackageTypes;
    }[] = [];
    packageValue.dependsOn.forEach((dependency) => {
      if (PINNED_VERSION_PATTERN.test(dependency.range)) {
        extendCounter++;
        changed = true;
        const newRange = `~${dependency.range}`;

        extendedDependencies.push({
          name: dependency.name,
          originalRange: dependency.range,
          newRange,
          type: dependency.type,
        });

        dependency.range = newRange;
      }
    });

    if (changed) {
      // flag increment level
      packageValue.determinedIncrementLevel = 0;
      // add patch message to dependency
      packageValue.relatedMessages.push({
        date: new Date().toISOString(),
        // "widened dependencies: @xingternal/button (default) 1.2.3 -> ~1.2.3, @xingternal/top-bar (dev) 2.3.4 -> ~2.3.4
        text: `fix: widened dependency ranges ${extendedDependencies
          .map(
            ({ name, newRange, type, originalRange }) =>
              `${name} (${type}) ${originalRange} to ${newRange}`
          )
          .join(', ')}`,
        level: 'patch',
      });
    }
  });

  log(`extend ${extendCounter} dependencies`);

  return { ...env, packages: packagesClone };
};
