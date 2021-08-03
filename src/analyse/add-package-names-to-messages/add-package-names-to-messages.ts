import { clone } from 'ramda';
import { white } from 'chalk';

import type { Module } from '../../types';

import { logger } from '../../helpers/logger';

import { findPackageName } from './find-package-name';

const { error, log } = logger('[analyse] add package names to messages');

export const addPackageNamesToMessages: Module = (env) => {
  if (!env.commitMessages) {
    const errorMessage = 'missing "commitMessages" on env object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('Analyse affected packages per commit');
  const userAffectedPackages = new Set<string>();

  const cloneCommitMessages = clone(env.commitMessages);

  cloneCommitMessages.forEach((commitMessage) => {
    const affectedPackages = new Set<string>();

    commitMessage.committedFiles?.forEach((committedFile) => {
      const affectedPackageName = findPackageName(env.appRoot, committedFile);
      affectedPackages.add(affectedPackageName);
      userAffectedPackages.add(affectedPackageName);
    });

    // convert Set into array
    commitMessage.affectedPackages = [...affectedPackages];
  });

  [...userAffectedPackages].forEach((affectedPackage) =>
    log(`${white(affectedPackage)} was affected`)
  );

  return { ...env, commitMessages: cloneCommitMessages };
};
