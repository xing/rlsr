import type {
  Module,
  PackageAfterDetermineVersion,
  RelatedPackageDependsOn,
} from '../types';

import { logger } from '../helpers/logger';

const { error, log } = logger('[analyse] create rlsr json content');

export const createRlsrJsonContent: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('create rlsr.json content');

  const packages = Object.fromEntries(
    Object.entries(env.packages).map(([name, pkg]) => {
      const dependencies = pkg.dependsOn.reduce(
        (
          accumulator: Record<string, RelatedPackageDependsOn>,
          nextDependency
        ) => {
          accumulator[nextDependency.name] = nextDependency;
          return accumulator;
        },
        {}
      );
      return [
        name,
        {
          // if there was no increment, the version says as it was
          version:
            (pkg as PackageAfterDetermineVersion).incrementedVersion ??
            pkg.currentVersion,
          dependencies,
        },
      ];
    })
  );

  const newStatus = {
    lastReleaseHash: env.currentHash,
    packages,
  };

  return { ...env, newStatus };
};
