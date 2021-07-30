import type { MessageConventionalCommit } from '../../types';

// sometimes, we need to help the parser out a bit.
export const refineType = (
  messageConventionalCommit: MessageConventionalCommit
): MessageConventionalCommit => {
  const message = { ...messageConventionalCommit };
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
