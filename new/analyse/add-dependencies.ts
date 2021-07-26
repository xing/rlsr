import { Module, Package, RelatedPackageTypes } from '../types';

import { logger } from '../helpers/logger';

const { error, log } = logger('[analyse] add dependencies');

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
      currentPackage.dependsOn.push(
        ...Object.entries(currentPackage.packageJson.dependencies || {})
          .filter(([name]) => packagesNames.includes(name))
          .map(([name, range]) => ({
            type: 'default' as RelatedPackageTypes,
            name,
            range,
          }))
      );

      // Assign only internal devDependencies
      currentPackage.dependsOn.push(
        ...Object.entries(currentPackage.packageJson.devDependencies || {})
          .filter(([name]) => packagesNames.includes(name))
          .map(([name, range]) => ({
            type: 'dev' as RelatedPackageTypes,
            name,
            range,
          }))
      );

      // Assign only internal peerDependencies
      currentPackage.dependsOn.push(
        ...Object.entries(currentPackage.packageJson.peerDependencies || {})
          .filter(([name]) => packagesNames.includes(name))
          .map(([name, range]) => ({
            type: 'peer' as RelatedPackageTypes,
            name,
            range,
          }))
      );

      return {
        ...accumulator,
        [packageName]: currentPackage,
      };
    },
    env.packages
  );

  return { ...env, packages };
};
