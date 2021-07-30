/* eslint-env node, jest */
import { writeFileSync } from 'fs';

import type {
  Env,
  Module,
  PackageAfterCreatePackageJsonContent,
} from '../../types';

import { getReleasablePackages } from '../../helpers/get-releasable-packages';
import { envWithConfig } from '../../fixtures/env';

// mock fs
jest.mock('fs');
const mockWriteFileSync = writeFileSync as jest.MockedFunction<
  typeof writeFileSync
>;

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

// mock getReleasablePackages
jest.mock('../../helpers/get-releasable-packages');
const mockGetReleasablePackages = getReleasablePackages as jest.MockedFunction<
  typeof getReleasablePackages
>;

// mock packages
const mockPackageBuilder = (
  id: number,
  privatePackage = false
): PackageAfterCreatePackageJsonContent => ({
  currentVersion: '1.0.0',
  path: `mock/path/to/mockPackage${id}`,
  packageJson: { name: `mockPackage${id}`, private: privatePackage },
  packageJsonNpm: { name: `mockPackage${id}`, private: privatePackage },
  packageJsonGit: { name: `mockPackage${id}`, private: privatePackage },
  messages: [],
  changelogs: {
    '1.0.0': [{ message: 'my mocked changelog message', hash: 'mocked hash' }],
  },
  relatedMessages: [],
  determinedIncrementLevel: 0,
  dependingOnThis: [],
  dependsOn: [],
  incrementedVersion: '1.0.1',
});
const mockEnvPrivatePackages = {
  ...envWithConfig,
  packages: {
    mockPackage1: mockPackageBuilder(1, true),
    mockPackage2: mockPackageBuilder(2, true),
    mockPackage3: mockPackageBuilder(3, true),
  },
};
const mockEnvMixedPackages = {
  ...envWithConfig,
  packages: {
    mockPackage1: mockPackageBuilder(1),
    mockPackage2: mockPackageBuilder(2, true),
    mockPackage3: mockPackageBuilder(3),
  },
};

describe('writePackageJsonsForGit Module', () => {
  let writePackageJsonsForGit: Module;
  beforeAll(() => {
    writePackageJsonsForGit =
      require('../write-package-jsons-for-git').writePackageJsonsForGit;
  });

  it("Throws an exception if 'env.packages' is empty", () => {
    const expectedErrorMessage = 'missing "packages" on env object.';
    expect(() => writePackageJsonsForGit(envWithConfig)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('returns an unchanged env object if no releasablePackage is detected', async () => {
    mockGetReleasablePackages.mockImplementation(() => []);
    expect(writePackageJsonsForGit(mockEnvMixedPackages)).toEqual(
      mockEnvMixedPackages
    );
    expect(mockWriteFileSync).not.toHaveBeenCalled();
  });

  it('returns an unchanged env object if all releasablePackages are private', async () => {
    mockGetReleasablePackages.mockImplementation(() => []);
    expect(writePackageJsonsForGit(mockEnvPrivatePackages)).toEqual(
      mockEnvPrivatePackages
    );
    expect(mockWriteFileSync).not.toHaveBeenCalled();
  });

  describe('when run with public & releasable packages', () => {
    let result: Env;
    const publicPackages: [
      number,
      string,
      PackageAfterCreatePackageJsonContent
    ][] = Object.entries(mockEnvMixedPackages.packages)
      .filter(([_name, pkg]) => !pkg.packageJson.private)
      .map((entry, index) => [index, ...entry]);

    beforeAll(() => {
      mockGetReleasablePackages.mockImplementation(() =>
        publicPackages.map(([_index, name]) => name)
      );
      result = writePackageJsonsForGit(mockEnvMixedPackages) as Env;
    });

    it.each(publicPackages)(
      '%i writes package.json file for %s',
      (index, _packageName, currentPackage) => {
        expect(mockWriteFileSync).toHaveBeenNthCalledWith(
          index + 1,
          `${currentPackage.path}/package.json`,
          `${JSON.stringify(currentPackage.packageJsonGit, null, 2)}\n`
        );
      }
    );

    it('returns an unchanged env object', () => {
      expect(result).toEqual(mockEnvMixedPackages);
    });
  });
});
