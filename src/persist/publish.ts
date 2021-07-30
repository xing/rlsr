import { white } from 'chalk';

import type { Module, PackageAfterCreatePackageJsonContent } from '../types';

import { logger } from '../helpers/logger';
import { command } from '../helpers/command';
import { getReleasablePackages } from '../helpers/get-releasable-packages';

const topic = 'publish to NPM';
const { error, log } = logger(topic);

// now that we have all relevant files in place locally
// we can publish each of the packages to npm.
// Again go through each package that has an increment of at least `0`
// Then go into that folder and run `npm publish .` in there.
// We don't want the output in the log (except in verbose mode).
// But it's worth printing a success message for each released package.
export const publish: Module = async (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object.';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  const releasablePackages = getReleasablePackages(env.packages);

  log(white(`Releasing ${releasablePackages.length} packages`));

  for (const releasablePackage of releasablePackages) {
    const currentPackage = env.packages![
      releasablePackage
    ] as PackageAfterCreatePackageJsonContent;

    if (currentPackage.packageJson.private) {
      continue;
    }

    await command(
      topic,
      () => {
        log(
          `publishing ${releasablePackage}@${currentPackage.incrementedVersion}`
        );
        return `npm publish ${currentPackage.path}`;
      },
      'silent', // @TODO: Use 'inf' on verbose mode
      'err'
    )(env);
  }

  return env;
};
