import type { MessageConventionalCommit } from '../../../types';

import { refineType } from '../refine-type';

const buildMockedMessage = (
  messageType:
    | 'docs'
    | 'feat'
    | 'fix'
    | 'perf'
    | 'refactor'
    | 'style'
    | 'test'
    | 'chore'
): MessageConventionalCommit => ({
  text: `${messageType}: mock feature commit message`,
  hash: 'd1eb6c0bde101c77205bdc42a1ea5513d61da0d9',
  date: 'Sat Jun 5 13:33:23 2021 -0300',
  message: `${messageType}: mock commit message`,
  body: `mock ${messageType} commit body message`,
});

describe('refine-type', () => {
  it('when type is set, returns message object unchanged', () => {
    const mockMessage = buildMockedMessage('refactor');
    mockMessage.type = 'fix';

    expect(refineType(mockMessage)).toEqual(mockMessage);
  });

  describe.each`
    messageType   | expectedType
    ${'docs'}     | ${'docs'}
    ${'feat'}     | ${'feat'}
    ${'fix'}      | ${'fix'}
    ${'perf'}     | ${'perf'}
    ${'refactor'} | ${'refactor'}
    ${'style'}    | ${'style'}
    ${'test'}     | ${'test'}
    ${'chore'}    | ${'chore'}
    ${'custom'}   | ${'misc'}
    ${'misc'}     | ${'misc'}
  `(
    'when type is not set and message starts with "$messageType"',
    ({ messageType, expectedType }) => {
      it(`sets message's type to ${expectedType}`, () => {
        const mockMessage = buildMockedMessage(messageType);
        expect(refineType(mockMessage)).toEqual({
          ...mockMessage,
          type: expectedType,
        });
      });
    }
  );
});
