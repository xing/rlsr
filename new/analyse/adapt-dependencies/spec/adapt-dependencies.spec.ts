/* eslint-env node, jest */
import type {
  Env,
  Module,
  Package,
  PackageAfterDetermineVersion,
} from '../../../types';
import { envWithConfig } from '../../../fixtures/env';
import { getReleasablePackages } from '../get-releasable-packages';
import semver from 'semver';
import { clone } from 'ramda';

// mock semver
jest.mock('semver');
const mockSatisfies = semver.satisfies as jest.MockedFunction<
  typeof semver.satisfies
>;
const mockMinVersion = semver.minVersion as jest.MockedFunction<
  typeof semver.minVersion
>;
const mockInc = semver.inc as jest.MockedFunction<typeof semver.inc>;

// mock logger
const mockError = jest.fn();
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({
  error: mockError,
  log: mockLog,
}));
jest.doMock('../../../helpers/logger', () => ({ logger: mockLogger }));

// mock get-releasable-packages
jest.mock('../get-releasable-packages');
const mockGetReleasablePackages = getReleasablePackages as jest.MockedFunction<
  typeof getReleasablePackages
>;

// mock Packages
function mockPackageBuilder(name: string): Package;
function mockPackageBuilder(
  name: string,
  incrementedVersion: string
): PackageAfterDetermineVersion;
function mockPackageBuilder(
  name: string,
  incrementedVersion?: string
): Package | PackageAfterDetermineVersion {
  return {
    currentVersion: '1.0.0',
    path: 'mock/path/to/package',
    packageJson: { name },
    messages: [],
    relatedMessages: [],
    determinedIncrementLevel: incrementedVersion ? 0 : -1,
    dependingOnThis: [],
    dependsOn: [],
    ...(incrementedVersion ? { incrementedVersion } : {}),
  };
}

const mockReleasablePackages = ['mockPackage2', 'mockPackage4'];

mockGetReleasablePackages.mockImplementation(() => mockReleasablePackages);

describe('adaptDependencies Module', () => {
  let adaptDependencies: Module;
  beforeAll(() => {
    adaptDependencies = require('../adapt-dependencies').adaptDependencies;
  });

  it("Throws an exception if 'env.packages' is empty", () => {
    const expectedErrorMessage = 'missing "packages" on env object.';
    expect(() => adaptDependencies(envWithConfig)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('returns untouched packages when no one is flagged as releasable', () => {
    const mockEnv: Env = {
      ...envWithConfig,
      packages: {
        mockPackage1: mockPackageBuilder('mockPackage1'),
        mockPackage2: mockPackageBuilder('mockPackage2'),
        mockPackage3: mockPackageBuilder('mockPackage3'),
        mockPackage4: mockPackageBuilder('mockPackage4'),
      },
    };
    mockGetReleasablePackages.mockImplementationOnce(() => []);

    const result = adaptDependencies(mockEnv);

    expect(mockGetReleasablePackages).toHaveBeenCalledTimes(1);
    expect(mockGetReleasablePackages).toHaveBeenCalledWith(mockEnv.packages);
    expect(result).toEqual(mockEnv);
  });

  describe(`when all "dependingOnThis" dependencies' ranges are satisfied`, () => {
    let mockEnv: Env;
    let result: Env;
    beforeAll(() => {
      jest.clearAllMocks();
      const mockPackage1 = mockPackageBuilder('mockPackage1');
      const mockPackage2 = mockPackageBuilder('mockPackage2', '1.0.0');
      const mockPackage3 = mockPackageBuilder('mockPackage3');
      const mockPackage4 = mockPackageBuilder('mockPackage4', '1.2.3');
      mockEnv = {
        ...envWithConfig,
        packages: {
          mockPackage1,
          mockPackage2,
          mockPackage3,
          mockPackage4,
        },
      };
      mockPackage2.dependingOnThis.push({
        name: 'mockPackage4',
        type: 'default',
        ownPackageRange: '>=1.0.0 <1.2.0',
      });
      mockPackage4.dependsOn.push({
        name: 'mockPackage2',
        type: 'default',
        range: '>=1.0.0 <1.2.0',
      });

      mockGetReleasablePackages.mockImplementationOnce(
        () => mockReleasablePackages
      );

      mockSatisfies.mockImplementation(() => true);

      result = adaptDependencies(mockEnv) as Env;
    });

    it('fetches releasable Packages', () => {
      expect(mockGetReleasablePackages).toHaveBeenCalledTimes(1);
      expect(mockGetReleasablePackages).toHaveBeenCalledWith(mockEnv.packages);
    });

    it('evaluates dependency ranges being satisfied', () => {
      expect(mockSatisfies).toHaveBeenCalledTimes(1);
      expect(mockSatisfies).toHaveBeenCalledWith('1.0.0', '>=1.0.0 <1.2.0');
    });

    it('returns Env config object unchanged', () => {
      expect(result).toEqual(mockEnv);
    });
  });

  describe(`when "dependingOnThis" dependencies' ranges are not satisfied`, () => {
    describe('on successful run', () => {
      let mockEnv: Env;
      let result: Env;
      afterAll(() => {
        jest.useRealTimers();
      });
      beforeAll(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        const mockPackage1 = mockPackageBuilder('mockPackage1');
        const mockPackage2 = mockPackageBuilder('mockPackage2', '1.2.0');
        const mockPackage3 = mockPackageBuilder('mockPackage3');
        const mockPackage4 = mockPackageBuilder('mockPackage4', '1.2.3');
        mockPackage2.packageJson = { version: '1.1.0' };
        mockPackage2.dependingOnThis.push({
          name: 'mockPackage4',
          type: 'default',
          ownPackageRange: '>=1.0.0 <1.2.0',
        });
        mockPackage4.dependsOn.push({
          name: 'mockPackage2',
          type: 'default',
          range: '>=1.0.0 <1.2.0',
        });

        mockEnv = {
          ...envWithConfig,
          packages: {
            mockPackage1,
            mockPackage2,
            mockPackage3,
            mockPackage4,
          },
        };

        mockGetReleasablePackages.mockImplementationOnce(
          () => mockReleasablePackages
        );

        mockSatisfies.mockImplementation(() => false);
        mockMinVersion.mockImplementation(
          () => ({ raw: '1.0.0' } as semver.SemVer)
        );
        mockInc.mockImplementation(() => '1.3.0');

        result = adaptDependencies(mockEnv) as Env;
      });

      it('fetches releasable Packages', () => {
        expect(mockGetReleasablePackages).toHaveBeenCalledTimes(1);
        expect(mockGetReleasablePackages).toHaveBeenCalledWith(
          mockEnv.packages
        );
      });

      it('evaluates dependency ranges being satisfied', () => {
        expect(mockSatisfies).toHaveBeenCalledTimes(1);
        expect(mockSatisfies).toHaveBeenCalledWith('1.2.0', '>=1.0.0 <1.2.0');
      });

      it('adds a relatedMessage entry', () => {
        expect(result.packages!.mockPackage4.relatedMessages[0]).toEqual({
          date: new Date().toISOString(),
          text: `fix: dependency "mockPackage2" has changed from 1.1.0 to 1.2.0`,
          level: 'patch',
        });
      });

      it('evaluates minVersion', () => {
        expect(mockMinVersion).toHaveBeenCalledTimes(1);
        expect(mockMinVersion).toHaveBeenCalledWith('>=1.0.0 <1.2.0');
      });

      it('evaluates upperVersionLimit', () => {
        expect(mockInc).toHaveBeenCalledTimes(1);
        expect(mockInc).toHaveBeenCalledWith('1.2.0', 'minor');
      });

      it('"dependingOnThis" dependency ranges are updated', () => {
        expect(
          result.packages!.mockPackage2.dependingOnThis[0].ownPackageRange
        ).toEqual('>=1.0.0 <1.3.0');
      });

      it('"dependsOn" dependency ranges are updated', () => {
        expect(result.packages!.mockPackage4.dependsOn[0].range).toEqual(
          '>=1.0.0 <1.3.0'
        );
      });

      it('returns an Env config object reflecting new ranges', () => {
        const expectedEnv = clone(mockEnv);
        expectedEnv.packages!.mockPackage2.dependingOnThis[0].ownPackageRange =
          expectedEnv.packages!.mockPackage4.dependsOn[0].range =
            '>=1.0.0 <1.3.0';
        expectedEnv.packages!.mockPackage4.relatedMessages.push({
          date: new Date().toISOString(),
          text: `fix: dependency "mockPackage2" has changed from 1.1.0 to 1.2.0`,
          level: 'patch',
        });
        expect(result).toEqual(expectedEnv);
      });
    });

    // @TODO: Fill these cases
    it.todo(
      'throws exception if no package can be found on "dependsOn" collection'
    );
    it.todo('throws exception if lower version limit cannot be determined');
    it.todo('throws exception if upper version limit cannot be determined');
  });
});
