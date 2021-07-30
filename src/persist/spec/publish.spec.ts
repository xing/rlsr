/* eslint-env node, jest */
import type {
  Env,
  Module,
  PackageAfterCreatePackageJsonContent,
} from '../../types';

import { envWithConfig } from '../../fixtures/env';
import { getReleasablePackages } from '../../helpers/get-releasable-packages';
import { command } from '../../helpers/command';

// mock logger
const mockError = jest.fn();
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({ error: mockError, log: mockLog }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

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

jest.mock('../../helpers/get-releasable-packages');
const mockGetReleasablePackages = getReleasablePackages as jest.MockedFunction<
  typeof getReleasablePackages
>;
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

// mock command
jest.mock('../../helpers/command');
const mockCommandPrediate = jest.fn();
const mockCommand = command as jest.MockedFunction<typeof command>;
mockCommand.mockImplementation(() => mockCommandPrediate);

describe('publish Module', () => {
  let publish: Module;

  beforeAll(() => {
    publish = require('../publish').publish;
  });

  it("Throws an exception if 'env.packages' is empty", () => {
    const expectedErrorMessage = 'missing "packages" on env object.';
    expect(publish(envWithConfig)).rejects.toThrow(expectedErrorMessage);
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('returns an unchanged env object if no releasablePackage is detected', async () => {
    mockGetReleasablePackages.mockImplementation(() => []);
    await expect(publish(mockEnvMixedPackages)).resolves.toEqual(
      mockEnvMixedPackages
    );
    expect(mockCommand).not.toHaveBeenCalled();
  });

  it('returns an unchanged env object if all releasable packages are private', async () => {
    mockGetReleasablePackages.mockImplementation(() => []);
    await expect(publish(mockEnvPrivatePackages)).resolves.toEqual(
      mockEnvPrivatePackages
    );
    expect(mockCommand).not.toHaveBeenCalled();
  });

  describe('on run', () => {
    let result: Env;
    beforeAll(async () => {
      const mockReleasablePackages = [
        'mockPackage1',
        'mockPackage2',
        'mockPackage3',
      ];
      mockGetReleasablePackages.mockImplementation(
        () => mockReleasablePackages
      );

      result = await publish(mockEnvMixedPackages);
    });

    const publicPackages: [
      number,
      string,
      PackageAfterCreatePackageJsonContent
    ][] = Object.entries(mockEnvMixedPackages.packages)
      .filter(([_name, pkg]) => !pkg.packageJson.private)
      .map((entry, index) => [index, ...entry]);

    describe.each(publicPackages)(
      '%i when publishing %s',
      (index, packageName, pkg) => {
        let commandString: string;
        beforeAll(() => {
          mockLog.mockClear();
          commandString = mockCommand.mock.calls[index][1](
            mockEnvMixedPackages
          ) as string;
        });
        it('command gets called with the right methods', () => {
          expect(mockCommand).toHaveBeenNthCalledWith(
            index + 1,
            'publish to NPM',
            expect.any(Function),
            'silent',
            'err'
          );
        });

        it(`returns the publishing command for ${packageName}`, () => {
          expect(commandString).toEqual(`npm publish ${pkg.path}`);
        });

        it(`logs ${packageName} is getting released`, () => {
          expect(mockLog).toHaveBeenCalledWith(
            `publishing ${packageName}@${pkg.incrementedVersion}`
          );
        });
      }
    );

    const privatePackages: [
      number,
      string,
      PackageAfterCreatePackageJsonContent
    ][] = Object.entries(mockEnvMixedPackages.packages)
      .filter(([_name, pkg]) => pkg.packageJson.private)
      .map((entry, index) => [index, ...entry]);

    it('does not publish private packages', () => {
      expect(mockCommand).toHaveBeenCalledTimes(
        Object.keys(mockEnvMixedPackages.packages).length -
          privatePackages.length
      );
    });

    it('returns an unchanged env object', () => {
      expect(result).toEqual(mockEnvMixedPackages);
    });
  });
});
