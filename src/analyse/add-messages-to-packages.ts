import { clone } from 'ramda';

import type { Module } from '../types';

import { logger } from '../helpers/logger';
import { missingEnvAttrError } from '../helpers/validation-errors';

const topic = '[analyse] add messages to packages';
const { error, log } = logger(topic);

export const addMessagesToPackages: Module = (env) => {
  if (!env.commitMessages) {
    missingEnvAttrError('commitMessages', topic);
  }

  if (!env.packages) {
    missingEnvAttrError('packages', topic);
  }

  log('Register messages to packages');
  const clonePackages = clone(env.packages!);

  env.commitMessages!.forEach((commitMessage) => {
    commitMessage.affectedPackages?.forEach((affectedPackage) => {
      if (!clonePackages[affectedPackage]) {
        const errorMessage = `"${affectedPackage}" is not a valid (registered) package`;
        error(errorMessage, commitMessage);
        throw new Error(errorMessage);
      }
      clonePackages[affectedPackage].messages.push(commitMessage);
    });
  });

  return { ...env, packages: clonePackages };
};
