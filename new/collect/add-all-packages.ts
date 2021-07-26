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
  const packageJsonPaths: string[] = [
    ...glob(`${env.appRoot}/package.json`), // the main project's
    ...glob(`${env.appRoot}/!(node_modules)/**/package.json`), // and everything else
  ];

  const packages: Env['packages'] = packageJsonPaths.reduce(
    (accumulator, packageJsonPath) => {
      const packageJson = require(packageJsonPath);

      // Make sure every package has a name
      if (!packageJson.name) {
        const errorMessage = `Missing "name" attribute for package <${packageJsonPath}>`;
        error(errorMessage);
        throw new Error(errorMessage);
      }

      // first look at the rlsr.json for current version
      // then into the package.json
      // and have 1.0.0 as a fallback
      const currentVersion =
        env.status?.packages[packageJson.name]?.version ??
        packageJson.version ??
        '1.0.0';

      const currentPackage: Package = {
        currentVersion,
        path: packageJsonPath.replace(PACKAGE_JSON_ENDING, ''),
        packageJson,
        messages: [],
        relatedMessages: [],
        determinedIncrementLevel: -1,
        dependingOnThis: [],
        dependsOn: [],
      };

      return {
        ...accumulator,
        [packageJson.name]: currentPackage,
      };
    },
    {} as Env['packages']
  );

  log(`${yellow(Object.keys(packages || {}).length)} packages found`);

  return { ...env, packages };
};
