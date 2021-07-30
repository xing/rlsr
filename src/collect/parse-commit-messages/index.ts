import { yellow } from 'chalk';
import { pipe } from 'ramda';

import type { Module, Env, Message } from '../../types';
import { logger } from '../../helpers/logger';

import { parse } from './parse';
import { refineType } from './refine-type';
import { addLevel } from './add-level';

const { log } = logger('git messages');

const messageTransform = pipe(parse, refineType, addLevel);

const isRelevant = (message: Message) => message.level !== 'misc';

/**
 * Parsing and find out major/minor/patch level
 */
export const parseCommitMessages: Module = (env: Env) => {
  const commitMessages = (env.rawCommitMessages || [])
    .map(messageTransform)
    .filter(isRelevant);

  log(
    `${yellow(commitMessages.length)} relevant commits: ${
      commitMessages.filter(({ level }) => level === 'major').length
    } major / ${
      commitMessages.filter(({ level }) => level === 'minor').length
    } minor / ${
      commitMessages.filter(({ level }) => level === 'patch').length
    } patch`
  );

  return { ...env, commitMessages } as Env;
};
