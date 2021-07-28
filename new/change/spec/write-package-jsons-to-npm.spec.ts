/* eslint-env node, jest */
import { writeFileSync } from 'fs';
import type {
  Env,
  Module,
  Package,
  PackageAfterCreatePackageJsonContent,
} from '../../types';

import { envWithConfig } from '../../fixtures/env';
// mock logger
const mockError = jest.fn();
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({ error: mockError, log: mockLog }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

// mock fs
jest.mock('fs');
const mockWriteFileSync = writeFileSync as jest.MockedFunction<
  typeof writeFileSync
>;

// mock Packages
function mockPackageBuilder(id: number): Package;
function mockPackageBuilder(
  id: number,
  afterChangelogs: boolean
): PackageAfterCreatePackageJsonContent;
function mockPackageBuilder(
  id: number,
  afterChangelogs?: boolean
): Package | PackageAfterCreatePackageJsonContent {
  return {
    currentVersion: '1.0.0',
    path: `mock/path/to/package_${id}/`,
    packageJson: { name: `mock${id}Package` },
    messages: [],
    relatedMessages: [],
    determinedIncrementLevel: 1,
    dependingOnThis: [],
    dependsOn: [],
    incrementedVersion: `1.1.${id}`,
    ...(afterChangelogs
      ? {
          packageJsonNpm: { name: `mock${id}Package` },
        }
      : {}),
  };
}

describe('writePackageJsonsToNpm Module', () => {
  let writePackageJsonsToNpm: Module;
  beforeAll(() => {
    writePackageJsonsToNpm =
      require('../write-package-jsons-to-npm').writePackageJsonsToNpm;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an exception when "env.packages" is not defined', () => {
    const expectedError = 'missing "packages" on env object.';
    expect(() => writePackageJsonsToNpm(envWithConfig)).toThrow(expectedError);
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedError);
  });

  it('throws an exception when packageJsonNpm is not present on a package', () => {
    const mockEnv: Env = {
      ...envWithConfig,
      packages: {
        mockPackage1: mockPackageBuilder(1),
      },
    };
    const expectedError = 'missing "packageJsonNpm" on package mockPackage1.';
    expect(() => writePackageJsonsToNpm(mockEnv)).toThrow(expectedError);
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedError);
  });

  describe('on run', () => {
    const mockEnv: Env = {
      ...envWithConfig,
      packages: {
        mockPackage1: mockPackageBuilder(1, true),
        mockPackage2: mockPackageBuilder(2, true),
        mockPackage3: mockPackageBuilder(3, true),
      },
    };
    let result: Env;
    beforeAll(() => {
      result = writePackageJsonsToNpm(mockEnv) as Env;
    });
    it('writes files', () => {
      expect(mockWriteFileSync).toHaveBeenCalledTimes(
        Object.keys(mockEnv.packages!).length
      );
      Object.keys(mockEnv.packages!).forEach((packageName, index) => {
        const currentPackage = mockEnv.packages![
          packageName
        ] as PackageAfterCreatePackageJsonContent;
        expect(mockWriteFileSync).toHaveBeenNthCalledWith(
          index + 1,
          `${currentPackage.path}/package.json`,
          `${JSON.stringify(currentPackage.packageJsonNpm, null, 2)}\n`
        );
      });
    });

    it('returns the env file untouched', () => {
      expect(result).toEqual(mockEnv);
    });
  });
});
