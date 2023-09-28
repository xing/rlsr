import fs from 'fs';

import { envWithConfig } from '../../fixtures/env';
import type { Module, Env, Message, RelatedMessage } from '../../types';

jest.mock('fs');

// mock logger
const mockLog = jest.fn();
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog, error: mockError }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

const messageFactory = (id: number, packageId: number): Message => ({
  hash: `mockHash ${id}`,
  date: `mockDate ${id}`,
  message: `mockMessage ${id} for package ${packageId}`,
  body: `mockBody ${id}`,
  text: `text ${id}`,
  level: 'patch',
});

const relatedMessageFactory = (
  id: number,
  packageId: number
): RelatedMessage => ({
  date: `mockDate ${id}`,
  text: `text ${id} for package ${packageId}`,
  level: 'patch',
});

const mockEnv: Env = {
  ...envWithConfig,
  mainChangelogPath: 'changelogs/rlsr-log-2021-31.json',
  changelog: {
    '2021-07-27T09:30:36.657Z': [
      {
        package: '@xingternal/brewery-test-one',
        version: '1.1.0',
        determinedIncrementLevel: 'patch',
        messages: [messageFactory(1, 1)],
      },
      {
        package: '@xingternal/brewery-test-three',
        version: '3.3.0',
        determinedIncrementLevel: 'patch',
        messages: [
          messageFactory(1, 2),
          messageFactory(2, 2),
          relatedMessageFactory(1, 2),
          relatedMessageFactory(1, 2),
        ],
      },
    ],
  },
};

describe('writeMainChangelog Module', () => {
  let writeMainChangelog: Module;

  beforeAll(() => {
    writeMainChangelog = require('../write-main-changelog').writeMainChangelog;
    jest.useFakeTimers('modern').setSystemTime(new Date('2021, 8, 3'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('throws an error when "changelogPath" is missing on Env config object', () => {
    const expectedErrorMessage =
      '"changelogPath" attribute not found on env config object';

    const invalidEnvConfig = structuredClone(envWithConfig);
    invalidEnvConfig.config!.changelogPath = '';

    expect(() => writeMainChangelog(invalidEnvConfig)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('writes main changelog', () => {
    writeMainChangelog(mockEnv);

    expect(mockLog).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith('writing main changelog');

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it('creates a new chanlog directory if one does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    writeMainChangelog(mockEnv);

    expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
  });

  it('writes main changelog with the correct content', () => {
    const expectedFilePath = 'changelogs/rlsr-log-2021-31.json';
    const expectedFileContent = `${JSON.stringify(
      mockEnv.changelog,
      null,
      2
    )}\n`;

    writeMainChangelog(mockEnv);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expectedFilePath,
      expectedFileContent
    );
  });
});
