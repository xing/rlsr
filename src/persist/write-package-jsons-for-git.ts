import type { Module } from '../types';

import { logger } from '../helpers/logger';
import { writeFile } from '../helpers/write-file';

const { error, log } = logger('[persist] package.json files (git)');

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

    writeFile(packageJsonPath, currentPackage.packageJsonGit);
  });

  return env;
};
