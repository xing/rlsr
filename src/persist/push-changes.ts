import simpleGit from 'simple-git';

import type { Env, Module } from '../types';
import { logger } from '../helpers/logger';

const { log, error } = logger('[persist] push changes');
const git = simpleGit();

const pushChanges: Module = async (env: Env) => {
  const { remote, branch } = env.config!;

  try {
    log('Pulling changes');
    await git.pull(remote, branch, { '--rebase': 'true' });
  } catch (err) {
    error('Error pulling changes');
    throw err;
  }

  try {
    log('Pushing changes');
    await git.push(remote, branch);

    log('Pushing tags');
    await git.pushTags(remote, ['--follow-tags']);
  } catch (err) {
    const backupBranchName = `release-backup-${
      new Date().toISOString().split('T')[0]
    }`;

    error(
      `Error pushing changes, persisting release changes into "${backupBranchName}"`
    );

    try {
      await git.checkoutBranch(backupBranchName, branch);
      await git.push(remote, backupBranchName);
    } catch (err) {
      error('cannot persist release changes');
    }

    throw err;
  }

  return env;
};

export { pushChanges };
