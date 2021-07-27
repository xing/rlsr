// import { writeMainChangelog } from './../write-main-changelog';
import { envWithConfig } from '../../fixtures/env';
import type { Module, Env } from '../../types';
import { clone } from 'ramda';
import fs from 'fs';

jest.mock('fs');

// mock logger
const mockLog = jest.fn();
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog, error: mockError }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

const mockEnv: Env = {
  ...envWithConfig,
  changelog: {
    '2021-07-27T09:30:36.657Z': [
      {
        package: '@xingternal/brewery-test-one',
        version: '1.1.0',
        messages: [
          {
            message: 'feat: add new package as dev and peer dependency',
            hash: 'a34b4b38fc15ada5f305939a0de2463f68d74ad2',
          },
        ],
      },
      {
        package: '@xingternal/brewery-test-three',
        version: '3.3.0',
        messages: [
          {
            message: 'feat: add new package as dev and peer dependency',
            hash: 'a34b4b38fc15ada5f305939a0de2463f68d74ad2',
          },
          {
            message: 'affected dependencies: @xingternal/brewery-test-four',
          },
          {
            message:
              'fix: dependency "@xingternal/brewery-test-four" has changed from 1.0.0 to 1.1.0',
          },
        ],
      },
    ],
  },
};

describe('writeMainChangelog Module', () => {
  let writeMainChangelog: Module;

  beforeAll(() => {
    writeMainChangelog = require('../write-main-changelog').writeMainChangelog;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error when "changelogPath" is missing on Env config object', () => {
    const expectedErrorMessage =
      '"changelogPath" attribute not found on env config object';

    const invalidEnvConfig = clone(envWithConfig);
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
    const expectedFilePath = 'changelogs/changelog.json';
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
