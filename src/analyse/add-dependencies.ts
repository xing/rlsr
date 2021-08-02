import { clone } from 'ramda';

import {
  Module,
  Package,
  RelatedPackageDependsOn,
  RelatedPackageTypes,
} from '../types';

import { logger } from '../helpers/logger';
import { missingEnvAttrError } from '../helpers/validation-errors';

const topic = '[analyse] add dependencies';
const { log } = logger(topic);

export const addDependencies: Module = (env) => {
  log("Populating packages' dependencies");

  if (!env.packages) {
    missingEnvAttrError('packages', topic);
  }

  const envPackages = clone(env.packages!);

  const packagesNames = Object.keys(envPackages);

  const packages = packagesNames.reduce((accumulator, packageName) => {
    const currentPackage = { ...(accumulator![packageName] as Package) };

    const dependencies: RelatedPackageDependsOn[] = [
      // all dependencies
      ...Object.entries(currentPackage.packageJson.dependencies || {}).map(
        ([name, range]) => ({
          name,
          range,
          type: 'default' as RelatedPackageTypes,
        })
      ),
      // plus all peer dependencies
      ...Object.entries(currentPackage.packageJson.peerDependencies || {}).map(
        ([name, range]) => ({
          name,
          range,
          type: 'peer' as RelatedPackageTypes,
        })
      ),
      // we don't care about dev dependencies
    ]
      // filter out external packages
      .filter(({ name }) => {
        return packagesNames.includes(name);
      })
      // if it's already in the rlsr.json, we take that one
      .map((dependency) => {
        if (
          dependency.range === '*' &&
          env.status?.packages[packageName].dependencies[dependency.name]
        ) {
          dependency.range =
            env.status?.packages[packageName].dependencies[
              dependency.name
            ].range;
        }
        return dependency;
      });

    // Assign only internal dependencies
    currentPackage.dependsOn = dependencies;

    return {
      ...accumulator,
      [packageName]: currentPackage,
    };
  }, envPackages);

  return { ...env, packages };
};
