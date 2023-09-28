import type { Module } from '../types';

import { logger } from '../helpers/logger';

const { error, log } = logger('[analyse] add messages to packages');

export const addMessagesToPackages: Module = (env) => {
  if (!env.commitMessages) {
    const errorMessage = 'missing "commitMessages" on env object';
    error(errorMessage);
    throw new Error(errorMessage);
  }
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('Register messages to packages');
  const clonePackages = structuredClone(env.packages);

  env.commitMessages.forEach((commitMessage) => {
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
