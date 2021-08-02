import type { Module } from '../types';

import { logger } from '../helpers/logger';
import { writeFile } from '../helpers/write-file';
import { missingEnvAttrError } from '../helpers/validation-errors';

const section = '[change] write packageJsons (NPM)';
const { log, error } = logger(section);

export const writePackageJsonsToNpm: Module = (env) => {
  if (!env.packages) {
    missingEnvAttrError('packages', section);
  }

  log('Analysing releasable packages...');

  Object.entries(env.packages!).forEach(([packageName, currentPackage]) => {
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
