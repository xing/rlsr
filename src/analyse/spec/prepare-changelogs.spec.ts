import { clone } from 'ramda';

import type {
  Env,
  Message,
  Module,
  Package,
  PackageAfterPrepareChangelogs,
  PackageChangelog,
  RelatedMessage,
} from '../../types';

// mock chalk
const mockWhite = jest.fn((text) => `white(${text})`);
jest.mock('chalk', () => ({
  white: mockWhite,
}));

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

import { envWithConfig } from '../../fixtures/env';

const mockEnv: Env = {
  ...envWithConfig,
  packages: {
    mock1Package: mockPackageBuilder(1),
    mock2Package: mockPackageBuilder(2),
  },
};

const invalidMockEnv: Env = {
  ...envWithConfig,
  packages: {
    mockPackage: {
      currentVersion: '1.0.0',
      path: `mock/path/`,
      packageJson: { name: `mockPackage` },
      messages: [],
      relatedMessages: [],
      determinedIncrementLevel: 1,
      dependingOnThis: [],
      dependsOn: [],
    },
  },
};

describe('prepareChangelogs Module', () => {
  let prepareChangelogs: Module;
  let result: Env;
  let expectedEnv: Env = clone(mockEnv);

  beforeAll(() => {
    jest.useFakeTimers('modern').setSystemTime(new Date('2022, 1, 3'));

    [1, 2].forEach((id) => {
      const version = `1.1.${id}`;
      const expectedPkgChangelogs: PackageChangelog = {
        [version]: [
          messageFactory(1, id),
          messageFactory(2, id),
          relatedMessageFactory(1, id),
          relatedMessageFactory(2, id),
        ],
      };

      (
        expectedEnv.packages![
          `mock${id}Package`
        ] as PackageAfterPrepareChangelogs
      ).changelogs = expectedPkgChangelogs;
    });

    expectedEnv.mainChangelogPath = 'changelogs/rlsr-log-2022-01.json';

    expectedEnv.changelog = {
      '2022-01': [
        {
          package: 'mock1Package',
          version: '1.1.1',
          determinedIncrementLevel: 'minor',
          messages: [
            messageFactory(1, 1),
            messageFactory(2, 1),
            relatedMessageFactory(1, 1),
            relatedMessageFactory(2, 1),
          ],
        },
        {
          package: 'mock2Package',
          version: '1.1.2',
          determinedIncrementLevel: 'minor',
          messages: [
            messageFactory(1, 2),
            messageFactory(2, 2),
            relatedMessageFactory(1, 2),
            relatedMessageFactory(2, 2),
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
    const expectedErrorMessage = `No messages found for "white(mock2Package)"`;

    expect(() => prepareChangelogs(invalidMockEnv)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('throws an error when releasable packages are empty', () => {
    const expectedErrorMessage = 'No packages to be released found!';
    expect(() => prepareChangelogs(invalidMockEnv)).toThrow(
      expectedErrorMessage
    );

    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('returns the right Env config with prepared changelogs', () => {
    expect(result).toEqual(expectedEnv);
  });
});
