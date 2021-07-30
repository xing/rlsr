import { clone } from 'ramda';

import { envWithConfig } from '../../fixtures/env';

import type {
  Env,
  Message,
  Module,
  Package,
  PackageAfterPrepareChangelogs,
} from '../../types';

import { RelatedMessages } from '../../types';

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
): RelatedMessages => ({
  date: `mockDate ${id}`,
  text: `text ${id} for package ${packageId}`,
  level: 'patch',
});

// mock Packages
const mockPackageBuilder = (
  id: number
): Package | PackageAfterPrepareChangelogs => ({
  currentVersion: '1.0.0',
  path: `mock/path/to/package_${id}/`,
  packageJson: { name: `mock${id}Package` },
  messages: [messageFactory(1, id), messageFactory(2, id)],
  relatedMessages: [relatedMessageFactory(1, id), relatedMessageFactory(2, id)],
  determinedIncrementLevel: 1,
  dependingOnThis: [],
  dependsOn: [],
  incrementedVersion: `1.1.${id}`,
});

const mockEnv: Env = {
  ...envWithConfig,
  packages: {
    mock1Package: mockPackageBuilder(1),
    mock2Package: mockPackageBuilder(2),
  },
};

describe('prepareChangelogs Module', () => {
  let prepareChangelogs: Module;
  let result: Env;
  let expectedEnv: Env = clone(mockEnv);

  beforeAll(() => {
    jest.useFakeTimers('modern').setSystemTime(new Date('2021, 7, 22'));

    [1, 2].forEach((id) => {
      const version = `1.1.${id}`;
      const expectedPkgChangelogs = {
        [version]: [
          { message: `mockMessage 1 for package ${id}`, hash: 'mockHash 1' },
          { message: `mockMessage 2 for package ${id}`, hash: 'mockHash 2' },
          { message: `text 1 for package ${id}` },
          { message: `text 2 for package ${id}` },
        ],
      };

      (
        expectedEnv.packages![
          `mock${id}Package`
        ] as PackageAfterPrepareChangelogs
      ).changelogs = expectedPkgChangelogs;
    });

    const date = new Date().toISOString();

    expectedEnv.changelog = {
      [date]: [
        {
          package: 'mock1Package',
          version: '1.1.1',
          messages: [
            { message: 'mockMessage 1 for package 1', hash: 'mockHash 1' },
            { message: 'mockMessage 2 for package 1', hash: 'mockHash 2' },
            { message: 'text 1 for package 1' },
            { message: 'text 2 for package 1' },
          ],
        },
        {
          package: 'mock2Package',
          version: '1.1.2',
          messages: [
            { message: 'mockMessage 1 for package 2', hash: 'mockHash 1' },
            { message: 'mockMessage 2 for package 2', hash: 'mockHash 2' },
            { message: 'text 1 for package 2' },
            { message: 'text 2 for package 2' },
          ],
        },
      ],
    };

    prepareChangelogs = require('../prepare-changelogs').prepareChangelogs;
    result = prepareChangelogs(mockEnv) as Env;
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('throws an error when "packages" is missing on Env config object', () => {
    const expectedErrorMessage =
      '"packages" attribute not found on env config object';
    expect(() => prepareChangelogs(envWithConfig)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('throws an error when messages are missing for the package', () => {
    const invalidMockEnv = clone(mockEnv);
    invalidMockEnv.packages!.mock2Package.messages = [];
    invalidMockEnv.packages!.mock2Package.relatedMessages = [];
    const expectedErrorMessage = `No messages found for mock2Package`;

    expect(() => prepareChangelogs(invalidMockEnv)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('returns the right Env config with prepared changelogs', () => {
    expect(result).toEqual(expectedEnv);
  });
});
