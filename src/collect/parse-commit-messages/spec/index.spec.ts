import { Env, Message, Module } from '../../../types';

// Helper
const buildMessageMock = (
  quantity: number,
  level: Message['level']
): Message[] =>
  new Array(quantity).fill({
    level,
    hash: 'hash',
    date: 'date',
    message: 'message',
    text: 'text',
    body: 'body',
  });

// mock chalk
const mockWhite = jest.fn((text) => `white(${text})`);
const mockGreen = jest.fn((text) => `green(${text})`);
const mockRed = jest.fn((text) => `red(${text})`);
const mockYellow = jest.fn((text) => `yellow(${text})`);
jest.mock('chalk', () => ({
  white: mockWhite,
  green: mockGreen,
  red: mockRed,
  yellow: mockYellow,
}));

// mock ramda
const mockMessageTransform = jest.fn((element) => element);
const mockPipe = jest.fn(() => mockMessageTransform);
jest.mock('ramda', () => ({ pipe: mockPipe }));

// mock logger
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog }));
jest.mock('../../../helpers/logger', () => ({ logger: mockLogger }));

// mock parse helpers
const mockParse = jest.fn();
const mockRefineType = jest.fn();
const mockAddLevel = jest.fn();

jest.mock('../parse', () => ({ parse: mockParse }));
jest.mock('../refine-type', () => ({ refineType: mockRefineType }));
jest.mock('../add-level', () => ({ addLevel: mockAddLevel }));

describe('parse-commit-messages', () => {
  let parseCommitMessages: Module;

  beforeAll(() => {
    parseCommitMessages = require('../index').parseCommitMessages;
  });

  test('creates "parse commit messages" logger', () => {
    expect(mockLogger).toHaveBeenCalledTimes(1);
    expect(mockLogger).toHaveBeenCalledWith('parse commit messages');
  });
  test('chain parsers (parse, refineType and addLevel) to parse messages', () => {
    expect(mockPipe).toHaveBeenCalledTimes(1);
    expect(mockPipe).toHaveBeenCalledWith(
      mockParse,
      mockRefineType,
      mockAddLevel
    );
  });

  describe.each`
    major | minor | patch | misc
    ${0}  | ${0}  | ${0}  | ${1}
    ${1}  | ${0}  | ${0}  | ${1}
    ${0}  | ${2}  | ${0}  | ${2}
    ${0}  | ${0}  | ${3}  | ${3}
    ${1}  | ${2}  | ${3}  | ${4}
  `(
    'on $major major, $minor minor, $patch patch, $misc misc',
    ({ major, minor, patch, misc }) => {
      const mockEnv: Env = {
        stage: 'canary',
        force: false,
        appRoot: '/',
        rawCommitMessages: [
          ...buildMessageMock(major, 'major'),
          ...buildMessageMock(minor, 'minor'),
          ...buildMessageMock(patch, 'patch'),
          ...buildMessageMock(misc, 'misc'),
        ],
      };
      let result: Env;
      beforeAll(() => {
        result = parseCommitMessages(mockEnv) as Env;
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      test('logs introduction', () => {
        expect(mockLog).toHaveBeenNthCalledWith(
          1,
          'Analysing relevant commit messages'
        );
      });

      test('logs relevant commit messages', () => {
        for (let i = 1; i <= major; i++) {
          expect(mockRed).toHaveBeenNthCalledWith(i, 'major');
          expect(mockLog).toHaveBeenNthCalledWith(
            1 + i,
            `red(major) commit (hash) "text"`
          );
        }
        for (let i = 1; i <= minor; i++) {
          expect(mockYellow).toHaveBeenNthCalledWith(i, 'minor');
          expect(mockLog).toHaveBeenNthCalledWith(
            1 + major + i,
            `yellow(minor) commit (hash) "text"`
          );
        }
        for (let i = 1; i <= patch; i++) {
          expect(mockGreen).toHaveBeenNthCalledWith(i, 'patch');
          expect(mockLog).toHaveBeenNthCalledWith(
            1 + major + minor + i,
            `green(patch) commit (hash) "text"`
          );
        }
      });

      if (major + minor + patch === 0) {
        test('add logs', () => {
          expect(mockLog).toHaveBeenLastCalledWith('No relevant commits found');
        });
      } else {
        test(`logs ${major} major, ${minor} minor and ${patch} patch commits`, () => {
          expect(mockYellow).toHaveBeenNthCalledWith(
            minor + 1,
            major + minor + patch
          );
          expect(mockYellow).toHaveBeenNthCalledWith(minor + 2, minor);

          expect(mockLog).toHaveBeenNthCalledWith(
            2 + major + minor + patch,
            `yellow(${
              major + minor + patch
            }) relevant commits: red(${major}) major / yellow(${minor}) minor / green(${patch}) patch`
          );
        });

        test(`returns an Env config object with ${
          major + minor + patch
        } parsed messages in "commitMessages" attribute`, () => {
          expect(result).toEqual({
            ...mockEnv,
            commitMessages: [
              ...buildMessageMock(major, 'major'),
              ...buildMessageMock(minor, 'minor'),
              ...buildMessageMock(patch, 'patch'),
            ],
          });
        });
      }
    }
  );
});
