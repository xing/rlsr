/* eslint-env node, jest */
import semver from 'semver';

import { clone } from 'ramda';

import type {
  Env,
  Module,
  Package,
  PackageAfterDetermineVersion,
} from '../../types';
import { envWithConfig } from '../../fixtures/env';
import { getReleasablePackages } from '../../helpers/get-releasable-packages';

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
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

// mock get-releasable-packages
jest.mock('../../helpers/get-releasable-packages');
const mockGetReleasablePackages = getReleasablePackages as jest.MockedFunction<
  typeof getReleasablePackages
>;

// mock Packages
function mockPackageBuilder(name: string, currentVersion: string): Package;
function mockPackageBuilder(
  name: string,
  currentVersion: string,
  incrementedVersion: string
): PackageAfterDetermineVersion;
function mockPackageBuilder(
  name: string,
  currentVersion: string,
  incrementedVersion?: string
): Package | PackageAfterDetermineVersion {
  return {
    currentVersion,
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
        mockPackage1: mockPackageBuilder('mockPackage1', '1.0.0'),
        mockPackage2: mockPackageBuilder('mockPackage2', '1.0.0'),
        mockPackage3: mockPackageBuilder('mockPackage3', '1.0.0'),
        mockPackage4: mockPackageBuilder('mockPackage4', '1.0.0'),
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
      const mockReleasablePackages = ['mockPackage2', 'mockPackage4'];

      mockGetReleasablePackages.mockImplementation(
        () => mockReleasablePackages
      );

      const mockPackage1 = mockPackageBuilder('mockPackage1', '1.0.0');
      const mockPackage2 = mockPackageBuilder('mockPackage2', '1.0.0', '1.0.0');
      const mockPackage3 = mockPackageBuilder('mockPackage3', '1.0.0');
      const mockPackage4 = mockPackageBuilder('mockPackage4', '1.0.0', '1.2.3');
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
        const mockReleasablePackages = [
          'mockPackage2',
          'mockPackage4',
          'mockPackage5',
          'mockPackage6',
        ];

        mockGetReleasablePackages.mockImplementation(
          () => mockReleasablePackages
        );

        const mockPackage1 = mockPackageBuilder('mockPackage1', '1.0.0');
        const mockPackage2 = mockPackageBuilder(
          'mockPackage2',
          '2.1.0',
          '2.2.0'
        );
        const mockPackage3 = mockPackageBuilder('mockPackage3', '3.0.0');
        const mockPackage4 = mockPackageBuilder(
          'mockPackage4',
          '4.2.2',
          '4.2.3'
        );
        const mockPackage5 = mockPackageBuilder(
          'mockPackage5',
          '0.0.1',
          '0.1.0'
        );
        const mockPackage6 = mockPackageBuilder(
          'mockPackage6',
          '0.0.1',
          '0.0.2'
        );
        mockPackage2.packageJson = { version: '2.1.0' };
        mockPackage4.dependsOn.push({
          name: 'mockPackage2',
          type: 'default',
          range: '>=2.1.0 <2.2.0',
        });
        mockPackage2.dependingOnThis.push({
          name: 'mockPackage4',
          type: 'default',
          ownPackageRange: '>=2.1.0 <2.2.0',
        });
        mockPackage5.dependsOn.push({
          name: 'mockPackage1',
          type: 'default',
          range: '~*',
        });
        mockPackage5.dependsOn.push({
          name: 'mockPackage3',
          type: 'peer',
          range: '^*',
        });
        mockPackage5.dependsOn.push({
          name: 'mockPackage6',
          type: 'default',
          range: '*',
        });
        mockPackage1.dependingOnThis.push({
          name: 'mockPackage5',
          type: 'default',
          ownPackageRange: '~*',
        });
        mockPackage3.dependingOnThis.push({
          name: 'mockPackage5',
          type: 'default',
          ownPackageRange: '^*',
        });
        mockPackage6.dependingOnThis.push({
          name: 'mockPackage5',
          type: 'default',
          ownPackageRange: '*',
        });

        mockEnv = {
          ...envWithConfig,
          packages: {
            mockPackage1,
            mockPackage2,
            mockPackage3,
            mockPackage4,
            mockPackage5,
            mockPackage6,
          },
        };

        mockGetReleasablePackages.mockImplementationOnce(
          () => mockReleasablePackages
        );

        mockSatisfies.mockImplementation((version, range) => {
          switch (`${version} ${range}`) {
            /* When a star version range gets processed and replaced
             * in the second loop (processing the dependsOn collections),
             * it might get caught again by the first loop (processing
             * dependingOnThis collections) and mockSatisfies needs to
             * return different results.
             */
            case `${'0.0.2'} ${'>=0.0.2 <0.1.0'}`: // this is mockPackage6 case
              return true;
            default:
              return false;
          }
        });
        mockMinVersion.mockImplementation((packageRange) => {
          const rangesToLowerLimits: Record<string, string> = {
            '>=2.1.0 <2.2.0': '2.1.0',
            '>=0.0.2 <0.1.0': '0.0.2',
          };
          return {
            raw: rangesToLowerLimits[packageRange as string],
          } as semver.SemVer;
        });
        mockInc.mockImplementation((packageRange) => {
          const rangesToUpperLimits: Record<string, string> = {
            '4.2.3': '4.3.0',
            '3.0.0': '3.1.0',
            '2.2.0': '2.3.0',
            '1.0.0': '1.1.0',
            '0.1.0': '0.2.0',
            '0.0.2': '0.1.0',
          };
          return rangesToUpperLimits[packageRange as string];
        });

        result = adaptDependencies(mockEnv) as Env;
      });

      it('fetches releasable Packages', () => {
        expect(mockGetReleasablePackages).toHaveBeenCalledTimes(1);
        expect(mockGetReleasablePackages).toHaveBeenCalledWith(
          mockEnv.packages
        );
      });

      it('evaluates dependency ranges being satisfied', () => {
        expect(mockSatisfies).toHaveBeenCalledTimes(2);
        expect(mockSatisfies).toHaveBeenNthCalledWith(
          1,
          '2.2.0',
          '>=2.1.0 <2.2.0'
        );
        expect(mockSatisfies).toHaveBeenNthCalledWith(
          2,
          '0.0.2',
          '>=0.0.2 <0.1.0'
        );
      });

      it('adds a relatedMessage entry', () => {
        expect(result.packages!.mockPackage4.relatedMessages[0]).toEqual({
          date: new Date().toISOString(),
          text: `fix: adapt dependency "mockPackage2" from >=2.1.0 <2.2.0 to >=2.1.0 <2.3.0`,
          level: 'patch',
        });
      });

      it.each`
        nthCall | versionRange        | scenario
        ${1}    | ${'>=2.1.0 <2.2.0'} | ${'mockPackage2 dependingOnThis: mockPackage4'}
      `('evaluates minVersion $scenario', ({ nthCall, versionRange }) => {
        expect(mockMinVersion).toHaveBeenNthCalledWith(nthCall, versionRange);
      });

      it.each`
        nthCall | version    | incrementType | scenario
        ${1}    | ${'2.2.0'} | ${'minor'}    | ${'mockPackage2 dependingOnThis: mockPackage4'}
        ${2}    | ${'1.0.0'} | ${'minor'}    | ${'mockPackage5 dependsOn: mockPackage1'}
        ${3}    | ${'3.0.0'} | ${'minor'}    | ${'mockPackage5 dependsOn: mockPackage3'}
        ${4}    | ${'0.0.2'} | ${'minor'}    | ${'mockPackage5 dependsOn: mockPackage6'}
      `(
        'evaluates upperVersionLimit: $scenario',
        ({ nthCall, version, incrementType }) => {
          expect(mockInc).toHaveBeenNthCalledWith(
            nthCall,
            version,
            incrementType
          );
        }
      );

      it.each`
        packageName       | nthDependingOnThis | versionRange        | scenario
        ${'mockPackage2'} | ${0}               | ${'>=2.1.0 <2.3.0'} | ${'mockPackage2 dependingOnThis: mockPackage4'}
        ${'mockPackage6'} | ${0}               | ${'>=0.0.2 <0.1.0'} | ${'mockPackage6 dependingOnThis: mockPackage5'}
      `(
        '"dependingOnThis" dependency ranges are updated $scenario',
        ({ packageName, nthDependingOnThis, versionRange }) => {
          expect(
            result.packages![packageName].dependingOnThis[nthDependingOnThis]
              .ownPackageRange
          ).toEqual(versionRange);
        }
      );

      it.each`
        packageName       | nthDependsOn | versionRange        | scenario
        ${'mockPackage4'} | ${0}         | ${'>=2.1.0 <2.3.0'} | ${'mockPackage4 dependsOn: mockPackage2'}
      `(
        '"dependsOn" dependency ranges are updated for regular versions: $scenario',
        ({ packageName, nthDependsOn, versionRange }) => {
          expect(
            result.packages![packageName].dependsOn[nthDependsOn].range
          ).toEqual(versionRange);
        }
      );

      it.each`
        packageName       | nthDependsOn | versionRange        | scenario
        ${'mockPackage5'} | ${2}         | ${'>=0.0.2 <0.1.0'} | ${'mockPackage5 dependsOn: mockPackage6'}
      `(
        '"dependsOn" dependency ranges are updated when "*" is used',
        ({ packageName, nthDependsOn, versionRange }) => {
          expect(
            result.packages![packageName].dependsOn[nthDependsOn].range
          ).toEqual(versionRange);
        }
      );

      it.each`
        packageName       | nthDependsOn | versionRange        | scenario
        ${'mockPackage5'} | ${0}         | ${'>=1.0.0 <1.1.0'} | ${'mockPackage5 dependsOn: mockPackage1'}
      `(
        '"dependsOn" dependency ranges are updated when "~*" is used: $scenario',
        ({ packageName, nthDependsOn, versionRange }) => {
          expect(
            result.packages![packageName].dependsOn[nthDependsOn].range
          ).toEqual(versionRange);
        }
      );

      it.each`
        packageName       | nthDependsOn | versionRange        | scenario
        ${'mockPackage5'} | ${1}         | ${'>=3.0.0 <3.1.0'} | ${'mockPackage5 dependsOn: mockPackage3'}
      `(
        '"dependsOn" dependency ranges are updated when "^*" is used: $scenario',
        ({ packageName, nthDependsOn, versionRange }) => {
          expect(
            result.packages![packageName].dependsOn[nthDependsOn].range
          ).toEqual(versionRange);
        }
      );

      it('returns an Env config object reflecting new ranges', () => {
        const expectedEnv = clone(mockEnv);

        expectedEnv.packages!.mockPackage4.relatedMessages.push({
          date: new Date().toISOString(),
          text: `fix: adapt dependency "mockPackage2" from >=2.1.0 <2.2.0 to >=2.1.0 <2.3.0`,
          level: 'patch',
        });

        // mockPackage4 dependsOn mockPackage2
        expectedEnv.packages!.mockPackage4.dependsOn[0].range =
          expectedEnv.packages!.mockPackage2.dependingOnThis[0].ownPackageRange =
            '>=2.1.0 <2.3.0';

        // mockPackage5 dependsOn mockPackage1
        expectedEnv.packages!.mockPackage5.dependsOn[0].range =
          expectedEnv.packages!.mockPackage1.dependingOnThis[0].ownPackageRange =
            '>=1.0.0 <1.1.0';

        // mockPackage5 dependsOn mockPackage3
        expectedEnv.packages!.mockPackage5.dependsOn[1].range =
          expectedEnv.packages!.mockPackage3.dependingOnThis[0].ownPackageRange =
            '>=3.0.0 <3.1.0';

        // mockPackage5 dependsOn mockPackage6
        expectedEnv.packages!.mockPackage5.dependsOn[2].range =
          expectedEnv.packages!.mockPackage6.dependingOnThis[0].ownPackageRange =
            '>=0.0.2 <0.1.0';

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
