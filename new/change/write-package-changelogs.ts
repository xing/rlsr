import { PackageAfterPrepareChangelogs } from './../types';
import type { Module } from '../types';
import { logger } from '../helpers/logger';
import { clone } from 'ramda';
import { join } from 'path';

import fs from 'fs';
import { getReleasablePackages } from '../analyse/adapt-dependencies/get-releasable-packages';

const { error, log } = logger('[change] write package changelogs');

export const writePackageChangelogs: Module = (env) => {
  if (!env.packages) {
    const errorMessage = '"packages" attribute not found on env config object';
    error(errorMessage);
    throw new Error(errorMessage);
  }
  const releasablePackages = getReleasablePackages(clone(env.packages));

  releasablePackages.forEach((packageName) => {
    const currentPackage = env.packages![
      packageName
    ] as PackageAfterPrepareChangelogs;

    log(`writing changelogs for ${packageName} `);
    const changelogJson = currentPackage.changelogs;
    const changelogFile = join(currentPackage.path, 'changelog.json');
    fs.writeFileSync(changelogFile, JSON.stringify(changelogJson, null, 2));
  });
  return { ...env };
};
