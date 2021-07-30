import { clone } from 'ramda';

import type {
  Module,
  PackageAfterCreatePackageJsonContent,
  PackageAfterPrepareChangelogs,
} from '../../types';

import { logger } from '../../helpers/logger';
import { getReleasablePackages } from '../../helpers/get-releasable-packages';

import { getPackageJson } from './get-package-json';

const { error, log } = logger('[analyse] create package json content');

export const createPackageJsonContent: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('analyse packageJson Content');

  const releasablePackages = getReleasablePackages(env.packages);

  const clonePackages = clone(env.packages);

  releasablePackages.forEach((packageName) => {
    log(`generating git & npm package.json files for ${packageName}`);

    const currentPackage: PackageAfterCreatePackageJsonContent = {
      ...(clonePackages[packageName] as PackageAfterPrepareChangelogs),
      packageJsonGit: getPackageJson(clonePackages, packageName, 'git'),
      packageJsonNpm: getPackageJson(clonePackages, packageName, 'npm'),
    };

    clonePackages[packageName] = currentPackage;
  });

  return { ...env, packages: clonePackages };
};
