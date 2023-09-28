/* eslint-env node, jest */
import type {
  Env,
  Module,
  Package,
  PackageAfterPrepareChangelogs,
} from '../../../types';
import { envWithConfig } from '../../../fixtures/env';

import { getPackageJson } from '../get-package-json';

// mock getPackageJson
jest.mock('../get-package-json');
const mockGetPackageJson = getPackageJson as jest.MockedFunction<
  typeof getPackageJson
>;

// mock logger
const mockLog = jest.fn();
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({
  log: mockLog,
  error: mockError,
}));
jest.doMock('../../../helpers/logger', () => ({ logger: mockLogger }));

// mock Packages
const mockPackageBuilder = (
  id: number,
  privatePackage = false
): Package | PackageAfterPrepareChangelogs => ({
  currentVersion: '1.0.0',
  path: `mock/path/to/package_${id}/`,
  packageJson: { name: `mock${id}Package`, private: privatePackage },
  messages: [],
  relatedMessages: [],
  dependingOnThis: [],
  dependsOn: [],
  ...(privatePackage
    ? {
        determinedIncrementLevel: -1,
      }
    : {
        incrementedVersion: `1.1.${id}`,
        determinedIncrementLevel: 1,
      }),
});

// mockEnv
const mockEnvWithPackages: Env = {
  ...envWithConfig,
  packages: {
    mockPackage1: mockPackageBuilder(1, true),
    mockPackage2: mockPackageBuilder(2),
    mockPackage3: mockPackageBuilder(3),
  },
};

describe('createPackageJsonContent Module', () => {
  let createPackageJsonContent: Module;
  beforeAll(() => {
    createPackageJsonContent =
      require('../create-package-json-content').createPackageJsonContent;
  });

  it('throws an error when "packages" is missing on Env config object', () => {
    const expectedErrorMessage = 'missing "packages" on env object';
    expect(() => createPackageJsonContent(envWithConfig)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });
  describe('on run with registered packages', () => {
    let result: Env;
    beforeAll(() => {
      mockGetPackageJson.mockImplementation((_packages, packageName, type) => ({
        name: packageName,
        version: type === 'git' ? '*' : '1.2.3',
      }));
      result = createPackageJsonContent(mockEnvWithPackages) as Env;
    });

    it('returns processed Env object', () => {
      const cloneEnv = structuredClone(mockEnvWithPackages);
      cloneEnv.packages!.mockPackage1 = {
        ...cloneEnv.packages!.mockPackage1,
        packageJsonGit: { name: 'mockPackage1', version: '*' },
        packageJsonNpm: { name: 'mockPackage1', version: '1.2.3' },
      };
      cloneEnv.packages!.mockPackage2 = {
        ...cloneEnv.packages!.mockPackage2,
        packageJsonGit: { name: 'mockPackage2', version: '*' },
        packageJsonNpm: { name: 'mockPackage2', version: '1.2.3' },
      };
      cloneEnv.packages!.mockPackage3 = {
        ...cloneEnv.packages!.mockPackage3,
        packageJsonGit: { name: 'mockPackage3', version: '*' },
        packageJsonNpm: { name: 'mockPackage3', version: '1.2.3' },
      };
      expect(result).toEqual(cloneEnv);
    });
    const registeredPackages: [
      number,
      string,
      Package | PackageAfterPrepareChangelogs
    ][] = Object.entries(mockEnvWithPackages.packages!).map((entry, index) => [
      index,
      ...entry,
    ]);
    it.each(registeredPackages)(
      '%i fills packageJsons fields for %s',
      (_index, packageName, currentPackage) => {
        expect(result.packages![packageName]).toEqual(
          expect.objectContaining({
            packageJsonGit: {
              name: packageName,
              private: currentPackage.packageJson.version,
              version: '*',
            },
            packageJsonNpm: {
              name: packageName,
              private: currentPackage.packageJson.version,
              version: '1.2.3',
            },
          })
        );
      }
    );
  });
});
