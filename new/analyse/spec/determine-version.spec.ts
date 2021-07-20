/* eslint-env node, jest */
import { inc, parse } from 'semver';

import type {
  Env,
  Module,
  Package,
  PackageAfterDetermineVersion,
} from '../../types';
import { envWithConfig } from '../../fixtures/env';
import { clone } from 'ramda';

// mock logger
const mockError = jest.fn();
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({
  error: mockError,
  log: mockLog,
}));
jest.doMock('../../helpers/logger', () => ({
  logger: mockLogger,
}));

// mock semver
jest.mock('semver');
const mockInc = inc as jest.MockedFunction<typeof inc>;
// @ts-ignore
mockInc.mockImplementation((version, release) => {
  switch (release) {
    case 'major':
      return '2.0.0';
    case 'minor':
      return '1.1.0';
    case 'patch':
      return '1.0.1';
  }
});
const mockParse = parse as jest.MockedFunction<typeof parse>;
// @ts-ignore
mockParse.mockImplementation((version) => version);

// mock EnvObject
const mockPackageBuilder = (
  id: Package['determinedIncrementLevel']
): Package => ({
  path: `mock/path/to/package_${id}/`,
  packageJson: { name: `mock${id}Package`, version: '1.0.0' },
  messages: [],
  relatedMessages: [],
  determinedIncrementLevel: id,
  dependingOnThis: [],
  dependsOn: [],
});

const mockEnv: Env = {
  ...envWithConfig,
  packages: {
    'mock-1Package': mockPackageBuilder(-1), // misc
    mock0Package: mockPackageBuilder(0), // patch
    mock1Package: mockPackageBuilder(1), // minor
    mock2Package: mockPackageBuilder(2), // major
  },
};

describe('determineVersion Module', () => {
  let determineVersion: Module;
  beforeAll(() => {
    determineVersion = require('../determine-version').determineVersion;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error when "packages" is missing on Env config object', () => {
    const expectedErrorMessage = 'missing "packages" on env object.';
    expect(() => determineVersion(envWithConfig)).toThrow(expectedErrorMessage);
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('throws an error when a package has an invalid version', () => {
    const expectedErrorMessage =
      'Invalid version "latest" for package "mock0Package"';
    mockParse.mockImplementationOnce(() => null);
    const mockWrongVersionEnv: Env = clone(mockEnv);
    mockWrongVersionEnv.packages!.mock0Package.packageJson.version = 'latest';

    expect(() => determineVersion(mockWrongVersionEnv)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('throws an error when a package version cannot be incremented', () => {
    mockInc.mockImplementationOnce(() => null);
    const expectedErrorMessage =
      'version "1.0.0" cannot be increased to "patch" for package "mock0Package"';
    const mockWrongVersionEnv: Env = clone(mockEnv);

    expect(() => determineVersion(mockWrongVersionEnv)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  describe('on run', () => {
    let result: Env;
    const expectedEnv: Env = clone(mockEnv);
    (
      expectedEnv.packages!.mock0Package as PackageAfterDetermineVersion
    ).incrementedVersion = '1.0.1';
    (
      expectedEnv.packages!.mock1Package as PackageAfterDetermineVersion
    ).incrementedVersion = '1.1.0';
    (
      expectedEnv.packages!.mock2Package as PackageAfterDetermineVersion
    ).incrementedVersion = '2.0.0';

    beforeAll(() => {
      result = determineVersion(mockEnv) as Env;
    });

    it('returns the right Env config object', () => {
      expect(result).toEqual(expectedEnv);
    });

    // more specific checks!
    it('sets a major version when "determinedIncrementLevel" is 2', () => {
      expect(
        (result.packages!.mock2Package as PackageAfterDetermineVersion)
          .incrementedVersion
      ).toEqual('2.0.0');
    });
    it('sets a minor version when "determinedIncrementLevel" is 1', () => {
      expect(
        (result.packages!.mock1Package as PackageAfterDetermineVersion)
          .incrementedVersion
      ).toEqual('1.1.0');
    });
    it('sets a patch version when "determinedIncrementLevel" is 0', () => {
      expect(
        (result.packages!.mock0Package as PackageAfterDetermineVersion)
          .incrementedVersion
      ).toEqual('1.0.1');
    });
  });
});
