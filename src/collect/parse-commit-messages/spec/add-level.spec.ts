/* eslint-env node, jest */
import type { MessageConventionalCommit } from '../../../types';

const buildMockedMessage = (
  type: MessageConventionalCommit['type'],
  breaking: boolean
): MessageConventionalCommit => ({
  type,
  text: `${type}: mock feature commit message ${breaking && 'BREAKING'}`,
  hash: 'd1eb6c0bde101c77205bdc42a1ea5513d61da0d9',
  date: 'Sat Jun 5 13:33:23 2021 -0300',
  message: `mock ${type} commit message`,
  body: `mock ${type} commit body message`,
});

import { addLevel } from '../add-level';

describe.each`
  type          | breaking | expectedLevel
  ${'chore'}    | ${false} | ${'misc'}
  ${'style'}    | ${false} | ${'misc'}
  ${'chore'}    | ${true}  | ${'major'}
  ${'fix'}      | ${false} | ${'patch'}
  ${'fix'}      | ${true}  | ${'major'}
  ${'style'}    | ${true}  | ${'major'}
  ${'refactor'} | ${false} | ${'patch'}
  ${'refactor'} | ${true}  | ${'major'}
  ${'perf'}     | ${false} | ${'patch'}
  ${'perf'}     | ${true}  | ${'major'}
  ${'revert'}   | ${false} | ${'patch'}
  ${'revert'}   | ${true}  | ${'major'}
  ${'feat'}     | ${false} | ${'minor'}
  ${'feat'}     | ${true}  | ${'major'}
`(
  'add-level helper: type: "$type", (Breaking: $breaking)',
  ({ type, breaking, expectedLevel }) => {
    it(`assigns "${expectedLevel}" to the Message's "level" attribute`, () => {
      const mockMessage = buildMockedMessage(type, breaking);
      expect(addLevel(mockMessage)).toEqual({
        ...mockMessage,
        level: expectedLevel,
      });
    });
  }
);
