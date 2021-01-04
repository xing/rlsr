import { yellow } from 'chalk';
import { logger } from '../helpers/logger';
import { Module } from '../types';

const { log } = logger('prev hash');

export const findLastReleaseTag = (tags: string[]) => {
  const relevant = tags.filter((t) => t.startsWith('release@'));
  return relevant[0] || '';
};

export const findLastProductionTag = (tags: string[]) => {
  // all that is not an RC tag
  const relevant = tags.filter((t) => t.indexOf('rc') === -1);
  return relevant[0];
};

/**
 * Determin the git commit hash from where the last release has happened
 */
export const addLastReleaseHash: Module = async (env) => {
  // we usually write the last hash into the rlsr.json file
  let lastReleaseHash: string = env.status?.lastReleaseHash ?? '';

  if (!lastReleaseHash && env.currentBranch === env.config?.mainBranch) {
    // on the production branch, we'd also allow semver tags
    lastReleaseHash = findLastReleaseTag(env.allTags || []);
  }

  if (!lastReleaseHash) {
    lastReleaseHash = findLastProductionTag(env.allTags || []);
  }

  log(`using ${yellow(lastReleaseHash)} as previous commit hash or tag`);

  return { ...env, lastReleaseHash };
};
