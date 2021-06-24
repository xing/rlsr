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
  log(`running on branch ${bold(env.currentBranch)}`);

  // Notify the user if there are still files to commit
  if (env.uncommittedFiles && env.uncommittedFiles.length > 0) {
    error(
      `You have uncommitted changes. ${red(
        env.uncommittedFiles.length
      )} files affected.`
    );

    // Terminate the process if not on Verify mode
    !isVerify(env) && process.exit(exitCodes.UNCOMMITTED);
  }

  // Notify the user if the current branch is not correct for a production release
  if (!isCorrectBranch(env)) {
    error(
      `Production releases must be started on a release branch (release/11.22)`
    );

    // Terminate the process if not on Verify mode
    !isVerify(env) && process.exit(exitCodes.WRONG_BRANCH);
  }

  return env;
};
