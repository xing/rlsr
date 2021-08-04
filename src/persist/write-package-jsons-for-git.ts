import { writeFileSync } from 'fs';

import type { Module } from '../types';

import { logger } from '../helpers/logger';

const { error, log } = logger('[persist] package.json files (git)');

// revert package.jsons
// after the package is publishet, we bring back the package.jsons with the `*`
// dependencies. The data structure should be in the env.
// This is a very similar step to change > writeToPackageJsons
export const writePackageJsonsForGit: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object.';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('Preparing packages to commit to Git');

  Object.entries(env.packages).forEach(([packageName, currentPackage]) => {
    if (!('packageJsonGit' in currentPackage)) {
      const errorMessage = `missing "packageJsonNpm" on package ${packageName}.`;
      error(errorMessage);
      throw new Error(errorMessage);
    }

    const packageJsonPath = `${currentPackage.path}/package.json`;
    log(`Reverting "${packageName}" (${packageJsonPath})`);

    writeFileSync(
      packageJsonPath,
      `${JSON.stringify(currentPackage.packageJsonGit, null, 2)}\n`
    );
  });

  return env;
};
