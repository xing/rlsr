import { yellow } from 'chalk';
import { sync as parser } from 'conventional-commits-parser';
import { pipe } from 'lodash/fp';
import { logger } from '../helpers/logger';
import { Module, Env, Message } from '../types';

const { log } = logger('git messages');

const parse = (message: Message): Message => {
  const text = `${message.message.trim()}
${message.body.trim()}`;
  const { type, scope, subject } = parser(text);
  return { ...message, text, type, scope, subject };
};

// sometimes, we need to help the parser out a bit.
const refineType = (message: Message): Message => {
  if (!message.type)
    message.type =
      [
        (message.message.match(/docs(\(|:\s?)/i) && 'docs') || null,
        (message.message.match(/feat(\(|:\s?)/i) && 'feat') || null,
        (message.message.match(/fix(\(|:\s?)/i) && 'fix') || null,
        (message.message.match(/perf(\(|:\s?)/i) && 'perf') || null,
        (message.message.match(/refactor(\(|:\s?)/i) && 'refactor') || null,
        (message.message.match(/style(\(|:\s?)/i) && 'style') || null,
        (message.message.match(/test(\(|:\s?)/i) && 'test') || null,
        (message.message.match(/chore(\(|:\s?)/i) && 'chore') || null,
      ].filter(Boolean)[0] || 'misc';
  return message;
};

const addLevel = (message: Message) => {
  if (message.type === 'feat') {
    message.level = 'minor';
  }
  if (['chore', 'docs', 'style', 'test', 'misc'].includes(message.type || '')) {
    message.level = 'misc';
  }

  if (message.text?.includes('BREAKING')) {
    message.level = 'major';
  }

  return message;
};

export const messageTransform = pipe(parse, refineType, addLevel);

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
      commitMessages.filter((m) => m.level === 'major').length
    } major / ${
      commitMessages.filter((m) => m.level === 'minor').length
    } minor / ${commitMessages.filter((m) => m.level === 'patch').length} patch`
  );

  return { ...env, commitMessages } as Env;
};
