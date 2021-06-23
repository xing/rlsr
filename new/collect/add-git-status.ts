import simpleGit, { SimpleGit } from 'simple-git';
import { sortSemver } from '../helpers/sort-semver';
import { Env, Module } from '../types';

// @TODO: Allow users to specify their own tags format
const verifyTag = (tag: string) =>
  // format: v2.15.1
  tag.match(/^v\d+.\d+.\d+$/) ||
  // format: v2.20.0-rc.1
  tag.match(/^v\d+.\d+.\d+-rc.\d+$/) ||
  // format: release@2.25
  tag.match(/^release@\d+.\d+$/);

/**
 * add git information to env by using simple-git package
 */
export const addGitStatus: Module = async (env: Env) => {
  const git: SimpleGit = simpleGit();
  const { current: currentBranch, files } = await git.status();

  const uncommittedFiles = files.map((f) => f.path);
  const currentHash = (await git.log()).latest?.hash;
  const initialHash = (
    await git.raw('rev-list', '--max-parents=0', 'HEAD')
  ).trim();

  const allTags = Array.from((await git.tags()).all).reverse();

  const tagsInTree = (await git.tag(['--merged']))
    .split('\n')
    .filter(verifyTag)
    .sort(sortSemver)
    .filter(Boolean);

  return {
    ...env,
    allTags,
    currentBranch,
    currentHash,
    initialHash,
    tagsInTree,
    uncommittedFiles,
  } as Env;
};
