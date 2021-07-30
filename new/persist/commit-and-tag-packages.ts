import { clone } from 'ramda';
import type { Env, Module, PackageAfterPrepareChangelogs } from '../types';
import { logger } from '../helpers/logger';

import simpleGit from 'simple-git';
import { getReleasablePackages } from '../analyse/adapt-dependencies/get-releasable-packages';

const { log, error } = logger('[persist] commit and tag packages');
const git = simpleGit();

const commitAndTagPackages: Module = async (env: Env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object.';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  const prepareCommit = (releasablePackages: string[]): string[] => {
    return releasablePackages.map((packageName: string) => {
      const currentPackage = env.packages![
        packageName
      ] as PackageAfterPrepareChangelogs;

      const { incrementedVersion, currentVersion } = currentPackage;
      return `${packageName} ${currentVersion} => ${incrementedVersion}`;
    });
  };

  const releasablePackages = getReleasablePackages(clone(env.packages!));
  const commitMessageStr = `chore(release): publish new version
${prepareCommit(releasablePackages).join('\n')}`;

  try {
    log('Staging changes');
    await git.add('.');
    await git.commit(commitMessageStr);
  } catch (err) {
    error('Error while staging the changes');
    throw err;
  }

  releasablePackages.forEach(async (packageName: string) => {
    const currentPackage = env.packages![
      packageName
    ] as PackageAfterPrepareChangelogs;

    const name = `${packageName}@${currentPackage.incrementedVersion}`;

    try {
      log(`adding tag ${name} `);
      await git.addTag(name);
    } catch (err) {
      error(`Cannot add tag ${name}`);
      throw err;
    }
  });

  return env;
};

export { commitAndTagPackages };
