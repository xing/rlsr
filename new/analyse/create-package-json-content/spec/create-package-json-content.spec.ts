/* eslint-env node, jest */
import type {
  Env,
  Module,
  Package,
  PackageAfterPrepareChangelogs,
} from '../../../types';
import { envWithConfig } from '../../../fixtures/env';
import { clone } from 'ramda';

import { getReleasablePackages } from '../../adapt-dependencies/get-releasable-packages';
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

// mock getReleasablePackages
jest.mock('../../adapt-dependencies/get-releasable-packages');
const mockGetReleasablePackages = getReleasablePackages as jest.MockedFunction<
  typeof getReleasablePackages
>;
mockGetReleasablePackages.mockImplementation(() => []);

// mock Packages
const mockPackageBuilder = (
  id: number
): Package | PackageAfterPrepareChangelogs => ({
  currentVersion: '1.0.0',
  path: `mock/path/to/package_${id}/`,
  packageJson: { name: `mock${id}Package` },
  messages: [],
  relatedMessages: [],
  determinedIncrementLevel: 1,
  dependingOnThis: [],
  dependsOn: [],
  incrementedVersion: `1.1.${id}`,
});

// mockEnv
const mockEnvWithPackages: Env = {
  ...envWithConfig,
  packages: {
    mockPackage1: mockPackageBuilder(1),
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

  describe('on run with no releasabe packages', () => {
    let result: Env;
    let expectedEnv: Env = clone(mockEnvWithPackages);
    beforeAll(() => {
      mockGetReleasablePackages.mockImplementationOnce(() => []);

      result = createPackageJsonContent(mockEnvWithPackages) as Env;
    });

    it('returns Env object untouched', () => {
      expect(result).toEqual(expectedEnv);
    });
    it('leaves unreleasable packages untouched', () => {
      ['mockPackage1', 'mockPackage2', 'mockPackage3'].forEach((packageName) =>
        ['packageJsonGit', 'packageJsonNpm'].forEach((property) =>
          expect(result.packages![packageName]).not.toHaveProperty(property)
        )
      );
    });
  });
  describe('on run with releasabe packages', () => {
    let result: Env;
    beforeAll(() => {
      mockGetReleasablePackages.mockImplementationOnce(() => [
        'mockPackage2',
        'mockPackage3',
      ]);

      mockGetPackageJson.mockImplementation((_packages, packageName, type) => ({
        name: packageName,
        version: type === 'git' ? '*' : '1.2.3',
      }));
      result = createPackageJsonContent(mockEnvWithPackages) as Env;
    });

    it('returns processed Env object', () => {
      const cloneEnv = clone(mockEnvWithPackages);
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

    it('fills packageJsons fields for releasable packages', () => {
      expect(result.packages!.mockPackage2).toEqual(
        expect.objectContaining({
          packageJsonGit: { name: 'mockPackage2', version: '*' },
          packageJsonNpm: { name: 'mockPackage2', version: '1.2.3' },
        })
      );
      expect(result.packages!.mockPackage3).toEqual(
        expect.objectContaining({
          packageJsonGit: { name: 'mockPackage3', version: '*' },
          packageJsonNpm: { name: 'mockPackage3', version: '1.2.3' },
        })
      );
    });

    it('leaves unreleasable packages untouched', () => {
      ['packageJsonGit', 'packageJsonNpm'].forEach((property) =>
        expect(result.packages!.mockPackage1).not.toHaveProperty(property)
      );
    });
  });
});
