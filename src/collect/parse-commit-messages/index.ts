import { white, green, red, yellow } from 'chalk';
import { pipe } from 'ramda';

import type { Module, Env, Message } from '../../types';
import { logger } from '../../helpers/logger';

import { parse } from './parse';
import { refineType } from './refine-type';
import { addLevel } from './add-level';

const { log } = logger('parse commit messages');

const messageTransform = pipe(parse, refineType, addLevel);

const isRelevant = (message: Message) => message.level !== 'misc';

const mapLevelToColour: Record<
  Message['level'],
  typeof green | typeof red | typeof yellow
> = {
  misc: white,
  patch: green,
  minor: yellow,
  major: red,
};

/**
 * Parsing and find out major/minor/patch level
 */
export const parseCommitMessages: Module = (env: Env) => {
  log('Analysing relevant commit messages');
  const commitMessages = (env.rawCommitMessages || [])
    .map(messageTransform)
    .filter(isRelevant);

  commitMessages.forEach(({ hash, level, text }) => {
    log(`${mapLevelToColour[level](level)} commit (${hash}) "${text.trim()}"`);
  });
  const counterMajor = commitMessages.filter(
    ({ level }) => level === 'major'
  ).length;
  const counterMinor = commitMessages.filter(
    ({ level }) => level === 'minor'
  ).length;
  const counterPatch = commitMessages.filter(
    ({ level }) => level === 'patch'
  ).length;

  if (commitMessages.length) {
    log(
      `${yellow(commitMessages.length)} relevant commits: ${red(
        counterMajor
      )} major / ${yellow(counterMinor)} minor / ${green(counterPatch)} patch`
    );
  } else {
    log('No relevant commits found');
  }

  return { ...env, commitMessages } as Env;
};
