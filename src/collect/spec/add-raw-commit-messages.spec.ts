/* eslint-env node, jest */
import type { Env, MessageRaw, Module } from '../../types';

type buildPromiseType = <Type>(result: Type) => Promise<Type>;
const buildPromise: buildPromiseType = (result) =>
  new Promise((resolve) => resolve(result));

// chalk mocks
const mockYellow = jest.fn((message) => `yellow(${message})`);
jest.mock('chalk', () => ({ yellow: mockYellow }));

// ramda pick mocks
const messageFactory: (id: number) => MessageRaw = (id: number) => ({
  hash: `mockHash ${id}`,
  date: `mockDate ${id}`,
  message: `mockMessage ${id}`,
  body: `mockBody ${id}`,
});
const mockPicker = jest.fn(messageFactory);
const mockPick = jest.fn(() => mockPicker);
jest.mock('ramda', () => ({ pick: mockPick }));

// logger mocks
const mockLoggerLog = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLoggerLog }));
jest.mock('../../helpers/logger', () => ({ logger: mockLogger }));

// simple-git mocks
const mockSimpleGitLogResult = { all: [1, 2, 3] };
const mockSimpleGitLog = jest.fn(() => buildPromise(mockSimpleGitLogResult));
const mockSimpleGit = jest.fn(() => ({
  log: mockSimpleGitLog,
}));
jest.mock('simple-git', () => mockSimpleGit);
const mockLastReleaseHash = '73087c7e82c715851fba548fd4d9bcd83234eaf9';
const mockEnv: Env = {
  stage: 'canary',
  force: false,
  appRoot: '/',
  initialHash: '8a554b181c5df56e485365064d1637eb5aadcc37',
  currentHash: 'c756e7d373ef983f3a2d3ae8c44ee1ba78bbad2e',
};

describe('addRawCommitMessages Module', () => {
  let addRawCommitMessages: Module;

  beforeAll(() => {
    addRawCommitMessages =
      require('../add-raw-commit-messages').addRawCommitMessages;
  });

  it('uses git raw messages logger', () => {
    expect(mockLogger).toHaveBeenCalledTimes(1);
    expect(mockLogger).toHaveBeenCalledWith('git raw messages');
  });

  describe.each`
    lastReleaseHash
    ${undefined}
    ${mockLastReleaseHash}
  `('with lastReleaseHash: $lastReleaseHash', ({ lastReleaseHash }) => {
    let result: Env;

    beforeAll(async () => {
      result = await addRawCommitMessages({ ...mockEnv, lastReleaseHash });
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('uses simpleGit', () => {
      expect(mockSimpleGit).toHaveBeenCalledTimes(1);
    });

    it("access simpleGit's log data since last release", () => {
      expect(mockSimpleGitLog).toHaveBeenCalledTimes(1);
      expect(mockSimpleGitLog).toHaveBeenCalledWith({
        from: lastReleaseHash ?? mockEnv.initialHash,
        to: mockEnv.currentHash,
      });
    });

    it("creates a picker to fetch Messages's relevant information", () => {
      expect(mockPick).toHaveBeenCalledTimes(1);
      expect(mockPick).toHaveBeenCalledWith([
        'hash',
        'date',
        'message',
        'body',
      ]);
    });

    it("maps over simpleGit's log entries", () => {
      expect(mockPicker).toHaveBeenCalledTimes(
        mockSimpleGitLogResult.all.length
      );
      mockSimpleGitLogResult.all.forEach((value, index) => {
        expect(mockPicker).toHaveBeenNthCalledWith(
          index + 1,
          value,
          index,
          mockSimpleGitLogResult.all
        );
      });
    });

    it('logs a yellow console message', () => {
      expect(mockYellow).toHaveBeenCalledTimes(1);
      expect(mockYellow).toHaveBeenCalledWith(
        mockSimpleGitLogResult.all.length
      );
      expect(mockLoggerLog).toHaveBeenCalledTimes(1);
      expect(mockLoggerLog).toHaveBeenCalledWith(
        `yellow(${mockSimpleGitLogResult.all.length}) overall affected commits`
      );
    });

    it('returns Env config object with "rawCommitMessages" object', () => {
      expect(result).toEqual({
        ...mockEnv,
        lastReleaseHash,
        rawCommitMessages: [
          messageFactory(1),
          messageFactory(2),
          messageFactory(3),
        ],
      });
    });
  });
});
