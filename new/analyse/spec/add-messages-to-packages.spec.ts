/* eslint-env node, jest */
import type { Env, Module, Package , Message} from '../../types';
import { clone } from 'ramda';

import { envWithConfig } from '../../fixtures/env';

// mock logger
const mockLog = jest.fn();
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog, error: mockError }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

// mock Env object
const envWithoutCommitMessages: Env = { ...envWithConfig };
const envWithoutPackages: Env = { ...envWithConfig, commitMessages: [] };

// mock Packages
const mockPackageBuilder = (
  id: number,
): Package => ({
  path: `mock/path/to/package_${id}/`,
  packageJson: { name: `mock${id}Package` },
  messages: [],
  relatedMessages: [],
  determinedIncrementLevel: -1,
  dependingOnThis: [],
  dependsOn: [],
});

const messageFactory = (id: number): Message => ({
  hash: `mockHash ${id}`,
  date: `mockDate ${id}`,
  message: `mockMessage ${id}`,
  body: `mockBody ${id}`,
  text: `text ${id}`,
  level: 'patch',
  committedFiles: [
    `mock/path/to/package_${id}/file_1.js`,
    `mock/path/to/package_${id}/file_2.js`,
    `mock/path/to/package_${id}/file_3.js`,
  ],
  affectedPackages: [`mock${id}Package`]
});

const mockEnvPackages: Env['packages'] = {
  mock1Package: mockPackageBuilder(1),
  mock2Package: mockPackageBuilder(2),
  mock3Package: mockPackageBuilder(3),
};
const mockCommitMessages: Env['commitMessages'] = [messageFactory(1), messageFactory(2)];

const mockEnv: Env = {
  ...envWithConfig,
  packages: mockEnvPackages,
  commitMessages: mockCommitMessages,
};

describe('addMessagesToPackages module', () => {
  let addMessagesToPackages: Module;

  beforeAll(() => {
    addMessagesToPackages =
      require('../add-messages-to-packages').addMessagesToPackages;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws an error when "commitMessages" is missing on Env config object', () => {
    const expectedErrorMessage = 'missing "commitMessages" on env object';
    expect(() => addMessagesToPackages(envWithoutCommitMessages)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('throws an error when "packages" is missing on Env config object', () => {
    const expectedErrorMessage = 'missing "packages" on env object';
    expect(() => addMessagesToPackages(envWithoutPackages)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('throws an error when an invalid "affectedPackage" is registered', () => {
    const mockInvalidAffectedPackageEnv = clone(mockEnv);
    mockInvalidAffectedPackageEnv.commitMessages![1].affectedPackages!.push('lodash');

    const expectedErrorMessage = '"lodash" is not a valid (registered) package';
    expect(() => addMessagesToPackages(mockInvalidAffectedPackageEnv)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage, mockInvalidAffectedPackageEnv.commitMessages![1]);
  });

  describe('on run', () => {
    let result: Env;
    const expectedEnv = clone(mockEnv);

    beforeAll(() => {
      expectedEnv.packages!.mock1Package.messages.push(mockCommitMessages[0]);
      expectedEnv.packages!.mock2Package.messages.push(mockCommitMessages[1]);

      result = addMessagesToPackages(mockEnv) as Env;
    });

    it('returns the right Env config object', () => {
      expect(result).toEqual(expectedEnv);
    });

    it('registers "commitMessages" to its affected packages', () => {
      expect(result.packages!.mock1Package.messages).toContain(result.commitMessages![0]);
      expect(result.packages!.mock2Package.messages).toContain(result.commitMessages![1]);
    });

    it('no "commitMessages" is registered to unaffected packages', () => {
      expect(result.packages!.mock3Package.messages).toHaveLength(0);
    });
  });
});
