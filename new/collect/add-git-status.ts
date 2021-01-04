import simpleGit, { SimpleGit } from 'simple-git';
import { sortSemver } from '../helpers/sort-semver';
import { Env, Module } from '../types';

/**
 * add git information to env by using simple-git package
 */
export const addGitStatus: Module = async (env: Env) => {
  const git: SimpleGit = simpleGit();
  const { current: currentBranch, files } = await git.status();

  const uncommittedFiles = files.map((f) => f.path);
  const currentHash = (await git.log()).latest?.hash;

  const allTags = (await git.tags()).all.reverse();

  const tagsInTree = (await git.tag(['--merged']))
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

  return {
    ...env,
    currentBranch,
    uncommittedFiles,
    allTags,
    tagsInTree,
    currentHash,
  } as Env;
};
