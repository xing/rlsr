import { clone } from 'ramda';
import { white } from 'chalk';

import type {
  Module,
  PackageAfterCreatePackageJsonContent,
  PackageAfterPrepareChangelogs,
} from '../../types';

import { logger } from '../../helpers/logger';

import { getPackageJson } from './get-package-json';
import { missingEnvAttrError } from '../../helpers/validation-errors';

const topic = '[analyse] create package json content';
const { log } = logger(topic);

export const createPackageJsonContent: Module = (env) => {
  if (!env.packages) {
    missingEnvAttrError('packages', topic);
  }

  log('analyse packageJson Content');

  const clonePackages = clone(env.packages!);

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
