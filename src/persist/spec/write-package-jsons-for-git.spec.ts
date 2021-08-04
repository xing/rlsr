/* eslint-env node, jest */
import { writeFileSync } from 'fs';

import type {
  Env,
  Module,
  PackageAfterCreatePackageJsonContent,
} from '../../types';

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
    '1.0.0': [
      {
        hash: `mockHash ${id}`,
        date: `mockDate ${id}`,
        message: `mockMessage ${id} }`,
        body: `mockBody ${id}`,
        text: `text ${id}`,
        level: 'patch',
      },
    ],
  },
  relatedMessages: [],
  determinedIncrementLevel: 0,
  dependingOnThis: [],
  dependsOn: [],
  incrementedVersion: '1.0.1',
});
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

  describe('when run with packages', () => {
    let result: Env;
    const registeredPackages: [
      number,
      string,
      PackageAfterCreatePackageJsonContent
    ][] = Object.entries(mockEnvMixedPackages.packages).map((entry, index) => [
      index,
      ...entry,
    ]);

    beforeAll(() => {
      result = writePackageJsonsForGit(mockEnvMixedPackages) as Env;
    });

    it.each(registeredPackages)(
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
