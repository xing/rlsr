import { Module, Package } from '../types';

import { logger } from '../helpers/logger';

const { error, log } = logger('add dependencies');

export const addDependencies: Module = (env) => {
  if (!env.packages) {
    const errorMessage = '"packages" attribute not found on env config object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log("Populating packages' dependencies");

  const packagesNames = Object.keys(env.packages);

  const packages = packagesNames.reduce(
    (accumulator, packageName, _currentIndex, packagesNames) => {
      const currentPackage = { ...(accumulator![packageName] as Package) };

      // Assign only internal dependencies
      currentPackage.dependsOn.dependencies = Object.keys(
        currentPackage.packageJson.dependencies || {}
      ).filter((dependencyName) => packagesNames.includes(dependencyName));

      // Assign only internal devDependencies
      currentPackage.dependsOn.devDependencies = Object.keys(
        currentPackage.packageJson.devDependencies || {}
      ).filter((dependencyName) => packagesNames.includes(dependencyName));

      // Assign only internal peerDependencies
      currentPackage.dependsOn.peerDependencies = Object.keys(
        currentPackage.packageJson.peerDependencies || {}
      ).filter((dependencyName) => packagesNames.includes(dependencyName));

      return {
        ...accumulator,
        [packageName]: currentPackage,
      };
    },
    env.packages
  );

  return { ...env, packages };
};
