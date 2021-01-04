import git from 'simple-git/promise';
import { sortSemver } from '../helpers/sort-semver';

import { Module } from '../types';

/**
 * add git information to env by using simple-git package
 */
export const addGitStatus: Module = async (env) => {
  const {
    current: currentBranch,
    files: uncommittedFiles,
  } = await git().status();

  const allTags = await git().tags();

  const tagsInTree = (await git().tag({ '--merged': true }))
    .split('\n')
    .filter(
      (t: string) =>
        // form: v2.15.1
        t.match(/^v\d+.\d+.\d+$/) ||
        // form: v2.20.0-rc.1
        t.match(/^v\d+.\d+.\d+-rc.\d+$/) ||
        // form: release@2.25
        t.match(/^release@\d+.\d+$/)
    )
    .sort(sortSemver)
    .filter(Boolean);

  return { ...env, currentBranch, uncommittedFiles, allTags, tagsInTree };
};
