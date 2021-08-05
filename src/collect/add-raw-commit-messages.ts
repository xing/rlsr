import { pick } from 'ramda';
import { yellow } from 'chalk';
import simpleGit, { SimpleGit } from 'simple-git';

import { logger } from '../helpers/logger';
import { Module, Env } from '../types';

const { log } = logger('git raw messages');

/**
 * Get all commit messages between the last hash and now
 */
export const addRawCommitMessages: Module = async (env: Env) => {
  const git: SimpleGit = simpleGit();

  // If lastReleaseHash isn't available, we assume this is the Project's first release
  const from = env.lastReleaseHash ?? env.initialHash;

  let data = await git.log({
    from,
    to: env.currentHash,
  });

  // parsing and enriching
  const rawCommitMessages = data.all.map(
    pick(['hash', 'date', 'message', 'body'])
  );

  log(`${yellow(rawCommitMessages.length)} overall affected commits`);

  return { ...env, rawCommitMessages } as Env;
};
