import { Env, Module, Package } from '../types';
import { sync as glob } from 'glob';
import { yellow } from 'chalk';

import { logger } from '../helpers/logger';

const { error, log } = logger('add all packages');

// Pick only the folder part of the file's path
const PACKAGE_JSON_ENDING = /package\.json$/;

export const addAllPackages: Module = (env) => {
  log('Search for all package.json');
  // Fetch all packageJson' paths
  const packageJsonPaths: string[] = glob(
    `${env.appRoot}/!(node_modules)/**/package.json`
  );

  const packages: Env['packages'] = packageJsonPaths.reduce(
    (accumulator, packageJsonPath) => {
      const currentPackage: Package = {
        path: packageJsonPath.replace(PACKAGE_JSON_ENDING, ''),
        packageJson: require(packageJsonPath),
        messages: [],
        relatedMessages: [],
        determinedIncrementLevel: -1,
        dependingOnThis: [],
        dependsOn: [],
      };

      // Make sure every package has a name
      if (!currentPackage.packageJson.name) {
        const errorMessage = `Missing "name" attribute for package ${packageJsonPath}`;
        error(errorMessage);
        throw new Error(errorMessage);
      }

      return {
        ...accumulator,
        [currentPackage.packageJson.name]: currentPackage,
      };
    },
    {} as Env['packages']
  );

  log(`${yellow(Object.keys(packages || {}).length)} packages found`);

  return { ...env, packages };
};
