import { sync as parser } from 'conventional-commits-parser';

import type { MessageRaw, MessageConventionalCommit } from '../../types';

export const parse = (messageRaw: MessageRaw): MessageConventionalCommit => {
  const message = { ...messageRaw };
  const text = `${message.message.trim()}
${message.body.trim()}`;
  const { type, scope, subject } = parser(text);
  return { ...message, text, type, scope, subject };
};
