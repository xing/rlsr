import { clone } from 'ramda';
import { white } from 'chalk';

import type { Module } from '../../types';

import { logger } from '../../helpers/logger';

import { findPackageName } from './find-package-name';
import { missingEnvAttrError } from '../../helpers/validation-errors';

const topic = '[analyse] add package names to messages';
const { log } = logger(topic);

export const addPackageNamesToMessages: Module = (env) => {
  if (!env.commitMessages) {
    missingEnvAttrError('commitMessages', topic);
  }

  log('Analyse affected packages per commit');
  const userAffectedPackages = new Set<string>();

  const cloneCommitMessages = clone(env.commitMessages!);

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
