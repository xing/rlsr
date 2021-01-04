import { red, bold } from 'chalk';
import { Env, Module } from '../types';

import { logger } from '../helpers/logger';
import { isVerify } from '../helpers/when';

const { log, error } = logger('git status');

const isCorrectBranch = (env: Env) => {
  switch (env.stage) {
    case 'canary':
      return true;
    case 'beta':
      return env.currentBranch === env.config?.betaBranch;
    case 'production':
      return env.currentBranch === env.config?.productionBranch;
  }
};

export enum exitCodes {
  UNCOMMITTED = 1,
  WRONG_BRANCH = 2,
}
/**
 * checks if user is on the right branch and has everything committed
 */
export const checkGitStatus: Module = async (env: Env) => {
  // exit if there are still files to commit (unless in verify mode)
  if (!isVerify(env) && (env.uncommittedFiles?.length ?? 0) > 0) {
    error(
      `You have uncommitted changes. ${red(
        '' + env.uncommittedFiles?.length
      )} files affected.`
    );
    process.exit(exitCodes.UNCOMMITTED);
  }

  // for a production release you have to be on a release branch
  if (!isCorrectBranch(env)) {
    error(
      `Production releases must be started on a release branch (release/11.22)`
    );
    process.exit(exitCodes.WRONG_BRANCH);
  }

  log(`running on branch ${bold(env.currentBranch)}`);

  return env;
};
