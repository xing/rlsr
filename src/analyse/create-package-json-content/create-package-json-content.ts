import { clone } from 'ramda';
import { white } from 'chalk';

import type {
  Module,
  PackageAfterCreatePackageJsonContent,
  PackageAfterPrepareChangelogs,
} from '../../types';

import { logger } from '../../helpers/logger';

import { getPackageJson } from './get-package-json';

const { error, log } = logger('[analyse] create package json content');

export const createPackageJsonContent: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('analyse packageJson Content');

  const clonePackages = clone(env.packages);

  Object.keys(clonePackages).forEach((packageName) => {
    log(`generating git & npm package.json files for "${white(packageName)}"`);

    const currentPackage: PackageAfterCreatePackageJsonContent = {
      ...(clonePackages[packageName] as PackageAfterPrepareChangelogs),
      packageJsonGit: getPackageJson(clonePackages, packageName, 'git'),
      packageJsonNpm: getPackageJson(clonePackages, packageName, 'npm'),
    };

    clonePackages[packageName] = currentPackage;
  });

  return { ...env, packages: clonePackages };
};
