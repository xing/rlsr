import type { Module } from '../types';

import { logger } from '../helpers/logger';
import { writeFile } from '../helpers/write-file';

const { log, error } = logger('[change] write packageJsons (NPM)');

export const writePackageJsonsToNpm: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object.';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('Analysing releasable packages...');

  Object.entries(env.packages).forEach(([packageName, currentPackage]) => {
    if (!('packageJsonNpm' in currentPackage)) {
      const errorMessage = `missing "packageJsonNpm" on package ${packageName}.`;
      error(errorMessage);
      throw new Error(errorMessage);
    }
    log(`Writting "${packageName}"`);
    writeFile(
      `${currentPackage.path}/package.json`,
      currentPackage.packageJsonNpm
    );
  });

  return env;
};
