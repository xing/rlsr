import { join } from 'path';

import fs from 'fs';

import { clone } from 'ramda';

import type { Module } from '../types';
import { logger } from '../helpers/logger';

import { getReleasablePackages } from '../helpers/get-releasable-packages';

import { PackageAfterPrepareChangelogs } from '../types';

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

    fs.writeFileSync(
      changelogFile,
      `${JSON.stringify(changelogJson, null, 2)}\n`
    );
  });
  return env;
};
