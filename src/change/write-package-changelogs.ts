import { join } from 'path';

import { clone } from 'ramda';
import { white } from 'chalk';

import type { Module } from '../types';
import { logger } from '../helpers/logger';

import { getReleasablePackages } from '../helpers/get-releasable-packages';
import { writeFile } from '../helpers/write-file';

import { PackageAfterPrepareChangelogs } from '../types';
import { missingEnvAttrError } from '../helpers/validation-errors';

const section = '[change] write package changelogs';
const { log } = logger(section);

export const writePackageChangelogs: Module = (env) => {
  if (!env.packages) {
    missingEnvAttrError('packages', section);
  }
  const releasablePackages = getReleasablePackages(clone(env.packages!));

  releasablePackages.forEach((packageName) => {
    const currentPackage = env.packages![
      packageName
    ] as PackageAfterPrepareChangelogs;

    log(`writing changelogs for ${white(packageName)} `);
    const changelogJson = currentPackage.changelogs;
    const changelogFile = join(currentPackage.path, 'changelog.json');

    writeFile(changelogFile, changelogJson);
  });
  return env;
};
