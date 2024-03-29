import type { Env, Message, Module } from '../types';

import { logger } from '../helpers/logger';

const simpleGit = require('simple-git');

const { error } = logger('add files to commits');

const gitCommand: string[] = [
  'diff-tree',
  '--no-commit-id',
  '--name-only',
  '-r',
];

const addFilesToCommitMessages: Module = async (env: Env) => {
  const { commitMessages: originalCommitMessages } = env;
  if (!originalCommitMessages) {
    throw new Error('Cannot read commitMessages to extract committed files');
  }

  const committedFiles = await Promise.all(
    originalCommitMessages.map(async (commitMessage: Message) => {
      try {
        const result: string = await simpleGit().raw(
          ...gitCommand,
          commitMessage.hash
        );

        const trimmedResult = result.trim();
        return trimmedResult === '' ? [] : trimmedResult.split('\n');
      } catch (e) {
        error(e);
        throw new Error('Cannot extract committed files');
      }
    })
  );

  const commitMessages = originalCommitMessages.map((commitMessage, index) => ({
    ...commitMessage,
    committedFiles: committedFiles[index],
  }));

  return { ...env, commitMessages } as Env;
};
export { addFilesToCommitMessages };
